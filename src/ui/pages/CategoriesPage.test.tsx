import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CategoriesPage from './CategoriesPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sports']}>
      <CategoriesPage />
    </MemoryRouter>,
  );
}

describe('CategoriesPage', () => {
  it('renders all 3 sport categories', () => {
    renderPage();
    expect(screen.getByText('Football')).toBeDefined();
    expect(screen.getByText('Formula 1')).toBeDefined();
    expect(screen.getByText('Tennis')).toBeDefined();
  });

  it('shows category icons', () => {
    renderPage();
    expect(screen.getByLabelText('Football').textContent).toBe('⚽');
    expect(screen.getByLabelText('Formula 1').textContent).toBe('🏎️');
    expect(screen.getByLabelText('Tennis').textContent).toBe('🎾');
  });

  it('shows competition count per category', () => {
    renderPage();
    expect(screen.getByText('6 competitions')).toBeDefined();
    const singles = screen.getAllByText('1 competition');
    expect(singles).toHaveLength(2); // Formula 1 and Tennis
  });

  it('expands category to show competitions on click', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.queryByText('Premier League')).toBeNull();

    const footballBtn = screen.getByRole('button', { name: /football/i });
    await user.click(footballBtn);

    expect(screen.getByText('Premier League')).toBeDefined();
    expect(screen.getByText('FA Cup')).toBeDefined();
    expect(screen.getByText('La Liga')).toBeDefined();
    expect(screen.getByText('Champions League')).toBeDefined();
    expect(screen.getByText('Europa League')).toBeDefined();
    expect(screen.getByText('FIFA World Cup')).toBeDefined();
  });

  it('competition links navigate to correct routes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /football/i }));

    const plLink = screen.getByRole('link', { name: /premier league/i });
    expect(plLink.getAttribute('href')).toBe('/sports/premier-league');

    const clLink = screen.getByRole('link', { name: /champions league/i });
    expect(clLink.getAttribute('href')).toBe('/sports/champions-league');
  });

  it('collapses category on second click', async () => {
    const user = userEvent.setup();
    renderPage();

    const btn = screen.getByRole('button', { name: /tennis/i });
    await user.click(btn);
    expect(screen.getByText('ATP Tour')).toBeDefined();

    await user.click(btn);
    expect(screen.queryByText('ATP Tour')).toBeNull();
  });

  it('sets aria-expanded correctly', async () => {
    const user = userEvent.setup();
    renderPage();

    const btn = screen.getByRole('button', { name: /formula 1/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    await user.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});
