export type SpotType = 'spot' | 'xl' | 'l' | 'm' | 'b' | 't' | 'x';
export type SpotStatus = 'vrij' | 'bezet' | 'verkocht' | 'veiling' | 'geblokkeerd';

export const SPOT_TYPES: readonly SpotType[] = ['spot', 'xl', 'l', 'm', 'b', 't', 'x'];
export const SPOT_STATUSES: readonly SpotStatus[] = [
  'vrij',
  'bezet',
  'verkocht',
  'veiling',
  'geblokkeerd',
];

export interface Spot {
  id: string;
  type: SpotType;
  /** Linkerbovenhoek in cm, gemeten vanaf linksboven op de muur. */
  x_cm: number;
  y_cm: number;
  w_cm: number;
  h_cm: number;
  prijs_eur: number;
  status: SpotStatus;
  koper: string;
  website: string;
  logo_url: string;
  betaallink: string;
  /** ISO-datum (JJJJ-MM-DD), leeg als nog niet verkocht. */
  verkocht_op: string;
}

export interface Bid {
  tijd: string;
  bedrijf: string;
  bod_eur: number;
}

export interface SiteConfig {
  veiling_eind: string;
  startbod_eur: number;
  min_verhoging_eur: number;
  looptijd: string;
  bedrijfsnaam: string;
  adres: string;
  kvk: string;
  btw_nummer: string;
  contact_email: string;
  tiktok_url: string;
  instagram_url: string;
  facebook_url: string;
}

/** Echte, betaalde aankoop uit Stripe. koper is leeg zonder toestemming voor de naam. */
export interface Purchase {
  vak: string;
  koper: string;
  /** ISO-tijdstip van betalen. */
  tijd: string;
}

export interface WallData {
  spots: Spot[];
  bids: Bid[];
  config: SiteConfig;
  /** 'live' = uit de Google Sheet, 'fallback' = meegebakken public/spots.json. */
  source: 'live' | 'fallback';
  updatedAt: Date;
  /** Aankopen van de afgelopen dagen, nieuwste eerst (voor de melding linksonder). */
  recent: Purchase[];
}
