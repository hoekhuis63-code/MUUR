import { useCallback, useEffect, useRef, useState } from 'react';
import { About } from '../components/About';
import { AuctionBlock } from '../components/AuctionBlock';
import { Faq } from '../components/Faq';
import { Footer } from '../components/Footer';
import { HowItWorks } from '../components/HowItWorks';
import { Legend } from '../components/Legend';
import { Progress } from '../components/Progress';
import { RecentSold } from '../components/RecentSold';
import { SpotList } from '../components/SpotList';
import { SpotPanel } from '../components/SpotPanel';
import { WallMap } from '../components/WallMap';
import { DEFAULT_CONFIG, auctionState } from '../lib/data';
import { useWallData } from '../lib/useWallData';

const bidFormId = import.meta.env.VITE_TALLY_BID_FORM_ID as string | undefined;
const bidFormUrl = bidFormId ? `https://tally.so/r/${encodeURIComponent(bidFormId)}` : undefined;

function idFromHash(): string | undefined {
  const id = decodeURIComponent(window.location.hash.slice(1)).toUpperCase();
  return /^[A-Z0-9]+$/.test(id) ? id : undefined;
}

export function Home() {
  const { state, retry } = useWallData();
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

  const auction = data ? auctionState(data.bids, config, 0) : undefined;
  const spotS1 = spots.find((s) => s.type === 'spot');

  return (
    <>
      <main className="mx-auto max-w-5xl space-y-14 px-4 pt-8 pb-8 sm:pt-12">
        <header className="space-y-4">
          <p className="font-semibold text-red-700">Muur van Het Hoekhuus</p>
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Koop een stukje van het Hoekhuus
          </h1>
          <p className="max-w-2xl text-lg text-stone-700">
            Zet je bedrijfslogo op onze echte muur van 320 x 230 cm, midden in de verbouwing die
            duizenden mensen volgen. Kies een vak, betaal en wij plakken je logo erop.
          </p>
          {data ? (
            <Progress spots={spots} />
          ) : (
            <div className="h-[4.5rem] animate-pulse rounded bg-stone-200 sm:h-11" />
          )}
        </header>

        <section ref={mapRef} aria-labelledby="muur-titel" className="scroll-mt-2 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 id="muur-titel" className="text-2xl font-extrabold">
              Kies je vak
            </h2>
            {state.status !== 'error' && (
              <div
                className="flex rounded-full border border-stone-300 bg-white p-1"
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
                    className="min-h-10 rounded-full px-4 font-semibold capitalize aria-pressed:bg-stone-900 aria-pressed:text-white"
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
          {data?.source === 'fallback' && (
            <p className="text-sm text-stone-600">
              Let op: je ziet mogelijk een eerdere stand van de muur. We proberen het elke minuut
              opnieuw.
            </p>
          )}
        </section>

        {data && (
          <AuctionBlock spot={spotS1} bids={data.bids} config={config} bidFormUrl={bidFormUrl} />
        )}
        <HowItWorks />
        {data && <RecentSold spots={spots} />}
        <About config={config} />
        <Faq looptijd={config.looptijd} />
      </main>
      <Footer config={config} />
      {selected && (
        <SpotPanel
          key={selected.id}
          spot={selected}
          onClose={close}
          bidFormUrl={bidFormUrl}
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
