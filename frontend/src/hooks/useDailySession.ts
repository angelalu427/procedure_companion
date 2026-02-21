import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import type { EmotionState, EscalationEvent } from "../types";
import { logEscalation } from "../services/api";

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
  const endedRef = useRef(false);

  useEffect(() => {
    if (!conversationUrl) return;

    // Prevent duplicate instances (React StrictMode double-invokes effects)
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

      // Debug: log all app-message events to inspect Tavus CVI format
      console.log("[app-message]", JSON.stringify(msg, null, 2));

      // Tool call events from Tavus CVI
      // Format: event_type "conversation.tool_call", properties.name, properties.arguments (JSON string)
      if (msg.event_type === "conversation.tool_call" && msg.properties) {
        const toolName = msg.properties.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let args: Record<string, any> = {};
        try {
          args = JSON.parse(msg.properties.arguments || "{}");
        } catch {
          console.error("Failed to parse tool arguments:", msg.properties.arguments);
        }

        if (toolName === "flag_passive_emotion") {
          const escalation: EscalationEvent = {
            event_type: "passive_emotion",
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
            event_type: "doctor_redirect",
            question_text: args.question,
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

      // Emotion from Raven-1 utterance events
      // Format: event_type "conversation.utterance", properties.user_audio_analysis (plain string)
      if (
        msg.event_type === "conversation.utterance" &&
        msg.properties?.role === "user" &&
        msg.properties?.user_audio_analysis
      ) {
        setEmotion(mapToEmotion(msg.properties.user_audio_analysis));
      }
    });

    call.join({ url: conversationUrl });

    // No cleanup — Daily call object lives for the lifetime of the page.
    // leaveCall() handles teardown when the user ends the session.
  }, [conversationUrl, conversationId, onSessionEnded]);

  const leaveCall = useCallback(async () => {
    if (callRef.current) {
      endedRef.current = true;
      await callRef.current.leave();
      callRef.current.destroy();
      callRef.current = null;
    }
  }, []);

  return { callRef, isConnected, emotion, latestEscalation, leaveCall };
}
