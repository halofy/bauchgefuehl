import { todayISO, addDays, formatDate } from './dates.js';
import { REPORT_FIELDS, projectReport, reportBody, reportDocument } from './report.js';

export function setupReport({ getJournal, getToday = todayISO, notify }) {
  const $ = id => document.getElementById(id);
  let excluded = new Set();
  let current;
  const fields = () => [...$('report-fields').querySelectorAll('input:checked')].map(input => input.value);
  function options() { return { from: $('report-from').value, to: $('report-to').value, fields: fields(), excluded: [...excluded] }; }
  function refresh() {
    try {
      const opts = options();
      current = projectReport(getJournal(), opts);
      $('report-error').hidden = true;
      $('report-preview').innerHTML = reportBody(current);
      $('report-summary').textContent = `${current.entries.length} ${current.entries.length === 1 ? 'Eintrag' : 'Einträge'} · ${current.fields.length} ${current.fields.length === 1 ? 'ausgewählter Bereich' : 'ausgewählte Bereiche'}. Datumsangaben sind bei enthaltenen Einträgen immer sichtbar. Keine Basisdaten, SSW, Merkhäkchen oder Schlüssel.`;
      $('report-download').disabled = !current.entries.length;
      const list = $('report-entry-selection');
      const focusedId = document.activeElement?.dataset.reportEntry;
      list.replaceChildren();
      // Only list entries that actually contribute to the chosen fields.
      const candidates = getJournal().filter(entry => !entry.deletedAt && projectReport([entry], { ...opts, excluded: [] }).entries.length);
      for (const entry of candidates) {
        const label = document.createElement('label'); label.className = 'checkbox-label report-entry-option';
        const check = document.createElement('input'); check.type = 'checkbox'; check.checked = !excluded.has(entry.id); check.dataset.reportEntry = entry.id;
        const text = document.createElement('span'); text.textContent = `${formatDate(entry.date)}${entry.time ? ', ' + entry.time : ''} · ${fields().filter(key => key === 'time' ? entry.time : key === 'text' ? entry.text : entry[key]?.length).map(key => REPORT_FIELDS[key]).join(', ')}`;
        check.addEventListener('change', () => { if (check.checked) excluded.delete(entry.id); else excluded.add(entry.id); refresh(); });
        label.append(check, text); list.append(label);
      }
      if (focusedId) [...list.querySelectorAll('input')].find(input => input.dataset.reportEntry === focusedId)?.focus({ preventScroll: true });
      if (!candidates.length) { const text = document.createElement('p'); text.className = 'field-hint'; text.textContent = 'Bereiche und Zeitraum wählen, um passende Einträge einzeln auszuschließen.'; list.append(text); }
    } catch (cause) {
      current = null; $('report-preview').replaceChildren(); $('report-entry-selection').replaceChildren();
      $('report-summary').textContent = 'Keine gültige Vorschau.'; $('report-download').disabled = true;
      $('report-error').textContent = cause.message; $('report-error').hidden = false;
    }
  }
  function open() {
    // Safari can leave a second modal outside its accessibility tree. Switch dialogs instead of stacking them.
    for (const id of ['share-dialog', 'sync-dialog']) if ($(id).open) $(id).close();
    excluded = new Set();
    $('report-from').value = addDays(getToday(), -27); $('report-to').value = getToday();
    for (const input of $('report-fields').querySelectorAll('input')) input.checked = false;
    $('report-entry-panel').open = false; refresh(); $('report-dialog').showModal();
  }
  $('report-fields').addEventListener('change', refresh);
  for (const id of ['report-from', 'report-to']) $(id).addEventListener('change', () => { excluded = new Set(); refresh(); });
  $('report-download').addEventListener('click', () => {
    refresh(); if (!current?.entries.length) return;
    const url = URL.createObjectURL(new Blob([reportDocument(current)], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `bauchgefuehl-auszug-${getToday()}.html`; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Auszug lokal erstellt. Du kannst die HTML-Datei öffnen, drucken oder im Druckdialog als PDF speichern und selbst weitergeben.');
  });
  return { open, refreshIfOpen() { if ($('report-dialog').open) refresh(); } };
}
