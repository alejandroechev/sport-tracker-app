import type { SportEvent, Match, StandingTable, Competition } from '../models';
import type { SportDataPort } from './sport-data.port';
import { getCompetitionById } from '../config/competitions';

export class SportDataService {
  private port: SportDataPort;

  constructor(port: SportDataPort) {
    this.port = port;
  }

  /** Get all live events across all tracked competitions */
  async getAllLiveEvents(): Promise<SportEvent[]> {
    return this.port.fetchLiveEvents();
  }

  /** Get standings for a specific competition */
  async getStandings(competitionId: string): Promise<StandingTable> {
    return this.port.fetchStandings(competitionId);
  }

  /** Get upcoming matches for a competition */
  async getUpcoming(competitionId: string, count: number = 10): Promise<Match[]> {
    return this.port.fetchUpcoming(competitionId, count);
  }

  /** Get live events for a specific competition */
  async getLiveByCompetition(competitionId: string): Promise<Match[]> {
    return this.port.fetchLiveByCompetition(competitionId);
  }

  /** Get a competition by its ID */
  getCompetition(id: string): Competition | undefined {
    return getCompetitionById(id);
  }
}
