import { getMotherContent } from './mother.js';
import { formatDate } from './dates.js';

export function setupMother() {
  const $ = id => document.getElementById(id);
  const node = (tag, className, text) => { const item = document.createElement(tag); item.className = className; item.textContent = text; return item; };
  function sourceLink(title, url) {
    const link = node('a', 'source-link', title + ' ↗');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
  }
  function render(week, range = '') {
    const content = getMotherContent(week);
    $('personal-mother-week').textContent = [`${week}. SSW`, range].filter(Boolean).join(' · ');
    $('mother-title').textContent = content.title;
    $('mother-phase').textContent = `Themen für die Phase ${content.phaseLabel}`;
    $('body-description').textContent = content.body; $('week-tip').textContent = content.tip;
    $('mother-prompt').textContent = content.prompt;
    $('mother-body-source').href = content.bodySource;
    $('mother-body-source').textContent = `Körper & Wochenimpuls · ${week <= 40 ? 'BIÖG' : 'NHS'} · geprüft ${formatDate(content.bodyReviewed, { year: 'numeric', month: '2-digit', day: '2-digit' })} ↗`;
    $('mother-reviewed').textContent = `Vertiefende Themen: geprüft am ${formatDate(content.reviewed)}. Typische Möglichkeiten innerhalb einer Phase, keine Vorgabe dafür, wie du dich fühlen musst. Die Wochenvorschau ändert deine gespeicherte Datierung nicht.`;
    const list = $('mother-topics');
    const opened = new Set([...list.querySelectorAll('details[open]')].map(item => item.dataset.topic));
    list.replaceChildren();
    for (const topic of content.topics) {
      const details = document.createElement('details'); details.className = 'mother-topic'; details.dataset.topic = topic.id; details.open = opened.has(topic.id);
      details.append(node('summary', '', topic.title), node('p', '', topic.text));
      const links = node('div', 'mother-sources', '');
      for (const source of topic.sources) links.append(sourceLink(source.title, source.url));
      details.append(links); list.append(details);
    }
  }
  return { render };
}
