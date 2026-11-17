# Projektkonventionen

- Dokumentiere wesentliche Produkt-, Architektur-, Datenschutz- und Berechnungsentscheidungen als **AgDR (Agent Decision Record)** in `docs/agdr/`.
- Nutze das dortige Template und ergänze den Index. Trenne ausdrückliche Nutzeranforderungen von Entscheidungen oder Annahmen des Agenten. „Umgesetzt“ bedeutet keine nachträgliche Nutzerfreigabe.
- Neue Entscheidungen erhalten eine fortlaufende Nummer. Wird eine Entscheidung abgelöst, lege einen neuen Record an und verknüpfe beide. Korrigiere sachliche Fehler transparent.
- Die README ist der Einstieg für Betrieb und Veröffentlichung; Entscheidungsbegründungen stehen in den AgDRs.
- Die App bleibt statisch und GitHub-Pages-kompatibel, solange keine neue Anforderung dies ändert. Keine echten Gesundheitsdaten in Quellcode, Tests oder Dokumentation aufnehmen.
- Prüfe bei Berechnungsänderungen `npm test` und erstelle mit `npm run build` die auslieferbaren Dateien. Erfinde keine Prüfergebnisse; halte materielle Prüflücken im betreffenden AgDR fest.
