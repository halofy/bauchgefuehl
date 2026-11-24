import { shareProfile } from './report.js';
import { snapshot } from './sync.js';
import { normalizeCare } from './care.js';
import { normalizeCompanion } from './companion.js';
import { isCheckinMetric } from './checkin.js';

export const TRANSFER_SCOPES = {
  journey: 'Reise', appointments: 'Termine', notes: 'Notizen & Fragen', measurements: 'Messwerte & Befinden',
};
export function normalizeScopes(scopes) {
  if (!Array.isArray(scopes) || !scopes.includes('journey') || scopes.some(key => !Object.hasOwn(TRANSFER_SCOPES, key))) throw new Error('Bitte die Reise und gültige Inhaltsbereiche auswählen.');
  return Object.keys(TRANSFER_SCOPES).filter(key => scopes.includes(key));
}
// Build a fresh allowlisted object before signing or encrypting. No raw history or keys are shared.
export function selectTransferData(value, { scopes, care, companion, today } = {}) {
  const selected = normalizeScopes(scopes), has = key => selected.includes(key);
  const source = snapshot(value, today);
  const journal = source.journal.flatMap(entry => {
    const metrics = has('measurements') ? entry.metrics : [];
    const symptoms = has('measurements') ? entry.symptoms : [];
    const text = has('notes') ? entry.text : '', tags = has('notes') ? entry.tags : [];
    if (!text && !tags.length && !symptoms.length && !metrics.length) return [];
    return [{ id: entry.id, date: entry.date, time: entry.time, text, tags, symptoms, metrics,
      createdAt: entry.createdAt, updatedAt: entry.updatedAt, deletedAt: entry.deletedAt }];
  });
  const sourceCare = has('appointments') || has('notes') ? normalizeCare(care, today) : normalizeCare();
  const sourceCompanion = has('notes') || has('measurements') ? normalizeCompanion(companion, today) : normalizeCompanion();
  return {
    scopes: selected,
    snapshot: snapshot({ profile: shareProfile(source.profile, 'due-date', today), checks: {}, journal }, today),
    care: normalizeCare({ v: 1, appointments: has('appointments') ? sourceCare.appointments : [],
      notes: has('notes') ? sourceCare.notes.map(note => ({ ...note, appointmentId: has('appointments') ? note.appointmentId : null })) : [] }, today),
    companion: normalizeCompanion({ v: 1, birthDate: null, updatedAt: null,
      plans: has('notes') ? sourceCompanion.plans : [], growth: has('measurements') ? sourceCompanion.growth.map(item => ({ ...item, note: has('notes') ? item.note : '' })) : [] }, today),
  };
}
export function selectionSummary(data) {
  const active = list => (list || []).filter(item => !item.deletedAt);
  return `${active(data.care?.appointments).length} Termine · ${active(data.care?.notes).length + active(data.snapshot.journal).filter(item => item.text || item.tags.length).length} Notizen / Fragen · ${active(data.companion?.plans).length} Wünsche / Aufgaben · ${active(data.snapshot.journal).reduce((count, item) => count + item.metrics.length, 0) + active(data.companion?.growth).length} Messwerte · ${active(data.snapshot.journal).filter(item => item.symptoms.length || item.metrics.some(metric => isCheckinMetric(item, metric))).length} Befindenseinträge`;
}
export function reachableTransferBase(base) {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || /^(localhost|127\.|0\.|\[::1\]$)/i.test(url.hostname) || !url.hostname.includes('.')) throw new Error('Für einen QR-Code auf dem anderen Smartphone braucht es die veröffentlichte HTTPS-Adresse der App. Lokal kannst du die verschlüsselte Datei weitergeben.');
  url.search = ''; url.hash = '';
  return url.href;
}
