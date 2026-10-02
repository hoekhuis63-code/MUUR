import { Suspense, lazy, useEffect } from 'react';
import { Home } from './pages/Home';

// Alleen de homepage zit in de hoofdbundel; de andere pagina's laden apart.
const Bedankt = lazy(() => import('./pages/Bedankt').then((m) => ({ default: m.Bedankt })));
const Voorwaarden = lazy(() =>
  import('./pages/ContentPage').then((m) => ({ default: m.Voorwaarden })),
);
const PrintPage = lazy(() => import('./pages/PrintPage').then((m) => ({ default: m.PrintPage })));
const Privacy = lazy(() => import('./pages/ContentPage').then((m) => ({ default: m.Privacy })));

const TITLES: Record<string, string> = {
  '/bedankt': 'Bedankt | Muur van Het Hoekhuus',
  '/voorwaarden': 'Voorwaarden | Muur van Het Hoekhuus',
  '/privacy': 'Privacy | Muur van Het Hoekhuus',
};

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  useEffect(() => {
    if (TITLES[path]) document.title = TITLES[path];
  }, [path]);

  switch (path) {
    case '/':
      return <Home />;
    case '/bedankt':
      return (
        <Suspense fallback={null}>
          <Bedankt />
        </Suspense>
      );
    case '/voorwaarden':
      return (
        <Suspense fallback={null}>
          <Voorwaarden />
        </Suspense>
      );
    case '/print':
      return (
        <Suspense fallback={null}>
          <PrintPage />
        </Suspense>
      );
    case '/privacy':
      return (
        <Suspense fallback={null}>
          <Privacy />
        </Suspense>
      );
    default:
      return (
        <main className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="font-display text-3xl font-extrabold text-navy">Pagina niet gevonden</h1>
          <p className="mt-3">
            <a href="/" className="underline">
              Naar de muur
            </a>
          </p>
        </main>
      );
  }
}
