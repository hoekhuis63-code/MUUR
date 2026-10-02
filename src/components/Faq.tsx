import { faq } from '../content/site';

export function Faq({ looptijd }: { looptijd: string }) {
  return (
    <section aria-labelledby="faq-titel">
      <h2 id="faq-titel" className="section-title">
        Veelgestelde vragen
      </h2>
      <div className="divide-y divide-stone-300 rounded-xl border border-stone-300 bg-white">
        {faq(looptijd).map((item) => (
          <details key={item.q} className="group px-4">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold">
              {item.q}
              <span
                className="text-xl transition-transform group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="pb-4 text-stone-700">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
