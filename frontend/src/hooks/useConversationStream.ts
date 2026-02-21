import { useEffect, useState, useRef } from "react";
import { getConversationSummary } from "../services/api";
import type { SummaryData } from "../types";

export function useConversationStream(conversationId: string) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const initedRef = useRef(false);

  useEffect(() => {
    if (!conversationId || initedRef.current) return;
    initedRef.current = true;

    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function fetchSummary(): Promise<boolean> {
      const result = await getConversationSummary(conversationId);
      if (result) {
        setSummary(result);
        setLoading(false);
        return true;
      }
      return false;
    }

    async function init() {
      if (await fetchSummary()) return;

      es = new EventSource(`/api/conversations/${conversationId}/stream`);
      es.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.status === "summarized") {
          es?.close();
          if (pollTimer) clearInterval(pollTimer);
          await fetchSummary();
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
      };

      pollTimer = setInterval(async () => {
        if (await fetchSummary()) {
          if (pollTimer) clearInterval(pollTimer);
          es?.close();
        }
      }, 5000);
    }

    init();

    // No cleanup — initedRef prevents re-init, and poll/SSE self-terminate on success
  }, [conversationId]);

  return { summary, loading };
}
