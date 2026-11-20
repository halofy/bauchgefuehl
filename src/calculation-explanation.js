import { calculatePregnancy, formatDate } from './pregnancy.js';

export function explainCalculation(profile, today, mode = 'local') {
  const data = calculatePregnancy(profile, today);
  const title = mode === 'demo' ? 'So entsteht die SSW mit den Beispieldaten'
    : mode === 'shared' ? 'So entsteht die SSW mit den geteilten Angaben' : 'So entsteht deine aktuelle SSW';
  const steps = [`Heute: ${formatDate(today)}.`];
  if (data.method === 'due-date') {
    steps.push(`Dein eingetragener ET: ${formatDate(profile.dueDate)}. An diesem Tag sind rechnerisch 280 Tage (40 Wochen) erreicht.`);
    steps.push(data.daysUntilDue >= 0
      ? `Bis zum ET liegen ${data.daysUntilDue} Kalendertage. 280 − ${data.daysUntilDue} = ${data.gestationalDays} SSW-Tage.`
      : `Der ET liegt ${Math.abs(data.daysUntilDue)} Kalendertage zurück. 280 + ${Math.abs(data.daysUntilDue)} = ${data.gestationalDays} SSW-Tage.`);
    steps.push('Diese Methode verwendet die 28-Tage-Basis. Eine zusätzliche Zyklusanpassung entfällt.');
  } else {
    steps.push(`Erster Tag deiner letzten Periode: ${formatDate(profile.lmp)}. Bis heute sind ${data.elapsedDays} Kalendertage vergangen.`);
    steps.push(`Deine durchschnittliche Zykluslänge: ${profile.cycle} Tage. Abweichung zur 28-Tage-Basis: ${profile.cycle} − 28 = ${data.correction < 0 ? '−' + Math.abs(data.correction) : data.correction} Tage.`);
    steps.push(data.correction === 0
      ? `Keine Zyklusanpassung: ${data.elapsedDays} − 0 = ${data.gestationalDays} SSW-Tage.`
      : `${Math.abs(data.correction)} Tage werden ${data.correction > 0 ? 'abgezogen' : 'addiert'}: ${data.elapsedDays} ${data.correction > 0 ? '−' : '+'} ${Math.abs(data.correction)} = ${data.gestationalDays} SSW-Tage.`);
  }
  if (data.status === 'before') return { title, steps, result: `Das Ergebnis (${data.gestationalDays} Tage) liegt vor 0+0. Eine aktuelle SSW lässt sich damit noch nicht sinnvoll anzeigen. Bitte prüfe deine Angaben.` };
  if (data.status === 'beyond') return { title, steps, result: 'Ab 42+0 endet die SSW-Anzeige außerhalb der Wocheninfos. Die Datierung wird nicht verändert. Bitte prüfe deine Angaben; falls du noch schwanger bist, kontaktiere dein Geburtsteam und kläre das weitere Vorgehen.' };
  steps.push(`${data.gestationalDays} ÷ 7 = ${data.weeks} volle Wochen und ${data.days} ${data.days === 1 ? 'Tag' : 'Tage'} Rest.`);
  return { title, steps, result: `Das ergibt ${data.weeks}+${data.days} – du bist in der ${data.weekNumber}. SSW.${data.status === 'beyond' ? ' Das liegt außerhalb der Wocheninfos (ab 42+0). Bitte prüfe deine Angaben und besprich das weitere Vorgehen mit deinem Geburtsteam.' : ''}` };
}
