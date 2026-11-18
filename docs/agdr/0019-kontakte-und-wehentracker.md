# AgDR-0019: Drei Anrufkontakte und persistenter Wehentracker

- **Status:** Umgesetzt; Modelle automatisiert und Hauptablauf lokal in Safari geprüft. Physische Smartphone-Prüfung offen.
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Ausdrückliche Nutzeranforderung; Anzeigegrenze, Speicherung und Zeitauswertung durch den Agenten
- **Betroffene Dateien:** [Modell](../../src/birth.js), [Oberfläche](../../src/birth-ui.js), [App](../../src/app.js), [Kalender](../../src/calendar-ui.js), [HTML](../../index.html), [Styles](../../styles.css), [Tests](../../tests/birth.test.js)
- **Erweitert:** [Journal](0009-persoenliches-journal.md), [Kalender](0014-kalender-und-journal.md), [Quellenregeln](0004-medizinische-inhalte.md); Sicherung über [AgDR-0020](0020-serverloser-geraeteabgleich.md)

## Kontext und Herkunft

Der Nutzer wünscht drei Kontakte mit Name und Telefonnummer sowie Anruf per `tel:`. Ein Wehentracker soll ab möglicher Lebensfähigkeit per schwebender Schaltfläche erreichbar sein, im Kalender protokollieren und bei einem passenden Muster Kontaktaufnahme ermöglichen.

**Agentenentscheidung:** Die Schaltfläche erscheint ab **22+0** bei eigenen Angaben, bei offener Messung immer. Das ist eine Bediengrenze, keine individuelle Überlebensprognose. Der Tracker bleibt vorher über Hilfe/Kontakte erreichbar. Die gelesene UKD-Quelle nennt einen Bereich der 22.–24. Schwangerschaftswoche; daraus lässt sich kein garantierter individueller Zeitpunkt ableiten. Eine Messung darf medizinische Kontaktaufnahme nicht verzögern.

## Entscheidung

### Kontakte und laufende Messung

Bis zu drei Kontakte werden lokal unter `bauchgefuehl.birth.v1` gespeichert. Nummern werden auf Ziffern und optional führendes Plus normalisiert; Scripts, Zusatzparameter und Dienstcodes werden abgewiesen. Nur ein bewusster Tap auf einen Link öffnet `tel:`. Kein automatischer Anruf. Kontakte sind auch vor Eingabe einer Schwangerschaft erfassbar und auf Mitlesegeräten lokal bearbeitbar. Geräteübertragung ist optional, vollständige Backups enthalten sie immer.

Beginn einer Messung wird sofort dauerhaft gespeichert. Der Timer berechnet die Differenz zur gespeicherten Uhrzeit, statt Sekunden hochzuzählen. Neuladen, Hintergrund oder Bildschirmsperre verlieren den Beginn nicht; es findet keine Hintergrundüberwachung statt. Web Locks schützen Schreibvorgänge gegen parallele Tabs. Fehlender oder beschädigter Speicher sperrt die Messung, ohne bestehende Rohdaten zu ersetzen. Ein separater begrenzter Verlauf sichert vorherige Kontakt-/Messzustände.

### Journal und Kalender ohne neues Journalformat

Beim Stoppen entsteht ein normaler v3-Journaleintrag mit Tag „Wehen“, Dauer in Sekunden und gegebenenfalls Abstand von Beginn zu Beginn. Die stabile Kennung enthält den ursprünglichen Beginn. Die Zuordnung verwendet dessen lokalen Kalendertag, auch bei einem Ende nach Mitternacht. Normale Journalbearbeitung, Archivierung, Sicherung und bewusstes Teilen bleiben nutzbar. Eine zukünftige Beobachtung wird nicht angelegt.

Eine abweichende Endzeit ist bewusst wählbar; sie muss nach dem Beginn, höchstens 24 Stunden danach und nicht in der Zukunft liegen. Eine versehentliche Messung kann im Kalender bleiben und ausdrücklich von der Musterübersicht ausgeschlossen werden. Die offene Messung wird erst nach erfolgreicher Journalablage gelöscht. Wiederholung nach einem unterbrochenen Abschluss erzeugt weder Duplikat noch Überschreibung. Speicherlimits brechen den Versuch ab; der Beginn bleibt erhalten.

### Zeitmuster, keine Geburtsdiagnose

Die App prüft nur selbst erfasste Zeiten, nicht Schmerzstärke oder Muttermundwirkung. Beim ersten Kind lautet die technische Orientierung: zusammenhängende Abstände bis fünf Minuten, Dauer 60–180 Sekunden, mindestens eine Stunde zwischen erstem und letztem Beginn. Für weitere Kinder: mindestens drei Messungen mit Abständen bis zehn Minuten. Abstände dürfen sich im betrachteten Lauf höchstens um Faktor 1,3 unterscheiden; Überschneidungen oder Unterbrechungen setzen den Lauf zurück. Drei Beobachtungen, Toleranz und obere Dauergrenze sind **Agentenregeln zur Darstellung**, keine klinisch validierten Grenzwerte. Bei weiteren Kindern wird nicht eine zusätzliche Stunde abgewartet.

Berücksichtigt werden die letzten zwei Stunden; ein Hinweis wird nur bei einem Abschluss innerhalb der letzten 15 Minuten als aktuell angezeigt. Archivierte, ausgeschlossene, zukünftige oder ungültige Messungen zählen nicht. Ein positives Ergebnis heißt „gemessene Zeiten erfüllen das Zeitmuster“, niemals „Geburtswehen bestätigt“. Ein negatives Ergebnis ist ausdrücklich keine Entwarnung. Kontakte stehen bei den Hinweisen bereit.

Vor 37+0 beziehungsweise bei unklarer Datierung wird auf rasche Kontaktaufnahme bei Verdacht auf vorzeitige Wehen hingewiesen. Warnzeichen verlangen unabhängig von Stufe und Muster medizinische Hilfe. Es wird nicht empfohlen, erst genügend Messungen zu sammeln.

## Erwogene Alternativen

- Diagnose von Geburtswehen allein aus Intervallen: Dafür fehlen Schmerzbeurteilung, Untersuchung und eine validierte Grundlage.
- Tracker vor einer vermeintlich exakten Lebensfähigkeitsgrenze sperren: Könnte hilfreiche Kontaktaufnahme erschweren; nur der zusätzliche Schnellzugriff ist zeitlich gesteuert.
- Messung nur im Arbeitsspeicher: Würde beim Neuladen Daten verlieren.
- Neues Journalformat für Wehen: Die vorhandenen Datenfelder reichen aus; abgeschlossene Einträge bleiben kompatibel.

## Folgen und Grenzen

Keine Änderung der SSW-Formel. Der Timer verwendet die Geräteuhr; starke Uhrzeitänderungen können eine Korrektur erfordern. Die App misst nicht selbst die Kontraktion. Der Nutzer muss Beginn und Ende auslösen. Kontakte und laufende Messung sind separate lokale Daten; vollständige Backups und Wiederherstellung berücksichtigen sie. Eine Geräte-Standweitergabe enthält keine laufende Messung. Journalberichte können die ausgewählten Wehenangaben einschließen; Kontakte gelangen nicht in den Bericht.

## Verifikation

Am 18.11.2026 ausschließlich synthetisch:

- Elf neue Modelltests bestanden: Telefonnummern, drei Kontakte, abgewiesene Schemen/Dienstcodes, Speicherfehler, offener Beginn, Dauer/Abstand, Mitternacht, idempotenter Abschluss, Ausschlüsse/Archiv, Zeitmuster/Grenzen und FAB bei 22+0.
- Safari: gespeicherten offenen Beginn wiederaufgenommen, Abschluss mit 83 Sekunden protokolliert, Kalendereintrag geöffnet. Zweiten synthetischen Kontakt gespeichert und erwartete `tel:`-Ziele geprüft; **kein Anruf ausgelöst**. Die Messung anschließend auf einem zweiten isolierten Browser-Speicher als gesperrten Mitlesestand gesehen.
- Letzte reine Darstellungskorrektur: eindeutiger Dialogtitel, Kontaktlinks bei den Musterhinweisen, gezielter Sprung für Kontakte beziehungsweise Tracker. Nach dieser Anpassung kein erneuter vollständiger manueller Dialogdurchlauf.
- Gesamtprüfung: **145 von 145 Tests bestanden**, keine übersprungen; Build über `node scripts/build.js` erfolgreich (npm nicht im PATH; identische Test-/Build-Einstiegspunkte).

Offen: zwei physische Smartphones, Telefon-App-Handoff, echte Kamera-/QR-Prüfung, Screenreader und klinische Validierung. Kein Geburtsmuster wurde medizinisch validiert; die Tests bestätigen nur die dokumentierten Rechenregeln.

## Quellen

Am **18.11.2026** gelesen und in der App verlinkt:

- [BIÖG: Wie verläuft eine Geburt?](https://www.familienplanung.de/geburt/rund-um-die-geburt/wie-verlaeuft-eine-geburt/) – Faustregeln für erstes und weiteres Kind; subjektive Stärke gehört ebenfalls zur Einordnung.
- [IQWiG: Anzeichen einer drohenden Frühgeburt](https://www.gesundheitsinformation.de/was-kann-man-tun-wenn-sich-eine-fruehgeburt-ankuendigt.html) – rasche medizinische Kontaktaufnahme bei Verdacht und Warnzeichen.
- [Uniklinik Düsseldorf: Frühgeburt und Lebensfähigkeit](https://www.uniklinik-duesseldorf.de/ueber-uns/pressemitteilungen/detail/ein-fruehchen-kommt-immer-via-kaiserschnitt-und-darf-nicht-angefasst-werden-stimmt-nicht), veröffentlicht 12.11.2026 – genannter Bereich 22.–24. Schwangerschaftswoche, keine exakte individuelle Garantie.
