import { todayISO, addDays, formatDate } from './dates.js';
import { REPORT_FIELDS, projectReport, reportBody, reportDocument, reportItemCount } from './report.js';
import { normalizeCare } from './care.js';

export function setupReport({ getJournal, getCare = normalizeCare, getToday = todayISO, notify }) {
  const $ = id => document.getElementById(id);
  let excluded = new Set();
  let current;
  const fields = () => [...$('report-fields').querySelectorAll('input:checked')].map(input => input.value);
  function options() {
    const selected = fields(); const care = getCare();
    if (!care && selected.some(key => ['careNotes', 'appointments'].includes(key))) throw new Error('Termindaten sind nicht lesbar. Bitte zuerst ein vollständiges Backup sichern.');
    return { from: $('report-from').value, to: $('report-to').value, fields: selected, excluded: [...excluded], care: care || normalizeCare() };
  }
  function refresh() {
    try {
      const opts = options();
      current = projectReport(getJournal(), opts);
      $('report-error').hidden = true;
      $('report-preview').innerHTML = reportBody(current);
      $('report-summary').textContent = `${reportItemCount(current)} Einträge · ${current.fields.length} ausgewählte Bereiche. Zeitraum gilt für Journal-/Notizdatum und für Termindatum. Zugeordnete Termindaten können bei gewählten Terminnotizen außerhalb liegen. Keine Basisdaten, SSW, Merkhäkchen oder Schlüssel.`;
      $('report-download').disabled = !reportItemCount(current);
      const list = $('report-entry-selection');
      const focusedId = document.activeElement?.dataset.reportEntry;
      list.replaceChildren();
      // Only list entries that actually contribute to the chosen fields.
      const journalFields = opts.fields.filter(key => !['careNotes', 'appointments'].includes(key));
      const candidates = getJournal().filter(entry => !entry.deletedAt && projectReport([entry], { ...opts, fields: journalFields, care: undefined, excluded: [] }).entries.length);
      for (const entry of candidates) {
        const label = document.createElement('label'); label.className = 'checkbox-label report-entry-option';
        const check = document.createElement('input'); check.type = 'checkbox'; check.checked = !excluded.has(entry.id); check.dataset.reportEntry = entry.id;
        const text = document.createElement('span'); text.textContent = `${formatDate(entry.date)}${entry.time ? ', ' + entry.time : ''} · ${journalFields.filter(key => projectReport([entry], { ...opts, fields: [key], excluded: [] }).entries.length).map(key => REPORT_FIELDS[key]).join(', ')}`;
        check.addEventListener('change', () => { if (check.checked) excluded.delete(entry.id); else excluded.add(entry.id); refresh(); });
        label.append(check, text); list.append(label);
      }
      let careCount = 0;
      for (const [type, key, prefix] of [['notes', 'careNotes', 'care-note:'], ['appointments', 'appointments', 'care-appointment:']]) {
        if (!opts.fields.includes(key)) continue;
        const linked = new Set(opts.fields.includes('careNotes') ? opts.care.notes.filter(item => !item.deletedAt && item.date >= opts.from && item.date <= opts.to).map(item => item.appointmentId) : []);
        for (const entry of opts.care[type].filter(item => ((!item.deletedAt && item.date >= opts.from && item.date <= opts.to) || (type === 'appointments' && linked.has(item.id))))) {
          careCount++;
          const label = document.createElement('label'); label.className = 'checkbox-label report-entry-option';
          const check = document.createElement('input'); check.type = 'checkbox'; check.checked = !excluded.has(prefix + entry.id); check.dataset.reportEntry = prefix + entry.id;
          const text = document.createElement('span'); text.textContent = `${formatDate(entry.date)} · ${REPORT_FIELDS[key]} · ${(entry.title || entry.text).slice(0, 100)}`;
          check.addEventListener('change', () => { if (check.checked) excluded.delete(prefix + entry.id); else excluded.add(prefix + entry.id); refresh(); });
          label.append(check, text); list.append(label);
        }
      }
      if (focusedId) [...list.querySelectorAll('input')].find(input => input.dataset.reportEntry === focusedId)?.focus({ preventScroll: true });
      if (!candidates.length && !careCount) { const text = document.createElement('p'); text.className = 'field-hint'; text.textContent = 'Bereiche und Zeitraum wählen, um passende Einträge einzeln auszuschließen.'; list.append(text); }
    } catch (cause) {
      current = null; $('report-preview').replaceChildren(); $('report-entry-selection').replaceChildren();
      $('report-summary').textContent = 'Keine gültige Vorschau.'; $('report-download').disabled = true;
      $('report-error').textContent = cause.message; $('report-error').hidden = false;
    }
  }
  function open() {
    // Safari can leave a second modal outside its accessibility tree. Switch dialogs instead of stacking them.
    for (const id of ['share-dialog', 'sync-dialog']) if ($(id)?.open) $(id).close();
    excluded = new Set();
    $('report-from').value = addDays(getToday(), -27); $('report-to').value = getToday();
    for (const input of $('report-fields').querySelectorAll('input')) input.checked = false;
    $('report-entry-panel').open = false; refresh(); $('report-dialog').showModal();
  }
  $('report-fields').addEventListener('change', refresh);
  for (const id of ['report-from', 'report-to']) $(id).addEventListener('change', () => { excluded = new Set(); refresh(); });
  $('report-download').addEventListener('click', () => {
    refresh(); if (!current || !reportItemCount(current)) return;
    const url = URL.createObjectURL(new Blob([reportDocument(current)], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `bauchgefuehl-auszug-${getToday()}.html`; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Auszug lokal erstellt. Du kannst die HTML-Datei öffnen, drucken oder im Druckdialog als PDF speichern und selbst weitergeben.');
  });
  return { open, refreshIfOpen() { if ($('report-dialog').open) refresh(); } };
}
