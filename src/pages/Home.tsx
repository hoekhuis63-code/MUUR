import { useCallback, useEffect, useRef, useState } from 'react';
import { About } from '../components/About';
import { AuctionBlock } from '../components/AuctionBlock';
import { BidForm } from '../components/BidForm';
import { Faq } from '../components/Faq';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Legend } from '../components/Legend';
import { SpotList } from '../components/SpotList';
import { SiteNav } from '../components/SiteNav';
import { SpotPanel } from '../components/SpotPanel';
import { PurchaseToast } from '../components/PurchaseToast';
import { StickyCta } from '../components/StickyCta';
import { TrustStrip } from '../components/TrustStrip';
import { WallMap } from '../components/WallMap';
import { WhatYouGet } from '../components/WhatYouGet';
import { DEFAULT_CONFIG, auctionState } from '../lib/data';
import { useBids } from '../lib/bids';
import { euro } from '../lib/format';
import { trackEvent } from '../lib/claim';
import { useWallData } from '../lib/useWallData';

function idFromHash(): string | undefined {
  const id = decodeURIComponent(window.location.hash.slice(1)).toUpperCase();
  return /^[A-Z0-9]+$/.test(id) ? id : undefined;
}

export function Home() {
  const { state, retry } = useWallData();
  const { bids, refresh: refreshBids } = useBids();
  const [bidOpen, setBidOpen] = useState(false);
  const openBid = useCallback(() => {
    trackEvent('bied_klik', {});
    setBidOpen(true);
  }, []);
  const [selectedId, setSelectedId] = useState<string | undefined>(idFromHash);
  const [mode, setMode] = useState<'kaart' | 'lijst'>('kaart');
  const mapRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const data = state.status === 'ready' ? state.data : undefined;
  const spots = data?.spots ?? [];
  const config = data?.config ?? DEFAULT_CONFIG;
  const selected = spots.find((s) => s.id === selectedId);

  const select = useCallback((id: string) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setSelectedId(id);
    history.replaceState(null, '', `#${id}`);
  }, []);

  const close = useCallback(() => {
    setSelectedId(undefined);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    const onHash = () => setSelectedId(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Deellink (#T07): na laden de kaart in beeld brengen.
  const scrolled = useRef(false);
  useEffect(() => {
    if (!scrolled.current && selected && idFromHash()) {
      scrolled.current = true;
      mapRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [selected]);

  const auction = data ? auctionState(bids, config, 0) : undefined;
  const spotS1 = spots.find((s) => s.type === 'spot');
  const freeSpots = spots.filter((s) => s.status === 'vrij' && s.betaallink && s.prijs_eur > 0);
  const cheapest = freeSpots.reduce<(typeof spots)[number] | undefined>(
    (min, s) => (!min || s.prijs_eur < min.prijs_eur ? s : min),
    undefined,
  );
  const pickForMe = useCallback(() => {
    if (!cheapest) return;
    const options = freeSpots.filter((s) => s.prijs_eur === cheapest.prijs_eur);
    const pick = options[Math.floor(Math.random() * options.length)] ?? cheapest;
    trackEvent('kies_voor_mij', { vak: pick.id });
    select(pick.id);
  }, [cheapest, freeSpots, select]);

  return (
    <>
      <a
        href="#muur"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3"
      >
        Direct naar de muur
      </a>
      <SiteNav />
      <Hero />
      <main className="mx-auto max-w-5xl space-y-16 px-4 pt-12 pb-12 sm:space-y-24 sm:pt-16">
        <section
          id="muur"
          ref={mapRef}
          aria-labelledby="muur-titel"
          className="card scroll-mt-20 space-y-4 p-4 sm:p-8"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">320 x 230 cm</p>
              <h2
                id="muur-titel"
                className="mt-1 font-display text-3xl font-extrabold text-navy sm:text-4xl"
              >
                Kies je vak
              </h2>
            </div>
            {state.status !== 'error' && (
              <div
                className="flex shrink-0 rounded-full bg-lichtblauw p-1"
                role="group"
                aria-label="Weergave"
              >
                {(['kaart', 'lijst'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    disabled={!data}
                    onClick={() => setMode(m)}
                    className="min-h-10 rounded-full px-4 font-semibold capitalize aria-pressed:bg-navy aria-pressed:text-white"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {state.status === 'loading' && (
            <div role="status" aria-label="Muur wordt geladen">
              <div className="aspect-[320/230] w-full animate-pulse rounded-lg bg-stone-200" />
              {/* Zelfde hoogte als knoppen, uitleg en legenda: voorkomt verspringen. */}
              <div className="h-56 sm:h-36" />
            </div>
          )}
          {state.status === 'error' && (
            <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-5">
              <p className="font-bold">De muur kon niet worden geladen.</p>
              <p className="mt-1 text-stone-700">
                Controleer je internetverbinding en probeer het opnieuw.
                {config.contact_email && ` Lukt het niet? Mail ons op ${config.contact_email}.`}
              </p>
              <button type="button" onClick={retry} className="btn-secondary mt-3 w-auto px-5">
                Opnieuw proberen
              </button>
            </div>
          )}
          {data && mode === 'kaart' && (
            <>
              <WallMap
                spots={spots}
                auctionAmount={auction?.current ?? config.startbod_eur}
                hasBids={Boolean(auction?.highest)}
                selectedId={selectedId}
                onSelect={select}
              />
              {cheapest && (
                <button
                  type="button"
                  className="btn-secondary min-h-11 sm:w-auto sm:px-5"
                  onClick={pickForMe}
                >
                  Kies voor mij een vak vanaf {euro(cheapest.prijs_eur)}
                </button>
              )}
              <p className="text-sm text-stone-600">
                Tik op een vak. Knijp of gebruik + om in te zoomen, of bekijk de{' '}
                <button type="button" className="underline" onClick={() => setMode('lijst')}>
                  lijst met vrije vakken
                </button>
                .
              </p>
              <Legend spots={spots} />
            </>
          )}
          {data && mode === 'lijst' && <SpotList spots={spots} onSelect={select} />}
          <div className="border-t border-navy/10 pt-5">
            <TrustStrip />
          </div>
          {data?.source === 'fallback' && (
            <p className="text-sm text-stone-600">
              Let op: je ziet mogelijk een eerdere stand van de muur. We proberen het elke minuut
              opnieuw.
            </p>
          )}
        </section>

        <WhatYouGet />
        {data && <AuctionBlock spot={spotS1} bids={bids} config={config} onBid={openBid} />}
        <HowItWorks />
        <About config={config} />
        <Faq looptijd={config.looptijd} />
      </main>
      <Footer config={config} />
      <StickyCta hidden={Boolean(selected) || bidOpen} />
      <PurchaseToast purchases={data?.recent ?? []} hidden={Boolean(selected) || bidOpen} />
      {bidOpen && (
        <BidForm
          minimum={auction?.nextMinimum ?? config.startbod_eur}
          onClose={() => setBidOpen(false)}
          onPlaced={() => void refreshBids()}
        />
      )}
      {selected && (
        <SpotPanel
          key={selected.id}
          spot={selected}
          onClose={close}
          onBid={() => {
            close();
            openBid();
          }}
          auction={
            auction && {
              label: auction.highest ? 'Hoogste bod' : 'Startbod',
              amount: auction.current,
            }
          }
        />
      )}
    </>
  );
}
