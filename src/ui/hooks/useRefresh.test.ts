import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRefresh } from './useRefresh';

describe('useRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createCallback(resolveDelay = 0) {
    const fn = vi.fn<() => Promise<void>>(() =>
      new Promise((resolve) => {
        if (resolveDelay > 0) {
          setTimeout(resolve, resolveDelay);
        } else {
          resolve();
        }
      })
    );
    return fn;
  }

  it('returns correct initial state', () => {
    const callback = createCallback();
    const { result } = renderHook(() => useRefresh(callback));

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isCoolingDown).toBe(false);
    expect(result.current.cooldownRemaining).toBe(0);
  });

  it('calls callback on refresh', async () => {
    const callback = createCallback();
    const { result } = renderHook(() => useRefresh(callback));

    await act(async () => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('sets isRefreshing during callback execution', async () => {
    const callback = createCallback(1000);
    const { result } = renderHook(() => useRefresh(callback));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isRefreshing).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it('starts cooldown after callback completes', async () => {
    const callback = createCallback();
    const { result } = renderHook(() =>
      useRefresh(callback, { cooldownSeconds: 10 })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.isCoolingDown).toBe(true);
    expect(result.current.cooldownRemaining).toBe(10);
  });

  it('cooldownRemaining decrements every second', async () => {
    const callback = createCallback();
    const { result } = renderHook(() =>
      useRefresh(callback, { cooldownSeconds: 5 })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.cooldownRemaining).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.cooldownRemaining).toBe(4);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.cooldownRemaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.cooldownRemaining).toBe(0);
    expect(result.current.isCoolingDown).toBe(false);
  });

  it('refresh is no-op during cooldown', async () => {
    const callback = createCallback();
    const { result } = renderHook(() =>
      useRefresh(callback, { cooldownSeconds: 10 })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isCoolingDown).toBe(true);

    await act(async () => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('refresh is no-op while already refreshing', async () => {
    const callback = createCallback(1000);
    const { result } = renderHook(() => useRefresh(callback));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isRefreshing).toBe(true);

    act(() => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('cleans up timer on unmount', async () => {
    const callback = createCallback();
    const { result, unmount } = renderHook(() =>
      useRefresh(callback, { cooldownSeconds: 10 })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.isCoolingDown).toBe(true);

    unmount();

    // Should not throw — interval was cleaned up
    act(() => {
      vi.advanceTimersByTime(10000);
    });
  });

  it('uses default cooldown of 30 seconds', async () => {
    const callback = createCallback();
    const { result } = renderHook(() => useRefresh(callback));

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.cooldownRemaining).toBe(30);
  });

  it('allows refresh again after cooldown expires', async () => {
    const callback = createCallback();
    const { result } = renderHook(() =>
      useRefresh(callback, { cooldownSeconds: 3 })
    );

    await act(async () => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isCoolingDown).toBe(false);

    await act(async () => {
      result.current.refresh();
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
