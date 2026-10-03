// Maakt per vrij vak op de muur een Stripe Payment Link aan (product + prijs + betaallink).
//
// Gebruik:
//   node scripts/create-payment-links.mjs [pad/naar/spots.csv] [--dry-run]
//
// Nodig in .env (of in de omgeving):
//   STRIPE_SECRET_KEY=sk_test_... (of sk_live_..., rk_test_..., rk_live_...)
//   SITE_URL=https://hethoekhuus.nl   (http://localhost mag alleen om te testen)
//
// Wat het doet:
//   - Alleen rijen met status "vrij", een lege kolom "betaallink" en prijs_eur > 0 krijgen een link.
//   - Elke Stripe-aanroep krijgt een idempotency key die afhangt van id, prijs, type, maten en
//     SITE_URL. Draai je het script (binnen 24 uur) opnieuw na een fout, dan maakt Stripe geen
//     dubbele producten/prijzen aan. Verandert er iets aan het vak, dan krijg je een nieuwe key.
//   - Het resultaat komt altijd in spots_met_links.csv in de projectmap (ook als er iets misgaat).
//     Plak daarna de kolom "betaallink" in de sheet.
//
// LET OP: consent_collection.terms_of_service werkt pas als je in het Stripe Dashboard een URL
// voor je algemene voorwaarden hebt ingevuld (Instellingen > Openbare gegevens). Anders weigert
// Stripe het aanmaken van de betaallink; het script herkent die fout en geeft een tip.
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';
import { readCsvFile, toCsv } from './lib/spots.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'spots_met_links.csv');

const TYPE_LABELS = {
  spot: 'The Spot',
  xl: 'extra groot',
  l: 'groot',
  m: 'vierkant',
  b: 'balk',
  t: 'tegel',
  x: 'speciaal vak',
};

const HERKOMST_OPTIES = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Via iemand', value: 'viaiemand' },
  { label: 'Anders', value: 'anders' },
];

function stop(message) {
  console.error(`\nFOUT: ${message}\n`);
  process.exit(1);
}

function toNumber(value) {
  return Number(String(value ?? '').replace(',', '.'));
}

// ---------- argumenten en omgeving ----------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const positional = args.filter((a) => !a.startsWith('--'));
const input = positional[0]
  ? resolve(process.cwd(), positional[0])
  : resolve(ROOT, 'data/spots.csv');

const secretKey = (process.env.STRIPE_SECRET_KEY ?? '').trim();
let siteUrl = (process.env.SITE_URL ?? '').trim();

if (!secretKey) stop('STRIPE_SECRET_KEY ontbreekt. Zet hem in .env of in de omgeving.');
const keyMatch = /^(sk|rk)_(test|live)_/.exec(secretKey);
if (!keyMatch) {
  stop('STRIPE_SECRET_KEY moet beginnen met sk_test_, sk_live_, rk_test_ of rk_live_.');
}
const mode = keyMatch[2];

if (!siteUrl) stop('SITE_URL ontbreekt (bijvoorbeeld https://hethoekhuus.nl).');
siteUrl = siteUrl.replace(/\/+$/, '');
const isHttps = /^https:\/\/[^/\s]+/.test(siteUrl);
const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(siteUrl);
if (!isHttps && !isLocalhost) {
  stop(
    `SITE_URL moet met https:// beginnen (alleen http://localhost mag om te testen): ${siteUrl}`,
  );
}

console.log('');
if (mode === 'live') {
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!!  LIVEMODUS: dit maakt ECHTE betaallinks aan waarmee klanten echt betalen.   !!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  if (isLocalhost) console.log('Let op: LIVEMODUS met een localhost-SITE_URL. Klopt dat wel?');
} else {
  console.log('TESTMODUS (testsleutel): er wordt niets echt afgerekend.');
}
if (dryRun)
  console.log('DRY-RUN: er worden geen Stripe-aanroepen gedaan en er wordt niets geschreven.');
console.log(`Invoer:   ${input}`);
console.log(`SITE_URL: ${siteUrl}\n`);

// ---------- Stripe-objecten ----------

const stripe = dryRun ? null : new Stripe(secretKey);

function idempotencyKey(row, kind) {
  const fingerprint = JSON.stringify([
    row.id,
    toNumber(row.prijs_eur),
    row.type,
    toNumber(row.w_cm),
    toNumber(row.h_cm),
    siteUrl,
    'stripe-tax',
  ]);
  const hash = createHash('sha256').update(fingerprint).digest('hex').slice(0, 12);
  return `muur-${mode}-${row.id}-${kind}-${hash}`;
}

function productName(row) {
  const label = TYPE_LABELS[row.type] ?? row.type;
  return `Vak ${row.id} · ${label} ${row.w_cm} x ${row.h_cm} cm op de muur van Het Hoekhuus`;
}

function paymentLinkParams(row, priceId) {
  const vak = row.id;
  return {
    line_items: [{ price: priceId, quantity: 1 }],
    restrictions: { completed_sessions: { limit: 1 } },
    inactive_message: `Dit vak is net verkocht. Kies een ander vak op ${siteUrl}.`,
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${siteUrl}/bedankt?vak=${encodeURIComponent(vak)}&sessie={CHECKOUT_SESSION_ID}`,
      },
    },
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `Vak ${vak} op de muur van Het Hoekhuus`,
        metadata: { vak },
      },
    },
    name_collection: { business: { enabled: true, optional: false } },
    // Btw-nummer vragen, maar niet verplicht (required: 'if_supported' zou het verplicht maken).
    tax_id_collection: { enabled: true },
    billing_address_collection: 'required',
    consent_collection: { terms_of_service: 'required' },
    custom_fields: [
      {
        key: 'waarzagjeons',
        label: { type: 'custom', custom: 'Waar zag je ons?' },
        type: 'dropdown',
        dropdown: { options: HERKOMST_OPTIES },
      },
    ],
    // Stripe Tax: btw automatisch bovenop de prijs excl. btw (vereist Stripe Tax in het Dashboard).
    automatic_tax: { enabled: true },
    metadata: { vak },
  };
}

async function createLink(row) {
  const vak = row.id;
  const product = await stripe.products.create(
    // txcd_20030000 = 'General - Services' (Stripe Tax): 21% btw in NL, verlegd bij EU-bedrijven.
    { name: productName(row), tax_code: 'txcd_20030000', metadata: { vak } },
    { idempotencyKey: idempotencyKey(row, 'product') },
  );
  const price = await stripe.prices.create(
    {
      currency: 'eur',
      unit_amount: Math.round(toNumber(row.prijs_eur) * 100),
      tax_behavior: 'exclusive',
      product: product.id,
      metadata: { vak },
    },
    { idempotencyKey: idempotencyKey(row, 'price') },
  );
  try {
    const link = await stripe.paymentLinks.create(paymentLinkParams(row, price.id), {
      idempotencyKey: idempotencyKey(row, 'link'),
    });
    return link.url;
  } catch (err) {
    // In een Stripe-sandbox is de voorwaarden-URL niet in te stellen. Alleen in testmodus maken
    // we de link dan zonder verplicht vinkje, met de voorwaarden als tekst bij de betaalknop.
    if (mode !== 'test' || !isTermsOfServiceError(err)) throw err;
    const params = paymentLinkParams(row, price.id);
    delete params.consent_collection;
    const link = await stripe.paymentLinks.create(
      {
        ...params,
        custom_text: {
          submit: {
            message: `Door te betalen ga je akkoord met onze algemene voorwaarden: ${siteUrl}/voorwaarden`,
          },
        },
      },
      { idempotencyKey: idempotencyKey(row, 'link-zonder-vinkje') },
    );
    if (!tosFallbackShown) {
      tosFallbackShown = true;
      console.log(
        'ℹ Testmodus zonder voorwaarden-URL in Stripe: links gemaakt zonder verplicht vinkje,\n' +
          '  met de voorwaarden als tekst bij de betaalknop. In livemodus is het vinkje verplicht.',
      );
    }
    return link.url;
  }
}

let tosFallbackShown = false;

function isTermsOfServiceError(err) {
  const text = `${err?.param ?? ''} ${err?.message ?? ''}`;
  return /terms[_ ]of[_ ]service/i.test(text);
}

// ---------- hoofdprogramma ----------

let rows;
try {
  rows = readCsvFile(input);
} catch (err) {
  stop(`kan ${input} niet lezen: ${err.message}`);
}

const stats = { aangemaakt: 0, alLink: 0, nietVrij: 0, verkocht: 0, mislukt: 0, gedeactiveerd: 0 };
let tosHintShown = false;

// Vakken die al betaald zijn krijgen nooit een nieuwe link (anders dubbel verkocht).
// Bestaande actieve links per vak, zodat links met een oude prijs uitgezet worden.
const verkochteVakken = new Set();
const actieveLinks = new Map(); // vak -> [{ id, url }]
if (!dryRun) {
  for await (const s of stripe.checkout.sessions.list({ status: 'complete', limit: 100 })) {
    if (s.payment_status === 'paid' && s.metadata?.vak) verkochteVakken.add(String(s.metadata.vak));
  }
  for await (const l of stripe.paymentLinks.list({ active: true, limit: 100 })) {
    const vak = l.metadata?.vak;
    if (!vak) continue;
    if (!actieveLinks.has(vak)) actieveLinks.set(vak, []);
    actieveLinks.get(vak).push({ id: l.id, url: l.url });
  }
  console.log(
    `Stripe: ${verkochteVakken.size} vak(ken) al betaald, ${actieveLinks.size} vak(ken) met actieve link.\n`,
  );
}

/** Zet andere actieve links van dit vak uit (bijv. na een prijswijziging). */
async function deactiveerOude(vak, nieuweUrl) {
  for (const oud of actieveLinks.get(vak) ?? []) {
    if (oud.url === nieuweUrl) continue;
    await stripe.paymentLinks.update(oud.id, { active: false });
    stats.gedeactiveerd++;
    console.log(`  ↳ oude link uitgezet: ${oud.url}`);
  }
}

try {
  for (const row of rows) {
    const id = row.id || '(zonder id)';
    if ((row.betaallink ?? '') !== '') {
      stats.alLink++;
      continue;
    }
    const prijs = toNumber(row.prijs_eur);
    if (row.status !== 'vrij' || !(prijs > 0)) {
      stats.nietVrij++;
      continue;
    }
    if (verkochteVakken.has(String(row.id))) {
      console.log(`• ${id}: al betaald in Stripe, geen nieuwe link.`);
      stats.verkocht++;
      continue;
    }
    if (!TYPE_LABELS[row.type]) {
      console.error(`✗ ${id}: onbekend type "${row.type}", overgeslagen.`);
      stats.mislukt++;
      continue;
    }

    if (dryRun) {
      const bedrag = (Math.round(prijs * 100) / 100).toFixed(2);
      console.log(`[dry-run] ${id}: "${productName(row)}" voor € ${bedrag} excl. btw`);
      console.log(`          idempotency: ${idempotencyKey(row, 'link')}`);
      stats.aangemaakt++;
      continue;
    }

    try {
      const url = await createLink(row);
      row.betaallink = url;
      await deactiveerOude(String(row.id), url);
      stats.aangemaakt++;
      console.log(`✓ ${id}: ${url}`);
    } catch (err) {
      stats.mislukt++;
      console.error(`✗ ${id}: ${err?.message ?? err}`);
      if (isTermsOfServiceError(err) && !tosHintShown) {
        tosHintShown = true;
        console.error(
          '  Tip: vul in het Stripe Dashboard een URL voor je algemene voorwaarden in\n' +
            '  (Instellingen > Openbare gegevens) en draai het script daarna opnieuw.\n' +
            '  Al aangemaakte producten/prijzen worden dankzij de idempotency keys hergebruikt.',
        );
      }
    }
  }
} finally {
  if (dryRun) {
    console.log('\nDRY-RUN: spots_met_links.csv is niet geschreven.');
  } else {
    writeFileSync(OUTPUT, toCsv(rows), 'utf8');
    console.log(`\nGeschreven: ${OUTPUT}`);
  }
}

console.log('\nSamenvatting');
const summary = [
  [dryRun ? 'zou aanmaken' : 'aangemaakt', stats.aangemaakt],
  ['overgeslagen (al link)', stats.alLink],
  ['overgeslagen (niet vrij / prijs 0)', stats.nietVrij],
  ['overgeslagen (al betaald)', stats.verkocht],
  ['oude links uitgezet', stats.gedeactiveerd],
  ['mislukt', stats.mislukt],
];
for (const [label, n] of summary) console.log(`  ${(label + ':').padEnd(36)} ${n}`);
if (dryRun) {
  console.log('\nVolgende stap: draai het script zonder --dry-run om de links echt aan te maken.');
} else {
  console.log('\nVolgende stap: plak de kolom betaallink uit spots_met_links.csv in de sheet.');
}
if (stats.mislukt > 0) process.exitCode = 1;
