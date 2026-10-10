import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { placeBid } from '../lib/bids';
import type { BidInput } from '../lib/bids';
import { trackEvent } from '../lib/claim';
import { euro } from '../lib/format';

interface Props {
  minimum: number;
  onClose: () => void;
  onPlaced: () => void;
}

const EMPTY: BidInput = {
  bedrijf: '',
  kvk: '',
  naam: '',
  email: '',
  telefoon: '',
  bod: '',
  akkoord: false,
  website: '',
};

export function BidForm({ minimum, onClose, onPlaced }: Props) {
  const [form, setForm] = useState<BidInput>({ ...EMPTY, bod: String(minimum) });
  const [fout, setFout] = useState('');
  const [busy, setBusy] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key: keyof BidInput) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFout('');
    const result = await placeBid(form);
    setBusy(false);
    if ('fout' in result) {
      setFout(result.fout);
      return;
    }
    trackEvent('bod_geplaatst', { bedrag: form.bod });
    setKlaar(true);
    onPlaced();
  }

  const veld =
    'mt-1 block min-h-11 w-full rounded-xl border border-navy/25 bg-white px-3 text-base';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bod-titel"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Het grote vlak</p>
            <h2
              id="bod-titel"
              ref={headingRef}
              tabIndex={-1}
              className="mt-1 font-display text-3xl font-extrabold text-navy outline-none"
            >
              {klaar ? 'Bod ontvangen' : 'Bied mee'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="grid h-11 w-11 place-items-center rounded-full text-2xl text-stone-600 hover:bg-stone-100"
          >
            ×
          </button>
        </div>

        {klaar ? (
          <div className="mt-4 space-y-4" role="status">
            <p className="text-lg">
              Je bod van <strong>{euro(Number(form.bod))}</strong> excl. btw staat erop. Je bent nu
              de hoogste bieder.
            </p>
            <p className="text-ink/80">
              Wordt je overboden, dan kun je opnieuw bieden. De veiling sluit zondag 18 oktober om
              20:00. We nemen contact met je op als je wint.
            </p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Sluiten
            </button>
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={submit} noValidate>
            <label className="block font-semibold text-navy">
              Je bod in euro (excl. btw)
              <input
                inputMode="numeric"
                required
                className={`${veld} font-display text-2xl font-extrabold`}
                value={form.bod}
                onChange={(e) => set('bod')(e.target.value)}
              />
              <span className="text-sm font-normal text-ink/70">Minimaal {euro(minimum)}</span>
            </label>
            <label className="block font-semibold text-navy">
              Bedrijfsnaam
              <input
                required
                autoComplete="organization"
                className={veld}
                value={form.bedrijf}
                onChange={(e) => set('bedrijf')(e.target.value)}
              />
            </label>
            <label className="block font-semibold text-navy">
              KvK-nummer
              <input
                required
                inputMode="numeric"
                className={veld}
                value={form.kvk}
                onChange={(e) => set('kvk')(e.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block font-semibold text-navy">
                Naam
                <input
                  required
                  autoComplete="name"
                  className={veld}
                  value={form.naam}
                  onChange={(e) => set('naam')(e.target.value)}
                />
              </label>
              <label className="block font-semibold text-navy">
                Telefoon
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  className={veld}
                  value={form.telefoon}
                  onChange={(e) => set('telefoon')(e.target.value)}
                />
              </label>
            </div>
            <label className="block font-semibold text-navy">
              E-mail
              <input
                required
                type="email"
                autoComplete="email"
                className={veld}
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
              />
            </label>
            {/* Honeypot: onzichtbaar voor mensen, bots vullen het in. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              value={form.website}
              onChange={(e) => set('website')(e.target.value)}
            />
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0"
                checked={form.akkoord}
                onChange={(e) => set('akkoord')(e.target.checked)}
              />
              <span>
                Mijn bod is bindend en ik ga akkoord met de{' '}
                <a
                  href="/voorwaarden#11-veiling-van-the-spot"
                  target="_blank"
                  className="underline"
                >
                  veilingregels en voorwaarden
                </a>
                . Mijn bedrijfsnaam en bod worden op de site getoond.
              </span>
            </label>
            {fout && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 font-semibold text-red-800">
                {fout}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Bezig…' : 'Plaats mijn bod'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
