import type { Sport } from './competition';
import type { MatchStatus } from './match';

export interface SportEvent {
  id: string;
  competitionId: string;
  competitionName: string;
  sport: Sport;
  status: MatchStatus;
  date: string;
  title: string;
  subtitle?: string;
  score?: string;
  elapsed?: string;
  participants: {
    home?: { name: string; logo?: string };
    away?: { name: string; logo?: string };
  };
}
