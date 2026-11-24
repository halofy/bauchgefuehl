import { KNOWLEDGE_ARTICLES, KNOWLEDGE_REVIEWED, KNOWLEDGE_SOURCES, searchKnowledge, knowledgeHints } from './knowledge.js';
import { searchGuide } from './guide.js';
import { symptomHelp } from './symptoms.js';
import { searchKey } from './guide.js';
import { formatDate } from './dates.js';

export function setupKnowledge({ guide, getAge, isPostpartum, canEdit, openQuestion }) {
  const $ = id => document.getElementById(id);
  const make = (tag, text, className = '') => {
    const element = document.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
  };
  const button = (label, action, className = 'text-link') => {
    const element = make('button', label, className);
    element.type = 'button'; element.addEventListener('click', action);
    return element;
  };
  const sourceLink = key => {
    const source = KNOWLEDGE_SOURCES[key];
    const link = make('a', source.title + ' ↗', 'source-link');
    link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  };
  let category = '';
  $('knowledge-articles').after($('symptom-help'));
  let pendingQuestion = null;
  const dialog = $('knowledge-dialog');
  dialog.addEventListener('close', () => {
    if (!pendingQuestion) return;
    const question = pendingQuestion;
    pendingQuestion = null;
    setTimeout(() => openQuestion(question.text, question.appointmentId), 120);
  });
  $('knowledge-close').addEventListener('click', () => dialog.close());

  function openArticle(id, appointmentId = null) {
    const article = KNOWLEDGE_ARTICLES.find(item => item.id === id);
    if (!article) return;
    $('knowledge-article-title').textContent = article.title;
    const content = $('knowledge-article-body'); content.replaceChildren();
    content.append(make('p', article.summary, 'knowledge-lead'));
    for (const part of article.sections) {
      const section = make('section', '');
      section.append(make('h3', part.title), make('p', part.text));
      const sources = make('div', '', 'knowledge-sources');
      for (const key of part.sources) sources.append(sourceLink(key));
      section.append(sources); content.append(section);
    }
    if (article.question) {
      content.append(button('Als eigene Frage vormerken', () => {
        pendingQuestion = { text: article.question, appointmentId };
        dialog.close();
      }, 'button button-outline'));
      content.lastElementChild.disabled = !canEdit();
    }
    if (article.related?.length) {
      const related = make('nav', '', 'knowledge-related');
      related.setAttribute('aria-label', 'Verwandte Themen');
      for (const id of article.related) {
        const other = KNOWLEDGE_ARTICLES.find(item => item.id === id);
        related.append(button(other.title + ' ›', () => openArticle(id, appointmentId)));
      }
      content.append(related);
    }
    if (article.extra?.length) {
      const extra = make('details', '', 'knowledge-extra');
      extra.append(make('summary', 'Ergänzend lesen oder hören'));
      extra.append(make('p', 'Podcast-Themen ergänzen die Orientierung. Die medizinischen Aussagen sind oben mit Fachquellen belegt.'));
      for (const key of article.extra) extra.append(sourceLink(key));
      content.append(extra);
    }
    content.append(make('p', `Redaktionell geprüft am ${formatDate(KNOWLEDGE_REVIEWED)}. Zusammenfassung offline verfügbar. Originalquellen und Audio benötigen Internet.`, 'content-note'));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $('knowledge-article-title').focus({ preventScroll: true });
  }

  function render() {
    const query = $('knowledge-search').value.trim();
    const articles = searchKnowledge(query, category);
    const listing = $('knowledge-articles'); listing.replaceChildren();
    const selected = query || category ? articles : articles.filter(item => ['nipt', 'cmv', 'pnd', 'mutterpass'].includes(item.id));
    for (const article of selected) {
      const row = button('', () => openArticle(article.id), 'knowledge-row');
      const copy = make('span', ''); copy.append(make('strong', article.title), make('span', article.summary));
      row.append(copy, make('span', '›')); listing.append(row);
    }
    const foods = (!category || category === 'food') && (category === 'food' || query) && searchGuide({ query }).length > 0;
    $('everyday-guide').hidden = !foods;
    if (foods) {
      $('guide-search').value = query;
      if (query) {
        $('guide-category').value = '';
        $('guide-level').value = '';
      }
      guide.render();
    }
    const symptom = query ? symptomHelp.find(item => searchKey(item.title).includes(searchKey(query))) : null;
    $('symptom-help').hidden = category !== 'symptoms' && !symptom;
    if (symptom) {
      $('symptom-help-select').value = symptom.key;
      $('symptom-help-select').dispatchEvent(new Event('change'));
    }
    $('knowledge-basics').hidden = category !== 'basics';
    $('knowledge-empty').hidden = !query || selected.length > 0 || foods || !!symptom || category === 'basics';
    $('knowledge-status').textContent = query ? `${selected.length} Artikel${foods ? ' und passende Lebensmittel / Aktivitäten' : ''}${symptom ? ' sowie Beschwerdenhilfe' : ''}` : category ? '' : 'Häufig gesucht';
    for (const item of document.querySelectorAll('[data-knowledge-category]')) item.setAttribute('aria-pressed', String(item.dataset.knowledgeCategory === category));
  }
  for (const item of document.querySelectorAll('[data-knowledge-category]')) item.addEventListener('click', () => {
    category = item.dataset.knowledgeCategory;
    $('knowledge-search').value = '';
    render();
  });
  $('knowledge-search').addEventListener('input', render);
  function showCategory(value) { category = value; $('knowledge-search').value = ''; render(); }
  function hints(target, date, { provider = '', appointmentId = null } = {}) {
    target.replaceChildren();
    let articles = [];
    try { if (!isPostpartum(date)) articles = knowledgeHints(getAge(date), provider); } catch { /* Invalid dating does not fabricate a hint. */ }
    target.hidden = !articles.length;
    if (!articles.length) return;
    target.append(make('p', `Zum Nachlesen · ${formatDate(date)}`, 'knowledge-hint-label'));
    for (const article of articles) target.append(button(article.title + ' ›', () => openArticle(article.id, appointmentId)));
    target.append(make('p', 'Themen zur SSW an diesem Tag. Was für dich passt, besprichst du in der Praxis.', 'field-hint'));
  }
  render();
  return { render, openArticle, hints, showCategory };
}
