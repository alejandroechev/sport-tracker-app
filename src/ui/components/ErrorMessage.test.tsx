import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error variant by default', () => {
    render(<ErrorMessage message="Something broke" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders warning variant', () => {
    render(<ErrorMessage message="Be careful" type="warning" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('renders info variant', () => {
    render(<ErrorMessage message="FYI" type="info" />);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
    expect(screen.getByText('FYI')).toBeInTheDocument();
  });

  it('auto-detects rate limit error and shows quota warning', () => {
    render(<ErrorMessage message="rate limit exceeded" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(
      screen.getByText(/API quota exceeded.*100 requests\/day/),
    ).toBeInTheDocument();
  });

  it('auto-detects 429 status as rate limit', () => {
    render(<ErrorMessage message="Request failed with 429" />);
    expect(
      screen.getByText(/API quota exceeded.*100 requests\/day/),
    ).toBeInTheDocument();
  });

  it('shows retry button when onRetry provided', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    await userEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('hides retry button when onRetry not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
});
