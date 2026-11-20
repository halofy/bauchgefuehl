import test from 'node:test';
import assert from 'node:assert/strict';
import {formatText,textBlocks} from '../src/text-format.js';
import {reportBody} from '../src/report.js';
test('paragraphs, bullet groups, continued lines and explicit numbered starts retain their text',()=>{
  const text='Meine Fragen\nfür die Praxis\n\n- Erstes Thema\n  mit Fortsetzung\n- Zweites Thema\n\n3. Drittes\n4. Viertes';
  assert.equal(formatText(text),'<p>Meine Fragen<br>für die Praxis</p><ul><li>Erstes Thema<br>mit Fortsetzung</li><li>Zweites Thema</li></ul><ol start="3"><li>Drittes</li><li>Viertes</li></ol>');
  assert.equal(textBlocks('Gewicht: -1 kg')[0].type,'p');
});
test('note formatting never interprets HTML, link syntax or script as active content',()=>{
  const html=formatText('- <img src=x onerror="alert(1)">\n- [Text](javascript:alert(1))\n\n<script>evil()</script>');
  assert.doesNotMatch(html,/<img|<script|<a\b|onerror="/);assert.match(html,/&lt;script&gt;/);
});
test('term sheet shows each selected question as a list with answer space, without changing original input',()=>{
  const report={from:'2026-11-01',to:'2026-11-20',fields:['careNotes'],entries:[],careNotes:[{kind:'qa',date:'2026-11-20',text:'- Frage eins\n- Frage zwei',answer:'- Erste Antwort',discussed:false}]};
  const before=JSON.stringify(report), html=reportBody(report,{answerSpace:true});
  assert.match(html,/<ul><li>Frage eins/);assert.match(html,/class="answer-space"/);assert.match(html,/Erste Antwort/);
  assert.equal(JSON.stringify(report),before);assert.doesNotMatch(reportBody(report),/class="answer-space"/);
});
