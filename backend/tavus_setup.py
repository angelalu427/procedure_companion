"""
One-time Tavus setup — run both functions before starting the server.
Copy the returned TAVUS_PERSONA_ID into .env.
"""

import sys
import asyncio
from pathlib import Path
from config import (
    TAVUS_API_KEY,
    TAVUS_REPLICA_ID,
    WEBHOOK_URL,
)

import httpx

TAVUS_BASE = "https://tavusapi.com"
HEADERS = {"x-api-key": TAVUS_API_KEY, "Content-Type": "application/json"}

DATA_DIR = Path(__file__).parent / "data"
DOCUMENT_TAG = "egg-retrieval-companion"
DOCUMENTS = [
    "egg_freezing_overview.txt",
    "ohss_guidelines.txt",
    "post_retrieval_instructions.txt",
    "pre_procedure_guidelines.txt",
]

SYSTEM_PROMPT = """\
You are Maya, a Patient Educator at UCSF Center for Reproductive Health.
Answer questions about egg retrieval procedure and post-op care using your knowledge base. Be warm, calm, and plain-spoken.

## Emotion Adaptation (from Raven-1 user_audio_analysis / user_visual_analysis)
- ANXIETY/FEAR: Lead with empathy. Short sentences. Ground with facts.
- CONFUSION: Simplify. Use analogies. Check: "Does that make sense?"
- HIGH DISTRESS: Pause info. Acknowledge feelings first. Then call flag_passive_emotion.
- CALM: Be thorough and proactive.

## Tools
flag_passive_emotion(severity: "medium"|"high", reason: str)
  → Call AFTER verbally acknowledging emotion. Logs for care team.

redirect_to_doctor(question: str, reason: str)
  → When: diagnosis, medication changes, test results, prognosis.
  → Pattern: validate → explain limit warmly → give "415-353-7475" → call tool.

## Guardrails
- No diagnosis. No medication adjustments. No outcome promises.
- Emergency (chest pain, can't breathe): 911 + UCSF ER 415-353-1238.

## Opening
"Hi, I'm Maya. I'm here to help you get ready for your egg retrieval at UCSF.
What questions do you have, or would you like me to walk you through what to expect?"\
"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "flag_passive_emotion",
            "description": (
                "Log a high-distress event after verbally acknowledging the patient. "
                "Not for mild anxiety."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "severity": {"type": "string", "enum": ["medium", "high"]},
                    "reason": {"type": "string"},
                },
                "required": ["severity", "reason"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "redirect_to_doctor",
            "description": (
                "Log a redirect when the question requires medical judgment. "
                "Always redirect verbally first."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "reason": {"type": "string"},
                },
                "required": ["question", "reason"],
            },
        },
    },
]


async def upload_documents() -> list[str]:
    """Upload knowledge-base docs to Tavus. Returns list of document IDs."""
    async with httpx.AsyncClient(timeout=60) as client:
        doc_ids: list[str] = []
        for filename in DOCUMENTS:
            doc_name = filename.removesuffix(".txt")
            payload = {
                "document_name": doc_name,
                "document_url": f"{WEBHOOK_URL}/static/{filename}",
                "tags": [DOCUMENT_TAG],
            }
            resp = await client.post(
                f"{TAVUS_BASE}/v2/documents", json=payload, headers=HEADERS
            )
            if not resp.is_success:
                print(
                    f"ERROR uploading {doc_name}: {resp.status_code} {resp.text}",
                    file=sys.stderr,
                )
                sys.exit(1)
            doc_id = resp.json()["document_id"]
            doc_ids.append(doc_id)
            print(f"Uploaded {doc_name} → {doc_id}")
    print(
        f"\nAll {len(doc_ids)} documents uploaded. Wait a few minutes for processing, then run create_persona()."
    )
    return doc_ids


async def create_persona() -> str:
    """Create the Maya persona on Tavus. Returns persona ID."""
    async with httpx.AsyncClient(timeout=60) as client:
        payload = {
            "persona_name": "Maya - UCSF Egg Retrieval Companion",
            "system_prompt": SYSTEM_PROMPT,
            "default_replica_id": TAVUS_REPLICA_ID,
            "layers": {
                "llm": {
                    "tools": TOOLS,
                    "extra_body": {"temperature": 0.2, "top_p": 0.9},
                },
                "perception": {"perception_model": "raven-1"},
            },
        }

        resp = await client.post(
            f"{TAVUS_BASE}/v2/personas", json=payload, headers=HEADERS
        )
        if not resp.is_success:
            print(
                f"Persona creation failed: {resp.status_code} {resp.text}",
                file=sys.stderr,
            )
            sys.exit(1)
        persona_id = resp.json()["persona_id"]
        print(f"Persona created: {persona_id}")
        print(f"\nAdd to .env:\n    TAVUS_PERSONA_ID={persona_id}")
        return persona_id


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  first run `python tavus_setup.py upload`")
        print("  then run `python tavus_setup.py persona`")
        sys.exit(1)

    command = sys.argv[1]

    if command == "upload":
        asyncio.run(upload_documents())
    elif command == "persona":
        asyncio.run(create_persona())
    else:
        print("Unknown command")
