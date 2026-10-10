import { TYPE_COLORS } from '../lib/colors';
import { TYPE_LABELS, euro, inclBtw } from '../lib/format';
import type { Spot, SpotType } from '../lib/types';

const ORDER: SpotType[] = ['xl', 'l', 'm', 'b', 't'];

/** Alle vrije vakken per prijsgroep als grote, tikbare kaarten. */
export function SpotList({ spots, onSelect }: { spots: Spot[]; onSelect: (id: string) => void }) {
  const groups = ORDER.map((type) => ({
    type,
    spots: spots.filter((s) => s.type === type && s.status === 'vrij'),
  })).filter((g) => g.spots.length > 0);

  if (groups.length === 0) {
    return <p className="rounded-lg bg-white p-4">Alle vakken zijn verkocht. Bedankt!</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map(({ type, spots: list }) => {
        const first = list[0]!;
        return (
          <section key={type} aria-labelledby={`lijst-${type}`}>
            <h3 id={`lijst-${type}`} className="mb-2 flex items-center gap-2 font-bold">
              <span
                className="inline-block h-4 w-4 rounded-sm border border-stone-800"
                style={{ background: TYPE_COLORS[type].fill }}
                aria-hidden="true"
              />
              {TYPE_LABELS[type]} · {first.w_cm} x {first.h_cm} cm · {euro(first.prijs_eur)} excl.
              btw ({inclBtw(first.prijs_eur)} incl.)
              <span className="font-normal text-stone-600">({list.length} vrij)</span>
            </h3>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
              {list.map((spot) => (
                <li key={spot.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(spot.id)}
                    className="flex min-h-11 w-full flex-col items-center justify-center rounded-lg border border-stone-300 bg-white px-2 py-2 font-bold hover:border-stone-900"
                    aria-label={`Vak ${spot.id}, ${euro(spot.prijs_eur)}`}
                  >
                    {spot.id}
                    <span className="text-xs font-medium text-stone-600">
                      {euro(spot.prijs_eur)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
