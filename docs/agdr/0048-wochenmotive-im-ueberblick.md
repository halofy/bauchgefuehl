# AgDR-0048: Wochenmotive im Überblick

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer wünscht die Wochenmotive auch im Überblick. Der Agent übernimmt den gemeinsamen Renderer und passt die Einbettung an die grüne Karte an.
- **Betroffene Dateien:** [Überblick](../../src/app.js), [Gemeinsame Bilddarstellung](../../src/development-art.js), [Wochenreise](../../src/companion-ui.js), [Gestaltung](../../styles.css), [Bildtests](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Ergänzt die Bildreihe aus [AgDR-0047](0047-eigenes-motiv-je-schwangerschaftswoche.md) und löst die SVG-Reihe im Überblick im regulären Betrieb ab der 3. SSW ab. [AgDR-0043](0043-svg-entwicklungsillustrationen-nach-vorlagen.md), [AgDR-0045](0045-sanftere-fruehe-svg-uebergaenge.md)

> [AgDR-0049](0049-aquarellmotive-fuer-die-ersten-beiden-wochen.md) ergänzt die ersten beiden SSW in beiden Ansichten um Aquarellmotive.

## Kontext und Herkunft

Im Überblick stand bisher eine SVG-Zeichnung. Die Wochenreise verwendete die vom Nutzer gelieferten Motive. Der Nutzer möchte die gleiche Bildreihe auch auf der Startseite sehen.

## Entscheidung

Beide Ansichten verwenden dieselbe Zuordnung und dieselben lokalen Dateien. Die SSW-Karte wählt das Motiv aus der aktuellen Berechnung und behält ihre kurze Bildunterschrift. Die Wochenreise wählt das Motiv aus der betrachteten Woche und zeigt den ungefähren Phasenbereich. Ein dezenter, weicher Verlauf hinter dem transparenten Motiv bindet es in die grüne Karte ein.

Mit persönlichen Angaben zeigt die Startseite bis zur Übernahme durch den Service Worker ein SVG. Danach ruft sie das passende WebP aus dem vorab geladenen Bildbestand ab. Die Wochenreise lädt ihre Bilder erst in der Nähe des sichtbaren Bereichs. In den ersten beiden SSW erscheinen in beiden Ansichten symbolische SVGs.

## Erwogene Alternativen

Ein separates Bildpaket oder eine eigene Zuordnung für den Überblick würde die Auslieferung und Pflege verdoppeln oder Unterschiede zwischen den Ansichten erzeugen. Mit einem direkten Einzelabruf auf der Startseite vor dem Cache-Aufbau könnte der Host den Abruf einem Wochenmotiv zuordnen.

## Folgen und Grenzen

Die Ansichten teilen den bestehenden Offline-Bildbestand. Blockiert der Browser den Service Worker, zeigt der Überblick mit persönlichen Angaben weiterhin die SVG-Darstellung.

## Verifikation

- `npm test` mit 237 Tests und `npm run build` erfolgreich. Die Bildtests vergleichen die Ausgaben für alle 42 Wochen und beide Ansichten, einschließlich der SVGs für die ersten beiden Wochen.
- Chromium am lokalen Dev-Server bei 390 und 1280 CSS-Pixeln. Die Startkarte zeigt das Motiv auch nach einem Offline-Neuladen. Mit synthetischen Angaben wurde der Abruf des persönlichen Startmotivs über den Service Worker geprüft. Beim Blättern von der 10. zur 11. SSW in der Wochenreise blieb beim Zurückwechseln das Motiv zur 10. SSW im Überblick. Das SVG in der 2. SSW und die ausgeblendete Illustration ab 42+0 wurden ebenfalls geprüft. Ein physisches Smartphone wurde nicht geprüft.

## Quellen

- Nutzerwunsch und bestehende redaktionelle Bildzuordnung. [AgDR-0047](0047-eigenes-motiv-je-schwangerschaftswoche.md), [Bildnachweise](../assets/development-weekly-motifs.json)
