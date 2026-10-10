import { useEffect, useState } from 'react';
import { auctionState } from '../lib/data';
import { euro } from '../lib/format';
import type { Bid, SiteConfig, Spot } from '../lib/types';

interface Props {
  spot?: Spot;
  bids: Bid[];
  config: SiteConfig;
  onBid: () => void;
}

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Amsterdam',
});

const endFormatter = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Amsterdam',
});

export function AuctionBlock({ spot, bids, config, onBid }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const state = auctionState(bids, config, now);
  const soldOut = spot && spot.status !== 'veiling';
  const closed = state.closed || soldOut;

  return (
    <section
      id="veiling"
      aria-labelledby="veiling-titel"
      className="relative scroll-mt-20 overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-[0_20px_40px_-15px_rgba(7,52,89,0.6)] sm:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-oranje-licht to-merk-oranje"
      />
      <p className="text-sm font-bold tracking-wider text-oranje-licht uppercase">
        Veiling · er is er maar één
      </p>
      <h2 id="veiling-titel" className="mt-1 font-display text-4xl font-extrabold sm:text-5xl">
        Het grote vlak
      </h2>
      <p className="mt-1 text-blue-100">
        Het grootste vak: {spot ? `${spot.w_cm} x ${spot.h_cm} cm` : '85 x 99 cm'}, midden op de
        muur. Gaat naar het hoogste bod.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-blue-100">{state.highest ? 'Hoogste bod' : 'Startbod'}</p>
          <p className="font-display text-4xl font-extrabold text-oranje-licht">
            {euro(state.current)}
          </p>
          <p className="text-sm text-blue-100">
            {state.count === 1 ? '1 bod' : `${state.count} biedingen`}
            {state.highest && ` · hoogste van ${state.highest.bedrijf}`} · excl. btw
          </p>
        </div>
        <div>
          {closed ? (
            <p className="text-2xl font-extrabold">Veiling gesloten</p>
          ) : state.end ? (
            <>
              <p className="text-sm text-blue-100">Veiling sluit</p>
              <p className="font-display text-2xl font-extrabold first-letter:uppercase">
                {endFormatter.format(state.end)}
              </p>
            </>
          ) : (
            <p className="text-blue-100">Einddatum volgt.</p>
          )}
        </div>
      </div>

      {bids.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-bold tracking-wider text-oranje-licht uppercase">
            {closed ? 'Winnaar' : 'Laatste biedingen'}
          </p>
          <ol className="mt-2 divide-y divide-white/10 rounded-2xl bg-white/5">
            {[...bids]
              .sort((x, y) => y.bod_eur - x.bod_eur)
              .slice(0, closed ? 1 : 5)
              .map((b, i) => (
                <li
                  key={`${b.tijd}-${b.bedrijf}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <span className="min-w-0 truncate">
                    {i === 0 && !closed && (
                      <span className="mr-2 rounded-full bg-oranje-licht px-2 py-0.5 text-xs font-bold text-navy">
                        Hoogste
                      </span>
                    )}
                    {b.bedrijf}
                  </span>
                  <span className="shrink-0 text-right">
                    <strong className="font-display">{euro(b.bod_eur)}</strong>
                    <span className="block text-xs text-blue-200">
                      {timeFormatter.format(new Date(b.tijd))}
                    </span>
                  </span>
                </li>
              ))}
          </ol>
        </div>
      )}

      {!closed && (
        <div className="mt-6">
          <button type="button" onClick={onBid} className="btn-primary sm:w-auto">
            Bied mee
          </button>
          <p className="mt-2 text-sm text-blue-100">
            Je volgende bod is minimaal {euro(state.nextMinimum)}. Bieden is bindend en alleen voor
            bedrijven met een KvK-nummer.
          </p>
        </div>
      )}
    </section>
  );
}
