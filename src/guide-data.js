// Editorial summaries, not imported source text. Reviewed against each linked source.
export const GUIDE_REVIEWED = '2026-11-17';
export const GUIDE_SOURCES = {
  nutrition: { title: 'Netzwerk Gesund ins Leben: Essen und Trinken', url: 'https://www.gesund-ins-leben.de/fuer-familien/fit-durch-die-schwangerschaft/essen-und-trinken-in-der-schwangerschaft/' },
  infections: { title: 'Netzwerk Gesund ins Leben: Schutz vor Lebensmittelinfektionen', url: 'https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/schutz-vor-infektionen-durch-lebensmittel-in-der-schwangerschaft/' },
  raw: { title: 'BIÖG: Rohe tierische Lebensmittel', url: 'https://www.familienplanung.de/schwangerschaft/die-schwangerschaft/gesundheit-und-ernaehrung/ernaehrung/rohmilch-rohwurst-und-co-rohe-tierische-lebensmittel-in-der-schwangerschaft/' },
  bfr: { title: 'BfR: Lebensmittelinfektionen im Privathaushalt', url: 'https://www.bfr.bund.de/fragen-und-antworten/thema/lebensmittelinfektionen-im-privathaushalt-quellen-erkennen-risiken-vermeiden/' },
  bund: { title: 'gesund.bund.de: Ernährung in der Schwangerschaft', url: 'https://gesund.bund.de/schwangerschaft-ernaehrung' },
  movement: { title: 'Netzwerk Gesund ins Leben: Bewegungsausmaß und -art', url: 'https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/bewegung/bewegungsausmass-und-art-vor-und-in-der-schwangerschaft/' },
  sport: { title: 'BIÖG: Sport in der Schwangerschaft', url: 'https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/sport/' },
  relaxation: { title: 'BIÖG: Entspannung, Sauna und warme Bäder', url: 'https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/entspannung-und-schlaf/' },
  ndrNutrition: { title: 'NDR: Ernährung aus „Tatsächlich schwanger“ (ergänzend)', url: 'https://www.ndr.de/ratgeber/gesundheit/Ernaehrung-in-der-Schwangerschaft-Was-ist-erlaubt-was-eher-nicht,ernaehrung676.html' },
};
const variant = (id, label, level, text) => ({ id, label, level, text });
export const GUIDE_ITEMS = [
  { id: 'lachs', title: 'Lachs & Sushi mit Fisch', category: 'food', aliases: ['Fisch', 'Sashimi', 'Räucherlachs', 'Graved Lachs', 'Stremellachs'], sources: ['raw', 'bfr', 'ndrNutrition'], variants: [
    variant('raw', 'Roh, geräuchert oder gebeizt', 'avoid', 'So nicht essen. Räuchern oder Beizen ersetzt kein ausreichendes Erhitzen.'),
    variant('cooked', 'Frisch vollständig durchgegart', 'ok', 'Gut durchgegart möglich. Hygiene und Kühlung beachten; die Freigabe gilt nicht pauschal für jede Fischart.'),
  ] },
  { id: 'fleisch', title: 'Fleisch & Geflügel', category: 'food', aliases: ['Steak', 'Mett', 'Tatar', 'Carpaccio', 'Hähnchen', 'Huhn', 'Rind'], sources: ['raw', 'ndrNutrition'], variants: [
    variant('raw', 'Roh oder innen noch rosa', 'avoid', 'Auf rohe und nicht vollständig gegarte Fleischgerichte verzichten.'),
    variant('cooked', 'Frisch vollständig durchgegart', 'ok', 'Gut durchgegart möglich. Rohe Zutaten und Küchenutensilien getrennt halten.'),
  ] },
  { id: 'rohwurst', title: 'Salami & roher Schinken', category: 'food', aliases: ['Rohwurst', 'Mettwurst', 'Parmaschinken', 'Pizza'], sources: ['raw', 'bfr'], variants: [
    variant('cold', 'Kalt / nicht durcherhitzt', 'avoid', 'Rohwurst und rohen Schinken unerhitzt meiden.'),
    variant('hot', 'Vollständig durcherhitzt', 'ok', 'Möglich, wenn auch innen mindestens 70 °C für zwei Minuten erreicht werden. Nur warm oder kurz überbacken genügt nicht.'),
  ] },
  { id: 'milch', title: 'Milch, Joghurt & Quark', category: 'food', aliases: ['Rohmilch', 'H-Milch', 'pasteurisiert', 'Milchprodukte'], sources: ['raw'], variants: [
    variant('raw', 'Aus Rohmilch / unerhitzt', 'avoid', 'Rohmilch und entsprechende unerhitzte Produkte meiden.'),
    variant('pasteurized', 'Wärmebehandelt / pasteurisiert', 'ok', 'Geeignet bei hygienischer Lagerung und Zubereitung. Kühlhinweise beachten.'),
  ] },
  { id: 'kaese', title: 'Käse: Sorte und Herstellung zählen', category: 'food', aliases: ['Rohmilchkäse', 'Harzer', 'Limburger', 'Parmesan', 'Grana Padano', 'Camembert', 'Brie', 'Gorgonzola'], sources: ['bfr', 'infections'], variants: [
    variant('unknown', 'Sorte / Herstellung unklar', 'caution', 'Etikett prüfen oder nachfragen. Pasteurisierte Milch allein macht nicht jede Käsesorte geeignet.'),
    variant('risk', 'Rohmilch-Weichkäse, Schmiere- oder Blauschimmelkäse', 'avoid', 'Unerhitzt meiden; dies betrifft auch bestimmte Sorten aus pasteurisierter Milch.'),
    variant('hard', 'Mindestens sechs Monate gereifter Hartkäse', 'ok', 'Das BfR nennt etwa Parmigiano Reggiano und Grana Padano als Ausnahme bei Rohmilchkäse. Hygienisch lagern und zubereiten.'),
    variant('hot', 'Vollständig durcherhitzt', 'ok', 'Nur bei vollständiger Erhitzung: mindestens 70 °C für zwei Minuten auch innen. Bloßes Anschmelzen reicht nicht.'),
  ] },
  { id: 'eier', title: 'Eier, Tiramisu & Mayonnaise', category: 'food', aliases: ['Rohei', 'Spiegelei', 'Frühstücksei', 'Dessert'], sources: ['infections', 'ndrNutrition'], variants: [
    variant('raw', 'Mit rohem oder noch weichem Ei', 'avoid', 'Rohei-Speisen und nicht durchgegarte Eier meiden.'),
    variant('cooked', 'Eiweiß und Eigelb vollständig fest', 'ok', 'Vollständig gegart möglich; hygienisch zubereiten.'),
  ] },
  { id: 'beeren', title: 'Tiefkühlbeeren', category: 'food', aliases: ['TK-Beeren', 'Himbeeren', 'Smoothie', 'Blaubeeren'], sources: ['infections', 'ndrNutrition'], variants: [
    variant('cold', 'Nur aufgetaut / im kalten Smoothie', 'avoid', 'Bloßes Auftauen beseitigt mögliche Erreger nicht.'),
    variant('hot', 'Vorher stark erhitzt', 'ok', 'Nur nach starker Erhitzung verzehren.'),
  ] },
  { id: 'sprossen', title: 'Sprossen & Keimlinge', category: 'food', aliases: ['Sojasprossen', 'Mungobohnen', 'Keimsprossen'], sources: ['infections', 'ndrNutrition'], variants: [
    variant('raw', 'Roh', 'avoid', 'Rohe Sprossen meiden. Waschen allein genügt nicht.'),
    variant('hot', 'Stark erhitzt', 'ok', 'Nur nach starker Erhitzung verzehren.'),
  ] },
  { id: 'obst', title: 'Frisches Obst, Gemüse & Salat', category: 'food', aliases: ['Apfel', 'Erdbeeren', 'Tomate', 'Rohkost', 'Gemüse'], sources: ['bund'], level: 'ok', text: 'Frisch und gründlich gewaschen möglich. Ungewaschene Ware kann Erreger übertragen.' },
  { id: 'kaffee', title: 'Kaffee, Tee & Koffein', category: 'food', aliases: ['Espresso', 'Cappuccino', 'Cola', 'Schwarztee', 'Grüntee', 'Koffein'], sources: ['nutrition'], level: 'caution', text: 'Begrenzen: insgesamt höchstens 200 mg Koffein täglich aus allen Quellen. Der Gehalt pro Tasse variiert; Portionsgröße und Produkt beachten.' },
  { id: 'energy', title: 'Energy-Drinks', category: 'food', aliases: ['Energydrink', 'Red Bull', 'Monster'], sources: ['bund'], level: 'avoid', text: 'In der Schwangerschaft darauf verzichten. Neben Koffein sind weitere Inhaltsstoffe und ihre Wechselwirkungen zu berücksichtigen.' },
  { id: 'alkohol', title: 'Alkohol', category: 'food', aliases: ['Wein', 'Bier', 'Sekt', 'Cocktail', 'Spirituosen'], sources: ['nutrition', 'ndrNutrition'], level: 'avoid', text: 'Während der gesamten Schwangerschaft keinen Alkohol trinken. Auch kleine Mengen können schaden; es gibt keine Freigabe für spätere Wochen.' },
  { id: 'leber', title: 'Leber', category: 'food', aliases: ['Innereien', 'Vitamin A'], sources: ['bund'], level: 'caution', text: 'Im ersten Schwangerschaftsdrittel ganz meiden. Ab dem zweiten laut Quelle nur kleine Mengen, höchstens 125 g pro Woche. Keine automatische Freigabe durch ein Kalenderdatum.', phase: 'trimester' },
  { id: 'thunfisch', title: 'Thunfisch & große Raubfische', category: 'food', aliases: ['Schwertfisch', 'Hai', 'Heilbutt', 'Aal', 'Fischkonserve'], sources: ['nutrition'], level: 'avoid', text: 'Thunfisch, Schwertfisch, Heilbutt, Aal und Hai wegen möglicher Schadstoffbelastung meiden. Durchgaren beseitigt dieses Risiko nicht.' },
  { id: 'lakritz', title: 'Lakritz', category: 'food', aliases: ['Süßholz', 'Salmiak'], sources: ['bund'], level: 'caution', text: 'Regelmäßig größere Mengen vermeiden. Ein allgemeiner Grenzwert wird hier nicht festgelegt.' },
  { id: 'wasser', title: 'Wasser & ausgewogene Mahlzeiten', category: 'food', aliases: ['Vollkorn', 'Kartoffeln', 'Hülsenfrüchte', 'Nüsse', 'Trinken'], sources: ['nutrition'], level: 'ok', text: 'Wasser als Getränk und abwechslungsreiche, überwiegend pflanzliche Mahlzeiten sind eine gute Grundlage. Eigene Allergien und Zubereitung beachten.' },
  { id: 'bewegung', title: 'Sport & Bewegung im Alltag', category: 'activity', aliases: ['Training', 'Fitness', 'Beckenboden', 'Ausdauer'], sources: ['movement'], level: 'ok', text: 'Bei gesunder Schwangerschaft ohne Gegenanzeigen: mindestens 150 Minuten moderate Bewegung pro Woche, verteilt auf mehrere Tage. Unterhaltung sollte möglich bleiben. Langsam steigern; bei Erkrankungen oder Beschwerden individuell abklären.' },
  { id: 'walking', title: 'Spazieren, Walking & Radfahren', category: 'activity', aliases: ['Wandern', 'Fahrrad', 'Nordic Walking'], sources: ['movement'], level: 'ok', text: 'In moderatem Tempo geeignet, sofern medizinisch nichts dagegenspricht. Sturzrisiko und eigene Erfahrung berücksichtigen; bei großer Hitze Belastung verlegen und ausreichend trinken.' },
  { id: 'schwimmen', title: 'Schwimmen & Aquafitness', category: 'activity', aliases: ['Wassergymnastik', 'Schwimmbad'], sources: ['movement'], level: 'ok', text: 'Bei unkomplizierter Schwangerschaft geeignete moderate Bewegungsformen, auch für Einsteigerinnen. Belastung an das eigene Befinden anpassen.' },
  { id: 'joggen', title: 'Joggen', category: 'activity', aliases: ['Laufen', 'Marathon'], sources: ['sport'], level: 'caution', text: 'Geübte Läuferinnen können angepasst weiterlaufen, wenn keine medizinischen Gegenanzeigen bestehen. Überanstrengung vermeiden; eine Unterhaltung sollte noch möglich sein. Vorerfahrung zählt.' },
  { id: 'kraft', title: 'Krafttraining', category: 'activity', aliases: ['Gewichte', 'Fitnessstudio', 'Hanteln', 'Bauchmuskeltraining'], sources: ['sport'], level: 'caution', text: 'Angepasst möglich: eher leichtere Gewichte und mehr Wiederholungen. Das Training mit der Betreuung abstimmen; die Quelle rät ab der 20. SSW von isoliertem Training der geraden Bauchmuskeln ab.' },
  { id: 'rueckenlage', title: 'Übungen in Rückenlage', category: 'activity', aliases: ['Yoga', 'Pilates', 'Gymnastik', 'Rücken'], sources: ['movement'], level: 'caution', text: 'Im zweiten und dritten Schwangerschaftsdrittel Aktivitäten in Rückenlage vermeiden. Andere Positionen und eine angepasste Anleitung wählen.', phase: 'trimester' },
  { id: 'kontakt', title: 'Kontakt- und Sportarten mit hohem Sturzrisiko', category: 'activity', aliases: ['Kampfsport', 'Fußball', 'Boxen', 'Reiten', 'Skifahren', 'Mannschaftssport'], sources: ['sport'], level: 'avoid', text: 'Sportarten mit Schlägen, Stößen oder hoher Sturz- und Verletzungsgefahr in der Schwangerschaft meiden. Eine risikoärmere Alternative wählen.' },
  { id: 'tauchen', title: 'Gerätetauchen', category: 'activity', aliases: ['Scuba', 'Drucklufttauchen', 'Tauchurlaub'], sources: ['sport'], level: 'avoid', text: 'Während der Schwangerschaft nicht ausüben. Auf die Zeit nach der Schwangerschaft verschieben; Schwimmen ist eine andere Aktivität.' },
  { id: 'sauna', title: 'Sauna', category: 'activity', aliases: ['Bio-Sauna', 'Schwitzen', 'Hitze', 'Wellness'], sources: ['relaxation'], level: 'caution', text: 'Nicht pauschal verboten. Kürzer bleiben, mäßige Temperaturen bis 70 °C und niedrige Bänke wählen; bei Unwohlsein abbrechen. Besonders in den ersten drei Monaten vorsichtig. Bei Gefäßerkrankungen oder drohender Frühgeburt wird davon abgeraten; bei Unsicherheit vorher ärztlich fragen.', phase: 'early' },
  { id: 'baden', title: 'Warme Bäder', category: 'activity', aliases: ['Badewanne', 'Baden', 'Heißes Bad'], sources: ['relaxation'], level: 'caution', text: 'Ein warmes Bad ist möglich. Wasser nicht über 40 °C, Überhitzung vermeiden und auf den Kreislauf achten. Bei Unwohlsein aussteigen; besonders in den ersten drei Monaten vorsichtig.' },
];
