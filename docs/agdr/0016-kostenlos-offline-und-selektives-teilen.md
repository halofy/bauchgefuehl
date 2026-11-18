# AgDR-0016: Kostenlos, offline und mit ausgewählten Inhalten teilen

- **Status:** Umgesetzt; Modelle automatisiert und Oberfläche lokal in Safari geprüft, Prüflücken unten
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Ausdrückliche Nutzeranforderungen; konkrete Auswahl- und Exportregeln durch den Agenten
- **Betroffene Dateien:** [Berichtsmodell](../../src/report.js), [Berichtsoberfläche](../../src/report-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Styles](../../styles.css), [Offline-Liste](../../sw.js), [Tests](../../tests/report.test.js), [Feature-Liste](../open.md), [Projektkonventionen](../../AGENTS.md)
- **Ersetzt teilweise:** [AgDR-0003](0003-lokale-daten-und-teilen.md) beim Standardumfang neuer Reise-Links; [AgDR-0012](0012-roadmap-und-ssw-pruefung.md) bei Premium-Einordnung und offenem Bezahlmodell. Lokale Speicherung, bewusste Übernahme und SSW-Berechnung gelten weiter.
- **Erweitert:** [AgDR-0009](0009-persoenliches-journal.md), F07 um einen ersten Journalbericht

## Kontext und Herkunft

**Fortschreibung vom 18.11.2026:** [AgDR-0020](0020-serverloser-geraeteabgleich.md) löst die nachfolgend historischen Annahmen über aktive Sync-Räume/Server ab. Vollständige Geräte-Stände werden nun bewusst ohne Datenserver übertragen; der ausgewählte Journalauszug und der ET-only-Reise-Link bleiben erhalten. Kostenlosigkeit und lokale Verarbeitung gelten unverändert.

**Ausdrücklich vom Nutzer:** Weitere Ideen aus der Feature-Liste dürfen umgesetzt werden. Alles soll offline und „privacy first“ funktionieren, beim Teilen sollen gegebenenfalls Bereiche ausgelassen werden. Es wird kein Bezahl-Premium geben; alle Funktionen sind für alle frei. Quellen für Daten sind immer anzugeben.

**Agentenentscheidung zum Umfang:** Neben dem separat dokumentierten Offline-Wissenskatalog werden eine datensparsame Variante des vorhandenen Reise-Links und ein ausgewählter Journalauszug umgesetzt. F07 wird teilweise erfüllt; spätere Check-ins und Terminfragen werden nicht vorweggenommen. Die neue Produktgrundlage gilt auch für die übrigen offenen Features und wird in Projektkonventionen und Feature-Liste festgehalten.

## Entscheidung

### Keine Bezahlstufen, lokal nutzbare Funktionen

Alle Funktionen sind kostenlos zugänglich. Die bisherigen Premium-Kennzeichnungen werden aus der aktuellen Feature-Liste entfernt; die historischen Überlegungen in AgDR-0012 bleiben mit einem Ablösehinweis nachvollziehbar. Neue Suche und Berichte benötigen weder Konto noch Fremddienst. Es werden keine Suchhistorie und keine Teilen-Voreinstellungen gespeichert. Der optionale bestehende Geräte-Sync benötigt weiterhin eine Verbindung zum eigenen Dienst. Offline bleiben die zuletzt gespeicherten Daten nutzbar; externer Quellenabruf ist ausdrücklich gesondert gekennzeichnet.

### Reise-Link mit minimaler Berechnungsgrundlage

Jedes Öffnen von „Reise teilen“ beginnt mit **Nur ET und Zeitachse**. Dafür wird aus der bestehenden Berechnung der ET genommen und ausschließlich ein Profil der vorhandenen Methode `due-date` kodiert. Kein neuer Linktyp, keine Änderung der Formel oder lokalen Datierung. SSW und rechnerische Zeitachse stimmen überein; Periodenbeginn, Zykluslänge und Unregelmäßigkeit fehlen im Link. Die zeitliche Einordnung bleibt aus dem ET ableitbar, und zyklusbezogene Unsicherheitshinweise werden nicht mitgeteilt. Die Oberfläche erklärt dies; ein geschätzter ET wird nicht als bestätigte medizinische Datierung bezeichnet.

Die vollständige Berechnungsgrundlage lässt sich ausdrücklich wählen. Bei ungültigem Minimalprofil, etwa einem ET jenseits der bestehenden Validierungsgrenze vor 0+0, wird kein Link erzeugt und nicht still auf vollständig umgestellt. Alte Links behalten ihr damaliges Format und ihren Inhalt. Journal und Merkhäkchen bleiben in beiden Linkvarianten ausgeschlossen. Vorherige URL-Abfragen und Sync-Fragmente werden beim Linkaufbau entfernt. Unverschlüsselte Links sind weiterhin lesbar und nicht widerrufbar.

### Journalauszug mit echter Inhaltsprojektion

Der Auszug ist aus der Journalliste, dem Reise-Dialog und dem Geräte-Dialog erreichbar. Alle fünf Bereiche starten abgewählt: Notizen, Symptome, Tags, Messwerte und Uhrzeiten. Zunächst wird kein Journaleintrag freigegeben. Der Zeitraum beginnt standardmäßig 27 Kalendertage vor heute und endet heute; beide Grenzen sind einschließlich und änderbar. Passende Einträge können zusätzlich einzeln ausgeschlossen werden. Ein veränderter Zeitraum setzt diese Einzelausschlüsse zurück; die Vorschau wird entsprechend neu aufgebaut.

`projectReport()` erzeugt ein neues Objekt ausschließlich aus erlaubten Feldern. Archivierte Einträge und Einträge ohne ausgewählten Inhalt fehlen. Enthaltene Einträge haben immer ihr Datum; Uhrzeiten sind gesondert wählbar. Messwerte behalten Bezeichnung, Zahl und Einheit, keine internen Kennungen. Weder Profil/SSW/Merkhäkchen noch Eintrags-IDs, Erstellungs-/Änderungszeiten, Sicherungsverlauf, Sync-Verbindung oder Schlüssel gelangen in den Auszug. Nicht ausgewählte Inhalte werden tatsächlich entfernt, nicht per CSS versteckt.

Vorschau und Datei verwenden denselben Body-Renderer. Unmittelbar vor dem Download wird aus dem aktuellen Journal erneut projiziert. Ungültiger Zeitraum oder leere Auswahl deaktivieren den Download. Die Quelle wird als **persönliche Journaleinträge** bezeichnet; ein bewusst unvollständiger Auszug und die fehlende medizinische Bewertung werden benannt.

### Selbstständige Datei, kein Upload

Die HTML-Datei entsteht lokal über einen Blob-Download. Alle Nutzertexte werden HTML-escaped. Die Datei hat weder Scripts noch externe Ressourcen oder aktive Links. Eine eigene CSP blockiert Netzwerkressourcen, Scripts, Formulare und Basis-URL-Änderungen; Inline-CSS ist ausschließlich für die eingebettete Darstellung erlaubt. Es gibt kein verstecktes JSON des vollständigen Datenstands.

Die Datei funktioniert offline. Der Nutzer kann sie öffnen, drucken und je nach Browser im Druckdialog als PDF speichern. Ein direkter PDF-Generator und die späteren F02-/F05-Berichtsbereiche sind weiterhin offen. Deshalb bleibt F07 „In Arbeit“. Die Datei ist Klartext und kein wiederherstellbares Backup. Download ist keine automatische Übermittlung an andere Personen; die App sendet nichts.

### Vollständiger Geräte-Sync wird nicht als begrenztes Teilen dargestellt

Ein Geräte-Link enthält den Leseschlüssel des gesamten verschlüsselten Raums. Eine lokale Ansichtsauswahl kann den Zugriff auf ausgelassene Daten nicht verhindern. Der Geräte-Dialog erklärt daher den vollständigen Umfang einschließlich archivierter Journalangaben und verweist für begrenzte Weitergabe auf den Auszug. Ein begrenzter automatischer Sync würde gesonderte Projektionen, Räume/Schlüssel und Regeln für Versionshistorie und Widerruf benötigen. Diese Architektur wird hier nicht nebenbei eingeführt. Bestehende Übertragungen und Links werden nicht nachträglich zurückgerufen.

## Erwogene Alternativen

- **Nur Journalbereiche im verbundenen Mitleser ausblenden:** Würde keinen Datenschutz herstellen, solange derselbe Schlüssel den vollständigen Raum entschlüsselt.
- **Komplette Journaldaten in QR-/URL-Fragmente schreiben:** Würde Größe und unbeabsichtigte Offenlegung erhöhen und das vorhandene kleine Reise-Linkformat verändern.
- **Cloudbasierte Berichte oder Bezahl-PDF-Dienst:** Widersprächen den Anforderungen an Offline-Nutzung, Datensparsamkeit und kostenlosen Zugang.
- **Neue Journal-/Sync-Felder für Exportvoreinstellungen:** Nicht erforderlich; die bewusste Auswahl wird für jeden Auszug neu getroffen.

## Folgen und Grenzen

Keine neue Abhängigkeit, Datenmigration oder Änderung des gespeicherten v3-Journals und Sync-Formats. Bestehende Backups bleiben vollständig und werden nicht durch Teilberichte ersetzt. Bereits früher erzeugte Links oder Dateien behalten ihren Inhalt. Der Nutzer entscheidet selbst über die Weitergabe einer Klartextdatei. Weitere Datenbereiche müssen zukünftig ausdrücklich in die Projektions-Allowlist und ihre Prüfungen aufgenommen werden.

## Verifikation

Am 17.11.2026 ausschließlich mit synthetischen Angaben:

- Neun neue Modelltests für unveränderte ET-/SSW-Zeitachse, minimales Link-Payload ohne alte URL-/Sync-Daten, keinen stillen Rückfall auf vollständige Weitergabe, leere Auswahl, ungültige Felder/Zeiträume, inklusive Datumsgrenzen, einzelne Ausschlüsse, Ausschluss von Archiv/Metadaten, Messwerte einschließlich Null, HTML-Escaping und unveränderte Quelldaten bestanden.
- Safari: Standard-ET-Link und sein minimales Payload beobachtet. Auszug zunächst ohne Bereiche und mit deaktiviertem Download sichtbar. Nur Symptome ausgewählt: Vorschau enthält Datum und synthetisches Symptom, keine Notiz, Tags, Messwerte oder Uhrzeit. Einzeleintrag abgewählt: Vorschau wieder ohne Einträge.
- Safari lieferte für den Berichtsmodal zeitweise keinen Accessibility-Baum; die Auswahl und Vorschau wurden anhand von Screenshots und nativen Klicks geprüft. Dialoge werden beim Wechsel vom Teilen-/Geräte-Dialog geschlossen statt gestapelt. Eine zuverlässige Screenreader-Prüfung ist damit **nicht** erfolgt.

- Abschließend **122 Tests bestanden** und statische PWA erfolgreich gebaut. Da `npm` im PATH nicht verfügbar ist, wurden die identischen Skriptziele direkt mit der vorhandenen Node-Laufzeit ausgeführt: `node --test tests/*.test.js`, `node scripts/build.js`. Der bestehende PWA-Test prüft nun zusätzlich die Offline-Verfügbarkeit aller fünf Such-/Berichtsmodule am Pages-Unterpfad. HTML-Struktur, 243 eindeutige IDs, UI-Referenzen, Dokumentationslinks, AgDR-Nummern, Offline-Auslieferung und `git diff --check` erfolgreich geprüft. Keine QA-Fixtures im Build.

Nicht geprüft: physisches Smartphone, Download-/Druck-/PDF-Dialog Ende zu Ende in mehreren Browsern, Screenreader, erneut vollständiger Offline-Update- und Geräte-Sync-Durchlauf. Die Dateiinhalte selbst sind automatisiert geprüft; kein neuer Servermechanismus wird behauptet.

## Quellen

- [Ausdrückliche Produktgrundlage in der Feature-Liste](../open.md), [bestehende Profile und Linkvalidierung](../../src/pregnancy.js), [Projektions- und Sicherheitsprüfungen](../../tests/report.test.js).
- [Bestehendes Journal](0009-persoenliches-journal.md), [Master-Sync und Schlüsselumfang](0008-master-sync-und-lokaler-betrieb.md), [neue Implementierung](../../src/report.js).
- Persönliche Berichtsdaten stammen ausschließlich aus den vom Nutzer erfassten Journalangaben; die Erweiterung führt keine neuen medizinischen Aussagen oder Diagnosen ein.
