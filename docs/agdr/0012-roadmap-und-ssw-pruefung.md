# AgDR-0012: Mutterbezogene Roadmap und Prüfung der SSW-Darstellung

- **Status:** Feature-Backlog erstellt; SSW-Frage durch Nutzer als geklärt bestätigt. Premium-Einordnung teilweise abgelöst durch AgDR-0016.
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzer fragt nach Premium-Funktionen, mutterbezogenen Inhalten und einer abweichenden eigenen SSW-Zählung; folgende Prioritäten sind Empfehlungen des Agenten
- **Betroffene Dateien:** [Berechnung](../../src/pregnancy.js), [Rechenerklärung](../../src/calculation-explanation.js), [Tests](../../tests/pregnancy.test.js); zukünftige Oberfläche und Inhalte
- **Bezug:** [AgDR-0002](0002-ssw-aus-periode-und-zyklus.md), [AgDR-0006](0006-waehlbare-berechnungsmethode.md), [AgDR-0009](0009-persoenliches-journal.md)

## Kontext und Herkunft

**Fortschreibung vom 17.11.2026:** Der Nutzer legt ausdrücklich fest, dass alle Funktionen für alle kostenlos sind und es kein Bezahl-Premium gibt. Damit sind die unten historisch dokumentierten Premium-Vorschläge und die offene Bezahlmodellfrage abgelöst. Die Feature-Kennungen bleiben erhalten; [AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md) dokumentiert die neue Grundlage und [docs/open.md](../open.md) den aktuellen Arbeitsstand.

**Redaktionelle Korrektur vom 17.11.2026:** Dieser Record trug zunächst ebenfalls die Nummer 0010. Da diese Nummer parallel für die mobile App/PWA vergeben wurde, wird die Roadmap unter der nächsten freien Nummer 0012 fortgeführt. Der PWA-Record 0010 und Record 0011 bleiben unverändert nummeriert.

**Fortschreibung vom 17.11.2026:** Der Nutzer beauftragt eine abarbeitbare Feature-Liste und erklärt die SSW-Berechnungsfrage ausdrücklich für geklärt. Die Arbeitsliste steht in [docs/open.md](../open.md); die unten genannten Ideen bleiben Vorschläge, die Reihenfolge ist eine Agentenempfehlung. Die frühere zusätzliche SSW-Gegenüberstellung wird nicht als offene Aufgabe übernommen. Die bestehende persönliche Rechenerklärung ist in [AgDR-0011](0011-persoenliche-berechnungserklaerung.md) dokumentiert.

Der Nutzer bittet um Vorschläge für weitere Premium-Funktionen und Darstellungen zur Mutter. Außerdem weicht eine eigene Tageszählung von der App ab. Die Nachfrage mit einem konkreten Beispiel erlaubt eine arithmetische Prüfung; individuelle Angaben werden hier nicht übernommen.

Die vorhandene App bietet bereits ein Journal, Messwertverläufe, CSV und Master-Sync. Diese Funktionen werden nicht als neue Vorschläge ausgegeben. Empfehlungen dieses Records sind noch keine beschlossene Umsetzung oder Festlegung eines Bezahlmodells.

## Entscheidung beziehungsweise Vorschlag

Die Feature-Liste ist die maßgebliche Arbeitsübersicht mit stabilen Kennungen, Prioritäten, Abhängigkeiten, Abschlusskriterien und Checkboxen. Bestehende Funktionen und das geklärte SSW-Thema werden von neuen offenen Features getrennt. Künftige wesentliche Umsetzungsentscheidungen erhalten eigene AgDRs. Eine Einordnung als Premium-Kandidat legt weder Preise noch Zugangsbeschränkungen fest.

### Ergebnis der Rechenprüfung

Die bestehende Periodenmethode berechnet `Kalendertage seit Periodenbeginn − (Zykluslänge − 28)`. Ein kürzerer Zyklus erhöht deshalb das geschätzte Schwangerschaftsalter; ein längerer reduziert es. Der geschätzte ET verschiebt sich entgegengesetzt. Kalenderzählung und zyklusangepasstes Schwangerschaftsalter sind verschiedene Größen.

Synthetisches Beispiel aus den bestehenden Tests: 131 Kalendertage seit Periodenbeginn ergeben ohne Anpassung 18+5. Bei 30 Zyklustagen werden zwei Tage abgezogen: 129 Tage = 18+3. Bei 21 Tagen werden sieben Tage addiert: 138 Tage = 19+5. Eine Rückrechnung vom jeweils abgeleiteten ET ergibt dasselbe Ergebnis.

Das ist eine Schätzung anhand der Zykluslänge, keine Bestimmung des tatsächlichen Eisprungs oder Alters seit Befruchtung. Die geprüfte NHS-Seite berücksichtigt die individuelle Zykluslänge und nennt Ultraschall als genauere Datierung. Die historische Primärquelle des Royal Hospital for Women beschreibt die entsprechende ET-Anpassung ausdrücklich. Die Anwendung auf SSW-Tage ist die dazu konsistente algebraische Ableitung; sie ist keine unabhängig gemessene Datierung.

**Vorschlag:** In der Übersicht die gewählte Grundlage deutlich benennen und bei Zyklusanpassung zusätzlich die unveränderten Kalendertage seit Periodenbeginn zeigen. So lassen sich eine eigene Zählung und die App vergleichen. Eine Gegenüberstellung ist verständlicher als eine Änderung des Vorzeichens. Ärztlich festgelegte Datierungen können über die vorhandene ET-Methode abgebildet werden. Die Formel bleibt in dieser Prüfung unverändert.

### Mutterbezogene Erweiterungen zuerst

1. Ein eigener Bereich „Für dich“ mit gleichwertiger Sichtbarkeit neben den Babyinformationen: körperliche Veränderungen, Alltag, Schlaf, Gefühle und Unterstützung, jeweils mit Quellen und Bezug zur gewählten Woche. Die vorhandenen kurzen Körpertexte werden dadurch vertieft.
2. Ein kurzer Tages-Check-in für Stimmung, Energie, Schlaf und Symptomstärke. Dazu ein Wochenrückblick und eine Symptomkalenderansicht. Zusammenhänge rein beschreibend anzeigen, ohne Ursachen oder Diagnosen abzuleiten.
3. Gewicht und Umfänge um eine selbst gewählte Ausgangsmessung, Veränderungen und Notizmarkierungen ergänzen. Keine pauschale Bewertung über Farben, Zielgewicht oder eine vermeintlich individuell normale Bauchkurve.
4. Fragen für Praxis und Hebamme sowie eigene Termine, Untersuchungsergebnisse und besprochene nächste Schritte übersichtlich sammeln.
5. Das persönliche Journal nach der Geburt im Wochenbett weiterführen können, ohne eine laufende Schwangerschaft als Bearbeitungsvoraussetzung.

### Mögliche Premium-Funktionen

- Anpassbarer Praxisbericht als PDF: ausgewählter Zeitraum, Fragen, Symptome und Messwerte.
- Erweiterte Rückblicke: frei kombinierbare Ansichten, Symptomkalender, eigene Vorlagen und Berichte.
- Optionales Fotojournal mit Vergleichsansicht und Zeitraffer.
- Individuell zusammengestellter Geburts- und Wochenbettplan sowie zusätzliche fachlich geprüfte Lerninhalte.

**Agentenempfehlung:** Verlässliche Grundberechnung, Quellen, grundlegende Sicherheitshinweise, Datenzugang, Export und Sicherung gehören in die Basis. „Premium“ sollte zusätzlichen Komfort und Aufbereitung bieten. Ob damit tatsächlich ein Bezahlangebot oder zunächst ein umfangreicherer persönlicher Funktionsumfang gemeint ist, bleibt offen.

## Erwogene Alternativen

- Die Zykluskorrektur umdrehen: Würde bei kurzen Zyklen einen späteren ET und eine jüngere Schwangerschaft behaupten und widerspricht dem geprüften Rechenmodell.
- Nur eine einzelne große SSW ohne sichtbare Grundlage: Bleibt leicht mit der unveränderten Kalenderzählung verwechselbar.
- Weitere generische Babyvergleiche priorisieren: Beantwortet den Wunsch nach mehr Informationen zur Mutter nur begrenzt.
- Automatische Diagnosen oder Risikobewertungen als Premiummerkmal: Hierfür besteht keine validierte Grundlage im Projekt.

## Folgen und Grenzen

Dieser Record verändert weder Berechnung noch gespeicherte Profile und führt keine Bezahlschranke ein. Inhalte brauchen vor der Umsetzung redaktionelle Quellenprüfung. Ein Fotojournal benötigt eine eigene Speicher- und Sync-Entscheidung; Fotos passen nicht sinnvoll in den auf rund 512 KiB begrenzten bisherigen JSON-Datenstand. Erinnerungen bei geschlossener App müssen separat auf technische Machbarkeit im statischen beziehungsweise lokalen Betrieb geprüft werden.

## Verifikation

- Am 17.11.2026 Code und vorhandene Rechenerklärung gelesen; alle **28 Berechnungs-/Persistenz-/Teilen-Tests** in `tests/pregnancy.test.js` bestanden.
- Für vier synthetische Zykluslängen (21, 28, 30, 35 Tage) dieselbe Kalenderdifferenz geprüft und Übereinstimmung mit der ET-Rückrechnung bestätigt.
- Das vom Nutzer genannte Beispiel zusätzlich mit der tatsächlichen Berechnungsfunktion nachvollzogen. Die Differenz entspricht der Zykluskorrektur; die unveränderte Tageszählung ist eine andere Größe. Keine individuellen Daten in diesem Record gespeichert.
- Keine Berechnungs- oder Oberflächenänderung in dieser Prüfung; deshalb kein neuer Build erforderlich. Die Roadmap wurde nicht implementiert oder mit Nutzern validiert.
- Fortschreibung zur Arbeitsliste: Einträge mit den bisherigen Vorschlägen und dem dokumentierten Funktionsbestand abgeglichen, relative Dokumentationslinks und eindeutige AgDR-Nummern geprüft. Keine Codeänderung; Tests und Build für diese reine Dokumentationsänderung nicht erneut ausgeführt.

## Quellen

- [NHS: Due date calculator](https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/) – Zykluslänge und genauere Ultraschalldatierung, am 17.11.2026 gelesen.
- [Queensland Government: Gestational age calculator](https://www.qld.gov.au/health/pregnancy-and-birth/gestational-age-calculator) – Periodenbeginn und individuelle Zykluslänge als Eingaben einer ausdrücklich geschätzten SSW.
- [Royal Hospital for Women: Antenatal Shared Care Guidelines, Mai 2021, S. 21](https://www.seslhd.health.nsw.gov.au/sites/default/files/groups/Royal_Hospital_for_Women/Having%20a%20Baby/6-21anscguidelines.pdf) – historische Primärquelle zur tageweisen ET-Anpassung bei abweichender Zykluslänge; keine Übernahme dortiger klinischer Entscheidungsschwellen.
- [BIÖG: Geburtstermin berechnen](https://www.familienplanung.de/schwangerschaft/geburtstermin-berechnen/) – Zählung ab letzter Periode und rechnerische 280 Tage.
- [BIÖG: Wie sich der Körper verändert](https://www.familienplanung.de/schwangerschaft/beschwerden-und-krankheiten/beschwerden-in-der-schwangerschaft-wie-sich-der-koerper-veraendert/) – Themen für mutterbezogene Inhalte.
