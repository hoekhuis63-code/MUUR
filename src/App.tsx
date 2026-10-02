import { useEffect } from 'react';
import { Bedankt } from './pages/Bedankt';
import { ContentPage } from './pages/ContentPage';
import { Home } from './pages/Home';
import privacy from './content/privacy.md?raw';
import voorwaarden from './content/voorwaarden.md?raw';

const TITLES: Record<string, string> = {
  '/bedankt': 'Bedankt – Muur van Het Hoekhuus',
  '/voorwaarden': 'Voorwaarden – Muur van Het Hoekhuus',
  '/privacy': 'Privacy – Muur van Het Hoekhuus',
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
      return <Bedankt />;
    case '/voorwaarden':
      return <ContentPage markdown={voorwaarden} />;
    case '/privacy':
      return <ContentPage markdown={privacy} />;
    default:
      return (
        <main className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="text-3xl font-extrabold">Pagina niet gevonden</h1>
          <p className="mt-3">
            <a href="/" className="underline">
              Naar de muur
            </a>
          </p>
        </main>
      );
  }
}
