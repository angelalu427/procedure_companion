import json

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from db.connection import db_conn
from models.schemas import (
    ConversationCreateRequest,
    ConversationCreateResponse,
    ConversationSummaryResponse,
    EscalationItem,
    EscalationLogRequest,
    EscalationLogResponse,
)
from services.sse import register_listener, unregister_listener
from services.tavus import create_conversation, end_conversation
from services.webhook_processor import buffer_perception

router = APIRouter()


@router.post("/conversations", response_model=ConversationCreateResponse)
async def create_conversation_endpoint(req: ConversationCreateRequest):
    result = await create_conversation(req.patient_name)
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO conversations (conversation_id, patient_name) VALUES (%s, %s)",
                (result["conversation_id"], req.patient_name),
            )
    return result


@router.post("/conversations/{conversation_id}/end")
async def end_conversation_endpoint(conversation_id: str):
    success = await end_conversation(conversation_id)
    if not success:
        raise HTTPException(
            status_code=502, detail="Failed to end conversation"
        )
    return {"ok": True}


@router.post(
    "/conversations/{conversation_id}/escalations",
    response_model=EscalationLogResponse,
)
async def log_escalation(conversation_id: str, req: EscalationLogRequest):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO escalation_events
                   (conversation_id, event_type, severity, question_text, reason)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id""",
                (
                    conversation_id,
                    req.event_type,
                    req.severity,
                    req.question_text,
                    req.reason,
                ),
            )
            escalation_id = cur.fetchone()[0]
    return {"escalation_id": str(escalation_id)}


@router.post("/conversations/{conversation_id}/perception")
async def log_perception(conversation_id: str, request: Request):
    """Accept accumulated perception observations from the frontend."""
    body = await request.json()
    observations = body.get("observations", [])
    buffer_perception(conversation_id, observations)
    return {"ok": True}


@router.get(
    "/conversations/{conversation_id}/summary",
    response_model=ConversationSummaryResponse,
)
async def get_summary(conversation_id: str):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT c.patient_name, c.ended_at,
                          s.topics_covered, s.questions_asked, s.perception_notes
                   FROM conversations c
                   JOIN conversation_summaries s USING (conversation_id)
                   WHERE c.conversation_id = %s""",
                (conversation_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(
                    status_code=404, detail="Summary not ready"
                )

            cur.execute(
                """SELECT event_type, severity, question_text, reason, occurred_at
                   FROM escalation_events WHERE conversation_id = %s
                   ORDER BY occurred_at""",
                (conversation_id,),
            )
            escalations = [
                EscalationItem(
                    event_type=r[0],
                    severity=r[1],
                    question_text=r[2],
                    reason=r[3],
                    occurred_at=r[4].isoformat() if r[4] else None,
                )
                for r in cur.fetchall()
            ]

    return ConversationSummaryResponse(
        conversation_id=conversation_id,
        patient_name=row[0],
        topics_covered=row[2] or [],
        questions_asked=row[3] or [],
        escalation_count=len(escalations),
        escalations=escalations,
        ended_at=row[1].isoformat() if row[1] else None,
        perception_notes=row[4],
    )


@router.get("/conversations/{conversation_id}/stream")
async def stream_summary(conversation_id: str):
    queue = register_listener(conversation_id)

    async def event_generator():
        try:
            event = await queue.get()
            yield f"data: {json.dumps(event)}\n\n"
        finally:
            unregister_listener(conversation_id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
