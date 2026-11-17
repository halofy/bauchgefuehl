import test from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE_ITEMS, GUIDE_SOURCES, GUIDE_REVIEWED, GUIDE_LEVELS, guideAdvice, searchGuide, guidePhaseNote } from '../src/guide.js';
import { pregnancyTimeline, gestationOnDate } from '../src/calendar.js';

test('every guide entry and preparation has a known rating, reviewed sources and unique identifiers', () => {
  assert.equal(new Set(GUIDE_ITEMS.map(item => item.id)).size, GUIDE_ITEMS.length);
  assert.ok(GUIDE_ITEMS.length >= 20);
  assert.match(GUIDE_REVIEWED, /^\d{4}-\d{2}-\d{2}$/);
  for (const item of GUIDE_ITEMS) {
    assert.ok(['food', 'activity'].includes(item.category)); assert.ok(item.title); assert.ok(item.sources.length);
    for (const key of item.sources) { assert.ok(GUIDE_SOURCES[key].title); assert.equal(new URL(GUIDE_SOURCES[key].url).protocol, 'https:'); }
    if (item.variants) {
      assert.equal(new Set(item.variants.map(choice => choice.id)).size, item.variants.length);
      for (const choice of item.variants) { assert.ok(GUIDE_LEVELS[choice.level]); assert.ok(choice.text); }
    } else { assert.ok(GUIDE_LEVELS[item.level]); assert.ok(item.text); }
  }
});
test('search supports German spelling, aliases, case and multiple words without inventing unknown advice', () => {
  assert.ok(searchGuide({ query: 'HAEHNCHEN' }).some(item => item.id === 'fleisch'));
  assert.ok(searchGuide({ query: 'Räucherlachs' }).some(item => item.id === 'lachs'));
  assert.ok(searchGuide({ query: 'Kaffee Koffein' }).some(item => item.id === 'kaffee'));
  assert.deepEqual(searchGuide({ query: 'nicht-hinterlegtes-synthetisches-produkt' }), []);
});
test('category and current-rating filters combine with preparation choices', () => {
  const results = searchGuide({ category: 'food', level: 'ok', variants: { lachs: 'cooked' } });
  assert.ok(results.some(item => item.id === 'lachs')); assert.ok(results.every(item => item.category === 'food'));
  assert.ok(!searchGuide({ category: 'food', level: 'ok' }).some(item => item.id === 'lachs'));
  assert.ok(searchGuide({ level: 'avoid', variants: { lachs: 'raw' } }).some(item => item.id === 'lachs'));
});
test('missing or unknown preparation never gives a blanket green light', () => {
  for (const item of GUIDE_ITEMS.filter(item => item.variants)) {
    assert.equal(guideAdvice(item).level, 'caution'); assert.equal(guideAdvice(item, 'unknown-variant').level, 'caution');
  }
  const fish = GUIDE_ITEMS.find(item => item.id === 'lachs');
  assert.equal(guideAdvice(fish, 'raw').level, 'avoid'); assert.equal(guideAdvice(fish, 'cooked').level, 'ok');
});
test('heat does not remove contaminant advice and later dates do not permit alcohol or diving', () => {
  for (const id of ['thunfisch', 'alkohol', 'tauchen']) {
    const item = GUIDE_ITEMS.find(item => item.id === id);
    for (const age of [0, 97, 98, 196, 280, 293]) {
      guidePhaseNote(item, age); assert.equal(guideAdvice(item).level, 'avoid');
    }
  }
  assert.match(GUIDE_ITEMS.find(item => item.id === 'thunfisch').text, /Durchgaren beseitigt dieses Risiko nicht/);
});
test('sauna and trimester notes remain conditional, including outside the supported pregnancy', () => {
  const sauna = GUIDE_ITEMS.find(item => item.id === 'sauna');
  assert.equal(guideAdvice(sauna).level, 'caution');
  assert.match(guidePhaseNote(sauna, 97), /Frühe Phase/);
  assert.match(guidePhaseNote(sauna, 98), /keine automatische Freigabe/);
  for (const age of [-1, 294, undefined]) assert.match(guidePhaseNote(sauna, age), /Keine passende SSW/);
  assert.match(guidePhaseNote(GUIDE_ITEMS.find(item => item.id === 'leber'), 140), /Kalender und SSW allein/);
});
test('calendar context follows the existing dating for both methods without a second correction', () => {
  const today = '2026-11-17';
  const period = { method: 'period', lmp: '2026-10-16', cycle: 24 };
  const first = pregnancyTimeline(period, today);
  const second = pregnancyTimeline({ method: 'due-date', dueDate: first.dueDate }, today);
  for (const date of ['2026-10-16', today, first.dueDate]) assert.deepEqual(gestationOnDate(first, date), gestationOnDate(second, date));
});
