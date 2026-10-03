import type { ReactNode } from 'react';

export function Hero({ progress }: { progress: ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-lichtblauw">
      <div className="relative mx-auto grid max-w-5xl items-center gap-6 px-4 pt-4 pb-12 sm:grid-cols-[1fr_auto] sm:gap-10 sm:pt-14 sm:pb-16">
        <div className="order-2 space-y-5 sm:order-1">
          <p className="eyebrow">Muur van Het Hoekhuus</p>
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-navy sm:text-6xl">
            Koop een stukje van <span className="text-oranje">het Hoekhuus</span>
          </h1>
          <p className="max-w-xl text-lg text-ink sm:text-xl">
            Vier vrienden, één pand van €500.000. We verbouwen het voor minder dan €100.000, en deze
            muur helpt daarbij. Kies een vak, betaal, en wij plakken jouw logo erop.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#muur" className="btn-primary sm:w-auto">
              Kies je vak
            </a>
            <a href="#veiling" className="btn-secondary min-h-12 sm:w-auto sm:px-6">
              Bied op The Spot
            </a>
          </div>
          <dl className="grid grid-cols-3 gap-2 pt-2">
            {[
              ['94', 'vakken'],
              ['€75', 'vanaf, excl. btw'],
              ['1,1M+', 'views op onze start'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/70 px-3 py-3 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-xl font-extrabold text-navy sm:text-2xl">
                  {value}
                </dd>
                <dd className="text-xs text-ink/75 sm:text-sm" aria-hidden="true">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
          <div className="rounded-2xl bg-white/80 p-4">{progress}</div>
        </div>
        <img
          src="/logo-320.webp"
          srcSet="/logo-320.webp 320w, /logo-640.webp 640w"
          sizes="(min-width: 640px) 340px, 130px"
          width={320}
          height={320}
          alt="Logo van Het Hoekhuus: het pand met de letters HHH"
          fetchPriority="high"
          className="order-1 mx-auto h-auto w-[130px] sm:order-2 sm:w-[340px]"
        />
      </div>
    </header>
  );
}
