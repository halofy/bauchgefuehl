# bauchgefühl

Ein kleiner, deutschsprachiger Schwangerschaftsbegleiter als installierbare PWA mit lokalem Speicher und serverloser Weitergabe von Geräte-Ständen. Ohne Anmeldung, externe Schriften oder Tracking. Mit App-Navigation für Smartphones und einer Übersicht für größere Bildschirme.

**Alle Funktionen sind kostenlos für alle.** Es gibt keine Premium-Stufen. Die App verarbeitet Angaben und Suchanfragen lokal und bleibt nach dem ersten vollständigen Laden offline nutzbar. Externe Originalquellen benötigen Internet. Für den Geräteabgleich braucht es keinen Datenserver; beide Geräte müssen die App zuvor vollständig geladen haben.

## Funktionen

- **Mobile App-Ansicht:** jeweils einer von fünf übersichtlichen Bereichen, mobil über die feste untere Navigation, große Touch-Ziele, mobile Dialoge sowie kompakte Journalfilter und Messwertverläufe.
- **Installierbar und offline nutzbar:** nach dem ersten vollständigen Laden auch ohne Netz starten; Updates bewusst übernehmen.
- **Wählbare SSW-Methode:** aus Periodenbeginn und eigener durchschnittlicher Zykluslänge oder Rückrechnung vom ET auf 28-Tage-Basis, mit Wochen, Tagen und transparenter Erklärung.
- Persönliche Rechenschritte mit den eingegebenen Daten unter **Wissen → Wie wird meine Schwangerschaftswoche berechnet?** oder direkt über **Deine Grundlage**.
- Je nach Methode berechneter oder eingetragener ET, Trimester und Fortschritt.
- Wochenreise für die **1. bis 42. SSW** mit Entwicklungsinfos, körperlichen Veränderungen und kleinen Impulsen.
- Vorsorgethemen für Deutschland mit exakten Wochenfenstern, Quellen und lokalen Merkhäkchen.
- **Persönliches Journal:** datierte Notizen, auswählbare und eigene Symptome, freie Tags sowie Gewicht, Bauch-/Brust-/Hüftumfang, Temperatur und eigene Messgrößen mit Einheit.
- **Kalender & Vorausblick:** SSW an jedem Datum, Suche in beide Richtungen, alle 42 Wochen mit Datumsbereichen sowie markierte Vorsorgefenster, Trimesterwechsel, Halbzeit und ET. Journaleinträge erscheinen an ihrem Datum im Kalender.
- **Symptomkalender & Wochenrückblick:** einzelne Symptome hervorheben; Beobachtungen, erfasste Tage und Messwerte einer Kalenderwoche überblicken und passende Originaleinträge öffnen.
- **Lebensmittel & Aktivitäten:** offline in 26 geprüften Einträgen suchen, Zubereitung beziehungsweise Sorte wählen und Bedingungen, Ampel, Quellen und Prüfstand nachlesen. Auch mit einem Tag aus dem Kalender verknüpft.
- **Ausgewählte Journalbereiche weitergeben:** Zeitraum, Notizen, Symptome, Tags, Messwerte und Uhrzeiten einzeln wählen, einzelne Einträge auslassen und den tatsächlichen Dateiinhalt vorab ansehen. Selbstständige HTML-Datei ohne Upload; über den Browser druckbar.
- Einträge bearbeiten, archivieren und wiederherstellen; Suche und Filter nach Tag, Symptom oder Zeitraum, Messwertverlauf mit Tabelle sowie CSV-Export der gefilterten Einträge.
- Lokale Speicherung mit verständlichen Hinweisen bei gesperrtem Browser-Speicher; Löschen der eigenen Daten.
- Teilen-Link standardmäßig nur mit ET; vollständige Berechnungsgrundlage bewusst wählbar. Empfangene Daten werden zunächst nur angezeigt und können ausdrücklich lokal übernommen werden.
- Klar markierte Beispieldaten, bis eigene Angaben eingetragen sind.
- **Kontakte & Wehen:** drei Anrufkontakte, dauerhafte Zeitmessung, Kalenderprotokoll und vorsichtige Zeitmusterhinweise mit Quellen.
- **Master und mitlesendes Gerät ohne Datenserver:** signierte, passwortverschlüsselte Stände bewusst per QR/Link oder Datei weitergeben. Kein automatischer Hintergrund-Sync.
- Vollständige lokale Backups einschließlich Kontakte, offener Messung und Geräteschlüssel; Sicherungsverlauf und Wiederherstellung.

## Auf zwei Smartphones verwenden

Die veröffentlichte App auf beiden Geräten über HTTPS öffnen und vollständig laden, optional installieren. Zum Benutzen ist kein eigener Dev- oder Sync-Server nötig. **Überblick → Daten & Backup** öffnet die serverlose Standweitergabe und Sicherungen. Nach dem Laden funktioniert die App offline; neue Stände werden bewusst übertragen. Anleitung unten unter „Geräte-Stände ohne Server“.

## Lokal entwickeln und bauen

Der folgende Webserver dient ausschließlich der Entwicklung auf dem eigenen Rechner. Er ist für den Geräteabgleich auf Smartphones nicht erforderlich. Die früheren Serverdateien bleiben zur Nachvollziehbarkeit und zum Erhalt alter Daten im Repository; die aktuelle App startet keine Serververbindung mehr. Alte `.local-sync/`-Datenordner nicht versehentlich entfernen.

Für die vollständige PWA zuerst bauen und anschließend die erzeugte App ausliefern:

```sh
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Anschließend `http://localhost:4173` öffnen. Wegen der JavaScript-Module bitte über einen Webserver starten, nicht durch Doppelklick auf `index.html`.

Mit Node.js ab Version 22.13 können Tests und Build ausgeführt werden. Es gibt **keine npm-Abhängigkeiten** und keinen Installationsschritt. Die QR-Bibliothek wird lokal mitgeliefert:

```sh
npm test
npm run build
```

`dist/` enthält die vollständige statische Website. Alle lokalen Ressourcen werden relativ eingebunden; dadurch funktioniert der GitHub-Pages-Projektpfad `/bauchgefuehl/` ohne Konfiguration.

## Als App installieren und offline verwenden

Die App über HTTPS öffnen; lokal funktionieren auch `localhost` und `127.0.0.1`. Das **Info-Symbol oben rechts** öffnet Installationshinweise und den Offline-Status.

Das App-Layout mit fester Navigation unten gilt bis **900 CSS-Pixel Breite**, auf Geräten mit primärer Touch-Eingabe ohne Hover bis **1200 CSS-Pixel**. Als **Standalone-PWA gestartet** gilt das App-Layout unabhängig von der Breite, einschließlich Safari-Erkennung. Ein breiter normaler Desktop-Tab verwendet die breitere Gestaltung; auch dort bleibt jeweils nur der gewählte Hauptbereich sichtbar.

- **Android/Chrome oder Desktop/Chromium:** „App installieren“ wählen, wenn angeboten, oder die Installationsfunktion im Browsermenü nutzen.
- **iPhone/iPad:** in Safari **Teilen → Zum Home-Bildschirm** wählen und, falls angeboten, **Als Web-App öffnen** aktivieren.

Nach dem ersten vollständigen Laden meldet die App, dass ihre Dateien offline bereitstehen. Dann lassen sich gespeicherte Angaben, Wocheninfos und Journal auch ohne Verbindung öffnen und lokal bearbeiten. Geräte-Stände werden bei Bedarf als Datei oder QR/Link übertragen; externe Quellen benötigen Internet. Eine installierte App kann einen anderen Speicher als der Browser haben: Angaben nach der Installation prüfen und gegebenenfalls über **Daten & Backup** übernehmen oder wiederherstellen.

Ein Punkt am Info-Symbol zeigt ein verfügbares Update. **Update laden** lädt die App nach Bestätigung neu; offene Eingaben vorher speichern. Bei Veröffentlichungen immer frisch bauen und den **vollständigen Inhalt von `dist/`** ausliefern, damit Cache und App-Dateien dieselbe Version verwenden. Die Workerquelle im Projektstamm dient nur der Entwicklung. Browser können lokale Daten und Offline-Dateien löschen; heruntergeladene Backups bleiben wichtig.

## Kalender und Vorausblick

Unter **Kalender → Kalender & Vorausblick** steht die SSW unter jedem Datum. Wähle einen Tag, um passende Vorsorgefenster, Meilensteine und deine Journaleinträge zu sehen. Mit den Pfeilen oder der Monatsauswahl blättern; **Heute** und **Zum ET** springen direkt zum entsprechenden Tag.

Über **Datum oder SSW nachschlagen** kannst du ein Datum wählen oder volle Wochen und Tage eingeben, zum Beispiel `24+0`. Die aufklappbare Übersicht **Alle 42 SSW mit Datumsbereichen ansehen** zeigt für jede laufende Woche deren Zeitraum. Der Vorausblick darunter gilt ab dem ausgewählten Tag und enthält auch bereits laufende Vorsorgefenster.

Vorsorgefenster sind Orientierung, keine vereinbarten Termine. Eigene zukünftige Termine bleiben als Erweiterung in F05 der Feature-Liste offen. Die gewählte Datierung bestimmt alle SSW und Zeitfenster. Bei einer Änderung werden die Kalenderangaben neu berechnet; gespeicherte Journalbeobachtungen behalten ihr Datum.

Über **Symptom im Kalender hervorheben** wählst du alle erfassten Symptome oder ein bestimmtes Symptom. Die zusätzliche Markierung zählt Journaleinträge mit einer entsprechenden Nennung. Ein Symptom zählt pro Eintrag höchstens einmal; mehrere Einträge am selben Tag bleiben mehrere Beobachtungen.

Der aufklappbare Bereich **Wochenrückblick & Messwerte** zeigt die Kalenderwoche von Montag bis Sonntag, in der der ausgewählte Tag liegt. Über seine Pfeile wechselst du wochenweise; die Tageskarten öffnen den jeweiligen Kalendertag. Erfasste Tage, Tage ohne Eintrag und zukünftige Tage werden getrennt angezeigt. Fehlende Angaben bedeuten keine Beschwerdefreiheit. Archivierte Einträge sind ausgeblendet.

Tippe auf ein Symptom, um die Originaleinträge dieser Woche mit genau dieser Symptomangabe zu öffnen. Der allgemeine Link zeigt alle Einträge der Woche. Die Messwertübersicht enthält jeweils den letzten Wert, die Anzahl der Messungen sowie bei mehreren Messungen den ersten Wert und die Spanne. Unterschiedliche Einheiten bleiben getrennt. Strukturierte Angaben zu Stimmung, Energie, Schlaf und Symptomstärke folgen mit F02; sie werden nicht aus Notizen abgeleitet.

## Eigene Informationen erfassen

Nach dem Speichern deiner Basisdaten **Kalender → Eintrag hinzufügen** öffnen oder einen vergangenen/heutigen Kalendertag wählen und **Eintrag für diesen Tag** nutzen. Datum, optionale Uhrzeit, Symptome, Notiz, Tags und Messwerte lassen sich kombinieren oder einzeln erfassen. Symptome und Tags mit Kommas trennen. Messwerte akzeptieren Dezimalkomma oder Punkt; unter **Weitere oder eigene Messgröße** sind Bezeichnung und Einheit frei wählbar.

Unter **Journalliste & Verlauf** kannst du suchen und nach Tag, Symptom und Zeitraum filtern. Der Symptomfilter berücksichtigt ausdrücklich erfasste Symptome, unabhängig von Groß-/Kleinschreibung; die Suche findet zusätzlich Text in Notizen. Der Verlauf und die aufklappbare Tabelle folgen diesen Filtern. **In der Journalliste öffnen** in den Kalenderdetails grenzt die Liste auf diesen Tag ein. Unterschiedliche Einheiten bleiben getrennte Messreihen. Die angezeigte SSW folgt deiner aktuellen Berechnungsgrundlage; Messwerte werden nicht medizinisch bewertet.

**Archivieren** blendet einen Eintrag aus. Über **Archivierte anzeigen → Wiederherstellen** kommt er zurück. CSV exportiert die aktuell gefilterten Einträge; ein vollständiges JSON-Backup inklusive Journal gibt es unter **Daten & Backup**. Der einfache Reise-Link enthält weiterhin nur die Berechnungsgrundlage. Ein bewusst übertragener Geräte-Stand enthält auch Journaleinträge; Änderungen erfolgen am Master.

Frühere Serververbindungen werden nicht mehr gestartet. Alte Geräte-Links lösen keine Netzwerkverbindung aus; gespeicherte Schlüssel und ausstehende Daten bleiben im vollständigen Backup erhalten. Eine neue Weitergabe erfolgt über **Daten & Backup**. Ein älteres Gerät muss die neue App-Version bewusst laden; alte Versionen können sonst weiter ihren bisherigen Dienst verwenden.

Unterstützt werden bis zu 1.000 Einträge und insgesamt ungefähr 512 KiB pro Datenstand; vorher kann der Browser-Speicher voll sein. Ein Speicherversuch bricht dann mit einem Hinweis ab, ohne vorhandene Einträge zu kürzen. Der lokale Sicherungsverlauf ist auf 20 Stände und ungefähr 2 MiB begrenzt. Backups deshalb zusätzlich aufbewahren.

## Lebensmittel und Aktivitäten offline nachschlagen

Unter **Wissen → Was passt gerade zu mir?** nach Begriffen wie Lachs, Kaffee, Sauna oder Joggen suchen. Bereich und Ampel lassen sich filtern. Karten öffnen, gegebenenfalls Zubereitung beziehungsweise Sorte wählen und die Bedingungen lesen. **Grün** heißt „OK unter Bedingungen“, **Gelb** „Anpassen / abklären“, **Rot** „Vermeiden“. Ein unbekannter Begriff erhält keine Freigabe. Keine individuelle Gesundheitsprüfung, keine vollständige Produktdatenbank und keine aktuellen Produktrückrufe.

Jede Karte nennt verlinkte Quellen und das redaktionelle Prüfdatum. Zusammenfassungen und Suchindex werden lokal ausgeliefert, die Suchbegriffe werden von der App weder gespeichert noch versendet. Neue Erkenntnisse werden über ein bewusstes App-Update übernommen; die Originalseiten benötigen Internet. Der erste Katalog wurde am **17.11.2026** anhand von BIÖG, BfR, Netzwerk Gesund ins Leben und gesund.bund.de geprüft; Quellen und Zuordnung stehen in [AgDR-0017](docs/agdr/0017-lebensmittel-und-aktivitaeten.md) und den Karten.

Auf ausdrücklichen Nutzerwunsch ergänzt der NDR-Bereich [„Tatsächlich schwanger“](https://www.ndr.de/ratgeber/gesundheit/Tatsaechlich-schwanger-Alles-rund-um-die-Geburt-und-die-erste-Zeit-mit-Baby,tatsaechlichschwanger100.html) die Quellenbasis. Der am **17.11.2026** gelesene [Ernährungsartikel](https://www.ndr.de/ratgeber/gesundheit/Ernaehrung-in-der-Schwangerschaft-Was-ist-erlaubt-was-eher-nicht,ernaehrung676.html) ist bei rohem Fisch, Fleisch, Eiern, Tiefkühlbeeren, Sprossen und Alkohol zusätzlich verlinkt. Der Artikelstand ist **10.09.2024**; unser Prüftag ist davon zu unterscheiden. NDR liefert ergänzende redaktionelle Informationen; Detailbedingungen werden mit Fachquellen abgeglichen. Keine eingebetteten Player oder automatischen externen Aufrufe. [Quellenentscheidung: AgDR-0018](docs/agdr/0018-ndr-als-ergaenzende-quelle.md).

Im Kalender öffnet **Lebensmittel & Aktivitäten an diesem Tag** die Suche mit dem gewählten Datum und der passenden SSW. Der Bezugstag kann auch direkt geändert werden. Datierung, Bedingungen und Phasenhinweise werden angezeigt; ein Wochenwechsel erteilt keine automatische Freigabe. Beispieldaten und unsichere Schätzungen sind gekennzeichnet.

## Bewusst nur ausgewählte Angaben teilen

**Reise teilen** startet mit **Nur ET und Zeitachse**: Periodenbeginn, Zykluslänge und Unregelmäßigkeit fehlen im erzeugten Link. Die SSW bleibt rechnerisch gleich; ein geschätzter ET bleibt eine Schätzung. Zyklusbezogene Unsicherheitshinweise werden nicht übertragen. Aus dem ET lässt sich die zeitliche Einordnung weiterhin ableiten. Wer die vollständige Grundlage weitergeben möchte, wählt dies ausdrücklich im Dialog. Beide Linkvarianten enthalten weder Journal noch Merkhäkchen, sind unverschlüsselt und lassen sich nicht zurückrufen. Alte Links behalten ihren damaligen Inhalt.

Unter **Kalender → Journalliste & Verlauf → Ausgewählte Bereiche teilen** oder aus dem Teilen-Dialog öffnet sich der **Journalauszug**. Zunächst ist kein Bereich ausgewählt. Zeitraum und Bereiche wählen, unter **Einzelne Einträge auslassen** bei Bedarf Einträge abwählen und die Vorschau prüfen. Enthaltene Einträge haben immer ein Datum; Uhrzeiten sind separat wählbar. Archivierte Einträge bleiben ausgeschlossen. Ausgelassene Inhalte und interne IDs beziehungsweise Änderungsmetadaten stehen auch nicht versteckt in der Datei.

**Auszug als HTML-Datei herunterladen** erzeugt die Datei vollständig lokal. Sie enthält keine Scripts, externen Ressourcen, Basisdaten, SSW oder Sync-Schlüssel. Sie ist offline lesbar; für ein PDF die Datei öffnen und im Browser-Druckdialog „Als PDF speichern“ wählen, sofern verfügbar. Die Klartextdatei wird erst weitergegeben, wenn du das selbst tust. Sie ist kein wiederherstellbares Backup. Messwerte und Angaben sind als persönliche Journalquelle bezeichnet, ohne medizinische Bewertung.

**Ein Geräte-Stand enthält das vollständige Journal**, einschließlich Archiv. Für begrenzte Weitergabe den ausgewählten Journalauszug verwenden. Kontakte werden nur nach eigener Auswahl beigefügt; eine laufende Messung bleibt auf dem messenden Gerät. Bereits übergebene Kopien lassen sich nicht zurückholen.

## Kontakte und Wehen

**Überblick → Hilfe & Kontakte** oder **Vorsorge → Kontakte & Wehen** öffnen die gemeinsame Ansicht. Unter **Drei Kontakte & Geburtsangabe bearbeiten** bis zu drei Namen und Nummern speichern. Ein Kontakt öffnet per `tel:` die Telefon-App; die App ruft niemals automatisch an. Kontakte sind gerätespezifisch und gehören zum vollständigen Backup.

**Wehe beginnt · Start** speichert den Beginn sofort. **Wehe endet · Speichern** protokolliert die Dauer und gegebenenfalls den Abstand von Beginn zu Beginn als Journalmessung. Offene Messungen bleiben nach Neuladen erhalten. Bei vergessenem Stoppen unter **Endzeit korrigieren** den tatsächlichen Zeitpunkt wählen. Versehentliche Messungen lassen sich im Kalender behalten und von der Musterübersicht ausschließen. Beim Browser-Schließen wird nichts im Hintergrund überwacht; die Anzeige rekonstruiert die Zeit aus dem gespeicherten Beginn.

Ab **22+0** bei eigenen Angaben erscheint ein schwebender Schnellzugriff, bei offener Messung immer. Der Tracker ist auch früher über die genannten Bereiche erreichbar. Die Grenze ist eine Bedienentscheidung und keine individuelle Aussage über Lebensfähigkeit. Die App erkennt ausschließlich aufgezeichnete **Zeitmuster**, keine bestätigten Geburtswehen. Für erstes und weiteres Kind gelten unterschiedliche Orientierungen. Bei Verdacht auf vorzeitige Wehen vor 37+0 oder bei Warnzeichen direkt die Betreuung kontaktieren, nicht auf ein Muster warten. Kontakte stehen neben den Hinweisen bereit. Quellen und technische Grenzen: [AgDR-0019](docs/agdr/0019-kontakte-und-wehentracker.md); die App verlinkt BIÖG, IQWiG und Uniklinik Düsseldorf mit Prüfdatum 18.11.2026.

## Geräte-Stände ohne Server

1. Auf dem bearbeitenden Smartphone **Daten & Backup → Stand vom Master weitergeben** öffnen. Ein starkes gemeinsames Passwort mit mindestens zwölf Zeichen eingeben. Kontakte sind zunächst ausgeschlossen.
2. **Verschlüsselten Stand erstellen**. Der erste Export macht dieses Gerät zum Master. Kompakte Stände erscheinen als QR und Link. Auch größere Stände sind als lange Links verfügbar; QR und Link haben getrennte Grenzen (2.200 beziehungsweise 65.536 Zeichen einschließlich App-Adresse). Noch größere Stände werden vollständig als verschlüsselte JSON-Datei weitergegeben. Lange Links können von Teilen-Zielen gekürzt werden; die vollständige Datei bleibt deshalb immer verfügbar. Keine Daten werden gekürzt oder hochgeladen.
   Bei Browserunterstützung öffnen **Link teilen** beziehungsweise **Datei teilen** die native Auswahl des Smartphones. Verfügbare Nahziele bestimmt das Betriebssystem; die App entdeckt keine Geräte und garantiert keinen plattformübergreifenden lokalen Transport. Gewählte Nachrichten-/Cloudziele können Drittdienste verwenden. Kopieren und Download funktionieren als Alternative. Beide Geräte brauchen für die neuen kompakten Links eine aktuelle App-Version; bisherige Links bleiben lesbar.
3. Auf dem zweiten Smartphone QR/Link mit der verfügbaren App öffnen oder unter **Stand auf diesem Gerät übernehmen** die Datei auswählen. Dasselbe Passwort separat eingeben; es steht nicht im QR/Link und wird nicht gespeichert.
4. **Entschlüsseln & Vorschau prüfen**: Masterkennung, Version und Umfang kontrollieren; Kontakte optional übernehmen. Erst **Geprüften Stand bewusst übernehmen** schreibt die Daten. Das zweite Gerät ist danach ein Mitlesegerät.
5. Nach Änderungen am Master einen **neuen Stand erstellen und bewusst übertragen**. Es gibt keine automatische Aktualisierung. Ein lokales oder fremdes Sync-/Signalisierungs-/STUN-/TURN-System ist nicht beteiligt.

Ein Master signiert seine Stände; Mitleser besitzen seinen Signaturschlüssel nicht. Gekoppelte Empfänger verweigern fremde Master, ältere Versionen, Versionskonflikte und fehlende beziehungsweise zurückgesetzte Journalangaben. Der aktive Master-Tab ist gegen parallele Master-Tabs gesperrt. Eine abweichende eigene Reise muss vor dem erstmaligen Ersetzen vollständig gesichert werden.

Unter **Vollständiges Backup & Wiederherstellung** die Klartext-Sicherung sicher aufbewahren. Sie enthält auch offene Messung, Kontakte, lokale Schlüssel, Verlauf und gegebenenfalls alte Server-Rohdaten. Eine ältere Sicherung kann zu einer niedrigeren Version führen; Mitleser übernehmen diese nicht still. Zum Wechsel des Masters beziehungsweise der Zuordnung erst sichern und die Zuordnung bewusst lösen. Der andere Master wird dadurch nicht aus der Ferne deaktiviert. Wiederherstellung verlangt bei bestehenden Angaben zuerst einen aktuellen Backup-Download. Die Quelldatei bleibt auch dann wichtig, wenn alte Rohverläufe nicht automatisch in den aktuellen Verlauf übernommen werden.

Eine direkte automatische Browserverbindung ohne fremde Verbindungsdienste wird nicht als zuverlässig zugesagt und bleibt unter F17 offen. Die aktuelle Alternative ist vollständig serverlos, aber manuell. UWB, Web Bluetooth und Web NFC bieten laut geprüfter Plattformdokumentation keinen gemeinsamen iPhone-/Android-Webkanal. Ein WebRTC-Versuch im selben Netz mit manuellem QR-Angebot und QR-Antwort bleibt offen. Technikprüfung und Link-/Teilen-Grenzen: [AgDR-0022](docs/agdr/0022-smartphone-nahuebertragung-und-kompakte-links.md). Grenzen der Browserprüfung und Wiederherstellung: [AgDR-0020](docs/agdr/0020-serverloser-geraeteabgleich.md).

## Auf GitHub Pages veröffentlichen

Ziel ist das Repository [halofy/bauchgefuehl](https://github.com/halofy/bauchgefuehl). Die erwartete öffentliche Adresse lautet [https://halofy.github.io/bauchgefuehl/](https://halofy.github.io/bauchgefuehl/); sie ist erst nach erfolgreichem Deployment erreichbar.

1. Die Projektdateien inklusive `.github/workflows/pages.yml` in das Ziel-Repository auf den Branch `main` pushen.
2. Im [Ziel-Repository unter Settings → Pages](https://github.com/halofy/bauchgefuehl/settings/pages) bei **Build and deployment → Source → GitHub Actions** auswählen.
3. Unter **Actions → GitHub Pages → Run workflow** den Workflow starten, sofern der Push ihn nicht schon ausgeführt hat.
4. Nach erfolgreichem Lauf steht die Adresse in der Deployment-Umgebung `github-pages` und unter Settings → Pages.

Der Workflow führt die Tests aus, erstellt `dist/` und veröffentlicht das Pages-Artefakt. Falls dein Hauptbranch anders heißt, ändere `branches: [main]` in der Workflow-Datei. GitHub Pages muss für das Repository verfügbar sein und GitHub Actions aktiviert sein.

Alternativ den vollständigen Inhalt des frisch gebauten `dist/` auf einem Veröffentlichungsbranch ablegen und diesen über „Deploy from a branch“ ausliefern. Den Quellverzeichnis-Stamm nicht als Produktions-PWA veröffentlichen: Der Build erzeugt den versionierten Service Worker. Die statische Auslieferung enthält keine Secrets.

Offizielle Anleitung: [GitHub Pages mit eigenem Workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Entscheidungen und technische Dokumentation

Die priorisierte **[Feature-Liste zum Abarbeiten](docs/open.md)** enthält offene Erweiterungen mit Kennungen, Abhängigkeiten und Abschlusskriterien. Die SSW-Berechnungsfrage ist geklärt und wird dort als abgeschlossen geführt.

Die Dokumentation folgt **AgDRs (Agent Decision Records)**. Der [AgDR-Index](docs/agdr/README.md) ist die maßgebliche Stelle für Entscheidungsbegründungen, Alternativen, Folgen und Prüfnachweise:

- [AgDR-0001: Statische Webapp für GitHub Pages](docs/agdr/0001-statische-webapp.md)
- [AgDR-0002: SSW aus Periode und individueller Zykluslänge](docs/agdr/0002-ssw-aus-periode-und-zyklus.md)
- [AgDR-0003: Lokale Daten und Teilen-Links](docs/agdr/0003-lokale-daten-und-teilen.md)
- [AgDR-0004: Medizinische Inhalte und Vorsorge](docs/agdr/0004-medizinische-inhalte.md)
- [AgDR-0005: Bedienung und Verifikation](docs/agdr/0005-bedienung-und-verifikation.md)
- [AgDR-0006: Wählbare Berechnungsmethode und Datenmigration](docs/agdr/0006-waehlbare-berechnungsmethode.md)
- [AgDR-0007: Konkretes GitHub-Pages-Ziel](docs/agdr/0007-github-pages-ziel.md)
- [AgDR-0008: Master-Sync, QR und lokaler Betrieb](docs/agdr/0008-master-sync-und-lokaler-betrieb.md)
- [AgDR-0009: Persönliches Journal und Messwerte](docs/agdr/0009-persoenliches-journal.md)
- [AgDR-0010: Mobile App-Navigation und PWA](docs/agdr/0010-mobile-app-und-pwa.md)
- [AgDR-0011: Persönliche Berechnungserklärung](docs/agdr/0011-persoenliche-berechnungserklaerung.md)
- [AgDR-0012: Feature-Backlog und abgeschlossene SSW-Prüfung](docs/agdr/0012-roadmap-und-ssw-pruefung.md)
- [AgDR-0013: App-Layout für große Smartphones und installierte PWAs](docs/agdr/0013-app-layout-erkennung.md)
- [AgDR-0014: Kalender, SSW-Vorausblick und Journal](docs/agdr/0014-kalender-und-journal.md)
- [AgDR-0015: F03 – Symptomkalender und Wochenrückblick](docs/agdr/0015-f03-symptomkalender-und-wochenrueckblick.md)
- [AgDR-0016: Kostenlos, offline und selektiv teilen](docs/agdr/0016-kostenlos-offline-und-selektives-teilen.md)
- [AgDR-0017: Lebensmittel- und Aktivitätensuche mit Quellen](docs/agdr/0017-lebensmittel-und-aktivitaeten.md)
- [AgDR-0018: NDR „Tatsächlich schwanger“ als ergänzende Quelle](docs/agdr/0018-ndr-als-ergaenzende-quelle.md)
- [AgDR-0019: Kontakte und Wehentracker](docs/agdr/0019-kontakte-und-wehentracker.md)
- [AgDR-0020: Serverloser Geräteabgleich](docs/agdr/0020-serverloser-geraeteabgleich.md)
- [AgDR-0021: Übersichtliche Hauptbereiche](docs/agdr/0021-uebersichtliche-hauptbereiche.md)
- [AgDR-0022: Smartphone-Nahübertragung und kompakte Links](docs/agdr/0022-smartphone-nahuebertragung-und-kompakte-links.md)

Künftige wesentliche Entscheidungen werden mit dem [Template](docs/agdr/_template.md) fortgeschrieben. [AGENTS.md](AGENTS.md) hält diese Projektkonvention auch für weitere Agentenarbeit fest.

Die SSW wird je nach gewählter Methode aus Periode und Zyklus geschätzt oder vom eingetragenen ET zurückgerechnet. Die App bestätigt keine medizinische Datierung. Geteilte Links sind nicht verschlüsselt: Alle mit dem Link können die ausgewählte Methode und ihre Basisdaten lesen. Die App erklärt das vor dem Kopieren und überschreibt beim Öffnen eines Links keine lokalen Daten. Vorhandene Daten und v1-Links bleiben als Periodenmethode lesbar.

Verschlüsselte **Geräte-Stand-Links** sind eigenständige Kopien mit getrenntem Passwort und Master-Signatur. Einfache **Reise-Links** bleiben davon unabhängig und unverschlüsselt. Geräte-Stände können nach Übernahme vollständig lokal gelesen werden; zukünftige Änderungen benötigen eine neue bewusste Übertragung.

## Dateien

- `src/dates.js`, `src/pregnancy.js`: Datumsarithmetik, Berechnung, Validierung, Teilen-Format und Speicher.
- `src/journal.js`, `src/journal-ui.js`: Journaleinträge, Messreihen, Filter, CSV und Erfassungsdialog.
- `src/calendar.js`, `src/calendar-ui.js`: Datum-/SSW-Zuordnung, Monatsansicht, Vorsorgefenster und Journalintegration.
- `src/reflection.js`, `src/reflection-ui.js`: Kalenderwochen, Symptomnennungen, Erfassungslücken und Messwertübersicht aus bestehenden Journaleinträgen.
- `src/guide-data.js`, `src/guide.js`, `src/guide-ui.js`: redaktioneller Offline-Katalog, Quellen, Zubereitungswahl, Suche und Kalenderbezug.
- `src/report.js`, `src/report-ui.js`: Datenprojektion, ET-only-Link, Bereichs-/Eintragsauswahl und eigenständiger HTML-Auszug.
- `src/content.js`: Wocheninfos und Vorsorgethemen mit Quellen.
- `src/app.js`: Oberfläche und Interaktionen.
- `src/device-transfer.js`, `src/devices-ui.js`: serverlose Verschlüsselung, Master-Signatur, Übertragung, Import-Sicherung und Wiederherstellung.
- `src/birth.js`, `src/birth-ui.js`: Kontakte, persistente Wehenmessungen, Journalprotokoll und Zeitmuster.
- `src/sync.js`, `src/sync-ui.js`: bisheriges Serverprotokoll; Snapshot-Validierung wird weiterverwendet, die alte Oberfläche nicht mehr gestartet.
- `src/qr.js`, `src/vendor/qrcodegen.js`: vollständig lokale QR-Erzeugung mit Nayuki v1.8.0 (MIT-Lizenz im Quelltext).
- `sync-server/local.js`, `sync-server/sqlite-storage.js`: lokaler Server und dauerhafter SQLite-Speicher.
- `sync-server/worker.js`, `sync-server/wrangler.jsonc`: gemeinsames Protokoll und optionaler Cloudflare-Adapter.
- `styles.css`, `src/layout.js`, `src/navigation.js`: Responsive Gestaltung, gemeinsame Layout-Erkennung und mobile App-Navigation.
- `src/calculation-explanation.js`: Persönliche Rechenschritte aus derselben Berechnung wie die Übersicht.
- `manifest.webmanifest`, `sw.js`, `src/pwa.js`, `icons/`: Installation, Offline-App-Dateien und bewusste Updates.
- `tests/`: insgesamt **147 Tests** für Berechnung, Kalender, Wochenrückblick, Symptomfilter, Offline-Katalog, selektives Teilen, Kontakte, Wehenzeiten, serverlosen Import und Wiederherstellung, persönliche Erklärung, App-Layout, PWA, Journal, Migration, Messwerte, CSV, Masterrechte, Wiederholung, Konflikte, Verschlüsselung, QR und Datenerhalt.
- `scripts/build.js`: Erstellt die statische Auslieferung samt versioniertem Service Worker in `dist/`. `node scripts/generate-icons.js` erzeugt die mitgelieferten PNG-Icons neu.

Die Informationen ersetzen keine individuelle Betreuung. Quellen und redaktioneller Stand sind in der App und in AgDR-0004 dokumentiert. Der Prüfstatus einschließlich verbleibender Prüflücken steht in AgDR-0005.
