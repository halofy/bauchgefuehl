// A small text-only format: paragraphs, bullet lists and numbered lists. No HTML or links.
export const escapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function textBlocks(value) {
  const blocks = []; let current = null;
  for (const line of String(value).replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim()) { current = null; continue; }
    const bullet = /^\s*[-*•]\s+(.+)$/.exec(line);
    const numbered = /^\s*(\d{1,4})[.)]\s+(.+)$/.exec(line);
    const type = bullet ? 'ul' : numbered ? 'ol' : 'p';
    if (type === 'p' && current && current.type !== 'p' && /^\s{2,}\S/.test(line)) {
      current.items[current.items.length - 1] += '\n' + line.trim(); continue;
    }
    if (!current || current.type !== type || (numbered && Number(numbered[1]) !== current.start + current.items.length)) {
      current = { type, ...(numbered ? { start: Number(numbered[1]) } : {}), items: [] }; blocks.push(current);
    }
    current.items.push(bullet ? bullet[1] : numbered ? numbered[2] : line);
  }
  return blocks;
}
export function formatText(value) {
  const inline = s => escapeText(s).replaceAll('\n', '<br>');
  return textBlocks(value).map(block => block.type === 'p'
    ? `<p>${block.items.map(inline).join('<br>')}</p>`
    : `<${block.type}${block.type === 'ol' ? ` start="${block.start}"` : ''}>${block.items.map(s => `<li>${inline(s)}</li>`).join('')}</${block.type}>`).join('');
}
