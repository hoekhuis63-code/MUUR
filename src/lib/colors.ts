import type { SpotType } from './types';

/** Vulkleur en tekstkleur per prijsgroep (contrast ≥ 4.5:1). */
export const TYPE_COLORS: Record<SpotType, { fill: string; text: string }> = {
  spot: { fill: '#2b6cb0', text: '#ffffff' },
  xl: { fill: '#ee7330', text: '#1f2429' },
  l: { fill: '#fd9203', text: '#1f2429' },
  m: { fill: '#f5c518', text: '#1f2429' },
  b: { fill: '#5cc17a', text: '#1f2429' },
  t: { fill: '#2b6cb0', text: '#ffffff' },
  x: { fill: '#d6d3d1', text: '#1c1917' },
};

export const TAKEN_COLOR = { fill: '#a8a29e', text: '#1c1917' };
export const WALL_COLOR = '#f7f3ec';
