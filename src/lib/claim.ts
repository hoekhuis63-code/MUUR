import { track } from '@vercel/analytics';
import type { Spot } from './types';

const BRON_KEY = 'muur_bron';

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: Record<string, string> }) => void) & {
      q?: unknown[];
    };
  }
}

function sanitize(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
}

/** Bewaart utm_source uit de URL waarmee de bezoeker binnenkwam (één keer per sessie). */
export function rememberSource(): void {
  const bron = sanitize(new URLSearchParams(window.location.search).get('utm_source') ?? '');
  if (!bron) return;
  try {
    if (!sessionStorage.getItem(BRON_KEY)) sessionStorage.setItem(BRON_KEY, bron);
  } catch {
    // sessionStorage niet beschikbaar (privémodus e.d.): dan wordt bron "direct".
  }
}

export function getSource(): string {
  try {
    return sanitize(sessionStorage.getItem(BRON_KEY) ?? '') || 'direct';
  } catch {
    return 'direct';
  }
}

export function claimUrl(spot: Spot, bron: string): string | undefined {
  try {
    const url = new URL(spot.betaallink);
    url.searchParams.set('client_reference_id', `${spot.id}-${bron}`);
    url.searchParams.set('locale', 'nl');
    return url.toString();
  } catch {
    return undefined;
  }
}

export function trackEvent(name: string, props: Record<string, string>): void {
  window.plausible?.(name, { props });
  track(name, props);
}

/** Laadt Plausible (cookieloos) alleen als VITE_PLAUSIBLE_DOMAIN gezet is. */
export function initAnalytics(): void {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (!domain) return;
  window.plausible =
    window.plausible ??
    Object.assign(
      (...args: unknown[]) => {
        (window.plausible!.q = window.plausible!.q ?? []).push(args);
      },
      { q: [] as unknown[] },
    );
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}
