// Lezen uit Stripe met de lees-sleutel (STRIPE_READ_KEY: Checkout Sessions: Read).

/** Haalt een Checkout Session op; null als die niet bestaat of de sleutel ontbreekt. */
export async function haalSessie(sessieId) {
  const key = process.env.STRIPE_READ_KEY;
  if (!key || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessieId ?? '')) return null;
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessieId)}`,
    { headers: { Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) return null;
  return res.json();
}

/** Is dit een betaalde sessie voor precies dit vak? Geeft koopgegevens of null. */
export async function betaaldVak(sessieId, vak) {
  const s = await haalSessie(sessieId);
  if (!s || s.payment_status !== 'paid' || String(s.metadata?.vak ?? '') !== vak) return null;
  const cd = s.customer_details ?? {};
  return {
    vak,
    koper: (cd.business_name || cd.name || '').trim(),
    email: cd.email || '',
    livemode: Boolean(s.livemode),
  };
}
