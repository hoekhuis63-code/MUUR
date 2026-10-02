# Jouw taken (alleen wat Claude echt niet kan)

Alles hieronder vraagt een eigen account, een login, een handtekening of een beslissing. De rest is
gebouwd. Werk de stappen in deze volgorde af; achter elke stap staat wat je terugstuurt.

## 1. Stripe-account (start dit als eerste: verificatie kan een dag duren)

1. Maak een account op [dashboard.stripe.com/register](https://dashboard.stripe.com/register) met
   info@hethoekhuus.nl.
2. Activeer betalingen: KvK-nummer, zakelijke IBAN en ID van de vertegenwoordiger bij de hand.
3. **Instellingen > Openbare gegevens**: bedrijfsnaam, supportmail, en bij
   _Servicevoorwaarden_: `https://hethoekhuus.nl/voorwaarden`. Zonder deze link werken de
   betaallinks niet.
4. **Instellingen > Branding**: upload het logo, merkkleur `#073459`, accentkleur `#e8570f`.
5. **Instellingen > Facturen**: adres, KvK, btw-nummer, doorlopende factuurnummering.
6. **Tax (Belastingen)**: zet Stripe Tax aan. Vul bij _Instellingen > Belastingen_ het vestigingsadres in, kies standaard "Prijzen exclusief belasting" en voeg bij _Registraties_ Nederland toe (btw-nummer). Zonder registratie rekent Stripe geen btw. Kosten: 0,5% per transactie.
7. **Instellingen > Betaalmethoden**: iDEAL, kaarten, Bancontact, Apple Pay en Google Pay aan.
8. **Ontwikkelaars > API-sleutels** (testmodus aan): kopieer de _geheime sleutel_ (`sk_test_...`).
   Plak die **nergens in een chat**. Zet hem in GitHub (stap 4).

## 2. Google Sheet invullen en publiceren (10 min)

De sheet staat klaar in Drive > 0.5 Content > **Muur van Het Hoekhuus · beheer**, met alle 61
vakken.

1. Tabblad `config`: bedrijfsgegevens staan erin. Alleen `facebook_url` nog invullen.
2. **Bestand > Delen > Publiceren op internet**: kies tabblad `spots`, formaat
   _Door komma's gescheiden waarden (.csv)_, Publiceren, link kopiëren. Herhaal voor
   `veiling_publiek` en `config`.
3. Publiceer **nooit** `veiling` of `aanleveringen`.

**Stuur terug:** de 3 CSV-links.

## 3. Tally-formulieren (20 min)

Maak een gratis account op [tally.so](https://tally.so) en maak twee formulieren.

**Logoformulier**: naam zoals op de muur, logo-upload, website, contactpersoon, e-mail, telefoon,
wens/achtergrondkleur. Voeg verborgen velden `vak` en `sessie` toe (blok _Hidden fields_).
Integrations > Google Sheets > koppel aan tabblad `aanleveringen`. E-mailmelding aan.

**Biedformulier**: bedrijfsnaam, KvK-nummer, contactpersoon, e-mail, telefoon, bod in euro
(getal, minimaal 5000), verplicht vinkje "Mijn bod is bindend". Koppel aan tabblad `veiling`.

**Stuur terug:** de 2 formulier-ID's (het stukje na `tally.so/r/`).

## 4. GitHub-geheim voor Stripe (2 min)

GitHub > repo **MUUR** > Settings > Secrets and variables > Actions:

- **Secrets** > New repository secret: `STRIPE_SECRET_KEY_TEST` = je `sk_test_...` sleutel.
  (Later ook `STRIPE_SECRET_KEY_LIVE` met `sk_live_...`.)

Betaallinks maken: tab **Actions** > _Stripe-betaallinks_ > **Run workflow** (modus `test`,
proefdraaien uit). Download onder _Artifacts_ het bestand `spots_met_links.csv` en plak de kolom
`betaallink` in de sheet. Of stuur het naar Claude.

## 5. Vercel (10 min)

1. Log in op [vercel.com](https://vercel.com) met je GitHub-account.
2. **Add New > Project** > importeer `hoekhuis63-code/MUUR` > Deploy. De branch `claude/hoekhuis-muur-website-2vi7nm` is de standaardbranch en gaat dus direct live. Instellingen staan goed
   (Vite wordt herkend). Env-variabelen hoef je niet in te stellen; die zet Claude in de code
   zodra je de links en ID's van stap 2 en 3 hebt gestuurd.

## 6. Domein koppelen (15 min)

1. Zoek op [sidn.nl/whois](https://www.sidn.nl/whois) bij wie `hethoekhuus.nl` geregistreerd is
   (de _registrar_, bijv. TransIP, Versio, Strato). Log daar in; het account is meestal van degene
   die info@hethoekhuus.nl heeft aangemaakt.
2. In Vercel: project > Settings > Domains > voeg `hethoekhuus.nl` en `www.hethoekhuus.nl` toe.
   Vercel toont welke DNS-records nodig zijn (meestal een **A-record** `@` naar `76.76.21.21` en
   een **CNAME** `www` naar `cname.vercel-dns.com`).
3. Zet die records bij de registrar. **Laat de MX-records staan**, anders werkt de mail niet meer.

## 7. Beslissingen en echte wereld

- Muur opmeten en de echte x/y/breedte/hoogte per vak in de sheet zetten (Claude kan de indeling
  daarna controleren en de terugval bijwerken).
- Maat en prijs van vak X1.
- Looptijd van een logo (nu: "zolang het Hoekhuus van ons is, en minimaal 2 jaar").
- Voorwaarden en privacyverklaring laten checken door boekhouder of jurist, en de `[INVULLEN]`
  plekken invullen (of stuur de gegevens naar Claude).

## 8. Testen (30 min)

Loop de testchecklist in de README af. Doe een testbetaling met kaart `4242 4242 4242 4242`. Als
alles werkt: geheime live-sleutel in GitHub, workflow draaien in modus `live`, nieuwe links in de
sheet, en je bent live.
