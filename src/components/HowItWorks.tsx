import { STEPS } from '../content/site';

export function HowItWorks() {
  return (
    <section aria-labelledby="zo-titel">
      <h2 id="zo-titel" className="section-title">
        Zo werkt het
      </h2>
      <ol className="grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-xl border border-stone-300 bg-white p-4">
            <span
              className="grid h-8 w-8 place-items-center rounded-full bg-oranje font-bold text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h3 className="mt-2 font-bold">{step.title}</h3>
            <p className="text-stone-700">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
