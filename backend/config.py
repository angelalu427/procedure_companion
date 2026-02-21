import os

from dotenv import load_dotenv

load_dotenv()


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


TAVUS_API_KEY = require_env("TAVUS_API_KEY")
TAVUS_PERSONA_ID = require_env("TAVUS_PERSONA_ID")
TAVUS_REPLICA_ID = os.getenv("TAVUS_REPLICA_ID", "r3f427f43c9d")
WEBHOOK_URL = require_env("WEBHOOK_URL")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://localhost:5432/procedure_companion"
)
