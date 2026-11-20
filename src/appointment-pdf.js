import { textBlocks } from './text-format.js';
import { reportBody, reportDocument } from './report.js';
import { formatDate } from './dates.js';

export function appointmentDocument(report) {
  return reportDocument(report).replace(/<body>[\s\S]*<\/body>/, () => `<body>${reportBody(report, { answerSpace: true })}</body>`);
}
let fontPromise;
async function localFont() {
  fontPromise ||= fetch(new URL('./vendor/NotoSans-Regular.ttf', import.meta.url)).then(async response => {
    if (!response.ok) throw new Error('Die lokale PDF-Schrift ist noch nicht offline verfügbar. Bitte das App-Update vollständig laden.');
    return new Uint8Array(await response.arrayBuffer());
  }).catch(error => { fontPromise = null; throw error; });
  return fontPromise;
}
function base64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}

// Consumes only the already projected report, never storage or unselected original data.
export async function createAppointmentPdf(report, fontBytes) {
  await import('./vendor/jspdf.umd.min.js');
  const { jsPDF } = globalThis.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  pdf.addFileToVFS('NotoSans-Regular.ttf', base64(fontBytes || await localFont()));
  pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal'); pdf.setFont('NotoSans');
  pdf.setProperties({ title: 'Meine Terminmappe', subject: 'Bewusst ausgewählte eigene Angaben', creator: 'bauchgefühl · lokal erstellt' });
  const left = 19, width = 172, bottom = 274; let y = 23, pageContext = 'Gesprächsvorbereitung';
  function newPage() {
    const size=pdf.getFontSize(), color=pdf.getTextColor();
    pdf.addPage(); y = 24; pdf.setFontSize(9); pdf.setTextColor(85,105,89);
    pdf.text(`Terminmappe · ${pageContext} · Fortsetzung`, left, 14);
    pdf.setFontSize(size); pdf.setTextColor(color);
  }
  function room(height) { if (y + height > bottom) newPage(); }
  function safe(value) {
    const text = String(value).replaceAll('\r', '').replaceAll('\t', '    ').normalize('NFC');
    for (const c of text) if (c !== '\n' && !pdf.internal.getFont().metadata.characterToGlyph(c.codePointAt(0))) {
      throw new Error(`Das Zeichen „${c}“ wird von der PDF-Schrift nicht unterstützt. Bitte die HTML-Druckdatei verwenden; dein Originaltext bleibt erhalten.`);
    }
    return text;
  }
  function write(value, size = 11, indent = 0, color = [40,60,51]) {
    pdf.setFontSize(size); pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(safe(value), width - indent);
    const lineHeight = size * .47;
    for (const line of lines) { room(lineHeight); pdf.text(line, left + indent, y); y += lineHeight; }
    y += 2;
  }
  function heading(value, size = 15) { room(20); y += 3; write(value, size); }
  function formatted(value) {
    for (const block of textBlocks(value)) {
      if (block.type === 'p') write(block.items.join('\n'));
      else block.items.forEach((item, i) => write(`${block.type === 'ul' ? '•' : `${block.start + i}.`} ${item}`, 11, 4));
    }
  }
  function lines(label, count = 4) {
    room(11 + count * 8); write(label, 10, 0, [85,105,89]);
    pdf.setDrawColor(192,205,190); pdf.setLineWidth(.2);
    for (let i = 0; i < count; i++) { pdf.line(left, y + 5, left + width, y + 5); y += 8; }
    y += 4;
  }
  write('bauchgefühl. · MEINE TERMINMAPPE', 10, 0, [71,100,80]);
  heading('Gut vorbereitet ins Gespräch.', 23);
  write('Nur deine ausgewählten Angaben. Freier Platz für Antworten und nächste Schritte. Quelle: eigene Notizen; keine medizinische Bewertung.', 10);
  for (const item of report.appointments || []) {
    heading(item.title, 17); write(`${formatDate(item.date)}${item.time ? ' · ' + item.time + ' Uhr' : ''} · ${item.provider}`);
    if (item.location) write(item.location);
  }
  if (!(report.careNotes?.length)) lines('Meine Fragen und Antworten', 7);
  for (const [index, note] of (report.careNotes || []).entries()) {
    pageContext = `${index + 1}. ${note.kind === 'qa' ? 'Frage' : 'Notiz'}`;
    heading(`${index + 1}. ${note.kind === 'qa' ? 'Frage' : note.kind === 'result' ? 'Ergebnis / Befund' : 'Notiz'}`);
    write(`Notiert am ${formatDate(note.date)} · ${note.discussed ? 'Besprochen' : 'Noch nicht als besprochen markiert'}`, 9);
    formatted(note.text);
    if (note.appointment && !(report.appointments || []).some(a => a.date === note.appointment.date && a.title === note.appointment.title)) {
      write(`Termin: ${formatDate(note.appointment.date)} · ${note.appointment.title}${note.appointment.time ? ' · '+note.appointment.time : ''}${note.appointment.location ? ' · '+note.appointment.location : ''}`, 9);
    }
    if (note.answer) { write('Bereits notierte Antwort:', 10); formatted(note.answer); }
    if (note.nextSteps) { write('Bereits notierte nächste Schritte:', 10); formatted(note.nextSteps); }
    lines(note.kind === 'qa' ? 'Antwort / Ergänzungen im Gespräch' : 'Notizen im Gespräch', 4);
    lines('Nächste Schritte / Rückfragen', 2);
  }
  if (report.entries.length) heading('Ausgewählte Beobachtungen', 18);
  if (report.entries.some(entry => entry.checkin?.length)) write('Check-in-Skalen: Stimmung 1 = sehr belastet, 5 = sehr gut; Energie 1 = kaum, 5 = sehr viel. Schlaf in Stunden innerhalb der letzten 24 Stunden inklusive Nickerchen. Beschwerdestärke 0 = keine Beschwerden angegeben, 10 = maximal vorstellbar. Persönliche Merkhilfen, keine medizinischen Tests. Fehlende Angaben sind keine Entwarnung.', 10);
  const number = value => new Intl.NumberFormat('de-DE', {maximumFractionDigits:4}).format(value);
  for (const entry of report.entries) {
    pageContext = formatDate(entry.date);
    heading(formatDate(entry.date) + (entry.time ? ' · ' + entry.time : ''));
    if (entry.text) formatted(entry.text);
    if (entry.symptoms) write('Symptome: '+entry.symptoms.join(', '));
    if (entry.tags) write('Tags: '+entry.tags.map(t=>'#'+t).join(' '));
    for (const m of [...(entry.checkin || []), ...(entry.metrics || [])]) write(`${m.label}: ${number(m.value)} ${m.unit}`);
  }
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); pdf.setFontSize(9); pdf.setTextColor(85,105,89);
    pdf.text('Persönliche Terminmappe · bewusst ausgewählter Auszug', left, 285);
    pdf.text(`${page} / ${pages}`, 191, 285, { align:'right' });
  }
  return new Uint8Array(pdf.output('arraybuffer'));
}
