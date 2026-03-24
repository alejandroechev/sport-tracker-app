export type Sport = 'football' | 'formula1' | 'tennis';

export interface Competition {
  id: string;
  name: string;
  sport: Sport;
  apiLeagueId: number | null;
  season?: number;
  logo?: string;
}

export interface CompetitionCategory {
  sport: Sport;
  label: string;
  icon: string;
  competitions: Competition[];
}
