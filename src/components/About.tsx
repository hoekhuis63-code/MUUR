import { ABOUT, SIGN_OFF } from '../content/site';
import type { SiteConfig } from '../lib/types';

export function About({ config }: { config: SiteConfig }) {
  const socials = [
    { label: 'TikTok', url: config.tiktok_url },
    { label: 'Instagram', url: config.instagram_url },
    { label: 'Facebook', url: config.facebook_url },
  ].filter((s) => s.url);

  return (
    <section aria-labelledby="wij-titel">
      <h2 id="wij-titel" className="section-title">
        Wie zijn wij
      </h2>
      <div className="space-y-3 text-lg text-stone-800">
        {ABOUT.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="font-semibold">{SIGN_OFF}</p>
      </div>
      {socials.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noopener" className="btn-secondary px-5">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
