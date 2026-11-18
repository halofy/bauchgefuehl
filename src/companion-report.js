import { normalizeCompanion, PLAN_AREAS, GROWTH_KINDS } from './companion.js';
import { escapeHtml as e, reportDocument, projectReport } from './report.js';
import { formatDate, todayISO } from './dates.js';
export function projectCompanion(value, selected = []) {
  const data=normalizeCompanion(value),ids=new Set(selected);
  return {
    plans:data.plans.filter(x=>!x.deletedAt&&ids.has(x.id)).map(x=>({area:x.area,text:x.text,person:x.person,done:x.done})),
    growth:data.growth.filter(x=>!x.deletedAt&&ids.has(x.id)).map(x=>({date:x.date,kind:x.kind,value:x.value,note:x.note})),
  };
}
export function companionBody(report) {
  const number=value=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(value);
  return `<h1>Meine ausgewählte Planung und Untersuchungswerte</h1><p>Quelle: eigene Angaben. Bewusst ausgewählter Auszug, ohne Bewertung.</p>${report.plans.map(x=>`<article><h2>${e(PLAN_AREAS[x.area])}</h2><p class="report-text">${e(x.text)}</p><p>${x.done?'Erledigt':'Offen'}${x.person?' · Unterstützung: '+e(x.person):''}</p></article>`).join('')}${report.growth.map(x=>`<article><h2>${e(formatDate(x.date))}</h2><p>${e(GROWTH_KINDS[x.kind].label)}: ${number(x.value)} ${GROWTH_KINDS[x.kind].unit}</p><p class="report-text">${e(x.note)}</p></article>`).join('')}`;
}
export function companionDocument(report,today=todayISO()) {
  const empty=reportDocument(projectReport([],{from:today,to:today}));
  // Callback replacement preserves user-authored $&, $' and $` literally.
  return empty.replace(/<body>[\s\S]*<\/body>/,()=>`<body>${companionBody(report)}</body>`);
}
