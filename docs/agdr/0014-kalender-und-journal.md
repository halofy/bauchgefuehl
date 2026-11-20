# AgDR-0014: Kalender, SSW-Vorausblick und Journal in einem Bereich

- **Status:** Umgesetzt; automatisiert und lokal in Safari geprüft
- **Datum:** 2026-11-17
- **Fortgeschrieben durch:** [AgDR-0025](0025-termine-fragensammlung-und-klarerer-kalender.md) – eigene Termine/Notizen, kompakteres Raster und optionale Bereichshervorhebung.
- **Entscheidende Instanz:** Nutzeranforderung; konkrete Ansicht, Datumsprojektion und Integrationsumfang durch den Agenten
- **Betroffene Dateien:** [Kalendermodell](../../src/calendar.js), [Kalenderoberfläche](../../src/calendar-ui.js), [Journal](../../src/journal-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Stylesheet](../../styles.css), [Offline-Dateien](../../sw.js), [Tests](../../tests/calendar.test.js)
- **Erweitert:** [AgDR-0009](0009-persoenliches-journal.md), [AgDR-0010](0010-mobile-app-und-pwa.md), [AgDR-0013](0013-app-layout-erkennung.md)

> Die Anordnung des Kalenders und der Zeitraum des Rückblicks wurden in [AgDR-0044](0044-kalender-mit-gemeinsamer-wochenansicht.md) weiterentwickelt.

## Kontext und Herkunft

Der Nutzer wünscht einen Kalender beziehungsweise Vorausblick, der zeigt, welches Datum welcher SSW entspricht. Wichtige Termine und Meilensteine sollen markiert werden; das Journal kann damit zusammengeführt werden. Die zuvor geklärte SSW-Berechnung bleibt bestehen.

**Agentenfestlegung:** Kalender und Journal sind zwei Ansichten desselben Navigationsbereichs. Die bisherige Schaltfläche „Journal“ heißt jetzt „Kalender“; die fünf Hauptbereiche bleiben erhalten. „Kalender & Vorausblick“ ist die Startansicht, „Journalliste & Verlauf“ enthält die bisherigen Filter, Einträge, Messreihen und CSV-Funktionen.

## Entscheidung

### Datumsprojektion ohne neue Datierungsmethode

`pregnancyTimeline()` ruft die vorhandene `calculatePregnancy()` mit dem aktuellen lokalen Tag auf. Der rechnerische Anker 0+0 ergibt sich aus `heute − gestationalDays`. Ein beliebiges Datum erhält seine SSW über die Kalendertagsdifferenz zu diesem Anker. Dadurch werden Periode/Zyklus und ET-Methode ohne eine zweite Formel oder eine doppelte Zykluskorrektur unterstützt.

Das Profil wird gegen heute validiert, nicht gegen das nachgeschlagene Datum. So funktionieren insbesondere frühe Daten vor dem beobachteten Periodenbeginn bei kurzen Zyklen und weiter entfernte Vorausblicke. Es wird kein tatsächlicher Perioden- oder Eisprungtag aus dem Anker behauptet.

Datum und SSW lassen sich in beide Richtungen nachschlagen. SSW-Eingaben verwenden ausdrücklich volle Wochen + Tage (`24+0`), keine unbeschriftete laufende Woche. Unterstützt ist 0+0 bis 42+6. Die Wochenübersicht zeigt alle 42 laufenden SSW mit Start- und Enddatum, zum Beispiel 1. SSW = 0+0–0+6 und 41. SSW beginnt bei 40+0. Wocheninhalte bleiben wie bisher auf 0+0 bis 41+6 begrenzt; spätere Ergebnisse sind als außerhalb der Wocheninfos gekennzeichnet.

### Monatsansicht und Vorausblick

- Monatsraster mit Montag als Wochenbeginn, sechs vollständigen Wochen und SSW pro Datum. Benachbarte Monatstage bleiben auswählbar. Kalendernavigation und direkte Datumswahl reichen von 1900 bis 2200.
- Voriger/nächster Monat, Monatsauswahl, „Heute“ und „Zum ET“. Die beiden Suchformulare sind aufklappbar, damit die Monatsansicht auf dem Smartphone schnell sichtbar bleibt.
- Heute und der ausgewählte Tag sind unterscheidbar. Jeder Tag nennt für assistive Technik Datum, SSW, laufende Woche, vorhandene Ereignisse und Anzahl aktiver Journaleinträge. Pfeiltasten, Home/End und PageUp/PageDown ermöglichen Tages-/Wochennavigation beziehungsweise Monatswechsel.
- Die Detailansicht zeigt den ausgewählten Tag, seine SSW, passende Vorsorgefenster, Meilensteine und das Journal. Ein Link öffnet die Entwicklungsinfos der zugehörigen Woche.
- Eine Liste zeigt die nächsten sechs relevanten Fenster/Meilensteine ab dem ausgewählten Tag, einschließlich bereits laufender Fenster. Eine zusätzliche Übersicht umfasst alle 42 SSW mit ihren Datumsbereichen.

### Vorsorgefenster und Meilensteine

Die bereits vorhandenen, verlinkten Vorsorgethemen aus `content.js` werden durch Addition ihrer Start-/Endtage auf konkrete Datumsbereiche abgebildet. Die Grenzen sind einschließlich beider Tage. Im Kalender werden diese Themen nur innerhalb des vorhandenen 42-Wochen-Inhaltsbereichs dargestellt; offene Themen wie Betreuung rund um den ET heißen weiterhin „Ab … · individuell“, ohne ein klinisches Enddatum zu behaupten.

Zusätzliche Einzelmarkierungen sind 14+0 (2. Trimester), 20+0 (rechnerische Halbzeit), 28+0 (3. Trimester) und 40+0 (ET). Die Trimestergrenzen werden als bisherige Darstellungskonvention dieser App bezeichnet. Vorsorgefenster sind ausdrücklich **keine vereinbarten Termine** und legen keine Untersuchung verbindlich fest. Individuelle Betreuung und Buchung bleiben bei Praxis beziehungsweise Hebamme. Eigene zukünftige Termine sind weiterhin ein offener Bestandteil von F05 und wurden nicht als automatisch vereinbart dargestellt.

### Gemeinsames Journal

Der Kalender liest dieselben bestehenden Journaleinträge nach ihrem gespeicherten Kalenderdatum. Mehrere Einträge an einem Tag werden gezählt und nach Uhrzeit angezeigt. Archivierte Einträge erscheinen nicht im Kalender, bleiben in der Journalliste erreichbar und wiederherstellbar.

Vom ausgewählten Tag bis einschließlich heute lässt sich ein neuer Eintrag mit vorausgefülltem Datum öffnen. Vorhandene Einträge können auf dem schreibberechtigten Gerät bearbeitet werden. Ein Sprung zur Journalliste setzt die Datumsfilter auf diesen Tag und hebt andere Filter auf. Zukünftige Beobachtungen werden weiterhin nicht erfasst; die bisherige Journalvalidierung bleibt bestehen.

Speichern, Archivieren, Wiederherstellen, Profiländerungen und empfangener Sync aktualisieren die Kalenderansicht. Ein geänderter ET oder Zyklus verschiebt die projizierten SSW/Fenster, aber kein Journaldatum. Kalenderauswahl und Ansichtswechsel sind vorübergehender Oberflächenzustand. Es gibt keine zweite Journalablage und kein neues gespeichertes Datenformat. Die bestehenden Masterrechte, Verschlüsselung und Backups gelten unverändert.

## Erwogene Alternativen

- **Sechster Hauptbereich nur für den Kalender:** Würde die mobile Navigation verdichten und Journal und Zeitachse auseinanderziehen.
- **Eine zusätzliche SSW-Berechnung für zukünftige Daten:** Könnte durch Profilvalidierung oder doppelte Anpassung andere Ergebnisse erzeugen. Stattdessen wird die bestehende Berechnung projiziert.
- **Vorsorge auf einzelne feste Untersuchungstage legen:** Würde aus empfohlenen Fenstern scheinbar gebuchte beziehungsweise verbindliche Termine machen.
- **Journaleinträge für den Kalender kopieren oder in Zukunft erlauben:** Brächte unnötige Datenmigration, Duplikate oder eine Vermischung geplanter Ereignisse mit Beobachtungen. Eine eigene Terminverwaltung folgt separat in F05.
- **Externe Kalender-/Cloud-Dienste einbetten:** Für die gewünschte lokale Ansicht unnötig. Die Kalenderdarstellung bleibt statisch, lokal und nach dem Laden offline verfügbar.

## Folgen und Grenzen

Keine neue Abhängigkeit, keine Datenmigration und keine Änderung der geklärten Grundberechnung. Die neuen Module sind in der Offline-Dateiliste und im automatisch versionierten Build enthalten. Die bereitgestellte PWA muss über das Info-Symbol bewusst aktualisiert werden.

Die Monatsansicht zeigt dieselbe Unsicherheit wie die gewählte Datierungsgrundlage; Demo und geteilte Angaben werden gekennzeichnet. Individuelle Termine, Erinnerungen, Kalenderabonnements/ICS und Kalender-Export sind nicht Bestandteil dieser Änderung. Es handelt sich nicht um den in F03 geplanten Symptomkalender mit strukturierten Check-ins oder Auswertungen. Diese Aufgaben bleiben offen.

**Fortschreibung am 17.11.2026:** Der Nutzer hat anschließend die Einbindung weiterer Teile aus F03 beauftragt. [AgDR-0015](0015-f03-symptomkalender-und-wochenrueckblick.md) erweitert diesen Kalender um Symptommarkierungen und einen Wochenrückblick aus bestehenden Journalangaben. Die vorstehende Abgrenzung beschreibt den ursprünglichen Umfang dieses Records; strukturierte Check-ins aus F02 bleiben auch nach der Erweiterung offen.

## Verifikation

Am 17.11.2026 ausschließlich mit synthetischen Daten durchgeführt:

- **94 automatisierte Tests bestanden**, darunter zwölf neue Kalender-Tests. Abgedeckt sind Zuordnung für beide Methoden und fünf Zykluslängen, Hin-/Rückrichtung für alle Tage bis 42+6, ET-/Wochen-/Inhaltsgrenzen, Schaltjahr, Monats-/Jahreswechsel, ungültige Eingaben, inklusive Vorsorgefenster, Einzelmeilensteine, laufende Fenster im Vorausblick, 42 lückenlose Wochenbereiche sowie mehrere Journalbeobachtungen und archivierte Einträge.
- Skriptziele aus `package.json` direkt mit der vorhandenen Node-Laufzeit ausgeführt, da `npm` nicht im PATH verfügbar ist: `node --test tests/*.test.js`, `node scripts/build.js`. Build erfolgreich, neue Kalenderdateien auch in der Offline-Auslieferung vorhanden.
- Safari mit synthetischem gespeicherten Profil: Kalender geöffnet, SSW 24+0 nachgeschlagen und den erwarteten Tag samt Diabetes-Vorsorgefenster erhalten; zu „Heute“ gewechselt; Journaldialog aus dem Kalendertag geöffnet und einen Eintrag mit Text, Tag, Symptom und Gewicht gespeichert. Anschließend erschienen Tageszuordnung, Inhalt und Eintragsmarkierung im Kalender. Desktopansicht visuell geprüft.
- Isolierte Safari-Layoutprüfung bei tatsächlichen Inhaltsbreiten von **320, 390, 820 und 1440 CSS-Pixeln**: Kalender sichtbar, 42 Tageszellen vorhanden und kein horizontaler Überlauf in Seite, Kalender, Suchformularen oder Tagesdetails. Alle vier Fälle bestanden. In der isolierten Kopie war lediglich die anfängliche Navigationsauswahl auf den Kalender gesetzt; die Produktionsnavigation startet weiterhin mit dem Überblick.
- Die zwei Suchformulare wurden abschließend in einen aufklappbaren Bereich gestellt. Ihre Suchlogik bleibt dieselbe; die neue Aufklapp-/Zuklappbedienung wurde nach dieser letzten Anpassung nicht erneut manuell geprüft.
- Dokumentationslinks, HTML-Struktur und `git diff --check` geprüft.

Offen bleiben physische Geräteprüfung, vollständige Browser-/Screenreader-Matrix, manuelle Tastaturprüfung jedes Kalenderrandfalls und ein erneuter vollständiger Offline-Update-/Geräte-Sync-Durchlauf speziell mit dieser Ansicht. Der Kalender verwendet die unveränderten gespeicherten Daten und vorhandenen Rechte; es wird kein neuer getesteter Servermechanismus behauptet.

## Quellen

- [Bestehende Berechnung](../../src/pregnancy.js), [Vorsorgethemen](../../src/content.js), [Kalendertests](../../tests/calendar.test.js).
- [IQWiG: Ultraschalluntersuchungen in der Schwangerschaft](https://www.gesundheitsinformation.de/ultraschalluntersuchungen-in-der-schwangerschaft.html), am 17.11.2026 gelesen; laufende 9.–12., 19.–22. und 29.–32. SSW entsprechen den bestehenden Fenstern 8+0–11+6, 18+0–21+6 und 28+0–31+6.
- [G-BA: Mutterschafts-Richtlinie](https://www.g-ba.de/richtlinien/19/), am 17.11.2026 geprüft; als bestehende Quelle weiter verlinkt. Keine neuen Vorsorgeleistungen oder klinischen Entscheidungsgrenzen in dieser Änderung eingeführt.

## Fortschreibung vom 20.11.2026

[AgDR-0042](0042-termin-pdf-und-kompakter-vorsorgekalender.md) ergänzt die Untersuchungsfenster und den kompakten Tagesdialog, erklärt den zyklusangepassten Beginn und begrenzt die sichtbare SSW ab 42+0. Die ursprünglichen Prüfnachweise dieses Records beziehen sich auf den damaligen Stand.
