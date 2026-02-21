from fastapi import APIRouter, Request

from services.webhook_processor import process_webhook

router = APIRouter()


@router.post("/webhooks/tavus")
async def tavus_webhook(request: Request):
    body = await request.json()
    event_type = body.get("event_type", "")
    conversation_id = body.get("conversation_id", "")
    payload = body.get("properties", body)

    if event_type and conversation_id:
        await process_webhook(event_type, conversation_id, payload)

    return {"received": True}
