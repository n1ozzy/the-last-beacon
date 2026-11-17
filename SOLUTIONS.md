# Verified routes (spoilers)

Mirrors are labelled A onward on the map. `/` turns east→north and north→east; `\` turns east→south and north→west. Opposite directions follow the same reflection law. Positions below use the renderer's zero-based column/row coordinates, not the decorative map labels.

| Voyage | Mirror orientations A onward | Used reflections | Buoys | Time limit |
| --- | --- | --- | --- | --- |
| Cicha zatoka | `/ / \ \` | 4 of 6 | 4 | 80 seconds |
| Przesmyk wraków | `/ / \ / \ /` | 5 of 7 | 6 | 90 seconds |
| Ostatnia straż | `/ / \ / \ / /` | 6 of 7 | 6 | 100 seconds |

Each solution is reached by clicking every necessary mirror once from its initial configuration. Unused mirror F on voyage 2 and G on voyage 3 stay in their initial orientation. This makes the first voyage a short tutorial while the later voyages require identifying the relevant mirrors and following crossings without accidentally turning at them.

1. `(0,5) → (3,5) → (3,2) → (7,2) → (7,5) → (8,5)`.
2. `(0,6) → (2,6) → (2,1) → (6,1) → (6,4) → (4,4) → (4,0)`.
3. `(0,5) → (1,5) → (1,1) → (7,1) → (7,5) → (4,5) → (4,3) → (8,3)`.

The pure-logic test verifies all routes, while the real-browser test clicks through all three voyages and waits for each actual victory screen. No test-only solution interface exists in the game.
