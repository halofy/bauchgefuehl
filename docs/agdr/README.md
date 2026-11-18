# Agent Decision Records (AgDRs)

Dieses Verzeichnis ist die maßgebliche Entscheidungsdokumentation für **bauchgefühl**. Die Dokumentationsform wurde am **17.11.2026 ausdrücklich vom Nutzer gewünscht**.

Ein AgDR hält Kontext, Entscheidung, Herkunft, Alternativen, Folgen und überprüfbare Nachweise fest. Er beschreibt, warum das System so gebaut ist. Einstieg und Startanleitung stehen in der [Projekt-README](../../README.md).

| Record | Entscheidung | Status |
| --- | --- | --- |
| [AgDR-0001](0001-statische-webapp.md) | Statische Webapp ohne Laufzeitabhängigkeiten für GitHub Pages | Teilweise abgelöst durch AgDR-0010 |
| [AgDR-0002](0002-ssw-aus-periode-und-zyklus.md) | SSW direkt aus Periodenbeginn und individueller Zykluslänge | Teilweise abgelöst durch AgDR-0006 |
| [AgDR-0003](0003-lokale-daten-und-teilen.md) | Lokaler Speicher und ausdrücklich übernommene Teilen-Links | Teilen-Standard teilweise abgelöst durch AgDR-0016 |
| [AgDR-0004](0004-medizinische-inhalte.md) | Quellenbasierte Phaseninfos und deutsche Vorsorgefenster | Umgesetzt |
| [AgDR-0005](0005-bedienung-und-verifikation.md) | Bedienung, Beispieldaten und gestufte Verifikation | Teilweise abgelöst durch AgDR-0010 |
| [AgDR-0006](0006-waehlbare-berechnungsmethode.md) | Wählbare Berechnung aus Periode/Zyklus oder ET mit 28-Tage-Basis | Umgesetzt |
| [AgDR-0007](0007-github-pages-ziel.md) | Repository und Projektpfad für GitHub Pages | Teilweise abgelöst durch AgDR-0010, Veröffentlichung offen |
| [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md) | Master, Geräte-QR, verschlüsselter Sync und lokaler SQLite-Dienst | Aktiver Verbindungsweg abgelöst durch AgDR-0020; Altstände erhalten |
| [AgDR-0009](0009-persoenliches-journal.md) | Persönliches Journal, Messwertverläufe und Datenmigration | Umgesetzt, lokal geprüft |
| [AgDR-0010](0010-mobile-app-und-pwa.md) | Mobile App-Navigation, Installation, Offline-Dateien und bewusste Updates | Layout-Erkennung erweitert durch AgDR-0013, Desktopbereiche abgelöst durch AgDR-0021; Geräteinstallation offen |
| [AgDR-0011](0011-persoenliche-berechnungserklaerung.md) | Persönliche Rechenschritte mit den aktuellen Angaben | Umgesetzt, lokal geprüft |
| [AgDR-0012](0012-roadmap-und-ssw-pruefung.md) | Mutterbezogener Feature-Backlog und abgeschlossene SSW-Prüfung | Premium-Vorschläge abgelöst durch AgDR-0016; SSW-Frage geklärt |
| [AgDR-0013](0013-app-layout-erkennung.md) | App-Layout auf großen Smartphones und installierten PWAs | Umgesetzt, Safari-Prüfung; physisches Smartphone offen |
| [AgDR-0014](0014-kalender-und-journal.md) | Kalender mit Datum/SSW, Vorsorgefenstern, Meilensteinen und Journal | Umgesetzt, automatisiert und lokal geprüft |
| [AgDR-0015](0015-f03-symptomkalender-und-wochenrueckblick.md) | F03: Symptomnennungen und Wochenrückblick aus dem bestehenden Journal | Journal-Grundlage umgesetzt und geprüft; Check-ins ergänzt durch AgDR-0023 |
| [AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md) | Alle Funktionen kostenlos; ET-only-Link und ausgewählter Journalauszug ohne Upload | Umgesetzt; begrenzter Geräte-Sync weiterhin offen |
| [AgDR-0017](0017-lebensmittel-und-aktivitaeten.md) | Quellenbasierte Offline-Suche mit bedingter Ampel und Kalenderbezug | Redaktionelle Auswahl umgesetzt; keine individuelle medizinische Prüfung |
| [AgDR-0018](0018-ndr-als-ergaenzende-quelle.md) | NDR „Tatsächlich schwanger“ als geprüfte ergänzende redaktionelle Quelle | Quellen ergänzt; medizinische Regeln unverändert |
| [AgDR-0019](0019-kontakte-und-wehentracker.md) | Drei Anrufkontakte, persistente Wehenmessung, Kalender und vorsichtige Zeitmuster | Umgesetzt und synthetisch geprüft; physische Geräte offen |
| [AgDR-0020](0020-serverloser-geraeteabgleich.md) | Signierte, verschlüsselte Geräte-Stände per QR/Link oder Datei ohne Datenserver | Manueller Abgleich umgesetzt; direkter automatischer Kanal offen |
| [AgDR-0021](0021-uebersichtliche-hauptbereiche.md) | Ein Hauptbereich je Ansicht, Details aufklappbar und kompakter Wissensstart | Umgesetzt; vier Inhaltsbreiten geprüft |
| [AgDR-0022](0022-smartphone-nahuebertragung-und-kompakte-links.md) | iOS-/Android-Nahübertragung, kompakte Stand-Links und native Teilen-Auswahl | Link/Teilen umgesetzt; physische Geräte und WebRTC offen |
| [AgDR-0023](0023-tages-check-in-und-strukturierter-rueckblick.md) | F02 Tages-Check-in, strukturierter F03-Rückblick und getrenntes Teilen | Umgesetzt; Modell geprüft, manueller Gesamtdurchlauf offen |
| [AgDR-0024](0024-fuer-dich-und-mobile-layoutkorrekturen.md) | F01 „Für dich“, quellenbezogene Phasenthemen und zwei mobile Layoutkorrekturen | Umgesetzt; Inhalte und zwölf Safari-Layoutkombinationen geprüft |
| [AgDR-0025](0025-termine-fragensammlung-und-klarerer-kalender.md) | F05 Termine und gemeinsame Notizen/Q&A, Datenweitergabe v2 und klarerer Kalender | Umgesetzt; Datenerhalt und synthetischer Hauptablauf geprüft |

## Fortschreiben

1. Für eine neue wesentliche Entscheidung das [Template](_template.md) kopieren und die nächste freie Nummer verwenden.
2. Nutzeranforderung, Agentenentscheidung und offene Annahmen ausdrücklich unterscheiden.
3. Status, Datum und betroffene Dateien angeben. „Umgesetzt“ beschreibt den Code, keine ausdrückliche Nutzerfreigabe.
4. Alternativen und Folgen konkret halten. Nur tatsächlich durchgeführte Prüfungen als Nachweise nennen.
5. Eine abgelöste Entscheidung durch einen neuen AgDR ersetzen und beide miteinander verknüpfen. Frühere Begründungen bleiben nachvollziehbar; sachliche Korrekturen werden vermerkt.

Die ersten fünf Records wurden nach der Erstimplementierung anhand der tatsächlich getroffenen Entscheidungen angelegt. Sie behaupten keine vorherige formale Freigabe. Testbeispiele enthalten ausschließlich synthetische Daten.
