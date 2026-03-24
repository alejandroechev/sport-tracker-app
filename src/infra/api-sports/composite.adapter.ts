import type { SportDataPort } from '../../domain/services/sport-data.port';
import type { SportEvent, Match, StandingTable } from '../../domain/models';
import { TRACKED_COMPETITIONS, getCompetitionById } from '../../domain/config/competitions';
import { ApiSportsClient } from './client';
import { FootballAdapter } from './football.adapter';
import { Formula1Adapter } from './formula1.adapter';

/**
 * The free API-SPORTS plan only covers seasons 2022–2024.
 * Football/F1 "current season" uses the start year (e.g. 2024 = 2024-25 season).
 */
const FREE_PLAN_SEASON = 2024;

/** League IDs we track — used to filter global live feeds. */
const TRACKED_FOOTBALL_LEAGUE_IDS = new Set(
  TRACKED_COMPETITIONS
    .filter(c => c.sport === 'football' && c.apiLeagueId !== null)
    .map(c => c.apiLeagueId!),
);

/**
 * Composite adapter that routes SportDataPort calls to the correct
 * sport-specific adapter based on competition ID.
 *
 * Tennis is excluded: the API-SPORTS tennis endpoint (v1.tennis.api-sports.io)
 * is a separate product with its own key. Tennis competitions fall back to
 * the in-memory stub via the provider.
 */
export class CompositeApiSportsAdapter implements SportDataPort {
  private football: FootballAdapter;
  private formula1: Formula1Adapter;

  constructor(apiKey: string) {
    const client = new ApiSportsClient(apiKey);
    this.football = new FootballAdapter(client);
    this.formula1 = new Formula1Adapter(client);
  }

  async fetchLiveEvents(): Promise<SportEvent[]> {
    const [footballMatches, f1Matches] = await Promise.allSettled([
      this.fetchFilteredFootballLive(),
      this.formula1.fetchLiveRaces(),
    ]);

    const events: SportEvent[] = [];

    if (footballMatches.status === 'fulfilled') {
      events.push(...this.matchesToEvents(footballMatches.value, 'football'));
    }
    if (f1Matches.status === 'fulfilled') {
      events.push(...this.matchesToEvents(f1Matches.value, 'formula1'));
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
        return this.football.fetchStandings(competition.apiLeagueId!, FREE_PLAN_SEASON);
      case 'formula1':
        return this.formula1.fetchDriverStandings(FREE_PLAN_SEASON);
      case 'tennis':
        throw new Error('Tennis data is not available on the current API plan');
    }
  }

  async fetchUpcoming(competitionId: string, count: number = 10): Promise<Match[]> {
    const competition = getCompetitionById(competitionId);
    if (!competition) {
      throw new Error(`Unknown competition: ${competitionId}`);
    }

    switch (competition.sport) {
      case 'football':
        return this.football.fetchUpcoming(competition.apiLeagueId!, FREE_PLAN_SEASON, count);
      case 'formula1':
        return this.formula1.fetchUpcomingRaces(count);
      case 'tennis':
        throw new Error('Tennis data is not available on the current API plan');
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
        throw new Error('Tennis data is not available on the current API plan');
    }
  }

  /**
   * Fetch live football fixtures filtered to only our tracked leagues.
   * The global /fixtures?live=all returns ALL leagues worldwide.
   */
  private async fetchFilteredFootballLive(): Promise<Match[]> {
    const allLive = await this.football.fetchLive();
    return allLive.filter(m =>
      TRACKED_FOOTBALL_LEAGUE_IDS.has(Number(m.competitionId)),
    );
  }

  private matchesToEvents(matches: Match[], sport: 'football' | 'formula1'): SportEvent[] {
    return matches.map(m => {
      const competition = TRACKED_COMPETITIONS.find(
        c => c.sport === sport && c.apiLeagueId?.toString() === m.competitionId,
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
