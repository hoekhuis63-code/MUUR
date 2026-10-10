import { TAKEN_COLOR, TYPE_COLORS } from '../lib/colors';
import { euro, inclBtw } from '../lib/format';
import type { Spot } from '../lib/types';

export function Legend({ spots }: { spots: Spot[] }) {
  const free = spots.filter((s) => s.status === 'vrij' && s.prijs_eur > 0);
  const min = free.length ? Math.min(...free.map((s) => s.prijs_eur)) : 0;
  const items: { key: string; color: string; label: string }[] = [
    {
      key: 'vrij',
      color: TYPE_COLORS.t.fill,
      label: `Beschikbaar · vanaf ${euro(min)} excl. btw (${inclBtw(min)} incl.)`,
    },
    { key: 'spot', color: TYPE_COLORS.spot.fill, label: 'Het grote vlak · veiling' },
    { key: 'bezet', color: TAKEN_COLOR.fill, label: 'Bezet' },
  ];

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700" aria-label="Legenda">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-sm border border-stone-800"
            style={{ background: item.color }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
      <li className="font-semibold text-navy">
        Nog {free.length} van {spots.filter((s) => s.prijs_eur > 0).length} vakken vrij
      </li>
      <li className="text-stone-600">Prijzen excl. btw</li>
    </ul>
  );
}
