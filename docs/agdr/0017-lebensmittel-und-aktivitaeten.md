# AgDR-0017: Quellenbasierte Offline-Suche zu Lebensmitteln und Aktivitäten

- **Status:** Redaktionelle Auswahl umgesetzt; Modelle automatisiert und Oberfläche lokal in Safari geprüft. Keine individuelle medizinische Prüfung.
- **Datum:** 2026-11-17
- **Entscheidende Instanz:** Nutzeranforderung; Katalogumfang, Darstellung und Filter durch den Agenten
- **Betroffene Dateien:** [Katalog und Quellen](../../src/guide-data.js), [Suchmodell](../../src/guide.js), [Oberfläche](../../src/guide-ui.js), [Kalender](../../src/calendar-ui.js), [App](../../src/app.js), [HTML](../../index.html), [Styles](../../styles.css), [Offline-Liste](../../sw.js), [Tests](../../tests/guide.test.js)
- **Erweitert:** [AgDR-0004](0004-medizinische-inhalte.md), [AgDR-0014](0014-kalender-und-journal.md), F13 der [Feature-Liste](../open.md)
- **Produktgrundlage:** [AgDR-0016](0016-kostenlos-offline-und-selektives-teilen.md)

## Kontext und Herkunft

**Fortschreibung vom 17.11.2026:** Der Nutzer wünscht zusätzlich NDR „Tatsächlich schwanger“ als Quelle. [AgDR-0018](0018-ndr-als-ergaenzende-quelle.md) dokumentiert den geprüften Ernährungsbeitrag und seine ergänzende Zuordnung zu sechs vorhandenen Karten. Die ursprünglichen Detailregeln und Ampelstufen dieses Records bleiben unverändert.

**Ausdrücklich vom Nutzer:** Suchmöglichkeit nach Lebensmitteln mit Ampel, außerdem Aktivitäten wie Sport und Sauna, gegebenenfalls im Zusammenhang mit dem Kalender. Nicht alles sei immer verboten. Offline-Nutzung, Datenschutz und Quellenangaben sind Anforderungen.

**Agentenentscheidung:** Ein redaktionell begrenzter, lokal ausgelieferter Katalog bildet konkrete Bedingungen und Zubereitungsvarianten ab. Keine Live-Websuche, Fremd-API oder automatische Bewertung unbekannter Produkte. Die Darstellung vermeidet absolute Aussagen allein aufgrund eines Suchbegriffs oder Datums.

## Entscheidung

### Drei textlich erklärte Ampelstufen

- **Grün: OK unter Bedingungen.** Gilt ausschließlich für die beschriebene Zubereitung und die genannten Voraussetzungen.
- **Gelb: Anpassen / abklären.** Zum Beispiel Menge begrenzen, Vorerfahrung berücksichtigen, Bedingungen prüfen oder Rücksprache halten.
- **Rot: Vermeiden.** Die Quelle rät für die beschriebene Form vom Konsum beziehungsweise der Aktivität in der Schwangerschaft ab.

Diese Bezeichnungen sind eine Agentenentscheidung zur verständlichen Wiedergabe der Quellen, kein von den Quellen übernommenes Ampelsystem. Ein pauschales „auf keinen Fall“ für sämtliche Varianten würde etwa gegarte Lebensmittel oder angepasste Bewegung falsch einordnen. Farbe, Symbol und Text werden gemeinsam verwendet. Gegenanzeigen und individuelle Betreuung gehen vor; die Ampel bestätigt keine persönliche gesundheitliche Eignung.

### Katalog und Varianten

Die erste Auswahl enthält **26 Einträge** für Lebensmittel/Getränke sowie Sport/Entspannung. Namen, Suchsynonyme, Varianten, Bedingungen und Quellen stehen als nachvollziehbare Daten in `guide-data.js`. Jede Karte enthält mindestens einen direkten Quellenlink und das gemeinsame redaktionelle Prüfdatum **17.11.2026**. Es werden eigene kurze Zusammenfassungen geliefert, keine kopierten Quellenartikel oder fremden App-Inhalte.

Bei Lebensmitteln mit Zubereitungs- oder Sortenabhängigkeit ist zunächst keine Variante gewählt. Die Einstufung bleibt gelb mit der Aufforderung zur Auswahl; unbekannte Varianten werden nicht grün. Ein Variantenwechsel aktualisiert Text und Ampel unmittelbar. Bei aktivem Ampelfilter bleibt die geöffnete Karte stabil bedienbar; ein sichtbarer Hinweis bietet an, den Filter danach erneut anzuwenden.

Menge, Hygiene, Herstellung und medizinische Gegenanzeigen werden dort benannt, wo die Quelle sie unterscheidet. Vollständiges Erhitzen wird nicht als Lösung für Schadstoffbelastung ausgegeben. Aktivitäten berücksichtigen unter anderem Gewohnheit und Belastung; Sauna wird bedingt dargestellt. Der Katalog enthält keine pauschale Entwarnung für komplizierte Schwangerschaften.

### Suche ohne Profiling und ohne Schluss aus fehlenden Treffern

Die Suche läuft über Namen, Synonyme und die lokalen Beschreibungstexte. Groß-/Kleinschreibung und Umlaute beziehungsweise ae/oe/ue-Schreibweisen werden vereinheitlicht; mehrere Wörter müssen alle vorkommen. Bereich und aktuelle Ampelstufe lassen sich zusätzlich filtern. Suchbegriffe und Varianten werden weder gespeichert noch versendet. Kein Ergebnis heißt ausdrücklich **nicht hinterlegt**, niemals „OK“.

Der Katalog ist keine vollständige Lebensmittel- oder Markenproduktdatenbank und keine aktuelle Rückrufliste. Quellen und Prüftag bleiben sichtbar; spätere medizinische Änderungen benötigen redaktionelle Prüfung und einen neuen App-Build. Offline stehen die Zusammenfassungen zur Verfügung, Originalseiten werden nur nach bewusstem Öffnen im externen Browser abgerufen. Die App nutzt `no-referrer`; Quellenlinks haben `noopener noreferrer`.

### Kalenderbezug ohne automatische Freigabe

Die Wissenssuche hat einen wählbaren Bezugstag. „Lebensmittel & Aktivitäten an diesem Tag“ im Kalender übernimmt den ausgewählten Tag, öffnet „Wissen“ und fokussiert die Suche. SSW und Datierung kommen aus der vorhandenen Kalenderprojektion; es gibt keine zusätzliche Zykluskorrektur. Demo, geteilte Grundlage und unsichere Zyklusschätzung werden gekennzeichnet.

Die Quellen verwenden teils Schwangerschaftsdrittel oder erste Monate, keine einheitlichen exakten SSW-Grenzen. Deshalb wechselt die Ampel **nicht** automatisch am Beginn einer bestimmten SSW auf grün. Der vollständige Phasentext bleibt stehen. Bei Sauna wird in der frühen App-Phase bis vor 14+0 zusätzlich auf den frühen Hinweis aufmerksam gemacht; dies ist eine konservative Darstellungskonvention, keine behauptete klinische Grenze zwischen verboten und erlaubt. Auch danach bleiben Bedingungen und Gegenanzeigen bestehen. Vor 0+0 oder ab 42+0 wird keine passende Phaseneinordnung behauptet.

## Erwogene Alternativen

- **Live-Websuche oder KI-Antworten pro Anfrage:** Würden Suchbegriffe nach außen übertragen, Offline-Nutzung verhindern und Antworten ohne festen redaktionellen Stand erzeugen.
- **Eine einzige Farbe pro Lebensmittel unabhängig von Zubereitung:** Würde gegarte und rohe Varianten beziehungsweise unterschiedliche Sorten gleichsetzen.
- **Freigabe allein aus SSW oder Trimester:** Quellen nennen oft weitere Bedingungen und uneinheitliche Zeitangaben. Ein Datum ist keine individuelle medizinische Prüfung.
- **Beliebige Suchbegriffe automatisch bewerten:** Für unbekannte Produkte und Inhaltsstoffe besteht keine geprüfte Grundlage.

## Folgen und Grenzen

Kein neues Speicherformat, keine Datenmigration oder zusätzliche Laufzeitabhängigkeit. Die Module gehören zur Offline-Liste und zum statischen Pages-Build. Die Anzahl der Katalogeinträge ist bewusst begrenzt und kann quellenbasiert erweitert werden. Der Katalog muss redaktionell gepflegt werden; es gibt keine automatische Quellensynchronisierung oder fachärztliche Abnahme. Die neue Suche ergänzt F01, ersetzt aber nicht den noch offenen vertieften Wochenbereich „Für dich“.

## Verifikation

Am 17.11.2026:

- Sieben neue Tests für vollständige Quellen-/Stufenmetadaten, eindeutige IDs, Suchsynonyme/Umlautschreibweisen, unbekannte Begriffe, kombinierte Filter, fehlende Varianten ohne grüne Freigabe, bedingte Phasenhinweise und Kalenderprojektion beider Datierungsmethoden bestanden. Die Tests prüfen Datenregeln, **keine klinische Wirksamkeit oder fachliche Freigabe**.
- Die unten genannten öffentlichen Primärquellen wurden gelesen; Empfehlungen in eigenen Worten auf kurze Katalogeinträge reduziert. Redaktionelle Auswahl und Ampelzuordnung sind die oben bezeichneten Agentenentscheidungen.
- Safari: „Lachs“ liefert den passenden Eintrag; zunächst bedingte Einstufung, nach Wahl roh/geräuchert rot, nach Wahl frisch durchgegart grün unter Bedingungen. Quellenlinks und Prüftag sichtbar. Unbekannter synthetischer Suchbegriff liefert keine Freigabe. Ein aus dem Kalender gewählter zukünftiger Tag wird mit derselben SSW in den Wissensbezug übernommen.
- Isolierte Safari-Layoutprüfung bei **320, 390, 820 und 1440 tatsächlichen CSS-Pixeln**: Seite, Suche und Karten ohne horizontalen Überlauf, alle 26 Einträge und ihre Quellen vorhanden. Nur die anfängliche Navigationsauswahl der isolierten Kopie wurde auf „Wissen“ gesetzt; Produktion startet weiter mit dem Überblick.

- Abschließend **122 Tests bestanden**, statischer Build erfolgreich. Die Skriptziele wurden wegen fehlendem `npm` im PATH direkt mit der vorhandenen Node-Laufzeit ausgeführt: `node --test tests/*.test.js`, `node scripts/build.js`. Der PWA-Test umfasst die neuen Offline-Module; HTML, eindeutige IDs, UI-Referenzen, Dokumentationslinks, AgDR-Nummern, Offline-Liste und `git diff --check` sind geprüft. QA-Fixtures gehören nicht zur Auslieferung.

Offen bleiben fachärztliche Abnahme, physisches Smartphone, umfassende Tastatur-/Screenreader- und Browsermatrix sowie ein erneuter kompletter PWA-Update-/Offline-Durchlauf speziell mit dieser Version. Quellenabruf offline ist erwartungsgemäß nicht möglich.

## Quellen

Alle am **17.11.2026** geprüft. Die folgenden direkten Seiten sind zusätzlich den einzelnen Karten zugeordnet; die maschinenlesbare Zuordnung steht im [Katalog](../../src/guide-data.js).

- [Netzwerk Gesund ins Leben: Essen und Trinken in der Schwangerschaft](https://www.gesund-ins-leben.de/fuer-familien/fit-durch-die-schwangerschaft/essen-und-trinken-in-der-schwangerschaft/) – Getränkemengen/-auswahl, Fischarten und Grundauswahl.
- [Netzwerk Gesund ins Leben: Schutz vor Infektionen durch Lebensmittel](https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/schutz-vor-infektionen-durch-lebensmittel-in-der-schwangerschaft/) – Zubereitung unter anderem von Eiern, Sprossen und Tiefkühlbeeren.
- [BIÖG: Rohe tierische Lebensmittel](https://www.familienplanung.de/schwangerschaft/die-schwangerschaft/gesundheit-und-ernaehrung/ernaehrung/rohmilch-rohwurst-und-co-rohe-tierische-lebensmittel-in-der-schwangerschaft/) – Rohprodukte, Milch und Erhitzung.
- [BfR: Lebensmittelinfektionen im Privathaushalt](https://www.bfr.bund.de/fragen-und-antworten/thema/lebensmittelinfektionen-im-privathaushalt-quellen-erkennen-risiken-vermeiden/) – Käseunterscheidungen, Räucher-/Beizprodukte und Lebensmittelhygiene.
- [gesund.bund.de: Ernährung in der Schwangerschaft](https://gesund.bund.de/schwangerschaft-ernaehrung) – unter anderem Leber, Lakritz, Energy-Drinks und frische pflanzliche Lebensmittel.
- [Netzwerk Gesund ins Leben: Bewegungsausmaß und -art](https://www.gesund-ins-leben.de/fuer-fachkreise/familien-vor-und-in-der-schwangerschaft/handlungsempfehlungen/bewegung/bewegungsausmass-und-art-vor-und-in-der-schwangerschaft/) – moderate Bewegung und Bedingungen.
- [BIÖG: Sport in der Schwangerschaft](https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/sport/) – sportartspezifische Anpassungen und ungeeignete Belastungen.
- [BIÖG: Entspannung und Schlaf](https://www.familienplanung.de/schwangerschaft/gesundheit-und-ernaehrung/entspannung-und-schlaf/) – Sauna und warme Bäder.
