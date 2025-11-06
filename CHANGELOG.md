### AudioMIX Electron UI CHANGELOG
---

## [0.1.0] — 2025-10-30
### Added
- Initial Electron setup (`main.js`, `preload.cjs`, `renderer.html`, `renderer.js`).
- Status bar with heartbeat ping to backend.
- Basic project structure and environment bootstrap.

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
