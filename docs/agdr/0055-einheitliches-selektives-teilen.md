# AgDR-0055: Einheitliches selektives Teilen und geführter Empfang

- **Status:** Umgesetzt; Prüfung mit isolierten Browsern und QR-Decoder, physischer Smartphone-Test offen
- **Datum:** 2026-11-24
- **Entscheidende Instanz:** Ausdrückliche Nutzeranforderung, Auswahlgruppen und technische Ausgestaltung durch den Agenten
- **Betroffene Dateien:** [Teilen-Oberfläche](../../src/devices-ui.js), [Inhaltsauswahl](../../src/transfer-selection.js), [Übertragung](../../src/device-transfer.js), [App](../../src/app.js), [HTML](../../index.html), [Styles](../../styles.css), [Auswahltests](../../tests/transfer-selection.test.js), [Offline-Liste](../../sw.js), [README](../../README.md), [Feature-Liste](../open.md)
- **Ersetzt teilweise:** [AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md) für den Standard-Reiseexport und getrennte Teileinstiege, [AgDR-0020](0020-serverloser-geraeteabgleich.md) für Oberfläche und Gerätebegriffe, [AgDR-0022](0022-smartphone-nahuebertragung-und-kompakte-links.md) für die QR-Anzeigegrenze

## Kontext und Herkunft

Der Nutzer empfindet die bisherige Weitergabe als unverständlich und verlangt eine gemeinsame Stelle „Teilen“ mit drei bis vier Inhaltsgruppen. Er meldet eine fehlgeschlagene erste QR-Übernahme und möchte „Master“ ersetzen. Die bestehenden Vorgaben bleiben: ein bearbeitendes Gerät, Schutz vorhandener Daten, Offline-Betrieb ohne Datenserver oder fremden Verbindungsdienst und bewusste Auswahl weitergegebener Gesundheitsdaten.

Die Benennung als **Hauptgerät / Mitlesegerät**, die vier konkreten Gruppen, die obligatorische Minimalreise und die vorsichtigere QR-Grenze sind Agentenentscheidungen innerhalb dieses Auftrags. „Umgesetzt“ behauptet keine nachträgliche Nutzerfreigabe.

## Entscheidung

Alle allgemeinen Teileinstiege öffnen denselben Dialog. Dessen Hauptweg besteht aus Inhaltsauswahl, Passwort, Verschlüsselung und QR / Link / Datei. Drucken / PDF sowie vollständiger Gerätestand liegen unter „Weitere Datenoptionen“. Die persönliche Vollsicherung bleibt unter „Sicherung & Wiederherstellung“ verfügbar.

Vier sichtbare Inhaltsfelder:

1. **Reise**, immer dabei: ET, daraus ableitbare SSW und Wochenreise. Ein abgeleiteter ET ersetzt im geteilten Profil Periodenbeginn und Zykluslänge. Die berechnete Zeitachse bleibt gleich. Zyklusunsicherheit wird dabei nicht übertragen, wie beim bisherigen ET-basierten Minimallink.
2. **Termine**, freiwillig: eigene Termine einschließlich Uhrzeit, Ort und Anbieterart.
3. **Notizen & Fragen**, freiwillig: Journaltexte / Tags, Terminnotizen / Antworten / nächste Schritte und persönliche Planung einschließlich zugeordneter Personen. Ohne Termine werden die Terminverknüpfungen in der weitergegebenen Kopie entfernt.
4. **Messwerte & Befinden**, freiwillig: Journalmesswerte, Symptome, strukturierte Check-in-Werte und Untersuchungswerte des Babys. Freitext an Untersuchungswerten gehört zu Notizen und wird ohne deren Auswahl entfernt.

Neue Dialogöffnungen beginnen ausschließlich mit Reise. Die Reise ist erforderlich, damit die Kopie in den bestehenden Wochen-, Kalender- und Vorsorgeansichten gelesen werden kann. Kontakte, Perioden-/Zyklusgrundlage, Merkhäkchen, Geburtsdatum, lokale Sicherungsverläufe und private Schlüssel fehlen im Standardweg. Archivierte Datensätze der ausgewählten Bereiche sind enthalten; die Vorschau zählt ausdrücklich aktive Inhalte. Der separate vollständige Gerätestand und die Vollsicherung erhalten ihre bisherige Funktion einschließlich Phase / Geburtsdatum.

Die Auswahl erzeugt **vor** Signatur, Kompression und Verschlüsselung ein neues Objekt aus erlaubten Feldern. Die signierte Body-Version 4 transportiert die Auswahl mit. AES-GCM, PBKDF2, Signatur und kompakte Linkhülle bleiben unverändert. Alte Body-Versionen 1–3 und alte unverschlüsselte Reise-Links bleiben lesbar; neue unverschlüsselte Reise-Links werden in der Oberfläche nicht mehr erzeugt. Beide Geräte benötigen für v4 eine aktuelle App. Die internen Rollen `master` / `follower` und bestehenden Speicherschlüssel bleiben aus Kompatibilitätsgründen unverändert.

Ein geöffneter QR-Link führt direkt zum sichtbaren Empfang mit fokussiertem Passwortfeld. Manuelle Link-/Dateieingabe ist dort bei Bedarf erreichbar. Erst nach Entschlüsselung, Umfangsvorschau und Bestätigung werden Daten geschrieben. Eingaben, die sich während der Entschlüsselung ändern, machen das Ergebnis ungültig. Geänderte Sendeauswahl, Passwort oder Daten verwerfen einen vorbereiteten Export.

Erste Übernahmen auf Geräten mit eigenen aktiven Daten verlangen eine aktuelle Vollsicherung. Ein veränderter Umfang auf einem zugeordneten Mitlesegerät verlangt ebenfalls eine aktuelle Vollsicherung, bevor die aktive Kopie ersetzt wird. Vorherige Fassungen werden zusätzlich durch die bestehenden Schreibfunktionen archiviert. Hauptgerätbindung, Versionskonflikte, ältere Stände, Wiederanlaufsicherung und Schutz bei Speicherfehlern bleiben erhalten. Bereits geteilte Kopien und ihre Archive lassen sich nicht zurückrufen.

QR-Anzeige bis **1.500 Linkzeichen** statt bisher 2.200, maximal 340 CSS-Pixel, schwarze Module mit weißer Ruhezone. Das ist eine vorsichtige Produktgrenze für Lesbarkeit, keine garantierte Kamerakapazität. Größere Stände nutzen weiterhin vollständige Links bis 65.536 Zeichen oder die verschlüsselte Datei. Für QR-/Link-Erstellung verlangt die Oberfläche eine verwendbare HTTPS-App-Adresse. Eine lokale Vorschau erzeugt ausschließlich die Datei, sofern nicht ausdrücklich eine veröffentlichte App-Adresse eingetragen wurde. Die App selbst wird statisch gehostet, die ausgewählten Daten stehen verschlüsselt im Fragment.

## Erwogene Alternativen

- Getrennte Minimallinks, Journalberichte und Gerätezuordnung als gleichrangige Teileinstiege hätten das gemeldete Orientierungsproblem erhalten.
- Ein einziger vollständiger Export hätte die gewünschte Datenauswahl verhindert.
- Ein beliebiger überschreibender Import hätte vorhandene eigene Daten und bereits empfangene Bereiche gefährdet.
- Automatische Übertragung, Kamera-Suche nach Geräten und ein externer QR-/Sync-Dienst gehören nicht zum Auftrag. Die vorhandene native Betriebssystem-Teilenfunktion bleibt verfügbar, soweit der Browser sie anbietet.

## Folgen und Grenzen

Der Normalweg enthält vier Gruppen und eine Gerätebegriffs-Erklärung im Kontext. Änderungen kommen weiterhin mit jeder neu geteilten Kopie. Ein geänderter Umfang benötigt aus Datenerhaltungsgründen einen zusätzlichen Sicherungsschritt. Ein Download beweist keine dauerhafte sichere Aufbewahrung. Die Vollsicherung enthält ausdrücklich mehr Daten als eine geteilte Auswahl.

Die bei der Analyse beobachtete zugeklappte Empfangssektion war eine konkrete Schwäche des bisherigen QR-Einstiegs. Die genaue Ursache des vom Nutzer gemeldeten physischen Fehlversuchs ist ohne dessen Geräte-/Scanprotokoll nicht belegt. Eine nicht erreichbare localhost-Adresse und dicht gerenderte Codes sind weitere berücksichtigte Fehlerquellen, keine behaupteten Diagnosen dieses Versuchs.

## Verifikation

- `npm test`: **243 Tests bestanden**, einschließlich acht Kombinationen der optionalen Bereiche, tatsächlicher Auslassung von Freitext / Referenzen, v4-Verschlüsselung und Signatur, geänderter Umfänge, Versions-/Quellenbindung, bisherigen Formaten und Offline-Liste.
- `npm run build`: vollständige statische PWA erfolgreich erstellt.
- Zwei isolierte mobile Chromium-Browserkontexte, 390 × 844 CSS-Pixel, mit ausschließlich synthetischen Daten und unter einem HTTPS-Projektpfad lokal ausgelieferten Build-Dateien: Erstellung eines QR-/Link-Exports, Empfang direkt beim Passwort, falsches Passwort ohne Speicheränderung, bewusste Übernahme, datensparsame ET-Kopie, gesperrte Bearbeitung nach Neustart, wiederholte Übernahme, nach Sicherung erweiterter Umfang mit Terminen / Notiz / Messwert und Ablehnung eines älteren Links bestanden.
- Lokale Vorschau zeigt keinen nicht erreichbaren QR-Link und erhält den verschlüsselten Dateidownload. Kein horizontaler Überlauf in den beiden mobilen Testansichten, keine JavaScript-Laufzeitfehler in diesem Ablauf.
- Echter Offline-Neustart aus dem Service-Worker-Cache mit anschließender Verschlüsselung / Dateibereitstellung sowie Wechsel zu Journal- und Planungsdruckdateien im Browser bestanden.
- Gerenderten QR-Code separat mit dem lokalen macOS-Core-Image-Decoder ausgelesen; dekodierter Text stimmt bytegenau mit dem erstellten Link überein. Dies ist keine Simulation einer Smartphone-Kamera.

Noch offen: Kamera-Scan zwischen physischen iOS-/Android-Geräten, echte OS-Datei-/Nahübertragung, Safari-/Firefox-Matrix und Veröffentlichung dieses Builds. Die QR-Decoderprüfung mit Apple Vision war in der lokalen Testumgebung wegen eines nicht ladbaren ANE-Modells nicht nutzbar; die unabhängige Core-Image-Prüfung war erfolgreich.

## Quellen

- [Auswahl und Adressprüfung](../../src/transfer-selection.js)
- [Signiertes Übertragungsformat und Importregeln](../../src/device-transfer.js)
- [Neue Modelltests](../../tests/transfer-selection.test.js), [bestehende Übertragungstests](../../tests/device-transfer.test.js), [PWA-Tests](../../tests/pwa.test.js)
- [AgDR-0027: Verschlüsselte Vollsicherung](0027-verschluesselte-vollsicherung.md)

Keine medizinischen Aussagen oder Berechnungsformeln wurden geändert.
