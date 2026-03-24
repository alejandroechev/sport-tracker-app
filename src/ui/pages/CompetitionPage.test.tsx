import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Match, StandingTable } from '../../domain/models';
import CompetitionPage from './CompetitionPage';

/* ── Mock useSportData ── */

const mockRefreshStandings = vi.fn();
const mockRefreshUpcoming = vi.fn();
const mockRefreshLiveByCompetition = vi.fn();

const defaultHookReturn = {
  liveEvents: [],
  loadingLive: false,
  errorLive: null,
  refreshLive: vi.fn(),

  standings: null as StandingTable | null,
  loadingStandings: false,
  errorStandings: null as string | null,
  refreshStandings: mockRefreshStandings,
  lastUpdatedStandings: null as string | null,

  upcoming: [] as Match[],
  loadingUpcoming: false,
  errorUpcoming: null as string | null,
  refreshUpcoming: mockRefreshUpcoming,
  lastUpdatedUpcoming: null as string | null,

  liveByCompetition: [] as Match[],
  loadingLiveByComp: false,
  refreshLiveByCompetition: mockRefreshLiveByCompetition,

  lastUpdatedLive: null,
};

let hookOverrides: Partial<typeof defaultHookReturn> = {};

vi.mock('../hooks/useSportData', () => ({
  useSportData: () => ({ ...defaultHookReturn, ...hookOverrides }),
}));

/* ── Helpers ── */

function renderPage(competitionId = 'premier-league') {
  return render(
    <MemoryRouter initialEntries={[`/sports/${competitionId}`]}>
      <Routes>
        <Route
          path="/sports/:competitionId"
          element={<CompetitionPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    competitionId: 'premier-league',
    sport: 'football',
    status: 'scheduled',
    date: '2025-03-15T15:00:00Z',
    homeTeam: { id: 1, name: 'Arsenal' },
    awayTeam: { id: 2, name: 'Chelsea' },
    score: { home: null, away: null },
    ...overrides,
  };
}

/* ── Tests ── */

describe('CompetitionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookOverrides = {};
  });

  it('renders competition name from config', () => {
    renderPage('premier-league');
    expect(screen.getByText('Premier League')).toBeInTheDocument();
  });

  it('shows back link to /sports', () => {
    renderPage();
    const backLink = screen.getByText('← Back');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/sports');
  });

  it('shows 404 for unknown competition', () => {
    renderPage('unknown-id-xyz');
    expect(screen.getByText('Competition not found')).toBeInTheDocument();
    expect(screen.getByText(/unknown-id-xyz/)).toBeInTheDocument();
  });

  it('shows standings tab by default', () => {
    renderPage();
    // Standings button should be visually active (white bg via class check)
    const standingsBtn = screen.getByRole('button', { name: 'Standings' });
    expect(standingsBtn.className).toContain('bg-white');
  });

  it('fetches standings on initial render', () => {
    renderPage();
    expect(mockRefreshStandings).toHaveBeenCalledWith('premier-league');
  });

  it('switches to Upcoming tab and fetches data', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Upcoming' }));

    expect(mockRefreshUpcoming).toHaveBeenCalledWith('premier-league');
  });

  it('switches to Live tab and fetches data', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Live' }));

    expect(mockRefreshLiveByCompetition).toHaveBeenCalledWith(
      'premier-league',
    );
  });

  it('displays standings table when data is available', () => {
    hookOverrides = {
      standings: {
        competitionId: 'premier-league',
        sport: 'football',
        season: 2024,
        entries: [
          {
            rank: 1,
            team: { id: 1, name: 'Arsenal' },
            points: 50,
            played: 20,
            won: 16,
            drawn: 2,
            lost: 2,
            goalsFor: 45,
            goalsAgainst: 15,
            goalDifference: 30,
          },
        ],
        lastUpdated: '2025-01-01T00:00:00Z',
      },
    };

    renderPage();
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
  });

  it('shows upcoming matches on Upcoming tab', async () => {
    hookOverrides = {
      upcoming: [
        buildMatch({ id: 'u1', homeTeam: { id: 3, name: 'Liverpool' } }),
        buildMatch({ id: 'u2', homeTeam: { id: 4, name: 'Man City' } }),
      ],
    };

    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Upcoming' }));

    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Man City')).toBeInTheDocument();
  });

  it('shows empty state on Live tab when no live matches', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Live' }));

    expect(
      screen.getByText('No live matches right now'),
    ).toBeInTheDocument();
  });

  it('shows live matches on Live tab', async () => {
    hookOverrides = {
      liveByCompetition: [
        buildMatch({
          id: 'l1',
          status: 'live',
          homeTeam: { id: 5, name: 'Spurs' },
          awayTeam: { id: 6, name: 'West Ham' },
          score: { home: 2, away: 1 },
          elapsed: 65,
        }),
      ],
    };

    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Live' }));

    expect(screen.getByText('Spurs')).toBeInTheDocument();
    expect(screen.getByText('West Ham')).toBeInTheDocument();
  });

  it('does not re-fetch when returning to an already-fetched tab', async () => {
    renderPage();
    const user = userEvent.setup();

    // Switch to Upcoming then back to Standings
    await user.click(screen.getByRole('button', { name: 'Upcoming' }));
    await user.click(screen.getByRole('button', { name: 'Standings' }));

    // Standings should have been fetched only once
    expect(mockRefreshStandings).toHaveBeenCalledTimes(1);
  });
});
