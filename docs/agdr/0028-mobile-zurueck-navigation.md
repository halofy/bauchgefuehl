# AgDR-0028: Mobile Zurück-Navigation für Bereiche und Dialoge

- **Status:** Umgesetzt
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzeranforderung; History-Regeln durch den Agenten
- **Betroffene Dateien:** [navigation.js](../../src/navigation.js), [index.html](../../index.html), [navigation.test.js](../../tests/navigation.test.js)
- **Ersetzt / ergänzt:** Ergänzt AgDR-0010 und AgDR-0021.

## Kontext und Herkunft

Der Nutzer wünscht, dass mobil Zurück beziehungsweise die Browsergeste einen Dialog schließt oder innerhalb der App zurückführt. Das bisherige Umschalten der fünf Bereiche hatte keinen Browserverlauf.

## Entscheidung

Bereichswechsel erhalten History-Einträge und ihre Scrollpositionen. Der sichtbare Zurück-Button nutzt denselben Verlauf wie Browser-Zurück. Offene Dialoge erhalten einen zusätzlichen Eintrag. Zurück fordert zuerst deren reguläres Schließen an; bestehende Entwurfsabfragen bleiben maßgeblich. Wird Verwerfen abgelehnt, bleibt der Dialog samt Entwurf offen und sein History-Eintrag wird wiederhergestellt. Speichern oder bewusstes Schließen verbraucht den Dialogeintrag. Dialogwechsel in derselben Aktion ersetzt den Modaleintrag.

Ein eigener Einstiegseintrag führt mobil am App-Anfang zurück zur Übersicht. Es werden weder Gesundheitsdaten noch private Auswahltexte in History-State oder zusätzliche URL-Parameter geschrieben. Markenlinks wechseln zur Übersicht ohne Seitenneuladen. Vorwärts kann einen geschlossenen Dialog wieder öffnen; dies allein speichert nichts.

## Erwogene Alternativen

Nur einen sichtbaren Button hinzuzufügen löst die Browsergeste nicht. Globale Touch-Swipe-Erkennung würde horizontale Wochenleisten, Formulare und Browsergesten stören. Sie wird nicht eingesetzt.

## Folgen und Grenzen

Die Webapp kann Verlaufsgesten im eigenen Browserdokument behandeln, aber weder den Betriebssystem-Appwechsel noch erzwungenes Schließen, Prozessbeendigung oder alle Gestenvarianten kontrollieren. Das Verlassen über Browseradresszeile und andere Browserfunktionen bleibt möglich. Ein echtes Android-/iOS-PWA-Verhalten muss zusätzlich auf Geräten erprobt werden.

## Verifikation

Automatisierte Verlaufssimulation für Bereichswechsel, Übersichtseinstieg, Dialog-vor-Bereich, abgelehntes Verwerfen und programmgesteuertes Schließen. In Safari wurde Browser-Zurück mit einem bearbeiteten Planungsentwurf geprüft: Abfrage erscheint, Abbrechen erhält Text und Dialog; anschließendes Speichern funktioniert. Physische Systemgesten bleiben offen.

## Quellen

- [HTML Standard: History](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface).
- [HTML Standard: Dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element).
- Implementierung und Tests, oben verlinkt.


## Abschlussnachweis vom 18.11.2026

- Gesamte Testsuite: **218 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Ausgeführt mit `node --test tests/*.test.js`, entsprechend dem `npm test`-Skript. `npm` war in der Ausführungsumgebung nicht verfügbar; keine erfolgreichen npm-Aufrufe werden behauptet.
- `node scripts/build.js` (entsprechend `npm run build`) erfolgreich; aktuelle auslieferbare PWA in `dist/`.
- 356 eindeutige statische HTML-IDs; relative Modul-/Dokumentlinks, Gleichheit von Quelldateien und Build sowie 47 Offline-Dateien einschließlich aller neuen Module geprüft. `git diff --check` ohne Fehler.
- Safari-Stichproben: synthetische Grundlage, gespeicherter Planungsentwurf mit abgelehntem Verwerfen beim Browser-Zurück, explizites PWA-Update, gespeicherter Untersuchungswert mit Herkunftstext und getrennter Anzeige, angelegter eigener Termin und interne Vollbackup-Verschlüsselungsprüfung. Für den Terminmappen-/Notizdialog lieferte die native AX-Abfrage zeitweise keinen Inhalt; zusätzliche Fokusbehandlung wurde eingebaut, danach aber kein vollständiger manueller Gesamtdurchlauf wiederholt.
- Nicht behauptet: physische iPhone-/Android-Prüfung, installierte PWA-Systemgesten, Screenreader-Gesamtlauf, Betriebssystem-Dateiablage/-Import oder Druck/PDF-Gesamtlauf. Die letzten Fokus-/Sitzungs-/Kontextkorrekturen sind durch Syntax-/Modellprüfungen abgesichert, nicht durch einen neuen vollständigen Browserlauf. Keine Veröffentlichung oder ausdrückliche nachträgliche Nutzerfreigabe.
