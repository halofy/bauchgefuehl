# AgDR-0049: Aquarellmotive für die ersten beiden Wochen

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer möchte die Bilder der 1. und 2. SSW ebenfalls ersetzen. Gestaltung, Bildunterschriften und Dateiformat sind Entscheidungen des Agenten.
- **Betroffene Dateien:** [Bildauswahl](../../src/development-art.js), [Überblick](../../src/app.js), [Bildnachweise](../assets/development-weekly-motifs.json), [Offline-Manifest](../../sw.js)
- **Ersetzt / ergänzt:** Ersetzt die reguläre SVG-Darstellung in der 1. und 2. SSW durch Aquarelle. [AgDR-0047](0047-eigenes-motiv-je-schwangerschaftswoche.md), [AgDR-0048](0048-wochenmotive-im-ueberblick.md)

> [AgDR-0050](0050-lokale-vorschau-des-aktuellen-builds.md) ergänzt eine lokale Vorschau, in der die Motive im Überblick sofort aus dem aktuellen Build geladen werden.

## Kontext und Herkunft

Die 1. und 2. SSW waren die letzten regulären SVG-Motive in der Wochenreihe. Der Nutzer möchte in diesen beiden Wochen ebenfalls Aquarelle sehen.

## Entscheidung

Die 1. SSW zeigt einen offenen Aquarellring mit einem Tropfen als Symbol für den Zyklusbeginn. Die 2. SSW zeigt überlappende Aquarellringe als Symbol für die Vorbereitung auf den Eisprung. Beide Ansichten zeigen die jeweilige symbolische Bildunterschrift. Die ersten beiden SSW gehören in der üblichen geburtshilflichen Zählung zur Zeit vor der Befruchtung. [Österreichisches Gesundheitsportal zur SSW-Zählung](https://www.gesundheit.gv.at/leben/eltern/schwangerschaft/info/entwicklung-embryo.html), [BIÖG zur 1. bis 4. SSW](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/1-bis-4-schwangerschaftswoche/)

Die beiden mit dem eingebauten ImageGen-Werkzeug erstellten Motive werden als transparente WebP-Dateien mit 640 × 640 Pixeln ausgeliefert. Sie ergänzen den Offline-Cache um rund 130 KiB. [Zyklusbeginn](../../images/stages/zyklusbeginn.webp), [Zyklusvorbereitung](../../images/stages/zyklusvorbereitung.webp), [Bildnachweise](../assets/development-weekly-motifs.json)

## Erwogene Alternativen

Die elliptischen SVGs wären kompakter, entsprachen aber dem Wunsch nach einer einheitlichen Bildreihe nicht. Eine Neuverteilung der gelieferten Dateien würde auch spätere Wochen neu bebildern und könnte in den ersten beiden SSW Embryonalentwicklung andeuten.

## Folgen und Grenzen

Die Zyklusbilder sind symbolisch. Der genaue Zeitpunkt des Eisprungs lässt sich daraus nicht ableiten. Der bestehende SVG-Ersatz im Überblick bleibt während des Cache-Aufbaus mit persönlichen Angaben verfügbar. [AgDR-0048](0048-wochenmotive-im-ueberblick.md)

## Verifikation

- `npm test` mit 237 Tests und `npm run build` erfolgreich. Die automatisierten Tests prüfen die beiden Bildunterschriften, 42 unterschiedliche Dateien und ihre Verfügbarkeit im Offline-Cache. Die Prüfsummen beider WebP-Dateien sind im Build bestätigt.
- Chromium am laufenden Dev-Server mit synthetischen Angaben und deaktiviertem Netzwerk nach Neuladen geprüft. Die Motive waren im Überblick und in der Wochenreise sichtbar. Die 1. SSW wurde bei 390 CSS-Pixeln geprüft, die 2. SSW bei 1280 CSS-Pixeln. Ein physisches Smartphone wurde nicht geprüft.

## Quellen

- Herkunft, Dateigröße und Prüfsummen. [Bildnachweise](../assets/development-weekly-motifs.json)
- Redaktionelle Prüfung der Datierung am 20.11.2026. [Österreichisches Gesundheitsportal zur SSW-Zählung](https://www.gesundheit.gv.at/leben/eltern/schwangerschaft/info/entwicklung-embryo.html), [BIÖG zur 1. bis 4. SSW](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/1-bis-4-schwangerschaftswoche/)

### ImageGen-Prompts

**1. SSW**

```text
Use case: illustration-story. Asset type: square transparent watercolor spot illustration for week 1 of a gentle pregnancy companion. Subject: one softly rounded rose-clay ink and watercolor brushstroke in an open circle, and a single small teardrop-shaped muted rose brush mark near the lower inner edge. A simple, warm symbol for the beginning of a menstrual cycle. Entire motif centered with moderate breathing room, occupying about 68% of the square. Style: warm peach, rose, and muted terracotta watercolor glaze, visible soft paper grain only within the painted marks, a thin broken sepia ink accent in a hand-drawn editorial style. Genuine transparent background, no paper rectangle, no glow, no shadow. No text, numerals, labels, lettering, embryo, fetus, face, anatomy, microscope scene, or medical diagram.
```

**2. SSW**

```text
Use case: illustration-story. Asset type: square transparent watercolor spot illustration for week 2 of a gentle pregnancy companion. Subject: a simple circle in muted peach and rose washes, with a few soft overlapping watercolor rings and a lighter center, an abstract symbol for the body's preparation for ovulation, not a microscope drawing. A calm paired companion to a rose-clay circular wash underlined with thin broken sepia ink. Entire motif centered with moderate breathing room, occupying about 68% of the square. Style: handmade restrained editorial watercolor, warm apricot, rose, and muted terracotta, subtle paper grain entirely inside the painted motif. Genuine transparent background, no paper rectangle, no glow, no shadow. No text, numerals, labels, lettering, embryo, fetus, face, anatomy, sperm, or medical diagram.
```
