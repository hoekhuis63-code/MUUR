import type { SpotType } from './types';

/** Vulkleur en tekstkleur per prijsgroep (contrast ≥ 4.5:1). */
export const TYPE_COLORS: Record<SpotType, { fill: string; text: string }> = {
  spot: { fill: '#dc2626', text: '#ffffff' },
  xl: { fill: '#ea580c', text: '#1c1917' },
  l: { fill: '#fb923c', text: '#1c1917' },
  m: { fill: '#facc15', text: '#1c1917' },
  b: { fill: '#4ade80', text: '#1c1917' },
  t: { fill: '#2563eb', text: '#ffffff' },
  x: { fill: '#d6d3d1', text: '#1c1917' },
};

export const TAKEN_COLOR = { fill: '#a8a29e', text: '#1c1917' };
export const WALL_COLOR = '#f5f0e8';
