export function Hero({ vrij, totaal }: { vrij?: number; totaal?: number }) {
  return (
    <header className="relative overflow-hidden bg-lichtblauw">
      <div className="relative mx-auto grid max-w-5xl items-center gap-6 px-4 pt-8 pb-10 sm:grid-cols-[1fr_auto] sm:gap-10 sm:pt-14 sm:pb-16">
        <div className="order-2 space-y-5 sm:order-1">
          <p className="eyebrow">Muur van Het Hoekhuus</p>
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-navy sm:text-6xl">
            Koop een stukje van <span className="text-oranje">onze muur</span>
          </h1>
          <p className="max-w-xl text-lg text-ink sm:text-xl">
            Vier vrienden, één oud café, en een verbouwing die onder de €100.000 moet blijven. Help
            mee en word een stukje van Het Hoekhuus. Vanaf €25.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#muur" className="btn-primary sm:w-auto">
              Kies je vak
            </a>
            <a href="#veiling" className="btn-secondary min-h-12 sm:w-auto sm:px-6">
              Bied op het grote vlak
            </a>
          </div>
          {vrij !== undefined && (
            <p className="font-semibold text-navy">
              Nog {vrij} van de {totaal} vakken vrij{' '}
              <span className="font-normal text-ink/70">· prijzen excl. btw</span>
            </p>
          )}
        </div>
        <img
          src="/logo-320.webp"
          srcSet="/logo-320.webp 320w, /logo-640.webp 640w"
          sizes="340px"
          width={320}
          height={320}
          alt="Logo van Het Hoekhuus: het pand met de letters HHH"
          fetchPriority="high"
          className="order-1 mx-auto hidden h-auto w-[340px] sm:order-2 sm:block"
        />
      </div>
    </header>
  );
}
