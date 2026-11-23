# AgDR-0051: Mobile Informationsarchitektur für bauchgefühl

- **Status:** Vorgeschlagen, keine Umsetzung
- **Datum:** 2026-11-23
- **Entscheidende Instanz:** Der Nutzer beauftragt ein verständliches Mobile-first-Konzept für Wochenreise, Kalender, Journal, Vorsorge und „Für dich“. Die Navigation, Platzierung der Inhalte und Prüfkriterien sind Vorschläge des Agenten.
- **Betroffene Ansichten:** [Überblick, Wochenreise, Kalender, Journal, Vorsorge und Wissen](../../index.html)
- **Bezug:** Baut auf [AgDR-0021](0021-uebersichtliche-hauptbereiche.md), [AgDR-0024](0024-fuer-dich-und-mobile-layoutkorrekturen.md), [AgDR-0025](0025-termine-fragensammlung-und-klarerer-kalender.md) und [AgDR-0044](0044-kalender-mit-gemeinsamer-wochenansicht.md) auf. Ein Ersatz dieser Entscheidungen setzt die Umsetzung voraus.

> [AgDR-0052](0052-fuer-dich-und-schnelle-erfassung.md) überarbeitet den Einstieg in die persönlichen Funktionen. Für die Navigation, die Erfassung und die Dezimaleingabe gilt der neuere Vorschlag.
> Die Umsetzung der Kalender- und Vorsorgeordnung steht in [AgDR-0053](0053-mobile-neuordnung-und-gemeinsame-erfassung.md).

## Kontext und Herkunft

Im Monatskalender stehen heute Monatsraster, ausgewählter Tag, SSW-Wochenansicht mit Rückblick und Vorsorge-Vorausblick untereinander. Der Reiter „Journal“ öffnet eine andere Ansicht unter demselben Hauptpunkt. Dort konkurrieren die geöffneten Filter und der Messwertverlauf mit den Einträgen. In der Vorsorge erscheint die Geburts- und Wochenbettplanung vor den persönlichen Terminen. In der Wochenreise stehen ausgewählte SSW, Wochenleiste und Datumskontext räumlich auseinander. Illustration und Untersuchungswerte folgen erst unter dem Entwicklungstext. „Für dich“ kann Wocheninfos, einen Check-in oder die persönliche Tagesübersicht meinen.

In der Mobilansicht mit Beispieldaten bei 390 CSS-Pixeln war der Abschnitt „Deine nächsten Termine“ rund 1.040 Pixel unter dem Beginn des Vorsorgebereichs. Die Kalender-Wochenansicht begann nach rund 860 Pixeln. Nach dem Wechsel zur Wochenreise war im Beispiel die 19. SSW ausgewählt, während der sichtbare Teil der Wochenleiste bei Woche 1 anfing. Kalender und Vorsorge verwendeten dasselbe Kalendersymbol. Die Beobachtungen beschreiben den geprüften Stand und ersetzen keinen Nutzertest. [Kalenderoberfläche](../../src/calendar-ui.js), [Wochenreise](../../src/app.js), [Vorsorgeoberfläche](../../src/care-ui.js), [Ergänzende Inhalte](../../src/companion-ui.js)

**Auftrag:** Bestehende Funktionen und Inhalte neu zusammenstellen. Berechnungen, Quellen, Speicherformate, Offline-Nutzung, Teilen, Rechte und der Schutz ungespeicherter Entwürfe gelten fort. Die folgenden Beispiele sind synthetisch.

## Entscheidungsvorschlag

### Fünf Ziele in der unteren Navigation

| Ziel | Frage der Nutzerin | Das steht zuerst auf dem Bildschirm |
| --- | --- | --- |
| **Heute** | Wo stehe ich, was ist als Nächstes dran? | Grüne SSW-Karte mit Illustration und ET. Darunter nächster eigener Termin, offener Gesprächspunkt oder Check-in-Zugang. |
| **Wochenreise** | Was verändert sich bei meinem Baby und bei mir? | Ausgewählte SSW und Datumsspanne in einer Zeile oder Gruppe. Direkt darunter **Dein Baby / Für dich**. |
| **Kalender** | Was liegt an diesem Tag oder in dieser Woche? | **Monat / Woche**, Datum, **Heute** und **Datum oder SSW finden**. Darunter die gewählte Zeitansicht. |
| **Journal** | Was habe ich beobachtet und wie hat es sich verändert? | Datierte Einträge und die Aktionen **Eintrag hinzufügen** und **Check-in**. Suche und Filter sind als beschrifteter Zugang erreichbar. |
| **Vorsorge** | Was möchte ich mit meiner Praxis oder Hebamme planen oder besprechen? | Nächster eigener Termin und **Terminmappe öffnen**. Darunter die klar beschrifteten Zugänge **Fragen & Notizen**, **Vorsorgefenster** und **Geburt & Wochenbett**. |

**Wissen** bleibt ein eigener Bildschirm mit einem direkt sichtbaren Textzugang auf **Heute**, nach SSW-Karte und Tagesaktionen. Passende Links aus Wochenreise, Tagesdetails und Journal öffnen gezielt den vorhandenen Inhalt. Der Wissenseinstieg führt zur Suche nach Lebensmitteln und Aktivitäten, zur Beschwerdenhilfe und zu den vorhandenen Grundlagen. Die Einträge behalten Bedingungen, Ampel, Datumsbezug, Quellen und Prüfstand. Installation, App-Update, Teilen sowie Daten & Backup behalten ihre bekannten Zugänge. **Journal** gewinnt so einen Platz in der Navigation, während Nachschlagen weiterhin einen klar beschrifteten Einstieg hat.

### Heute und Wochenreise

- **Heute** bleibt an das tatsächliche heutige Datum gebunden. Die SSW-Karte öffnet die aktuelle Wochenreise. „Für dich diese Woche“ öffnet dort direkt den entsprechenden Reiter. **Check-in für heute** öffnet das vorhandene Formular für heute. Der nächste Termin führt direkt in die bestehende Terminmappe. Ohne geplanten Termin bleiben **Termin planen** und offene Fragen sinnvoll erreichbar. Wochenimpuls, notierte nächste Schritte und offene Aufgaben bleiben als kurze Hinweise mit Link zum jeweiligen Ursprung verfügbar.
- **Wochenreise** öffnet beim ersten Besuch die aktuelle SSW und zentriert sie im sichtbaren Ausschnitt. SSW, Datumsbereich, Pfeile und **Zur aktuellen Woche** bilden einen einzigen Steuerbereich. Die vorhandene Auswahl aller SSW bleibt über **Woche wählen** erreichbar. Beim Wechsel zwischen **Dein Baby** und **Für dich** bleiben Woche und Datumsbereich gleich. Die Vorschau hat einen sichtbaren Status, zum Beispiel „Vorschau · 24. SSW“.
- **Dein Baby** zeigt Illustration, Entwicklungstext und eine einzige klar beschriftete Größenorientierung. Medizinische Referenz, Messmethode und Einordnung bleiben im zugehörigen Detail erreichbar. **Untersuchungswerte** führt zu den vorhandenen, datierten Werten aus Untersuchungen und zur Erfassung. Eigene Messwerte erscheinen getrennt von allgemeinen Größenangaben und ändern die Datierung nicht.
- **Für dich** beginnt mit **Dein Körper in dieser Woche**, einem kurzen Absatz und dem Wochenimpuls. Es folgen die bekannten Themen Bewegung & Alltag, Schlaf, Gefühle und Unterstützung als flache Themenzeilen. Längere Texte und Quellen öffnen sich am Thema. Der vorhandene Check-in bleibt als **Check-in für heute** eindeutig datiert. Das Tagebuch und persönliche Auswertungen haben ihren Einstieg im Journal.

### Kalender und Journal

- **Kalender → Monat** zeigt Raster und die kurze Vorschau zum ausgewählten Tag. Persönlicher Termin, Beginn eines Vorsorgefensters, Meilenstein, Journal und Symptommarkierung bleiben unterscheidbar. Das Raster verwendet kompakte Symbole mit Legende. Die Kurzvorschau und die barrierefreien Namen verwenden ausgeschriebene Kategorien. Heute und der gewählte Tag haben unterschiedliche sichtbare Zustände. Suche, Monatswechsel, ET-Sprung und Anzeigeoptionen bleiben verfügbar. Der ET bezeichnet weiterhin den errechneten oder eingetragenen Termin.
- **Kalender → Woche** zeigt dieselbe Auswahl im passenden Wochenzeitraum. Oben stehen SSW und Spanne, darunter die Tage mit Terminen, Meilensteinen, Vorsorgefenstern und Eintragsmarken. **Wochenrückblick ansehen** führt direkt zur Auswertung desselben Zeitraums im Journal. **Entwicklung dieser SSW** öffnet die Wochenreise mit der passenden Woche. **Vorausblick ab diesem Tag** öffnet die bestehende Liste späterer Meilensteine und Vorsorgefenster, die auch aus der Monatsansicht erreichbar bleibt. Die mobile Monatsansicht erhält damit keinen zweiten vollständigen Wochenbereich unterhalb des Rasters.
- **Tagesdetails** öffnen sich über eine sichtbare Schaltfläche oder per vorhandenem Langdruck. Oben stehen Datum und gültige Einordnung. Darunter folgen **Eigene Termine**, **Vorsorgefenster & Meilensteine** und **Journal**. Von hier öffnet sich der konkrete Termin, der gespeicherte Originaleintrag oder der passende vorhandene Editor mit demselben Datum. Der Link zu Lebensmittel- und Aktivitätsinformationen übernimmt den Bezugstag. Das Zurück-Ziel ist der gewählte Tag, mit demselben Zeitraum und Fokus im Kalender. Die bestehende Tastaturbedienung bleibt erreichbar.
- **Journal** zeigt chronologische Originaleinträge per Voreinstellung. Einträge und strukturierte Check-ins erhalten eine eindeutige Kennzeichnung. Die vorhandene Suche, Datumsgrenzen, Tags, Symptom- und Typfilter bleiben zusammen. Ein aktiver Filter steht als Text über der Liste und lässt sich sichtbar zurücksetzen. **Wochenrückblick** zeigt Symptome, Check-ins und Messwerte für einen ausdrücklich genannten Zeitraum. Jede Auswertung führt zu ihren Originaleinträgen. **Messwertverlauf** zeigt die bestehende Messgrößenwahl, Ausgangsmessung, Zeitspanne, Notizmarkierungen und Datentabelle. Archiv und Wiederherstellung, CSV und selektiver Journalauszug bleiben über benannte Aktionen erreichbar.
- **Gemeinsamer Zeitbezug:** Die Wochenansicht und der Wochenrückblick nennen denselben Datumsbereich. Während der Schwangerschaft gilt der vorhandene SSW-Zeitraum, der auch mitten in der Kalenderwoche beginnen kann. Außerhalb dieses Bereichs und nach eingetragener Geburt gelten die vorhandenen Ersatzzeiträume. Fehlende Aufzeichnungen, erfasste Tage und zukünftige Tage bleiben unterscheidbar. Ein Sprung aus dem Kalender ins Journal setzt einen sichtbar ausgewiesenen Datumsfilter für diesen Einstieg. Zurück bringt die Nutzerin an den Ausgangspunkt.

### Vorsorge

- **Eigene Termine** stehen vorne, mit Titel, Datum und gegebenenfalls Uhrzeit und Ort. „Terminmappe öffnen“ führt direkt zum gewählten Termin. Alle weiteren, vergangenen und archivierten Termine bleiben über die Terminliste erreichbar. **Termin planen** nutzt im Kalender den ausgewählten Tag und in der Vorsorge die bisherigen Vorgaben. Der gespeicherte Termin ist in beiden Ansichten derselbe Datensatz.
- **Fragen & Notizen** zeigt offene Fragen direkt, mit Zugriff auf die bestehende Suche und Filter. Fragen ohne Termin lassen sich hier festhalten und später zuordnen. Notizen, Antworten, Ergebnisse, nächste Schritte und Besprochen-Status bleiben bearbeitbar. Eine zugeordnete Frage erscheint am Termin und in der Sammlung mit demselben Stand. Gesprächsansicht, Vorschau, ausgewählte PDF-Terminmappe und vorhandene Teilweitergabe bleiben am Termin beziehungsweise an der Sammlung erreichbar.
- **Vorsorgefenster** zeigt die vorhandenen allgemeinen Zeiträume und Merkhäkchen. Die Liste nennt Datumsspanne und Kennzeichnung wie „freiwillig“ oder „falls zutreffend“, soweit vorhanden. Vollständige Hinweise und Quellen öffnen sich am jeweiligen Thema. Im Kalender erscheint dieselbe Information mit Datumsbezug und der Bezeichnung „Vorsorgefenster“. Ein selbst eingetragener Termin trägt Datum und gegebenenfalls Uhrzeit. Der Unterschied ist auch ohne Farbe sichtbar.
- **Geburt & Wochenbett** führt zur vorhandenen Planung mit Wünschen, Kliniktasche, Aufgaben, Unterstützung und ausgewähltem Druck. Hier ist der bestehende bewusste Phasenwechsel erreichbar. Nach der Geburt bleibt das Journal nutzbar, der Kalender verwendet die vorhandene Einordnung nach der Geburt, und die Wochenreise lässt sich als Rückblick lesen. **Hilfe & Kontakte** und der bestehende Schnellzugriff zur Wehenmessung bleiben auf ihren direkten Wegen erreichbar.

### Darstellung und Verhalten auf Mobilgeräten

Die erste Bildschirmhöhe beantwortet die Kernfrage des jeweiligen Bereichs. Hauptaktionen stehen bei ihrem Inhalt, Listen verwenden flache Zeilen und einheitliche Abstände. Kurze Hinweise bleiben offen lesbar. Längere Quellen und Fachtexte erhalten eine eigene, klar benannte Detailfläche. Zum Vergleich von zwei Informationen lassen sich sinnvolle Details gleichzeitig lesen. Die App gestaltet Tabs mit Text und eindeutigen Symbolen, darunter zwei verschiedene Symbole für Kalender und Vorsorge. Sie behält die aktuell geöffnete Ansicht und einen nachvollziehbaren Rückweg pro Bereich. [Apple HIG zu Tab-Leisten](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [NN/g zu schrittweiser Offenlegung](https://www.nngroup.com/articles/progressive-disclosure/)

Schaltflächen, Tabs und Tageszellen bekommen etwa 44 CSS-Pixel große Touchflächen, soweit Platz und Funktion es zulassen. Für enge Kalenderraster werden Mindestgröße, Abstände, kontrastreiche Zustände und die zugängliche Tagesdetailaktion geprüft. Große Schrift darf Titel und Aktionen umbrechen. Auswahl, Status und Typen sind per Text oder Symbol verständlich. Fokusmarkierung und Dialogaktionen bleiben oberhalb der festen unteren Leiste sichtbar. Zurück schließt zuerst den Dialog, schützt Entwürfe und stellt an der Ausgangsansicht Datum, Woche, Filter, Scrollposition und Fokus wieder her. [WCAG 2.2 zu Zielgröße, Farbe und Fokus](https://www.w3.org/TR/WCAG22/), [Bestehender Entwurfsschutz](0028-mobile-zurueck-navigation.md)

### Zwei mobile Ansichten als Skizze

```text
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ Wochenreise                  │   │ Vorsorge         + Termin   │
│ ‹   24. SSW · 8.–14. Jan.  › │   │                              │
│ Woche wählen   Aktuelle Woche│   │ Nächster eigener Termin      │
│                              │   │ Hebamme · Mo, 11. Jan.       │
│ [ Dein Baby ] [ Für dich ]   │   │ 10.30 Uhr · 2 offene Fragen  │
│                              │   │ [ Terminmappe öffnen ]       │
│ Dein Körper in dieser Woche  │   │                              │
│ Kurzer Text und Wochenimpuls │   │ Fragen & Notizen           › │
│                              │   │ Vorsorgefenster            › │
│ Bewegung & Alltag          › │   │ Geburt & Wochenbett       › │
│ Schlaf & Ruhe               › │   │                              │
│ …                            │   │ Hilfe & Kontakte             │
└──────────────────────────────┘   └──────────────────────────────┘
       Heute · Wochenreise · Kalender · Journal · Vorsorge
```

### Beispielwege für einen klickbaren Entwurf

| Aufgabe | Vorgesehener Weg |
| --- | --- |
| Lesen, was sich bei mir in der 24. SSW verändert | **Wochenreise → Woche wählen → 24. SSW → Für dich**. Datumsbereich und Vorschau bleiben sichtbar. |
| Fragen für den nächsten Termin ansehen | **Heute → Terminmappe öffnen**. Die Fragen dieses Termins, Gesprächsstatus und Druckauswahl stehen am selben Termin. |
| Eine Frage ohne Termin festhalten | **Vorsorge → Fragen & Notizen → Frage hinzufügen**. Die vorhandene spätere Zuordnung bleibt im Editor erreichbar. |
| Einen eigenen Termin von einem Vorsorgefenster unterscheiden | **Kalender → Tag → Tagesdetails**. Unter „Eigene Termine“ steht etwa „Hebamme · 10.30 Uhr“. Unter „Vorsorgefenster“ steht ein Zeitraum. |
| Die Notizen hinter den Übelkeitsnennungen einer Woche finden | **Kalender → Woche → Wochenrückblick ansehen → Übelkeit**. Das Journal zeigt Originaleinträge mit sichtbarem Datums- und Symptomfilter. |
| Beschwerden oder Lebensmittel nachschlagen | **Heute → Wissen → passender Inhalt**. Aus dem Journal bleibt der direkte, passende Weg zur Beschwerdenhilfe verfügbar. |

## Erwogene Alternativen

Die bisherige Hauptnavigation ist vertraut und gibt Wissen einen festen Platz. Journal bleibt darin jedoch dem Kalender untergeordnet, obwohl das schnelle Erfassen und das Wiederfinden von Beobachtungen eigene Aufgaben sind. Vier Hauptpunkte würden erneut zwei häufige Aufgaben unter einem gemeinsamen Namen bündeln. Sechs Hauptpunkte würden die sichtbaren Ziele auf schmalen Geräten stark verdichten. Fünf Ziele mit einem ausdrücklich benannten Wissenszugang sind deshalb die bevorzugte Hypothese für den ersten Entwurf. Die Auffindbarkeit von Wissen ist ein eigener Prüfauftrag.

„Für dich“ als Hauptpunkt würde die Wochensteuerung erneut auf zwei Bereiche verteilen. Zwei gleich sichtbare Reiter direkt unter derselben Wochenauswahl halten Babyentwicklung und mütterliche Perspektive zusammen. Die Tagesaktionen auf „Heute“ und die Wissenssuche behalten eigene Namen und Zwecke.

## Folgen und Grenzen

Die Neuordnung verschiebt vorhandene Ansichten und schafft gezielte Verweise. Termine, Einträge und Fragen werden in mehreren Kontexten aus ihrer jeweiligen bestehenden Quelle angezeigt. Die Umstellung benötigt keine neuen Datentypen oder Gesundheitsbewertungen. Schreibrechte im Master, Vorschau/Lesemodus, Archive, Medien, Offline-Caches, bestehende Quellen und Auswahlregeln fürs Teilen bleiben erhalten. Der Fortschritt zur Geburt und die SSW-Logik behalten ihre Grundlage.

Empfohlene Reihenfolge nach Freigabe des Konzepts: zuerst einen klickbaren Mobilentwurf der fünf Einstiege und der Verknüpfungen erstellen. Dann Navigation, Datumsbezug und Rückwege prüfen. Erst nach dieser Prüfung vorhandene Ansichten neu anordnen. Gestaltungsdetails und übergreifende Abstände folgen den bestätigten Wegen.

## Verifikation

- Ist-Analyse am 23.11.2026. Markup, Navigation und Ansichten gelesen. Wochenreise, „Für dich“, Kalender, Journal und Vorsorge mit Beispieldaten im Chromium-Viewport bei 390 CSS-Pixeln aufgerufen. Die Vergleichsapps wurden anhand ihrer Herstellerdokumentation geprüft.
- Im Entwurf zuerst kurze Aufgaben ohne Begriffe aus der Navigation vorgeben. Zum Beispiel „Du willst wissen, was sich in Woche 24 bei dir verändert“, „Du willst die Antwort vom letzten Hebammentermin sehen“ oder „Du möchtest etwas über Kaffee nachlesen“. Erste Wahl in der Navigation, erfolgreiche Erledigung, Rückweg und Stellen mit Suchaufwand beobachten. Die bestehenden Funktionen für Archiv, Export, Filter und Druck je einmal gezielt auffinden.
- Abnahmekriterien für eine spätere Umsetzung. Der nächste Termin, die Aktion zum Eintragen und die Auswahl „Für dich“ sind in ihrem Bereich direkt sichtbar. Eigene Termine und allgemeine Fenster werden ohne Erklärung korrekt unterschieden. Kalender und Journal weisen beim Wechsel denselben Zeitraum aus. Eine aus zwei Ansichten bearbeitete Frage bleibt ein Datensatz. Monatswechsel, Archiv, Wochenbett, geteilte Ansicht und leere Datenbestände sind mit repräsentativen Testständen abzudecken. Prüfen auf schmalem und großem Smartphone, mit großer Schrift, Tastatur, Screenreader und offline nach dem Erstladen.
- Der Entwurf wurde noch nicht mit Nutzerinnen getestet. Der Repository-Stand enthält keine Umsetzung dieses Vorschlags.

## Quellen

- **Flo** zeigt laut Hilfe die Schwangerschaftswoche auf der Startseite und führt über Details zu den Wocheninformationen. Die Wocheninhalte umfassen Veränderungen bei Baby und Körper. Daraus leite ich für bauchgefühl die kurze Startzusammenfassung und die zwei gleich sichtbaren Perspektiven in der Wochenreise ab. [Flo Schwangerschaftsmodus](https://help.flo.health/hc/de/articles/360054523711-Was-ist-der-Schwangerschaftsmodus-und-wie-aktiviere-ich-ihn), [Flo zu Wocheninhalten](https://help.flo.health/hc/de/articles/360061400591-Wie-funktionieren-die-Flo-Geschichten)
- **Schwangerschaft+** beschreibt Wochenentwicklung, Kalender für Termine und eigene Gewichtsaufzeichnungen als unterscheidbare Werkzeuge. Für bauchgefühl stützt das drei klar benannte Einstiege für Lesen, Planen und Dokumentieren. [Philips Schwangerschaft+](https://philips-digital.com/de/pregnancy-new/), [Philips-App-Beschreibung](https://apps.apple.com/de/app/schwangerschaft-tracker-app/id505864483)
- **Apple Health** dokumentiert das Erfassen und spätere Ansehen von Schwangerschaftssymptomen in einer datierten Gesundheitsansicht. Für bauchgefühl ergibt sich daraus der Vorschlag, den Tag in der Übersicht zu zeigen und für das Bearbeiten zu demselben Originaleintrag zu führen. [Apple Support zur Erfassung in Health](https://support.apple.com/en-ie/guide/iphone/iphf699c1ffc/ios)
- **UX und Zugänglichkeit.** Stabile, beschriftete Hauptnavigation, gezielte Vertiefung und sichtbare Bedienalternativen. [Apple HIG zu Tab-Leisten](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [NN/g zu schrittweiser Offenlegung](https://www.nngroup.com/articles/progressive-disclosure/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
