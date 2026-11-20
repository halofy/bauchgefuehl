import test from 'node:test';import assert from 'node:assert/strict';
import { growthAt,measurementContext,developmentImage,illustrationForWeek,GROWTH_ANCHORS } from '../src/growth.js';
import { helpForSymptom,symptomHelp } from '../src/symptoms.js';
import { weeklyDevelopmentImage, weeklyMotif } from '../src/development-art.js';
test('NHS completed weeks map to gestational days and German ordinal week correctly',()=>{assert.equal(growthAt(56).cm,1.6);assert.equal(growthAt(84).cm,5.4);assert.equal(growthAt(280).cm,51.2);assert.equal(growthAt(41),null);assert.equal(growthAt(281),null);});
test('daily intermediate estimates stay between same-method source anchors',()=>{for(const anchor of GROWTH_ANCHORS)assert.equal(growthAt(anchor.day).cm,anchor.cm);const mid=growthAt(70);assert.equal(mid.cm,3.5);assert.equal(mid.interpolated,true);assert.equal(mid.sources.length,2);});
test('measurement switch is never interpolated and is separately labelled',()=>{assert.equal(growthAt(139).cm,15.3);assert.equal(growthAt(139).kind,'crl');assert.equal(growthAt(139).held,true);assert.equal(growthAt(140).cm,25.6);assert.equal(growthAt(140).kind,'length');});
test('personal measurements compare only matching methods and never change reference curve',()=>{const before=growthAt(84);assert.equal(measurementContext({kind:'crl',value:54},84).cm,5.4);assert.equal(measurementContext({kind:'length',value:54},84).reference,null);assert.deepEqual(growthAt(84),before);});
test('symptom lookup is explicit and every card has reviewable HTTPS provenance',()=>{assert.equal(helpForSymptom(' ÜBELKEIT ').key,'übelkeit');assert.equal(helpForSymptom('Unbekannt'),null);for(const x of symptomHelp){assert.match(x.source,/^https:/);assert.ok(x.contact);assert.ok(x.help);}});


test('each week renders a distinct, accessible vector drawing without external images', () => {
  const drawings = Array.from({ length: 42 }, (_, index) => developmentImage(index + 1));
  const geometry = drawing => drawing.replace(/<defs>[\s\S]*?<\/defs>/, '')
    .replace(/url\(#[^)]+\)/g, '').match(/<g transform="[\s\S]+<\/g>|<ellipse[\s\S]+?(?=<\/svg>)/)[0];
  assert.equal(new Set(drawings.map(geometry)).size, 42);
  for (const [index, drawing] of drawings.entries()) {
    assert.match(drawing, new RegExp(`aria-label="[^"]+${index + 1}\\. SSW`));
    assert.doesNotMatch(drawing, /NaN|undefined|<img\b|<image\b|href=/);
  }
  for (const value of [0, 43, 1.5, NaN, Infinity, '24', null]) {
    assert.throws(() => illustrationForWeek(value), RangeError);
  }
});

test('late weeks change the silhouette itself and the overview has separate gradient IDs', () => {
  const outline = week => /development-silhouette" d="([^"]+)"/.exec(developmentImage(week))[1];
  assert.equal(new Set(Array.from({ length: 21 }, (_, index) => outline(index + 22))).size, 21);
  const overview = developmentImage(19, 'overview');
  const journey = developmentImage(19);
  const ids = [...(overview + journey).matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const view of [overview, journey]) {
    for (const [, id] of view.matchAll(/url\(#([^)]+)\)/g)) assert.ok(view.includes(`id="${id}"`));
  }
});

test('early outlines evolve in small steps around week 11 and keep facial detail for later', () => {
  const outline = week => /development-silhouette" d="([^"]+)"/.exec(developmentImage(week))[1];
  const coordinates = week => outline(week).match(/-?\d+(?:\.\d+)?/g).map(Number);
  for (let week = 10; week <= 16; week++) {
    const previous = coordinates(week - 1);
    const current = coordinates(week);
    assert.equal(previous.length, current.length);
    const largestStep = Math.max(...current.map((value, index) => Math.abs(value - previous[index])));
    assert.ok(largestStep > 0 && largestStep < 10, `outline changes gradually in week ${week}`);
  }
  for (let week = 5; week <= 19; week++) assert.doesNotMatch(developmentImage(week), /development-eye/);
  assert.match(developmentImage(21), /development-eye/);
});

test('the overview and the journey share a distinct offline image per week', async () => {
  const { readFile } = await import('node:fs/promises');
  const { files } = JSON.parse(await readFile(new URL('../docs/assets/development-weekly-motifs.json', import.meta.url), 'utf8'));
  assert.equal(files.length, 42);
  assert.equal(new Set(files.map(file => file.delivered)).size, 42);
  for (let week = 1; week <= 42; week++) {
    const file = files[week - 1];
    const motif = weeklyMotif(week);
    assert.equal(file.week, week);
    assert.equal(motif.src, './' + file.delivered);
    assert.deepEqual([motif.first, motif.last], file.phase);
    assert.ok(week >= motif.first && week <= motif.last);
    const drawing = weeklyDevelopmentImage(week);
    assert.ok(drawing.includes(`src="${motif.src}"`));
    const caption = week <= 2
      ? (week === 1 ? 'Symbolischer Zyklusbeginn' : 'Symbol für die Vorbereitung auf den Eisprung')
      : `Bildliche Orientierung · ${motif.first}. bis ${motif.last}. SSW`;
    assert.ok(drawing.includes(`<figcaption>${caption}</figcaption>`));
    const overview = weeklyDevelopmentImage(week, 'overview');
    assert.ok(overview.includes(`src="${motif.src}"`));
    if (week <= 2) assert.ok(overview.includes(`<span>${caption}</span>`));
    assert.doesNotMatch(overview, /<figcaption/);
  }
  assert.throws(() => weeklyMotif(0), RangeError);
  for (const file of files) {
    const image = await readFile(new URL('../' + file.delivered, import.meta.url));
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  }
});
