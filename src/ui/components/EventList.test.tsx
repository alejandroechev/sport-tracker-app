import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { SportEvent } from '../../domain/models/event';
import EventList from './EventList';

const sampleEvents: SportEvent[] = [
  {
    id: '1',
    competitionId: 'c1',
    competitionName: 'Premier League',
    sport: 'football',
    status: 'live',
    date: '2025-01-01',
    title: 'Arsenal vs Chelsea',
    score: '2 - 1',
    participants: {
      home: { name: 'Arsenal' },
      away: { name: 'Chelsea' },
    },
  },
  {
    id: '2',
    competitionId: 'c2',
    competitionName: 'La Liga',
    sport: 'football',
    status: 'finished',
    date: '2025-01-01',
    title: 'Barcelona vs Real Madrid',
    score: '3 - 3',
    participants: {
      home: { name: 'Barcelona' },
      away: { name: 'Real Madrid' },
    },
  },
];

describe('EventList', () => {
  it('renders events with competition name, title, and score', () => {
    render(
      <EventList
        events={sampleEvents}
        isLoading={false}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText('Premier League')).toBeInTheDocument();
    expect(screen.getByText('Arsenal vs Chelsea')).toBeInTheDocument();
    expect(screen.getByText('2 - 1')).toBeInTheDocument();

    expect(screen.getByText('La Liga')).toBeInTheDocument();
    expect(screen.getByText('Barcelona vs Real Madrid')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(
      <EventList
        events={[]}
        isLoading={false}
        onRefresh={vi.fn()}
        emptyMessage="Nothing here"
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows default empty message', () => {
    render(
      <EventList events={[]} isLoading={false} onRefresh={vi.fn()} />,
    );

    expect(screen.getByText('No events to show')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading with no events', () => {
    const { container } = render(
      <EventList events={[]} isLoading={true} onRefresh={vi.fn()} />,
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('shows events (not skeletons) when loading with existing events', () => {
    const { container } = render(
      <EventList events={sampleEvents} isLoading={true} onRefresh={vi.fn()} />,
    );

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0);
    expect(screen.getByText('Arsenal vs Chelsea')).toBeInTheDocument();
  });

  it('displays event status', () => {
    render(
      <EventList
        events={sampleEvents}
        isLoading={false}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText(/live/i)).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });
});
