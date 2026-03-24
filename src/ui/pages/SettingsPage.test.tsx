import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the API key input', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/api-sports key/i)).toBeDefined();
  });

  it('renders section headings', () => {
    render(<SettingsPage />);
    expect(screen.getByText('API Configuration')).toBeDefined();
    expect(screen.getByText('Tracked Competitions')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
  });

  it('shows "No key set" when no key is stored', () => {
    render(<SettingsPage />);
    expect(screen.getByText('No key set')).toBeDefined();
  });

  it('saves key to localStorage on Save click', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const input = screen.getByLabelText(/api-sports key/i);
    await user.type(input, 'my-test-key');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(localStorage.getItem('sport-tracker-api-key')).toBe('my-test-key');
  });

  it('loads existing key from localStorage', () => {
    localStorage.setItem('sport-tracker-api-key', 'stored-key');
    render(<SettingsPage />);

    const input = screen.getByLabelText(/api-sports key/i) as HTMLInputElement;
    expect(input.value).toBe('stored-key');
    expect(screen.getByText('Key configured ✓')).toBeDefined();
  });

  it('toggles key visibility with show/hide button', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const input = screen.getByLabelText(/api-sports key/i);
    expect(input.getAttribute('type')).toBe('password');

    await user.click(screen.getByRole('button', { name: /show api key/i }));
    expect(input.getAttribute('type')).toBe('text');

    await user.click(screen.getByRole('button', { name: /hide api key/i }));
    expect(input.getAttribute('type')).toBe('password');
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
