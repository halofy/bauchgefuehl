# AgDR-0009: Persönliches Journal und Messwerte

- **Status:** Umgesetzt, lokal geprüft
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzeranforderung; Detailentscheidungen durch den Agenten innerhalb des beauftragten Umfangs
- **Betroffene Dateien:** [Journalmodell](../../src/journal.js), [Oberfläche](../../src/journal-ui.js), [Speicherung](../../src/pregnancy.js), [App](../../src/app.js), [Sync](../../src/sync.js), [Serverprotokoll](../../sync-server/worker.js), [Tests](../../tests/journal.test.js)
- **Erweitert:** [AgDR-0003](0003-lokale-daten-und-teilen.md), [AgDR-0006](0006-waehlbare-berechnungsmethode.md), [AgDR-0008](0008-master-sync-und-lokaler-betrieb.md)

## Kontext und Herkunft

**Ergänzung vom 17.11.2026:** [AgDR-0014](0014-kalender-und-journal.md) führt eine gemeinsame Kalender-/Journalansicht ein. Die bestehende Journalliste, Speicherung und Datenvalidierung bleiben erhalten; die Hauptnavigation nennt den gemeinsamen Bereich jetzt „Kalender“.

Der Nutzer möchte eigene Informationen erfassen: Symptome, Text, Tags und relevante Maße wie Umfang und Gewicht. Die früheren Anforderungen an lokale Speicherung, einen schreibenden Master, automatischen Sync und Schutz vor Datenverlust gelten weiterhin.

**Agentenfestlegungen:** Diese Angaben bilden ein gemeinsames datiertes Journal. Suche, Zeit-/Tagfilter, Messwertverlauf, CSV-Export und wiederherstellbare Archivierung machen die erfassten Daten nutzbar. Eine freie Messgröße mit eigener Einheit ergänzt die vorgegebenen Maße. Diese Detailentscheidungen sind keine zusätzliche ausdrückliche Nutzerfreigabe.

## Entscheidung

- Ein Eintrag enthält eine stabile UUID, Datum, optionale Uhrzeit, Freitext, mehrere Symptome und Tags, mehrere numerische Messwerte sowie Erstellungs-, Änderungs- und gegebenenfalls Archivierungszeitpunkt. Symptome sind Vorschläge oder freie Bezeichnungen. Tags werden ohne führendes `#` und innerhalb eines Eintrags ohne Groß-/Kleinschreibungsduplikate gespeichert.
- Vorgegebene Messgrößen sind Gewicht in kg, Bauch-/Brust-/Hüftumfang in cm und Temperatur in °C. Eigene Größen besitzen Bezeichnung und optionale Einheit. Dezimalkomma und Punkt werden akzeptiert. Eigene Größen mit anderen Einheiten ergeben getrennte Messreihen; eine Umrechnung wird nicht angenommen.
- Bearbeiten erhält Kennung und ursprünglichen Erstellungszeitpunkt. Archivieren setzt einen Zeitpunkt, behält aber den gesamten Eintrag. Die Wiederherstellung entfernt diesen Zeitpunkt. Normale lokale Speicherung und Sync dürfen keine bekannten Eintragskennungen entfernen. Ein ausdrücklicher Import, eine Raumübernahme oder Wiederherstellung kann das Journal ersetzen, nachdem der vorherige Rohstand gesichert wurde.
- Die Liste zeigt neuere Einträge zuerst. Textsuche, Tag und Datumsgrenzen wirken gemeinsam auf Liste, CSV und Messwertverlauf. Archivierte Einträge sind optional lesbar und exportierbar; der Verlauf berücksichtigt aktive Einträge. Eine Tabelle ist als Alternative zum SVG-Verlauf verfügbar.
- Die SSW neben dem Datum wird aus der aktuellen Berechnungsgrundlage abgeleitet. Änderungen an dieser Grundlage verändern die Zuordnung, nicht die Journalangaben. Es gibt keine Normalbereiche, Warnschwellen oder medizinischen Schlussfolgerungen aus den Messungen.
- Nutzertexte werden mit `textContent` ausgegeben. CSV wird mit Anführungszeichen und UTF-8-BOM erzeugt; potenzielle Tabellenformeln in Textspalten werden als Text markiert. Ein fehlgeschlagener Journal-Speicherversuch lässt den Editor samt Entwurf geöffnet. Ein geänderter Entwurf fragt vor dem Schließen nach.

### Speicherung, Migration und Sync

Der lokale Datensatz ist jetzt **v3** mit `profile`, `checks` und `journal`. Die bisherigen v1-/v2-Daten ergeben ein leeres Journal; ältere Aufrufstellen ohne explizites Journal erhalten ein bestehendes Journal bei Profil- oder Häkchenänderungen. Ein zeitlich abgelaufenes Profil macht das Journal nicht unsichtbar: Es bleibt lesbar und als CSV exportierbar, während neue Basisdaten erforderlich sind.

Der gesamte Stand wird im bestehenden Master-/Mitleser-Modell verschlüsselt synchronisiert und in JSON-Backups aufgenommen. Der einfache Reise-Link enthält weiterhin ausschließlich die Berechnungsgrundlage. Geräte-Links gewähren auch auf neue Journaleinträge laufende Leserechte; dies wird im Journal und Geräte-Dialog benannt.

Neue verschlüsselte Umschläge verwenden **v2, schema 3** mit daran und an den Raum gebundenen AES-GCM-Zusatzdaten. Das bisherige verschlüsselte v1-Format bleibt lesbar. Nach dem Upgrade eines Raums verweigert der Server alte Schreibformate mit **426**, ohne den aktuellen Stand zu verändern. Zusätzlich prüft ein neuer Master vor dem Upload die Eintragskennungen gegen den entschlüsselten tatsächlichen Serverstand bei gleicher Basisrevision. Damit wird auch ein durch zwischenzeitliche alte App-Nutzung geleerter lokaler Cache erkannt; ein Konflikt hält den Versand an. CAS und idempotente Wiederholung bleiben erhalten.

Größere verschlüsselte Umschläge werden serverintern in Stücke von maximal 60.000 ASCII-Zeichen aufgeteilt und mit Metadaten in derselben Transaktion gespeichert. Alte inline gespeicherte Versionen bleiben lesbar. Nach 20 Revisionen werden alte Metadaten, Stücke und Mutationsbelege gemeinsam entfernt. Das funktioniert mit dem lokalen SQLite-Adapter und hält die Werte auch für den optionalen Durable-Object-Adapter klein; der neu erweiterte Ablauf wurde in dieser Änderung nicht erneut in `workerd` ausgeführt.

Grenzen: 1.000 Einträge, 4.000 Zeichen Notiz pro Eintrag, je 20 Symptome/Tags, 12 Messwerte und etwa 512 KiB pro vollständigem Datenstand. Die Größenbegrenzung wird vor dem Ersetzen geprüft, Daten werden nicht still gekürzt. Der lokale Rohverlauf ist auf 20 Stände und ungefähr 2 MiB begrenzt, damit Browserplatz für aktuellen Stand und Sync-Ausgang bleibt. Backup-Dateien bis 64 MiB können geladen werden. Der bestehende begrenzte Versionsverlauf ersetzt weiterhin keine extern aufbewahrte Sicherung.

## Erwogene Alternativen

- **Einzelne zusätzliche Profilfelder:** Ungeeignet für mehrere Beobachtungen und zeitliche Messreihen.
- **Reine Textnotizen:** Flexibel, aber Messgrößen und Einheiten wären nicht zuverlässig filter- und darstellbar.
- **Endgültiges Löschen im normalen Journalablauf:** Erschwert die gewünschte Wiederherstellbarkeit; deshalb Archivieren mit sichtbarer Wiederherstellung.
- **Mitschreiben an beiden Clients:** Würde die bestehende Masterentscheidung ändern und benötigt Konfliktzusammenführung. Mitleser bleiben schreibgeschützt.
- **Journal im einfachen Reise-QR:** Würde persönliche Angaben in leicht weitergebbaren Links offenlegen und deren Größe stark erhöhen. Das Journal nutzt den schon beauftragten verschlüsselten Geräte-Sync.

## Folgen und Grenzen

Keine neue npm-Abhängigkeit, kein Konto und keine Änderung der statischen GitHub-Pages-Auslieferung. Für den automatischen Sync müssen der lokale Dienst neu gestartet und beide Apps neu geladen werden; bestehender Datenordner und Schlüssel werden weiterverwendet.

Gespeicherte Daten überstehen typische Speicher-/Netzfehler und Sync-Neustarts. Nicht gespeicherte Entwürfe überstehen keinen Browserabsturz oder Reload. Browser-Speicher kann vor dem eigenen Größenlimit voll sein. Gelöschte Website-Daten oder verlorene Schlüssel bleiben Grenzen der lokalen Speicherung. CSV ist ein Export; vollständige Wiederherstellung erfolgt über JSON-Backup. Historische Rohstände bleiben zusätzlich im Backup erhalten und sind keine direkt auswählbare Journal-Versionsoberfläche.

## Verifikation

Am 17.11.2026 durchgeführt, ausschließlich mit synthetischen Daten:

- **69 automatisierte Tests bestanden**, darunter 13 Journaltests und fünf zusätzliche Sync-Tests. Geprüft sind Dezimalformate, freie Einheiten, Eingabegrenzen, Suchfilter, getrennte Messreihen, CSV-Escaping, Migration, Aufbewahrung bei Profiländerung/ablaufendem Profil, Speicherfehler, Archivierung/Wiederherstellung, Offline-Neustart, große verschlüsselte Journale, Altformat-/Downgrade-Schutz und die Bereinigung alter Ciphertextstücke.
- Lokaler HTTP-Dienst: 30 Journaleinträge hochgeladen, Revision 2 bestätigt; nach vollständigem Prozessneustart aus derselben SQLite-Datei über einen unabhängigen mitlesenden Client erneut entschlüsselt und vollständig verglichen, inklusive Merkhäkchen.
- Safari: neue Oberfläche und Dialog visuell geprüft; synthetisches Profil gespeichert, Symptom ausgewählt, Notiz und Tags sowie Gewicht mit Dezimalkomma und Bauchumfang eingegeben. Nach Speichern waren alle Angaben und die SSW-Zuordnung in der Journalansicht sichtbar.
- Statischer Build erfolgreich, neue Module über den lokalen Dienst mit HTTP 200 ausgeliefert.

Offen bleiben vollständige mobile Browsermatrix, manuelle Bedienung aller Filter-/CSV-/Archiv-/Backup-Abläufe und physischer Geräte-QR-Scan. Messwertreihen sind automatisiert geprüft; eine manuelle Mehrpunkt-Verlaufsprüfung ist noch offen. Es wurden keine echten Gesundheitsdaten verwendet und keine Daten veröffentlicht.

## Quellen

- [Bedienung und Betrieb](../../README.md), [lokaler Dienst](../../sync-server/README.md).
- [Journaltests](../../tests/journal.test.js), [Sync-Tests](../../tests/sync.test.js).
- Diese Änderung fügt keine medizinischen Aussagen oder externen Datenquellen hinzu. Die Auswahl der Standardmessgrößen ist eine Produktentscheidung, keine Empfehlung zu Untersuchungen oder Messhäufigkeiten.
