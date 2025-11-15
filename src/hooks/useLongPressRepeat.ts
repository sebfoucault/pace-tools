import { useCallback, useEffect, useRef } from 'react';

export interface LongPressRepeatOptions {
  /** Time (ms) before first repeat tick */
  initialDelay?: number;
  /** Interval (ms) while in slow phase */
  slowInterval?: number;
  /** Interval (ms) once acceleration threshold reached */
  fastInterval?: number;
  /** Elapsed time (ms) after which fast interval kicks in */
  accelerateAfter?: number;
  /** Optional guard (e.g., disabled state) */
  canStart?: () => boolean;
}

/**
 * Provides press/hold handlers that invoke a callback repeatedly.
 * First invocation occurs after `initialDelay`, then uses `slowInterval`,
 * switching to `fastInterval` after `accelerateAfter` ms of holding.
 */
export function useLongPressRepeat(
  callback: () => void,
  {
    initialDelay = 600,
    slowInterval = 500,
    fastInterval = 120,
    accelerateAfter = 3000,
    canStart = () => true,
  }: LongPressRepeatOptions = {}
) {
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const activeRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    activeRef.current = false;
  }, []);

  const scheduleNext = useCallback(() => {
    if (!activeRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    const interval = elapsed >= accelerateAfter ? fastInterval : slowInterval;
    timerRef.current = window.setTimeout(() => {
      if (!activeRef.current) return;
      callback();
      scheduleNext();
    }, interval);
  }, [accelerateAfter, callback, fastInterval, slowInterval]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    if (!canStart()) return;
    activeRef.current = true;
    startTimeRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      if (!activeRef.current) return;
      callback();
      scheduleNext();
    }, initialDelay);
  }, [callback, canStart, initialDelay, scheduleNext]);

  const stop = useCallback(() => clear(), [clear]);

  useEffect(() => clear, [clear]);

  return {
    start,
    stop,
    pressHandlers: {
      onPointerDown: () => start(),
      onPointerUp: () => stop(),
      onPointerLeave: () => stop(),
      onPointerCancel: () => stop(),
      onBlur: () => stop(),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start();
        }
      },
      onKeyUp: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          stop();
        }
      },
    },
  };
}
