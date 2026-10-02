import { useEffect } from 'react';
import { TYPE_COLORS } from '../lib/colors';
import { WALL_HEIGHT_CM, WALL_WIDTH_CM } from '../lib/data';
import { euro } from '../lib/format';
import type { Spot } from '../lib/types';
import { useWallData } from '../lib/useWallData';

/** Printpagina voor de fysieke muur: uitzettekening met maten en labels per vrij vak. */
export function PrintPage() {
  const { state } = useWallData();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (state.status !== 'ready') {
    return <p className="p-8">{state.status === 'error' ? 'Laden mislukt.' : 'Laden…'}</p>;
  }
  const spots = [...state.data.spots].sort(
    (a, b) => a.y_cm - b.y_cm || a.x_cm - b.x_cm || a.id.localeCompare(b.id),
  );
  const labels = spots.filter((s) => s.status === 'vrij' || s.status === 'veiling');

  return (
    <main className="print-page mx-auto max-w-4xl space-y-8 bg-white p-6 text-black">
      <div className="no-print space-y-2 rounded-lg bg-lichtblauw p-4">
        <p className="font-bold">
          Printen op 100% (werkelijke grootte), niet &quot;passend maken&quot;.
        </p>
        <p>Pagina 1: uitzettekening. Daarna: één label per vrij vak, op ware maat.</p>
        <button type="button" className="btn-primary w-auto" onClick={() => window.print()}>
          Printen
        </button>
      </div>

      <section className="print-sheet">
        <h1 className="font-display text-2xl font-extrabold">
          Uitzettekening muur {WALL_WIDTH_CM} x {WALL_HEIGHT_CM} cm
        </h1>
        <p className="text-sm">
          Maten in cm, gemeten vanaf linksboven. Stand: {new Date().toLocaleDateString('nl-NL')}.
        </p>
        <svg
          viewBox={`-6 -6 ${WALL_WIDTH_CM + 12} ${WALL_HEIGHT_CM + 12}`}
          className="mt-3 w-full border border-black"
          role="img"
          aria-label="Uitzettekening"
        >
          <rect
            width={WALL_WIDTH_CM}
            height={WALL_HEIGHT_CM}
            fill="#fff"
            stroke="#000"
            strokeWidth={0.6}
          />
          {spots.map((s) => (
            <g key={s.id}>
              <rect
                x={s.x_cm}
                y={s.y_cm}
                width={s.w_cm}
                height={s.h_cm}
                fill={TYPE_COLORS[s.type].fill}
                fillOpacity={0.25}
                stroke="#000"
                strokeWidth={0.4}
              />
              <text
                x={s.x_cm + s.w_cm / 2}
                y={s.y_cm + s.h_cm / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(6, s.w_cm / 3.2)}
                fontWeight={700}
              >
                {s.id}
              </text>
            </g>
          ))}
        </svg>
        <table className="mt-4 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-black text-left">
              {['Vak', 'x', 'y', 'breedte', 'hoogte', 'rechts (x+b)', 'onder (y+h)'].map((h) => (
                <th key={h} className="py-1 pr-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spots.map((s) => (
              <tr key={s.id} className="border-b border-gray-300">
                <td className="py-0.5 pr-2 font-bold">{s.id}</td>
                <td className="pr-2">{s.x_cm}</td>
                <td className="pr-2">{s.y_cm}</td>
                <td className="pr-2">{s.w_cm}</td>
                <td className="pr-2">{s.h_cm}</td>
                <td className="pr-2">{s.x_cm + s.w_cm}</td>
                <td className="pr-2">{s.y_cm + s.h_cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-labels flex flex-wrap gap-[0.5cm]">
        {labels.map((s) => (
          <Label key={s.id} spot={s} />
        ))}
      </section>
    </main>
  );
}

function Label({ spot }: { spot: Spot }) {
  // Label past ruim binnen het vak (2 cm marge) en op een A4 (max 18 x 12 cm).
  const w = Math.min(spot.w_cm - 4, 18);
  const h = Math.min(spot.h_cm - 4, 12);
  const big = Math.min(w / 3.2, h / 2.2);
  return (
    <div
      className="label flex flex-col items-center justify-center border border-dashed border-gray-500 text-center"
      style={{ width: `${w}cm`, height: `${h}cm` }}
    >
      <div
        className="font-display leading-none font-extrabold text-navy"
        style={{ fontSize: `${big}cm` }}
      >
        {spot.id}
      </div>
      <div className="font-bold" style={{ fontSize: `${big * 0.42}cm` }}>
        {spot.status === 'veiling' ? `Bied vanaf ${euro(spot.prijs_eur)}` : euro(spot.prijs_eur)}
      </div>
      <div style={{ fontSize: `${big * 0.28}cm` }}>hethoekhuus.nl</div>
    </div>
  );
}
