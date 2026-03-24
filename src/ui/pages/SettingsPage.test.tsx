import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders section headings', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Data Source')).toBeDefined();
    expect(screen.getByText('Tracked Competitions')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
  });

  it('shows ESPN live data as default mode', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Using ESPN live data')).toBeDefined();
  });

  it('toggles to stub data mode on switch click', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(screen.getByText('Using stub data (offline)')).toBeDefined();
    expect(localStorage.getItem('sport-tracker-use-stub')).toBe('true');
  });

  it('loads stub mode from localStorage', () => {
    localStorage.setItem('sport-tracker-use-stub', 'true');
    render(<SettingsPage />);

    expect(screen.getByText('Using stub data (offline)')).toBeDefined();
  });

  it('renders tracked competitions', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Premier League')).toBeDefined();
    expect(screen.getByText('Formula 1')).toBeDefined();
    expect(screen.getByText('ATP Tour')).toBeDefined();
  });

  it('renders about section with version', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Version 1.0.0')).toBeDefined();
    expect(screen.getByText('GitHub Repository')).toBeDefined();
  });
});
