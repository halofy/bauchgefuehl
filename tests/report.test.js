import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePregnancy, decodeShare } from '../src/pregnancy.js';
import { shareProfile, makeShareLink, projectReport, reportDocument, reportBody } from '../src/report.js';

const today = '2026-11-17';
const profile = { method: 'period', lmp: '2026-10-16', cycle: 24, irregular: true };
const entries = [
  { id: 'synthetic-sensitive-id', date: '2026-11-16', time: '09:17', text: 'synthetic-private-note', symptoms: ['synthetic-selected-symptom'], tags: ['synthetic-private-tag'], metrics: [{ label: 'synthetic-private-metric', unit: 'cm', value: 87 }], createdAt: 'synthetic-created', deletedAt: null, secret: 'synthetic-untrusted-extra' },
  { id: 'synthetic-archived', date: today, time: '', text: 'synthetic-archived-note', symptoms: ['synthetic-archived-symptom'], tags: [], metrics: [], deletedAt: '2026-11-17T10:00:00.000Z' },
];
const options = { from: '2026-11-01', to: today, fields: ['symptoms'] };

test('ET-only sharing omits observed period and cycle while preserving the timeline', () => {
  const minimal = shareProfile(profile, undefined, today);
  assert.deepEqual(Object.keys(minimal).sort(), ['dueDate', 'method']);
  assert.equal(calculatePregnancy(minimal, today).gestationalDays, calculatePregnancy(profile, today).gestationalDays);
  assert.equal(calculatePregnancy(minimal, today).dueDate, calculatePregnancy(profile, today).dueDate);
  assert.deepEqual(shareProfile(profile, 'full', today), profile);
  assert.throws(() => shareProfile(profile, 'unknown', today));
});
test('minimal links retain only the ET payload and discard previous URL queries and sync credentials', () => {
  const url = new URL(makeShareLink(profile, 'due-date', 'https://example.test/bauchgefuehl/?token=synthetic-secret#sync=synthetic-credential', today));
  assert.equal(url.search, ''); assert.equal(url.pathname, '/bauchgefuehl/');
  assert.deepEqual(decodeShare(url.hash, today), shareProfile(profile, 'due-date', today));
  const payload = JSON.parse(atob(url.hash.slice(3).replaceAll('-', '+').replaceAll('_', '/')));
  assert.deepEqual(Object.keys(payload).sort(), ['d', 'm', 'v']);
  assert.ok(!url.href.includes('synthetic-secret')); assert.ok(!url.href.includes('sync='));
});
test('minimal sharing does not silently broaden the scope when an ET would be outside link validation', () => {
  const early = { method: 'period', lmp: '2026-11-16', cycle: 60 };
  assert.throws(() => shareProfile(early, 'due-date', today));
  assert.deepEqual(shareProfile(early, 'full', today), { ...early, irregular: false });
});
test('report defaults disclose no observations; unknown fields and invalid periods fail closed', () => {
  assert.deepEqual(projectReport(entries, { ...options, fields: [] }).entries, []);
  assert.throws(() => projectReport(entries, { ...options, fields: ['secret'] }));
  assert.throws(() => projectReport(entries, { ...options, from: '2026-11-18' }));
  assert.throws(() => projectReport(entries, { ...options, to: '2026-02-30' }));
});
test('projection and the entire file omit all unselected content, metadata and archived values', () => {
  const report = projectReport(entries, options);
  assert.deepEqual(report.entries, [{ date: '2026-11-16', symptoms: ['synthetic-selected-symptom'] }]);
  const content = JSON.stringify(report) + reportDocument(report);
  for (const privateValue of ['synthetic-sensitive-id', '09:17', 'synthetic-private-note', 'synthetic-private-tag', 'synthetic-private-metric', 'synthetic-created', 'synthetic-untrusted-extra', 'synthetic-archived']) assert.ok(!content.includes(privateValue), privateValue);
  assert.match(content, /synthetic-selected-symptom/);
});
test('inclusive date boundaries, individual exclusions and entries without chosen content are respected', () => {
  const second = { ...entries[0], id: 'synthetic-other', date: today, symptoms: [] };
  assert.equal(projectReport([...entries, second], options).entries.length, 1);
  assert.equal(projectReport(entries, { ...options, excluded: [entries[0].id] }).entries.length, 0);
  assert.equal(projectReport(entries, { ...options, from: '2026-11-16', to: '2026-11-16' }).entries.length, 1);
  assert.equal(projectReport(entries, { ...options, from: today }).entries.length, 0);
});
test('selected metrics preserve labels, units and zero without retaining raw metric or entry metadata', () => {
  const metrics = projectReport([{ ...entries[0], metrics: [{ kind: 'custom', label: 'Synthetische Skala', unit: '', value: 0, secret: 'synthetic-hidden' }] }], { ...options, fields: ['metrics'] });
  assert.deepEqual(metrics.entries[0].metrics, [{ label: 'Synthetische Skala', unit: '', value: 0 }]);
  assert.ok(!reportDocument(metrics).includes('synthetic-hidden'));
});
test('export escapes all user text and contains no executable code or remote resources', () => {
  const malicious = '<script src="https://example.test/steal"></script><img onerror="alert(1)" src=x>';
  const report = projectReport([{ ...entries[0], text: malicious, symptoms: [malicious], tags: [malicious], metrics: [{ label: malicious, unit: malicious, value: 1 }] }], { ...options, fields: ['text', 'symptoms', 'tags', 'metrics', 'time'] });
  const html = reportDocument(report);
  assert.ok(!html.includes('<script')); assert.ok(!html.includes('<img')); assert.match(html, /&lt;script/);
  assert.match(html, /default-src 'none'/); assert.ok(!html.includes('fetch('));
  assert.ok(html.includes(reportBody(report)));
});
test('projection and rendering never mutate the source journal', () => {
  const before = JSON.stringify(entries);
  reportDocument(projectReport(entries, options));
  assert.equal(JSON.stringify(entries), before);
});
