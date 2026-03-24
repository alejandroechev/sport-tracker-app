import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import StandingTable from './StandingTable';
import type {
  StandingTable as StandingTableType,
  FootballStandingEntry,
  F1DriverStanding,
  TennisRanking,
} from '../../domain/models';

const footballStandings: StandingTableType = {
  competitionId: 'pl-2024',
  sport: 'football',
  season: 2024,
  lastUpdated: '2024-12-01T12:00:00Z',
  entries: [
    {
      rank: 1,
      team: { id: 1, name: 'Liverpool', logo: 'https://example.com/liv.png' },
      points: 45,
      played: 18,
      won: 14,
      drawn: 3,
      lost: 1,
      goalsFor: 42,
      goalsAgainst: 15,
      goalDifference: 27,
    },
    {
      rank: 2,
      team: { id: 2, name: 'Arsenal' },
      points: 40,
      played: 18,
      won: 12,
      drawn: 4,
      lost: 2,
      goalsFor: 35,
      goalsAgainst: 18,
      goalDifference: 17,
    },
    {
      rank: 5,
      team: { id: 5, name: 'Brighton' },
      points: 28,
      played: 18,
      won: 8,
      drawn: 4,
      lost: 6,
      goalsFor: 25,
      goalsAgainst: 22,
      goalDifference: 3,
    },
  ] satisfies FootballStandingEntry[],
};

const f1Standings: StandingTableType = {
  competitionId: 'f1-2024',
  sport: 'formula1',
  season: 2024,
  lastUpdated: '2024-12-01T12:00:00Z',
  entries: [
    {
      rank: 1,
      driver: { id: 1, name: 'Max Verstappen', number: 1 },
      team: { id: 1, name: 'Red Bull Racing', logo: 'https://example.com/rb.png' },
      points: 400,
      wins: 15,
    },
    {
      rank: 2,
      driver: { id: 2, name: 'Lando Norris' },
      team: { id: 2, name: 'McLaren' },
      points: 340,
      wins: 4,
    },
  ] satisfies F1DriverStanding[],
};

const tennisStandings: StandingTableType = {
  competitionId: 'atp-2024',
  sport: 'tennis',
  season: 2024,
  lastUpdated: '2024-12-01T12:00:00Z',
  entries: [
    {
      rank: 1,
      player: { id: 1, name: 'Jannik Sinner', country: 'Italy' },
      points: 11830,
    },
    {
      rank: 2,
      player: { id: 2, name: 'Carlos Alcaraz', country: 'Spain' },
      points: 9010,
    },
  ] satisfies TennisRanking[],
};

describe('StandingTable', () => {
  describe('Football standings', () => {
    it('renders correct column headers', () => {
      render(<StandingTable standings={footballStandings} />);

      expect(screen.getByText('#')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('GD')).toBeInTheDocument();
      expect(screen.getByText('Pts')).toBeInTheDocument();
    });

    it('renders team names and stats', () => {
      render(<StandingTable standings={footballStandings} />);

      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
      expect(screen.getByText('+27')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('highlights top 4 positions with border', () => {
      const { container } = render(<StandingTable standings={footballStandings} />);

      const rows = container.querySelectorAll('tbody tr');
      // Rank 1 and 2 are top 4
      expect(rows[0].className).toContain('border-l-blue-500');
      expect(rows[1].className).toContain('border-l-blue-500');
      // Rank 5 is not top 4
      expect(rows[2].className).not.toContain('border-l-blue-500');
    });

    it('formats positive goal difference with + prefix', () => {
      render(<StandingTable standings={footballStandings} />);
      expect(screen.getByText('+27')).toBeInTheDocument();
      expect(screen.getByText('+17')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
    });
  });

  describe('F1 standings', () => {
    it('renders correct column headers', () => {
      render(<StandingTable standings={f1Standings} />);

      expect(screen.getByText('#')).toBeInTheDocument();
      expect(screen.getByText('Driver')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Wins')).toBeInTheDocument();
      expect(screen.getByText('Pts')).toBeInTheDocument();
    });

    it('renders driver and team info', () => {
      render(<StandingTable standings={f1Standings} />);

      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
      expect(screen.getByText('Lando Norris')).toBeInTheDocument();
      expect(screen.getByText('McLaren')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('highlights top 3 positions', () => {
      const { container } = render(<StandingTable standings={f1Standings} />);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0].className).toContain('border-l-yellow-500');
      expect(rows[1].className).toContain('border-l-yellow-500');
    });
  });

  describe('Tennis rankings', () => {
    it('renders correct column headers', () => {
      render(<StandingTable standings={tennisStandings} />);

      expect(screen.getByText('#')).toBeInTheDocument();
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Pts')).toBeInTheDocument();
    });

    it('renders player info', () => {
      render(<StandingTable standings={tennisStandings} />);

      expect(screen.getByText('Jannik Sinner')).toBeInTheDocument();
      expect(screen.getByText('Italy')).toBeInTheDocument();
      expect(screen.getByText('Carlos Alcaraz')).toBeInTheDocument();
      expect(screen.getByText('Spain')).toBeInTheDocument();
      expect(screen.getByText('11830')).toBeInTheDocument();
    });
  });

  it('shows empty state when no entries', () => {
    const empty: StandingTableType = {
      competitionId: 'empty',
      sport: 'football',
      season: 2024,
      lastUpdated: '2024-12-01T12:00:00Z',
      entries: [],
    };
    render(<StandingTable standings={empty} />);
    expect(screen.getByText('No standings available')).toBeInTheDocument();
  });
});
