import { SIGN_OFF } from '../content/site';
import type { SiteConfig } from '../lib/types';

export function Footer({ config }: { config: SiteConfig }) {
  const details = [
    config.adres,
    config.kvk && `KvK ${config.kvk}`,
    config.btw_nummer && `Btw ${config.btw_nummer}`,
  ].filter(Boolean);
  const socials = [
    { label: 'TikTok', url: config.tiktok_url },
    { label: 'Instagram', url: config.instagram_url },
    { label: 'Facebook', url: config.facebook_url },
  ].filter((s) => s.url);

  return (
    <footer className="bg-navy text-blue-100">
      <div className="h-1.5 bg-gradient-to-r from-oranje-licht to-merk-oranje" aria-hidden="true" />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon-48.png"
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="rounded-lg"
            />
            <p className="font-display text-xl font-extrabold text-white">{config.bedrijfsnaam}</p>
          </div>
          <p className="font-display font-bold text-oranje-licht">{SIGN_OFF}</p>
          <p className="text-blue-200">
            Alle prijzen zijn exclusief btw. Deze site gebruikt geen cookies.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-white">Contact</p>
          {details.map((d) => (
            <p key={String(d)}>{d}</p>
          ))}
          {config.contact_email && (
            <p>
              <a href={`mailto:${config.contact_email}`} className="underline hover:text-white">
                {config.contact_email}
              </a>
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="font-bold text-white">Volg ons</p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  className="underline hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <nav aria-label="Juridisch" className="flex gap-4 pt-2">
            <a href="/voorwaarden" className="underline hover:text-white">
              Voorwaarden
            </a>
            <a href="/privacy" className="underline hover:text-white">
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
