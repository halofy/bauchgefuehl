import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createAppLayout, APP_LAYOUT_QUERY } from '../src/layout.js';

function classes() {
  const values = new Set();
  return { add: name => values.add(name), contains: name => values.has(name), toggle(name, enabled) { if (enabled) values.add(name); else values.delete(name); } };
}
function environment(matches = false, standalone = false) {
  const events = {};
  const media = { matches, addEventListener(type, callback) { this.change = callback; } };
  const view = {
    navigator: { standalone }, document: { documentElement: { classList: classes() } },
    matchMedia(query) { assert.equal(query, APP_LAYOUT_QUERY); return media; },
    addEventListener(type, callback) { events[type] = callback; },
  };
  return { view, media, events, setMatches(value) { media.matches = value; media.change(); } };
}

test('layout selection applies its initial state to the document before consumers render', () => {
  for (const value of [true, false]) {
    const { view } = environment(value);
    const layout = createAppLayout(view);
    assert.equal(layout.matches, value);
    assert.equal(view.document.documentElement.classList.contains('app-layout'), value);
  }
});

test('iOS standalone fallback forces app layout even when the media query does not match', () => {
  const { view, setMatches, events } = environment(false, true);
  const layout = createAppLayout(view);
  assert.equal(layout.matches, true);
  setMatches(false);
  assert.equal(layout.matches, true);
  view.navigator.standalone = false; events.pageshow();
  assert.equal(layout.matches, false);
  assert.equal(view.document.documentElement.classList.contains('app-layout'), false);
});

test('layout changes notify consumers after styling changes and preserve user choices within the same mode', () => {
  const env = environment(false);
  const layout = createAppLayout(env.view);
  const changes = [];
  const unsubscribe = layout.subscribe(() => changes.push([layout.matches, env.view.document.documentElement.classList.contains('app-layout')]));
  env.setMatches(true); env.setMatches(true); env.events.pageshow(); env.setMatches(false);
  assert.deepEqual(changes, [[true, true], [false, false]]);
  unsubscribe(); env.setMatches(true);
  assert.equal(changes.length, 2);
});

test('navigation follows the shared mode, retains the selected panel and switches back to desktop scrolling', async () => {
  const env = environment(true);
  const layout = createAppLayout(env.view);
  const ids = ['ueberblick', 'wochenreise', 'journal', 'vorsorge', 'wissen'];
  const scrolled = [];
  const panels = new Map(ids.map(id => [id, { classList: classes(), querySelector: () => ({ focus() {} }), scrollIntoView() { scrolled.push(id); } }]));
  const buttons = ids.map(id => ({ dataset: { scroll: id }, classList: classes(), setAttribute() {}, removeAttribute() {}, addEventListener(type, callback) { this.click = callback; } }));
  const context = {
    getAppLayout: () => layout,
    document: { body: { classList: classes() }, getElementById: id => panels.get(id), querySelectorAll: selector => selector === '[data-scroll]' ? buttons : [] },
    window: { addEventListener() {}, scrollTo() {} }, scrollY: 120,
    matchMedia: () => ({ matches: true }), requestAnimationFrame: callback => callback(),
  };
  const source = (await readFile(new URL('../src/navigation.js', import.meta.url), 'utf8')).replace(/^import .*;\n/m, '').replaceAll('export function ', 'function ');
  vm.runInNewContext(source + '\nsetupAppNavigation();', context);
  buttons[2].click();
  assert.equal(panels.get('journal').classList.contains('mobile-inactive'), false);
  for (const id of ids.filter(id => id !== 'journal')) assert.equal(panels.get(id).classList.contains('mobile-inactive'), true);
  env.setMatches(false);
  assert.deepEqual(scrolled, ['journal']);
  env.setMatches(true);
  assert.equal(panels.get('journal').classList.contains('mobile-inactive'), false);
});
