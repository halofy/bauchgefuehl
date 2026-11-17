import { todayISO, formatDate, dayNumber, calculatePregnancy } from './pregnancy.js';
import { pregnancyTimeline, gestationOnDate } from './calendar.js';
import { GUIDE_SOURCES, GUIDE_REVIEWED, GUIDE_LEVELS, guideAdvice, searchGuide, guidePhaseNote } from './guide.js';

export function setupGuide({ getProfile, getMode, getToday = todayISO }) {
  const $ = id => document.getElementById(id);
  const node = (tag, className, text) => { const element = document.createElement(tag); element.className = className; element.textContent = text; return element; };
  const variants = {};
  let date = getToday();
  $('guide-date').value = date;
  function render() {
    let age;
    try {
      dayNumber($('guide-date').value);
      if ($('guide-date').value < '1900-01-01' || $('guide-date').value > '2200-12-31') throw new Error('Bitte ein Datum zwischen 1900 und 2200 wählen.');
      date = $('guide-date').value;
      age = gestationOnDate(pregnancyTimeline(getProfile(), getToday()), date);
      $('guide-date-error').hidden = true;
    } catch (cause) {
      $('guide-date-error').textContent = cause.message; $('guide-date-error').hidden = false;
    }
    const mode = getMode() === 'demo' ? 'Beispieldaten' : getMode() === 'shared' ? 'Geteilte Datierung' : 'Deine Datierung';
    const uncertain = calculatePregnancy(getProfile(), getToday()).uncertain;
    $('guide-context').textContent = age ? `${mode} · ${formatDate(date)} · ${age.status === 'before' ? 'vor rechnerischem Beginn' : `${age.weeks}+${age.days} · ${age.weekNumber}. SSW`}${uncertain ? ' · unsichere Schätzung' : ''}. Der Datumsbezug ist Orientierung, keine persönliche Freigabe.` : 'Ohne gültigen Datumsbezug: vollständige Bedingungen und Phasenhinweise beachten.';
    const items = searchGuide({ query: $('guide-search').value, category: $('guide-category').value, level: $('guide-level').value, variants });
    $('guide-count').textContent = `${items.length} Treffer · Redaktionell geprüft: ${formatDate(GUIDE_REVIEWED)}`;
    const results = $('guide-results'); results.replaceChildren();
    for (const item of items) {
      const advice = guideAdvice(item, variants[item.id]);
      const card = node('details', 'guide-item card', '');
      card.dataset.guideId = item.id;
      const summary = node('summary', '', '');
      const badge = node('span', `guide-badge guide-${advice.level}`, `${GUIDE_LEVELS[advice.level].symbol} ${GUIDE_LEVELS[advice.level].label}`);
      summary.append(node('strong', '', item.title), badge); card.append(summary);
      const content = node('div', 'guide-item-content', '');
      if (item.variants) {
        const label = node('label', '', 'Zubereitung / Sorte'); const select = document.createElement('select');
        const empty = node('option', '', 'Bitte auswählen …'); empty.value = ''; select.append(empty);
        for (const choice of item.variants) { const option = node('option', '', choice.label); option.value = choice.id; select.append(option); }
        select.value = variants[item.id] || '';
        select.addEventListener('change', () => {
          variants[item.id] = select.value;
          const next = guideAdvice(item, select.value);
          badge.className = `guide-badge guide-${next.level}`; badge.textContent = `${GUIDE_LEVELS[next.level].symbol} ${GUIDE_LEVELS[next.level].label}`;
          explanation.textContent = next.text;
          // Keep the active card and focus stable. Other filters are reapplied on the next filter input.
          $('guide-filter-note').hidden = !$('guide-level').value;
        });
        label.append(select); content.append(label);
      }
      const explanation = node('p', 'guide-explanation', advice.text); content.append(explanation);
      content.append(node('p', 'guide-phase-note', guidePhaseNote(item, age?.age)));
      const sources = node('div', 'guide-sources', '');
      for (const key of item.sources) {
        const source = GUIDE_SOURCES[key]; const link = node('a', 'source-link', `${source.title} ↗`);
        link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; sources.append(link);
      }
      content.append(sources, node('p', 'guide-review-date', `Quelle geprüft am ${formatDate(GUIDE_REVIEWED)}. Zusammenfassung lokal verfügbar; Originalquelle benötigt Internet.`));
      card.append(content); results.append(card);
    }
    $('guide-empty').hidden = items.length > 0;
    $('guide-filter-note').hidden = true;
  }
  for (const id of ['guide-search', 'guide-category', 'guide-level']) $(id).addEventListener('input', render);
  $('guide-date').addEventListener('change', render);
  $('guide-apply-filter').addEventListener('click', render);
  $('guide-today').addEventListener('click', () => { $('guide-date').value = getToday(); render(); });
  return {
    render,
    setDate(value) { $('guide-date').value = value; render(); },
  };
}
