# AgDR-0020: Geräte-Stände ohne Datenserver

- **Status:** Manueller serverloser Abgleich umgesetzt und geprüft; direkter automatischer Abgleich bleibt in F17 offen
- **Datum:** 2026-11-18
- **Erweitert durch:** [AgDR-0025](0025-termine-fragensammlung-und-klarerer-kalender.md) – versionierte Termin-/Notizübertragung in Body-Version 2, Backup und Recovery; bisherige Hülle und Verschlüsselung unverändert.
- **Teilweise abgelöst durch:** [AgDR-0022](0022-smartphone-nahuebertragung-und-kompakte-links.md) – getrennte QR-/Linkgrenzen, kompakte URLs, native Teilen-Auswahl und konkrete Nahübertragungsprüfung.
- **Entscheidende Instanz:** Nutzer verlangt serverlosen Betrieb und erlaubt QR/URL als Rückfall; technische Ausgestaltung durch den Agenten
- **Betroffene Dateien:** [Übertragungsmodell](../../src/device-transfer.js), [Oberfläche](../../src/devices-ui.js), [App](../../src/app.js), [HTML/CSP](../../index.html), [Offline-Dateien](../../sw.js), [Tests](../../tests/device-transfer.test.js)
- **Ersetzt:** [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md) für die aktive Geräteverbindung; erweitert/ersetzt teilweise die Serverannahmen in [AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md)

**Fortschreibung vom 24.11.2026:** [AgDR-0055](0055-einheitliches-selektives-teilen.md) löst die getrennten Teileinstiege, den neuen unverschlüsselten Reise-Export und die bisherige QR-Grenze teilweise ab. Neue Standardweitergabe ist eine selektive verschlüsselte Kopie in Body-Version 4. UI-Begriffe sind Hauptgerät / Mitlesegerät; interne Rollen und bestehende Formate bleiben kompatibel. Die folgenden Angaben dokumentieren die damalige Entscheidung.

## Kontext und Herkunft

Der Nutzer will zwei Smartphones ohne eigenen Dev-/Sync-Server und ohne fremde Verbindungsdienste abgleichen. Bevorzugt ist eine performante moderne direkte Verbindung; notfalls werden QR/URL erlaubt, andernfalls soll die Sync-Option verschwinden. Die frühere Präferenz für lokalen Serverbetrieb ist damit abgelöst.

**Agentenentscheidung:** Eine zuverlässige bewusste Übertragung signierter und verschlüsselter Stände umsetzen und die alte Serveroberfläche nicht mehr starten. Keine automatische Verbindung versprechen. Die ergänzende Rückfrage nach dieser manuellen Variante wird nicht als beantwortete Nutzerfreigabe behandelt; die Umsetzung nutzt den bereits ausdrücklich erlaubten Rückfall. Die optionale direkte Verbindung bleibt sichtbar offen.

## Entscheidung

### Kein Datenserver und keine Hintergrundverbindung

Die App importiert `devices-ui.js` statt der bisherigen Sync-Oberfläche. Es werden keine Sync-Requests, Timer für Serverabfragen oder alten Einladungen mehr ausgeführt. Ein `#sync=`-Link erhält nur einen Hinweis. Alte lokale Verbindungsdaten einschließlich ausstehender Änderungen und Schlüssel bleiben für Backups erhalten. Serverdateien und ihre Tests bleiben als historische Kompatibilitätsgrundlage im Repository; es wird kein Datenordner gelöscht.

Die statische App bleibt auf GitHub Pages hostbar. Das erste Laden der App ist von der Datenübertragung zu unterscheiden. Beide Geräte laden die App vorher vollständig; danach ist Dateiübernahme offline möglich. Die CSP begrenzt Verbindungsanfragen auf die eigene Herkunft. Externe Quellen öffnen erst nach bewusstem Linkaufruf. Die Gerätefunktionen verwenden weder Signalisierungsdienst noch STUN/TURN, Cloudspeicher, Kurzlinks oder Tracking.

### Verschlüsselung, Kompression und Masterbindung

Der erste Export erzeugt lokal ein ECDSA-P-256-Schlüsselpaar. Die Kennung ist der SHA-256-Fingerabdruck des normalisierten öffentlichen Schlüssels. Der private Schlüssel bleibt beim Master beziehungsweise im ausdrücklich vollständigen Backup. Der Master signiert Version und Daten; der Empfänger prüft die Signatur vor Übernahme. Sein Mitlesestand enthält keinen privaten Master-Schlüssel.

Ein eigener SHA-256-Inhaltsabgleich erhöht die Versionsnummer bei geändertem Exportinhalt. Gleichbleibende Inhalte behalten die Version. Das vollständige signierte Paket wird nach Möglichkeit mit `CompressionStream('gzip')` komprimiert. Der Empfänger begrenzt die entpackte Größe. AES-GCM mit zufälligem 96-Bit-IV verschlüsselt das Paket; der Schlüssel entsteht aus dem getrennt eingegebenen Passwort über PBKDF2/SHA-256 mit 250.000 Iterationen und zufälligem 128-Bit-Salt. Das Passwort muss mindestens zwölf Zeichen haben, wird nicht gespeichert und steht nicht im Link. Parameter und Größenlimits sind Agentenentscheidungen, keine Behauptung eines externen Sicherheitsaudits.

Das Format enthält Version und Kompressionskennung; unbekannte Formate, falsches Passwort, beschädigte Verschlüsselung und ungültige Signaturen werden ohne Datenänderung abgewiesen. Bei fehlenden nötigen Browserfähigkeiten wird ein Fehler gezeigt, nicht unverschlüsselt übertragen.

### QR/Link oder vollständige Datei

Bei einer gesamten Linklänge bis 1.800 Zeichen wird ein QR-/Fragmentlink erzeugt. Größere Stände verwenden eine verschlüsselte JSON-Datei; kein Abschneiden, keine unhandliche Folge von Teil-QR-Codes. Das Fragment wird nicht beim normalen Abruf an den Host gesendet. Die persönliche Geräte-/Clipboard-/Dateiumgebung bleibt eine mögliche Kopiestelle; kein Widerruf bereits verteilter Stände wird versprochen.

Der Export enthält vollständige Berechnungsgrundlage, Journal einschließlich Archiv und Merkhäkchen. Kontakte sind abgewählt und nur ausdrücklich einschließbar; eine offene Messung bleibt lokal. Für einzelne Journalbereiche bleibt der vorhandene Auszug zuständig. Nach lokaler Bearbeitung wird ein zuvor erzeugter Export verworfen und muss neu erstellt werden.

### Vorschau und Übernahme

Nach Entschlüsselung zeigt die App Masterkennung, Version und Umfang. Erst ein weiterer bewusster Schritt übernimmt den Stand und macht das Ziel zum Mitlesegerät. Kontakte werden auch dann nur gesondert auf Wunsch übernommen. An einen Master gebundene Empfänger verweigern fremde Quellen, ältere Versionen, gleiche Version mit anderem Inhalt, fehlende Journal-IDs und ältere/abweichende Journalfassungen. Ein Master importiert keinen fremden Stand.

Vor erstmaligem Ersetzen abweichender eigener Daten verlangt die App einen vollständigen Backup-Download des aktuellen Zustands. Dieser Download wird nicht als dauerhafte Aufbewahrung behauptet. Ein offener Wehentimer muss vorher abgeschlossen werden. Das Mastergerät verwendet eine ursprungsbezogene Web-Lock-Sperre, damit nicht mehrere Tabs gleichzeitig als Master arbeiten. Mitleser dürfen Kontakte gerätespezifisch pflegen, aber nicht das gekoppelte Journal bearbeiten.

### Abgesicherter Import und Sicherungen

Die bestehende Snapshot-/Journalvalidierung bleibt erhalten. Ein Schatten-Speicher berechnet Profil-/Journaländerung samt lokalem Sicherungsverlauf, ohne sie vorher anzuwenden. Vor dem mehrteiligen Commit wird ein dauerhafter Wiederherstellungsdatensatz mit Vorher-/Nachherwerten geschrieben. Bei Fehlern wird zurückgerollt. Beim Neustart wird ein vollständiger Commit abgeschlossen oder ein unvollständiger zurückgesetzt. Lässt sich die Wiederherstellung nicht sicher durchführen, bleiben Rohdaten und Recovery-Datensatz erhalten und Bearbeitung gesperrt, statt einen alten Stand zu überschreiben.

Vollständige Backups enthalten Profil, Journal, Kontakte, offene Messung, lokale Verläufe, Geräteschlüssel, gegebenenfalls alte Serverdaten und Recovery-Rohdaten. Nicht lesbare Speicherbereiche werden in der Datei benannt; gültige Sitzungsdaten können trotzdem gesichert werden. Backups sind Klartext. Neue und bisherige Backupformate mit gültiger Datierung sind auswählbar; es erfolgt kein Serverzugriff. Historische Rohverläufe bleiben in der Quelldatei erhalten und werden nicht blind anstelle des aktuellen Verlaufs eingespielt. Vor dem Übernehmen von Kontakten wird deren bisheriger lokaler Zustand im Kontaktverlauf gesichert. Ein Backup nur mit Kontakten lässt sich ohne erfundene Schwangerschaftsgrundlage wiederherstellen; vorhandene Datierung, Journal und Gerätezuordnung bleiben dabei erhalten. Ein außerhalb der unterstützten Datierung liegendes altes Backup oder beschädigte Recovery-Daten können weiterhin manuelle Prüfung erfordern; ihre Rohdaten bleiben exportierbar.

Masterwechsel und lokales Lösen erfordern zuvor ein aktuelles Backup. Die Zuordnung wird lokal archiviert; der bisherige Master und alte Kopien werden nicht aus der Ferne deaktiviert. Wiederherstellen einer alten Masterversion kann zu einer niedrigeren Versionsnummer führen; Mitleser verweigern sie weiterhin. Eine neue Zuordnung muss dann bewusst erfolgen.

## Erwogene Alternativen

- **WebRTC ohne fremde Infrastruktur pauschal als automatischen Sync anbieten:** Signalisierung gehört nicht zum WebRTC-Standard; Netzwerk-/Browserbedingungen können direkte Erreichbarkeit verhindern. Ohne passende Erprobung keine Zusage für beliebige Smartphones.
- **Öffentliche STUN-/TURN-/Signalisierungsdienste:** Widersprächen der Vorgabe ohne dritte Verbindungsdienste.
- **Passwort/Entschlüsselungsschlüssel im selben QR:** Würde den QR zur unmittelbar lesbaren vollständigen Kopie machen. Das Passwort wird getrennt eingegeben.
- **Nur UI-Schreibsperre ohne Signatur:** Würde einen Mitleser nicht kryptografisch an den bisherigen Master binden.
- **Serveroption sichtbar lassen:** Würde den ausdrücklich abgelösten Betriebsweg weiter als Produktfunktion anbieten.

## Folgen und Grenzen

Keine neue externe Bibliothek und kein neues Journalformat. Der manuelle Abgleich ist eine Kopie, kein laufender Sync. F17 bleibt für direkten automatischen Abgleich und physische Geräteerprobung offen. Browser-Speicher kann gelöscht werden; heruntergeladene Sicherungen bleiben erforderlich. Dateitransport über die Betriebssystemfunktion liegt beim Nutzer. Es wird keine bestimmte OS-Transportart als zwingend datenschutzfrei zugesagt.

## Verifikation

Am 18.11.2026 synthetisch:

- Zwölf neue Tests einschließlich großem Journal und Kontakt-Backup ohne Schwangerschaftsprofil für Signatur/Verschlüsselung, getrenntes Passwort, manipulierte Daten, Quellenbindung, Versionsschutz, fehlende/ältere Einträge, QR-Grenze, Dateirundlauf, Import, Quota-Abbruch und Neustartwiederherstellung. Gesamtprüfung: **145 von 145 Tests bestanden**, keine übersprungen; Build über `node scripts/build.js` erfolgreich (npm nicht im PATH; identische Test-/Build-Einstiegspunkte).
- Safari: Masterstand mit einem protokollierten Weheneintrag erzeugt; QR/Link sichtbar. Auf einer zweiten isolierten Herkunft ohne bestehenden Datenstand den Link mit getrenntem Passwort entschlüsselt, Vorschau geprüft und übernommen. Danach gleiche Datierung und Journalmessung sichtbar, Profil-/Journalbearbeitung gesperrt. Kontakte waren nicht automatisch enthalten. Die zweite Herkunft simuliert einen zweiten Speicher, kein physisches zweites Smartphone.
- Die letzten zusätzlichen Sperr-/Speicherfehlerbehandlungen und die Wiederherstellung eines reinen Kontakt-Backups wurden nach diesem Hauptablauf ergänzt; keine vollständige manuelle Wiederholung jeder Fehleroberfläche.

Offen: Kamera-Scan zwischen zwei echten Smartphones, plattformübergreifender Datei-Download/Import, komplette Backup-Wiederherstellung im Browser, echte OS-Anruf-/Teilenübergaben, umfassende Mehrtabprüfung und direkter automatischer Kanal. Die Fehlersicherheit der Modelloperationen wird automatisiert geprüft, nicht jeder Browserausfall simuliert.

## Quellen

Am 18.11.2026 gelesen:

- [WebRTC: Peer connections und Signalisierung](https://webrtc.org/getting-started/peer-connections) – Grundlage für die Abgrenzung zur garantierten Direktverbindung; die Produktwahl ist eine Agentenschlussfolgerung.
- [W3C Web Cryptography](https://www.w3.org/TR/webcrypto/), [WHATWG Compression](https://compression.spec.whatwg.org/), [W3C Web Locks](https://www.w3.org/TR/web-locks/) – API-Dokumentation; die W3C-Seiten sind als Entwürfe gekennzeichnet, keine Zertifizierung dieser App.
- [Implementierung und Tests](../../tests/device-transfer.test.js), [bestehende Datenvalidierung](../../src/sync.js), [bisherige Serverentscheidung](0008-master-sync-und-lokaler-betrieb.md).


**Erweiterung vom 18.11.2026:** Der Klartext-Vollbackup-Export wird durch [AgDR-0027](0027-verschluesselte-vollsicherung.md) als Standard abgelöst. Signierter Geräteinhalt v3 ergänzt Planung, Phase und Untersuchungswerte; siehe [AgDR-0026](0026-alltagsbegleitung-terminmappe-und-wochenbett.md). Frühere Formate bleiben lesbar; ältere Stände dürfen neue Bereiche nicht still entfernen.
