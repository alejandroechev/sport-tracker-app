import { useEffect, useMemo } from 'react';
import { useSportData } from '../hooks/useSportData';
import { MatchCard } from '../components/MatchCard';
import RefreshButton from '../components/RefreshButton';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import LiveBadge from '../components/LiveBadge';
import type { SportEvent } from '../../domain/models';

function groupByCompetition(events: SportEvent[]): Map<string, SportEvent[]> {
  const groups = new Map<string, SportEvent[]>();
  for (const event of events) {
    const key = event.competitionName;
    const group = groups.get(key);
    if (group) {
      group.push(event);
    } else {
      groups.set(key, [event]);
    }
  }
  return groups;
}

export default function LivePage() {
  const {
    liveEvents,
    loadingLive,
    errorLive,
    refreshLive,
    lastUpdatedLive,
  } = useSportData();

  useEffect(() => {
    void refreshLive();
  }, [refreshLive]);

  const grouped = useMemo(() => groupByCompetition(liveEvents), [liveEvents]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <LiveBadge />
        <h1 className="text-2xl font-bold text-gray-900">Live Events</h1>
      </div>

      <RefreshButton
        onRefresh={refreshLive}
        isLoading={loadingLive}
        lastUpdated={lastUpdatedLive ?? undefined}
      />

      {errorLive && (
        <ErrorMessage message={errorLive} onRetry={refreshLive} />
      )}

      {loadingLive && liveEvents.length === 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : liveEvents.length === 0 && !errorLive ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
          <span className="text-4xl">📺</span>
          <p className="font-medium text-gray-500">No live events</p>
          <p className="text-sm">Check back during match times!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([competition, events]) => (
            <section key={competition}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {competition}
              </h2>
              <div className="flex flex-col gap-2">
                {events.map((event) => (
                  <MatchCard
                    key={event.id}
                    match={{
                      id: event.id,
                      competitionId: event.competitionId,
                      sport: event.sport,
                      status: event.status,
                      date: event.date,
                      homeTeam: {
                        id: 0,
                        name: event.participants.home?.name ?? 'TBD',
                        logo: event.participants.home?.logo,
                      },
                      awayTeam: {
                        id: 0,
                        name: event.participants.away?.name ?? 'TBD',
                        logo: event.participants.away?.logo,
                      },
                      score: {
                        home: event.score ? parseInt(event.score.split('-')[0]?.trim() ?? '0', 10) : null,
                        away: event.score ? parseInt(event.score.split('-')[1]?.trim() ?? '0', 10) : null,
                      },
                      elapsed: event.elapsed,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
