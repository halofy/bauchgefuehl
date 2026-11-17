# AgDR-0002: SSW aus Periode und individueller Zykluslänge

- **Status:** Teilweise abgelöst durch [AgDR-0006](0006-waehlbare-berechnungsmethode.md)
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzeranforderung; Rechenmodell und Grenzen vom Agenten konkretisiert
- **Betroffene Dateien:** [Berechnung](../../src/pregnancy.js), [Oberfläche](../../src/app.js), [Tests](../../tests/pregnancy.test.js)

## Kontext und Herkunft

**Fortschreibung vom 17.11.2026:** Der Nutzer hat inzwischen eine optionale Rückrechnung vom ET gewünscht. AgDR-0006 ersetzt die bisherige Beschränkung auf eine einzige Methode. Die hier beschriebene Periodenberechnung bleibt die Voreinstellung. Die folgenden Abschnitte dokumentieren die ursprüngliche Entscheidung.

Der Nutzer verlangt ausdrücklich eine Berechnung anhand der letzten Periode und der durchschnittlichen Zykluslänge, nicht anhand eines eingegebenen ET mit fest angenommener Standardzykluslänge. Auf Rückfrage wurde „Zykluslänge“ ausdrücklich bestätigt; die Blutungsdauer ist nicht gemeint.

## Entscheidung

Eingaben sind der erste Tag der letzten normalen Periode, die eigene durchschnittliche Zykluslänge in ganzen Tagen sowie optional die Angabe unregelmäßiger Zyklen. Die Ersteinrichtung enthält keinen vorausgefüllten 28-Tage-Wert. Ein Mittelwert aus mehreren Zyklen wird vor der Eingabe auf ganze Tage gerundet.

```text
Abweichung = Zykluslänge − 28
SSW-Tage = Kalendertage seit Periodenbeginn − Abweichung
Volle Wochen = floor(SSW-Tage / 7)
Tage = Rest bei Division durch 7
ET = Periodenbeginn + 280 Tage + Abweichung
```

Die 28 Tage dienen nur als Referenz der Anpassung. Ein längerer persönlicher Zyklus verschiebt das geschätzte Entwicklungsalter nach hinten; ein kürzerer nach vorn. Der ET ist ein separat abgeleitetes Ergebnis und nie eine Eingabe in die SSW-Berechnung.

**18+3** bedeutet 18 abgeschlossene Wochen und 3 Tage, also die **19. SSW**. Wocheninhalte werden anhand dieser laufenden Woche gewählt. Vorsorgefenster verwenden dagegen ausdrücklich die Schreibweise abgeschlossener Wochen und Tage.

Beispiel mit synthetischen Daten: **09.07.2026**, **30 Zyklustage**, Stichtag **17.11.2026** → 131 − 2 = 129 Tage → **18+3**, ET **17.04.2027**.

Kalendertage werden über UTC-Tagesnummern subtrahiert, damit Sommerzeit keine zusätzlichen oder fehlenden Tage erzeugt. „Heute“ ist der lokale Kalendertag des Browsers. Die Ansicht aktualisiert sich bei Tageswechsel und beim Wiederöffnen des Tabs.

## Erwogene Alternativen

- **Rückrechnung von einem ET:** Widerspricht der ausdrücklichen Anforderung und verschleiert die gewählte Grundlage.
- **Immer 28 Zyklustage:** Ignoriert die persönliche Eingabe.
- **Unkorrigierte Zeit seit Periodenbeginn als alleinige SSW:** Berücksichtigt die gewünschte Zykluslänge nicht. Die unkorrigierte Zählung erscheint nur ergänzend in der Erklärung.
- **Fester tatsächlicher Eisprung oder ärztliche ET-Überschreibung:** Dafür liegen keine Daten beziehungsweise keine entsprechende Anforderung vor. Eine solche Erweiterung benötigt einen eigenen AgDR.

## Folgen und Grenzen

Das Modell **schätzt** einen mit der Zykluslänge verschobenen Eisprung. Es misst keinen Ovulationszeitpunkt, bestätigt keine Schwangerschaft und ersetzt keine ärztliche Datierung. Die Anwendung der Zyklusabweichung auf das angezeigte Entwicklungsalter ist das offengelegte Rechenmodell dieser App, keine Behauptung einer individuellen medizinischen Messung. Der Mutterpass kann eine andere SSW ausweisen.

Zugelassen sind 15–60 ganze Zyklustage und ein Periodenbeginn innerhalb der letzten 366 Tage bis einschließlich heute. Die Grenze ist eine Eingabeplausibilisierung, kein medizinischer Normbereich. Bei unregelmäßigen Zyklen oder außerhalb von 21–35 Zyklustagen wird die erhöhte Unsicherheit hervorgehoben.

Negative Rechenergebnisse werden als „vor dem rechnerischen Beginn“ erklärt und nicht als falsches 0+0 ausgegeben. Ab 42+0 weist die App auf die Grenze der Wocheninfos und die individuelle Betreuung hin. Das 2. Trimester beginnt als explizite Darstellungskonvention bei 14+0, das 3. bei 28+0; andere Quellen verwenden andere Grenzen.

## Verifikation

Automatisierte Tests prüfen insbesondere kurze und lange Zyklen, 18+3 versus 19. SSW, Wochen- und Trimestergrenzen, ET und Terminüberschreitung, negative Alter, Schaltjahre, Sommerzeit und vier Zeitzonen. Ein Test bestätigt, dass ein zusätzlich übergebener ET die Berechnung nicht beeinflusst. Die Livevorschau im nativen Chrome-Dialog zeigte für die synthetischen Beispieldaten 18+3 und 17.04.2027.

## Quellen

- [NHS: Due date calculator](https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/) – Periodenbeginn, individuelle Zykluslänge und genauere Ultraschalldatierung.
- [BIÖG: Geburtstermin berechnen](https://www.familienplanung.de/schwangerschaft/geburtstermin-berechnen/) – 280 Tage ab Periodenbeginn und Grenzen des errechneten Termins.
- [BIÖG: Schwangerschaftswochen](https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen/).
