import { describe, it, expect } from 'vitest';
import { InMemoryStubAdapter } from './stub.adapter';

describe('InMemoryStubAdapter', () => {
  const adapter = new InMemoryStubAdapter();

  it('fetchLiveEvents returns an array of SportEvent objects', async () => {
    const events = await adapter.fetchLiveEvents();

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);

    for (const ev of events) {
      expect(ev).toHaveProperty('id');
      expect(ev).toHaveProperty('competitionId');
      expect(ev).toHaveProperty('sport');
      expect(ev.status).toBe('live');
      expect(ev).toHaveProperty('title');
      expect(ev).toHaveProperty('participants');
    }
  });

  describe('fetchStandings', () => {
    it('returns football standings for a football competition', async () => {
      const table = await adapter.fetchStandings('premier-league');

      expect(table.competitionId).toBe('premier-league');
      expect(table.sport).toBe('football');
      expect(table.entries.length).toBeGreaterThan(0);

      const first = table.entries[0];
      expect(first).toHaveProperty('rank');
      expect(first).toHaveProperty('team');
      expect(first).toHaveProperty('points');
      // Football-specific fields
      expect(first).toHaveProperty('played');
      expect(first).toHaveProperty('won');
      expect(first).toHaveProperty('goalDifference');
    });

    it('returns F1 driver standings', async () => {
      const table = await adapter.fetchStandings('f1');

      expect(table.competitionId).toBe('f1');
      expect(table.sport).toBe('formula1');
      expect(table.entries.length).toBeGreaterThan(0);

      const first = table.entries[0];
      expect(first).toHaveProperty('driver');
      expect(first).toHaveProperty('wins');
    });

    it('returns tennis rankings', async () => {
      const table = await adapter.fetchStandings('atp');

      expect(table.competitionId).toBe('atp');
      expect(table.sport).toBe('tennis');
      expect(table.entries.length).toBeGreaterThan(0);

      const first = table.entries[0];
      expect(first).toHaveProperty('player');
      expect(first).toHaveProperty('points');
    });
  });

  describe('fetchUpcoming', () => {
    it('returns matches with scheduled status', async () => {
      const matches = await adapter.fetchUpcoming('premier-league');

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      for (const m of matches) {
        expect(m.status).toBe('scheduled');
        expect(m.competitionId).toBe('premier-league');
      }
    });

    it('respects count parameter', async () => {
      const matches = await adapter.fetchUpcoming('premier-league', 1);

      expect(matches.length).toBe(1);
      expect(matches[0].status).toBe('scheduled');
    });

    it('returns empty for competitions with no upcoming matches', async () => {
      const matches = await adapter.fetchUpcoming('world-cup');

      expect(matches).toEqual([]);
    });
  });

  describe('fetchLiveByCompetition', () => {
    it('returns only live matches for the given competition', async () => {
      const matches = await adapter.fetchLiveByCompetition('premier-league');

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      for (const m of matches) {
        expect(m.status).toBe('live');
        expect(m.competitionId).toBe('premier-league');
      }
    });

    it('returns empty array when no live matches exist', async () => {
      const matches = await adapter.fetchLiveByCompetition('world-cup');

      expect(matches).toEqual([]);
    });

    it('returns live F1 events', async () => {
      const matches = await adapter.fetchLiveByCompetition('f1');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].sport).toBe('formula1');
      expect(matches[0].status).toBe('live');
    });

    it('returns live tennis matches', async () => {
      const matches = await adapter.fetchLiveByCompetition('atp');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].sport).toBe('tennis');
      expect(matches[0].status).toBe('live');
    });
  });
});
