# Agent Decision Records (AgDRs)

Dieses Verzeichnis ist die maßgebliche Entscheidungsdokumentation für **bauchgefühl**. Die Dokumentationsform wurde am **17.11.2026 ausdrücklich vom Nutzer gewünscht**.

Ein AgDR hält Kontext, Entscheidung, Herkunft, Alternativen, Folgen und überprüfbare Nachweise fest. Er beschreibt, warum das System so gebaut ist. Einstieg und Startanleitung stehen in der [Projekt-README](../../README.md).

| Record | Entscheidung | Status |
| --- | --- | --- |
| [AgDR-0001](0001-statische-webapp.md) | Statische Webapp ohne Laufzeitabhängigkeiten für GitHub Pages | Teilweise abgelöst durch AgDR-0010 |
| [AgDR-0002](0002-ssw-aus-periode-und-zyklus.md) | SSW direkt aus Periodenbeginn und individueller Zykluslänge | Teilweise abgelöst durch AgDR-0006 |
| [AgDR-0003](0003-lokale-daten-und-teilen.md) | Lokaler Speicher und ausdrücklich übernommene Teilen-Links | Umgesetzt |
| [AgDR-0004](0004-medizinische-inhalte.md) | Quellenbasierte Phaseninfos und deutsche Vorsorgefenster | Umgesetzt |
| [AgDR-0005](0005-bedienung-und-verifikation.md) | Bedienung, Beispieldaten und gestufte Verifikation | Teilweise abgelöst durch AgDR-0010 |
| [AgDR-0006](0006-waehlbare-berechnungsmethode.md) | Wählbare Berechnung aus Periode/Zyklus oder ET mit 28-Tage-Basis | Umgesetzt |
| [AgDR-0007](0007-github-pages-ziel.md) | Repository und Projektpfad für GitHub Pages | Teilweise abgelöst durch AgDR-0010, Veröffentlichung offen |
| [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md) | Master, Geräte-QR, verschlüsselter Sync und lokaler SQLite-Dienst | Umgesetzt, lokal geprüft |
| [AgDR-0009](0009-persoenliches-journal.md) | Persönliches Journal, Messwertverläufe und Datenmigration | Umgesetzt, lokal geprüft |
| [AgDR-0010](0010-mobile-app-und-pwa.md) | Mobile App-Navigation, Installation, Offline-Dateien und bewusste Updates | Umgesetzt, lokale Browserprüfung; Geräteinstallation offen |
| [AgDR-0011](0011-persoenliche-berechnungserklaerung.md) | Persönliche Rechenschritte mit den aktuellen Angaben | Umgesetzt, lokal geprüft |
| [AgDR-0012](0012-roadmap-und-ssw-pruefung.md) | Mutterbezogener Feature-Backlog und abgeschlossene SSW-Prüfung | Backlog erstellt; Features vorgeschlagen, SSW-Frage geklärt |

## Fortschreiben

1. Für eine neue wesentliche Entscheidung das [Template](_template.md) kopieren und die nächste freie Nummer verwenden.
2. Nutzeranforderung, Agentenentscheidung und offene Annahmen ausdrücklich unterscheiden.
3. Status, Datum und betroffene Dateien angeben. „Umgesetzt“ beschreibt den Code, keine ausdrückliche Nutzerfreigabe.
4. Alternativen und Folgen konkret halten. Nur tatsächlich durchgeführte Prüfungen als Nachweise nennen.
5. Eine abgelöste Entscheidung durch einen neuen AgDR ersetzen und beide miteinander verknüpfen. Frühere Begründungen bleiben nachvollziehbar; sachliche Korrekturen werden vermerkt.

Die ersten fünf Records wurden nach der Erstimplementierung anhand der tatsächlich getroffenen Entscheidungen angelegt. Sie behaupten keine vorherige formale Freigabe. Testbeispiele enthalten ausschließlich synthetische Daten.
