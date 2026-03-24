import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RefreshButton from './RefreshButton';

describe('RefreshButton', () => {
  it('calls onRefresh when clicked', async () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} isLoading={false} />);

    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('is disabled when loading', () => {
    render(<RefreshButton onRefresh={vi.fn()} isLoading={true} />);

    expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled();
  });

  it('shows last updated text when provided', () => {
    render(
      <RefreshButton
        onRefresh={vi.fn()}
        isLoading={false}
        lastUpdated="2 min ago"
      />,
    );

    expect(screen.getByText(/last updated: 2 min ago/i)).toBeInTheDocument();
  });

  it('hides last updated text when not provided', () => {
    render(<RefreshButton onRefresh={vi.fn()} isLoading={false} />);

    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
  });
});
