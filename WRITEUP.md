# Project Writeup

## Why this project

I chose to build a Pre-Procedure Companion to help patients get mentally and cognitively prepared for medical procedures (using egg retrieval as an example) because it showcases what makes Tavus uniquely powerful, i.e., its capability to read and understand the user's emotion in real-time and to adapt its responses accordingly. 

Preparing for a medical procedure can be daunting and overwhelming. Patients often leave their consultations with a stack of pamphlets, many unanswered questions, and anxiety. The period between "you're scheduled" and "arrive at 6am, nothing to eat after midnight" is filled with uncertainty, and medical staff are not always immediately reachable. Traditional chatbots can answer questions, but they cannot perceive and respond to negative emotions in real time. 

This is where Tavus CVI, an emotionally aware and perceptive AI human, can be truly helpful. The Companion is grounded in authentic, vetted clinical documents via a knowledge base, ensuring accurate and guarded responses. At the same time, it uses real-time perception signals to detect anxiety, distress, or confusion and adapt accordingly by slowing down, simplifying explanations, or offering reassurance when needed.

## Architecture

The app has three layers: a React frontend, a FastAPI backend, and the Tavus CVI platform.

**User flow:**

1. The patient enters their name on the landing page.
2. The backend creates a Tavus conversation (passing the patient's name, clinic information, and a knowledge base tag as context) and stores a record in PostgreSQL.
3. The frontend joins the Daily.co room returned by Tavus and renders the video call.
4. During the call, the frontend listens for CVI app-message events:
   - **Emotion detection** — Raven-1's `user_audio_analysis` is mapped to an emotion state (anxious, confused, distressed, calm, and neutral) and shown as a live visual indicator (i.e., the changing color effect around the video). These observations are buffered client-side. The detection of passive emotions (anxious, confused, and distressed) would also display a reassuring message at the top of the video.
   - **Tool calls** — Maya has two tools: `flag_passive_emotion` for logging distress events, and `redirect_to_doctor` for questions that require medical judgment (diagnosis, medication changes, etc.). When either fires, the frontend logs an escalation to the backend and shows a toast notification at the bottom of the video.
5. When the patient ends the call, the frontend flushes buffered emotion observations to the backend and tells Tavus to end the conversation.
6. Tavus sends webhooks: `system.shutdown` marks the conversation as ended, and `transcription_ready` triggers summary generation.
7. The backend summarizes the transcript using rule-based keyword matching (no external LLM call) — extracting topics covered and questions the patient asked — then merges in the perception notes compiled from Raven-1 observations.
8. An SSE notification tells the frontend the summary is ready, and the patient sees a recap page with topics covered, their questions, emotional observations, and any items flagged for their doctor.

**Key design decisions:**

- **Rule-based summarization** rather than an LLM call — the topic space is narrow and well-defined (10 medical topics), so keyword matching is fast, deterministic, and doesn't add API latency or cost. Questions are detected by interrogative starters and punctuation.
- **Perception buffering with race resolution** — emotion observations arrive from two sources (Tavus webhooks and frontend flushes) and need to land in the summary regardless of which arrives first. The backend uses an in-memory buffer that drains on `transcription_ready`, with a fallback path in `buffer_perception` that updates the summary row directly if the transcript webhook already arrived.
- **Idempotent webhook processing** — the summary INSERT uses `ON CONFLICT DO NOTHING` so duplicate webhook deliveries don't break the flow.
- **SSE + polling fallback** — the frontend opens an SSE stream for instant summary notification, but also polls every 5 seconds as a safety net in case the SSE connection drops.
