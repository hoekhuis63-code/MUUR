import { STEPS } from '../content/site';

export function HowItWorks() {
  return (
    <section id="zo-werkt-het" aria-labelledby="zo-titel" className="scroll-mt-20">
      <p className="eyebrow">Zo werkt het</p>
      <h2 id="zo-titel" className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">
        In vier stappen op de muur
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card relative p-5">
            <span
              className="font-display text-5xl leading-none font-extrabold text-oranje-licht/90"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h3 className="mt-3 font-display text-lg font-extrabold text-navy">{step.title}</h3>
            <p className="mt-1 text-ink/80">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
