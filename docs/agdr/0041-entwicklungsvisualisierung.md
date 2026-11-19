# AgDR-0041: Entwicklungsvisualisierung

- **Status:** Umgesetzt; Dokumentationskonsolidierung des bestehenden App-Stands
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Zusammenfassung ausdrücklich vom Nutzer gewünscht; Gliederung und Abgrenzung durch den Agenten
- **Betroffene Dateien:** [Bildrenderer](../../src/development-art.js), [Wochenbilder](../../images/development/), [Bildherkunft](../assets/development-series.json), [Bildmaske](../../images/development-mask.svg), [Startansicht](../../index.html), [Styles](../../styles.css), [Layout](../../src/layout.js), [Wochenreise](../../src/companion-ui.js), [Service Worker](../../sw.js), [Bildtests](../../tests/growth.test.js), [PWA-Tests](../../tests/pwa.test.js)
- **Ersetzt / ergänzt:** Führt die Darstellungsentscheidungen **AgDR-0030 bis AgDR-0039** in diesem Record zusammen. Ihre vollständigen früheren Texte und Prüfnachweise stehen im [historischen Verlauf](#historischer-verlauf). Die alten Nummern bleiben reserviert. [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md) bleibt für Größenquellen, Zwischenwerte und eigene Untersuchungsmaße maßgeblich; [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md) dokumentiert die Dateibereinigung.

## Kontext und Herkunft

Der Nutzer wünscht einen gemeinsamen AgDR für die Visualisierung. Dieser Record beschreibt den bestehenden Stand und ordnet die früheren Entwürfe ein; die App wird durch die Zusammenfassung nicht verändert. Die früheren Einzeldateien 0030–0039 entfallen, ihre Inhalte werden unten vollständig eingebettet. Verweise werden auf diesen Record beziehungsweise den passenden historischen Abschnitt umgestellt.

Ausdrückliche Anforderungen aus dem Gespräch sind eine ansprechende, fortschreitende Entwicklungsdarstellung, später die Verwendung der bereitgestellten Aquarellserie, keine Tagesauswahl bei einem Bild je Woche, getrennte Wochennummern, eine weiche unregelmäßige Maske, mehr Übergang zur grünen Karte und anschließend ein ruhigerer Rand bei sichtbarerem Motiv. „Dein Tag auf einen Blick“ soll mobil unter der grünen Karte stehen. Zur selektiven Salbeitönung des Papiergrunds liegt eine Zustimmung zum Vorschlag vor. Konkrete Farbwerte, Maskenkoordinaten, Zoomfaktoren und Animation stammen vom Agenten; eine nachträgliche gestalterische Abnahme wird daraus nicht abgeleitet.

## Entscheidung

### Bilder und Wochenbezug

- Die bereitgestellten **42 Original-PNGs** werden unverändert verwendet: `woche_01.png` bis `woche_42.png`, je ein Bild für die gleich nummerierte deutsche SSW. Überblick und Wochenreise verwenden dieselbe Zuordnung; ungültige Wochen außerhalb 1–42 werden zurückgewiesen.
- Es gibt keine Tagesvarianten oder Tagesauswahl. Die Größenorientierung in der Wochenreise bezieht sich auf den Wochenbeginn `(SSW − 1) × 7` Tage, etwa 23+0 in der 24. SSW. Eigene Untersuchungswerte behalten ihr tatsächliches Datum und ihre Messart; sie ändern weder die Illustration noch SSW oder ET automatisch.
- Die Motive sind künstlerische Illustrationen, keine medizinisch geprüfte Entwicklungsreihe, persönliche Wachstumsprognose oder Aussage zur tatsächlichen Kindslage. Bildherkunft und medizinische Größenquellen werden getrennt ausgewiesen. Archiv- und Bildprüfsummen stehen in der [Herkunftsdatei](../assets/development-series.json).

### Ausschnitt, Maske und Farben

- Die eingebrannte Wochennummer wird ausschließlich in der Ansicht abgeschnitten. Eine quadratische Maskenebene mit vergrößertem, oben ausgerichtetem Bild blendet den Beschriftungsstreifen aus. Die Originale bleiben bytegleich erhalten; SSW, Alternativtext und Bildhinweis stehen separat als HTML zur Verfügung.
- Die gestalterischen Zoomfaktoren betragen 1,65 für Wochen 1–8, 1,45 für 9–24, 1,18 für 25–32 und 1,04 für 33–42. Sie beschreiben keine medizinische Größe. Auf der Überblickskarte ist das Bild maximal 212 CSS-Pixel breit; der Hinweis steht mit Abstand darunter.
- Die lokale SVG-Maske hat vier ruhige Bézier-Abschnitte mit leichter Asymmetrie. Ihr Innenbereich bleibt bis zur Hälfte des Verlaufsradius bei 96 % Deckkraft; außen läuft sie weich aus, mit einer Gauß-Weichzeichnung von 10 SVG-Einheiten. Standard- und WebKit-Maskenregeln nutzen dieselbe Datei; unterschiedliche Eckradien bilden den Rückfall ohne Maskenunterstützung.
- Ein breiter Waldgrün-Salbei-Verlauf verbindet Bild und Überblickskarte. Zusätzliche Verläufe halten die linke Textspalte und die untere Fortschrittszeile dunkler.
- Nur auf der grünen Überblickskarte tönt der lokale SVG-Filter `development-paper-tone` helle, annähernd neutrale Papierpixel salbeifarben. Die weiche Auswahl `clamp(−3R + 4G + 4B − 4, 0, 1)` wird mit Salbei `#a5b99c` und maximal 50 % Deckkraft überlagert. Warme Mitteltöne und dunkle Konturen bleiben weitgehend erhalten; in der Wochenreise gelten die Originalfarben. Dies ist eine Farbnäherung, keine semantische Freistellung.

### Bewegung und mobile Kartenreihenfolge

Die ganze maskierte Illustration schwebt als Einheit über sieben Sekunden mit höchstens zwei Pixeln Vertikalversatz und einem Grad Drehung je Richtung. Inaktive Bereiche pausieren; bei reduzierter Bewegung bleibt sie statisch. Es werden keine Herzaktivität oder unabhängigen Körperbewegungen simuliert.

Im App-Layout steht die bestehende Heute-Karte im DOM direkt nach der grünen SSW-Karte und vor ET/Grundlage. Auf dem Desktop bleibt sie oberhalb der Zusammenfassung. Im Wochenbett steht sie außerhalb der ausgeblendeten Schwangerschaftszusammenfassung. Es bleibt derselbe Kartenknoten, einschließlich Ereignisbindungen und aufgeklappter Inhalte.

### Offline-Nutzung und Herkunft

Alle PNGs, die Maske, der Filter, CSS und Module sind lokal und im statischen GitHub-Pages-Build enthalten. Externe Bilddienste oder Laufzeit-Uploads sind nicht beteiligt. Der Service Worker lädt neue Release-Dateien beim Installieren mit `Request.cache = reload`, um gemischte alte und neue Module zu vermeiden; die Aktivierung bleibt bewusst bestätigt. Gesundheitsdaten werden dabei nicht zurückgesetzt.

Die sieben früher generierten Phasenbilder und das redundante Quell-ZIP werden seit [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md) nicht mehr aufbewahrt. [Historische Prompts und Prüfsummen](../assets/development-prompts.json) sowie die 42 aktuellen Originale bleiben erhalten.

## Erwogene Alternativen

Frühe SVG-Entwürfe wurden wegen abgetrennt wirkender Teile, zu weniger später Entwicklungsstufen und gestalterischer Rückmeldungen durch PNGs ersetzt. Die zunächst generierten sieben Phasenbilder wurden auf ausdrücklichen Wunsch durch die bereitgestellten 42 Bilder ersetzt. Ein perfekter Kreis, stärker gewellte Konturen und ein früh transparentes Zentrum wurden zugunsten einer ruhigeren asymmetrischen Maske mit klarerem Motiv verworfen. Pauschale Farbkorrekturen würden auch die warmen Körperfarben verändern; bearbeitete PNGs würden abweichende Originaldateien erfordern.

Eine zusätzliche Übersicht neben zehn weiter separat geführten Records würde die gewünschte Zusammenfassung nur teilweise erfüllen. Die vollständige Einbettung ihrer Texte in einen aufklappbaren Verlauf bewahrt Herkunft und Prüfnachweise, während oben nur der gültige Stand steht. AgDR-0029 bleibt eigenständig, weil er zusätzlich medizinische Größenmodelle und gespeicherte Untersuchungswerte dokumentiert.

## Folgen und Grenzen

Die aktuelle Originalserie belegt **67.991.712 Byte, rund 64,84 MiB**. Eine erste Offline-Installation oder ein Bildserien-Update muss vollständig abgeschlossen sein. Die Maskierung kann äußere Motivdetails ausblenden, stellt den Körper aber nicht pixelgenau frei. Sehr helle Motivlichter können geringfügig mitgetönt werden. Neue Bildformate oder Beschriftungspositionen erfordern eine erneute Ausschnittprüfung.

Eine grafische oder redaktionelle Zusammenfassung erneuert weder medizinische Quellenprüfstände noch bestätigt sie die Anatomie der Bilder. Berechnungen, Speicherung, Datenformate und Funktionen ändern sich hier nicht. Historische Testzahlen gelten jeweils für ihren damaligen Stand und werden nicht als neu ausgeführte Prüfungen dargestellt.

## Verifikation

- **Für diese Konsolidierung:** 574 lokale Dokumentverweise einschließlich aller historischen Abschnittsanker geprüft; alle zehn früheren Texte vor dem Entfernen der Einzeldateien mit ihrer eingebetteten Fassung abgeglichen. `git diff --check` ohne Fehler. Alle 90 vorhandenen Build-Dateien sind weiterhin bytegleich zur App-Quelle. Keine neuen App-Tests, Builds oder visuellen Geräteprüfungen erforderlich oder ausgeführt.
- **Letzter vorhandener Funktionsnachweis:** [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md) dokumentiert 220 bestandene Tests, erfolgreichen Build und 90 quellenidentische Offline-Dateien einschließlich der 42 gegen Herkunft und Quellarchiv geprüften Originalbilder.
- **Bisherige Sichtprüfungen:** Die eingebetteten Records dokumentieren Safari-Stichproben der Illustrationen, des mobilen Layouts, der Masken, des Kartenverlaufs und des selektiven Farbfilters. Diese historischen Prüfungen werden durch die Zusammenfassung nicht wiederholt.
- **Offene Grenzen:** Physische iPhone-/Android-Geräte, Screenreader-Gesamtlauf, Rückfall ohne CSS-Maskenunterstützung, vollständige farbmetrische beziehungsweise instrumentelle Kontrastprüfung und medizinische Begutachtung der Motive sind nicht vollständig geprüft.

## Quellen

- Nutzeranforderungen und Rückmeldungen im Gespräch vom 19.11.2026; vollständige Zuordnung im folgenden Verlauf.
- [Bildherkunft und Originalprüfsummen](../assets/development-series.json), [historische Generierungsprompts](../assets/development-prompts.json).
- [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md): medizinische Größenanker und ihre Fachquellen; sie belegen nicht die Anatomie der Illustrationen.
- [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md): Dateibereinigung und letzter vollständiger Test-/Buildnachweis.

## Historischer Verlauf

Die folgenden Texte bewahren die früheren Records 0030–0039 vollständig. Nur Überschriftenebenen und interne Linkziele sind für die Einbettung angepasst. Statusangaben, Dateizahlen, Testzahlen und Aussagen zu damaligen Entwürfen sind historische Angaben; für den gültigen Stand ist die Entscheidung oben maßgeblich. Frühere Nummern werden nicht neu vergeben.

<a id="agdr-0030"></a>

<details>
<summary>AgDR-0030: Zusammenhängende SVG-Illustration und mobile Tagesübersicht unter der SSW</summary>

### AgDR-0030: Zusammenhängende SVG-Illustration und mobile Tagesübersicht unter der SSW

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Darstellungsdetails durch den Agenten
- **Betroffene Dateien:** [growth.js](../../src/growth.js), [index.html](../../index.html), [layout.js](../../src/layout.js), [companion-ui.js](../../src/companion-ui.js), [styles.css](../../styles.css), [growth.test.js](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Löst den SVG-Darstellungsteil aus [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md) und die mobile Position der Heute-Karte aus [AgDR-0026](0026-alltagsbegleitung-terminmappe-und-wochenbett.md) ab. Größenquellen, Berechnung, Untersuchungswerte und gespeicherte Daten bleiben unverändert.

> Fortschreibung vom 19.11.2026: Die SVG-Zeichnung wurde nach AgDR-0031 durch die PNG-Serie aus [AgDR-0032](0041-entwicklungsvisualisierung.md#agdr-0032) abgelöst. Die mobile Tagesübersicht unter der grünen SSW-Karte und die reduzierte Bewegung bleiben bestehen.

#### Kontext und Herkunft

Der Nutzer zeigt eine auseinanderfallende Illustration und schlägt entweder mehrere angenäherte PNG-Entwicklungsbilder oder ein besser gezeichnetes SVG mit etwas Bewegung vor. Außerdem soll „Dein Tag auf einen Blick“ mobil unter der grünen SSW-Karte stehen. Der bisherige Renderer platzierte eine geschwungene Linie außerhalb der skalierten Figurengruppe; sie konnte deshalb abgetrennt wirken.

#### Entscheidung

Der Agent wählt innerhalb der ausdrücklich angebotenen Varianten das SVG. Fünf redaktionelle, schematische Entwicklungsdarstellungen erhalten zusammenhängende Formen, dezente Lichtverläufe und eine gemeinsame Bildsprache. Die frühen Figuren nutzen mehr Fläche als zuvor. Konturen und gegebenenfalls verbundene Details liegen in derselben skalierten Figurengruppe. Jede Illustration verwendet eigene Verlaufskennungen, damit mehrere SVGs auf einer Seite keine fremden Farbverläufe referenzieren.

Eine äußere Gruppe bewegt die ganze Figur sanft über sieben Sekunden mit höchstens zwei Pixeln Vertikalversatz und einem Grad Drehung pro Richtung. Es gibt keine pulsierende Herzaktivität oder unabhängig auseinanderlaufenden Körperteile. Bei `prefers-reduced-motion: reduce` findet keine Animation statt; in inaktiven Hauptbereichen pausiert sie. SVGs bleiben als schematisch und nicht maßstabsgetreu gekennzeichnet. Auch die statische Startillustration verwendet den korrigierten Stil. Keine zusätzlichen externen Bilder, Schriften oder Laufzeitdienste.

Im gemeinsamen App-Layout wird die vorhandene Heute-Karte im DOM direkt nach die grüne Schwangerschaftskarte und vor ET/Grundlage verschoben. Desktop behält die vorherige Position oberhalb der Zusammenfassung. Im Wochenbett steht die Karte außerhalb der ausgeblendeten Schwangerschaftszusammenfassung nach dem Wochenbett-Überblick. Breiten-/App-Moduswechsel und Phasenwechsel verwenden denselben Kartenknoten: Ereignisbindungen und aufgeklappte Inhalte bleiben erhalten; es entsteht keine zweite Karte für Leserichtung oder Screenreader.

#### Erwogene Alternativen

Wöchentliche PNGs wären möglich, erforderten jedoch eine größere konsistente Bildserie und zusätzliche Offline-Dateien. Die vorhandene SVG-Darstellung lässt sich direkt korrigieren, skalieren und zurückhaltend animieren. Nur die störende Linie zu löschen hätte die kleine, wenig ausgearbeitete Gesamtfigur nicht verbessert. Eine reine CSS-Sortierung ohne DOM-Umsortierung würde visuelle und assistive Leserichtung auseinanderlaufen lassen.

#### Folgen und Grenzen

Die Illustration ist Gestaltung, keine klinische Anatomieabbildung, persönliche Wachstumsprognose oder Ultraschallsimulation. Quellen und redaktioneller Stand der medizinischen Größenangaben werden durch eine rein grafische Änderung nicht künstlich neu datiert. Es gibt keine neue Berechnungsentscheidung oder Datenmigration. Installierte PWAs übernehmen die neue Darstellung über ihr bewusstes Update.

#### Verifikation

- **219 Tests bestanden**, keine Fehler/ausgelassenen Tests, mit `node --test tests/*.test.js` entsprechend dem npm-Testskript. `npm` ist in dieser Ausführungsumgebung nicht im Pfad; kein erfolgreicher npm-Aufruf wird behauptet.
- Neuer Regressionstest für unabhängige Farbverlaufskennungen und lokale Referenzen mehrerer gleichzeitig gerenderter SVGs; bestehende Berechnungs-/Quellentests bleiben grün.
- Build mit `node scripts/build.js` entsprechend `npm run build`; auslieferbare Dateien in `dist/`.
- Safari: fünf Entwicklungsdarstellungen auf grünem Hintergrund visuell geprüft. Vorläufige QA-Seite mit eingebetteter App bei äußeren Breiten 320, 390, 820 und 1200 px (innere Viewports durch Rahmen jeweils zwei Pixel kleiner): korrekte mobile/Desktop-Reihenfolge, genau eine Heute-Karte, eindeutige IDs und kein horizontaler Überlauf bestätigt. Rückwechsel zum mobilen Layout ebenfalls geprüft.
- Wochenbett-Sichtbarkeit über einen reinen Layoutwechsel mit Beispieldaten geprüft; dabei wurden keine Gesundheitsdaten gespeichert oder echte Phasendaten geändert. Temporäre QA-Datei wird nicht ausgeliefert.
- Reduzierte Bewegung anhand der CSS-Regeln geprüft; die Betriebssystemeinstellung wurde nicht geändert. Keine neue physische iPhone-/Android-, Screenreader- oder installierte-PWA-Prüfung. Die abschließende Beibehaltung der bisherigen Embryo-Grenze bei 10+0 verändert die visuell geprüften Stichproben nicht.

#### Quellen

Nutzer-Screenshot und ausdrückliche Gestaltungswünsche vom 19.11.2026; oben verlinkte Implementierung und Tests. Für die unveränderten Größenangaben und deren Primärquellen gilt weiterhin [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md). Die gezeichneten Formen und die Wahl der Animation sind Agentenentscheidungen, keine aus medizinischen Quellen abgeleiteten anatomischen Vorgaben.


#### Fortschreibung vom 19.11.2026

Die festen späteren Figurensilhouetten werden durch [AgDR-0031](0041-entwicklungsvisualisierung.md#agdr-0031) abgelöst. Mobile Kartenreihenfolge und gemeinsame reduzierte Bewegung bleiben erhalten.

</details>

<a id="agdr-0031"></a>

<details>
<summary>AgDR-0031: Wöchentliche Entwicklungsillustration bis zum Termin</summary>

### AgDR-0031: Wöchentliche Entwicklungsillustration bis zum Termin

- **Status:** Abgelöst durch [AgDR-0032](0041-entwicklungsvisualisierung.md#agdr-0032)
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; konkrete Zeichnung und Interpolation durch den Agenten
- **Betroffene Dateien:** [development-art.js](../../src/development-art.js), [growth.js](../../src/growth.js), [companion-ui.js](../../src/companion-ui.js), [index.html](../../index.html), [sw.js](../../sw.js), [growth.test.js](../../tests/growth.test.js), [pwa.test.js](../../tests/pwa.test.js)
- **Ersetzt / ergänzt:** Ersetzt die festen späteren Figurensilhouetten aus [AgDR-0030](0041-entwicklungsvisualisierung.md#agdr-0030). Bewegung, mobile Kartenreihenfolge sowie Größenberechnungen und Untersuchungswerte bleiben erhalten.

#### Kontext und Herkunft

Der Nutzer beobachtet, dass die Darstellung ab ungefähr Woche 22 kaum noch weiterwächst, und stellt drei Bildvorlagen für deutlichere Entwicklung bereit. Der bisherige Renderer unterschied in der späteren Schwangerschaft nur wenige statische Konturen. Die Vorlagen dienen der gestalterischen Orientierung. Der Agent entscheidet, die Darstellung als eigene SVG-Zeichnung fortzuführen; die bereitgestellten Rasterbilder werden nicht als medizinischer Datensatz oder unverändert als App-Assets übernommen.

#### Entscheidung

Illustration und medizinische Längenanker sind nun getrennte Module. Die Oberfläche verwendet weiterhin `developmentSvg(gestationalDays)`; die Größenfunktionen bleiben unverändert.

Die Figur besitzt einen erkennbaren Kopf mit Gesicht/Ohr, Hals, Rumpf, zwei Arme mit Händen sowie angewinkelte Beine und Füße. Zusammengehörige Teile bleiben in einer gemeinsamen Figurengruppe. Sanftes Schweben und die bestehende Einstellung für reduzierte Bewegung wirken weiter auf die gesamte Figur.

Eine eigene redaktionelle Tabelle mit Zeichenparametern für 10+0, 12+0, 16+0, 20+0 und anschließend alle zwei abgeschlossenen Wochen bis 40+0 bestimmt relative Kopfgröße, Körperbreite/-höhe, Gliedmaßendicke, Beugung, Drehung und Bildgröße. Dazwischen werden die Parameter kontinuierlich interpoliert. Dadurch ändern sich auch zwischen der deutschen 22. und 40. SSW die tatsächlichen Konturen und Gelenkpositionen; es wird nicht nur dieselbe Silhouette skaliert. Die Tabellenwerte sind Gestaltungskoordinaten, keine gemessenen Körperverhältnisse oder medizinischen Referenzwerte. Deutsche SSW und abgeschlossene Wochen bleiben unterschieden.

Bis 10+0 bleiben frühe schematische Zell-/Embryoformen bestehen. Nach 40+0 wird die letzte Gestalt gehalten; außerhalb des Quellenbereichs entsteht keine behauptete zusätzliche Wachstumsprognose. Die Darstellung rotiert nicht automatisch in eine angeblich feststehende Geburtslage. Der sichtbare Hinweis erklärt, dass die Haltung illustrativ ist und keine tatsächliche Kindslage zeigt.

Alle Pfade und Farbverläufe bleiben lokal und offline verfügbar. Der Service Worker berücksichtigt das neue Modul. Auch die statische Startillustration verwendet die neue Zeichnung. Persönliche Untersuchungsmaße ändern weder die Zeichenparameter noch SSW/ET automatisch.

#### Erwogene Alternativen

Eine PNG-Bildserie würde ebenfalls deutlichere Zwischenstufen ermöglichen, benötigt aber viele konsistent gestaltete Offline-Dateien und feste Bildauflösungen. Eine bloße Fortsetzung der Skalierung hätte den Kern der Rückmeldung nicht behoben. Eine automatische Drehung nach unten entsprechend manchen Referenzen könnte eine persönliche Lage suggerieren und wird nicht als klinischer Zustand abgebildet.

#### Folgen und Grenzen

Das Ergebnis ist eine vereinfachte Illustration, keine Ultraschallsimulation oder anatomisch vermessene Wochenreihe. Persönliche Entwicklung oder Gesundheit sind daraus nicht beurteilbar. Die neue Zeichnung verwendet eigene Pfade; Quellen belegen die allgemeine fortgesetzte Entwicklung, nicht jede Pose oder numerische Zeichenkoordinate. Bestehende medizinische Größenangaben behalten ihren Prüfstand; durch eine grafische Änderung wird dieser nicht künstlich erneuert. Die Quellen für die allgemeine spätere Entwicklung wurden am 19.11.2026 überprüft.

#### Verifikation

- **221 Tests bestanden**, keine Fehler oder ausgelassenen Tests, mit `node --test tests/*.test.js` entsprechend dem npm-Testskript. `npm` ist in der Ausführungsumgebung nicht im Pfad.
- Regressionstest vergleicht alle 19 deutschen Wochen von 22 bis 40 und entfernt dabei Kennungen und Transformationsattribute: tatsächliche SVG-Geometrie unterscheidet sich wöchentlich. Tests prüfen außerdem endliche Interpolation, Zeichnungsgrenze am Termin, unabhängige Farbverläufe, unveränderte medizinische Längen und Offline-Verfügbarkeit des neuen Moduls.
- Safari: deutsche SSW 10, 12, 16, 20, 22, 24, 28, 32, 36 und 40 nebeneinander visuell geprüft. Die SVG-Figurengrenzen liegen in allen zehn Stichproben innerhalb des ViewBox; keine abgeschnittenen Gliedmaßen festgestellt. Die temporäre Vergleichsseite wird nicht ausgeliefert.
- Lokale PWA nach dem Build bewusst aktualisiert und in Safari die 40. SSW innerhalb der echten Wochenreise ausgewählt; neue Figur und unveränderte Datums-/Größenangaben sind sichtbar.
- Statische SVG-IDs, Dokumentlinks, Gleichheit zwischen Quell- und Builddateien sowie 48 Offline-Dateien geprüft; temporäre Vergleichsseite entfernt. `git diff --check` ohne Fehler.
- Statischer Build mit `node scripts/build.js` entsprechend `npm run build`. Keine Veröffentlichung. Physische iPhone-/Android-, Screenreader- und medizinische Illustrationsexperten-Prüfung bleiben offen.

#### Quellen

- Drei vom Nutzer im Gespräch am 19.11.2026 bereitgestellte Referenzbilder: Gestaltungsorientierung für nachvollziehbare Entwicklungsstufen, nicht Beleg individueller Anatomie oder Lage.
- [NHS: 32 abgeschlossene Wochen](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/3rd-trimester/week-32/): beschreibt weiteres Zunehmen und die weitere Veränderung der Körperfülle. Daraus wird nur die qualitative Fortsetzung der Illustration abgeleitet; keine NHS-Zeichenparameter oder persönlichen Prognosen werden behauptet.
- Unveränderte Längenquellen und Datierungsregeln: [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md) und [growth.js](../../src/growth.js).

</details>

<a id="agdr-0032"></a>

<details>
<summary>AgDR-0032: PNG-Phasenbilder und Wochenorientierung</summary>

### AgDR-0032: PNG-Phasenbilder und Wochenorientierung

- **Status:** Bildserie und Wochenzuordnung abgelöst durch [AgDR-0033](0041-entwicklungsvisualisierung.md#agdr-0033); Wochenbeginn, entfallene Tagesauswahl und Update-Korrektur bleiben bestehen
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Bildserie und Wochenzuordnung durch den Agenten
- **Betroffene Dateien:** [development-art.js](../../src/development-art.js), [Historische Bildherkunft und Prompts](../assets/development-prompts.json) (PNG-Dateien entfernt durch [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md)), [app.js](../../src/app.js), [companion-ui.js](../../src/companion-ui.js), [index.html](../../index.html), [styles.css](../../styles.css), [Build](../../scripts/build.js), [sw.js](../../sw.js), [Tests](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Ersetzt die SVG-Zeichnung aus [AgDR-0031](0041-entwicklungsvisualisierung.md#agdr-0031) und die Tagesauswahl der Entwicklungsansicht aus [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md). Die mobile Kartenreihenfolge aus [AgDR-0030](0041-entwicklungsvisualisierung.md#agdr-0030) bleibt bestehen.

#### Kontext und Herkunft

Der Nutzer empfindet die bisherige Figur als gruselig und wenig ansprechend und schlägt PNGs vor. Er wünscht ausdrücklich den Wegfall von „Tag innerhalb dieser SSW“, da es maximal eine Darstellung je Woche gibt. Die Auswahl einer warmen Aquarell-/Gouache-Serie mit sieben Phasenbildern, ihre Wochenbereiche und die Größenorientierung zum Wochenbeginn sind konkrete Entscheidungen des Agenten. Der Umsetzungsstatus ist keine nachträgliche Nutzerfreigabe des Bildstils.

#### Entscheidung

Sieben eigenständige, mit dem eingebauten Imagegen-Werkzeug generierte PNGs ersetzen den SVG-Renderer im Überblick, in der Wochenreise und in der statischen Startansicht. Eine zuerst erzeugte Illustration dient den weiteren Bildern als Stilreferenz. Die Dateien werden unverändert in das Repository kopiert; genaue Generierungsprompts und relative Referenzdatei stehen in der Herkunftsdatei. Es werden keine Gesundheitsdaten zur Bildgenerierung übermittelt.

| Deutsche SSW | Lokales Phasenbild |
| --- | --- |
| 1–4 | Symbolischer Zellanfang |
| 5–8 | Frühe Embryoform |
| 9–14 | Frühe Babyentwicklung |
| 15–21 | Wachstumsphase 20 |
| 22–28 | Wachstumsphase 24 |
| 29–35 | Reifungsphase 32 |
| 36–42 | Rund um den Termin |

Die Dateinamen sind Gestaltungsbezeichnungen, keine exakte Zuordnung einer medizinisch verifizierten Anatomie zu einem Untersuchungstag. Mehrere Wochen verwenden dasselbe Bild; die Oberfläche sagt dies ausdrücklich. Es gibt weder 42 einzigartige Bilder noch eine tägliche Forminterpolation. Die Serie bleibt illustrativ und nicht maßstabsgetreu; die Haltung behauptet keine tatsächliche Kindslage.

Die Tagesauswahl entfällt vollständig. Die Wochenreise verwendet für die sichtbare Größenorientierung den Anfang der gewählten deutschen SSW: Tag `(SSW − 1) × 7`, beispielsweise 23+0 in der 24. SSW. Der Bezug steht sichtbar dabei. Die Quellenanker und Zwischenwertfunktion bleiben unverändert. Eigene Untersuchungsmaße behalten das genaue Untersuchungsdatum und die passende Messart; die heutige SSW, ET und persönlichen Datierungsdaten ändern sich nicht.

Die ganze PNG-Figur schwebt sanft als Einheit; reduzierte Bewegung deaktiviert die Animation. Transparenz und `object-fit: contain` vermeiden ein verzerrtes oder abgeschnittenes Bild. Alle PNGs liegen unter relativen Projektpfaden. Build und Service Worker nehmen die ganze Serie in den lokalen Offline-Bestand auf. Zur Laufzeit erfolgt kein Abruf bei einem Bilddienst. Beim lokalen PWA-Update wurde ein gemischter Offline-Bestand beobachtet: alte SVG-Importe neben neuen PNG-Modulen. Der Installer lädt deshalb alle Release-Dateien mit `Request.cache = reload` frisch und umgeht veraltete HTTP-Cache-Antworten. Die Aktivierung bleibt ausdrücklich bestätigt; persönliche Datenspeicher werden nicht gelöscht.

#### Erwogene Alternativen

Eine erneute Überarbeitung der SVG-Gelenke hätte die ausdrückliche gestalterische Rückmeldung nur unsicher gelöst. 42 gesonderte generierte Bilder würden Dateigröße und Konsistenzaufwand deutlich erhöhen, ohne eine klinisch abgesicherte Wochenreihe zu ergeben. Gewählt ist eine klar bezeichnete Phasenserie mit unveränderter wöchentlicher Größeninformation.

#### Folgen und Grenzen

Die sieben RGBA-PNGs belegen zusammen 7,07 MiB und vergrößern die erste Offline-Installation und ein Update gegenüber reinem SVG. Ein bewusstes Update muss vollständig geladen sein, bevor alle Phasen offline verfügbar sind. Die Bilder sind KI-generierte redaktionelle Gestaltung; sie ersetzen keine Fachabbildung. Die bestehenden medizinischen Inhalte behalten ihren bisherigen Prüfstand vom 18.11.2026. Das Generierungsdatum ist kein neuer medizinischer Prüfstand.

#### Verifikation

- **220 Tests bestanden** mit `npm test`, keine Fehler oder ausgelassenen Tests. Node 24.22.1 und ein lokal vorhandenes npm wurden über ihre absoluten Installationspfade ausgeführt.
- `npm run build` erfolgreich; alle sieben PNGs im statischen Build und Offline-Manifest. Bildtests prüfen gültige PNG-Signatur, Bilddimensionen, Transparenz, eigenständige Dateien, vollständige Wochenabdeckung, abgewiesene ungültige Wochen sowie unveränderte Größenreferenzen.
- Service-Worker-Tests prüfen Offline-Antworten an einem GitHub-Pages-Unterpfad einschließlich aller PNGs, bewusste Aktivierung und frische Download-Requests für jede Datei.
- Safari: sieben Bilder nebeneinander auf grünem und hellem Hintergrund geprüft; alle sieben dekodiert, ohne abgeschnittene Figurenteile oder sichtbaren rechteckigen Bildhintergrund. Die tatsächliche Wochenreise zeigt die 19. und 40. SSW mit Wochenbeginn, PNG und NHS-Links; kein Tagesregler.
- Safari mit echten App-Inhalten in 320, 390 und 430 px breiten Testframes: PNGs geladen, keine horizontale Überbreite, Tagesregler entfernt, Tageskarte im DOM nach der grünen SSW-Karte. 40. SSW in der mobilen Wochenreise visuell geprüft.
- Lokale PWA bewusst aktualisiert; nach frischem Installer enthalten die geprüften Cache-Antworten für App-, Companion- und Größenmodule durchgängig die PNG-Version. Die zuvor fehlgeschlagene Oberfläche startet nach erneutem Laden wieder vollständig. Gesundheitsdaten wurden nicht zurückgesetzt.
- Temporäre Vergleichs-/Diagnoseseiten werden vor Übergabe durch den abschließenden Build entfernt. Build-/Quellgleichheit, Manifest-Dateien, Dokumentlinks und `git diff --check` werden abschließend kontrolliert.
- Physische iPhone-/Android-Prüfung einschließlich Installation, tatsächlicher Netztrennung und Screenreader bleibt offen. Die Bilder wurden gestalterisch, nicht durch medizinische Illustrationsexperten geprüft. Keine Veröffentlichung.

#### Quellen

- Nutzerfeedback im Gespräch vom 19.11.2026: PNG-Vorschlag und Wegfall der Tagesauswahl.
- [Generierungsprompts und Bildherkunft](../assets/development-prompts.json): eingebautes Imagegen, 19.11.2026, rein gestalterische Herkunft.
- [growth.js](../../src/growth.js) und [AgDR-0029](0029-entwicklung-und-untersuchungsmasse.md): unveränderte medizinische Größenanker und ihre NHS-Quellen sowie die Einordnung eigener Untersuchungsmaße. Die medizinischen Quellen belegen keine Anatomie der generierten Bilder.

</details>

<a id="agdr-0033"></a>

<details>
<summary>AgDR-0033: Bereitgestellte Aquarellserie für alle 42 SSW</summary>

### AgDR-0033: Bereitgestellte Aquarellserie für alle 42 SSW

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Ausdrückliche Nutzeranforderung; Dateinamen-Zuordnung und Integration durch den Agenten
- **Betroffene Dateien:** [Wochenbilder](../../images/development/), [Bildherkunft](../assets/development-series.json), [Renderer](../../src/development-art.js), [Wochenreise](../../src/companion-ui.js), [Startansicht](../../index.html), [Styles](../../styles.css), [Service Worker](../../sw.js), [Bildtests](../../tests/growth.test.js)
- **Ersetzt / ergänzt:** Ersetzt die sieben Bilder und Phasenbereiche aus [AgDR-0032](0041-entwicklungsvisualisierung.md#agdr-0032). Wochenbeginn als Größenbezug, entfallene Tagesauswahl, reduzierte Bewegung und bewusste PWA-Updates bleiben bestehen.

> Darstellung fortgeschrieben durch [AgDR-0034](0041-entwicklungsvisualisierung.md#agdr-0034): eingebrannte Beschriftung in der Ansicht ausgeblendet, runde weiche Maske und kompakteres Motiv. Originaldateien und Wochenzuordnung bleiben bestehen.

#### Kontext und Herkunft

Der Nutzer fordert ausdrücklich, die Bilder aus `embryo_aquarell_42_bilder.zip` zu verwenden. Das im Projekt bereitgestellte Archiv enthält genau 42 PNGs, benannt von `woche_01.png` bis `woche_42.png`. Die Annahme des Agenten ist, dass diese Nummern direkt den deutschen SSW 1 bis 42 entsprechen. Daraus wird keine medizinische Validierung des Motivs abgeleitet.

#### Entscheidung

Jede SSW erhält genau das gleich nummerierte Originalbild: `woche_01.png` für die 1. SSW bis `woche_42.png` für die 42. SSW. Dieselbe Auswahl gilt im Überblick und in der Wochenreise. Die statische Beispielansicht mit 18+3 verwendet Bild 19. Es gibt keine Tagesvarianten. Ungültige Wochen außerhalb 1–42 werden im Renderer zurückgewiesen; die bestehende Begrenzung der Überblicksdarstellung bleibt bestehen.

Die 42 Dateien werden unverändert extrahiert. Papierhintergrund, eingelassene Wochenbeschriftung, Haltung und Bildausschnitt bleiben erhalten. CSS stellt das komplette Bild proportional dar und rundet seine Außenkanten; der bisherige kreisförmige Hintergrund entfällt für diese Serie. Sanfte Bewegung und ihre Abschaltung bei reduzierter Bewegung bleiben erhalten.

Die Bildherkunft steht mit Archivname, SHA-256 des Archivs und je Bild Nummer, Abmessungen, Bytezahl sowie SHA-256 in [development-series.json](../assets/development-series.json). Die Oberfläche nennt das bereitgestellte Archiv und kennzeichnet die Motive als künstlerisch und nicht medizinisch geprüfte Entwicklungsreihe. Insbesondere wird aus einem Motiv oder seiner Drehung weder die tatsächliche Kindslage noch eine tagesgenaue Entwicklung gefolgert. Medizinische Größenwerte bleiben separat mit ihren bisherigen Fachquellen und ihrem unveränderten Prüfstand.

Zum damaligen Stand wurden die ursprünglichen sieben generierten PNGs und das Nutzer-ZIP für den historischen Record aufbewahrt. **Fortschreibung am 19.11.2026 durch [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md):** Die ungenutzten sieben PNGs wurden entfernt; das ZIP ist im Arbeitsverzeichnis ebenfalls nicht mehr erforderlich und war bei der Bereinigung bereits entfernt. [Historische Prompts und Bildprüfsummen](../assets/development-prompts.json) sowie [Herkunft und Prüfsummen der 42 aktuellen Originale](../assets/development-series.json) bleiben erhalten. Der Build kopiert ausschließlich die tatsächlich verwendeten Bilder unter `images/`, keine Archive oder Dokumentationsbestände.

Alle 42 Wochenbilder werden in den statischen Build und dessen Offline-Manifest aufgenommen. Externe Bilddienste oder Laufzeit-Uploads sind nicht beteiligt. Die Originalserie belegt zusammen **67.991.712 Byte, rund 64,84 MiB**. Der erste Offline-Download und ein Bildserien-Update fallen entsprechend größer aus; die Offline-Bereitschaft gilt erst nach vollständiger Installation. Bestehende gespeicherte Gesundheitsdaten werden weder migriert noch gelöscht.

#### Erwogene Alternativen

Die alte Sieben-Phasen-Serie würde die konkrete Nutzeranforderung nicht erfüllen. Zuschneiden, Freistellen oder erneutes Generieren würde die ausdrücklich bereitgestellten Motive verändern. Eine zusätzliche WebP-Serie könnte den Download verkleinern, würde aber abweichende Auslieferungsdateien und eine weitere Konvertierung erfordern. Hier werden die Originale verwendet und ihre Identität überprüfbar dokumentiert.

#### Folgen und Grenzen

Jede der 42 Wochen besitzt ein eigenes Bild. Die Serie ist eine gestalterische Vorgabe, keine medizinische Referenz. Ursprüngliche Illustrationsurheberschaft, Generierungsmethode und klinische Begutachtung wurden mit dem ZIP nicht mitgeliefert; entsprechende Nachweise werden nicht erfunden. Es werden keine fremden Quellen oder Prompts der alten Serie als Herkunft dieser Bilder ausgegeben.

#### Verifikation

- **220 Tests bestanden** mit `npm test`, keine Fehler oder ausgelassenen Tests. Der Bildtest prüft alle 42 Original-PNGs gegen ihre dokumentierten SHA-256-Werte, Bytezahlen und Abmessungen; jede Woche hat einen eigenen Dateinamen und eigenständige Datei. Ungültige Wochen werden zurückgewiesen, medizinische Größenfunktionen bleiben unverändert.
- `npm run build` erfolgreich. Die PWA-Tests prüfen alle Wochenbilder im simulierten Offline-Cache unter einem GitHub-Pages-Unterpfad sowie das bewusste Update.
- Archiv vor dem Extrahieren geprüft: exakt die 42 erwarteten Dateinamen, keine zusätzlichen oder übergeordneten Pfade. Stichproben der Originalmotive für Woche 1, 8, 22 und 42 im Bildbetrachter geprüft.
- Safari: lokale PWA über „Update laden“ bewusst aktualisiert und ohne Datenreset neu gestartet. Mobile App-Inhalte in 320, 390 und 430 px breiten Testframes zeigen jeweils `woche_19.png`, `woche_22.png` und `woche_42.png`, vollständig dekodiert, ohne horizontale Überbreite und ohne Tagesregler. Papierhintergrund und Beschriftung bleiben sichtbar; die mobile Tageskarte steht weiterhin nach der grünen SSW-Karte.
- Abschließender Build hat die temporäre mobile Prüfseite entfernt. 90 Offline-Dateien einschließlich genau 42 Wochenbildern geprüft; alle Auslieferungsdateien identisch zur Quelle, alle 42 PNGs bytegleich zum ZIP. Alte Bilder, ZIP und QA-Seiten werden nicht ausgeliefert. Dokumentlinks und historische Bildherkunft gültig; `git diff --check` ohne Fehler.
- Physische iOS-/Android-Geräte, echter Offline-Kaltstart unter knappem Speicher und medizinische Begutachtung der Motive bleiben ungeprüft. Kein Commit, Push oder Veröffentlichung.

#### Quellen

- Vom Nutzer im Projekt bereitgestellt: `embryo_aquarell_42_bilder.zip`, 19.11.2026. Vollständiger Herkunfts- und Identitätsnachweis: [development-series.json](../assets/development-series.json).
- [AgDR-0032](0041-entwicklungsvisualisierung.md#agdr-0032): unveränderte Größenorientierung, Tagesauswahl und Offline-Update-Regeln.
- [growth.js](../../src/growth.js): unveränderte medizinische Größenanker mit NHS-Quellen; sie belegen nicht die Anatomie oder Wochenbeschriftung der bereitgestellten Bilder.

</details>

<a id="agdr-0034"></a>

<details>
<summary>AgDR-0034: Runde Bildmaske und getrennte Wochenanzeige</summary>

### AgDR-0034: Runde Bildmaske und getrennte Wochenanzeige

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Ausschnitt, Verlauf und Abstände durch den Agenten
- **Betroffene Dateien:** [Bildrenderer](../../src/development-art.js), [statische Startansicht](../../index.html), [Styles](../../styles.css)
- **Ersetzt / ergänzt:** Ersetzt die vollständige rechteckige Anzeige einschließlich eingebrannter Beschriftung aus [AgDR-0033](0041-entwicklungsvisualisierung.md#agdr-0033). Originaldateien, Herkunft und Wochenzuordnung bleiben bestehen.

> Form fortgeschrieben durch [AgDR-0036](0041-entwicklungsvisualisierung.md#agdr-0036): unregelmäßige weiche Kontur statt perfektem Kreis; Ausschnitt, Zoom und getrennte Beschriftung bleiben bestehen.

#### Kontext und Herkunft

Der Nutzer möchte die Wochennummer vom Bild trennen und die Illustration rund ausschneiden sowie nach außen ausblenden. Auf den ersten Maskenentwurf folgt die Rückmeldung „Guter Anfang, aber noch gefällt es mir nicht“ mit einem Screenshot. Darin ist ein großer heller Hof sichtbar, und der Bildhinweis überlappt den unteren Bildrand. Die Interpretation, den Hof zu verkleinern, das Motiv näher heranzuholen und den Hinweis unterhalb zu halten, stammt vom Agenten. Sie ist keine bestätigte gestalterische Nutzerfreigabe.

#### Entscheidung

Eine eigene quadratische Maskenebene umschließt das PNG innerhalb der bestehenden Bewegungsgruppe. Sie verbirgt den unteren Beschriftungsstreifen und blendet das Bild mit einem radialen Alpha-Verlauf zum Kreisrand aus. Standard- und WebKit-Maskenregeln werden lokal im Stylesheet angegeben. Kreisförmiges Clipping dient als Rückfall für Browser ohne weiche Maskierung.

Die unbeschnittenen Originaldateien bleiben bytegleich erhalten. Die Beschriftung wird nur in der Ansicht ausgeblendet. Die SSW steht weiterhin als eigener HTML-Text in der Karte und der Wochenreise; Alternativtext und Wochenwahl bleiben zugänglich. Die statische Startillustration verwendet dieselbe Struktur.

Der Basisausschnitt verwendet ein Bildfeld mit 120 % Höhe und `object-fit: cover`, am oberen Rand ausgerichtet. Bei den Originalen mit 1200 × 1320 Pixeln zeigt das quadratische Sichtfenster dadurch die oberen ungefähr 1100 Quellpixel; die darunter stehende Wochennummer bleibt außerhalb. Zusätzliche rein gestalterische Zoomfaktoren holen kleinere Motive näher heran: Wochen 1–8 mit 1,65, Wochen 9–24 mit 1,45, Wochen 25–32 mit 1,18 und Wochen 33–42 mit 1,04. Diese Faktoren verändern weder medizinische Größenangaben noch eine persönliche Prognose.

Der Alpha-Verlauf beginnt bereits innerhalb des Kreises weich auszulaufen, statt einen weitgehend deckenden weißen Teller mit schmalem weichem Rand zu bilden. Im Überblick ist die Illustration auf maximal 212 CSS-Pixel begrenzt und bleibt quadratisch. Ein eigener Abstand von 12 Pixeln und ein normaler Textfluss halten den Hinweis vollständig unterhalb. Die bestehende dezente Bewegung betrifft die gesamte maskierte Figur; reduzierte Bewegung bleibt statisch.

Es entstehen keine bearbeiteten PNGs, zusätzlichen Downloads, neuen Dienste oder gespeicherten Gesundheitsdaten. Die Darstellung funktioniert mit denselben lokal gecachten Dateien offline. Datierung, Maße, Quellen und medizinischer Prüfstand ändern sich nicht.

#### Erwogene Alternativen

Beschriftung und Papier per Bildbearbeitung zu entfernen würde neue abgeleitete Dateien erfordern. Ein ausschließlich runder harter Ausschnitt würde den gewünschten weichen Übergang nicht erfüllen. Ein großer fast deckender Kreis wurde im ersten Entwurf sichtbar als zu dominant eingeordnet und durch den kompakteren, breiter auslaufenden Ausschnitt ersetzt.

#### Folgen und Grenzen

Die Papiertextur bleibt im Motivzentrum sichtbar; dies ist keine pixelgenaue Freistellung des Körpers. Die Maske blendet Randbereiche einschließlich äußerer Motivdetails bewusst aus. Geänderte Bildformate oder anders platzierte Beschriftungen benötigen eine erneute Ausschnittprüfung. Die tatsächliche Kindslage wird aus keiner Pose abgeleitet.

#### Verifikation

- **220 Tests bestanden** mit `npm test`, keine Fehler oder ausgelassenen Tests. Die unveränderten Quellenbilder werden weiter gegen ihre dokumentierten SHA-256-Werte, Bytezahlen und Abmessungen geprüft.
- `npm run build` erfolgreich. Die erste Maskierung wurde in Safari für alle 42 geladenen Motive auf abwechselnd hellem und grünem Hintergrund geprüft; die eingebrannte Beschriftung bleibt außerhalb des Ausschnitts.
- Die verfeinerte Darstellung wurde mit echten App-Inhalten in 320 und 430 px breiten Safari-Testframes geprüft: quadratische Kreise, aktive radiale Maske, keine horizontale Überbreite, Hinweistext unterhalb des Überblicksbildes; 42. SSW separat visuell geprüft.
- Die eingebettete QA-Seite verwendete zunächst alte Safari-Modulantworten mit einem inzwischen entfernten SVG-Import. Sie wurde mit temporären frischen Modulpfaden wiederholt; die reguläre App startet, die mobile Prüfung wurde danach erfolgreich abgeschlossen. Diese QA-Pfade werden nicht ausgeliefert.
- Abschließender Build hat alle temporären Prüfdateien entfernt. 90 Auslieferungsdateien sind quellenidentisch; alle 42 PNGs bleiben bytegleich zum Nutzer-ZIP. Dokumentlinks gültig; `git diff --check` ohne Fehler.
- Physische iPhone-/Android- und Screenreader-Prüfung bleiben offen. Keine medizinische Begutachtung der Motive, kein Commit oder Veröffentlichung.

#### Quellen

- Nutzeranforderung und Screenshot im Gespräch vom 19.11.2026: getrennte Wochennummer, runder Ausschnitt, weicher Rand und anschließende gestalterische Rückmeldung.
- [Bildherkunft und unveränderte Originale](../assets/development-series.json), [AgDR-0033](0041-entwicklungsvisualisierung.md#agdr-0033).

</details>

<a id="agdr-0035"></a>

<details>
<summary>AgDR-0035: Grüner Verlauf der SSW-Karte</summary>

### AgDR-0035: Grüner Verlauf der SSW-Karte

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Farben und Verlauf durch den Agenten
- **Betroffene Dateien:** [styles.css](../../styles.css)
- **Ersetzt / ergänzt:** Ergänzt [AgDR-0034](0041-entwicklungsvisualisierung.md#agdr-0034); die bisher einfarbige SSW-Karte erhält einen Verlauf.

> Verstärkt durch [AgDR-0037](0041-entwicklungsvisualisierung.md#agdr-0037): breiteres helles Kartenumfeld und früher beginnende Ausblendung des Bildes.

#### Kontext und Herkunft

Der Nutzer schlägt einen Farbverlauf für die grüne Karte vor, damit die Aquarellillustration passender eingebunden wirkt. Die Wahl von dunklem Waldgrün mit einer sanften salbeigrünen Aufhellung hinter dem Motiv stammt vom Agenten; sie ist keine ausdrückliche gestalterische Nutzerfreigabe.

#### Entscheidung

Die bestehende Karte erhält einen diagonalen Grünverlauf und darüber eine breite radiale Aufhellung im oberen rechten Bildbereich. Die Aufhellung läuft zur linken Textspalte und zur unteren Fortschrittszeile aus. Die vorhandene Grundfarbe bleibt als Rückfall bestehen.

Der Verlauf wird ausschließlich durch lokale CSS-Hintergründe erzeugt. Bilddateien, runde Bildmaske, Abstände, Textfarben, Bewegung und Berechnungen werden nicht verändert. Es gibt keine zusätzliche Animation oder externe Ressource; die Darstellung ist Bestandteil des Offline-Stylesheets.

#### Erwogene Alternativen

Ein heller Verlauf über die gesamte Karte könnte die Lesbarkeit der hellen Beschriftung beeinträchtigen. Ein weiterer kleiner Leuchtkreis würde die vorhandene Bildmaske optisch verdoppeln. Gewählt ist deshalb eine breite, ruhige Aufhellung innerhalb der bestehenden grünen Farbwelt.

#### Folgen und Grenzen

Der Papierhintergrund des Originalmotivs bleibt im Zentrum sichtbar. Der Verlauf vermittelt zwischen diesem hellen Zentrum und der grünen Karte, ersetzt aber keine Freistellung. Eine rein gestalterische Änderung erneuert keinen medizinischen Quellenprüfstand.

#### Verifikation

- `npm run build` erfolgreich; die Änderung betrifft ausschließlich Darstellung und Dokumentation. Keine Berechnungsänderung und keine neuen Implementierungstests.
- Lokale PWA in Safari aktualisiert und sichtbare Karte im App-Layout geprüft: breite Aufhellung hinter dem Motiv, dunkle Textspalte und Fortschrittsbereich, Bildhinweis weiter unterhalb des Bildes.
- 90 Builddateien einschließlich Offline-Manifest mit der Quelle abgeglichen; Dokumentlinks gültig und `git diff --check` ohne Fehler. Keine zusätzlichen Assets.
- Lesbarkeit visuell geprüft; keine instrumentelle Kontrastmessung oder physische Geräteprüfung in diesem Schritt.

#### Quellen

- Nutzeranforderung und Screenshot im Gespräch vom 19.11.2026.
- [AgDR-0034](0041-entwicklungsvisualisierung.md#agdr-0034): unveränderte runde Maske und Textabstände.

</details>

<a id="agdr-0036"></a>

<details>
<summary>AgDR-0036: Organische Aquarellmaske</summary>

### AgDR-0036: Organische Aquarellmaske

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Kontur und Ausblendung durch den Agenten
- **Betroffene Dateien:** [SVG-Maske](../../images/development-mask.svg), [Styles](../../styles.css), [Service Worker](../../sw.js)
- **Ersetzt / ergänzt:** Ersetzt die perfekte Kreisform aus [AgDR-0034](0041-entwicklungsvisualisierung.md#agdr-0034). Ausschnitt, Zoom und Textabstände sowie der Kartenverlauf aus [AgDR-0035](0041-entwicklungsvisualisierung.md#agdr-0035) bleiben bestehen.

> Verstärkt durch [AgDR-0037](0041-entwicklungsvisualisierung.md#agdr-0037): breiteres helles Kartenumfeld und früher beginnende Ausblendung des Bildes.

> Maskierung fortgeschrieben durch [AgDR-0038](0041-entwicklungsvisualisierung.md#agdr-0038): ruhigere leicht asymmetrische Kontur und mehr Deckkraft im Motiv. Der Kartenverlauf bleibt bestehen.

#### Kontext und Herkunft

Der Nutzer fordert eine unregelmäßige Maskenform statt eines perfekten Kreises. Die Wahl einer ruhigen, asymmetrischen Aquarellkontur mit sanften Ausbuchtungen und weichem Rand stammt vom Agenten; sie ist keine nachträgliche gestalterische Nutzerfreigabe.

#### Entscheidung

Eine kleine lokale SVG-Datei definiert eine eigene organische Bézier-Kontur. Ein Alpha-Verlauf und eine Gauß-Weichzeichnung lassen die Kontur nach außen auslaufen. CSS verwendet diese SVG sowohl über die Standard- als auch über die WebKit-Maskeneigenschaft. Die statische Maske wird zusammen mit der vorhandenen Bildgruppe sanft bewegt; eine zusätzliche Formanimation wird nicht eingeführt.

Bei unterstützter Maskierung entfällt das harte kreisförmige Clipping. Als Rückfall ohne CSS-Maskenunterstützung dient eine asymmetrische Form aus unterschiedlichen horizontalen und vertikalen Eckradien.

Die gleiche Maske wirkt auf alle 42 Wochenbilder im Überblick und der Wochenreise. Die eingebrannte Nummer bleibt durch den bestehenden Ausschnitt verborgen; SSW und Hinweis stehen weiterhin außerhalb des Bildes. Die Original-PNGs werden nicht verändert.

Die Maskendatei liegt unter einem relativen lokalen Pfad und wird beim Build sowie im Service Worker aufgenommen. Sie enthält keine Skripte, externen Ressourcen oder Gesundheitsdaten. Die Darstellung bleibt offline und GitHub-Pages-kompatibel. Medizinische Berechnungen, Bildherkunft und Prüfstand bleiben unverändert.

#### Erwogene Alternativen

Nur unterschiedliche Eckradien würden eine weiche, unregelmäßige Alphakontur nicht ausreichend bestimmen. Eine Zufallsverformung oder dauernd morphende Form könnte unruhig wirken. Gewählt ist eine feste eigene Kontur mit lokalem Weichzeichner.

#### Folgen und Grenzen

Die Kontur ist bewusst leicht unregelmäßig und blendet äußere Bilddetails aus. Sie stellt den Körper nicht pixelgenau frei. Bei nicht geladenem Maskenbild kann der Browser den maskierten Inhalt ausblenden; deshalb ist die Datei Bestandteil des vollständigen Offline-Bestands.

#### Verifikation

- **220 Tests bestanden**, keine Fehler oder ausgelassenen Tests, mit `npm test`. Die vorhandenen PWA-Tests prüfen auch die Existenz der neuen vorab gecachten Maskendatei.
- `npm run build` erfolgreich. Die neue SVG ergänzt die bestehenden Offline-Dateien.
- Lokale PWA in Safari aktualisiert und die 19. SSW im App-Layout visuell geprüft: unregelmäßige weiche Außenkontur, sichtbares Motiv und getrennte Beschriftung; kein perfekter Kreis mehr.
- 91 Builddateien einschließlich der neuen SVG-Maske quellenidentisch; SVG als gültiges XML ohne Skripte oder eingebettete Fremdinhalte geprüft. Dokumentlinks gültig und `git diff --check` ohne Fehler.
- Physische iPhone-/Android-Geräte sowie die Rückfallanzeige ohne CSS-Maskenunterstützung bleiben ungeprüft.

#### Quellen

- Nutzeranforderung im Gespräch vom 19.11.2026: unregelmäßige Form statt perfektem Kreis.
- Eigene Vektorkontur des Agenten: [development-mask.svg](../../images/development-mask.svg); keine medizinische Bildquelle.
- Unveränderte Originalserie: [Bildherkunft](../assets/development-series.json).

</details>

<a id="agdr-0037"></a>

<details>
<summary>AgDR-0037: Breiter Bildübergang in die SSW-Karte</summary>

### AgDR-0037: Breiter Bildübergang in die SSW-Karte

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Farbflächen und Alphaverlauf durch den Agenten
- **Betroffene Dateien:** [Styles](../../styles.css), [Bildmaske](../../images/development-mask.svg)
- **Ersetzt / ergänzt:** Verstärkt den Kartenverlauf aus [AgDR-0035](0041-entwicklungsvisualisierung.md#agdr-0035) und ersetzt den engeren Alphaverlauf aus [AgDR-0036](0041-entwicklungsvisualisierung.md#agdr-0036). Die organische Kontur bleibt erhalten.

> Maskierung fortgeschrieben durch [AgDR-0038](0041-entwicklungsvisualisierung.md#agdr-0038): ruhigere leicht asymmetrische Kontur und mehr Deckkraft im Motiv. Der Kartenverlauf bleibt bestehen.

#### Kontext und Herkunft

Der Nutzer wünscht mehr Verlauf, damit das Bild weniger aus der Karte heraussteht. Der Screenshot zeigt weiterhin eine helle Papierfläche mit deutlichem Helligkeitssprung zur Umgebung. Die Entscheidung des Agenten ist, die Kartenaufhellung in Richtung des Papierfarbtons zu verbreitern und gleichzeitig den Maskenverlauf früher beginnen zu lassen. Dies ist keine bestätigte gestalterische Nutzerfreigabe.

#### Entscheidung

Die rechte obere Kartenhälfte erhält einen breiteren, helleren Übergang von warmem Salbei zum Grün der Karte. Zwei darüberliegende Verläufe dunkeln die linke Textspalte und die untere Fortschrittszeile gezielt ab. Die helle Fläche gehört damit zur Karte statt allein zum Bild.

Die Bildmaske beginnt nahe dem Zentrum mit einer sanften Transparenz und blendet über mehrere Zwischenstufen bis vollständig transparent aus. Die Gauß-Weichzeichnung steigt von 8 auf 12 SVG-Einheiten. Es gibt keinen großen vollständig deckenden Innenbereich mehr; die individuelle Kontur, der Ausschnitt und die getrennte Beschriftung bleiben bestehen.

Die Änderung betrifft ausschließlich lokale CSS- und SVG-Gestaltung. Es entstehen keine neuen Dateien für die 42 Originalmotive und keine zusätzlichen Dienste. Layout, Bewegung, Datenhaltung, SSW-/Größenberechnung und medizinische Quellen bleiben unverändert.

#### Erwogene Alternativen

Nur den Rand stärker weichzuzeichnen würde den hellen Papierkern nicht ausreichend mit der Karte verbinden. Eine gleichmäßige Transparenz über das gesamte Bild könnte die Illustration schwächen. Gewählt ist deshalb die Kombination aus hellerem Umfeld und abgestuftem Alpha.

#### Folgen und Grenzen

Die zentrale Papiertextur bleibt erkennbar; die Änderung ist keine Freistellung des Körpers. Äußere Motivdetails gehen bewusst weicher in die Karte über. Die Abdunklung an Text- und Fortschrittsbereichen dient der Lesbarkeit.

#### Verifikation

- `npm run build` erfolgreich. Reine Gestaltungsänderung; keine Berechnungsänderung und keine neuen Implementierungstests.
- Lokale PWA in Safari aktualisiert und die 19. SSW im App-Layout visuell geprüft: breiter heller Kartenbereich geht in das Bild über, Motivränder blenden früh aus; Text und Fortschrittsanzeige bleiben sichtbar auf dunklerem Grund.
- 91 Builddateien quellenidentisch, SVG als XML gültig und Dokumentlinks geprüft; `git diff --check` ohne Fehler. Keine neuen Ressourcen oder PNG-Änderungen.
- Lesbarkeit visuell geprüft; instrumentelle Kontrastmessung und physische Geräteprüfung in diesem Schritt offen.

#### Quellen

- Nutzeranforderung und Screenshot im Gespräch vom 19.11.2026: mehr Verlauf und weniger abgesetztes Bild.
- [AgDR-0035](0041-entwicklungsvisualisierung.md#agdr-0035), [AgDR-0036](0041-entwicklungsvisualisierung.md#agdr-0036): bisheriger Kartenverlauf und organische Maske.

</details>

<a id="agdr-0038"></a>

<details>
<summary>AgDR-0038: Ruhigere Maske mit klarerem Motiv</summary>

### AgDR-0038: Ruhigere Maske mit klarerem Motiv

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzeranforderung; Kontur und Alpha-Abstufung durch den Agenten
- **Betroffene Dateien:** [Bildmaske](../../images/development-mask.svg)
- **Ersetzt / ergänzt:** Ersetzt die stärker gewellte Kontur aus [AgDR-0036](0041-entwicklungsvisualisierung.md#agdr-0036) und den früh transparenten Innenbereich aus [AgDR-0037](0041-entwicklungsvisualisierung.md#agdr-0037). Der breite Kartenverlauf bleibt bestehen.

#### Kontext und Herkunft

Der Nutzer möchte mehr Illustration sehen und den Rand wieder ruhiger gestalten. Der Agent ordnet die zuletzt stark ausgeblendeten Füße und die Nabelschnur als zu schwach sichtbar ein und interpretiert „ruhiger“ als weniger Ausbuchtungen bei erhaltener leichter Asymmetrie. Diese Umsetzung ist keine nachträgliche gestalterische Nutzerfreigabe.

#### Entscheidung

Die Maske verwendet vier weite, fließende Bézier-Abschnitte statt vieler kleiner Ein- und Ausbuchtungen. Es entsteht eine leicht asymmetrische ovale Form. Eine minimale Vergrößerung nach unten und links gibt äußeren Motivteilen mehr Raum.

Der innere Alphaverlauf bleibt bis zur Hälfte seines Radius bei 96 % Deckkraft und hält auch danach die Illustration länger sichtbar. Erst der äußere Bereich blendet stärker zur Karte aus. Die Weichzeichnung beträgt 10 statt 12 SVG-Einheiten. Die Maskenmitte wird vertikal leicht abgesenkt, der Verlaufsradius von 60 auf 64 % erweitert.

Die Änderung wirkt auf alle 42 Wochenbilder im Überblick und der Wochenreise. Der breite Kartenverlauf, Bildausschnitt, Zoom, Beschriftung, Bewegung, medizinische Angaben und Original-PNGs bleiben unverändert. Es entstehen keine neuen Dateien oder Laufzeitabhängigkeiten.

#### Erwogene Alternativen

Ein erneuter perfekter Kreis würde die vorherige Anforderung nach leichter Unregelmäßigkeit aufgeben. Ein größerer Bildzoom würde äußere Körperteile eher beschneiden. Gewählt ist deshalb mehr Deckkraft innerhalb einer ruhigeren Maskenkontur.

#### Folgen und Grenzen

Die Illustration soll klarer sichtbar werden, während der Rand weiterhin ausläuft. Die Papiertextur bleibt vorhanden. Äußerste Bildbereiche werden weiterhin bewusst ausgeblendet; es handelt sich um eine Illustration ohne individuelle anatomische Aussage.

#### Verifikation

- `npm run build` erfolgreich. Reine SVG-Gestaltungsänderung; keine Berechnungsänderung oder neuen Implementierungstests.
- Lokale PWA in Safari aktualisiert und die 19. SSW im App-Layout visuell geprüft: ruhigere Kontur und deutlicher sichtbare Füße sowie Nabelschnur, Hinweistext weiterhin unterhalb des Bildes.
- 91 Offline-Builddateien quellenidentisch, SVG als XML gültig, Dokumentlinks geprüft und `git diff --check` ohne Fehler. Keine neuen Ressourcen.
- Physische Geräteprüfung und erneute Sichtprüfung aller 42 Motive bleiben in diesem Schritt offen.

#### Quellen

- Nutzerfeedback und Screenshot im Gespräch vom 19.11.2026: mehr Illustration und ruhigerer Rand.
- [AgDR-0036](0041-entwicklungsvisualisierung.md#agdr-0036), [AgDR-0037](0041-entwicklungsvisualisierung.md#agdr-0037): bisherige Kontur und früher Alphaverlauf.

</details>

<a id="agdr-0039"></a>

<details>
<summary>AgDR-0039: Salbeitönung des Papierhintergrunds</summary>

### AgDR-0039: Salbeitönung des Papierhintergrunds

- **Status:** Umgesetzt
- **Datum:** 2026-11-19
- **Entscheidende Instanz:** Nutzerzustimmung zum Vorschlag; konkrete Farbauswahl durch den Agenten
- **Betroffene Dateien:** [index.html](../../index.html), [Styles](../../styles.css)
- **Ersetzt / ergänzt:** Ergänzt [AgDR-0038](0041-entwicklungsvisualisierung.md#agdr-0038). Maskenform und Kartenverlauf bleiben bestehen.

#### Kontext und Herkunft

Der Nutzer stimmt mit „okay“ dem Vorschlag zu, den fast weißen Papierbereich salbeifarben zu tönen und abzudunkeln, während die Illustration klar bleiben soll. Die Auswahl eines selektiven SVG-Farbfilters und seiner numerischen Werte stammt vom Agenten; eine gestalterische Abnahme des Ergebnisses wird nicht behauptet.

#### Entscheidung

Ein lokaler SVG-Filter in den Definitionen der HTML-Seite ermittelt eine weiche Auswahl heller, annähernd neutraler Pixel. Die Gewichtung der sRGB-Kanäle lautet für diese Auswahl `clamp(−3R + 4G + 4B − 4, 0, 1)`. Eine darüber zusammengesetzte Salbeifarbe mit 50 % maximaler Deckkraft tönt vorrangig den Papiergrund. Warme, stärker rötliche Mitteltöne und dunkle Konturen erhalten dabei keine zusätzliche Farbauflage.

Der Filter gilt ausschließlich für die Illustration auf der grünen Überblickskarte. Die Wochenreise auf hellem Grund zeigt weiterhin die ursprünglichen Farben. Die PNG-Dateien selbst bleiben unverändert. Maskenform, Zoom, Abstände, Hintergrundverlauf und Bewegung werden nicht geändert.

CSS referenziert den SVG-Filter innerhalb desselben Dokuments. Es gibt keine zusätzliche Datei, keinen externen Bildaufruf und keine Laufzeit-Datenübertragung. Der vorhandene Offline-Build enthält die Definitionen und das Stylesheet.

#### Erwogene Alternativen

Eine pauschale Farbkorrektur oder Multiply-Mischung würde auch die warmen Körperfarben abdunkeln. Dauerhaft veränderte PNGs würden abweichende Bilddateien erfordern. Gewählt ist eine selektive und jederzeit reversible Darstellungsanpassung.

#### Folgen und Grenzen

Die Auswahl ist eine Farbnäherung und keine semantische Trennung von Papier und Baby. Sehr helle, annähernd neutrale Motivlichter können geringfügig mitgetönt werden. Die Quelle bleibt ein Aquarell mit Papiertextur; es wird keine Freistellung oder anatomische Verarbeitung behauptet. Medizinische Daten und Quellen bleiben unverändert.

#### Verifikation

- `npm run build` erfolgreich. Reine Gestaltungsänderung; keine Berechnungsänderung oder neuen Implementierungstests.
- Rechenstichproben mit synthetischen sRGB-Farben: Papier (243,241,233) wird zu (221,225,211); warmer Mittelton (232,181,164) und dunkle Kontur (174,113,101) bleiben unverändert. Dies sind Modellproben, keine Behauptung über jedes Bildpixel.
- Lokale PWA in Safari aktualisiert und die 19. SSW im App-Layout visuell geprüft: der Papierbereich ist gedämpft und salbeifarben, warme Motivfarben und Konturen bleiben erkennbar. Der lokale Filterverweis funktioniert in dieser Safari-Sichtprüfung.
- 91 Builddateien quellenidentisch, Filterdefinition als gültiges SVG-XML mit eindeutiger ID geprüft, Dokumentlinks gültig; `git diff --check` ohne Fehler. Keine neue Offline-Datei.
- Physische Geräte und andere Browser sowie vollständige farbmetrische Prüfung aller 42 Motive bleiben in diesem Schritt offen.

#### Quellen

- Agentenvorschlag und ausdrückliche Nutzerzustimmung im Gespräch vom 19.11.2026.
- Unveränderte Originalserie: [Bildherkunft](../assets/development-series.json).
- [AgDR-0038](0041-entwicklungsvisualisierung.md#agdr-0038): bestehende Maskenform und Motivdarstellung.

</details>

