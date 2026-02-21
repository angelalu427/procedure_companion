export type EmotionState =
  | "neutral"
  | "anxious"
  | "confused"
  | "distressed"
  | "calm";

export interface EscalationEvent {
  eventType: "passive_emotion" | "doctor_redirect";
  severity?: "medium" | "high";
  questionText?: string;
  reason: string;
}

export interface SessionData {
  conversationId: string;
  conversationUrl: string;
  patientName: string;
}

export interface SummaryData {
  conversationId: string;
  patientName: string;
  topicsCovered: string[];
  questionsAsked: { text: string; timestamp?: string }[];
  escalationCount: number;
  escalations: EscalationEvent[];
  endedAt?: string;
  perceptionNotes?: string;
}
