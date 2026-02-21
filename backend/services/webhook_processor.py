"""Process inbound Tavus webhook events."""

import json

from db.connection import db_conn
from routers.conversations import notify_summary_ready
from services.summarizer import generate_summary

# In-memory buffer for perception events, keyed by conversation_id.
# Drained when transcription_ready fires and the summary row is created.
_perception_buffer: dict[str, list[dict]] = {}


async def process_webhook(event_type: str, conversation_id: str, payload: dict) -> None:
    if event_type == "system.shutdown":
        handle_shutdown(conversation_id, payload.get("shutdown_reason", "unknown"))
    elif event_type == "application.perception_analysis":
        handle_perception_analysis(conversation_id, payload)
    elif event_type == "application.transcription_ready":
        handle_transcript_ready(conversation_id, payload.get("transcript", []))


def handle_shutdown(conversation_id: str, shutdown_reason: str) -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE conversations SET ended_at = NOW(), shutdown_reason = %s WHERE conversation_id = %s",
                (shutdown_reason, conversation_id),
            )


def handle_perception_analysis(conversation_id: str, payload: dict) -> None:
    _perception_buffer.setdefault(conversation_id, []).append(payload)


def compile_perception_notes(events: list[dict]) -> str | None:
    """Rule-based compilation of Raven-1 emotional observations."""
    if not events:
        return None

    emotion_counts: dict[str, int] = {}
    distress_detected = False

    for event in events:
        label = event.get("emotion", event.get("label", "neutral")).lower()
        emotion_counts[label] = emotion_counts.get(label, 0) + 1
        if label in ("distress", "panic", "distressed"):
            distress_detected = True

    if not emotion_counts:
        return None

    dominant = max(emotion_counts, key=emotion_counts.get)
    total = sum(emotion_counts.values())

    parts = [f"Maya observed that you were mostly {dominant} throughout the session."]

    secondary = {k: v for k, v in emotion_counts.items() if k != dominant and v / total > 0.15}
    if secondary:
        labels = " and ".join(secondary.keys())
        parts.append(f"There were some moments of {labels}.")

    if distress_detected:
        parts.append("Some signs of distress were noted — your care team has been informed.")
    else:
        parts.append("No signs of high distress were detected.")

    return " ".join(parts)


def handle_transcript_ready(conversation_id: str, transcript: list[dict]) -> None:
    summary = generate_summary(transcript)
    perception_notes = compile_perception_notes(
        _perception_buffer.pop(conversation_id, [])
    )

    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO conversation_summaries
                   (conversation_id, raw_transcript, topics_covered, questions_asked, perception_notes)
                   VALUES (%s, %s, %s, %s, %s)""",
                (
                    conversation_id,
                    json.dumps(transcript),
                    summary["topics_covered"],
                    json.dumps(summary["questions_asked"]),
                    perception_notes,
                ),
            )

    notify_summary_ready(conversation_id)
