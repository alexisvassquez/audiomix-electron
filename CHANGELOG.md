
# 🎧 AudioMIX Electron UI

## 📦 CHANGELOG

All notable changes to the AudioMIX Electron UI will be documented in this file.

The AudioMIX core engine has its own separate changelog in the [AudioMIX Core repository](https://github.com/alexisvassquez/ai_spotibot_player)

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