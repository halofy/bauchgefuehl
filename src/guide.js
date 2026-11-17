import { GUIDE_ITEMS, GUIDE_SOURCES, GUIDE_REVIEWED } from './guide-data.js';
export { GUIDE_ITEMS, GUIDE_SOURCES, GUIDE_REVIEWED };
export const GUIDE_LEVELS = {
  ok: { label: 'OK unter Bedingungen', symbol: '✓' },
  caution: { label: 'Anpassen / abklären', symbol: '!' },
  avoid: { label: 'Vermeiden', symbol: '×' },
};
export const searchKey = value => String(value).toLocaleLowerCase('de').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss').normalize('NFD').replace(/\p{M}/gu, '');
export function guideAdvice(item, variantId = '') {
  if (!item.variants) return { level: item.level, text: item.text };
  const choice = item.variants.find(variant => variant.id === variantId);
  return choice ? { level: choice.level, text: choice.text } : { level: 'caution', text: 'Zubereitung oder Sorte auswählen. Ohne diese Angabe gibt es keine pauschale Freigabe.' };
}
export function searchGuide({ query = '', category = '', level = '', variants = {} } = {}) {
  const tokens = searchKey(query).trim().split(/\s+/).filter(Boolean);
  return GUIDE_ITEMS.filter(item => {
    const text = searchKey([item.title, ...item.aliases, item.text || '', ...(item.variants || []).flatMap(choice => [choice.label, choice.text])].join(' '));
    return (!category || item.category === category) && tokens.every(token => text.includes(token)) && (!level || guideAdvice(item, variants[item.id]).level === level);
  });
}
export function guidePhaseNote(item, gestationalDays) {
  if (!item.phase) return 'Gilt während der Schwangerschaft; Bedingungen im Text beachten.';
  if (!Number.isInteger(gestationalDays) || gestationalDays < 0 || gestationalDays >= 294) return 'Keine passende SSW für diesen Tag. Den vollständigen Phasenhinweis im Text beachten.';
  if (item.phase === 'early') return gestationalDays < 98 ? 'Frühe Phase: Den Hinweis zu den ersten drei Monaten besonders beachten.' : 'Auch später zählen Kreislauf und Gegenanzeigen; keine automatische Freigabe.';
  return 'Phasenabhängig: Der Text unterscheidet Schwangerschaftsdrittel. Kalender und SSW allein ersetzen keine individuelle Einordnung.';
}
