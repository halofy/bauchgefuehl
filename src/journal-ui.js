import { METRICS, SYMPTOMS, parseLabels, parseMeasurement, normalizeMetric, upsertEntry, archiveEntry, filterEntries, metricKey, metricSeries, journalCsv } from './journal.js';
import { todayISO, formatDate, dayNumber } from './dates.js';

export function setupJournal({ getJournal, canEdit, saveJournal, onSetup, notify, weekOnDate }) {
  const $ = selector => document.querySelector(selector);
  const node = (tag, className = '', text = '') => { const e = document.createElement(tag); e.className = className; e.textContent = text; return e; };
  const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value);
  let editing = null;
  let rows = [];
  let dirty = false;
  let filtered = [];

  function refreshSymptoms() {
    const selected = parseLabels($('#entry-symptoms').value).map(s => s.toLocaleLowerCase('de'));
    for (const button of $('#symptom-suggestions').children) {
      const active = selected.includes(button.textContent.toLocaleLowerCase('de'));
      button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active));
    }
  }
  for (const label of SYMPTOMS) {
    const button = node('button', 'symptom-chip', label); button.type = 'button'; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const selected = parseLabels($('#entry-symptoms').value);
      const key = label.toLocaleLowerCase('de');
      $('#entry-symptoms').value = selected.some(s => s.toLocaleLowerCase('de') === key) ? selected.filter(s => s.toLocaleLowerCase('de') !== key).join(', ') : [...selected, label].join(', ');
      dirty = true; refreshSymptoms();
    });
    $('#symptom-suggestions').append(button);
  }
  function addMetric(metric = null, kind = 'weight') {
    if (rows.length >= 12) { notify('Maximal zwölf Messwerte pro Eintrag.'); return; }
    const row = node('div', 'metric-input-row');
    const selectLabel = node('label', 'metric-kind-label', 'Messgröße');
    const select = document.createElement('select');
    for (const [id, definition] of Object.entries(METRICS)) {
      const option = document.createElement('option'); option.value = id; option.textContent = `${definition.label} (${definition.unit})`; select.append(option);
    }
    const custom = document.createElement('option'); custom.value = 'custom'; custom.textContent = 'Eigener Messwert'; select.append(custom);
    select.value = metric?.kind || kind; selectLabel.append(select);
    const customFields = node('div', 'custom-metric-fields');
    const nameLabel = node('label', '', 'Bezeichnung'); const name = document.createElement('input'); name.type = 'text'; name.maxLength = 50; name.placeholder = 'z. B. Schlafdauer'; name.value = metric?.kind === 'custom' ? metric.label : ''; nameLabel.append(name);
    const unitLabel = node('label', '', 'Einheit'); const unit = document.createElement('input'); unit.type = 'text'; unit.maxLength = 16; unit.placeholder = 'z. B. h'; unit.value = metric?.kind === 'custom' ? metric.unit : ''; unitLabel.append(unit); customFields.append(nameLabel, unitLabel);
    const valueLabel = node('label', 'metric-value-label', 'Wert'); const value = document.createElement('input'); value.type = 'text'; value.inputMode = 'decimal'; value.placeholder = 'z. B. 65,5'; value.value = metric ? String(metric.value).replace('.', ',') : ''; valueLabel.append(value);
    const remove = node('button', 'metric-remove', '×'); remove.type = 'button'; remove.setAttribute('aria-label', 'Messwertzeile entfernen');
    const record = { row, select, name, unit, value };
    const update = () => { customFields.hidden = select.value !== 'custom'; };
    select.addEventListener('change', () => { dirty = true; update(); });
    remove.addEventListener('click', () => { rows = rows.filter(item => item !== record); row.remove(); dirty = true; });
    row.append(selectLabel, valueLabel, remove, customFields); rows.push(record); $('#entry-metrics').append(row); update();
  }
  function open(entry = null) {
    if (!canEdit()) { onSetup(); return; }
    editing = entry;
    const now = new Date();
    $('#entry-title').textContent = entry ? 'Dein Eintrag. Weitergedacht.' : 'Ein Moment für dich.';
    $('#entry-date').value = entry?.date || todayISO(); $('#entry-date').max = todayISO();
    $('#entry-time').value = entry?.time ?? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    $('#entry-text').value = entry?.text || ''; $('#entry-symptoms').value = entry?.symptoms.join(', ') || ''; $('#entry-tags').value = entry?.tags.join(', ') || '';
    $('#entry-error').hidden = true;
    rows = []; $('#entry-metrics').replaceChildren();
    if (entry?.metrics.length) for (const metric of entry.metrics) addMetric(metric);
    else { addMetric(null, 'weight'); addMetric(null, 'belly'); }
    refreshSymptoms(); dirty = false;
    $('#journal-dialog').showModal();
  }
  function close() {
    if (dirty && !window.confirm('Ungespeicherten Entwurf verwerfen?')) return;
    dirty = false; $('#journal-dialog').close();
  }
  $('#journal-new').addEventListener('click', () => open());
  $('#journal-close').addEventListener('click', close);
  $('#journal-dialog').addEventListener('cancel', event => { event.preventDefault(); close(); });
  $('#journal-dialog').addEventListener('click', event => {
    if (event.target !== $('#journal-dialog')) return;
    const r = event.target.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  $('#entry-add-metric').addEventListener('click', () => { addMetric(null, 'custom'); dirty = true; });
  $('#journal-form').addEventListener('input', () => { dirty = true; refreshSymptoms(); });
  $('#journal-form').addEventListener('submit', event => {
    event.preventDefault(); $('#entry-error').hidden = true;
    try {
      if (!canEdit()) throw new Error('Einträge können nur am aktiven Master bearbeitet werden. Dein Entwurf bleibt geöffnet.');
      const metrics = [];
      for (const row of rows) {
        if (!row.value.value.trim()) {
          if (row.select.value === 'custom' && (row.name.value.trim() || row.unit.value.trim())) throw new Error('Bitte auch einen Wert für deine eigene Messgröße eingeben.');
          continue;
        }
        metrics.push(normalizeMetric({ kind: row.select.value, label: row.name.value, unit: row.unit.value, value: parseMeasurement(row.value.value) }));
      }
      const entries = getJournal();
      if (editing && !entries.some(entry => entry.id === editing.id && entry.updatedAt === editing.updatedAt)) throw new Error('Dieser Eintrag wurde inzwischen geändert. Kopiere deinen Entwurf und öffne die aktuelle Fassung erneut.');
      const draft = { date: $('#entry-date').value, time: $('#entry-time').value, text: $('#entry-text').value, symptoms: parseLabels($('#entry-symptoms').value), tags: parseLabels($('#entry-tags').value), metrics };
      saveJournal(upsertEntry(entries, draft, editing));
      dirty = false; $('#journal-dialog').close(); render(); notify('Dein Journaleintrag ist lokal gespeichert.');
    } catch (error) { $('#entry-error').textContent = error.message; $('#entry-error').hidden = false; }
  });

  function renderChart() {
    const definitions = new Map();
    for (const entry of getJournal()) if (!entry.deletedAt) for (const metric of entry.metrics) definitions.set(metricKey(metric), metric);
    const selected = $('#journal-metric').value;
    $('#journal-metric').replaceChildren();
    for (const [key, metric] of definitions) {
      const option = document.createElement('option'); option.value = key; option.textContent = `${metric.label}${metric.unit ? ` (${metric.unit})` : ''}`; $('#journal-metric').append(option);
    }
    if (definitions.has(selected)) $('#journal-metric').value = selected;
    $('#journal-metric').disabled = !definitions.size;
    const points = metricSeries(filtered, $('#journal-metric').value);
    const chart = $('#journal-chart'); chart.replaceChildren();
    $('#journal-metric-table-body').replaceChildren();
    $('#journal-metric-table').hidden = !points.length;
    if (!points.length) {
      $('#journal-latest-value').textContent = 'Noch kein Messwert'; $('#journal-chart-caption').textContent = 'Erfasse Gewicht, Umfang oder eine eigene Messgröße. Hier siehst du ihren Verlauf.'; return;
    }
    const last = points.at(-1);
    $('#journal-latest-value').textContent = `${number(last.value)} ${last.unit}`.trim();
    $('#journal-chart-caption').textContent = `${points.length} ${points.length === 1 ? 'Messung' : 'Messungen'} · zuletzt ${formatDate(last.date, { year: undefined })}${last.time ? `, ${last.time} Uhr` : ''}. Eigene Messwerte ohne medizinische Bewertung.`;
    for (const point of points) {
      const row = document.createElement('tr');
      for (const value of [formatDate(point.date), point.time || '–', `${number(point.value)} ${point.unit}`.trim()]) row.append(node('td', '', value));
      $('#journal-metric-table-body').append(row);
    }
    if (points.length < 2) { chart.append(node('p', 'journal-chart-empty', 'Ab zwei Messungen erscheint hier eine Verlaufslinie.')); return; }
    const svgNode = (tag, attrs = {}, text = null) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key, value] of Object.entries(attrs)) e.setAttribute(key, value); if (text !== null) e.textContent = text; return e; };
    const svg = svgNode('svg', { viewBox: '0 0 520 180', role: 'img', 'aria-label': `Verlauf von ${last.label}: ${points.length} Messungen, zuletzt ${number(last.value)} ${last.unit}` });
    const times = points.map(p => dayNumber(p.date) + (p.time ? (Number(p.time.slice(0, 2)) * 60 + Number(p.time.slice(3))) / 1440 : 0));
    const minX = Math.min(...times), maxX = Math.max(...times);
    const values = points.map(p => p.value); const min = Math.min(...values), max = Math.max(...values);
    const padding = max === min ? Math.max(1, Math.abs(max) * .05) : (max - min) * .15;
    const low = min - padding, high = max + padding;
    const coords = points.map((p, i) => [maxX === minX ? 280 : 58 + (times[i] - minX) / (maxX - minX) * 442, 140 - (p.value - low) / (high - low) * 120]);
    for (const y of [20, 80, 140]) svg.append(svgNode('line', { x1: 58, x2: 500, y1: y, y2: y, class: 'chart-grid' }));
    svg.append(svgNode('text', { x: 2, y: 24, class: 'chart-label' }, number(high)), svgNode('text', { x: 2, y: 144, class: 'chart-label' }, number(low)));
    svg.append(svgNode('polyline', { points: coords.map(p => p.join(',')).join(' '), class: 'chart-line' }));
    points.forEach((p, i) => { const dot = svgNode('circle', { cx: coords[i][0], cy: coords[i][1], r: 4, class: 'chart-dot' }); dot.append(svgNode('title', {}, `${formatDate(p.date)} ${p.time}: ${number(p.value)} ${p.unit}`)); svg.append(dot); });
    svg.append(svgNode('text', { x: 58, y: 170, class: 'chart-label' }, formatDate(points[0].date, { year: undefined })), svgNode('text', { x: 500, y: 170, 'text-anchor': 'end', class: 'chart-label' }, formatDate(last.date, { year: undefined })));
    chart.append(svg);
  }
  function render() {
    const entries = getJournal();
    const tags = [...new Set(entries.filter(e => !e.deletedAt || $('#journal-archived').checked).flatMap(e => e.tags))].sort((a, b) => a.localeCompare(b, 'de'));
    const currentTag = $('#journal-tag').value;
    $('#journal-tag').replaceChildren();
    const all = document.createElement('option'); all.value = ''; all.textContent = 'Alle Tags'; $('#journal-tag').append(all);
    for (const tag of tags) { const option = document.createElement('option'); option.value = tag; option.textContent = tag; $('#journal-tag').append(option); }
    if (tags.includes(currentTag)) $('#journal-tag').value = currentTag;
    filtered = filterEntries(entries, { search: $('#journal-search').value, tag: $('#journal-tag').value, from: $('#journal-from').value, to: $('#journal-to').value, archived: $('#journal-archived').checked });
    $('#journal-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'Eintrag' : 'Einträge'}`;
    $('#journal-permission').textContent = canEdit() ? 'Deine Beobachtungen, ohne Bewertung. Verbundene Geräte lesen deine Einträge mit.' : 'Zum Erfassen brauchst du gespeicherte Basisdaten und gegebenenfalls den aktiven Master. Vorhandene Einträge bleiben lesbar.';
    $('#entry-save').disabled = !canEdit();
    $('#journal-export').disabled = !filtered.length;
    const list = $('#journal-entries'); list.replaceChildren();
    if (!filtered.length) list.append(node('div', 'journal-empty', entries.length ? 'Keine Einträge für diese Filter. Probiere einen anderen Zeitraum oder zeige archivierte Einträge an.' : 'Dein Journal beginnt mit deinem ersten Eintrag. Halte fest, was dich bewegt – mit Worten, Symptomen oder Messwerten.'));
    for (const entry of filtered) {
      const card = node('article', `journal-entry${entry.deletedAt ? ' archived' : ''}`);
      const header = node('div', 'journal-entry-header');
      const date = node('div'); const title = node('h3', '', formatDate(entry.date)); date.append(title);
      const week = weekOnDate(entry.date);
      date.append(node('p', 'journal-entry-meta', [entry.time ? `${entry.time} Uhr` : '', week, entry.deletedAt ? 'Archiviert' : ''].filter(Boolean).join(' · ')));
      const actions = node('div', 'journal-entry-actions');
      if (canEdit()) {
        if (!entry.deletedAt) { const edit = node('button', 'text-link', 'Bearbeiten'); edit.type = 'button'; edit.addEventListener('click', () => open(entry)); actions.append(edit); }
        const archive = node('button', 'text-link', entry.deletedAt ? 'Wiederherstellen' : 'Archivieren'); archive.type = 'button'; archive.addEventListener('click', () => {
          try { if (!canEdit()) throw new Error('Nur der Master darf Einträge ändern.'); saveJournal(archiveEntry(getJournal(), entry.id, !entry.deletedAt)); render(); notify(entry.deletedAt ? 'Eintrag wiederhergestellt.' : 'Eintrag archiviert. Über „Archivierte anzeigen“ bleibt er erreichbar.'); }
          catch (error) { notify(error.message); }
        }); actions.append(archive);
      }
      header.append(date, actions); card.append(header);
      if (entry.symptoms.length) { const symptoms = node('div', 'journal-chips'); for (const value of entry.symptoms) symptoms.append(node('span', 'journal-symptom', value)); card.append(symptoms); }
      if (entry.text) card.append(node('p', 'journal-note', entry.text));
      if (entry.metrics.length) { const measurements = node('dl', 'entry-measurements'); for (const metric of entry.metrics) { const group = node('div'); group.append(node('dt', '', metric.label), node('dd', '', `${number(metric.value)} ${metric.unit}`.trim())); measurements.append(group); } card.append(measurements); }
      if (entry.tags.length) { const tags = node('div', 'journal-chips'); for (const tag of entry.tags) tags.append(node('span', 'journal-tag-chip', `#${tag}`)); card.append(tags); }
      list.append(card);
    }
    renderChart();
  }
  for (const id of ['journal-search', 'journal-tag', 'journal-from', 'journal-to', 'journal-archived']) $( '#' + id).addEventListener('input', render);
  $('#journal-metric').addEventListener('change', renderChart);
  $('#journal-export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([journalCsv(filtered)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `bauchgefuehl-journal-${todayISO()}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return { render };
}
