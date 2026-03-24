import type { EspnClient } from './client';
import type {
  Match,
  MatchStatus,
  StandingTable,
  F1DriverStanding,
  F1ConstructorStanding,
} from '../../domain/models';

// Helper to find a stat value by name
function statValue(stats: Array<{ name: string; value: number }>, name: string): number {
  return stats.find(s => s.name === name)?.value ?? 0;
}

function mapEspnStatus(state: string): MatchStatus {
  switch (state) {
    case 'in':
      return 'live';
    case 'post':
      return 'finished';
    case 'pre':
    default:
      return 'scheduled';
  }
}

export class EspnF1Adapter {
  private client: EspnClient;

  constructor(client: EspnClient) {
    this.client = client;
  }

  async fetchDriverStandings(): Promise<StandingTable> {
    const data = await this.client.getStandings('racing', 'f1');
    const children = data.children ?? [];

    // First child is typically Driver Standings
    const driverGroup = children.find(
      (c: any) => c.name?.toLowerCase().includes('driver'),
    ) ?? children[0];

    const entries: F1DriverStanding[] = [];
    const rawEntries = driverGroup?.standings?.entries ?? [];

    for (const entry of rawEntries) {
      const stats: Array<{ name: string; value: number }> = entry.stats ?? [];
      entries.push({
        rank: statValue(stats, 'rank'),
        driver: {
          id: parseInt(entry.athlete?.id ?? '0', 10),
          name: entry.athlete?.displayName ?? 'Unknown',
          image: entry.athlete?.headshot?.href,
        },
        team: {
          id: 0,
          name: '',
          logo: entry.athlete?.flag?.href,
        },
        points: statValue(stats, 'championshipPts') || statValue(stats, 'points'),
        wins: statValue(stats, 'wins'),
      });
    }

    entries.sort((a, b) => a.rank - b.rank);

    const season = data.season?.year ?? new Date().getFullYear();

    return {
      competitionId: 'f1',
      sport: 'formula1',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchConstructorStandings(): Promise<StandingTable> {
    const data = await this.client.getStandings('racing', 'f1');
    const children = data.children ?? [];

    const constructorGroup = children.find(
      (c: any) => c.name?.toLowerCase().includes('constructor'),
    ) ?? children[1];

    const entries: F1ConstructorStanding[] = [];
    const rawEntries = constructorGroup?.standings?.entries ?? [];

    for (const entry of rawEntries) {
      const stats: Array<{ name: string; value: number }> = entry.stats ?? [];
      entries.push({
        rank: statValue(stats, 'rank'),
        team: {
          id: parseInt(entry.team?.id ?? '0', 10),
          name: entry.team?.displayName ?? entry.team?.name ?? 'Unknown',
          color: entry.team?.color,
        },
        points: statValue(stats, 'points') || statValue(stats, 'championshipPts'),
      });
    }

    entries.sort((a, b) => a.rank - b.rank);

    const season = data.season?.year ?? new Date().getFullYear();

    return {
      competitionId: 'f1-constructors',
      sport: 'formula1',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchScoreboard(): Promise<Match[]> {
    const data = await this.client.getScoreboard('racing', 'f1');
    const events: any[] = data.events ?? [];

    return events.map(event => this.mapEventToMatch(event));
  }

  async fetchLiveRaces(): Promise<Match[]> {
    const matches = await this.fetchScoreboard();
    return matches.filter(m => m.status === 'live');
  }

  async fetchUpcomingRaces(count: number): Promise<Match[]> {
    const matches = await this.fetchScoreboard();
    return matches.filter(m => m.status === 'scheduled').slice(0, count);
  }

  private mapEventToMatch(event: any): Match {
    const competition = event.competitions?.[0];
    const state: string = event.status?.type?.state ?? 'pre';
    const status = mapEspnStatus(state);

    return {
      id: String(event.id),
      competitionId: 'f1',
      sport: 'formula1',
      status,
      date: event.date,
      homeTeam: {
        id: parseInt(event.id ?? '0', 10),
        name: event.name ?? 'Race',
      },
      awayTeam: {
        id: 0,
        name: event.circuit?.fullName ?? competition?.venue?.fullName ?? '',
      },
      score: { home: null, away: null },
      elapsed: status === 'live' ? competition?.status?.displayClock : undefined,
      venue: competition?.venue?.fullName,
      round: event.status?.type?.description,
    };
  }
}
