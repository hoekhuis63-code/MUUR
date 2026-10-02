import type { SiteConfig } from '../lib/types';

export function Footer({ config }: { config: SiteConfig }) {
  const details = [
    config.adres,
    config.kvk && `KvK ${config.kvk}`,
    config.btw_nummer && `Btw ${config.btw_nummer}`,
  ].filter(Boolean);

  return (
    <footer className="mt-16 bg-stone-900 px-4 py-10 text-stone-300">
      <div className="mx-auto max-w-5xl space-y-3 text-sm">
        <p className="text-base font-bold text-white">{config.bedrijfsnaam}</p>
        {details.length > 0 && <p>{details.join(' · ')}</p>}
        {config.contact_email && (
          <p>
            <a href={`mailto:${config.contact_email}`} className="underline">
              {config.contact_email}
            </a>
          </p>
        )}
        <nav aria-label="Juridisch" className="flex gap-4">
          <a href="/voorwaarden" className="underline">
            Voorwaarden
          </a>
          <a href="/privacy" className="underline">
            Privacy
          </a>
        </nav>
        <p className="text-stone-400">
          Alle prijzen zijn exclusief btw. Deze site gebruikt geen cookies.
        </p>
      </div>
    </footer>
  );
}
