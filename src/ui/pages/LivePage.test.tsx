import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UseSportDataReturn } from '../hooks/useSportData';
import type { SportEvent } from '../../domain/models';

const mockRefreshLive = vi.fn().mockResolvedValue(undefined);

const defaultHookReturn: UseSportDataReturn = {
  liveEvents: [],
  loadingLive: false,
  errorLive: null,
  refreshLive: mockRefreshLive,

  standings: null,
  loadingStandings: false,
  errorStandings: null,
  refreshStandings: vi.fn(),

  constructorStandings: null,
  loadingConstructors: false,
  errorConstructors: null,
  refreshConstructorStandings: vi.fn(),

  upcoming: [],
  loadingUpcoming: false,
  errorUpcoming: null,
  refreshUpcoming: vi.fn(),

  liveByCompetition: [],
  loadingLiveByComp: false,
  refreshLiveByCompetition: vi.fn(),

  lastUpdatedLive: null,
  lastUpdatedStandings: null,
  lastUpdatedUpcoming: null,
};

vi.mock('../hooks/useSportData', () => ({
  useSportData: vi.fn(() => defaultHookReturn),
}));

import LivePage from './LivePage';
import { useSportData } from '../hooks/useSportData';

const mockedUseSportData = vi.mocked(useSportData);

function makeLiveEvent(overrides: Partial<SportEvent> & { competitionName: string; id: string }): SportEvent {
  return {
    sport: 'football' as SportEvent['sport'],
    competitionId: 'comp-1',
    status: 'live',
    date: '2025-01-01T15:00:00Z',
    title: 'Team A vs Team B',
    score: '1 - 0',
    elapsed: "67'",
    participants: {
      home: { name: 'Team A' },
      away: { name: 'Team B' },
    },
    ...overrides,
  };
}

describe('LivePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSportData.mockReturnValue({ ...defaultHookReturn });
  });

  it('renders "Live Events" heading', () => {
    render(<LivePage />);
    expect(screen.getByRole('heading', { name: /live events/i })).toBeDefined();
  });

  it('calls refreshLive on mount', () => {
    render(<LivePage />);
    expect(mockRefreshLive).toHaveBeenCalled();
  });

  it('shows events grouped by competition', () => {
    const events: SportEvent[] = [
      makeLiveEvent({
        id: '1',
        competitionName: 'Premier League',
        title: 'Arsenal vs Chelsea',
        score: '2 - 1',
        participants: { home: { name: 'Arsenal' }, away: { name: 'Chelsea' } },
      }),
      makeLiveEvent({
        id: '2',
        competitionName: 'Premier League',
        title: 'Liverpool vs City',
        score: '0 - 0',
        participants: { home: { name: 'Liverpool' }, away: { name: 'City' } },
      }),
      makeLiveEvent({
        id: '3',
        competitionName: 'La Liga',
        title: 'Barcelona vs Madrid',
        score: '1 - 0',
        participants: { home: { name: 'Barcelona' }, away: { name: 'Madrid' } },
      }),
    ];

    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      liveEvents: events,
    });

    render(<LivePage />);

    expect(screen.getByText('Premier League')).toBeDefined();
    expect(screen.getByText('La Liga')).toBeDefined();
    expect(screen.getByText('Arsenal')).toBeDefined();
    expect(screen.getByText('Chelsea')).toBeDefined();
    expect(screen.getByText('Barcelona')).toBeDefined();
    expect(screen.getByText('Madrid')).toBeDefined();
  });

  it('shows empty state when no live events', () => {
    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      liveEvents: [],
      loadingLive: false,
    });

    render(<LivePage />);

    expect(screen.getByText('No live events')).toBeDefined();
    expect(screen.getByText('Check back during match times!')).toBeDefined();
  });

  it('shows loading skeletons', () => {
    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      loadingLive: true,
      liveEvents: [],
    });

    const { container } = render(<LivePage />);
    const skeletons = container.querySelectorAll('.animate-pulse.rounded-xl');
    expect(skeletons.length).toBe(3);
  });

  it('refresh button triggers refreshLive', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn().mockResolvedValue(undefined);

    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      refreshLive: refresh,
    });

    render(<LivePage />);

    // refresh is called on mount; clear to isolate button click
    refresh.mockClear();

    const button = screen.getByRole('button', { name: /refresh/i });
    await user.click(button);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows error state with retry', () => {
    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      errorLive: 'Network error',
    });

    render(<LivePage />);

    expect(screen.getByText('Network error')).toBeDefined();
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });

  it('shows last updated time', () => {
    mockedUseSportData.mockReturnValue({
      ...defaultHookReturn,
      lastUpdatedLive: '2 min ago',
    });

    render(<LivePage />);
    expect(screen.getByText(/2 min ago/)).toBeDefined();
  });
});
