# AgDR-0027: Verständliche verschlüsselte Vollsicherung und vollständige Wiederherstellung

- **Status:** Umgesetzt
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Ausdrückliche Nutzeranforderung; Kryptografie und Dateiformat durch den Agenten
- **Betroffene Dateien:** [backup.js](../../src/backup.js), [devices-ui.js](../../src/devices-ui.js), [device-transfer.js](../../src/device-transfer.js), [backup.test.js](../../tests/backup.test.js)
- **Ersetzt / ersetzt durch:** Löst den standardmäßigen Klartext-Vollbackup-Export aus AgDR-0020 ab; Altdateien bleiben lesbar.

## Kontext und Herkunft

Der Nutzer verlangt ausdrücklich eine einfach verständliche, verschlüsselte vollständige Sicherung. Der Geräte-Stand enthält bisher keinen privaten Master-Schlüssel, keine offene Wehenmessung und keine vollständigen lokalen Sicherungsverläufe und ersetzt deshalb kein Vollbackup.

## Entscheidung

Neue Downloads verwenden das eigene Format `bauchgefuehl-encrypted-backup` v2. Der gesamte Inhalt einschließlich Metadaten wird mit AES-256-GCM verschlüsselt. Ein zufälliges 16-Byte-Salt und eine zufällige 12-Byte-IV werden je Export neu erzeugt. PBKDF2-SHA-256 mit fest geprüften 600.000 Iterationen leitet den Schlüssel aus einem Passwort mit 12 bis 256 Zeichen ab; Formatkennung wird als authentifizierte Zusatzinformation gebunden. Kein eigenes Kryptoverfahren, kein Upload und kein externer Schlüsseldienst.

Enthalten sind die unveränderten bekannten lokalen Rohbereiche: Schwangerschaft/Journal/Merkhäkchen, alle vier Sicherungsverläufe, Kontakte/Geburtsangabe/offene Wehenmessung, Termine/Fragen, Planung/Phase/Untersuchungsmaße, Gerätezuordnung einschließlich privatem Master-Schlüssel und alte Serverdaten. Ein gegebenenfalls unterbrochener Import wird zusätzlich als diagnostischer Rohinhalt erhalten, aber nicht blind aktiviert.

Eine gültige aktuelle Sitzungsfassung von Schwangerschaft/Journal wird zusätzlich verschlüsselt mitgesichert, falls sie im Arbeitsspeicher verfügbar ist. Standard-Wiederherstellung bleibt exakt bei den gespeicherten Rohdaten. Eine vorhandene Sitzungsfassung kann ausdrücklich bevorzugt werden; die gespeicherte Schwangerschaftsfassung wird dann zusätzlich im Verlauf erhalten.

Passwort wird zweimal eingegeben. Vor dem Download entschlüsselt die App das erzeugte Ergebnis intern erneut und vergleicht die Rohdaten; ein parallel geänderter Datenstand verhindert eine irreführende Sicherungsbestätigung. Es gibt keine Aussage, dass das Betriebssystem die Datei bereits dauerhaft gespeichert hat. Die Oberfläche erklärt Passwortverlust, getrennte Aufbewahrung und die fehlende Prüfung des Speicherorts.

Wiederherstellung: Datei auswählen, Passwort eingeben, entschlüsselte Vorschau prüfen, aktuellen lokalen Stand bei vorhandenen Daten zuerst sichern, dann bewusst wiederherstellen. Ein sauberer neuer Vollbackup stellt alle erfassten Rohbereiche einschließlich Historien exakt wieder her. Die bestehende Mehrschlüssel-Transaktion mit dauerhafter Vorher-/Nachher-Sicherung schützt vor Teilimporten. Alte Klartext-Backups bleiben über den bisherigen, normalisierenden Importweg nutzbar; sie besitzen nicht nachträglich dieselbe exakte Vollständigkeitsgarantie.

Fehlerhafte aktive Rohdaten können weiterhin verschlüsselt zur späteren Rettung exportiert werden. Formathülle und authentifizierte Entschlüsselung werden dabei geprüft; medizinische Nutzbarkeit der Rohdaten wird nicht behauptet. Aktive Datenformate werden vor Wiederherstellung gesondert validiert. Bei beschädigten Inhalten oder offenem Import wird die automatische Wiederherstellung abgebrochen, die Originaldatei bleibt unverändert. Größenlimit: 32 MiB vor Verschlüsselung; keine Kürzung.

## Erwogene Alternativen

Den Geräte-Stand als Vollbackup zu bezeichnen wäre sachlich falsch. Klartext als Standard erfüllt die Anforderung nicht. Ein kontogebundener Cloud-Schlüssel widerspricht dem serverlosen Offline-Ziel. Passwortwiederherstellung ohne externen Dienst ist nicht vorgesehen.

## Folgen und Grenzen

Wer Datei und Passwort besitzt, erhält alle enthaltenen Gesundheitsdaten und gegebenenfalls Master-Rechte. Ein wiederhergestellter Master deaktiviert den ursprünglichen Master nicht. Datei und Passwort sind getrennt aufzubewahren. Browserdaten können weiterhin durch das Betriebssystem gelöscht werden; ein lokaler Sicherungsverlauf ist keine externe Sicherung. Kein Betriebssystem-Dateidialog kann von der Webapp zuverlässig als dauerhafte Speicherung verifiziert werden.

## Verifikation

Tests für verschlüsselten Rohdaten-Rundlauf einschließlich privatem Master-Schlüssel, Verläufen und offener Messung; unterschiedliche IV/Salt bei gleichem Inhalt; falsches Passwort, manipulierten Geheimtext, unbekannte Version, fehlende/fremde Speicherbereiche, beschädigte aktive Daten, exportierbare beschädigte Rohdaten, Importdiagnostik und Rückrollen bei Speicherfehler. Zusätzlich geprüft: exakte Erhaltung älterer v1/v2-Rohprofile und ausdrückliche Bevorzugung einer verschlüsselten Sitzungsfassung mit Erhalt der gespeicherten Fassung. Safari zeigte den erfolgreichen Verschlüsselungs-/Entschlüsselungsprüfschritt und den gestarteten Download; die nachfolgende Browser-Downloadfreigabe wurde abgebrochen. Damit sind Betriebssystem-Dateiablage und Dateiimport in dieser Browserprüfung nicht als bestanden belegt.

## Quellen

- [Web Cryptography API, W3C](https://www.w3.org/TR/WebCryptoAPI/).
- Projektinterne Implementierungen und Tests, oben verlinkt. Die Parameterwahl ist eine Agentenentscheidung und keine behauptete Browsergarantie.


## Abschlussnachweis vom 18.11.2026

- Gesamte Testsuite: **218 Tests bestanden**, keine Fehler oder ausgelassenen Tests. Ausgeführt mit `node --test tests/*.test.js`, entsprechend dem `npm test`-Skript. `npm` war in der Ausführungsumgebung nicht verfügbar; keine erfolgreichen npm-Aufrufe werden behauptet.
- `node scripts/build.js` (entsprechend `npm run build`) erfolgreich; aktuelle auslieferbare PWA in `dist/`.
- 356 eindeutige statische HTML-IDs; relative Modul-/Dokumentlinks, Gleichheit von Quelldateien und Build sowie 47 Offline-Dateien einschließlich aller neuen Module geprüft. `git diff --check` ohne Fehler.
- Safari-Stichproben: synthetische Grundlage, gespeicherter Planungsentwurf mit abgelehntem Verwerfen beim Browser-Zurück, explizites PWA-Update, gespeicherter Untersuchungswert mit Herkunftstext und getrennter Anzeige, angelegter eigener Termin und interne Vollbackup-Verschlüsselungsprüfung. Für den Terminmappen-/Notizdialog lieferte die native AX-Abfrage zeitweise keinen Inhalt; zusätzliche Fokusbehandlung wurde eingebaut, danach aber kein vollständiger manueller Gesamtdurchlauf wiederholt.
- Nicht behauptet: physische iPhone-/Android-Prüfung, installierte PWA-Systemgesten, Screenreader-Gesamtlauf, Betriebssystem-Dateiablage/-Import oder Druck/PDF-Gesamtlauf. Die letzten Fokus-/Sitzungs-/Kontextkorrekturen sind durch Syntax-/Modellprüfungen abgesichert, nicht durch einen neuen vollständigen Browserlauf. Keine Veröffentlichung oder ausdrückliche nachträgliche Nutzerfreigabe.
