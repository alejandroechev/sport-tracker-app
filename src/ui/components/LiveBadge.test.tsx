import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import LiveBadge from './LiveBadge';

describe('LiveBadge', () => {
  it('renders "LIVE" text with a pulsing dot', () => {
    render(<LiveBadge />);
    expect(screen.getByText(/live/i)).toBeInTheDocument();
    const dots = document.querySelectorAll('.animate-pulse');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('shows elapsed time when provided', () => {
    render(<LiveBadge elapsed="67'" />);
    expect(screen.getByText("67'")).toBeInTheDocument();
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });

  it('compact mode hides text and only shows the dot', () => {
    render(<LiveBadge compact />);
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();
    const dot = document.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });
});
