// Gedeelde helpers voor de Node-scripts: CSV lezen/schrijven en vakken controleren.
import { readFileSync } from 'node:fs';
import Papa from 'papaparse';

export const WALL = { width: 320, height: 230 };
export const COLUMNS = [
  'id',
  'type',
  'x_cm',
  'y_cm',
  'w_cm',
  'h_cm',
  'prijs_eur',
  'status',
  'koper',
  'website',
  'logo_url',
  'betaallink',
  'verkocht_op',
];
export const TYPES = ['spot', 'xl', 'l', 'm', 'b', 't', 'x'];
export const STATUSES = ['vrij', 'bezet', 'verkocht', 'veiling', 'geblokkeerd'];
const NUMERIC = ['x_cm', 'y_cm', 'w_cm', 'h_cm', 'prijs_eur'];

export function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (v) => v.trim(),
  });
  return result.data;
}

export function readCsvFile(path) {
  return parseCsv(readFileSync(path, 'utf8'));
}

export function toCsv(rows) {
  return Papa.unparse(rows, { columns: COLUMNS, newline: '\n' }) + '\n';
}

/** Zet een ruwe rij om naar een vak, of geeft een foutmelding terug. */
export function toSpot(raw) {
  const id = raw.id ?? '';
  if (!/^[A-Za-z0-9]+$/.test(id)) return { error: `ongeldig id "${id}"` };
  if (!TYPES.includes(raw.type)) return { error: `${id}: onbekend type "${raw.type}"` };
  if (!STATUSES.includes(raw.status)) return { error: `${id}: onbekende status "${raw.status}"` };
  const spot = { ...raw };
  for (const key of NUMERIC) {
    const n = Number(String(raw[key] ?? '').replace(',', '.'));
    if (raw[key] === '' || !Number.isFinite(n) || n < 0) {
      return { error: `${id}: ${key} is geen geldig getal ("${raw[key]}")` };
    }
    spot[key] = n;
  }
  if (spot.w_cm <= 0 || spot.h_cm <= 0) return { error: `${id}: breedte/hoogte moet > 0 zijn` };
  for (const key of COLUMNS) spot[key] ??= '';
  return { spot };
}

/** Controleert dubbele ID's, vakken buiten de muur en overlap. Geeft een lijst fouten. */
export function checkLayout(spots) {
  const errors = [];
  const seen = new Set();
  for (const s of spots) {
    if (seen.has(s.id)) errors.push(`dubbel id: ${s.id}`);
    seen.add(s.id);
    if (s.x_cm + s.w_cm > WALL.width || s.y_cm + s.h_cm > WALL.height) {
      errors.push(`${s.id} valt buiten de muur (${WALL.width} x ${WALL.height} cm)`);
    }
  }
  for (let i = 0; i < spots.length; i++) {
    for (let j = i + 1; j < spots.length; j++) {
      const a = spots[i];
      const b = spots[j];
      const overlap =
        a.x_cm < b.x_cm + b.w_cm &&
        b.x_cm < a.x_cm + a.w_cm &&
        a.y_cm < b.y_cm + b.h_cm &&
        b.y_cm < a.y_cm + a.h_cm;
      if (overlap) errors.push(`${a.id} overlapt met ${b.id}`);
    }
  }
  return errors;
}
