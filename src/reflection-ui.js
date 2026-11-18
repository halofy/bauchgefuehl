import { addDays, formatDate } from './dates.js';
import { symptomKey } from './journal.js';
import { weeklySummary, symptomMentions } from './reflection.js';
import { checkinValue } from './checkin.js';

export function setupReflection({ getSelected, getToday, getJournal, getSymptom, chooseDate, openEntries }) {
  const $ = id => document.getElementById(id);
  const node = (tag, className = '', text = '') => { const e = document.createElement(tag); e.className = className; e.textContent = text; return e; };
  const count = (value, one, many) => `${value} ${value === 1 ? one : many}`;
  const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value);
  const shortDate = date => formatDate(date, { month: 'short' });
  const dateAllowed = date => date >= '1900-01-01' && date <= '2200-12-31';
  const button = (text, callback, className = 'text-link') => { const e = node('button', className, text); e.type = 'button'; e.addEventListener('click', callback); return e; };
  function changeWeek(offset) {
    const date = addDays(getSelected(), offset);
    if (dateAllowed(date)) chooseDate(date);
  }
  $('reflection-prev').addEventListener('click', () => changeWeek(-7));
  $('reflection-next').addEventListener('click', () => changeWeek(7));
  function render() {
    const summary = weeklySummary(getJournal(), getSelected(), getToday());
    const symptom = getSymptom();
    $('reflection-title').textContent = `${shortDate(summary.from)} – ${shortDate(summary.to)}`;
    $('reflection-prev').disabled = !dateAllowed(addDays(getSelected(), -7));
    $('reflection-next').disabled = !dateAllowed(addDays(getSelected(), 7));
    $('reflection-coverage').textContent = `${count(summary.entries.length, 'Journaleintrag', 'Journaleinträge')} an ${count(summary.recordedDays, 'Tag', 'Tagen')} · ${count(summary.missingDays, 'verstrichener Tag ohne Eintrag', 'verstrichene Tage ohne Eintrag')}${summary.futureDays ? ` · ${count(summary.futureDays, 'Tag liegt', 'Tage liegen')} noch vor dir` : ''}.`;
    const days = $('reflection-days'); days.replaceChildren();
    for (const day of summary.days) {
      const matches = symptomMentions(day.entries, symptom);
      const item = button('', () => chooseDate(day.date), `reflection-day reflection-${day.state}${matches ? ' has-symptom' : ''}`);
      item.classList.toggle('selected', day.date === getSelected());
      item.setAttribute('aria-pressed', String(day.date === getSelected()));
      item.disabled = !dateAllowed(day.date);
      const title = formatDate(day.date, { weekday: 'short', month: 'short', year: undefined });
      item.append(node('span', 'reflection-day-date', title));
      const state = day.state === 'future' ? 'Zukünftig' : day.state === 'missing' ? 'Kein Eintrag' : count(day.entries.length, 'Eintrag', 'Einträge');
      item.append(node('strong', '', state));
      if (day.state === 'recorded') item.append(node('span', '', matches ? count(matches, symptom ? 'Nennung' : 'Eintrag mit Symptom', symptom ? 'Nennungen' : 'Einträge mit Symptomen') : symptom ? 'Nicht genannt' : 'Keine Symptome angegeben'));
      item.setAttribute('aria-label', `${formatDate(day.date, { weekday: 'long' })}: ${state}${matches ? `, ${matches} Beobachtungen ${symptom ? 'zum gewählten Symptom' : 'mit Symptomen'}` : ''}. Tag im Kalender öffnen.`);
      days.append(item);
    }
    $('reflection-open-entries').disabled = !summary.entries.length;
    $('reflection-open-entries').onclick = () => openEntries(summary.from, summary.to, '');
    const checkins = summary.checkins;
    $('reflection-checkin-coverage').textContent = `${count(checkins.count, 'Check-in', 'Check-ins')} an ${count(checkins.dayCount, 'Tag', 'Tagen')} · ${count(checkins.missingDays, 'verstrichener Tag ohne Check-in', 'verstrichene Tage ohne Check-in')}${checkins.futureDays ? ` · ${checkins.futureDays} Tage liegen noch vor dir` : ''}. Leere Felder bleiben fehlend. Schlafangaben können sich auf überlappende 24 Stunden beziehen; sie werden nicht addiert. Die Symptomauswahl ändert diese Übersicht nicht.`;
    const checkinList = $('reflection-checkins'); checkinList.replaceChildren();
    for (const field of checkins.fields) {
      const card = node('article', 'reflection-checkin');
      card.append(node('h5', '', field.label));
      card.append(node('strong', '', field.last ? checkinValue(field.key, field.last.value) : 'Keine Angabe'));
      if (field.last) card.append(node('p', '', `Zuletzt ${shortDate(field.last.date)}${field.last.time ? ', ' + field.last.time + ' Uhr' : ''} · ${count(field.count, 'Angabe', 'Angaben')} an ${count(field.dayCount, 'Tag', 'Tagen')}`));
      card.append(node('p', '', `${field.missing} von ${checkins.count} Check-ins ohne diese Angabe${field.invalid ? ` · ${field.invalid} nicht auswertbar` : ''}.`));
      if (field.count > 1) card.append(node('p', '', `Erste Angabe: ${checkinValue(field.key, field.first.value)}. Jede Beobachtung bleibt im Original erhalten.`));
      checkinList.append(card);
    }
    $('reflection-open-checkins').disabled = !checkins.count;
    $('reflection-open-checkins').onclick = () => openEntries(summary.from, summary.to, '', 'checkin');
    const symptoms = $('reflection-symptoms'); symptoms.replaceChildren();
    const selected = summary.symptoms.filter(item => !symptom || item.key === symptomKey(symptom));
    for (const item of selected) {
      const row = button('', () => openEntries(summary.from, summary.to, item.key), 'reflection-symptom-row');
      row.append(node('strong', '', item.label), node('span', '', `${count(item.count, 'Beobachtung', 'Beobachtungen')} an ${count(item.dayCount, 'Tag', 'Tagen')}`), node('span', 'reflection-source', 'Originaleinträge ansehen ↗')); symptoms.append(row);
    }
    if (!selected.length) symptoms.append(node('p', 'calendar-empty', symptom ? 'Für das gewählte Symptom gibt es in dieser Woche keine Nennung.' : 'Für diese Woche sind keine Symptome eingetragen.'));
    const metrics = $('reflection-metrics'); metrics.replaceChildren();
    for (const item of summary.metrics) {
      const card = node('article', 'reflection-metric');
      const value = point => `${number(point.value)} ${item.unit}`.trim();
      card.append(node('h5', '', item.label), node('strong', '', value(item.last)));
      card.append(node('p', '', `${count(item.count, 'Messung', 'Messungen')} · zuletzt ${shortDate(item.last.date)}${item.last.time ? ', ' + item.last.time : ''}`));
      if (item.count > 1) card.append(node('p', '', `Erster Wert: ${value(item.first)} · Spanne: ${number(item.min)}–${number(item.max)} ${item.unit}`.trim()));
      metrics.append(card);
    }
    if (!summary.metrics.length) metrics.append(node('p', 'calendar-empty', 'In dieser Woche sind keine Messwerte erfasst.'));
  }
  return { render };
}
