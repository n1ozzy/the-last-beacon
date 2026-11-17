# Validation record

Date: 2026-11-17. Node v24.21.0. Desktop Google Chrome, macOS, Playwright automation. These are local engineering results, **not a make.fun judge score or prize qualification**.

## Executed

- Opened `game/index.html` via `file://` in a real, headed Chrome with offline mode enabled.
- Started from the instruction dialog, rotated mirrors by mouse, Tab, arrow keys and Enter, and restarted by R.
- Opened and closed help, checked that its timer paused, resumed with Escape.
- Instrumented Canvas translate calls without changing game state: verified the vessel stays anchored while mirrors rotate, moves after launch, and remains at the obstruction after loss.
- Launched an invalid route, observed the animated voyage, locked controls, loss screen and rock explanation; restarted.
- Solved all three levels by normal clicks, launched each voyage and observed each success. The timer stopped during travel.
- Restarted the full campaign from the third success screen.
- Tested timeout in a separate browser page by advancing the browser clock 81 seconds. The real timeout handler produced a fog loss and 00:00. This was accelerated clock testing, not 81 seconds of wall-clock waiting.
- Restarted during a voyage using the mouse button.
- Checked actual 390×844 viewport for horizontal overflow and inspected its rendered capture. Desktop screenshots use 1280×800.
- Recorded zero HTTP(S) requests and zero uncaught page errors in the desktop playthrough, with the browser offline.
- Verified every level's solution in pure logic; separately tested rock obstruction, buoy ordering, missing buoys, map edges, reflection cap and loop detection.
- Created four real browser JPEG captures (start, partial route, solved third board, final result), each below 256 KiB.
- Ran `main.ts` to build the official dossier and checked the vendored file against the downloaded starter byte for byte.

## Corrections found during verification

- Independent read-only review caught the failed-voyage renderer returning the vessel to the lighthouse. Fixed it to preserve the endpoint after loss, and verified the actual Canvas draw coordinates. Added an explicit assertion that Enter changes the selected mirror.
- The initial unit-test loop fixture was not a loop. Corrected its geometry to a closed ray circuit; the simulation did not need changing.
- Narrowed the desktop layout after an early 1280×800 capture clipped the board footer.
- Installing the simulated browser clock halfway through a running page interfered with the test's existing time base. Moved timeout testing to its own page, with clock installation before navigation.
- Corrected a test that passed viewport options to `BrowserContext.newPage`, where they were ignored. Rechecked using `setViewportSize` and confirmed innerWidth = scrollWidth = 390.

## Scope and limits

Only Chrome was tested; no Safari/Firefox claim. Mobile checks cover responsive rendering, not a physical touch device. No audio is implemented. The puzzles are deliberately short and introductory, not a large campaign.

The official kit explicitly says its game scorer and reference data remain server-side, so there is **no local game grade**. `makefun check` is the official pre-submit gate, not the AI judge. Repository ownership, public visibility, receipt, ranking and reward eligibility require the server's own results. Session logs, private instructions and credentials are never part of this repository.
