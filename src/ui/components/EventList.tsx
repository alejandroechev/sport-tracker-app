import type { SportEvent } from '../../domain/models/event';
import LoadingSkeleton from './LoadingSkeleton';
import RefreshButton from './RefreshButton';

interface EventListProps {
  events: SportEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
  emptyMessage?: string;
}

const statusLabel: Record<string, string> = {
  live: '🔴 Live',
  finished: 'Finished',
  scheduled: 'Scheduled',
  postponed: 'Postponed',
  cancelled: 'Cancelled',
};

export default function EventList({
  events,
  isLoading,
  onRefresh,
  lastUpdated,
  emptyMessage = 'No events to show',
}: EventListProps) {
  return (
    <div className="flex flex-col gap-3">
      <RefreshButton
        onRefresh={onRefresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {isLoading && events.length === 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
          <span className="text-4xl">📭</span>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-1 text-xs font-medium text-gray-500">
                {event.competitionName}
              </p>
              <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span className="truncate">{event.title}</span>
                {event.score && (
                  <span className="ml-2 shrink-0 font-mono">{event.score}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {statusLabel[event.status] ?? event.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
