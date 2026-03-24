import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportDataService } from './sport-data.service';
import type { SportDataPort } from './sport-data.port';
import type { SportEvent, Match, StandingTable } from '../models';

function createMockPort(): SportDataPort {
  return {
    fetchLiveEvents: vi.fn(),
    fetchStandings: vi.fn(),
    fetchUpcoming: vi.fn(),
    fetchLiveByCompetition: vi.fn(),
  };
}

describe('SportDataService', () => {
  let port: ReturnType<typeof createMockPort>;
  let service: SportDataService;

  beforeEach(() => {
    port = createMockPort();
    service = new SportDataService(port);
  });

  it('getAllLiveEvents delegates to port.fetchLiveEvents', async () => {
    const events: SportEvent[] = [
      {
        id: 'e1',
        competitionId: 'premier-league',
        competitionName: 'Premier League',
        sport: 'football',
        status: 'live',
        date: '2025-01-01',
        title: 'Team A vs Team B',
        participants: {
          home: { name: 'Team A' },
          away: { name: 'Team B' },
        },
      },
    ];
    vi.mocked(port.fetchLiveEvents).mockResolvedValue(events);

    const result = await service.getAllLiveEvents();

    expect(port.fetchLiveEvents).toHaveBeenCalledOnce();
    expect(result).toEqual(events);
  });

  it('getStandings delegates with correct competitionId', async () => {
    const standings: StandingTable = {
      competitionId: 'la-liga',
      sport: 'football',
      season: 2025,
      entries: [],
      lastUpdated: '2025-01-01',
    };
    vi.mocked(port.fetchStandings).mockResolvedValue(standings);

    const result = await service.getStandings('la-liga');

    expect(port.fetchStandings).toHaveBeenCalledWith('la-liga');
    expect(result).toEqual(standings);
  });

  it('getUpcoming passes count parameter', async () => {
    const matches: Match[] = [];
    vi.mocked(port.fetchUpcoming).mockResolvedValue(matches);

    await service.getUpcoming('premier-league', 5);

    expect(port.fetchUpcoming).toHaveBeenCalledWith('premier-league', 5);
  });

  it('getUpcoming uses default count of 10', async () => {
    vi.mocked(port.fetchUpcoming).mockResolvedValue([]);

    await service.getUpcoming('premier-league');

    expect(port.fetchUpcoming).toHaveBeenCalledWith('premier-league', 10);
  });

  it('getLiveByCompetition delegates correctly', async () => {
    const matches: Match[] = [
      {
        id: 'm1',
        competitionId: 'champions-league',
        sport: 'football',
        status: 'live',
        date: '2025-01-01',
        homeTeam: { id: 1, name: 'Team A' },
        awayTeam: { id: 2, name: 'Team B' },
        score: { home: 1, away: 0 },
      },
    ];
    vi.mocked(port.fetchLiveByCompetition).mockResolvedValue(matches);

    const result = await service.getLiveByCompetition('champions-league');

    expect(port.fetchLiveByCompetition).toHaveBeenCalledWith('champions-league');
    expect(result).toEqual(matches);
  });

  it('getCompetition returns competition from static config', () => {
    const comp = service.getCompetition('premier-league');

    expect(comp).toBeDefined();
    expect(comp!.id).toBe('premier-league');
    expect(comp!.name).toBe('Premier League');
    expect(comp!.sport).toBe('football');
  });

  it('getCompetition returns undefined for unknown id', () => {
    const comp = service.getCompetition('nonexistent');

    expect(comp).toBeUndefined();
  });
});
