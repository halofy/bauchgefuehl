# AgDR-0047: Eigenes Motiv je Schwangerschaftswoche

- **Status:** Umgesetzt, Nutzertest offen
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Der Nutzer hinterfragt die Beschränkung auf zwölf Motive angesichts der verfügbaren Bilder. Der Agent entscheidet sich für ein eigenes Bild je Woche und legt die Auswahl fest.
- **Betroffene Dateien:** [Bildauswahl](../../src/development-art.js), [Wochenreise](../../src/companion-ui.js), [Offline-Manifest](../../sw.js), [Bildnachweise](../assets/development-weekly-motifs.json)
- **Ersetzt / ergänzt:** Ersetzt die wiederholte Anzeige eines einzelnen Motivs je Bildphase. [AgDR-0046](0046-wochenbilder-mit-grober-phasenzuordnung.md)

> [AgDR-0048](0048-wochenmotive-im-ueberblick.md) verwendet dieselbe Bildzuordnung im Überblick.
> [AgDR-0049](0049-aquarellmotive-fuer-die-ersten-beiden-wochen.md) ergänzt zwei eigene Aquarellmotive für die 1. und 2. SSW.

## Kontext und Herkunft

Die erste Fassung fasste die gelieferten Bilder zugunsten einer kleinen Offline-Auslieferung zu zwölf Motiven zusammen. Dadurch änderte sich das Bild in manchen Abschnitten bis zu sechs Wochen lang nicht. Der Nutzer bevorzugt eine feinere Darstellung und hatte zuvor ausdrücklich eine grobe Phasenzuordnung gewählt.

## Entscheidung

Jede Woche von der 3. bis zur 42. SSW zeigt ein eigenes Motiv. Die ersten beiden SSW zeigen symbolische SVGs. Die Dateinummer dient der Zuordnung zur Vorlage. Die redaktionelle Phase unter dem Bild umfasst weiterhin mehrere Wochen. Zum Beispiel erscheinen in der 10. und 11. SSW zwei ähnlich gezeichnete Profile aus den Dateien 09 und 10. Die eigenständige Wochenanzeige und die persönliche Berechnung gelten unabhängig davon. [Bildauswahl](../../src/development-art.js), [Zuordnung und Prüfsummen](../assets/development-weekly-motifs.json)

Die Auswahl lässt Motiv 08 wegen der deutlicheren Gesichtskonturen aus. Motiv 36 zeigt bereits eine kopfabwärts gezeichnete Pose. Für diese Darstellung verwendet die App die sechs Motive 37 bis 42 in der letzten Bildphase. Alle Originale bleiben erhalten. Der Build liefert 40 transparente WebP-Dateien zu je 640 × 640 Pixeln aus. Zusammen benötigen sie rund 4,2 MiB und sind nach dem ersten vollständigen Laden im Offline-Cache verfügbar. [Bildnachweise](../assets/development-weekly-motifs.json), [Offline-Manifest](../../sw.js)

## Erwogene Alternativen

Ein festes Motiv je Phase spart rund 2,9 MiB und lässt Wochenwechsel häufig ohne sichtbare Bildänderung. Wechselnde Motive innerhalb derselben Woche würden die Ansicht ohne Veränderung der gewählten Woche verändern.

## Folgen und Grenzen

Die Illustration bleibt schematisch. Die Bildreihenfolge und die gezeigten Posen dienen der Gestaltung und geben weder medizinische Meilensteine je Woche noch die Lage eines individuellen Kindes an. Die zusätzliche Bildmenge trifft den ersten vollständigen Download und Offline-Cache.

## Verifikation

- `npm test` mit 237 Tests und `npm run build` erfolgreich. Die automatisierten Prüfungen decken 40 verschiedene Motive, die Phasenbeschriftung, die beiden symbolischen SVGs und den Offline-Cache unter einem GitHub-Pages-Unterpfad ab.
- Chromium bei 390 CSS-Pixeln und deaktiviertem Netzwerk nach Neuladen der App. Alle 42 Wochen ließen sich durchblättern und alle 40 WebP-Dateien wurden aus dem Offline-Cache erfolgreich dekodiert. Die Prüfung auf einem physischen Smartphone und der Nutzertest stehen aus.

## Quellen

- Vom Nutzer bereitgestellte Dateien aus `embryo-stadien-png/`. [Zuordnung und Prüfsummen](../assets/development-weekly-motifs.json)
- Phasen als allgemeine Orientierung, redaktionell geprüft am 20.11.2026. Die Reihenfolge innerhalb der Phasen ist eine Gestaltungsentscheidung. [Österreichisches Gesundheitsportal zur Entwicklung des Kindes](https://www.gesundheit.gv.at/leben/eltern/schwangerschaft/info/entwicklung-embryo.html), [BIÖG zur 5. bis 8. SSW](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/5-bis-8-schwangerschaftswoche/)
