# AgDR-0008: Master-Synchronisierung per QR-Code und lokaler Betrieb

- **Status:** Ursprünglich umgesetzt und lokal geprüft; aktiver Verbindungsweg abgelöst durch AgDR-0020
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Master, Schutz vor Datenverlust und automatischer Sync ausdrücklich vom Nutzer gewünscht; anschließend lokaler Betrieb ausdrücklich bevorzugt
- **Betroffene Dateien:** [Sync-Engine](../../src/sync.js), historische Geräteoberfläche `src/sync-ui.js` (entfernt durch [AgDR-0040](0040-bereinigung-ungenutzter-dateien.md)), [Protokoll/Worker](../../sync-server/worker.js), [lokaler Server](../../sync-server/local.js), [SQLite-Adapter](../../sync-server/sqlite-storage.js), [QR-Ausgabe](../../src/qr.js), [Starter](../../start-local.command), [Tests](../../tests/sync.test.js)
- **Erweitert beziehungsweise ersetzt teilweise:** [AgDR-0001](0001-statische-webapp.md), [AgDR-0003](0003-lokale-daten-und-teilen.md), [AgDR-0006](0006-waehlbare-berechnungsmethode.md)

## Kontext und Herkunft

**Abgelöst am 18.11.2026:** Der Nutzer verlangt Geräteabgleich ohne eigenen Datenserver und ohne fremde Verbindungsdienste. [AgDR-0020](0020-serverloser-geraeteabgleich.md) ersetzt die aktive Serverkopplung durch bewusste signierte und verschlüsselte Geräte-Stände. Die alte Oberfläche wird nicht mehr gestartet; gespeicherte Altstände, Schlüssel und Serverdateien werden erhalten. Dieser Record beschreibt den historischen Aufbau, keine aktuelle Betriebsvoraussetzung.

**Ergänzung vom 17.11.2026:** [AgDR-0009](0009-persoenliches-journal.md) erweitert Datenstand, Sicherungen und Sync um das persönliche Journal und beschreibt den Formatschutz sowie die zusätzlichen Größenbegrenzungen. Die folgenden Prüfnachweise dokumentieren den ursprünglichen Stand dieser Entscheidung.

Der Nutzer möchte zwei Clients verbinden, beispielsweise über einen QR-Code. Auf Rückfrage wurde präzisiert: Es muss einen **Master** geben, Daten sollen nicht verloren gehen, automatische Synchronisierung ist gewünscht. Bei der Frage nach einem Cloud-Anbieter wurde **„gerne lokal“** geantwortet.

Die ursprüngliche reine Kopie im Teilen-Link erfüllt keine laufende Synchronisierung. GitHub Pages bleibt als statischer Auslieferungsweg bestehen. Laufender Datenaustausch benötigt einen zusätzlichen Dienst; dieser wird jetzt lokal mit dauerhafter SQLite-Datei angeboten.

**Agentenfestlegung:** Der Master ist die einzige Schreibstelle, das zweite Gerät liest mit. Beidseitige Bearbeitung oder automatische Zusammenführung wurden nicht ausdrücklich gewünscht und sind nicht implementiert. Der lokale Betrieb kann auf einem Rechner mit zwei getrennten Browserprofilen erfolgen; für zwei physische Geräte wird eine erreichbare lokale HTTPS-Adresse benötigt.

## Entscheidung

### Master und Mitleser

Ein Masterraum hat getrennte zufällige Schreib- und Lesetoken. Nur der Master darf einen neuen Datenstand schreiben. Ein Geräte-QR-Code enthält ausschließlich Raumkennung, Dienstadresse, Lesetoken und Entschlüsselungsschlüssel. Er enthält keinen Master-Schreibschlüssel und verleiht keine Masterrolle.

Der Empfänger sieht vor einer Anfrage den Dienst und bestätigt die Übernahme ausdrücklich. Vorhandene lokale Daten werden vor dem Ersetzen archiviert. Berechnungsmethode, Basisdaten und Merkhäkchen werden gemeinsam synchronisiert. Es gibt keine automatische Zusammenführung mit einem anderen Profil.

Ein mitlesendes Gerät prüft bei sichtbarer App ungefähr alle fünf Sekunden, außerdem nach Wiederverbindung oder Sichtbarwerden. Im Hintergrund können Browser verzögern; bei geschlossener App läuft kein Sync. Dieselbe Browseradresse und Origin werden beibehalten. Zwei normale Tabs eines Profils teilen denselben Speicher und sind keine unabhängigen Clients.

Die Web Locks API begrenzt den Master auf einen aktiven Tab desselben Browserprofils. Ohne diese Browserfunktion bleibt die Masterbearbeitung gesperrt. Eine Kopie der Masterrechte auf einem zweiten Rechner wird zusätzlich durch die serverseitige Versionsprüfung abgesichert; ein absichtliches Verwalten mehrerer Master ist nicht vorgesehen.

### Schutz vor versehentlichem Überschreiben

- Der lokale Profilstand wird erst ersetzt, nachdem der vorherige Stand im Sicherungsverlauf abgelegt wurde. Scheitert das Archivieren, bleibt die vorherige lokale Aufnahme erhalten.
- Der Master hat einen dauerhaften lokalen Ausgang mit Mutationskennung, Basisrevision und verschlüsselter Anfrage. Offlinefehler behalten die Änderung; ein Neustart kann sie erneut senden.
- Ein Server-Commit erfolgt in einer Transaktion nur bei passender Basisrevision. Veraltete Masterstände erhalten **409 Conflict**, ohne den aktuellen Serverstand zu ersetzen.
- Wiederholungen derselben Mutationskennung werden idempotent bestätigt, wenn eine Anfrage erfolgreich war und nur ihre Antwort verloren ging.
- Eine neue Änderung während eines Uploads bleibt separat ausstehend und wird nach der vorigen Bestätigung übertragen.
- Ein Versionskonflikt hält den automatischen Versand an. Nach einem aktuellen Backup kann der Nutzer den Serverstand ausdrücklich übernehmen; der vorherige lokale Profilstand wird archiviert.
- Lokales Trennen mit nicht bestätigten Änderungen wird im normalen Ablauf blockiert. Nach einem aktuellen Backup-Download ist ein bewusstes Trennen möglich. Der Download bestätigt nicht, dass die Datei dauerhaft aufbewahrt wurde.

Client und Server behalten jeweils bis zu **20 frühere beziehungsweise aktuelle Stände**. Das ist ein begrenzter Wiederherstellungsverlauf, keine unbegrenzte Historie. Der Ausgang und die Master-Schlüssel werden schon vor der ersten Netzmutation lokal gespeichert. Fehlt diese Speicherung, wird kein Raum angelegt. Ein Absturz zwischen Profilspeicherung und dem Einreihen in den Ausgang wird beim nächsten Masterstart über den zuletzt bestätigten Stand erkannt.

### Lokaler Dienst und Verschlüsselung

`start-local.command` baut die statische App und startet einen Node-Server auf `127.0.0.1:4173`. Er verwendet eine reguläre Node-Laufzeit ab 22.13 oder auf diesem Mac die mit der ChatGPT-App ausgelieferte Laufzeit. Es gibt keinen npm-Installationsschritt. `npm run start:local` ist die Alternative bei regulärem Node/npm.

Der Dienst liefert App und `/rooms/…` unter derselben Origin aus. Er speichert in **`.local-sync/sync.sqlite`** mit WAL und `synchronous=FULL`. Raumänderungen laufen atomar mit `BEGIN IMMEDIATE` und Rollback bei Fehlern. Der Datenordner liegt außerhalb von `dist/`, ist von Git ausgeschlossen und wird beim Neustart wiederverwendet. Host und Origin werden geprüft; der Einrichtungsschlüssel wird nur als private Datei im Datenordner angelegt und nicht in HTML oder Protokolle eingebaut.

Die Endgeräte verschlüsseln Datenstände mit **AES-256-GCM**, frischem 96-Bit-IV und an den Raum gebundenen authentifizierten Zusatzdaten. Der Server hält ausschließlich Ciphertexte, Token-Hashes, Versionen und Zeitpunkte. Die Entschlüsselungsschlüssel bleiben im Browser beziehungsweise im expliziten Geräte-Link oder Backup.

Die zunächst vorbereitete Cloudflare-Variante bleibt als optionaler Adapter desselben Protokolls vorhanden. Sie wurde lokal in `workerd` und per Dry-run geprüft, aber **nicht veröffentlicht**. Für den abschließend gewünschten lokalen Betrieb wird weder Cloudflare noch ein Cloud-Konto benötigt.

### Backups und Grenzen

Ein App-Backup enthält den aktuellen lokalen Datenstand, lokale Roharchive, Verbindungsrechte und ausstehende Änderungen. Wenn erreichbar, wird bei einem Master zusätzlich der verschlüsselte Serververlauf aufgenommen. Ein fehlgeschlagener Abruf wird ausdrücklich angegeben. Das Backup ist eine JSON-Datei ohne Passwortverschlüsselung und enthält beim Master geheime Schreib- und Entschlüsselungsschlüssel.

Die Wiederherstellung eines Backups ist ausdrücklich zu bestätigen und setzt eine zuvor getrennte Geräteverbindung voraus. Eine alte Master-Sicherung überschreibt einen neueren Serverstand nicht automatisch. Historische Rohaufnahmen und verschlüsselte Serverstände bleiben außerdem in der Backup-Datei erhalten; die direkte Dateiwiederherstellung lädt deren aktuelle Aufnahme.

Zusätzlich kann der lokale Dienst mit `--backup` eine konsistente SQLite-Kopie über `VACUUM INTO` erzeugen. Eine Datenbankkopie ersetzt das Master-Backup nicht: Die Browser-Schlüssel sind nicht Teil der Serverdatenbank.

Das Nutzerziel „Daten dürfen nicht verloren gehen“ wird als Anforderung an Fehlerbehandlung und Wiederherstellbarkeit umgesetzt, **nicht als technisch uneingeschränkte Garantie**. Gelöschte Browserdaten, verlorene Schlüssel, Defekte des einzigen Datenträgers oder nicht aufbewahrte Backups können weiterhin zum Verlust führen. Bereits verteilte Geräte-Links bleiben nach lokalem Trennen gültig; eine granulare Geräteverwaltung oder individuelle Link-Sperrung ist nicht Teil dieser Umsetzung.

## Erwogene Alternativen

- **Nur einen QR-Code mit dem bisherigen Teilen-Link anzeigen:** Bleibt zusätzlich verfügbar, überträgt jedoch nur einen einzelnen Stand ohne laufenden Abgleich.
- **Gleichberechtigte Clients mit Last-write-wins:** Widerspricht dem gewünschten Master und kann unbemerkt Daten verdrängen.
- **WebRTC ohne dauerhaften Dienst:** Bräuchte Signalisierung und beide Geräte gleichzeitig online; ist kein beständiger Wiederherstellungsspeicher.
- **Ausschließlich Cloudflare Durable Objects:** Technisch vorbereitet, nach der Nutzerpräferenz für lokalen Betrieb nicht erforderlich.
- **Öffentlicher QR-Bilddienst:** Würde Daten oder Zugriffsschlüssel unnötig übertragen. QR-Erzeugung läuft vollständig lokal mit einer beigefügten Bibliothek.
- **HTTP im WLAN oder herabgesetzte Browsersicherheit:** Wird nicht verwendet. Loopback-HTTP dient dem lokalen Test; mehrere Geräte benötigen HTTPS mit vertrauenswürdigem Zertifikat.

## Verifikation

Am 17.11.2026 durchgeführt:

- **51 automatisierte Tests bestanden.** Neu abgedeckt sind Verschlüsselung und Manipulationsprüfung, minimale Leserechte im Geräte-Link, serverseitige Schreibsperre, Offline-Neustart, verlorene Antworten, unbestätigte Raumerstellung, konkurrierende Master, Absturzfenster, Änderungen während eines Uploads, fehlgeschlagene Sicherung, fehlender Lesecache und SQLite-Neustart/Rollback.
- Lokaler Node-HTTP-Dienst mit zwei synthetischen Clients: Raum erstellen, entschlüsselte Daten beim Mitleser empfangen, Methode und Merkhäkchen ändern, Stand 2 übertragen. Nach vollständigem Prozessneustart wurde derselbe Stand aus derselben SQLite-Datei erneut gelesen.
- Der ausführbare lokale Starter wurde mit der in dieser Umgebung vorhandenen Node-Laufzeit erfolgreich gestartet. Eine konsistente SQLite-Sicherung per `--backup` wurde erfolgreich angelegt.
- Dieselbe Übertragung und der Versionsverlauf wurden in der lokalen Cloudflare-`workerd`-Laufzeit mit echtem SQLite-Speicher erfolgreich geprüft. Wrangler **4.163.0** hat den Deployment-Dry-run erfolgreich abgeschlossen.
- JavaScript-Syntax und statischer Build geprüft. Der Geräte-Kopplungsdialog wurde in Safari geladen und visuell geprüft. Die native Browsersteuerung konnte die anschließende Schaltflächenaktion nicht zuverlässig ausführen; es wird deshalb keine vollständig manuell geprüfte Browserkopplung behauptet.

Offen bleiben physisches QR-Scannen, die konkrete WLAN-/Zertifikatskonfiguration und eine vollständige Browsermatrix einschließlich manueller Backup-Dateiwiederherstellung und Master-Tabsperre. Es wurde kein öffentlicher Sync-Dienst bereitgestellt und kein vorhandenes Gesundheitsprofil zu einem externen Anbieter übertragen.

## Bibliothek und Quellen

- [Nayuki QR Code Generator](https://www.nayuki.io/page/qr-code-generator-library), offizielles Release **v1.8.0 ES6**, MIT-Lizenz im ausgelieferten Quelltext. Unveränderte Bibliothek plus ESM-Export. SHA-256 der ursprünglichen Release-Datei: `6a1116192ed1dd67fa1bf31e77f5817103d71c23bbac24c382e698b7668bdd01`.
- [Node.js: SQLite](https://nodejs.org/docs/latest-v22.x/api/sqlite.html).
- [MDN: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [AES-GCM / encrypt](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt).
- [MDN: Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).
- [Cloudflare: Durable Object Storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).
- [Betriebsanleitung](../../sync-server/README.md).
