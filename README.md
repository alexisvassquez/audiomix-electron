# AudioMIX Electron UI

## v0.1-dev — First Breath Edition

> _"A Creative Operating Layer — somewhere between operating system, software, and hardware."_

---

## Overview

**AudioMIX Electron** is the desktop UI shell for the [AudioMIX Core Engine](https://github.com/alexisvassquez/audiomix) — a modular, AI-assisted digital audio workstation and live performance platform built for independent producers, live coders, and electronic musicians.

AudioMIX is not a traditional DAW. It is a **Creative Operating Layer** — a unified environment where music production, live coding, AI collaboration, and hardware control coexist in a single coherent interface. The Electron shell is the visual surface of that layer.

---

## Architecture

AudioMIX Electron is built on a secure, modular Electron architecture with a React renderer powered by Vite.

```bash
audiomix-electron/
├── electron/
│   ├── main.js           # Main process — BrowserWindow lifecycle, IPC handlers
│   └── preload.cjs       # Secure IPC bridge — exposes limited API to renderer
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Root component — mode routing (STUDIO / LIVE / PERFORM)
│   ├── components/       # UI components per mode
│   │   ├── Studio/       # DAW layout — timeline, sequencer, mixer, IR editor
│   │   ├── Live/         # Live coding environment — AudioScript Live + Juniper2.0
│   │   └── Perform/      # Performance mode — hardware control, LED integration
│   ├── styles/           # Design tokens and global styles
│   └── hooks/            # IPC bridge hooks and shared state
├── index.html            # Vite renderer entry
├── electron.vite.config.js  # electron-vite build configuration
├── package.json
└── README.md
```

### Runtime Flow

```bash
Electron Main Process (main.js)
        │
        ├── IPC Handlers (ping, sys:get-stats, cmd:run, toggle-fullscreen)
        │
        └── BrowserWindow
                │
                ├── Preload Bridge (preload.cjs) — contextBridge → window.audiomix
                │
                └── Vite Dev Server / Built Renderer
                        │
                        └── React App (App.jsx)
                                │
                                ├── STUDIO mode
                                ├── LIVE mode
                                └── PERFORM mode
```

---

## The Three Modes

AudioMIX Electron is organized around three distinct operational modes, each optimized for a different creative context. The mode switcher lives in the top bar and is always accessible.

### STUDIO

The composition and production environment. Full DAW layout with timeline, arrangement view, sequencer, mixer strips, and the AudioScript IR editor. This is where you build the set — dense, powerful, and designed for focused creative work at a desk.

- Arrangement view with clip-based timeline
- Channel mixer with per-track metering, mute, and solo
- AudioScript IR editor (v1 stable) for compiled scene authoring
- DSP controls — gain, EQ, reverb, compression
- Juniper2.0 assistant panel for natural language production queries

### LIVE

The live coding environment. AudioScript Live editor front and center with real-time evaluation, console output, and inline AI assistance from Juniper2.0. Designed for on-stage performance where code is the instrument.

- AudioScript Live editor with syntax highlighting (EBNF v0.3)
- Real-time continuous evaluation — errors fail gracefully without killing audio
- Juniper2.0 inline suggestions — musically-aware, context-sensitive
- Console output with timestamped evaluation log
- Signal monitoring — waveform, output meters

### PERFORM

Full-screen performance mode. Minimal UI optimized for at-a-glance reading across a dark room. All non-essential panels collapse. Hardware integration surface lives here.

- Large BPM display and transport controls
- Active scene name and AudioScript Live evaluation status
- LED bridge status and zone control _(Hardware Abstraction Layer — planned)_
- MIDI and OSC output monitoring _(planned)_
- Juniper2.0 performance suggestions
- Waveform and audio telemetry

---

## Juniper2.0

**Juniper2.0** is AudioMIX's AI core — a musically-aware assistant built on PyTorch Lightning and integrated throughout all three modes. She is not a generic AI chatbot. Her context includes the current AudioScript scene, the active audio state, BPM, mood classification, and the full project structure.

In STUDIO mode, Juniper2.0 responds to natural language production queries ("make the drop harder", "tighten the snare transient") and translates them into AudioScript or DSP parameter changes.

In LIVE mode, she provides inline code suggestions as ghost text — aware of what is currently playing and what would be musically coherent next.

In PERFORM mode, she operates as a real-time collaborator — suggesting the next AudioScript phrase based on the energy trajectory of the live set.

_Juniper doesn't just automate — she collaborates._

---

## Hardware Integration

AudioMIX is designed for physical hardware integration as a core feature, not an afterthought. The PERFORM mode surface includes LED bridge control, MIDI output, and OSC routing.

**Hardware Abstraction Layer (HAL)** — currently in the development queue. The HAL will provide a unified interface for:

- LED arrays and DMX lighting rigs
- MIDI controllers and output devices
- OSC-compatible hardware and software targets
- GPIO / microcontroller integration (Raspberry Pi, Arduino)

Hardware status indicators are visible in the statusbar across all three modes.

---

## Technical Stack

| Layer | Technology | Purpose |
| :---- | :--------- | :------ |
| Desktop Runtime | Electron v39 | Cross-platform shell |
| Build Tool | Vite 7 + electron-vite | Fast HMR, renderer/main split |
| UI Framework | React 19 | Component-based renderer |
| IPC Bridge | Electron contextBridge | Secure main ↔ renderer communication |
| AI Core | Juniper2.0 (PyTorch Lightning) | Musically-aware AI assistant |
| Audio Engine | C++ / PortAudio | Real-time DSP processing |
| Scripting Language | AudioScript (custom DSL) | Live coding and IR compilation |
| Backend Interface | FastAPI / WebSocket (planned) | Live event sync with core engine |

---

## Quick Start

Clone and run locally:

```bash
git clone https://github.com/alexisvassquez/audiomix-electron.git
cd audiomix-electron
npm install
npm run dev
```

Electron will launch with the React renderer served via Vite's dev
server with full hot module replacement.

> **Requirements:** Node 22+ is required. Node 18 is not supported.

### Available Scripts

| Command | Description |
| :------ | :---------- |
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Integration Roadmap

| Phase | Milestone | Status |
| :---- | :-------- | :----- |
| 1 | Electron shell — First Breath | ✅ Done |
| 2 | Vite + React renderer migration | ✅ Done |
| 3 | STUDIO mode UI — timeline, mixer, IR editor | 🔄 In progress |
| 4 | LIVE mode UI — AudioScript Live editor + Juniper2.0 | 🔄 In progress |
| 5 | FastAPI / WebSocket bridge to AudioMIX core | 🧠 Planned |
| 6 | Hardware Abstraction Layer — LED, MIDI, OSC | 🧠 Planned |
| 7 | PERFORM mode — full hardware control surface | 🧩 Future |
| 8 | Cross-platform packaging — Windows, Linux, macOS | 🌐 Future |

---

## Security

AudioMIX Electron enforces a strict security model throughout:

- `contextIsolation: true` and `sandbox: true` on all renderer windows
- `nodeIntegration: false` — no Node.js APIs exposed to the renderer
- All privileged operations route through the preload bridge via `contextBridge`
- Strict `Content-Security-Policy` on the renderer HTML

---

## Design Principles

AudioMIX treats music creation as computation — blending art and logic into a live, reactive medium. The UI reflects this philosophy.

**Low floor, high ceiling** — approachable enough for a bedroom producer opening a DAW for the first time, deep enough for a professional producer and/or live coder performing on stage.

**Mode-driven layout** — information density is context-dependent. STUDIO is dense by design. PERFORM strips everything non-essential. The UI serves the moment, not the other way around.

**Modularity first** — every subsystem (DSP, LED, Mixer, AI, AudioScript) functions independently and composes cleanly.

**Reactive by default** — the renderer subscribes to live event streams from the audio engine. Tempo, mood, energy, and hardware state flow into the UI in real time.

---

## Related Repositories

| Repository | Purpose |
| :--------- | :------ |
| [`AudioMIX Core`](https://github.com/alexisvassquez/audiomix) | DSP engine, AI layer, AudioScript compiler, live performance engine |
| [`AudioMIX Electron`](https://github.com/alexisvassquez/audiomix-electron) | This repository — desktop UI shell |

---

## Contributing

AudioMIX is open source under the GNU General Public License v3. Contributions are welcome — especially in the following areas:

- AudioScript syntax highlighting (nano, VS Code, Vim)
- Hardware integration modules (LED, MIDI, OSC, DMX)
- PERFORM mode UI design
- AudioScript Live parser and evaluator
- Juniper2.0 training data and fine-tuning

If you are a live coder, electronic musician, lighting designer, or hardware hacker — this project was built with you in mind.

---

## Author

**© Alexis M. Vasquez**
Software Engineer — [AMV Digital Studios](https://alexismvasquez.com)

> "Create change through code."

---

## License

GNU General Public License v3.0 — see [LICENSE](./LICENSE) for full terms.

This means you are free to use, modify, and distribute AudioMIX Electron. Any derivative work must also be open source under the same license. Commercial use is permitted with license compliance maintained.
