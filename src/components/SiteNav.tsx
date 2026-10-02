export function SiteNav() {
  return (
    <nav
      aria-label="Hoofdmenu"
      className="sticky top-0 z-30 border-b border-navy/10 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <a href="/" className="flex items-center gap-2.5" aria-label="Het Hoekhuus, naar de muur">
          <img src="/icon-96.png" alt="" width={36} height={36} className="rounded-lg" />
          <span className="font-display text-lg leading-none font-extrabold text-navy">
            Het Hoekhuus
            <span className="block text-xs font-bold tracking-wider text-oranje uppercase">
              De muur
            </span>
          </span>
        </a>
        <div className="flex items-center gap-1 sm:gap-4">
          <a
            href="#veiling"
            className="hidden px-2 font-semibold text-navy hover:text-oranje sm:inline"
          >
            The Spot
          </a>
          <a
            href="#zo-werkt-het"
            className="hidden px-2 font-semibold text-navy hover:text-oranje sm:inline"
          >
            Zo werkt het
          </a>
          <a href="#muur" className="btn-primary min-h-10 w-auto px-5 text-base">
            Kies je vak
          </a>
        </div>
      </div>
    </nav>
  );
}
