import { useState, useRef, useMemo, useCallback } from 'react';
import type { SportEvent, Match, StandingTable } from '../../domain/models';
import { SportDataService } from '../../domain/services/sport-data.service';
import { createSportDataAdapter } from '../../infra/provider';

const CACHE_DURATION_STANDINGS = 3_600_000; // 1 hour
const CACHE_DURATION_UPCOMING = 1_800_000; // 30 min

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function isCacheValid<T>(
  entry: CacheEntry<T> | undefined,
  duration: number,
): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < duration;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export interface UseSportDataReturn {
  liveEvents: SportEvent[];
  loadingLive: boolean;
  errorLive: string | null;
  refreshLive: () => Promise<void>;

  standings: StandingTable | null;
  loadingStandings: boolean;
  errorStandings: string | null;
  refreshStandings: (competitionId: string) => Promise<void>;

  upcoming: Match[];
  loadingUpcoming: boolean;
  errorUpcoming: string | null;
  refreshUpcoming: (competitionId: string) => Promise<void>;

  liveByCompetition: Match[];
  loadingLiveByComp: boolean;
  refreshLiveByCompetition: (competitionId: string) => Promise<void>;

  lastUpdatedLive: string | null;
  lastUpdatedStandings: string | null;
  lastUpdatedUpcoming: string | null;
}

export function useSportData(): UseSportDataReturn {
  const service = useMemo(
    () => new SportDataService(createSportDataAdapter()),
    [],
  );

  const cache = useRef<Map<string, CacheEntry<unknown>>>(new Map());

  // Live events
  const [liveEvents, setLiveEvents] = useState<SportEvent[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [errorLive, setErrorLive] = useState<string | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState<number | null>(null);

  // Standings
  const [standings, setStandings] = useState<StandingTable | null>(null);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [errorStandings, setErrorStandings] = useState<string | null>(null);
  const [standingsTimestamp, setStandingsTimestamp] = useState<number | null>(
    null,
  );

  // Upcoming
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [errorUpcoming, setErrorUpcoming] = useState<string | null>(null);
  const [upcomingTimestamp, setUpcomingTimestamp] = useState<number | null>(
    null,
  );

  // Live by competition
  const [liveByCompetition, setLiveByCompetition] = useState<Match[]>([]);
  const [loadingLiveByComp, setLoadingLiveByComp] = useState(false);

  const refreshLive = useCallback(async () => {
    setLoadingLive(true);
    setErrorLive(null);
    try {
      // Live data is never cached
      cache.current.delete('live');
      const data = await service.getAllLiveEvents();
      const now = Date.now();
      cache.current.set('live', { data, timestamp: now });
      setLiveEvents(data);
      setLiveTimestamp(now);
    } catch (err) {
      setErrorLive(err instanceof Error ? err.message : 'Failed to fetch live events');
    } finally {
      setLoadingLive(false);
    }
  }, [service]);

  const refreshStandings = useCallback(
    async (competitionId: string) => {
      const key = `standings-${competitionId}`;
      const cached = cache.current.get(key) as
        | CacheEntry<StandingTable>
        | undefined;

      if (isCacheValid(cached, CACHE_DURATION_STANDINGS)) {
        setStandings(cached.data);
        setStandingsTimestamp(cached.timestamp);
        return;
      }

      setLoadingStandings(true);
      setErrorStandings(null);
      try {
        const data = await service.getStandings(competitionId);
        const now = Date.now();
        cache.current.set(key, { data, timestamp: now });
        setStandings(data);
        setStandingsTimestamp(now);
      } catch (err) {
        setErrorStandings(
          err instanceof Error ? err.message : 'Failed to fetch standings',
        );
      } finally {
        setLoadingStandings(false);
      }
    },
    [service],
  );

  const refreshUpcoming = useCallback(
    async (competitionId: string) => {
      const key = `upcoming-${competitionId}`;
      const cached = cache.current.get(key) as
        | CacheEntry<Match[]>
        | undefined;

      if (isCacheValid(cached, CACHE_DURATION_UPCOMING)) {
        setUpcoming(cached.data);
        setUpcomingTimestamp(cached.timestamp);
        return;
      }

      setLoadingUpcoming(true);
      setErrorUpcoming(null);
      try {
        const data = await service.getUpcoming(competitionId);
        const now = Date.now();
        cache.current.set(key, { data, timestamp: now });
        setUpcoming(data);
        setUpcomingTimestamp(now);
      } catch (err) {
        setErrorUpcoming(
          err instanceof Error ? err.message : 'Failed to fetch upcoming',
        );
      } finally {
        setLoadingUpcoming(false);
      }
    },
    [service],
  );

  const refreshLiveByCompetition = useCallback(
    async (competitionId: string) => {
      setLoadingLiveByComp(true);
      try {
        const data = await service.getLiveByCompetition(competitionId);
        setLiveByCompetition(data);
      } catch {
        // Live-by-competition errors are silent; data stays stale
      } finally {
        setLoadingLiveByComp(false);
      }
    },
    [service],
  );

  return {
    liveEvents,
    loadingLive,
    errorLive,
    refreshLive,

    standings,
    loadingStandings,
    errorStandings,
    refreshStandings,

    upcoming,
    loadingUpcoming,
    errorUpcoming,
    refreshUpcoming,

    liveByCompetition,
    loadingLiveByComp,
    refreshLiveByCompetition,

    lastUpdatedLive: liveTimestamp ? formatRelativeTime(liveTimestamp) : null,
    lastUpdatedStandings: standingsTimestamp
      ? formatRelativeTime(standingsTimestamp)
      : null,
    lastUpdatedUpcoming: upcomingTimestamp
      ? formatRelativeTime(upcomingTimestamp)
      : null,
  };
}
