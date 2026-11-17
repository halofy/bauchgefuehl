# AgDR-0018: NDR „Tatsächlich schwanger“ als ergänzende Quelle

- **Status:** Quellen ergänzt; medizinische Regeln unverändert
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Ausdrücklicher Nutzerwunsch; konkrete Quellenzuordnung und Abgleich durch den Agenten
- **Betroffene Dateien:** [Katalog](../../src/guide-data.js), [Quellenbereich](../../index.html), [README](../../README.md), [Feature-Liste](../open.md), [Projektkonventionen](../../AGENTS.md)
- **Erweitert:** [AgDR-0004](0004-medizinische-inhalte.md), [AgDR-0017](0017-lebensmittel-und-aktivitaeten.md)

## Kontext und Herkunft

Der Nutzer nennt ausdrücklich den NDR-Themenbereich „Tatsächlich schwanger“ als weitere Quelle für gesicherte Informationen. Die Seite wurde gelesen. Sie erschließt redaktionelle Texte und Podcastfolgen zu Schwangerschaft, Geburt und erster Zeit mit Baby. Sie ist eine Themenübersicht, keine eigenständige Begründung einzelner medizinischer Grenzwerte.

**Agentenentscheidung:** Den NDR als ergänzende redaktionelle Quelle aufnehmen, konkrete Beiträge vor einer Verwendung prüfen und medizinische Detailregeln weiter mit Fachquellen abgleichen. Eine redaktionelle Veröffentlichung wird nicht allein durch ihre Aufnahme als medizinisch endgültig gesichert oder als Primärforschung bezeichnet.

## Entscheidung

- Die vom Nutzer genannte Themenübersicht erscheint unter **Wissen → Quellen und redaktioneller Stand** mit direktem Link und als ergänzende Quelle in der Dokumentation.
- Der dort verlinkte Ernährungsartikel wurde vollständig als Text gelesen. Artikelstand **10.09.2024**, Abruf-/Prüftag **17.11.2026**. Diese beiden Daten werden im Quellenbereich unterschieden.
- Der Ernährungsartikel wird zusätzlich bei sechs bestehenden Karten genannt: Lachs/roher Fisch, Fleisch, Eier, Tiefkühlbeeren, Sprossen und Alkohol. Es handelt sich um eine Ergänzung bereits belegter Inhalte; kein Austausch der bisherigen Fachquellen. Die detaillierten Zubereitungsregeln und Ampelfarben werden nicht verändert.
- Keine pauschale Verlinkung bei sachlich nicht belegten Themen wie Sauna oder Sport. Die gelesene Podcastbeschreibung der ersten Folge ist kein gehörtes Audio und wird nicht als Beleg für konkrete Grenzwerte verwendet.
- Artikelübergreifende Aussagen oder verkürzte Angaben werden nicht ungeprüft in neue Freigaben übersetzt. Beispielsweise bleibt die differenzierte Käse-Regel des bestehenden Katalogs auf BfR/Fachquellen gestützt. Neue Supplementdosierungen oder zusätzliche Verbote werden hier nicht eingeführt.
- NDR wird in den Projektkonventionen für weitere Quellenarbeit festgehalten. Künftige Beiträge werden jeweils auf ihre konkrete Aussage, ihren Stand und Übereinstimmung mit Fachquellen geprüft.

## Erwogene Alternativen

- **Nur die Übersichtsseite pauschal als Beleg an alle Karten hängen:** Würde konkrete Aussagen nicht nachvollziehbar belegen.
- **Alle redaktionellen Aussagen oder Podcastthemen ohne Abgleich übernehmen:** Würde Quellenstand, Themenbeschreibung und fachlich geprüfte Empfehlung vermischen.
- **NDR lediglich in der Dokumentation erwähnen:** Würde die gewünschte Quelle nicht bei den passenden App-Inhalten sichtbar machen.

## Folgen und Grenzen

Keine Berechnungs-, Datenformat- oder Ampeländerung. Keine neue Abhängigkeit und keine zusätzlichen Hintergrundanfragen. Quellenangaben sind lokal Teil der Offline-Auslieferung; nur bewusst geöffnete Originalseiten benötigen Internet. Keine Player, fremden Scripts, Bilder oder Audiodownloads werden eingebunden. Keine Podcastfolge wurde angehört oder transkribiert; aus ihr werden keine neuen medizinischen Aussagen abgeleitet. Eine fachärztliche Abnahme wird nicht behauptet.

## Verifikation

- Am **17.11.2026** NDR-Themenübersicht, verlinkten Ernährungsartikel und Textbeschreibung der ersten Podcastfolge abgerufen und gelesen. Die ergänzende Zuordnung beschränkt sich auf die im Ernährungsartikel tatsächlich behandelten Inhalte.
- **Elf bestehende Katalog-/PWA-Tests bestanden**: `node --test tests/guide.test.js tests/pwa.test.js`. Statischer Build erfolgreich mit `node scripts/build.js`; wegen fehlendem `npm` im PATH wurden die identischen Skriptziele direkt mit der vorhandenen Node-Laufzeit ausgeführt. HTML-Struktur, lokale Dokumentationslinks und `git diff --check` geprüft. Keine Berechnungsänderung; die vollständige Suite wurde für diese Quellen-/Text-Ergänzung nicht erneut ausgeführt.

Keine erneute manuelle Browser-/Screenreader-Prüfung für diese reine Quellen-/Text-Ergänzung; keine Audioinhalte geprüft.

## Quellen

- [NDR: „Tatsächlich schwanger“ – Themenübersicht](https://www.ndr.de/ratgeber/gesundheit/Tatsaechlich-schwanger-Alles-rund-um-die-Geburt-und-die-erste-Zeit-mit-Baby,tatsaechlichschwanger100.html), vom Nutzer ausdrücklich vorgegeben und am 17.11.2026 gelesen.
- [NDR: Ernährung in der Schwangerschaft](https://www.ndr.de/ratgeber/gesundheit/Ernaehrung-in-der-Schwangerschaft-Was-ist-erlaubt-was-eher-nicht,ernaehrung676.html), Artikelstand 10.09.2024, am 17.11.2026 gelesen; ergänzende Quelle für die sechs oben genannten Karten.
- [NDR: Erste Podcastfolge – Textbeschreibung](https://www.ndr.de/n-joy/01-Schwanger-Was-muss-ich-jetzt-beachten,audio1451116.html), Sendungsdatum 31.08.2023; nur Beschreibung gelesen, keine Audioauswertung.
- [Bestehende Fachquellen und Zuordnung](0017-lebensmittel-und-aktivitaeten.md), [Katalog](../../src/guide-data.js).
