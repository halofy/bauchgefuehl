# AgDR-0013: App-Layout auf großen Smartphones und installierten PWAs

- **Status:** Umgesetzt; automatisiert und in Safari geprüft, physisches Smartphone offen
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzer meldet Desktopdarstellung auf großem Smartphone und wünscht angepasste Grenzen oder App-Layout bei Installation; konkrete Erkennungsregeln durch den Agenten
- **Betroffene Dateien:** [Layout-Erkennung](../../src/layout.js), [Navigation](../../src/navigation.js), [Journal](../../src/journal-ui.js), [Stylesheet](../../styles.css), [Offline-Dateiliste](../../sw.js), [Tests](../../tests/layout.test.js), [README](../../README.md)
- **Ersetzt teilweise:** [AgDR-0010](0010-mobile-app-und-pwa.md), bisherige alleinige 760-Pixel-Grenze für das App-Layout

## Kontext und Herkunft

Der Nutzer sieht auf seinem Smartphone mit großem Display die Desktopdarstellung trotz der zuvor eingeführten App-Navigation. Er schlägt breitere Grenzen beziehungsweise die Aktivierung anhand des Installationsmodus vor. Bislang verwendeten Navigation und Journal unabhängig voneinander `max-width: 760px`; auch die mobilen CSS-Regeln waren daran gebunden. Der Standalone-Modus beeinflusste lediglich die Installationshinweise.

Es liegt keine genaue Geräte-/Browserangabe vor. Deshalb wird die Erkennung grundsätzlich korrigiert, ohne ein einzelnes Gerätemodell oder eine User-Agent-Zeichenkette vorauszusetzen.

## Entscheidung

Die App verwendet eine gemeinsame Layout-Entscheidung in `src/layout.js`. Das App-Layout gilt, sobald eine der folgenden Bedingungen erfüllt ist:

1. Die vom Browser für die Media Query ausgewertete Breite beträgt höchstens **900 CSS-Pixel**.
2. Die Breite beträgt höchstens **1200 CSS-Pixel**, das primäre Eingabegerät ist ungenau (`pointer: coarse`) und besitzt keine Hover-Funktion (`hover: none`). Das berücksichtigt breitere Touch-Ansichten, zum Beispiel im Querformat.
3. Der aktuelle Browserkontext ist eine **Standalone-PWA** (`display-mode: standalone`), unabhängig von der Breite. Zusätzlich wird Safaris `navigator.standalone === true` berücksichtigt.

Der Start einer installierten App aktiviert damit auch auf großen Fenstern die fünf Bereiche und die feste untere Navigation. Eine bloße Installation schaltet einen weiterhin normalen breiten Browser-Tab nicht um; entscheidend ist der aktuelle Darstellungsmodus. Ein breiter normaler Desktop-Tab bleibt bei der Seitenansicht.

Die Entscheidung setzt die Klasse `app-layout` am HTML-Wurzelelement. Alle zuvor an 760 Pixel gebundenen Layout-Regeln folgen dieser Klasse: Grundgestaltung, feste Navigation, große Touch-Ziele, mobile Dialoge und kompaktes Journal. `:where()` hält die Selektorspezifität der bisherigen Regeln niedrig, damit zusätzliche Regeln für sehr kleine Bildschirme weiter greifen.

Navigation und Journal abonnieren dieselbe Entscheidung. Medienänderungen und die Rückkehr über `pageshow` werden berücksichtigt. Abonnenten werden nur bei einem tatsächlichen Wechsel zwischen App- und Desktoplayout benachrichtigt. Dadurch werden etwa bewusst geöffnete Journalfilter nicht bei jedem Resize innerhalb desselben Modus zurückgesetzt. Der ausgewählte Bereich bleibt beim Wechsel erhalten; im Desktopmodus wird zu ihm gescrollt.

Das neue Modul wird auch in die Offline-Dateiliste aufgenommen. Der vorhandene Build erzeugt daraus eine neue Cacheversion; die bewusste Updateübernahme bleibt erhalten.

## Erwogene Alternativen

- **Nur die Grenze in CSS erhöhen:** Navigation und Journal könnten weiterhin nach der alten Grenze arbeiten und nicht zur Darstellung passen.
- **Nur die Grenze in drei Dateien parallel ändern:** Löst den Installationsfall nicht und begünstigt spätere Abweichungen.
- **Nur Standalone erkennen:** Behebt die breite Smartphoneansicht im normalen Browser nicht.
- **Jedes Gerät mit irgendeinem Touchscreen umschalten:** Würde auch breite Desktopgeräte mit zusätzlichem Touchscreen treffen. Stattdessen werden primäre Eingabe, Hover und Breite gemeinsam berücksichtigt.
- **Gerätemodelle aus dem User-Agent ableiten:** Wäre fragil und für die konkrete Layoutentscheidung unnötig.

## Folgen und Grenzen

Es gibt keine neue Abhängigkeit und keine Änderung an Berechnung, persönlichen Daten, Sync-Protokoll oder Speicherformat. Statische GitHub-Pages-Auslieferung und Offline-Nutzung bleiben erhalten. Das App-Layout benötigt wie die vorhandene App JavaScript; bei deaktiviertem JavaScript gilt weiterhin der vorhandene Hinweis.

CSS-Pixel entsprechen nicht den Hardwarepixeln des Displays. Browserzoom, Desktop-Webseitenmodus und die vom Browser gemeldeten Eingabeeigenschaften können die Auswahl beeinflussen. Oberhalb von 1200 CSS-Pixeln bleibt ein normaler Touch-Browser bei der Desktopansicht; der Standalone-Modus aktiviert das App-Layout weiterhin unabhängig davon. Das ist eine Agentenfestlegung innerhalb der gewünschten Korrektur.

Zum Übernehmen muss der neue Build bereitgestellt werden. Bei installierter beziehungsweise gecachter App anschließend über das Info-Symbol **Update laden** wählen, vorher offene Eingaben speichern. Es ist kein Löschen der Website-Daten erforderlich.

## Verifikation

Am 17.11.2026 durchgeführt:

- **82 automatisierte Tests bestanden**, einschließlich vier neuer Tests zur initialen Layoutklasse, zum Safari-Standalone-Fallback, zur Benachrichtigung bei Moduswechseln und zum Erhalt des ausgewählten Navigationsbereichs beim Wechsel zurück zum Desktop.
- PWA-Build erfolgreich, inklusive neuem Layout-Modul und geänderter Cacheversion. Mangels `npm` im PATH wurden die Skriptziele direkt mit der vorhandenen Node-Laufzeit ausgeführt: `node --test tests/*.test.js` und `node scripts/build.js`.
- Isolierte lokale Safari-Prüfseite mit neun Fällen: tatsächliche Layoutbreiten von 390, 820, 900, 901 und 1440 CSS-Pixeln; simulierte Touch-Eigenschaften bei 980, 1200 und 1201 Pixeln sowie simuliertes `navigator.standalone` bei 1440 Pixeln. Alle neun Fälle bestanden. Geprüft wurden Layoutklasse, feste Navigation am unteren Viewportrand, Sichtbarkeit inaktiver Bereiche, eingeklappte Journalfilter/Verläufe und fehlender horizontaler Überlauf im Überblick.
- In Safari reduziert eine sichtbare Scrollleiste die für diese Prüfungen gemessene Inhaltsbreite gegenüber `innerWidth`. Die Prüfseite wurde entsprechend kalibriert; erste Grenzfall-Erwartungen ohne Berücksichtigung dieser Scrollleiste wurden korrigiert. Die Produktionsregeln wurden dadurch nicht verändert.
- Dokumentationslinks, eindeutige AgDR-Nummern und `git diff --check` geprüft.

Offen bleiben der erneute Start auf einem tatsächlich installierten iOS-/Android-Gerät, die konkrete Konfiguration des Nutzergeräts und eine vollständige Browsermatrix. Die Simulation ist kein Nachweis einer physischen PWA-Installation. Es wurden keine echten Gesundheitsdaten verwendet und keine Browser-Sicherheitseinstellungen verändert.

## Quellen

- [W3C: Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/) – `display-mode` und primäre Eingabeeigenschaften.
- [MDN: display-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/display-mode), [MDN: pointer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/pointer).
- [Layout-Tests](../../tests/layout.test.js), [PWA-Tests](../../tests/pwa.test.js).
