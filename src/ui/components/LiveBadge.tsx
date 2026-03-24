interface LiveBadgeProps {
  elapsed?: string;
  compact?: boolean;
}

export default function LiveBadge({ elapsed, compact }: LiveBadgeProps) {
  if (compact) {
    return (
      <span className="inline-flex items-center" aria-label="Live">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-semibold uppercase text-red-600">Live</span>
      {elapsed && (
        <span className="text-xs text-gray-500">{elapsed}</span>
      )}
    </span>
  );
}
