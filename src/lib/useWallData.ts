import { useCallback, useEffect, useRef, useState } from 'react';
import { REFRESH_INTERVAL_MS, loadWallData } from './data';
import type { WallData } from './types';

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: WallData }
  | { status: 'error'; message: string };

/** Laadt de muurdata bij openen, elke 60 s en zodra het tabblad weer zichtbaar wordt. */
export function useWallData() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const latest = useRef<WallData | undefined>(undefined);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const data = await loadWallData(latest.current);
      latest.current = data;
      setState({ status: 'ready', data });
    } catch (error) {
      console.error('[muur] laden mislukt', error);
      if (!latest.current) {
        setState({ status: 'error', message: error instanceof Error ? error.message : 'onbekend' });
      }
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    void refresh();
  }, [refresh]);

  return { state, retry };
}
