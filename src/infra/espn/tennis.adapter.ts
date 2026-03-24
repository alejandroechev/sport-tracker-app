import type { EspnClient } from './client';
import type {
  Match,
  MatchStatus,
  StandingTable,
  TennisRanking,
} from '../../domain/models';

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

export class EspnTennisAdapter {
  private client: EspnClient;

  constructor(client: EspnClient) {
    this.client = client;
  }

  async fetchRankings(): Promise<StandingTable> {
    const data = await this.client.getTennisRankings();
    const rankings = data.rankings ?? [];
    const firstRanking = rankings[0];
    const ranks: any[] = firstRanking?.ranks ?? [];

    const entries: TennisRanking[] = ranks.map((r: any) => ({
      rank: r.current ?? 0,
      player: {
        id: parseInt(r.athlete?.id ?? '0', 10),
        name: r.athlete?.displayName ?? 'Unknown',
        country: r.athlete?.flag?.alt,
      },
      points: r.points ?? 0,
    }));

    const season = data.season?.year ?? new Date().getFullYear();

    return {
      competitionId: 'atp',
      sport: 'tennis',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchScoreboard(): Promise<Match[]> {
    const data = await this.client.getScoreboard('tennis', 'atp');
    const events: any[] = data.events ?? [];

    return events.map(event => this.mapEventToMatch(event));
  }

  async fetchLiveMatches(): Promise<Match[]> {
    const matches = await this.fetchScoreboard();
    return matches.filter(m => m.status === 'live');
  }

  async fetchUpcomingMatches(count: number): Promise<Match[]> {
    const matches = await this.fetchScoreboard();
    return matches.filter(m => m.status === 'scheduled').slice(0, count);
  }

  private mapEventToMatch(event: any): Match {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const state: string = event.status?.type?.state ?? 'pre';
    const status = mapEspnStatus(state);

    const home = competitors[0];
    const away = competitors[1];

    return {
      id: String(event.id),
      competitionId: 'atp',
      sport: 'tennis',
      status,
      date: event.date,
      homeTeam: {
        id: parseInt(home?.id ?? '0', 10),
        name: home?.athlete?.displayName ?? home?.team?.displayName ?? 'TBD',
      },
      awayTeam: {
        id: parseInt(away?.id ?? '0', 10),
        name: away?.athlete?.displayName ?? away?.team?.displayName ?? 'TBD',
      },
      score: {
        home: home?.score != null ? parseInt(home.score, 10) : null,
        away: away?.score != null ? parseInt(away.score, 10) : null,
      },
      elapsed: status === 'live' ? competition?.status?.displayClock : undefined,
      venue: competition?.venue?.fullName,
      round: event.status?.type?.description,
    };
  }
}
