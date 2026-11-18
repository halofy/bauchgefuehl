import test from 'node:test';
import assert from 'node:assert/strict';
import { getMotherContent, MOTHER_REVIEWED, MOTHER_BODY_REVIEWED, MOTHER_SOURCES } from '../src/mother.js';
import { getWeekContent } from '../src/content.js';

test('all 42 weeks keep the existing body text and impulse with their original phase source', () => {
  for (let week = 1; week <= 42; week++) {
    const mother = getMotherContent(week); const existing = getWeekContent(week);
    assert.equal(mother.week, week); assert.equal(mother.body, existing.body); assert.equal(mother.tip, existing.tip); assert.equal(mother.bodySource, existing.source);
    assert.ok(mother.title && mother.prompt && mother.phaseStart <= week && mother.phaseEnd >= week);
    assert.equal(mother.bodyReviewed, MOTHER_BODY_REVIEWED); assert.equal(mother.reviewed, MOTHER_REVIEWED);
    assert.deepEqual(mother.topics.map(topic => topic.id), ['everyday', 'sleep', 'feelings', 'support']);
  }
});
test('selected running weeks retain exact completed-week phase boundaries without recalculating a due date', () => {
  assert.equal(getMotherContent(1).phaseLabel, '1.–4. SSW · 0+0 bis 3+6');
  assert.equal(getMotherContent(19).phaseLabel, '17.–20. SSW · 16+0 bis 19+6');
  assert.equal(getMotherContent(42).phaseLabel, '41.–42. SSW · 40+0 bis 41+6');
  assert.equal(getMotherContent(18).title, getMotherContent(19).title);
  assert.notEqual(getMotherContent(20).title, getMotherContent(21).title);
});
test('unknown, fractional and out-of-range weeks do not silently select plausible medical content', () => {
  for (const week of [0, -1, 43, NaN, Infinity, 19.5, '19', null, undefined]) assert.throws(() => getMotherContent(week), RangeError);
});
test('every deeper topic has directly assigned HTTPS sources and separates editorial NDR from primary nutrition information', () => {
  for (let week = 1; week <= 42; week++) {
    for (const topic of getMotherContent(week).topics) {
      assert.ok(topic.text && topic.title && topic.sources.length);
      for (const source of topic.sources) {
        assert.equal(new URL(source.url).protocol, 'https:');
        assert.ok(Object.values(MOTHER_SOURCES).some(candidate => candidate.url === source.url));
      }
    }
  }
  const food = getMotherContent(8).topics[0];
  assert.ok(food.sources.some(source => source.url === MOTHER_SOURCES.nutrition.url));
  assert.ok(food.sources.some(source => source.url === MOTHER_SOURCES.ndr.url));
  assert.ok(!getMotherContent(20).topics.find(topic => topic.id === 'sleep').sources.some(source => source.url === MOTHER_SOURCES.ndr.url));
});
test('later phase selection changes support and everyday focus while retaining a route to help beyond the due date', () => {
  assert.match(getMotherContent(6).topics[0].title, /Essen/);
  assert.match(getMotherContent(20).topics[0].title, /Bewegung/);
  assert.match(getMotherContent(32).topics[0].title, /Entlastung/);
  assert.equal(getMotherContent(42).topics.find(topic => topic.id === 'support').sources[0].url, MOTHER_SOURCES.help.url);
  assert.match(getMotherContent(42).body, /Betreuung/);
});
test('mutating a returned topic or source never changes another week or the source registry', () => {
  const before = JSON.stringify(getMotherContent(19));
  const content = getMotherContent(19); content.topics[0].text = 'Synthetic modified copy'; content.topics[0].sources[0].url = 'https://example.test/'; content.topics.pop();
  assert.equal(JSON.stringify(getMotherContent(19)), before);
  assert.notEqual(MOTHER_SOURCES.movement.url, 'https://example.test/');
});
