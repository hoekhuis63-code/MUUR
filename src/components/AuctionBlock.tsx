import { useEffect, useState } from 'react';
import { auctionState } from '../lib/data';
import { euro } from '../lib/format';
import type { Bid, SiteConfig, Spot } from '../lib/types';
import { Countdown } from './Countdown';

interface Props {
  spot?: Spot;
  bids: Bid[];
  config: SiteConfig;
  bidFormUrl?: string;
}

const endFormatter = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Amsterdam',
});

export function AuctionBlock({ spot, bids, config, bidFormUrl }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const state = auctionState(bids, config, now);
  const soldOut = spot && spot.status !== 'veiling';
  const closed = state.closed || soldOut;

  return (
    <section
      id="veiling"
      aria-labelledby="veiling-titel"
      className="scroll-mt-4 rounded-2xl bg-stone-900 p-5 text-white sm:p-8"
    >
      <p className="text-sm font-semibold tracking-wide text-red-400 uppercase">Veiling</p>
      <h2 id="veiling-titel" className="mt-1 text-3xl font-extrabold">
        The Spot
      </h2>
      <p className="mt-1 text-stone-300">
        Het grootste vak: 100 x 80 cm, midden op de muur. Gaat naar het hoogste bod.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-stone-300">{state.highest ? 'Hoogste bod' : 'Startbod'}</p>
          <p className="text-4xl font-extrabold">{euro(state.current)}</p>
          <p className="text-sm text-stone-300">
            {state.count === 1 ? '1 bod' : `${state.count} biedingen`}
            {state.highest && ` · hoogste van ${state.highest.bedrijf}`} · excl. btw
          </p>
        </div>
        <div>
          {closed ? (
            <p className="text-2xl font-extrabold">Veiling gesloten</p>
          ) : state.end ? (
            <>
              <p className="mb-1 text-sm text-stone-300">Sluit {endFormatter.format(state.end)}</p>
              <Countdown end={state.end} now={now} />
            </>
          ) : (
            <p className="text-stone-300">Einddatum volgt.</p>
          )}
        </div>
      </div>

      {!closed && (
        <div className="mt-6">
          {bidFormUrl ? (
            <a href={bidFormUrl} target="_blank" rel="noopener" className="btn-primary sm:w-auto">
              Bied mee
            </a>
          ) : (
            <button type="button" disabled className="btn-primary sm:w-auto">
              Bieden kan binnenkort
            </button>
          )}
          <p className="mt-2 text-sm text-stone-300">
            Je volgende bod is minimaal {euro(state.nextMinimum)}. Bieden is bindend en alleen voor
            bedrijven met een KvK-nummer.
          </p>
        </div>
      )}
    </section>
  );
}
