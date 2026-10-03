// Vercel Function: welke vakken zijn in Stripe betaald, en door wie?
// GET /api/verkocht -> { verkocht: [{ vak, koper, verkocht_op }] }
// Leest alleen (sleutel STRIPE_READ_KEY: restricted key met "Checkout Sessions: Read").
// Kort gecachet aan de rand, zodat Stripe niet bij elke bezoeker wordt bevraagd.

const STRIPE_API = 'https://api.stripe.com/v1/checkout/sessions';

export async function GET() {
  const key = process.env.STRIPE_READ_KEY;
  if (!key) return json({ error: 'STRIPE_READ_KEY ontbreekt' }, 500, 'no-store');

  const perVak = new Map();
  let startingAfter;
  try {
    // Alle afgeronde checkouts; per vak telt de eerste betaling.
    for (let page = 0; page < 20; page++) {
      const params = new URLSearchParams({ status: 'complete', limit: '100' });
      if (startingAfter) params.set('starting_after', startingAfter);
      const res = await fetch(`${STRIPE_API}?${params}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(`Stripe ${res.status}`);
      const body = await res.json();
      for (const s of body.data) {
        const vak = s.metadata?.vak;
        if (!vak || s.payment_status !== 'paid') continue;
        const prev = perVak.get(vak);
        if (prev && prev.created <= s.created) continue;
        const cd = s.customer_details ?? {};
        perVak.set(vak, {
          vak,
          koper: (cd.business_name || cd.name || '').trim(),
          verkocht_op: new Date(s.created * 1000).toISOString().slice(0, 10),
          created: s.created,
        });
      }
      if (!body.has_more || body.data.length === 0) break;
      startingAfter = body.data[body.data.length - 1].id;
    }
  } catch (error) {
    console.error('[verkocht]', error);
    return json({ error: 'Stripe niet bereikbaar' }, 502, 'no-store');
  }

  // eslint-disable-next-line no-unused-vars
  const verkocht = [...perVak.values()].map(({ created: _created, ...rest }) => rest);
  return json({ verkocht }, 200, 'public, s-maxage=20, stale-while-revalidate=60');
}

function json(data, status, cacheControl) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}
