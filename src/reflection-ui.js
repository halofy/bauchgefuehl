import { addDays, formatDate } from './dates.js';
import { symptomKey } from './journal.js';
import { weeklySummary, symptomMentions } from './reflection.js';
import { checkinValue } from './checkin.js';

export function setupReflection({ getSelected, getToday, getJournal, getSymptom, getPeriod, chooseDate, openDay, openEntries, dayLabels }) {
  const $ = id => document.getElementById(id);
  const node = (tag, className = '', text = '') => { const e = document.createElement(tag); e.className = className; e.textContent = text; return e; };
  const count = (value, one, many) => `${value} ${value === 1 ? one : many}`;
  const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value);
  const shortDate = date => formatDate(date, { month: 'short' });
  const dateAllowed = date => date >= '1900-01-01' && date <= '2200-12-31';
  const button = (text, callback, className = 'text-link') => { const e = node('button', className, text); e.type = 'button'; e.addEventListener('click', callback); return e; };
  function step(offset) {
    const { from, to } = getPeriod();
    return offset < 0 ? addDays(from, -1) : addDays(to, 1);
  }
  function changeWeek(offset) {
    const date = step(offset);
    if (dateAllowed(date)) chooseDate(date);
  }
  $('reflection-prev').addEventListener('click', () => changeWeek(-1));
  $('reflection-next').addEventListener('click', () => changeWeek(1));
  function render() {
    const period = getPeriod();
    const summary = weeklySummary(getJournal(), getSelected(), getToday(), period);
    const symptom = getSymptom();
    $('reflection-title').textContent = period.weekNumber ? `${period.weekNumber}. Schwangerschaftswoche` : 'Kalenderwoche';
    const sameYear = summary.from.slice(0, 4) === summary.to.slice(0, 4);
    const from = sameYear ? formatDate(summary.from, { month: 'short', year: undefined }) : shortDate(summary.from);
    $('reflection-period').textContent = summary.from === summary.to ? shortDate(summary.to) : `${from} – ${shortDate(summary.to)}`;
    $('personal-reflection-period').textContent = `${$('reflection-title').textContent} · ${$('reflection-period').textContent}`;
    $('reflection-prev').disabled = !dateAllowed(step(-1));
    $('reflection-next').disabled = !dateAllowed(step(1));
    const coverage = summary.entries.length
      ? `${count(summary.entries.length, 'Eintrag', 'Einträge')} an ${count(summary.recordedDays, 'Tag', 'Tagen')}`
      : 'Noch keine Einträge';
    const gaps = summary.entries.length && summary.missingDays
      ? count(summary.missingDays, 'Tag ohne Eintrag', 'Tage ohne Eintrag') : '';
    const future = summary.futureDays ? `${count(summary.futureDays, 'Tag liegt', 'Tage liegen')} noch vor dir` : '';
    $('reflection-coverage').textContent = [coverage, gaps, future].filter(Boolean).join(' · ');
    const days = $('reflection-days'); days.replaceChildren();
    for (const day of summary.days) {
      const matches = symptomMentions(day.entries, symptom);
      const item = button('', () => openDay(day.date), `reflection-day reflection-${day.state}${matches ? ' has-symptom' : ''}`);
      item.dataset.calendarDate = day.date;
      item.classList.toggle('selected', day.date === getSelected());
      item.setAttribute('aria-pressed', String(day.date === getSelected()));
      item.disabled = !dateAllowed(day.date);
      item.append(node('span', '', formatDate(day.date, { weekday: 'short', day: undefined, month: undefined, year: undefined })));
      item.append(node('strong', 'reflection-day-date', String(Number(day.date.slice(-2)))));
      const state = day.state === 'future' ? 'Zukünftig' : day.state === 'missing' ? 'Kein Eintrag' : count(day.entries.length, 'Eintrag', 'Einträge');
      const labels = dayLabels(day.date);
      item.append(node('span', 'reflection-day-count', day.entries.length ? String(day.entries.length) : '–'));
      if (labels.length) {
        const markers = node('span', 'reflection-day-events'); markers.setAttribute('aria-hidden', 'true');
        for (const mark of new Map(labels.map(mark => [mark.type, mark])).values()) markers.append(node('span', `calendar-mark calendar-mark-${mark.type}`, mark.marker));
        item.append(markers);
      }
      item.setAttribute('aria-label', `${formatDate(day.date, { weekday: 'long' })}: ${[state, ...labels.map(mark => mark.label)].join(' · ')}${matches ? `, ${matches} Beobachtungen ${symptom ? 'zum gewählten Symptom' : 'mit Symptomen'}` : ''}. Tagesdetails öffnen.`);
      days.append(item);
    }
    $('reflection-open-entries').hidden = !summary.entries.length;
    $('reflection-open-entries').onclick = () => openEntries(summary.from, summary.to, '');
    const checkins = summary.checkins;
    $('reflection-checkin-panel').hidden = !checkins.count;
    $('reflection-checkin-title').textContent = `Befinden · ${count(checkins.count, 'Eintrag', 'Einträge')}`;
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
    if (!selected.length) symptoms.append(node('p', 'calendar-empty', symptom ? 'Für das gewählte Symptom gibt es in dieser Woche keine Nennung.' : 'Keine Symptome eingetragen.'));
    const metrics = $('reflection-metrics'); metrics.replaceChildren();
    for (const item of summary.metrics) {
      const card = node('article', 'reflection-metric');
      const value = point => `${number(point.value)} ${item.unit}`.trim();
      card.append(node('h5', '', item.label), node('strong', '', value(item.last)));
      card.append(node('p', '', `${count(item.count, 'Messung', 'Messungen')} · zuletzt ${shortDate(item.last.date)}${item.last.time ? ', ' + item.last.time : ''}`));
      if (item.count > 1) card.append(node('p', '', `Erster Wert: ${value(item.first)} · Spanne: ${number(item.min)}–${number(item.max)} ${item.unit}`.trim()));
      metrics.append(card);
    }
    if (!summary.metrics.length) metrics.append(node('p', 'calendar-empty', 'Keine Messwerte erfasst.'));
  }
  return { render };
}
