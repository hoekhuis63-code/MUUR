import { useCallback, useEffect, useState } from 'react';
import type { Bid } from './types';

const POLL_MS = 15_000;

async function fetchBids(): Promise<Bid[] | undefined> {
  try {
    const res = await fetch('/api/bod', { cache: 'no-store' });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { biedingen?: Bid[] };
    return Array.isArray(body.biedingen) ? body.biedingen : undefined;
  } catch {
    return undefined; // Netwerkfout: laatste stand blijft staan.
  }
}

/** Biedingen op het grote vlak uit /api/bod, elke 15 s ververst (ook bij terugkeren naar het tabblad). */
export function useBids() {
  const [bids, setBids] = useState<Bid[]>([]);

  const refresh = useCallback(() => {
    return fetchBids().then((next) => {
      if (next) setBids(next);
    });
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { bids, refresh };
}

export interface BidInput {
  bedrijf: string;
  kvk: string;
  naam: string;
  email: string;
  telefoon: string;
  bod: string;
  akkoord: boolean;
  website: string;
}

export async function placeBid(input: BidInput): Promise<{ ok: true } | { fout: string }> {
  try {
    const res = await fetch('/api/bod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => ({}))) as { fout?: string };
    if (res.ok) return { ok: true };
    return { fout: body.fout ?? 'Er ging iets mis. Probeer het opnieuw.' };
  } catch {
    return { fout: 'Geen verbinding. Controleer je internet en probeer het opnieuw.' };
  }
}
