interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated?: string;
}

export default function RefreshButton({
  onRefresh,
  isLoading,
  lastUpdated,
}: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 min-h-12"
      >
        <span className={isLoading ? 'inline-block animate-spin' : ''}>↻</span>
        Refresh
      </button>
      {lastUpdated && (
        <span className="text-xs text-gray-400">Last updated: {lastUpdated}</span>
      )}
    </div>
  );
}
