import type { SportDataPort } from '../../domain/services/sport-data.port';
import type { SportEvent, Match, StandingTable } from '../../domain/models';
import {
  getAllStubLiveEvents,
  getStubMatches,
  getStubStandings,
} from './stub-data';

export class InMemoryStubAdapter implements SportDataPort {
  async fetchLiveEvents(): Promise<SportEvent[]> {
    return getAllStubLiveEvents();
  }

  async fetchStandings(competitionId: string): Promise<StandingTable> {
    return getStubStandings(competitionId);
  }

  async fetchUpcoming(competitionId: string, count?: number): Promise<Match[]> {
    const matches = getStubMatches(competitionId).filter(
      m => m.status === 'scheduled',
    );
    return count != null ? matches.slice(0, count) : matches;
  }

  async fetchLiveByCompetition(competitionId: string): Promise<Match[]> {
    return getStubMatches(competitionId).filter(m => m.status === 'live');
  }
}
