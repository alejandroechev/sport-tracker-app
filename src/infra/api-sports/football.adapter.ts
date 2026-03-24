import type { ApiSportsClient } from './client';
import type { Match, MatchStatus, Team, StandingTable, FootballStandingEntry } from '../../domain/models';

// API-SPORTS response types for football endpoints

interface ApiTeam {
  id: number;
  name: string;
  logo?: string;
}

interface ApiFixtureStatus {
  short: string;
  elapsed: number | null;
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: ApiFixtureStatus;
  };
  league: {
    id: number;
    name: string;
    round?: string;
  };
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiStandingEntry {
  rank: number;
  team: ApiTeam;
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  form?: string;
}

interface ApiStandingsResponse {
  league: {
    id: number;
    name: string;
    standings: ApiStandingEntry[][];
  };
}

const STATUS_MAP: Record<string, MatchStatus> = {
  // Scheduled
  TBD: 'scheduled',
  NS: 'scheduled',
  // Live
  '1H': 'live',
  HT: 'live',
  '2H': 'live',
  ET: 'live',
  BT: 'live',
  P: 'live',
  INT: 'live',
  LIVE: 'live',
  // Finished
  FT: 'finished',
  AET: 'finished',
  PEN: 'finished',
  // Postponed
  PST: 'postponed',
  SUSP: 'postponed',
  // Cancelled
  CANC: 'cancelled',
  ABD: 'cancelled',
  AWD: 'finished',
  WO: 'finished',
};

export class FootballAdapter {
  private client: ApiSportsClient;

  constructor(client: ApiSportsClient) {
    this.client = client;
  }

  async fetchStandings(leagueId: number, season: number): Promise<StandingTable> {
    const { response } = await this.client.request<ApiStandingsResponse[]>(
      'football',
      '/standings',
      { league: String(leagueId), season: String(season) },
    );

    const entries: FootballStandingEntry[] =
      response.length > 0 && response[0].league.standings.length > 0
        ? response[0].league.standings[0].map(this.mapToStandingEntry)
        : [];

    return {
      competitionId: '', // caller sets this based on leagueId lookup
      sport: 'football',
      season,
      entries,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchUpcoming(leagueId: number, season: number, count: number): Promise<Match[]> {
    const { response } = await this.client.request<ApiFixture[]>(
      'football',
      '/fixtures',
      { league: String(leagueId), season: String(season), next: String(count) },
    );

    return response.map((f) => this.mapFixtureToMatch(f));
  }

  async fetchLive(): Promise<Match[]> {
    const { response } = await this.client.request<ApiFixture[]>(
      'football',
      '/fixtures',
      { live: 'all' },
    );

    return response.map((f) => this.mapFixtureToMatch(f));
  }

  async fetchLiveByLeague(leagueId: number): Promise<Match[]> {
    const { response } = await this.client.request<ApiFixture[]>(
      'football',
      '/fixtures',
      { live: 'all', league: String(leagueId) },
    );

    return response.map((f) => this.mapFixtureToMatch(f));
  }

  // --- Private mappers ---

  private mapFixtureToMatch(fixture: ApiFixture): Match {
    const status = this.mapApiStatus(fixture.fixture.status.short);
    return {
      id: String(fixture.fixture.id),
      competitionId: String(fixture.league.id),
      sport: 'football',
      status,
      date: fixture.fixture.date,
      homeTeam: this.mapTeam(fixture.teams.home),
      awayTeam: this.mapTeam(fixture.teams.away),
      score: {
        home: fixture.goals.home,
        away: fixture.goals.away,
      },
      elapsed: status === 'live' ? (fixture.fixture.status.elapsed ?? undefined) : undefined,
      round: fixture.league.round,
    };
  }

  private mapTeam(apiTeam: ApiTeam): Team {
    return {
      id: apiTeam.id,
      name: apiTeam.name,
      logo: apiTeam.logo,
    };
  }

  private mapToStandingEntry = (entry: ApiStandingEntry): FootballStandingEntry => ({
    rank: entry.rank,
    team: {
      id: entry.team.id,
      name: entry.team.name,
      logo: entry.team.logo,
    },
    points: entry.points,
    played: entry.all.played,
    won: entry.all.win,
    drawn: entry.all.draw,
    lost: entry.all.lose,
    goalsFor: entry.all.goals.for,
    goalsAgainst: entry.all.goals.against,
    goalDifference: entry.all.goals.for - entry.all.goals.against,
    form: entry.form,
  });

  private mapApiStatus(shortStatus: string): MatchStatus {
    return STATUS_MAP[shortStatus] ?? 'scheduled';
  }
}
