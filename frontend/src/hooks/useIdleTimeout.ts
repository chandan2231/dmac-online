import { useEffect, useRef } from 'react';

type Params = {
  enabled?: boolean;
  timeoutMs: number;
  checkIntervalMs?: number;
  onIdle: (idleMs: number) => void;
};

const DEFAULT_CHECK_INTERVAL_MS = 5_000;

const activityEvents: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
  'focus',
];

export const useIdleTimeout = ({
  enabled = true,
  timeoutMs,
  checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
  onIdle,
}: Params) => {
  const lastActiveAtRef = useRef<number>(Date.now());
  const didFireRef = useRef<boolean>(false);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const markActive = () => {
      lastActiveAtRef.current = Date.now();
      didFireRef.current = false;
    };

    const onVisibilityChange = () => {
      // When tab becomes visible again, treat as activity.
      if (document.visibilityState === 'visible') {
        markActive();
      }
    };

    for (const evt of activityEvents) {
      window.addEventListener(evt, markActive, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActiveAtRef.current;
      if (!didFireRef.current && idleMs > timeoutMs) {
        didFireRef.current = true;
        onIdleRef.current(idleMs);
      }
    }, checkIntervalMs);

    return () => {
      window.clearInterval(interval);
      for (const evt of activityEvents) {
        window.removeEventListener(evt, markActive);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, timeoutMs, checkIntervalMs]);
};
