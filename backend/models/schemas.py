from typing import Literal, Optional

from pydantic import BaseModel


class ConversationCreateRequest(BaseModel):
    patient_name: str


class ConversationCreateResponse(BaseModel):
    conversation_id: str
    conversation_url: str


class EscalationLogRequest(BaseModel):
    event_type: Literal["passive_emotion", "doctor_redirect"]
    severity: Literal["medium", "high"] | None = None
    question_text: Optional[str] = None
    reason: str


class EscalationLogResponse(BaseModel):
    escalation_id: str


class ConversationSummaryResponse(BaseModel):
    conversation_id: str
    patient_name: str
    topics_covered: list[str]
    questions_asked: list[dict]
    escalation_count: int
    escalations: list[dict]
    ended_at: Optional[str]
    perception_notes: Optional[str]
