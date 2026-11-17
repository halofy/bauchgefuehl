# bauchgefühl

Ein kleiner, deutschsprachiger Schwangerschaftsbegleiter als statische Webapp. Ohne Backend, Anmeldung, externe Schriften oder Tracking. Für Desktop und Smartphone gestaltet.

## Funktionen

- **Wählbare SSW-Methode:** aus Periodenbeginn und eigener durchschnittlicher Zykluslänge oder Rückrechnung vom ET auf 28-Tage-Basis, mit Wochen, Tagen und transparenter Erklärung.
- Je nach Methode berechneter oder eingetragener ET, Trimester und Fortschritt.
- Wochenreise für die **1. bis 42. SSW** mit Entwicklungsinfos, körperlichen Veränderungen und kleinen Impulsen.
- Vorsorgethemen für Deutschland mit exakten Wochenfenstern, Quellen und lokalen Merkhäkchen.
- Lokale Speicherung mit verständlichen Hinweisen bei gesperrtem Browser-Speicher; Löschen der eigenen Daten.
- Teilen-Link als Kopie der Berechnungsgrundlage. Empfangene Daten werden zunächst nur angezeigt und können ausdrücklich lokal übernommen werden.
- Klar markierte Beispieldaten, bis eigene Angaben eingetragen sind.

## Lokal starten

Python 3 genügt für die App:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Anschließend `http://localhost:4173` öffnen. Wegen der JavaScript-Module bitte über einen Webserver starten, nicht durch Doppelklick auf `index.html`.

Mit Node.js ab Version 22 können Tests und Build ausgeführt werden. Es gibt **keine npm-Abhängigkeiten** und keinen Installationsschritt:

```sh
npm test
npm run build
```

`dist/` enthält die vollständige statische Website. Alle lokalen Ressourcen werden relativ eingebunden; dadurch funktioniert der GitHub-Pages-Projektpfad `/bauchgefuehl/` ohne Konfiguration.

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

Künftige wesentliche Entscheidungen werden mit dem [Template](docs/agdr/_template.md) fortgeschrieben. [AGENTS.md](AGENTS.md) hält diese Projektkonvention auch für weitere Agentenarbeit fest.

Die SSW wird je nach gewählter Methode aus Periode und Zyklus geschätzt oder vom eingetragenen ET zurückgerechnet. Die App bestätigt keine medizinische Datierung. Geteilte Links sind nicht verschlüsselt: Alle mit dem Link können die ausgewählte Methode und ihre Basisdaten lesen. Die App erklärt das vor dem Kopieren und überschreibt beim Öffnen eines Links keine lokalen Daten. Vorhandene Daten und v1-Links bleiben als Periodenmethode lesbar.

## Dateien

- `src/pregnancy.js`: Datumsarithmetik, Berechnung, Validierung, Teilen-Format und Speicher.
- `src/content.js`: Wocheninfos und Vorsorgethemen mit Quellen.
- `src/app.js`: Oberfläche und Interaktionen.
- `styles.css`: Responsive Gestaltung.
- `tests/pregnancy.test.js`: 28 Tests für beide Methoden, Grenzen, Zeitzonen, Speicherung, Migration und Teilen.
- `scripts/build.js`: Erstellt die statische Auslieferung in `dist/`.

Die Informationen ersetzen keine individuelle Betreuung. Quellen und redaktioneller Stand sind in der App und in AgDR-0004 dokumentiert. Der Prüfstatus einschließlich verbleibender Prüflücken steht in AgDR-0005.
