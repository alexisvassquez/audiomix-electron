
# 🎧 AudioMIX Electron UI

## 📦 CHANGELOG

All notable changes to the AudioMIX Electron UI will be documented in this file.

The AudioMIX core engine has its own separate changelog in the [AudioMIX Core repository](https://github.com/alexisvassquez/audiomix)

---

## [0.5.0] — 2026-08-22

### Added

- **Click-to-place clips.** Clicking an empty spot in a track lane in `Arrangement.jsx` now creates a clip snapped to the `BEAT_W` grid, via a new `useArrangement.js` hook that owns clip/track state (seeded from `studioData.js`'s static `TRACKS`, with stable per-clip `id`s replacing the old array-index keys).
- **Sample assignment.** Clicking an existing clip opens a dropdown (`sampleBanks.js`) to assign a sound from the `drums` bank. Selecting one updates the clip locally and sends `clip.add(...)` to the backend over the existing shell bridge, so the clip has something real registered to trigger later.
- **LIVE/IR toggle, actually wired.** The branch toggle in `ShellDock.jsx` previously only displayed the current branch — clicking it did nothing (`/shell/live/enter` and `/shell/live/exit` were never called). Added `enterLive()`/`exitLive()` to `shellBridge.js` (authenticated `fetch` to those routes, same token boundary as `sendCommand`), exposed them through `preload.cjs` and `useShellConnection.js`, and wired real `onClick` handlers with a `branchPending` guard against double-clicks mid-transition. The toggle does not optimistically flip state — it waits for the backend's `session_update` to confirm the switch actually landed.
- **Playback scheduler.** New `usePlaybackScheduler.js` hook watches `transport.playhead` and fires `clip.trigger(clipId)` the instant playhead crosses an assigned clip's `start` beat. Handles loop wrap-around (playhead resetting past `BARS`) and guards against firing on manual seeks/stops (a `stop()`-triggered jump back to `0` should not read as "swept across the whole timeline").

### Fixed

- `Arrangement.jsx` — `containerRef` was created but never attached to any element, so the `ResizeObserver` added in 0.3.1 was never actually observing anything; `containerWidth` was permanently stuck at `0`. Also fixed `width: "timelineWidth"` appearing as a literal string (not the computed variable) in three separate style blocks, and a `mindWidth` → `minWidth` typo. Together these three bugs are why the responsive-width work landed in 0.3.1 but was flagged there as "not yet verified end-to-end."
- Sample picker dropdown was rendering invisibly — it lived inside the clip `<div>`, which has `overflow: "hidden"` (to truncate long clip names), silently clipping the dropdown since it was positioned outside that box. Moved the picker to render as a sibling within the track lane instead.
- `useArrangement.js`'s `assignSample()` checked `window.audiomix?.sendCommand`, which doesn't exist — the real path is `window.audiomix.shell.sendCommand`, nested under `shell` alongside `enterLive`/`exitLive`. This meant every sample assignment silently updated local UI state but never actually reached the backend, for the entire time the feature existed until caught.

### Notes

- **Milestone:** closes the STUDIO MVP core loop end-to-end — place a clip, assign a sound, hit play, hear it. See the core engine repo's `CHANGELOG.md` `[v0.9-dev]` entry for the backend-side fixes (sampler bank boot loading, LED color bug, `clip_launcher.py` crash) this also depended on.
- Several of tonight's bugs were "invisible" failure modes rather than crashes — a wrong `window.audiomix` path, an `err.messge` typo swallowing real error text, a CSS clipping issue — each of which looked like "nothing happened" rather than throwing. Worth remembering for future debugging: silence is a symptom, not an absence of a bug.

---

## [0.4.0] — 2026-07-31

### Added

- `src/components/ShellDock.jsx` — the AS Shell panel, live for the first time. A collapsible dock anchored below the Arrangement and above the Transport row, matching the STUDIO mode mockup. Click the `SHELL` tab to expand/collapse.
  - Wired to `useShellConnection()` exclusively — no direct WebSocket or Node access from the renderer, consistent with the existing `contextIsolation`/`sandbox` model.
  - Owns its own local command log (array of `{ kind, time, text }` entries), since the hook only exposes the *latest* `lastOutput`/`session`, not history.
  - Appends a `cmd` entry on submit, and a `result`/`error` entry whenever lastOutput/lastError changes, via `useEffect`.
  - IR/LIVE branch pill reflects `session.audioscript_branch` live — confirmed updating in real time off a `session_update` push, with zero manual refresh, the first time the toggle flipped to LIVE mid-session during testing.
  - Connection status pill (`connected`/`disconnected`), reusing the existing am-pulse keyframe for the live-connection dot.
  - **Not yet wired:** clicking the branch toggle does not call `/shell/live/enter` or `/shell/live/exit` — it's currently a read-only reflection of session state, by design, deferred to a follow-up pass.
- `src/styles/tokens.css` — added `--dock-h` (260px) and `--dock-collapsed-h` (30px) to the existing Sizing block, alongside `--topbar-h`/`--statusbar-h`/`--transport-h`.
  - Added the full `.shell-dock` rule set, reusing `.am-panel-header`, `.am-panel-title`, and `.am-btn.primary` rather than introducing a parallel set of one-off styles — the dock now reads as native to the rest of the app instead of a bolted-on piece.
- `electron/preload.cjs` — restored the `shell` key on the `contextBridge exposeInMainWorld("audiomix", ...)` call (`sendCommand`, `isConnected`, `onMessage`, `onStatus`). This had been designed and discussed previously but never actually landed in the file on disk — `window.audiomix.shell` was undefined at runtime until this fix.

### Changed

- `src/App.jsx` — `Arrangement` is now wrapped in its own flex column alongside the new `ShellDock`, as a sibling to `Sidebar`, rather than `Arrangement` sitting directly in the main row. This keeps the dock spanning only the canvas width (matching the mockup) instead of stretching under the sidebar too. `minHeight: 0` on the new wrapper was required — without it the column refuses to shrink below content height once the dock takes up space below `Arrangement`.

### Fixed

- Preload script failing to load entirely — `Unable to load preload script: .../out/main/preload.cjs, ENOENT`. Two separate, stacked bugs:
  - `electron.vite.config.js`'s preload build had no explicit output format, so Vite defaulted to ESM (matching `package.json`'s `"type": "module"`) regardless of the `.cjs` source filename — producing `out/preload/preload.mjs` instead.
  - Sandboxed preload scripts (`sandbox: true` in `main.js`'s `webPreferences`) require CommonJS. Fixed with `formats: ["cjs"]` plus `fileName: () => "preload.cjs"` inside `lib` — note `rollupOptions.output.entryFileNames` does not work here; Vite's library mode overrides it internally. `fileName` inside `lib` is the correct lever.
  - `main.js` pointed at `path.join(__dirname, "preload.cjs")` — looking for the preload script in the same folder as itself (`out/main/`). Preload output actually lands in the sibling folder `out/preload/`. Fixed to `path.join(__dirname, "../preload/preload.cjs")`.
  - This preload failure was the root cause of a cascading `Cannot read properties of undefined (reading 'shell')` crash in `useShellConnection.js` — `window.audiomix` was simply never created, not a bug in the hook itself.
- `useShellConnection.js` — `ReferenceError: unsubStatus is not defined`. A transcription typo (`ubsubStatus`, transposed letters) meant the variable declared at the `onStatus()` subscription didn't match the name referenced two lines later in `unsubsRef.current = [...]`. One-character fix.
- Runtime readiness race condition (core repo, `api/bridge.py`, surfaced during Electron end-to-end testing) — `_wait_for_runtime_ready()`'s default 10s timeout was too short for full (non-safe) mode's real boot time, causing `enter_live_mode()` to report ready while `load_modules()` was still in progress. First command sent from the live UI timed out silently as a result. Raised to 60s at the `start()` call site.
  - Documented as a known tradeoff, not a permanent fix — the durable version is a `"__RUNTIME_READY__"` sentinel the runtime prints on genuine completion, with `_wait_for_runtime_ready()` waiting on that signal instead of racing a clock. Left as a follow-up, not urgent.

### Notes

- **🎉 Confirmed working end-to-end for the first time tonight:** typed command in the real `ShellDock` UI → `sendCommand()` → IPC → `shellBridge.js` → WebSocket → FastAPI `/shell/ws` → `bridge.send_command()` → `audioscript_runtime.py` subprocess → response → `shell_output` WSMessage → back through the same chain → rendered in the log. Also confirmed bidirectional: a `session_update` pushed from an out-of-band `curl` call updated the branch pill in the live UI with no page reload.
- Emoji glyphs from the runtime's `say()` output (e.g. 🎚️, 💡) don't currently render in the log — cosmetic only, not investigated tonight. Likely a font/encoding gap between the runtime's stdout and the log's rendering, not a data-loss issue.
- Branch toggle wiring (`/shell/live/enter` / `/shell/live/exit` from a real click, rather than only reflecting state) is the natural next step now that the read path is fully confirmed.

---

## [0.3.1] — 2026-06-20

### Added

- **`Arrangement.jsx`** — first real Studio mode component. Track headers,
  bar ruler, clip lanes, and live playhead, built from the static `TRACKS`
  data in `studioData.js`. Replaces the STUDIO mode placeholder canvas.
- **Tempo-accurate transport.** `useTransport`'s playhead and elapsed time
  now derive from actual BPM (`60 / bpm` seconds per beat) rather than a
  fixed arbitrary step — playback speed is now correct and responds to
  BPM changes, including for the full 16-bar loop duration.
- **Responsive timeline width.** Arrangement's ruler and clip lanes now
  measure available container width via `ResizeObserver` and fill it
  (`Math.max(BARS * BEAT_W, containerWidth)`), instead of stopping at a
  fixed pixel width and leaving dead space on larger windows.

### Changed

- Bumped default `BrowserWindow` size in `electron/main.js` from
  `1100x720` to `1600x900` — `win.maximize()` was not reliably honored
  by the WSL2/WSLg window manager, so a larger default compensates.
- Increased Arrangement track/lane row height from `36px` to `44px`
  (clips `28px` → `34px`) for better visual breathing room.
- `fmtTime()` now floors its input before formatting to guard against
  floating-point drift from accumulated `setInterval` ticks (e.g.
  `8.299999999999983` → `00:08:00`).

### Fixed

- Fixed `NaN` left-position CSS warning in `Arrangement.jsx` — traced
  to a `next => BARS ? 0 : next` arrow function shadowing the `next`
  variable inside `useTransport`'s `setPlayhead` updater, returning a
  function instead of a number.
- Fixed Arrangement timeline rendering at a fixed sub-window width
  inside a correctly-maximized Electron window — root cause was no
  mechanism stretching the canvas past `BARS * BEAT_W` content width.

### Notes

- `win.maximize()` not reliably firing on WSL2/WSLg is a known
  environment quirk, not addressed at the root — current workaround is
  a larger default window size. Worth revisiting if it affects other
  Linux environments.
- The empty-canvas-past-bar-16 behavior at wide window sizes is
  intentional (matches traditional DAW convention — fixed
  zoom level, not auto-stretching content). A future zoom control will
  let producers adjust `BEAT_W` to fill available space at their
  preferred bar density.

---

## [0.3.0] — 2026-05-29

### Changed

- **Major migration: Vite + React renderer.** Replaced vanilla HTML/JS renderer
  with a full React 18 + Vite 7 + electron-vite 5 architecture.
- Electron main process and preload bridge moved to `electron/` directory.
- `npm start` replaced by `npm run dev` as the primary development command.
- Node 22+ now required. Node 18 is no longer supported.

### Added

- **React component architecture.** UI split into focused, reusable components:
  - `TopBar.jsx` — logo, mode switcher, project name, Juniper2.0 status pill
  - `StatusBar.jsx` — engine health, project, mode, audio telemetry, CPU
  - `Transport.jsx` — play, stop, record, BPM, elapsed time, snap controls
  - `Sidebar.jsx` — browser, scenes, AudioScript branch switcher, HAL devices stub
- **Three-mode navigation.** STUDIO / LIVE / PERFORM mode switcher in TopBar,
  reflected in real time on StatusBar.
- **Live transport state.** `useTransport` hook manages play, pause, stop,
  record, BPM, snap, elapsed time, and playhead position.
- **Design token system.** All colors, typography, spacing, and animations
  defined as CSS custom properties in `src/styles/tokens.css`.
- **Static data layer.** `src/data/studioData.js` centralises placeholder data
  with clear TODO comments marking future engine integration points.
- **Design system directory.** `design/` added with five interactive wireframes,
  screenshots, and a full design README documenting AudioMIX's visual philosophy.
- **GNU GPL v3 license.** Repository relicensed from MIT to GPL v3 for
  consistency with the AudioMIX core engine.
- **`.gitignore`** updated for Vite build artifacts, electron-vite cache,
  and Node 22 environment.

### Design Wireframes Added

- `audiomix-wireframe.jsx` — LIVE mode v1 with AudioScript editor and Juniper2.0
- `audiomix-studio.jsx` — STUDIO mode v1 with timeline and mixer
- `audiomix-full-studio.jsx` — Full STUDIO layout with AS Shell, HAL devices, EQ
- `audiomix-visualization.jsx` — Linear ↔ Frequency view toggle with clash detection
- `audiomix-layers.jsx` — Layered clip system with drag and drop, blend ratios,
  combined frequency profiles, and AudioScript IR auto-generation

### Fixed

- Removed rogue `import { defaultClientConditions } from "vite"` in `TopBar.jsx`
  causing `__vite__injectQuery` HMR conflict.
- Corrected `fmtTime` variable reference error in `studioData.js`.
- Corrected `snapOptions.map` typo in `Transport.jsx`.
- Resolved `DocumentFragment.getElementById` error in `main.jsx`.
- Resolved electron-vite renderer entry point configuration across multiple
  Node and Vite version conflicts.

### Upcoming

- 🎛️ STUDIO mode center canvas — Arrangement, Mixer, AS Shell components
- 🎛️ Layered clip system as real React components
- ◈ Frequency view as real React component
- 💡 Live CPU and audio stats from `sys:get-stats` IPC handler
- 🌉 FastAPI bridge to AudioMIX core engine
- 🔌 WebSocket event stream for real-time engine state
- 🎹 Hardware Abstraction Layer — LED, MIDI, OSC device integration
- 🎤 Juniper2.0 chat wired to real inference engine
- 🖥️ PERFORM mode — full hardware control surface
- 📦 Cross-platform packaging — Windows, Linux, macOS

---

## [0.2.0] — 2025-11-06

### Added

- **Command Palette (UI):** Implemented top-anchored search bar with keyboard navigation (`Ctrl K`).
- **Keyboard Controls:** Added Enter to execute, ↑/↓ arrow navigation, and Esc/✕ to close.
- **Toast Feedback:** Quick inline status notifications for executed commands.
- **External Stylesheet:** Moved all inline `<style>` rules into `styles.css` for modular maintenance.

### Fixed

- Resolved palette “freeze” issue caused by un-cleaned listeners.
- Ensured palette closes cleanly via Esc, ✕, or after executing a command.

---

### Upcoming

- 🎛  Workspace & drag-and-drop file handling.
- 💡  Live system stats (CPU/memory) integration in status bar.
- 🌗  Theme toggle and user preferences.
- ⚙️  Audio analyzer + Python bridge.

---

## [0.1.0] — 2025-10-30

### Added

- Initial Electron setup (`main.js`, `preload.cjs`, `renderer.html`, `renderer.js`).
- Status bar with heartbeat ping to backend.
- Basic project structure and environment bootstrap.