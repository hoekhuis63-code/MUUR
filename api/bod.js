// Vercel Function: biedingen op het grote vlak.
// GET  /api/bod -> { biedingen: [{ tijd, bedrijf, bod_eur }] } (alleen openbare velden)
// POST /api/bod  (JSON) -> slaat een geldig bod privé op in Vercel Blob en mailt een melding.
// Env: BLOB_READ_WRITE_TOKEN (automatisch na koppelen Blob-store), RESEND_API_KEY.

import { get, list, put } from '@vercel/blob';
import { escapeHtml, kanKlantMailen, meldingAdres, stuurMail, tabelHtml } from './_lib/mail.js';
import { VEILING, controleerBod } from './_lib/veiling.js';

const PREFIX = 'biedingen/';

async function alleBiedingen() {
  const biedingen = [];
  let cursor;
  do {
    const res = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of res.blobs) {
      const file = await get(blob.pathname, { access: 'private', useCache: false });
      if (file?.statusCode !== 200) continue;
      try {
        biedingen.push(JSON.parse(await new Response(file.stream).text()));
      } catch {
        console.warn('[bod] onleesbaar bestand', blob.pathname);
      }
    }
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  return biedingen.sort((a, b) => a.tijd.localeCompare(b.tijd));
}

const openbaar = ({ tijd, bedrijf, bod_eur }) => ({ tijd, bedrijf, bod_eur });

export async function GET() {
  try {
    const biedingen = (await alleBiedingen()).map(openbaar);
    return json(
      { biedingen, eind: new Date(VEILING.eind).toISOString() },
      200,
      'public, s-maxage=10, stale-while-revalidate=30',
    );
  } catch (error) {
    console.error('[bod] lezen', error);
    return json({ error: 'Biedingen niet beschikbaar' }, 502, 'no-store');
  }
}

export async function POST(request) {
  let invoer;
  try {
    invoer = await request.json();
  } catch {
    return json({ fout: 'Ongeldige invoer.' }, 400);
  }

  let bestaande;
  try {
    bestaande = await alleBiedingen();
  } catch (error) {
    console.error('[bod] lezen', error);
    return json({ fout: 'Bieden lukt nu even niet. Probeer het zo opnieuw.' }, 503);
  }
  const hoogste = bestaande.reduce((max, b) => Math.max(max, b.bod_eur), 0);
  const { bod, fout } = controleerBod(invoer, hoogste);
  if (fout) return json({ fout }, 422);

  const tijd = new Date().toISOString();
  const record = { ...bod, tijd, ip: request.headers.get('x-forwarded-for')?.split(',')[0] ?? '' };
  try {
    await put(`${PREFIX}${tijd.replace(/[:.]/g, '-')}.json`, JSON.stringify(record, null, 2), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: true,
    });
  } catch (error) {
    console.error('[bod] opslaan', error);
    return json({ fout: 'Je bod kon niet worden opgeslagen. Probeer het opnieuw.' }, 503);
  }

  const bedrag = `€${bod.bod_eur.toLocaleString('nl-NL')} excl. btw`;
  await stuurMail({
    to: meldingAdres(),
    replyTo: bod.email,
    subject: `Nieuw bod op het grote vlak: ${bedrag} van ${bod.bedrijf}`,
    html:
      tabelHtml('Nieuw bod op het grote vlak', [
        ['Bod', bedrag],
        ['Bedrijf', bod.bedrijf],
        ['KvK', bod.kvk],
        ['Naam', bod.naam],
        ['E-mail', bod.email],
        ['Telefoon', bod.telefoon],
        ['Tijd', new Date(tijd).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })],
        ['Vorig hoogste bod', hoogste ? `€${hoogste.toLocaleString('nl-NL')}` : 'geen'],
      ]) +
      '<p style="font-family:system-ui,sans-serif;color:#555">Nepbod? Verwijder het bestand in Vercel → Storage → Blob → biedingen/.</p>',
  });
  if (kanKlantMailen()) {
    await stuurMail({
      to: bod.email,
      replyTo: meldingAdres(),
      subject: `Je bod op het grote vlak: ${bedrag}`,
      html: `<div style="font-family:system-ui,sans-serif"><p>Hoi ${escapeHtml(bod.naam)},</p><p>We hebben je bod van <strong>${bedrag}</strong> namens ${escapeHtml(bod.bedrijf)} ontvangen. Je bod is bindend (artikel 11 van onze voorwaarden). De veiling sluit op zondag 18 oktober om 20:00.</p><p>Volg de stand op <a href="https://hethoekhuus.nl/#veiling">hethoekhuus.nl</a>.</p><p>Het Hoekhuus</p></div>`,
    });
  }

  return json({ ok: true, bieding: openbaar(record) }, 201);
}

function json(data, status, cacheControl = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}
