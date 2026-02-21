import type { EmotionState } from "../types";

type BadgeConfig = {
  bg: string;
  text: string;
  border: string;
  label: string;
};

const BADGE_CONFIG: Partial<Record<EmotionState, BadgeConfig>> = {
  anxious: {
    bg: "bg-ucsf-warm",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Feeling anxious? That's completely normal.",
  },
  confused: {
    bg: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-200",
    label: "Taking it one step at a time.",
  },
  distressed: {
    bg: "bg-ucsf-rose",
    text: "text-rose-800",
    border: "border-rose-200",
    label: "We're right here with you.",
  },
};

interface Props {
  emotion: EmotionState;
}

export default function EmotionBadge({ emotion }: Props) {
  const config = BADGE_CONFIG[emotion];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-500 ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
