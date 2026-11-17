import test from 'node:test';
import assert from 'node:assert/strict';
import { explainCalculation } from '../src/calculation-explanation.js';
const today = '2026-11-17';
const period = { method: 'period', lmp: '2026-07-09', cycle: 30 };
test('personal explanation shows dates, adjustment, division and the displayed SSW', () => {
  const explanation = explainCalculation(period, today);
  const text = explanation.steps.join(' ');
  for (const expected of ['17. November 2026', '9. Juli 2026', '131 Kalendertage', '30 − 28 = 2', '131 − 2 = 129', '129 ÷ 7 = 18 volle Wochen und 3 Tage']) assert.ok(text.includes(expected), expected);
  assert.match(explanation.result, /18\+3.*19\. SSW/);
});
test('short cycles add days; 28-day cycles need no correction', () => {
  assert.match(explainCalculation({ ...period, cycle: 26 }, today).steps.join(' '), /131 \+ 2 = 133/);
  assert.match(explainCalculation({ ...period, cycle: 28 }, today).steps.join(' '), /Keine Zyklusanpassung: 131 − 0 = 131/);
});
test('due-date method uses the entered ET before and after the date', () => {
  const before = explainCalculation({ method: 'due-date', dueDate: '2027-04-17' }, today);
  assert.match(before.steps.join(' '), /17\. April 2027.*280 − 151 = 129/);
  assert.match(before.result, /18\+3/);
  const after = explainCalculation({ method: 'due-date', dueDate: '2026-11-15' }, today);
  assert.match(after.steps.join(' '), /280 \+ 2 = 282/);
  assert.match(after.result, /40\+2/);
});
test('before 0+0 avoids misleading negative week output; beyond range is explicit', () => {
  const early = explainCalculation({ method: 'period', lmp: today, cycle: 35 }, today);
  assert.match(early.result, /vor 0\+0/);
  assert.doesNotMatch(early.steps.join(' '), /÷ 7/);
  assert.match(explainCalculation({ method: 'period', lmp: '2026-01-17', cycle: 28 }, today).result, /außerhalb der Wocheninfos/);
});
test('example and shared views label where the values come from', () => {
  assert.match(explainCalculation(period, today, 'demo').title, /Beispieldaten/);
  assert.match(explainCalculation(period, today, 'shared').title, /geteilten Angaben/);
  assert.match(explainCalculation(period, today, 'session').title, /deine aktuelle SSW/);
});
