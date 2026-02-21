from pathlib import Path
from routers import conversations, webhooks

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

_BASE = Path(__file__).resolve().parent


app = FastAPI(title="Procedure Companion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")

app.mount("/static", StaticFiles(directory=_BASE / "data"), name="static")
