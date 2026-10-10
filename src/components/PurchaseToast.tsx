import { useEffect, useRef, useState } from 'react';
import type { Purchase } from '../lib/types';

const FIRST_MS = 4_000;
const GAP_MS = 20_000;
const SHOW_MS = 5_000;
const STOP_KEY = 'muur-toast-uit';

function ago(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (min < 2) return 'zojuist';
  if (min < 60) return `${min} min geleden`;
  const uur = Math.round(min / 60);
  if (uur < 24) return `${uur} uur geleden`;
  const dagen = Math.round(uur / 24);
  return dagen === 1 ? 'gisteren' : `${dagen} dagen geleden`;
}

function stoppedBefore(): boolean {
  try {
    return sessionStorage.getItem(STOP_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * "X heeft net een vak gekocht". Alleen echte, betaalde aankopen uit Stripe (via /api/verkocht).
 * Zonder toestemming voor de naam staat er "Iemand". Geen aankopen = niets.
 */
export function PurchaseToast({ purchases, hidden }: { purchases: Purchase[]; hidden: boolean }) {
  const [current, setCurrent] = useState<Purchase | null>(null);
  const [stopped, setStopped] = useState(stoppedBefore);
  const list = useRef(purchases);
  const shown = useRef(new Set<string>());

  useEffect(() => {
    list.current = purchases;
  }, [purchases]);

  useEffect(() => {
    if (stopped) return;
    let timer: ReturnType<typeof setTimeout>;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const next = list.current.find((p) => !shown.current.has(p.vak + p.tijd));
      if (next) {
        shown.current.add(next.vak + next.tijd);
        setCurrent(next);
        hide = setTimeout(() => setCurrent(null), SHOW_MS);
      }
      timer = setTimeout(tick, GAP_MS);
    };
    timer = setTimeout(tick, FIRST_MS);
    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, [stopped]);

  const close = () => {
    setCurrent(null);
    setStopped(true);
    try {
      sessionStorage.setItem(STOP_KEY, '1');
    } catch {
      // geen opslag: dan alleen voor deze pagina uit
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-30 max-w-[calc(100%-2rem)] sm:bottom-4 sm:max-w-sm"
    >
      {current && !hidden && (
        <div className="toast-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-navy/10 bg-white py-2.5 pr-1.5 pl-4 shadow-lg">
          <p className="min-w-0 text-sm text-ink">
            <span className="font-bold break-words text-navy">
              {current.koper ? current.koper.slice(0, 60) : 'Iemand'}
            </span>{' '}
            heeft net een vak gekocht
            <span className="block text-xs text-ink/60">
              Vak {current.vak} · {ago(current.tijd)}
            </span>
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Melding sluiten"
            className="grid size-10 shrink-0 place-items-center rounded-full text-xl text-ink/60 hover:bg-lichtblauw"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
