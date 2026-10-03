// Mail versturen via Resend (https://resend.com), zonder extra package.
// Env: RESEND_API_KEY (verplicht om te mailen), MELDING_EMAIL (ontvanger meldingen, standaard
// info@hethoekhuus.nl), RESEND_FROM (afzender; alleen nodig na domeinverificatie bij Resend).
// Zonder RESEND_API_KEY wordt er niets verstuurd en alleen gelogd: de opslag gaat altijd voor.

const DEFAULT_FROM = 'Muur van Het Hoekhuus <onboarding@resend.dev>';

export const meldingAdres = () => process.env.MELDING_EMAIL || 'info@hethoekhuus.nl';

/** Mag er naar anderen dan het eigen adres gemaild worden? Alleen met geverifieerd domein. */
export const kanKlantMailen = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);

export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/** Tabel met label/waarde-paren als eenvoudige HTML-mail. */
export function tabelHtml(titel, rijen) {
  const rows = rijen
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join('');
  return `<div style="font-family:system-ui,sans-serif"><h2 style="color:#073459">${escapeHtml(titel)}</h2><table>${rows}</table></div>`;
}

export async function stuurMail({ to, subject, html, replyTo, attachments }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[mail] RESEND_API_KEY ontbreekt, mail niet verstuurd:', subject);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || DEFAULT_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
      }),
    });
    if (!res.ok) {
      console.error('[mail] Resend', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[mail]', error);
    return false;
  }
}
