import type { EspnClient } from './client';
import type {
  Match,
  MatchStatus,
  StandingTable,
  FootballStandingEntry,
} from '../../domain/models';

// Helper to find a stat value by name from the ESPN stats array
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

export class EspnFootballAdapter {
  private client: EspnClient;

  constructor(client: EspnClient) {
    this.client = client;
  }

  async fetchStandings(espnSlug: string, competitionId: string): Promise<StandingTable> {
    const data = await this.client.getStandings('soccer', espnSlug);

    const entries: FootballStandingEntry[] = [];

    // ESPN wraps standings inside children[].standings.entries
    const children = data.children ?? [];
    for (const group of children) {
      const groupEntries = group.standings?.entries ?? [];
      for (const entry of groupEntries) {
        const stats: Array<{ name: string; value: number }> = entry.stats ?? [];
        entries.push({
          rank: statValue(stats, 'rank'),
          team: {
            id: parseInt(entry.team?.id ?? '0', 10),
            name: entry.team?.displayName ?? 'Unknown',
            logo: entry.team?.logos?.[0]?.href,
          },
          points: statValue(stats, 'points'),
          played: statValue(stats, 'gamesPlayed'),
          won: statValue(stats, 'wins'),
          drawn: statValue(stats, 'ties') || statValue(stats, 'draws'),
          lost: statValue(stats, 'losses'),
          goalsFor: statValue(stats, 'pointsFor'),
          goalsAgainst: statValue(stats, 'pointsAgainst'),
          goalDifference: statValue(stats, 'pointDifferential'),
        });
      }
    }

    // Sort by rank
    entries.sort((a, b) => a.rank - b.rank);

    const season = data.season?.year ?? new Date().getFullYear();

    return {
      competitionId,
      sport: 'football',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchScoreboard(espnSlug: string, competitionId: string): Promise<Match[]> {
    const data = await this.client.getScoreboard('soccer', espnSlug);
    const events: any[] = data.events ?? [];

    return events.map(event => this.mapEventToMatch(event, competitionId));
  }

  async fetchLiveMatches(espnSlug: string, competitionId: string): Promise<Match[]> {
    const matches = await this.fetchScoreboard(espnSlug, competitionId);
    return matches.filter(m => m.status === 'live');
  }

  async fetchUpcomingMatches(
    espnSlug: string,
    competitionId: string,
    count: number,
  ): Promise<Match[]> {
    const matches = await this.fetchScoreboard(espnSlug, competitionId);
    return matches.filter(m => m.status === 'scheduled').slice(0, count);
  }

  private mapEventToMatch(event: any, competitionId: string): Match {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];

    const home = competitors.find((c: any) => c.homeAway === 'home');
    const away = competitors.find((c: any) => c.homeAway === 'away');

    const state: string = event.status?.type?.state ?? 'pre';
    const status = mapEspnStatus(state);

    return {
      id: String(event.id),
      competitionId,
      sport: 'football',
      status,
      date: event.date,
      homeTeam: {
        id: parseInt(home?.team?.id ?? '0', 10),
        name: home?.team?.displayName ?? 'TBD',
        logo: home?.team?.logo,
      },
      awayTeam: {
        id: parseInt(away?.team?.id ?? '0', 10),
        name: away?.team?.displayName ?? 'TBD',
        logo: away?.team?.logo,
      },
      score: {
        home: home?.score != null ? parseInt(home.score, 10) : null,
        away: away?.score != null ? parseInt(away.score, 10) : null,
      },
      elapsed: status === 'live' ? competition?.status?.displayClock : undefined,
      round: event.status?.type?.description,
    };
  }
}
