# AgDR-0011: Nachvollziehbare SSW-Erklärung mit den aktuellen Angaben

- **Status:** Umgesetzt, lokal geprüft
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzeranforderung; Agent für Darstellung und Randfälle
- **Betroffene Dateien:** [Erklärung](../../src/calculation-explanation.js), [Oberfläche](../../src/app.js), [HTML](../../index.html), [Gestaltung](../../styles.css), [Tests](../../tests/calculation-explanation.test.js)
- **Ergänzt:** [AgDR-0006](0006-waehlbare-berechnungsmethode.md); die Methoden und Berechnungsregeln bleiben bestehen.

## Kontext und Herkunft

Der Nutzer verlangt ausdrücklich, dass „Wie wird meine Schwangerschaftswoche berechnet?“ die eingegebenen Daten verwendet und anhand dieser Werte das Ergebnis nachvollziehbar macht. Schon zuvor gab es einen kurzen dynamischen Satz. Der Agent entscheidet, ihn durch hervorgehobene, nummerierte Rechenschritte mit den konkreten Datumsangaben zu ersetzen und das zusätzliche starre Beispiel zu entfernen.

## Entscheidung

Die Erklärung verwendet dieselbe Berechnungsfunktion und denselben aktuellen lokalen Kalendertag wie die SSW-Anzeige. Sie wird beim Rendern nach Profiländerungen, Übernahme geteilter Angaben, Sync-Änderungen und Tageswechsel erneuert. Sie besitzt keine zweite Datierungsmethode und speichert keine zusätzliche Datenkopie.

- Bei Periode/Zyklus: heutiges Datum, eingegebener Periodenbeginn, vergangene Kalendertage, eingegebene Zykluslänge, Abweichung gegenüber 28 Tagen und konkrete Addition/Subtraktion.
- Beim ET: heutiges Datum, eingegebener ET, Kalendertage bis beziehungsweise seit dem ET und konkrete Rechnung von 280 Tagen aus. Ein vergangener ET wird mit einer Addition erklärt.
- Abschließend: Division durch sieben, volle Wochen, übrige Tage und das zur Übersicht identische Ergebnis als Wochen+Tage sowie laufende SSW.
- Vor 0+0 wird keine negative Woche als normale aktuelle SSW präsentiert; ab 42+0 wird die Grenze der Wocheninfos genannt.
- Demo und geteilte Ansicht erhalten eindeutige Überschriften zur Herkunft der Daten. Eigene lokale beziehungsweise nur in der Sitzung verfügbare Angaben werden als eigene aktuelle SSW erläutert.

Texte werden als DOM-Text ausgegeben. Ein direkter Aufruf aus „Deine Grundlage“ öffnet mobil zuerst den Bereich Wissen und anschließend das Berechnungs-Accordion.

## Erwogene Alternativen

- **Starres Beispiel neben dem eigenen Ergebnis:** Könnte den Zusammenhang mit den eigenen Angaben verdecken.
- **Separate Formelimplementierung in der Oberfläche:** Könnte von der eigentlichen Berechnung abweichen; stattdessen wird deren Ergebnis aufgeschlüsselt.
- **Nur ein Endergebnis:** Erklärt weder Zyklusanpassung noch den Unterschied zwischen vollen und laufenden Wochen.

## Folgen und Grenzen

Die medizinische Bedeutung und Unsicherheit der vorhandenen Methoden ändern sich nicht. Die Erklärung macht die Rechnung verständlicher, bestätigt aber keine medizinische Datierung. Die Phase in der Wochenreise ist weiterhin unabhängig von der aktuellen SSW auswählbar; die Erklärung folgt der aktuellen Berechnungsgrundlage.

## Verifikation

Am 17.11.2026 ausschließlich mit synthetischen Daten geprüft:

- Fünf neue automatisierte Tests für konkrete Daten und Division, kürzere/28-tägige/längere Zyklen, ET vor/nach heute, Ergebnis vor 0+0/ab 42+0 und Demo-/Teilen-Kennzeichnung. Insgesamt **78 Tests bestanden**.
- Die Skriptziele von `npm test` und `npm run build` wurden mangels `npm` im PATH direkt mit Node v24.22.1 ausgeführt: `node --test tests/*.test.js`, `node scripts/build.js`. Build erfolgreich.
- Lokaler Chrome: synthetisches Profil eingegeben, über den Erklärlink zum mobilen Wissensbereich gewechselt und das eingegebene Periodendatum in der Erklärung nachgewiesen. Nach Offline-Neustart erneut vorhanden.

Die verschiedenen Methoden/Randfälle sind automatisiert geprüft; noch kein vollständiger manueller Browserdurchlauf jedes Rechenfalls und keine Hilfstechnologieprüfung.

## Quellen

- [Bestehende Berechnung](../../src/pregnancy.js), [Erklärungsfunktion](../../src/calculation-explanation.js), [Tests](../../tests/calculation-explanation.test.js).
- [AgDR-0006: Methoden](0006-waehlbare-berechnungsmethode.md), [AgDR-0010: Mobile Navigation und PWA](0010-mobile-app-und-pwa.md).
