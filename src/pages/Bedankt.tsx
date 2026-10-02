import { useEffect } from 'react';

const logoFormId = import.meta.env.VITE_TALLY_LOGO_FORM_ID as string | undefined;
const TALLY_SCRIPT = 'https://tally.so/widgets/embed.js';

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

function loadTallyEmbeds() {
  const load = () => {
    if (window.Tally) window.Tally.loadEmbeds();
    else
      document
        .querySelectorAll<HTMLIFrameElement>('iframe[data-tally-src]:not([src])')
        .forEach((iframe) => {
          iframe.src = iframe.dataset.tallySrc ?? '';
        });
  };
  if (window.Tally) return load();
  if (document.querySelector(`script[src="${TALLY_SCRIPT}"]`)) return;
  const script = document.createElement('script');
  script.src = TALLY_SCRIPT;
  script.onload = load;
  script.onerror = load;
  document.body.appendChild(script);
}

export function Bedankt() {
  const params = new URLSearchParams(window.location.search);
  const vak = (params.get('vak') ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const sessie = (params.get('sessie') ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 200);

  const src = logoFormId
    ? `https://tally.so/embed/${encodeURIComponent(logoFormId)}?` +
      new URLSearchParams({
        hideTitle: '1',
        transparentBackground: '1',
        dynamicHeight: '1',
        vak,
        sessie,
      }).toString()
    : undefined;

  useEffect(() => {
    if (src) loadTallyEmbeds();
  }, [src]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <a href="/" className="font-semibold text-oranje underline">
        ← Muur van Het Hoekhuus
      </a>
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-extrabold text-navy">
          {vak ? `Gelukt! Vak ${vak} is van jou` : 'Gelukt! Bedankt voor je aankoop'}
        </h1>
        <p className="text-lg text-stone-700">
          Je betaling is binnen en je ontvangt de factuur per e-mail.
        </p>
      </header>
      <section
        aria-labelledby="nu-titel"
        className="rounded-xl border border-stone-300 bg-white p-5"
      >
        <h2 id="nu-titel" className="text-xl font-bold">
          Wat gebeurt er nu?
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-800">
          <li>Stuur hieronder je logo in. Liefst als SVG, PDF, AI of EPS.</li>
          <li>We beoordelen je logo binnen 5 werkdagen.</li>
          <li>
            In de regel binnen 14 dagen na goedkeuring hangt je logo op de muur. Je krijgt een foto
            als bewijs.
          </li>
        </ol>
      </section>
      <section aria-labelledby="logo-titel">
        <h2 id="logo-titel" className="mb-3 text-xl font-bold">
          Stuur je logo
        </h2>
        {src ? (
          <iframe
            data-tally-src={src}
            loading="lazy"
            width="100%"
            height="600"
            title={`Logo aanleveren voor vak ${vak}`}
            className="w-full border-0"
          />
        ) : (
          <div className="space-y-3 rounded-lg bg-amber-50 p-4">
            <p>
              Mail je logo naar <strong>info@hethoekhuus.nl</strong> met je vaknummer in het
              onderwerp. Liefst als SVG, PDF, AI of EPS.
            </p>
            <a
              href={`mailto:info@hethoekhuus.nl?subject=${encodeURIComponent(`Logo voor vak ${vak ?? ''}`)}`}
              className="btn-primary sm:w-auto"
            >
              Mail je logo
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
