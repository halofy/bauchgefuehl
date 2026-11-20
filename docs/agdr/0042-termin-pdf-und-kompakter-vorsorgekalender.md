# AgDR-0042: Formatierte Fragen, PDF-Terminmappe und kompakter Vorsorgekalender

- **Status:** Umgesetzt
- **Datum:** 2026-11-20
- **Entscheidende Instanz:** Ausdrückliche Nutzerwünsche; technische Umsetzung, Darstellung und Anzeigegrenze durch den Agenten
- **Betroffene Dateien:** [Textformatierung](../../src/text-format.js), [PDF-Erzeugung](../../src/appointment-pdf.js), [PDF-Abhängigkeiten](../assets/pdf-dependencies.json), [Terminoberfläche](../../src/care-ui.js), [Terminmappe](../../src/companion-ui.js), [Berichtsprojektion](../../src/report.js), [Kalendermodell](../../src/calendar.js), [Kalenderoberfläche](../../src/calendar-ui.js), [Gestenerkennung](../../src/day-press.js), [Vorsorgeinhalte](../../src/content.js), [Berechnung](../../src/pregnancy.js), [Rechenerklärung](../../src/calculation-explanation.js), [App](../../src/app.js), [Styles](../../styles.css), [Offline-Manifest](../../sw.js)
- **Ersetzt / ergänzt:** Erweitert [AgDR-0025](0025-termine-fragensammlung-und-klarerer-kalender.md) und [AgDR-0026](0026-alltagsbegleitung-terminmappe-und-wochenbett.md) um Textlisten und PDF-Terminmappen; erweitert die Vorsorgeauswahl aus [AgDR-0004](0004-medizinische-inhalte.md) und den Kalender aus [AgDR-0014](0014-kalender-und-journal.md). Die SSW-Formel aus [AgDR-0002](0002-ssw-aus-periode-und-zyklus.md) bleibt unverändert; nur Anzeige und SSW-Suchgrenze werden begrenzt.

> Die Anordnung des Kalenders und der Zeitraum des Rückblicks wurden in [AgDR-0044](0044-kalender-mit-gemeinsamer-wochenansicht.md) weiterentwickelt.

## Kontext und Herkunft

Der Nutzer verlangt echte Aufzählungen aus eingegebenen Bindestrichen, einen anstehenden Termin mit ausgewählten Fragen und Platz für Antworten als PDF, zusätzliche Untersuchungs- und Pränataldiagnostikfenster, per langem Drücken erreichbare Tagesdetails sowie weniger Scrollen durch mehr aufklappbare Kalenderbereiche. Außerdem soll die SSW nicht unbegrenzt weitergezählt und der Unterschied zwischen Periodenbeginn und angezeigtem 0+0 erklärt werden.

Der Nutzer vermutet einen verbindlichen spätesten Geburtstermin. Der Agent setzt stattdessen **42+0 als Darstellungsgrenze**: Die Fachquelle beschreibt dort eine dringende Empfehlung zur Einleitung, keinen automatisch feststehenden Geburtstag oder zwingenden individuellen Entbindungstermin. Die App darf weder eine Geburt unterstellen noch medizinische Betreuung ersetzen. Die Grenze ist eine Produktentscheidung, keine neue Datierungsformel.

## Entscheidung

### Eigene Texte und Terminmappe

Eine kleine, rein darstellende Textformatierung unterstützt Absätze, Zeilenumbrüche, Listen mit `- `, `* ` oder `• ` sowie nummerierte Listen mit `1. ` oder `1) `. Eingerückte Fortsetzungszeilen bleiben beim Listenpunkt. Nutzertext wird vollständig HTML-escaped; HTML, Skripte und Links werden nicht ausgeführt. Gespeicherte Originaltexte und Formate bleiben unverändert. Dieselbe Darstellung gilt für Sammlung, Terminnotizen im Kalender, Auswahl und Bericht.

Die bestehende bewusste Auswahl der Terminmappe erhält einen **echten lokalen PDF-Download** mit A4-Seiten, Unicode-Schrift, Seitenzahlen, automatischem Umbruch, ausgewählten Terminangaben und Notizen sowie Schreibzeilen für Antworten und nächste Schritte. Bereits notierte Antworten bleiben enthalten. Eine Auswahlaktion übernimmt alle dem Termin zugeordneten aktiven Notizen; freie oder fremden Terminen zugeordnete Notizen werden dadurch nicht stillschweigend hinzugefügt. Zunächst bleibt alles abgewählt, Termindaten einschließlich Ort und Uhrzeit sind separat auswählbar.

Der PDF-Generator verarbeitet ausschließlich die bereits projizierten Daten aus `projectReport`, niemals lokale Rohstände, Master-Schlüssel oder nicht ausgewählte Einträge. Termine, Orte, Antworten oder Bereiche, die nicht freigegeben sind, fehlen tatsächlich im Bericht. Die Datei ist eine bewusst erzeugte unverschlüsselte Druckausgabe; die vollständige verschlüsselte Datensicherung bleibt ein anderer Vorgang. Ausgelassene Daten werden nicht als unsichtbare PDF-Metadaten eingebettet.

jsPDF **4.2.1** und **Noto Sans Regular** liegen mit Lizenz und SHA-256-Herkunft lokal im Projekt. Zur Laufzeit wird kein CDN, Fontdienst oder PDF-Server aufgerufen. Der Generator verwendet Text und Linien, keine HTML-Konvertierung oder zusätzlichen Plugins. Nicht unterstützte Schriftzeichen führen zu einer verständlichen Fehlermeldung mit der weiter verfügbaren HTML-Druckdatei als Alternative; Inhalte werden nicht still gekürzt oder ersetzt. Die HTML-Terminmappe zeigt ebenfalls Schreibzeilen. Ein allgemeiner PDF-Export sämtlicher Berichtsarten bleibt ein separater Teil von F07.

### Kalender und Tagesdetails

Kalenderdatierung, Legende, ausgewählter Tag, Termine/Fragen, Tagesjournal und Erläuterungen sind aufklappbar. Vorausblick, alle Wochen und Rückblick bleiben ebenfalls zuklappbar. Der ausgewählte Tag zeigt zunächst eine kompakte Zusammenfassung mit Terminen und Einträgen.

Ein **550 ms** langes Drücken öffnet den Tag in einem mobilen Dialog. Mehr als zehn Pixel Bewegung, Scrollen, ein zweiter Zeiger, Abbruch oder Fensterwechsel brechen die Erkennung ab; der Folge-Klick wird nach erkanntem Halten nicht erneut ausgeführt. Alternativen sind „Tagdetails öffnen“, Kontextmenü sowie Umschalt+Eingabe oder Alt+Pfeil-abwärts. Pfeiltasten behalten die bestehende Kalendernavigation.

Der Dialog verwendet denselben Tagesinhalt statt einer zweiten Kopie mit doppelten IDs. Passende Tagesbereiche öffnen sich; einzelne Vorsorgefenster bleiben zur Übersicht einzeln aufklappbar. Beim Schließen kehrt der Inhalt an seinen bisherigen Platz zurück. Aktionen wie Terminnotiz, Journalbearbeitung oder Wocheninfos schließen den Tagesdialog vor dem Wechsel. Der vorhandene App-Verlauf behandelt ihn wie andere Dialoge.

### Untersuchungsfenster und fachliche Einordnung

Die bestehenden drei Basis-Ultraschalle und der Diabetes-Suchtest behalten ihre Zeitfenster. Ergänzt sind:

| Untersuchung | Angezeigter Beginn / Bereich | Einordnung und Beleg |
| --- | --- | --- |
| NIPT auf Trisomien | ab 10+0, testabhängig | Freiwilliges Screening, keine sichere Diagnose; Klinik Esslingen für den Zeitpunkt, G-BA für die Voraussetzungen der Kassenleistung |
| Ersttrimester-Screening | 11+0–13+6 | Freiwillige Risikoeinschätzung; Universitätsklinikum Dresden |
| Chorionzottenbiopsie | ab 11+0, individuell | Invasive Diagnostik bei Indikation nach Aufklärung; BIÖG nennt die 12. SSW |
| Fruchtwasseruntersuchung | ab 15+0, individuell | Invasive Diagnostik bei Indikation nach Beratung; BIÖG nennt die 16. SSW |
| Detaillierter Organ-Ultraschall | 18+0–21+6 | Spezielle Diagnostik, Termin und Indikation klären; Klinik Esslingen nennt die 19.–22. SSW |
| Kindlicher Rhesusfaktor | ab 11+0 | Für RhD-negative Schwangere mit Einlingsschwangerschaft; G-BA § 4 Abs. 3 |
| Erneuter Antikörper-Suchtest | 23+0–26+6 | Reguläre Vorsorge; G-BA § 4 Abs. 3a |
| Anti-D-Prophylaxe | 27+0–29+6 | Nur falls erforderlich; mütterliche Antikörper und kindlichen Rhesusbefund beachten; G-BA § 4 Abs. 3a |

Die Umrechnung ordinaler SSW ist ausdrücklich nachvollziehbar: **12. SSW = 11+0–11+6**, **16. SSW = 15+0–15+6**. „Ab“-Einträge nennen einen frühesten Beginn, keine Pflichtuntersuchung oder künstliche medizinische Ausschlussfrist am Ende des App-Zeitraums. Die Endbegrenzung auf 41+6 dient dort nur der Kalenderdarstellung. Individuelle Planung erfolgt in Praxis oder Zentrum.

Jeder ergänzte medizinische Eintrag enthält Quelle und redaktionellen Prüfstand **20.11.2026**. Optionale und bedingt zutreffende Untersuchungen sind sichtbar als solche bezeichnet. NIPT wird nicht pauschal als Routine-Kassenleistung angeboten; invasive Verfahren benennen ihr Fehlgeburtsrisiko, Beratung und Einwilligung. Laufende offene Zeiträume verdrängen im kurzen Vorausblick nicht alle zeitlich begrenzten Vorsorgefenster. Die bisherige zusätzliche NDR-Einordnung bleibt erhalten; die neuen Detailfenster werden durch die konkret geprüften Fachquellen unten belegt.

### Rechnerischer Beginn und Ende der Anzeige

`0+0 = erster Periodentag + (Zykluslänge − 28 Tage)`. Bei 24 Tagen ist der rechnerische Beginn vier Tage vor dem eingegebenen Periodenbeginn; der beobachtete Periodentag wird dabei weder verschoben noch überschrieben. Der Kalender erklärt beide Daten und die Verschiebung. Im betroffenen Monat erscheint zusätzlich ein kurzer Hinweis unmittelbar am Monatsraster. Es wird kein gemessener Eisprung oder Befruchtungstag behauptet. Bei ET-Rückrechnung erklärt die Ansicht die 280 Tage bis zum eingetragenen ET.

Bis 41+6 bleibt die bekannte SSW-Anzeige bestehen. Ab **42+0** zeigen Überblick, Kalender, Vorschau und Datumsbezug im Wissensbereich einen Hinweis statt fortlaufender höherer SSW; die Rechenerklärung benennt die Grenze. Das Datum 42+0 bleibt als Grenzpunkt nachschlagbar, höhere SSW-Suchwerte werden abgewiesen. Im Kalender werden 41+0 und 42+0 mit Quellen als Gesprächs-/Betreuungspunkte markiert.

Die rohe Datumsarithmetik bleibt erhalten, damit bestehende Journal- und Untersuchungszuordnungen unverändert funktionieren. Ein tatsächliches Geburtsdatum und der Phasenwechsel werden weiterhin ausdrücklich eingetragen. Die Grenze allein ändert keine gespeicherten Gesundheitsdaten. Falls die Schwangerschaft nach der Grenze noch besteht, weist die App auf den Kontakt zum Geburtsteam hin.

## Erwogene Alternativen

Ein HTML-Auszug mit „als PDF speichern“ allein würde den gewünschten direkten PDF-Download nicht erfüllen. Cloud-Konverter widersprechen Offline- und Datenschutzanforderungen. Eine pauschale Ersetzung unbekannter Schriftzeichen oder das Kürzen langer Fragen würde Inhalt verlieren; deshalb Umbruch und ausdrücklicher Fehler mit HTML-Alternative.

Ein Rich-Text-Editor mit gespeicherten HTML-Inhalten würde Migration und zusätzliche Eingabe-/Sicherheitslogik erfordern. Die kleine Textsyntax erfüllt die gewünschte Aufzählung unter Beibehaltung aller Originaltexte. Ein zweiter, geklonter Kalenderinhalt könnte IDs und Aktionen doppeln. Eine harte Änderung der SSW-Formel oder ein automatischer Wechsel ins Wochenbett würde Daten und klinische Aussagen ohne Grundlage verändern.

## Folgen und Grenzen

Die lokale PDF-Bibliothek mit Schrift und Lizenz ergänzt knapp **0,95 MiB** statische Dateien. Sie werden vollständig offline vorgehalten; die PDF-Erzeugung selbst wird erst bei Bedarf geladen. Die Schrift deckt nicht alle Schriften oder Emoji ab; die HTML-Alternative bewahrt solche Originaltexte. Die Freiflächen sind für handschriftliche Antworten vorgesehen, keine interaktiven PDF-Formulare.

Neue Vorsorgefenster sind eine redaktionelle Auswahl für Deutschland, kein vollständiger Mutterpass, kein persönlicher Untersuchungsplan und keine Zusage einer Kostenübernahme. Veröffentlichungs- und Quellenstand werden nicht mit einer ärztlichen Begutachtung verwechselt. Die Zusammenfassungen funktionieren offline, die verlinkten Originalquellen benötigen Internet.

## Verifikation

- `npm test`: **233 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Enthalten sind Text-/HTML-Sicherheit, bewusste Auslassung von Termindaten, echte PDF-Erzeugung mit Schrift und mehrseitigem Umbruch, Fehler bei nicht unterstützten Zeichen, Abbruch von Haltegesten bei Scrollen/Bewegen/zweitem Zeiger, zugängliche Öffnungsalternativen, Untersuchungsfenster-Grenzen, synthetische Zyklusdatierung und Ende der SSW-Darstellung. Die Offline-Tests prüfen auch PDF-Modul, Schrift und Bibliothek unter einem GitHub-Pages-Unterpfad.
- `npm run build` erfolgreich: **96 Offline-Dateien**, alle bytegleich zur Quelle, einschließlich genau 42 unveränderter Wochenbilder. Keine temporären QA-Seiten enthalten. Herkunftsprüfsummen der PDF-Abhängigkeiten, 367 eindeutige statische HTML-IDs, ausgeglichene HTML-Tags und 598 lokale Dokumentlinks geprüft. Syntaxprüfung für 67 Module/Testdateien und `git diff --check` ohne Fehler.
- Safari mit isolierter synthetischer Reise im 390 px breiten App-Frame: übernommene Testgrundlage, Datierungserklärung mit getrenntem Perioden-/Rechenbeginn, kompakte Kalenderbereiche, Tagesdialog per Tastatur, aufgeklapptes Vorsorgefenster und Schließen geprüft. Der native AX-Halteklick lieferte keinen nachweisbaren Pointer-Gestentest; lange Touch-Gesten auf physischen Geräten bleiben ausdrücklich offen.
- Synthetischen Termin und Frage über die Oberfläche angelegt: zwei echte Listenpunkte in der Sammlung, bewusste Auswahl in der Terminmappe und erfolgreicher PDF-Download in Safari. Die heruntergeladene PDF lokal extrahiert und gerendert: beide ausgewählten Fragen und Schreibzeilen vorhanden, abgewählter Termintitel fehlt. Ein längerer Testauszug über sechs Seiten bewahrt alle 280 wiederholten Textpassagen und den Abschluss; Text liegt innerhalb der Seitenränder, erste und letzte Seite gerendert.
- Safari lieferte für die bestehenden Frage-/Terminmappen-Dialoge teilweise keinen AX-Inhalt; sichtbare Eingabe und Speicher-/Downloadaktionen wurden dann anhand von Screenshots durchgeführt. Kein kompletter Screenreader-Lauf behauptet. Physische iPhone-/Android-Prüfung und Betriebssystem-Drucker-/Dateiweitergabe bleiben offen. Keine Veröffentlichung.

## Quellen

- [G-BA: Mutterschafts-Richtlinie, Fassung vom 16.07.2026, in Kraft seit 25.08.2026](https://www.g-ba.de/downloads/62-492-4201/Mu-RL_2026-07-16_iK-2026-08-25.pdf), insbesondere § 2 Abs. 9 und 11a, § 3 und § 4 Abs. 3/3a. [Aktuelle Richtlinienseite](https://www.g-ba.de/richtlinien/19/).
- [Universitätsklinikum Dresden: Ersttrimesterscreening](https://www.uniklinikum-dresden.de/de/das-klinikum/kliniken-polikliniken-institute/gyn/zentren/geburtshilfe/sprechstunden/praenataldiagnostik/ersttrimesterscreening).
- [Klinikum Esslingen: Pränataldiagnostik](https://mkz.klinikum-esslingen.de/sprechstunden/sprechstunde-praenataldiagnostik-degum-stufe-ii/): Zeitpunkte für NIPT und detaillierten Organ-Ultraschall, keine Übernahme ungesicherter genereller Testzusagen.
- [BIÖG: Plazenta-Punktion](https://www.familienplanung.de/schwangerschaft/praenataldiagnostik/plazenta-punktion/), [BIÖG: Fruchtwasser-Untersuchung](https://www.familienplanung.de/schwangerschaft/praenataldiagnostik/fruchtwasser-untersuchung/).
- [IQWiG: Wenn das Baby auf sich warten lässt – wann die Geburt einleiten?](https://www.gesundheitsinformation.de/wenn-das-baby-auf-sich-warten-laesst-wann-die-geburt-einleiten.html). Die ältere AWMF-Fassung wird hier nicht als neu geprüfte aktuelle Leitlinie ausgegeben.
- [jsPDF 4.2.1, offizielle Veröffentlichung](https://github.com/parallax/jsPDF/releases/tag/v4.2.1), [Noto Fonts, offizielle Schriftdateien](https://github.com/notofonts/noto-fonts), [lokale Herkunfts- und Lizenznachweise](../assets/pdf-dependencies.json).
