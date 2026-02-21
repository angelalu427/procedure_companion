CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE conversations (
    conversation_id TEXT PRIMARY KEY,
    patient_name    TEXT NOT NULL DEFAULT 'Anonymous',
    shutdown_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

CREATE TABLE escalation_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL CHECK (event_type IN ('passive_emotion', 'doctor_redirect')),
    severity        TEXT CHECK (severity IN ('medium', 'high')),
    question_text   TEXT,
    reason          TEXT NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_escalations_conversation_id ON escalation_events(conversation_id);

CREATE TABLE conversation_summaries (
    conversation_id  TEXT PRIMARY KEY REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    raw_transcript   JSONB,
    topics_covered   TEXT[]   NOT NULL DEFAULT '{}',
    questions_asked  JSONB    NOT NULL DEFAULT '[]',
    perception_notes TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
