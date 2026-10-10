import { useState } from 'react';
import type { FormEvent } from 'react';
import { trackEvent } from '../lib/claim';

const EXT_TYPES: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  ai: 'application/illustrator',
  eps: 'application/postscript',
};
const MAX_MB = 25;

interface Props {
  vak: string;
  sessie: string;
}

/** Logo rechtstreeks naar Vercel Blob uploaden; de server controleert eerst de betaling. */
export function LogoUpload({ vak, sessie }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [opmerking, setOpmerking] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [fout, setFout] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setFout('Kies eerst een bestand.');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    // Foto's van een telefoon hebben soms geen extensie; dan telt het type van het bestand.
    const contentType =
      EXT_TYPES[ext] ?? (Object.values(EXT_TYPES).includes(file.type) ? file.type : undefined);
    if (!contentType)
      return setFout(
        'Dit bestandstype kunnen we niet gebruiken. Kies een foto (JPG, PNG, HEIC) of SVG, PDF, AI of EPS.',
      );
    if (file.size > MAX_MB * 1024 * 1024) return setFout(`Het bestand is groter dan ${MAX_MB} MB.`);

    setStatus('busy');
    setFout('');
    try {
      const { upload } = await import('@vercel/blob/client');
      const veilig = file.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
      const blob = await upload(`logos/${vak}/${veilig}`, file, {
        access: 'private',
        handleUploadUrl: '/api/logo',
        contentType,
        multipart: file.size > 5 * 1024 * 1024,
        clientPayload: JSON.stringify({ vak, sessie, opmerking }),
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const res = await fetch('/api/logo?klaar=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vak, sessie, opmerking, pathname: blob.pathname }),
      });
      if (!res.ok) throw new Error('melding');
      trackEvent('logo_geupload', { vak });
      setStatus('done');
    } catch (error) {
      console.error('[logo]', error);
      setStatus('error');
      setFout(
        error instanceof Error && /betaalde/.test(error.message)
          ? 'We konden je betaling voor dit vak niet vinden. Mail je bestand naar info@hethoekhuus.nl.'
          : 'Uploaden lukte niet. Probeer het opnieuw of mail je bestand naar info@hethoekhuus.nl.',
      );
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="rounded-2xl bg-green-50 p-5">
        <p className="font-display text-xl font-extrabold text-navy">Ontvangen. Dankjewel!</p>
        <p className="mt-1 text-ink/80">
          We beoordelen het binnen 5 werkdagen en mailen je als we iets nodig hebben.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <label className="block font-semibold text-navy">
        Je logo, naam of foto
        <input
          type="file"
          accept="image/*,.svg,.pdf,.ai,.eps,.heic,.heif"
          className="mt-2 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-lichtblauw file:px-4 file:font-semibold file:text-navy"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <span className="mt-1 block text-sm font-normal text-ink/70">
          Een gewone foto van je telefoon is prima. Voor een logo liefst SVG, PDF, AI of EPS. Wel
          scherp graag (vak van 15 cm: minimaal 900 pixels breed). Max {MAX_MB} MB.
        </span>
      </label>
      <label className="block font-semibold text-navy">
        Wensen (optioneel)
        <textarea
          rows={3}
          maxLength={1000}
          className="mt-1 block w-full rounded-xl border border-navy/25 p-3 text-base"
          placeholder="Bijv. achtergrondkleur, welke naam of tekst erbij, website voor de link"
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
        />
      </label>
      {status === 'busy' && (
        <div
          className="h-2 overflow-hidden rounded-full bg-lichtblauw"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Uploaden"
        >
          <div
            className="h-full bg-merk-oranje transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {fout && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 font-semibold text-red-800">
          {fout}
        </p>
      )}
      <button type="submit" className="btn-primary" disabled={status === 'busy'}>
        {status === 'busy' ? `Uploaden… ${progress}%` : 'Verstuur'}
      </button>
    </form>
  );
}
