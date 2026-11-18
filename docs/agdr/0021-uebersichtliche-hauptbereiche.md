# AgDR-0021: Klare Hauptbereiche und Informationen bei Bedarf

- **Status:** Umgesetzt; Hauptbereiche in Safari und vier Inhaltsbreiten geprüft
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzerwunsch nach Übersichtlichkeit; konkrete Informationsaufteilung durch den Agenten
- **Betroffene Dateien:** [Navigation](../../src/navigation.js), [HTML](../../index.html), [Styles](../../styles.css), [Wissensoberfläche](../../src/guide-ui.js), [Kalenderoberfläche](../../src/calendar-ui.js)
- **Ersetzt teilweise:** [AgDR-0010](0010-mobile-app-und-pwa.md) hinsichtlich fortlaufender Desktopseite; erweitert [Kalender](0014-kalender-und-journal.md), [Wissenssuche](0017-lebensmittel-und-aktivitaeten.md)

## Kontext und Herkunft

Der Nutzer findet die App teilweise unübersichtlich und wünscht klare Bereiche mit einem gesonderten Teil für ausführlichere Informationen. Die fünf vorhandenen Bereiche bleiben als bekannte Orientierung erhalten.

## Entscheidung

Auf Smartphone und Desktop ist jeweils genau einer von Überblick, Wochenreise, Kalender, Vorsorge und Wissen sichtbar. Die Navigation wechselt bewusst zwischen ihnen; Scrollpositionen je Bereich bleiben erhalten. Die bisherige Desktop-Scrollspionage entfällt, weil ausgeblendete Bereiche sonst fälschlich als aktiv erkannt würden. Layout-Erkennung und mobile untere Navigation bleiben erhalten.

Im Kalender sind Wochenrückblick/Messwerte und Vorausblick/Meilensteine zunächst aufklappbare Details. Die Monatsansicht und der gewählte Tag bleiben direkt sichtbar. Originaleinträge und Datums-/SSW-Suche bleiben erreichbar. Der Wissensstart zeigt sechs Themen und bietet „Alle Themen anzeigen“; eine Suche oder ein Filter berücksichtigt weiter den vollständigen Katalog. Nichts wird aus den Offline-Daten entfernt.

Der Überblick erhält gezielte Zugriffe für Kontakte und Wehen. Der neue schwebende Tracker bleibt von der unteren Navigation getrennt. Quellen und weiterführende Erläuterungen stehen in benannten aufklappbaren Abschnitten. Die Geräteoberfläche trennt Weitergeben, Übernehmen und Backup. Die Produktregeln, Ampelregeln und Datenprojektion bleiben unverändert.

## Erwogene Alternativen

- Alle Inhalte weiterhin fortlaufend am Desktop zeigen: Widerspricht der gewünschten klaren Trennung und vervielfacht die sichtbaren Informationen.
- Neue zusätzliche Hauptbereiche: Würde die mobile Navigation weiter verdichten.
- Daten oder Quellen aus Platzgründen entfernen: Stattdessen werden die vorhandenen Informationen bei Bedarf geöffnet.

## Folgen und Grenzen

Direkte Sprünge aus Kalender und Messungen wechseln den passenden Hauptbereich. Die Navigation ändert keine gespeicherten Angaben. Ausgeblendete Bereiche werden per CSS auch aus dem Accessibility-Baum entfernt; gezielte Sprünge fokussieren weiterhin Überschriften beziehungsweise Suchfeld. Vollständige Screenreader-Prüfung bleibt offen.

## Verifikation

Am 18.11.2026 mit synthetischem Datenstand:

- Safari: Navigation zwischen Überblick und Kalender, Messung zum Kalendertag und Geräte-Dialog verwendet. Jeweils nur der aktive Bereich sichtbar.
- Isolierte Layoutprüfung bei **320, 390, 820 und 1440 CSS-Pixeln**, jeweils für Überblick, Kalender und Wissen: genau ein sichtbarer Hauptbereich, kein horizontaler Überlauf, Kalender mit 42 Tagen, Rückblick standardmäßig geschlossen, Wissensstart mit sechs Karten und schwebender Zugriff ohne Überschneidung mit der unteren Navigation. Alle zwölf Kombinationen bestanden. Nur die anfängliche Bereichsauswahl der QA-Kopien war angepasst; Produktion beginnt beim Überblick.
- Kein eigener implementierungsspiegelnder Unit-Test für CSS/Markup. Gesamtprüfung: **145 von 145 Tests bestanden**, keine übersprungen; Build über `node scripts/build.js` erfolgreich (npm nicht im PATH; identische Test-/Build-Einstiegspunkte).

Offen: physische Smartphones, volle Tastatur-/Screenreader-Matrix, Landscape und stark vergrößerte Systemschrift. Keine nachträgliche Nutzerfreigabe durch den Status „umgesetzt“ behauptet.

## Quellen

- [Nutzeranforderungen und Features F15–F18](../open.md), [vorherige App-Navigation](0010-mobile-app-und-pwa.md), [bestehende Layout-Erkennung](0013-app-layout-erkennung.md).
- Diese Darstellungsänderung enthält keine neuen medizinischen Aussagen.
