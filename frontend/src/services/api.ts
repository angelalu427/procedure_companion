import axios from "axios";
import type { EscalationEvent, SummaryData } from "../types";

const api = axios.create({ baseURL: "/api" });

export async function createConversation(patientName: string) {
  const { data } = await api.post<{
    conversation_id: string;
    conversation_url: string;
  }>("/conversations", { patient_name: patientName });
  return data;
}

export async function endConversation(conversationId: string) {
  await api.post(`/conversations/${conversationId}/end`);
}

export async function logEscalation(
  conversationId: string,
  event: EscalationEvent,
) {
  await api.post(`/conversations/${conversationId}/escalations`, event);
}

export async function getConversationSummary(
  conversationId: string,
): Promise<SummaryData | null> {
  try {
    const { data } = await api.get<SummaryData>(
      `/conversations/${conversationId}/summary`,
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}
