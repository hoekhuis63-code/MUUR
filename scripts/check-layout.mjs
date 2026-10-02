// Controleert de muurindeling: overlap, vakken buiten de muur en dubbele ID's.
// Gebruik: npm run check:layout [-- pad/naar/spots.csv]
import { readFileSync } from 'node:fs';
import { readCsvFile, toSpot, checkLayout, WALL } from './lib/spots.mjs';

const files = process.argv[2] ? [process.argv[2]] : ['data/spots.csv', 'public/spots.json'];
let failed = false;

for (const file of files) {
  const raw = file.endsWith('.json') ? JSON.parse(readFileSync(file, 'utf8')) : readCsvFile(file);
  const spots = [];
  const errors = [];
  for (const row of raw) {
    const { spot, error } = toSpot(
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? '')])),
    );
    if (error) errors.push(error);
    else spots.push(spot);
  }
  errors.push(...checkLayout(spots));

  const counts = {};
  for (const s of spots) counts[s.type] = (counts[s.type] ?? 0) + 1;
  const area = spots.reduce((sum, s) => sum + s.w_cm * s.h_cm, 0);
  console.log(`\n${file}: ${spots.length} vakken`, counts);
  console.log(
    `  bezette oppervlakte ${(area / 10000).toFixed(2)} m² van ${((WALL.width * WALL.height) / 10000).toFixed(2)} m²`,
  );
  if (errors.length) {
    failed = true;
    for (const e of errors) console.error(`  ✗ ${e}`);
  } else {
    console.log("  ✓ geen overlap, alles binnen de muur, geen dubbele ID's");
  }
}

process.exit(failed ? 1 : 0);
