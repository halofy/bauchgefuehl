# AgDR-0044: Kalender mit gemeinsamer Wochenansicht

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer wünscht einen neu gestalteten Kalender mit weniger Verschachtelung und einer gemeinsamen Wochenansicht. Die Illustration gehört laut seiner Klarstellung in die Wochenreise. Der Agent legt die Anordnung und die Bezugszeiträume fest.
- **Betroffene Dateien:** [Ansicht](../../index.html), [Styles](../../styles.css), [Kalenderoberfläche](../../src/calendar-ui.js), [Wochenansicht](../../src/reflection-ui.js), [Datumsbereiche](../../src/calendar.js), [Wochenstatistik](../../src/reflection.js), [Tests](../../tests/reflection.test.js)
- **Ersetzt / ergänzt:** Ersetzt die separate Liste der 42 SSW aus [AgDR-0014](0014-kalender-und-journal.md), die bisherige Kalenderwochenansicht aus [AgDR-0015](0015-f03-symptomkalender-und-wochenrueckblick.md) und einen Teil der Aufklappstruktur aus [AgDR-0042](0042-termin-pdf-und-kompakter-vorsorgekalender.md). Tagesdialog, Datierungserklärung und Untersuchungsfenster gelten weiter.

## Kontext und Herkunft

Die Liste „Alle 42 SSW mit Datumsbereichen ansehen“ war für den Nutzer schwer verständlich. Er möchte Datumsbereiche, Rückblick und Messwerte in einem Bereich sehen. Die vielen ineinanderliegenden Karten und aufklappbaren Abschnitte haben zu mehr Abstand und Scrollen geführt. Nach Klarstellung des Nutzers führt der Kalender für die Illustration zur passenden Woche in der Wochenreise.

## Entscheidung

Der Monatskalender steht an erster Stelle. Der ausgewählte Tag erscheint auf derselben Fläche neben oder unter dem Raster. Eine kurze Zusammenfassung nennt Termin, Einträge und passende Vorsorgehinweise. Der vollständige Tagesdialog zeigt die zugehörigen Informationen und Aktionen. Er bleibt über die Schaltfläche, langes Drücken, Kontextmenü oder Tastatur erreichbar. Suche, Datierung und Markierungsoptionen stehen zusammen in einem eigenen Dialog. Der Monat verwendet nur die Kalenderzeilen, die er benötigt.

Die Wochenansicht zeigt den Zeitraum der ausgewählten SSW, eine kompakte Tagesleiste, Symptome, Messwerte und bei vorhandenen Check-ins deren Details. Über Pfeile und SSW-Auswahl lässt sich im gleichen Bereich zurück- und vorausblicken. „Zur Entwicklung“ öffnet die gewählte Woche in der Wochenreise. Die SSW-Auswahl und die Monatsansicht teilen den ausgewählten Tag. Persönliche Termine, Rückblicke und Messwerte bleiben lokal.

Journal und Messwerte verwenden denselben Zeitraum wie die Wochenüberschrift. Eine SSW kann an jedem Wochentag beginnen. Außerhalb der SSW-Anzeige und nach eingetragener Geburt dient die Kalenderwoche als Grundlage. Übergangswochen enden am Datum des Phasenwechsels beziehungsweise beginnen dort, damit Blättern und Datumsbereiche sauber aneinander anschließen. Die gespeicherten Daten und die SSW-Formel bleiben gleich.

Die wichtigsten Angaben sind direkt sichtbar. Ausklappen dient den längeren Vorsorgetexten mit Quellen und den Check-in-Details. Vorsorge im Voraus ist eine flache Liste mit direkt sichtbaren Terminen beziehungsweise Zeitfenstern.

## Erwogene Alternativen

Eine separate Tabelle hätte die SSW-Datumsbereiche zwar komplett aufgelistet, aber Datumsauswahl und persönliche Daten weiter voneinander getrennt. Zwei unterschiedliche Wochenzeiträume in derselben Ansicht hätten dieselbe Verwirrung erzeugt. Die Tage und Messwerte beziehen sich deshalb auf die prominent angezeigte SSW oder Kalenderwoche.

## Folgen und Grenzen

Der Rückblick innerhalb einer Schwangerschaft folgt der Datierung der Schwangerschaft. Bei einer Anpassung der Datierung sind daher andere Tage in einer SSW enthalten. Die Auswertung basiert weiterhin auf den Originaldaten mit ihren tatsächlichen Datumsangaben.

## Verifikation

- `npm test` erfolgreich mit 235 Tests. Ergänzte Regressionen prüfen eine SSW mit Start mitten in der Kalenderwoche, die Auswahl von Beobachtungen an ihren Grenzen und die Übergänge an Schwangerschaftsbeginn, Anzeigegrenze und Geburtsdatum.
- `npm run build` erfolgreich. Safari im 390 CSS-Pixel breiten Testframe geprüft. Detaildialog geöffnet, Woche weitergeschaltet, mit der Suche von November in den Dezember gesprungen und die korrespondierende 25. SSW samt Illustration in der Wochenreise geöffnet.
- Physische Smartphone-Gesten wurden in diesem Durchlauf nicht geprüft.

## Quellen

- Nutzerwünsche und Klarstellung im Gespräch vom 20.11.2026.
- [Kalender und bisherige SSW-Vorschau](0014-kalender-und-journal.md), [Wochenrückblick](0015-f03-symptomkalender-und-wochenrueckblick.md), [Untersuchungsfenster](0042-termin-pdf-und-kompakter-vorsorgekalender.md), [SVG-Illustrationen](0043-svg-entwicklungsillustrationen-nach-vorlagen.md).
