# Procedure Companion

An AI-powered pre-procedure education app for patients preparing for egg retrieval. Patients have a video conversation with **Maya**, a virtual patient educator built on [Tavus CVI](https://docs.tavus.io/), who answers questions using a curated knowledge base, detects patient emotion in real-time, adapts accordingly, flags high-level passive emotions (like anxiety, distress, and confusion) and escalates high-stake medical questions to the care team.

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- A [Tavus](https://www.tavus.io/) API key
- A public URL for webhooks (e.g. [ngrok](https://ngrok.com/))

## Setup

### 1. Database

Create a database named `procedure_companion` and setup the database schema:

```bash
createdb procedure_companion
psql procedure_companion < backend/db/schema.sql
```

### 2. Environment variables

```bash
cp backend/.env.example backend/.env
```

Fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `TAVUS_API_KEY` | Yes | Your Tavus API key |
| `TAVUS_PERSONA_ID` | Yes | Persona ID (created in step 3) |
| `WEBHOOK_URL` | Yes | Public URL where Tavus sends webhooks |
| `TAVUS_REPLICA_ID` | No | Defaults to `r3f427f43c9d` |
| `DATABASE_URL` | No | Defaults to `postgresql://localhost:5432/procedure_companion` |

### 3. Tavus setup (one-time)

Upload knowledge base documents and create the Maya persona. The backend server must be running (step 4) so Tavus can fetch documents from `/static`.

```bash
cd backend
uv run python tavus_setup.py upload    # wait a few minutes for processing
uv run python tavus_setup.py persona   # copy the returned ID into .env as TAVUS_PERSONA_ID
```

### 4. Install and run

**Backend:**

```bash
cd backend
uv sync
uv run uvicorn app:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
backend/
  app.py                  # FastAPI entrypoint
  config.py               # Environment variable loading
  tavus_setup.py          # One-time Tavus persona/knowledge base setup
  db/
    schema.sql            # PostgreSQL schema
    connection.py         # Connection pool
  routers/
    conversations.py      # Conversation CRUD + summary endpoints
    webhooks.py           # Tavus webhook receiver
  services/
    tavus.py              # Tavus API client
    webhook_processor.py  # Webhook event handlers
    summarizer.py         # Transcript summarization
    sse.py                # Server-Sent Events for summary updates
  data/                   # Knowledge base documents

frontend/
  src/
    pages/
      LandingPage.tsx     # Patient name entry
      SessionPage.tsx     # Video call with emotion + escalation UI
      SummaryPage.tsx     # Post-call summary display
    hooks/
      useDailySession.ts  # Daily.co call lifecycle + CVI events
      useConversationStream.ts  # SSE listener for summary readiness
    services/api.ts       # Backend API client
```
