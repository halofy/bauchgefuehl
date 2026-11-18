import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import { readFile } from 'node:fs/promises';
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
const source=(await readFile(new URL('../src/navigation.js',import.meta.url),'utf8')).replace(/^import .*;\n/m,'').replaceAll('export function ','function ');
function app(){
 const classes=()=>{const s=new Set();return {add:x=>s.add(x),toggle(x,b){b?s.add(x):s.delete(x);},contains:x=>s.has(x)};};
 const events={},panels=new Map(['ueberblick','wochenreise','journal','vorsorge','wissen'].map(id=>[id,{classList:classes(),querySelector:()=>({focus(){}}),scrollIntoView(){}}]));
 let observer=()=>{},index=-1;const stack=[];
 const history={get state(){return stack[index];},pushState(value){stack.splice(++index);stack.push(value);},replaceState(value){if(index<0)index=0;stack[index]=value;},back(){if(index>0){index--;queueMicrotask(()=>events.popstate({state:this.state}));}},forward(){if(index<stack.length-1){index++;queueMicrotask(()=>events.popstate({state:this.state}));}}};
 let dirty=false;const dialog={id:'test-dialog',open:false,showModal(){this.open=true;queueMicrotask(observer);},close(){this.open=false;queueMicrotask(observer);},dispatchEvent(event){if(dirty)event.preventDefault();return !event.defaultPrevented;}};
 const back={hidden:true,addEventListener(type,fn){this.click=fn;}};
 const document={body:{classList:classes()},getElementById:id=>id==='app-back'?back:id===dialog.id?dialog:panels.get(id),querySelectorAll:selector=>selector==='dialog[open]'&&dialog.open?[dialog]:[]};
 const context={getAppLayout:()=>({matches:true,subscribe(){}}),document,window:{addEventListener(type,fn){events[type]=fn;},scrollTo(){}},scrollY:0,history,location:{href:'https://example.test/app/'},Event,setTimeout,MutationObserver:class{constructor(fn){observer=fn;}observe(){}}};
 vm.runInNewContext(source+'\nsetupAppNavigation();globalThis.show=showAppPanel;',context);
 return {context,history,dialog,panels,back,setDirty:value=>{dirty=value;},stack};
}
test('mobile Back navigates through visited panels and remains at overview root',async()=>{const a=app();a.context.show('journal');a.context.show('vorsorge');a.history.back();await tick();assert.equal(a.panels.get('journal').classList.contains('mobile-inactive'),false);a.history.back();await tick();assert.equal(a.panels.get('ueberblick').classList.contains('mobile-inactive'),false);a.history.back();await tick();assert.equal(a.history.state.bauchgefuehlNavigation.panel,'ueberblick');assert.ok(!a.history.state.bauchgefuehlNavigation.root);});
test('Back closes a dialog first and preserves its underlying panel',async()=>{const a=app();a.context.show('journal');a.dialog.showModal();await tick();a.history.back();await tick();assert.equal(a.dialog.open,false);assert.equal(a.panels.get('journal').classList.contains('mobile-inactive'),false);a.history.back();await tick();assert.equal(a.panels.get('ueberblick').classList.contains('mobile-inactive'),false);});
test('declining discard retains the dialog and its history entry',async()=>{const a=app();a.dialog.showModal();await tick();a.setDirty(true);a.history.back();await tick();assert.equal(a.dialog.open,true);assert.equal(a.history.state.bauchgefuehlNavigation.dialog,'test-dialog');a.setDirty(false);a.history.back();await tick();assert.equal(a.dialog.open,false);});
test('saving or closing a modal consumes its history entry without leaving its panel',async()=>{const a=app();a.context.show('vorsorge');a.dialog.showModal();await tick();a.dialog.close();await tick();assert.equal(a.history.state.bauchgefuehlNavigation.panel,'vorsorge');assert.equal(a.history.state.bauchgefuehlNavigation.dialog,undefined);});
