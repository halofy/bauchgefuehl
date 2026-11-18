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
export function developmentSvg(days) {
  const stage = days < 28 ? 'cells' : days < 70 ? 'embryo' : days < 140 ? 'early' : 'late';
  const scale = Math.min(1.08, Math.max(.3,.3+days/300*.78));
  const body = stage === 'cells' ? '<g fill="#e7bda2" stroke="#b67e67" stroke-width="2"><circle cx="130" cy="123" r="20"/><circle cx="161" cy="126" r="22"/><circle cx="141" cy="155" r="22"/><circle cx="171" cy="156" r="19"/></g>' : stage === 'embryo' ? '<path d="M181 80c-31-21-76-3-82 31-6 32 6 66 39 79 25 11 47 0 51-17-20 5-38-7-39-22 38 1 56-49 31-71Z" fill="#ebc2a8" stroke="#b67e67" stroke-width="3"/><path d="m124 139 15 8m-3 20 12 8" stroke="#b67e67" stroke-width="5" stroke-linecap="round"/>' : '<path d="M204 77c-28-20-61-8-71 16-11 25-2 44 16 54-29-4-53 9-57 36-3 28 17 51 43 54 38 4 66-16 75-45 9-28 33-46 32-72-1-17-17-34-38-43Z" fill="#ebc2a8" stroke="#b67e67" stroke-width="2"/><path d="M151 148c12 9 21 8 29 18 8 12 0 26-11 19l-17-14m14 16-19 12c-13 9-9 20 5 15l28-12m20-76c-7 0-13-4-14-10m6 26c-7 4-13 0-17-3" fill="none" stroke="#ac745e" stroke-width="4" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 320 300" role="img" aria-label="Schematische ${stage === 'cells' ? 'frühe Zellteilung' : stage === 'embryo' ? 'Embryoform' : 'Fötusform'}, keine medizinische Abbildung"><circle cx="160" cy="150" r="127" fill="#b9cdb1" opacity=".15"/><circle cx="160" cy="150" r="119" fill="none" stroke="#b9cdb1" stroke-dasharray="2 8"/><g transform="translate(160 150) scale(${scale}) translate(-160 -150)">${body}</g><path d="M117 225c-25 18-48 2-40-15" stroke="#caa48b" fill="none" stroke-width="3"/></svg>`;
}
