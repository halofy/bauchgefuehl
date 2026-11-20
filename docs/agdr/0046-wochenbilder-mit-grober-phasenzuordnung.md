# AgDR-0046: Wochenbilder mit grober Phasenzuordnung

- **Status:** Bildstaffelung abgelöst durch [AgDR-0047](0047-eigenes-motiv-je-schwangerschaftswoche.md)
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer wählt die gelieferten Motive als Wochenbilder mit grober Phasenzuordnung. Der Agent wählt Motive, Wochenbereiche und Dateiformat.
- **Betroffene Dateien:** [Bildauswahl](../../src/development-art.js), [Wochenreise](../../src/companion-ui.js), [Bildnachweise](../assets/development-stages.json), [Build](../../scripts/build.js), [Service Worker](../../sw.js)
- **Ersetzt / ergänzt:** Löst die SVG-Reihe in der Wochenreise ab der 3. SSW ab. [AgDR-0043](0043-svg-entwicklungsillustrationen-nach-vorlagen.md), [AgDR-0045](0045-sanftere-fruehe-svg-uebergaenge.md)

## Kontext und Herkunft

Der Nutzer stellt 42 nummerierte PNGs in `embryo-stadien-png/` bereit und weist darauf hin, dass ein Bildstadium keiner einzelnen SSW entspricht. Die Lieferung enthält keine belegte Zuordnung zu Schwangerschaftswochen. Die Dateinummer bezeichnet die Position in der gelieferten Reihe.

## Entscheidung

Die Wochenreise zeigt ein Motiv pro Bildphase und nennt den ungefähr zugeordneten Bereich direkt unter dem Bild. Zum Beispiel teilen sich die 9. und 10. SSW das Motiv 07. Die Auswahl berücksichtigt grobe Entwicklungsabschnitte und erkennbare Unterschiede zwischen den Motiven. Die ersten beiden SSW zeigen die vorhandenen symbolischen SVGs. Der Überblick verwendet weiterhin die SVG-Reihe. Die ausgewählte SSW bestimmt separat die Größenorientierung zum Wochenbeginn. [Bildauswahl](../../src/development-art.js), [Zuordnung aller zwölf Motive](../assets/development-stages.json)

Der Build liefert zwölf transparente WebP-Dateien mit je 640 × 640 Pixeln aus. Diese füllen insgesamt rund 1,3 MiB und sind nach dem ersten vollständigen Laden der PWA offline verfügbar. Die gelieferten PNGs bleiben als Originale im Projekt. [Offline-Manifest](../../sw.js), [Bildnachweise](../assets/development-stages.json)

## Erwogene Alternativen

Eine durchgehende Zuordnung anhand der Dateinummern würde eine zeitliche Genauigkeit nahelegen, die die Lieferung nicht belegt. Eine Abwechslung mehrerer Bilder je Woche würde den Bildwechsel schwerer nachvollziehbar machen und den Offline-Download vergrößern.

## Folgen und Grenzen

Die Bildbereiche sind redaktionelle Zuordnungen und dienen als schematische Illustration. Eine abgebildete Haltung ist ein Beispiel. Diagnostische Einordnung, SSW-Berechnung und persönliche Messwerte verwenden eigene Datenpfade. Auch die Carnegie-Stadien folgen morphologischen Kriterien und haben eine eigene Zählung. [Carnegie-Monografie](https://publicationsonline.carnegiescience.edu/publications_online/developmental_stages.pdf)

## Verifikation

- `npm test` mit 237 Tests und `npm run build` erfolgreich. Die Prüfungen decken die Wochenbereiche, die symbolischen SVGs am Anfang und den Offline-Cache unter einem GitHub-Pages-Unterpfad ab. Die Prüfsummen der zwölf Motive im Build stimmen mit den Bildnachweisen überein.
- Safari am Rechner bei 390 CSS-Pixeln. Die Wochen 10, 11, 19 und 42 zeigten die vorgesehenen Bildbereiche und Alternativtexte. Ein Nutzertest und die Prüfung auf einem physischen Smartphone stehen aus.

## Quellen

- Originale und Prüfsummen. [Bildnachweise](../assets/development-stages.json)
- Redaktionell geprüft am 20.11.2026. Die veröffentlichten Entwicklungsabschnitte liefern Hintergrund für die grobe Gruppierung. Die Auswahl konkreter Motive ist eine redaktionelle Entscheidung. [Österreichisches Gesundheitsportal zur Entwicklung des Kindes](https://www.gesundheit.gv.at/leben/eltern/schwangerschaft/info/entwicklung-embryo.html), [BIÖG zur 5. bis 8. SSW](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/5-bis-8-schwangerschaftswoche/)
