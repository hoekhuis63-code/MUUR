// Regels van de veiling van het grote vlak (artikel 11 van de voorwaarden). Puur en testbaar.

export const VEILING = {
  eind: Date.parse(process.env.VEILING_EIND || '2026-10-18T20:00:00+02:00'),
  startbod: Number(process.env.VEILING_STARTBOD || 500),
  verhoging: Number(process.env.VEILING_VERHOGING || 50),
};

export function minimumBod(hoogste, regels = VEILING) {
  return hoogste ? hoogste + regels.verhoging : regels.startbod;
}

const tekst = (v, max) =>
  String(v ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, max);

/**
 * Controleert een bod. Geeft { bod } (opgeschoond) of { fout } (Nederlandse melding).
 * `hoogste` = huidig hoogste bod in euro, of 0.
 */
export function controleerBod(invoer, hoogste, nu = Date.now(), regels = VEILING) {
  if (invoer?.website) return { fout: 'Ongeldige invoer.' }; // honeypot
  if (nu >= regels.eind) return { fout: 'De veiling is gesloten.' };

  const bod = {
    bedrijf: tekst(invoer?.bedrijf, 120),
    kvk: tekst(invoer?.kvk, 20).replace(/\s/g, ''),
    naam: tekst(invoer?.naam, 120),
    email: tekst(invoer?.email, 200).toLowerCase(),
    telefoon: tekst(invoer?.telefoon, 40),
    bod_eur: Number(String(invoer?.bod ?? '').replace(/[^\d]/g, '')),
  };

  if (bod.bedrijf.length < 2) return { fout: 'Vul je bedrijfsnaam in.' };
  if (!/^\d{8}$/.test(bod.kvk)) return { fout: 'Vul een geldig KvK-nummer in (8 cijfers).' };
  if (bod.naam.length < 2) return { fout: 'Vul je naam in.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(bod.email))
    return { fout: 'Vul een geldig e-mailadres in.' };
  if (bod.telefoon.replace(/\D/g, '').length < 9)
    return { fout: 'Vul een geldig telefoonnummer in.' };
  if (invoer?.akkoord !== true) {
    return { fout: 'Ga akkoord met de voorwaarden en het bindende karakter van je bod.' };
  }
  const min = minimumBod(hoogste, regels);
  if (!Number.isInteger(bod.bod_eur) || bod.bod_eur < min) {
    return { fout: `Je bod moet minimaal €${min.toLocaleString('nl-NL')} zijn (excl. btw).` };
  }
  if (bod.bod_eur > 1_000_000) return { fout: 'Dat bod is te hoog. Neem contact met ons op.' };
  return { bod };
}
