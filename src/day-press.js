// Pointer events work for touch, pen and mouse; scrolling and cancellation must never open a day.
export function setupDayPress(container, open, { delay = 550, schedule = setTimeout, cancel = clearTimeout, root = window } = {}) {
  let press = null, timer = null, suppressed = null;
  function stop() { if (timer !== null) cancel(timer); timer = null; press = null; }
  container.addEventListener('pointerdown', event => {
    if (press) { stop(); return; }
    const day = event.target.closest('[data-calendar-date]');
    if (!day || day.disabled || event.button !== 0 || event.isPrimary === false) return;
    press = { date:day.dataset.calendarDate, x:event.clientX, y:event.clientY, id:event.pointerId };
    timer = schedule(() => { const date=press?.date; stop(); if(date) { suppressed={date,until:Date.now()+900}; open(date); } }, delay);
  });
  root.addEventListener('pointermove', event => { if(press && (event.pointerId !== press.id || Math.hypot(event.clientX-press.x,event.clientY-press.y)>10)) stop(); }, {passive:true});
  root.addEventListener('pointerdown', event => { if(press && event.pointerId !== press.id) stop(); }, {passive:true});
  for (const name of ['pointerup','pointercancel','scroll','blur']) root.addEventListener(name, stop, {passive:true,capture:true});
  container.addEventListener('click', event => {
    if(suppressed && Date.now()<suppressed.until && event.target.closest('[data-calendar-date]')?.dataset.calendarDate===suppressed.date) { event.preventDefault(); event.stopImmediatePropagation(); suppressed=null; }
  }, true);
  container.addEventListener('contextmenu', event => {
    const day=event.target.closest('[data-calendar-date]'); if(!day || day.disabled)return;
    event.preventDefault(); stop(); if(!suppressed || Date.now()>=suppressed.until) open(day.dataset.calendarDate);
  });
  container.addEventListener('keydown', event => {
    const day=event.target.closest('[data-calendar-date]');
    if(day && !day.disabled && ((event.key==='Enter' && event.shiftKey) || (event.key==='ArrowDown' && event.altKey))) { event.preventDefault(); open(day.dataset.calendarDate); }
  });
}
