# AgDR-0040: Bereinigung ungenutzter Dateien

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Ausdrücklicher Bereinigungsauftrag des Nutzers; Auswahl anhand tatsächlicher Referenzen durch den Agenten
- **Betroffene Dateien:** [Bildherkunft](../assets/development-series.json), [historische Prompts](../assets/development-prompts.json), [README](../../README.md), [Feature-Liste](../open.md), [Build](../../scripts/build.js)
- **Ersetzt / ergänzt:** Ersetzt die Aufbewahrung der alten PNG-Binärdateien und des ZIP-Duplikats aus [AgDR-0033](0041-entwicklungsvisualisierung.md#agdr-0033); ergänzt [AgDR-0032](0041-entwicklungsvisualisierung.md#agdr-0032) und entfernt die seit [AgDR-0020](0020-serverloser-geraeteabgleich.md) ungenutzte Oberfläche aus [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md).

## Kontext und Herkunft

Der Nutzer verlangt, nicht mehr benötigte Dateien und Bilder zu entfernen. Der Agent bestimmt die konkreten Kandidaten anhand des Importgraphen, der Bildverwendung, des Builds und der Herkunftsnachweise. Es handelt sich um eine Projektbereinigung, nicht um einen Auftrag zum Löschen persönlicher Daten oder zur Änderung der Darstellung.

## Entscheidung

- Die sieben abgelösten Bilder unter `docs/assets/retired-development/` werden entfernt. Exakte Generierungsprompts, frühere Dateinamen, Bytezahlen und SHA-256 bleiben als historischer Herkunftsnachweis erhalten.
- `embryo_aquarell_42_bilder.zip` war zu Beginn dieser Bereinigung bereits aus dem Arbeitsverzeichnis entfernt. Es wird nicht wiederhergestellt: Alle 42 extrahierten Originale sind unverändert vorhanden und wurden gegen das noch im Git-Index liegende Quellarchiv und den Herkunftsnachweis geprüft. Die Archivprüfsumme bleibt dokumentiert. Der vorhandene Git-Index wird nicht verändert.
- `src/sync-ui.js` wird entfernt. Als einziges Modul unter `src/*.js` ist es nicht vom App-Einstieg erreichbar; es enthält die nicht mehr angebotene Server-Sync-Oberfläche und wurde bisher trotzdem vom Build kopiert und offline vorgehalten.
- Alle 42 aktuellen Wochenbilder, die Bildmaske, Icons, benötigte Module, Tests und Entscheidungsrecords bleiben erhalten. Verweise auf entfernte Dateien werden transparent als historische Referenzen fortgeschrieben.
- `src/sync.js` bleibt für aktive Validierung und Wiederherstellung erhalten. `sync-server/` und der lokale Starter bleiben für die bestehende lokale Vorschau sowie den dokumentierten Zugriff auf alte SQLite-Stände erforderlich. Persönliche Sicherungen und Datenbestände werden nicht angefasst.

## Erwogene Alternativen

Alle alten Binärdateien nur für die Historie aufzubewahren verursacht unnötigen Platzbedarf; Prüfsummen und Prompts dokumentieren ihre Herkunft. Das vollständige Entfernen der alten Servermodule würde dagegen den lokalen Starter und die Wiederherstellung vorhandener Altstände beeinträchtigen und gehört nicht zur Entfernung tatsächlich ungenutzter Dateien. Eine Bildkonvertierung würde die aktuellen Originale verändern und wird hier nicht vorgenommen.

## Folgen und Grenzen

Die acht in diesem Schritt entfernten Dateien belegen zusammen **7.425.524 Byte**. Mit dem bereits entfernten ZIP sind es **75.433.895 Byte, rund 71,94 MiB**, weniger im Arbeitsverzeichnis gegenüber dem Stand mit allen Altdateien. Das ZIP und die alten Dokumentationsbilder waren nicht Teil der statischen Auslieferung; deren Download verkleinert sich nur um das entfernte UI-Modul. Aktuelle Bildqualität, Offline-Verfügbarkeit, Datenformate und Berechnung bleiben unverändert. Bereits installierte PWAs übernehmen den neu gebauten Stand über den bestehenden bewussten Update-Weg.

## Verifikation

- Alle 42 Original-PNGs vor der Bereinigung anhand dokumentierter Bytezahlen und SHA-256 geprüft und bytegleich mit dem Quellarchiv im unveränderten Git-Index verglichen.
- `npm test`: **220 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Bestehende Sicherungs-, Altstand-, Geräteabgleich- und Offline-Tests bleiben erfolgreich.
- `npm run build` erfolgreich. Anschließend **90 Offline-Dateien** geprüft: alle bytegleich zur Quelle, einschließlich genau 42 aktueller Wochenbilder; kein altes UI-Modul, ZIP oder historisches Bild im Build.
- Alle lokalen Markdown-Dateilinks in README, Feature-Liste und AgDRs auf vorhandene Ziele geprüft; `git diff --check` ohne Fehler.
- Keine neue visuelle Geräteprüfung: Darstellung und aktuelle Bilddateien wurden nicht verändert. Kein Commit, Push oder Deployment.

## Quellen

- [Bildherkunft und Originalprüfsummen](../assets/development-series.json), [historische Prompts und Prüfsummen](../assets/development-prompts.json).
- [App-Einstieg](../../src/app.js), [Build-Kopierregeln](../../scripts/build.js), [historischer Betriebs- und Wiederherstellungsweg](../../sync-server/README.md).
