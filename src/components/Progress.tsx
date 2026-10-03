import { progress } from '../lib/data';
import { euro } from '../lib/format';
import type { Spot } from '../lib/types';

export function Progress({ spots }: { spots: Spot[] }) {
  const { raised, sold, total } = progress(spots);
  const percent = total > 0 ? Math.round((sold / total) * 100) : 0;
  const laatste = spots
    .filter((s) => s.status === 'verkocht' && s.verkocht_op)
    .sort((a, b) => b.verkocht_op.localeCompare(a.verkocht_op))[0];
  return (
    <div>
      <p className="mb-2 font-semibold">
        {euro(raised)} opgehaald · {sold} van {total} vakken verkocht
      </p>
      <div
        className="h-3 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-label="Verkochte vakken"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={sold}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-oranje-licht to-merk-oranje transition-[width]"
          style={{ width: `${Math.max(percent, sold > 0 ? 2 : 0)}%` }}
        />
      </div>
      {laatste && (
        <p className="mt-2 flex items-center gap-2 text-sm text-ink/80">
          <span
            className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-merk-oranje"
            aria-hidden="true"
          />
          Laatst verkocht: vak {laatste.id}
          {laatste.koper ? ` aan ${laatste.koper}` : ''}
        </p>
      )}
    </div>
  );
}
