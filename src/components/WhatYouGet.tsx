const ITEMS = [
  'Je logo, naam of foto 3 maanden op onze muur',
  'In beeld in elke video die we bij de muur opnemen',
  'Je komt in onze volgende video',
  'Een vermelding op onze socials',
  'Je mag een keer langskomen bij Het Hoekhuus',
  'Een biertje zodra onze bar af is (die is nog niet af, dus even geduld)',
];

export function WhatYouGet() {
  return (
    <section
      id="wat-krijg-je"
      aria-labelledby="krijg-titel"
      className="card scroll-mt-20 p-5 sm:p-8"
    >
      <h2 id="krijg-titel" className="font-display text-2xl font-extrabold text-navy sm:text-3xl">
        Wat krijg je?
      </h2>
      <ol className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {ITEMS.map((item, i) => (
          <li key={item} className="flex gap-3">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full bg-merk-oranje font-display text-sm font-extrabold text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="pt-0.5 font-semibold text-ink">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
