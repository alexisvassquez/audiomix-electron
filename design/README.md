# 🎧 AudioMIX Design System

This directory contains the living design artifacts for **AudioMIX Electron** —
the desktop UI shell for the AudioMIX Creative Operating Layer.

These are not static mockups. The wireframes in this directory are fully
interactive React components that can be run and explored directly.

---

## Design Philosophy

AudioMIX sits at the intersection of three tools that have never been
unified in a single environment:

- **VS Code** — the structural grammar. Panels, editor, terminal, command palette.
- **Ableton** — the audio-specific zones. Timeline, mixer, transport, clip logic.
- **SuperCollider** — the philosophy. Code is a first-class musical artifact.

The result is a **Creative Operating Layer** — not just a DAW, not just an IDE,
but a unified environment where music production, live coding, AI collaboration,
and hardware control coexist.

### Core Design Principles

**Low floor, high ceiling**
Approachable enough for a bedroom producer opening a DAW for the first time.
Deep enough for a professional live coder performing on stage.

**Mode-driven layout**
Information density is context-dependent. The UI serves the moment.

- STUDIO — dense, compositional, full DAW surface
- LIVE — focused, expressive, code-first
- PERFORM — minimal, immediate, hardware-integrated

**Modularity first**
Every panel, every component, every subsystem functions independently
and composes cleanly. No monolithic surfaces.

**Reactive by default**
The renderer subscribes to live event streams from the audio engine.
Tempo, mood, energy, and hardware state flow into the UI in real time.

---

## Wireframes

All wireframes are interactive React components. To run them, paste the
contents into a React sandbox such as [react.new](https://react.new) or
the Claude artifact renderer.

| File | Description | Key Features |
| :--- | :---------- | :----------- |
| `audiomix-wireframe.jsx` | LIVE mode — v1 | AudioScript editor, console, Juniper2.0 inline suggestions, LED strip |
| `audiomix-studio.jsx` | STUDIO mode — v1 | Timeline, mixer, right panel inspector |
| `audiomix-full-studio.jsx` | STUDIO mode — full layout | AS Shell at bottom, HAL devices in sidebar, EQ panel |
| `audiomix-visualization.jsx` | Visualization toggle | Linear ↔ Frequency view, clash detection |
| `audiomix-layers.jsx` | Layered clip system | Drag and drop layering, blend ratios, frequency profiles, AudioScript IR auto-generation |

---

## Screenshots

Static screenshots of each wireframe and the working Electron canvas
are in `screenshots/`. These are used as:

- Reference images for Figma component work
- README assets for the main repository
- Documentation for contributors

---

## The Three Modes

### STUDIO

The composition and production environment. Full DAW layout with:

- Arrangement view — linear timeline and frequency spectrogram toggle
- Layered clip system — clips as containers with blendable internal layers
- Channel mixer with per-track metering, mute, and solo
- AudioScript IR editor — compiled scene authoring
- HAL Devices panel — connected hardware at a glance
- AudioScript Shell — terminal at the bottom, wired to the runtime
- Right panel — waveform, EQ curve, DSP knobs, Juniper2.0 chat

### LIVE

The live coding environment. AudioScript Live editor front and center with:

- Real-time continuous evaluation
- Juniper2.0 inline ghost suggestions
- Graceful error recovery — bad expressions don't kill the audio stream
- Console output with timestamped evaluation log
- Signal monitoring — waveform, output meters

### PERFORM

Full-screen performance mode. Minimal UI, maximum at-a-glance clarity:

- Large BPM display and transport
- Active scene name and evaluation status
- LED bridge status and zone control *(HAL — planned)*
- MIDI and OSC output monitoring *(planned)*
- Juniper2.0 performance suggestions

---

## The Visualization System

One of AudioMIX's most distinctive features is the dual arrangement view.

### Linear View

The familiar DAW timeline — clips as colored blocks on horizontal track
lanes, playhead moving left to right. The anchor for producers who know
existing tools. Clips show internal layer stacks visually.

### Frequency View

A spectrogram-style arrangement where the vertical axis represents
frequency range and color intensity represents energy. Producers see
their mix in frequency space rather than just time space.

**Why this matters:**

- See frequency clashes before you hear them
- Understand how layered clips combine in the frequency domain
- Juniper2.0 detects clashes automatically and suggests fixes
- A bedroom producer can understand their mix visually without
  needing years of ear training

The toggle between views is a single click. No data lost, no
commitment. Familiar when you need it, powerful when you're ready.

---

## The Layering System

Clips in AudioMIX are not flat blocks — they are containers.

Each clip can hold multiple audio layers that blend together to
form the final sound. Layers have individual gain controls and
frequency profiles. The combined frequency profile of a layered
clip is computed in real time and reflected in the frequency view.

**The workflow:**

1. Drag a clip onto another clip to layer them
2. Adjust blend ratios in the layer inspector
3. Watch the combined frequency profile update
4. Juniper2.0 analyses the blend and suggests improvements
5. The AudioScript IR for the layered clip is generated automatically

This means a producer who has never written code can create complex
layered textures visually — and the AudioScript writes itself underneath.

---

## Design Tokens

All design tokens are defined in `src/styles/tokens.css` in the main
repository. The canonical values:

| Token | Value | Usage |
| :---- | :---- | :---- |
| `--accent` | `#00ff9f` | Primary accent — AudioMIX green |
| `--juniper` | `#7c6af7` | Juniper2.0 purple |
| `--bg` | `#080808` | Base background |
| `--surface` | `#0f0f0f` | Panel surfaces |
| `--surface-alt` | `#131313` | Alternate surfaces, headers |
| `--border` | `#1c1c1c` | Borders and dividers |
| `--text` | `#d8d8d8` | Primary text |
| `--text-dim` | `#555555` | Secondary text |
| `--warn` | `#ffaa00` | Warning states |
| `--err` | `#ff4455` | Error and clash detection |
| `--font-mono` | `JetBrains Mono` | Primary typeface |
| `--font-display` | `Syne` | Logo and display text |

---

## Juniper2.0

Juniper2.0 appears throughout the UI in three distinct modes:

**In STUDIO** — a chat panel in the right inspector. Responds to
natural language production queries and analyses selected clips.

**In LIVE** — inline ghost text suggestions as the performer codes.
Musically aware, context-sensitive, gracefully unobtrusive.

**In PERFORM** — real-time suggestions based on the energy trajectory
of the live set. A collaborator, not an autocomplete.

*Juniper doesn't just automate — she collaborates.*

---

## Figma

A Figma design file is in progress, structured as follows:

- **Page 1 — Foundations** — color tokens, typography, spacing
- **Page 2 — Components** — all reusable UI components
- **Page 3 — Studio Mode** — full layout, linear and frequency views
- **Page 4 — Live Mode** — AudioScript editor and console
- **Page 5 — Perform Mode** — hardware control surface
- **Page 6 — Interactions** — drag and drop, view toggle, clash detection flows
- **Page 7 — Mobile / Responsive** — future HAL companion app

---

## Contributing to the Design

If you are a designer, live coder, electronic musician, lighting
designer, or hardware hacker who wants to contribute to AudioMIX's
visual direction — the design tokens and wireframes in this directory
are your starting point.

The one rule: **low floor, high ceiling.** Every design decision
should serve both the bedroom producer and the Deadmau5.

---

*AudioMIX Design System*

*© Alexis M. Vasquez / AMV Digital Studios 2026*
*GNU General Public License v3.0*
