import { TAKEN_COLOR, TYPE_COLORS } from '../lib/colors';
import { TYPE_LABELS, euro } from '../lib/format';
import type { Spot, SpotType } from '../lib/types';

const ORDER: SpotType[] = ['spot', 'xl', 'l', 'm', 'b', 't'];

export function Legend({ spots }: { spots: Spot[] }) {
  const items: { key: string; color: string; label: string }[] = ORDER.flatMap((type) => {
    const spot = spots.find((s) => s.type === type);
    if (!spot) return [];
    const price = type === 'spot' ? `vanaf ${euro(spot.prijs_eur)}` : euro(spot.prijs_eur);
    return [
      {
        key: type,
        color: TYPE_COLORS[type].fill,
        label: `${TYPE_LABELS[type]} ${spot.w_cm}x${spot.h_cm} · ${price}`,
      },
    ];
  });
  items.push({ key: 'bezet', color: TAKEN_COLOR.fill, label: 'Bezet' });
  items.push({ key: 'verkocht', color: '#ffffff', label: 'Verkocht (logo)' });

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
      <li className="text-stone-600">Prijzen excl. btw</li>
    </ul>
  );
}
