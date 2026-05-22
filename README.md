
# 🎧 AudioMIX Electron UI

## First Breath Edition — v0.1-dev

> _“A modular, intelligent interface for the future of music creation.”_

---

## 🎛️  Overview

**AudioMIX-Electron** is the desktop front end for the [AudioMIX Core Engine](https://github.com/alexisvassquez/ai_spotibot_player) ecosystem — a modular, AI-assisted digital-audio workstation built for producers, performers, and developers who think in both code and sound.

It provides a cross-platform shell for visualization, performance control, and real-time interaction between the user and AudioMIX’s AI/ML-driven backend (`ai_spotibot_player/`).
It’s designed with security, modularity, and extensibility in mind.

---

## Project Structure

```audiomix-electron/
├── src/
│   ├── main.js           # Electron main process: creates BrowserWindow, manages lifecycle
│   ├── preload.cjs       # Secure IPC bridge: exposes limited API surface to renderer
│   ├── renderer.html     # Renderer: dark-mode UI shell and layout root
│   └── renderer.js       # Frontend controller logic (status bar, heartbeat, events)
├── package.json          # Project manifest and scripts
└── README.md             # Documentation and setup guide
```

---

### Runtime Flow

1. **Electron Main Process** (`main.js`) initializes a sandboxed `BrowserWindow`.

2. The **Renderer** (`renderer.html`) provides the minimal UI surface.

3. Future versions will load the backend via:

- IPC bridge → Preload layer → `FastAPI` service
- or local WebSocket channel for real-time sync
---

## ⚙️  Quick Start

Clone and run locally:

```bash
git clone git@github.com:alexisvassquez/audiomix-electron.git
cd audiomix-electron
npm install
npm start
```

Electron will launch a 1100x720 dark window title **“🎧 AudioMIX’s First Breath.”**

---

## 🛠️  Technical Stack

| Layer                    | Technology                | Purpose                         |
| ------------------------ | ------------------------- | ------------------------------- |
| **UI Shell**             | Electron v39              | Cross-platform desktop runtime  |
| **Renderer**             | HTML5 + CSS3              | Minimal static interface        |
| **Backend Interface**    | Node IPC / Preload bridge | Secure communication layer      |
| **API Gateway (future)** | FastAPI + WebSocket       | Live control, audio/midi events |
| **Language Stack**       | JS (ESM), Python, C++     | Hybrid performance architecture |

---

## Integration Roadmap

| Phase | Milestone                                     | Status         |
| :---- | :-------------------------------------------- | :------------- |
| **1** | Minimal Electron UI (“First Breath”)          | ✅ Done         |
| **2** | Preload bridge for backend communication      | 🔄 In progress |
| **3** | Live link with AudioMIX backend (FastAPI/IPC) | 🧠 Planned     |
| **4** | Interactive mixer, LED zones, and EQ panels   | 🧩 Future      |
| **5** | Packaging for cross-platform release          | 🌐 Future      |

---

## 🛡️  Security Config

**AudioMIX-Electron** enforces:

- `contextIsolation` and `sandbox` for the renderer
- a strict `Content-Security-Policy`
- no `nodeIntegration` in the UI layer

Sensitive logic lives in the backend or preload bridge only.

---

## 💡 Philosophy & Design Principles

**AudioMIX** treats *music creation as computation* — blending art and logic into a live, reactive medium.
This UI layer will be meant to *visualize emotion as data*, turning beats, lights, and reactions into a single ecosystem.

- **Modularity First** – Every subsystem (EQ, LED, Mixer, AI Engine) functions independently.
- **Secure by Default** – No privileged APIs exposed to the renderer.
- **Reactive Architecture** – Future renderer will subscribe to live event streams (tempo, mood, energy).
- **Cross-Language Harmony** – 
C++ for DSP, Python for AI, JS for orchestration.

---

## 👩‍💻  Developer Notes

- Built with **Electron v39** + **Node 22** + **Chromium 128**
- Works beautifully in **Crostini / Debian Linux** 
- License: GNU v3

---

## 🖋️  Author

**Alexis M. Vasquez**
Software Engineer — [AMV Digital Studios](https://alexismvasquez.com)

> “Create change through code.”
