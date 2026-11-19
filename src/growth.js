// NHS 'week 8' means 8 completed weeks (German 9. SSW), not German 8. SSW.
export const GROWTH_REVIEWED = '2026-11-18';
export const growthSource = week => `https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/${week < 13 ? '1st' : week < 28 ? '2nd' : '3rd'}-trimester/week-${week}/`;
export const GROWTH_ANCHORS = [
  [6,0.6,'Erbse'],[8,1.6,'Himbeere'],[12,5.4,'Pflaume'],[16,11.6,'Avocado'],[19,15.3,'große Tomate'],
  [20,25.6,'Banane'],[24,30,'Maiskolben'],[28,37.6,'Aubergine'],[32,42.4,'Staudensellerie'],[36,47.4,'Römersalat'],[40,51.2,'Kürbis'],
].map(([week,cm,comparison]) => ({ day:week*7,cm,comparison,kind:week < 20 ? 'crl' : 'length',source:growthSource(week) }));
export function growthAt(days) {
  if (!Number.isFinite(days) || days < 42 || days > 280) return null;
  const left = GROWTH_ANCHORS.findLast(x => x.day <= days);
  const right = GROWTH_ANCHORS.find(x => x.day > days && x.kind === left.kind);
  // Do not interpolate across the crown-rump / crown-heel measurement change.
  const crossing = days < 140 && days >= 133;
  const ratio = right && !crossing ? (days-left.day)/(right.day-left.day) : 0;
  return { cm: Math.round((left.cm + (right ? (right.cm-left.cm)*ratio : 0))*10)/10, kind:left.kind, comparison:left.comparison, interpolated:ratio > 0, sources:[left.source,...(ratio > 0 ? [right.source] : [])], referenceDay:left.day, held:crossing && days !== 133 };
}
export function measurementContext(record, gestationalDays) {
  const reference = growthAt(gestationalDays);
  if (!reference || record.kind !== reference.kind) return { reference:null,cm:null };
  return { reference,cm:record.kind === 'crl' ? record.value/10 : record.value };
}
// Art is separate from medical length anchors and never changes the dating.
export { developmentImage, illustrationForWeek } from './development-art.js';
