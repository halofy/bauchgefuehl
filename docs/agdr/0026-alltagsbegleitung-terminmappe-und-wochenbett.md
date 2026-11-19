# AgDR-0026: Alltagsbegleitung, Terminmappe und ausdrücklicher Wochenbettwechsel

- **Status:** Umgesetzt
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzeranforderung; konkrete Ausgestaltung durch den Agenten
- **Betroffene Dateien:** [companion.js](../../src/companion.js), [companion-ui.js](../../src/companion-ui.js), [trends.js](../../src/trends.js), [symptoms.js](../../src/symptoms.js), [journal-ui.js](../../src/journal-ui.js), [care-ui.js](../../src/care-ui.js), [calendar-ui.js](../../src/calendar-ui.js), [pregnancy.js](../../src/pregnancy.js), [device-transfer.js](../../src/device-transfer.js)
- **Ersetzt / ergänzt:** Ergänzt AgDR-0023, AgDR-0025 und AgDR-0020. Die SSW-Formel bleibt unverändert.

## Kontext und Herkunft

Der Nutzer beauftragt das vollständig empfohlene Alltagspaket sowie zwei weitere Erweiterungen. Die vorherige Empfehlung enthielt fünf nummerierte Features und zusätzlich die Vollsicherung. Die Zuordnung zu acht Paketteilen ist eine ausdrücklich kommunizierte Agenteninterpretation: Heute-Fokus, Terminmappe, Beschwerdenhilfe, Geburts-/Wochenbettplanung, Verläufe, Vollsicherung, Zurück-Navigation und Entwicklung/Untersuchungsmaße. Die letzten drei sind zusätzlich in AgDR-0027 bis 0029 beschrieben. Keine nachträgliche Nutzerfreigabe wird behauptet.

## Entscheidung

- Heute-Fokus nutzt vorhandene eigene Termine, offene Fragen und notierte nächste Schritte. Vergangene Uhrzeiten werden für den nächsten Termin übersprungen; Termine ohne Uhrzeit bleiben am selben Tag sichtbar. Wochenimpuls und nächste Schritte sind aufklappbar.
- Terminmappe öffnet Fragen desselben Termins und freie Fragen sowie freiwillig ausgewählte Journalbeobachtungen der letzten 28 Tage. Auswahl beginnt leer. Antworten werden am Originaleintrag bearbeitet. Vorschau und selbstständige druckbare HTML-Datei enthalten ausschließlich gewählte Einträge; Termindaten einschließlich Ort/Uhrzeit sind separat freizugeben. Für PDF bleibt der Browser-Druckdialog zuständig; ein eigener PDF-Generator ist weiterhin nicht umgesetzt.
- Beschwerdenhilfe bietet sechs quellenbezogene Offline-Karten. Journal-Symptome führen zur Hilfe, unbekannte Begriffe erhalten keine erfundene Empfehlung. Eine Frage kann ausdrücklich vorgemerkt werden; Kontakte sind bewusst aufrufbar. Keine Diagnose, automatisierte Triage, Entwarnung oder Medikamentendosierung.
- Planung umfasst frei bearbeitbare Wünsche/Aufgaben in vier Bereichen, optionale Unterstützungspersonen, Erledigt-Status, umkehrbare Archive und eine einzeln auswählbare Druckdatei. Kontakte bleiben in ihrer bestehenden Verwaltung.
- Persönliche Verläufe haben Zeitraum, selbst gewählten Ausgangswert, absolute Differenz, optionale Check-in-Skalen und Notizmarkierungen mit Zugriff auf Originaleinträge. Gleiche Bezeichnungen mit unterschiedlichen Einheiten bleiben getrennt. Keine Mittelwertbildung ordinaler Skalen, Schlafsummen oder Normalbereiche.
- Ein Geburtsdatum aktiviert die neue Phase ausschließlich nach bewusster Speicherung. Historische Schwangerschaftsangaben und Journal bleiben erhalten. Übersicht und Kalender zeigen nach Geburt Tage seit Geburt; Schwangerschaftsinformationen bleiben Rückblick. Abgeschlossene Schwangerschaftsprofile dürfen für das persönliche Journal weiter gelesen/geschrieben werden, sobald eine gültige eigene Wochenbettphase gespeichert ist. Neue Profileingaben behalten ihre bisherigen Plausibilitätsgrenzen.
- Neue Planungs-/Phasen-/Untersuchungsdaten liegen getrennt in `bauchgefuehl.companion.v1`, mit Sicherungsverlauf vor Änderungen, je maximal 200 Planungs-/Untersuchungseinträgen einschließlich Archiv und 128.000 Zeichen. Fehler kürzen keine Daten. Schreibsperre und Vergleich mit aktuellem Speicherstand verhindern das Überschreiben eines inzwischen geänderten Tabs.
- Signierter Geräteinhalt v3 enthält den neuen Bereich zusätzlich zu Terminen und Journal. v1/v2 bleiben lesbar. Ein alter oder fehlender Bereich darf einen vorhandenen neueren Bereich beim gekoppelten Abgleich nicht entfernen. Beide Smartphones sollen vor der neuen Weitergabe aktualisiert werden. Vollsicherungen und bewusst ausgewählte Teilberichte bleiben unterschiedliche Wege.

## Erwogene Alternativen

Neue persönliche Daten als beliebige Journaltexte abzulegen hätte Phase, Messart und selektive Weitergabe unklar gemacht. Eine erneute Speicherung der Terminfragen in der Mappe hätte widersprüchliche Fassungen erzeugt. Automatisch aus Text abgeleitete Beschwerden, Diagnosen oder Phasen werden nicht verwendet.

## Folgen und Grenzen

Die App bleibt statisch, offline und ohne fremden Datendienst nutzbar. Externe Quellen werden erst beim Öffnen geladen. Planung und Untersuchungswerte sind im vollständigen Geräte-Stand enthalten, im allgemeinen Journalbericht dagegen nicht automatisch; dafür gibt es eine eigene Auswahl mit Vorschau. Archivierte Inhalte bleiben in Vollsicherungen und Geräte-Ständen erhalten. Es gibt keine Benachrichtigungszusage im Hintergrund und keinen automatischen Sync. Das Wochenbett ist eine persönliche Phase, kein zeitlich erzwungener Betreuungsplan. Journal ohne jemals gespeicherte Schwangerschaftsgrundlage ist weiterhin nicht vorgesehen.

## Verifikation

Automatisierte Tests für Planung, Archive/Wiederherstellung, Messarten, fehlerhafte Werte, konkurrierende Fassungen, Sicherungsverlauf, explizite historische Wochenbettprofile, Zeitraumauswahl, Einheiten, Ausgangswerte und Geräte-v3-Kontinuität. Gesamtlauf und Browsernachweise stehen im Abschlussnachweis unten. Physische iOS-/Android-Geräte, Screenreader und Betriebssystem-Druckdialog bleiben gesonderte Prüflücken.

## Quellen

- [BIÖG: Geburt vorbereiten](https://www.familienplanung.de/schwangerschaft/geburt/geburtsvorbereitung/wie-kann-ich-mich-auf-die-geburt-vorbereiten/): eigene Wünsche und organisatorische Vorbereitung.
- [IQWiG: Wochenbett](https://www.gesundheitsinformation.de/nach-der-geburt-wochenbett.html): Erholung und Unterstützung nach der Geburt.
- [gesund.bund.de: Schwangerschaftsbeschwerden](https://gesund.bund.de/typische-schwangerschaftsbeschwerden): Sodbrennen, Rückenbeschwerden, Belastungen und ärztliche Abklärung.
- [BIÖG: Übelkeit und Erbrechen](https://www.familienplanung.de/schwangerschaft/die-schwangerschaft/beschwerden-und-krankheiten/beschwerden/uebelkeit-und-erbrechen/).
- [NHS: Kopfschmerzen in der Schwangerschaft](https://www.nhs.uk/pregnancy/common-symptoms/headaches/): starke Kopfschmerzen und Sehstörungen zeitnah/sofort abklären.
- Prüfstand der neuen medizinischen Karten: **18.11.2026**. Eigene Planungs-/Mess-/Terminangaben sind ausdrücklich als eigene Angaben gekennzeichnet. NDR bleibt passend zu den bereits geprüften Ernährungsthemen eingebunden; neue Detailaussagen werden nicht durch die NDR-Themenübersicht begründet (AgDR-0018).


## Abschlussnachweis vom 18.11.2026

- Gesamte Testsuite: **218 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Ausgeführt mit `node --test tests/*.test.js`, entsprechend dem `npm test`-Skript. `npm` war in der Ausführungsumgebung nicht verfügbar; keine erfolgreichen npm-Aufrufe werden behauptet.
- `node scripts/build.js` (entsprechend `npm run build`) erfolgreich; aktuelle auslieferbare PWA in `dist/`.
- 356 eindeutige statische HTML-IDs; relative Modul-/Dokumentlinks, Gleichheit von Quelldateien und Build sowie 47 Offline-Dateien einschließlich aller neuen Module geprüft. `git diff --check` ohne Fehler.
- Safari-Stichproben: synthetische Grundlage, gespeicherter Planungsentwurf mit abgelehntem Verwerfen beim Browser-Zurück, explizites PWA-Update, gespeicherter Untersuchungswert mit Herkunftstext und getrennter Anzeige, angelegter eigener Termin und interne Vollbackup-Verschlüsselungsprüfung. Für den Terminmappen-/Notizdialog lieferte die native AX-Abfrage zeitweise keinen Inhalt; zusätzliche Fokusbehandlung wurde eingebaut, danach aber kein vollständiger manueller Gesamtdurchlauf wiederholt.
- Nicht behauptet: physische iPhone-/Android-Prüfung, installierte PWA-Systemgesten, Screenreader-Gesamtlauf, Betriebssystem-Dateiablage/-Import oder Druck/PDF-Gesamtlauf. Die letzten Fokus-/Sitzungs-/Kontextkorrekturen sind durch Syntax-/Modellprüfungen abgesichert, nicht durch einen neuen vollständigen Browserlauf. Keine Veröffentlichung oder ausdrückliche nachträgliche Nutzerfreigabe.


## Darstellungsfortschreibung vom 19.11.2026

Die mobile Platzierung der Heute-Karte wird am 19.11.2026 durch [AgDR-0030](0041-entwicklungsvisualisierung.md#agdr-0030) abgelöst: direkt unter der grünen SSW-Karte. Im Wochenbett bleibt sie außerhalb der ausgeblendeten Schwangerschaftszusammenfassung sichtbar.
