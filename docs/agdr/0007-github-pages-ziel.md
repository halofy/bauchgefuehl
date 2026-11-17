# AgDR-0007: Konkretes GitHub-Pages-Ziel

- **Status:** Umgesetzt, Veröffentlichung offen
- **Teilweise abgelöst durch:** [AgDR-0010](0010-mobile-app-und-pwa.md) – auch bei Branch-Veröffentlichung den vollständigen Build ausliefern, nicht den Quellverzeichnis-Stamm.
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzer für das Repository; Agent für den bestehenden Pages-Veröffentlichungsweg
- **Betroffene Dateien:** [README](../../README.md), [Pages-Workflow](../../.github/workflows/pages.yml), [AgDR-Index](README.md)
- **Ergänzt:** [AgDR-0001](0001-statische-webapp.md)

## Kontext und Herkunft

Der Nutzer hat ausdrücklich `https://github.com/halofy/bauchgefuehl` als Hostingziel genannt. Die Annahme des Agenten ist, dass die App als GitHub-Pages-Projektseite unter der standardmäßigen Adresse `https://halofy.github.io/bauchgefuehl/` veröffentlicht werden soll. Eine eigene Domain wurde nicht vorgegeben.

## Entscheidung

Der bestehende Workflow baut die statische App bei Pushes auf `main` und veröffentlicht das Artefakt über GitHub Actions. Die README nennt das Ziel, die erwartete Adresse und die erforderliche Pages-Einstellung. Relative Ressourcenpfade unterstützen den Projektpfad. Die Statusangabe beschreibt die lokale Vorbereitung und keine erfolgte Veröffentlichung oder nachträgliche Nutzerfreigabe.

## Erwogene Alternativen

- **Andere Hosting-Plattform oder eigene Domain:** Für das angegebene Repository nicht erforderlich und nicht beauftragt.
- **Direkt aus einem Branch veröffentlichen:** Bleibt laut README möglich; der vorhandene Actions-Workflow prüft und baut die App vor dem Deployment.

## Folgen und Grenzen

Ein Push nach `main`, aktivierte GitHub Actions und die Pages-Quelle „GitHub Actions“ sind für das Deployment erforderlich. Die erwartete Adresse ist keine Bestätigung, dass die Seite bereits verfügbar ist. Die optionale Geräte-Synchronisierung erfordert einen separat betriebenen Dienst; der Pages-Workflow veröffentlicht nur die statische Website.

## Verifikation

- Am 17.11.2026 zeigte die öffentlich erreichbare Repository-Seite ein leeres Repository; die verfügbare Browser-Sitzung war nicht bei GitHub angemeldet.
- Der vorhandene Workflow und die relativen Ressourcenpfade wurden geprüft. Ein Push, die Pages-Einstellung und ein tatsächlicher Deploymentlauf konnten nicht verifiziert werden. Im Arbeitsverzeichnis war kein Git-Repository vorhanden; das verfügbare Git scheiterte an fehlenden Apple Command Line Tools. Node.js und npm waren in der Umgebung nicht verfügbar, daher wurden Build und Tests in diesem Schritt nicht erneut ausgeführt.

## Quellen

- [Ziel-Repository](https://github.com/halofy/bauchgefuehl).
- [GitHub: Eigene Workflows für Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [AgDR-0001: Statische Webapp für GitHub Pages](0001-statische-webapp.md).
