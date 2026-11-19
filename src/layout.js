// CSS, navigation and journal panels all follow this one layout decision.
export const APP_LAYOUT_QUERY = '(max-width: 900px), (max-width: 1200px) and (pointer: coarse) and (hover: none), (display-mode: standalone)';

export function createAppLayout(view) {
  const media = view.matchMedia(APP_LAYOUT_QUERY);
  const listeners = new Set();
  let matches;
  function update() {
    const next = media.matches || view.navigator.standalone === true;
    view.document.documentElement.classList.toggle('app-layout', next);
    if (next === matches) return;
    matches = next;
    for (const listener of listeners) listener();
  }
  media.addEventListener('change', update);
  view.addEventListener('pageshow', update);
  update();
  return {
    get matches() { return matches; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}

let layout;
export function getAppLayout() {
  return layout ||= createAppLayout(window);
}

// Move the existing card, keeping DOM reading order, event handlers and open details intact.
export function arrangeOverviewFocus(document, mobile) {
  const focus = document.getElementById('today-focus');
  const anchor = document.body.classList.contains('postpartum-mode')
    ? document.getElementById('postpartum-summary')
    : mobile ? document.querySelector('.summary-grid > .pregnancy-card') : document.getElementById('mode-banner');
  if (focus && anchor && anchor.nextElementSibling !== focus) anchor.insertAdjacentElement('afterend', focus);
}
