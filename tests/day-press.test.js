import test from 'node:test';import assert from 'node:assert/strict';
import {setupDayPress} from '../src/day-press.js';
function fixture(){
  class Surface { listeners=new Map();addEventListener(name,action){this.listeners.set(name,[...(this.listeners.get(name)||[]),action]);}emit(name,data={}){const event={button:0,isPrimary:true,pointerId:1,clientX:10,clientY:10,target:{closest:()=>({disabled:false,dataset:{calendarDate:'2026-11-20'}})},preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...data};for(const action of this.listeners.get(name)||[])action(event);return event;} }
  const container=new Surface(),root=new Surface(),opened=[];let timer=null;
  setupDayPress(container,date=>opened.push(date),{root,schedule:cb=>(timer=cb,1),cancel:()=>{timer=null;}});
  return {container,root,opened,finish(){timer?.();}};
}
test('holding opens a day once and consumes the following click; a normal tap does not open it',()=>{
  const f=fixture();f.container.emit('pointerdown');f.root.emit('pointerup');f.finish();assert.deepEqual(f.opened,[]);
  f.container.emit('pointerdown');f.finish();assert.deepEqual(f.opened,['2026-11-20']);
  assert.equal(f.container.emit('click').stopped,true);assert.equal(f.container.emit('click').stopped,undefined);
});
test('scrolling, drag, second pointer and cancelled gestures never open a day',()=>{
  for(const [event,data] of [['scroll',{}],['pointercancel',{}],['pointermove',{clientY:50}],['pointerdown',{pointerId:2}],['blur',{}]]){
    const f=fixture();f.container.emit('pointerdown');f.root.emit(event,data);f.finish();assert.deepEqual(f.opened,[]);
  }
});
test('keyboard and context-menu alternatives expose the same day details without relying on a touch gesture',()=>{
  const f=fixture();const key=f.container.emit('keydown',{key:'Enter',shiftKey:true});assert.equal(key.defaultPrevented,true);
  f.container.emit('contextmenu');assert.deepEqual(f.opened,['2026-11-20','2026-11-20']);
});
