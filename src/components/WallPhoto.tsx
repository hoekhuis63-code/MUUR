import { PHOTO, toPhoto } from '../lib/photo';
import type { Spot } from '../lib/types';

/** De echte muur op de foto, met het gekozen vak gemarkeerd. */
export function WallPhoto({ spot }: { spot: Spot }) {
  const { x_cm: x, y_cm: y, w_cm: w, h_cm: h } = spot;
  const corners = [toPhoto(x, y), toPhoto(x + w, y), toPhoto(x + w, y + h), toPhoto(x, y + h)];
  const points = corners.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  // Inzoomen rond het vak, maar nooit kleiner dan een derde van de foto.
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const vw = Math.max(PHOTO.width / 2.2, (Math.max(...xs) - Math.min(...xs)) * 2.2);
  const vh = vw * (PHOTO.height / PHOTO.width);
  const vx = Math.min(Math.max(cx - vw / 2, 0), PHOTO.width - vw);
  const vy = Math.min(Math.max(cy - vh / 2, 0), PHOTO.height - vh);

  return (
    <figure className="mt-4">
      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className="block w-full rounded-xl bg-stone-200"
        role="img"
        aria-label={`Vak ${spot.id} op de foto van de echte muur`}
      >
        <image href={PHOTO.src} width={PHOTO.width} height={PHOTO.height} />
        <path
          d={`M0 0H${PHOTO.width}V${PHOTO.height}H0Z M${points.split(' ').join(' L')}Z`}
          fill="rgba(7,52,89,0.45)"
          fillRule="evenodd"
        />
        <polygon
          points={points}
          fill="none"
          stroke="#e8570f"
          strokeWidth={vw / 160}
          strokeLinejoin="round"
        />
      </svg>
      <figcaption className="mt-1.5 text-sm text-stone-600">
        Zo zit vak {spot.id} op de echte muur.{' '}
        <a href={PHOTO.src} target="_blank" rel="noopener" className="underline">
          Hele foto
        </a>
      </figcaption>
    </figure>
  );
}
