import { useState } from 'react';
import { LogoUpload } from '../components/LogoUpload';
import { SiteNav } from '../components/SiteNav';
import { trackEvent } from '../lib/claim';

export function Bedankt() {
  const params = new URLSearchParams(window.location.search);
  const vak = (params.get('vak') ?? '').replace(/[^0-9A-Za-z]/g, '').slice(0, 10);
  const sessie = (params.get('sessie') ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 200);
  const [shareMsg, setShareMsg] = useState('');

  async function share(kind: 'eigen' | 'tip') {
    const url =
      kind === 'eigen'
        ? `https://hethoekhuus.nl/?utm_source=deel_koper#${vak}`
        : 'https://hethoekhuus.nl/?utm_source=referral';
    const text =
      kind === 'eigen'
        ? `Wij staan op de muur van Het Hoekhuus! Vak ${vak} is van ons.`
        : 'Zet je bedrijf op de muur van Het Hoekhuus, vanaf €25 (excl. btw).';
    trackEvent('deel_bedankt', { soort: kind });
    try {
      if (navigator.share)
        return void (await navigator.share({ title: 'Muur van Het Hoekhuus', text, url }));
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareMsg('Link gekopieerd');
    } catch {
      // Delen geannuleerd.
    }
  }

  return (
    <>
      <SiteNav />
      <div className="bg-lichtblauw">
        <div className="mx-auto max-w-2xl px-4 pt-8 pb-10">
          <p className="eyebrow">Muur van Het Hoekhuus</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            {vak ? `Gelukt! Vak ${vak} is van jou` : 'Gelukt! Bedankt voor je aankoop'}
          </h1>
          <p className="mt-3 text-lg text-ink">
            Je betaling is binnen. De factuur komt per e-mail.
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
        <section aria-labelledby="logo-titel">
          <h2 id="logo-titel" className="mb-1 font-display text-2xl font-extrabold text-navy">
            Stap 1: stuur je logo
          </h2>
          <p className="mb-4 text-ink/80">Dan kunnen we de sticker laten maken.</p>
          {vak && sessie ? (
            <LogoUpload vak={vak} sessie={sessie} />
          ) : (
            <p className="rounded-xl bg-amber-50 p-4">
              Mail je logo naar{' '}
              <a
                className="font-semibold underline"
                href={`mailto:info@hethoekhuus.nl?subject=${encodeURIComponent(`Logo voor vak ${vak}`)}`}
              >
                info@hethoekhuus.nl
              </a>{' '}
              met je vaknummer in het onderwerp.
            </p>
          )}
        </section>

        <section aria-labelledby="nu-titel" className="card p-5">
          <h2 id="nu-titel" className="font-display text-xl font-extrabold text-navy">
            Wat gebeurt er daarna?
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink">
            <li>We beoordelen je logo binnen 5 werkdagen.</li>
            <li>In de regel binnen 14 dagen na goedkeuring hangt je logo op de muur.</li>
            <li>Je krijgt een foto als bewijs.</li>
          </ol>
        </section>

        <section aria-labelledby="deel-titel" className="rounded-3xl bg-navy p-6 text-white">
          <h2 id="deel-titel" className="font-display text-2xl font-extrabold">
            Laat zien dat je erop staat
          </h2>
          <p className="mt-1 text-blue-100">
            Deel je plek, of tip een ondernemer die dit ook leuk vindt.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {vak && (
              <button
                type="button"
                className="btn-primary sm:w-auto"
                onClick={() => void share('eigen')}
              >
                Deel mijn vak
              </button>
            )}
            <button
              type="button"
              className="btn-secondary min-h-12 sm:w-auto sm:px-6"
              onClick={() => void share('tip')}
            >
              Tip een ondernemer
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-sm text-blue-100">
            {shareMsg}
          </p>
        </section>
      </main>
    </>
  );
}
