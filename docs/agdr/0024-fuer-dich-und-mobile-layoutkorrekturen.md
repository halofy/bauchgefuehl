# AgDR-0024: F01 „Für dich“ und zwei mobile Layoutkorrekturen

- **Status:** Umgesetzt; Inhaltsmodell, Offline-Einbindung, Safari-Einstieg und zwölf Layoutkombinationen geprüft.
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzer verlangt Fortsetzung mit F01 und zeigt zwei Layoutfehler; Auswahl von Reitern, Phasenthemen und Quellen durch den Agenten
- **Betroffene Dateien:** [Mutterinhalte](../../src/mother.js), [Oberfläche](../../src/mother-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Styles](../../styles.css), [Offline-Dateien](../../sw.js), [Inhaltstests](../../tests/mother.test.js), [PWA-Tests](../../tests/pwa.test.js), [Feature-Liste](../open.md)
- **Erweitert:** [Wocheninhalte und Quellen](0004-medizinische-inhalte.md), [übersichtliche Bereiche](0021-uebersichtliche-hauptbereiche.md), [Tages-Check-in](0023-tages-check-in-und-strukturierter-rueckblick.md)

## Kontext und Herkunft

Nach F02/F03 möchte der Nutzer mit dem angekündigten F01 „Für dich“ fortfahren. Zwei mitgeschickte Smartphone-Screenshots zeigen ungestaltete Telefonnummern neben ihren Labels und einen zu geringen Abstand zwischen Überschrift und Beschreibung der Wissenssuche. Die Bilder werden nur zur Layoutanalyse verwendet; abgebildete persönliche Angaben werden nicht in Quellcode, Tests oder Dokumentation übernommen.

**Agentenentscheidung:** Gleichwertige Reiter „Dein Baby“ und „Für dich“ innerhalb der bestehenden Wochenreise statt eines sechsten Hauptnavigationspunkts. Genau eine dieser beiden Ansichten ist sichtbar. Die fünf mobilen Hauptbereiche und die gespeicherte Datierung bleiben erhalten. Der Überblick erhält einen direkten Sprung zur aktuellen Mutter-Wocheninfo. Die Darstellungskorrekturen werden zusammen mit dieser Erweiterung ausgeliefert.

## Entscheidung

### Eine ausgewählte SSW, zwei gleichwertige Ansichten

Beide Reiter teilen die vorhandene Wochenwahl von 1 bis 42. Die ausgewählte Woche und der Hinweis „aktuell“ beziehungsweise „Wochenvorschau“ stehen oberhalb beider Ansichten. Babyinfos sind beim ersten Einstieg in die Wochenreise ausgewählt; der direkte Zugriff „Wocheninfos für dich“ öffnet die aktuelle Mutteransicht. Ein Entwicklungssprung aus dem Kalender öffnet ausdrücklich die Babyansicht. Die Reiter sind gleich breit, unterstützen Links/Rechts sowie Home/End und verwenden `tablist`, `tab`, `tabpanel`, `aria-selected` und einen beweglichen Tastaturfokus.

„Für dich“ integriert die vorhandenen Körpertexte und Wochenimpulse unverändert. Dazu kommen vier aufklappbare Themen: Alltag, Schlaf, Gefühle und Unterstützung. Die Themenauswahl folgt redaktionellen Phasen; der Phasenbereich wird ausdrücklich als laufende SSW und abgeschlossene Wochen/Tage genannt. Es werden keine 42 unterschiedlichen medizinischen Zustände oder persönlichen Beschwerden behauptet. Eigene Reflexionsfragen sind Agentenformulierungen und keine Diagnose oder Pflichtaufgabe. Ein Check-in-Zugriff öffnet das vorhandene Formular, ohne eine Antwort vorzugeben oder automatisch zu speichern.

Geöffnete Vertiefungsthemen bleiben beim Wochenwechsel geöffnet; die Reiterauswahl bleibt beim Rendern erhalten. Diese Auswahl wird nicht dauerhaft gespeichert und gehört nicht zum geteilten Gesundheitsdatenstand. Es gibt keine neue personenbezogene Ablage, Migration oder Berechnungsänderung.

### Aussagenbezogene Quellen und getrennte Prüfstände

Jedes Vertiefungsthema nennt seine passenden Originalquellen direkt im aufgeklappten Inhalt. Neue Texte wurden am **18.11.2026** anhand der unten verlinkten Fach-/Gesundheitsquellen geprüft. Körpertexte und bisherige Wochenimpulse übernehmen ihren bestehenden Quellenstand **17.11.2026** aus AgDR-0004; dieses Datum wird separat angezeigt. Diese Arbeit behauptet keine erneute vollständige Prüfung aller dortigen Phasenartikel oder eine fachärztliche Freigabe.

Der konkret gelesene NDR-Ernährungsartikel ergänzt ausschließlich das Thema „Alltag & Essen“, zusammen mit Netzwerk Gesund ins Leben. Sein Artikelstand **10.09.2024** bleibt von unserem Prüftag unterscheidbar. Die Themenübersicht und nicht gehörte Podcastfolgen werden nicht als Beleg für Schlaf, Gefühle oder medizinische Detailregeln verwendet. Es werden keine neuen Kalorien-, Supplement-, Schlaf- oder Trainingsgrenzwerte berechnet.

Texte und Quellenzuordnung liegen in der statischen Offline-Auslieferung. Die App lädt beim Lesen keine Originalseiten, Tracker, Audios oder fremden Bilder. Nur bewusst geöffnete externe Originalquellen benötigen Internet.

### Telefonnummern und Abstand in der Wissenssuche

**Ursache Telefonfelder:** Die gemeinsame Formularregel enthielt `text`, `date` und `number`, aber nicht `tel`. Dadurch erhielt ein Telefonfeld Browser-Standardrahmen und eine intrinsische Breite. `tel` verwendet jetzt dieselbe Gestaltung; Kontaktfelder sind ausdrücklich blockweise und so breit wie ihr Label. Die bestehende einspaltige mobile Anordnung bleibt erhalten.

**Ursache Wissenssuche:** Die allgemeine `.section-description` besaß `margin-top: -10px`, auch direkt unter der Suchüberschrift. Dort gilt jetzt ein eigener nicht negativer Abstand; die Überschrift bekommt zusätzlich unteren Abstand und eine passende Zeilenhöhe. Ein Umbruch auf schmalen Displays verdrängt den Beschreibungstext nach unten.

## Erwogene Alternativen

- Sechster Eintrag in der unteren Navigation: Würde die bereits dichte Leiste weiter verkleinern.
- Alle neuen Themen fortlaufend geöffnet: Würde die zuvor gewünschte Trennung von Überblick und Vertiefung schwächen.
- Neue medizinische Behauptungen für jede einzelne Woche: Die Quellen und die bisherige Phasenstruktur tragen diese Genauigkeit nicht.
- Telefonfelder als Text statt Telefon typisieren: Würde die passende Smartphone-Tastatur verlieren; die Korrektur gehört in die Gestaltung.
- Den Überschriftfehler nur mit kleinerer Schrift kaschieren: Die eigentliche negative Abstandsregel wird korrigiert.

## Folgen und Grenzen

F01 ist im Code umgesetzt. F04 Messwertverläufe und F05 Terminvorbereitung bleiben die nächsten P1-Arbeitspakete. Bestehende Daten, Journal, Geräteweitergabe und Quellenregeln ändern sich nicht. Eine installierte ältere PWA benötigt ein bewusstes Update. Die Beispiele in den Prüfungen sind ausschließlich synthetisch.

## Verifikation

- **168 von 168 Tests bestanden**, keine übersprungen; darunter sechs neue Tests für alle 42 Wochen, vorhandene Körpertexte, korrekte Phasengrenzen, abgewiesene ungültige Wochen, themengenaue Quellen einschließlich NDR, wechselnde Schwerpunkte und unveränderte Quelldaten bei Änderungen an Rückgabekopien.
- Ausführung mit `node --test tests/*.test.js`, identischer Einstieg wie `npm test`; npm nicht im PATH. Build über `node scripts/build.js` erfolgreich, entspricht `npm run build`.
- HTML-Schachtelung und eindeutige IDs geprüft; die neuen Module gehören zur Offline-Dateiliste.
- Safari mit isolierter synthetischer Datierung: direkter Sprung aus dem Überblick zu „Für dich“, korrekte 26. SSW und Phase 25.–28., unveränderter Körpertext, vier geschlossene Vertiefungen, Check-in-Zugriff und getrennte Prüfstände sichtbar. Nach Links-Taste erschien die Babyansicht zur selben Woche. Kein realer Datensatz oder Telefonanruf.
- Isolierte Safari-Layoutmessung bei **320, 390, 820 und 1440 CSS-Pixeln**, jeweils Mutteransicht, Wissenssuche und geöffnetem Kontakt-Dialog: **alle zwölf Kombinationen bestanden**. Geprüft wurden echte Inhaltsbreite, sichtbare Mutter-/ausgeblendete Babyansicht, vier Themen, korrekte Phase, gleich breite Reiter, mindestens zwölf Pixel Abstand zwischen Suchüberschrift und Beschreibung sowie Breite und gleiche Gestaltung aller drei Telefonfelder. Kein horizontaler Überlauf. Nur QA-Kopien mit angepasster initialer Ansicht und Cache-Umgehung; die Produktionsdateien enthalten diese Hilfen nicht. Die QA korrigiert den iframe-Breitenunterschied durch ausgeblendete Scrollleisten bei geöffnetem Modal, statt eine falsche Bildschirmbreite als bestanden zu behaupten.
- Lokale Dokumentationslinks und `git diff --check` geprüft. Der zuletzt angepasste reine Buttontext „Check-in für heute öffnen“ wurde nach dem Layoutdurchlauf nicht erneut manuell geöffnet; Geometrie und Funktion wurden damit nicht geändert.
- Offen: physische iPhone-/Android-Prüfung einschließlich Systemschrift/Querformat, vollständiger Screenreader-Durchlauf und klinische Inhaltsfreigabe. Der Check-in-Rundlauf wurde hier nicht erneut vollständig durchgespielt.

## Quellen

Am **18.11.2026** konkret gelesen und den passenden Vertiefungen zugeordnet:

- [IQWiG: Schwangerschaft – Verlauf und Alltag](https://www.gesundheitsinformation.de/schwangerschaft.html) – körperliche und emotionale Veränderungen, Alltagsplanung.
- [BIÖG: Entspannung und Schlaf](https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/entspannung-und-schlaf/) – Erholung und ärztliche Abklärung anhaltender Schlafprobleme; Seitenstand 25.06.2026.
- [Netzwerk Gesund ins Leben: Essen und Trinken](https://www.gesund-ins-leben.de/fuer-familien/fit-durch-die-schwangerschaft/essen-und-trinken-in-der-schwangerschaft/) – allgemeine Ernährungsgrundlage; Seitenstand 07.07.2026.
- [Netzwerk Gesund ins Leben: Bewegung](https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/bewegung/bewegungsausmass-und-art-vor-und-in-der-schwangerschaft/) – Aktivität und individuelle Gegenanzeigen.
- [BIÖG: Beratungsthemen](https://www.familienplanung.de/beratung/beratungsthemen/) – Inhalte und Zugang zur Schwangerschaftsberatung; Seitenstand 23.04.2019, Prüftag davon getrennt.
- [Familienportal des Bundes: Frühe Hilfen](https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/fruehe-hilfen) – Unterstützungsmöglichkeiten ab der Schwangerschaft.
- [NDR: Ernährung in der Schwangerschaft](https://www.ndr.de/ratgeber/gesundheit/Ernaehrung-in-der-Schwangerschaft-Was-ist-erlaubt-was-eher-nicht,ernaehrung676.html) – ergänzender redaktioneller Artikel, Stand 10.09.2024; keine Belegzuordnung zu anderen Themen.
- [Bisherige Phaseninhalte und ihre Quellen](../../src/content.js), [Quellenentscheidung AgDR-0004](0004-medizinische-inhalte.md), [NDR-Regeln AgDR-0018](0018-ndr-als-ergaenzende-quelle.md), [Inhaltstests](../../tests/mother.test.js). Reflexionsfragen, Reiterwahl und die konkrete Phasenzuordnung der allgemeinen Vertiefungen sind Agentenentscheidungen.
