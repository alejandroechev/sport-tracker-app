import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MatchCard } from './MatchCard';
import type { Match } from '../../domain/models';

function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '1',
    competitionId: 'pl',
    sport: 'football',
    status: 'finished',
    date: '2025-01-15T15:00:00Z',
    homeTeam: { id: 1, name: 'Arsenal' },
    awayTeam: { id: 2, name: 'Chelsea' },
    score: { home: 2, away: 1 },
    round: 'Round 25',
    ...overrides,
  };
}

describe('MatchCard', () => {
  it('renders home and away team names', () => {
    render(<MatchCard match={buildMatch()} />);
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
  });

  it('displays the correct score', () => {
    render(<MatchCard match={buildMatch()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows FT for finished matches', () => {
    render(<MatchCard match={buildMatch({ status: 'finished' })} />);
    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('shows elapsed time for live matches', () => {
    render(
      <MatchCard match={buildMatch({ status: 'live', elapsed: 67 })} />,
    );
    expect(screen.getByTestId('elapsed')).toHaveTextContent("67'");
  });

  it('shows formatted date for scheduled matches', () => {
    render(
      <MatchCard
        match={buildMatch({
          status: 'scheduled',
          score: { home: null, away: null },
        })}
      />,
    );
    expect(screen.getByTestId('scheduled-date')).toBeInTheDocument();
    expect(screen.getByTestId('scheduled-date').textContent).toBeTruthy();
  });

  it('shows PPD for postponed matches', () => {
    render(<MatchCard match={buildMatch({ status: 'postponed' })} />);
    expect(screen.getByText('PPD')).toBeInTheDocument();
  });

  it('shows CAN for cancelled matches', () => {
    render(<MatchCard match={buildMatch({ status: 'cancelled' })} />);
    expect(screen.getByText('CAN')).toBeInTheDocument();
  });

  it('renders team logos when available', () => {
    render(
      <MatchCard
        match={buildMatch({
          homeTeam: { id: 1, name: 'Arsenal', logo: '/arsenal.png' },
        })}
      />,
    );
    expect(screen.getByAltText('Arsenal logo')).toBeInTheDocument();
  });

  it('renders round info when present', () => {
    render(<MatchCard match={buildMatch({ round: 'Round 25' })} />);
    expect(screen.getByText('Round 25')).toBeInTheDocument();
  });

  it('shows dash for null scores in scheduled matches', () => {
    render(
      <MatchCard
        match={buildMatch({
          status: 'scheduled',
          score: { home: null, away: null },
        })}
      />,
    );
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(2);
  });
});
