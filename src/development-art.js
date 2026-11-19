// User-supplied weekly watercolor series; provenance: docs/assets/development-series.json.
// Week numbers follow the archive names, not clinically verified anatomy.
export const DEVELOPMENT_ILLUSTRATIONS = Array.from({length:42},(_,index)=>{
  const week=index+1;
  return {from:week,to:week,id:`woche_${String(week).padStart(2,'0')}`,framing:week<=8?'early':week<=24?'growing':week<=32?'maturing':'late',label:`Aquarellillustration zur ${week}. SSW`};
});
export function illustrationForWeek(week) {
  if(!Number.isInteger(week)||week<1||week>42)throw new RangeError('Die Illustration unterstützt die 1. bis 42. SSW.');
  const frame=DEVELOPMENT_ILLUSTRATIONS[week-1];
  return {...frame,src:`./images/development/${frame.id}.png`,week};
}
export function developmentImage(week) {
  const frame=illustrationForWeek(week);
  return `<div class="development-image development-image--weekly" data-illustration="${frame.id}" data-week="${week}"><div class="development-drift"><div class="development-mask" data-framing="${frame.framing}"><img src="${frame.src}" width="1200" height="1320" alt="${frame.label}; illustrative Darstellung, nicht maßstabsgetreu" decoding="async"></div></div></div>`;
}
