// Vaste teksten op de homepagina. Pas hier aan; bedrijfsgegevens en links komen uit het config-tabblad.

export const ABOUT = [
  'Vier vrienden, één pand van €500.000. Wij zijn Tycho, Boris, Pim en Noah, en samen met vrienden kochten we een oud café op de hoek. Onze weddenschap: we verbouwen het voor minder dan €100.000.',
  'Of dat lukt, zie je op TikTok, Instagram en Facebook. Elke klus, elke tegenvaller en elk bedrag. Deze muur komt regelmatig in beeld, dus jouw logo ook.',
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
    text: 'Upload je logo op de bedankpagina. Wij keuren het binnen 2 werkdagen.',
  },
  {
    title: 'Op de muur',
    text: 'Binnen 14 dagen plakken wij je logo op de muur en laten we het zien in een video.',
  },
];

export function faq(looptijd: string) {
  return [
    {
      q: 'Wat koop ik precies?',
      a: 'De plaatsing van jouw logo als matte vinylsticker op het vak dat je kiest, op de echte muur in het Hoekhuus. Op deze site staat je logo met een link naar je website.',
    },
    {
      q: 'Hoe lang blijft mijn logo hangen?',
      a: `Je logo blijft hangen ${looptijd}. Zie de voorwaarden voor wat er gebeurt bij verbouwing of schade.`,
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
      a: 'Ja, we kunnen een logo weigeren, bijvoorbeeld als het ongepast is. Dan krijg je het volledige bedrag terug.',
    },
    {
      q: 'Wat als iemand anders tegelijk hetzelfde vak koopt?',
      a: 'Elke betaallink sluit na één betaling. Rondt iemand toch tegelijk af, dan kiest de tweede koper een ander vak of krijgt binnen 24 uur het volledige bedrag terug.',
    },
    {
      q: 'Hoe werkt de veiling van The Spot?',
      a: 'Het startbod is €5.000 en elk bod moet minimaal €250 hoger zijn dan het hoogste bod. Bieden is bindend en alleen voor bedrijven met een KvK-nummer. De veiling heeft een vast einde. De winnaar krijgt een eigen betaallink en betaalt binnen 48 uur.',
    },
    {
      q: 'Kan ik als particulier een vak kopen?',
      a: 'De muur is bedoeld voor bedrijven. Koop je als particulier, dan heb je in principe 14 dagen bedenktijd. Neem bij vragen contact met ons op.',
    },
  ];
}
