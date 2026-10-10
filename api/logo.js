// Vercel Function: logo uploaden na betaling (vanaf /bedankt).
// 1) POST (handleUpload-protocol): de browser vraagt een upload-token. Alleen gegeven als `sessie`
//    een betaalde Stripe-checkout is voor precies dit vak. Het bestand gaat daarna rechtstreeks
//    van de browser naar een privé Blob-store.
// 2) POST ?klaar=1: de browser meldt dat de upload klaar is -> mail met het logo als bijlage.

import { get } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { meldingAdres, stuurMail, tabelHtml } from './_lib/mail.js';
import { betaaldVak } from './_lib/stripe.js';

export const TOEGESTAAN = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/postscript',
  'application/illustrator',
  'application/eps',
];
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_BIJLAGE = 15 * 1024 * 1024;

function leesPayload(raw) {
  try {
    const p = JSON.parse(raw ?? '{}');
    return {
      vak: String(p.vak ?? '')
        .replace(/[^0-9A-Za-z]/g, '')
        .slice(0, 10),
      sessie: String(p.sessie ?? '').slice(0, 200),
      opmerking: String(p.opmerking ?? '').slice(0, 1000),
    };
  } catch {
    return { vak: '', sessie: '', opmerking: '' };
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ongeldige invoer.' }, 400);
  }

  if (url.searchParams.get('klaar')) return klaar(body);

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { vak, sessie } = leesPayload(clientPayload);
        if (!pathname.startsWith(`logos/${vak}/`)) throw new Error('Ongeldig pad.');
        const koop = await betaaldVak(sessie, vak);
        if (!koop) throw new Error('Geen betaalde bestelling gevonden voor dit vak.');
        return {
          allowedContentTypes: TOEGESTAAN,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return json(result, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Upload geweigerd.' }, 400);
  }
}

async function klaar(body) {
  const { vak, sessie, opmerking } = leesPayload(JSON.stringify(body));
  const pathname = String(body?.pathname ?? '');
  if (!pathname.startsWith(`logos/${vak}/`)) return json({ error: 'Ongeldig pad.' }, 400);
  const koop = await betaaldVak(sessie, vak);
  if (!koop) return json({ error: 'Geen betaalde bestelling gevonden voor dit vak.' }, 403);

  const file = await get(pathname, { access: 'private', useCache: false });
  if (file?.statusCode !== 200) return json({ error: 'Bestand niet gevonden.' }, 404);
  const buffer = Buffer.from(await new Response(file.stream).arrayBuffer());
  const naam = pathname.split('/').pop();
  const bijlage = buffer.length <= MAX_BIJLAGE;

  await stuurMail({
    to: meldingAdres(),
    replyTo: koop.email || undefined,
    subject: `Logo ontvangen voor vak ${vak}${koop.koper ? ` (${koop.koper})` : ''}`,
    html:
      tabelHtml(`Logo voor vak ${vak}`, [
        ['Vak', vak],
        ['Koper', koop.koper || '-'],
        ['E-mail', koop.email || '-'],
        ['Bestand', naam],
        ['Grootte', `${(buffer.length / 1024 / 1024).toFixed(2)} MB`],
        ['Wens / opmerking', opmerking || '-'],
        ['Modus', koop.livemode ? 'live' : 'TEST'],
      ]) +
      (bijlage
        ? ''
        : `<p style="font-family:system-ui,sans-serif">Bestand te groot voor bijlage: download het in Vercel → Storage → Blob → ${pathname}.</p>`),
    attachments: bijlage ? [{ filename: naam, content: buffer.toString('base64') }] : undefined,
  });
  return json({ ok: true }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
