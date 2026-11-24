import { calculatePregnancy, todayISO, formatDate } from './pregnancy.js';
import { BIRTH_KEY, readBirth, writeBirth, normalizeBirth, startContraction, finishContraction, contractionPattern, showContractionFab } from './birth.js';

export function setupBirth({ storage, getProfile, getMode, getJournal, canEdit, saveJournal, notify, openCalendar, isPostpartum = () => false }) {
  const $ = id => document.getElementById(id);
  let birth;
  let damaged = false;
  let contactsBase = '';
  let working = false;
  try { birth = readBirth(storage); } catch { birth = normalizeBirth(); damaged = true; }
  function error(message) { $('birth-error').textContent = message; $('birth-error').hidden = !message; }
  const time = ms => `${String(Math.floor(Math.max(0, ms) / 60000)).padStart(2, '0')}:${String(Math.floor(Math.max(0, ms) / 1000) % 60).padStart(2, '0')}`;
  function contactLinks(target) {
    target.replaceChildren();
    for (const contact of birth.contacts) {
      const link = document.createElement('a'); link.className = 'contact-call button button-outline'; link.href = `tel:${contact.phone}`;
      const name = document.createElement('strong'); name.textContent = contact.name;
      const phone = document.createElement('span'); phone.textContent = contact.phone;
      link.append(name, phone); target.append(link);
    }
    if (!birth.contacts.length) { const text = document.createElement('p'); text.className = 'field-hint'; text.textContent = 'Noch keine Kontakte hinterlegt. Namen und Nummern unten eintragen.'; target.append(text); }
  }
  function fillContacts() {
    contactsBase = JSON.stringify(birth.contacts);
    for (let index = 0; index < 3; index++) {
      $(`contact-name-${index}`).value = birth.contacts[index]?.name || '';
      $(`contact-phone-${index}`).value = birth.contacts[index]?.phone || '';
    }
    $('birth-mode').value = birth.mode;
  }
  function clock() {
    $('birth-timer').textContent = birth.active ? time(Date.now() - birth.active.startedAt) : '00:00';
    $('birth-clock-note').textContent = birth.active ? 'Messung läuft. Bei gesperrtem Bildschirm wird die Zeit aus dem gespeicherten Beginn rekonstruiert; die App überwacht dich nicht im Hintergrund.' : 'Beim Beginn starten, beim Ende stoppen. Abstände werden von Beginn zu Beginn gemessen.';
  }
  function render(timeOnly = false) {
    let age;
    try { age = calculatePregnancy(getProfile(), todayISO()).gestationalDays; } catch { age = null; }
    const own = !['demo', 'shared'].includes(getMode());
    $('contraction-fab').hidden = (!birth.active && isPostpartum()) || !showContractionFab(age, birth.active, own);
    $('contraction-fab').textContent = birth.active ? '● Wehe läuft' : '◷ Wehen messen';
    $('birth-start').hidden = !!birth.active; $('birth-stop').hidden = !birth.active;
    $('birth-end-label').hidden = !birth.active;
    $('birth-start').disabled = damaged || working || !canEdit();
    $('birth-stop').disabled = damaged || working || !canEdit();
    $('birth-contacts-save').disabled = damaged || working;
    $('birth-early-warning').hidden = own && Number.isInteger(age) && age >= 259;
    $('birth-pattern').classList.remove('pattern-matched');
    const pattern = contractionPattern(getJournal(), Date.now(), birth.mode);
    $('birth-pattern').textContent = pattern.matched
      ? 'Die gemessenen Zeiten erfüllen das eingestellte Zeitmuster. Bitte Betreuung kontaktieren und das weitere Vorgehen besprechen. Das bestätigt keine Geburtswehen; Stärke und Muttermund lassen sich hier nicht beurteilen.'
      : `${pattern.count} abgeschlossene Messungen in den letzten zwei Stunden. Noch kein vollständiges Zeitmuster erfasst. Das ist keine Entwarnung – bei Beschwerden oder Unsicherheit direkt Betreuung kontaktieren.`;
    if (pattern.matched) $('birth-pattern').classList.add('pattern-matched');
    $('birth-pattern-rule').textContent = birth.mode === 'first' ? 'Orientierung beim ersten Kind: ungefähr eine Stunde lang Abstände bis fünf Minuten und Dauer ab einer Minute. Die App prüft nur diese Zeiten. Nicht auf das Muster warten, wenn du Hilfe brauchst.' : 'Bei weiteren Kindern: regelmäßige Abstände bis zehn Minuten frühzeitig mit der Betreuung besprechen. Die App zeigt nach mindestens drei passenden Messungen einen Zeithinweis; das ist eine technische Anzeigegrenze, keine klinisch validierte Diagnose.';
    if (!timeOnly) {
    contactLinks($('birth-call-list'));
    const list = $('birth-measurements'); list.replaceChildren();
    for (const item of pattern.measurements.slice(-12).reverse()) {
      const row = document.createElement('button'); row.type = 'button'; row.className = 'birth-measurement';
      row.textContent = `${formatDate(item.date, { year: undefined })} · ${item.time} · ${item.duration} s · Im Kalender ansehen ↗`;
      row.addEventListener('click', () => { $('birth-dialog').close(); openCalendar(item.date); }); list.append(row);
    }
    }
    clock();
    if (damaged) error('Kontakte oder offene Messung konnten nicht sicher geladen werden. Bitte unter „Daten & Backup“ zuerst eine Sicherung herunterladen. Die vorhandenen Rohdaten bleiben erhalten.');
  }
  async function run(action) {
    if (working || damaged) return;
    working = true; error('');
    try {
      if (!navigator.locks?.request) throw new Error('Dieser Browser unterstützt die sichere Sperre gegen parallele Messungen nicht. Bitte einen aktuellen Browser verwenden.');
      await navigator.locks.request('bauchgefuehl-local-write', async () => { birth = readBirth(storage); await action(); });
    } catch (cause) { error(cause.message); }
    finally { working = false; render(); }
  }
  function open(view = 'contacts') {
    for (const id of ['sync-dialog', 'share-dialog']) if ($(id)?.open) $(id).close();
    error(''); try { birth = readBirth(storage); } catch { damaged = true; }
    fillContacts(); render(); $('birth-dialog').showModal();
    $(view === 'tracker' ? 'birth-tracker' : 'birth-call-list').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  $('contraction-fab').addEventListener('click', () => open('tracker'));
  for (const button of document.querySelectorAll('[data-action="birth"]')) button.addEventListener('click', () => open(button.dataset.birthView || 'contacts'));
  $('birth-start').addEventListener('click', () => { const pressedAt = Date.now(); void run(() => {
    if (!canEdit()) throw new Error('Bitte auf dem schreibberechtigten Gerät eigene Schwangerschaftsdaten speichern.');
    if (birth.active) throw new Error('Es läuft bereits eine Messung.');
    birth = writeBirth(storage, { ...birth, active: startContraction(pressedAt) }); $('birth-end').value = '';
  }); });
  $('birth-stop').addEventListener('click', () => {
    const end = $('birth-end').value ? new Date($('birth-end').value).getTime() : Date.now();
    const excluded = $('birth-exclude').checked;
    void run(() => {
    if (!canEdit()) throw new Error('Messungen bitte am schreibberechtigten Gerät speichern.');
    if (end > Date.now()) throw new Error('Die Endzeit darf nicht in der Zukunft liegen.');
    const entries = finishContraction(getJournal(), birth.active, end, { excluded });
    saveJournal(entries); // Preserve the pending record if durable journal storage fails.
    birth = writeBirth(storage, { ...birth, active: null }); $('birth-end').value = ''; $('birth-exclude').checked = false;
    notify('Messung gespeichert. Du findest sie an ihrem Beginndatum im Kalender.');
  }); });
  $('birth-contacts-form').addEventListener('submit', event => {
    event.preventDefault();
    void run(() => {
      if (JSON.stringify(birth.contacts) !== contactsBase) throw new Error('Die Kontakte wurden inzwischen geändert. Bitte den Dialog neu öffnen, bevor du speicherst.');
      const contacts = [];
      for (let index = 0; index < 3; index++) {
        const name = $(`contact-name-${index}`).value.trim(); const phone = $(`contact-phone-${index}`).value.trim();
        if (name || phone) contacts.push({ name, phone });
      }
      birth = writeBirth(storage, { ...birth, contacts, mode: $('birth-mode').value }); fillContacts(); notify('Kontakte lokal gespeichert.');
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === BIRTH_KEY || event.key === null) {
      try { birth = readBirth(storage); damaged = false; } catch { damaged = true; }
      render();
    }
  });
  setInterval(() => { if (!document.hidden && $('birth-dialog').open) render(true); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  return { render, open, reload() { try { birth = readBirth(storage); damaged = false; } catch { damaged = true; } render(); } };
}
