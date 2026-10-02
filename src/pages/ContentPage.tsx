import { marked } from 'marked';
import { useMemo } from 'react';
import { Footer } from '../components/Footer';
import { SiteNav } from '../components/SiteNav';
import privacy from '../content/privacy.md?raw';
import voorwaarden from '../content/voorwaarden.md?raw';
import { DEFAULT_CONFIG } from '../lib/data';
import type { SiteConfig } from '../lib/types';
import { useWallData } from '../lib/useWallData';

const MISSING = '[nog in te vullen]';

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`,
  );
}

/** Vult {{sleutel}} in met de waarde uit het config-tabblad van de sheet. */
function fillPlaceholders(markdown: string, config: SiteConfig): string {
  return markdown.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = (config as unknown as Record<string, unknown>)[key];
    return typeof value === 'string' && value.trim() && !value.includes('INVULLEN')
      ? escapeHtml(value.trim())
      : MISSING;
  });
}

function plainText(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Rendert een Markdown-bestand uit src/content als nette tekstpagina met inhoudsopgave. */
function ContentPage({ markdown }: { markdown: string }) {
  const { state } = useWallData();
  const config = state.status === 'ready' ? state.data.config : DEFAULT_CONFIG;

  const { html, toc, title } = useMemo(() => {
    const toc: { id: string; text: string }[] = [];
    let title = '';
    const renderer = new marked.Renderer();
    renderer.heading = ({ tokens, depth }) => {
      const text = renderer.parser.parseInline(tokens);
      if (depth === 1) {
        title = plainText(text);
        return '';
      }
      if (depth !== 2) return `<h${depth}>${text}</h${depth}>`;
      const id = slug(plainText(text));
      toc.push({ id, text: plainText(text) });
      return `<h2 id="${id}">${text}</h2>`;
    };
    const html = marked.parse(fillPlaceholders(markdown, config), {
      async: false,
      renderer,
    });
    return { html, toc, title };
  }, [markdown, config]);

  return (
    <>
      <SiteNav />
      <div className="bg-lichtblauw">
        <div className="mx-auto max-w-3xl px-4 pt-6 pb-10">
          <a href="/" className="text-sm font-semibold text-oranje-donker underline">
            ← Terug naar de muur
          </a>
          <p className="eyebrow mt-6">Muur van Het Hoekhuus</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            {title}
          </h1>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10">
        {toc.length > 3 && (
          <nav aria-label="Inhoud" className="card mb-8 p-5">
            <p className="eyebrow">Inhoud</p>
            <ol className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-navy underline-offset-2 hover:underline">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <article className="prose-page" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <Footer config={config} />
    </>
  );
}

export const Voorwaarden = () => <ContentPage markdown={voorwaarden} />;
export const Privacy = () => <ContentPage markdown={privacy} />;
