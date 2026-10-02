import Papa from 'papaparse';
import { SPOT_STATUSES, SPOT_TYPES } from './types';
import type { Bid, SiteConfig, Spot, SpotStatus, SpotType, WallData } from './types';

export const WALL_WIDTH_CM = 320;
export const WALL_HEIGHT_CM = 230;
export const REFRESH_INTERVAL_MS = 60_000;
const FETCH_TIMEOUT_MS = 5_000;
const FALLBACK_URL = '/spots.json';

const env = {
  spots: import.meta.env.VITE_SPOTS_CSV_URL as string | undefined,
  bids: import.meta.env.VITE_BIDS_CSV_URL as string | undefined,
  config: import.meta.env.VITE_CONFIG_CSV_URL as string | undefined,
};

/** Gebruikt als het config-tabblad (deels) ontbreekt. */
export const DEFAULT_CONFIG: SiteConfig = {
  veiling_eind: '2026-10-18T20:00:00+02:00',
  startbod_eur: 5000,
  min_verhoging_eur: 250,
  looptijd: 'zolang het Hoekhuus van ons is, en minimaal 2 jaar',
  bedrijfsnaam: 'Het Hoekhuus',
  adres: '',
  kvk: '',
  btw_nummer: '',
  contact_email: '',
  tiktok_url: 'https://www.tiktok.com/@hethoekhuis',
  instagram_url: 'https://www.instagram.com/hethoekhuus/',
  facebook_url: '',
};

type RawRow = Record<string, unknown>;

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status} voor ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseCsv(text: string): RawRow[] {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase(),
  });
  return result.data;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

/** Accepteert "1999", "1.999", "1999,00" en "€ 1.999". */
function num(value: unknown): number {
  if (typeof value === 'number') return value;
  let s = str(value).replace(/[€\s]/g, '');
  if (s === '') return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return Number(s);
}

function isSafeUrl(url: string): boolean {
  return url === '' || /^https:\/\//i.test(url);
}

/** Logo's mogen ook in de repo staan (public/logos/T07.png -> /logos/T07.png). */
function isSafeLogo(url: string): boolean {
  return isSafeUrl(url) || /^\/logos\/[\w.-]+$/.test(url);
}

export function parseSpot(row: RawRow): Spot | string {
  const id = str(row.id).toUpperCase();
  const type = str(row.type).toLowerCase() as SpotType;
  const status = str(row.status).toLowerCase() as SpotStatus;
  if (!/^[A-Z0-9]+$/.test(id)) return `ongeldig id "${id}"`;
  if (!SPOT_TYPES.includes(type)) return `${id}: onbekend type "${type}"`;
  if (!SPOT_STATUSES.includes(status)) return `${id}: onbekende status "${status}"`;

  const x = num(row.x_cm);
  const y = num(row.y_cm);
  const w = num(row.w_cm);
  const h = num(row.h_cm);
  const prijs = num(row.prijs_eur);
  if (![x, y, w, h, prijs].every((n) => Number.isFinite(n) && n >= 0)) {
    return `${id}: maat, positie of prijs is geen geldig getal`;
  }
  if (w <= 0 || h <= 0 || x + w > WALL_WIDTH_CM || y + h > WALL_HEIGHT_CM) {
    return `${id}: valt (deels) buiten de muur`;
  }

  const spot: Spot = {
    id,
    type,
    x_cm: x,
    y_cm: y,
    w_cm: w,
    h_cm: h,
    prijs_eur: prijs,
    status,
    koper: str(row.koper),
    website: str(row.website),
    logo_url: str(row.logo_url),
    betaallink: str(row.betaallink),
    verkocht_op: str(row.verkocht_op),
  };
  for (const key of ['website', 'logo_url', 'betaallink'] as const) {
    if (!(key === 'logo_url' ? isSafeLogo : isSafeUrl)(spot[key])) {
      console.warn(`[muur] ${id}: ${key} genegeerd (moet met https:// beginnen)`);
      spot[key] = '';
    }
  }
  return spot;
}

export function parseSpots(rows: RawRow[]): Spot[] {
  const spots: Spot[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const result = parseSpot(row);
    if (typeof result === 'string') {
      console.warn(`[muur] rij overgeslagen: ${result}`);
    } else if (seen.has(result.id)) {
      console.warn(`[muur] rij overgeslagen: dubbel id ${result.id}`);
    } else {
      seen.add(result.id);
      spots.push(result);
    }
  }
  return spots;
}

export function parseBids(rows: RawRow[]): Bid[] {
  const bids: Bid[] = [];
  for (const row of rows) {
    const bid: Bid = { tijd: str(row.tijd), bedrijf: str(row.bedrijf), bod_eur: num(row.bod_eur) };
    if (bid.bedrijf && Number.isFinite(bid.bod_eur) && bid.bod_eur > 0) bids.push(bid);
    else console.warn('[muur] bod overgeslagen:', row);
  }
  return bids;
}

export function parseConfig(rows: RawRow[]): SiteConfig {
  const config: SiteConfig = { ...DEFAULT_CONFIG };
  for (const row of rows) {
    const key = str(row.key) as keyof SiteConfig;
    const value = str(row.value);
    if (!(key in DEFAULT_CONFIG) || value === '') continue;
    if (key === 'startbod_eur' || key === 'min_verhoging_eur') {
      const n = num(value);
      if (Number.isFinite(n) && n >= 0) config[key] = n;
      else console.warn(`[muur] config ${key} genegeerd: "${value}"`);
    } else if (key === 'veiling_eind' && Number.isNaN(Date.parse(value))) {
      console.warn(`[muur] config veiling_eind is geen geldige datum: "${value}"`);
    } else if (key.endsWith('_url') && !isSafeUrl(value)) {
      console.warn(`[muur] config ${key} genegeerd (moet met https:// beginnen)`);
    } else {
      (config as unknown as Record<string, string>)[key] = value;
    }
  }
  return config;
}

async function loadCsv<T>(url: string | undefined, parse: (rows: RawRow[]) => T): Promise<T> {
  if (!url) throw new Error('geen CSV-URL ingesteld');
  return parse(parseCsv(await fetchWithTimeout(url)));
}

async function loadFallbackSpots(): Promise<Spot[]> {
  const rows = JSON.parse(await fetchWithTimeout(FALLBACK_URL)) as RawRow[];
  return parseSpots(rows);
}

/**
 * Haalt vakken, biedingen en config op. Mislukt een bron, dan gebruiken we de vorige
 * stand (bij verversen) of de terugval. Gooit alleen een fout als er helemaal geen
 * bruikbare vakken zijn.
 */
export async function loadWallData(previous?: WallData): Promise<WallData> {
  const [spotsResult, bidsResult, configResult] = await Promise.allSettled([
    loadCsv(env.spots, parseSpots),
    loadCsv(env.bids, parseBids),
    loadCsv(env.config, parseConfig),
  ]);

  let spots: Spot[] | undefined;
  let source: WallData['source'] = 'live';
  if (spotsResult.status === 'fulfilled' && spotsResult.value.length > 0) {
    spots = spotsResult.value;
  } else {
    if (spotsResult.status === 'rejected' && env.spots) {
      console.warn('[muur] vakken ophalen mislukt:', spotsResult.reason);
    }
    if (previous) {
      spots = previous.spots;
      source = previous.source;
    } else {
      spots = await loadFallbackSpots();
      source = 'fallback';
    }
  }
  if (spots.length === 0) throw new Error('Geen geldige vakken gevonden');

  return {
    spots,
    bids: bidsResult.status === 'fulfilled' ? bidsResult.value : (previous?.bids ?? []),
    config:
      configResult.status === 'fulfilled'
        ? configResult.value
        : (previous?.config ?? DEFAULT_CONFIG),
    source,
    updatedAt:
      spotsResult.status === 'fulfilled' ? new Date() : (previous?.updatedAt ?? new Date()),
  };
}

export function isTaken(spot: Spot): boolean {
  return spot.status === 'bezet' || spot.status === 'verkocht';
}

export function progress(spots: Spot[]) {
  const forSale = spots.filter((s) => s.status !== 'geblokkeerd');
  const taken = forSale.filter(isTaken);
  return {
    raised: taken.reduce((sum, s) => sum + s.prijs_eur, 0),
    sold: taken.length,
    total: forSale.length,
  };
}

export function auctionState(bids: Bid[], config: SiteConfig, now: number) {
  const highest = bids.reduce<Bid | undefined>(
    (top, b) => (!top || b.bod_eur > top.bod_eur ? b : top),
    undefined,
  );
  const end = Date.parse(config.veiling_eind);
  return {
    highest,
    count: bids.length,
    current: highest?.bod_eur ?? config.startbod_eur,
    nextMinimum: highest ? highest.bod_eur + config.min_verhoging_eur : config.startbod_eur,
    end: Number.isNaN(end) ? undefined : end,
    closed: !Number.isNaN(end) && now >= end,
  };
}
