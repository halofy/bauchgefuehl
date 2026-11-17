# AgDR-0006: Wählbare Berechnung aus Periode oder ET

- **Status:** Umgesetzt
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Methodenauswahl ausdrücklich vom Nutzer gewünscht; Datenmodell und Migration vom Agenten konkretisiert
- **Betroffene Dateien:** [Berechnung und Speicher](../../src/pregnancy.js), [Oberfläche](../../src/app.js), [Eingabe und Erläuterungen](../../index.html), [Tests](../../tests/pregnancy.test.js)
- **Ersetzt teilweise:** [AgDR-0002](0002-ssw-aus-periode-und-zyklus.md), bisheriger Ausschluss einer ET-Eingabe
- **Erweitert:** [AgDR-0003](0003-lokale-daten-und-teilen.md), Speicherung und Teilen-Format

## Kontext und Herkunft

Nach der ersten Umsetzung hat der Nutzer ausdrücklich eine Einstellung gewünscht, um die SSW alternativ vom ET auf der Standardbasis von 28 Zyklustagen zurückzurechnen. Das ergänzt die ursprüngliche Anforderung. Die persönliche Zykluslänge soll weiterhin als eigene Methode zur Verfügung stehen.

## Entscheidung

Der Bearbeitungsdialog unter **„Deine Grundlage“** bietet zwei Methoden:

| Methode | Erforderliche Eingaben | Berechnung |
| --- | --- | --- |
| Periode & individuelle Zykluslänge | Erster Periodentag, durchschnittliche Zykluslänge; optional unregelmäßig | Tage seit Periodenbeginn − (Zykluslänge − 28) |
| Vom ET zurückrechnen · 28-Tage-Basis | Voraussichtlicher Geburtstermin | 280 − Kalendertage von heute bis zum ET |

Die Ersteinrichtung verwendet weiterhin die Periodenmethode. Bei der ET-Methode entspricht der eingetragene ET **40+0**. Es wird keine weitere Zyklusanpassung vorgenommen. Die 28-Tage-Basis ist eine Darstellungskonvention für diese Rückrechnung; aus einem bereits gegebenen ET wird kein tatsächlicher Zyklus oder Eisprung ermittelt.

Die gewählte Methode ist im Überblick sichtbar. Beschriftungen, Livevorschau, Erklärung, geteilte Ansicht und Datenschutzhinweise beziehen sich auf die aktive Methode. Ausgeblendete Eingaben sind deaktiviert und werden nicht validiert.

Beim Wechsel von einer gültig ausgefüllten Periodenberechnung zur ET-Methode wird deren errechneter ET einmalig als editierbarer Vorschlag eingesetzt. Dies wird am Eingabefeld erklärt. Beim Zurückwechseln innerhalb desselben noch offenen Dialogs bleiben Entwürfe erhalten. Gespeichert wird ausschließlich das Profil der aktiven Methode. Beim erneuten Öffnen eines reinen ET-Profils wird kein angeblich tatsächlicher Periodentag erfunden.

Merkhäkchen bleiben beim Wechsel erhalten, wenn beide Berechnungen denselben ET ergeben. Ändert sich die rechnerische Zeitachse, werden sie wie zuvor bei geänderten Basisdaten zurückgesetzt. Beim Import eines geteilten Profils werden weiterhin keine fremden Merkhäkchen übernommen.

## Datenformat und Migration

Interne normalisierte Profile:

```json
{ "method": "period", "lmp": "2026-07-09", "cycle": 30, "irregular": false }
```

```json
{ "method": "due-date", "dueDate": "2027-04-17" }
```

Neue lokale Einträge und Teilen-Payloads verwenden **Version 2**. Der bestehende Local-Storage-Schlüssel `bauchgefuehl.v1` bleibt erhalten, damit vorhandene Daten gefunden werden. Lokale v1-Einträge werden beim Lesen als Periodenmethode normalisiert und erst bei einer ausdrücklichen Speicherung als v2 geschrieben; Merkhäkchen bleiben erhalten.

Teilen-Links enthalten nur die aktive Methode und deren benötigte Eingaben:

```json
{ "v": 2, "m": "period", "p": "2026-07-09", "c": 30, "i": 0 }
```

```json
{ "v": 2, "m": "due-date", "d": "2027-04-17" }
```

Bestehende v1-Links bleiben lesbar und bezeichnen immer die Periodenmethode. Unbekannte Methoden oder Versionen werden abgelehnt. Alte App-Versionen können v2-Links nicht lesen und müssen aktualisiert werden. Die Fragment- und Datenschutzregeln aus AgDR-0003 gelten weiterhin.

## Erwogene Alternativen

- **Beide Grundlagen gleichzeitig in eine Rechnung mischen:** Würde eine doppelte Zykluskorrektur oder eine unklare Priorität ermöglichen. Nur die ausgewählte Methode bestimmt die SSW.
- **ET immer aus der Periode ableiten und lediglich das Label ändern:** Würde keine echte alternative Eingabe ermöglichen.
- **Methode nur im Browser einstellen, ohne sie zu teilen:** Empfänger könnten mit einer anderen Grundlage rechnen.
- **Inaktive Periodenangaben in ET-Links behalten:** Unnötige Weitergabe privater Angaben; das ET-Profil enthält ausschließlich den ET.

## Folgen und Grenzen

Es gibt nun zwei ausdrücklich unterscheidbare Berechnungsgrundlagen. Die ET-Methode ist eine Rückrechnung, keine neue medizinische Bestätigung. Ein übernommener ärztlicher ET kann die ärztliche Datierung abbilden; seine Herkunft oder Genauigkeit wird nicht geprüft.

Zur Eingabeplausibilisierung darf ein ET höchstens 280 Tage in der Zukunft und 86 Tage zurückliegen. Dies entspricht einem rechnerischen Alter zwischen 0 und 366 Tagen und ist keine Aussage über einen normalen Schwangerschaftsverlauf. Vorhandene Hinweise ab 42+0 gelten weiterhin. In der Periodenmethode bleiben die bisherigen Eingabegrenzen und Unsicherheitshinweise erhalten.

## Verifikation

- **28 automatisierte Tests bestanden**, darunter acht neue Tests für die ET-Methode und Formatkompatibilität.
- Gleichwertige synthetische Grundlagen ergeben in beiden Methoden **18+3** am 17.11.2026 bei ET 17.04.2027.
- Geprüft: ET = 40+0, Tage vor und nach dem ET, Wochenwechsel, Datumsgrenzen, unbekannte Methoden, Ausschluss inaktiver Eingaben aus Speicherung und Teilen, v1-Links und Erhalt alter lokaler Merkhäkchen.
- JavaScript-Syntaxprüfung und statischer Build erfolgreich.
- HTML-IDs, Methodenauswahl, direkte DOM-Ziele und lokale Dokumentationslinks geprüft. Die gebaute Startseite mit Methodenanzeige und aktualisierten Erläuterungen wurde im nativen Chrome geladen; der neue Dialogablauf wurde noch nicht vollständig manuell durchgespielt.
- Die Grenzen der bisherigen Browserprüfung stehen in AgDR-0005; ein vollständiger browserübergreifender End-to-end-Test bleibt offen.

## Quellen

- [BIÖG: Geburtstermin berechnen](https://www.familienplanung.de/schwangerschaft/geburtstermin-berechnen/) – rechnerische Grundlage von 280 Tagen beziehungsweise 40 Wochen. Die Umstellung zur Rückrechnung ist eine daraus abgeleitete mathematische Implementationsentscheidung.
- [AgDR-0002: Periodenberechnung](0002-ssw-aus-periode-und-zyklus.md).
- [AgDR-0003: Lokale Daten und Teilen](0003-lokale-daten-und-teilen.md).
