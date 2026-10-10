import type { Spot, SpotStatus, SpotType } from './types';

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** €1.999 (Nederlandse notatie, zonder centen). */
export function euro(amount: number): string {
  return euroFormatter.format(amount).replace(/\s/g, '');
}

const BTW = 0.21;
const centFormatter = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

/** Bedrag inclusief 21% btw, met centen: €30,25. Voor particulieren verplicht te tonen. */
export function inclBtw(amount: number): string {
  return centFormatter.format(Math.round(amount * (1 + BTW) * 100) / 100).replace(/\s/g, '');
}

export const TYPE_LABELS: Record<SpotType, string> = {
  spot: 'Het grote vlak',
  xl: 'Extra groot',
  l: 'Groot',
  m: 'Vierkant',
  b: 'Balk',
  t: 'Tegel',
  x: 'Speciaal vak',
};

export const STATUS_LABELS: Record<SpotStatus, string> = {
  vrij: 'vrij',
  bezet: 'bezet',
  verkocht: 'verkocht',
  veiling: 'in de veiling',
  geblokkeerd: 'nog niet te koop',
};

export function size(spot: Spot): string {
  return `${spot.w_cm} x ${spot.h_cm} cm`;
}

/** Tekst voor schermlezers, bijv. "Vak 7, 15 bij 15 cm, €25, vrij". */
export function ariaLabel(spot: Spot): string {
  return `Vak ${spot.id}, ${spot.w_cm} bij ${spot.h_cm} cm, ${euro(spot.prijs_eur)}, ${STATUS_LABELS[spot.status]}`;
}
