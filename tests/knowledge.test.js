import test from 'node:test';
import assert from 'node:assert/strict';
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_SOURCES, searchKnowledge, knowledgeHints, MILESTONE_ARTICLES } from '../src/knowledge.js';
import { milestones } from '../src/content.js';

test('knowledge search finds abbreviations, spelling variants and CMV synonyms', () => {
  for (const [query, id] of [['ZMV', 'cmv'], ['Cytomegalie', 'cmv'], ['Praenataldiagnostik', 'pnd'], ['NIPT', 'nipt'], ['Nackenfalte', 'ets'], ['FL', 'masse'], ['CTG', 'mutterpass'], ['oGTT', 'diabetes']]) {
    assert.ok(searchKnowledge(query).some(article => article.id === id), query);
  }
  assert.deepEqual(searchKnowledge('unbekannter-synthetischer-Begriff'), []);
});

test('reading hints use gestational days at their boundaries and do not create deadlines', () => {
  const ids = days => knowledgeHints(days).map(article => article.id);
  assert.deepEqual(ids(55), ['cmv', 'mutterpass']);
  assert.deepEqual(ids(56), ['nipt', 'ets']);
  assert.deepEqual(ids(97), ['nipt', 'ets']);
  assert.deepEqual(ids(98), ['pnd', 'masse']);
  assert.deepEqual(ids(168), ['diabetes', 'mutterpass']);
  for (const days of [-1, 294, NaN, undefined]) assert.deepEqual(ids(days), []);
  assert.deepEqual(knowledgeHints(70, 'other'), []);
  assert.equal(knowledgeHints(70, 'gyn').length, 2);
  assert.ok(searchKnowledge('CMV').some(article => article.id === 'cmv'));
});

test('every section has traceable sources and every linked topic and care mapping exists', () => {
  const ids = new Set(KNOWLEDGE_ARTICLES.map(article => article.id));
  assert.equal(ids.size, KNOWLEDGE_ARTICLES.length);
  for (const article of KNOWLEDGE_ARTICLES) {
    assert.ok(article.sections.length >= 2);
    for (const section of article.sections) {
      assert.ok(section.text && section.sources.length);
      for (const key of section.sources) assert.equal(new URL(KNOWLEDGE_SOURCES[key].url).protocol, 'https:');
    }
    for (const id of article.related ?? []) assert.ok(ids.has(id));
  }
  for (const [milestone, article] of Object.entries(MILESTONE_ARTICLES)) {
    assert.ok(milestones.some(item => item.id === milestone), milestone);
    assert.ok(ids.has(article));
  }
});
