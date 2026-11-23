import { pregnancyAgeLabel } from './pregnancy.js';
import { setupDayPress } from './day-press.js';
import { formatText } from './text-format.js';
import { todayISO, addDays, dayNumber, formatDate } from './dates.js';
import { pregnancyTimeline, gestationOnDate, dateForSsw, monthStart, shiftMonth, monthDays, timelineEvents, eventsOnDate, entriesOnDate, upcomingEvents, weekRanges, calendarReflectionPeriod } from './calendar.js';
import { symptomOptions, isCheckinEntry } from './journal.js';
import { readCheckin, CHECKIN_FIELDS, checkinValue, isCheckinMetric } from './checkin.js';
import { symptomMentions } from './reflection.js';
import { setupReflection } from './reflection-ui.js';
import { normalizeCare, appointmentsOnDate, PROVIDERS, careCollection } from './care.js';

export function setupCalendar({ getProfile, getToday = todayISO, getMode, getJournal, getChecks, getBirthDate = () => null, getCare = normalizeCare, addAppointment, openAppointmentNotes, openAppointment, openCare, canEdit, addEntry, editEntry, showEntries, showReflection, showWeek, showGuide }) {
  const $ = id => document.getElementById(id);
  const node = (tag, className = '', text = '') => { const element = document.createElement(tag); element.className = className; element.textContent = text; return element; };
  let selected = getToday();
  let month = selected.slice(0, 7);
  let view = 'month';
  let timeline;
  let events = [];
  let symptom = '';
  let showCare = false;
  let showSymptoms = false;
  let pickerKey = '';
  const ssw = age => pregnancyAgeLabel(age, true);
  const birthDate = () => getMode() === 'shared' ? null : getBirthDate();
  const afterBirth = date => birthDate() && date >= birthDate();
  const getPeriod = () => calendarReflectionPeriod(timeline, selected, birthDate());
  const dateAge = (date, age) => afterBirth(date) ? `Tag ${dayNumber(date) - dayNumber(birthDate())}` : ssw(age);
  const shortDate = date => formatDate(date, { month: 'short' });
  const button = (label, callback, className = 'text-link') => {
    const element = node('button', className, label); element.type = 'button'; element.addEventListener('click', callback); return element;
  };
  function switchView(next) {
    view = next;
    $('calendar-month-view').hidden = next !== 'month';
    $('reflection').hidden = next !== 'week';
    $('calendar-view-toggle').setAttribute('aria-pressed', String(next === 'month'));
    $('calendar-view-toggle').classList.toggle('selected', next === 'month');
    $('week-view-toggle').setAttribute('aria-pressed', String(next === 'week'));
    $('week-view-toggle').classList.toggle('selected', next === 'week');
  }
  $('calendar-view-toggle').addEventListener('click', () => switchView('month'));
  $('week-view-toggle').addEventListener('click', () => switchView('week'));
  $('calendar-open-reflection').addEventListener('click', showReflection);
  $('calendar-symptom').addEventListener('change', event => { symptom = event.target.value; render(); });
  $('calendar-show-care').addEventListener('change', event => { showCare = event.target.checked; render(); });
  $('calendar-show-symptoms').addEventListener('change', event => { showSymptoms = event.target.checked; render(); });
  $('calendar-open-care').addEventListener('click', openCare);
  const reflection = setupReflection({
    getSelected: () => selected, getToday, getJournal, getSymptom: () => showSymptoms ? symptom : '',
    getPeriod, chooseDate: date => choose(date), openDay,
    openEntries: showEntries,
    dayLabels(date) {
      const care = getCare();
      const appointments = care ? appointmentsOnDate(care, date) : [];
      const labels = appointments.map(item => ({ label: `Termin: ${item.title}`, marker: 'T', type: 'appointment' }));
      for (const event of eventsOnDate(events, date)) {
        if (event.type === 'point') labels.push({ label: `Meilenstein: ${event.title}`, marker: '◆', type: 'point' });
        else if (event.date === date) labels.push({ label: `Beginn Vorsorgefenster: ${event.title}`, marker: 'V', type: 'care' });
      }
      return labels;
    },
  });
  function choose(date, focus = false) {
    dayNumber(date); monthStart(date.slice(0, 7));
    selected = date; month = date.slice(0, 7); $('calendar-error').hidden = true;
    render();
    if (focus) focusDay();
  }
  const dayDialog = $('calendar-day-dialog');
  const optionsDialog = $('calendar-options-dialog');
  function openDay(date = selected) {
    if (document.querySelector('dialog[open]')) return;
    choose(date);
    dayDialog.showModal();
    $('calendar-day-close').focus();
  }
  function focusDay() {
    const container = view === 'month' ? $('calendar-days') : $('reflection-days');
    container.querySelector(`[data-calendar-date="${selected}"]`)?.focus({ preventScroll: true });
  }
  $('calendar-day-open').addEventListener('click', () => openDay());
  $('calendar-day-close').addEventListener('click', () => dayDialog.close());
  dayDialog.addEventListener('close', () => {
    if (!$('kalender').classList.contains('mobile-inactive') && !document.querySelector('dialog[open]') &&
        !document.activeElement?.closest('button, summary')) focusDay();
  });
  function fromDay(action) {
    return () => { dayDialog.close(); action(); };
  }
  $('calendar-options-open').addEventListener('click', () => {
    $('calendar-error').hidden = true;
    optionsDialog.showModal();
  });
  $('calendar-options-close').addEventListener('click', () => optionsDialog.close());
  $('calendar-week-open').addEventListener('click', () => {
    switchView('week');
    $('reflection').scrollIntoView({ block: 'start' });
    $('reflection-title').focus({ preventScroll: true });
  });
  $('calendar-week-select').addEventListener('change', event => {
    if (event.target.value) choose(event.target.value);
  });
  setupDayPress($('calendar-days'),openDay);
  function shift(offset) {
    month = shiftMonth(month, offset); selected = month + '-01'; render();
  }
  $('calendar-prev').addEventListener('click', () => shift(-1));
  $('calendar-next').addEventListener('click', () => shift(1));
  $('calendar-today').addEventListener('click', () => choose(getToday()));
  $('calendar-due').addEventListener('click', () => choose(timeline.dueDate));
  function error(cause) { $('calendar-error').textContent = cause.message; $('calendar-error').hidden = false; }
  function lookup(date) {
    switchView('month');
    choose(date);
    optionsDialog.close();
    $('calendar-month-title').scrollIntoView({ block: 'nearest' });
    focusDay();
  }
  $('calendar-date-form').addEventListener('submit', event => {
    event.preventDefault(); try { lookup($('calendar-date').value); } catch (cause) { error(cause); }
  });
  $('calendar-ssw-form').addEventListener('submit', event => {
    event.preventDefault(); try { lookup(dateForSsw(timeline, $('calendar-ssw').value)); } catch (cause) { error(cause); }
  });
  $('calendar-month').addEventListener('change', event => {
    try { lookup(monthStart(event.target.value)); } catch (cause) { error(cause); }
  });
  $('calendar-days').addEventListener('keydown', event => {
    if(event.defaultPrevented) return;
    const current = event.target.closest('[data-calendar-date]')?.dataset.calendarDate;
    if (!current) return;
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    try {
      let next;
      if (Object.hasOwn(offsets, event.key)) next = addDays(current, offsets[event.key]);
      else if (event.key === 'Home' || event.key === 'End') {
        const weekday = (new Date(dayNumber(current) * 86400000).getUTCDay() + 6) % 7;
        next = addDays(current, event.key === 'Home' ? -weekday : 6 - weekday);
      } else if (event.key === 'PageUp' || event.key === 'PageDown') next = shiftMonth(current.slice(0, 7), event.key === 'PageUp' ? -1 : 1) + '-01';
      if (next) { event.preventDefault(); choose(next, true); }
    } catch { event.preventDefault(); }
  });

  function eventCard(event, date) {
    const card = node('details', `calendar-event calendar-event-${event.type}`);
    const dates = event.type === 'point' ? shortDate(event.date)
      : `${event.openEnded ? 'Ab ' : ''}${shortDate(event.date)}${event.openEnded ? '' : ` – ${shortDate(event.endDate)}`}`;
    const header = node('summary', 'calendar-event-summary');
    const copy = node('span', 'calendar-event-label');
    const qualifier = event.category === 'optional' ? ' · freiwillig'
      : event.category === 'conditional' ? ' · falls zutreffend' : '';
    copy.append(node('strong', '', event.title), node('span', '', dates + qualifier));
    header.append(copy);
    card.append(header);
    const checked = getChecks()[event.id] === true;
    const category = event.category === 'optional' ? 'Freiwillige Diagnostik'
      : event.category === 'conditional' ? 'Falls zutreffend' : 'Vorsorgefenster';
    const caption = event.type === 'point' ? 'Meilenstein'
      : `${category} · ${event.label}${checked ? ' · Für mich geklärt' : ''}`;
    card.append(node('p', 'calendar-event-date', caption), node('p', '', event.text));
    if (event.source) {
      const source = node('a', 'source-link', 'Quelle zur Vorsorge ↗'); source.href = event.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; card.append(source);
    }
    if (event.extraSource) { const link=node('a','source-link','G-BA · Voraussetzungen und Kassenleistung');link.href=event.extraSource;link.target='_blank';link.rel='noopener noreferrer';card.append(link); }
    if(event.reviewed)card.append(node('p','care-item-meta',`Redaktionell geprüft: ${shortDate(event.reviewed)}`));
    if (event.date !== date && event.date >= getToday()) card.append(button('Im Kalender ansehen', fromDay(() => choose(event.date, true))));
    return card;
  }

  function formatted(text) { const e=node('div','formatted-text'); e.innerHTML=formatText(text);return e; }
  function renderSelected() {
    const age = gestationOnDate(timeline, selected);
    const dayLabel = formatDate(selected, { weekday: 'long', year: undefined });
    const ageLabel = afterBirth(selected) ? `Nach der Geburt · ${dateAge(selected, age)}` : pregnancyAgeLabel(age);
    $('calendar-selected-date').textContent = dayLabel;
    $('calendar-selected-ssw').textContent = ageLabel;
    $('calendar-day-dialog-title').textContent = dayLabel;
    $('calendar-day-dialog-ssw').textContent = ageLabel;
    const dayEvents = eventsOnDate(events, selected);
    const eventList = $('calendar-day-events'); eventList.replaceChildren();
    if(age.status === 'beyond' && !afterBirth(selected)) eventList.append(node('p','calendar-limit-note','Die SSW-Anzeige endet bei 42+0. Falls du noch schwanger bist, kontaktiere dein Geburtsteam und kläre Datierung und weiteres Vorgehen. Eine Geburt wird nicht automatisch eingetragen.'));
    if (!afterBirth(selected) && age.status === 'ongoing' && age.days === 0) eventList.append(node('p', 'calendar-week-start', `Eine neue Woche beginnt: ${age.weekNumber}. SSW (${age.weeks}+0).`));
    for (const event of dayEvents) eventList.append(eventCard(event, selected));
    if (!dayEvents.length) eventList.append(node('p', 'calendar-empty', 'Für diesen Tag ist kein Vorsorgefenster oder Meilenstein hinterlegt.'));
    $('calendar-open-guide').onclick = fromDay(() => showGuide(selected));
    const care = getCare();
    const appointments = care ? appointmentsOnDate(care, selected) : [];
    const apptList = $('calendar-day-appointments'); apptList.replaceChildren();
    for (const appointment of appointments) {
      const card = node('article', 'calendar-appointment-card');
      card.append(node('p', 'eyebrow', PROVIDERS[appointment.provider]), node('h4', '', appointment.title), node('p', '', appointment.time ? `${appointment.time} Uhr${appointment.location ? ' · ' + appointment.location : ''}` : 'Uhrzeit noch offen'));
      const notes = careCollection(care, { appointmentId: appointment.id });
      card.append(node('p', 'care-item-meta', `${notes.length} Notizen · ${notes.filter(note => note.kind === 'qa' && !note.discussed).length} offene Fragen`));
      if (notes.length) {
        const details = document.createElement('details'); details.append(node('summary', '', 'Notizen & Antworten lesen'));
        for (const note of notes) { const block = node('div', 'calendar-appointment-note'); block.append(formatted(note.text)); if (note.answer) block.append(formatted('Antwort:\n' + note.answer)); if (note.nextSteps) block.append(formatted('Nächste Schritte:\n' + note.nextSteps)); block.append(node('p', 'care-item-meta', note.discussed ? 'Besprochen' : 'Noch nicht als besprochen markiert')); details.append(block); }
        card.append(details);
      }
      if (canEdit()) card.append(button('Notiz / Frage ergänzen', fromDay(() => openAppointmentNotes(appointment.id))));
      card.append(button('Terminmappe öffnen', fromDay(() => openAppointment(appointment.id)))); apptList.append(card);
    }
    if (!appointments.length) apptList.append(node('p', 'calendar-empty', care ? 'Kein eigener Termin an diesem Tag.' : 'Termindaten nicht lesbar – bitte den Bereich Vorsorge prüfen.'));
    $('calendar-add-appointment').disabled = !canEdit() || !care;
    $('calendar-add-appointment').onclick = fromDay(() => addAppointment(selected));
    const entries = entriesOnDate(getJournal(), selected);
    const items = [];
    if (appointments.length) {
      const first = appointments[0];
      const label = [first.time ? `${first.time} Uhr` : '', first.title].filter(Boolean).join(' · ');
      items.push(`${label}${appointments.length > 1 ? ` · +${appointments.length - 1}` : ''}`);
    }
    if (entries.length) items.push(`${entries.length} ${entries.length === 1 ? 'Journaleintrag' : 'Journaleinträge'}`);
    if (dayEvents.length) {
      const starting = dayEvents.find(event => event.date === selected);
      const otherCount = dayEvents.length - Number(!!starting);
      if (starting) items.push(starting.title);
      if (otherCount) items.push(`${otherCount} ${starting ? 'weitere ' : ''}${otherCount === 1 ? 'Vorsorgehinweis' : 'Vorsorgehinweise'}`);
    }
    $('calendar-day-preview').replaceChildren(...(items.length ? items : ['Keine Termine oder Einträge']).map(label => node('li', '', label)));
    $('calendar-entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'Journaleintrag' : 'Journaleinträge'}`;
    const list = $('calendar-day-journal'); list.replaceChildren();
    for (const entry of entries) {
      const card = node('article', 'calendar-journal-entry');
      if (isCheckinEntry(entry)) card.append(node('p', 'calendar-entry-time', 'Befinden'));
      if (entry.time) card.append(node('p', 'calendar-entry-time', `${entry.time} Uhr`));
      if (entry.symptoms.length) card.append(node('p', 'calendar-entry-symptoms', entry.symptoms.join(' · ')));
      if (entry.text) card.append(node('p', 'journal-note', entry.text));
      const data = readCheckin(entry);
      if (data) for (const [key, field] of Object.entries(CHECKIN_FIELDS)) {
        if (!data.invalid.includes(key) && !Object.hasOwn(data.values, key)) continue;
        card.append(node('p', 'calendar-entry-metrics', `${field.label}: ${data.invalid.includes(key) ? 'Nicht auswertbar' : checkinValue(key, data.values[key])}`));
      }
      const otherMetrics = entry.metrics.filter(metric => !isCheckinMetric(entry, metric));
      if (otherMetrics.length) card.append(node('p', 'calendar-entry-metrics', otherMetrics.map(m => `${m.label}: ${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(m.value)} ${m.unit}`.trim()).join(' · ')));
      if (entry.tags.length) card.append(node('p', 'calendar-entry-tags', entry.tags.map(tag => '#' + tag).join(' ')));
      if (canEdit()) card.append(button('Eintrag bearbeiten', fromDay(() => editEntry(entry.id))));
      list.append(card);
    }
    if (!entries.length) list.append(node('p', 'calendar-empty', selected > getToday() ? 'Dieser Tag liegt noch vor dir. Persönliche Beobachtungen kannst du bis einschließlich heute erfassen.' : 'Für diesen Tag gibt es noch keinen Journaleintrag.'));
    const add = $('calendar-add-entry');
    add.hidden = selected > getToday(); add.disabled = !canEdit(); add.onclick = fromDay(() => addEntry(selected));
    const measurements = $('calendar-add-measurements');
    measurements.hidden = selected > getToday(); measurements.disabled = !canEdit(); measurements.onclick = fromDay(() => addEntry(selected, 'metrics'));
    $('calendar-open-journal').hidden = !entries.length;
    $('calendar-open-journal').onclick = fromDay(() => showEntries(selected, selected));
  }

  function render() {
    timeline = pregnancyTimeline(getProfile(), getToday()); events = timelineEvents(timeline);
    const birth = birthDate();
    if (birth) events = events.filter(event => event.date < birth).map(event =>
      event.endDate < birth ? event : { ...event, endDate: addDays(birth, -1), openEnded: false });
    const options = symptomOptions(getJournal());
    const previousLabel = $('calendar-symptom').selectedOptions[0]?.textContent || symptom;
    if (symptom && !options.some(option => option.key === symptom)) options.push({ key: symptom, label: previousLabel });
    $('calendar-symptom').replaceChildren();
    const all = document.createElement('option'); all.value = ''; all.textContent = 'Alle erfassten Symptome'; $('calendar-symptom').append(all);
    for (const option of options) { const item = document.createElement('option'); item.value = option.key; item.textContent = option.label; $('calendar-symptom').append(item); }
    $('calendar-symptom').value = symptom; $('calendar-symptom').disabled = !options.length || !showSymptoms;
    $('calendar-basis').textContent = `${getMode() === 'demo' ? 'Beispieldaten' : getMode() === 'shared' ? 'Geteilte Angaben' : 'Deine Angaben'} · ${timeline.method === 'due-date' ? 'ET-Rückrechnung' : 'Periode & Zyklus'} · ET ${shortDate(timeline.dueDate)}`;
    const profile=getProfile();
    $('calendar-dating-explanation').textContent=timeline.method==='due-date'
      ? `Eingetragener ET: ${shortDate(timeline.dueDate)}. 280 Tage zurück ergibt ${shortDate(timeline.start)} als rechnerischen Beginn (0+0).`
      : `Letzte Periode: ${shortDate(profile.lmp)}. Zyklus: ${profile.cycle} Tage. Anpassung gegenüber 28 Tagen: ${profile.cycle-28 > 0 ? '+' : ''}${profile.cycle-28} Tage. Rechnerischer Beginn (0+0): ${shortDate(timeline.start)}. ${profile.cycle<28 ? 'Bei kürzerem Zyklus liegt 0+0 vor dem Periodenbeginn.' : profile.cycle>28 ? 'Bei längerem Zyklus liegt 0+0 nach dem Periodenbeginn.' : 'Bei 28 Tagen entsprechen sich beide Daten.'}`;
    const shifted=timeline.method==='period' && profile.cycle!==28;
    $('calendar-dating-short').hidden=!shifted || ![profile.lmp?.slice(0,7),timeline.start.slice(0,7)].includes(month);
    $('calendar-dating-short').textContent=shifted ? `0+0: ${shortDate(timeline.start)} (rechnerisch) · Periodenbeginn: ${shortDate(profile.lmp)}. Die Differenz folgt deiner Zykluslänge von ${profile.cycle} Tagen.` : '';
    $('calendar-month-title').textContent = formatDate(month + '-01', { day: undefined, month: 'long', year: 'numeric' });
    $('calendar-month').value = month; $('calendar-date').value = selected;
    $('calendar-prev').disabled = month <= '1900-01'; $('calendar-next').disabled = month >= '2200-12';
    const days = $('calendar-days'); days.replaceChildren();
    const today = getToday();
    const careData = getCare(); $('calendar-care-error').hidden = !!careData;
    const entryDates = new Map();
    for (const entry of getJournal()) if (!entry.deletedAt) entryDates.set(entry.date, (entryDates.get(entry.date) || 0) + 1);
    const cells = monthDays(month);
    const lastDay = cells.findLastIndex(date => date.slice(0, 7) === month);
    for (const date of cells.slice(0, Math.ceil((lastDay + 1) / 7) * 7)) {
      const age = gestationOnDate(timeline, date);
      const dayEvents = eventsOnDate(events, date);
      const care = showCare && dayEvents.some(e => e.type === 'care');
      const careStart = dayEvents.some(e => e.type === 'care' && e.date === date);
      const point = dayEvents.some(e => e.type === 'point'); const entries = entryDates.get(date) || 0;
      const labeledEvents = dayEvents.filter(event => event.type === 'point' || event.date === date || showCare);
      const appointments = careData ? appointmentsOnDate(careData, date) : [];
      const mentions = showSymptoms ? symptomMentions(entriesOnDate(getJournal(), date), symptom) : 0;
      const day = button('', () => choose(date, true), 'calendar-day');
      day.dataset.calendarDate = date; day.tabIndex = date === selected ? 0 : -1;
      day.disabled = date.slice(0, 7) < '1900-01' || date.slice(0, 7) > '2200-12';
      day.classList.toggle('other-month', date.slice(0, 7) !== month); day.classList.toggle('selected', date === selected); day.classList.toggle('has-care', care);
      day.classList.toggle('has-symptom', mentions > 0);
      if (date === today) { day.classList.add('is-today'); day.setAttribute('aria-current', 'date'); }
      day.setAttribute('aria-pressed', String(date === selected));
      day.setAttribute('aria-label', `${formatDate(date, { weekday: 'long' })} · ${afterBirth(date) ? 'Nach der Geburt · '+dateAge(date,age) : pregnancyAgeLabel(age)}${date === today ? ' · heute' : ''}${labeledEvents.length ? ' · ' + labeledEvents.map(e => e.title).join(', ') : ''}${entries ? ` · ${entries} ${entries === 1 ? 'Journaleintrag' : 'Journaleinträge'}` : ''}`);
      if (mentions) day.setAttribute('aria-label', day.getAttribute('aria-label') + ` · ${mentions} Beobachtungen ${symptom ? 'zum ausgewählten Symptom' : 'mit Symptomen'}`);
      if (appointments.length) day.setAttribute('aria-label', day.getAttribute('aria-label') + ` · ${appointments.length} eigene Termine: ${appointments.map(item => `${item.time} ${item.title}`).join(', ')}`);
      day.append(node('span', 'calendar-day-number', String(Number(date.slice(8)))), node('span', 'calendar-day-ssw', dateAge(date,age)));
      const markers = node('span', 'calendar-markers'); markers.setAttribute('aria-hidden', 'true');
      if (careStart) markers.append(node('span', 'calendar-mark calendar-mark-care', 'V'));
      if (appointments.length) markers.append(node('span', 'calendar-mark calendar-mark-appointment', appointments.length === 1 ? 'T' : `T${Math.min(appointments.length, 9)}${appointments.length > 9 ? '+' : ''}`));
      if (point) markers.append(node('span', 'calendar-mark calendar-mark-point', '◆'));
      if (entries) markers.append(node('span', 'calendar-mark calendar-mark-journal', entries === 1 ? 'J' : `J${Math.min(entries, 9)}${entries > 9 ? '+' : ''}`));
      if (mentions) markers.append(node('span', 'calendar-mark calendar-mark-symptom', '•'));
      day.append(markers); days.append(day);
    }
    renderSelected();
    reflection.render();
    renderWeek(birth);
    const upcoming = $('calendar-upcoming'); upcoming.replaceChildren();
    $('calendar-upcoming-from').textContent = `Ab ${shortDate(selected)}`;
    for (const event of upcomingEvents(events, selected)) upcoming.append(eventCard(event, selected));
    if (!upcoming.children.length) upcoming.append(node('p', 'calendar-empty', 'Ab diesem Tag sind keine weiteren Meilensteine oder Vorsorgefenster hinterlegt.'));
    switchView(view);
  }

  function renderWeek(birth) {
    const period = getPeriod();
    const picker = $('calendar-week-select');
    const key = `${timeline.start}/${birth || ''}`;
    if (pickerKey !== key) {
      const options = weekRanges(timeline)
        .filter(range => (!birth || range.date < birth) && range.date >= '1900-01-01' && range.date <= '2200-12-31')
        .map(range => {
          const option = node('option', '', `${range.weekNumber}. SSW`);
          option.value = range.date;
          return option;
        });
      picker.replaceChildren(node('option', '', 'Kalenderwoche'), ...options);
      picker.firstElementChild.value = '';
      picker.firstElementChild.disabled = true;
      pickerKey = key;
    }
    picker.value = period.weekNumber ? period.from : '';
    const development = $('calendar-week-info');
    development.hidden = !period.weekNumber;
    development.onclick = () => showWeek(period.weekNumber);
  }
  return { render, showDate: date => { switchView('month'); choose(date, true); } };
}
