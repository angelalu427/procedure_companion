"""Rule-based transcript summarizer — no external LLM calls."""

TOPIC_KEYWORDS: dict[str, list[str]] = {
    "Anesthesia & sedation": ["anesthesia", "sedation", "asleep", "awake"],
    "Ovarian stimulation": ["stimulation", "injection", "gonal", "medication"],
    "Egg retrieval procedure": ["retrieval", "procedure", "surgery", "needle"],
    "OHSS symptoms & risks": [
        "ohss",
        "hyperstimulation",
        "bloating",
        "swelling",
    ],
    "Post-procedure recovery": ["recovery", "rest", "activity", "exercise"],
    "Day-of preparation": [
        "npo",
        "eat",
        "food",
        "drink",
        "midnight",
        "fasting",
    ],
    "Transportation": ["driver", "transport", "ride", "car"],
    "Pain management": ["pain", "ibuprofen", "acetaminophen", "cramping"],
    "Expected side effects": ["spotting", "bleeding", "nausea", "mood"],
    "Success rates & outcomes": [
        "success",
        "chance",
        "rate",
        "eggs",
        "freeze",
    ],
}

QUESTION_STARTERS = {
    "what",
    "how",
    "when",
    "where",
    "can",
    "will",
    "is",
    "are",
    "do",
    "does",
    "should",
    "why",
}


def generate_summary(transcript: list[dict]) -> dict:
    """Extract topics covered and questions asked from a transcript.

    Each transcript entry is expected to have at least:
      - "role": "user" | "replica"
      - "content": str
      - "timestamp": str (optional)
    """
    full_text = " ".join(
        entry.get("content", "") for entry in transcript
    ).lower()

    topics_covered = [
        topic
        for topic, keywords in TOPIC_KEYWORDS.items()
        if any(kw in full_text for kw in keywords)
    ]

    questions_asked = []
    for entry in transcript:
        if entry.get("role") != "user":
            continue
        content = entry.get("content", "").strip()
        if not content:
            continue
        first_word = content.split()[0].lower().rstrip(",.?")
        if "?" in content or first_word in QUESTION_STARTERS:
            questions_asked.append(
                {
                    "text": content,
                    "timestamp": entry.get("timestamp"),
                }
            )

    return {
        "topics_covered": topics_covered,
        "questions_asked": questions_asked,
    }
