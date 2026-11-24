import { searchKey } from './guide.js';

export const KNOWLEDGE_REVIEWED = '2026-11-24';
export const KNOWLEDGE_SOURCES = {
  gba: { title: 'G-BA · NIPT und Voraussetzungen', url: 'https://www.g-ba.de/themen/methodenbewertung/schwangerschaft-mutterschaft/faqs-nipt/' },
  iqwig: { title: 'IQWiG · Bluttest auf Trisomien', url: 'https://www.gesundheitsinformation.de/bluttest-auf-trisomien-nicht-invasiver-praenataltest-nipt.html' },
  pnd: { title: 'BIÖG · Pränataldiagnostik', url: 'https://www.familienplanung.de/schwangerschaft/die-schwangerschaft/praenataldiagnostik/was-ist-praenataldiagnostik/' },
  ets: { title: 'BIÖG · Ersttrimester-Screening', url: 'https://www.familienplanung.de/schwangerschaft/praenataldiagnostik/ersttrimester-screening/' },
  rki: { title: 'RKI · Zytomegalievirus-Infektion', url: 'https://www.rki.de/DE/Aktuelles/Publikationen/RKI-Ratgeber/Ratgeber/Ratgeber_Zytomegalievirus.html' },
  cmv: { title: 'BIÖG · Zytomegalie', url: 'https://www.familienplanung.de/schwangerschaft/beschwerden-und-krankheiten/akute-erkrankungen-und-infektionen/zytomegalie/' },
  toxo: { title: 'BIÖG · Toxoplasmose', url: 'https://www.familienplanung.de/schwangerschaft/beschwerden-und-krankheiten/akute-erkrankungen-und-infektionen/toxoplasmose/' },
  pass: { title: 'BIÖG · Mutterpass erklärt', url: 'https://www.familienplanung.de/schwangerschaft/schwangerschaftsvorsorge/der-mutterpass/' },
  size: { title: 'BIÖG · Alter und Größe messen', url: 'https://www.familienplanung.de/schwangerschaft/schwangerschaftsvorsorge-und-begleitung/wie-werden-alter-und-groesse-gemessen/' },
  glucose: { title: 'IQWiG · Schwangerschaftsdiabetes feststellen', url: 'https://www.gesundheitsinformation.de/wie-wird-schwangerschaftsdiabetes-festgestellt.html' },
  maternity: { title: 'G-BA · Leistungen der Mutterschaftsvorsorge', url: 'https://www.g-ba.de/themen/methodenbewertung/schwangerschaft-mutterschaft/' },
  ctg: { title: 'BIÖG · CTG', url: 'https://www.familienplanung.de/service/lexikon/ctg/' },
  ndrPnd: { title: 'NDR · Pränataldiagnostik (ergänzend)', url: 'https://www.ndr.de/ratgeber/gesundheit/Praenataldiagnostik-Welche-Untersuchungen-sind-sinnvoll,praenataldiagnostik102.html' },
  podcast: { title: 'NDR · Tatsächlich schwanger, Folge 1 (Themen und Audio)', url: 'https://www.ndr.de/n-joy/01-Schwanger-Was-muss-ich-jetzt-beachten,audio1451116.html' },
};
const section = (title, text, sources) => ({ title, text, sources });
export const KNOWLEDGE_ARTICLES = [
  { id: 'nipt', category: 'tests', title: 'NIPT · den Bluttest verstehen', summary: 'Was untersucht wird, was ein Ergebnis bedeutet und was du entscheiden kannst.', aliases: ['Trisomie', 'DNA', 'Harmony', 'Panorama', 'Praena', 'Screening'], question: 'Was würde ein NIPT in meiner Situation klären und was folgt aus einem auffälligen oder nicht auswertbaren Ergebnis?', sections: [
    section('Was wird untersucht?', 'Beim nicht invasiven Pränataltest wird Blut aus deiner Armvene untersucht. Daraus lässt sich die Wahrscheinlichkeit für die Trisomien 13, 18 und 21 abschätzen. Das untersuchte Erbgut stammt überwiegend aus der Plazenta. Der Test erfasst ausgewählte Veränderungen und kann die Gesundheit des Kindes insgesamt nicht bestätigen. Er ersetzt die Ultraschalluntersuchungen nicht.', ['iqwig', 'gba']),
    section('Wann und für wen?', 'Der genaue Beginn hängt vom Test ab. Die App führt das bestehende Vorsorgefenster ab 10+0. Besprich vorher den passenden Zeitpunkt, den Umfang und mögliche Folgen. Der Test ist freiwillig. Du darfst ihn ablehnen und hast ein Recht auf Nichtwissen. Die gesetzliche Kasse übernimmt den NIPT auf diese Trisomien in begründeten Einzelfällen nach Beratung. Er ist keine Routineleistung für jede Schwangere.', ['gba', 'iqwig']),
    section('Die drei möglichen Ergebnisse', 'Unauffällig bedeutet, dass die untersuchten Trisomien sehr unwahrscheinlich sind. Auffällig bedeutet einen Verdacht, der vor weitreichenden Entscheidungen durch Diagnostik wie eine Fruchtwasseruntersuchung abgeklärt werden muss. Manchmal ist kein Ergebnis möglich, etwa bei zu wenig auswertbarer DNA. Dann werden Wiederholung oder weitere Diagnostik besprochen. Die Aussagekraft eines auffälligen Ergebnisses hängt auch von der Ausgangswahrscheinlichkeit ab.', ['iqwig', 'gba']),
    section('Für dein Gespräch', 'Frage nach den konkret untersuchten Veränderungen, den Kosten, dem Vorgehen bei jedem Ergebnis und unabhängiger Beratung. Lass dir Zeit für die Entscheidung.', ['pnd']),
  ], related: ['pnd', 'ets', 'invasiv'], extra: ['ndrPnd'] },
  { id: 'pnd', category: 'tests', title: 'Pränataldiagnostik · welche Möglichkeiten gibt es?', summary: 'Ultraschall, Bluttests und gezielte Abklärung einordnen.', aliases: ['PND', 'Diagnose', 'Screening', 'Feindiagnostik', 'Organultraschall'], question: 'Welche Untersuchung passt zu meiner Frage und welche Entscheidungen könnte ihr Ergebnis nach sich ziehen?', sections: [
    section('Untersuchungen vor der Geburt', 'Pränatal bedeutet vor der Geburt. Mit Pränataldiagnostik sind meist zusätzliche Untersuchungen gemeint, die gezielt nach Auffälligkeiten oder genetischen Veränderungen suchen. Dazu zählen spezielle Ultraschallverfahren, Bluttests und Untersuchungen von Fruchtwasser oder Plazentagewebe.', ['pnd']),
    section('Was lässt sich daraus ableiten?', 'Ein Screening schätzt eine Wahrscheinlichkeit. Zur gezielten Bestätigung kann weitere Diagnostik nötig sein. Auch umfassende Untersuchungen erfassen nur einen Teil möglicher Erkrankungen und sagen deren späteren Verlauf oft nicht voraus.', ['pnd', 'iqwig']),
    section('Deine Entscheidung', 'Vor einer Untersuchung gehören Nutzen, Grenzen, Risiken, Kosten und mögliche Folgen in ein Beratungsgespräch. Du kannst zusätzliche psychosoziale Beratung nutzen. Ob du eine angebotene Untersuchung möchtest, entscheidest du selbst.', ['pnd', 'iqwig']),
  ], related: ['nipt', 'ets', 'invasiv'], extra: ['ndrPnd'] },
  { id: 'ets', category: 'tests', title: 'Ersttrimester-Screening und Nackentransparenz', summary: 'Was zwischen 11+0 und 13+6 besprochen werden kann.', aliases: ['ETS', 'Nackenfalte', 'PAPP', 'Präeklampsie'], question: 'Welche Bestandteile umfasst das Ersttrimester-Screening bei Ihnen und was bedeuten die möglichen Ergebnisse?', sections: [
    section('Was gehört dazu?', 'Das Ersttrimester-Screening kombiniert Ultraschall und gegebenenfalls Blutwerte zur Risikoeinschätzung. Die Nackentransparenz ist eine Flüssigkeitszone am kindlichen Nacken, die im Ultraschall gemessen wird. Je nach Angebot werden auch frühe Organentwicklung oder das Risiko einer Präeklampsie betrachtet.', ['ets', 'pnd']),
    section('Zeitraum und Aussage', 'Das vorhandene App-Fenster ist 11+0 bis 13+6. Kläre den genauen Termin mit der Praxis. Eine Risikoberechnung stellt keine sichere Diagnose einer Trisomie. Ein auffälliges Ergebnis kann weitere Untersuchungen nach sich ziehen. Besprich vorher auch Umfang und Kosten des freiwilligen Angebots.', ['ets']),
  ], related: ['pnd', 'nipt', 'invasiv'] },
  { id: 'invasiv', category: 'tests', title: 'Fruchtwasseruntersuchung und Chorionzottenbiopsie', summary: 'Wozu Gewebe oder Fruchtwasser untersucht werden und welche Risiken dazugehören.', aliases: ['Amniozentese', 'Punktion', 'invasiv', 'Plazenta', 'Diagnostik'], question: 'Welche diagnostische Untersuchung würde meine Frage beantworten und welches Eingriffsrisiko besteht dabei?', sections: [
    section('Gezielt abklären', 'Bei der Chorionzottenbiopsie wird Gewebe aus der Plazenta entnommen, bei der Amniozentese Fruchtwasser. Dafür wird unter Ultraschallkontrolle eine dünne Nadel durch die Bauchdecke geführt. Die gewonnenen Zellen können auf bestimmte Veränderungen untersucht werden.', ['iqwig', 'pnd']),
    section('Zeitpunkt und Abwägung', 'Diese Eingriffe haben ein geringes Fehlgeburtsrisiko. Der passende Zeitpunkt und die untersuchte Fragestellung werden individuell besprochen. Im vorhandenen App-Kalender stehen die möglichen Fenster ab 11+0 für die Chorionzottenbiopsie und ab 15+0 für die Fruchtwasseruntersuchung. Ein auffälliges Screening ist Anlass zur Beratung über eine gezielte Abklärung.', ['iqwig', 'pnd']),
  ], related: ['nipt', 'pnd'] },
  { id: 'cmv', category: 'infections', title: 'CMV / ZMV · Zytomegalie', summary: 'Übertragung, Alltag mit Kleinkindern und Fragen für die Praxis.', aliases: ['Cytomegalie', 'Cytomegalovirus', 'Zytomegalievirus', 'Virus', 'Herpes', 'Kita'], question: 'Wie kann ich mein CMV-Risiko im Alltag senken und ist eine Untersuchung in meiner Situation sinnvoll?', sections: [
    section('Was ist CMV?', 'CMV und ZMV bezeichnen das Zytomegalievirus, ein Herpesvirus. Eine Infektion bleibt bei Erwachsenen häufig unbemerkt. Während der Schwangerschaft kann das Virus auf das Kind übergehen und dessen Entwicklung beeinträchtigen. Auch nach einer früheren Infektion sind erneute Infektionen oder Reaktivierungen möglich.', ['cmv', 'rki']),
    section('Was hilft im Alltag?', 'Besonders Kleinkinder können Viren längere Zeit in Speichel und Urin ausscheiden. Wasche die Hände mit Wasser und Seife nach dem Wickeln, Naseputzen oder Kontakt mit Speichel. Teile Besteck, Trinkgefäße und Zahnbürsten nicht mit Kleinkindern. Vermeide Mundküsse. Nähe lässt sich etwa durch Umarmen und Küssen auf die Stirn ausdrücken.', ['rki', 'cmv']),
    section('Wann ansprechen?', 'Hygiene ist während der gesamten Schwangerschaft sinnvoll. Sprich das Thema früh an, besonders bei engem Kontakt zu kleinen Kindern oder beruflicher Exposition. Bei konkretem Infektionsverdacht oder auffälligen Befunden zeitnah die Praxis kontaktieren. Ob und welche Tests sinnvoll sind und wie Ergebnisse einzuordnen sind, gehört ins ärztliche Gespräch.', ['rki', 'cmv']),
  ], related: ['toxo'], extra: ['podcast'] },
  { id: 'toxo', category: 'infections', title: 'Toxoplasmose · Lebensmittel, Erde und Katzen', summary: 'Wie du Kontakt zu möglichen Erregern reduzierst.', aliases: ['Toxoplasma', 'Katzenklo', 'Garten', 'Infektion', 'rohes Fleisch'], question: 'Welche Hygienemaßnahmen und gegebenenfalls Untersuchungen zu Toxoplasmose passen zu meinem Alltag?', sections: [
    section('Woher kommt die Infektion?', 'Toxoplasmose wird durch einen Parasiten verursacht. Er kann in rohem Fleisch, Katzenkot und verunreinigter Erde vorkommen. Eine Erstinfektion während der Schwangerschaft kann das ungeborene Kind schädigen, auch wenn du selbst wenig bemerkst.', ['toxo']),
    section('Im Alltag schützen', 'Fleisch vollständig durchgaren und Obst, Gemüse und Salat gründlich waschen. Bei Gartenarbeit Handschuhe tragen und danach die Hände waschen. Das Katzenklo möglichst von einer anderen Person reinigen lassen. Besprich bei einem konkreten Verdacht die Abklärung mit deiner Praxis. Ein allgemeiner Antikörpertest gehört nicht zur regulären Vorsorge und ist häufig selbst zu bezahlen.', ['toxo']),
  ], related: ['cmv'], extra: ['podcast'] },
  { id: 'diabetes', category: 'tests', title: 'Zuckertest · Schwangerschaftsdiabetes und oGTT', summary: 'Vortest, Diagnosetest und die Vorbereitung auf den Termin.', aliases: ['Glukose', 'Gestationsdiabetes', '50 g', '75 g', 'Blutzucker', 'nüchtern'], question: 'Welcher Zuckertest ist für meinen Termin geplant und wie muss ich mich vorbereiten?', sections: [
    section('Warum wird getestet?', 'Schwangerschaftsdiabetes bedeutet erhöhte Blutzuckerwerte während der Schwangerschaft. Häufig sind keine Beschwerden spürbar. Der angebotene Test kann helfen, rechtzeitig eine passende Betreuung zu beginnen. Das reguläre Zeitfenster in der App ist 24+0 bis 27+6.', ['glucose', 'maternity']),
    section('Kleiner und großer Test', 'Beim Vortest trinkst du eine Lösung mit 50 g Glukose. Danach wird Blut abgenommen. Dafür musst du üblicherweise nicht nüchtern sein. Ein erhöhter Vortestwert stellt noch keine Diagnose. Für die weitere Abklärung kann ein oraler Glukosetoleranztest, kurz oGTT, mit 75 g Glukose folgen. Hier ist die Vorbereitung anders und du musst nüchtern kommen. Lass dir die genauen Anweisungen für deinen Termin geben.', ['glucose', 'maternity']),
  ], related: ['mutterpass'] },
  { id: 'mutterpass', category: 'terms', title: 'Mutterpass · die wichtigsten Begriffe', summary: 'SSW, ET, RR, Hb, Rhesusfaktor, CTG und Kindslage kurz erklärt.', aliases: ['Abkürzungen', 'Glossar', 'Blutdruck', 'Antikörper', 'Anti-D', 'SL', 'BEL', 'QL', 'Fundus', 'CTG'], sections: [
    section('Datierung', 'SSW heißt Schwangerschaftswoche, ET errechneter Entbindungstermin. 12+3 bedeutet zwölf volle Wochen und drei Tage, also die laufende 13. SSW. Korr. kennzeichnet eine korrigierte Datierung. Für die Betreuung gilt die ärztlich festgelegte Grundlage.', ['pass']),
    section('Werte und Blutgruppe', 'RR bezeichnet den Blutdruck. Hb steht für Hämoglobin, den Blutfarbstoff. Der Rhesusfaktor ist ein Blutgruppenmerkmal. Eine Anti-D-Prophylaxe kann bei Rhesus-negativen Schwangeren nötig sein, um die Bildung bestimmter Antikörper zu verhindern. Voraussetzungen und Befunde erklärt die Praxis.', ['pass']),
    section('Lage und Wachstum', 'SL bedeutet Schädellage, BEL Beckenendlage und QL Querlage. Die Lage kann sich im Schwangerschaftsverlauf ändern. Der Fundus ist der obere Teil der Gebärmutter. Der Fundusstand beschreibt, wo er ertastet wird.', ['pass']),
    section('CTG', 'CTG steht für Kardiotokografie. Dabei werden kindliche Herztöne und Wehentätigkeit aufgezeichnet. Die Befunde besprichst du mit deinem Betreuungsteam.', ['ctg']),
  ], related: ['masse', 'nipt', 'pnd'] },
  { id: 'masse', category: 'terms', title: 'SSL, BPD und FL · Ultraschallmaße verstehen', summary: 'Welche Körperstrecke gemessen wird und weshalb Einheiten zählen.', aliases: ['KU', 'AU', 'HC', 'AC', 'Scheitel', 'Femurlänge', 'Kopfumfang', 'Bauchumfang', 'Größe', 'Gewicht'], sections: [
    section('Abkürzungen im Bericht', 'SSL ist die Scheitel-Steiß-Länge, die Strecke vom Kopf bis zum Steiß. BPD ist der Querdurchmesser des Kopfes. FL bezeichnet die Länge des Oberschenkelknochens. KU und AU bedeuten Kopf- und Bauchumfang. Übernimm Messart und Einheit aus deinem Bericht.', ['pass', 'size']),
    section('Werte vergleichen', 'SSL und Gesamtlänge beschreiben unterschiedliche Strecken. Zahlen lassen sich deshalb nur bei gleicher Messart und Einheit sinnvoll vergleichen. Einzelne Messwerte werden durch die Praxis zusammen mit dem Verlauf eingeordnet. Die App zeigt eigene Untersuchungswerte getrennt von allgemeinen Größenorientierungen.', ['size']),
  ], related: ['mutterpass'] },
];

export function searchKnowledge(query = '', category = '') {
  const tokens = searchKey(query).trim().split(/\s+/).filter(Boolean);
  return KNOWLEDGE_ARTICLES.filter(article => {
    const text = searchKey([article.title, article.summary, ...article.aliases, ...article.sections.flatMap(part => [part.title, part.text])].join(' '));
    return (!category || article.category === category) && tokens.every(token => text.includes(token));
  });
}

// Editorial reading prompts. These ranges are not examination deadlines or individual advice.
export function knowledgeHints(gestationalDays, provider = '') {
  if (!Number.isInteger(gestationalDays) || gestationalDays < 0 || gestationalDays >= 294) return [];
  if (provider && !['gyn', 'midwife'].includes(provider)) return [];
  const ids = gestationalDays < 56 ? ['cmv', 'mutterpass']
    : gestationalDays <= 97 ? ['nipt', 'ets']
    : gestationalDays <= 167 ? ['pnd', 'masse']
    : gestationalDays <= 195 ? ['diabetes', 'mutterpass'] : ['mutterpass', 'masse'];
  return ids.map(id => KNOWLEDGE_ARTICLES.find(article => article.id === id));
}

export const MILESTONE_ARTICLES = {
  'first-care': 'cmv', nipt: 'nipt', 'first-trimester': 'ets',
  'chorionic-villus': 'invasiv', amniocentesis: 'invasiv',
  'scan-1': 'masse', 'scan-2': 'masse', 'scan-3': 'masse', 'detailed-ultrasound': 'pnd', 'anti-d': 'mutterpass', 'fetal-rhesus': 'mutterpass', diabetes: 'diabetes',
};
