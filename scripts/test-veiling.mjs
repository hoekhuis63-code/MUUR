// Snelle test van de biedregels: node scripts/test-veiling.mjs
import assert from 'node:assert/strict';
import { controleerBod, minimumBod } from '../api/_lib/veiling.js';

const regels = { eind: Date.parse('2026-10-25T20:00:00+01:00'), startbod: 500, verhoging: 50 };
const nu = Date.parse('2026-10-05T12:00:00+02:00');
const goed = {
  bedrijf: 'Bakkerij De Hoek',
  kvk: '1234 5678',
  naam: 'Jan Jansen',
  email: 'jan@voorbeeld.nl',
  telefoon: '06 12345678',
  bod: '500',
  akkoord: true,
};

assert.equal(minimumBod(0, regels), 500);
assert.equal(minimumBod(700, regels), 750);
assert.equal(controleerBod(goed, 0, nu, regels).bod.bod_eur, 500);
assert.equal(controleerBod(goed, 0, nu, regels).bod.kvk, '12345678');
assert.match(controleerBod(goed, 600, nu, regels).fout, /minimaal €650/);
assert.match(controleerBod({ ...goed, bod: '499' }, 0, nu, regels).fout, /minimaal/);
assert.match(controleerBod({ ...goed, kvk: '123' }, 0, nu, regels).fout, /KvK/);
assert.match(controleerBod({ ...goed, email: 'x@' }, 0, nu, regels).fout, /e-mail/);
assert.match(controleerBod({ ...goed, akkoord: false }, 0, nu, regels).fout, /akkoord/i);
assert.match(controleerBod({ ...goed, website: 'spam' }, 0, nu, regels).fout, /Ongeldige/);
assert.match(controleerBod(goed, 0, regels.eind, regels).fout, /gesloten/);
console.log('✓ alle biedregels kloppen');
