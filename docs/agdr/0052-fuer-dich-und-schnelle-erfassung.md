# AgDR-0052: Für dich und schnelle Erfassung

- **Status:** Vorgeschlagen, keine Umsetzung
- **Datum:** 2026-11-23
- **Entscheidende Instanz:** Der Nutzer nennt „Für dich“ als erwarteten Ort für eigene Messwerte und die Erfassung, bemängelt die Wahl zwischen Journal und Check-in und fragt nach Punkt oder Komma. Navigation, Einstiege und Standardfelder sind Vorschläge des Agenten.
- **Betroffene Ansichten:** [Navigation und Journalformular](../../index.html), [Journaloberfläche](../../src/journal-ui.js), [Check-in-Daten](../../src/checkin.js), [Untersuchungswerte](../../src/companion-ui.js)
- **Ersetzt / ergänzt:** Überarbeitet den Navigationsvorschlag für Journal und „Für dich“ aus [AgDR-0051](0051-mobile-informationsarchitektur.md). Die dort vorgeschlagene Ordnung von Kalender und Vorsorge gilt weiter.

> Umfang und Prüfung der Umsetzung stehen in [AgDR-0053](0053-mobile-neuordnung-und-gemeinsame-erfassung.md).

## Kontext und Herkunft

In der laufenden App ist „Für dich“ ein Reiter in der Wochenreise. Die Nutzerin kann ihre Körpermesswerte im Journal erfassen, muss aber dorthin wechseln. Das Journal unterscheidet schon beim Öffnen zwischen freiem Eintrag und strukturiertem Check-in. Ein freier Eintrag zeigt heute zwei Standardzeilen für Gewicht und Bauchumfang. Für Brust- und Hüftumfang muss die Nutzerin weitere Zeilen hinzufügen und jeweils eine Messart wählen. Die App kennt zusätzlich Körpertemperatur und eigene Messgrößen. [Journaloberfläche](../../src/journal-ui.js), [Vorhandene Messgrößen](../../src/journal.js)

## Entscheidung

### Für dich als fester Einstieg

Die untere Navigation lautet **Heute · Wochenreise · Für dich · Kalender · Vorsorge**. „Für dich“ zeigt zwei Aktionen für die Eingabe und zwei Zugänge zum Wiederfinden. **Messwerte eintragen** öffnet die Körpermesswerte zum Eingeben. **Heute festhalten** öffnet Notiz, Symptome und die Fragen zum Befinden. **Deine Einträge** zeigt die bisherigen Journal- und Befindenseinträge mit Suche und Rückblick. **Deine Messwerte** führt zu den bestehenden Verläufen, Einheiten, Ausgangswerten und Originalen. Die Wocheninfos für die Schwangere bleiben unter **Dein Körper in dieser Woche** erreichbar. Die Wochenreise führt dort direkt zur gewählten SSW über **Für dich in dieser Woche**. Ein Besuch dieses Wochenartikels verändert den Tag eines neuen Eintrags nicht.

Auf **Heute** stehen **Messwerte eintragen** und **Heute festhalten** als direkte Einstiege. Ein Aufruf vom Kalender übernimmt den gewählten Tag, soweit er für die Eingabe zulässig ist. Die vorhandenen Werte aus Ultraschall und anderen Untersuchungen des Babys bleiben als **Untersuchungswerte deines Babys** bei der Wochenreise. Das hält die eigene Gewichtsmessung und das geschätzte Babygewicht anhand der Beschriftung auseinander. Wissen bleibt von Heute und über passende Inhalte erreichbar.

### Ein Formular mit direktem Einstieg zum richtigen Feld

„Journal“ bezeichnet die Sammlung. Der bisherige „Check-in“ liefert vier freiwillige Angaben zu Stimmung, Energie, Schlaf und Beschwerdestärke. Diese Felder erscheinen unter der Frage **Wie geht es dir?**. Ein einziges Formular macht die Auswahl eines Eintragstyps vor dem Öffnen überflüssig. Beide Einstiege öffnen denselben Entwurf und beginnen bei den jeweils relevanten Feldern. Die Nutzerin kann im selben Vorgang Gewicht, Müdigkeit und eine Notiz speichern. Wer nur einen Wert eingibt, speichert unmittelbar. Das Datum ist sichtbar und vorbelegt. Notiz, Symptome und Befindensfragen bleiben optional. Temperatur, Tags und eigene Messgrößen bleiben erreichbar.

Für den direkten Messwert-Einstieg sind vier Felder mit fester Beschriftung und Einheit sichtbar. Die vier Werte sind eine aus den vorhandenen Vorgaben abgeleitete Auswahl des Agenten. Sie sind vom Nutzer noch nicht einzeln bestätigt.

```text
Messwerte eintragen     Heute ▾

Gewicht (kg)        Bauchumfang (cm)
[             ]     [               ]
Brustumfang (cm)    Hüftumfang (cm)
[             ]     [               ]

Komma oder Punkt geht, z. B. 65,5 oder 65.5.
Nur ausgefüllte Felder werden gespeichert.

Weitere Angaben
[            Speichern             ]
```

**Zielweg:** Auf **Heute** ein Tipp bis zu den vier Feldern. Von einem beliebigen Hauptbereich zwei Tipps bis dorthin über **Für dich**. Nach der Eingabe einmal **Speichern**. Die Felder haben auf schmalen Displays und bei großer Schrift genügend Platz und können untereinander stehen. Der Fokus folgt der sichtbaren Reihenfolge. Fehlermeldungen bleiben beim betroffenen Feld, und der Entwurf bleibt bei einem Fehler geöffnet. Die Navigation ersetzt die bestehenden Klicks zur Auswahl von Messarten durch sichtbare Feldnamen.

Die Erfassung nutzt die vorhandenen Journalformate. Bei einem neuen Eintrag mit strukturierten Angaben bleibt deren bisherige Zuordnung für Filter, Rückblick und selektive Weitergabe erhalten. Ein Eintrag mit mehreren Arten von Angaben wird als ein datierter Eintrag gespeichert. Beim Bearbeiten bleiben Eintragsidentität und vorhandene Typinformationen erhalten. Es ist keine Neuzuordnung alter Daten erforderlich.

### Dezimaltrennzeichen

**Heute:** Persönliche Journalmesswerte und die Schlafdauer akzeptieren sowohl Komma als auch Punkt. Auch das Formular für Untersuchungswerte akzeptiert beide über seine eigene Umwandlung. Ein einzelner Punkt ist im Journal ein Dezimaltrennzeichen, beispielsweise bedeutet `1.234` den Dezimalwert `1,234`. Ganzzahlige Skalen bleiben ganzzahlig. [Journalparser](../../src/journal.js), [Schlaf und Skalen](../../src/checkin.js), [Untersuchungsformular](../../src/companion-ui.js)

**Ziel:** Dauerhaft sichtbare Formulierung beim Feldblock „Komma oder Punkt geht, z. B. 65,5 oder 65.5.“ Die numerische Tastatur bleibt bei Dezimalfeldern verfügbar. Beide Eingaben werden gleich gespeichert und deutsch mit Komma angezeigt. Die Bearbeitung zeigt den ganzen gespeicherten Wert ohne Tausendertrennzeichen. Eingaben mit mehreren Trennzeichen werden mit einem konkreten Hinweis abgelehnt. Dieselbe Regel soll später in allen vorhandenen Dezimalfeldern gelten, mit den bestehenden Grenzen der jeweiligen Messgröße. [W3C WAI zu Formathinweisen](https://www.w3.org/WAI/tutorials/forms/instructions/)

## Erwogene Alternativen

Ein Haupttab „Journal“ vereinfacht den Zugriff auf die Liste, gibt Körpermessungen aber keinen unmittelbar verständlichen Ort. Ein Eingangsmenü mit „Journal“, „Check-in“ und „Messwerte“ behält die Frage bei, welche Kategorie vor der Eingabe zu wählen ist. Der direkte Einstieg über Tätigkeiten und ein gemeinsamer Editor helfen auch dann, wenn eine Nutzerin ihre Beobachtung noch nicht eingeordnet hat. [NN/g zu vertrauter Sprache und Wiedererkennen](https://www.nngroup.com/articles/ten-usability-heuristics/)

## Folgen und Grenzen

Die Neuordnung verwendet vorhandene Messarten, Eingabefelder und Auswertungen. Die direkte Eingabe mehrerer vorhandener Körpermesswerte ist eine Änderung der Bedienung. Datenhaltung, Rechte, Offline-Verfügbarkeit, Exportauswahl und Schutz ungespeicherter Entwürfe gelten fort. Dieses Konzept führt keine neuen Messgrößen oder gesundheitlichen Bewertungen ein.

## Verifikation

- Im vorhandenen Code wurden die zwei anfänglichen Messwertzeilen und alle fünf vordefinierten Körpermessarten geprüft. Mit synthetischen Zahlen wurden die Dezimalumwandlung im Journal, die Schlafdauer und die Umwandlung des Untersuchungsdialogs samt Speichermodell nachvollzogen. Beide Trennzeichen führen zum gleichen Zahlenwert.
- Für den Entwurf ohne Voraberklärung prüfen, wohin die Nutzerin zuerst tippt, um eigene Messwerte zu finden. Von Heute müssen alle vier Felder mit einem Tipp sichtbar werden. Ein, mehrere oder alle vier Werte lassen sich mit einmaligem Speichern erfassen. Ein gemischter Eintrag muss im Rückblick, Archiv und Export wie erwartet auffindbar sein.
- Dezimalbeispiele auf deutscher und englischer Mobil-Tastatur prüfen und auch einfügen. Bei fehlerhafter Eingabe Fokus, Fehlermeldung und Erhalt der übrigen Felder prüfen. Diese UI und ihre Verständlichkeit sind bisher nicht implementiert oder mit Nutzerinnen getestet.

## Quellen

- Nutzerfeedback zum Navigationsentwurf. [AgDR-0051](0051-mobile-informationsarchitektur.md)
- Vorhandene Funktionen und Datentypen. [Journal](../../src/journal.js), [Journaloberfläche](../../src/journal-ui.js), [Check-in](../../src/checkin.js), [Untersuchungsdialog](../../src/companion-ui.js)
- [NN/g zu vertrauter Sprache und Wiedererkennen](https://www.nngroup.com/articles/ten-usability-heuristics/), [W3C WAI zu sichtbaren Formathinweisen](https://www.w3.org/WAI/tutorials/forms/instructions/)
