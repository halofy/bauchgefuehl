# AgDR-0053: Mobile Neuordnung und gemeinsame Erfassung

- **Status:** Umgesetzt
- **Datum:** 2026-11-23
- **Entscheidende Instanz:** Der Nutzer beauftragt die Umsetzung des überarbeiteten Konzepts. Die Auswahl der vier Standardfelder aus den vorhandenen Messarten und die visuelle Anordnung sind Entscheidungen des Agenten.
- **Betroffene Dateien:** [Ansichten](../../index.html), [Navigation](../../src/navigation.js), [Eingabe und Journal](../../src/journal-ui.js), [Kalender](../../src/calendar-ui.js), [Vorsorge](../../src/care-ui.js), [Dezimalwerte](../../src/journal.js)
- **Ersetzt / ergänzt:** Setzt den überarbeiteten Entwurf aus [AgDR-0052](0052-fuer-dich-und-schnelle-erfassung.md) um. Übernimmt die Kalender- und Vorsorgeordnung aus [AgDR-0051](0051-mobile-informationsarchitektur.md) und löst die betroffenen Teile aus [AgDR-0021](0021-uebersichtliche-hauptbereiche.md), [AgDR-0024](0024-fuer-dich-und-mobile-layoutkorrekturen.md) und [AgDR-0044](0044-kalender-mit-gemeinsamer-wochenansicht.md) ab.

> [AgDR-0054](0054-wissen-und-zeitbezogene-lesetipps.md) ergänzt einen dauerhaft sichtbaren Wissenszugang, zusätzliche Artikel und zeitbezogene Lesetipps.

## Kontext und Herkunft

Der Nutzer erwartet Körpermesswerte unter „Für dich“. Vier häufige Werte sollen ohne Auswahl von Messarten eingegeben werden können. Die bisherige Wahl zwischen Journal und Check-in setzt Vorwissen voraus. Die Dezimaleingabe soll im Formular erklärt werden.

## Entscheidung

Die Hauptnavigation zeigt **Heute · Wochenreise · Für dich · Kalender · Vorsorge**. Wissen ist über „Wissen nachschlagen“ auf Heute und über bestehende Verweise erreichbar. Für dich zeigt direkt die Eingabeaktionen und die Ansichten für Einträge, Messwertverlauf, Wochenrückblick und Körperinfos. Die Wochenreise verlinkt die Körperinfos für die ausgewählte SSW. Die SSW-Berechnung und Referenzdaten sind von diesen Wegen unabhängig.

Heute und Für dich öffnen das gleiche Formular. Der Einstieg **Messwerte eintragen** zeigt Gewicht, Bauch-, Brust- und Hüftumfang mit fester Einheit und eingesetztem Datum. **Heute festhalten** beginnt bei Notiz, Symptomen und Befinden. Die jeweils andere Gruppe lässt sich im gleichen Formular öffnen. Tags, Temperatur und eigene Messgrößen stehen unter **Weitere Angaben**. Datum, Uhrzeit und Eintrag bleiben beim Wechsel der Gruppen erhalten. Ein neuer Eintrag bekommt nur dann den vorhandenen strukturierten Typ, wenn Befindensfelder ausgefüllt sind. Beim Bearbeiten bleibt der gespeicherte Typ einschließlich Eintragskennung erhalten. Ein früherer freier Eintrag kann daher über seinen Editor nicht nachträglich als Befindenseintrag umklassifiziert werden. Archiv, Rückblick und Auswahlregeln für Teilberichte nutzen weiterhin die gespeicherten Einträge.

Die Eingabe akzeptiert Komma oder Punkt und zeigt ein sichtbares Beispiel. Untersuchungseingaben nutzen dieselbe strikte Umwandlung. Zum Bearbeiten werden Dezimalzahlen ohne Tausendergruppierung und mit Komma ins Feld gesetzt. Vorhandene Werte, SSW-Berechnung und Einheiten bleiben erhalten.

Der Kalender wechselt zwischen Monat und Woche. Tagesdetails führen zu demselben Termin oder Eintrag. Die Wochenansicht und der verlinkte Rückblick zeigen denselben Zeitraum. Datumssuche, Langdruck, Markierungen und Vorausblick bleiben erreichbar. In der Vorsorge steht zuerst der nächste eigene Termin. Weitere Termine, Fragen und Notizen, Fenster sowie Geburts- und Wochenbettplanung bleiben zugänglich.

## Erwogene Alternativen

Eine Auswahl des Eintragstyps vor dem Formular würde die Rückmeldung zu mehr Klicks verfehlen. Eine nachträgliche Umklassifizierung durch eine neue Eintragskennung würde bestehende Verweise und die getrennte Auswahl für Teilberichte verändern. Die vorhandenen IDs und Typregeln bleiben daher bestehen.

## Folgen und Grenzen

Die Änderungen betreffen Ansichten und Eingabe. Bestehende lokale Daten benötigen keine Migration. Offline-Ablauf, Geräteberechtigungen, selektive Weitergabe und Datierung verwenden dieselben Mechanismen. Bei einer geteilten Ansicht oder einem Lesegerät entscheidet weiterhin die vorhandene Schreibberechtigung.

## Verifikation

- `npm test` erfolgreich mit 237 Tests. `npm run build` und `git diff --check` erfolgreich.
- Chromium mit synthetischen Angaben bei 390 CSS-Pixeln. Von Heute öffnete sich das Formular mit allen vier Feldern direkt. Ein ungültiges Dezimalformat markierte das betroffene Feld und ließ die übrige Eingabe bestehen. Vier Körperwerte, Notiz und Schlafdauer wurden gemeinsam gespeichert und im Verlauf beziehungsweise am Kalendertag angezeigt. Kalenderfilter, Rückweg, Wochenrückblick, Körperinfos für eine ausgewählte SSW und die Terminmappe wurden geprüft.
- Auf 320 CSS-Pixeln öffneten sich die vier Felder in der PWA nach Offline-Neuladen. Physische iPhone- und Android-Tastaturen sowie ein Nutzertest stehen noch aus.

## Quellen

- [Konzept](0051-mobile-informationsarchitektur.md), [Weiterentwicklung nach Nutzerfeedback](0052-fuer-dich-und-schnelle-erfassung.md)
