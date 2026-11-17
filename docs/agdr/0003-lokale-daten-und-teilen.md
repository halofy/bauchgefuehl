# AgDR-0003: Lokale Daten und bewusst übernommene Teilen-Links

- **Status:** Umgesetzt
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Lokale Speicherung und Teilbarkeit vom Nutzer verlangt; Mechanismus vom Agenten gewählt
- **Betroffene Dateien:** [Speicher und Codec](../../src/pregnancy.js), [Interaktionen](../../src/app.js), [Hinweise und Dialoge](../../index.html)
- **Erweitert durch:** [AgDR-0006](0006-waehlbare-berechnungsmethode.md) – versionierte Methodenauswahl und ET-Payload; die folgende v1-Payload beschreibt den ursprünglichen Stand.
- **Erweitert durch:** [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md) – separater Geräte-Link mit laufendem Master-Sync und Merkhäkchen, lokaler Sicherungsverlauf und Backups. Der einfache Teilen-Link bleibt eine unabhängige Kopie.

## Kontext und Herkunft

Die Daten sollen lokal gespeichert und per Link teilbar sein. Es gibt kein gewünschtes Benutzerkonto und kein Backend. Perioden- und Schwangerschaftsangaben sind privat; der Umgang damit muss aus der Oberfläche verständlich werden.

## Entscheidung

Die App speichert unter `localStorage["bauchgefuehl.v1"]` ein versioniertes Objekt mit Profil und lokalen Merkhäkchen. Es werden keine Eingaben von der App an einen Server gesendet. Externe Fonts, Bilder und Analyseskripte sind nicht eingebunden. Eine Content Security Policy untersagt unter anderem ausgehende `connect`-Anfragen.

Geteilt wird ein URL-Fragment im Format `#s=<base64url-JSON>`. Es enthält nur:

```json
{ "v": 1, "p": "2026-07-09", "c": 30, "i": 0 }
```

`p` ist der Periodenbeginn, `c` die Zykluslänge und `i` die Angabe zu unregelmäßigen Zyklen. Namen und Merkhäkchen werden nicht übertragen. Die Daten sind **kodiert, nicht verschlüsselt**. Die Oberfläche zeigt vor dem Kopieren, welche Daten der Link enthält und dass alle mit dem Link sie lesen können.

Das Fragment wird nicht Teil des HTTP-Requests an den Host. `referrer=no-referrer` verhindert die Weitergabe der Ausgangsadresse bei externen Links. Der Host verarbeitet weiterhin normale Verbindungsdaten beim Laden der Website.

Ein empfangener Link wird zunächst als geteilte Ansicht angezeigt. Bereits gespeicherte Daten bleiben erhalten. Erst „Auf diesem Gerät speichern“ übernimmt das Profil, ersetzt gegebenenfalls vorhandene Daten und setzt die Merkhäkchen zurück. Speichern oder Verwerfen entfernt das Fragment aus der aktuellen Adresszeile. Die App sendet selbst keine Nachricht an andere.

## Erwogene Alternativen

- **Query-Parameter:** Würden die Gesundheitsangaben beim Seitenaufruf an den Webserver übertragen.
- **Cloud-Synchronisierung oder Kurzlinkdienst:** Benötigt zusätzlichen Betrieb und serverseitige Gesundheitsdaten.
- **Automatische Übernahme beim Öffnen:** Könnte das eigene Profil durch ein fremdes ersetzen.
- **Verschlüsselter Link mit Schlüssel im selben Link:** Schützt nicht vor Personen, die den vollständigen Link erhalten; für den aktuellen Funktionsumfang wird stattdessen das Zugriffsmodell klar benannt. Passwortgeschützte oder widerrufbare Freigaben wären eine neue Produktentscheidung.

## Folgen und Grenzen

Es gibt keine Cloud-Sicherung und keinen geräteübergreifenden Abgleich. Lokale Daten sind für Personen mit Zugriff auf dasselbe Browserprofil zugänglich und gehen beim Löschen der Website-Daten verloren. Bei gesperrtem Speicher bleibt die App im Sitzungsmodus nutzbar und behauptet keine erfolgreiche Speicherung.

Ein Link ist eine unabhängige Kopie der Eingaben. Er berechnet die SSW täglich neu, erhält aber keine späteren Änderungen. Bereits verteilte Links lassen sich nicht widerrufen; lokales Löschen macht sie nicht ungültig. Browser-Verlauf, Browser-Synchronisierung und Erweiterungen können vollständige Adressen lesen. Empfänger können Links weitergeben.

Beschädigte oder veraltete Links werden validiert und führen nicht zum Überschreiben lokaler Daten. Die App begrenzt das Payload auf 1.024 Zeichen, prüft Schema und Eingabewerte und überträgt keine beliebigen HTML-Inhalte in die Oberfläche.

## Verifikation

Automatisiert geprüft: Codec-Roundtrip, minimale Payload ohne Merkhäkchen, tägliche Neuberechnung beim Empfänger, unzulässige Versionen, beschädigte und überlange Links, ungültige Datumswerte, Speicher-Roundtrip, beschädigter und gesperrter Speicher sowie die Filterung unzulässiger Merkhäkchen. Ein vollständiger browserübergreifender Teilen-/Import-/Löschtest steht noch aus; die Unit-Tests ersetzen diesen nicht.

## Quellen

- [AgDR-0001: Statischer Betrieb](0001-statische-webapp.md).
- Technischer Vertrag: `encodeShare`, `decodeShare`, `readLocal` und `writeLocal` in [pregnancy.js](../../src/pregnancy.js).
