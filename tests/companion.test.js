import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCompanion, changeCompanion, readCompanion, writeCompanion, companionContinuity, COMPANION_KEY, COMPANION_HISTORY_KEY } from '../src/companion.js';
import { readLocal, writeLocal, STORAGE_KEY, calculatePregnancy, validateProfile } from '../src/pregnancy.js';
const today='2026-11-18', t='2026-11-18T10:00:00.000Z';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const plan=(value=normalizeCompanion())=>changeCompanion(value,'plans',{area:'support',text:'Synthetischer Test: Essen organisieren',person:'Testperson',done:false},null,t,today);
test('planning changes and reversible archives retain records and original content',()=>{
 const one=plan(),p=one.plans[0];const done=changeCompanion(one,'plans',{...p,done:true},p,'2026-11-18T11:00:00.000Z',today);
 const archived=changeCompanion(done,'plans',{...done.plans[0],deletedAt:t},done.plans[0],'2026-11-18T12:00:00.000Z',today);
 const restored=changeCompanion(archived,'plans',{...archived.plans[0],deletedAt:null},archived.plans[0],'2026-11-18T13:00:00.000Z',today);
 assert.equal(restored.plans[0].deletedAt,null);assert.equal(restored.plans[0].text,p.text);assert.equal(restored.plans[0].done,true);
 assert.throws(()=>changeCompanion(done,'plans',{...p,done:false},p,t,today),/inzwischen/);
});
test('measurement types preserve exact values, units by kind, dates and notes',()=>{
 const value=changeCompanion(normalizeCompanion(),'growth',{date:today,kind:'crl',value:54,note:'Synthetischer Bericht'},null,t,today);
 assert.equal(value.growth[0].value,54);assert.equal(value.growth[0].kind,'crl');
 for(const patch of [{value:0},{value:NaN},{value:301},{date:'2026-11-19'},{kind:'unknown'}])assert.throws(()=>normalizeCompanion({...value,growth:[{...value.growth[0],...patch}]},today));
});
test('malformed plans, duplicate IDs and unknown schema fail without truncation',()=>{
 const value=plan();for(const altered of [{...value,v:2},{...value,plans:[...value.plans,...value.plans]},{...value,plans:Array(201).fill(value.plans[0])},{...value,plans:[{...value.plans[0],text:''}]},{...value,plans:[{...value.plans[0],id:12345678}]}])assert.throws(()=>normalizeCompanion(altered,today));
});
test('continuity blocks missing, older and conflicting planning or phase',()=>{
 const value=plan();assert.throws(()=>companionContinuity(undefined,value,today),/zurückgesetzt/);
 const lost={...value,plans:[],updatedAt:'2026-11-18T11:00:00.000Z'};assert.throws(()=>companionContinuity(lost,value,today),/verloren/);
 const conflict={...value,plans:[{...value.plans[0],text:'Andere Fassung'}]};assert.throws(()=>companionContinuity(conflict,value,today));
 companionContinuity(value,value,today);
});
test('history is written before a replacement; storage failure preserves active data',()=>{
 const s=storage();writeCompanion(s,plan(),today);const raw=s.getItem(COMPANION_KEY),previous=readCompanion(s,today);
 const next=changeCompanion(previous,'phase',{birthDate:today},null,t,today);
 const broken={getItem:s.getItem,setItem(k,v){if(k===COMPANION_HISTORY_KEY)throw new Error('Quota');s.setItem(k,v);}};
 assert.throws(()=>writeCompanion(broken,next,today),/Quota/);assert.equal(s.getItem(COMPANION_KEY),raw);
 writeCompanion(s,next,today);assert.equal(JSON.parse(s.getItem(COMPANION_HISTORY_KEY))[0].raw,raw);
});
test('an explicit postpartum phase keeps old pregnancy and journal writable without redating',()=>{
 const s=storage(),profile={method:'period',lmp:'2024-01-01',cycle:24,irregular:false};
 s.setItem(STORAGE_KEY,JSON.stringify({v:3,profile,checks:{},journal:[]}));
 assert.equal(readLocal(s,today).profile,null);
 writeCompanion(s,changeCompanion(normalizeCompanion(),'phase',{birthDate:'2024-10-01'},null,t,today),today);
 assert.deepEqual(readLocal(s,today).profile,profile);writeLocal(s,profile,{},today,[]);
 assert.equal(JSON.parse(s.getItem(STORAGE_KEY)).profile.lmp,'2024-01-01');
 assert.throws(()=>validateProfile(profile,today),/Jahr/);assert.equal(calculatePregnancy(profile,today).dueDate,'2024-10-03');
});
