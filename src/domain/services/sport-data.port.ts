import type { SportEvent, Match, StandingTable } from '../models';

export interface SportDataPort {
  /** Fetch all currently live events across all tracked competitions */
  fetchLiveEvents(): Promise<SportEvent[]>;

  /** Fetch standings/rankings for a specific competition */
  fetchStandings(competitionId: string): Promise<StandingTable>;

  /** Fetch F1 constructor standings (only for F1) */
  fetchConstructorStandings?(): Promise<StandingTable>;

  /** Fetch upcoming matches/events for a specific competition */
  fetchUpcoming(competitionId: string, count?: number): Promise<Match[]>;

  /** Fetch live events for a specific competition */
  fetchLiveByCompetition(competitionId: string): Promise<Match[]>;
}
