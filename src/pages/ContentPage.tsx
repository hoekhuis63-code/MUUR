import { marked } from 'marked';
import { useMemo } from 'react';
import privacy from '../content/privacy.md?raw';
import voorwaarden from '../content/voorwaarden.md?raw';

/** Rendert een Markdown-bestand uit src/content als nette tekstpagina. */
function ContentPage({ markdown }: { markdown: string }) {
  const html = useMemo(() => marked.parse(markdown, { async: false }), [markdown]);
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <a href="/" className="font-semibold text-oranje underline">
        ← Muur van Het Hoekhuus
      </a>
      <article className="prose-page mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

export const Voorwaarden = () => <ContentPage markdown={voorwaarden} />;
export const Privacy = () => <ContentPage markdown={privacy} />;
