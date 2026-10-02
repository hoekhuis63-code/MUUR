import { progress } from '../lib/data';
import { euro } from '../lib/format';
import type { Spot } from '../lib/types';

export function Progress({ spots }: { spots: Spot[] }) {
  const { raised, sold, total } = progress(spots);
  const percent = total > 0 ? Math.round((sold / total) * 100) : 0;
  return (
    <div>
      <p className="mb-2 font-semibold">
        {euro(raised)} opgehaald · {sold} van {total} vakken verkocht
      </p>
      <div
        className="h-3 overflow-hidden rounded-full bg-stone-300"
        role="progressbar"
        aria-label="Verkochte vakken"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={sold}
      >
        <div
          className="h-full rounded-full bg-red-600 transition-[width]"
          style={{ width: `${Math.max(percent, sold > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}
