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


class QuestionItem(BaseModel):
    text: str
    timestamp: Optional[str] = None


class EscalationItem(BaseModel):
    event_type: Literal["passive_emotion", "doctor_redirect"]
    severity: Optional[str] = None
    question_text: Optional[str] = None
    reason: str
    occurred_at: Optional[str] = None


class ConversationSummaryResponse(BaseModel):
    conversation_id: str
    patient_name: str
    topics_covered: list[str]
    questions_asked: list[QuestionItem]
    escalation_count: int
    escalations: list[EscalationItem]
    ended_at: Optional[str]
    perception_notes: Optional[str]
