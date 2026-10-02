import { useEffect, useRef, useState } from 'react';
import { claimUrl, getSource, trackEvent } from '../lib/claim';
import { STATUS_LABELS, TYPE_LABELS, euro, size } from '../lib/format';
import type { Spot } from '../lib/types';

interface Props {
  spot: Spot;
  onClose: () => void;
  bidFormUrl?: string;
  /** Bijv. "Hoogste bod €5.250" voor The Spot. */
  auction?: { label: string; amount: number };
}

export function SpotPanel({ spot, onClose, bidFormUrl, auction }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function claim() {
    const bron = getSource();
    const url = claimUrl(spot, bron);
    if (!url) return;
    trackEvent('claim_click', { vak: spot.id, bron });
    window.location.assign(url);
  }

  async function share() {
    const url = `${window.location.origin}/#${spot.id}`;
    const text = `Vak ${spot.id} op de muur van Het Hoekhuus (${size(spot)}, ${euro(spot.prijs_eur)} excl. btw)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Muur van Het Hoekhuus', text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage('Link gekopieerd');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareMessage(`Kopieer deze link: ${url}`);
    }
  }

  const isAuction = spot.status === 'veiling';

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="spot-panel-title"
      className="fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-stone-300 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:inset-x-auto md:top-0 md:right-0 md:bottom-0 md:max-h-none md:w-96 md:rounded-none md:border-t-0 md:border-l"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-600">{TYPE_LABELS[spot.type]}</p>
          <h2
            id="spot-panel-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-extrabold outline-none"
          >
            Vak {spot.id}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full text-2xl text-stone-600 hover:bg-stone-100"
          aria-label="Sluiten"
        >
          ×
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-base">
        <dt className="text-stone-600">Maat</dt>
        <dd className="font-semibold">{size(spot)}</dd>
        <dt className="text-stone-600">{isAuction && auction ? auction.label : 'Prijs'}</dt>
        <dd className="font-semibold">
          {spot.status === 'geblokkeerd'
            ? 'volgt'
            : `${euro(isAuction && auction ? auction.amount : spot.prijs_eur)} excl. btw`}
        </dd>
        <dt className="text-stone-600">Status</dt>
        <dd className="font-semibold">{STATUS_LABELS[spot.status]}</dd>
        {spot.status === 'verkocht' && spot.koper && (
          <>
            <dt className="text-stone-600">Van</dt>
            <dd className="font-semibold">
              {spot.website ? (
                <a href={spot.website} target="_blank" rel="noopener" className="underline">
                  {spot.koper}
                </a>
              ) : (
                spot.koper
              )}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-5 flex flex-col gap-2">
        {spot.status === 'vrij' && spot.betaallink && (
          <button type="button" onClick={claim} className="btn-primary">
            Claim deze plek
          </button>
        )}
        {spot.status === 'vrij' && !spot.betaallink && (
          <button type="button" disabled className="btn-primary">
            Binnenkort te koop
          </button>
        )}
        {spot.status === 'bezet' && (
          <button type="button" disabled className="btn-primary">
            Net verkocht
          </button>
        )}
        {isAuction && (
          <>
            {bidFormUrl && (
              <a href={bidFormUrl} target="_blank" rel="noopener" className="btn-primary">
                Bied mee
              </a>
            )}
            <a href="#veiling" onClick={onClose} className="btn-secondary">
              Bekijk de veiling
            </a>
          </>
        )}
        {spot.status === 'geblokkeerd' && (
          <p className="text-stone-700">
            Dit vak komt later in de verkoop. Houd onze video's in de gaten.
          </p>
        )}
        <button type="button" onClick={share} className="btn-secondary">
          Deel dit vak
        </button>
        <p role="status" className="min-h-5 text-sm break-all text-stone-700">
          {shareMessage}
        </p>
      </div>
    </aside>
  );
}
