# Feature-Liste

Stand: **17.11.2026**. Arbeitsübersicht für die nächsten Erweiterungen von bauchgefühl. Die Liste wurde vom Nutzer beauftragt; Prioritäten und Abschlusskriterien sind Vorschläge des Agenten. Begründungen und Herkunft: [AgDR-0012](agdr/0012-roadmap-und-ssw-pruefung.md).

Checkboxen markieren abgeschlossene Features. **P1** = zuerst, **P2** = danach, **P3** = spätere Erweiterung. Die Kennungen bleiben bei einer Umpriorisierung erhalten. Ein Feature wird erst abgehakt, wenn seine Abschlusskriterien und die gemeinsamen Kriterien erfüllt sind; ein begonnener Eintrag erhält den Zusatz „In Arbeit“.

## Geklärt und bereits vorhanden

- [x] **SSW-Berechnungsfrage geklärt.** Der Nutzer hat die Erklärung zur Zyklusanpassung bestätigt. Keine offene Aufgabe zur Änderung der Formel oder zur zusätzlichen Gegenüberstellung. Die persönliche Rechenerklärung ist bereits umgesetzt; siehe [AgDR-0011](agdr/0011-persoenliche-berechnungserklaerung.md).
- [x] **Bestehende Grundlage:** Journal mit Symptomen, Text, Tags und Messwerten, Archivierung/Wiederherstellung, einfache Verläufe, Filter und CSV; lokale Speicherung, Backups und Master-Sync. Diese Funktionen werden durch die folgenden Features erweitert.

## P1 – Mutterbezogenen Alltag verbessern

- [ ] **F01 · Eigener Bereich „Für dich“**
  Gleichwertig sichtbarer Bereich neben den Babyinformationen mit vertieften Wocheninfos zu körperlichen Veränderungen, Alltag, Schlaf, Gefühlen und Unterstützung.
  **Fertig, wenn:** Die Inhalte folgen der ausgewählten Woche, haben nachvollziehbare Quellen und sind mobil wie am Desktop erreichbar. Bestehende Körpertexte sind sinnvoll eingebunden.

- [ ] **F02 · Tages-Check-in**
  Kurze strukturierte Erfassung von Stimmung, Energie, Schlaf und Symptomstärke als Ergänzung zum freien Journal.
  **Fertig, wenn:** Kategorien beziehungsweise Skalen verständlich erklärt sind, einzelne Angaben ausgelassen werden können und mehrere Beobachtungen am selben Tag mit Uhrzeit unterscheidbar bleiben. Check-ins sind bearbeitbar, archivierbar, gesichert und synchronisiert.

- [ ] **F03 · Symptomkalender und Wochenrückblick**
  Kalenderansicht für Beobachtungen sowie eine Zusammenfassung von Stimmung, Schlaf, Energie und Symptomen für eine gewählte Woche.
  **Fertig, wenn:** Von der Zusammenfassung zu den Originaleinträgen gewechselt werden kann, fehlende Angaben als fehlend erkennbar bleiben und archivierte Daten konsistent behandelt werden. Häufigkeiten beziehen sich auf erfasste Beobachtungen, nicht auf vermeintlich beschwerdefreie Tage.
  **Abhängigkeit:** F02 für strukturierte Check-in-Auswertungen; vorhandene Journalangaben weiter berücksichtigen.

- [ ] **F04 · Messwertverläufe mit Ausgangswert und Notizen**
  Vorhandene Gewichts- und Umfangsverläufe um eine selbst gewählte Ausgangsmessung, absolute Veränderungen und Notizmarkierungen ergänzen.
  **Fertig, wenn:** Ausgangswert und Vergleichszeitraum wählbar sind, Einheiten getrennt bleiben und sich markierte Beobachtungen öffnen lassen. Keine pauschalen Normalbereiche oder automatische gesundheitliche Bewertung.

- [ ] **F05 · Vorbereitung auf Praxis und Hebamme**
  Eigene Termine, Fragen, Untersuchungsergebnisse und besprochene nächste Schritte sammeln.
  **Fertig, wenn:** Fragen einem Termin zugeordnet und als besprochen markiert werden können. Ergebnisse und nächste Schritte sind mit Datum erfassbar und später wieder auffindbar; ausstehende Fragen bleiben sichtbar. Keine automatischen Diagnosen oder Behandlungsvorschläge.

## P2 – Begleitung und Berichte ausbauen

- [ ] **F06 · Journal im Wochenbett weiterführen**
  Einen ausdrücklichen Übergang nach der Geburt anbieten und persönliche Einträge ohne laufende Schwangerschaft weiterbearbeiten können.
  **Fertig, wenn:** Der Wechsel bewusst erfolgt, Schwangerschaftseinträge erhalten bleiben und neue Einträge nach Tagen beziehungsweise Wochen seit der Geburt eingeordnet werden können. Eine abgelaufene Schwangerschaftsberechnung blockiert die Journalbearbeitung nicht.
  **Vor Umsetzung:** Eigenen AgDR für Phasenwechsel, Datierung, Datenmigration und Sync-Kompatibilität erstellen.

- [ ] **F07 · Praxisbericht als PDF** — Premium-Kandidat
  Einen übersichtlichen Bericht mit ausgewähltem Zeitraum, Fragen, Symptomen und Messwerten erzeugen.
  **Fertig, wenn:** Zeitraum und enthaltene Bereiche auswählbar sind, eine Vorschau verfügbar ist und die lokal erzeugte PDF Datumsangaben und Einheiten korrekt darstellt. Eine ausgewählte Teilmenge exportiert ausschließlich diese Angaben.
  **Abhängigkeiten:** Bestehendes Journal; F05 für Terminfragen und Ergebnisse, F02 für strukturierte Check-ins im Bericht.

- [ ] **F09 · Persönlicher Geburts- und Wochenbettplan** — Premium-Kandidat
  Wünsche, Vorbereitungen, Kontakte und benötigte Unterstützung in bearbeitbaren Vorlagen festhalten.
  **Fertig, wenn:** Abschnitte frei ergänzt oder ausgelassen werden können, der Bearbeitungsstand erhalten bleibt und eine druckbare Fassung erzeugt werden kann. Wünsche sind als persönliche Planung erkennbar.

## P3 – Zusätzlichen Komfort ergänzen

- [ ] **F08 · Anpassbare Übersichten und Journalvorlagen** — Premium-Kandidat
  Eigene Kombinationen von Messreihen und Rückblicken sowie wiederverwendbare Vorlagen für häufige Einträge anbieten.
  **Fertig, wenn:** Ansichten und Vorlagen benannt, gespeichert, geändert und entfernt werden können. Eine Vorlage erzeugt erst nach ausdrücklichem Speichern einen neuen Journaleintrag.
  **Abhängigkeiten:** F02–F04 als Grundlage für die erweiterten Ansichten.

- [ ] **F10 · Fotojournal mit Vergleich und Zeitraffer** — Premium-Kandidat
  Optionale datierte Fotos mit Vergleichsansicht und Zeitraffer ergänzen.
  **Fertig, wenn:** Import, Datumszuordnung, Vergleich und lokaler Export funktionieren und Fotoqualität sowie Speicherbedarf verständlich einstellbar sind. Foto-Sicherung und Übertragung sind ausdrücklich geregelt; bestehende Textdaten bleiben bei Fotofehlern nutzbar.
  **Vor Umsetzung:** Eigenen AgDR für Bildspeicher, Größenlimits, Metadaten, Sicherung, Wiederherstellung und verschlüsselten Geräte-Sync erstellen. Bilder passen nicht sinnvoll in den bisherigen JSON-Datenstand mit rund 512 KiB.

- [ ] **F11 · Vertiefende Lernmodule** — Premium-Kandidat
  Zusätzliche strukturierte Inhalte zur Geburtsvorbereitung und zum Wochenbett mit persönlichem Lesefortschritt anbieten.
  **Fertig, wenn:** Umfang und Zielgruppe definiert, Inhalte fachlich geprüft und mit Quellen sowie redaktionellem Stand versehen sind. Lesefortschritt kann gespeichert und zurückgesetzt werden.
  **Abhängigkeit:** F01 für Darstellung und redaktionelle Grundlage.

## Gemeinsame Abschlusskriterien

- Neue persönliche Angaben bleiben lokal nutzbar und werden in Sicherung, Wiederherstellung und vorhandenen Master-Sync einbezogen. Nur der aktive Master bearbeitet synchronisierte Daten.
- Bestehende Daten werden bei Formatänderungen erhalten; Migrationen und Fehlerfälle werden passend geprüft. In Tests und Dokumentation stehen ausschließlich synthetische Beispiele.
- GitHub-Pages-Kompatibilität, mobile Bedienung und die vorhandene Offline-Nutzung bleiben erhalten. Funktionen mit zusätzlichem Infrastrukturbedarf bekommen vor der Umsetzung eine dokumentierte Architekturentscheidung.
- Medizinische Inhalte haben Primärquellen und einen redaktionellen Stand. Beobachtungen werden nicht als Diagnosen oder nachgewiesene Ursachen interpretiert.
- Wesentliche Entscheidungen erhalten einen AgDR; README und diese Arbeitsliste werden entsprechend aktualisiert. Funktionsänderungen werden angemessen geprüft und gebaut, verbleibende Prüflücken dokumentiert.

## Noch offene Produktentscheidung

**Premium-Kandidat** beschreibt zunächst zusätzlichen Funktionsumfang. Ein Bezahlmodell, Preise und konkrete Zugangsgrenzen sind nicht beschlossen. Die bisherige Empfehlung bleibt: Grundberechnung, Quellen, grundlegende Sicherheitshinweise, Datenzugang, Export und Sicherung gehören zur Basis.

**Empfohlener Start:** F01 und F02, danach F03. F04 und F05 können unabhängig von diesen beiden umgesetzt werden.
