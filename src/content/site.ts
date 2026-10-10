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
    title: 'Stuur je logo, naam of foto',
    text: 'Upload het op de bedankpagina. Wij beoordelen het binnen 5 werkdagen.',
  },
  {
    title: 'Op de muur',
    text: 'In de regel binnen 14 dagen na goedkeuring hangt het op de muur. Je krijgt een foto.',
  },
];

export function faq(looptijd: string) {
  return [
    {
      q: 'Wat levert het me op?',
      a: 'Je logo, naam of foto hangt op een echte muur in een pand dat duizenden mensen volgen: onze eerste video werd meer dan een miljoen keer bekeken. Op deze site staat je vak met een link naar je website. Een garantie op bereik geven we niet, wel een vaste plek midden in het verhaal.',
    },
    {
      q: 'Krijg ik een factuur op naam van mijn bedrijf?',
      a: 'Ja. Bij het afrekenen vul je je bedrijfsnaam en eventueel btw-nummer in. Je krijgt direct een factuur met 21% btw per e-mail. Voor bedrijven uit een ander EU-land met een geldig btw-nummer wordt de btw verlegd.',
    },
    {
      q: 'Wat koop ik precies?',
      a: 'Het recht dat je logo, naam of foto als sticker op het vak van jouw keuze hangt, op de echte muur in het Hoekhuus, voor minimaal 3 maanden. Daarbij: in beeld in elke video die we bij de muur opnemen, een plek in onze volgende video, een vermelding op onze socials, een keer langskomen en een biertje zodra de bar af is.',
    },
    {
      q: 'Hoe lang blijft het hangen?',
      a: `We garanderen ${looptijd}. Daarna mag het blijven hangen zolang wij dat willen, maar daar heb je geen recht op. Verlengen kun je bij ons aanvragen.`,
    },
    {
      q: 'Zijn de prijzen inclusief btw?',
      a: 'Nee, alle prijzen zijn exclusief 21% btw. Je ontvangt automatisch een factuur met btw, KvK-gegevens en de omschrijving van je vak.',
    },
    {
      q: 'Welk bestand moet ik aanleveren?',
      a: 'Voor een logo het liefst een vectorbestand (SVG, PDF, AI of EPS). Een gewone foto van je telefoon kan ook (JPG, PNG of HEIC). Een PNG of foto moet scherp zijn, minimaal 150 dpi op ware grootte: voor een tegel van 20 cm is dat 1.200 pixels breed. Houd 2 cm vrij rondom.',
    },
    {
      q: 'Kan mijn afbeelding geweigerd worden?',
      a: 'Ja. We plakken alleen wat we zelf ook in beeld willen hebben. Dus bijvoorbeeld geen reclame voor tabak, vapes, kansspelen, wapens, erotiek of politieke partijen. Weigeren we je afbeelding, dan krijg je het betaalde bedrag terug. Verder staat de koop na betaling vast.',
    },
    {
      q: 'Wat als iemand anders tegelijk hetzelfde vak koopt?',
      a: 'Elke betaallink sluit na één betaling. Rondt iemand toch tegelijk af, dan gaat het vak naar de eerste betaling. De tweede koper kiest een ander vak met dezelfde of een lagere prijs, of krijgt het bedrag terug.',
    },
    {
      q: 'Hoe werkt de veiling van het grote vlak?',
      a: 'Het startbod is €500 (excl. btw) en elk bod moet minimaal €50 hoger zijn dan het hoogste bod. Bieden is bindend en alleen voor bedrijven met een KvK-nummer. De veiling heeft een vast einde. De winnaar krijgt een eigen betaallink en betaalt binnen 48 uur; anders volgt een boete van 50% van het bod. Het hoogste bod en de naam van de bieder tonen we op de site.',
    },
    {
      q: 'Kan ik als particulier een vak kopen?',
      a: 'Ja, iedereen kan een vak kopen, ook zonder bedrijf: zet je naam, een foto of een tekening op de muur. Prijzen staan excl. btw, met het bedrag incl. 21% btw ernaast. Als particulier heb je 14 dagen bedenktijd; die vervalt zodra je vak op jouw verzoek is beplakt.',
    },
    {
      q: 'Ziet iedereen dat ik een vak heb gekocht?',
      a: 'Alleen als je dat wilt. Bij het afrekenen kies je of je naam in de melding "… heeft net een vak gekocht" op de site mag. Staat dat op nee, dan staat er "Iemand heeft net een vak gekocht" en op de kaart alleen "Verkocht".',
    },
  ];
}
