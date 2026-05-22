import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceAlt: "#141414",
  border: "#1e1e1e",
  borderBright: "#2a2a2a",
  accent: "#00ff9f",
  accentDim: "#00ff9f22",
  accentMid: "#00ff9f66",
  warn: "#ffaa00",
  err: "#ff4455",
  text: "#e0e0e0",
  textDim: "#666",
  textMuted: "#333",
  juniper: "#7c6af7",
  juniperDim: "#7c6af722",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;1,300&family=Syne:wght@400;600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'JetBrains Mono', monospace; }

  .audiomix-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: ${COLORS.bg};
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  /* TOP BAR */
  .topbar {
    height: 38px;
    background: ${COLORS.surface};
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 12px;
    flex-shrink: 0;
    z-index: 100;
  }
  .topbar-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 13px;
    color: ${COLORS.accent};
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .topbar-logo-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${COLORS.accent};
    box-shadow: 0 0 8px ${COLORS.accent};
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px ${COLORS.accent}; }
    50% { opacity: 0.4; box-shadow: 0 0 2px ${COLORS.accent}; }
  }
  .topbar-divider {
    width: 1px; height: 18px;
    background: ${COLORS.border};
  }
  .topbar-cmd {
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 3px 8px;
    color: ${COLORS.textDim};
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: border-color 0.15s;
  }
  .topbar-cmd:hover { border-color: ${COLORS.borderBright}; color: ${COLORS.text}; }
  .topbar-cmd kbd {
    background: ${COLORS.border};
    border-radius: 2px;
    padding: 1px 4px;
    font-size: 10px;
    color: ${COLORS.textDim};
  }
  .topbar-spacer { flex: 1; }
  .topbar-mode {
    display: flex;
    gap: 2px;
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 2px;
  }
  .mode-btn {
    padding: 3px 10px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: ${COLORS.textDim};
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }
  .mode-btn.active {
    background: ${COLORS.accentDim};
    color: ${COLORS.accent};
    border: 1px solid ${COLORS.accentMid};
  }
  .mode-btn:hover:not(.active) { color: ${COLORS.text}; }

  /* MAIN LAYOUT */
  .main-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: 200px;
    background: ${COLORS.surface};
    border-right: 1px solid ${COLORS.border};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }
  .sidebar-section {
    border-bottom: 1px solid ${COLORS.border};
    padding: 8px 0;
  }
  .sidebar-label {
    padding: 4px 12px;
    font-size: 9px;
    letter-spacing: 0.15em;
    color: ${COLORS.textMuted};
    text-transform: uppercase;
    font-weight: 600;
  }
  .sidebar-item {
    padding: 5px 12px;
    color: ${COLORS.textDim};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.1s;
    font-size: 11px;
  }
  .sidebar-item:hover { background: ${COLORS.surfaceAlt}; color: ${COLORS.text}; }
  .sidebar-item.active { color: ${COLORS.accent}; background: ${COLORS.accentDim}; }
  .sidebar-item-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* CENTER AREA */
  .center-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* EDITOR PANEL */
  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-bottom: 1px solid ${COLORS.border};
    min-height: 0;
  }
  .panel-header {
    height: 32px;
    background: ${COLORS.surfaceAlt};
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    flex-shrink: 0;
  }
  .panel-title {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: ${COLORS.textDim};
    text-transform: uppercase;
  }
  .panel-badge {
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 10px;
    letter-spacing: 0.05em;
  }
  .badge-live {
    background: ${COLORS.accentDim};
    color: ${COLORS.accent};
    border: 1px solid ${COLORS.accentMid};
  }
  .badge-ir {
    background: #1a1a2e;
    color: #6699ff;
    border: 1px solid #334499;
  }
  .panel-header-spacer { flex: 1; }
  .panel-action {
    font-size: 10px;
    color: ${COLORS.textDim};
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid transparent;
    transition: all 0.1s;
    background: none;
    font-family: 'JetBrains Mono', monospace;
  }
  .panel-action:hover { border-color: ${COLORS.border}; color: ${COLORS.text}; }
  .panel-action.run {
    color: ${COLORS.accent};
    border-color: ${COLORS.accentMid};
    background: ${COLORS.accentDim};
  }
  .panel-action.run:hover { background: #00ff9f33; }

  .editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .line-numbers {
    width: 40px;
    background: ${COLORS.surface};
    padding: 12px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-right: 8px;
    gap: 2px;
    flex-shrink: 0;
    border-right: 1px solid ${COLORS.border};
    overflow: hidden;
  }
  .line-num {
    font-size: 11px;
    color: ${COLORS.textMuted};
    line-height: 20px;
    user-select: none;
  }
  .line-num.active { color: ${COLORS.textDim}; }

  .code-area {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
    position: relative;
  }
  .code-line {
    line-height: 20px;
    font-size: 12px;
    white-space: pre;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .code-line.highlighted { background: #ffffff08; border-radius: 2px; }
  .tok-keyword { color: #ff79c6; }
  .tok-fn { color: #50fa7b; }
  .tok-num { color: #bd93f9; }
  .tok-str { color: #f1fa8c; }
  .tok-comment { color: #555; font-style: italic; }
  .tok-type { color: #8be9fd; }
  .tok-var { color: ${COLORS.text}; }
  .tok-op { color: #ff79c6; }
  .tok-punct { color: ${COLORS.textDim}; }

  /* Juniper suggestion */
  .juniper-suggestion {
    display: inline;
    color: ${COLORS.juniper};
    opacity: 0.6;
    font-style: italic;
  }
  .juniper-hint {
    margin-left: 8px;
    font-size: 10px;
    color: ${COLORS.juniper};
    opacity: 0.5;
    background: ${COLORS.juniperDim};
    padding: 1px 6px;
    border-radius: 3px;
    border: 1px solid #7c6af733;
    cursor: pointer;
  }
  .juniper-hint:hover { opacity: 0.9; }

  /* CONSOLE / OUTPUT */
  .console-panel {
    height: 160px;
    background: ${COLORS.surface};
    border-top: 1px solid ${COLORS.border};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .console-body {
    flex: 1;
    padding: 8px 12px;
    overflow-y: auto;
    font-size: 11px;
    line-height: 18px;
  }
  .console-line { display: flex; gap: 8px; }
  .console-time { color: ${COLORS.textMuted}; flex-shrink: 0; }
  .console-ok { color: ${COLORS.accent}; }
  .console-info { color: ${COLORS.textDim}; }
  .console-warn { color: ${COLORS.warn}; }
  .console-juniper { color: ${COLORS.juniper}; }
  .console-cursor {
    display: inline-block;
    width: 7px; height: 13px;
    background: ${COLORS.accent};
    animation: blink 1s step-end infinite;
    vertical-align: middle;
    margin-left: 2px;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  /* RIGHT PANEL */
  .right-panel {
    width: 220px;
    background: ${COLORS.surface};
    border-left: 1px solid ${COLORS.border};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }
  .right-section {
    border-bottom: 1px solid ${COLORS.border};
    padding: 10px 12px;
  }
  .right-section-title {
    font-size: 9px;
    letter-spacing: 0.15em;
    color: ${COLORS.textMuted};
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  /* Waveform */
  .waveform-canvas {
    width: 100%;
    height: 48px;
    display: block;
  }

  /* Meters */
  .meters {
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 48px;
  }
  .meter-bar-wrap {
    flex: 1;
    height: 100%;
    background: ${COLORS.surfaceAlt};
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .meter-bar {
    width: 100%;
    border-radius: 2px;
    transition: height 0.08s ease;
  }

  /* Knobs */
  .knobs-row {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }
  .knob-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .knob {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #2a2a2a, #111);
    border: 1.5px solid ${COLORS.borderBright};
    position: relative;
    transition: border-color 0.15s;
  }
  .knob:hover { border-color: ${COLORS.accent}; }
  .knob-indicator {
    position: absolute;
    width: 2px; height: 10px;
    background: ${COLORS.accent};
    border-radius: 1px;
    left: 50%; top: 4px;
    transform-origin: bottom center;
    box-shadow: 0 0 4px ${COLORS.accent};
  }
  .knob-label {
    font-size: 9px;
    color: ${COLORS.textMuted};
    letter-spacing: 0.05em;
    text-align: center;
  }
  .knob-val {
    font-size: 9px;
    color: ${COLORS.textDim};
  }

  /* Hardware / LED */
  .hw-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .hw-item {
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 10px;
  }
  .hw-item-name { color: ${COLORS.textDim}; margin-bottom: 2px; }
  .hw-item-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
  }
  .hw-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
  }
  .hw-dot.connected { background: ${COLORS.accent}; box-shadow: 0 0 4px ${COLORS.accent}; }
  .hw-dot.disconnected { background: ${COLORS.textMuted}; }
  .hw-dot.active {
    background: #ff6ac1;
    box-shadow: 0 0 6px #ff6ac1;
    animation: pulse 0.5s ease-in-out infinite;
  }

  /* LED strip preview */
  .led-strip {
    display: flex;
    gap: 2px;
    margin-top: 6px;
  }
  .led {
    flex: 1;
    height: 6px;
    border-radius: 1px;
    transition: all 0.1s;
  }

  /* TRANSPORT BAR */
  .transport-bar {
    height: 44px;
    background: ${COLORS.surface};
    border-top: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
  }
  .transport-btn {
    width: 28px; height: 28px;
    border-radius: 4px;
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${COLORS.textDim};
    font-size: 10px;
    transition: all 0.1s;
  }
  .transport-btn:hover { border-color: ${COLORS.borderBright}; color: ${COLORS.text}; }
  .transport-btn.active {
    background: ${COLORS.accentDim};
    border-color: ${COLORS.accentMid};
    color: ${COLORS.accent};
  }
  .transport-bpm {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }
  .bpm-label { color: ${COLORS.textMuted}; font-size: 9px; letter-spacing: 0.1em; }
  .bpm-val {
    color: ${COLORS.text};
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.02em;
    cursor: pointer;
  }
  .bpm-val:hover { color: ${COLORS.accent}; }
  .transport-time {
    font-size: 13px;
    color: ${COLORS.textDim};
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
  }
  .transport-spacer { flex: 1; }
  .transport-engine {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: ${COLORS.textDim};
  }
  .engine-status {
    width: 6px; height: 6px;
    border-radius: 50%;
  }
  .engine-on { background: ${COLORS.accent}; box-shadow: 0 0 6px ${COLORS.accent}; animation: pulse 2s infinite; }
  .engine-off { background: ${COLORS.textMuted}; }

  /* STATUSBAR */
  .statusbar {
    height: 24px;
    background: #0d0d0d;
    border-top: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 0;
    flex-shrink: 0;
    font-size: 10px;
  }
  .sb-item {
    padding: 0 10px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 5px;
    color: ${COLORS.textDim};
    border-right: 1px solid ${COLORS.border};
    cursor: default;
  }
  .sb-item:hover { background: ${COLORS.surfaceAlt}; }
  .sb-dot { width: 5px; height: 5px; border-radius: 50%; }
  .sb-ok { background: ${COLORS.accent}; box-shadow: 0 0 4px ${COLORS.accent}; }
  .sb-spacer { flex: 1; }

  /* SCROLLBARS */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderBright}; }

  /* LABEL ZONE TAG */
  .zone-tag {
    position: absolute;
    top: 6px; right: 8px;
    font-size: 9px;
    color: ${COLORS.textMuted};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    pointer-events: none;
    opacity: 0.5;
  }
`;

// Fake AudioScript Live code
const CODE_LINES = [
  { tokens: [{ t: "comment", v: "// AudioScript Live — set: BRAT_NIGHT_01" }] },
  { tokens: [] },
  { tokens: [{ t: "keyword", v: "scene" }, { t: "punct", v: " " }, { t: "fn", v: "drop_sequence" }, { t: "punct", v: " {" }] },
  { tokens: [{ t: "punct", v: "  " }, { t: "type", v: "bpm" }, { t: "op", v: " = " }, { t: "num", v: "138" }, { t: "punct", v: ";" }] },
  { tokens: [{ t: "punct", v: "  " }, { t: "type", v: "key" }, { t: "op", v: " = " }, { t: "str", v: '"Cm"' }, { t: "punct", v: ";" }] },
  { tokens: [{ t: "punct", v: "  " }, { t: "fn", v: "layer" }, { t: "punct", v: "(" }, { t: "str", v: '"bass_stab"' }, { t: "punct", v: ", " }, { t: "num", v: "0.8" }, { t: "punct", v: ");" }] },
  { tokens: [{ t: "punct", v: "  " }, { t: "fn", v: "layer" }, { t: "punct", v: "(" }, { t: "str", v: '"lead_synth"' }, { t: "punct", v: ", " }, { t: "num", v: "0.6" }, { t: "punct", v: ");" }] },
  { tokens: [{ t: "punct", v: "  " }, { t: "keyword", v: "on" }, { t: "punct", v: " " }, { t: "fn", v: "beat" }, { t: "punct", v: "(" }, { t: "num", v: "4" }, { t: "punct", v: ") {" }] },
  { tokens: [{ t: "punct", v: "    " }, { t: "fn", v: "led.pulse" }, { t: "punct", v: "(" }, { t: "str", v: '"strobe"' }, { t: "punct", v: ", " }, { t: "type", v: "intensity" }, { t: "op", v: ":" }, { t: "num", v: " 1.0" }, { t: "punct", v: ");" }] },
  { tokens: [{ t: "punct", v: "    " }, { t: "fn", v: "fx.add" }, { t: "punct", v: "(" }, { t: "str", v: '"reverb"' }, { t: "punct", v: ", " }, { t: "num", v: "0.4" }, { t: "punct", v: ");" }] },
  { tokens: [{ t: "punct", v: "  }" }], highlighted: true },
  { tokens: [{ t: "punct", v: "  " }, { t: "comment", v: "// Juniper2.0 →" }], juniper: "  filter.set(\"highpass\", cutoff: 800);" },
  { tokens: [{ t: "punct", v: "}" }] },
];

const CONSOLE_LINES = [
  { type: "info", time: "00:00:01", msg: "AudioMIX engine initialised — 48kHz • 256 frames • 12.0ms" },
  { type: "ok", time: "00:00:01", msg: "AudioScript Live parser ready — EBNF v0.3" },
  { type: "juniper", time: "00:00:02", msg: "Juniper2.0 context loaded — codebase index complete" },
  { type: "ok", time: "00:00:04", msg: "scene drop_sequence compiled — 0 errors" },
  { type: "ok", time: "00:00:04", msg: "LED bridge connected — 3 devices online" },
  { type: "warn", time: "00:00:05", msg: "layer 'lead_synth' amplitude clipping — reduce gain" },
  { type: "juniper", time: "00:00:06", msg: "Juniper2.0: consider filter.set(\"highpass\") to resolve clipping" },
];

function WaveformCanvas({ active }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    let frame;
    let phase = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      const mid = h / 2;
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const amp = active ? (0.3 + 0.2 * Math.sin(t * 12 + phase * 0.7)) : 0.05;
        const y = mid + Math.sin(t * 40 + phase) * amp * mid
                      + Math.sin(t * 17 + phase * 1.3) * amp * 0.4 * mid;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = active ? COLORS.accent : COLORS.borderBright;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = active ? COLORS.accent : "transparent";
      ctx.shadowBlur = active ? 4 : 0;
      ctx.stroke();
      phase += active ? 0.08 : 0.01;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return <canvas ref={ref} className="waveform-canvas" width={196} height={48} />;
}

function Meters({ active }) {
  const [levels, setLevels] = useState(Array(12).fill(0));
  useEffect(() => {
    if (!active) { setLevels(Array(12).fill(0)); return; }
    const id = setInterval(() => {
      setLevels(prev => prev.map((_, i) => {
        const base = i < 2 ? 0.7 : i < 6 ? 0.5 : 0.3;
        return Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.4));
      }));
    }, 80);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="meters">
      {levels.map((l, i) => {
        const color = l > 0.85 ? COLORS.err : l > 0.7 ? COLORS.warn : COLORS.accent;
        return (
          <div key={i} className="meter-bar-wrap">
            <div className="meter-bar" style={{ height: `${l * 100}%`, background: color, opacity: 0.8 }} />
          </div>
        );
      })}
    </div>
  );
}

function Knob({ label, value, angle }) {
  return (
    <div className="knob-wrap">
      <div className="knob">
        <div className="knob-indicator" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
      </div>
      <div className="knob-label">{label}</div>
      <div className="knob-val">{value}</div>
    </div>
  );
}

function LEDStrip({ active }) {
  const [leds, setLeds] = useState(Array(16).fill("#111"));
  useEffect(() => {
    if (!active) { setLeds(Array(16).fill("#1a1a1a")); return; }
    const PALETTE = ["#00ff9f", "#ff6ac1", "#7c6af7", "#ffaa00", "#00cfff"];
    const id = setInterval(() => {
      setLeds(prev => prev.map((_, i) => {
        if (Math.random() > 0.7) return PALETTE[Math.floor(Math.random() * PALETTE.length)];
        return prev[i];
      }));
    }, 120);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className="led-strip">
      {leds.map((color, i) => (
        <div key={i} className="led" style={{
          background: color,
          boxShadow: active ? `0 0 4px ${color}` : "none",
          opacity: active ? 1 : 0.2,
        }} />
      ))}
    </div>
  );
}

export default function AudioMIX() {
  const [mode, setMode] = useState("LIVE");
  const [engineOn, setEngineOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [branch, setBranch] = useState("live");

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}:00`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="audiomix-root">

        {/* TOP BAR */}
        <div className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-dot" />
            AUDIOMIX
          </div>
          <div className="topbar-divider" />
          <div className="topbar-cmd">
            <span>Search commands</span>
            <kbd>Ctrl+K</kbd>
          </div>
          <div className="topbar-spacer" />
          <div className="topbar-mode">
            {["STUDIO", "LIVE", "PERFORM"].map(m => (
              <button key={m} className={`mode-btn ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="main-layout">

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Project</div>
              <div className="sidebar-item active"><div className="sidebar-item-dot" />BRAT_NIGHT_01</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />scenes/</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />samples/</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />patches/</div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">AudioScript</div>
              <div className="sidebar-item active"><div className="sidebar-item-dot" />drop_sequence.asl</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />intro.asl</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />outro.asl</div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Juniper2.0</div>
              <div className="sidebar-item" style={{ color: COLORS.juniper }}>
                <div className="sidebar-item-dot" style={{ background: COLORS.juniper }} />
                Context: drop_sequence
              </div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />Suggestions: 3</div>
              <div className="sidebar-item"><div className="sidebar-item-dot" />Model: online</div>
            </div>
          </div>

          {/* CENTER */}
          <div className="center-area">

            {/* EDITOR */}
            <div className="editor-panel">
              <div className="panel-header">
                <span className="panel-title">AudioScript Editor</span>
                <span className={`panel-badge ${branch === "live" ? "badge-live" : "badge-ir"}`}>
                  {branch === "live" ? "LIVE" : "IR v1"}
                </span>
                <div className="panel-header-spacer" />
                <button className="panel-action" onClick={() => setBranch(b => b === "live" ? "ir" : "live")}>
                  switch branch
                </button>
                <button className={`panel-action run`} onClick={() => { setEngineOn(true); setPlaying(true); }}>
                  ▶ evaluate
                </button>
              </div>
              <div className="editor-body">
                <div className="line-numbers">
                  {CODE_LINES.map((_, i) => (
                    <div key={i} className={`line-num ${i === 10 ? "active" : ""}`}>{i + 1}</div>
                  ))}
                </div>
                <div className="code-area">
                  {CODE_LINES.map((line, i) => (
                    <div key={i} className={`code-line ${line.highlighted ? "highlighted" : ""}`}>
                      {line.tokens.map((tok, j) => (
                        <span key={j} className={`tok-${tok.t}`}>{tok.v}</span>
                      ))}
                      {line.juniper && engineOn && (
                        <>
                          <span className="juniper-suggestion">{line.juniper}</span>
                          <span className="juniper-hint">tab ↹</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CONSOLE */}
            <div className="console-panel">
              <div className="panel-header">
                <span className="panel-title">Output</span>
                <div className="panel-header-spacer" />
                <button className="panel-action">clear</button>
              </div>
              <div className="console-body">
                {CONSOLE_LINES.map((l, i) => (
                  <div key={i} className="console-line">
                    <span className="console-time">{l.time}</span>
                    <span className={`console-${l.type}`}>{l.msg}</span>
                  </div>
                ))}
                {engineOn && (
                  <div className="console-line">
                    <span className="console-time">{fmt(time)}</span>
                    <span className="console-ok">engine running — evaluating drop_sequence</span>
                    <span className="console-cursor" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="panel-header">
              <span className="panel-title">Signal</span>
            </div>

            <div className="right-section">
              <div className="right-section-title">Waveform</div>
              <WaveformCanvas active={engineOn && playing} />
            </div>

            <div className="right-section">
              <div className="right-section-title">Output Meters</div>
              <Meters active={engineOn && playing} />
            </div>

            <div className="right-section">
              <div className="right-section-title">DSP Controls</div>
              <div className="knobs-row">
                <Knob label="GAIN" value="0dB" angle={0} />
                <Knob label="REV" value="40%" angle={-40} />
                <Knob label="FILTER" value="800" angle={30} />
                <Knob label="COMP" value="2:1" angle={-20} />
              </div>
            </div>

            <div className="right-section">
              <div className="right-section-title">Hardware / LED</div>
              <div className="hw-grid">
                <div className="hw-item">
                  <div className="hw-item-name">MIDI Out</div>
                  <div className="hw-item-status">
                    <div className={`hw-dot ${engineOn ? "connected" : "disconnected"}`} />
                    {engineOn ? "active" : "offline"}
                  </div>
                </div>
                <div className="hw-item">
                  <div className="hw-item-name">LED Bridge</div>
                  <div className="hw-item-status">
                    <div className={`hw-dot ${engineOn ? "active" : "disconnected"}`} />
                    {engineOn ? "3 online" : "offline"}
                  </div>
                </div>
                <div className="hw-item">
                  <div className="hw-item-name">Audio I/O</div>
                  <div className="hw-item-status">
                    <div className={`hw-dot connected`} />
                    48kHz
                  </div>
                </div>
                <div className="hw-item">
                  <div className="hw-item-name">OSC Out</div>
                  <div className="hw-item-status">
                    <div className={`hw-dot ${engineOn ? "connected" : "disconnected"}`} />
                    {engineOn ? "→ 9000" : "offline"}
                  </div>
                </div>
              </div>
              <LEDStrip active={engineOn && playing} />
            </div>
          </div>
        </div>

        {/* TRANSPORT */}
        <div className="transport-bar">
          <div className="transport-btn" onClick={() => { setPlaying(false); setTime(0); setEngineOn(false); }}>■</div>
          <div className={`transport-btn ${playing ? "active" : ""}`} onClick={() => { setPlaying(p => !p); if (!engineOn) setEngineOn(true); }}>
            {playing ? "⏸" : "▶"}
          </div>
          <div className="transport-btn">⏺</div>
          <div className="topbar-divider" />
          <div className="transport-bpm">
            <span className="bpm-label">BPM</span>
            <span className="bpm-val">138</span>
          </div>
          <div className="transport-time">{fmt(time)}</div>
          <div className="transport-spacer" />
          <div className="transport-engine">
            <div className={`engine-status ${engineOn ? "engine-on" : "engine-off"}`} />
            {engineOn ? "Live Engine Running" : "Engine Idle"}
          </div>
        </div>

        {/* STATUSBAR */}
        <div className="statusbar">
          <div className="sb-item">
            <div className={`sb-dot ${engineOn ? "sb-ok" : ""}`} style={{ background: engineOn ? COLORS.accent : COLORS.textMuted }} />
            {engineOn ? "online" : "idle"}
          </div>
          <div className="sb-item">BRAT_NIGHT_01</div>
          <div className="sb-item" style={{ color: COLORS.juniper }}>Juniper2.0</div>
          <div className="sb-spacer" />
          <div className="sb-item">48 kHz • 256 • 12.0 ms</div>
          <div className="sb-item">CPU 4%</div>
          <div className="sb-item">AudioScript Live</div>
        </div>

      </div>
    </>
  );
}
