import type { EmotionState } from "../types";

const GLOW: Record<EmotionState, string> = {
  neutral: "shadow-[0_0_40px_rgba(100,116,139,0.15)]",
  anxious: "shadow-[0_0_40px_rgba(245,158,11,0.25)]",
  confused: "shadow-[0_0_40px_rgba(139,92,246,0.25)]",
  distressed: "shadow-[0_0_40px_rgba(220,38,38,0.2)]",
  calm: "shadow-[0_0_40px_rgba(15,118,110,0.25)]",
};

const RING: Record<EmotionState, string> = {
  neutral: "ring-ucsf-border",
  anxious: "ring-amber-300",
  confused: "ring-violet-300",
  distressed: "ring-rose-300",
  calm: "ring-ucsf-teal/50",
};

interface Props {
  emotion: EmotionState;
  children: React.ReactNode;
}

export default function EmotionIndicator({ emotion, children }: Props) {
  return (
    <div
      className={`rounded-2xl ring-2 transition-all duration-[1500ms] ${GLOW[emotion]} ${RING[emotion]}`}
    >
      {children}
    </div>
  );
}
