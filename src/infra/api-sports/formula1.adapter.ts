import type { ApiSportsClient } from './client';
import type {
  Match,
  MatchStatus,
  StandingTable,
  F1DriverStanding,
} from '../../domain/models';

// --- API response shapes ------------------------------------------------

interface ApiDriverRanking {
  position: number;
  driver: { id: number; name: string; number?: number; image?: string };
  team: { id: number; name: string; logo?: string };
  points: number;
  wins: number;
}

interface ApiRace {
  id: number;
  competition: {
    id: number;
    name: string;
    location: { country: string; city: string };
  };
  circuit: { name: string };
  date: string;
  type: string;
  status: string;
  laps: { total: number | null; current: number | null };
}

// --- Helpers -------------------------------------------------------------

function mapRaceStatus(race: ApiRace): MatchStatus {
  const s = race.status?.toLowerCase() ?? '';
  if (s === 'completed') return 'finished';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'postponed') return 'postponed';
  if (
    race.laps.current != null &&
    race.laps.current > 0 &&
    s !== 'completed'
  ) {
    return 'live';
  }
  return 'scheduled';
}

function raceToMatch(race: ApiRace): Match {
  const status = mapRaceStatus(race);
  const isLive = status === 'live';

  return {
    id: `f1-race-${race.id}`,
    competitionId: 'f1',
    sport: 'formula1',
    status,
    date: race.date,
    homeTeam: {
      id: race.competition.id,
      name: race.competition.name,
      logo: undefined,
    },
    awayTeam: {
      id: race.id,
      name: race.circuit.name,
      logo: undefined,
    },
    score: { home: null, away: null },
    elapsed:
      isLive && race.laps.current != null && race.laps.total != null
        ? `Lap ${race.laps.current}/${race.laps.total}`
        : undefined,
    venue: `${race.competition.location.city}, ${race.competition.location.country}`,
    round: race.type,
  };
}

// --- Adapter -------------------------------------------------------------

export class Formula1Adapter {
  private client: ApiSportsClient;

  constructor(client: ApiSportsClient) {
    this.client = client;
  }

  async fetchDriverStandings(season: number): Promise<StandingTable> {
    const res = await this.client.request<ApiDriverRanking[]>(
      'formula1',
      '/rankings/drivers',
      { season: String(season) },
    );

    const entries: F1DriverStanding[] = res.response.map((r) => ({
      rank: r.position,
      driver: {
        id: r.driver.id,
        name: r.driver.name,
        number: r.driver.number,
        image: r.driver.image,
      },
      team: {
        id: r.team.id,
        name: r.team.name,
        logo: r.team.logo,
      },
      points: r.points,
      wins: r.wins,
    }));

    return {
      competitionId: 'f1',
      sport: 'formula1',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchUpcomingRaces(count: number): Promise<Match[]> {
    const res = await this.client.request<ApiRace[]>(
      'formula1',
      '/races',
      { next: String(count) },
    );

    return res.response.map(raceToMatch);
  }

  async fetchLiveRaces(): Promise<Match[]> {
    const season = new Date().getFullYear();
    const res = await this.client.request<ApiRace[]>(
      'formula1',
      '/races',
      { season: String(season), type: 'race' },
    );

    return res.response.map(raceToMatch).filter((m) => m.status === 'live');
  }
}
