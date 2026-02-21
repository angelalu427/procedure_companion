import { useEffect, useState } from "react";
import { getConversationSummary } from "../services/api";
import type { SummaryData } from "../types";

export function useConversationStream(conversationId: string) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function fetchSummary(): Promise<boolean> {
      try {
        const result = await getConversationSummary(conversationId);
        if (cancelled) return false;
        if (result) {
          setSummary(result);
          setLoading(false);
          return true;
        }
        return false;
      } catch {
        if (!cancelled) setLoading(false);
        return false;
      }
    }

    // Strategy: try GET first (summary may already exist), then fall back to
    // SSE stream + polling as a safety net if the SSE connection drops.
    async function init() {
      if (await fetchSummary()) return;
      if (cancelled) return;

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

    return () => {
      cancelled = true;
      es?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [conversationId]);

  return { summary, loading };
}
