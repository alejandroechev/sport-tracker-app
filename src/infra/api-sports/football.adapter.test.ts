import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FootballAdapter } from './football.adapter';
import type { ApiSportsClient, ApiSportsResponse } from './client';
import type { MatchStatus, FootballStandingEntry } from '../../domain/models';

function mockClient(): ApiSportsClient {
  return { request: vi.fn() } as unknown as ApiSportsClient;
}

function apiResponse<T>(data: T): ApiSportsResponse<T> {
  return {
    get: 'test',
    parameters: {},
    errors: {},
    results: Array.isArray(data) ? data.length : 1,
    response: data,
  };
}

const FIXTURE_LIVE = {
  fixture: { id: 1001, date: '2026-06-15T20:00:00+00:00', status: { short: '2H', elapsed: 67 } },
  league: { id: 39, name: 'Premier League', round: 'Regular Season - 10' },
  teams: {
    home: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
    away: { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
  },
  goals: { home: 2, away: 1 },
};

const FIXTURE_SCHEDULED = {
  fixture: { id: 1002, date: '2026-06-20T15:00:00+00:00', status: { short: 'NS', elapsed: null } },
  league: { id: 39, name: 'Premier League', round: 'Regular Season - 11' },
  teams: {
    home: { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
    away: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
  },
  goals: { home: null, away: null },
};

const FIXTURE_FINISHED = {
  fixture: { id: 1003, date: '2026-06-10T20:00:00+00:00', status: { short: 'FT', elapsed: 90 } },
  league: { id: 2, name: 'Champions League', round: 'Final' },
  teams: {
    home: { id: 85, name: 'Paris Saint Germain' },
    away: { id: 541, name: 'Real Madrid' },
  },
  goals: { home: 1, away: 3 },
};

const STANDING_ENTRY = {
  rank: 1,
  team: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
  points: 78,
  all: { played: 30, win: 24, draw: 6, lose: 0, goals: { for: 72, against: 18 } },
  form: 'WWWDW',
};

const STANDINGS_RESPONSE = [
  {
    league: {
      id: 39,
      name: 'Premier League',
      standings: [[STANDING_ENTRY, { ...STANDING_ENTRY, rank: 2, team: { id: 50, name: 'Manchester City' }, points: 74 }]],
    },
  },
];

describe('FootballAdapter', () => {
  let client: ReturnType<typeof mockClient>;
  let adapter: FootballAdapter;

  beforeEach(() => {
    client = mockClient();
    adapter = new FootballAdapter(client);
  });

  // --- fetchStandings ---

  describe('fetchStandings', () => {
    it('calls API with correct params and maps standings', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse(STANDINGS_RESPONSE));

      const result = await adapter.fetchStandings(39, 2026);

      expect(client.request).toHaveBeenCalledWith('football', '/standings', {
        league: '39',
        season: '2026',
      });

      expect(result.sport).toBe('football');
      expect(result.season).toBe(2026);
      expect(result.entries).toHaveLength(2);

      const first = result.entries[0] as FootballStandingEntry;
      expect(first.rank).toBe(1);
      expect(first.team.name).toBe('Arsenal');
      expect(first.points).toBe(78);
      expect(first.played).toBe(30);
      expect(first.won).toBe(24);
      expect(first.drawn).toBe(6);
      expect(first.lost).toBe(0);
      expect(first.goalsFor).toBe(72);
      expect(first.goalsAgainst).toBe(18);
      expect(first.goalDifference).toBe(54);
      expect(first.form).toBe('WWWDW');
    });

    it('returns empty entries for empty API response', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([]));

      const result = await adapter.fetchStandings(39, 2026);

      expect(result.entries).toHaveLength(0);
      expect(result.sport).toBe('football');
    });
  });

  // --- fetchUpcoming ---

  describe('fetchUpcoming', () => {
    it('calls API with correct params and maps fixtures', async () => {
      vi.mocked(client.request).mockResolvedValue(
        apiResponse([FIXTURE_SCHEDULED]),
      );

      const result = await adapter.fetchUpcoming(39, 2026, 5);

      expect(client.request).toHaveBeenCalledWith('football', '/fixtures', {
        league: '39',
        season: '2026',
        next: '5',
      });

      expect(result).toHaveLength(1);
      const match = result[0];
      expect(match.id).toBe('1002');
      expect(match.competitionId).toBe('39');
      expect(match.sport).toBe('football');
      expect(match.status).toBe('scheduled');
      expect(match.date).toBe('2026-06-20T15:00:00+00:00');
      expect(match.homeTeam.name).toBe('Manchester City');
      expect(match.awayTeam.name).toBe('Arsenal');
      expect(match.score).toEqual({ home: null, away: null });
      expect(match.elapsed).toBeUndefined();
      expect(match.round).toBe('Regular Season - 11');
    });

    it('returns empty array for no fixtures', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([]));

      const result = await adapter.fetchUpcoming(39, 2026, 10);

      expect(result).toEqual([]);
    });
  });

  // --- fetchLive ---

  describe('fetchLive', () => {
    it('calls API with live=all and returns matches', async () => {
      vi.mocked(client.request).mockResolvedValue(
        apiResponse([FIXTURE_LIVE]),
      );

      const result = await adapter.fetchLive();

      expect(client.request).toHaveBeenCalledWith('football', '/fixtures', { live: 'all' });

      expect(result).toHaveLength(1);
      const match = result[0];
      expect(match.id).toBe('1001');
      expect(match.status).toBe('live');
      expect(match.homeTeam.name).toBe('Manchester United');
      expect(match.awayTeam.name).toBe('Liverpool');
      expect(match.score).toEqual({ home: 2, away: 1 });
      expect(match.elapsed).toBe(67);
    });

    it('returns empty array when no live games', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([]));

      const result = await adapter.fetchLive();

      expect(result).toEqual([]);
    });
  });

  // --- fetchLiveByLeague ---

  describe('fetchLiveByLeague', () => {
    it('calls API with live=all and league filter', async () => {
      vi.mocked(client.request).mockResolvedValue(
        apiResponse([FIXTURE_LIVE]),
      );

      const result = await adapter.fetchLiveByLeague(39);

      expect(client.request).toHaveBeenCalledWith('football', '/fixtures', {
        live: 'all',
        league: '39',
      });
      expect(result).toHaveLength(1);
    });
  });

  // --- Status mapping ---

  describe('status mapping', () => {
    const statusCases: [string, MatchStatus][] = [
      ['NS', 'scheduled'],
      ['TBD', 'scheduled'],
      ['1H', 'live'],
      ['HT', 'live'],
      ['2H', 'live'],
      ['ET', 'live'],
      ['BT', 'live'],
      ['P', 'live'],
      ['INT', 'live'],
      ['LIVE', 'live'],
      ['FT', 'finished'],
      ['AET', 'finished'],
      ['PEN', 'finished'],
      ['AWD', 'finished'],
      ['WO', 'finished'],
      ['PST', 'postponed'],
      ['SUSP', 'postponed'],
      ['CANC', 'cancelled'],
      ['ABD', 'cancelled'],
    ];

    it.each(statusCases)('maps API status "%s" to "%s"', async (apiStatus, expected) => {
      const fixture = {
        ...FIXTURE_LIVE,
        fixture: { ...FIXTURE_LIVE.fixture, status: { short: apiStatus, elapsed: null } },
      };
      vi.mocked(client.request).mockResolvedValue(apiResponse([fixture]));

      const [match] = await adapter.fetchLive();

      expect(match.status).toBe(expected);
    });

    it('defaults unknown status to "scheduled"', async () => {
      const fixture = {
        ...FIXTURE_LIVE,
        fixture: { ...FIXTURE_LIVE.fixture, status: { short: 'UNKNOWN', elapsed: null } },
      };
      vi.mocked(client.request).mockResolvedValue(apiResponse([fixture]));

      const [match] = await adapter.fetchLive();

      expect(match.status).toBe('scheduled');
    });
  });

  // --- Elapsed only for live ---

  describe('elapsed field', () => {
    it('includes elapsed for live matches', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([FIXTURE_LIVE]));

      const [match] = await adapter.fetchLive();

      expect(match.elapsed).toBe(67);
    });

    it('omits elapsed for finished matches', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([FIXTURE_FINISHED]));

      const [match] = await adapter.fetchLive();

      expect(match.elapsed).toBeUndefined();
    });

    it('omits elapsed for scheduled matches', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([FIXTURE_SCHEDULED]));

      const [match] = await adapter.fetchUpcoming(39, 2026, 5);

      expect(match.elapsed).toBeUndefined();
    });
  });

  // --- Team mapping ---

  describe('team mapping', () => {
    it('maps team logo when present', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([FIXTURE_LIVE]));

      const [match] = await adapter.fetchLive();

      expect(match.homeTeam.logo).toBe('https://media.api-sports.io/football/teams/33.png');
      expect(match.awayTeam.logo).toBe('https://media.api-sports.io/football/teams/40.png');
    });

    it('handles missing logo gracefully', async () => {
      vi.mocked(client.request).mockResolvedValue(apiResponse([FIXTURE_FINISHED]));

      const [match] = await adapter.fetchLive();

      expect(match.homeTeam.logo).toBeUndefined();
      expect(match.awayTeam.logo).toBeUndefined();
    });
  });
});
