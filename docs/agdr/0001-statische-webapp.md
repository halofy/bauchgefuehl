# AgDR-0001: Statische Webapp für GitHub Pages

- **Status:** Umgesetzt
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Agent; Hostingziel ausdrücklich vom Nutzer vorgegeben
- **Betroffene Dateien:** [index.html](../../index.html), [package.json](../../package.json), [Build](../../scripts/build.js), [Pages-Workflow](../../.github/workflows/pages.yml)

## Kontext und Herkunft

Der Nutzer möchte eine kleine Webapp, die auf GitHub Pages gehostet werden kann. Das Arbeitsverzeichnis war leer. Benötigt werden Berechnung, Informationsanzeige, lokaler Speicher und Links zum Teilen. Keine dieser Funktionen benötigt einen Anwendungsserver.

## Entscheidung

Die App besteht aus HTML, CSS und nativen JavaScript-Modulen. Sie benötigt keine npm-Pakete zur Laufzeit oder für den Build. `npm run build` kopiert ausschließlich die Website-Ressourcen nach `dist/`; Node.js ab Version 22 wird für Build und Tests verwendet. Die Anwendung selbst läuft vollständig im Browser.

Alle lokalen URLs sind relativ. Damit funktioniert eine Projektseite unter `/repository/` ebenso wie die Domainwurzel. `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung bei direkter Branch-Veröffentlichung.

Ein GitHub-Actions-Workflow prüft und baut auf `main` und veröffentlicht das Pages-Artefakt. Die eigentliche Veröffentlichung muss im gewünschten GitHub-Repository aktiviert werden. Es wurde kein externes Repository angelegt und kein Deployment ausgeführt; beauftragt war eine App, die dort gehostet werden kann.

## Erwogene Alternativen

- **React oder ein vergleichbares Framework:** Für diese wenigen Ansichten und browserlokalen Interaktionen entsteht kein notwendiger Mehrwert gegenüber zusätzlichen Build- und Paketabhängigkeiten.
- **Backend oder Cloud-Speicher:** Für die beauftragten Funktionen nicht erforderlich; würde Betrieb und Umgang mit Gesundheitsdaten erweitern.
- **Veröffentlichung über Sites-Hosting:** Das konkrete Hostingziel ist GitHub Pages. Der Sites-Skill wurde als Entwicklungsleitfaden gelesen; seine externe Registrierung und Veröffentlichung wurden deshalb nicht verwendet.

## Folgen und Grenzen

Die App lässt sich kostengünstig als statische Website betreiben. Es gibt keine Secrets, Datenbankmigrationen oder Server-Routen. Die direkte Nutzung per `file://` wird wegen der Modulimporte nicht unterstützt: Auch lokal ist ein HTTP-Server nötig.

Die GitHub-Pages-Veröffentlichung setzt passende Repository-Einstellungen, aktivierte Actions und einen verfügbaren Pages-Tarif voraus. Ein anderer Hauptbranch muss im Workflow angepasst werden. Ein tatsächlicher GitHub-Deploymentlauf ist noch nicht nachgewiesen.

Das inzwischen konkret benannte Repository und der Veröffentlichungsstatus stehen in [AgDR-0007](0007-github-pages-ziel.md).

## Verifikation

- Der statische Build wurde erfolgreich ausgeführt.
- `index.html`, CSS, Favicon und alle drei JavaScript-Module wurden über den lokalen HTTP-Server mit Status 200 und passenden Inhaltstypen abgerufen.
- Die native Chrome-Vorschau hat die gebaute Website erfolgreich geladen.
- Die HTML-IDs wurden auf Duplikate geprüft.
- Relative Ressourcenpfade wurden am Paket geprüft; ein echtes Deployment unter einem GitHub-Projektpfad wurde nicht ausgeführt.

## Quellen

- [GitHub: Eigene Workflows für Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- Verwandt: [AgDR-0003: Lokale Daten und Teilen](0003-lokale-daten-und-teilen.md).
