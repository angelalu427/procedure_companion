from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import conversations, webhooks

app = FastAPI(title="Procedure Companion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")

app.mount("/static", StaticFiles(directory="data"), name="static")
