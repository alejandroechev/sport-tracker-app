import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TennisAdapter } from './tennis.adapter';
import type { ApiSportsClient, ApiSportsResponse } from './client';

// ── Helpers ─────────────────────────────────────────────────────────

function mockClient() {
  return {
    request: vi.fn(),
  } as unknown as ApiSportsClient & { request: ReturnType<typeof vi.fn> };
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

// ── Fixtures ────────────────────────────────────────────────────────

const RANKING_RESPONSE = [
  {
    position: 1,
    player: {
      id: 101,
      name: 'Jannik Sinner',
      country: { name: 'Italy', code: 'IT' },
      image: 'https://example.com/sinner.png',
    },
    points: 11830,
  },
  {
    position: 2,
    player: {
      id: 102,
      name: 'Carlos Alcaraz',
      country: { name: 'Spain', code: 'ES' },
      image: 'https://example.com/alcaraz.png',
    },
    points: 9010,
  },
];

const GAME_SCHEDULED = {
  id: 501,
  date: '2025-06-15',
  time: '14:00',
  status: { short: 'NS' },
  tournament: { name: 'Wimbledon' },
  players: {
    home: { id: 101, name: 'Jannik Sinner' },
    away: { id: 102, name: 'Carlos Alcaraz' },
  },
  scores: { home: null, away: null },
  periods: [],
};

const GAME_LIVE = {
  id: 502,
  date: '2025-06-15',
  time: '15:30',
  status: { short: 'S2' },
  tournament: { name: 'Roland Garros' },
  players: {
    home: { id: 103, name: 'Novak Djokovic' },
    away: { id: 104, name: 'Rafael Nadal' },
  },
  scores: { home: 1, away: 1 },
  periods: [
    { home: 6, away: 4 },
    { home: 3, away: 6 },
  ],
};

const GAME_FINISHED = {
  id: 503,
  date: '2025-06-14',
  time: '12:00',
  status: { short: 'FT' },
  tournament: { name: 'Australian Open' },
  players: {
    home: { id: 105, name: 'Daniil Medvedev' },
    away: { id: 106, name: 'Alexander Zverev' },
  },
  scores: { home: 2, away: 1 },
  periods: [
    { home: 7, away: 5 },
    { home: 4, away: 6 },
    { home: 6, away: 3 },
  ],
};

// ── Tests ───────────────────────────────────────────────────────────

describe('TennisAdapter', () => {
  let client: ReturnType<typeof mockClient>;
  let adapter: TennisAdapter;

  beforeEach(() => {
    client = mockClient();
    adapter = new TennisAdapter(client);
  });

  // ── fetchRankings ───────────────────────────────────────────────

  describe('fetchRankings', () => {
    it('calls the rankings endpoint with the correct season', async () => {
      client.request.mockResolvedValue(apiResponse(RANKING_RESPONSE));

      await adapter.fetchRankings(2025);

      expect(client.request).toHaveBeenCalledWith('tennis', '/rankings', {
        season: '2025',
      });
    });

    it('maps API response to StandingTable with TennisRanking entries', async () => {
      client.request.mockResolvedValue(apiResponse(RANKING_RESPONSE));

      const table = await adapter.fetchRankings(2025);

      expect(table.competitionId).toBe('atp');
      expect(table.sport).toBe('tennis');
      expect(table.season).toBe(2025);
      expect(table.entries).toHaveLength(2);
      expect(table.lastUpdated).toBeTruthy();

      const first = table.entries[0];
      expect(first).toEqual({
        rank: 1,
        player: {
          id: 101,
          name: 'Jannik Sinner',
          country: 'Italy',
          image: 'https://example.com/sinner.png',
        },
        points: 11830,
      });
    });

    it('handles empty rankings', async () => {
      client.request.mockResolvedValue(apiResponse([]));

      const table = await adapter.fetchRankings(2025);

      expect(table.entries).toEqual([]);
    });
  });

  // ── fetchUpcomingGames ──────────────────────────────────────────

  describe('fetchUpcomingGames', () => {
    it('calls the games endpoint with today\'s date', async () => {
      client.request.mockResolvedValue(
        apiResponse([GAME_SCHEDULED, GAME_LIVE, GAME_FINISHED]),
      );

      await adapter.fetchUpcomingGames(5);

      const args = client.request.mock.calls[0];
      expect(args[0]).toBe('tennis');
      expect(args[1]).toBe('/games');
      expect(args[2]).toHaveProperty('date');
      // date should be YYYY-MM-DD format
      expect(args[2].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns only scheduled games', async () => {
      client.request.mockResolvedValue(
        apiResponse([GAME_SCHEDULED, GAME_LIVE, GAME_FINISHED]),
      );

      const matches = await adapter.fetchUpcomingGames(10);

      expect(matches).toHaveLength(1);
      expect(matches[0].status).toBe('scheduled');
      expect(matches[0].homeTeam.name).toBe('Jannik Sinner');
    });

    it('respects count limit', async () => {
      const threeScheduled = [
        { ...GAME_SCHEDULED, id: 1 },
        { ...GAME_SCHEDULED, id: 2 },
        { ...GAME_SCHEDULED, id: 3 },
      ];
      client.request.mockResolvedValue(apiResponse(threeScheduled));

      const matches = await adapter.fetchUpcomingGames(2);

      expect(matches).toHaveLength(2);
    });

    it('maps game to Match domain model correctly', async () => {
      client.request.mockResolvedValue(apiResponse([GAME_SCHEDULED]));

      const [match] = await adapter.fetchUpcomingGames(1);

      expect(match.id).toBe('tennis-501');
      expect(match.competitionId).toBe('atp');
      expect(match.sport).toBe('tennis');
      expect(match.status).toBe('scheduled');
      expect(match.date).toBe('2025-06-15');
      expect(match.homeTeam).toEqual({ id: 101, name: 'Jannik Sinner' });
      expect(match.awayTeam).toEqual({ id: 102, name: 'Carlos Alcaraz' });
      expect(match.score).toEqual({ home: null, away: null });
      expect(match.venue).toBe('Wimbledon');
    });
  });

  // ── fetchLiveGames ──────────────────────────────────────────────

  describe('fetchLiveGames', () => {
    it('calls the games endpoint with live=all', async () => {
      client.request.mockResolvedValue(apiResponse([GAME_LIVE]));

      await adapter.fetchLiveGames();

      expect(client.request).toHaveBeenCalledWith('tennis', '/games', {
        live: 'all',
      });
    });

    it('maps live game with set scores and elapsed info', async () => {
      client.request.mockResolvedValue(apiResponse([GAME_LIVE]));

      const [match] = await adapter.fetchLiveGames();

      expect(match.id).toBe('tennis-502');
      expect(match.status).toBe('live');
      expect(match.homeTeam.name).toBe('Novak Djokovic');
      expect(match.awayTeam.name).toBe('Rafael Nadal');
      expect(match.score).toEqual({ home: 1, away: 1 });
      expect(match.elapsed).toBe('Set 2');
      expect(match.venue).toBe('Roland Garros');
    });

    it('maps finished game with full set scores', async () => {
      client.request.mockResolvedValue(apiResponse([GAME_FINISHED]));

      const [match] = await adapter.fetchLiveGames();

      expect(match.status).toBe('finished');
      expect(match.score).toEqual({ home: 2, away: 1 });
      expect(match.elapsed).toBeUndefined();
    });

    it('returns empty array when no live games', async () => {
      client.request.mockResolvedValue(apiResponse([]));

      const matches = await adapter.fetchLiveGames();

      expect(matches).toEqual([]);
    });
  });

  // ── Status mapping ──────────────────────────────────────────────

  describe('status mapping', () => {
    it.each([
      ['NS', 'scheduled'],
      ['S1', 'live'],
      ['S2', 'live'],
      ['S3', 'live'],
      ['S4', 'live'],
      ['S5', 'live'],
      ['LIVE', 'live'],
      ['FT', 'finished'],
      ['AW', 'finished'],
      ['WO', 'finished'],
      ['POST', 'postponed'],
      ['CANC', 'cancelled'],
      ['SUSP', 'postponed'],
    ])('maps "%s" → "%s"', async (apiStatus, expected) => {
      const game = { ...GAME_SCHEDULED, status: { short: apiStatus } };
      client.request.mockResolvedValue(apiResponse([game]));

      // Use fetchLiveGames which doesn't filter by status
      const [match] = await adapter.fetchLiveGames();

      expect(match.status).toBe(expected);
    });

    it('defaults unknown statuses to "scheduled"', async () => {
      const game = { ...GAME_SCHEDULED, status: { short: 'UNKNOWN' } };
      client.request.mockResolvedValue(apiResponse([game]));

      const [match] = await adapter.fetchLiveGames();

      expect(match.status).toBe('scheduled');
    });
  });
});
