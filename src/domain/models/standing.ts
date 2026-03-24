import type { Sport } from './competition';
import type { Team } from './match';

export interface FootballStandingEntry {
  rank: number;
  team: Team;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

export interface F1DriverStanding {
  rank: number;
  driver: {
    id: number;
    name: string;
    number?: number;
    image?: string;
  };
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  points: number;
  wins: number;
}

export interface F1ConstructorStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    color?: string;
  };
  points: number;
}

export interface TennisRanking {
  rank: number;
  player: {
    id: number;
    name: string;
    country?: string;
    image?: string;
  };
  points: number;
}

export type StandingEntry = FootballStandingEntry | F1DriverStanding | F1ConstructorStanding | TennisRanking;

export interface StandingTable {
  competitionId: string;
  sport: Sport;
  season: number;
  entries: StandingEntry[];
  lastUpdated: string;
}
