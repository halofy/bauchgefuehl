# AgDR-0043: SVG-Entwicklungsillustrationen nach Bildvorlagen

- **Status:** Umgesetzt, erneuter Nutzertest offen
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Nutzer meldet einen nicht bestandenen Bildtest und schlägt eine Rückkehr zu SVG nach Bildvorlagen vor. Formen, Farben und Wochenübergänge legt der Agent fest.
- **Betroffene Dateien:** [SVG-Zeichnungen](../../src/development-art.js), [Überblick](../../src/app.js), [Wochenreise](../../src/companion-ui.js), [Styles](../../styles.css), [Build](../../scripts/build.js), [Service Worker](../../sw.js), [Bildtests](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Löst die aktive PNG-Darstellung, Ausschnittmaske und Papierfärbung aus [AgDR-0041](0041-entwicklungsvisualisierung.md) ab. Die mobile Kartenreihenfolge sowie Wochenwahl und reduzierte Bewegung gelten weiter. Die medizinischen Größenquellen und Untersuchungsmaße stehen in [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md).

> [AgDR-0045](0045-sanftere-fruehe-svg-uebergaenge.md) ersetzt den abrupten Wechsel zur 11. SSW durch mehrere Zwischenstufen und reduziert die Gesichtszüge.
> [AgDR-0046](0046-wochenbilder-mit-grober-phasenzuordnung.md) führt ab der 3. SSW eigene Bildmotive für die Wochenreise ein. Der Überblick verwendet die SVG-Reihe.
> [AgDR-0048](0048-wochenmotive-im-ueberblick.md) übernimmt die Bildmotive auch in den Überblick. Die SVGs dienen dort als Symbol für die ersten beiden Wochen und als Darstellung während des ersten Cache-Aufbaus bei persönlichen Angaben.

## Kontext und Herkunft

Der Nutzer berichtet, dass die aktuelle Bildserie den Nutzertest nicht bestanden hat. Er schlägt vor, zu SVG zurückzukehren und sich an den gelieferten Bildern zu orientieren. Frühere Rückmeldungen betrafen getrennt wirkende Figurenteile, eine kaum erkennbare Entwicklung nach Woche 22 und eine als unheimlich empfundene Darstellung. Der Agent zeichnet die Motive deshalb neu und orientiert sich an den warmen Farben, der eingerollten Profilhaltung und der zunehmend runderen Figur aus den Vorlagen.

## Entscheidung

Überblick und Wochenreise verwenden dasselbe lokale SVG-Modul für die deutsche 1. bis 42. SSW. Die ersten Wochen zeigen symbolische Formen, darauf folgt eine gebogene Embryoform. Ab der 11. SSW bestimmen vier gezeichnete Profile die Form. Für die dazwischenliegenden Wochen werden die Bézier-Kontrollpunkte von Silhouette, Arm, Bein und Gesicht interpoliert. Kopf und Rumpf teilen eine Außenkontur. Alle Teile bewegen sich als Einheit. Die CSS-Animation pausiert in inaktiven App-Bereichen und entfällt bei reduzierter Bewegung.

Die Figur gewinnt auch nach Woche 22 an Körperfülle. Späte Profile drehen sich wie in den Referenzbildern zunehmend mit dem Kopf nach unten. Die Pose ist illustrativ und sagt nichts über die tatsächliche Lage des Kindes aus. Die weichen Pfirsich- und Terrakottaverläufe liegen direkt in den SVGs. Ein gedämpfter Salbeiverlauf bindet die transparente Figur in die grüne Karte ein. Wochenzahl und Beschreibung sind separater Text. Die Wochenreise benennt Bildherkunft und Maßstab.

Die ursprünglichen 42 Aquarelle und die alte Maske bleiben für die gestalterische Referenz und die historischen Nachweise an ihren Projektpfaden. Sie entfallen im statischen Build und im Offline-Manifest. Beide Ansichten zeichnen die SVGs aus demselben vorab geladenen Modul. Die Wochenbildauswahl ist unabhängig von SSW-Formel, gemessener Größe und NHS-Referenzwerten.

## Erwogene Alternativen

Weitere PNG-Maskierung hätte die Rückmeldung zum eingesetzten Motiv nicht adressiert. Die frühere SVG-Fassung enthielt Formen, die der Nutzer bereits abgelehnt hatte. Eigene Vektorpfade nach den bereitgestellten Profilen erlauben eine zusammenhängende Figur, eine feine Wochenstaffelung und einen transparenten Hintergrund.

## Folgen und Grenzen

Die Auslieferung spart rund 65 MiB an Bilddateien. Die Gestaltung ist eine schematische Interpretation. Zwischenwerte der Pfadkoordinaten sind gestalterisch gewählt. Die Zuordnung zur SSW bildet keine klinisch validierten Merkmale, Bewegungen oder Kindslagen ab. Ein erneuter Nutzertest steht aus.

## Verifikation

- `npm test` und `npm run build` erfolgreich. Die Bildtests prüfen 42 unterschiedliche Zeichnungen, die sich verändernde Kontur zwischen Woche 22 und 42, eindeutige Gradientenkennungen beider Ansichten und gültige Wochen. Der Offline-Test prüft das SVG-Modul unter einem GitHub-Pages-Unterpfad und den Wegfall der alten Bilddateien.
- Safari-Sichtprüfung mit zwölf Wochenmotiven auf hellen und dunkelgrünen Flächen. App-Überblick bei 390 CSS-Pixeln mit der 19. SSW geprüft. In derselben Wochenreise wurde die 42. SSW ausgewählt und als SVG mit passender Wochenbeschriftung bestätigt.
- Die Safari-Prüfung fand am Rechner statt. Physische Smartphones, reduzierte Bewegung über eine Betriebssystemoption und ein erneutes Nutzerfeedback wurden nicht geprüft.

## Quellen

- Nutzerfeedback und bereitgestellte Bildvorlagen im Gespräch, einschließlich des Aquarellarchivs. [Herkunft der 42 Originale](../assets/development-series.json)
- Eigene SVG-Zeichnungen auf Grundlage der gestalterischen Vorlagen. [Zeichnungen und Wochenzuordnung](../../src/development-art.js)
