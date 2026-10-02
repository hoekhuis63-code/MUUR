// Projectie van muurcoördinaten (cm) naar pixels op de foto (1536 x 1152).
// Homografie uit de vier hoeken van de getekende muur op de foto.
const H: readonly [number, number, number, number, number, number, number, number, number] = [
  4.3355539, 0.63156836, 127, 0.11387724, 4.3526438, 156, 0.00029191616, 0.000844026, 1,
];

export const PHOTO = { src: '/muur-foto.jpg', width: 1536, height: 1152 };

export function toPhoto(x: number, y: number): [number, number] {
  const w = H[6] * x + H[7] * y + H[8];
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}
