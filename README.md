# bauchgefühl

Ein kleiner, deutschsprachiger Schwangerschaftsbegleiter als statische Webapp, optional mit lokalem Sync-Dienst. Ohne Anmeldung, externe Schriften oder Tracking. Für Desktop und Smartphone gestaltet.

## Funktionen

- **Wählbare SSW-Methode:** aus Periodenbeginn und eigener durchschnittlicher Zykluslänge oder Rückrechnung vom ET auf 28-Tage-Basis, mit Wochen, Tagen und transparenter Erklärung.
- Je nach Methode berechneter oder eingetragener ET, Trimester und Fortschritt.
- Wochenreise für die **1. bis 42. SSW** mit Entwicklungsinfos, körperlichen Veränderungen und kleinen Impulsen.
- Vorsorgethemen für Deutschland mit exakten Wochenfenstern, Quellen und lokalen Merkhäkchen.
- **Persönliches Journal:** datierte Notizen, auswählbare und eigene Symptome, freie Tags sowie Gewicht, Bauch-/Brust-/Hüftumfang, Temperatur und eigene Messgrößen mit Einheit.
- Einträge bearbeiten, archivieren und wiederherstellen; Suche und Filter nach Tag oder Zeitraum, Messwertverlauf mit Tabelle sowie CSV-Export der gefilterten Einträge.
- Lokale Speicherung mit verständlichen Hinweisen bei gesperrtem Browser-Speicher; Löschen der eigenen Daten.
- Teilen-Link als Kopie der Berechnungsgrundlage. Empfangene Daten werden zunächst nur angezeigt und können ausdrücklich lokal übernommen werden.
- Klar markierte Beispieldaten, bis eigene Angaben eingetragen sind.
- **Master und mitlesendes Gerät:** QR-Kopplung, automatische verschlüsselte Übertragung von Basisdaten, Journal und Merkhäkchen, Offline-Ausgang und Versionsprüfung gegen versehentliches Überschreiben.
- Lokale Sicherungsstände, dauerhafte SQLite-Datei des lokalen Dienstes und herunterladbare Master-Backups mit Wiederherstellung.

## Lokal starten

**Mit automatischem Geräte-Sync:**

```sh
./start-local.command
```

Dann **http://127.0.0.1:4173** öffnen. Der Starter baut die App und startet den lokalen Dienst mit dauerhaftem Speicher in `.local-sync/`. Er verwendet eine vorhandene Node-Laufzeit ab 22.13 oder auf diesem Mac die Node-Laufzeit der ChatGPT-App. Bei regulärem Node/npm geht alternativ `npm run start:local`.

In der App **Geräte & Backup → Dieses Gerät als Master einrichten** wählen. Die Adresse ist vorausgefüllt; den Einrichtungsschlüssel aus **`.local-sync/admin-token`** kopieren. Danach eine Master-Sicherung herunterladen und den Geräte-Link in einem **anderen Browser oder privaten Browserfenster** öffnen und bestätigen. Für ein Smartphone im WLAN ist eine erreichbare HTTPS-Adresse nötig.

Ausführliche Anleitung für Start, HTTPS im WLAN, Sicherungen und Wiederherstellung: **[Lokaler Sync-Dienst](sync-server/README.md)**.

**Nur die statische App, ohne laufenden Sync-Dienst:**

Python 3 genügt für die App:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Anschließend `http://localhost:4173` öffnen. Wegen der JavaScript-Module bitte über einen Webserver starten, nicht durch Doppelklick auf `index.html`.

Mit Node.js ab Version 22.13 können Tests und Build ausgeführt werden. Es gibt **keine npm-Abhängigkeiten** und keinen Installationsschritt. Die QR-Bibliothek wird lokal mitgeliefert:

```sh
npm test
npm run build
```

`dist/` enthält die vollständige statische Website. Alle lokalen Ressourcen werden relativ eingebunden; dadurch funktioniert der GitHub-Pages-Projektpfad `/bauchgefuehl/` ohne Konfiguration.

## Eigene Informationen erfassen

Nach dem Speichern deiner Basisdaten **Journal → Eintrag hinzufügen** öffnen. Datum, optionale Uhrzeit, Symptome, Notiz, Tags und Messwerte lassen sich kombinieren oder einzeln erfassen. Symptome und Tags mit Kommas trennen. Messwerte akzeptieren Dezimalkomma oder Punkt; unter **Weitere oder eigene Messgröße** sind Bezeichnung und Einheit frei wählbar.

Im Journal kannst du suchen und nach Tag und Zeitraum filtern. Der Verlauf und die aufklappbare Tabelle folgen diesen Filtern. Unterschiedliche Einheiten bleiben getrennte Messreihen. Die angezeigte SSW folgt deiner aktuellen Berechnungsgrundlage; Messwerte werden nicht medizinisch bewertet.

**Archivieren** blendet einen Eintrag aus. Über **Archivierte anzeigen → Wiederherstellen** kommt er zurück. CSV exportiert die aktuell gefilterten Einträge; ein vollständiges JSON-Backup inklusive Journal gibt es unter **Geräte & Backup**. Der einfache Reise-Link enthält weiterhin nur die Berechnungsgrundlage. Bereits gekoppelte Mitleser erhalten auch Journaleinträge; Änderungen erfolgen am Master.

Für die Journal-Version den lokalen Dienst mit `./start-local.command` neu starten und die App auf beiden Clients neu laden. Den bestehenden `.local-sync/`-Ordner beibehalten. Alte Profile und Serverstände bleiben lesbar; ein altes App-Format darf einen bereits aktualisierten Serverstand nicht überschreiben.

Unterstützt werden bis zu 1.000 Einträge und insgesamt ungefähr 512 KiB pro Datenstand; vorher kann der Browser-Speicher voll sein. Ein Speicherversuch bricht dann mit einem Hinweis ab, ohne vorhandene Einträge zu kürzen. Der lokale Sicherungsverlauf ist auf 20 Stände und ungefähr 2 MiB begrenzt. Backups deshalb zusätzlich aufbewahren.

## Auf GitHub Pages veröffentlichen

Ziel ist das Repository [halofy/bauchgefuehl](https://github.com/halofy/bauchgefuehl). Die erwartete öffentliche Adresse lautet [https://halofy.github.io/bauchgefuehl/](https://halofy.github.io/bauchgefuehl/); sie ist erst nach erfolgreichem Deployment erreichbar.

1. Die Projektdateien inklusive `.github/workflows/pages.yml` in das Ziel-Repository auf den Branch `main` pushen.
2. Im [Ziel-Repository unter Settings → Pages](https://github.com/halofy/bauchgefuehl/settings/pages) bei **Build and deployment → Source → GitHub Actions** auswählen.
3. Unter **Actions → GitHub Pages → Run workflow** den Workflow starten, sofern der Push ihn nicht schon ausgeführt hat.
4. Nach erfolgreichem Lauf steht die Adresse in der Deployment-Umgebung `github-pages` und unter Settings → Pages.

Der Workflow führt die Tests aus, erstellt `dist/` und veröffentlicht das Pages-Artefakt. Falls dein Hauptbranch anders heißt, ändere `branches: [main]` in der Workflow-Datei. GitHub Pages muss für das Repository verfügbar sein und GitHub Actions aktiviert sein.

Alternativ können `index.html`, `styles.css`, `favicon.svg`, `.nojekyll` und `src/` direkt über „Deploy from a branch“ aus dem Repository-Stamm veröffentlicht werden. Es gibt keine Server-Routen und keine Secrets.

Offizielle Anleitung: [GitHub Pages mit eigenem Workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Entscheidungen und technische Dokumentation

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

Künftige wesentliche Entscheidungen werden mit dem [Template](docs/agdr/_template.md) fortgeschrieben. [AGENTS.md](AGENTS.md) hält diese Projektkonvention auch für weitere Agentenarbeit fest.

Die SSW wird je nach gewählter Methode aus Periode und Zyklus geschätzt oder vom eingetragenen ET zurückgerechnet. Die App bestätigt keine medizinische Datierung. Geteilte Links sind nicht verschlüsselt: Alle mit dem Link können die ausgewählte Methode und ihre Basisdaten lesen. Die App erklärt das vor dem Kopieren und überschreibt beim Öffnen eines Links keine lokalen Daten. Vorhandene Daten und v1-Links bleiben als Periodenmethode lesbar.

Der separate **Geräte-Link** gewährt laufende Leserechte auf den verschlüsselten Masterraum; er enthält keinen Schreibschlüssel. Nur der Master bearbeitet Angaben. Lokal trennen widerruft bereits weitergegebene Geräte-Links nicht. Versionierung und lokale Sicherungen schützen gegen typische Sync-Fehler, ersetzen aber kein sicher aufbewahrtes Master-Backup und keine Sicherung des Server-Datenordners.

## Dateien

- `src/dates.js`, `src/pregnancy.js`: Datumsarithmetik, Berechnung, Validierung, Teilen-Format und Speicher.
- `src/journal.js`, `src/journal-ui.js`: Journaleinträge, Messreihen, Filter, CSV und Erfassungsdialog.
- `src/content.js`: Wocheninfos und Vorsorgethemen mit Quellen.
- `src/app.js`: Oberfläche und Interaktionen.
- `src/sync.js`, `src/sync-ui.js`: Verschlüsselung, Geräteverbindung und Wiederherstellung.
- `src/qr.js`, `src/vendor/qrcodegen.js`: vollständig lokale QR-Erzeugung mit Nayuki v1.8.0 (MIT-Lizenz im Quelltext).
- `sync-server/local.js`, `sync-server/sqlite-storage.js`: lokaler Server und dauerhafter SQLite-Speicher.
- `sync-server/worker.js`, `sync-server/wrangler.jsonc`: gemeinsames Protokoll und optionaler Cloudflare-Adapter.
- `styles.css`: Responsive Gestaltung.
- `tests/pregnancy.test.js`, `tests/journal.test.js`, `tests/sync.test.js`, `tests/sqlite-storage.test.js`, `tests/qr.test.js`: insgesamt **69 Tests** für Berechnung, Journal, Migration, Messwerte, CSV, Masterrechte, Wiederholung, Konflikte, Verschlüsselung, QR und Datenerhalt.
- `scripts/build.js`: Erstellt die statische Auslieferung in `dist/`.

Die Informationen ersetzen keine individuelle Betreuung. Quellen und redaktioneller Stand sind in der App und in AgDR-0004 dokumentiert. Der Prüfstatus einschließlich verbleibender Prüflücken steht in AgDR-0005.
