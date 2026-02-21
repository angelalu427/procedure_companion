import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import type { EmotionState, EscalationEvent } from "../types";
import { logEscalation, logPerception } from "../services/api";

function mapToEmotion(emotionalContext: string): EmotionState {
  const s = emotionalContext.toLowerCase();
  if (s.includes("distress") || s.includes("panic")) return "distressed";
  if (s.includes("anxious") || s.includes("fear")) return "anxious";
  if (s.includes("confused") || s.includes("uncertain")) return "confused";
  if (s.includes("calm") || s.includes("relief")) return "calm";
  return "neutral";
}

export function useDailySession(
  conversationUrl: string,
  conversationId: string,
  onSessionEnded: () => void,
) {
  const callRef = useRef<DailyCall | null>(null);
  const initedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [emotion, setEmotion] = useState<EmotionState>("neutral");
  const [latestEscalation, setLatestEscalation] =
    useState<EscalationEvent | null>(null);
  // Guards against double-navigation: left-meeting fires both on explicit
  // leaveCall() and on server-side disconnect; endedRef ensures onSessionEnded runs once.
  const endedRef = useRef(false);
  const emotionLogRef = useRef<{ emotion: string }[]>([]);

  useEffect(() => {
    if (!conversationUrl) return;

    // StrictMode guard: prevent duplicate Daily call objects
    if (initedRef.current) return;
    initedRef.current = true;

    const call = DailyIframe.createCallObject();
    callRef.current = call;

    call.on("joined-meeting", () => setIsConnected(true));
    call.on("left-meeting", () => {
      setIsConnected(false);
      if (!endedRef.current) {
        endedRef.current = true;
        onSessionEnded();
      }
    });

    call.on("app-message", (event) => {
      if (!event?.data) return;
      const msg = event.data;

      if (msg.event_type === "conversation.tool_call" && msg.properties) {
        const toolName = msg.properties.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let args: Record<string, any> = {};
        try {
          args = JSON.parse(msg.properties.arguments || "{}");
        } catch {
          console.error(
            "Failed to parse tool arguments:",
            msg.properties.arguments,
          );
        }

        if (toolName === "flag_passive_emotion") {
          const escalation: EscalationEvent = {
            eventType: "passive_emotion",
            severity: args.severity,
            reason: args.reason,
          };
          setLatestEscalation(escalation);
          logEscalation(conversationId, escalation);
          call.sendAppMessage({
            event_type: "tool_result",
            tool_name: toolName,
            result: "Emotion logged for care team.",
          });
        } else if (toolName === "redirect_to_doctor") {
          const escalation: EscalationEvent = {
            eventType: "doctor_redirect",
            questionText: args.question,
            reason: args.reason,
          };
          setLatestEscalation(escalation);
          logEscalation(conversationId, escalation);
          call.sendAppMessage({
            event_type: "tool_result",
            tool_name: toolName,
            result: "Redirect logged. Patient informed.",
          });
        }
      }

      if (
        msg.event_type === "conversation.utterance" &&
        msg.properties?.role === "user" &&
        msg.properties?.user_audio_analysis
      ) {
        const mapped = mapToEmotion(msg.properties.user_audio_analysis);
        setEmotion(mapped);
        emotionLogRef.current.push({ emotion: mapped });
      }
    });

    call.join({ url: conversationUrl });
  }, [conversationUrl, conversationId, onSessionEnded]);

  const flushPerception = useCallback(async () => {
    if (emotionLogRef.current.length > 0) {
      const batch = emotionLogRef.current;
      emotionLogRef.current = [];
      await logPerception(conversationId, batch).catch(() => {});
    }
  }, [conversationId]);

  const leaveCall = useCallback(async () => {
    if (callRef.current) {
      await callRef.current.leave();
      callRef.current.destroy();
      callRef.current = null;
    }
  }, []);

  return {
    callRef,
    isConnected,
    emotion,
    latestEscalation,
    leaveCall,
    flushPerception,
  };
}
