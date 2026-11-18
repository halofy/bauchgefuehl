import { getAppLayout } from './layout.js';

const sections = ['ueberblick', 'wochenreise', 'journal', 'vorsorge', 'wissen'];
const mobile = getAppLayout();
let active = 'ueberblick';
const positions = new Map();

function paint() {
  for (const id of sections) document.getElementById(id).classList.toggle('mobile-inactive', id !== active);
  for (const element of document.querySelectorAll('[data-mobile-panel]')) {
    element.classList.toggle('mobile-inactive', element.dataset.mobilePanel !== active);
  }
  for (const button of document.querySelectorAll('[data-scroll]')) {
    const selected = button.dataset.scroll === active;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  }
}

export function showAppPanel(id, focus = false) {
  if (!sections.includes(id)) return;
  {
    positions.set(active, scrollY);
    active = id;
    paint();
    window.scrollTo({ top: positions.get(id) || 0, behavior: 'instant' });
    if (focus) {
      const heading = document.getElementById(id).querySelector('h1,h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
}

export function setupAppNavigation() {
  document.body.classList.add('app-navigation');
  paint();
  for (const button of document.querySelectorAll('[data-scroll]')) button.addEventListener('click', () => {
    showAppPanel(button.dataset.scroll, true);
    if (!mobile.matches) document.getElementById(active).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  mobile.subscribe(() => {
    paint();
    if (mobile.matches) window.scrollTo({ top: 0, behavior: 'instant' });
    else document.getElementById(active).scrollIntoView({ behavior: 'instant' });
  });
}
