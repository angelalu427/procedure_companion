export type EmotionState =
  | "neutral"
  | "anxious"
  | "confused"
  | "distressed"
  | "calm";

export interface EscalationEvent {
  event_type: "passive_emotion" | "doctor_redirect";
  severity?: "medium" | "high";
  question_text?: string;
  reason: string;
}

export interface EscalationRecord extends EscalationEvent {
  occurred_at?: string;
}

export interface SessionData {
  conversationId: string;
  conversationUrl: string;
  patientName: string;
}

export interface SummaryData {
  conversation_id: string;
  patient_name: string;
  topics_covered: string[];
  questions_asked: { text: string; timestamp?: string }[];
  escalation_count: number;
  escalations: EscalationEvent[];
  ended_at?: string;
  perception_notes?: string;
}
