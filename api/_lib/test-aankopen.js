// Eigen testbetalingen die niet als verkoop mogen tellen.
// Per vak: betalingen vóór dit moment worden genegeerd (het vak is daarna gewoon weer te koop).
// Gebruikt door api/verkocht.js (site) en scripts/create-payment-links.mjs (nieuwe links).
export const TEST_AANKOPEN = {
  27: '2026-10-11T00:00:00Z', // testaankoop door ons zelf (KWW Media), 3 okt
};

/** Telt deze betaalde checkout als echte verkoop? `created` in seconden (Stripe). */
export function isEchteVerkoop(vak, created) {
  const grens = TEST_AANKOPEN[String(vak)];
  return !grens || created * 1000 >= Date.parse(grens);
}
