# AgDR-0045: Sanftere frühe SVG-Übergänge

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Nutzerfeedback zum Sprung von der 10. zur 11. SSW und Wunsch nach weniger Details. Die Platzierung der Zwischenformen und die Linienführung sind Gestaltungsentscheidungen des Agenten.
- **Betroffene Dateien:** [SVG-Zeichnungen](../../src/development-art.js), [Bildtests](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Ersetzt den direkten Wechsel von früher Embryoform zu detailliertem Profil aus [AgDR-0043](0043-svg-entwicklungsillustrationen-nach-vorlagen.md).

> [AgDR-0046](0046-wochenbilder-mit-grober-phasenzuordnung.md) löst die SVG-Reihe in der Wochenreise ab der 3. SSW ab.
> [AgDR-0048](0048-wochenmotive-im-ueberblick.md) nutzt diese Bildreihe auch im Überblick.

## Kontext und Herkunft

Die bisherigen Illustrationen wechselten zwischen der 10. und 11. SSW abrupt von einer gebogenen Form zu einem Profil mit gezeichneten Gesichtszügen und ausgeprägten Gliedmaßen. Der Nutzer bevorzugt sichtbare Zwischenstufen und eine zurückhaltende Zeichnung.

## Entscheidung

Ab der 5. SSW verwenden die Zeichnungen eine gemeinsame, zusammenhängende Kontur. Neue Zeichnungen für die 5., 10. und 16. SSW bilden die Bezugspunkte für sanfte Zwischenformen. Ab der 11. SSW nehmen die Andeutungen von Arm und Bein über mehrere Wochen an Größe und Deckkraft zu. Bis einschließlich der 19. SSW fehlen gezeichnete Gesichtslinien. Danach kommt schrittweise eine einzelne Lidlinie hinzu. Die späteren Profile verwenden weichere Arm- und Beinkonturen. Überblick und Wochenreise verwenden dasselbe Offline-Modul.

## Erwogene Alternativen

Den bisherigen Wechsel um eine Woche zu verschieben hätte denselben Sprung an einer anderen Stelle erzeugt. Die gemeinsame Kontur verteilt die Veränderung auf benachbarte Wochen.

## Folgen und Grenzen

Die Zeichnungsstufen und der Einsatz einer Lidlinie sind gestalterische Konventionen. Medizinische Entwicklungstexte und Größenangaben sind von ihnen unabhängig.

## Verifikation

- Die neue Regression prüft kleine Konturänderungen von der 10. bis zur 16. SSW und das spätere Auftreten der Lidlinie. `npm test` erfolgreich mit 236 Tests.
- Safari-Sichtvergleich mit zwölf SVG-Stufen zwischen der 5. und der 21. SSW auf hellem und grünem Hintergrund. `npm run build` erfolgreich. Ein erneuter Nutzertest steht aus.

## Quellen

- Nutzerfeedback und Vergleichsbilder zur 10. und 11. SSW im Gespräch vom 20.11.2026.
- [Ursprüngliche SVG-Reihe und Bildvorlagen](0043-svg-entwicklungsillustrationen-nach-vorlagen.md).
