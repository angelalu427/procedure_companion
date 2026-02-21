import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import type { SessionData } from "../types";
import { endConversation } from "../services/api";
import { useDailySession } from "../hooks/useDailySession";
import VideoTile from "../components/VideoTile";
import EmotionIndicator from "../components/EmotionIndicator";
import EmotionBadge from "../components/EmotionBadge";
import StatusBadge from "../components/StatusBadge";
import EscalationToast from "../components/EscalationToast";

export default function SessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SessionData | null;
  const [hasEnded, setHasEnded] = useState(false);
  const [ending, setEnding] = useState(false);

  const onSessionEnded = useCallback(() => {
    if (!state) return;
    navigate(`/summary/${state.conversationId}`, {
      state: { patientName: state.patientName },
    });
  }, [state, navigate]);

  const { callRef, isConnected, emotion, latestEscalation, leaveCall, flushPerception } =
    useDailySession(
      state?.conversationUrl || "",
      state?.conversationId || "",
      onSessionEnded,
    );

  async function handleEndCall() {
    if (!state || ending) return;
    setEnding(true);
    setHasEnded(true);
    try {
      await flushPerception();
      await endConversation(state.conversationId);
    } catch {
      // Continue even if the API call fails
    }
    await leaveCall();
  }

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isConnected) {
        e.preventDefault();
        leaveCall();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isConnected, leaveCall]);

  if (!state) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-ucsf-bg flex flex-col">
      {/* Top bar */}
      <div className="h-1.5 bg-gradient-to-r from-ucsf-primary via-ucsf-teal to-ucsf-primary/60" />
      <header className="flex items-center justify-between px-6 py-4 bg-ucsf-card border-b border-ucsf-border">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-lg font-semibold text-ucsf-heading">
            Your Session
          </h1>
          <StatusBadge isConnected={isConnected} hasEnded={hasEnded} />
        </div>
        <EmotionBadge emotion={emotion} />
      </header>

      {/* Video area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        <EmotionIndicator emotion={emotion}>
          <div className="w-full max-w-3xl aspect-video bg-ucsf-heading rounded-2xl overflow-hidden">
            <VideoTile callRef={callRef} />
          </div>
        </EmotionIndicator>

        <button
          onClick={handleEndCall}
          disabled={ending}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium tracking-wide bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {ending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ending...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 6.75 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091v1.372a2.25 2.25 0 0 1-2.25 2.25h-.75Z"
                />
              </svg>
              End Session
            </>
          )}
        </button>
      </div>

      <EscalationToast escalation={latestEscalation} />
    </div>
  );
}
