import { projectCompanion, companionBody, companionDocument } from './companion-report.js';
import { getMotherContent } from './mother.js';
import { COMPANION_KEY, readCompanion, writeCompanion, normalizeCompanion, changeCompanion, PLAN_AREAS, GROWTH_KINDS } from './companion.js';
import { todayISO, formatDate, addDays, dayNumber } from './dates.js';
import { todayFocus } from './trends.js';
import { growthAt, developmentSvg, measurementContext, GROWTH_REVIEWED } from './growth.js';
import { symptomHelp, helpForSymptom, SYMPTOM_REVIEWED } from './symptoms.js';
import { escapeHtml as e, projectReport, reportBody, reportDocument } from './report.js';
const number = value => new Intl.NumberFormat('de-DE',{ maximumFractionDigits:1 }).format(value);
const source = (url,label) => `<a class="source-link" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>`;
const button = (label,attrs='') => `<button type="button" class="button button-outline" ${attrs}>${label}</button>`;
const dialog = (id,title,body) => `<dialog id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-title"><div class="dialog-heading"><h2 id="${id}-title">${title}</h2><button type="button" class="icon-button" data-companion-close="${id}" aria-label="Schließen">×</button></div>${body}</dialog>`;
export function setupCompanion({ storage, getMode, getJournal, getCare, getAge, canEdit, onChange, onRefresh = () => {}, openPanel, openNote, editNote, openBirth, openJournal }) {
  const $ = id => document.getElementById(id);
  let growthContext = null;
  let data, problem = '', busy = false, dirty = false, lastWeek = 1, lastDays = 0;
  let editingPlan=null, editingGrowth=null;
  let sessionAppointment = null, selectedNotes = new Set(), selectedEntries = new Set();
  function read() { try { data = readCompanion(storage); problem = ''; } catch (cause) { data = null; problem = cause.message; } }
  read();
  $('mode-banner').insertAdjacentHTML('afterend',`<section id="today-focus" class="card today-focus" aria-labelledby="today-focus-title"><p class="eyebrow">DEIN TAG AUF EINEN BLICK</p><h2 id="today-focus-title">Heute für mich.</h2><div id="today-focus-content"></div></section><section id="postpartum-summary" class="card" hidden><p class="eyebrow">DEIN NEUER ABSCHNITT</p><h2>Nach der Geburt. Für dich.</h2><p id="postpartum-age"></p><p>Dein Journal, deine Fragen und Kontakte begleiten dich weiter. Die Schwangerschaft bleibt als Rückblick erhalten.</p></section>`);
  $('personal-care-panel').insertAdjacentHTML('beforebegin',`<section id="personal-plan" class="card companion-panel"><p class="eyebrow">WÜNSCHE &amp; UNTERSTÜTZUNG</p><h2>Geburt und Wochenbett planen.</h2><p>Was ist dir wichtig? Wer kann dich konkret entlasten?</p><div class="care-toolbar">${button('Wunsch / Aufgabe ergänzen','id="plan-add"')}${button('Ausgewählt drucken / teilen','id="plan-export"')}</div><div id="plan-summary"></div><details class="more-panel"><summary>Planung nach Bereichen ansehen</summary><div id="plan-list"></div></details><details class="more-panel"><summary>Geburt eintragen / Phase ändern</summary><form id="phase-form"><label>Geburtsdatum (freiwillig)<input id="phase-date" type="date"></label><p class="field-hint">Der Wechsel erfolgt nur durch dich. Es werden keine bisherigen Angaben gelöscht oder neu datiert. Ein leeres Datum führt zur Schwangerschaftsansicht zurück.</p><button class="button button-primary" type="submit">Phase bewusst speichern</button></form></details><p id="companion-error" class="form-error" role="alert" hidden></p><details class="more-panel"><summary>Hintergrund &amp; Quellen · geprüft am 18.11.2026</summary><p>Eigene Wünsche können das Gespräch mit dem Geburtsteam vorbereiten. Für die erste Zeit nach der Geburt kannst du praktische Hilfe festhalten. Die Vorschläge sind freiwillige Planungshilfen.</p>${source('https://www.familienplanung.de/schwangerschaft/geburt/geburtsvorbereitung/wie-kann-ich-mich-auf-die-geburt-vorbereiten/','BIÖG: Geburtsvorbereitung')}${source('https://www.gesundheitsinformation.de/nach-der-geburt-wochenbett.html','IQWiG: Wochenbett')}</details></section>`);
  $('journey-baby-panel').insertAdjacentHTML('beforeend',`<section id="growth-panel" class="growth-panel"><h3>Wachsen, Schritt für Schritt.</h3><label>Tag innerhalb dieser SSW<input id="growth-day" type="range" min="0" max="6" value="0" step="1"></label><p id="growth-day-label"></p><div id="growth-art" class="growth-art"></div><div id="growth-reference"></div><div id="growth-personal"></div><div class="care-toolbar">${button('Untersuchungsmaß erfassen','id="growth-add"')}</div><details class="more-panel"><summary>Deine Untersuchungswerte</summary><div id="growth-list"></div></details><p class="content-note">Schematische Darstellung, nicht maßstabsgetreu. Allgemeine Orientierungswerte sind keine persönliche Wachstumsprognose. Untersuchungswerte werden daneben eingeordnet, nicht fortgeschrieben und ändern die SSW nicht. Redaktionell geprüft: ${GROWTH_REVIEWED}.</p></section>`);
  $('wissen').insertAdjacentHTML('afterbegin',`<section id="symptom-help" class="card companion-panel"><p class="eyebrow">DEINE BESCHWERDEN NACHSCHLAGEN</p><h2>Was kann mir helfen?</h2><p>Allgemeine Orientierung für die Schwangerschaft. Bei akuter Unsicherheit dein Behandlungsteam kontaktieren.</p><label>Beschwerde auswählen<select id="symptom-help-select">${symptomHelp.map(x=>`<option value="${e(x.key)}">${e(x.title)}</option>`).join('')}</select></label><div id="symptom-help-content"></div></section>`);
  document.body.insertAdjacentHTML('beforeend',
    dialog('plan-dialog','Deine Planung.',`<form id="plan-form"><fieldset id="plan-fields" class="care-form-fields"><label>Bereich<select id="plan-area">${Object.entries(PLAN_AREAS).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><label>Wunsch oder Aufgabe<textarea id="plan-text" rows="4" maxlength="3000" required></textarea></label><label>Wer unterstützt dich? (freiwillig)<input id="plan-person" maxlength="120"></label><p id="plan-error" class="form-error" role="alert" hidden></p><button class="button button-primary full-width">Lokal speichern</button></fieldset></form>`)+
    dialog('growth-dialog','Wert aus deiner Untersuchung.',`<form id="growth-form"><fieldset id="growth-fields" class="care-form-fields"><label>Untersuchungsdatum<input id="growth-date" type="date" required></label><label>Messgröße<select id="growth-kind">${Object.entries(GROWTH_KINDS).map(([key,x])=>`<option value="${key}">${e(x.label)} (${x.unit})</option>`).join('')}</select></label><label id="growth-value-label">Wert<input id="growth-value" type="text" inputmode="decimal" required></label><p id="growth-unit" class="field-hint"></p><label>Notiz / Herkunft (freiwillig)<textarea id="growth-note" rows="3" maxlength="1000" placeholder="z. B. aus dem Untersuchungsbericht"></textarea></label><p class="field-hint">Bitte die Messart aus dem Bericht übernehmen. Geschätztes Gewicht und Körperlänge sind keine direkten Längenmessungen. Die Eingabegrenzen dienen nur der Tippfehlerkontrolle.</p><p id="growth-error" class="form-error" role="alert" hidden></p><button class="button button-primary full-width">Untersuchungswert speichern</button></fieldset></form>`)+
    dialog('conversation-dialog','Deine Terminmappe.',`<p id="conversation-context"></p><div class="care-toolbar">${button('Frage / Antwort ergänzen','id="conversation-note"')}${button('Hilfe &amp; Kontakte','id="conversation-contacts"')}</div><p class="field-hint">Wähle bewusst, was du im Gespräch anzeigen oder als Datei mitnehmen möchtest. Zunächst ist nichts ausgewählt. Antworten bearbeitest du am Originaleintrag.</p><details open class="more-panel"><summary>Fragen und Notizen auswählen</summary><div id="conversation-notes"></div></details><details class="more-panel"><summary>Beobachtungen der letzten 28 Tage auswählen</summary><div id="conversation-entries"></div></details><label class="checkbox-label"><input id="conversation-metadata" type="checkbox">Termindaten einschließlich Ort und Uhrzeit einbeziehen</label><div id="conversation-preview" class="report-preview"></div>${button('Ausgewählte Terminmappe als Druckdatei','id="conversation-export"')}`)+
    dialog('plan-share-dialog','Deine Auswahl zum Mitnehmen.',`<p>Wähle einzelne Wünsche, Aufgaben oder Untersuchungswerte. Nur die Vorschau wird in der Datei gespeichert. Kein Upload. Quelle: deine eigenen Angaben.</p><div id="plan-share-options"></div><div id="plan-share-preview" class="report-preview"></div>${button('Auswahl als Druckdatei herunterladen','id="plan-share-download"')}`));
  const allDialogs = ['plan-dialog','growth-dialog','conversation-dialog','plan-share-dialog'];
  function close(id) { if (busy || (dirty && ['plan-dialog','growth-dialog'].includes(id) && !confirm('Ungespeicherten Entwurf verwerfen?'))) return; dirty = false; $(id).close(); }
  for (const id of allDialogs) { $(id).querySelector('[data-companion-close]').addEventListener('click',()=>close(id)); $(id).addEventListener('cancel',event=>{ event.preventDefault(); close(id); }); }
  for (const id of ['plan-form','growth-form']) $(id).addEventListener('input',()=>{dirty=true;});
  async function save(change, modal = null) {
    if (busy || !data || !canEdit() || getMode() === 'shared') return;
    busy = true; $('plan-fields').disabled=true;$('growth-fields').disabled=true;showError('');
    try {
      await navigator.locks.request('bauchgefuehl-local-write',()=>{
        if (!canEdit()) throw new Error('Bitte am aktiven Master speichern.');
        const fresh=readCompanion(storage); if (JSON.stringify(fresh)!==JSON.stringify(data)) { data=fresh; throw new Error('In einem anderen Tab geändert. Entwurf bitte sichern und erneut öffnen.'); }
        data=writeCompanion(storage,change(fresh));
      });
      dirty=false; if(modal) $(modal).close(); render(); onChange();
    } catch(cause) { if(modal) { const el=$(modal==='plan-dialog'?'plan-error':'growth-error'); el.textContent=cause.message;el.hidden=false; } else showError(cause.message); }
    finally { busy=false;$('plan-fields').disabled=!canEdit();$('growth-fields').disabled=!canEdit(); }
  }
  function showError(message) { $('companion-error').textContent=message; $('companion-error').hidden=!message; }
  $('plan-add').addEventListener('click',()=>{ if(!canEdit()||!data)return; editingPlan=null; $('plan-form').reset(); $('plan-error').hidden=true; dirty=false; $('plan-dialog').showModal();requestAnimationFrame(()=>$('plan-text').focus()); });
  $('plan-form').addEventListener('submit',event=>{event.preventDefault();void save(value=>changeCompanion(value,'plans',{area:$('plan-area').value,text:$('plan-text').value,person:$('plan-person').value,done:editingPlan?.done||false},editingPlan),'plan-dialog');});
  $('phase-form').addEventListener('submit',event=>{event.preventDefault(); if(confirm('Diese Phase bewusst speichern? Deine bisherigen Daten bleiben erhalten.')) void save(value=>changeCompanion(value,'phase',{birthDate:$('phase-date').value||null}));});
  $('growth-add').addEventListener('click',()=>{ if(!canEdit()||!data)return; editingGrowth=null; $('growth-form').reset();$('growth-date').value=todayISO();$('growth-date').max=todayISO();$('growth-error').hidden=true;dirty=false;unit();$('growth-dialog').showModal();requestAnimationFrame(()=>$('growth-value').focus());});
  function unit(){ $('growth-unit').textContent=`Einheit: ${GROWTH_KINDS[$('growth-kind').value].unit} · exakt wie im Bericht übernehmen.`; }
  $('growth-kind').addEventListener('change',unit);
  $('growth-form').addEventListener('submit',event=>{event.preventDefault();void save(value=>changeCompanion(value,'growth',{date:$('growth-date').value,kind:$('growth-kind').value,value:Number($('growth-value').value.trim().replace(',','.')),note:$('growth-note').value},editingGrowth),'growth-dialog');});
  function own() { return getMode() !== 'shared'; }
  function render() {
    const visible=own()&&data; showError(problem);
    $('plan-fields').disabled=busy||!canEdit();$('growth-fields').disabled=busy||!canEdit();
    $('personal-plan').hidden=!own(); $('growth-add').disabled=!visible||!canEdit(); $('plan-add').disabled=!visible||!canEdit();
    $('phase-date').max=todayISO(); if(!$('phase-form').contains(document.activeElement)) $('phase-date').value=visible?.birthDate||'';
    $('phase-form').querySelector('button').disabled=!visible||!canEdit();
    const postpartum=!!visible?.birthDate;
    document.body.classList.toggle('postpartum-mode',postpartum);
    $('postpartum-summary').hidden=!postpartum;
    if(postpartum) $('postpartum-age').textContent=`Geburt am ${formatDate(data.birthDate)} · ${dayNumber(todayISO())-dayNumber(data.birthDate)} Tage seit der Geburt. Deine Beobachtungen bleiben freiwillig.`;
    $('plan-list').replaceChildren();
    if(visible) for(const [area,label] of Object.entries(PLAN_AREAS)) {
      const section=document.createElement('section'); const h=document.createElement('h3');h.textContent=label;section.append(h);
      const items=data.plans.filter(x=>x.area===area&&!x.deletedAt);
      if(!items.length){const p=document.createElement('p');p.className='content-note';p.textContent='Noch keine eigenen Einträge.';section.append(p);}
      for(const item of items){const row=document.createElement('article');row.className='plan-item';const check=document.createElement('input');check.type='checkbox';check.checked=item.done;check.disabled=!canEdit();check.setAttribute('aria-label',`Erledigt: ${item.text}`);check.addEventListener('change',()=>void save(value=>changeCompanion(value,'plans',{...item,done:check.checked},item))); const p=document.createElement('p');p.textContent=item.text+(item.person?` · Unterstützung: ${item.person}`:'');row.append(check,p); const edit=document.createElement('button');edit.className='text-link';edit.textContent='Ändern';edit.disabled=!canEdit();edit.addEventListener('click',()=>{editingPlan=item;$('plan-area').value=item.area;$('plan-text').value=item.text;$('plan-person').value=item.person;$('plan-error').hidden=true;dirty=false;$('plan-dialog').showModal();requestAnimationFrame(()=>$('plan-text').focus());}); const archive=document.createElement('button');archive.className='text-link';archive.textContent='Archivieren';archive.disabled=!canEdit();archive.addEventListener('click',()=>void save(value=>changeCompanion(value,'plans',{...item,deletedAt:new Date().toISOString()},item)));row.append(edit,archive);section.append(row);}
      $('plan-list').append(section);
    }
    if(visible){const archived=data.plans.filter(x=>x.deletedAt);if(archived.length){const details=document.createElement('details');details.className='more-panel';const summary=document.createElement('summary');summary.textContent=`Archivierte Planung (${archived.length})`;details.append(summary);for(const item of archived){const p=document.createElement('p');p.textContent=item.text;const restore=document.createElement('button');restore.type='button';restore.className='text-link';restore.textContent='Wiederherstellen';restore.disabled=!canEdit();restore.addEventListener('click',()=>void save(value=>changeCompanion(value,'plans',{...item,deletedAt:null},item)));details.append(p,restore);}$('plan-list').append(details);}}
    const unfinished=visible?data.plans.filter(x=>!x.deletedAt&&!x.done).length:0;
    $('plan-summary').textContent=visible?`${unfinished} offene Wünsche / Aufgaben. Du entscheidest, was für dich passt.`:'Persönliche Planung konnte nicht gelesen werden.';
    renderFocus(); renderGrowth(lastWeek,lastDays); renderHelp(); if($('plan-share-dialog').open)previewPlan();
  }
  function renderFocus(){
    const care=own()?getCare():null;
    const box=$('today-focus-content');box.replaceChildren();
    if(!care){box.textContent='Eigene Termine und Fragen erscheinen hier auf deinem Gerät.';return;}
    const now=new Date(),focus=todayFocus(care,todayISO(),`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
    const p=document.createElement('p');p.textContent=focus.appointment?`Nächster Termin: ${formatDate(focus.appointment.date)}${focus.appointment.time?' · '+focus.appointment.time+' Uhr':''} · ${focus.appointment.title}`:'Noch kein nächster Termin geplant.';box.append(p);
    const info=document.createElement('p');info.textContent=`${focus.questions.length} offene Fragen · ${data?data.plans.filter(x=>!x.done&&!x.deletedAt).length+' offene Wünsche / Aufgaben':'Planung nicht lesbar'}`;box.append(info);
    if(!data?.birthDate){try {const age=getAge(todayISO()),content=getMotherContent(Math.max(1,Math.min(42,Math.floor(age/7)+1)));const p=document.createElement('p');p.className='focus-step';p.textContent=`Wochenimpuls: ${content.tip}`;p.dataset.focusImpulse='';box.append(p);const link=document.createElement('button');link.type='button';link.className='text-link';link.textContent='Wocheninfos mit Quellen';link.dataset.focusImpulse='';link.addEventListener('click',()=>openPanel('wochenreise','journey-week-context'));box.append(link);}catch{/* No inferred impulse without an available pregnancy basis. */}}
    const more=document.createElement('details');more.className='more-panel';const summary=document.createElement('summary');summary.textContent='Wochenimpuls & notierte nächste Schritte';more.append(summary);
    for(const step of focus.steps){const item=document.createElement('p');item.className='focus-step';item.textContent=`Notiert am ${formatDate(step.date)}: ${step.nextSteps}`;more.append(item);}
    for(const impulse of [...box.querySelectorAll('[data-focus-impulse]')])more.append(impulse);if(more.children.length>1)box.append(more);
    const actions=document.createElement('div');actions.className='care-toolbar';
    const map=document.createElement('button');map.type='button';map.className='button button-primary';map.textContent=focus.appointment?'Terminmappe öffnen':'Fragen ansehen';map.addEventListener('click',()=>focus.appointment?openConversation(focus.appointment.id):openPanel('vorsorge','personal-care-panel'));actions.append(map);
    const plan=document.createElement('button');plan.type='button';plan.className='text-link';plan.textContent='Meine Planung';plan.addEventListener('click',()=>openPanel('vorsorge','personal-plan'));actions.append(plan);box.append(actions);
  }
  function renderGrowth(week=lastWeek,days=lastDays){
    const context=`${week}:${days}`;
    if(growthContext!==context){$('growth-day').value=Math.floor(days/7)===week-1?Math.max(0,days%7):0;growthContext=context;}
    lastWeek=week;lastDays=days;
    const offset=Number($('growth-day').value),age=(week-1)*7+offset;
    if(own()&&data?.birthDate)$('selected-current').textContent=`Schwangerschaftsrückblick · Geburt am ${formatDate(data.birthDate)}`;
    $('growth-day-label').textContent=`${Math.floor(age/7)}+${age%7} · ${week}. SSW${age===days?' · heutiger Stand':''}`;
    $('growth-art').innerHTML=developmentSvg(age);
    const ref=growthAt(age);
    $('growth-reference').innerHTML=ref?`<p class="growth-length">≈ ${number(ref.cm)} cm</p><p>${ref.kind==='crl'?'Scheitel bis Steiß (SSL)':'Scheitel bis Ferse (Gesamtlänge)'}</p><p class="field-hint">${ref.interpolated?'Rechnerische Zwischenstufe zwischen zwei NHS-Orientierungswerten.':ref.held?'Letzter SSL-Orientierungswert bei 19+0; kein Vergleich mit Gesamtlänge.':'Allgemeiner NHS-Orientierungswert.'} Größenbild am Ausgangspunkt: ${e(ref.comparison)}. Gegenstände unterscheiden sich in ihrer Größe.</p>${ref.sources.map(url=>source(url,'NHS: Größenangabe')).join('')}`:`<p>${age<42?'Für diese frühe Phase zeigen wir keine belastbare Längenangabe.':'Nach 40+0 wird keine weitere Größe hochgerechnet.'}</p>`;
    // Replace the old four-week phase comparison with the selected day's estimate.
    $('phase-size').textContent=ref?`Ungefähr ${number(ref.cm)} cm`:'Entwicklung in deinem Tempo';
    $('phase-comparison').textContent=ref?`${ref.kind==='crl'?'SSL':'Gesamtlänge'} · Orientierung für ${Math.floor(age/7)}+${age%7}`:'Größenangaben und eigene Untersuchungswerte findest du hier.';
    const values=own()&&data?data.growth.filter(x=>!x.deletedAt).sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt)):[];
    const latest=values[0];
    $('growth-personal').replaceChildren();
    if(latest){const p=document.createElement('p');p.className='growth-observed';p.textContent=`Aus deiner Untersuchung am ${formatDate(latest.date)}: ${GROWTH_KINDS[latest.kind].label} ${number(latest.value)} ${GROWTH_KINDS[latest.kind].unit}. Dieser Wert wird nicht als heutige Größe fortgeschrieben.`;$('growth-personal').append(p);}
    $('growth-list').replaceChildren();
    for(const item of values){const article=document.createElement('article');article.className='growth-observed';const p=document.createElement('p');p.textContent=`${formatDate(item.date)} · ${GROWTH_KINDS[item.kind].label}: ${number(item.value)} ${GROWTH_KINDS[item.kind].unit}${item.note?' · '+item.note:''}`;article.append(p);
      try {const context=measurementContext(item,getAge(item.date));if(context.reference){const hint=document.createElement('p');hint.className='field-hint';hint.textContent=`Allgemeine Orientierung für diesen Untersuchungstag mit gleicher Messart: ungefähr ${number(context.reference.cm)} cm. Keine Perzentile oder Bewertung.`;article.append(hint);}}catch{/* A missing pregnancy basis does not hide measurements. */}
      const archive=document.createElement('button');archive.className='text-link';archive.textContent='Archivieren';archive.disabled=!canEdit();archive.addEventListener('click',()=>void save(value=>changeCompanion(value,'growth',{...item,deletedAt:new Date().toISOString()},item)));article.append(archive);const edit=document.createElement('button');edit.type='button';edit.className='text-link';edit.textContent='Wert korrigieren';edit.disabled=!canEdit();edit.addEventListener('click',()=>{editingGrowth=item;$('growth-kind').value=item.kind;$('growth-date').value=item.date;$('growth-date').max=todayISO();$('growth-value').value=String(item.value).replace('.',',');$('growth-note').value=item.note;$('growth-error').hidden=true;dirty=false;unit();$('growth-dialog').showModal();requestAnimationFrame(()=>$('growth-value').focus());});article.append(edit);$('growth-list').append(article);}
    if(own()&&data)for(const [type,target] of [['growth','growth-list']]){const archived=data[type].filter(x=>x.deletedAt);if(!archived.length)continue;const details=document.createElement('details');details.className='more-panel';const summary=document.createElement('summary');summary.textContent=`Archivierte ${type==='plans'?'Planung':'Untersuchungswerte'} (${archived.length})`;details.append(summary);for(const item of archived){const label=document.createElement('p');label.textContent=type==='plans'?item.text:`${formatDate(item.date)} · ${GROWTH_KINDS[item.kind].label}: ${number(item.value)} ${GROWTH_KINDS[item.kind].unit}`;const restore=document.createElement('button');restore.type='button';restore.className='text-link';restore.textContent='Wiederherstellen';restore.disabled=!canEdit();restore.addEventListener('click',()=>void save(value=>changeCompanion(value,type,{...item,deletedAt:null},item)));details.append(label,restore);}$(target).append(details);}

    if(!values.length){const empty=document.createElement('p');empty.textContent='Noch keine aktiven Untersuchungswerte.';$('growth-list').prepend(empty);}
  }
  $('growth-day').addEventListener('input',()=>renderGrowth());
  function renderHelp(){ const item=helpForSymptom($('symptom-help-select').value);if(!item)return; $('symptom-help-content').innerHTML=`<h3>${e(item.title)}</h3><p>${e(item.help)}</p><h4>Wann Kontakt aufnehmen?</h4><p>${e(item.contact)}</p><p class="content-note">Keine Diagnose oder persönliche Entwarnung. Für die Zeit nach der Geburt bitte die Nachsorge ansprechen. Geprüft am ${SYMPTOM_REVIEWED}.</p>${source(item.source,'Fachquelle zu diesem Hinweis')}<div class="care-toolbar">${button('Als Frage vormerken','id="symptom-question"')}${button('Hilfe &amp; Kontakte','id="symptom-contacts"')}</div>`; $('symptom-question').disabled=!canEdit()||!own(); $('symptom-question').addEventListener('click',()=>{openPanel('vorsorge','personal-care-panel');openNote(null,`Was kann mir bei ${item.title} helfen?`);});$('symptom-contacts').addEventListener('click',openBirth); }
  $('symptom-help-select').addEventListener('change',renderHelp);
  function openHelp(label){const help=helpForSymptom(label);if(help){$('symptom-help-select').value=help.key;renderHelp();}else{$('symptom-help-content').textContent='Für diesen Begriff ist keine geprüfte Karte vorhanden. Bitte wähle ein Thema oder besprich deine Beobachtung mit deiner Hebamme oder Praxis.';}openPanel('wissen','symptom-help');}
  function openConversation(id){
    sessionAppointment=getCare()?.appointments.find(x=>x.id===id&&!x.deletedAt)||null;
    selectedNotes=new Set();selectedEntries=new Set();$('conversation-metadata').checked=false;
    refreshConversation();$('conversation-dialog').showModal();requestAnimationFrame(()=>$('conversation-note').focus());
  }
  function selectionRow(parent,label,checked,change){const row=document.createElement('label');row.className='checkbox-label selection-row';const input=document.createElement('input');input.type='checkbox';input.checked=checked;input.addEventListener('change',()=>change(input.checked));const span=document.createElement('span');span.textContent=label;row.append(input,span);parent.append(row);}
  function conversationReport(){
    const care=getCare();if(!care)return projectReport([],{from:todayISO(),to:todayISO()});
    const selected=care.notes.filter(x=>selectedNotes.has(x.id)&&!x.deletedAt);const ids=new Set(selected.map(x=>x.appointmentId));
    const appts=$('conversation-metadata').checked?care.appointments.filter(x=>x.id===sessionAppointment?.id||ids.has(x.id)):[];
    return projectReport(getJournal().filter(x=>selectedEntries.has(x.id)),{from:'1900-01-01',to:'2200-12-31',fields:['text','symptoms','metrics','checkin','careNotes',...($('conversation-metadata').checked?['appointments']:[])],care:{v:1,notes:selected,appointments:care.appointments},excluded:care.appointments.filter(x=>!appts.includes(x)).map(x=>'care-appointment:'+x.id)});
  }
  function refreshConversation(){
    const care=getCare();if(!care)return;
    $('conversation-context').textContent=sessionAppointment?`${sessionAppointment.title} · ${formatDate(sessionAppointment.date)}${sessionAppointment.time?' · '+sessionAppointment.time+' Uhr':''}`:'Deine Gesprächsvorbereitung';
    $('conversation-notes').replaceChildren();$('conversation-entries').replaceChildren();
    const notes=care.notes.filter(x=>!x.deletedAt&&(!x.appointmentId||x.appointmentId===sessionAppointment?.id));
    for(const note of notes){selectionRow($('conversation-notes'),`${note.discussed?'Besprochen':'Offen'} · ${note.text}`,selectedNotes.has(note.id),checked=>{if(checked)selectedNotes.add(note.id);else selectedNotes.delete(note.id);previewConversation();});const edit=document.createElement('button');edit.type='button';edit.className='text-link';edit.textContent='Antwort / nächste Schritte bearbeiten';edit.disabled=!canEdit();edit.addEventListener('click',()=>{$('conversation-dialog').close();setTimeout(()=>editNote(note.id),120);});$('conversation-notes').append(edit);}
    if(!notes.length)$('conversation-notes').textContent='Noch keine zugeordneten oder freien Fragen.';
    const entries=getJournal().filter(x=>!x.deletedAt&&x.date>=addDays(todayISO(),-27)&&x.date<=todayISO());
    for(const item of entries)selectionRow($('conversation-entries'),`${formatDate(item.date)} · ${[item.text.slice(0,90),...item.symptoms,...item.metrics.map(x=>`${x.label}: ${number(x.value)} ${x.unit}`)].filter(Boolean).join(' · ')}`,selectedEntries.has(item.id),checked=>{if(checked)selectedEntries.add(item.id);else selectedEntries.delete(item.id);previewConversation();});
    if(!entries.length)$('conversation-entries').textContent='Keine Beobachtungen in den letzten 28 Tagen.';
    previewConversation();
  }
  function previewConversation(){ $('conversation-preview').innerHTML=reportBody(conversationReport());$('conversation-export').disabled=!selectedNotes.size&&!selectedEntries.size&&!$('conversation-metadata').checked; }
  $('conversation-metadata').addEventListener('change',previewConversation);
  $('conversation-note').addEventListener('click',()=>{$('conversation-dialog').close();setTimeout(()=>openNote(sessionAppointment?.id||null),120);});
  $('conversation-contacts').addEventListener('click',()=>{$('conversation-dialog').close();setTimeout(openBirth,120);});
  function downloadHtml(html,name){const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('conversation-export').addEventListener('click',()=>downloadHtml(reportDocument(conversationReport()),`bauchgefuehl-terminmappe-${todayISO()}.html`));
  let planSelection=new Set();
  function sharePlan(){planSelection=new Set();$('plan-share-options').replaceChildren();if(!own()||!data)return;for(const area of ['plans','growth'])for(const item of data[area].filter(x=>!x.deletedAt)){const label=area==='plans'?`${PLAN_AREAS[item.area]} · ${item.text}`:`${formatDate(item.date)} · ${GROWTH_KINDS[item.kind].label}: ${number(item.value)} ${GROWTH_KINDS[item.kind].unit}`;selectionRow($('plan-share-options'),label,false,checked=>{if(checked)planSelection.add(item.id);else planSelection.delete(item.id);previewPlan();});}previewPlan();$('plan-share-dialog').showModal();requestAnimationFrame(()=>($('plan-share-options').querySelector('input')||$('plan-share-download')).focus());}
  function planBody(){return own()&&data?companionBody(projectCompanion(data,[...planSelection])):'';}
  function previewPlan(){$('plan-share-preview').innerHTML=planBody();$('plan-share-download').disabled=!planSelection.size;}
  $('plan-export').addEventListener('click',sharePlan);
  $('plan-share-download').addEventListener('click',()=>{downloadHtml(companionDocument(projectCompanion(data,[...planSelection])),`bauchgefuehl-planung-${todayISO()}.html`);});
  window.addEventListener('storage',event=>{if(event.key===COMPANION_KEY||event.key===null)reload();});
  function reload(){read();render();onRefresh();}
  return { render,renderGrowth,openConversation,openHelp,reload,getData:()=>own()?data:normalizeCompanion(),isPostpartum:()=>own()&&!!data?.birthDate,refreshConversation(){if($('conversation-dialog').open)refreshConversation();} };
}
