import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, dayNumber } from '../src/dates.js';
import { calculatePregnancy } from '../src/pregnancy.js';
import { pregnancyTimeline, gestationOnDate, dateForSsw, monthStart, shiftMonth, monthDays, timelineEvents, eventsOnDate, entriesOnDate, upcomingEvents, weekRanges } from '../src/calendar.js';

const today = '2026-11-17';
const period = { method: 'period', lmp: '2026-07-09', cycle: 30 };
const timeline = pregnancyTimeline(period, today);

test('calendar projects from the existing calculation, consistently for cycle and ET methods', () => {
  assert.equal(timeline.start, '2026-07-11');
  assert.equal(timeline.dueDate, '2027-04-17');
  const fromEt = pregnancyTimeline({ method: 'due-date', dueDate: timeline.dueDate }, today);
  assert.equal(fromEt.start, timeline.start);
  for (const date of [today, '2026-12-01', '2027-04-17', '2027-04-30']) {
    assert.deepEqual(gestationOnDate(timeline, date), gestationOnDate(fromEt, date));
    assert.equal(gestationOnDate(timeline, date).age, calculatePregnancy(period, date).gestationalDays);
  }
});

test('short and long cycles map dates and SSW in both directions without another adjustment', () => {
  for (const cycle of [21, 24, 28, 30, 35]) {
    const t = pregnancyTimeline({ ...period, cycle }, today);
    for (let age = 0; age <= 299; age++) {
      const text = `${Math.floor(age / 7)}+${age % 7}`;
      const date = dateForSsw(t, text);
      assert.equal(dayNumber(date) - dayNumber(t.start), age);
      assert.equal(gestationOnDate(t, date).age, age);
    }
    assert.equal(dateForSsw(t, '40+0'), t.dueDate);
  }
});

test('calendar age boundaries distinguish completed weeks, ordinal week, and content limits', () => {
  assert.deepEqual(gestationOnDate(timeline, timeline.start), { age: 0, weeks: 0, days: 0, weekNumber: 1, status: 'ongoing' });
  assert.equal(gestationOnDate(timeline, addDays(timeline.start, -1)).status, 'before');
  assert.equal(gestationOnDate(timeline, addDays(timeline.start, 293)).weekNumber, 42);
  assert.equal(gestationOnDate(timeline, addDays(timeline.start, 293)).status, 'ongoing');
  assert.equal(gestationOnDate(timeline, addDays(timeline.start, 294)).status, 'beyond');
  assert.equal(gestationOnDate(timeline, timeline.dueDate).weeks, 40);
});

test('SSW lookup rejects ambiguous ordinal-only values and impossible day numbers', () => {
  assert.equal(dateForSsw(timeline, ' 24+0 '), addDays(timeline.start, 168));
  for (const input of ['24', '24. SSW', '24+7', '43+0', '-1+0', '1.5+0', '', '24+0oops']) assert.throws(() => dateForSsw(timeline, input));
});

test('month cells start on Monday and include leap day and adjacent months', () => {
  const february = monthDays('2024-02');
  assert.equal(february.length, 42); assert.equal(new Set(february).size, 42);
  assert.equal(february[0], '2024-01-29'); assert.ok(february.includes('2024-02-29'));
  assert.equal(february.at(-1), '2024-03-10');
  assert.equal(monthDays('2026-11')[0], '2026-10-26');
});

test('month navigation handles year changes and supported input boundaries', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01'); assert.equal(shiftMonth('2026-01', -1), '2025-12');
  for (const input of ['2026-13', '2026-2', '1899-12', '2201-01', '2026-02-01']) assert.throws(() => monthStart(input));
  assert.throws(() => shiftMonth('1900-01', -1)); assert.throws(() => shiftMonth('2200-12', 1));
});

test('care windows include both boundaries, exclude surrounding days, and retain sources', () => {
  const events = timelineEvents(timeline);
  for (const id of ['scan-1', 'scan-2', 'diabetes', 'scan-3']) {
    const event = events.find(e => e.id === id);
    assert.ok(eventsOnDate(events, event.date).includes(event)); assert.ok(eventsOnDate(events, event.endDate).includes(event));
    assert.ok(!eventsOnDate(events, addDays(event.date, -1)).includes(event)); assert.ok(!eventsOnDate(events, addDays(event.endDate, 1)).includes(event));
    assert.ok(event.source.startsWith('https://'));
  }
  assert.equal(events.find(e => e.id === 'diabetes').date, dateForSsw(timeline, '24+0'));
  assert.equal(events.find(e => e.id === 'scan-2').endDate, dateForSsw(timeline, '21+6'));
});

test('trimester convention, halfway and due date are single-day milestones', () => {
  const events = timelineEvents(timeline);
  for (const [id, ssw] of [['trimester-2', '14+0'], ['halfway', '20+0'], ['trimester-3', '28+0'], ['due-date', '40+0']]) {
    const event = events.find(e => e.id === id);
    assert.equal(event.type, 'point'); assert.equal(event.date, dateForSsw(timeline, ssw)); assert.equal(event.endDate, event.date);
    assert.ok(!eventsOnDate(events, addDays(event.date, 1)).includes(event));
  }
  assert.equal(events.find(e => e.id === 'due-care').endDate, dateForSsw(timeline, '41+6'));
});

test('future overview includes ongoing care windows and skips expired windows', () => {
  const events = timelineEvents(timeline);
  const list = upcomingEvents(events, today);
  assert.equal(list[0].id, 'scan-2');
  assert.ok(!list.some(e => e.id === 'scan-1')); assert.ok(list.some(e => e.id === 'halfway')); assert.ok(list.length <= 6);
  assert.deepEqual(upcomingEvents(events, dateForSsw(timeline, '42+0')), []);
});

test('42 week ranges are contiguous and use ordinal weeks independently of full weeks', () => {
  const weeks = weekRanges(timeline);
  assert.equal(weeks.length, 42); assert.equal(weeks[0].ssw, '0+0–0+6');
  assert.equal(weeks[40].weekNumber, 41); assert.equal(weeks[40].date, timeline.dueDate);
  assert.equal(weeks.at(-1).endDate, dateForSsw(timeline, '41+6'));
  for (let i = 1; i < weeks.length; i++) assert.equal(weeks[i].date, addDays(weeks[i - 1].endDate, 1));
});

test('calendar journal joins use the civil date, preserve multiple observations and omit archived entries', () => {
  const entries = [
    { id: 'synthetic-1', date: today, time: '18:00', createdAt: '2026-11-17T17:00:00.000Z', text: 'Synthetische Notiz', deletedAt: null },
    { id: 'synthetic-2', date: today, time: '08:00', createdAt: '2026-11-17T07:00:00.000Z', deletedAt: null },
    { id: 'synthetic-3', date: today, time: '', deletedAt: '2026-11-17T10:00:00.000Z' },
    { id: 'synthetic-4', date: '2026-11-16', time: '', deletedAt: null },
  ];
  const before = JSON.stringify(entries);
  assert.deepEqual(entriesOnDate(entries, today).map(e => e.id), ['synthetic-2', 'synthetic-1']);
  assert.equal(JSON.stringify(entries), before);
});

test('timeline stays stable on a new day and calendar projection does not modify profile or journal data', () => {
  const before = JSON.stringify(period);
  assert.deepEqual(pregnancyTimeline(period, addDays(today, 1)), timeline);
  timelineEvents(timeline); monthDays('2027-04'); dateForSsw(timeline, '40+0');
  assert.equal(JSON.stringify(period), before);
});
