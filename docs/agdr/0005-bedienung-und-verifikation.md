# AgDR-0005: Ruhige Bedienung, klare Zustände und nachvollziehbare Prüfungen

- **Status:** Umgesetzt; verbleibende Prüflücken dokumentiert
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Agent innerhalb des beauftragten Umfangs
- **Betroffene Dateien:** [Gestaltung](../../styles.css), [HTML](../../index.html), [Interaktionen](../../src/app.js), [Tests](../../tests/pregnancy.test.js)

## Kontext und Herkunft

Die App soll wie ein kleiner Schwangerschaftsbegleiter nutzbar sein. Es gab keine Designvorlage oder bestehende Markenführung. Der Agent hat den Namen **bauchgefühl**, die Farbwelt und die Struktur gewählt; diese sind keine ausdrückliche Nutzerfestlegung.

## Entscheidung

Eine ruhige Oberfläche mit warmem Hintergrund, dunklem Grün, Serifentiteln und eigenen SVG-Elementen zeigt zuerst aktuelle SSW und ET. Danach folgen Wochenreise, Vorsorgethemen und Nachschlageinformationen. Alle Assets und Systemschriften werden lokal verwendet.

Ohne gespeicherte Angaben wird ein **deutlich markiertes Beispiel** bei 18+3 gezeigt. Eigene Daten werden über einen nativen Dialog eingegeben; beide Felder sind zunächst leer. Die Wochenauswahl verändert nur die Inhaltsvorschau, nicht die aktuelle SSW im Überblick. Ein Rücksprung führt zur aktuellen Woche. Geteilte Ansicht und fehlgeschlagene Speicherung erhalten eigene Zustandsbanner.

Für grundlegende Zugänglichkeit werden native Buttons, Dialoge, Details-Elemente und Checkboxen, sichtbare Tastaturfokusse, beschriftete Eingaben, Statusmeldungen und eine mit Pfeiltasten bedienbare Wochenauswahl verwendet. Reduzierte Bewegung wird berücksichtigt. Die mobile Darstellung verwendet eigene Layout-Breakpoints.

Die Verifikation konzentriert sich auf die fehleranfällige Domänenlogik und die technischen Auslieferungsgrenzen. Es werden keine bloßen Snapshot- oder Implementationsspiegeltests für einfache Gestaltung hinzugefügt.

## Erwogene Alternativen

- **Leere Startseite mit erzwungenem Setup-Dialog:** Würde die Funktion vor einer Eingabe weniger gut zeigen. Die gekennzeichnete Vorschau bietet Orientierung.
- **Vorausgefüllter Standardzyklus:** Könnte als individuelle Angabe missverstanden werden und widerspräche dem Schwerpunkt der Anforderung.
- **Eigene Dialog- und Accordion-Komponenten:** Native Elemente decken die benötigten Interaktionen ab und reduzieren eigene Fokuslogik.
- **Nur manuelle Prüfung der Rechnung:** Würde Datums- und Zyklusgrenzen schlecht absichern.

## Folgen und Grenzen

Moderne Browser mit JavaScript-Modulen, `<dialog>` und `:has()` werden vorausgesetzt. Bei nicht verfügbarer Clipboard API bleibt manuelles Kopieren möglich. Die Gestaltung ist responsive umgesetzt; das ist noch kein Nachweis für alle Bildschirmgrößen oder Hilfstechnologien.

## Verifikation

Am 17.11.2026 tatsächlich durchgeführt:

- **20 automatisierte Tests bestanden**, inklusive Berechnung, Off-by-one-Grenzen, Eingabevalidierung, vier Zeitzonen, lokalem Speicher und Share-Codec.
- JavaScript-Dateien erfolgreich auf Syntax geprüft und statischen Build erstellt.
- Lokale Website-Ressourcen mit HTTP 200 und passenden Inhaltstypen geladen; HTML-IDs auf Duplikate geprüft.
- Desktopoberfläche im nativen Chrome visuell angesehen; Livevorschau im Eingabedialog mit synthetischen Daten zeigte das erwartete Ergebnis 18+3 und ET 17.04.2027.
- Bei dieser Sichtprüfung wurde ein fehlender Wortabstand im Desktop-Haupttitel erkannt und im HTML korrigiert.

Noch nicht vollständig durchgeführt:

- Durchgehender Browserablauf für Speichern → Neuladen → Teilen → Importieren → Löschen.
- Eigene mobile Geräteprüfung, vollständiger Tastatur-/Screenreader-Audit und Browsermatrix.
- Echter GitHub-Actions-/Pages-Deploymentlauf.

Die ursprüngliche Browser-Connector-Anbindung war nicht verfügbar. Die Desktopprüfung konnte anschließend über die native Browsersteuerung erfolgen. Die automatisierten Prüfergebnisse werden dadurch nicht als vollständiger End-to-end-Test ausgegeben.

## Quellen

- [Tests](../../tests/pregnancy.test.js).
- [AgDR-0001: Auslieferung](0001-statische-webapp.md).
- [AgDR-0002: Berechnung](0002-ssw-aus-periode-und-zyklus.md).
- [AgDR-0003: Datenfluss](0003-lokale-daten-und-teilen.md).
