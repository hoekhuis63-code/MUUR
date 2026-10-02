// Vaste teksten op de homepagina. Pas hier aan; bedrijfsgegevens en links komen uit het config-tabblad.

export const ABOUT = [
  'Vier vrienden, één pand van €500.000. Wij zijn Tycho, Boris, Pim en Noah, en samen met vrienden kochten we een oud café op de hoek. Onze weddenschap: we verbouwen het voor minder dan €100.000.',
  'Of dat lukt, zie je op TikTok, Instagram en Facebook. Elke klus, elke tegenvaller en elk bedrag. Deze muur staat midden in die verbouwing.',
];

export const SIGN_OFF = 'Volg ons avontuur, volg Het Hoekhuus.';

export const STEPS = [
  { title: 'Kies je vak', text: 'Tik op een vrij vak op de muur of kies er een uit de lijst.' },
  {
    title: 'Betaal',
    text: 'Veilig afrekenen via Stripe met iDEAL of kaart. Je krijgt meteen een factuur.',
  },
  {
    title: 'Stuur je logo',
    text: 'Upload je logo op de bedankpagina. Wij beoordelen het binnen 5 werkdagen.',
  },
  {
    title: 'Op de muur',
    text: 'In de regel binnen 14 dagen na goedkeuring hangt je logo op de muur. Je krijgt een foto.',
  },
];

export function faq(looptijd: string) {
  return [
    {
      q: 'Wat koop ik precies?',
      a: 'Het recht dat je logo of bedrijfsnaam als sticker op het vak van jouw keuze hangt, op de echte muur in het Hoekhuus, voor minimaal 3 maanden. Op deze site staat je logo met een link naar je website.',
    },
    {
      q: 'Hoe lang blijft mijn logo hangen?',
      a: `We garanderen ${looptijd}. Daarna mag het blijven hangen zolang wij dat willen, maar daar heb je geen recht op. Verlengen kun je bij ons aanvragen.`,
    },
    {
      q: 'Zijn de prijzen inclusief btw?',
      a: 'Nee, alle prijzen zijn exclusief 21% btw. Je ontvangt automatisch een factuur met btw, KvK-gegevens en de omschrijving van je vak.',
    },
    {
      q: 'Welk bestand moet ik aanleveren?',
      a: 'Het liefst een vectorbestand (SVG, PDF, AI of EPS). Een PNG met transparante achtergrond kan ook, minimaal 150 dpi op ware grootte: voor een tegel van 20 cm is dat 1.200 pixels breed. Houd 2 cm vrij rondom.',
    },
    {
      q: 'Kan mijn logo geweigerd worden?',
      a: 'Ja. We plaatsen bijvoorbeeld geen reclame voor tabak, vapes, kansspelen, wapens, erotiek of politieke partijen. Weigeren we je logo vóór plaatsing, dan krijg je het betaalde bedrag terug. Verder staat de koop na betaling vast.',
    },
    {
      q: 'Wat als iemand anders tegelijk hetzelfde vak koopt?',
      a: 'Elke betaallink sluit na één betaling. Rondt iemand toch tegelijk af, dan gaat het vak naar de eerste betaling. De tweede koper kiest een ander vak met dezelfde of een lagere prijs, of krijgt het bedrag terug.',
    },
    {
      q: 'Hoe werkt de veiling van The Spot?',
      a: 'Het startbod is €5.000 en elk bod moet minimaal €250 hoger zijn dan het hoogste bod. Bieden is bindend en alleen voor bedrijven met een KvK-nummer. De veiling heeft een vast einde. De winnaar krijgt een eigen betaallink en betaalt binnen 48 uur; anders volgt een boete van 50% van het bod. Het hoogste bod en de naam van de bieder tonen we op de site.',
    },
    {
      q: 'Kan ik als particulier een vak kopen?',
      a: 'De muur is bedoeld voor bedrijven. Koop je als particulier, dan heb je 14 dagen bedenktijd. Die vervalt zodra je logo op jouw verzoek is geplaatst.',
    },
  ];
}
