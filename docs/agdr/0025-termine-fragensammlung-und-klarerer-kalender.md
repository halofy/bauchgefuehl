# AgDR-0025: F05 Termine, gemeinsame Fragensammlung und klarerer Kalender

- **Status:** Umgesetzt; automatisierte Prüfungen, synthetischer Safari-Hauptablauf und zwölf Layoutkombinationen bestanden.
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzer priorisiert Terminnotizen/Q&A und zeigt einen unübersichtlichen Kalender; Datenmodell und konkrete Darstellung durch den Agenten
- **Betroffene Dateien:** [Terminmodell](../../src/care.js), [Terminoberfläche](../../src/care-ui.js), [Kalender](../../src/calendar-ui.js), [App](../../src/app.js), [Gerätedaten](../../src/device-transfer.js), [Geräteoberfläche](../../src/devices-ui.js), [Bericht](../../src/report.js), [Berichtsoberfläche](../../src/report-ui.js), [HTML](../../index.html), [Styles](../../styles.css), [Tests](../../tests/care.test.js), [Offline-Dateien](../../sw.js)
- **Erweitert / ersetzt teilweise:** [Kalender AgDR-0014](0014-kalender-und-journal.md) hinsichtlich Rastermarkierungen und Filtern; [Teilen AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md) und [Geräte AgDR-0020](0020-serverloser-geraeteabgleich.md) um Termindaten

## Kontext und Herkunft

Der Nutzer betont Notizen und Fragen/Antworten für Gespräche bei Hebamme oder Gynäkologie: einem Termin zuordnen und zugleich in einer Sammlung bereitstellen. Das bestehende F05 wird damit vor F04 bearbeitet. Der Screenshot zeigt viele nahezu identische Vorsorgemarkierungen und ausgedehnte Filter vor dem Monatsraster. Persönliche Informationen aus dem Screenshot werden nicht als Testdaten übernommen.

**Agentenentscheidungen:** Eigene Termine sind von medizinischen Vorsorgefenstern getrennt. Eine Notiz existiert genau einmal und verweist optional auf einen Termin. Die Sammlung ist eine andere Ansicht derselben Daten. Vorab gesammelte Fragen ohne Termin sind zulässig. Es gibt keine automatische Beantwortung, Diagnose, Erinnerung oder Übertragung an Praxen.

## Entscheidung

### Versionierter lokaler Bereich statt zukünftiger Journalbeobachtungen

Termine und Notizen liegen gemeinsam unter `bauchgefuehl.care.v1` mit `v:1`, `appointments` und `notes`. Ein Termin hat Kennung, Datum, optionale Uhrzeit, Bezeichnung, Art (Hebamme/Gynäkologie/anderer Termin), optionalen Ort und Änderungs-/Archivzeitpunkte. Termine können zwischen 1900 und 2200 auch in der Zukunft liegen.

Notizen haben eine eigene stabile Kennung, optional eine gültige Terminreferenz, ihr tatsächliches Notizdatum bis heute, Art (Freitext, Frage/Antwort, Ergebnis/Befund), Text, optionale Antwort und nächste Schritte sowie einen ausdrücklich gesetzten Status „besprochen“. Eine Antwort schließt eine Frage nicht automatisch. Ohne Termin bleibt sie gesammelt und später zuordenbar. Ein Wechsel von Frage zu Freitext löscht eine vorhandene Antwort nicht still; widersprüchliche Eingaben müssen bewusst korrigiert werden. Ergebnisse sind selbst eingegebene Aufzeichnungen und keine fachlich bestätigten Befunde dieser App.

Erfassen, Bearbeiten und reversibles Archivieren stehen unter **Vorsorge → Termine, Notizen & Fragen** bereit. Nächste Termine sind direkt sichtbar, ältere/weitere Termine aufklappbar; die Sammlung ist nach Text, offenen Fragen und Archiv filterbar. Notizen bleiben bei einem archivierten Termin erhalten und in der Sammlung auffindbar. Keine Löschkaskade. Die Tagesansicht im Kalender liest dieselben Notizen und Antworten.

Der Bereich funktioniert auch ohne gespeicherte Schwangerschaft; er hängt nicht an einer erfundenen SSW oder einem vergangenen Journaldatum. Bei einer nur geteilten Reise werden eigene Termindaten nicht eingeblendet oder überschrieben. Zugeordnete Mitlesegeräte lesen mit; Änderungen erfolgen am aktiven Master. Bei beschädigtem oder gesperrtem Speicher werden keine leeren Ersatzstände gespeichert.

### Grenzen und Datenerhalt

Die Validierung prüft Kennungen, Referenzen, Datums-/Zeitwerte, Status und Textlängen. Limits sind Agentenentscheidungen: 100 Termine, 300 Notizen einschließlich Archiv, zusammen 128 KiB. Text bis 4.000, Antwort/nächste Schritte je 3.000 Zeichen. Überschreitungen werden abgewiesen, nicht gekürzt.

Schreibvorgänge nutzen dieselbe Web-Lock-Sperre wie Tracker und Geräteimport. Vor dem Schreiben wird der aktuelle lokale Stand mit der geöffneten Fassung verglichen; veraltete Änderungen überschreiben nichts. Ein begrenzter Rohverlauf `bauchgefuehl.care-history.v1` wird vor der aktiven Änderung geschrieben. Speicherfehler lassen den bisherigen Stand und den geöffneten Entwurf erhalten. Das Archiv ist kein Ersatz für eine extern aufbewahrte Sicherung.

### Backups und signierte Geräte-Stände

Vollständige Backups enthalten neuen aktiven Bereich und Rohverlauf. Vor bestehende Daten ersetzender Wiederherstellung ist ein aktueller Backup-Download erforderlich. Ein Backup nur mit Terminen kann ohne Schwangerschaftsprofil wiederhergestellt werden und verändert keine vorhandene Datierung. Bei vollständigen alten Backups ohne Termindaten zeigt die Vorschau ausdrücklich null Termine/Notizen und erklärt, dass der aktive Bereich nach Sicherung geleert wird. Vorherige Zustände bleiben im lokalen Verlauf und in der Quelldatei. Historische Verläufe aus Backups werden nicht blind über den aktuellen Verlauf kopiert.

Der bestehende v3-Journal-/Profilstand bleibt unverändert. Signierte Gerätepakete mit Terminen verwenden **Body-Version 2** mit `data.care`; Verschlüsselung, Dateihülle und kompakter URL-Transport bleiben erhalten. Die aktuelle Geräteoberfläche exportiert diesen Bereich immer vollständig einschließlich Archiv. Beide Smartphones müssen aktualisiert werden: Die bisherige Body-v1-Leselogik weist Version 2 ab, statt Termine unbemerkt auszulassen. Ein neues Body-v1-Paket darf nicht zugleich versteckte Termindaten enthalten.

Alte v1-Stände bleiben lesbar. Vor Übernahme auf einem bereits gekoppelten Gerät werden jedoch zusätzlich alle Termin-/Notizkennungen und Änderungsstände geprüft: fehlende, ältere oder bei gleichem Zeitpunkt abweichende Daten verhindern die Übernahme. Ein ungekoppeltes Gerät kann nach bewusstem aktuellem Backup abweichende eigene Daten ersetzen. Bereits gebundene Mitleser umgehen den Schutz nicht über diese Option. Nur Termine betreffende Änderungen erhöhen bei neuem Export die signierte Version ebenfalls.

Der mehrteilige Import nimmt neue Schlüssel in die bestehende Vorher-/Nachher-Recovery auf. Profil, Journal, Kontakte, Termine und Gerätebindung werden gemeinsam übernommen oder nach Unterbrechung zurückgesetzt. Unlesbare Recovery-Daten werden nicht still verworfen. Lokales Löschen entfernt auch aktive Termindaten und Verlauf; bereits verteilte Kopien bleiben davon unberührt.

### Bewusst begrenzter Bericht

Der Journalauszug erhält zwei zunächst abgewählte Bereiche: **Terminnotizen & Antworten** und **Termindaten einschließlich Uhrzeit/Ort**. Journalnotizen, strukturierte Check-ins und weitere Messwerte schließen diese neuen Bereiche nicht automatisch ein. Ohne Termindatenwahl enthalten ausgewählte Terminnotizen keine internen Terminreferenzen, Termintitel, Termine, Orte oder Provider-Metadaten. Bewusst eingegebener Freitext wird nicht automatisch inhaltlich redigiert.

Zeitraumfilter betreffen das jeweilige Journal-/Notizdatum beziehungsweise Termindatum. Wenn Terminnotizen und Termindaten gemeinsam gewählt sind, kann die zugehörige Terminangabe auch außerhalb des Notizzeitraums erscheinen; das steht in der Vorschau. Einzelne Notizen oder Termine lassen sich ausschließen. Der gesamte Export enthält ausschließlich projizierte Angaben, keine Rohdaten, Schlüssel oder internen Änderungszeitpunkte. Reine Termin-/Notizberichte funktionieren auch ohne ausgewählte Journaleinträge. Die Ausgabe bleibt eine eigenständige Offline-HTML-Datei, kein eingebauter PDF-Generator.

### Klareres Monatsraster

Die Monatsüberschrift mit Vor/Zurück, Heute und ET bleibt direkt sichtbar. Der redundante Monatswähler, optionale Vorsorgebereich-Hervorhebung und Symptomfilter sind zusammen aufklappbar. Sie starten geschlossen; Bereichsschattierung und Symptomfarben starten aus. Die Symptomauswahl wirkt bei aktivierter Hervorhebung weiterhin auf den Rückblick.

**T** markiert echte eigene Termine, **J** Journaleinträge; bei mehreren steht die Anzahl dabei. **V** markiert nur den Beginn eines Vorsorgefensters, nicht jeden Tag innerhalb des Zeitraums. Meilensteine behalten die Raute. Die Legende steht vor dem Raster. Ganztägige braune Unterstriche und Striche auf fast jedem Tag entfallen. Datumszahl, kleinere SSW-Zeile und wenige Marker sind getrennt; Rasterzellen werden kompakter, mit weiterhin mindestens 65 CSS-Pixeln Höhe. Große Markerzahlen werden als 9+ gekürzt angezeigt und können umbrechen; vollständige Anzahlen stehen im zugänglichen Tagesnamen beziehungsweise den Tagesdetails.

Die Tagesansicht zeigt eigene Termine und lesbare Notizen zuerst. Unveränderte Vorsorgefenster und Meilensteine sind in einer benannten Vertiefung verfügbar; es werden keine medizinischen Zeitfenster gelöscht oder umgerechnet. Tastaturbewegung und SSW-Datumsarithmetik bleiben erhalten. Die zugänglichen Tagesnamen nennen Vorsorgefenster nur an ihrem Beginn oder bei ausdrücklich eingeblendeten Bereichen, statt denselben langen Hinweis täglich zu wiederholen.

## Erwogene Alternativen

- Terminnotizen im normalen Journal mit zukünftigen Beobachtungsdaten speichern: Würde die Bedeutung von Beobachtung und Planung vermischen.
- Notizen zweimal kopieren: Würde auseinanderlaufende Antworten und Bearbeitungsstände erzeugen.
- Ein neues Journalformat erzwingen: Für getrennte geplante Termine nicht nötig; stattdessen ausdrücklich versionierte Erweiterung des Gerätepakets.
- Neue Daten still in Body-Version 1 ergänzen: Alte Leser könnten sie verwerfen. Version 2 erzwingt Aktualisierung.
- Alle Vorsorgefenster immer hervorheben: Verursacht die im Screenshot sichtbare visuelle Gleichförmigkeit.

## Folgen und Grenzen

F05 ist umgesetzt; F04 bleibt offen und wird nicht implizit als erledigt markiert. Die App bleibt statisch, lokal und offline nutzbar; die bestehenden manuellen Geräte-Stände bleiben manuell. Keine Anbindung an einen Arztkalender, keine OS-Benachrichtigungen und kein neuer Server. Die App bestätigt keine Terminvereinbarung oder medizinische Richtigkeit eigener Gesprächsnotizen.

## Verifikation

- **186 von 186 automatisierten Tests bestanden**, keine übersprungen; davon 18 neue für Termin-/Notizmodell, Zukunftsplanung, Referenzen, gemeinsame Projektion, Antwortstatus, Archiv/Wiederherstellung, Grenzen, veraltete Änderungen, Suche, Speicherfehler, reine Zusatzbereich-Wiederherstellung, atomaren Rollback, verschlüsselte v2-Übertragung, v1-Kompatibilität/Datenerhalt, reine Termin-Versionsfortschreibung und echte Entfernung aus Teilberichten einschließlich HTML-Escaping.
- Ausführung über `node --test tests/*.test.js`, identischer Einstieg wie `npm test`; npm nicht im PATH.
- Safari ausschließlich synthetisch: vorhandenen Termin geöffnet; eine neue Frage mit Antwort als besprochen gespeichert und identisch in Sammlung und aufgeklapptem Termin gesehen. Kalender zeigte denselben Termin mit Notizanzahl. Zweiten zukünftigen Termin am ausgewählten Tag ohne Uhrzeit gespeichert; beide Termine und der offene Uhrzeitstatus erschienen. Die manuelle Provider-Auswahl wurde nach einem nativen Popup-Wechsel nicht als verlässlich bestätigt; daraus wird kein bestandener Gyn-Auswahltest behauptet.
- Isolierte Safari-Layoutprüfung bei **320, 390, 820 und 1440 CSS-Pixeln**, jeweils Kalender, Terminsammlung und geöffnetem Notizdialog: **alle zwölf Kombinationen bestanden**. Geprüft: tatsächliche Inhaltsbreite, 42 Tage, geschlossene Anzeigeoptionen, standardmäßig keine Vorsorgebereichsschattierung, getrennte Termin-/Journalmarker, Legende vor dem Raster, kompakte Zellen, vorhandene Sammlung, Terminvorbelegung und kein horizontaler Überlauf. Nur QA-Kopien mit geänderter initialer Ansicht und Cache-Umgehung; keine QA-Fixtures im Build.
- Build über `node scripts/build.js` erfolgreich, identischer Einstieg wie `npm run build`. HTML-Struktur, eindeutige IDs, UI-Ziele, Dokumentationslinks und `git diff --check` geprüft.
- Letzte kleinere Darstellungskorrekturen nach dem manuellen Hauptablauf: kürzere zugängliche Vorsorge-Tagesnamen, deutsche Terminart im Bericht, Markerzahlen ab zehn als 9+ mit Umbruch und eindeutiges Label „Journalnotizen“. Sie wurden nicht erneut in einem vollständigen manuellen Rundlauf geprüft. Die Layoutmessung enthält bereits die kürzeren zugänglichen Namen und die verschobene Legende, aber noch keine großen Markerzahlen.
- Offen: vollständige physische iPhone-/Android-Prüfung, Screenreader, OS-Dateiweitergabe und kompletter Backup-/Zwei-Geräte-UI-Durchlauf mit Termindaten. Datenmodell und Import-/Berichtswege wurden automatisiert geprüft; nicht jeder Browserausfall wurde manuell simuliert.

## Quellen

- [Nutzerbeauftragte Feature-Liste F05](../open.md), [Kalendergrundlage](0014-kalender-und-journal.md), [bewusstes Teilen](0016-kostenlos-offline-und-selektives-teilen.md), [serverloser Geräteabgleich](0020-serverloser-geraeteabgleich.md), [kompakte URLs](0022-smartphone-nahuebertragung-und-kompakte-links.md).
- [Terminmodell und Grenzen](../../src/care.js), [synthetische Tests](../../tests/care.test.js), [Recovery](../../src/device-transfer.js), [Berichtsprojektion](../../src/report.js).
- Datenquelle für Notizen, Antworten und Ergebnisse sind eigene Eingaben. Diese Änderung führt keine neuen medizinischen Empfehlungen oder neuen medizinischen Grenzwerte ein; die vorhandenen Kalender-/Vorsorgequellen gelten unverändert.
