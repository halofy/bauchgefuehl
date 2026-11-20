# AgDR-0015: F03 – Symptomkalender und Wochenrückblick aus Journalangaben

- **Status:** Journal-Grundlage umgesetzt; automatisiert und lokal in Safari geprüft. Strukturierte Check-ins aus F02 weiterhin offen.
- **Datum:** 2026-11-17
- **Fortgeschrieben durch:** [AgDR-0023](0023-tages-check-in-und-strukturierter-rueckblick.md) – F02 und der hier noch offene strukturierte Rückblick sind seit 18.11.2026 umgesetzt; der folgende Text dokumentiert den damaligen Stand.
- **Entscheidende Instanz:** Nutzeranforderung; Auswahl der unabhängigen F03-Teile und konkrete Aggregationsregeln durch den Agenten
- **Betroffene Dateien:** [Rückblickmodell](../../src/reflection.js), [Rückblickoberfläche](../../src/reflection-ui.js), [Journalmodell](../../src/journal.js), [Journaloberfläche](../../src/journal-ui.js), [Kalenderoberfläche](../../src/calendar-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Stylesheet](../../styles.css), [Offline-Dateien](../../sw.js), [Tests](../../tests/reflection.test.js)
- **Erweitert:** [AgDR-0009](0009-persoenliches-journal.md), [AgDR-0012](0012-roadmap-und-ssw-pruefung.md), [AgDR-0014](0014-kalender-und-journal.md)

> Die Anordnung des Kalenders und der Zeitraum des Rückblicks wurden in [AgDR-0044](0044-kalender-mit-gemeinsamer-wochenansicht.md) weiterentwickelt.

## Kontext und Herkunft

Der Nutzer möchte beim Kalender und der Journalintegration „auch weiteres von F03“ einarbeiten lassen. F03 umfasst laut Feature-Liste einen Symptomkalender, einen Wochenrückblick, nachvollziehbare Originaleinträge und einen korrekten Umgang mit fehlenden beziehungsweise archivierten Angaben. Strukturierte Stimmung, Energie, Schlaf und Symptomstärke hängen dort von F02 ab.

**Agentenentscheidung:** Die bereits ausdrücklich erfassten Symptome und Messwerte ermöglichen einen eigenständig nutzbaren F03-Teil ohne neue Check-in-Datenfelder. F02 wird nicht implizit als erledigt behandelt. Freitext und Tags werden nicht als Gesundheitsangaben interpretiert. „Umgesetzt“ bezeichnet den implementierten Umfang, keine nachträgliche Nutzerfreigabe.

## Entscheidung

### Symptomnennungen im bestehenden Kalender

Eine Auswahl oberhalb des Monatsrasters hebt entweder alle Einträge mit mindestens einem Symptom oder ein bestimmtes Symptom hervor. Die vorhandenen Journalmarkierungen bleiben erhalten. Die neue Markierung zählt **Beobachtungen**, also Journaleinträge, keine Intensität und keine vermeintlich beschwerdefreien Tage. Dasselbe Symptom zählt in einem Eintrag höchstens einmal; zwei Einträge am selben Tag ergeben zwei Beobachtungen an einem Tag.

Ein Symptom wird über die getrimmte, deutsch kleingeschriebene Bezeichnung verglichen. Freie Symptomnamen bleiben möglich. „Übelkeit“ und „übelkeit“ gehören zusammen; ähnlich benannte andere Symptome und Nennungen im Notiztext werden nicht gleichgesetzt. Es gibt keine medizinische Synonymzuordnung. Die gespeicherten Originalbezeichnungen bleiben erhalten.

### Wochenrückblick: Montag bis Sonntag

Der gewählte Kalendertag bestimmt die vollständige Kalenderwoche von Montag bis Sonntag. Dies ist ausdrücklich eine **Kalenderwoche**, nicht die laufende Schwangerschaftswoche. Pfeile wechseln um sieben Tage; Tageskarten wählen den entsprechenden Kalendertag. Kalenderwochen folgen derselben auf Kalendertagen beruhenden Datumsarithmetik wie die übrige App, ohne Sommerzeitverschiebung.

Der Rückblick nennt Eintragsanzahl, Tage mit Eintrag, vergangene beziehungsweise heutige Tage ohne Eintrag und zukünftige Tage getrennt. Ein Eintrag ohne Symptomangabe bleibt als solcher erkennbar; fehlende Angaben werden nicht als Nullwert oder Beschwerdefreiheit interpretiert. Zukünftige Beobachtungen werden nicht gezählt. Archivierte Einträge sind ausgeschlossen; eine Wiederherstellung berücksichtigt sie wieder.

Die Symptomliste nennt die Zahl der Beobachtungen und der unterschiedlichen Tage. Die oberhalb des Kalenders gewählte Symptomauswahl gilt auch hier. Erfassungsabdeckung und Messwerte bleiben dagegen auf die gesamte Woche bezogen; die Beschriftung beschreibt diesen Unterschied.

### Nachvollziehbare Quellen und Messwerte

Ein Symptom öffnet die Journalliste mit dem vollständigen Wochenzeitraum einschließlich beider Grenzen und einem exakten Symptomfilter. Andere Suche, Tagfilter und Archivansicht werden dabei zurückgesetzt. Der allgemeine Link öffnet alle aktiven Einträge der Woche. Die geöffnete Liste wird in den sichtbaren Bereich gescrollt und der Filterbereich fokussiert. Verschwindet ein ausgewähltes Symptom durch Archivierung oder Datenänderung, bleibt seine Auswahl bestehen und liefert gegebenenfalls keine Treffer; sie wird nicht unbemerkt auf alle Symptome erweitert.

Die Messwertübersicht gruppiert vorhandene Messungen nach dem bestehenden Messreihenschlüssel einschließlich Einheit. Angezeigt werden letzter Wert, Anzahl und Zeitpunkt, bei mehreren Messungen außerdem erster Wert und Minimum–Maximum. Die Reihenfolge folgt Datum, Uhrzeit und stabilen Eintragsmerkmalen. Einheiten werden weder vermischt noch umgerechnet. Eigene Messgrößen wie Schlafdauer können erscheinen; daraus entsteht keine strukturierte Schlafbewertung. Keine Normalbereiche, Diagnose, Trendbewertung oder Schlussfolgerung aus fehlenden Werten.

### Speicherung, Rechte und Offline-Betrieb

Die Erweiterung liest das bestehende Journal. Es gibt keine zweite Datenablage, Datenmigration, neue personenbezogene Datenkategorie oder Änderung des verschlüsselten Sync-Formats. Kalenderauswahl und Filter sind vorübergehender Oberflächenzustand. Änderungen, Archivierung, Wiederherstellung und empfangene Daten aktualisieren die Darstellung über die vorhandenen Renderwege. Nur der Master bearbeitet Daten; mitlesende Geräte können die lokalen Ansichten und Filter verwenden.

Die neuen Module gehören zur Offline-Dateiliste und zum versionierten statischen Build. Keine neue Abhängigkeit oder externe Anfrage für den Rückblick. Bestehende lokale Sicherungen, Master-Backups und Sync enthalten weiterhin die zugrunde liegenden Journaleinträge.

## Erwogene Alternativen

- **F03 vollständig bis F02 zurückstellen:** Würde nutzbare vorhandene Symptome und Messwerte unberücksichtigt lassen. Die Feature-Liste hält die bereits umgesetzten und noch offenen Teile getrennt fest.
- **Stimmung, Energie oder Symptomstärke aus Notizen ableiten:** Würde unbeauftragte, nicht ausdrücklich erfasste Angaben erzeugen. Dafür bleibt die strukturierte Erfassung in F02 vorgesehen.
- **Fehlende Tage als beschwerdefrei oder als Nullwert zählen:** Würde die Aussage der vorhandenen Beobachtungen verändern. Erfassungslücken bleiben sichtbar.
- **Nur Tage statt Einträge zählen:** Würde mehrere Beobachtungen desselben Tages verdecken. Deshalb werden beide Größen benannt.
- **Eine eigene Symptomablage oder ein neuer Sync-Datentyp:** Für diese Projektion nicht erforderlich und mit zusätzlichem Migrationsrisiko verbunden.

## Folgen und Grenzen

F03 bleibt als „In Arbeit“ markiert. Symptommarkierungen, Häufigkeiten, Erfassungslücken, Originaleinträge und deskriptive Messwertübersichten sind umgesetzt. Strukturierte Stimmung, Energie, Schlaf und Symptomstärke folgen erst mit F02. Häufigkeiten beschreiben ausschließlich erfasste Angaben und sind keine medizinische Bewertung.

Die Startansicht und fünf Hauptbereiche bleiben erhalten. Die zusätzliche Wochenkarte verlängert die Kalenderansicht; auf Smartphones werden Tageskarten in zwei Spalten und die beiden Inhaltsbereiche untereinander dargestellt. Ein bewusstes PWA-Update ist nötig, um eine bereits installierte ältere Fassung zu ersetzen.

## Verifikation

Am 17.11.2026 ausschließlich mit synthetischen Daten durchgeführt:

- **106 automatisierte Tests bestanden**, davon zwölf neue für Kalenderwochengrenzen einschließlich Jahres- und Sommerzeitwechsel, fehlende/zukünftige Angaben, mehrere Beobachtungen pro Tag, Groß-/Kleinschreibung und doppelte Nennung, Archivierung/Wiederherstellung, inklusive Wochengrenzen, Messreihenfolge, Nullwerte, getrennte eigene Einheiten, exakte Originalfilter, freie Symptomnamen und unveränderte Eingaben.
- Die Skriptziele aus `package.json` wurden mit der vorhandenen Node-Laufzeit direkt ausgeführt, da `npm` im PATH nicht verfügbar ist: `node --test tests/*.test.js` und `node scripts/build.js`. Build erfolgreich; beide neuen Module sind in der statischen Auslieferung enthalten.
- Safari mit isoliertem synthetischen Datenstand: Zwei aktive Einträge mit „Übelkeit“ am selben Tag sowie ein archivierter Eintrag ergeben **zwei Beobachtungen an einem Tag**. „Müdigkeit“ ergibt eine Beobachtung. Wochenabdeckung, letzte/erste Gewichtsmessung und getrennte Schlafdauer-Einheiten stimmen mit dem Datenstand überein. Ein Sprung aus der Symptomliste öffnet den exakten Wochen-/Symptomfilter; der Wechsel zwischen Müdigkeit und Übelkeit liefert jeweils die zugehörigen Originaleinträge.
- Isolierte Safari-Layoutprüfung bei tatsächlichen Inhaltsbreiten von **320, 390, 820 und 1440 CSS-Pixeln**: Kalender, Rückblick, sieben Tageskarten und Messwertbereich vorhanden und ohne horizontalen Überlauf; korrekte Symptomzahl, Ausschluss archivierter Einträge und getrennte Einheiten in allen vier Fällen. In der isolierten Kopie war nur die anfängliche Navigation auf den Kalender gesetzt; die Produktionsnavigation startet weiterhin mit dem Überblick.
- HTML-Struktur, eindeutige IDs, Kalender-/Rückblickreferenzen, lokale Dokumentationslinks und `git diff --check` erfolgreich geprüft. Build-Dateien stimmen mit den Quellmodulen überein und stehen in der Offline-Liste; die isolierten QA-Fixtures sind nicht Bestandteil der Auslieferung.

Offen bleiben ein physischer Smartphone-/Screenreader-Durchlauf, die vollständige Browsermatrix und ein erneuter vollständiger Offline-Update-/Zwei-Geräte-Sync-Durchlauf speziell mit dieser Ansicht. Manuelles Archivieren/Wiederherstellen wurde in diesem Safari-Durchlauf nicht erneut ausgeführt; Modellverhalten und Ausschluss bereits archivierter Einträge wurden wie oben geprüft. Es wird kein neuer getesteter Servermechanismus behauptet.

## Quellen

- [Feature-Liste F02/F03](../open.md), [bestehendes Journalmodell](../../src/journal.js), [Rückblickmodell](../../src/reflection.js), [Rückblicktests](../../tests/reflection.test.js).
- [Kalenderintegration und Datumsprojektion](0014-kalender-und-journal.md), [Datumsarithmetik](../../src/dates.js), [bestehende Master-/Sync-Entscheidung](0008-master-sync-und-lokaler-betrieb.md).
- Diese Änderung führt keine neuen medizinischen Inhalte oder Behandlungsgrenzen ein; die Aggregationsregeln sind die oben gekennzeichneten Agentenentscheidungen.
