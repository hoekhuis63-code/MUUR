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

export const TYPE_LABELS: Record<SpotType, string> = {
  spot: 'The Spot',
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

/** Tekst voor schermlezers, bijv. "Vak T07, 20 bij 20 cm, €249, vrij". */
export function ariaLabel(spot: Spot): string {
  return `Vak ${spot.id}, ${spot.w_cm} bij ${spot.h_cm} cm, ${euro(spot.prijs_eur)}, ${STATUS_LABELS[spot.status]}`;
}
