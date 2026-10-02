import type { SpotType } from './types';

const FREE = { fill: '#ffffff', text: '#073459' };

/** Vulkleur en tekstkleur per prijsgroep: rustig, één kleur voor vrije vakken. */
export const TYPE_COLORS: Record<SpotType, { fill: string; text: string }> = {
  spot: { fill: '#073459', text: '#ffffff' },
  xl: FREE,
  l: FREE,
  m: FREE,
  b: FREE,
  t: FREE,
  x: { fill: '#f1efeb', text: '#57534e' },
};

export const TAKEN_COLOR = { fill: '#d6d3d1', text: '#44403c' };
export const WALL_COLOR = '#f7f3ec';
export const LINE_COLOR = '#073459';
export const SELECTED_COLOR = '#e8570f';
