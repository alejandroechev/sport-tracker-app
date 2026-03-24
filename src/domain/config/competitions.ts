import type { Sport, Competition, CompetitionCategory } from '../models';

export const TRACKED_COMPETITIONS: Competition[] = [
  // Football
  { id: 'premier-league', name: 'Premier League', sport: 'football', espnSlug: 'eng.1' },
  { id: 'fa-cup', name: 'FA Cup', sport: 'football', espnSlug: 'eng.fa' },
  { id: 'la-liga', name: 'La Liga', sport: 'football', espnSlug: 'esp.1' },
  { id: 'champions-league', name: 'Champions League', sport: 'football', espnSlug: 'uefa.champions' },
  { id: 'europa-league', name: 'Europa League', sport: 'football', espnSlug: 'uefa.europa' },
  { id: 'world-cup', name: 'FIFA World Cup', sport: 'football', espnSlug: 'fifa.world' },
  // Formula 1
  { id: 'f1', name: 'Formula 1', sport: 'formula1', espnSlug: 'f1' },
  // Tennis
  { id: 'atp', name: 'ATP Tour', sport: 'tennis', espnSlug: 'atp' },
];

export const SPORT_CATEGORIES: CompetitionCategory[] = [
  {
    sport: 'football',
    label: 'Football',
    icon: '⚽',
    competitions: TRACKED_COMPETITIONS.filter(c => c.sport === 'football'),
  },
  {
    sport: 'formula1',
    label: 'Formula 1',
    icon: '🏎️',
    competitions: TRACKED_COMPETITIONS.filter(c => c.sport === 'formula1'),
  },
  {
    sport: 'tennis',
    label: 'Tennis',
    icon: '🎾',
    competitions: TRACKED_COMPETITIONS.filter(c => c.sport === 'tennis'),
  },
];

export function getCompetitionById(id: string): Competition | undefined {
  return TRACKED_COMPETITIONS.find(c => c.id === id);
}

export function getCompetitionsBySport(sport: Sport): Competition[] {
  return TRACKED_COMPETITIONS.filter(c => c.sport === sport);
}
