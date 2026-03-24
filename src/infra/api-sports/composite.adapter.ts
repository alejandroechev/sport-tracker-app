import type { SportDataPort } from '../../domain/services/sport-data.port';
import type { SportEvent, Match, StandingTable } from '../../domain/models';
import { TRACKED_COMPETITIONS, getCompetitionById } from '../../domain/config/competitions';
import { ApiSportsClient } from './client';
import { FootballAdapter } from './football.adapter';
import { Formula1Adapter } from './formula1.adapter';
import { TennisAdapter } from './tennis.adapter';

const CURRENT_SEASON = new Date().getFullYear();

/**
 * Composite adapter that routes SportDataPort calls to the correct
 * sport-specific adapter based on competition ID.
 */
export class CompositeApiSportsAdapter implements SportDataPort {
  private football: FootballAdapter;
  private formula1: Formula1Adapter;
  private tennis: TennisAdapter;

  constructor(apiKey: string) {
    const client = new ApiSportsClient(apiKey);
    this.football = new FootballAdapter(client);
    this.formula1 = new Formula1Adapter(client);
    this.tennis = new TennisAdapter(client);
  }

  async fetchLiveEvents(): Promise<SportEvent[]> {
    const [footballMatches, f1Matches, tennisMatches] = await Promise.allSettled([
      this.football.fetchLive(),
      this.formula1.fetchLiveRaces(),
      this.tennis.fetchLiveGames(),
    ]);

    const events: SportEvent[] = [];

    if (footballMatches.status === 'fulfilled') {
      events.push(...this.matchesToEvents(footballMatches.value, 'football'));
    }
    if (f1Matches.status === 'fulfilled') {
      events.push(...this.matchesToEvents(f1Matches.value, 'formula1'));
    }
    if (tennisMatches.status === 'fulfilled') {
      events.push(...this.matchesToEvents(tennisMatches.value, 'tennis'));
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
        return this.football.fetchStandings(competition.apiLeagueId!, CURRENT_SEASON);
      case 'formula1':
        return this.formula1.fetchDriverStandings(CURRENT_SEASON);
      case 'tennis':
        return this.tennis.fetchRankings(CURRENT_SEASON);
    }
  }

  async fetchUpcoming(competitionId: string, count: number = 10): Promise<Match[]> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchUpcoming(competition.apiLeagueId!, CURRENT_SEASON, count);
      case 'formula1':
        return this.formula1.fetchUpcomingRaces(count);
      case 'tennis':
        return this.tennis.fetchUpcomingGames(count);
    }
  }

  async fetchLiveByCompetition(competitionId: string): Promise<Match[]> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchLiveByLeague(competition.apiLeagueId!);
      case 'formula1':
        return this.formula1.fetchLiveRaces();
      case 'tennis':
        return this.tennis.fetchLiveGames();
    }
  }

  private matchesToEvents(matches: Match[], sport: 'football' | 'formula1' | 'tennis'): SportEvent[] {
    return matches.map(m => {
      const competition = TRACKED_COMPETITIONS.find(
        c => c.sport === sport && (c.apiLeagueId?.toString() === m.competitionId || c.id === m.competitionId),
      );
      return {
        id: m.id,
        competitionId: competition?.id ?? m.competitionId,
        competitionName: competition?.name ?? m.competitionId,
        sport,
        status: m.status,
        date: m.date,
        title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        subtitle: m.round,
        score: m.score.home !== null && m.score.away !== null
          ? `${m.score.home} - ${m.score.away}`
          : undefined,
        elapsed: m.elapsed?.toString(),
        participants: {
          home: { name: m.homeTeam.name, logo: m.homeTeam.logo },
          away: { name: m.awayTeam.name, logo: m.awayTeam.logo },
        },
      };
    });
  }
}
