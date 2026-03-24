import type { Sport } from './competition';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
}

export interface Match {
  id: string;
  competitionId: string;
  sport: Sport;
  status: MatchStatus;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  elapsed?: number | string;
  venue?: string;
  round?: string;
}
