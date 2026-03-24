import type { SportDataPort } from '../../domain/services/sport-data.port';
import type { SportEvent, Match, StandingTable } from '../../domain/models';
import { TRACKED_COMPETITIONS, getCompetitionById } from '../../domain/config/competitions';
import { EspnClient } from './client';
import { EspnFootballAdapter } from './football.adapter';
import { EspnF1Adapter } from './f1.adapter';
import { EspnTennisAdapter } from './tennis.adapter';

/**
 * ESPN-backed composite adapter that routes SportDataPort calls to the
 * correct sport-specific ESPN adapter based on competition config.
 *
 * ESPN provides free access with no API key to current-season data
 * for all tracked competitions.
 */
export class EspnCompositeAdapter implements SportDataPort {
  private football: EspnFootballAdapter;
  private f1: EspnF1Adapter;
  private tennis: EspnTennisAdapter;

  constructor(client?: EspnClient) {
    const espnClient = client ?? new EspnClient();
    this.football = new EspnFootballAdapter(espnClient);
    this.f1 = new EspnF1Adapter(espnClient);
    this.tennis = new EspnTennisAdapter(espnClient);
  }

  async fetchLiveEvents(): Promise<SportEvent[]> {
    const footballComps = TRACKED_COMPETITIONS.filter(c => c.sport === 'football');

    const results = await Promise.allSettled([
      ...footballComps.map(c =>
        this.football.fetchLiveMatches(c.espnSlug, c.id).then(matches =>
          matches.map(m => this.matchToEvent(m, c.name)),
        ),
      ),
      this.f1.fetchLiveRaces().then(matches =>
        matches.map(m => this.matchToEvent(m, 'Formula 1')),
      ),
      this.tennis.fetchLiveMatches().then(matches =>
        matches.map(m => this.matchToEvent(m, 'ATP Tour')),
      ),
    ]);

    const events: SportEvent[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        events.push(...result.value);
      }
    }

    return events;
  }

  async fetchStandings(competitionId: string): Promise<StandingTable> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchStandings(competition.espnSlug, competitionId);
      case 'formula1':
        return this.f1.fetchDriverStandings();
      case 'tennis':
        return this.tennis.fetchRankings();
    }
  }

  async fetchUpcoming(competitionId: string, count: number = 10): Promise<Match[]> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchUpcomingMatches(competition.espnSlug, competitionId, count);
      case 'formula1':
        return this.f1.fetchUpcomingRaces(count);
      case 'tennis':
        return this.tennis.fetchUpcomingMatches(count);
    }
  }

  async fetchLiveByCompetition(competitionId: string): Promise<Match[]> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchLiveMatches(competition.espnSlug, competitionId);
      case 'formula1':
        return this.f1.fetchLiveRaces();
      case 'tennis':
        return this.tennis.fetchLiveMatches();
    }
  }

  private matchToEvent(match: Match, competitionName: string): SportEvent {
    return {
      id: match.id,
      competitionId: match.competitionId,
      competitionName,
      sport: match.sport,
      status: match.status,
      date: match.date,
      title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      subtitle: match.round,
      score:
        match.score.home != null && match.score.away != null
          ? `${match.score.home} - ${match.score.away}`
          : undefined,
      elapsed: match.elapsed?.toString(),
      participants: {
        home: { name: match.homeTeam.name, logo: match.homeTeam.logo },
        away: { name: match.awayTeam.name, logo: match.awayTeam.logo },
      },
    };
  }
}
