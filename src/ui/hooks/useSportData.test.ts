import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSportData } from './useSportData';
import type { SportEvent, Match, StandingTable } from '../../domain/models';

// ── stub data ──────────────────────────────────────────────────────

function buildSportEvent(overrides: Partial<SportEvent> = {}): SportEvent {
  return {
    id: 'evt-1',
    competitionId: 'premier-league',
    competitionName: 'Premier League',
    sport: 'football',
    status: 'live',
    date: '2025-01-15T20:00:00Z',
    title: 'Arsenal vs Chelsea',
    score: '1-0',
    participants: {
      home: { name: 'Arsenal' },
      away: { name: 'Chelsea' },
    },
    ...overrides,
  };
}

function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    competitionId: 'premier-league',
    sport: 'football',
    status: 'scheduled',
    date: '2025-02-01T15:00:00Z',
    homeTeam: { id: 1, name: 'Arsenal' },
    awayTeam: { id: 2, name: 'Chelsea' },
    score: { home: null, away: null },
    ...overrides,
  };
}

function buildStandings(
  overrides: Partial<StandingTable> = {},
): StandingTable {
  return {
    competitionId: 'premier-league',
    sport: 'football',
    season: 2025,
    entries: [],
    lastUpdated: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

// ── mocks ──────────────────────────────────────────────────────────

const mockFetchLiveEvents = vi.fn();
const mockFetchStandings = vi.fn();
const mockFetchUpcoming = vi.fn();
const mockFetchLiveByCompetition = vi.fn();

vi.mock('../../infra/provider', () => ({
  createSportDataAdapter: () => ({
    fetchLiveEvents: mockFetchLiveEvents,
    fetchStandings: mockFetchStandings,
    fetchUpcoming: mockFetchUpcoming,
    fetchLiveByCompetition: mockFetchLiveByCompetition,
  }),
}));

// ── tests ──────────────────────────────────────────────────────────

describe('useSportData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLiveEvents.mockResolvedValue([]);
    mockFetchStandings.mockResolvedValue(buildStandings());
    mockFetchUpcoming.mockResolvedValue([]);
    mockFetchLiveByCompetition.mockResolvedValue([]);
  });

  it('returns loading=false and empty data initially', () => {
    const { result } = renderHook(() => useSportData());

    expect(result.current.liveEvents).toEqual([]);
    expect(result.current.loadingLive).toBe(false);
    expect(result.current.errorLive).toBeNull();

    expect(result.current.standings).toBeNull();
    expect(result.current.loadingStandings).toBe(false);

    expect(result.current.upcoming).toEqual([]);
    expect(result.current.loadingUpcoming).toBe(false);

    expect(result.current.lastUpdatedLive).toBeNull();
  });

  it('fetches live events and updates state', async () => {
    const events = [buildSportEvent()];
    mockFetchLiveEvents.mockResolvedValue(events);

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshLive();
    });

    expect(result.current.liveEvents).toEqual(events);
    expect(result.current.loadingLive).toBe(false);
    expect(result.current.errorLive).toBeNull();
    expect(result.current.lastUpdatedLive).toBe('just now');
    expect(mockFetchLiveEvents).toHaveBeenCalledTimes(1);
  });

  it('caches standings and returns cached data on repeat call', async () => {
    const table = buildStandings();
    mockFetchStandings.mockResolvedValue(table);

    const { result } = renderHook(() => useSportData());

    // First call – fetches from service
    await act(async () => {
      await result.current.refreshStandings('premier-league');
    });
    expect(mockFetchStandings).toHaveBeenCalledTimes(1);
    expect(result.current.standings).toEqual(table);

    // Second call – should use cache, no new fetch
    await act(async () => {
      await result.current.refreshStandings('premier-league');
    });
    expect(mockFetchStandings).toHaveBeenCalledTimes(1);
    expect(result.current.standings).toEqual(table);
  });

  it('handles errors gracefully', async () => {
    mockFetchLiveEvents.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshLive();
    });

    expect(result.current.liveEvents).toEqual([]);
    expect(result.current.loadingLive).toBe(false);
    expect(result.current.errorLive).toBe('Network error');
  });

  it('refreshLive always re-fetches (no cache)', async () => {
    const events1 = [buildSportEvent({ id: 'evt-1' })];
    const events2 = [buildSportEvent({ id: 'evt-2' })];
    mockFetchLiveEvents.mockResolvedValueOnce(events1).mockResolvedValueOnce(events2);

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshLive();
    });
    expect(result.current.liveEvents).toEqual(events1);

    await act(async () => {
      await result.current.refreshLive();
    });
    expect(result.current.liveEvents).toEqual(events2);
    expect(mockFetchLiveEvents).toHaveBeenCalledTimes(2);
  });

  it('fetches upcoming matches', async () => {
    const matches = [buildMatch()];
    mockFetchUpcoming.mockResolvedValue(matches);

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshUpcoming('premier-league');
    });

    expect(result.current.upcoming).toEqual(matches);
    expect(result.current.loadingUpcoming).toBe(false);
    expect(result.current.lastUpdatedUpcoming).toBe('just now');
  });

  it('fetches live matches by competition', async () => {
    const matches = [buildMatch({ status: 'live' })];
    mockFetchLiveByCompetition.mockResolvedValue(matches);

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshLiveByCompetition('premier-league');
    });

    expect(result.current.liveByCompetition).toEqual(matches);
    expect(result.current.loadingLiveByComp).toBe(false);
  });

  it('handles standings error gracefully', async () => {
    mockFetchStandings.mockRejectedValue(new Error('Service unavailable'));

    const { result } = renderHook(() => useSportData());

    await act(async () => {
      await result.current.refreshStandings('premier-league');
    });

    expect(result.current.standings).toBeNull();
    expect(result.current.errorStandings).toBe('Service unavailable');
    expect(result.current.loadingStandings).toBe(false);
  });
});
