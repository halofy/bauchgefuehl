import { getWeekContent } from './content.js';

export const MOTHER_REVIEWED = '2026-11-18';
export const MOTHER_BODY_REVIEWED = '2026-11-17';
export const MOTHER_SOURCES = {
  sleep: { title: 'BIÖG: Entspannung und Schlaf', url: 'https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/entspannung-und-schlaf/' },
  everyday: { title: 'IQWiG: Schwangerschaft – Verlauf und Alltag', url: 'https://www.gesundheitsinformation.de/schwangerschaft.html' },
  nutrition: { title: 'Netzwerk Gesund ins Leben: Essen und Trinken', url: 'https://www.gesund-ins-leben.de/fuer-familien/fit-durch-die-schwangerschaft/essen-und-trinken-in-der-schwangerschaft/' },
  movement: { title: 'Netzwerk Gesund ins Leben: Bewegung', url: 'https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/bewegung/bewegungsausmass-und-art-vor-und-in-der-schwangerschaft/' },
  advice: { title: 'BIÖG: Themen der Schwangerschaftsberatung', url: 'https://www.familienplanung.de/beratung/beratungsthemen/' },
  help: { title: 'Familienportal des Bundes: Frühe Hilfen', url: 'https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/fruehe-hilfen' },
  ndr: { title: 'NDR: Ernährung – ergänzend, Artikelstand 10.09.2024', url: 'https://www.ndr.de/ratgeber/gesundheit/Ernaehrung-in-der-Schwangerschaft-Was-ist-erlaubt-was-eher-nicht,ernaehrung676.html' },
};
// Editorial phase titles and reflection prompts, not medical milestones or tasks.
const PHASES = [
  [1, 4, 'Raum für deinen Anfang', 'Welche Frage möchtest du für ein erstes Gespräch festhalten?'],
  [5, 8, 'Ankommen in einer neuen Zeit', 'Was würde deinen heutigen Tag etwas leichter machen?'],
  [9, 12, 'Dein eigenes Tempo finden', 'Was möchtest du gerade für dich behalten oder mit jemandem teilen?'],
  [13, 16, 'Platz für deine Bedürfnisse', 'Welche Pause oder kleine Bewegung tut dir im Alltag gut?'],
  [17, 20, 'Veränderungen wahrnehmen', 'Was möchtest du bei deiner nächsten Vorsorge ansprechen?'],
  [21, 24, 'Mit dir in Verbindung bleiben', 'Welche Unterstützung könntest du diese Woche konkret annehmen?'],
  [25, 28, 'Erholung mitdenken', 'Wie möchtest du dir heute Ruhe ermöglichen?'],
  [29, 32, 'Entlastung organisieren', 'Welche Aufgabe könnte dir jemand abnehmen?'],
  [33, 36, 'Für dich und danach planen', 'Wer kann dich nach der Geburt praktisch unterstützen?'],
  [37, 40, 'Gut begleitet Richtung Geburt', 'Welche Absprache mit deinem Geburtsteam gibt dir Sicherheit?'],
  [41, 42, 'Auch im Warten gut begleitet', 'Was möchtest du beim nächsten Kontakt mit deinem Geburtsteam klären?'],
];
const TOPICS = {
  food: { title: 'Alltag & Essen', text: 'Abwechslungsreich und ausgewogen essen ist wichtiger als doppelte Portionen. Bei Fragen zu deiner Ernährung kannst du die Vorsorge oder eine qualifizierte Ernährungsberatung nutzen. Einzelne Lebensmittel und ihre Zubereitung findest du in der Offline-Suche.', sources: ['nutrition', 'ndr'] },
  move: { title: 'Alltag & Bewegung', text: 'Regelmäßige Bewegung gehört auch in der Schwangerschaft zum Alltag. Wenn du bisher wenig aktiv warst, langsam beginnen. Welche Bewegung zu dir passt, hängt auch von deinem Befinden ab; bei medizinischen Gegenanzeigen ärztlich beraten lassen.', sources: ['movement'] },
  relief: { title: 'Alltag & Entlastung', text: 'Mit wachsendem Bauch können tägliche Aufgaben mühsamer werden. Plane mit vertrauten Menschen, wer Aufgaben übernehmen kann. Fragen zu Geburtsort und Begleitung lassen sich mit dem Betreuungsteam besprechen.', sources: ['everyday'] },
  sleepEarly: { title: 'Schlaf & Ruhe', text: 'Schlaf und Erholung können sich verändern. Ein regelmäßiger Tagesrhythmus, eine ruhige Abendroutine und Pausen am Tag können helfen. Anhaltende Ein- oder Durchschlafprobleme in der Praxis ansprechen.', sources: ['sleep'] },
  sleepLate: { title: 'Schlaf & Ruhe', text: 'Wenn du nachts häufiger aufwachst, plane auch tagsüber Erholung ein. Eine entspannende Abendroutine kann helfen. Anhaltende Schlafprobleme, ausgeprägtes Schnarchen oder Atemstörungen im Schlaf ärztlich abklären lassen.', sources: ['sleep'] },
  feelingsEarly: { title: 'Gefühle & Veränderungen', text: 'Gerade am Anfang können Gefühle stärker wechseln. Freude, Unsicherheit oder Zweifel können nebeneinander stehen. Wenn dich Sorgen beschäftigen, kannst du sie bei der Vorsorge oder in einer Schwangerschaftsberatung ansprechen.', sources: ['everyday', 'advice'] },
  feelingsMiddle: { title: 'Gefühle & Veränderungen', text: 'Wie du die Schwangerschaft erlebst, ist persönlich. Auch in einer oft als angenehmer beschriebenen Phase musst du dich nicht ständig gut fühlen. Fragen und Unsicherheiten haben in der Begleitung Platz.', sources: ['everyday', 'advice'] },
  feelingsLate: { title: 'Gefühle & Veränderungen', text: 'Vorfreude auf die Geburt und Respekt davor können zusammenkommen. Besprich, was dir wichtig ist und was dich beunruhigt. Schwangerschaftsberatung kann auch bei belastenden Fragen und Entscheidungen unterstützen.', sources: ['everyday', 'advice'] },
  supportEarly: { title: 'Unterstützung finden', text: 'Schwangerschaftsberatung hilft bei Fragen zur Schwangerschaft, Hebammensuche und persönlichen Sorgen. Die Beratung ist kostenfrei und auf Wunsch anonym. Ein Gespräch ist auch möglich, wenn du noch nicht weißt, was du brauchst.', sources: ['advice'] },
  supportMiddle: { title: 'Unterstützung finden', text: 'Auch finanzielle Fragen, Partnerschaft und die Vorbereitung auf das Leben mit Kind können Thema einer Schwangerschaftsberatung sein. Die Beratung informiert über passende Hilfen und unterstützt bei Fragen zu Anträgen.', sources: ['advice'] },
  supportLate: { title: 'Unterstützung für die erste Zeit', text: 'Frühe Hilfen bieten bereits ab der Schwangerschaft freiwillige, kostenfreie Unterstützung. Je nach Wohnort gibt es etwa Familienhebammen, offene Sprechstunden oder Elterntreffs. Nach Angeboten kannst du in deiner Praxis oder einer Beratungsstelle fragen.', sources: ['help'] },
};

export function getMotherContent(week) {
  if (!Number.isInteger(week) || week < 1 || week > 42) throw new RangeError('Wocheninfos sind für die 1. bis 42. SSW verfügbar.');
  const phase = PHASES.find(([start, end]) => week >= start && week <= end);
  const content = getWeekContent(week);
  const stage = week <= 12 ? 'Early' : week <= 28 ? 'Middle' : 'Late';
  const keys = [week <= 12 ? 'food' : week <= 28 ? 'move' : 'relief', week <= 24 ? 'sleepEarly' : 'sleepLate', `feelings${stage}`, `support${stage}`];
  return {
    week, title: phase[2], prompt: phase[3], phaseStart: phase[0], phaseEnd: phase[1],
    phaseLabel: `${phase[0]}.–${phase[1]}. SSW · ${phase[0] - 1}+0 bis ${phase[1] - 1}+6`,
    body: content.body, tip: content.tip, bodySource: content.source,
    bodyReviewed: MOTHER_BODY_REVIEWED, reviewed: MOTHER_REVIEWED,
    topics: keys.map((key, index) => ({ id: ['everyday', 'sleep', 'feelings', 'support'][index], ...TOPICS[key], sources: TOPICS[key].sources.map(id => ({ ...MOTHER_SOURCES[id] })) })),
  };
}
