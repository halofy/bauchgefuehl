import { getAppLayout } from './layout.js';
const sections = ['ueberblick', 'wochenreise', 'fuer-dich', 'kalender', 'vorsorge', 'wissen'];
const mobile = getAppLayout();
let active = 'ueberblick', started = false, traversing = false;
const positions = new Map();
const STATE = 'bauchgefuehlNavigation';
function paint() {
  for (const id of sections) document.getElementById(id).classList.toggle('mobile-inactive', id !== active);
  for (const element of document.querySelectorAll('[data-mobile-panel]')) element.classList.toggle('mobile-inactive', element.dataset.mobilePanel !== active);
  for (const button of document.querySelectorAll('[data-scroll]')) {
    const selected = button.dataset.scroll === active; button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current');
  }
  const back = document.getElementById('app-back'); if (back) back.hidden = active === 'ueberblick';
}
function put(state, replace = false) { try { history[replace ? 'replaceState' : 'pushState']({ ...history.state, [STATE]:state }, '', location.href); } catch { /* Navigation stays usable without history storage. */ } }
export function showAppPanel(id, focus = false, record = true) {
  if (!sections.includes(id)) return;
  const changed = id !== active;
  positions.set(active, scrollY); active = id; paint();
  if (changed && started && record && !traversing) put({ panel:id });
  window.scrollTo({ top:positions.get(id) || 0,behavior:'instant' });
  if (focus) { const heading = document.getElementById(id).querySelector('h1,h2'); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll:true }); } }
}
export function setupAppNavigation() {
  started = true; document.body.classList.add('app-navigation'); paint();
  // One local root entry lets browser Back return to the overview instead of leaving immediately.
  put({ panel:'ueberblick',root:true },true); put({ panel:'ueberblick' });
  for (const button of document.querySelectorAll('[data-scroll]')) button.addEventListener('click', () => { showAppPanel(button.dataset.scroll,true); if(!mobile.matches) document.getElementById(active).scrollIntoView({behavior:'instant'}); });
  for (const button of document.querySelectorAll('[data-section-link]')) button.addEventListener('click', () => showAppPanel(button.dataset.sectionLink, true));
  for(const brand of document.querySelectorAll('a.brand')) brand.addEventListener('click',event=>{event.preventDefault();showAppPanel('ueberblick',true);});
  document.getElementById('app-back')?.addEventListener('click', () => history.back());
  window.addEventListener('popstate', event => {
    const target = event.state?.[STATE];
    if (!target) return;
    traversing = true;
    const dialog = [...document.querySelectorAll('dialog[open]')].at(-1);
    if (dialog && target.dialog !== dialog.id) {
      const cancel = new Event('cancel',{ cancelable:true });
      if (dialog.dispatchEvent(cancel)) dialog.close();
      if (dialog.open) { traversing = false; history.forward(); return; }
    }
    showAppPanel(sections.includes(target.panel) ? target.panel : 'ueberblick',true,false);
    if (target.dialog) { const previous = document.getElementById(target.dialog); if (previous && !previous.open) previous.showModal(); }
    if (target.root && mobile.matches) put({ panel:'ueberblick' });
    // Mutation observers run before this task and must not create a replacement dialog entry.
    setTimeout(() => { traversing = false; },0);
  });
  if(typeof MutationObserver === 'function') new MutationObserver(() => {
    if (traversing) return;
    const current=history.state?.[STATE];
    const top=[...document.querySelectorAll('dialog[open]')].at(-1);
    if(top && current?.dialog !== top.id) put({panel:active,dialog:top.id},Boolean(current?.dialog));
    else if(!top && current?.dialog) history.back();
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  mobile.subscribe(() => { paint(); if(mobile.matches) window.scrollTo({top:0,behavior:'instant'}); else document.getElementById(active).scrollIntoView({behavior:'instant'}); });
}
