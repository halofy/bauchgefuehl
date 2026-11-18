# Lokaler Sync-Dienst

**Historischer Betriebsweg:** Seit der Entscheidung vom 18.11.2026 startet die App diese Serververbindung nicht mehr. Die aktuelle Nutzung auf Smartphones benötigt keinen eigenen Datenserver; siehe [serverlosen Geräteabgleich](../README.md#geräte-stände-ohne-server) und [AgDR-0020](../docs/agdr/0020-serverloser-geraeteabgleich.md). Die folgenden Hinweise bleiben zur Nachvollziehbarkeit und Sicherung bestehender `.local-sync/`-Altstände erhalten.

Die Webapp und der Sync-Dienst können gemeinsam lokal laufen. Es ist kein Cloudflare-Konto und keine Installation von npm-Paketen erforderlich. Voraussetzung ist Node.js ab **22.13** mit `node:sqlite`.

## Start auf diesem Rechner

Im Projektordner:

```sh
./start-local.command
```

Der Starter verwendet eine vorhandene Node-Installation oder auf diesem Mac die mit der ChatGPT-App ausgelieferte Node-Laufzeit. Alternativ mit regulär installiertem Node und npm:

```sh
npm run start:local
```

Die App ist dann unter **http://127.0.0.1:4173** erreichbar. Dieser Dienst liefert die gebaute App und `/rooms/…` gemeinsam aus. Der ursprüngliche Python-Webserver liefert lediglich die statische App; für den automatischen Sync ist der Node-Dienst nötig.

Auch **http://localhost:4173** wird akzeptiert. Wenn du die App bisher unter `localhost` verwendet hast, behalte diese Adresse bei: `localhost` und `127.0.0.1` erreichen denselben Server, haben im Browser aber getrennte lokale Speicher. Vorhandene Angaben werden nicht automatisch zwischen diesen Adressen verschoben oder gelöscht.

Den Server mit **Strg+C** beenden. Beim nächsten Start wird dieselbe Datenbank weiterverwendet. Es werden weder Beispielprofile angelegt noch vorhandene Räume zurückgesetzt.

## Master und Mitleser einrichten

1. App in Browser A öffnen und eigene Schwangerschaftsangaben speichern.
2. **Geräte & Backup → Dieses Gerät als Master einrichten** öffnen. Die lokale Dienstadresse ist vorausgefüllt.
3. Den Einrichtungsschlüssel aus **`.local-sync/admin-token`** in das gleichnamige Feld kopieren. Die Datei liegt im Projektordner; bei einem eigenen `--data`-Ordner nennt der Server den tatsächlichen Pfad. Der Schlüssel wird nicht in die Webseite eingebaut, nicht protokolliert und nicht im Geräte-Link geteilt.
4. **Verschlüsselten Sync als Master einrichten** wählen. Anschließend eine **Master-Sicherung herunterladen** und sicher aufbewahren.
5. Den Geräte-Link in **Browser B oder einem privaten Browserfenster** öffnen und **Masterstand übernehmen & verbinden** wählen. Zwei normale Tabs desselben Browserprofils teilen bereits denselben Speicher und sind keine unabhängigen Geräte.

Der Master ist die einzige Schreibstelle. Das andere Gerät empfängt **Berechnungsmethode, Basisdaten, Journal und Merkhäkchen** automatisch. Dazu gehören auch neue Notizen, Symptome, Tags und Messwerte. Bei sichtbarer App wird etwa alle fünf Sekunden geprüft; beim Wiederöffnen oder Wiederverbinden wird erneut geprüft. Im Hintergrund kann der Browser verzögern. Bei geschlossener App findet kein Hintergrund-Sync statt.

Auf einem Browserprofil begrenzt eine Web-Locks-Sperre den Master auf einen aktiven Tab. Ein zweiter Master-Tab sperrt seine Bearbeitung. Wenn ein gesichertes Masterprofil auf einem zweiten Gerät geöffnet wird, schützt zusätzlich die Versionsprüfung am Server vor konkurrierendem Überschreiben. Verwende trotzdem nur einen Master.

## Dauerhafter Speicher und Sicherungen

Standardordner **`.local-sync/`**:

- `sync.sqlite`, gegebenenfalls `sync.sqlite-wal` und `sync.sqlite-shm`: verschlüsselte Räume und die letzten 20 Serverstände.
- `admin-token`: privater Einrichtungsschlüssel zum Anlegen neuer Räume.
- `backups/`: mit `--backup` erzeugte konsistente Datenbankkopien.

Der Ordner ist von Git ausgeschlossen und liegt außerhalb des öffentlich ausgelieferten `dist/`. Nicht löschen oder durch ein leeres Verzeichnis ersetzen. Für einen anderen Speicherort:

```sh
./start-local.command --data /absoluter/pfad/zum/sync-speicher
```

Ein neues `--data`-Verzeichnis ist ein neuer, leerer Dienst; es ist keine Migration. Für einen Umzug den bestehenden Datenordner bei gestopptem Server vollständig übernehmen.

Konsistente Datenbankkopie bei laufendem oder gestopptem Server anlegen:

```sh
node sync-server/local.js --backup
```

Bei einem eigenen Datenordner denselben `--data`-Pfad ergänzen. `VACUUM INTO` erstellt die SQLite-Kopie konsistent; bloßes Kopieren einer laufenden WAL-Datenbank ist kein Ersatz. Die Datenbankkopie enthält keine Entschlüsselungsschlüssel aus dem Browser: Dafür ist zusätzlich das **Master-Backup aus der App** erforderlich.

Die App hält außerdem bis zu 20 frühere lokale Datenstände inklusive Journal vor, insgesamt ungefähr 2 MiB, bevor sie einen bestehenden Stand ersetzt. Wenn diese Sicherung nicht geschrieben werden kann, wird der vorherige lokale Stand nicht überschrieben. Offline-Änderungen liegen im dauerhaften lokalen Ausgang und werden nach erfolgreicher Bestätigung entfernt. Bei verlorener Serverantwort ist die Wiederholung idempotent.

**Bei einem Versionskonflikt:** Der Sync hält an. Erst ein aktuelles Master-Backup herunterladen. Danach kann unter **Nach Backup: Serverstand ausdrücklich übernehmen** der Serverstand gewählt werden. Der vorherige lokale Profilstand wird zusätzlich archiviert. Es gibt keine automatische Zusammenführung und keine automatische Bevorzugung einer veralteten Masterkopie.

Ein Backup enthält lokale Daten, lokale Altstände, Master- beziehungsweise Leseschlüssel und gegebenenfalls noch nicht bestätigte Änderungen. Wenn erreichbar, enthält ein Master-Backup auch den verschlüsselten Serververlauf. Der Download meldet ausdrücklich, wenn dieser Teil fehlt. Die Datei ist nicht passwortverschlüsselt. Ein Download kann nicht überprüfen, ob die Datei tatsächlich dauerhaft aufbewahrt wurde.

Eine Backup-Datei kann in **Geräte & Backup → Backup-Datei auswählen** ausdrücklich wiederhergestellt werden. Die aktuelle Aufnahme wird geladen; frühere Rohstände und der Serververlauf bleiben zusätzlich in der Datei nachvollziehbar. Eine ältere Master-Sicherung überschreibt keinen neueren Serverstand automatisch. Gegebenenfalls nach einem aktuellen Backup den Serverstand ausdrücklich übernehmen.

Browser-Speicher, Versionierung und eine lokale SQLite-Datei sind Schutzmaßnahmen, keine absolute Garantie gegen Geräteausfall, gelöschte Browserdaten oder verlorene Schlüssel. Sichere den Datenordner und Master-Backups zusätzlich auf einem anderen Datenträger. Ohne Entschlüsselungsschlüssel kann der Server keine lesbaren Daten rekonstruieren.

## Journal-Version aktualisieren

Vor dem Aktualisieren eine Master-Sicherung herunterladen. Den lokalen Dienst beenden und im Projektordner erneut `./start-local.command` ausführen; dabei denselben Datenordner behalten. Beide Clients neu laden. Bestehende lokale Profile und verschlüsselte Räume bleiben lesbar und erhalten bei der nächsten Änderung das neue Journalformat. Das Journal wird gemeinsam mit den übrigen Daten verschlüsselt und in Backups aufgenommen.

Nach der Formataktualisierung lehnt der Dienst ältere Schreibformate ab, damit eine alte App keine Journaleinträge verdrängt. Bei einem Format- oder Datenkonflikt ein Backup herunterladen und alle Clients aktualisieren; keine Browserdaten oder Serverdateien löschen. Die bewusste Übernahme des Serverstands ist nach einem aktuellen Backup weiterhin möglich.

Der aktuelle Stand ist auf etwa 512 KiB und 1.000 Einträge begrenzt. Größere Änderungen werden mit Hinweis abgelehnt, vorhandene Einträge nicht gekürzt. Verschlüsselte Daten werden intern transaktional in Stücke aufgeteilt; diese liegen wie bisher in derselben SQLite-Datei. Historische Versionen im alten Speicherformat bleiben lesbar. Details: [AgDR-0009](../docs/agdr/0009-persoenliches-journal.md).

## Zwei Geräte im WLAN

`127.0.0.1` und `localhost` bezeichnen immer das jeweilige Gerät. Für ein Smartphone muss die App über eine im WLAN erreichbare **HTTPS-Adresse mit auf beiden Geräten vertrauenswürdigem Zertifikat** laufen. Web Crypto und Web Locks brauchen einen sicheren Browserkontext; HTTP ist hier nur für die Loopback-Entwicklung zugelassen.

Ein Beispiel mit bereits vorhandenen Zertifikatsdateien und einer erreichbaren lokalen Adresse:

```sh
./start-local.command \
  --host 0.0.0.0 \
  --port 8443 \
  --origin https://mein-rechner.local:8443 \
  --cert /pfad/zum/zertifikat.pem \
  --key /pfad/zum/privaten-schluessel.pem
```

`mein-rechner.local` muss zum Server auflösen und vom Zertifikat abgedeckt sein. Zertifikat und privater TLS-Schlüssel werden vom Nutzer bereitgestellt; der Starter installiert keine Zertifikate und ändert keine Browser-Sicherheitseinstellungen.

Auf beiden Geräten dieselbe HTTPS-App-Adresse öffnen und anschließend den **Geräte-QR-Code des Masters** scannen. Dafür verwendet die App die normale Kamera-App des zweiten Geräts, keine zusätzliche Kameraberechtigung in der Webapp. Physisches Scannen und die individuelle WLAN-/Zertifikatseinrichtung wurden hier nicht geprüft.

Für den lokalen Betrieb die App vom lokalen Dienst öffnen. Eine öffentliche GitHub-Pages-Seite direkt mit einem HTTP-Dienst im privaten Netz zu verbinden, ist aufgrund von Browserregeln für gemischte Inhalte beziehungsweise lokalen Netzwerkzugriff kein unterstützter Standardweg.

## Rechte und Datenschutz

Der Geräte-Link enthält die Dienstadresse, Raumkennung, Leseberechtigung und einen AES-GCM-Entschlüsselungsschlüssel. Er enthält **keinen Schreibschlüssel**. Alle mit dem Link können den Raum laufend lesen und den Link weitergeben. **Lokal trennen widerruft bestehende Geräte-Links nicht.** Eine automatische Übernahme fremder Räume oder ein automatisches Zusammenführen vorhandener Profile findet nicht statt.

Der Dienst speichert verschlüsselte Stände, Berechtigungs-Hashes, Versionsnummern und Zeitpunkte. Der Einrichtungsschlüssel kann neue Räume anlegen, aber keine bestehenden Räume entschlüsseln. Authentifizierung läuft über getrennte Master- und Lesetoken. Der lokale Server prüft zusätzlich Host und Origin und veröffentlicht keine Dateien aus dem Datenverzeichnis.

Der einfache **Reise teilen**-QR-Code bleibt eine getrennte Funktion: Er überträgt nur eine Kopie der Berechnungsgrundlage und bewirkt keinen automatischen Sync.

## Optionaler Cloudflare-Betrieb

`worker.js` implementiert dasselbe Protokoll als Durable Object, `wrangler.jsonc` enthält die alternative Bereitstellung. Das ist für den lokal gewünschten Betrieb nicht nötig und wurde nicht veröffentlicht.

Falls später gewünscht: `ALLOWED_ORIGINS` prüfen (aktuell `https://halofy.github.io`), mit `npx wrangler@4 deploy` bereitstellen und mit `npx wrangler@4 secret put ADMIN_TOKEN` einen eigenen zufälligen Einrichtungsschlüssel setzen. Keine Secrets in die statische App, das Repository oder `wrangler.jsonc` schreiben. Den ausgegebenen HTTPS-Endpunkt anschließend im Master-Dialog eintragen. Ein Cloudflare-Konto sowie dessen aktuelle Tarif- und Nutzungsvoraussetzungen sind erforderlich.

## Prüfnachweise

- 69 Tests: Berechnung, Journal, Messreihen, Migration, QR-Ausgabe, Verschlüsselung, Lese-/Schreibrechte, Ausgang bei Offlinebetrieb, verlorene Antworten, Versions-/Formatkonflikte, Sicherungsfehler, parallele Änderungen und SQLite-Neustart/Rollback.
- Journal-Erweiterung: 30 synthetische Einträge über den lokalen HTTP-Dienst übertragen und nach Prozessneustart vollständig aus SQLite geladen und entschlüsselt, einschließlich Merkhäkchen.
- Lokaler Node-HTTP-Dienst mit zwei synthetischen Clients geprüft; nach Prozessneustart blieb Version 2 inklusive Profil und Merkhäkchen erhalten.
- Derselbe HTTP-/Kryptografieablauf wurde auch in der lokalen Cloudflare-`workerd`-Laufzeit mit SQLite geprüft; Wrangler 4.163.0 hat einen Deployment-Dry-run erfolgreich abgeschlossen.
- Der Kopplungsdialog wurde in Safari geladen und visuell geprüft. Die vollständige Kopplung per Browserklick, Master-Tabsperre und physischer QR-Scan bleiben manuelle Prüfpunkte.

Details und Entscheidungen: [AgDR-0008](../docs/agdr/0008-master-sync-und-lokaler-betrieb.md).
