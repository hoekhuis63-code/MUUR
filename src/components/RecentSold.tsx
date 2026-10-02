import type { Spot } from '../lib/types';

export function RecentSold({ spots }: { spots: Spot[] }) {
  const recent = spots
    .filter((s) => s.status === 'verkocht')
    .sort((a, b) => b.verkocht_op.localeCompare(a.verkocht_op))
    .slice(0, 5);

  return (
    <section aria-labelledby="recent-titel">
      <h2 id="recent-titel" className="section-title">
        Recent verkocht
      </h2>
      {recent.length === 0 ? (
        <p className="text-stone-700">Nog niemand op de muur. Wordt jouw bedrijf de eerste?</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {recent.map((spot) => {
            const content = (
              <>
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-white p-2">
                  {spot.logo_url ? (
                    <img
                      src={spot.logo_url}
                      alt={`Logo van ${spot.koper || spot.id}`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center font-bold">{spot.koper}</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold">{spot.koper || 'Anoniem'}</p>
                <p className="text-xs text-stone-600">Vak {spot.id}</p>
              </>
            );
            return (
              <li key={spot.id} className="rounded-lg border border-stone-300 bg-stone-50 p-2">
                {spot.website ? (
                  <a href={spot.website} target="_blank" rel="noopener" className="block">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
