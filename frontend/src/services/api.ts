import axios from "axios";
import type { EscalationEvent, SummaryData } from "../types";

const api = axios.create({ baseURL: "/api" });

export async function createConversation(
  patientName: string,
): Promise<{ conversationId: string; conversationUrl: string }> {
  const { data } = await api.post("/conversations", {
    patient_name: patientName,
  });
  return {
    conversationId: data.conversation_id,
    conversationUrl: data.conversation_url,
  };
}

export async function endConversation(conversationId: string) {
  await api.post(`/conversations/${conversationId}/end`);
}

export async function logEscalation(
  conversationId: string,
  event: EscalationEvent,
) {
  await api.post(`/conversations/${conversationId}/escalations`, {
    event_type: event.eventType,
    severity: event.severity,
    question_text: event.questionText,
    reason: event.reason,
  });
}

export async function logPerception(
  conversationId: string,
  observations: { emotion: string }[],
) {
  await api.post(`/conversations/${conversationId}/perception`, {
    observations,
  });
}

export async function getConversationSummary(
  conversationId: string,
): Promise<SummaryData | null> {
  try {
    const { data } = await api.get(
      `/conversations/${conversationId}/summary`,
    );
    return {
      conversationId: data.conversation_id,
      patientName: data.patient_name,
      topicsCovered: data.topics_covered,
      questionsAsked: data.questions_asked,
      escalationCount: data.escalation_count,
      escalations: data.escalations.map(
        (e: { event_type: string; severity?: string; question_text?: string; reason: string }) => ({
          eventType: e.event_type,
          severity: e.severity,
          questionText: e.question_text,
          reason: e.reason,
        }),
      ),
      endedAt: data.ended_at,
      perceptionNotes: data.perception_notes,
    };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}
