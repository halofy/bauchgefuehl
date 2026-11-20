import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAppointmentPdf,appointmentDocument} from '../src/appointment-pdf.js';
import {projectReport} from '../src/report.js';
import {normalizeCare,upsertCare} from '../src/care.js';
const font=new Uint8Array(await readFile(new URL('../src/vendor/NotoSans-Regular.ttf',import.meta.url)));
const base={from:'2026-11-01',to:'2026-11-20',fields:['careNotes'],entries:[],careNotes:[{date:'2026-11-20',kind:'qa',text:'- Größe, Übelkeit & Ernährung?\n- Rückfragen für die Ärztin',answer:'Ärztlich besprochen.',nextSteps:'',discussed:false}]};
test('real local PDF embeds its font and adds pages for long selected notes rather than truncating them',async()=>{
  const report=structuredClone(base);report.careNotes[0].text+='\n\n'+('Lange synthetische Frage mit Sonderzeichen äöüß. '.repeat(250));
  const before=JSON.stringify(report),bytes=await createAppointmentPdf(report,font),raw=new TextDecoder('latin1').decode(bytes);
  assert.ok(raw.startsWith('%PDF-'));assert.match(raw,/\/FontFile2/);assert.ok([...raw.matchAll(/\/Type \/Page\b/g)].length>=3);
  assert.equal(JSON.stringify(report),before);
});
test('unsupported characters fail explicitly with the HTML alternative instead of silently losing content',async()=>{
  const report=structuredClone(base);report.careNotes[0].text+=' 🧘';
  await assert.rejects(createAppointmentPdf(report,font),/HTML-Druckdatei/);
  assert.match(appointmentDocument(report),/🧘/);
});
test('appointment sheet receives only selected data; omitted appointment metadata and unrelated notes are absent',()=>{
  let care=normalizeCare();const stamp='2026-11-20T10:00:00.000Z';
  care=upsertCare(care,'appointments',{title:'PRIVATE_LOCATION_TITLE',date:'2026-11-25',time:'10:00',provider:'gyn',location:'OMITTED_LOCATION'},null,stamp);
  care=upsertCare(care,'notes',{kind:'qa',date:'2026-11-20',text:'Gewählte Frage',appointmentId:care.appointments[0].id,answer:'',nextSteps:'',discussed:false},null,stamp);
  const projected=projectReport([],{from:'2026-11-01',to:'2026-12-01',fields:['careNotes'],care});
  const html=appointmentDocument(projected);assert.match(html,/Gewählte Frage/);assert.doesNotMatch(html,/OMITTED_LOCATION|PRIVATE_LOCATION_TITLE|privateKey|appointmentId/);
});
