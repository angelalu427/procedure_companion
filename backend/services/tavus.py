import httpx

from config import TAVUS_API_KEY, TAVUS_PERSONA_ID, WEBHOOK_URL

TAVUS_BASE = "https://tavusapi.com"
HEADERS = {"x-api-key": TAVUS_API_KEY, "Content-Type": "application/json"}


async def create_conversation(patient_name: str) -> dict:
    """Create a Tavus conversation. Returns {conversation_id, conversation_url}."""
    payload = {
        "persona_id": TAVUS_PERSONA_ID,
        "conversational_context": (
            f"Pre-procedure educational session for a patient preparing for egg retrieval at UCSF.\n"
            f"Patient name: {patient_name}. Address them by name throughout the conversation.\n"
            f"Your role is educational and supportive only — not diagnostic.\n\n"
            f"Clinic contacts:\n"
            f"- M-F 8am-5pm: 4 1 5, 3 5 3, 7 4 7 5 (option 2 for Nurse)\n"
            f"- After-hours / Weekends: 4 1 5, 5 6 1, 9 0 2 0\n"
            f"- UCSF ER: 4 1 5, 3 5 3, 1 2 3 8"
        ),
        "callback_url": f"{WEBHOOK_URL}/api/webhooks/tavus",
        "document_tags": ["egg-retrieval-companion"],
        "document_retrieval_strategy": "quality",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{TAVUS_BASE}/v2/conversations", json=payload, headers=HEADERS
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "conversation_id": data["conversation_id"],
            "conversation_url": data["conversation_url"],
        }


async def end_conversation(conversation_id: str) -> bool:
    """Gracefully end a conversation. Returns True on success."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{TAVUS_BASE}/v2/conversations/{conversation_id}/end",
            headers=HEADERS,
        )
        return resp.is_success
