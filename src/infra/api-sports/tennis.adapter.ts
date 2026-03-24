import type { ApiSportsClient } from './client';
import type { Match, MatchStatus, StandingTable, TennisRanking } from '../../domain/models';

// ── API response types ──────────────────────────────────────────────

interface ApiTennisPlayer {
  id: number;
  name: string;
  country?: { name: string; code: string };
  image?: string;
}

interface ApiTennisRanking {
  position: number;
  player: ApiTennisPlayer;
  points: number;
}

interface ApiTennisGame {
  id: number;
  date: string;
  time: string;
  status: { short: string };
  tournament: { name: string };
  players: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores: { home: number | null; away: number | null };
  periods: Array<{ home: number | null; away: number | null }>;
}

// ── Status mapping ──────────────────────────────────────────────────

const STATUS_MAP: Record<string, MatchStatus> = {
  NS: 'scheduled',
  // In-progress statuses
  S1: 'live',
  S2: 'live',
  S3: 'live',
  S4: 'live',
  S5: 'live',
  LIVE: 'live',
  // Finished
  FT: 'finished',
  AW: 'finished',
  // Postponed / cancelled
  POST: 'postponed',
  CANC: 'cancelled',
  SUSP: 'postponed',
  WO: 'finished',
};

function mapStatus(short: string): MatchStatus {
  return STATUS_MAP[short] ?? 'scheduled';
}

function currentSetLabel(
  status: string,
  periods: Array<{ home: number | null; away: number | null }>,
): string | undefined {
  const mapped = mapStatus(status);
  if (mapped !== 'live') return undefined;

  const activeSets = periods.filter(p => p.home !== null || p.away !== null);
  return activeSets.length > 0 ? `Set ${activeSets.length}` : 'Set 1';
}

// ── Adapter ─────────────────────────────────────────────────────────

export class TennisAdapter {
  private client: ApiSportsClient;

  constructor(client: ApiSportsClient) {
    this.client = client;
  }

  async fetchRankings(season: number): Promise<StandingTable> {
    const res = await this.client.request<ApiTennisRanking[]>(
      'tennis',
      '/rankings',
      { season: String(season) },
    );

    const entries: TennisRanking[] = res.response.map(r => ({
      rank: r.position,
      player: {
        id: r.player.id,
        name: r.player.name,
        country: r.player.country?.name,
        image: r.player.image,
      },
      points: r.points,
    }));

    return {
      competitionId: 'atp',
      sport: 'tennis',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchUpcomingGames(count: number): Promise<Match[]> {
    const today = new Date().toISOString().slice(0, 10);
    const res = await this.client.request<ApiTennisGame[]>(
      'tennis',
      '/games',
      { date: today },
    );

    const upcoming = res.response
      .filter(g => mapStatus(g.status.short) === 'scheduled')
      .slice(0, count);

    return upcoming.map(mapGameToMatch);
  }

  async fetchLiveGames(): Promise<Match[]> {
    const res = await this.client.request<ApiTennisGame[]>(
      'tennis',
      '/games',
      { live: 'all' },
    );

    return res.response.map(mapGameToMatch);
  }
}

function mapGameToMatch(game: ApiTennisGame): Match {
  const status = mapStatus(game.status.short);
  return {
    id: `tennis-${game.id}`,
    competitionId: 'atp',
    sport: 'tennis',
    status,
    date: game.date,
    homeTeam: { id: game.players.home.id, name: game.players.home.name },
    awayTeam: { id: game.players.away.id, name: game.players.away.name },
    score: {
      home: game.scores.home,
      away: game.scores.away,
    },
    elapsed: currentSetLabel(game.status.short, game.periods),
    venue: game.tournament.name,
  };
}
