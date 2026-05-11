# Hero-Bilder

Lege hier 5 Beispielfotos für die Landing-Hero ab:

| Datei | Wo es angezeigt wird | Empfohlenes Format |
|---|---|---|
| `01.jpg` | Großes Hero-Bild (rechts neben dem Text) | Landscape · idealerweise 1600×1200 oder mehr |
| `02.jpg` | Galerie-Strip · Position 1 (Detail) | Portrait · 900×1200 |
| `03.jpg` | Galerie-Strip · Position 2 (Architektur) | Portrait · 900×1200 |
| `04.jpg` | Galerie-Strip · Position 3 (Frontal) | Portrait oder Landscape · 900×1200 |
| `05.jpg` | Galerie-Strip · Position 4 (Schräg) | Portrait oder Landscape · 900×1200 |

**Tipps**
- JPG mit ~80–85 % Qualität reicht — Next.js Image optimiert beim Ausliefern weiter.
- Wenn ein Bild fehlt, zeigt Next.js statt einer Lücke einen kaputten Bildplatzhalter — kein Build-Fehler.
- Alt-Texte stehen in `components/marketing/hero.tsx`. Anpassen, wenn andere Motive verwendet werden.
