import { pregnancyAgeLabel } from './pregnancy.js';
import { setupCompanion } from './companion-ui.js';
import { COMPANION_KEY, COMPANION_HISTORY_KEY } from './companion.js';
import { developmentImage, weeklyDevelopmentImage } from './development-art.js';
import { explainCalculation } from './calculation-explanation.js';
import { setupAppNavigation, showAppPanel } from './navigation.js';
import { isLocalPreview, setupPwa } from './pwa.js';
import { STORAGE_KEY, HISTORY_KEY, todayISO, dayNumber, addDays, formatDate, calculatePregnancy, validateProfile, validateStoredProfile, demoProfile, decodeShare, readLocal, writeLocal } from './pregnancy.js';
import { getWeekContent, milestones } from './content.js';
import { createQrSvg } from './qr.js';
import { setupDevices } from './devices-ui.js';
import { setupBirth } from './birth-ui.js';
import { BIRTH_KEY, BIRTH_HISTORY_KEY } from './birth.js';
import { DEVICE_KEY, RECOVERY_KEY, recoverBundle } from './device-transfer.js';
import { setupJournal } from './journal-ui.js';
import { setupCalendar } from './calendar-ui.js';
import { normalizeJournal } from './journal.js';
import { SYNC_KEY } from './sync.js';
import { setupGuide } from './guide-ui.js';
import { setupReport } from './report-ui.js';
import { setupMother } from './mother-ui.js';
import { setupPersonalCare } from './care-ui.js';
import { CARE_KEY, CARE_HISTORY_KEY } from './care.js';
import { makeShareLink, shareProfile } from './report.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } }; }
let recoveryProblem = '';
try { recoverBundle(storage); } catch (cause) { recoveryProblem = cause.message; }
let today = todayISO();
let local = readLocal(storage, today);
let state = { profile: local.profile || demoProfile(today), checks: { ...local.checks }, journal: local.journal || [], mode: local.profile ? 'local' : 'demo' };
let selectedWeek;
let toastTimer;
let syncUi = null;
let journalUi = null;
let calendarUi = null;
let guideUi = null;
let reportUi = null;
let birthUi = null;
let motherUi = null;
let careUi = null;
let companionUi = null;

function announce(message) {
  $('#notice').textContent = message;
  $('#notice').hidden = !message;
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}

function clearShareHash() {
  if (location.hash.startsWith('#s=')) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* The current session still remains usable. */ }
  }
}

function currentWeek() {
  return Math.max(1, Math.min(42, calculatePregnancy(state.profile, today).weekNumber));
}

function readIncomingLink() {
  if (syncUi?.connection && location.hash.startsWith('#s=')) {
    announce('Ein Reise-Link ersetzt keinen zugeordneten Masterstand. Löse die Gerätezuordnung nach einer Sicherung, bevor du eine andere Reise übernimmst.');
    selectedWeek = currentWeek();
    return;
  }
  try {
    const profile = decodeShare(location.hash, today);
    if (profile) state = { profile, checks: {}, journal: [], mode: 'shared' };
  } catch (error) { announce(error.message); }
  selectedWeek = currentWeek();
}

function renderMode() {
  const banner = $('#mode-banner');
  banner.hidden = state.mode === 'local';
  const actions = $('#mode-actions');
  actions.replaceChildren();
  const addAction = (label, handler, primary = false) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `button ${primary ? 'button-primary' : 'button-light'}`;
    button.textContent = label;
    button.addEventListener('click', handler);
    actions.append(button);
  };
  if (state.mode === 'demo') {
    $('#mode-title').textContent = 'Ein kleiner Einblick · du siehst Beispieldaten';
    $('#mode-description').textContent = 'Mit deiner Periode und Zykluslänge oder deinem ET wird dieser Begleiter ganz deiner.';
    addAction('Meine Daten eintragen', openProfile, true);
  } else if (state.mode === 'shared') {
    $('#mode-title').textContent = 'Eine Reise, die mit dir geteilt wurde';
    $('#mode-description').textContent = local.profile
      ? 'Geteilte Ansicht. Speichern ersetzt deine bisherigen lokalen Angaben. Dein bisheriges Journal wird zuvor im Sicherungsverlauf abgelegt.'
      : 'Geteilte Ansicht. Die Daten werden erst gespeichert, wenn du sie bewusst übernimmst.';
    addAction('Auf diesem Gerät speichern', () => saveProfile(state.profile, {}), true);
    addAction('Verwerfen', discardShared);
  } else if (state.mode === 'session') {
    $('#mode-title').textContent = 'Deine Reise · nur für diese Sitzung';
    $('#mode-description').textContent = 'Lokales Speichern ist gerade nicht möglich. Sichere dir bei Bedarf deinen Teilen-Link.';
    addAction('Speichern erneut versuchen', () => saveProfile(state.profile, state.checks));
  }
}

function renderSummaryArt(data = calculatePregnancy(state.profile, today)) {
  const element = $('.baby-art');
  element.hidden = data.status === 'beyond';
  if (element.hidden) {
    element.replaceChildren();
    return;
  }
  const week = Math.max(1, Math.min(42, data.weekNumber));
  // Load personal overview art once the app's precache can serve every week.
  element.innerHTML = state.mode === 'demo' || isLocalPreview || navigator.serviceWorker?.controller
    ? weeklyDevelopmentImage(week, 'overview')
    : developmentImage(week, 'overview') + '<span>Schematische Illustration</span>';
}

function renderSummary() {
  const data = calculatePregnancy(state.profile, today);
  const fromDueDate = data.method === 'due-date';
  renderSummaryArt(data);
  $('#greeting').innerHTML = companionUi?.isPostpartum() ? 'Ein neuer Abschnitt.<br><em>Raum für dich.</em>' : 'Da wächst etwas<br><em>Wunderbares.</em>';
  $('#estimate-label-text').textContent = fromDueDate ? 'Vom ET zurückgerechnet · 28-Tage-Basis' : 'Zyklusangepasste Schätzung';
  $('#profile-method').textContent = fromDueDate ? 'ET · 28-Tage-Basis' : 'Periode & Zyklus';
  $('#profile-date-label').textContent = fromDueDate ? 'Eingetragener ET' : 'Letzte Periode';
  $('#due-date-label').textContent = fromDueDate ? 'EINGETRAGENER ET' : 'VORAUSSICHTLICHER ET';
  $('#today-date').textContent = formatDate(today, { weekday: 'long', year: undefined });
  $('#trimester').textContent = data.status === 'ongoing' ? `${data.trimester}. Trimester` : data.status === 'before' ? 'Vor dem rechnerischen Beginn' : 'Betreuung & Datierung';
  $('#ssw-weeks').textContent = data.status !== 'ongoing' ? '–' : data.weeks;
  $('#ssw-days').textContent = data.status !== 'ongoing' ? '–' : data.days;
  $('#week-explanation').textContent = data.status !== 'ongoing' ? pregnancyAgeLabel(data) : `${data.weeks} Wochen und ${data.days} ${data.days === 1 ? 'Tag' : 'Tage'} · in der ${data.weekNumber}. SSW`;
  $('.ssw-plus').hidden = data.status !== 'ongoing';
  $('#due-date').textContent = formatDate(data.dueDate);
  const remaining = data.daysUntilDue;
  $('#due-countdown').textContent = remaining > 0 ? `Noch ungefähr ${remaining} Tage bis zum ET` : remaining === 0 ? 'Heute ist der errechnete Termin' : `Der errechnete Termin war vor ${Math.abs(remaining)} ${remaining === -1 ? 'Tag' : 'Tagen'}`;
  const percent = Math.round(data.progress);
  $('#progress-percent').textContent = `${percent} %`;
  $('#progress-fill').style.width = `${data.progress}%`;
  $('#pregnancy-progressbar').setAttribute('aria-valuenow', percent);
  $('#profile-lmp').textContent = formatDate(fromDueDate ? state.profile.dueDate : state.profile.lmp, { month: 'short' });
  $('#profile-cycle-row').hidden = fromDueDate;
  $('#profile-cycle').textContent = fromDueDate ? '' : `${state.profile.cycle} Tage${state.profile.irregular ? ' · unregelmäßig' : ''}`;
  const messages = [];
  if (data.status === 'before') messages.push('Die Zyklusanpassung ergibt derzeit ein Alter vor 0+0. Eine aktuelle SSW lässt sich damit noch nicht sinnvoll anzeigen. Prüfe das Datum und besprich die Datierung mit deiner Praxis.');
  if (data.status === 'beyond') messages.push('Die Berechnung liegt bei 42+0 oder später und damit außerhalb der Wocheninfos. Bitte prüfe deine Angaben. Wenn die Schwangerschaft noch besteht, kontaktiere dein Geburtsteam für das weitere Vorgehen.');
  if (data.uncertain) messages.push('Bei unregelmäßigen Zyklen oder einer Zykluslänge außerhalb von 21–35 Tagen ist diese Schätzung besonders unsicher. Die ärztliche Datierung ist für deine Betreuung maßgeblich.');
  $('#medical-status').textContent = messages.join(' ');
  $('#medical-status').hidden = !messages.length;
  const explanation = explainCalculation(state.profile, today, state.mode);
  const title = document.createElement('h3');
  title.textContent = explanation.title;
  const steps = document.createElement('ol');
  for (const text of explanation.steps) {
    const step = document.createElement('li');
    step.textContent = text;
    steps.append(step);
  }
  const result = document.createElement('p');
  result.className = 'calculation-result';
  result.textContent = explanation.result;
  $('#calculation-example').replaceChildren(title, steps, result);
}

function renderWeeks(center = false) {
  const actual = currentWeek();
  const calculated = calculatePregnancy(state.profile, today);
  const isActual = calculated.status === 'ongoing' && selectedWeek === actual;
  if (!$('#week-list').children.length) {
    for (let week = 1; week <= 42; week++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'week-button';
      button.dataset.week = week;
      button.innerHTML = `<small>SSW</small><span>${week}</span>`;
      button.addEventListener('click', () => selectWeek(week));
      $('#week-list').append(button);
    }
  }
  for (const button of $$('.week-button')) {
    const week = Number(button.dataset.week);
    button.classList.toggle('selected', week === selectedWeek);
    button.classList.toggle('is-current', week === actual && calculated.status === 'ongoing');
    button.setAttribute('aria-pressed', String(week === selectedWeek));
    button.setAttribute('aria-label', `${week}. Schwangerschaftswoche${week === actual && calculated.status === 'ongoing' ? ', deine aktuelle Woche' : ''}`);
  }
  $('#week-prev').disabled = selectedWeek <= 1;
  $('#week-next').disabled = selectedWeek >= 42;
  $('#selected-week-label').textContent = `${selectedWeek}. SSW`;
  $('#selected-current').textContent = isActual ? (state.mode === 'demo' ? 'Aktuelle Woche im Beispiel' : 'Deine aktuelle Woche') : `Wochenvorschau · ${selectedWeek - 1}+0 bis ${selectedWeek - 1}+6`;
  $('#today-week').textContent = calculated.status === 'ongoing' ? 'Zur aktuellen Woche →' : calculated.status === 'before' ? 'Zum Anfang der Wochenreise →' : 'Zur letzten Wocheninfo →';
  const content = getWeekContent(selectedWeek);
  $('#development-title').textContent = content.title;
  $('#baby-description').textContent = content.baby;
  motherUi?.render(selectedWeek);
  $('#phase-size').textContent = content.size;
  $('#phase-comparison').textContent = content.comparison;
  companionUi?.renderGrowth(selectedWeek, calculated.gestationalDays);
  $('#development-source').href = content.source;
  $('#development-source').textContent = `Entwicklung in dieser Phase · ${selectedWeek <= 40 ? 'BIÖG' : 'NHS'} ↗`;
  if (center) {
    const chosen = $(`.week-button[data-week="${selectedWeek}"]`);
    const list = $('#week-list');
    // Scroll only the week strip; never move the document during data entry.
    list.scrollTo({ left: chosen.offsetLeft - list.offsetLeft - list.clientWidth / 2 + chosen.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}

function selectWeek(week) {
  selectedWeek = Math.max(1, Math.min(42, week));
  renderWeeks(true);
}

function milestoneCard(item, suffix, gestationalDays) {
  const article = document.createElement('article');
  article.className = 'milestone';
  if (gestationalDays >= item.start && gestationalDays <= item.end) {
    const marker = document.createElement('span');
    marker.className = 'milestone-current';
    marker.title = 'Im aktuellen rechnerischen Zeitraum';
    article.append(marker);
  }
  const time = document.createElement('div');
  time.className = 'milestone-time';
  time.textContent = (item.category === 'optional' ? 'Freiwillig · ' : item.category === 'conditional' ? 'Falls zutreffend · ' : '') + item.label + (gestationalDays > item.end ? ' · Zeitraum vergangen' : '');
  const title = document.createElement('h3');
  title.textContent = item.title;
  const text = document.createElement('p');
  text.textContent = item.text;
  const source = document.createElement('a');
  source.className = 'source-link';
  source.href = item.source;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Informationen zur Vorsorge ↗';
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = `${item.id}-${suffix}`;
  input.checked = state.checks[item.id] === true;
  input.disabled = state.mode === 'demo' || state.mode === 'shared' || syncUi?.readOnly;
  const labelText = document.createElement('span');
  labelText.textContent = 'Für mich geklärt';
  label.append(input, labelText);
  input.addEventListener('change', () => {
    if (syncUi?.readOnly) return;
    state.checks[item.id] = input.checked;
    if (!input.checked) delete state.checks[item.id];
    persistChecks();
    // Update the duplicate checkbox without removing the focused control.
    for (const other of $$(`input[id^="${item.id}-"]`)) other.checked = input.checked;
  });
  article.append(time, title, text, source);
  if(item.extraSource){const extra=document.createElement('a');extra.className='source-link';extra.href=item.extraSource;extra.target='_blank';extra.rel='noopener noreferrer';extra.textContent='G-BA · Voraussetzungen und Kassenleistung';article.append(extra);}
  if(item.reviewed){const reviewed=document.createElement('p');reviewed.className='care-item-meta';reviewed.textContent=`Redaktionell geprüft: ${formatDate(item.reviewed)}`;article.append(reviewed);}
  article.append(label);
  return article;
}

function renderCare() {
  const days = calculatePregnancy(state.profile, today).gestationalDays;
  const upcoming = milestones.filter(item => item.end >= days).sort((a,b)=>Number(a.openEnded===true)-Number(b.openEnded===true)||a.start-b.start).slice(0, 3);
  $('#milestones').replaceChildren(...upcoming.map(item => milestoneCard(item, 'next', days)));
  $('#all-milestones').replaceChildren(...milestones.map(item => milestoneCard(item, 'all', days)));
  $('#checklist-note').textContent = state.mode === 'demo' ? 'In der Vorschau sind die Merkhäkchen deaktiviert. Trage deine Daten ein, um sie lokal zu nutzen.' : state.mode === 'shared' ? 'Übernimm die Daten auf diesem Gerät, um eigene Merkhäkchen zu setzen. Häkchen werden nicht geteilt.' : 'Deine Häkchen sind persönliche Merkhilfen, keine medizinische Dokumentation. Sie werden nicht geteilt.';
  if (syncUi?.connection) $('#checklist-note').textContent = syncUi.readOnly ? 'Merkhäkchen stammen aus dem zuletzt übernommenen Masterstand. Änderungen erfolgen am Master.' : 'Merkhäkchen sind im nächsten bewusst übertragenen Geräte-Stand enthalten.';
}

function render(center = false) {
  renderMode();
  renderSummary();
  renderWeeks(center);
  renderCare();
  journalUi?.render();
  calendarUi?.render();
  guideUi?.render();
  reportUi?.refreshIfOpen();
  birthUi?.render();
  careUi?.render();
  companionUi?.render();
  companionUi?.renderGrowth(selectedWeek, calculatePregnancy(state.profile,today).gestationalDays);
  companionUi?.refreshConversation();
}

function queueSync() {
  try { syncUi?.queue({ profile: state.profile, checks: state.checks, journal: state.journal }); }
  catch (error) { announce(`Deine Angaben sind lokal gespeichert. Der Geräte-Sync konnte noch nicht vorgemerkt werden: ${error.message} Bitte sichere ein Backup.`); }
}

function persistChecks() {
  if (state.mode === 'local' || state.mode === 'session') {
    try {
      writeLocal(storage, state.profile, state.checks, today, state.journal);
      state.mode = 'local';
      local = { profile: { ...state.profile }, checks: { ...state.checks }, journal: state.journal, error: null };
      queueSync();
    } catch {
      state.mode = 'session';
      announce('Deine Änderungen konnten nicht lokal gespeichert werden. Sie bleiben nur für diese Sitzung erhalten.');
    }
    renderMode();
    calendarUi?.render();
  }
}

function saveProfile(profile, checks) {
  if (syncUi?.readOnly) throw new Error('Dieses Gerät liest nur mit. Bitte ändere die Angaben auf dem Master.');
  const replacing = state.mode === 'shared';
  state = { profile: validateProfile(profile, today), checks: { ...checks }, journal: replacing ? [] : state.journal, mode: 'local' };
  announce('');
  try {
    writeLocal(storage, state.profile, state.checks, today, state.journal, { replaceJournal: replacing });
    local = { profile: { ...state.profile }, checks: { ...state.checks }, journal: state.journal, error: null };
    queueSync();
    toast('Deine Angaben sind in diesem Browser gespeichert.');
  } catch {
    state.mode = 'session';
    announce('Deine Angaben konnten nicht lokal gespeichert werden. Sie bleiben nur für diese Sitzung erhalten. Du kannst dir einen Teilen-Link sichern.');
  }
  clearShareHash();
  selectedWeek = currentWeek();
  render(true);
}

function discardShared() {
  clearShareHash();
  local = readLocal(storage, today);
  state = { profile: local.profile || demoProfile(today), checks: { ...local.checks }, journal: local.journal || [], mode: local.profile ? 'local' : 'demo' };
  selectedWeek = currentWeek();
  announce(local.error || '');
  render(true);
}

function openProfile() {
  if (syncUi?.readOnly) { toast('Änderungen sind nur am Master möglich.'); return; }
  const isDemo = state.mode === 'demo';
  $('#method').value = isDemo ? 'period' : state.profile.method;
  $('#lmp').value = isDemo ? '' : state.profile.lmp || '';
  $('#lmp').max = today;
  $('#lmp').min = addDays(today, -366);
  $('#cycle').value = isDemo ? '' : state.profile.cycle || '';
  $('#irregular').checked = !isDemo && state.profile.irregular;
  $('#due-date-input').value = isDemo ? '' : state.profile.dueDate || '';
  $('#due-date-input').min = addDays(today, -86);
  $('#due-date-input').max = addDays(today, 280);
  $('#form-error').hidden = true;
  $('#lmp').removeAttribute('aria-invalid');
  $('#cycle').removeAttribute('aria-invalid');
  $('#due-date-input').removeAttribute('aria-invalid');
  updateMethodFields();
  $('#profile-dialog').showModal();
}

function formProfile() {
  return validateProfile($('#method').value === 'due-date'
    ? { method: 'due-date', dueDate: $('#due-date-input').value }
    : { method: 'period', lmp: $('#lmp').value, cycle: Number($('#cycle').value), irregular: $('#irregular').checked }, today);
}

function updateMethodFields() {
  const fromDueDate = $('#method').value === 'due-date';
  $('#period-fields').hidden = fromDueDate;
  $('#due-date-fields').hidden = !fromDueDate;
  for (const input of $$('#period-fields input')) input.disabled = fromDueDate;
  $('#due-date-input').disabled = !fromDueDate;
  $('#lmp').required = !fromDueDate;
  $('#cycle').required = !fromDueDate;
  $('#due-date-input').required = fromDueDate;
  $('#method-hint').textContent = fromDueDate
    ? 'Dein ET entspricht 40+0. Die SSW wird mit 280 Tagen auf der Standardbasis von 28 Zyklustagen zurückgerechnet.'
    : 'Deine SSW wird aus Periodenbeginn und persönlicher Zykluslänge geschätzt.';
  $('#form-error').hidden = true;
  for (const input of $$('#profile-form input')) input.removeAttribute('aria-invalid');
  updateFormPreview();
}

$('#method').addEventListener('change', () => {
  if ($('#method').value === 'due-date' && !$('#due-date-input').value) {
    try {
      const period = validateProfile({ lmp: $('#lmp').value, cycle: Number($('#cycle').value), irregular: $('#irregular').checked }, today);
      $('#due-date-input').value = calculatePregnancy(period, today).dueDate;
    } catch { /* With no valid period draft, the ET must be entered explicitly. */ }
  }
  updateMethodFields();
});

function updateFormPreview() {
  try {
    const data = calculatePregnancy(formProfile(), today);
    $('#form-preview').textContent = data.status === 'before' ? 'Die Berechnung liegt noch vor 0+0. Bitte prüfe deine Angaben.' : `${pregnancyAgeLabel(data)} · ${data.method === 'due-date' ? 'Eingetragener' : 'Geschätzter'} ET: ${formatDate(data.dueDate)}`;
  } catch {
    $('#form-preview').textContent = $('#method').value === 'due-date' ? 'Trage einen gültigen ET ein, um die Rückrechnung zu sehen.' : 'Trage ein gültiges Datum und deine Zykluslänge ein, um die Schätzung zu sehen.';
  }
}

$('#profile-form').addEventListener('input', updateFormPreview);
$('#profile-form').addEventListener('submit', event => {
  event.preventDefault();
  $('#form-error').hidden = true;
  $('#lmp').removeAttribute('aria-invalid');
  $('#cycle').removeAttribute('aria-invalid');
  $('#due-date-input').removeAttribute('aria-invalid');
  try {
    const profile = formProfile();
    const unchanged = calculatePregnancy(profile, today).dueDate === calculatePregnancy(state.profile, today).dueDate;
    const checks = unchanged && ['local', 'session'].includes(state.mode) ? state.checks : {};
    saveProfile(profile, checks);
    $('#profile-dialog').close();
  } catch (error) {
    $('#form-error').textContent = error.message;
    $('#form-error').hidden = false;
    const target = $('#method').value === 'due-date' ? $('#due-date-input') : error.message.includes('Zykluslänge') ? $('#cycle') : $('#lmp');
    target.setAttribute('aria-invalid', 'true');
    target.focus();
  }
});

function renderShare() {
  $('#share-qr-code').replaceChildren();
  $('#share-qr-error').hidden = true;
  try {
    const mode = $('#share-scope').value;
    const profile = shareProfile(state.profile, mode, today);
    const url = new URL(makeShareLink(state.profile, mode, location.href, today));
    $('#share-url').value = url.href; $('#copy-link').disabled = false;
    try { $('#share-qr-code').innerHTML = createQrSvg(url.href); }
    catch {
      $('#share-qr-error').textContent = 'Für diese Adresse konnte kein QR-Code erstellt werden. Du kannst stattdessen den Link kopieren.';
      $('#share-qr-error').hidden = false;
    }
    $('#share-local-warning').hidden = !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    $('#share-description').textContent = profile.method === 'due-date'
      ? `Enthalten sind nur der ${state.profile.method === 'period' ? 'aus deinen Angaben geschätzte' : 'eingetragene'} ET (${formatDate(profile.dueDate)}) und die Methode „ET · 28-Tage-Basis“. Damit bleiben SSW und Zeitachse gleich. Periodenbeginn, Zykluslänge und Unregelmäßigkeit werden ausgelassen; aus dem ET ist die zeitliche Einordnung der Schwangerschaft weiterhin ableitbar. Ein geschätzter ET bleibt eine Schätzung; zyklusbezogene Unsicherheitshinweise werden nicht übertragen.`
      : `Enthalten sind die Methode „Periode & Zyklus“, der Periodenbeginn (${formatDate(profile.lmp)}), die durchschnittliche Zykluslänge (${profile.cycle} Tage) und die Angabe, ob dein Zyklus unregelmäßig ist.`;
  } catch (cause) {
    $('#share-url').value = ''; $('#copy-link').disabled = true;
    $('#share-description').textContent = `Dieser Umfang kann gerade nicht geteilt werden: ${cause.message} Prüfe deine Angaben oder wähle bewusst die vollständige Berechnungsgrundlage.`;
  }
  $('#copy-status').textContent = '';
  $('#copy-link').innerHTML = `${icon('share')}Link kopieren`;
}
function openShare() {
  if (state.mode === 'demo') { openProfile(); toast('Trage zuerst deine Daten ein, um deine Reise zu teilen.'); return; }
  $('#share-scope').value = 'due-date'; renderShare();
  $('#share-dialog').showModal();
}

$('#share-scope').addEventListener('change', renderShare);
$('#share-url').addEventListener('click', event => event.target.select());
$('#copy-link').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error();
    await navigator.clipboard.writeText($('#share-url').value);
    $('#copy-link').innerHTML = `${icon('check')}Link kopiert`;
    $('#copy-status').textContent = 'Kopiert. Du kannst den Link jetzt selbst an eine vertraute Person senden.';
  } catch {
    $('#share-url').focus();
    $('#share-url').select();
    $('#copy-status').textContent = 'Automatisches Kopieren ist hier nicht möglich. Der Link ist markiert: Kopiere ihn mit Strg+C oder ⌘C oder über das Kontextmenü.';
  }
});

function openDetail(selector) {
  const detail = $(selector);
  showAppPanel('wissen');
  detail.open = true;
  detail.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  detail.querySelector('summary').focus({ preventScroll: true });
}

const actions = {
  edit: openProfile,
  share: openShare,
  calculation: () => openDetail('#calculation-details'),
  privacy: () => openDetail('.accordions details:nth-child(4)'),
  sources: () => openDetail('#sources-details'),
  report: () => reportUi?.open(),
};
for (const element of $$('[data-action]')) if (actions[element.dataset.action]) element.addEventListener('click', () => actions[element.dataset.action]());
for (const button of $$('[data-close]')) button.addEventListener('click', () => $(`#${button.dataset.close}`).close());
for (const dialog of $$('dialog')) {
  if (dialog.id === 'journal-dialog' || dialog.id === 'birth-dialog' || dialog.id.startsWith('care-')) continue;
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}

$('#delete-data').addEventListener('click', () => { $('#delete-error').hidden = true; $('#delete-dialog').showModal(); });
$('#confirm-delete').addEventListener('click', () => {
  try {
    if (syncUi?.connection) throw new Error('Bitte zuerst unter „Daten & Backup“ eine Sicherung herunterladen und die Gerätezuordnung lösen.');
    storage.removeItem(SYNC_KEY);
    storage.removeItem(HISTORY_KEY);
    storage.removeItem(STORAGE_KEY);
    for (const key of [BIRTH_KEY, BIRTH_HISTORY_KEY, CARE_KEY, CARE_HISTORY_KEY, COMPANION_KEY, COMPANION_HISTORY_KEY, DEVICE_KEY, RECOVERY_KEY]) storage.removeItem(key);
    birthUi?.reload();
    careUi?.reload();
    companionUi?.reload();
    clearShareHash();
    local = { profile: null, checks: {}, error: null };
    state = { profile: demoProfile(today), checks: {}, journal: [], mode: 'demo' };
    selectedWeek = currentWeek();
    $('#delete-dialog').close();
    render(true);
    announce('');
    toast('Deine lokalen Angaben, dein Journal und deine Merkhäkchen wurden gelöscht.');
  } catch {
    $('#delete-error').textContent = syncUi?.connection ? 'Bitte zuerst unter „Daten & Backup“ eine Sicherung herunterladen und die Gerätezuordnung lösen. Bereits weitergegebene Kopien bleiben davon unberührt.' : 'Der Browser lässt das Löschen gerade nicht zu. Entferne die Website-Daten bitte über die Browser-Einstellungen.';
    $('#delete-error').hidden = false;
  }
});

$('#week-prev').addEventListener('click', () => selectWeek(selectedWeek - 1));
$('#week-next').addEventListener('click', () => selectWeek(selectedWeek + 1));
$('#today-week').addEventListener('click', () => selectWeek(currentWeek()));
$('#week-list').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const target = event.key === 'Home' ? 1 : event.key === 'End' ? 42 : selectedWeek + (event.key === 'ArrowRight' ? 1 : -1);
  selectWeek(target);
  $(`.week-button[data-week="${selectedWeek}"]`).focus({ preventScroll: true });
});
setupAppNavigation();
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (state.mode !== 'demo') renderSummaryArt();
});
setupPwa();

function refreshDate() {
  const fresh = todayISO();
  if (fresh === today) return;
  const wasCurrent = selectedWeek === currentWeek();
  today = fresh;
  if (state.mode === 'demo') state.profile = demoProfile(today);
  try {
    validateStoredProfile(state.profile, today);
    if (wasCurrent) selectedWeek = currentWeek();
    render(wasCurrent);
  } catch {
    local = readLocal(storage, today);
    state = { profile: demoProfile(today), checks: {}, journal: local.journal || state.journal, mode: 'demo' };
    selectedWeek = currentWeek();
    render(true);
    announce('Deine gespeicherten Angaben liegen inzwischen außerhalb des unterstützten Zeitraums. Bitte prüfe und aktualisiere sie.');
  }
}
setInterval(refreshDate, 60_000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#s=')) {
    readIncomingLink();
    render(true);
  } else if (state.mode === 'shared') discardShared();
});
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  local = readLocal(storage, today);
  if (state.mode === 'shared') { renderMode(); return; }
  state = { profile: local.profile || demoProfile(today), checks: { ...local.checks }, journal: local.journal || [], mode: local.profile ? 'local' : 'demo' };
  selectedWeek = currentWeek();
  announce(local.error || '');
  render(true);
});

function saveJournalEntries(entries) {
  if (syncUi?.readOnly || !['local', 'session'].includes(state.mode)) throw new Error('Bitte zuerst eigene Angaben am schreibberechtigten Gerät speichern.');
  const fresh = readLocal(storage, today);
  if (JSON.stringify(fresh.journal) !== JSON.stringify(state.journal)) throw new Error('Das Journal wurde in einem anderen Tab geändert. Bitte neu öffnen; die offene Messung bleibt gespeichert.');
  const journal = normalizeJournal(entries, today);
  writeLocal(storage, state.profile, state.checks, today, journal);
  state.journal = journal; state.mode = 'local';
  local = { profile: state.profile, checks: { ...state.checks }, journal, error: null };
  queueSync(); renderMode(); calendarUi?.render(); reportUi?.refreshIfOpen(); birthUi?.render(); companionUi?.render(); companionUi?.refreshConversation();
}
announce(recoveryProblem || local.error || '');
careUi = setupPersonalCare({ storage, getMode: () => state.mode,
  canEdit: () => state.mode !== 'shared' && !syncUi?.readOnly,
  onChange() { queueSync(); calendarUi?.render(); reportUi?.refreshIfOpen(); companionUi?.render(); companionUi?.refreshConversation(); },
  onRefresh() { calendarUi?.render(); reportUi?.refreshIfOpen(); companionUi?.render(); companionUi?.refreshConversation(); },
  notify: toast,
  openConversation: id => companionUi?.openConversation(id),
  openCalendar(date) { showAppPanel('journal', true); calendarUi.showDate(date); $('#calendar-selected-date').scrollIntoView({ behavior: 'instant' }); },
});
function refreshPersonalContext() {
  if(!['shared','session'].includes(state.mode)) {
    try { if(storage.getItem(STORAGE_KEY)) {
      const fresh=readLocal(storage,today),changed=JSON.stringify(state.profile)!==JSON.stringify(fresh.profile);
      local=fresh;state={profile:fresh.profile||demoProfile(today),checks:fresh.checks,journal:fresh.journal,mode:fresh.profile?'local':'demo'};
      if(changed)selectedWeek=currentWeek();
      if(fresh.error)announce(fresh.error);
    }} catch(cause) {announce(cause.message);}
  }
  render();
}
companionUi = setupCompanion({ storage, getMode: () => state.mode, getJournal: () => state.journal, getCare: () => careUi.getData(),
  getAge: date => calculatePregnancy(state.profile,today).gestationalDays + dayNumber(date)-dayNumber(today),
  canEdit: () => state.mode !== 'shared' && !syncUi?.readOnly,
  onChange() { queueSync(); refreshPersonalContext(); },
  onRefresh: refreshPersonalContext,
  openPanel(id, anchor) { showAppPanel(id,true); if(anchor) document.getElementById(anchor)?.scrollIntoView({behavior:'instant',block:'start'}); },
  openNote: (id,text) => careUi.openNote(id,null,text), editNote: id => careUi.editNote(id),
  openBirth: () => birthUi?.open(), openJournal: () => journalUi?.openForDate(today),
});
guideUi = setupGuide({ getProfile: () => state.profile, getMode: () => state.mode, getToday: () => today });
reportUi = setupReport({ getJournal: () => state.journal, getCare: () => careUi.getData(), getToday: () => today, notify: toast });
journalUi = setupJournal({
  getJournal: () => state.journal,
  onOpen: () => calendarUi?.showJournal(),
  canEdit: () => ['local', 'session'].includes(state.mode) && !syncUi?.readOnly,
  onSetup() { if (syncUi?.readOnly) toast('Bitte Einträge auf dem aktiven Master erfassen.'); else openProfile(); },
  saveJournal: saveJournalEntries,
  symptomHelp: label => companionUi.openHelp(label),
  notify: toast,
  weekOnDate(date) {
    if (state.mode === 'demo' || state.mode === 'shared') return null;
    if (companionUi?.isPostpartum() && date >= companionUi.getData().birthDate) return `Nach Geburt · Tag ${dayNumber(date)-dayNumber(companionUi.getData().birthDate)}`;
    const age = calculatePregnancy(state.profile, today).gestationalDays + dayNumber(date) - dayNumber(today);
    return age >= 0 ? `SSW ${Math.floor(age / 7)}+${age % 7}` : 'Vor rechnerischem Beginn';
  },
});
calendarUi = setupCalendar({
  getProfile: () => state.profile,
  getToday: () => today,
  getMode: () => state.mode,
  getJournal: () => state.journal,
  getChecks: () => state.checks,
  getBirthDate: () => companionUi?.getData()?.birthDate,
  getCare: () => careUi.getData(),
  addAppointment: date => careUi.openAppointment(date),
  openAppointmentNotes(id) { showAppPanel('vorsorge', true); careUi.openNote(id); },
  openCare() { showAppPanel('vorsorge', true); $('#personal-care-panel').scrollIntoView({ behavior: 'instant' }); },
  canEdit: () => ['local', 'session'].includes(state.mode) && !syncUi?.readOnly,
  addEntry: date => journalUi.openForDate(date),
  addCheckin: date => journalUi.checkinForDate(date),
  editEntry: id => journalUi.editEntry(id),
  showEntries: date => journalUi.filterDate(date),
  showEntriesRange: (from, to, symptom, type) => journalUi.filterRange(from, to, symptom, type),
  showGuide(date) {
    guideUi.setDate(date); showAppPanel('wissen', true);
    $('#everyday-guide').scrollIntoView({ behavior: 'instant', block: 'start' });
    $('#guide-search').focus({ preventScroll: true });
  },
  showWeek(week) {
    showAppPanel('wochenreise', true); selectWeek(week);
    motherUi.show('baby');
    $('#wochenreise').scrollIntoView({ behavior: 'instant', block: 'start' });
  },
});
let lastSyncRole = '';
syncUi = setupDevices({
  storage,
  getSnapshot() {
    if (state.mode === 'demo' || state.mode === 'shared') throw new Error('Bitte zuerst eigene Angaben auf diesem Gerät speichern.');
    return { profile: state.profile, checks: state.checks, journal: state.journal };
  },
  applySnapshot(value, options = {}) {
    if (!options.alreadyStored) writeLocal(storage, value.profile, value.checks, today, value.journal, options);
    local = { profile: value.profile, checks: value.checks, journal: value.journal, error: null };
    state = { profile: value.profile, checks: { ...value.checks }, journal: value.journal, mode: 'local' };
    selectedWeek = currentWeek();
    render(true);
  },
  notify: toast,
  reloadExtras() { birthUi?.reload(); careUi?.reload(); companionUi?.reload(); },
  onConnection(connection, readOnly) {
    const role = `${connection?.role || ''}:${readOnly}`;
    for (const button of $$('[data-action="edit"]')) button.disabled = !!readOnly;
    if (role !== lastSyncRole && syncUi) { lastSyncRole = role; renderCare(); journalUi?.render(); calendarUi?.render(); birthUi?.render(); careUi?.render(); companionUi?.render(); }
  },
});
birthUi = setupBirth({
  storage, getProfile: () => state.profile, getMode: () => state.mode, getJournal: () => state.journal,
  canEdit: () => ['local', 'session'].includes(state.mode) && !syncUi?.readOnly,
  isPostpartum: () => companionUi?.isPostpartum(),
  saveJournal: saveJournalEntries, notify: toast,
  openCalendar(date) { showAppPanel('journal', true); calendarUi.showDate(date); document.getElementById('calendar-view').scrollIntoView({ behavior: 'instant' }); },
});
motherUi = setupMother({ openCurrentWeek() { showAppPanel('wochenreise', true); selectWeek(currentWeek()); } });
readIncomingLink();
render(true);
