import { useEffect, useState } from "react";
import type { EscalationEvent } from "../types";

const MESSAGES: Record<string, { icon: string; text: string }> = {
  passive_emotion: {
    icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
    text: "Your care team has been notified.",
  },
  doctor_redirect: {
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    text: "Great question — your doctor can help with that.",
  },
};

interface Props {
  escalation: EscalationEvent | null;
}

export default function EscalationToast({ escalation }: Props) {
  const [dismissed, setDismissed] = useState<EscalationEvent | null>(null);

  const visible = escalation !== null && escalation !== dismissed;

  useEffect(() => {
    if (!escalation || escalation === dismissed) return;
    const timer = setTimeout(() => setDismissed(escalation), 4000);
    return () => clearTimeout(timer);
  }, [escalation, dismissed]);

  const config = escalation ? MESSAGES[escalation.eventType] : null;

  if (!visible || !config) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 bg-ucsf-heading/90 backdrop-blur-sm text-white rounded-xl shadow-xl text-sm transition-all animate-fade-up">
      <svg
        className="w-5 h-5 text-ucsf-teal shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={config.icon}
        />
      </svg>
      {config.text}
    </div>
  );
}
