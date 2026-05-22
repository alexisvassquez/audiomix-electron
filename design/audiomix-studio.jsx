import { useState, useEffect, useRef, useCallback } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:           "#080808",
  surface:      "#0f0f0f",
  surfaceAlt:   "#131313",
  surfaceHover: "#181818",
  border:       "#1c1c1c",
  borderBright: "#272727",
  accent:       "#00ff9f",
  accentDim:    "#00ff9f18",
  accentMid:    "#00ff9f55",
  accentGlow:   "#00ff9f",
  juniper:      "#7c6af7",
  juniperDim:   "#7c6af720",
  blue:         "#4d9fff",
  blueDim:      "#4d9fff20",
  warn:         "#ffaa00",
  err:          "#ff4455",
  text:         "#d8d8d8",
  textDim:      "#555",
  textMuted:    "#2a2a2a",
  // track colors
  tracks: ["#00ff9f","#4d9fff","#ff6ac1","#ffaa00","#7c6af7","#ff4455","#00cfff","#f1fa8c"],
};

// ── STATIC DATA ───────────────────────────────────────────────────────────────
const TRACKS = [
  { id:0, name:"KICK",      type:"drum",  color:C.tracks[0], clips:[{start:0,len:2},{start:4,len:2},{start:8,len:2},{start:12,len:2}] },
  { id:1, name:"SNARE",     type:"drum",  color:C.tracks[1], clips:[{start:2,len:2},{start:6,len:2},{start:10,len:2},{start:14,len:2}] },
  { id:2, name:"BASS STB",  type:"synth", color:C.tracks[2], clips:[{start:0,len:4},{start:6,len:6},{start:14,len:2}] },
  { id:3, name:"LEAD SYN",  type:"synth", color:C.tracks[3], clips:[{start:4,len:8},{start:13,len:3}] },
  { id:4, name:"CHORD PAD", type:"synth", color:C.tracks[4], clips:[{start:0,len:16}] },
  { id:5, name:"VOCAL chop",type:"audio", color:C.tracks[5], clips:[{start:3,len:2},{start:7,len:1},{start:11,len:4}] },
  { id:6, name:"FX RISER",  type:"audio", color:C.tracks[6], clips:[{start:14,len:2}] },
  { id:7, name:"MASTER BUS",type:"bus",   color:C.tracks[7], clips:[] },
];

const MIXER_CHANNELS = [
  { name:"KICK",     color:C.tracks[0], vol:80, pan:0,   mute:false, solo:false },
  { name:"SNARE",    color:C.tracks[1], vol:75, pan:5,   mute:false, solo:false },
  { name:"BASS",     color:C.tracks[2], vol:85, pan:-8,  mute:false, solo:false },
  { name:"LEAD",     color:C.tracks[3], vol:70, pan:12,  mute:false, solo:false },
  { name:"PAD",      color:C.tracks[4], vol:60, pan:0,   mute:false, solo:false },
  { name:"VOX",      color:C.tracks[5], vol:78, pan:-5,  mute:false, solo:false },
  { name:"FX",       color:C.tracks[6], vol:65, pan:0,   mute:false, solo:false },
  { name:"MASTER",   color:C.tracks[7], vol:90, pan:0,   mute:false, solo:false },
];

const BARS = 16;
const BEAT_W = 48; // px per beat (4 beats per bar shown as 1 unit here)

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600&family=Syne:wght@400;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
:root {
  --accent: ${C.accent};
  --juniper: ${C.juniper};
  --surface: ${C.surface};
  --border: ${C.border};
  --text: ${C.text};
}
body { background:${C.bg}; color:${C.text}; }

.am-root {
  display:flex; flex-direction:column;
  height:100vh; width:100vw; overflow:hidden;
  font-family:'JetBrains Mono',monospace; font-size:11px;
  background:${C.bg};
  user-select:none;
}

/* ── TOPBAR ── */
.topbar {
  height:36px; flex-shrink:0;
  background:${C.surface};
  border-bottom:1px solid ${C.border};
  display:flex; align-items:center; gap:10px; padding:0 12px;
  z-index:200;
}
.logo {
  font-family:'Syne',sans-serif; font-weight:800; font-size:12px;
  color:${C.accent}; letter-spacing:.1em;
  display:flex; align-items:center; gap:6px;
}
.logo-pulse {
  width:5px;height:5px;border-radius:50%;
  background:${C.accent}; box-shadow:0 0 8px ${C.accent};
  animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px ${C.accent}} 50%{opacity:.3;box-shadow:none} }
.divider-v { width:1px;height:16px;background:${C.border}; }
.mode-switcher {
  display:flex;gap:2px;
  background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:4px;padding:2px;
}
.mode-btn {
  padding:3px 10px; border-radius:3px; border:none; cursor:pointer;
  font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em;
  background:transparent; color:${C.textDim}; transition:all .15s;
}
.mode-btn.active { background:${C.accentDim}; color:${C.accent}; border:1px solid ${C.accentMid}; }
.mode-btn:hover:not(.active) { color:${C.text}; }
.topbar-spacer { flex:1; }
.topbar-project {
  font-size:11px; color:${C.textDim};
  display:flex;align-items:center;gap:6px;
}
.topbar-project span { color:${C.text}; }
.topbar-juniper {
  font-size:10px; color:${C.juniper};
  background:${C.juniperDim}; border:1px solid #7c6af733;
  border-radius:4px; padding:3px 8px;
  display:flex;align-items:center;gap:5px;
  cursor:pointer; transition:all .15s;
}
.topbar-juniper:hover { background:#7c6af730; }
.j-dot { width:5px;height:5px;border-radius:50%;background:${C.juniper}; animation:pulse 1.5s infinite; }

/* ── MAIN BODY ── */
.main-body { flex:1; display:flex; overflow:hidden; min-height:0; }

/* ── LEFT SIDEBAR ── */
.sidebar {
  width:180px; flex-shrink:0;
  background:${C.surface}; border-right:1px solid ${C.border};
  display:flex;flex-direction:column; overflow:hidden;
}
.sidebar-section { border-bottom:1px solid ${C.border}; padding:6px 0; }
.sidebar-section-label {
  padding:3px 10px 5px; font-size:9px; letter-spacing:.15em;
  color:${C.textMuted}; text-transform:uppercase; font-weight:600;
}
.sidebar-item {
  padding:4px 10px; font-size:11px; color:${C.textDim};
  display:flex;align-items:center;gap:7px; cursor:pointer; transition:all .1s;
}
.sidebar-item:hover { background:${C.surfaceHover}; color:${C.text}; }
.sidebar-item.active { color:${C.accent}; background:${C.accentDim}; }
.sidebar-dot { width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0; }
.sidebar-count {
  margin-left:auto; font-size:9px; color:${C.textMuted};
  background:${C.surfaceAlt}; border-radius:8px; padding:1px 5px;
}

/* ── CENTER ── */
.center { flex:1; display:flex;flex-direction:column; overflow:hidden; min-width:0; }

/* ── ARRANGEMENT / TIMELINE ── */
.arrangement {
  flex:1; display:flex;flex-direction:column; overflow:hidden;
  border-bottom:1px solid ${C.border}; min-height:0;
}
.arr-header {
  height:30px; flex-shrink:0;
  background:${C.surfaceAlt}; border-bottom:1px solid ${C.border};
  display:flex; align-items:center; padding:0 10px; gap:8px;
}
.arr-title { font-size:10px; letter-spacing:.1em; color:${C.textDim}; text-transform:uppercase; }
.arr-spacer { flex:1; }
.arr-action {
  font-size:10px; color:${C.textDim}; cursor:pointer;
  padding:2px 7px; border-radius:3px; border:1px solid transparent;
  background:none; font-family:'JetBrains Mono',monospace;
  transition:all .1s;
}
.arr-action:hover { border-color:${C.border}; color:${C.text}; }
.arr-action.primary { color:${C.accent}; border-color:${C.accentMid}; background:${C.accentDim}; }

/* Track list + timeline combined */
.arr-body { flex:1; display:flex; overflow:hidden; }

/* Track headers (left col) */
.track-headers { width:160px; flex-shrink:0; overflow:hidden; border-right:1px solid ${C.border}; }
.track-header-row {
  height:36px; border-bottom:1px solid ${C.border};
  display:flex;align-items:center; padding:0 8px; gap:6px;
  background:${C.surface}; cursor:pointer; transition:background .1s;
}
.track-header-row:hover { background:${C.surfaceHover}; }
.track-color-pill { width:3px;height:20px;border-radius:2px;flex-shrink:0; }
.track-name { font-size:10px;color:${C.text};flex:1;letter-spacing:.02em;white-space:nowrap;overflow:hidden; }
.track-type { font-size:9px;color:${C.textDim};letter-spacing:.05em; }
.track-btn {
  width:16px;height:16px;border-radius:3px;border:none;cursor:pointer;
  font-size:8px;display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace; transition:all .1s;
}
.track-btn.mute { background:#ffaa0022;color:${C.warn}; }
.track-btn.mute:hover { background:#ffaa0044; }
.track-btn.solo { background:${C.accentDim};color:${C.accent}; }
.track-btn.solo:hover { background:#00ff9f33; }

/* Timeline ruler */
.timeline-wrap { flex:1; overflow-x:auto; overflow-y:hidden; display:flex;flex-direction:column; }
.timeline-ruler {
  height:20px; flex-shrink:0; display:flex;
  background:${C.surfaceAlt}; border-bottom:1px solid ${C.border};
  position:sticky;top:0;z-index:10;
}
.ruler-bar {
  width:${BEAT_W}px; flex-shrink:0; border-right:1px solid ${C.border};
  display:flex;align-items:center;padding-left:4px;
  font-size:9px;color:${C.textDim};letter-spacing:.05em;
}
.ruler-bar.downbeat { color:${C.text}; border-right-color:${C.borderBright}; }

/* Clip lanes */
.clip-lanes { flex:1; overflow-y:auto; position:relative; }
.clip-lane {
  height:36px; border-bottom:1px solid ${C.border};
  display:flex; align-items:center; position:relative;
  background:${C.surface};
}
.clip-lane:nth-child(even) { background:#0c0c0c; }

/* Grid lines */
.clip-lane::before {
  content:''; position:absolute; inset:0;
  background:repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent ${BEAT_W - 1}px,
    ${C.border} ${BEAT_W - 1}px,
    ${C.border} ${BEAT_W}px
  );
  pointer-events:none;
}

.clip {
  position:absolute; height:26px; border-radius:3px;
  display:flex;align-items:center;padding:0 6px;
  font-size:9px; letter-spacing:.04em; font-weight:600;
  cursor:pointer; transition:filter .1s; overflow:hidden;
  white-space:nowrap;
}
.clip:hover { filter:brightness(1.2); }
.clip-inner {
  position:absolute; inset:0; border-radius:3px; overflow:hidden;
}
.clip-wave {
  position:absolute; bottom:0; left:0; right:0; height:60%;
  opacity:0.3;
}

/* Playhead */
.playhead {
  position:absolute; top:0; bottom:0; width:1px;
  background:${C.accent}; box-shadow:0 0 6px ${C.accent};
  pointer-events:none; z-index:20; transition:left .05s linear;
}
.playhead::before {
  content:''; position:absolute; top:0; left:-4px;
  width:0;height:0;
  border-left:4px solid transparent;
  border-right:4px solid transparent;
  border-top:6px solid ${C.accent};
}

/* Playhead in ruler */
.ruler-playhead {
  position:absolute; top:0; bottom:0; width:2px;
  background:${C.accent}; pointer-events:none; z-index:30;
  box-shadow:0 0 8px ${C.accent};
  transition:left .05s linear;
}

/* ── MIXER ── */
.mixer {
  height:220px; flex-shrink:0;
  background:${C.surface}; border-top:1px solid ${C.border};
  display:flex; flex-direction:column;
}
.mixer-header {
  height:28px; flex-shrink:0;
  background:${C.surfaceAlt}; border-bottom:1px solid ${C.border};
  display:flex;align-items:center;padding:0 10px;gap:8px;
}
.mixer-title { font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase; }
.mixer-body {
  flex:1; display:flex; overflow-x:auto; overflow-y:hidden;
  padding:8px 12px; gap:6px; align-items:flex-end;
}

/* Channel strip */
.channel {
  display:flex; flex-direction:column; align-items:center;
  gap:4px; width:52px; flex-shrink:0;
}
.ch-name {
  font-size:8px; letter-spacing:.06em; text-transform:uppercase;
  color:${C.textDim}; text-align:center; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; width:100%;
}
.ch-btn-row { display:flex;gap:2px; }
.ch-btn {
  width:18px;height:14px;border-radius:2px;border:none;cursor:pointer;
  font-size:7px;font-family:'JetBrains Mono',monospace;
  display:flex;align-items:center;justify-content:center;
  transition:all .1s;
}
.ch-m { background:#ffaa0018;color:${C.warn}; }
.ch-m:hover,.ch-m.on { background:#ffaa0044;color:${C.warn}; }
.ch-s { background:${C.accentDim};color:${C.accent}; }
.ch-s:hover,.ch-s.on { background:#00ff9f33; }

/* Fader track */
.fader-track {
  width:4px; height:100px; background:${C.surfaceAlt};
  border-radius:2px; position:relative; cursor:pointer;
  border:1px solid ${C.border};
}
.fader-fill {
  position:absolute; bottom:0; left:0; right:0;
  border-radius:2px; transition:height .1s;
}
.fader-thumb {
  position:absolute; left:50%; transform:translateX(-50%);
  width:14px;height:6px; background:${C.borderBright};
  border-radius:2px; border:1px solid ${C.borderBright};
  cursor:grab; transition:background .1s;
}
.fader-thumb:hover { background:${C.text}; }

/* Meter */
.ch-meter { display:flex;gap:1px;height:80px;align-items:flex-end; }
.ch-meter-bar { width:3px;background:${C.surfaceAlt};border-radius:1px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end; }
.ch-meter-fill { width:100%;border-radius:1px;transition:height .07s ease; }
.ch-val { font-size:8px;color:${C.textMuted}; }
.ch-color-bar { width:100%;height:2px;border-radius:1px; }

/* ── TRANSPORT ── */
.transport {
  height:42px; flex-shrink:0;
  background:${C.surface}; border-top:1px solid ${C.border};
  display:flex;align-items:center;padding:0 14px;gap:14px;
}
.t-btn {
  width:26px;height:26px;border-radius:4px;cursor:pointer;
  background:${C.surfaceAlt};border:1px solid ${C.border};
  display:flex;align-items:center;justify-content:center;
  color:${C.textDim};font-size:10px; transition:all .1s;
}
.t-btn:hover { border-color:${C.borderBright};color:${C.text}; }
.t-btn.active { background:${C.accentDim};border-color:${C.accentMid};color:${C.accent}; }
.t-btn.rec { background:#ff445518;border-color:#ff445544;color:${C.err}; }
.t-btn.rec.active { background:#ff445533;box-shadow:0 0 6px ${C.err}; }
.t-bpm { display:flex;align-items:center;gap:5px; }
.t-bpm-label { font-size:9px;color:${C.textMuted};letter-spacing:.1em; }
.t-bpm-val { font-size:18px;font-weight:600;color:${C.text};letter-spacing:-.02em;cursor:pointer; }
.t-bpm-val:hover { color:${C.accent}; }
.t-time { font-size:14px;color:${C.textDim};letter-spacing:.05em;font-variant-numeric:tabular-nums; }
.t-sig { font-size:10px;color:${C.textMuted}; display:flex;flex-direction:column;line-height:1.1; }
.t-spacer { flex:1; }
.t-snap { display:flex;align-items:center;gap:4px;font-size:10px;color:${C.textDim}; }
.snap-btn {
  background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:3px;
  padding:2px 6px;font-size:9px;color:${C.textDim};cursor:pointer;
  font-family:'JetBrains Mono',monospace;transition:all .1s;
}
.snap-btn.active { background:${C.accentDim};border-color:${C.accentMid};color:${C.accent}; }

/* ── STATUSBAR ── */
.statusbar {
  height:22px; flex-shrink:0;
  background:#070707; border-top:1px solid ${C.border};
  display:flex;align-items:center;padding:0 8px;gap:0; font-size:10px;
}
.sb { padding:0 8px;height:100%;display:flex;align-items:center;gap:4px;color:${C.textDim};border-right:1px solid ${C.border};cursor:default; }
.sb:hover { background:${C.surfaceAlt}; }
.sb-ok { background:${C.accent};box-shadow:0 0 4px ${C.accent}; }
.sb-dot { width:4px;height:4px;border-radius:50%; }
.sb-spacer { flex:1; }
.sb-juniper { color:${C.juniper}; }

/* ── RIGHT PANEL ── */
.right-panel {
  width:200px; flex-shrink:0;
  background:${C.surface}; border-left:1px solid ${C.border};
  display:flex;flex-direction:column; overflow:hidden;
}
.rp-section { border-bottom:1px solid ${C.border}; padding:8px 10px; }
.rp-label { font-size:9px;letter-spacing:.15em;color:${C.textMuted};text-transform:uppercase;margin-bottom:6px; }

/* Juniper chat */
.juniper-panel { flex:1; display:flex;flex-direction:column; overflow:hidden; }
.juniper-msgs { flex:1; overflow-y:auto; padding:8px 10px; display:flex;flex-direction:column;gap:6px; }
.j-msg { font-size:10px;line-height:16px; }
.j-msg.ai { color:${C.juniper}; padding:5px 7px; background:${C.juniperDim}; border-radius:4px; border-left:2px solid ${C.juniper}; }
.j-msg.user { color:${C.textDim}; }
.juniper-input-row { padding:6px 8px; border-top:1px solid ${C.border}; display:flex;gap:4px; }
.juniper-input {
  flex:1; background:${C.surfaceAlt}; border:1px solid ${C.border};
  border-radius:3px; padding:4px 7px; color:${C.text}; font-size:10px;
  font-family:'JetBrains Mono',monospace; outline:none;
}
.juniper-input:focus { border-color:${C.juniper}; }
.juniper-send {
  width:22px;height:22px;background:${C.juniperDim};border:1px solid #7c6af733;
  border-radius:3px;color:${C.juniper};cursor:pointer;font-size:10px;
  display:flex;align-items:center;justify-content:center;transition:all .1s;
}
.juniper-send:hover { background:#7c6af730; }

/* Knobs row */
.knobs { display:flex;gap:6px;justify-content:space-around; }
.knob-w { display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer; }
.knob {
  width:28px;height:28px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#222,#0e0e0e);
  border:1.5px solid ${C.borderBright}; position:relative; transition:border-color .15s;
}
.knob:hover { border-color:${C.accent}; }
.knob-ind {
  position:absolute;width:1.5px;height:8px;background:${C.accent};
  border-radius:1px;left:50%;top:4px;transform-origin:bottom center;
  box-shadow:0 0 3px ${C.accent};
}
.knob-lbl { font-size:8px;color:${C.textMuted};letter-spacing:.04em; }
.knob-val { font-size:8px;color:${C.textDim}; }

/* Waveform */
.mini-wave { width:100%;height:36px;display:block; }

/* Scrollbars */
::-webkit-scrollbar { width:3px;height:3px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:${C.border};border-radius:2px; }
::-webkit-scrollbar-thumb:hover { background:${C.borderBright}; }
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2,"0");
  return `${m}:${(s%60).toString().padStart(2,"0")}:00`;
}

function MiniWave({ active, color }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    let raf, ph = 0;
    function draw() {
      ctx.clearRect(0,0,w,h);
      ctx.beginPath();
      const mid = h/2;
      for (let x=0;x<w;x++) {
        const t = x/w;
        const amp = active ? (0.25 + .15*Math.sin(t*8+ph*.6)) : 0.04;
        const y = mid + Math.sin(t*30+ph)*amp*mid + Math.sin(t*13+ph*1.2)*amp*.35*mid;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle = active ? color : C.borderBright;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = active ? color : "transparent";
      ctx.shadowBlur = active ? 3 : 0;
      ctx.stroke();
      ph += active ? .07 : .008;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(raf);
  }, [active, color]);
  return <canvas ref={ref} className="mini-wave" width={176} height={36}/>;
}

function ChannelMeter({ active, color }) {
  const [lvls, setLvls] = useState([0,0]);
  useEffect(()=>{
    if (!active){setLvls([0,0]);return;}
    const id = setInterval(()=>{
      setLvls([
        Math.max(0,Math.min(1,.6+Math.random()*.35)),
        Math.max(0,Math.min(1,.55+Math.random()*.35)),
      ]);
    }, 80);
    return ()=>clearInterval(id);
  },[active]);
  return (
    <div className="ch-meter">
      {lvls.map((l,i)=>{
        const c = l>.88?C.err:l>.72?C.warn:color;
        return(
          <div key={i} className="ch-meter-bar">
            <div className="ch-meter-fill" style={{height:`${l*100}%`,background:c,opacity:.85}}/>
          </div>
        );
      })}
    </div>
  );
}

const JUNIPER_MSGS = [
  { type:"ai",   text:"Ready — BRAT_NIGHT_01 indexed." },
  { type:"user", text:"make the drop harder" },
  { type:"ai",   text:"Raising kick compression ratio to 6:1, pushing bass stab gain +2dB, adding overdrive to lead. Want me to also tighten the snare transient?" },
  { type:"user", text:"yes and add reverb tail on the vocal chop" },
  { type:"ai",   text:"Done. Pre-delay set to 18ms, decay 1.2s on vocal chop. Listening now..." },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function AudioMIXStudio() {
  const [mode, setMode] = useState("STUDIO");
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [playhead, setPlayhead] = useState(0); // 0-BARS
  const [snap, setSnap] = useState("1/4");
  const [mixer, setMixer] = useState(MIXER_CHANNELS);
  const [juniperMsg, setJuniperMsg] = useState("");
  const [msgs, setMsgs] = useState(JUNIPER_MSGS);

  useEffect(()=>{
    if (!playing) return;
    const id = setInterval(()=>{
      setTime(t=>t+1);
      setPlayhead(p=>(p+0.0625)%(BARS));
    },250);
    return ()=>clearInterval(id);
  },[playing]);

  const togglePlay = ()=>{
    setPlaying(p=>!p);
    if (recording && playing) setRecording(false);
  };
  const stop = ()=>{ setPlaying(false); setRecording(false); setTime(0); setPlayhead(0); };
  const toggleMute = (i)=> setMixer(m=>m.map((ch,ci)=>ci===i?{...ch,mute:!ch.mute}:ch));
  const toggleSolo = (i)=> setMixer(m=>m.map((ch,ci)=>ci===i?{...ch,solo:!ch.solo}:ch));

  const sendJuniper = ()=>{
    if (!juniperMsg.trim()) return;
    setMsgs(m=>[...m,{type:"user",text:juniperMsg},{type:"ai",text:"On it — analysing context..."}]);
    setJuniperMsg("");
  };

  const SNAP_OPTIONS = ["1/1","1/2","1/4","1/8","1/16"];

  return (
    <>
      <style>{css}</style>
      <div className="am-root">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="logo"><div className="logo-pulse"/>AUDIOMIX</div>
          <div className="divider-v"/>
          <div className="mode-switcher">
            {["STUDIO","LIVE","PERFORM"].map(m=>(
              <button key={m} className={`mode-btn${mode===m?" active":""}`} onClick={()=>setMode(m)}>{m}</button>
            ))}
          </div>
          <div className="topbar-spacer"/>
          <div className="topbar-project">Project: <span>BRAT_NIGHT_01</span></div>
          <div className="divider-v"/>
          <div className="topbar-juniper">
            <div className="j-dot"/>
            Juniper2.0
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="main-body">

          {/* LEFT SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-section-label">Browser</div>
              <div className="sidebar-item active"><div className="sidebar-dot"/>Arrangement<div className="sidebar-count">8</div></div>
              <div className="sidebar-item"><div className="sidebar-dot"/>Samples<div className="sidebar-count">142</div></div>
              <div className="sidebar-item"><div className="sidebar-dot"/>Instruments<div className="sidebar-count">24</div></div>
              <div className="sidebar-item"><div className="sidebar-dot"/>Effects<div className="sidebar-count">38</div></div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-label">Scenes</div>
              <div className="sidebar-item active"><div className="sidebar-dot"/>drop_sequence</div>
              <div className="sidebar-item"><div className="sidebar-dot"/>intro</div>
              <div className="sidebar-item"><div className="sidebar-dot"/>build_up</div>
              <div className="sidebar-item"><div className="sidebar-dot"/>outro</div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-label">AudioScript</div>
              <div className="sidebar-item" style={{color:C.accent}}><div className="sidebar-dot"/>IR v1<div className="sidebar-count" style={{color:C.accent}}>✓</div></div>
              <div className="sidebar-item"><div className="sidebar-dot"/>Live (dev)</div>
            </div>
          </div>

          {/* CENTER */}
          <div className="center">

            {/* ARRANGEMENT */}
            <div className="arrangement">
              <div className="arr-header">
                <span className="arr-title">Arrangement</span>
                <div className="arr-spacer"/>
                <button className="arr-action">+ Add Track</button>
                <button className="arr-action primary">Compile IR</button>
              </div>
              <div className="arr-body">

                {/* Track headers */}
                <div className="track-headers">
                  {TRACKS.map((tr,i)=>(
                    <div key={tr.id} className="track-header-row">
                      <div className="track-color-pill" style={{background:tr.color}}/>
                      <div style={{flex:1}}>
                        <div className="track-name">{tr.name}</div>
                        <div className="track-type">{tr.type}</div>
                      </div>
                      <button className="track-btn mute" onClick={()=>toggleMute(i)}>M</button>
                      <button className="track-btn solo" onClick={()=>toggleSolo(i)}>S</button>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="timeline-wrap">
                  <div className="timeline-ruler" style={{position:"relative",width:`${BARS*BEAT_W}px`}}>
                    {Array.from({length:BARS},(_,i)=>(
                      <div key={i} className={`ruler-bar${i%4===0?" downbeat":""}`}
                           style={{width:`${BEAT_W}px`}}>
                        {i%4===0 ? `${i/4+1}` : "·"}
                      </div>
                    ))}
                    <div className="ruler-playhead" style={{left:`${playhead*BEAT_W}px`}}/>
                  </div>

                  <div className="clip-lanes" style={{position:"relative",width:`${BARS*BEAT_W}px`}}>
                    <div className="playhead" style={{left:`${playhead*BEAT_W}px`}}/>
                    {TRACKS.map((tr)=>(
                      <div key={tr.id} className="clip-lane" style={{width:`${BARS*BEAT_W}px`}}>
                        {tr.clips.map((clip,ci)=>(
                          <div key={ci} className="clip" style={{
                            left:`${clip.start*BEAT_W}px`,
                            width:`${clip.len*BEAT_W - 2}px`,
                            background:`${tr.color}22`,
                            border:`1px solid ${tr.color}66`,
                            color:tr.color,
                            top:'5px',
                          }}>
                            {ci===0?tr.name:""}
                            {/* mini waveform bars inside clip */}
                            <div style={{position:"absolute",bottom:2,left:0,right:0,height:8,display:"flex",gap:1,padding:"0 4px",alignItems:"flex-end",opacity:.5}}>
                              {Array.from({length:Math.floor(clip.len*6)},(_,wi)=>(
                                <div key={wi} style={{flex:1,background:tr.color,borderRadius:1,height:`${30+Math.sin(wi*1.7)*50}%`}}/>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MIXER */}
            <div className="mixer">
              <div className="mixer-header">
                <span className="mixer-title">Mixer</span>
              </div>
              <div className="mixer-body">
                {mixer.map((ch,i)=>(
                  <div key={i} className="channel">
                    <div className="ch-color-bar" style={{background:ch.color,opacity:.7}}/>
                    <ChannelMeter active={playing && !ch.mute} color={ch.color}/>
                    <div className="fader-track">
                      <div className="fader-fill" style={{height:`${ch.vol}%`,background:`${ch.color}44`}}/>
                      <div className="fader-thumb" style={{bottom:`${ch.vol}%`,marginBottom:-3}}/>
                    </div>
                    <div className="ch-btn-row">
                      <button className={`ch-btn ch-m${ch.mute?" on":""}`} onClick={()=>toggleMute(i)}>M</button>
                      <button className={`ch-btn ch-s${ch.solo?" on":""}`} onClick={()=>toggleSolo(i)}>S</button>
                    </div>
                    <div className="ch-val">{ch.vol===90?`0 dB`:`-${(90-ch.vol)/10|0} dB`}</div>
                    <div className="ch-name">{ch.name}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end center */}

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div style={{height:36,background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 10px"}}>
              <span style={{fontSize:10,letterSpacing:".1em",color:C.textDim,textTransform:"uppercase"}}>Inspector</span>
            </div>

            <div className="rp-section">
              <div className="rp-label">Waveform</div>
              <MiniWave active={playing} color={C.accent}/>
            </div>

            <div className="rp-section">
              <div className="rp-label">DSP Controls</div>
              <div className="knobs">
                <div className="knob-w">
                  <div className="knob"><div className="knob-ind" style={{transform:"translateX(-50%) rotate(0deg)"}}/></div>
                  <div className="knob-lbl">GAIN</div>
                  <div className="knob-val">0dB</div>
                </div>
                <div className="knob-w">
                  <div className="knob"><div className="knob-ind" style={{transform:"translateX(-50%) rotate(-40deg)"}}/></div>
                  <div className="knob-lbl">REV</div>
                  <div className="knob-val">40%</div>
                </div>
                <div className="knob-w">
                  <div className="knob"><div className="knob-ind" style={{transform:"translateX(-50%) rotate(30deg)"}}/></div>
                  <div className="knob-lbl">COMP</div>
                  <div className="knob-val">2:1</div>
                </div>
              </div>
            </div>

            {/* Juniper2.0 chat */}
            <div className="juniper-panel">
              <div style={{padding:"6px 10px 4px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:5}}>
                <div className="j-dot"/>
                <span style={{fontSize:10,color:C.juniper,letterSpacing:".08em"}}>Juniper2.0</span>
              </div>
              <div className="juniper-msgs">
                {msgs.map((m,i)=>(
                  <div key={i} className={`j-msg ${m.type}`}>{m.text}</div>
                ))}
              </div>
              <div className="juniper-input-row">
                <input
                  className="juniper-input"
                  placeholder="ask Juniper..."
                  value={juniperMsg}
                  onChange={e=>setJuniperMsg(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendJuniper()}
                />
                <button className="juniper-send" onClick={sendJuniper}>↵</button>
              </div>
            </div>

          </div>
        </div>

        {/* TRANSPORT */}
        <div className="transport">
          <div className="t-btn" onClick={stop}>■</div>
          <div className={`t-btn${playing?" active":""}`} onClick={togglePlay}>{playing?"⏸":"▶"}</div>
          <div className={`t-btn rec${recording?" active":""}`} onClick={()=>setRecording(r=>!r)}>⏺</div>
          <div className="divider-v"/>
          <div className="t-bpm">
            <span className="t-bpm-label">BPM</span>
            <span className="t-bpm-val">138</span>
          </div>
          <div className="t-sig"><span>4</span><span>4</span></div>
          <div className="t-time">{fmt(time)}</div>
          <div className="t-spacer"/>
          <div className="t-snap">
            <span style={{color:C.textMuted,fontSize:9,letterSpacing:".08em"}}>SNAP</span>
            {SNAP_OPTIONS.map(s=>(
              <button key={s} className={`snap-btn${snap===s?" active":""}`} onClick={()=>setSnap(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* STATUSBAR */}
        <div className="statusbar">
          <div className="sb"><div className="sb-dot sb-ok"/>online</div>
          <div className="sb">BRAT_NIGHT_01</div>
          <div className="sb">STUDIO</div>
          <div className="sb" style={{color:C.accent}}>IR v1 ✓</div>
          <div className="sb-spacer"/>
          <div className="sb sb-juniper">Juniper2.0 ready</div>
          <div className="sb">48 kHz • 256 • 12.0 ms</div>
          <div className="sb">CPU 6%</div>
        </div>

      </div>
    </>
  );
}
