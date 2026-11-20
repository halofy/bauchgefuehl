# Feature-Liste

Stand: **20.11.2026**. Arbeitsübersicht für die nächsten Erweiterungen von bauchgefühl. Die Liste wurde vom Nutzer beauftragt; Prioritäten und Abschlusskriterien sind Vorschläge des Agenten. Begründungen und Herkunft: [AgDR-0012](agdr/0012-roadmap-und-ssw-pruefung.md).

**Verbindliche Nutzeranforderung:** Alle Funktionen sind für alle kostenlos. Es gibt kein Bezahl-Premium. Neue Funktionen funktionieren offline und datensparsam; Quellen und Prüfstand werden angegeben. Für begrenztes Teilen werden Bereiche aus dem weitergegebenen Inhalt entfernt. Siehe [AgDR-0016](agdr/0016-kostenlos-offline-und-selektives-teilen.md).

Checkboxen markieren abgeschlossene Features. **P1** = zuerst, **P2** = danach, **P3** = spätere Erweiterung. Die Kennungen bleiben bei einer Umpriorisierung erhalten. Ein Feature wird erst abgehakt, wenn seine Abschlusskriterien und die gemeinsamen Kriterien erfüllt sind; ein begonnener Eintrag erhält den Zusatz „In Arbeit“.

**Aktueller Umsetzungsstand, mit Code und AgDRs bis 0050 abgeglichen:** F01–F06, F09, F12–F16 und F18–F23 sind umgesetzt. F07 und F17 sind teilweise umgesetzt und bleiben offen. F08, F10 und F11 sind noch nicht umgesetzt. Verbleibende Geräte-/Browserprüfungen und Veröffentlichungsgrenzen stehen in den jeweiligen AgDRs. „Umgesetzt“ beschreibt keine bestätigte Veröffentlichung oder Nutzerfreigabe.

## Geklärt und bereits vorhanden

- [x] **SSW-Berechnungsfrage geklärt.** Der Nutzer hat die Erklärung zur Zyklusanpassung bestätigt. Keine offene Aufgabe zur Änderung der Formel oder zur zusätzlichen Gegenüberstellung. Die persönliche Rechenerklärung ist bereits umgesetzt; siehe [AgDR-0011](agdr/0011-persoenliche-berechnungserklaerung.md).
- [x] **Bestehende Grundlage:** Journal mit Symptomen, Text, Tags und Messwerten, Archivierung/Wiederherstellung, einfache Verläufe, Filter und CSV; lokale Speicherung, Backups und bewusster Geräteabgleich mit Master. Diese Funktionen werden durch die folgenden Features erweitert.
- [x] **F12 · Kalender, SSW-Vorausblick und Journal** — am 17.11.2026 zusätzlich vom Nutzer gewünscht und umgesetzt. Monatsansicht mit SSW je Datum, Datum-/SSW-Suche, 42 Wochen mit Datumsbereichen, Vorsorgefenster und Meilensteine; bestehende Journaleinträge direkt am Tag lesen, bearbeiten oder ergänzen. [Umfang und Prüfnachweise: AgDR-0014](agdr/0014-kalender-und-journal.md).
- [x] **F13 · Offline-Suche zu Lebensmitteln und Aktivitäten** — 26 redaktionell belegte Einträge mit Suchbegriffen, Bereichs-/Ampelfilter, Zubereitungswahl, Bedingungen, Quellen und Prüfdatum. Kalender-Tagesbezug mit derselben Datierung; keine Freigabe für unbekannte Produkte oder allein durch einen SSW-Wechsel. [AgDR-0017](agdr/0017-lebensmittel-und-aktivitaeten.md). NDR „Tatsächlich schwanger“ ist ergänzend im Quellenbereich und mit dem geprüften Ernährungsartikel bei sechs passenden Karten verlinkt ([AgDR-0018](agdr/0018-ndr-als-ergaenzende-quelle.md)). Der Katalog ist eine erweiterbare Auswahl.
- [x] **F14 · Datensparsame Weitergabe** — Reise-Link standardmäßig nur mit ET, vollständige Grundlage bewusst wählbar. Journalauszug mit Zeitraum, Bereichsauswahl, einzelnen ausgelassenen Einträgen, Vorschau und offline lesbarer HTML-Datei. Keine Sync-Schlüssel im Bericht. Vollständige Geräte-Stände bleiben ausdrücklich als solche gekennzeichnet; sie werden inzwischen ohne Server bewusst weitergegeben (F17). [AgDR-0016](agdr/0016-kostenlos-offline-und-selektives-teilen.md).

## Neu beauftragt – Kontakte, Geburt, Geräte und Übersicht

- [x] **F15 · Drei Anrufkontakte**
  Bis zu drei Namen und Telefonnummern lokal speichern und über `tel:` bewusst in der Telefon-App öffnen. Kontaktverwaltung auch ohne eingetragene Schwangerschaft; Kontakte in vollständigen Backups, in Geräte-Ständen nur nach ausdrücklicher Auswahl. Keine automatischen Anrufe. [AgDR-0019](agdr/0019-kontakte-und-wehentracker.md).

- [x] **F16 · Wehentracker mit Kalenderprotokoll**
  Beginn und Ende messen, Dauer und Abstand von Beginn zu Beginn speichern. Offene Messung über Neuladen erhalten; Endzeit korrigierbar, versehentliche Messungen ohne Verlust von der Musterübersicht ausschließbar. Jeder Abschluss landet im vorhandenen Journal und am Beginndatum im Kalender.
  **Schnellzugriff:** Schwebende Schaltfläche ab **22+0** bei eigenen Angaben, bei offener Messung immer; früher über „Hilfe & Kontakte“ erreichbar. Diese Anzeigegrenze ist eine Agentenentscheidung für die Bedienung, keine individuelle Überlebensprognose.
  **Zeitmuster:** Quellenbasierte Orientierung für erstes beziehungsweise weiteres Kind mit Kontaktlinks. Keine Bestätigung von Geburtswehen oder Entwarnung; vor 37+0 und bei Warnzeichen nicht auf ein Muster warten. [AgDR-0019](agdr/0019-kontakte-und-wehentracker.md).

- [ ] **F17 · Zwei Smartphones ohne Sync-Server — In Arbeit, manueller Standabgleich umgesetzt**
  **Nutzeranforderung:** Kein eigener Dev-/Sync-Server und keine fremden Verbindungsdienste; bevorzugt eine performante direkte Lösung, notfalls QR/URL. Der alte Server-Sync wird nicht mehr angeboten oder automatisch gestartet.
  - [x] Verschlüsselten, vom Master signierten Stand lokal erzeugen; Passwort getrennt vom Inhalt.
  - [x] Kleine Stände per QR/Link, größere Journale als vollständige verschlüsselte Datei ohne Kürzung übertragen.
  - [x] iOS ↔ Android als Fokus: kompakte vollständige URL ohne doppelte Base64-Kodierung, QR bis 2.200 Zeichen und lange Links bis 65.536 Zeichen getrennt behandeln. Native Link-/Datei-Teilen-Auswahl bei Browserunterstützung; Kopieren/Download bleiben verfügbar. Grenzen und Primärquellen: [AgDR-0022](agdr/0022-smartphone-nahuebertragung-und-kompakte-links.md).
  - [x] Vor Übernahme entschlüsselte Vorschau; Masterbindung, Versionsprüfung, Schutz vor fehlenden Einträgen und dem Zurücksetzen neuerer Journalfassungen und abgesicherter Import.
  - [x] Kontakte optional; Journal-Teilweitergabe weiterhin als ausgewählter Bericht. Alte Schlüssel, ausstehende Serverdaten und Rohstände in vollständigen Backups erhalten; alte Backups weiterhin auswählbar.
  - [ ] Direkten WebRTC-DataChannel im selben WLAN/geeigneten Hotspot mit QR-Angebot und QR-Antwort ohne fremde Signalisierungs-/STUN-/TURN-Dienste auf iPhone und Android evaluieren. UWB/Web Bluetooth/Web NFC tragen laut geprüften Primärquellen keinen gemeinsamen Webapp-Kanal. Aktuell gibt es **keine automatische Aktualisierung**; jeder neue Stand wird bewusst übertragen. Keine Zusage einer universell zuverlässigen Browserverbindung. [AgDR-0020](agdr/0020-serverloser-geraeteabgleich.md), [AgDR-0022](agdr/0022-smartphone-nahuebertragung-und-kompakte-links.md).

- [x] **F18 · Klare Hauptbereiche, Details bei Bedarf**
  Auf Smartphone und Desktop jeweils nur einen der fünf Hauptbereiche zeigen; Bereichspositionen erhalten. Kalender-Wochenrückblick und Vorausblick aufklappbar, Wissensstart mit sechs Themen und „Alle Themen anzeigen“, Kontakte und Wehentracker als gezielte Schnellzugriffe. [AgDR-0021](agdr/0021-uebersichtliche-hauptbereiche.md). Weitere Verfeinerungen nach konkreter Rückmeldung bleiben möglich.

## P1 – Mutterbezogenen Alltag verbessern

- [x] **F01 · Eigener Bereich „Für dich“**
  Gleichwertig sichtbarer Bereich neben den Babyinformationen mit vertieften Wocheninfos zu körperlichen Veränderungen, Alltag, Schlaf, Gefühlen und Unterstützung.
  **Fertig, wenn:** Die Inhalte folgen der ausgewählten Woche, haben nachvollziehbare Quellen und sind mobil wie am Desktop erreichbar. Bestehende Körpertexte sind sinnvoll eingebunden.
  **Umgesetzt:** Gleichwertige Reiter „Dein Baby“/„Für dich“ in der Wochenreise, direkte aktuelle Mutterinfo aus dem Überblick, Themen zu Alltag, Schlaf, Gefühlen und Unterstützung passend zur gewählten Phase. Vier aufklappbare Vertiefungen mit einzelnen Quellen und Prüfstand; vorhandene Körpertexte und Check-in-Zugriff integriert. [AgDR-0024](agdr/0024-fuer-dich-und-mobile-layoutkorrekturen.md).

- [x] **F02 · Tages-Check-in**
  Kurze strukturierte Erfassung von Stimmung, Energie, Schlaf und Symptomstärke als Ergänzung zum freien Journal.
  **Fertig, wenn:** Kategorien beziehungsweise Skalen verständlich erklärt sind, einzelne Angaben ausgelassen werden können und mehrere Beobachtungen am selben Tag mit Uhrzeit unterscheidbar bleiben. Check-ins sind bearbeitbar, archivierbar und in Backups sowie verschlüsselter Geräteweitergabe enthalten.
  **Umgesetzt:** Stimmung und Energie jeweils 1–5, Schlaf in Stunden der letzten 24 Stunden, stärkste Beschwerden jetzt 0–10; alle Felder ohne Vorgabe und optional. Mehrere Beobachtungen mit eigener Uhrzeit, gemeinsamer Journalablage, Kalenderanzeige, Originalfilter und getrennter Auswahl beim Teilen. Persönliche Merkhilfen ohne medizinische Auswertung. [AgDR-0023](agdr/0023-tages-check-in-und-strukturierter-rueckblick.md).

- [x] **F03 · Symptomkalender und Wochenrückblick**
  Kalenderansicht für Beobachtungen sowie eine Zusammenfassung von Stimmung, Schlaf, Energie und Symptomen für eine gewählte Woche.
  **Fertig, wenn:** Von der Zusammenfassung zu den Originaleinträgen gewechselt werden kann, fehlende Angaben als fehlend erkennbar bleiben und archivierte Daten konsistent behandelt werden. Häufigkeiten beziehen sich auf erfasste Beobachtungen, nicht auf vermeintlich beschwerdefreie Tage.
  **Abhängigkeit:** F02 für strukturierte Check-in-Auswertungen; vorhandene Journalangaben weiter berücksichtigen.
  **Umgesetzt auf Basis vorhandener Journalangaben:** [AgDR-0015](agdr/0015-f03-symptomkalender-und-wochenrueckblick.md). F12 stellt den Monatskalender und die tageweise Journalzuordnung bereit.
  - [x] Einzelne Symptome oder alle Symptomnennungen im Monatskalender hervorheben.
  - [x] Gewählte Kalenderwoche (Montag–Sonntag) mit Beobachtungen und unterschiedlichen Tagen je Symptom zusammenfassen.
  - [x] Tage ohne Eintrag, Einträge ohne Symptomangabe und zukünftige Tage unterscheiden; archivierte Daten ausschließen und Wiederherstellung berücksichtigen.
  - [x] Aus dem Rückblick zu allen Originaleinträgen der Woche oder zu den Einträgen eines genauen Symptoms springen.
  - [x] Vorhandene Messwerte pro Bezeichnung und Einheit mit Anzahl, letztem/erstem Wert und Spanne zusammenfassen; eigene Schlafmessgrößen können bereits erscheinen.
  - [x] Strukturierte Stimmung, Energie, Schlaf und Beschwerdestärke aus F02 mit erster/letzter Angabe, Anzahl, Tagen und Erfassungslücken ergänzen. Check-ins getrennt von normalen Journalbeobachtungen zählen, Originaleinträge öffnen, keine Schlafsummen oder Ableitung aus Notizen. [AgDR-0023](agdr/0023-tages-check-in-und-strukturierter-rueckblick.md).

- [x] **F04 · Messwertverläufe mit Ausgangswert und Notizen**
  Vorhandene Gewichts- und Umfangsverläufe um eine selbst gewählte Ausgangsmessung, absolute Veränderungen und Notizmarkierungen ergänzen.
  **Fertig, wenn:** Ausgangswert und Vergleichszeitraum wählbar sind, Einheiten getrennt bleiben und sich markierte Beobachtungen öffnen lassen. Keine pauschalen Normalbereiche oder automatische gesundheitliche Bewertung.
  **Umgesetzt:** Zeitraum (alle gefilterten / 28 / 90 Tage), frei gewählte Ausgangsmessung, absolute Differenz, Einheiten getrennt, freiwillige Check-in-Skalen, Notizmarkierungen und Originaleinträge. [AgDR-0026](agdr/0026-alltagsbegleitung-terminmappe-und-wochenbett.md).

- [x] **F05 · Vorbereitung auf Praxis und Hebamme**
  Eigene Termine, Fragen, Untersuchungsergebnisse und besprochene nächste Schritte sammeln; tatsächliche Termine im bestehenden Kalender (F12) zusätzlich zu den Vorsorgefenstern anzeigen.
  **Fertig, wenn:** Fragen einem Termin zugeordnet und als besprochen markiert werden können. Ergebnisse und nächste Schritte sind mit Datum erfassbar und später wieder auffindbar; ausstehende Fragen bleiben sichtbar. Keine automatischen Diagnosen oder Behandlungsvorschläge.
  **Umgesetzt und vom Nutzer vorgezogen:** Eigene Termine, einmalig gespeicherte zugeordnete oder zunächst freie Notizen und Fragen/Antworten, Ergebnisse, nächste Schritte und ausdrücklicher Gesprächsstatus; identisch am Termin und in der durchsuchbaren Sammlung. Archiv/Wiederherstellung, Kalenderintegration, vollständiges Backup, verschlüsselte v2-Geräteweitergabe und zwei getrennte Bereiche für Teilberichte. [AgDR-0025](agdr/0025-termine-fragensammlung-und-klarerer-kalender.md).

## P2 – Begleitung und Berichte ausbauen

- [x] **F06 · Journal im Wochenbett weiterführen**
  Einen ausdrücklichen Übergang nach der Geburt anbieten und persönliche Einträge ohne laufende Schwangerschaft weiterbearbeiten können.
  **Fertig, wenn:** Der Wechsel bewusst erfolgt, Schwangerschaftseinträge erhalten bleiben und neue Einträge nach Tagen beziehungsweise Wochen seit der Geburt eingeordnet werden können. Eine abgelaufene Schwangerschaftsberechnung blockiert die Journalbearbeitung nicht.
  **Umgesetzt:** Bewusstes Geburtsdatum, umkehrbarer Phasenwechsel, Tage seit Geburt im Kalender und Journal, Erhalt alter Datierungsgrundlagen und Journalbearbeitung bei historischer Schwangerschaft. Im neuen v3-Geräte-Stand und der Vollsicherung enthalten. [AgDR-0026](agdr/0026-alltagsbegleitung-terminmappe-und-wochenbett.md).

- [ ] **F07 · Praxisbericht als PDF — In Arbeit, Journalbericht umgesetzt**
  Einen übersichtlichen Bericht mit ausgewähltem Zeitraum, Fragen, Symptomen und Messwerten erzeugen.
  **Fertig, wenn:** Zeitraum und enthaltene Bereiche auswählbar sind, eine Vorschau verfügbar ist und die lokal erzeugte PDF Datumsangaben und Einheiten korrekt darstellt. Eine ausgewählte Teilmenge exportiert ausschließlich diese Angaben.
  **Abhängigkeiten:** Bestehendes Journal; F05 für Terminfragen und Ergebnisse, F02 für strukturierte Check-ins im Bericht.
  - [x] Zeitraum, Journalbereiche und einzelne Einträge wählen; Vorschau und selbstständige HTML-Datei offline erzeugen (F14). Check-in-Werte aus F02 sowie Terminnotizen und Termindaten aus F05 sind gesondert auswählbar und bei Auslassung tatsächlich aus Vorschau und Datei entfernt.
  - [x] Terminmappe direkt lokal als PDF: bewusst ausgewählte Fragen, Antworten, Terminangaben und Journalbeobachtungen; A4, Seitenumbrüche, eingebettete Schrift, Antwortzeilen. HTML bleibt Alternative für nicht unterstützte Schriftzeichen.
  - [ ] Direkten PDF-Download auf die allgemeinen Zeitraum-/Bereichsberichte ausweiten und die Datei-/Druckabläufe auf physischen Smartphones vollständig prüfen. Der allgemeine Journalbericht verwendet weiterhin HTML und den Browser-Druckdialog.

- [x] **F09 · Persönlicher Geburts- und Wochenbettplan**
  Wünsche, Vorbereitungen, Kontakte und benötigte Unterstützung in bearbeitbaren Vorlagen festhalten.
  **Fertig, wenn:** Abschnitte frei ergänzt oder ausgelassen werden können, der Bearbeitungsstand erhalten bleibt und eine druckbare Fassung erzeugt werden kann. Wünsche sind als persönliche Planung erkennbar.
  **Umgesetzt:** Geburtswünsche, Tasche, Organisatorisches und Unterstützung frei ergänzen/bearbeiten, Zuständigkeiten, Erledigt-Status, umkehrbares Archiv und einzeln gewählte druckbare Ausgabe. Kontakte sind über die bestehende Verwaltung erreichbar. [AgDR-0026](agdr/0026-alltagsbegleitung-terminmappe-und-wochenbett.md).

## Vollständig beauftragtes Umsetzungspaket 1–8

Die vorherige Empfehlung enthielt fünf nummerierte Vorschläge plus Vollsicherung; die beiden zusätzlichen Wünsche ergänzen das Paket auf acht Punkte. Diese Zuordnung ist die kommunizierte Agenteninterpretation. Alle bleiben offline, kostenlos und ohne externen Datenserver nutzbar.

| Paket | Feature | Stand |
| --- | --- | --- |
| 1 | **F19 · Heute für mich**: nächster Termin, offene Fragen, notierte Schritte und ein aufklappbarer Wochenimpuls; mobil direkt unter der grünen SSW-Karte | [x] Umgesetzt |
| 2 | **F05 erweitert · Terminmappe**: Gesprächsmodus mit Auswahl eigener Fragen/Antworten und letzter 28 Tage Journal, Vorschau und Druckdatei | [x] Umgesetzt; mit lokalem PDF-Download für die Terminmappe ergänzt; übrige PDF-Berichte weiter F07 offen |
| 3 | **F20 · Beschwerdenhilfe**: sechs Offline-Karten, direkte Journal-Verknüpfung, Frage vormerken und Kontakte | [x] Umgesetzt, Quellen und Prüfstand je Karte |
| 4 | **F09/F06 · Geburt und Wochenbett**: persönliche Planung, ausgewählte Ausgabe und ausdrückliche neue Phase | [x] Umgesetzt |
| 5 | **F04 · Persönliche Verläufe**: Zeitraum, Ausgangswert, Differenz und Originalnotizen | [x] Umgesetzt |
| 6 | **F21 · Verschlüsselte Vollsicherung**: Passwortbestätigung, intern geprüfter Export, entschlüsselte Vorschau und exakte Wiederherstellung einschließlich Verläufen und Master | [x] Umgesetzt; echte Geräte-/Dateidialogprüfung offen |
| 7 | **F22 · App-Zurück**: Bereichsverlauf, Dialoge zuerst, Entwurfsabfrage und mobiler Übersichtseinstieg | [x] Umgesetzt; Betriebssystem-Gesten auf Geräten offen |
| 8 | **F23 · Entwicklung und Untersuchungsmaße**: lokale Wochenmotive im Überblick und in der Wochenreise, eine feste Größenorientierung je SSW ohne Tagesauswahl, quellenbezogene Größenstufen, eigene Maße ohne automatische Umdatierung | [x] Umgesetzt. Vollständiger physischer Eingabeablauf und Nutzertest der Bildmotive offen |

Entscheidungen und tatsächliche Prüflücken: [AgDR-0026](agdr/0026-alltagsbegleitung-terminmappe-und-wochenbett.md), [AgDR-0027](agdr/0027-verschluesselte-vollsicherung.md), [AgDR-0028](agdr/0028-mobile-zurueck-navigation.md), [AgDR-0029](agdr/0029-entwicklung-und-untersuchungsmasse.md). Signierter Geräteinhalt v3 enthält Planung/Phase/Untersuchungswerte; beide Smartphones vor neuer Weitergabe aktualisieren. Der manuelle Geräteabgleich wird dadurch nicht automatisch.

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

- Neue persönliche Angaben bleiben lokal nutzbar und werden in Sicherung und Wiederherstellung einbezogen. Geräte-Stände werden bewusst ohne Datenserver weitergegeben; nur der aktive Master bearbeitet die zugeordnete Schwangerschaft und das Journal. Anrufkontakte bleiben gerätespezifisch und sind optional übertragbar.
- Bestehende Daten werden bei Formatänderungen erhalten; Migrationen und Fehlerfälle werden passend geprüft. In Tests und Dokumentation stehen ausschließlich synthetische Beispiele.
- GitHub-Pages-Kompatibilität, mobile Bedienung und die vorhandene Offline-Nutzung bleiben erhalten. Funktionen mit zusätzlichem Infrastrukturbedarf bekommen vor der Umsetzung eine dokumentierte Architekturentscheidung.
- Medizinische Inhalte haben Fachquellen und einen redaktionellen Stand; der vom Nutzer gewünschte NDR-Bereich „Tatsächlich schwanger“ wird als ergänzende redaktionelle Quelle mit konkret geprüften Beiträgen berücksichtigt ([AgDR-0018](agdr/0018-ndr-als-ergaenzende-quelle.md)). Beobachtungen werden nicht als Diagnosen oder nachgewiesene Ursachen interpretiert.
- Alle Funktionen sind ohne Bezahlstufe zugänglich. Neue Ansichten, Suche und Berichte funktionieren offline; die App speichert keine Suchhistorie und lädt keine externen Inhalte automatisch nach. Externe Originalquellen brauchen Internet. Die App muss auf beiden Geräten zunächst vollständig geladen sein; danach können Dateien offline übertragen und importiert werden. QR/Link benötigen eine auf dem Zielgerät verfügbare App-Adresse.
- Bei Teilweitergabe werden ausgelassene Inhalte einschließlich Metadaten tatsächlich entfernt. Ein bereits übergebener vollständiger Geräte-Stand wird durch spätere Ansichtsfilter nicht eingeschränkt. Ein begrenzter automatischer Geräteabgleich und seine Rechte-/Schlüsselregeln bleiben offen; aktive Serverräume werden in dieser App-Version nicht mehr verwendet.
- Wesentliche Entscheidungen erhalten einen AgDR; README und diese Arbeitsliste werden entsprechend aktualisiert. Funktionsänderungen werden angemessen geprüft und gebaut, verbleibende Prüflücken dokumentiert.

## Festgelegte Produktgrundlage

Die frühere Kennzeichnung als „Premium-Kandidat“ wurde durch die ausdrückliche Nutzerentscheidung abgelöst: **Alle heutigen und zukünftigen Funktionen sind kostenlos für alle.** Die Prioritäten bestimmen nur die Umsetzungsreihenfolge.

**Nächste Schritte nach dem beauftragten Paket:** Hauptabläufe auf den eigenen iPhone-/Android-Geräten einschließlich installierter PWA, Zurück-Geste, Entwurfsschutz, Vollsicherung/Wiederherstellung und ausgewählter Druckdatei erproben. F07 bleibt für allgemeine PDF-Berichte und vollständig geprüfte Smartphone-Dateiabläufe offen, F17 für die direkte Geräteverbindung. Weitere Produktfeatures sind F08, F10 und F11; sie gehören nicht automatisch zum jetzt beauftragten Paket.

Entwicklungsvisualisierung: Jede SSW hat ein eigenes Motiv. Die Wochenreise beginnt mit zwei Aquarellen zum Zyklus und zeigt ab der 3. SSW den ungefähren Bereich der illustrierten Entwicklungsphase. Auf der grünen SSW-Karte im Überblick erscheint dasselbe Motiv zur aktuellen Woche. Die mobile Tageskarte steht darunter. [AgDR-0047](agdr/0047-eigenes-motiv-je-schwangerschaftswoche.md), [AgDR-0048](agdr/0048-wochenmotive-im-ueberblick.md), [AgDR-0049](agdr/0049-aquarellmotive-fuer-die-ersten-beiden-wochen.md)

Ungenutzte alte Illustrationen und Server-Sync-Oberfläche entfernt; aktuelle Bilder, Offline-Funktionen und Altstand-Wiederherstellung bleiben erhalten: [AgDR-0040](agdr/0040-bereinigung-ungenutzter-dateien.md).

## Ergänzungen vom 20.11.2026

- [x] Fragen und Antworten mit sicheren Absätzen sowie echten Aufzählungen und nummerierten Listen darstellen; Originaltexte bleiben erhalten.
- [x] Ausgewählte Terminmappe als lokale PDF mit Platz für handschriftliche Antworten herunterladen.
- [x] Kalender-Tagesdetails per langem Drücken, Schaltfläche, Kontextmenü oder Tastatur im Dialog öffnen; Datierung, Legende, Tagesbereiche und weitere Hinweise zuklappen.
- [x] Fachlich belegte zusätzliche Pränataldiagnostik-, Rhesus- und Blutuntersuchungsfenster samt Freiwilligkeit/Bedingungen und Prüfstand ergänzen.
- [x] Rechnerischen Beginn gegenüber Periodendatum erklären; ab 42+0 keine fortlaufende SSW anzeigen, ohne Geburt oder individuelles Höchstdatum zu unterstellen.

Umfang, Quellen, PDF-Prüfung und verbleibende Geräteprüfungen: [AgDR-0042](agdr/0042-termin-pdf-und-kompakter-vorsorgekalender.md).

Kalender und Journal: Eine Wochenansicht verbindet die SSW mit ihrem Zeitraum, den Tagesdaten, Symptomen und Messwerten. Der Monat, der gewählte Tag und der Vorsorge-Vorausblick haben eine kompakte Anordnung. Die Illustration steht in der verlinkten Wochenreise. [AgDR-0044](agdr/0044-kalender-mit-gemeinsamer-wochenansicht.md)
