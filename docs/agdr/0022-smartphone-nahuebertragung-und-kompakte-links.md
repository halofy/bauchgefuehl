# AgDR-0022: Smartphone-Nahübertragung und kompakte Stand-Links

- **Status:** Linkformat und native Teilen-Anbindung umgesetzt; physische iOS-/Android-Erprobung und optionaler WebRTC-Kanal offen
- **Datum:** 2026-11-18
- **Entscheidende Instanz:** Nutzer fokussiert iOS ↔ Android, fragt nach UWB/Nahübertragung und erlaubt möglichst vollständige URL-/QR-Weitergabe; technische Auswahl durch den Agenten
- **Betroffene Dateien:** [Übertragung](../../src/device-transfer.js), [Geräteoberfläche](../../src/devices-ui.js), [HTML](../../index.html), [Styles](../../styles.css), [Tests](../../tests/device-transfer.test.js), [Feature-Liste](../open.md)
- **Ersetzt teilweise:** [AgDR-0020](0020-serverloser-geraeteabgleich.md), bisher gemeinsame 1.800-Zeichen-Grenze für QR und Links; alle Verschlüsselungs-, Master- und Importregeln bleiben erhalten

**Fortschreibung vom 24.11.2026:** [AgDR-0055](0055-einheitliches-selektives-teilen.md) löst die getrennten Teileinstiege, den neuen unverschlüsselten Reise-Export und die bisherige QR-Grenze teilweise ab. Neue Standardweitergabe ist eine selektive verschlüsselte Kopie in Body-Version 4. UI-Begriffe sind Hauptgerät / Mitlesegerät; interne Rollen und bestehende Formate bleiben kompatibel. Die folgenden Angaben dokumentieren die damalige Entscheidung.

## Kontext und Herkunft

Der Nutzer fragt ausdrücklich nach modernen Browser-Schnittstellen zum direkten Teilen zwischen nahen Smartphones, insbesondere UWB, und legt den Schwerpunkt auf iOS und Android zusammen. Alternativ soll möglichst viel in einer URL beziehungsweise einem QR-Code übertragen werden. Das ist keine Anforderung an eine native App oder eine Erlaubnis für externe Verbindungsdienste.

**Agentenschlussfolgerung aus den unten geprüften Primärquellen:** UWB ist für diese statische Webapp kein gemeinsamer Browser-Datenkanal. Apples Nearby Interaction liefert Entfernung/Richtung über native Frameworks; Android dokumentiert UWB über Jetpack und benötigt für Sitzungsparameter einen separaten Datenkanal. Web Bluetooth bietet in Chrome die Central-/GATT-Client-Rolle; WebKit führt Bluetooth und NFC unter nicht implementierten Hardware-APIs. Web NFC unterstützt zudem keinen Peer-to-Peer-Modus. Damit wird keine universelle iOS-/Android-Nahverbindung als erledigt ausgegeben.

## Entscheidung

### Kompakte vollständige Links, eigene QR-Grenze

Kompression findet weiterhin vor der Verschlüsselung statt. Die bisherige JSON-Hülle mit bereits Base64-kodiertem Ciphertext wird für URLs nicht noch einmal komplett Base64-kodiert. Das neue Transportfragment lautet `#transfer=2.g.SALT.IV.CIPHERTEXT` beziehungsweise `2.j` ohne Kompression. Salt, IV und Ciphertext sind Base64url. Das verschlüsselte Dateiformat bleibt Version 1. Bestehende JSON-/Base64-Links bleiben lesbar; Empfänger neuer kompakter Links müssen eine aktuelle App-Version verwenden.

QR und URL haben getrennte **Agentenlimits**: QR bis 2.200 Zeichen einschließlich App-Adresse mit der vorhandenen Fehlerkorrektur M; URL bis 65.536 Zeichen insgesamt. Das sind weder garantierte Kamera-Lesbarkeit noch universelle Browser-/Messenger-Limits. Lange Links werden mit Zeichenzahl und Hinweis auf mögliche Kürzung angezeigt, ohne einen einzelnen überfüllten QR anzubieten. Darüber wird die verschlüsselte Datei verwendet. Es werden keine Einträge gekürzt, still weggelassen oder durch externe Kurzlinks ersetzt. Passwort und privater Master-Schlüssel stehen weiterhin nicht im Link.

### Native Teilen-Auswahl

Nach dem Erstellen stehen bei vorhandener Web Share API „Link teilen“ und bei positivem `navigator.canShare({files})` auch „Datei teilen“ bereit. Die Datei ist vor dem Tap vorbereitet, damit der eigentliche API-Aufruf unmittelbar aus der Nutzeraktion erfolgt. Download und Kopieren bleiben verfügbar. Abbruch löst keinen anderen Versandweg aus. Erfolgreiche Rückkehr aus der Teilen-Auswahl wird nicht als Empfang oder erfolgreicher Import behauptet.

Die App erkennt keine nahen Geräte und bestimmt keine Empfänger. Welche Apps oder lokalen Transportziele erscheinen, entscheidet Browser/Betriebssystem. Ein gewähltes Nachrichten-/Cloudziel kann Dienste Dritter verwenden; die App verspricht für die allgemeine OS-Auswahl keinen rein lokalen Transport. Es gibt weiterhin keine automatischen Anfragen an Daten-, Signalisierungs-, STUN- oder TURN-Dienste.

### Direkter Kanal bleibt konkret evaluierbar

WebRTC DataChannel bleibt als optionaler Versuch für zwei gleichzeitig geöffnete Apps im selben WLAN oder passenden Hotspot in F17 offen. Angebot und Antwort könnten bewusst über zwei QR-/Link-Schritte statt eines Signalisierungsservers ausgetauscht werden. Ohne STUN/TURN hängt die Erreichbarkeit von Host-Kandidaten, Browserfreigaben und Netzisolation ab. Nähe allein stellt keine Verbindung her. Ein solcher Versuch ersetzt daher weder die Datei-/Linkweitergabe noch behauptet er automatische Hintergrundsynchronisation. In diesem Record wird kein WebRTC-Prototyp als umgesetzt markiert.

## Erwogene Alternativen

- UWB/Bluetooth/NFC als gemeinsame Webapp-Funktion: Die geprüften Plattform-APIs tragen diese Zusage nicht.
- Native App-Hülle: Würde Betrieb und Berechtigungen erweitern; nicht angefordert.
- URL ohne Größenlimit oder ein einzelner maximal dichter QR für jedes Journal: Keine zuverlässige Weitergabe; sichtbare Alternativen sind erforderlich.
- Automatischer Wechsel zu einem Cloud-/Nachrichtenziel: Empfänger und Transport bleiben bewusste Nutzerwahl.

## Folgen und Grenzen

Die statische App und Offline-Import bleiben erhalten. Größere mittelgroße Stände sind jetzt als Link verfügbar, auch wenn ein einzelner QR nicht reicht. Ein QR transportiert nur eine begrenzte Datenmenge; ein großes Journal wird durch Kompression nicht beliebig klein. Browserablage, Clipboard und bewusst ausgewählte OS-Teilen-Ziele können Kopien behalten. Quellen zur Technik sind hier dokumentiert; es wurden keine medizinischen Inhalte geändert.

## Verifikation

- **147 von 147 Tests bestanden**, keine übersprungen. Ausführung über `node --test tests/*.test.js`, identischer Einstieg zu `npm test`; npm nicht im PATH.
- Zwei zusätzliche Tests: altes und neues Linkformat, kürzere Kodierung, fehlerhafte/unbekannte Formate, getrennte QR-/Linkgrenze und exakte Gesamtlänge; vollständiger verschlüsselter Rundlauf eines Journaleintrags oberhalb der QR-Grenze. Bestehender großer Dateirundlauf und alle Import-/Datenerhaltstests ebenfalls bestanden.
- `node scripts/build.js` erfolgreich, entspricht `npm run build`; auslieferbare Dateien in `dist/`.
- Native Browserprüfung versucht: Safari lieferte kein zugängliches Fenster; Firefox meldete den Titel der isolierten lokalen Vorschau, stellte aber keinen verlässlich prüfbaren Seitenbaum beziehungsweise konsistenten Screenshot bereit. Daraus wird **keine bestandene manuelle Prüfung der neuen Teilen-Oberfläche** abgeleitet.
- Offen: echter iPhone-/Android-QR-Scan, lange URLs durch gewählte Teilen-Ziele, native Datei-/Linkweitergabe und Abbruch im OS-Dialog, Offline-Rundlauf zwischen physischen Smartphones. Ein direkter Funk-/WebRTC-Kanal wurde nicht implementiert oder getestet.

## Quellen

Am **18.11.2026** anhand der offiziellen Dokumentation geprüft:

- [Apple Nearby Interaction](https://developer.apple.com/documentation/nearbyinteraction) – native Entfernung-/Richtungsmessung.
- [Android UWB](https://developer.android.com/develop/connectivity/uwb) – Jetpack, Ranging und separater Austausch der Sitzungsparameter.
- [Chrome Web Bluetooth](https://developer.chrome.com/docs/capabilities/bluetooth) – Central-Rolle und Verbindung zu GATT-Servern.
- [WebKit Tracking Prevention](https://webkit.org/tracking-prevention/) – Hardware-APIs einschließlich Web Bluetooth und NFC, die WebKit nicht implementiert.
- [Chrome Web NFC](https://developer.chrome.com/docs/capabilities/nfc) – NDEF, kein Peer-to-Peer-Modus.
- [WebRTC Peer Connections](https://webrtc.org/getting-started/peer-connections) – Signalisierung außerhalb des Standards und ICE-Konfiguration; die konkrete mögliche QR-Ausgestaltung ist Agentenentwurf.
- [W3C Web Share](https://www.w3.org/TR/web-share/) – bewusste Nutzeraktion, Datei-/URL-Weitergabe und vom User Agent bestimmte Ziele.
