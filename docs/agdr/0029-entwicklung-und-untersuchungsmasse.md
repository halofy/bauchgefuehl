# AgDR-0029: Entwicklungsschemata, feinere Größenstufen und eigene Untersuchungsmaße

- **Status:** Umgesetzt
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzeranforderung; Darstellung, Interpolation und Einordnung durch den Agenten
- **Betroffene Dateien:** [growth.js](../../src/growth.js), [companion.js](../../src/companion.js), [companion-ui.js](../../src/companion-ui.js), [growth.test.js](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Ersetzt die unveränderte dekorative Babyzeichnung und die aktive vierwöchige Größenanzeige aus AgDR-0004. Phasen-Entwicklungstexte und ihre Quellen bleiben erhalten.

## Kontext und Herkunft

Der Nutzer möchte die Embryodarstellung, Größenvergleiche und Zwischenstufen verbessern sowie bekannte Untersuchungsmaße erfassen und einbeziehen. Eine medizinische Wachstumsprognose, automatische Umdatierung oder Perzentilenbewertung wurde nicht verlangt.

## Entscheidung

Code-eigene SVG-Schemata zeigen frühe Zellteilung, Embryoform und zwei Fötusstufen mit allmählicher Skalierung. Sie sind klar als schematisch und nicht maßstabsgetreu bezeichnet. Sie bilden weder Ultraschallbefunde noch individuelle Anatomie ab.

In der Wochenreise ist jeder der sieben Tage einer SSW wählbar; beim Wechsel zur aktuellen Woche wird zunächst der aktuelle Tag angezeigt. Quellenanker sind die konkret geprüften NHS-Wochen 6, 8, 12, 16, 19, 20, 24, 28, 32, 36 und 40. **NHS week 8 bedeutet 8+0 und damit deutsche 9. SSW**, nicht deutsche 8. SSW. Zentimeterwerte und ungefähre Alltagsvergleiche stammen von diesen Seiten. Zwischen gleichen Messarten werden lineare Zwischenwerte als ausdrücklich rechnerische Orientierung auf eine Dezimalstelle angezeigt, mit beiden Ankerquellen. Dies ist eine Agenten-Darstellungsentscheidung, kein belegtes lineares individuelles Wachstum.

Vor 20+0 handelt es sich um Scheitel-Steiß-Länge (SSL), danach um Gesamtlänge Scheitel–Ferse. Zwischen 19+0 und 20+0 wird nicht zwischen den Messarten interpoliert: bis 19+6 bleibt der letzte SSL-Wert mit Hinweis stehen; 20+0 beginnt die andere Messart. Vor 6+0 und nach 40+0 wird keine Länge erfunden beziehungsweise extrapoliert.

Eigene datierte Untersuchungswerte umfassen SSL in mm, geschätzte Gesamtlänge in cm, geschätztes Gewicht in g sowie KU/AU/FL in mm, jeweils mit optionalem Herkunftstext. Bearbeitung und umkehrbares Archiv sind möglich. Das jüngste eigene Untersuchungsergebnis erscheint separat mit Datum. Nur SSL beziehungsweise Gesamtlänge werden einer allgemeinen Orientierung **gleicher Messart am Untersuchungstag** gegenübergestellt. Es gibt keine automatische Fortschreibung auf heute, Normkurve, Perzentile, Gesundheitsbewertung oder Änderung von SSW/ET. Die erfassbaren Höchstwerte sind Tippfehlergrenzen, keine klinischen Referenzbereiche.

Eigene Maße sind im verschlüsselten Geräte-Stand und Vollbackup enthalten. Zum bewussten Teilen können einzelne Untersuchungswerte mit Vorschau als eigenständige druckbare Datei ausgewählt werden. Ausgelassene Daten werden nicht versteckt mitgeschickt.

## Erwogene Alternativen

Täglich angeblich präzise Messwerte ohne Datenbasis wären irreführend. Eine persönliche Prognose aus einem einzelnen Ultraschallmaß ist nicht ausreichend begründet. SSL, FL oder Kopfumfang in Gesamtkörperlänge umzurechnen würde neue medizinische Formeln erfordern und wird nicht gemacht. Externe Bilddienste zur Laufzeit widersprechen der Offline-Nutzung.

## Folgen und Grenzen

Schematische Formen und Obst-/Gemüsevergleiche sind Illustration; individuelle Entwicklung ist nicht daraus beurteilbar. Die Quellenanker sind eine redaktionelle Auswahl, kein klinischer Wachstumsstandard. Rundung kann benachbarte Tage gleich anzeigen. Im Zweifel ist der Untersuchungsbericht beziehungsweise das betreuende Team maßgeblich.

## Verifikation

Tests für jeden Quellenanker, tägliche Zwischenwerte, NHS-/SSW-Zuordnung, Messartwechsel, fehlende Randwerte, Millimeter-/Zentimeterbezug, Ausschluss ungleicher Messarten und unveränderte Referenz trotz eigener Werte. Safari zeigt bei synthetischem 7+3 korrekt 8. SSW, den Tagesregler, die Zwischenstufe und beide NHS-Quellen. Die native Safari-Automatisierung lieferte beim Untersuchungsdialog zunächst keinen AX-Inhalt. Nach explizitem Eingabefokus war der Dialog zugänglich; ein synthetischer SSL-Wert von 13 mm samt Herkunftstext wurde gespeichert und separat mit Datum angezeigt. Der physische Smartphone-Ablauf bleibt offen.

## Quellen

Redaktioneller Prüfstand: **18.11.2026**. Exakte URLs pro Anker in [growth.js](../../src/growth.js). Besonders relevant:

- [NHS 6 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/1st-trimester/week-6/): ungefähr 6 mm.
- [NHS 8 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/1st-trimester/week-8/): ungefähr 16 mm.
- [NHS 12 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/1st-trimester/week-12/): ungefähr 5,4 cm, Kopf bis Steiß.
- [NHS 19 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/2nd-trimester/week-19/): ungefähr 15,3 cm, Kopf bis Steiß.
- [NHS 20 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/2nd-trimester/week-20/): ungefähr 25,6 cm; erklärt den Wechsel zu Kopf–Ferse.
- [NHS 40 Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/3rd-trimester/week-40/): ungefähr 51,2 cm.


## Abschlussnachweis vom 18.11.2026

- Gesamte Testsuite: **218 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Ausgeführt mit `node --test tests/*.test.js`, entsprechend dem `npm test`-Skript. `npm` war in der Ausführungsumgebung nicht verfügbar; keine erfolgreichen npm-Aufrufe werden behauptet.
- `node scripts/build.js` (entsprechend `npm run build`) erfolgreich; aktuelle auslieferbare PWA in `dist/`.
- 356 eindeutige statische HTML-IDs; relative Modul-/Dokumentlinks, Gleichheit von Quelldateien und Build sowie 47 Offline-Dateien einschließlich aller neuen Module geprüft. `git diff --check` ohne Fehler.
- Safari-Stichproben: synthetische Grundlage, gespeicherter Planungsentwurf mit abgelehntem Verwerfen beim Browser-Zurück, explizites PWA-Update, gespeicherter Untersuchungswert mit Herkunftstext und getrennter Anzeige, angelegter eigener Termin und interne Vollbackup-Verschlüsselungsprüfung. Für den Terminmappen-/Notizdialog lieferte die native AX-Abfrage zeitweise keinen Inhalt; zusätzliche Fokusbehandlung wurde eingebaut, danach aber kein vollständiger manueller Gesamtdurchlauf wiederholt.
- Nicht behauptet: physische iPhone-/Android-Prüfung, installierte PWA-Systemgesten, Screenreader-Gesamtlauf, Betriebssystem-Dateiablage/-Import oder Druck/PDF-Gesamtlauf. Die letzten Fokus-/Sitzungs-/Kontextkorrekturen sind durch Syntax-/Modellprüfungen abgesichert, nicht durch einen neuen vollständigen Browserlauf. Keine Veröffentlichung oder ausdrückliche nachträgliche Nutzerfreigabe.
