# AgDR-0010: Mobile App-Navigation und installierbare PWA

- **Status:** Umgesetzt, lokale Browserprüfung; physische Installation offen
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzeranforderung; Agent für Navigation, Cache und Update-Verhalten innerhalb des beauftragten Umfangs
- **Betroffene Dateien:** [HTML](../../index.html), [Gestaltung](../../styles.css), [Navigation](../../src/navigation.js), [PWA-Oberfläche](../../src/pwa.js), [Journal](../../src/journal-ui.js), [Manifest](../../manifest.webmanifest), [Service Worker](../../sw.js), [Build](../../scripts/build.js), [Icons](../../scripts/generate-icons.js), [lokaler Server](../../sync-server/local.js), [PWA-Tests](../../tests/pwa.test.js), [README](../../README.md)
- **Ersetzt teilweise:** [AgDR-0001](0001-statische-webapp.md) hinsichtlich des reinen Kopier-Builds; [AgDR-0005](0005-bedienung-und-verifikation.md) hinsichtlich der mobilen fortlaufenden Seitenstruktur; [AgDR-0007](0007-github-pages-ziel.md) hinsichtlich Veröffentlichung direkt aus dem Quellverzeichnis.

## Kontext und Herkunft

**Fortschreibung vom 18.11.2026:** [AgDR-0021](0021-uebersichtliche-hauptbereiche.md) ersetzt die fortlaufende Desktopseite durch einen sichtbaren Hauptbereich. Mobile Navigation und PWA bleiben erhalten. Der aktive Serverbetrieb ist inzwischen durch [AgDR-0020](0020-serverloser-geraeteabgleich.md) abgelöst.

**Fortschreibung vom 17.11.2026:** [AgDR-0013](0013-app-layout-erkennung.md) ersetzt die bisherige alleinige 760-Pixel-Grenze durch eine gemeinsame Erkennung für schmale Ansichten, breitere Touch-Geräte und installierte PWAs. Die übrige PWA- und Navigationsentscheidung bleibt bestehen. Die folgenden Angaben und Prüfnachweise dokumentieren die Erstimplementierung.

Der Nutzer verlangt ausdrücklich, dass sich die Webapp stärker wie eine App anfühlt, mobile first ist und als PWA installiert werden kann. Er hat anschließend beauftragt, die App-Optimierung fortzusetzen. Die konkrete Aufteilung in fünf Bereiche, die Bildschirmgrenze von 760 Pixeln, einklappbare Journalwerkzeuge und die Cache-Strategie sind Agentenentscheidungen. „Umgesetzt“ beschreibt diese Implementierung und behauptet keine gesonderte Nutzerfreigabe.

## Entscheidung

### Mobile Bedienung

Auf Smartphones erscheint jeweils ein Bereich: Überblick, Wochenreise, Journal, Vorsorge oder Wissen. Eine feste Navigation unten zeigt den aktiven Bereich und bleibt mit dem Daumen erreichbar. Bereichswechsel behalten ihre Scrollposition; Fokus und `aria-current` folgen der Auswahl. Die Navigation verändert keine URL-Fragmente, da diese bestehende Teilen- und Geräte-Links transportieren. Desktop bleibt eine fortlaufende Ansicht mit Sprungnavigation.

Die Kopfzeile wird kompakter; Touch-Ziele sind überwiegend mindestens 44 Pixel groß, Eingaben auf Smartphones mindestens 16 Pixel zur Vermeidung automatischer Formularvergrößerung. Sichere Bildschirmränder und die Home-Indikator-Fläche werden berücksichtigt. Native Dialoge erscheinen mobil als Ansichten vom unteren Rand. Einträge stehen im Journal vor dem Messwertverlauf; Filter und Verlauf sind mobil zunächst eingeklappt. Aktive Filter sind am geschlossenen Filterbereich erkennbar und lassen sich gemeinsam zurücksetzen. Desktop öffnet beide Werkzeuge zunächst. Ein Wechsel über die Bildschirmgrenze setzt diese Offen-Zustände entsprechend zurück; Filterwerte bleiben erhalten.

### Installation und Offline-Nutzung

Ein relatives Manifest mit stabiler App-Kennung, Startadresse und Scope sowie lokal erzeugten PNG-Icons unterstützt die Installation im Standalone-Modus. Reguläre und maskierbare Icons sowie ein Apple-Touch-Icon sind enthalten. Die Icons werden ohne neue Abhängigkeit aus der bestehenden Blattmarke abgeleitet. Das Info-Symbol in der Kopfzeile öffnet Installation, Online-/Offline-Anzeige, Cache-Status und Updates. Unterstützte Browser können dort ihren Installationsdialog anbieten; für Safari gibt es eine manuelle Anleitung. Es wird keine automatische Installation behauptet.

Der Build kopiert die statischen Dateien und erzeugt anschließend einen Service Worker mit vollständiger Assetliste und einem SHA-256-basierten Versionsnamen über Assets und Workerquelle. Alle URLs bleiben zum Projektpfad relativ. Produktion und Branch-Veröffentlichung verwenden den Inhalt von `dist/`; die Workerquelle im Repository hat nur eine Entwicklungskennung und ist kein Ersatz für den Produktionsbuild.

Der Worker lädt ausschließlich feste öffentliche App-Dateien vor und liefert diese aus dem zur Version gehörenden Cache aus. Nur die beiden App-Einstiegsadressen werden offline auf die gecachte HTML-Datei abgebildet. Es gibt keinen Laufzeitcache für beliebige Requests. Andere Ursprünge, Query-URLs, Nicht-GET-Requests und insbesondere Sync-Endpunkte passieren den Worker unbehandelt. Persönliche Angaben, Journal, Schlüssel und Sync-Antworten werden nicht in diesen neuen Cache geschrieben; deren bisherige Speicherung wird nicht ersetzt. Nach Aktivierung bleiben die aktuelle und höchstens eine vorherige Cacheversion desselben App-Scopes erhalten. Andere Anwendungen desselben Ursprungs werden nicht bereinigt.

Ein Update wartet auf ausdrückliche Auswahl von „Update laden“. Vor dem Reload weist eine Bestätigung auf ungespeicherte Eingaben hin. Nur das bestätigende Fenster lädt automatisch neu; andere offene Fenster werden nicht automatisch neu geladen. Das Schließen aller alten Fenster kann nach dem normalen Service-Worker-Lebenszyklus ebenfalls die wartende Version aktivieren. Noch geöffnete sehr alte Fenster über mehrere Versionswechsel hinweg sind nicht als dauerhafte Offline-Versionierung abgesichert.

## Erwogene Alternativen

- **Nur ein Manifest ergänzen:** Würde die lange mobile Seite und die Offline-Nutzung nicht verbessern.
- **Native App oder neues Framework:** Für die verlangte Bedienung und Installation ist kein neuer Store-, Server- oder Paketbetrieb nötig.
- **Jeden Netzwerkaufruf cachen:** Würde persönliche Antworten und veraltete Sync-Stände unnötig in einen weiteren Speicherpfad aufnehmen.
- **Updates sofort mit Reload aktivieren:** Könnte offene Formulare unterbrechen.
- **Unbegrenzt alte Cacheversionen behalten:** Würde den begrenzten Browser-Speicher bei jeder Veröffentlichung weiter belegen.

## Folgen und Grenzen

Die App bleibt statisch und GitHub-Pages-kompatibel. Installation und Service Worker benötigen HTTPS oder eine vertrauenswürdige Loopback-Adresse. Nach dem ersten vollständigen Laden funktionieren App und lokal gespeicherte Inhalte offline; Geräte-Sync benötigt seinen Dienst, externe Quellen benötigen Internet. Online-Anzeigen beruhen auf dem Browserstatus und beweisen keine Erreichbarkeit des Sync-Dienstes.

Installationsoptionen unterscheiden sich je nach Browser und Betriebssystem. Safari und installierte App können getrennte Datenspeicher verwenden; deshalb weist die App auf Prüfung und gegebenenfalls Geräte-Kopplung/Backup hin. Die Offline-Kopie ist keine Datensicherung. Entfernte Browserdaten, privater Modus, Speicherbereinigung und Browserlimits können Offline-Dateien und lokale Daten entfernen.

## Verifikation

Am 17.11.2026 tatsächlich durchgeführt, ausschließlich mit synthetischen Angaben:

- Alle **78 automatisierten Tests bestanden**, darunter vier neue Tests für vorhandene Cache-Dateien, Manifest-/PNG-Abmessungen, GitHub-Pages-Unterpfad, Offline-Requests, Cache-Ausschlüsse, bewusstes Aktivieren und begrenzte Cachebereinigung.
- Statischer Build erfolgreich. `npm` ist nicht im PATH verfügbar; ausgeführt wurden die in `package.json` definierten Skriptziele direkt mit der vorhandenen Node-Laufzeit v24.22.1: `node --test tests/*.test.js` und `node scripts/build.js`.
- Automatisierter lokaler Chrome-Ablauf unter `/bauchgefuehl/`: Service-Worker-Installation, mobile Bereichswechsel, feste untere Navigation, Profil speichern, persönliche Erklärung öffnen, Journaleintrag mit Messwert erfassen, suchen/zurücksetzen, Verlauf öffnen. Kein horizontaler Überlauf bei 320, 390, 760, 1024 und 1440 Pixeln im Überblick.
- Offline-Neustart mit erhaltenem synthetischem Profil und Journaleintrag bestanden. Testupdate wurde wartend erkannt, eine offene Suche blieb erhalten, ausdrückliche Updatebestätigung führte zum Reload und der gespeicherte Eintrag blieb vorhanden. Keine JavaScript-Laufzeitfehler in diesem Ablauf.
- Mobile Übersicht anhand eines Chrome-Screenshots visuell geprüft. Dabei den Einfluss des Header-Backdrop-Filters auf die feste Navigation erkannt und korrigiert; anschließend Position der Navigation am unteren Viewportrand geprüft.

Offen bleiben Installation auf physischen iOS-/Android-Geräten, Safari-/Firefox-Matrix, vollständiger Screenreader-/Tastatur-Audit, Verhalten der Bildschirmtastatur und echter GitHub-Pages-Deploymentlauf. Ein initial fehlendes Playwright-Chromium wurde durch das bereits installierte Google Chrome ersetzt; es wurden keine Browserpakete installiert. Chrome meldet die schon vorhandene IPv6-Quelle der CSP als ungültig; IPv6-Sync wurde in dieser Änderung nicht geprüft.

## Quellen

- [Manifest](../../manifest.webmanifest), [Worker](../../sw.js), [PWA-Tests](../../tests/pwa.test.js), [Betrieb](../../README.md).
- Diese Entscheidung ändert keine medizinische Berechnung oder medizinischen Inhalte. Die individuelle Rechenerklärung dokumentiert [AgDR-0011](0011-persoenliche-berechnungserklaerung.md).
