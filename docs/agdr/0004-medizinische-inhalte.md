# AgDR-0004: Quellenbasierte Entwicklungsphasen und Vorsorge

- **Status:** Umgesetzt
- **Datum:** 2026-11-17
- **Erweitert durch:** [AgDR-0024](0024-fuer-dich-und-mobile-layoutkorrekturen.md) – eigener Bereich „Für dich“ mit separat geprüften Vertiefungen und weiterhin gekennzeichnetem Quellenstand der vorhandenen Körpertexte.
- **Entscheidende Instanz:** Entwicklungsinfos vom Nutzer gewünscht; Quellen, Umfang und Formulierungen vom Agenten gewählt
- **Betroffene Dateien:** [Inhalte](../../src/content.js), [Information und Quellen](../../index.html)

## Kontext und Herkunft

Die App soll relevante Schwangerschaftsinformationen und eine Darstellung der aktuellen Entwicklung ähnlich gängigen Begleit-Apps anbieten. Sie soll weder urheberrechtlich geschützte App-Inhalte übernehmen noch individuelle Diagnosen aus wenigen Eingaben ableiten.

## Entscheidung

Die App enthält eigene kurze Zusammenfassungen für die 1. bis 42. laufende SSW. Sie orientieren sich an mehrwöchigen Entwicklungsphasen des BIÖG. Jede Woche erhält einen Schwerpunkt; körperliche Veränderungen und Impulse können innerhalb einer Phase gleich bleiben. Das wird in der Oberfläche erklärt.

Größen- und Gewichtsangaben beziehen sich ausdrücklich auf das **Ende der angegebenen Phase** oder die Geburt. Sie sind keine individuellen Messwerte. Die dekorative Illustration repräsentiert keinen errechneten Entwicklungsstand.

Für die deutsche Vorsorge werden die folgenden Zeitfenster mit abgeschlossenen Wochen und Tagen verwendet:

| Thema | Fenster |
| --- | --- |
| Erster Basis-Ultraschall | 8+0 bis 11+6 |
| Zweiter Basis-Ultraschall | 18+0 bis 21+6 |
| Test auf Schwangerschaftsdiabetes | 24+0 bis 27+6 |
| Dritter Basis-Ultraschall | 28+0 bis 31+6 |

Weitere Karten sind individuelle Planungshilfen für Hebammensuche, Geburtsvorbereitung und Betreuung rund um den Termin. Merkhäkchen sind persönliche Hilfen, keine Dokumentation einer durchgeführten Untersuchung. Die tatsächlichen Termine und die medizinische Datierung legt das Betreuungsteam fest.

Allgemeine Hinweise behandeln Ernährung, Bewegung, Medikamente, Unsicherheiten und Beschwerden, die unmittelbar abgeklärt werden sollten. Es werden keine individuellen Arzneimittel- oder Supplementdosierungen berechnet. Jede Entwicklungsphase und jedes Vorsorgethema enthält einen direkten Quellenlink.

## Erwogene Alternativen

- **Exakte wöchentliche Größen- und Gewichtsprognose:** Würde aus den vorhandenen Daten eine nicht erreichbare Präzision suggerieren.
- **Inhalte aus kommerziellen Schwangerschafts-Apps:** Unnötige Rechte- und Quellenprobleme; öffentliche Gesundheitsquellen sind direkt nachvollziehbar.
- **Britische Vorsorgetermine aus NHS-Seiten:** Passen nicht als deutscher Standard. NHS wird für Datierung, ergänzende Entwicklung und allgemeine Hinweise genutzt, deutsche Vorsorgefenster stammen aus deutschen Quellen.
- **Live-Abruf bei jeder Nutzung:** Würde neue Netzwerk- und Datenschutzabhängigkeiten schaffen. Inhalte werden lokal ausgeliefert und redaktionell versioniert.

## Folgen und Grenzen

Redaktioneller Stand ist **17.11.2026**. Es gibt keine automatische Aktualisierung oder medizinische Fachfreigabe. Die Texte beschreiben typische Entwicklung, keine Bestätigung der Gesundheit eines konkreten Kindes. Nicht jede mögliche Komplikation und nicht jede zusätzliche Untersuchung wird abgedeckt. Bei einer langfristig veröffentlichten App müssen medizinische Aussagen, Vorsorgefenster und Links regelmäßig geprüft werden.

## Verifikation

Die verlinkten Quellen wurden im Rahmen der Erstellung online geprüft. Tests bestätigen lückenlose Inhalte für alle 42 Wochen, zulässige Quellendomains und die numerischen Vorsorgefenster. Eine fachärztliche Inhaltsprüfung wurde nicht durchgeführt.

## Quellen

- [BIÖG: Schwangerschaftswochen](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/), mit direkten Phasenlinks in [content.js](../../src/content.js).
- [IQWiG: Ultraschalluntersuchungen](https://www.gesundheitsinformation.de/ultraschalluntersuchungen-in-der-schwangerschaft.html).
- [G-BA: Mutterschafts-Richtlinie](https://www.g-ba.de/richtlinien/19/), abgerufene Fassung in Kraft seit 25.08.2026.
- [Geprüfte PDF-Fassung vom 16.07.2026](https://www.g-ba.de/downloads/62-492-4201/Mu-RL_2026-07-16_iK-2026-08-25.pdf), § 2 Absatz 9 für die Ultraschallfenster und Absatz 11a für das Diabetes-Screening.
- [gesund.bund.de: Ernährung](https://gesund.bund.de/schwangerschaft-ernaehrung).
- [Charité / Embryotox: Arzneimittel](https://www.embryotox.de/).
- [NHS: Beschwerden und medizinische Hilfe](https://www.nhs.uk/pregnancy/common-symptoms/pregnancy-symptoms-you-need-to-get-help-for/).
- [NHS: Zeit nach dem Termin](https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/3rd-trimester/week-41/).
