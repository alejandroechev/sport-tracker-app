import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title and default icon', () => {
    render(<EmptyState title="No matches found" />);
    expect(screen.getByText('No matches found')).toBeInTheDocument();
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<EmptyState icon="⚽" title="No games today" />);
    expect(screen.getByText('⚽')).toBeInTheDocument();
    expect(screen.getByText('No games today')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No data"
        description="Check back later for updates"
      />,
    );
    expect(
      screen.getByText('Check back later for updates'),
    ).toBeInTheDocument();
  });

  it('hides description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });
});
