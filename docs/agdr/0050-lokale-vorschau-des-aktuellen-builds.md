# AgDR-0050: Lokale Vorschau des aktuellen Builds

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer meldet, dass die neuen Bilder im lokalen Überblick fehlen. Der Agent führt einen Vorschaupfad auf demselben lokalen Host ein.
- **Betroffene Dateien:** [Dev-Server](../../scripts/dev-server.py), [PWA-Einrichtung](../../src/pwa.js), [Überblick](../../src/app.js), [Startanleitung](../../README.md)
- **Ersetzt / ergänzt:** Ergänzt die lokale Startanleitung und die Bildanzeige aus [AgDR-0048](0048-wochenmotive-im-ueberblick.md) und [AgDR-0049](0049-aquarellmotive-fuer-die-ersten-beiden-wochen.md).

## Kontext und Herkunft

Der laufende lokale Server hatte bereits die neuen Bilddateien. Der Service Worker am bisherigen Einstieg kann trotzdem weiterhin den vorherigen Build aus seinem Cache liefern, bis das Update ausdrücklich übernommen wird. Bei persönlichen Angaben kann der Überblick bei fehlender Kontrolle durch den Service Worker außerdem ein SVG zeigen. Welche dieser Bedingungen im Browser des Nutzers vorlag, wurde nicht direkt geprüft.

## Entscheidung

Der Dev-Server liefert `dist/` unter `/` und `/vorschau/` aus. Der zweite Pfad bleibt auf demselben Host und verwendet denselben lokalen Datenspeicher. Seine URLs liegen außerhalb der Ressourcenliste des Root-Service-Workers. Der Vorschaupfad registriert keinen eigenen Worker. Der Browser lädt die aktuellen Dateien vom lokalen Server und der Überblick zeigt das passende Wochenmotiv sofort. [Server](../../scripts/dev-server.py), [PWA-Einrichtung](../../src/pwa.js)

## Erwogene Alternativen

Ein anderer Host oder Port würde eine getrennte Browser-Datenhaltung erzeugen. Den Root-Cache zu löschen oder Updates automatisch zu übernehmen würde den bewussten Aktualisierungsablauf der PWA umgehen.

## Folgen und Grenzen

Die Vorschau braucht den lokalen Dev-Server. Für Offline-Prüfungen und Installation bleibt die PWA unter `/` erreichbar. GitHub Pages erhält die statische PWA mit dem bisherigen Offline- und Update-Ablauf. Der Dev-Server bindet nur an die Loopback-Adresse und wird nicht mit veröffentlicht.

## Verifikation

- `npm test` mit 237 Tests und `npm run build` erfolgreich. Das Dev-Server-Skript ist im statischen Build nicht enthalten.
- Chromium bei 390 CSS-Pixeln mit synthetischen Angaben. Die 1. SSW erschien in der Vorschau bei einem bewusst veralteten Root-Cache. Die 2. SSW erschien bei blockiertem Service Worker. Die gespeicherten Testdaten waren an beiden Pfaden gleich. Die Root-PWA wurde weiterhin erfolgreich offline geladen.

## Quellen

- Nutzerhinweis zum lokalen Überblick und bisheriger bewusst ausgelöster Update-Ablauf. [PWA-Entscheidung](0010-mobile-app-und-pwa.md), [Lokale Startanleitung](../../README.md)
