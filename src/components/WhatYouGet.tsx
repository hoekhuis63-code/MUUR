const ITEMS = [
  ['Je logo, naam of foto 3 maanden op onze muur', 'Echte muur, echte sticker. Geen pixels.'],
  [
    'In beeld in elke video die we bij de muur opnemen',
    'En daar staan we vaak. Er moet nog veel gebeuren.',
  ],
  ['Je komt in onze volgende video', 'Kort, maar je zit erin.'],
  ['Een vermelding op onze socials', 'Instagram en TikTok. Met naam en al.'],
  [
    'Je mag een keer langskomen bij Het Hoekhuus',
    'Kijken of je recht hangt. Koffie is er. Een stoel misschien.',
  ],
  ['Een biertje zodra onze bar af is', 'Dat kan nog even duren.'],
] as const;

export function WhatYouGet() {
  return (
    <section id="wat-krijg-je" aria-labelledby="krijg-titel" className="scroll-mt-20">
      <p className="eyebrow">Voor elk vak, vanaf €25</p>
      <h2
        id="krijg-titel"
        className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl"
      >
        Wat krijg je?
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(([title, text], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span
              className="w-7 shrink-0 font-display text-4xl leading-none font-extrabold text-oranje-licht/90"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-lg leading-snug font-extrabold text-navy">
                {title}
              </h3>
              <p className="mt-1 text-ink/80">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
