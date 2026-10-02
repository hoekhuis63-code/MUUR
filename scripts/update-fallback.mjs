// Ververst public/spots.json (de terugval als Google even hapert) met de actuele stand.
// Gebruik: npm run update:fallback              -> haalt VITE_SPOTS_CSV_URL uit .env op
//          npm run update:fallback -- spots.csv -> gebruikt een lokaal CSV-bestand
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseCsv, toSpot, checkLayout } from './lib/spots.mjs';

const source = process.argv[2] ?? process.env.VITE_SPOTS_CSV_URL;
if (!source) {
  console.error('Geef een CSV-bestand op of zet VITE_SPOTS_CSV_URL in .env');
  process.exit(1);
}

const text = /^https?:\/\//.test(source)
  ? await (await fetch(source)).text()
  : readFileSync(source, 'utf8');

const spots = [];
for (const row of parseCsv(text)) {
  const { spot, error } = toSpot(row);
  if (error) console.warn(`overgeslagen: ${error}`);
  else spots.push(spot);
}
const errors = checkLayout(spots);
if (errors.length || spots.length === 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error('public/spots.json NIET bijgewerkt.');
  process.exit(1);
}
writeFileSync('public/spots.json', JSON.stringify(spots, null, 2) + '\n');
console.log(`public/spots.json bijgewerkt met ${spots.length} vakken.`);
