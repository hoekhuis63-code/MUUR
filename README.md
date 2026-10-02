# Muur van Het Hoekhuus

> **Snel starten:** zie [JOUW-TAKEN.md](JOUW-TAKEN.md) voor de stappen die alleen jij kunt doen. Openbare instellingen (CSV-links, Tally-ID's) staan in `.env.production` in de repo; Vercel heeft dan geen env-variabelen nodig. Betaallinks maken kan ook zonder installatie via GitHub Actions (workflow _Stripe-betaallinks_, secrets `STRIPE_SECRET_KEY_TEST` / `STRIPE_SECRET_KEY_LIVE`, optionele variabelen `VITE_SPOTS_CSV_URL` en `SITE_URL`). De beheersheet staat in Drive > 0.5 Content > _Muur van Het Hoekhuus · beheer_.

Met vrienden kochten we een voormalig café van €500.000 en verbouwen we het voor minder dan €100.000: en dat delen we op TikTok ([@hethoekhuis](https://www.tiktok.com/@hethoekhuis)), Instagram ([@hethoekhuus](https://www.instagram.com/hethoekhuus)) en Facebook. Op een echte binnenmuur van **320 x 230 cm** verkopen we reclamevakken: het logo van de koper komt er als matte vinylsticker op. Deze site (hethoekhuus.nl) toont de muur, de vrije vakken, de betaallinks en de veiling van The Spot.

Alle prijzen zijn **exclusief btw (21%)**.

| Vak           | Maat (cm)  | Prijs                    | Aantal |
| ------------- | ---------- | ------------------------ | ------ |
| The Spot (S1) | 100 x 80   | veiling, vanaf €5.000    | 1      |
| XL1–XL3       | 80 x 40    | €1.999                   | 3      |
| L1–L3         | 60 x 40    | €1.499                   | 3      |
| M1–M4         | 40 x 40    | €999                     | 4      |
| B01–B10       | 40 x 20    | €499                     | 10     |
| T01–T39       | 20 x 20    | €249                     | 39     |
| X1            | [INVULLEN] | [INVULLEN] (geblokkeerd) | 1      |
| **Totaal**    |            |                          | **61** |

**Techniek:** statische Vite + React + TypeScript + Tailwind-site op Vercel (SPA-fallback via `vercel.json` voor `/bedankt`, `/voorwaarden` en `/privacy`). Er is geen backend of database: een **Google Sheet is de enige bron van waarheid én het beheerpaneel**. Betalen gaat via Stripe Payment Links, logo's en biedingen via Tally-formulieren.

## ⚠ Voorlopige indeling

**De huidige indeling is een VOORLOPIGE mockup en niet op schaal.** De vakken bedekken nu ongeveer 5,9 m² van de 7,36 m² muur. Voordat er verkocht wordt:

1. Meet de echte muur op (en eventuele obstakels: stopcontacten, lijsten, leidingen).
2. Zet de echte posities en maten (`x_cm`, `y_cm`, `w_cm`, `h_cm`) in het tabblad `spots` van de Sheet.
3. Exporteer het tabblad als CSV en controleer het: `npm run check:layout -- pad/naar/export.csv`.
4. Werk de fallback bij: `npm run update:fallback`.

## Lokaal draaien

1. Installeer Node 20 of nieuwer.
2. `npm install`
3. `cp .env.example .env` en vul de waarden in (zie hieronder).
4. `npm run dev` en open de getoonde URL.

Zonder CSV-URL's gebruikt de site `public/spots.json` als fallback.

Handige scripts:

| Script                    | Wat het doet                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Ontwikkelserver                                                                                                              |
| `npm run build`           | Productiebuild                                                                                                               |
| `npm run preview`         | Build lokaal bekijken                                                                                                        |
| `npm run lint`            | ESLint                                                                                                                       |
| `npm run format`          | Prettier op alles                                                                                                            |
| `npm run format:check`    | Controleren of alles geformatteerd is                                                                                        |
| `npm run check:layout`    | Controleert overlap, vakken buiten de muur en dubbele ID's in `data/spots.csv` en `public/spots.json` (of een opgegeven CSV) |
| `npm run update:fallback` | Downloadt `VITE_SPOTS_CSV_URL` naar `public/spots.json` (of `npm run update:fallback -- pad.csv`)                            |
| `npm run stripe:links`    | Maakt Stripe-betaallinks: `node scripts/create-payment-links.mjs [spots.csv] [--dry-run]`                                    |

## Env-variabelen

Vite-variabelen worden **tijdens de build** in de site gebakken. Wijzig je ze in Vercel, doe dan altijd een **redeploy**.

| Variabele                 | Waar            | Inhoud                                                      |
| ------------------------- | --------------- | ----------------------------------------------------------- |
| `VITE_SPOTS_CSV_URL`      | `.env` + Vercel | Gepubliceerde CSV-link van tabblad `spots`                  |
| `VITE_BIDS_CSV_URL`       | `.env` + Vercel | Gepubliceerde CSV-link van tabblad `veiling_publiek`        |
| `VITE_CONFIG_CSV_URL`     | `.env` + Vercel | Gepubliceerde CSV-link van tabblad `config`                 |
| `VITE_TALLY_LOGO_FORM_ID` | `.env` + Vercel | ID van het logo-formulier (stuk na `tally.so/r/`)           |
| `VITE_TALLY_BID_FORM_ID`  | `.env` + Vercel | ID van het biedformulier                                    |
| `VITE_PLAUSIBLE_DOMAIN`   | `.env` + Vercel | Optioneel, bijv. `hethoekhuus.nl` (cookieloze statistiek)   |
| `STRIPE_SECRET_KEY`       | alleen `.env`   | `sk_test_…` of `sk_live_…`: **nooit** in Vercel of git      |
| `SITE_URL`                | alleen `.env`   | `https://hethoekhuus.nl` (voor de redirect naar `/bedankt`) |

## Google Sheet inrichten

De site leest de drie gepubliceerde tabbladen bij het laden, elke 60 seconden en wanneer het tabblad weer focus krijgt. Google cachet gepubliceerde CSV's zelf **een paar minuten**, dus een wijziging is niet direct zichtbaar. Rijen die niet kloppen worden overgeslagen (met een waarschuwing in de console); alleen `https`-URL's worden geaccepteerd.

1. Maak een nieuwe Google Sheet met de tabbladen `spots`, `veiling_publiek`, `config`, `veiling` en `aanleveringen`.
2. Importeer `data/spots.csv` in het tabblad `spots` (Bestand > Importeren > Uploaden > "Huidige blad vervangen").
3. Vul `config` en `veiling_publiek` zoals hieronder.
4. Publiceer **alleen** `spots`, `veiling_publiek` en `config`, elk apart: Bestand > Delen > Publiceren op internet > kies het tabblad > formaat **CSV** > Publiceren. Kopieer de drie links naar de env-variabelen.
5. **Publiceer nooit** `veiling` of `aanleveringen`: daar staan contactgegevens. Zet in gepubliceerde tabbladen alleen openbare informatie.

### Tabblad `spots`

| Kolom          | Inhoud                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------- |
| `id`           | Bijv. `S1`, `XL1`, `M3`, `B07`, `T07`                                                     |
| `type`         | `spot`, `xl`, `l`, `m`, `b`, `t` of `x`                                                   |
| `x_cm`, `y_cm` | Linkerbovenhoek van het vak, gemeten vanaf de linkerbovenhoek van de muur                 |
| `w_cm`, `h_cm` | Breedte en hoogte                                                                         |
| `prijs_eur`    | Prijs excl. btw                                                                           |
| `status`       | `vrij`, `bezet` (betaald, logo nog niet op de muur), `verkocht`, `veiling`, `geblokkeerd` |
| `koper`        | Bedrijfsnaam zoals getoond                                                                |
| `website`      | `https://…`                                                                               |
| `logo_url`     | `https://…`, webversie in png of svg                                                      |
| `betaallink`   | Stripe Payment Link                                                                       |
| `verkocht_op`  | `JJJJ-MM-DD`                                                                              |

### Tabblad `veiling_publiek`

| Kolom     | Voorbeeld                   |
| --------- | --------------------------- |
| `tijd`    | `2026-10-05T14:12:00+02:00` |
| `bedrijf` | `Bakkerij Jansen`           |
| `bod_eur` | `5250`                      |

### Tabblad `config`

Kolommen `key` en `value`:

| key                 | Voorbeeld value                                      |
| ------------------- | ---------------------------------------------------- |
| `veiling_eind`      | `2026-10-18T20:00:00+02:00`                          |
| `startbod_eur`      | `5000`                                               |
| `min_verhoging_eur` | `250`                                                |
| `looptijd`          | `zolang het Hoekhuus van ons is, en minimaal 2 jaar` |
| `bedrijfsnaam`      | [INVULLEN]                                           |
| `adres`             | [INVULLEN]                                           |
| `kvk`               | [INVULLEN]                                           |
| `btw_nummer`        | [INVULLEN]                                           |
| `contact_email`     | [INVULLEN]                                           |
| `tiktok_url`        | `https://www.tiktok.com/@hethoekhuis`                |
| `instagram_url`     | `https://www.instagram.com/hethoekhuus`              |
| `facebook_url`      | [INVULLEN]                                           |

### Niet-gepubliceerde tabbladen

- `veiling`: alle biedingen met contactgegevens: `tijd`, `bedrijf`, `kvk`, `contactpersoon`, `email`, `telefoon`, `bod_eur`, `geldig` (`ja`/`nee`).
- `aanleveringen`: de antwoorden van het Tally-logoformulier.

## Tally-formulieren maken

Het formulier-ID is het stuk na `tally.so/r/`.

### Logo-formulier

1. Maak een formulier met de velden:
   - Naam zoals op de muur
   - Logo-upload (bij voorkeur svg, pdf, ai of eps; png mag als het minimaal 150 dpi op ware grootte is: een tegel van 20 cm = 1.200 px)
   - Website
   - Contactpersoon
   - E-mail
   - Telefoon
   - Wens / achtergrondkleur
2. Voeg twee **hidden fields** toe: `vak` en `sessie`.
3. Koppel het formulier via Integraties > Google Sheets aan de Sheet, tabblad `aanleveringen`.
4. Zet de e-mailnotificatie aan.
5. Zet het ID in `VITE_TALLY_LOGO_FORM_ID`. De site toont het op `/bedankt` als `https://tally.so/embed/<ID>?hideTitle=1&transparentBackground=1&dynamicHeight=1&vak=..&sessie=..`.

### Biedformulier (The Spot)

1. Maak een formulier met: bedrijfsnaam, KvK-nummer, contactpersoon, e-mail, telefoon, bod in euro (getal, minimaal 5000) en een verplichte checkbox "mijn bod is bindend".
2. Koppel het aan het tabblad `veiling` en zet de e-mailnotificatie aan.
3. Zet het ID in `VITE_TALLY_BID_FORM_ID`. De knop "Bied mee" opent `https://tally.so/r/<ID>` in een nieuw tabblad.

## Stripe instellen

1. Maak een Stripe-account en rond de **verificatie** af (bedrijfsgegevens, bankrekening).
2. **Branding** (Instellingen > Branding): logo, kleuren, icoon.
3. **Facturen** (Instellingen > Facturering > Facturen): bedrijfsnaam, adres, KvK-nummer, btw-nummer en de factuurnummering instellen.
4. **Btw:** de prijzen zijn exclusief btw (`tax_behavior: exclusive`). Stel 21% btw in, bijvoorbeeld als vast belastingtarief (tax rate) of via Stripe Tax. _Laat de juiste aanpak checken door de boekhouder._
5. **Voorwaarden-URL:** zet `https://hethoekhuus.nl/voorwaarden` in Instellingen > Openbare gegevens (public details). Zonder deze URL kan het script geen akkoord op de voorwaarden verplicht maken.
6. **Betaalmethoden** (Instellingen > Betaalmethoden): iDEAL, kaarten, Bancontact, Apple Pay en Google Pay aanzetten.

## Betaallinks aanmaken

Het script maakt voor elk vak met status `vrij` en een lege `betaallink`:

- een product `Vak <ID> · <type> <w> x <h> cm op de muur van Het Hoekhuus` met een EUR-prijs (btw exclusief);
- een Payment Link die na **1 voltooide betaling** sluit (melding "Dit vak is net verkocht…"), doorstuurt naar `<SITE_URL>/bedankt?vak=<ID>&sessie={CHECKOUT_SESSION_ID}`, een factuur maakt, bedrijfsnaam, btw-nummer en factuuradres vraagt, akkoord op de voorwaarden verplicht maakt en een keuzelijst "Waar zag je ons?" toont.

Het script is idempotent en schrijft `spots_met_links.csv` (staat in `.gitignore`).

1. **Proefdraai:** `npm run stripe:links -- data/spots.csv --dry-run`
2. **Testmodus:** zet `STRIPE_SECRET_KEY=sk_test_…` in `.env`, draai `npm run stripe:links` op een export van de Sheet, plak de kolom `betaallink` uit `spots_met_links.csv` in de Sheet en doe de testchecklist.
3. **Live:** zet `STRIPE_SECRET_KEY=sk_live_…` en draai het script opnieuw op een CSV met een **lege** kolom `betaallink`. Live-links zijn andere links dan testlinks! Plak de nieuwe kolom `betaallink` in de Sheet.

De site plakt `?client_reference_id=<ID>-<bron>&locale=nl` achter de betaallink. `bron` is de `utm_source` van de landings-URL, anders `direct`. Gebruik daarom in je bio links als `https://hethoekhuus.nl/?utm_source=tiktok` (of `instagram`, `facebook`).

## Deploy op Vercel

1. Zet de code op GitHub en importeer de repo in Vercel (Add New > Project).
2. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Voeg de `VITE_…`-variabelen toe onder Settings > Environment Variables. **Niet** `STRIPE_SECRET_KEY`.
4. Deploy. Na elke wijziging van een env-variabele: Deployments > Redeploy.
5. Domein: Settings > Domains > `hethoekhuus.nl` (en `www`) toevoegen en de DNS-records die Vercel toont instellen bij je registrar.

## Dagelijks beheer

### Statussen

- `vrij`: te koop, betaallink zichtbaar
- `bezet`: betaald, logo nog niet op de muur
- `verkocht`: logo hangt
- `veiling`: The Spot, biedblok zichtbaar
- `geblokkeerd`: niet te koop (bijv. X1)

### Na een betaling

1. Stripe mailt ons → zet het vak in de Sheet op `bezet`.
2. De koper levert het logo aan via Tally (komt in `aanleveringen`). Keur het binnen **2 werkdagen** goed of vraag om een betere versie.
3. Plak het logo binnen **14 dagen** na goedkeuring op de muur.
4. Zet daarna `status` op `verkocht` en vul `koper`, `website`, `logo_url` en `verkocht_op` in. Voor `logo_url`: upload het logo op GitHub in de map `public/logos` (Add file > Upload files, bijv. `T07.png`) en vul `/logos/T07.png` in. Een volledige https-link mag ook.

### Muur voorbereiden en labels printen

Open `https://hethoekhuus.nl/print` (staat niet in het menu). Daar staan een uitzettekening met alle maten (x, y, breedte, hoogte in cm, gemeten vanaf linksboven) en per vrij vak een label met ID en prijs. Print op **100% / werkelijke grootte**, niet "passend maken". De pagina leest de actuele sheet, dus print opnieuw als de indeling verandert.

### Veiling The Spot

1. Nieuwe biedingen komen in het tabblad `veiling`.
2. Controleer elk bod: minimaal hoogste bod + €250 en het bedrijf bestaat (KvK). Zet `geldig` op `ja` of `nee`.
3. Kopieer `tijd`, `bedrijf` en `bod_eur` van geldige biedingen naar `veiling_publiek`.
4. Na het einde (`veiling_eind`): maak in Stripe een eigen eenmalige betaallink (limiet 1) voor precies het winnende bod en stuur die naar de winnaar. Betaalt die niet binnen **48 uur**, dan gaat de plek naar het op-één-na-hoogste bod.

## Plausible (optioneel)

Wil je bezoekersstatistieken zonder cookies? Maak een site aan op [plausible.io](https://plausible.io) en zet `VITE_PLAUSIBLE_DOMAIN=hethoekhuus.nl`. Leeg laten = geen statistiek.

## Testchecklist

- [ ] Testbetaling: de link sluit na één betaling, een tweede poging toont "net verkocht"
- [ ] Doorsturen naar `/bedankt` met het juiste vak in het Tally-formulier
- [ ] Logo uploaden werkt op iPhone én Android
- [ ] Status in de Sheet wijzigen → binnen enkele minuten zichtbaar op de site
- [ ] `#T07` opent het juiste vak
- [ ] De bron komt mee als `client_reference_id` (test met `?utm_source=tiktok`)
- [ ] De factuur bevat KvK, btw en de vakomschrijving
- [ ] Biedblok, hoogste bod en aftelklok kloppen
- [ ] Goed bruikbaar op een smalle telefoon en op 4G
- [ ] Eerste echte live-betaling gedaan en daarna terugbetaald

## Open punten / [INVULLEN]

- [ ] X1: maat en prijs
- [ ] Looptijd definitief maken (`config` > `looptijd` en de voorwaarden)
- [ ] Bedrijfsgegevens in `config` (bedrijfsnaam, adres, KvK, btw-nummer, contact-e-mail)
- [ ] Facebook-URL
- [ ] Voorwaarden en privacyverklaring laten checken door boekhouder/jurist
- [ ] Echte maten van de muur in de Sheet (zie ⚠ Voorlopige indeling)
