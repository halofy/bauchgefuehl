# Projektkonventionen

- Dokumentiere wesentliche Produkt-, Architektur-, Datenschutz- und Berechnungsentscheidungen als **AgDR (Agent Decision Record)** in `docs/agdr/`.
- Nutze das dortige Template und ergänze den Index. Trenne ausdrückliche Nutzeranforderungen von Entscheidungen oder Annahmen des Agenten. „Umgesetzt“ bedeutet keine nachträgliche Nutzerfreigabe.
- Neue Entscheidungen erhalten eine fortlaufende Nummer. Wird eine Entscheidung abgelöst, lege einen neuen Record an und verknüpfe beide. Korrigiere sachliche Fehler transparent.
- Die README ist der Einstieg für Betrieb und Veröffentlichung; Entscheidungsbegründungen stehen in den AgDRs.
- Die App bleibt statisch und GitHub-Pages-kompatibel, solange keine neue Anforderung dies ändert. Keine echten Gesundheitsdaten in Quellcode, Tests oder Dokumentation aufnehmen.
- Alle Funktionen sind für alle kostenlos; keine Premium-Stufen oder Bezahlschranken. Funktionen bleiben offline nutzbar und datensparsam; optionaler Geräte-Sync benötigt eine Verbindung zum eigenen Dienst.
- Medizinische Daten und Hinweise brauchen nachvollziehbare Quellen und einen redaktionellen Prüfstand. Teilen soll Daten bewusst auswählen und ausgelassene Bereiche tatsächlich aus der Weitergabe entfernen.
- Berücksichtige auf ausdrücklichen Nutzerwunsch auch NDR „Tatsächlich schwanger“ als ergänzende redaktionelle Quelle. Prüfe die konkreten Beiträge, ordne Belege den passenden Aussagen zu und gleiche medizinische Empfehlungen mit Fachquellen ab; eine Themenübersicht oder Audiobeschreibung belegt keine ungeprüften Detailaussagen. Siehe AgDR-0018.
- Prüfe bei Berechnungsänderungen `npm test` und erstelle mit `npm run build` die auslieferbaren Dateien. Erfinde keine Prüfergebnisse; halte materielle Prüflücken im betreffenden AgDR fest.
