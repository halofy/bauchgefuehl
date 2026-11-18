# AgDR-0023: Tages-Check-in und strukturierter Wochenrückblick

- **Status:** F02 und der offene Check-in-Anteil von F03 umgesetzt; Modell-, Übertragungs- und Datenschutztests bestanden. Mobiler Gesamtdurchlauf offen.
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzer möchte P1 „Mutterbezogenen Alltag verbessern“ als Nächstes bearbeiten; Start mit F02/F03 und konkrete Skalen durch den Agenten
- **Betroffene Dateien:** [Check-in-Modell](../../src/checkin.js), [Journal](../../src/journal.js), [Journaloberfläche](../../src/journal-ui.js), [Rückblick](../../src/reflection.js), [Rückblickoberfläche](../../src/reflection-ui.js), [Kalender](../../src/calendar-ui.js), [Bericht](../../src/report.js), [Berichtsoberfläche](../../src/report-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Styles](../../styles.css), [Offline-Dateien](../../sw.js), [Tests](../../tests/checkin.test.js)
- **Erweitert / ersetzt teilweise:** [AgDR-0015](0015-f03-symptomkalender-und-wochenrueckblick.md) hinsichtlich des dort offenen Check-in-Anteils; erweitert [Journal](0009-persoenliches-journal.md), [datensparsames Teilen](0016-kostenlos-offline-und-selektives-teilen.md)

## Kontext und Herkunft

Der Nutzer schlägt als nächsten Arbeitsbereich P1 vor. Die Feature-Liste enthält dafür F01 „Für dich“, F02 Tages-Check-in, F03 Rückblick, F04 erweiterte Messwertverläufe und F05 Terminvorbereitung. Strukturierte Rückblicke hängen ausdrücklich von F02 ab.

**Agentenentscheidung:** Mit dem zusammenhängenden Paket F02/F03 beginnen. Der Nutzer hat keine konkrete Skala, klinische Auswertung oder vollständige Bearbeitung aller fünf P1-Features in einem Schritt vorgegeben. F01, F04 und F05 bleiben eigene offene Arbeitspakete. „Umgesetzt“ behauptet keine nachträgliche Nutzerfreigabe oder Veröffentlichung.

## Entscheidung

### Freiwillige persönliche Beobachtungen

Ein Check-in enthält beliebige Kombinationen aus:

- **Stimmung jetzt:** 1 sehr belastet, 2 eher belastet, 3 gemischt/neutral, 4 eher gut, 5 sehr gut.
- **Energie jetzt:** 1 kaum, 2 wenig, 3 mittel, 4 viel, 5 sehr viel.
- **Schlafdauer:** 0 bis 24 Stunden innerhalb der letzten 24 Stunden einschließlich Nickerchen; Dezimalwerte und Komma möglich.
- **Stärkste Beschwerden jetzt:** eine subjektive Gesamteinschätzung von 0 „keine Beschwerden“ bis 10 „maximal vorstellbar“. Dies ist keine Bewertung jedes einzeln genannten Symptoms.

Diese Beschriftungen und Zahlenbereiche sind **Produktentscheidungen des Agenten**, keine validierten klinischen Fragebögen, Normwerte oder Grenzwerte für medizinische Hilfe. Die App bewertet die Zahlen nicht gesundheitlich, erzeugt keine Diagnose und leitet keine Angaben aus Texten, Tags oder fehlenden Einträgen ab. Quelle der Daten sind die bewussten persönlichen Angaben. Deshalb werden hierfür keine fremden Fachquellen als vermeintliche Validierung angegeben. Medizinische Informationen in den anderen Bereichen behalten ihre dortigen Quellen und Prüfstände.

Alle vier Felder beginnen leer. Null ist nur bei Schlaf und Beschwerden ein ausdrücklich wählbarer Wert. Ein komplett leerer Eintrag wird nicht gespeichert. Eine reine Notiz oder ein Symptom ohne strukturierte Felder bleibt möglich. Mehrere Check-ins am selben Tag erhalten eigene Kennungen und Uhrzeiten; Uhrzeit kann wie im Journal ausgelassen werden. Erfassung ist über Überblick, Kalender-/Journalbereich und einen gewählten Kalendertag bis heute erreichbar. Notiz, Symptome und weitere Messwerte sind im Check-in zunächst aufklappbar. Kein Streak, Pflichtformular oder automatischer Eintrag.

### Bestehendes Journalformat v3 verwenden

Check-ins sind normale Journalbeobachtungen mit Kennungen `checkin-…` und bis zu vier bestehenden eigenen Messwerten. Die reservierten Bezeichnungen `Check-in: Stimmung`, `Check-in: Energie`, `Check-in: Schlafdauer` und `Check-in: Beschwerdestärke` sowie Einheiten `1–5`, `1–5`, `h`, `0–10` definieren die Struktur. Erkannt wird sie nur bei einer Check-in-Kennung; freie Notizen, Tags oder ähnlich benannte Messwerte in anderen Einträgen werden nicht umgedeutet. Groß-/Kleinschreibung der reservierten Bezeichnungen verändert ihre Zuordnung nicht.

Dadurch bleiben Datumsfelder, Originalnotiz, Symptome, Tags, weitere Messwerte, Änderungszeitpunkte und Archivierung im vorhandenen Format. Kein zweiter personenbezogener Speicher und keine Migration oder Veränderung der SSW-Berechnung. Bestehende Größenlimits (zwölf Messwerte je Eintrag, 1.000 Einträge, 512 KiB Snapshot) zählen die neuen Angaben mit; Überschreitungen brechen ohne Kürzung ab. Bestehende Masterrechte und Journal-Prüfung gegen veraltete lokale Fassungen gelten auch für Check-ins.

Bearbeiten nutzt denselben Journal-Dialog und behält Kennung/Erstellzeit. Archive bleiben wiederherstellbar. Lokale Sicherung, vollständige Backups, CSV und die signierte/verschlüsselte Geräteweitergabe enthalten die Originalwerte über das bestehende Journal. Ältere App-Versionen können diese Messwerte allgemein darstellen; für die spezielle Erfassung und getrennte Berichtsauswahl ist eine aktuelle App-Version erforderlich. Es gibt weiterhin keine automatische Geräteaktualisierung.

Ungültige Skalenwerte, falsche Einheiten oder mehrdeutige doppelte Felder werden nicht als gültige Werte ausgewertet oder als Null ersetzt. Die Originaldaten bleiben erhalten; beim Bearbeiten sind sie als weitere Messwertzeilen mit Korrekturhinweis sichtbar. Speichern verlangt eine bewusste Korrektur beziehungsweise Entfernung der widersprüchlichen Zeilen. Freie zusätzliche Messgrößen werden nicht still gelöscht.

### Rückblick und Originaleinträge

Der gewählte Kalendertag bestimmt weiterhin Montag–Sonntag. Die Check-in-Übersicht nennt Beobachtungen und unterschiedliche Tage sowie verstrichene Tage ohne Check-in getrennt von zukünftigen Tagen. Ein gewöhnlicher Journaleintrag schließt keine Check-in-Erfassungslücke.

Je Feld werden die letzte und gegebenenfalls erste gültige Angabe, Zeitpunkte, Anzahl der Angaben, unterschiedliche Tage sowie fehlende beziehungsweise nicht auswertbare Felder genannt. Mehrere Beobachtungen desselben Tages bleiben getrennt. Es gibt keine Mittelwerte für die ordinalen Skalen und keine Summe für möglicherweise überlappende Schlafzeiträume. Archivierte, außerhalb der Woche liegende und nach dem heutigen Datum liegende Einträge zählen nicht. Die bestehende Symptomauswahl beeinflusst diese Übersicht nicht; das ist beschriftet.

Der Sprung „Original-Check-ins dieser Woche“ öffnet die Journalliste mit genauem Zeitraum und Eintragsart. Andere Filter werden dabei zurückgesetzt. Der Kalender zeigt Check-in-Werte und ausgelassene Felder ausdrücklich an. Allgemeine Messwertübersichten zählen diese vier strukturierten Angaben nicht nochmals als gewöhnliche Messreihe.

### Bewusst begrenztes Teilen

Der Journalauszug erhält einen eigenen, anfangs abgewählten Bereich **Tages-Check-in**. **Weitere Messwerte** enthält diese reservierten Check-in-Felder nicht; die Trennung gilt auch bei beschädigter Einheit oder ungültigem Skalenwert. Ohne gewählten Check-in-Bereich stehen diese Werte weder in Vorschau/Datei noch in versteckten Metadaten. Persönliche Notizen, Symptome und Tags werden weiterhin über ihre eigenen ausdrücklich gewählten Bereiche gesteuert. Ein ausgewählter Check-in-Teil enthält nur Bezeichnung, Einheit und gespeicherten Wert; interne Kennungen und Zeitstempel werden nicht mitgegeben.

Enthält der Auszug Check-in-Werte, erläutert die eigenständige Offline-Datei die Skalen und den Schlafzeitraum. Vollständige Geräte-Stände und Backups bleiben dagegen vollständige Kopien. Bereits geteilte Kopien werden nicht nachträglich eingeschränkt.

## Erwogene Alternativen

- Neues v4-Journal mit eigenem Check-in-Feld: Für vier freiwillige Zahlen nicht nötig; würde Migration und Kompatibilität ausweiten.
- Freie eigene Messgrößen automatisch als Stimmung/Schlaf erkennen: Würde ausdrücklich freie Angaben umdeuten. Reservierte Kennung und Bezeichnungen begrenzen die Erkennung.
- Täglich genau ein Datensatz mit laufender Überschreibung: Würde mehrere Beobachtungen verdecken.
- Fehlende Angaben als Null, Schlafwerte aufsummieren oder Stimmung mitteln: Würde nicht erfasste beziehungsweise überlappende Daten falsch auslegen.
- Check-ins unter „Messwerte“ automatisch mitgeben: Würde ihre bewusste Auslassung erschweren.

## Folgen und Grenzen

F02 und F03 sind funktional umgesetzt. Die Skalen dienen der persönlichen Erinnerung und haben keine medizinische Validierung. Eine frei bearbeitete beziehungsweise aus einer älteren App veränderte reservierte Bezeichnung kann als allgemeine Messgröße erhalten bleiben; die App erfindet dann keine strukturierte Bedeutung. Größenlimits und mögliche Löschung des Browser-Speichers gelten weiter. Offline-Assets enthalten das neue Modul, eine installierte ältere App muss bewusst aktualisiert werden.

## Verifikation

- **162 von 162 Tests bestanden**, keine übersprungen; darunter 15 neue Tests für Freiwilligkeit, Null/fehlend, Skalenfehler, keine Ableitung aus Prosa, getrennte Beobachtungen, Bearbeitung, ungültige/mehrdeutige Originalwerte, Wochenabdeckung, Archivierung, zeitliche Grenzen, Schlaf ohne Summen, bestehendes v3-Format, lokale Wiederherstellung, verschlüsselten Dateirundlauf und tatsächliche Entfernung aus Teilberichten.
- Ausführung mit `node --test tests/*.test.js`, dem identischen Einstieg zu `npm test`; npm nicht im PATH.
- Firefox mit isolierter synthetischer Grundlage: Überblick zeigt Check-in-Zugriff; Dialog öffnet mit allen vier Feldern leer und Zusatzangaben geschlossen. Die fünf Stimmungsoptionen sind erreichbar. Der weitere Durchlauf wurde durch zwischenzeitliche Nutzerbedienung in einem anderen Tab unterbrochen; kein erfolgreicher Speichervorgang oder vollständiger manueller Rundlauf wird daraus behauptet.
- HTML-Schachtelung, eindeutige IDs, Journal-/Check-in-UI-Ziele und JavaScript-Syntax geprüft. Build über `node scripts/build.js` erfolgreich (identischer Einstieg zu `npm run build`). Neue Module liegen in `dist/` und der Offline-Dateiliste. Lokale Dokumentationslinks und `git diff --check` geprüft.
- Offen: vollständiger manueller Erstellen-/Bearbeiten-/Archivieren-/Rückblick-/Berichtsablauf, physische Smartphones, Screenreader, Layoutmatrix und erneuter Offline-Update-Durchlauf mit Check-ins. Übertragung wurde am Datenmodell, nicht erneut zwischen zwei physischen Geräten geprüft.

## Quellen

- [Nutzerbeauftragte Feature-Liste F02/F03](../open.md), [Journalgrundlage](0009-persoenliches-journal.md), [bisherige Rückblickregeln](0015-f03-symptomkalender-und-wochenrueckblick.md), [selektives Teilen](0016-kostenlos-offline-und-selektives-teilen.md), [serverlose Standweitergabe](0020-serverloser-geraeteabgleich.md).
- [Check-in-Modell und Skalen](../../src/checkin.js), [synthetische Prüfnachweise](../../tests/checkin.test.js). Herkunft der personenbezogenen Werte: eigene Eingaben. Keine neuen medizinischen Empfehlungen oder externen medizinischen Daten.
