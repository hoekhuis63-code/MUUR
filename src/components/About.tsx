import { ABOUT, SIGN_OFF } from '../content/site';
import type { SiteConfig } from '../lib/types';

export function About({ config }: { config: SiteConfig }) {
  const socials = [
    { label: 'TikTok', handle: '@hethoekhuis', url: config.tiktok_url },
    { label: 'Instagram', handle: '@hethoekhuus', url: config.instagram_url },
    { label: 'Facebook', handle: 'Het Hoekhuus', url: config.facebook_url },
  ].filter((s) => s.url);

  return (
    <section aria-labelledby="wij-titel" className="overflow-hidden rounded-3xl bg-lichtblauw">
      <div className="grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
        <img
          src="/logo-320.webp"
          alt=""
          width={320}
          height={320}
          loading="lazy"
          className="mx-auto h-auto w-40 sm:w-56"
        />
        <div>
          <p className="eyebrow">Wie zijn wij</p>
          <h2
            id="wij-titel"
            className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl"
          >
            Vier vrienden, één pand
          </h2>
          <div className="mt-4 space-y-3 text-lg text-ink">
            {ABOUT.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-4 font-display text-lg font-extrabold text-oranje-donker">{SIGN_OFF}</p>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold text-navy shadow-sm hover:text-oranje"
                  >
                    {s.label} <span className="text-sm font-normal text-ink/70">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
