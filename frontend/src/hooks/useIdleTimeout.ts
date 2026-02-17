import { useCallback, useEffect, useRef } from 'react';

type Params = {
  enabled?: boolean;
  /** LocalStorage key to persist last-activity across refreshes. */
  storageKey: string;
  timeoutMs: number;
  checkIntervalMs?: number;
  onIdle: (idleMs: number) => void;
};

const DEFAULT_CHECK_INTERVAL_MS = 30_000;
const DEFAULT_ACTIVITY_WRITE_THROTTLE_MS = 2_000;

const activityEvents: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
  'focus',
];

const safeReadNumber = (value: string | null): number | null => {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const useIdleTimeout = ({
  enabled = true,
  storageKey,
  timeoutMs,
  checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
  onIdle,
}: Params) => {
  const didFireRef = useRef(false);
  const onIdleRef = useRef(onIdle);
  const lastWriteAtRef = useRef(0);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const readLastActive = useCallback(() => {
    const stored = safeReadNumber(localStorage.getItem(storageKey));
    return stored ?? Date.now();
  }, [storageKey]);

  const setLastActive = useCallback(
    (ts: number) => {
      try {
        localStorage.setItem(storageKey, String(ts));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const setActiveNow = useCallback(() => {
    const now = Date.now();
    setLastActive(now);
    didFireRef.current = false;
  }, [setLastActive]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    // If key is missing, initialize it (do not overwrite existing).
    const existing = safeReadNumber(localStorage.getItem(storageKey));
    if (!existing) {
      setLastActive(Date.now());
    }
  }, [enabled, setLastActive, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const markActiveThrottled = () => {
      const now = Date.now();
      if (now - lastWriteAtRef.current < DEFAULT_ACTIVITY_WRITE_THROTTLE_MS) return;
      lastWriteAtRef.current = now;
      setLastActive(now);
      didFireRef.current = false;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markActiveThrottled();
      }
    };

    const onInteractionCapture = (e: Event) => {
      const idleMs = Date.now() - readLastActive();
      if (!didFireRef.current && idleMs > timeoutMs) {
        didFireRef.current = true;
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        if (typeof (e as Event).stopImmediatePropagation === 'function') {
          ;(e as Event).stopImmediatePropagation()
        }
        onIdleRef.current(idleMs);
        return;
      }

      markActiveThrottled();
    };

    for (const evt of activityEvents) {
      window.addEventListener(evt, onInteractionCapture, {
        capture: true,
        passive: false,
      });
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - readLastActive();
      if (!didFireRef.current && idleMs > timeoutMs) {
        didFireRef.current = true;
        onIdleRef.current(idleMs);
      }
    }, checkIntervalMs);

    return () => {
      window.clearInterval(interval);
      for (const evt of activityEvents) {
        window.removeEventListener(evt, onInteractionCapture, { capture: true } as AddEventListenerOptions);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [checkIntervalMs, enabled, readLastActive, setLastActive, timeoutMs]);

  return {
    setActiveNow,
  };
};
