import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Formula1Adapter } from './formula1.adapter';
import type { ApiSportsClient, ApiSportsResponse } from './client';

function mockClient() {
  return {
    request: vi.fn(),
  } as unknown as ApiSportsClient & { request: ReturnType<typeof vi.fn> };
}

function apiResponse<T>(data: T): ApiSportsResponse<T> {
  return {
    get: 'test',
    parameters: {},
    errors: [],
    results: Array.isArray(data) ? data.length : 1,
    response: data,
  };
}

describe('Formula1Adapter', () => {
  let client: ReturnType<typeof mockClient>;
  let adapter: Formula1Adapter;

  beforeEach(() => {
    client = mockClient();
    adapter = new Formula1Adapter(client as unknown as ApiSportsClient);
  });

  // ------------------------------------------------------------------
  // fetchDriverStandings
  // ------------------------------------------------------------------
  describe('fetchDriverStandings', () => {
    it('maps API rankings to F1DriverStanding entries', async () => {
      client.request.mockResolvedValue(
        apiResponse([
          {
            position: 1,
            driver: { id: 10, name: 'Max Verstappen', number: 1, image: 'max.png' },
            team: { id: 20, name: 'Red Bull Racing', logo: 'rb.png' },
            points: 575,
            wins: 19,
          },
          {
            position: 2,
            driver: { id: 11, name: 'Lando Norris', number: 4, image: 'lando.png' },
            team: { id: 21, name: 'McLaren', logo: 'mc.png' },
            points: 374,
            wins: 3,
          },
        ]),
      );

      const table = await adapter.fetchDriverStandings(2024);

      expect(client.request).toHaveBeenCalledWith(
        'formula1',
        '/rankings/drivers',
        { season: '2024' },
      );
      expect(table.competitionId).toBe('f1');
      expect(table.sport).toBe('formula1');
      expect(table.season).toBe(2024);
      expect(table.entries).toHaveLength(2);

      const first = table.entries[0];
      expect(first).toMatchObject({
        rank: 1,
        driver: { id: 10, name: 'Max Verstappen', number: 1 },
        team: { id: 20, name: 'Red Bull Racing' },
        points: 575,
        wins: 19,
      });
    });

    it('returns empty entries when API returns empty array', async () => {
      client.request.mockResolvedValue(apiResponse([]));

      const table = await adapter.fetchDriverStandings(2024);
      expect(table.entries).toEqual([]);
    });
  });

  // ------------------------------------------------------------------
  // fetchUpcomingRaces
  // ------------------------------------------------------------------
  describe('fetchUpcomingRaces', () => {
    it('maps API races to Match array', async () => {
      client.request.mockResolvedValue(
        apiResponse([
          {
            id: 100,
            competition: {
              id: 1,
              name: 'Australian GP',
              location: { country: 'Australia', city: 'Melbourne' },
            },
            circuit: { name: 'Albert Park Circuit' },
            date: '2025-03-16T05:00:00+00:00',
            type: 'Race',
            status: 'Scheduled',
            laps: { total: 58, current: null },
          },
        ]),
      );

      const matches = await adapter.fetchUpcomingRaces(5);

      expect(client.request).toHaveBeenCalledWith(
        'formula1',
        '/races',
        { next: '5' },
      );
      expect(matches).toHaveLength(1);

      const m = matches[0];
      expect(m.id).toBe('f1-race-100');
      expect(m.competitionId).toBe('f1');
      expect(m.sport).toBe('formula1');
      expect(m.status).toBe('scheduled');
      expect(m.homeTeam.name).toBe('Australian GP');
      expect(m.awayTeam.name).toBe('Albert Park Circuit');
      expect(m.venue).toBe('Melbourne, Australia');
      expect(m.score).toEqual({ home: null, away: null });
      expect(m.elapsed).toBeUndefined();
    });
  });

  // ------------------------------------------------------------------
  // fetchLiveRaces
  // ------------------------------------------------------------------
  describe('fetchLiveRaces', () => {
    it('returns only live races (laps in progress)', async () => {
      client.request.mockResolvedValue(
        apiResponse([
          {
            id: 200,
            competition: {
              id: 2,
              name: 'Monaco GP',
              location: { country: 'Monaco', city: 'Monte Carlo' },
            },
            circuit: { name: 'Circuit de Monaco' },
            date: '2025-05-25T13:00:00+00:00',
            type: 'Race',
            status: 'In Progress',
            laps: { total: 78, current: 42 },
          },
          {
            id: 201,
            competition: {
              id: 3,
              name: 'Canadian GP',
              location: { country: 'Canada', city: 'Montreal' },
            },
            circuit: { name: 'Circuit Gilles Villeneuve' },
            date: '2025-06-08T18:00:00+00:00',
            type: 'Race',
            status: 'Scheduled',
            laps: { total: 70, current: null },
          },
          {
            id: 202,
            competition: {
              id: 4,
              name: 'Spanish GP',
              location: { country: 'Spain', city: 'Barcelona' },
            },
            circuit: { name: 'Circuit de Barcelona-Catalunya' },
            date: '2025-05-18T13:00:00+00:00',
            type: 'Race',
            status: 'Completed',
            laps: { total: 66, current: 66 },
          },
        ]),
      );

      const matches = await adapter.fetchLiveRaces();

      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('f1-race-200');
      expect(matches[0].status).toBe('live');
      expect(matches[0].elapsed).toBe('Lap 42/78');
      expect(matches[0].homeTeam.name).toBe('Monaco GP');
      expect(matches[0].venue).toBe('Monte Carlo, Monaco');
    });

    it('returns empty array when no races are live', async () => {
      client.request.mockResolvedValue(
        apiResponse([
          {
            id: 300,
            competition: {
              id: 5,
              name: 'British GP',
              location: { country: 'UK', city: 'Silverstone' },
            },
            circuit: { name: 'Silverstone Circuit' },
            date: '2025-07-06T14:00:00+00:00',
            type: 'Race',
            status: 'Completed',
            laps: { total: 52, current: 52 },
          },
        ]),
      );

      const matches = await adapter.fetchLiveRaces();
      expect(matches).toEqual([]);
    });
  });
});
