# AgDR-0054: Wissen und zeitbezogene Lesetipps

- **Status:** Umgesetzt, medizinische Fachabnahme offen
- **Datum:** 2026-11-24
- **Entscheidende Instanz:** Der Nutzer vermisst Wissen und wünscht insbesondere Informationen zu NIPT und CMV sowie passende Hinweise bei Vorsorge und Arztterminen. Die Einbettung, Themenauswahl und Hinweiszeiträume legt der Agent fest.
- **Betroffene Dateien:** [Wissensinhalte](../../src/knowledge.js), [Wissensoberfläche](../../src/knowledge-ui.js), [App](../../src/app.js), [Termine](../../src/care-ui.js), [Terminmappe](../../src/companion-ui.js), [Ansicht](../../index.html), [Offline-Manifest](../../sw.js)
- **Ersetzt / ergänzt:** Erweitert [AgDR-0053](0053-mobile-neuordnung-und-gemeinsame-erfassung.md) um den dauerhaften Zugang im Kopf und zusätzliche Inhalte. Setzt den Quellenabgleich aus [AgDR-0018](0018-ndr-als-ergaenzende-quelle.md) fort.

## Kontext und Herkunft

Die vorherige Neuordnung hatte Wissen über Heute und kontextuelle Links erschlossen. Der Nutzer findet den Zugang zu wenig sichtbar und braucht Begriffe und Alltagsempfehlungen auch unabhängig vom Wocheninhalt. Er nennt NDR „Tatsächlich schwanger“ als Orientierung für die Themen und verlangt mehrere Quellen zur medizinischen Einordnung.

## Entscheidung

Ein Textbutton **Wissen** im App-Kopf ist von allen Hauptbereichen mit einem Tipp erreichbar. Der bestehende Zugang auf Heute bleibt bestehen. Wissen öffnet mit einer Suche und Themenzeilen. Die Startauswahl zeigt vier häufige Fragen. Die ausführlichen Texte öffnen als einzelne Artikel. Die unteren fünf Hauptbereiche behalten ihre Beschriftung. Lebensmittel, Aktivitäten, Beschwerden und Grundlagen sind über die gemeinsame Oberfläche erreichbar.

Neun Artikel erklären Pränataldiagnostik, NIPT, Ersttrimester-Screening, invasive Diagnostik, CMV/ZMV, Toxoplasmose, Zuckertest, Mutterpass und Ultraschallmaße. Abschnitte ordnen Aussagen ihren Quellen zu. Redaktioneller Prüftag ist der 24.11.2026. Der vorhandene Lebensmittelkatalog behält seinen eigenen Prüfstand. Begriffe und Synonyme sind suchbar. Für die Auswahl typischer Themen wurde die erste Podcastfolge einschließlich der Themenliste zu Ernährung, Sport und CMV herangezogen. Es wurde keine Audiofolge angehört oder transkribiert.

Die Vorsorge zeigt höchstens zwei kurze Lesetipps. Bei einem nächsten eigenen Termin stehen sie an dessen Karte und in der Terminmappe. Gibt es keinen nächsten Termin, werden Lesetipps für heute angeboten. Die Auswahl verwendet das vorhandene berechnete Alter am Termin und dessen Terminart. Allgemeine Termine der Kategorie „Anderer Termin“, ungültige Datierung, Daten vor dem rechnerischen Beginn, ab 42+0 und Tage ab eingetragener Geburt erhalten keine solchen Vorschläge. Die Themen bleiben über Wissen lesbar.

| Bezugstag in vollen Wochen und Tagen | Redaktionelle Auswahl |
| --- | --- |
| 0+0 bis 7+6 | CMV und Mutterpass |
| 8+0 bis 13+6 | NIPT und Ersttrimester-Screening als Gesprächsvorbereitung |
| 14+0 bis 23+6 | Pränataldiagnostik und Ultraschallmaße |
| 24+0 bis 27+6 | Zuckertest und Mutterpass |
| 28+0 bis 41+6 | Mutterpass und Ultraschallmaße |

Diese redaktionellen Lesezeiträume geben keinen Untersuchungsauftrag und keine individuelle Indikation vor. Die vorhandenen klinischen Zeitfenster werden in diesem Schritt nicht geändert. Vorsorgekarten zu NIPT, Ultraschall, invasiver Diagnostik, Rhesusfaktor und Zuckertest verweisen auf passende Artikel. Eine Frage aus einem Artikel öffnet den bestehenden Notizeditor. Beim Einstieg über einen eigenen Termin wird dieser vorausgewählt. Die Nutzerin speichert ausdrücklich.

## Erwogene Alternativen

Ein weiterer Haupttab würde die untere Leiste auf schmalen Geräten verdichten. Ein vollständiger Wissensartikel neben jeder Vorsorgekarte würde wieder lange, wiederholte Inhalte erzeugen. Der Kopfbutton, eine gemeinsame Suche und kurze Verweise halten den Zugang sichtbar und die einzelnen Aufgabenbereiche kompakt.

## Folgen und Grenzen

Inhalte und Suche sind Bestandteil der statischen App und offline verfügbar. Suchanfragen werden nicht gespeichert. Es werden keine externen Player, Skripte oder Texte nachgeladen. Nur ein bewusst geöffneter Quellenlink oder Podcast verlässt die lokale Zusammenfassung. Persönliche Termine, Fragen und Datenfreigaben verwenden weiterhin die bestehenden Speicher- und Auswahlregeln. Der Quellenabgleich durch den Agenten ist keine fachärztliche Abnahme.

Der geprüfte NDR-Pränataldiagnostiktext enthält eine pauschale Aussage zu einer „falsch-positiv Rate“ von etwa 50 Prozent. Diese Zahl wurde nicht übernommen. G-BA und IQWiG erklären die Abhängigkeit eines auffälligen Befunds von der Ausgangswahrscheinlichkeit. Im Artikel werden diese Fachquellen verwendet. NDR bleibt ein gesondert gekennzeichneter ergänzender Link. Die NDR-Themenübersicht und Podcastbeschreibung dienen nur zur Themenstruktur. Der RKI-Ratgeber war über die indexierten Auszüge zu Übertragung und Händehygiene verfügbar. Der direkte Abruf der Seite wurde durch den Anbieter mit 403 blockiert. Die verwendeten Kernaussagen wurden zusätzlich mit dem vollständigen BIÖG-Zytomegalietext abgeglichen. Es werden keine neuen CMV-Test- oder Therapieprogramme empfohlen.

## Verifikation

- `npm test` mit 240 Tests und `npm run build` erfolgreich. Neue Prüfungen decken Suchvarianten, Hinweisgrenzen, Artikel- und Vorsorgeverweise sowie die neuen Module im Offline-Cache ab.
- Chromium mit synthetischen Daten. Wissen geöffnet, CMV über ZMV gefunden, Quellen und Artikel angezeigt. Käse gesucht und Zubereitung mit Ampel gewechselt. Ultraschallbegriffe, Grundlagen und Beschwerden aufgerufen. Am gynäkologischen Termin NIPT gelesen und eine Frage mit diesem Termin im Editor vorausgewählt. Offline-Neuladen der Root-PWA und NIPT-Artikel erfolgreich. Kein horizontaler Überlauf bei 320, 390, 820 und 1280 CSS-Pixeln. Physische Smartphone-Gesten und eine umfassende Screenreaderprüfung stehen aus.

## Quellen

- Redaktioneller Themenaufbau. [NDR-Themenübersicht](https://www.ndr.de/ratgeber/gesundheit/Tatsaechlich-schwanger-Alles-rund-um-die-Geburt-und-die-erste-Zeit-mit-Baby,tatsaechlichschwanger100.html), [Folge 1 mit CMV-Thema ab 33:04](https://www.ndr.de/n-joy/01-Schwanger-Was-muss-ich-jetzt-beachten,audio1451116.html), [NDR-Pränataldiagnostikartikel](https://www.ndr.de/ratgeber/gesundheit/Praenataldiagnostik-Welche-Untersuchungen-sind-sinnvoll,praenataldiagnostik102.html)
- Pränataldiagnostik, Freiwilligkeit und NIPT-Ergebnisse. [G-BA](https://www.g-ba.de/themen/methodenbewertung/schwangerschaft-mutterschaft/faqs-nipt/), [IQWiG](https://www.gesundheitsinformation.de/bluttest-auf-trisomien-nicht-invasiver-praenataltest-nipt.html), [BIÖG](https://www.familienplanung.de/schwangerschaft/die-schwangerschaft/praenataldiagnostik/was-ist-praenataldiagnostik/)
- Infektionsschutz. [RKI-Zytomegalieratgeber](https://www.rki.de/DE/Aktuelles/Publikationen/RKI-Ratgeber/Ratgeber/Ratgeber_Zytomegalievirus.html), [BIÖG-Zytomegalie](https://www.familienplanung.de/schwangerschaft/beschwerden-und-krankheiten/akute-erkrankungen-und-infektionen/zytomegalie/), [BIÖG-Toxoplasmose](https://www.familienplanung.de/schwangerschaft/beschwerden-und-krankheiten/akute-erkrankungen-und-infektionen/toxoplasmose/)
- Einzelbelege zu Begriffen, CTG, Screening und Zuckertest. [Quellenregister und Zuordnung pro Abschnitt](../../src/knowledge.js)
