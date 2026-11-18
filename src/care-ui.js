import { CARE_KEY, readCare, writeCare, normalizeCare, upsertCare, archiveCare, careCollection, PROVIDERS, NOTE_KINDS } from './care.js';
import { todayISO, formatDate } from './dates.js';

export function setupPersonalCare({ storage, canEdit, getMode, onChange, onRefresh = () => {}, notify, openCalendar, openConversation }) {
  const $ = id => document.getElementById(id);
  const node = (tag, cls = '', text = '') => { const e = document.createElement(tag); e.className = cls; e.textContent = text; return e; };
  const button = (text, action, cls = 'text-link') => { const e = node('button', cls, text); e.type = 'button'; e.addEventListener('click', action); return e; };
  let data = null; let problem = ''; let actionProblem = ''; let busy = false; let editingAppointment = null; let editingNote = null; let dirty = false;
  function reload() { try { data = readCare(storage); problem = ''; } catch (cause) { data = null; problem = cause.message; } render(); onRefresh(); }
  function visible() { return getMode() === 'shared' ? normalizeCare() : data; }
  function error(message) { $('personal-care-error').textContent = message; $('personal-care-error').hidden = !message; }
  function close(dialog) { if (busy || (dirty && !window.confirm('Ungespeicherten Entwurf verwerfen?'))) return; dialog.close(); dirty = false; }
  for (const type of ['appointment', 'note']) {
    const dialog = $(`care-${type}-dialog`);
    $(`care-${type}-close`).addEventListener('click', () => close(dialog));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(dialog); });
    dialog.addEventListener('input', () => { dirty = true; });
  }
  function openDialog(type) {
    for (const dialog of document.querySelectorAll('dialog[open]')) {
      if (dialog.id.startsWith('care-') && dirty) return false;
      dialog.close();
    }
    dirty = false; $(`care-${type}-error`).hidden = true; $(`care-${type}-dialog`).showModal(); requestAnimationFrame(() => $(type === 'note' ? 'care-note-text' : 'care-appt-title').focus()); return true;
  }
  function editable() { if (!canEdit() || !data || getMode() === 'shared') { notify(problem || 'Termine und Notizen bitte am aktiven Master mit eigenen Angaben bearbeiten.'); return false; } return true; }
  function openAppointment(date = todayISO(), existing = null) {
    if (!editable() || busy || document.querySelector('dialog[open]')) return;
    editingAppointment = existing;
    $('care-appt-date').value = existing?.date || date; $('care-appt-time').value = existing?.time || '';
    $('care-appt-title').value = existing?.title || ''; $('care-appt-provider').value = existing?.provider || 'midwife'; $('care-appt-location').value = existing?.location || '';
    openDialog('appointment');
  }
  function openNote(appointmentId = null, existing = null, initialText = '') {
    if (!editable() || busy || document.querySelector('dialog[open]')) return;
    editingNote = existing;
    $('care-note-kind').value = existing?.kind || 'qa'; $('care-note-date').value = existing?.date || todayISO(); $('care-note-date').max = todayISO();
    $('care-note-text').value = existing?.text || initialText; $('care-note-answer').value = existing?.answer || ''; $('care-note-next').value = existing?.nextSteps || ''; $('care-note-discussed').checked = existing?.discussed || false;
    const select = $('care-note-appointment'); select.replaceChildren();
    const none = node('option', '', 'Noch keinem Termin zugeordnet'); none.value = ''; select.append(none);
    for (const item of data.appointments.filter(item => !item.deletedAt || item.id === existing?.appointmentId).sort((a,b) => a.date.localeCompare(b.date))) {
      const option = node('option', '', `${formatDate(item.date)}${item.time ? ', ' + item.time : ''} · ${item.title}${item.deletedAt ? ' (archiviert)' : ''}`); option.value = item.id; select.append(option);
    }
    select.value = existing?.appointmentId ?? appointmentId ?? '';
    kindChanged(); openDialog('note');
  }
  function kindChanged() { const qa = $('care-note-kind').value === 'qa'; $('care-note-answer-label').hidden = !qa && !$('care-note-answer').value; $('care-note-text-label').textContent = qa ? 'Deine Frage' : 'Deine Notiz / dein Ergebnis'; }
  $('care-note-kind').addEventListener('change', kindChanged);
  async function run(action, type = null) {
    if (busy || !editable()) return;
    busy = true; actionProblem = ''; error(''); render();
    try {
      if (!navigator.locks?.request) throw new Error('Bitte einen aktuellen Browser mit lokalen Schreibsperren verwenden.');
      await navigator.locks.request('bauchgefuehl-local-write', () => {
        if (!canEdit()) throw new Error('Der Master ist inzwischen in einem anderen Tab aktiv.');
        const fresh = readCare(storage);
        if (JSON.stringify(fresh) !== JSON.stringify(data)) { data = fresh; throw new Error('Termine wurden in einem anderen Tab geändert. Bitte den Entwurf sichern und neu öffnen.'); }
        data = writeCare(storage, action(fresh)); onChange();
      });
      if (type) { dirty = false; $(`care-${type}-dialog`).close(); }
      notify('Termine und Notizen lokal gespeichert.');
    } catch (cause) {
      if (type) { $(`care-${type}-error`).textContent = cause.message; $(`care-${type}-error`).hidden = false; }
      else actionProblem = cause.message;
    } finally { busy = false; render(); }
  }
  $('care-appointment-form').addEventListener('submit', event => {
    event.preventDefault(); const previous = editingAppointment;
    const draft = { date: $('care-appt-date').value, time: $('care-appt-time').value, title: $('care-appt-title').value, provider: $('care-appt-provider').value, location: $('care-appt-location').value };
    void run(fresh => upsertCare(fresh, 'appointments', draft, previous), 'appointment');
  });
  $('care-note-form').addEventListener('submit', event => {
    event.preventDefault(); const previous = editingNote;
    const draft = { appointmentId: $('care-note-appointment').value || null, date: $('care-note-date').value, kind: $('care-note-kind').value, text: $('care-note-text').value, answer: $('care-note-answer').value, nextSteps: $('care-note-next').value, discussed: $('care-note-discussed').checked };
    void run(fresh => upsertCare(fresh, 'notes', draft, previous), 'note');
  });
  $('care-new-appointment').addEventListener('click', () => openAppointment());
  $('care-new-note').addEventListener('click', () => openNote());
  for (const id of ['care-search', 'care-open-only', 'care-show-archived']) $(id).addEventListener('input', render);
  function noteCard(note) {
    const card = node('article', 'care-note-card');
    const appointment = data.appointments.find(item => item.id === note.appointmentId);
    card.append(node('p', 'eyebrow', `${NOTE_KINDS[note.kind]}${note.deletedAt ? ' · ARCHIVIERT' : ''}`), node('h4', '', note.text));
    if (note.kind === 'qa') card.append(node('p', 'care-answer', note.answer ? `Antwort: ${note.answer}` : 'Noch keine Antwort eingetragen.'));
    if (note.nextSteps) card.append(node('p', 'care-answer', `Nächste Schritte: ${note.nextSteps}`));
    card.append(node('p', 'care-item-meta', `${formatDate(note.date)} · ${note.discussed ? 'Besprochen' : note.kind === 'qa' ? 'Frage noch offen' : 'Noch nicht als besprochen markiert'}`));
    card.append(node('p', 'care-item-meta', appointment ? `Termin: ${formatDate(appointment.date)}${appointment.time ? ', ' + appointment.time : ''} · ${appointment.title}${appointment.deletedAt ? ' (archiviert)' : ''}` : 'Ohne Termin · später zuordenbar'));
    if (appointment) card.append(button('Termin im Kalender', () => openCalendar(appointment.date)));
    if (canEdit()) {
      if (!note.deletedAt) card.append(button('Bearbeiten', () => openNote(null, note)));
      card.append(button(note.deletedAt ? 'Wiederherstellen' : 'Archivieren', () => void run(fresh => archiveCare(fresh, 'notes', note.id, !note.deletedAt))));
    }
    return card;
  }
  function appointmentCard(item) {
    const card = node('article', 'appointment-card');
    const notes = careCollection(data, { appointmentId: item.id });
    const open = notes.filter(note => note.kind === 'qa' && !note.discussed).length;
    card.append(node('p', 'eyebrow', `${PROVIDERS[item.provider]}${item.deletedAt ? ' · ARCHIVIERT' : ''}`), node('h4', '', item.title), node('p', 'appointment-date', `${formatDate(item.date)}${item.time ? ' · ' + item.time + ' Uhr' : ' · Uhrzeit offen'}`));
    if (item.location) card.append(node('p', 'care-item-meta', item.location));
    card.append(node('p', 'care-item-meta', `${notes.length} Notizen · ${open} offene Fragen`));
    const actions = node('div', 'care-card-actions'); actions.append(button('Terminmappe öffnen', () => openConversation?.(item.id)), button('Im Kalender', () => openCalendar(item.date)));
    if (canEdit()) {
      if (!item.deletedAt) actions.append(button('Termin bearbeiten', () => openAppointment(item.date, item)), button('Notiz / Frage ergänzen', () => openNote(item.id)));
      actions.append(button(item.deletedAt ? 'Wiederherstellen' : 'Termin archivieren', () => void run(fresh => archiveCare(fresh, 'appointments', item.id, !item.deletedAt))));
    }
    card.append(actions);
    if (notes.length) { const details = document.createElement('details'); details.className = 'appointment-notes'; details.append(node('summary', '', `Notizen & Antworten (${notes.length})`)); for (const note of notes) details.append(noteCard(note)); card.append(details); }
    return card;
  }
  function render() {
    error(problem || actionProblem);
    $('care-appointment-fields').disabled = busy || !canEdit(); $('care-note-fields').disabled = busy || !canEdit();
    $('care-new-appointment').disabled = busy || !canEdit() || !data; $('care-new-note').disabled = busy || !canEdit() || !data;
    const appointments = $('personal-appointments'), older = $('personal-appointments-older'), notes = $('care-collection'); appointments.replaceChildren(); older.replaceChildren(); notes.replaceChildren();
    const current = visible();
    if (!current) { error(problem); return; }
    if (getMode() === 'shared') { error('Geteilte Reise: Eigene Termine werden hier nicht eingeblendet oder überschrieben.'); return; }
    const archived = $('care-show-archived').checked;
    const list = current.appointments.filter(item => archived || !item.deletedAt).sort((a,b) => Number(a.date < todayISO()) - Number(b.date < todayISO()) || a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const next = list.filter(item => !item.deletedAt && item.date >= todayISO()).slice(0, 6);
    for (const item of next) appointments.append(appointmentCard(item));
    for (const item of list.filter(item => !next.includes(item))) older.append(appointmentCard(item));
    $('personal-older-panel').hidden = !older.children.length;
    if (!next.length) appointments.append(node('p', 'calendar-empty', 'Kein bevorstehender eigener Termin. Du kannst auch vorab eine Frage in der Sammlung festhalten.'));
    const filtered = careCollection(current, { search: $('care-search').value, open: $('care-open-only').checked, archived });
    $('care-collection-count').textContent = `${filtered.length} Notizen / Fragen in dieser Auswahl`;
    for (const note of filtered) notes.append(noteCard(note));
    if (!filtered.length) notes.append(node('p', 'calendar-empty', 'Keine passenden Notizen oder Fragen. Antworten werden erst durch deine Eingabe ergänzt.'));
  }
  window.addEventListener('storage', event => { if (event.key === CARE_KEY || event.key === null) reload(); });
  reload();
  return { render, reload, getData: visible, openAppointment, openNote, editNote(id) { const note = data?.notes.find(x => x.id === id && !x.deletedAt); if(note) openNote(null,note); } };
}
