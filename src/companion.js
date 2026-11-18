import { todayISO, dayNumber } from './dates.js';
export const COMPANION_KEY = 'bauchgefuehl.companion.v1';
export const COMPANION_HISTORY_KEY = 'bauchgefuehl.companion-history.v1';
export const PLAN_AREAS = { birth: 'Geburtswünsche', bag: 'Kliniktasche', tasks: 'Organisatorisches', support: 'Unterstützung im Wochenbett' };
export const GROWTH_KINDS = { crl: { label: 'Scheitel-Steiß-Länge (SSL)', unit: 'mm', max: 300 }, length: { label: 'Gesamtlänge (Schätzung der Praxis)', unit: 'cm', max: 70 }, weight: { label: 'Geschätztes Gewicht', unit: 'g', max: 7000 }, hc: { label: 'Kopfumfang (KU)', unit: 'mm', max: 500 }, ac: { label: 'Bauchumfang (AU)', unit: 'mm', max: 600 }, fl: { label: 'Oberschenkelknochen (FL)', unit: 'mm', max: 150 } };
const validText = (value, max = 3000) => { if (typeof value !== 'string' || value.length > max) throw new Error('Bitte kürzeren gültigen Text eingeben.'); return value.trim(); };
const date = (value, today) => { dayNumber(value); if (value < '1900-01-01' || value > today) throw new Error('Datum bitte bis einschließlich heute wählen.'); return value; };
export function normalizeCompanion(value = { v: 1, birthDate: null, plans: [], growth: [], updatedAt: null }, today = todayISO()) {
  if (value?.v !== 1 || !Array.isArray(value.plans) || !Array.isArray(value.growth) || value.plans.length > 200 || value.growth.length > 200) throw new Error('Unbekannte oder zu große persönliche Planung. Bitte Daten sichern.');
  const stamp = s => { if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s) || new Date(s).toISOString() !== s) throw new Error('Ungültiger Änderungszeitpunkt.'); return s; };
  const record = item => { if (typeof item.id !== 'string' || !/^[a-z0-9-]{8,64}$/i.test(item.id)) throw new Error('Ungültige Kennung.'); return { id: item.id, updatedAt: stamp(item.updatedAt), deletedAt: item.deletedAt ? stamp(item.deletedAt) : null }; };
  const plans = value.plans.map(item => { if (!Object.hasOwn(PLAN_AREAS, item.area) || typeof item.done !== 'boolean') throw new Error('Ungültige Planung.'); const text = validText(item.text); if (!text) throw new Error('Bitte einen Wunsch oder eine Aufgabe eingeben.'); return { ...record(item), area: item.area, text, person: validText(item.person, 120), done: item.done }; });
  const growth = value.growth.map(item => { const kind = GROWTH_KINDS[item.kind]; if (!kind || typeof item.value !== 'number' || !Number.isFinite(item.value) || item.value <= 0 || item.value > kind.max) throw new Error('Messwert oder Einheit bitte prüfen.'); return { ...record(item), date: date(item.date, today), kind: item.kind, value: item.value, note: validText(item.note, 1000) }; });
  for (const list of [plans, growth]) if (new Set(list.map(x => x.id)).size !== list.length) throw new Error('Doppelte Kennungen.');
  const result = { v: 1, birthDate: value.birthDate == null ? null : date(value.birthDate, today), plans: plans.sort((a,b) => a.id.localeCompare(b.id)), growth: growth.sort((a,b) => a.id.localeCompare(b.id)), updatedAt: value.updatedAt == null ? null : stamp(value.updatedAt) };
  if (JSON.stringify(result).length > 128000) throw new Error('Die persönliche Planung ist zu groß; es wird nichts gekürzt.');
  return result;
}
export function readCompanion(storage, today) { const raw = storage.getItem(COMPANION_KEY); return normalizeCompanion(raw ? JSON.parse(raw) : undefined, today); }
export function writeCompanion(storage, value, today) {
  const next = normalizeCompanion(value, today), raw = storage.getItem(COMPANION_KEY);
  if (raw && raw !== JSON.stringify(next)) {
    const history = JSON.parse(storage.getItem(COMPANION_HISTORY_KEY) || '[]'); if (!Array.isArray(history)) throw new Error('Planungs-Sicherungsverlauf beschädigt.');
    const records = [{ savedAt: new Date().toISOString(), raw }, ...history].slice(0, 20);
    while (records.length > 1 && JSON.stringify(records).length > 512000) records.pop();
    storage.setItem(COMPANION_HISTORY_KEY, JSON.stringify(records));
  }
  storage.setItem(COMPANION_KEY, JSON.stringify(next)); return next;
}
export function changeCompanion(value, type, draft, previous = null, now = new Date().toISOString(), today = todayISO()) {
  const current = normalizeCompanion(value, today);
  if (type === 'phase') return normalizeCompanion({ ...current, birthDate: draft.birthDate, updatedAt: now }, today);
  if (!['plans', 'growth'].includes(type)) throw new Error('Unbekannter Bereich.');
  if (previous && !current[type].some(x => x.id === previous.id && x.updatedAt === previous.updatedAt)) throw new Error('Eintrag wurde inzwischen geändert. Bitte erneut öffnen.');
  return normalizeCompanion({ ...current, updatedAt: now, [type]: [...current[type].filter(x => x.id !== previous?.id), { ...draft, id: previous?.id || crypto.randomUUID(), updatedAt: now, deletedAt: Object.hasOwn(draft,'deletedAt') ? draft.deletedAt : previous?.deletedAt ?? null }] }, today);
}
export function companionContinuity(incoming, previous, today) {
  const a = normalizeCompanion(incoming, today), b = normalizeCompanion(previous, today);
  if (b.updatedAt && (!a.updatedAt || a.updatedAt < b.updatedAt || (a.updatedAt === b.updatedAt && JSON.stringify(a) !== JSON.stringify(b)))) throw new Error('Die persönliche Planung würde zurückgesetzt. Bitte Sicherungen prüfen.');
  for (const key of ['plans','growth']) for (const item of b[key]) { const next = a[key].find(x => x.id === item.id); if (!next || next.updatedAt < item.updatedAt || (next.updatedAt === item.updatedAt && JSON.stringify(next) !== JSON.stringify(item))) throw new Error('Planung oder Untersuchungswerte würden verloren gehen.'); }
}
