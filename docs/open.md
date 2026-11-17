# Feature-Liste

Stand: **17.11.2026**. Arbeitsübersicht für die nächsten Erweiterungen von bauchgefühl. Die Liste wurde vom Nutzer beauftragt; Prioritäten und Abschlusskriterien sind Vorschläge des Agenten. Begründungen und Herkunft: [AgDR-0012](agdr/0012-roadmap-und-ssw-pruefung.md).

**Verbindliche Nutzeranforderung:** Alle Funktionen sind für alle kostenlos. Es gibt kein Bezahl-Premium. Neue Funktionen funktionieren offline und datensparsam; Quellen und Prüfstand werden angegeben. Für begrenztes Teilen werden Bereiche aus dem weitergegebenen Inhalt entfernt. Siehe [AgDR-0016](agdr/0016-kostenlos-offline-und-selektives-teilen.md).

Checkboxen markieren abgeschlossene Features. **P1** = zuerst, **P2** = danach, **P3** = spätere Erweiterung. Die Kennungen bleiben bei einer Umpriorisierung erhalten. Ein Feature wird erst abgehakt, wenn seine Abschlusskriterien und die gemeinsamen Kriterien erfüllt sind; ein begonnener Eintrag erhält den Zusatz „In Arbeit“.

**Aktueller Umsetzungsstand, mit Code und AgDRs bis 0018 abgeglichen:** F12–F14 sind umgesetzt. F03 und F07 sind teilweise umgesetzt und bleiben offen. F01, F02, F04–F06 und F08–F11 sind noch nicht umgesetzt. Verbleibende Geräte-/Browserprüfungen und Veröffentlichungsgrenzen stehen in den jeweiligen AgDRs; „umgesetzt“ beschreibt keine bestätigte Veröffentlichung oder Nutzerfreigabe.

## Geklärt und bereits vorhanden

- [x] **SSW-Berechnungsfrage geklärt.** Der Nutzer hat die Erklärung zur Zyklusanpassung bestätigt. Keine offene Aufgabe zur Änderung der Formel oder zur zusätzlichen Gegenüberstellung. Die persönliche Rechenerklärung ist bereits umgesetzt; siehe [AgDR-0011](agdr/0011-persoenliche-berechnungserklaerung.md).
- [x] **Bestehende Grundlage:** Journal mit Symptomen, Text, Tags und Messwerten, Archivierung/Wiederherstellung, einfache Verläufe, Filter und CSV; lokale Speicherung, Backups und Master-Sync. Diese Funktionen werden durch die folgenden Features erweitert.
- [x] **F12 · Kalender, SSW-Vorausblick und Journal** — am 17.11.2026 zusätzlich vom Nutzer gewünscht und umgesetzt. Monatsansicht mit SSW je Datum, Datum-/SSW-Suche, 42 Wochen mit Datumsbereichen, Vorsorgefenster und Meilensteine; bestehende Journaleinträge direkt am Tag lesen, bearbeiten oder ergänzen. [Umfang und Prüfnachweise: AgDR-0014](agdr/0014-kalender-und-journal.md).
- [x] **F13 · Offline-Suche zu Lebensmitteln und Aktivitäten** — 26 redaktionell belegte Einträge mit Suchbegriffen, Bereichs-/Ampelfilter, Zubereitungswahl, Bedingungen, Quellen und Prüfdatum. Kalender-Tagesbezug mit derselben Datierung; keine Freigabe für unbekannte Produkte oder allein durch einen SSW-Wechsel. [AgDR-0017](agdr/0017-lebensmittel-und-aktivitaeten.md). NDR „Tatsächlich schwanger“ ist ergänzend im Quellenbereich und mit dem geprüften Ernährungsartikel bei sechs passenden Karten verlinkt ([AgDR-0018](agdr/0018-ndr-als-ergaenzende-quelle.md)). Der Katalog ist eine erweiterbare Auswahl.
- [x] **F14 · Datensparsame Weitergabe** — Reise-Link standardmäßig nur mit ET, vollständige Grundlage bewusst wählbar. Journalauszug mit Zeitraum, Bereichsauswahl, einzelnen ausgelassenen Einträgen, Vorschau und offline lesbarer HTML-Datei. Keine Sync-Schlüssel im Bericht. Vollständiger Geräte-Sync bleibt ausdrücklich als solcher gekennzeichnet. [AgDR-0016](agdr/0016-kostenlos-offline-und-selektives-teilen.md).

## P1 – Mutterbezogenen Alltag verbessern

- [ ] **F01 · Eigener Bereich „Für dich“**
  Gleichwertig sichtbarer Bereich neben den Babyinformationen mit vertieften Wocheninfos zu körperlichen Veränderungen, Alltag, Schlaf, Gefühlen und Unterstützung.
  **Fertig, wenn:** Die Inhalte folgen der ausgewählten Woche, haben nachvollziehbare Quellen und sind mobil wie am Desktop erreichbar. Bestehende Körpertexte sind sinnvoll eingebunden.

- [ ] **F02 · Tages-Check-in**
  Kurze strukturierte Erfassung von Stimmung, Energie, Schlaf und Symptomstärke als Ergänzung zum freien Journal.
  **Fertig, wenn:** Kategorien beziehungsweise Skalen verständlich erklärt sind, einzelne Angaben ausgelassen werden können und mehrere Beobachtungen am selben Tag mit Uhrzeit unterscheidbar bleiben. Check-ins sind bearbeitbar, archivierbar, gesichert und synchronisiert.

- [ ] **F03 · Symptomkalender und Wochenrückblick — In Arbeit, Journal-Grundlage umgesetzt**
  Kalenderansicht für Beobachtungen sowie eine Zusammenfassung von Stimmung, Schlaf, Energie und Symptomen für eine gewählte Woche.
  **Fertig, wenn:** Von der Zusammenfassung zu den Originaleinträgen gewechselt werden kann, fehlende Angaben als fehlend erkennbar bleiben und archivierte Daten konsistent behandelt werden. Häufigkeiten beziehen sich auf erfasste Beobachtungen, nicht auf vermeintlich beschwerdefreie Tage.
  **Abhängigkeit:** F02 für strukturierte Check-in-Auswertungen; vorhandene Journalangaben weiter berücksichtigen.
  **Umgesetzt auf Basis vorhandener Journalangaben:** [AgDR-0015](agdr/0015-f03-symptomkalender-und-wochenrueckblick.md). F12 stellt den Monatskalender und die tageweise Journalzuordnung bereit.
  - [x] Einzelne Symptome oder alle Symptomnennungen im Monatskalender hervorheben.
  - [x] Gewählte Kalenderwoche (Montag–Sonntag) mit Beobachtungen und unterschiedlichen Tagen je Symptom zusammenfassen.
  - [x] Tage ohne Eintrag, Einträge ohne Symptomangabe und zukünftige Tage unterscheiden; archivierte Daten ausschließen und Wiederherstellung berücksichtigen.
  - [x] Aus dem Rückblick zu allen Originaleinträgen der Woche oder zu den Einträgen eines genauen Symptoms springen.
  - [x] Vorhandene Messwerte pro Bezeichnung und Einheit mit Anzahl, letztem/erstem Wert und Spanne zusammenfassen; eigene Schlafmessgrößen können bereits erscheinen.
  - [ ] Strukturierte Stimmung, Energie, Schlaf und Symptomstärke aus F02 im Rückblick ergänzen. Keine Ableitung aus freien Notizen oder vermeintlich beschwerdefreien Tagen.

- [ ] **F04 · Messwertverläufe mit Ausgangswert und Notizen**
  Vorhandene Gewichts- und Umfangsverläufe um eine selbst gewählte Ausgangsmessung, absolute Veränderungen und Notizmarkierungen ergänzen.
  **Fertig, wenn:** Ausgangswert und Vergleichszeitraum wählbar sind, Einheiten getrennt bleiben und sich markierte Beobachtungen öffnen lassen. Keine pauschalen Normalbereiche oder automatische gesundheitliche Bewertung.

- [ ] **F05 · Vorbereitung auf Praxis und Hebamme**
  Eigene Termine, Fragen, Untersuchungsergebnisse und besprochene nächste Schritte sammeln; tatsächliche Termine im bestehenden Kalender (F12) zusätzlich zu den Vorsorgefenstern anzeigen.
  **Fertig, wenn:** Fragen einem Termin zugeordnet und als besprochen markiert werden können. Ergebnisse und nächste Schritte sind mit Datum erfassbar und später wieder auffindbar; ausstehende Fragen bleiben sichtbar. Keine automatischen Diagnosen oder Behandlungsvorschläge.

## P2 – Begleitung und Berichte ausbauen

- [ ] **F06 · Journal im Wochenbett weiterführen**
  Einen ausdrücklichen Übergang nach der Geburt anbieten und persönliche Einträge ohne laufende Schwangerschaft weiterbearbeiten können.
  **Fertig, wenn:** Der Wechsel bewusst erfolgt, Schwangerschaftseinträge erhalten bleiben und neue Einträge nach Tagen beziehungsweise Wochen seit der Geburt eingeordnet werden können. Eine abgelaufene Schwangerschaftsberechnung blockiert die Journalbearbeitung nicht.
  **Vor Umsetzung:** Eigenen AgDR für Phasenwechsel, Datierung, Datenmigration und Sync-Kompatibilität erstellen.

- [ ] **F07 · Praxisbericht als PDF — In Arbeit, Journalbericht umgesetzt**
  Einen übersichtlichen Bericht mit ausgewähltem Zeitraum, Fragen, Symptomen und Messwerten erzeugen.
  **Fertig, wenn:** Zeitraum und enthaltene Bereiche auswählbar sind, eine Vorschau verfügbar ist und die lokal erzeugte PDF Datumsangaben und Einheiten korrekt darstellt. Eine ausgewählte Teilmenge exportiert ausschließlich diese Angaben.
  **Abhängigkeiten:** Bestehendes Journal; F05 für Terminfragen und Ergebnisse, F02 für strukturierte Check-ins im Bericht.
  - [x] Zeitraum, Journalbereiche und einzelne Einträge wählen; Vorschau und selbstständige HTML-Datei offline erzeugen (F14).
  - [ ] Direkte PDF-Erzeugung beziehungsweise geprüfter PDF-Ausgabeweg mit den erweiterten Daten aus F02/F05. Bisher: heruntergeladene HTML-Datei öffnen und die PDF-Funktion des Browser-Druckdialogs verwenden, sofern verfügbar; kein eingebauter PDF-Generator.

- [ ] **F09 · Persönlicher Geburts- und Wochenbettplan**
  Wünsche, Vorbereitungen, Kontakte und benötigte Unterstützung in bearbeitbaren Vorlagen festhalten.
  **Fertig, wenn:** Abschnitte frei ergänzt oder ausgelassen werden können, der Bearbeitungsstand erhalten bleibt und eine druckbare Fassung erzeugt werden kann. Wünsche sind als persönliche Planung erkennbar.

## P3 – Zusätzlichen Komfort ergänzen

- [ ] **F08 · Anpassbare Übersichten und Journalvorlagen**
  Eigene Kombinationen von Messreihen und Rückblicken sowie wiederverwendbare Vorlagen für häufige Einträge anbieten.
  **Fertig, wenn:** Ansichten und Vorlagen benannt, gespeichert, geändert und entfernt werden können. Eine Vorlage erzeugt erst nach ausdrücklichem Speichern einen neuen Journaleintrag.
  **Abhängigkeiten:** F02–F04 als Grundlage für die erweiterten Ansichten.

- [ ] **F10 · Fotojournal mit Vergleich und Zeitraffer**
  Optionale datierte Fotos mit Vergleichsansicht und Zeitraffer ergänzen.
  **Fertig, wenn:** Import, Datumszuordnung, Vergleich und lokaler Export funktionieren und Fotoqualität sowie Speicherbedarf verständlich einstellbar sind. Foto-Sicherung und Übertragung sind ausdrücklich geregelt; bestehende Textdaten bleiben bei Fotofehlern nutzbar.
  **Vor Umsetzung:** Eigenen AgDR für Bildspeicher, Größenlimits, Metadaten, Sicherung, Wiederherstellung und verschlüsselten Geräte-Sync erstellen. Bilder passen nicht sinnvoll in den bisherigen JSON-Datenstand mit rund 512 KiB.

- [ ] **F11 · Vertiefende Lernmodule**
  Zusätzliche strukturierte Inhalte zur Geburtsvorbereitung und zum Wochenbett mit persönlichem Lesefortschritt anbieten.
  **Fertig, wenn:** Umfang und Zielgruppe definiert, Inhalte fachlich geprüft und mit Quellen sowie redaktionellem Stand versehen sind. Lesefortschritt kann gespeichert und zurückgesetzt werden.
  **Abhängigkeit:** F01 für Darstellung und redaktionelle Grundlage.

## Gemeinsame Abschlusskriterien

- Neue persönliche Angaben bleiben lokal nutzbar und werden in Sicherung, Wiederherstellung und vorhandenen Master-Sync einbezogen. Nur der aktive Master bearbeitet synchronisierte Daten.
- Bestehende Daten werden bei Formatänderungen erhalten; Migrationen und Fehlerfälle werden passend geprüft. In Tests und Dokumentation stehen ausschließlich synthetische Beispiele.
- GitHub-Pages-Kompatibilität, mobile Bedienung und die vorhandene Offline-Nutzung bleiben erhalten. Funktionen mit zusätzlichem Infrastrukturbedarf bekommen vor der Umsetzung eine dokumentierte Architekturentscheidung.
- Medizinische Inhalte haben Fachquellen und einen redaktionellen Stand; der vom Nutzer gewünschte NDR-Bereich „Tatsächlich schwanger“ wird als ergänzende redaktionelle Quelle mit konkret geprüften Beiträgen berücksichtigt ([AgDR-0018](agdr/0018-ndr-als-ergaenzende-quelle.md)). Beobachtungen werden nicht als Diagnosen oder nachgewiesene Ursachen interpretiert.
- Alle Funktionen sind ohne Bezahlstufe zugänglich. Neue Ansichten, Suche und Berichte funktionieren offline; die App speichert keine Suchhistorie und lädt keine externen Inhalte automatisch nach. Externe Originalquellen und optionaler Geräte-Sync brauchen eine Verbindung.
- Bei Teilweitergabe werden ausgelassene Inhalte einschließlich Metadaten tatsächlich entfernt. Filter allein beschränken keine bestehenden Sync-Leserechte. Ein begrenzter automatischer Geräte-Sync würde getrennte Datenräume und Schlüssel sowie eine eigene Kompatibilitätsentscheidung benötigen und ist weiterhin offen.
- Wesentliche Entscheidungen erhalten einen AgDR; README und diese Arbeitsliste werden entsprechend aktualisiert. Funktionsänderungen werden angemessen geprüft und gebaut, verbleibende Prüflücken dokumentiert.

## Festgelegte Produktgrundlage

Die frühere Kennzeichnung als „Premium-Kandidat“ wurde durch die ausdrückliche Nutzerentscheidung abgelöst: **Alle heutigen und zukünftigen Funktionen sind kostenlos für alle.** Die Prioritäten bestimmen nur die Umsetzungsreihenfolge.

**Empfohlene nächste Schritte:** F02 umsetzen und damit die offenen Check-in-Anteile von F03 ergänzen. F01, F04 und F05 können unabhängig davon weiterentwickelt werden; F02 und F05 liefern später weitere Daten für F07. Begrenzter automatischer Geräte-Sync bleibt ebenfalls offen; F14 bietet bereits begrenzte Weitergabe als Datei, aber keine eingeschränkten Sync-Leserechte.
