interface Props {
  isConnected: boolean;
  hasEnded: boolean;
}

export default function StatusBadge({ isConnected, hasEnded }: Props) {
  if (hasEnded) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ucsf-border text-ucsf-text tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-ucsf-muted" />
        Session Ended
      </span>
    );
  }
  if (isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ucsf-sage text-emerald-800 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ucsf-warm text-amber-800 tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
      Connecting...
    </span>
  );
}
