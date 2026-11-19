import test from 'node:test';import assert from 'node:assert/strict';
import { growthAt,measurementContext,developmentImage,illustrationForWeek,GROWTH_ANCHORS } from '../src/growth.js';
import { helpForSymptom,symptomHelp } from '../src/symptoms.js';
test('NHS completed weeks map to gestational days and German ordinal week correctly',()=>{assert.equal(growthAt(56).cm,1.6);assert.equal(growthAt(84).cm,5.4);assert.equal(growthAt(280).cm,51.2);assert.equal(growthAt(41),null);assert.equal(growthAt(281),null);});
test('daily intermediate estimates stay between same-method source anchors',()=>{for(const anchor of GROWTH_ANCHORS)assert.equal(growthAt(anchor.day).cm,anchor.cm);const mid=growthAt(70);assert.equal(mid.cm,3.5);assert.equal(mid.interpolated,true);assert.equal(mid.sources.length,2);});
test('measurement switch is never interpolated and is separately labelled',()=>{assert.equal(growthAt(139).cm,15.3);assert.equal(growthAt(139).kind,'crl');assert.equal(growthAt(139).held,true);assert.equal(growthAt(140).cm,25.6);assert.equal(growthAt(140).kind,'length');});
test('personal measurements compare only matching methods and never change reference curve',()=>{const before=growthAt(84);assert.equal(measurementContext({kind:'crl',value:54},84).cm,5.4);assert.equal(measurementContext({kind:'length',value:54},84).reference,null);assert.deepEqual(growthAt(84),before);});
test('symptom lookup is explicit and every card has reviewable HTTPS provenance',()=>{assert.equal(helpForSymptom(' ÜBELKEIT ').key,'übelkeit');assert.equal(helpForSymptom('Unbekannt'),null);for(const x of symptomHelp){assert.match(x.source,/^https:/);assert.ok(x.contact);assert.ok(x.help);}});


test('all pregnancy weeks select a local image; invalid week values are rejected',()=>{
  const selected=Array.from({length:42},(_,i)=>illustrationForWeek(i+1));
  assert.equal(new Set(selected.map(x=>x.id)).size,42);
  for(const frame of selected){assert.equal(frame.from,frame.week);assert.equal(frame.to,frame.week);assert.equal(frame.id,`woche_${String(frame.week).padStart(2,'0')}`);assert.match(frame.src,/^\.\/images\/development\/[a-z0-9_-]+\.png$/);assert.match(developmentImage(frame.week),/alt="[^"<>]+"/);}
  for(const value of [0,43,1.5,NaN,Infinity,'24',null])assert.throws(()=>illustrationForWeek(value),RangeError);
  assert.notEqual(illustrationForWeek(21).src,illustrationForWeek(28).src);
  assert.notEqual(illustrationForWeek(32).src,illustrationForWeek(40).src);
  const before=growthAt(196);developmentImage(29);assert.deepEqual(growthAt(196),before);
});

test('all 42 supplied PNGs match their recorded source bytes and dimensions',async()=>{
  const {readFile}=await import('node:fs/promises');const {createHash}=await import('node:crypto');
  const provenance=JSON.parse(await readFile(new URL('../docs/assets/development-series.json',import.meta.url),'utf8'));assert.equal(provenance.images.length,42);
  const paths=new Set(Array.from({length:42},(_,i)=>illustrationForWeek(i+1).src));const hashes=new Set();
  for(const path of paths){const png=await readFile(new URL('../'+path,import.meta.url));
    assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    const original=provenance.images.find(x=>'./'+x.file===path);assert.ok(original);
    assert.equal(png.readUInt32BE(16),original.width);assert.equal(png.readUInt32BE(20),original.height);assert.equal(png.length,original.bytes);
    const hash=createHash('sha256').update(png).digest('hex');assert.equal(hash,original.sha256);hashes.add(hash);
  }
  assert.equal(hashes.size,paths.size,'each week has its own actual image');
});
