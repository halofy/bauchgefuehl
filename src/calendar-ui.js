import { todayISO, addDays, dayNumber, formatDate } from './dates.js';
import { pregnancyTimeline, gestationOnDate, dateForSsw, monthStart, shiftMonth, monthDays, timelineEvents, eventsOnDate, entriesOnDate, upcomingEvents, weekRanges } from './calendar.js';
import { symptomOptions } from './journal.js';
import { symptomMentions } from './reflection.js';
import { setupReflection } from './reflection-ui.js';

export function setupCalendar({ getProfile, getToday = todayISO, getMode, getJournal, getChecks, canEdit, addEntry, editEntry, showEntries, showEntriesRange, showWeek, showGuide }) {
  const $ = id => document.getElementById(id);
  const node = (tag, className = '', text = '') => { const element = document.createElement(tag); element.className = className; element.textContent = text; return element; };
  let selected = getToday();
  let month = selected.slice(0, 7);
  let view = 'calendar';
  let timeline;
  let events = [];
  let symptom = '';
  const ssw = age => age.status === 'before' ? 'Vor Beginn' : `${age.weeks}+${age.days}`;
  const shortDate = date => formatDate(date, { month: 'short' });
  const button = (label, callback, className = 'text-link') => {
    const element = node('button', className, label); element.type = 'button'; element.addEventListener('click', callback); return element;
  };
  function switchView(next) {
    view = next;
    $('calendar-view').hidden = next !== 'calendar'; $('journal-list-view').hidden = next !== 'journal';
    for (const name of ['calendar', 'journal']) {
      const toggle = $(name + '-view-toggle'); toggle.setAttribute('aria-pressed', String(name === next)); toggle.classList.toggle('selected', name === next);
    }
  }
  function openList() {
    switchView('journal');
    $('journal-list-view').scrollIntoView({ behavior: 'instant', block: 'start' });
    $('journal-filter-panel').querySelector('summary').focus({ preventScroll: true });
  }
  $('calendar-view-toggle').addEventListener('click', () => switchView('calendar'));
  $('journal-view-toggle').addEventListener('click', () => switchView('journal'));
  $('calendar-symptom').addEventListener('change', event => { symptom = event.target.value; render(); });
  const reflection = setupReflection({
    getSelected: () => selected, getToday, getJournal, getSymptom: () => symptom,
    chooseDate: date => choose(date, true),
    openEntries(from, to, selectedSymptom) { showEntriesRange(from, to, selectedSymptom); openList(); },
  });
  function choose(date, focus = false) {
    dayNumber(date); monthStart(date.slice(0, 7));
    selected = date; month = date.slice(0, 7); $('calendar-error').hidden = true;
    switchView('calendar'); render();
    if (focus) document.querySelector(`[data-calendar-date="${selected}"]`)?.focus({ preventScroll: true });
  }
  function shift(offset) {
    month = shiftMonth(month, offset); selected = month + '-01'; render();
  }
  $('calendar-prev').addEventListener('click', () => shift(-1));
  $('calendar-next').addEventListener('click', () => shift(1));
  $('calendar-today').addEventListener('click', () => choose(getToday()));
  $('calendar-due').addEventListener('click', () => choose(timeline.dueDate));
  function error(cause) { $('calendar-error').textContent = cause.message; $('calendar-error').hidden = false; }
  function lookup(date) {
    choose(date);
    $('calendar-lookup-panel').open = false;
    document.querySelector(`[data-calendar-date="${selected}"]`)?.focus({ preventScroll: true });
  }
  $('calendar-date-form').addEventListener('submit', event => {
    event.preventDefault(); try { lookup($('calendar-date').value); } catch (cause) { error(cause); }
  });
  $('calendar-ssw-form').addEventListener('submit', event => {
    event.preventDefault(); try { lookup(dateForSsw(timeline, $('calendar-ssw').value)); } catch (cause) { error(cause); }
  });
  $('calendar-month').addEventListener('change', event => {
    try { choose(monthStart(event.target.value)); } catch (cause) { error(cause); }
  });
  $('calendar-days').addEventListener('keydown', event => {
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
    const card = node('article', `calendar-event calendar-event-${event.type}`);
    const checked = getChecks()[event.id] === true;
    card.append(node('p', 'eyebrow', event.type === 'care' ? `VORSORGEFENSTER${checked ? ' · FÜR MICH GEKLÄRT' : ''}` : 'MEILENSTEIN'));
    card.append(node('h4', '', event.title));
    const dates = event.type === 'point' ? `${shortDate(event.date)} · ${ssw(gestationOnDate(timeline, event.date))}`
      : `${event.openEnded ? 'Ab ' : ''}${shortDate(event.date)}${event.openEnded ? '' : ` – ${shortDate(event.endDate)}`} · ${event.label}`;
    card.append(node('p', 'calendar-event-date', dates), node('p', '', event.text));
    if (event.source) {
      const source = node('a', 'source-link', 'Quelle zur Vorsorge ↗'); source.href = event.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; card.append(source);
    }
    if (event.date !== date && event.date >= getToday()) card.append(button('Im Kalender ansehen', () => choose(event.date, true)));
    return card;
  }

  function renderSelected() {
    const age = gestationOnDate(timeline, selected);
    $('calendar-selected-date').textContent = formatDate(selected, { weekday: 'long' });
    $('calendar-selected-ssw').textContent = age.status === 'before' ? 'Vor dem rechnerischen Schwangerschaftsbeginn' : `${ssw(age)} · ${age.weekNumber}. SSW${age.status === 'beyond' ? ' · außerhalb der Wocheninfos' : ''}`;
    const dayEvents = eventsOnDate(events, selected);
    const eventList = $('calendar-day-events'); eventList.replaceChildren();
    if (age.status === 'ongoing' && age.days === 0) eventList.append(node('p', 'calendar-week-start', `Eine neue Woche beginnt: ${age.weekNumber}. SSW (${age.weeks}+0).`));
    for (const event of dayEvents) eventList.append(eventCard(event, selected));
    if (!dayEvents.length) eventList.append(node('p', 'calendar-empty', 'Für diesen Tag ist kein Vorsorgefenster oder Meilenstein hinterlegt.'));
    $('calendar-week-info').hidden = age.status !== 'ongoing';
    $('calendar-week-info').onclick = () => showWeek(age.weekNumber);
    $('calendar-open-guide').onclick = () => showGuide(selected);
    const entries = entriesOnDate(getJournal(), selected);
    $('calendar-entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'Journaleintrag' : 'Journaleinträge'}`;
    const list = $('calendar-day-journal'); list.replaceChildren();
    for (const entry of entries) {
      const card = node('article', 'calendar-journal-entry');
      if (entry.time) card.append(node('p', 'calendar-entry-time', `${entry.time} Uhr`));
      if (entry.symptoms.length) card.append(node('p', 'calendar-entry-symptoms', entry.symptoms.join(' · ')));
      if (entry.text) card.append(node('p', 'journal-note', entry.text));
      if (entry.metrics.length) card.append(node('p', 'calendar-entry-metrics', entry.metrics.map(m => `${m.label}: ${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(m.value)} ${m.unit}`.trim()).join(' · ')));
      if (entry.tags.length) card.append(node('p', 'calendar-entry-tags', entry.tags.map(tag => '#' + tag).join(' ')));
      if (canEdit()) card.append(button('Eintrag bearbeiten', () => editEntry(entry.id)));
      list.append(card);
    }
    if (!entries.length) list.append(node('p', 'calendar-empty', selected > getToday() ? 'Dieser Tag liegt noch vor dir. Persönliche Beobachtungen kannst du bis einschließlich heute erfassen.' : 'Für diesen Tag gibt es noch keinen Journaleintrag.'));
    const add = $('calendar-add-entry');
    add.hidden = selected > getToday(); add.disabled = !canEdit(); add.onclick = () => addEntry(selected);
    $('calendar-open-journal').hidden = !entries.length;
    $('calendar-open-journal').onclick = () => { showEntries(selected); openList(); };
  }

  function render() {
    timeline = pregnancyTimeline(getProfile(), getToday()); events = timelineEvents(timeline);
    const options = symptomOptions(getJournal());
    const previousLabel = $('calendar-symptom').selectedOptions[0]?.textContent || symptom;
    if (symptom && !options.some(option => option.key === symptom)) options.push({ key: symptom, label: previousLabel });
    $('calendar-symptom').replaceChildren();
    const all = document.createElement('option'); all.value = ''; all.textContent = 'Alle erfassten Symptome'; $('calendar-symptom').append(all);
    for (const option of options) { const item = document.createElement('option'); item.value = option.key; item.textContent = option.label; $('calendar-symptom').append(item); }
    $('calendar-symptom').value = symptom; $('calendar-symptom').disabled = !options.length;
    $('calendar-basis').textContent = `${getMode() === 'demo' ? 'Beispieldaten' : getMode() === 'shared' ? 'Geteilte Angaben' : 'Deine Angaben'} · ${timeline.method === 'due-date' ? 'ET-Rückrechnung' : 'Periode & Zyklus'} · ET ${shortDate(timeline.dueDate)}`;
    $('calendar-month-title').textContent = formatDate(month + '-01', { day: undefined, month: 'long', year: 'numeric' });
    $('calendar-month').value = month; $('calendar-date').value = selected;
    $('calendar-prev').disabled = month <= '1900-01'; $('calendar-next').disabled = month >= '2200-12';
    const days = $('calendar-days'); days.replaceChildren();
    const today = getToday();
    const entryDates = new Map();
    for (const entry of getJournal()) if (!entry.deletedAt) entryDates.set(entry.date, (entryDates.get(entry.date) || 0) + 1);
    for (const date of monthDays(month)) {
      const age = gestationOnDate(timeline, date);
      const dayEvents = eventsOnDate(events, date);
      const care = dayEvents.some(e => e.type === 'care'); const point = dayEvents.some(e => e.type === 'point'); const entries = entryDates.get(date) || 0;
      const mentions = symptomMentions(entriesOnDate(getJournal(), date), symptom);
      const day = button('', () => choose(date, true), 'calendar-day');
      day.dataset.calendarDate = date; day.tabIndex = date === selected ? 0 : -1;
      day.disabled = date.slice(0, 7) < '1900-01' || date.slice(0, 7) > '2200-12';
      day.classList.toggle('other-month', date.slice(0, 7) !== month); day.classList.toggle('selected', date === selected); day.classList.toggle('has-care', care);
      day.classList.toggle('has-symptom', mentions > 0);
      if (date === today) { day.classList.add('is-today'); day.setAttribute('aria-current', 'date'); }
      day.setAttribute('aria-pressed', String(date === selected));
      day.setAttribute('aria-label', `${formatDate(date, { weekday: 'long' })} · ${age.status === 'before' ? 'vor rechnerischem Beginn' : `SSW ${ssw(age)}, ${age.weekNumber}. Schwangerschaftswoche`}${date === today ? ' · heute' : ''}${dayEvents.length ? ' · ' + dayEvents.map(e => e.title).join(', ') : ''}${entries ? ` · ${entries} ${entries === 1 ? 'Journaleintrag' : 'Journaleinträge'}` : ''}`);
      if (mentions) day.setAttribute('aria-label', day.getAttribute('aria-label') + ` · ${mentions} Beobachtungen ${symptom ? 'zum ausgewählten Symptom' : 'mit Symptomen'}`);
      day.append(node('span', 'calendar-day-number', String(Number(date.slice(8)))), node('span', 'calendar-day-ssw', age.status === 'before' ? '–' : ssw(age)));
      const markers = node('span', 'calendar-markers'); markers.setAttribute('aria-hidden', 'true');
      if (care) markers.append(node('span', 'calendar-mark calendar-mark-care', '–'));
      if (point) markers.append(node('span', 'calendar-mark calendar-mark-point', '◆'));
      if (entries) markers.append(node('span', 'calendar-mark calendar-mark-journal', String(entries)));
      if (mentions) markers.append(node('span', 'calendar-mark calendar-mark-symptom', '•'));
      day.append(markers); days.append(day);
    }
    renderSelected();
    reflection.render();
    const upcoming = $('calendar-upcoming'); upcoming.replaceChildren();
    for (const event of upcomingEvents(events, selected)) upcoming.append(eventCard(event, ''));
    if (!upcoming.children.length) upcoming.append(node('p', 'calendar-empty', 'Ab diesem Tag sind keine weiteren Meilensteine oder Vorsorgefenster hinterlegt.'));
    const weeks = $('calendar-weeks'); weeks.replaceChildren();
    for (const range of weekRanges(timeline)) {
      const item = button('', () => choose(range.date, true), 'calendar-week-row');
      item.append(node('strong', '', `${range.weekNumber}. SSW`), node('span', '', range.ssw), node('span', '', `${shortDate(range.date)} – ${shortDate(range.endDate)}`)); weeks.append(item);
    }
    switchView(view);
  }
  return { render, showJournal: () => switchView('journal'), showDate: date => choose(date, true) };
}
