// Original summaries of the linked public-health sources; no imported app content.
const BASE = 'https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/';
export const phases = [
  { start: 1, end: 4, title: 'Der Anfang von etwas Großem',
    body: 'Noch ist äußerlich meist nichts zu merken. Auch die Wochen vor der Befruchtung gehören zur medizinischen Zählung.',
    tip: 'Bei Kinderwunsch oder positivem Test: Folsäure und die weitere Begleitung besprechen.',
    size: 'Winzig klein', comparison: 'Etwa ein Mohnsamen am Ende dieser Phase',
    weeks: [
      ['Ein neuer Zyklus beginnt', 'Die Zählung startet mit der Periode. Eine Befruchtung hat zu diesem rechnerischen Zeitpunkt noch nicht stattgefunden.'],
      ['Der Körper bereitet sich vor', 'Eine Eizelle reift heran. Der Eisprung hängt vom individuellen Zyklus ab und lässt sich hier nur schätzen.'],
      ['Ein möglicher Neubeginn', 'Nach einer Befruchtung teilen sich die Zellen und wandern Richtung Gebärmutter.'],
      ['Ein Platz zum Wachsen', 'In dieser frühen Phase kann sich die befruchtete Eizelle einnisten. Die Versorgung des Embryos beginnt sich aufzubauen.'],
    ] },
  { start: 5, end: 8, title: 'So viel passiert im Kleinen',
    body: 'Müdigkeit, empfindliche Brüste oder Übelkeit können auftreten. Manche spüren wenig. Beschwerden allein sagen nichts Verlässliches über die Entwicklung aus.',
    tip: 'Vereinbare eine erste Vorsorge und suche frühzeitig nach einer Hebamme.',
    size: 'Eine Weintraube', comparison: 'Bildhafter Größenvergleich zum Ende der 8. SSW',
    weeks: [
      ['Die ersten Anlagen entstehen', 'Die Grundlagen für Gehirn und Rückenmark bilden sich. Auch das Herz beginnt sich zu entwickeln.'],
      ['Ein winziges Herz', 'Das frühe Herz und der Kreislauf entwickeln sich weiter. Wann Herzaktivität im Ultraschall erkennbar ist, kann variieren.'],
      ['Kleine Arme, kleine Beine', 'Ansätze von Armen und Beinen wachsen. Kopf und Gesicht nehmen weiter Form an.'],
      ['Alles auf Wachstum', 'Die Organanlagen werden komplexer. Augen, Ohren und das Skelett entwickeln sich weiter.'],
    ] },
  { start: 9, end: 12, title: 'Aus Anlagen wird Zusammenspiel',
    body: 'Bei manchen lässt die Übelkeit allmählich nach, bei anderen dauert sie länger. Dein Bauch und deine Brüste können sich verändern.',
    tip: 'Sammle deine Fragen für die Vorsorge. Es gibt keinen richtigen Zeitpunkt, anderen von deiner Schwangerschaft zu erzählen.',
    size: 'Eine Aprikose', comparison: 'Bildhafter Vergleich zum Ende dieser Phase',
    weeks: [
      ['Ein kleines Zusammenspiel', 'Nerven und Muskeln beginnen zusammenzuarbeiten. Das Baby bewegt sich, lange bevor du etwas davon spürst.'],
      ['Feine Details wachsen', 'Finger und Gesicht werden differenzierter. Gehirn und innere Organe entwickeln sich weiter.'],
      ['Immer mehr in Bewegung', 'Arme und Beine bewegen sich. Auch Nieren und Verdauung übernehmen nach und nach erste Aufgaben.'],
      ['Ein wichtiger Abschnitt', 'Die Organanlagen sind weiter ausgebildet. Die Plazenta wächst mit und übernimmt zunehmend die Versorgung.'],
    ] },
  { start: 13, end: 16, title: 'Mehr Raum zum Wachsen',
    body: 'Viele fühlen sich nun etwas energiegeladener. Ein wachsender Bauch und veränderte Körperformen gehören zu dieser Phase, sehen aber bei jedem anders aus.',
    tip: 'Plane kleine Pausen ein und besprich passende Bewegung mit deiner Hebamme oder Arztpraxis.',
    size: 'Ein Granatapfel', comparison: 'Bildhafter Vergleich zum Ende der 16. SSW',
    weeks: [
      ['Wachsen und reifen', 'Das Baby wächst weiter. Nervensystem und Reflexe helfen ihm zunehmend, seine Bewegungen zu koordinieren.'],
      ['Ein kleiner Bewegungskünstler', 'Im Fruchtwasser kann sich das Baby drehen und wenden. Du musst das jetzt noch nicht spüren.'],
      ['Ein schützender Flaum', 'In dieser Phase entwickeln sich feine Körperhärchen. Haut und schützende Käseschmiere bilden sich weiter aus.'],
      ['Mehr Halt für den Körper', 'Das Skelett wird stabiler. Weicher Knorpel wird nach und nach durch Knochengewebe ergänzt.'],
    ] },
  { start: 17, end: 20, title: 'Vielleicht ein erstes Flattern',
    body: 'Der Bauch wächst und drückt vielleicht öfter auf die Blase. Erste Bewegungen können sich wie ein sanftes Blubbern anfühlen; der Zeitpunkt ist unterschiedlich.',
    tip: 'Der zweite Basis-Ultraschall liegt bei 18+0 bis 21+6. Notiere, was du dabei gern fragen möchtest.',
    size: 'Etwa 400 g', comparison: 'Orientierungswert zum Ende der 20. SSW',
    weeks: [
      ['Ein vertrautes kleines Gesicht', 'Augen, Ohren, Nase und Mund sind deutlich ausgebildet. Dein Baby bewegt sich regelmäßig im Fruchtwasser.'],
      ['Die Sinne entwickeln sich', 'Der Geschmackssinn entwickelt sich weiter. Das Baby übt Bewegungen und kann am Daumen lutschen.'],
      ['Kleine Bewegungen, großes Gefühl', 'Dein Baby bewegt Arme und Beine und übt Schlucken und Saugen. Vielleicht spürst du schon ein erstes Flattern.'],
      ['Auf dem Weg zur Halbzeit', 'Das Baby wächst und wird kräftiger. Beim Ultraschall lassen sich viele seiner Körperstrukturen genauer ansehen.'],
    ] },
  { start: 21, end: 24, title: 'Ihr lernt euch kennen',
    body: 'Bewegungen werden für viele deutlicher wahrnehmbar. Das Baby hat eigene Ruhe- und Aktivitätsphasen, die sich von deinen unterscheiden können.',
    tip: 'Besprich mit deiner Praxis den anstehenden Test auf Schwangerschaftsdiabetes.',
    size: 'Etwa 600–800 g', comparison: 'Orientierungswert zum Ende der 24. SSW',
    weeks: [
      ['Eine neue Verbindung', 'Die Organreifung geht weiter. Das Baby übt zu greifen und bewegt sich im Fruchtwasser.'],
      ['Mit kleinen Händen entdecken', 'Das Baby kann die Hände zu Fäusten schließen und am Daumen saugen. So trainiert es Bewegungen und Wahrnehmung.'],
      ['Stabiler und kräftiger', 'Das Skelett entwickelt sich weiter. Die Schädelknochen bleiben beweglich, damit das Gehirn weiter wachsen kann.'],
      ['Noch viel Zeit zum Reifen', 'Das Baby wächst und seine Organe reifen weiter. Besonders die Lunge braucht noch Zeit für das Leben außerhalb des Bauches.'],
    ] },
  { start: 25, end: 28, title: 'Die Welt wird hörbarer',
    body: 'Mit dem wachsenden Bauch kann eine bequeme Schlafposition schwieriger werden. Ein Kissen zur Unterstützung kann angenehm sein.',
    tip: 'Sprich bei der Vorsorge über deinen Schlaf, Beschwerden und die weitere Geburtsvorbereitung.',
    size: 'Etwa 1.200 g', comparison: 'Orientierungswert zum Ende der 28. SSW',
    weeks: [
      ['Kräftige kleine Tritte', 'Das Skelett wird fester. Bewegungen können nun manchmal auch von außen wahrnehmbar sein.'],
      ['Eine Welt voller Geräusche', 'Das Gehör entwickelt sich weiter. Das Baby nimmt zunehmend Geräusche aus deinem Körper und seiner Umgebung wahr.'],
      ['Ein kleiner Augenblick', 'In dieser Phase beginnen sich die Augenlider zu öffnen. Dein Baby übt auch das Blinzeln.'],
      ['Wachsen, hören, reifen', 'Das Baby legt weiter an Gewicht zu. Gesicht, Nägel und Skelett sind schon deutlich ausgebildet.'],
    ] },
  { start: 29, end: 32, title: 'Ein immer kräftigeres Wunder',
    body: 'Der Alltag kann anstrengender werden. Auch bei weniger Platz sollen Bewegungen weiter spürbar bleiben. Bei deutlich weniger oder veränderten Bewegungen sofort die Geburtsklinik kontaktieren.',
    tip: 'Plane Unterstützung für die erste Zeit nach der Geburt und besprich offene Fragen zur Geburtsbegleitung.',
    size: 'Etwa 1.500 g', comparison: 'Orientierungswert zum Ende der 32. SSW',
    weeks: [
      ['Jetzt wird zugelegt', 'Dein Baby baut weitere Reserven auf. Es wird kräftiger und verändert weiterhin seine Lage.'],
      ['Licht und Bewegung', 'Das Baby kann auf Licht reagieren, das durch die Bauchdecke dringt. Seine Wahrnehmung entwickelt sich weiter.'],
      ['Üben für später', 'Das Baby übt Atembewegungen mit Fruchtwasser. Manchmal ist ein rhythmisches Zucken als Schluckauf zu spüren.'],
      ['Klein, aber schon so vertraut', 'Viele Körperstrukturen sind weit entwickelt. Lunge und andere Organe reifen weiter bis zur Geburt.'],
    ] },
  { start: 33, end: 36, title: 'Langsam Richtung Kennenlernen',
    body: 'Rutscht das Baby tiefer ins Becken, fällt das Atmen manchmal leichter, während der Druck auf die Blase zunehmen kann.',
    tip: 'Packe in Ruhe deine Geburtstasche und halte die Nummer deiner Geburtsklinik griffbereit.',
    size: 'Etwa 2.500–2.800 g', comparison: 'Orientierungswert zum Ende der 36. SSW',
    weeks: [
      ['Reserven für den Start', 'Das Baby nimmt weiter zu. Fettreserven helfen ihm später, seine Körpertemperatur zu halten.'],
      ['Ein kleines Training', 'Schlucken, Saugen und Bewegen bleiben wichtig. Magen, Nieren und Blase arbeiten bereits im Mutterleib.'],
      ['Die Lunge reift weiter', 'Die Vorbereitung auf den ersten Atemzug geht weiter. Eine körpereigene Substanz hilft später, die Lungenbläschen offen zu halten.'],
      ['Die Lage wird wichtig', 'Viele Babys liegen bereits mit dem Kopf nach unten. Deine Praxis bespricht die Lage und mögliche nächste Schritte mit dir.'],
    ] },
  { start: 37, end: 40, title: 'Bald seid ihr euch ganz nah',
    body: 'Warten kann sich lang anfühlen. Der errechnete Termin ist eine Orientierung. Besprich Geburtszeichen und den Zeitpunkt, an dem du dich melden sollst, mit deinem Geburtsteam.',
    tip: 'Bleibe mit deinem Geburtsteam in Kontakt. Bei Fruchtwasserabgang oder Unsicherheit direkt melden.',
    size: 'Etwa 48–54 cm', comparison: 'Häufige Körperlänge bei der Geburt, kein persönlicher Messwert',
    weeks: [
      ['Die letzten Vorbereitungen', 'Dein Baby nimmt weiter zu. Die Organreifung geht auch in den letzten Schwangerschaftswochen weiter.'],
      ['Geborgen bis zum Start', 'Über die Plazenta werden weiterhin mütterliche Antikörper übertragen. Das Baby übt Schlucken und Saugen.'],
      ['Noch ein bisschen reifen', 'Gehirn und Lunge entwickeln sich weiter. Das Baby bleibt aktiv, auch wenn es weniger Platz hat.'],
      ['Euer eigener Zeitpunkt', 'Das Baby wächst weiter. Der errechnete Termin sagt nicht voraus, an welchem Tag die Geburt tatsächlich beginnt.'],
    ] },
  { start: 41, end: 42, title: 'Gut begleitet durch die Wartezeit',
    body: 'Rund um und nach dem Termin ist eine individuell abgestimmte Betreuung wichtig. Warte bei Beschwerden oder veränderten Kindsbewegungen nicht auf den nächsten Termin.',
    tip: 'Vereinbare mit deinem Geburtsteam den nächsten Kontrolltermin und besprecht das weitere Vorgehen.',
    size: 'Euer eigenes Tempo', comparison: 'Die weitere Betreuung wird individuell abgestimmt',
    source: 'https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/3rd-trimester/week-41/',
    weeks: [
      ['Der Termin ist eine Schätzung', 'Das Baby kann noch im Bauch sein. Besprich mit deinem Geburtsteam, wie ihr die weitere Betreuung und Kontrollen plant.'],
      ['In enger Begleitung', 'Kontrollen und das weitere Vorgehen gehören in die Hände deines Geburtsteams. Die App kann das Wohlbefinden des Babys nicht beurteilen.'],
    ] },
];

export function getWeekContent(week) {
  const phase = phases.find(p => week >= p.start && week <= p.end);
  if (!phase) throw new RangeError('Wocheninfos sind für die 1. bis 42. SSW verfügbar.');
  const [title, baby] = phase.weeks[week - phase.start];
  return { ...phase, title, baby, phaseTitle: phase.title, source: phase.source || `${BASE}${phase.start}-bis-${phase.end}-schwangerschaftswoche/` };
}

// Exact windows in completed gestational weeks + days, based on German care.
export const milestones = [
  { id: 'first-care', start: 0, end: 55, title: 'Vorsorge & Hebamme', label: 'Möglichst früh', text: 'Erste Vorsorge vereinbaren und nach einer Hebamme suchen.', source: 'https://www.familienplanung.de/schwangerschaft/schwangerschaftsvorsorge-und-begleitung/vorsorge-zur-sicherheit/' },
  { id: 'scan-1', start: 56, end: 83, title: 'Erster Basis-Ultraschall', label: '8+0 bis 11+6', text: 'Entwicklung, Lage und Datierung der Schwangerschaft besprechen.', source: 'https://www.gesundheitsinformation.de/ultraschalluntersuchungen-in-der-schwangerschaft.html' },
  { id: 'scan-2', start: 126, end: 153, title: 'Zweiter Basis-Ultraschall', label: '18+0 bis 21+6', text: 'Wachstum und körperliche Entwicklung werden genauer angesehen.', source: 'https://www.gesundheitsinformation.de/ultraschalluntersuchungen-in-der-schwangerschaft.html' },
  { id: 'diabetes', start: 168, end: 195, title: 'Test auf Schwangerschaftsdiabetes', label: '24+0 bis 27+6', text: 'Mit deiner Praxis einen Termin für den Blutzucker-Suchtest abstimmen.', source: 'https://www.g-ba.de/richtlinien/19/' },
  { id: 'scan-3', start: 196, end: 223, title: 'Dritter Basis-Ultraschall', label: '28+0 bis 31+6', text: 'Unter anderem werden Wachstum und Lage deines Babys beurteilt.', source: 'https://www.gesundheitsinformation.de/ultraschalluntersuchungen-in-der-schwangerschaft.html' },
  { id: 'birth-prep', start: 224, end: 251, title: 'Geburt & Wochenbett vorbereiten', label: 'Ab 32+0 · individuell', text: 'Geburtsort, Begleitung, Tasche und Unterstützung für danach planen.', source: 'https://www.familienplanung.de/schwangerschaft/die-geburt/geburtsvorbereitung/' },
  { id: 'due-care', start: 273, end: 400, title: 'Betreuung rund um den Termin', label: 'Ab 39+0 · individuell', text: 'Kontrolltermine und das weitere Vorgehen mit deinem Geburtsteam besprechen.', source: 'https://www.familienplanung.de/schwangerschaft/geburtstermin-berechnen/' },
];
