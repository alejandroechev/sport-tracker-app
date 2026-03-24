import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseRefreshOptions {
  cooldownSeconds?: number;
}

export interface UseRefreshReturn {
  /** Trigger a refresh — calls the callback and starts cooldown */
  refresh: () => void;
  /** Whether currently in cooldown */
  isCoolingDown: boolean;
  /** Seconds remaining in cooldown */
  cooldownRemaining: number;
  /** Whether the refresh callback is currently executing */
  isRefreshing: boolean;
}

const DEFAULT_COOLDOWN_SECONDS = 30;

export function useRefresh(
  refreshCallback: () => Promise<void>,
  options?: UseRefreshOptions
): UseRefreshReturn {
  const cooldownSeconds = options?.cooldownSeconds ?? DEFAULT_COOLDOWN_SECONDS;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(refreshCallback);
  callbackRef.current = refreshCallback;

  const clearCooldownInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(cooldownSeconds);
    clearCooldownInterval();

    intervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearCooldownInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds, clearCooldownInterval]);

  const isCoolingDown = cooldownRemaining > 0;

  const refresh = useCallback(() => {
    if (isCoolingDown || isRefreshing) return;

    setIsRefreshing(true);
    callbackRef.current()
      .finally(() => {
        setIsRefreshing(false);
        startCooldown();
      });
  }, [isCoolingDown, isRefreshing, startCooldown]);

  useEffect(() => {
    return () => {
      clearCooldownInterval();
    };
  }, [clearCooldownInterval]);

  return {
    refresh,
    isCoolingDown,
    cooldownRemaining,
    isRefreshing,
  };
}
