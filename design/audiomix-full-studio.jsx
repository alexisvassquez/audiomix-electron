import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:           "#070707",
  surface:      "#0e0e0e",
  surfaceAlt:   "#121212",
  surfaceHover: "#161616",
  border:       "#1a1a1a",
  borderBright: "#252525",
  accent:       "#00ff9f",
  accentDim:    "#00ff9f15",
  accentMid:    "#00ff9f44",
  juniper:      "#7c6af7",
  juniperDim:   "#7c6af718",
  pink:         "#ff6ac1",
  blue:         "#4d9fff",
  warn:         "#ffaa00",
  err:          "#ff4455",
  cyan:         "#00cfff",
  text:         "#d0d0d0",
  textDim:      "#484848",
  textMuted:    "#222",
  tracks: ["#00ff9f","#4d9fff","#ff6ac1","#ffaa00","#7c6af7","#ff4455","#00cfff","#f1fa8c"],
};

const TRACKS = [
  { id:0, name:"KICK",       type:"drum",  color:C.tracks[0], clips:[{s:0,l:2},{s:4,l:2},{s:8,l:2},{s:12,l:2}] },
  { id:1, name:"SNARE",      type:"drum",  color:C.tracks[1], clips:[{s:2,l:2},{s:6,l:2},{s:10,l:2},{s:14,l:2}] },
  { id:2, name:"BASS STB",   type:"synth", color:C.tracks[2], clips:[{s:0,l:4},{s:6,l:6},{s:14,l:2}] },
  { id:3, name:"LEAD SYN",   type:"synth", color:C.tracks[3], clips:[{s:4,l:8},{s:13,l:3}] },
  { id:4, name:"CHORD PAD",  type:"synth", color:C.tracks[4], clips:[{s:0,l:16}] },
  { id:5, name:"VOCAL CHOP", type:"audio", color:C.tracks[5], clips:[{s:3,l:2},{s:7,l:1},{s:11,l:4}] },
  { id:6, name:"FX RISER",   type:"audio", color:C.tracks[6], clips:[{s:14,l:2}] },
  { id:7, name:"MASTER BUS", type:"bus",   color:C.tracks[7], clips:[] },
];

const MIXER = [
  { name:"KICK",  color:C.tracks[0], vol:80 },
  { name:"SNARE", color:C.tracks[1], vol:75 },
  { name:"BASS",  color:C.tracks[2], vol:85 },
  { name:"LEAD",  color:C.tracks[3], vol:70 },
  { name:"PAD",   color:C.tracks[4], vol:60 },
  { name:"VOX",   color:C.tracks[5], vol:78 },
  { name:"FX",    color:C.tracks[6], vol:65 },
  { name:"MSTR",  color:C.tracks[7], vol:90 },
];

const HAL_DEVICES = [
  { name:"LED Bridge",   status:"online",  detail:"3 devices", color:C.accent },
  { name:"MIDI Out",     status:"online",  detail:"Ch 1-16",   color:C.accent },
  { name:"OSC Router",   status:"offline", detail:"port 9000", color:C.textDim },
  { name:"Arduino Uno",  status:"idle",    detail:"HAL queue", color:C.warn },
  { name:"RPi 5 (HAL)",  status:"idle",    detail:"SSH ready", color:C.warn },
];

const AS_HISTORY = [
  { type:"info",    time:"00:00:01", text:"AudioScript Runtime v0.1 — shell ready" },
  { type:"info",    time:"00:00:01", text:"Loaded 12 commands from registry" },
  { type:"ok",      time:"00:00:02", text:"mood.set(\"euphoric\") → OK" },
  { type:"ok",      time:"00:00:03", text:"glow(\"cyan\") → LED bridge ack" },
  { type:"juniper", time:"00:00:04", text:"Juniper2.0: try pulse(\"cyan\", bpm=138) for rhythmic sync" },
  { type:"ok",      time:"00:00:05", text:"play(\"drop_sequence.as\") → evaluating..." },
  { type:"warn",    time:"00:00:06", text:"layer 'lead_synth' amplitude clipping — reduce gain" },
];

const EQ_BANDS = [
  { label:"SUB",  hz:"60",   gain: 2  },
  { label:"BASS", hz:"200",  gain: 4  },
  { label:"LO",   hz:"500",  gain:-2  },
  { label:"MID",  hz:"1k",   gain: 1  },
  { label:"HI",   hz:"4k",   gain: 3  },
  { label:"AIR",  hz:"12k",  gain: 5  },
  { label:"TOP",  hz:"20k",  gain: 0  },
];

const BARS = 16;
const BW = 44;

const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;1,300&family=Syne:wght@400;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${C.bg};color:${C.text};font-family:'JetBrains Mono',monospace;font-size:11px;}

.root{display:flex;flex-direction:column;height:100vh;width:100vw;overflow:hidden;background:${C.bg};}

/* TOPBAR */
.tb{height:36px;flex-shrink:0;background:${C.surface};border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:10px;padding:0 12px;z-index:200;}
.tb-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:12px;color:${C.accent};letter-spacing:.1em;display:flex;align-items:center;gap:6px;}
.tb-pulse{width:5px;height:5px;border-radius:50%;background:${C.accent};box-shadow:0 0 8px ${C.accent};animation:glow 2s ease-in-out infinite;}
@keyframes glow{0%,100%{opacity:1;box-shadow:0 0 8px ${C.accent}}50%{opacity:.3;box-shadow:none}}
.tb-modes{display:flex;gap:2px;background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:4px;padding:2px;}
.tb-mode{padding:3px 10px;border-radius:3px;border:none;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;background:transparent;color:${C.textDim};transition:all .15s;}
.tb-mode.on{background:${C.accentDim};color:${C.accent};border:1px solid ${C.accentMid};}
.tb-mode:hover:not(.on){color:${C.text};}
.tb-sp{flex:1;}
.tb-proj{font-size:11px;color:${C.textDim};display:flex;align-items:center;gap:6px;}
.tb-proj span{color:${C.text};}
.tb-j{font-size:10px;color:${C.juniper};background:${C.juniperDim};border:1px solid #7c6af730;border-radius:4px;padding:3px 8px;display:flex;align-items:center;gap:5px;cursor:pointer;}
.tb-j:hover{background:#7c6af728;}
.jdot{width:5px;height:5px;border-radius:50%;background:${C.juniper};animation:jglow 1.5s ease-in-out infinite;}
@keyframes jglow{0%,100%{opacity:1}50%{opacity:.3}}
.divv{width:1px;height:16px;background:${C.border};}

/* BODY */
.body{flex:1;display:flex;overflow:hidden;min-height:0;}

/* SIDEBAR */
.sb{width:176px;flex-shrink:0;background:${C.surface};border-right:1px solid ${C.border};display:flex;flex-direction:column;overflow:hidden;}
.sb-sec{border-bottom:1px solid ${C.border};padding:5px 0;}
.sb-lbl{padding:3px 10px 4px;font-size:9px;letter-spacing:.15em;color:${C.textMuted};text-transform:uppercase;font-weight:600;}
.sb-item{padding:4px 10px;font-size:11px;color:${C.textDim};display:flex;align-items:center;gap:6px;cursor:pointer;transition:all .1s;}
.sb-item:hover{background:${C.surfaceHover};color:${C.text};}
.sb-item.on{color:${C.accent};background:${C.accentDim};}
.sb-dot{width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0;}
.sb-cnt{margin-left:auto;font-size:9px;color:${C.textMuted};background:${C.surfaceAlt};border-radius:8px;padding:1px 5px;}

/* HAL device */
.hal-item{padding:4px 10px;display:flex;align-items:center;gap:6px;cursor:default;}
.hal-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.hal-name{font-size:10px;color:${C.textDim};flex:1;}
.hal-detail{font-size:9px;color:${C.textMuted};}

/* CENTER */
.center{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}

/* ARRANGEMENT */
.arr{flex:1;display:flex;flex-direction:column;overflow:hidden;border-bottom:1px solid ${C.border};min-height:0;}
.arr-hdr{height:28px;flex-shrink:0;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;gap:8px;}
.arr-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.arr-sp{flex:1;}
.abtn{font-size:10px;color:${C.textDim};cursor:pointer;padding:2px 7px;border-radius:3px;border:1px solid transparent;background:none;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.abtn:hover{border-color:${C.border};color:${C.text};}
.abtn.pri{color:${C.accent};border-color:${C.accentMid};background:${C.accentDim};}
.arr-body{flex:1;display:flex;overflow:hidden;}

/* Track headers */
.th{width:152px;flex-shrink:0;border-right:1px solid ${C.border};overflow:hidden;}
.thr{height:32px;border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 6px;gap:5px;background:${C.surface};cursor:pointer;transition:background .1s;}
.thr:hover{background:${C.surfaceHover};}
.tc{width:3px;height:18px;border-radius:2px;flex-shrink:0;}
.tn{font-size:10px;color:${C.text};flex:1;white-space:nowrap;overflow:hidden;}
.tt{font-size:8px;color:${C.textDim};}
.tbtn{width:14px;height:14px;border-radius:2px;border:none;cursor:pointer;font-size:7px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.tbtn.m{background:#ffaa0018;color:${C.warn};}
.tbtn.s{background:${C.accentDim};color:${C.accent};}

/* Timeline */
.tl{flex:1;overflow-x:auto;overflow-y:hidden;display:flex;flex-direction:column;}
.ruler{height:18px;flex-shrink:0;display:flex;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};position:relative;}
.rbar{width:${BW}px;flex-shrink:0;border-right:1px solid ${C.border};display:flex;align-items:center;padding-left:4px;font-size:8px;color:${C.textMuted};}
.rbar.db{color:${C.textDim};border-right-color:${C.borderBright};}
.lanes{flex:1;overflow-y:auto;position:relative;}
.lane{height:32px;border-bottom:1px solid ${C.border};display:flex;align-items:center;position:relative;background:${C.surface};}
.lane:nth-child(even){background:#0b0b0b;}
.lane::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0px,transparent ${BW-1}px,${C.border} ${BW-1}px,${C.border} ${BW}px);pointer-events:none;}
.clip{position:absolute;height:24px;border-radius:3px;display:flex;align-items:center;padding:0 5px;font-size:8px;font-weight:600;cursor:pointer;overflow:hidden;white-space:nowrap;transition:filter .1s;top:4px;}
.clip:hover{filter:brightness(1.25);}
.ph{position:absolute;top:0;bottom:0;width:1px;background:${C.accent};box-shadow:0 0 6px ${C.accent};pointer-events:none;z-index:10;transition:left .05s linear;}
.ph::before{content:'';position:absolute;top:0;left:-3px;width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;border-top:5px solid ${C.accent};}
.rph{position:absolute;top:0;bottom:0;width:2px;background:${C.accent};pointer-events:none;z-index:20;transition:left .05s linear;}

/* MIXER strip */
.mix{height:180px;flex-shrink:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;flex-direction:column;}
.mix-hdr{height:26px;flex-shrink:0;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;}
.mix-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.mix-body{flex:1;display:flex;overflow-x:auto;padding:6px 10px;gap:5px;align-items:flex-end;}
.ch{display:flex;flex-direction:column;align-items:center;gap:3px;width:46px;flex-shrink:0;}
.ch-name{font-size:7px;letter-spacing:.06em;text-transform:uppercase;color:${C.textDim};text-align:center;}
.ch-meter{display:flex;gap:1px;height:60px;align-items:flex-end;}
.ch-bar{width:3px;background:${C.surfaceAlt};border-radius:1px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;}
.ch-fill{width:100%;border-radius:1px;transition:height .07s ease;}
.fader-t{width:4px;height:80px;background:${C.surfaceAlt};border-radius:2px;position:relative;cursor:pointer;border:1px solid ${C.border};}
.fader-f{position:absolute;bottom:0;left:0;right:0;border-radius:2px;}
.fader-th{position:absolute;left:50%;transform:translateX(-50%);width:12px;height:5px;background:${C.borderBright};border-radius:2px;cursor:grab;}
.ch-btns{display:flex;gap:2px;}
.ch-btn{width:16px;height:12px;border-radius:2px;border:none;cursor:pointer;font-size:6px;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;justify-content:center;}
.ch-m{background:#ffaa0018;color:${C.warn};}
.ch-s{background:${C.accentDim};color:${C.accent};}
.ch-cb{width:100%;height:2px;border-radius:1px;}
.ch-val{font-size:7px;color:${C.textMuted};}

/* AS SHELL */
.shell{height:160px;flex-shrink:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;flex-direction:column;}
.shell-hdr{height:26px;flex-shrink:0;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;gap:8px;}
.shell-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.shell-badge{font-size:9px;padding:1px 6px;border-radius:10px;background:${C.accentDim};color:${C.accent};border:1px solid ${C.accentMid};}
.shell-body{flex:1;overflow-y:auto;padding:6px 10px;display:flex;flex-direction:column;gap:2px;}
.shell-line{display:flex;gap:8px;font-size:10px;line-height:17px;}
.shell-time{color:${C.textMuted};flex-shrink:0;font-size:9px;}
.shell-ok{color:${C.accent};}
.shell-info{color:${C.textDim};}
.shell-warn{color:${C.warn};}
.shell-j{color:${C.juniper};}
.shell-input-row{height:28px;flex-shrink:0;border-top:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;gap:8px;}
.shell-prompt{color:${C.accent};font-size:11px;flex-shrink:0;}
.shell-input{flex:1;background:transparent;border:none;outline:none;color:${C.text};font-family:'JetBrains Mono',monospace;font-size:11px;caret-color:${C.accent};}
.shell-cursor{display:inline-block;width:7px;height:12px;background:${C.accent};animation:blink 1s step-end infinite;vertical-align:middle;margin-left:2px;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.shell-hint{font-size:9px;color:${C.textMuted};}

/* RIGHT PANEL */
.rp{width:210px;flex-shrink:0;background:${C.surface};border-left:1px solid ${C.border};display:flex;flex-direction:column;overflow:hidden;}
.rp-hdr{height:28px;flex-shrink:0;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;}
.rp-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.rp-sec{border-bottom:1px solid ${C.border};padding:8px 10px;}
.rp-lbl{font-size:9px;letter-spacing:.12em;color:${C.textMuted};text-transform:uppercase;margin-bottom:6px;}

/* EQ */
.eq-graph{width:100%;height:52px;display:block;}
.eq-bands{display:flex;justify-content:space-between;margin-top:4px;}
.eq-band{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;}
.eq-knob{width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#1e1e1e,#0a0a0a);border:1px solid ${C.borderBright};position:relative;transition:border-color .15s;}
.eq-knob:hover{border-color:${C.accent};}
.eq-ind{position:absolute;width:1.5px;height:5px;background:${C.accent};border-radius:1px;left:50%;top:3px;transform-origin:bottom center;}
.eq-lbl{font-size:7px;color:${C.textMuted};}
.eq-hz{font-size:7px;color:${C.textDim};}

/* Knobs */
.knobs{display:flex;gap:6px;justify-content:space-around;}
.knob-w{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;}
.knob{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#1e1e1e,#0a0a0a);border:1.5px solid ${C.borderBright};position:relative;transition:border-color .15s;}
.knob:hover{border-color:${C.accent};}
.knob-ind{position:absolute;width:1.5px;height:7px;background:${C.accent};border-radius:1px;left:50%;top:3px;transform-origin:bottom center;box-shadow:0 0 3px ${C.accent};}
.knob-lbl{font-size:8px;color:${C.textMuted};}
.knob-val{font-size:8px;color:${C.textDim};}

/* Waveform */
.wave{width:100%;height:34px;display:block;}

/* Juniper panel */
.j-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
.j-msgs{flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:4px;}
.j-msg{font-size:10px;line-height:15px;}
.j-msg.ai{color:${C.juniper};padding:4px 6px;background:${C.juniperDim};border-radius:3px;border-left:2px solid ${C.juniper};}
.j-msg.user{color:${C.textDim};}
.j-inp-row{padding:5px 7px;border-top:1px solid ${C.border};display:flex;gap:4px;}
.j-inp{flex:1;background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:3px;padding:3px 6px;color:${C.text};font-size:10px;font-family:'JetBrains Mono',monospace;outline:none;}
.j-inp:focus{border-color:${C.juniper};}
.j-send{width:20px;height:20px;background:${C.juniperDim};border:1px solid #7c6af730;border-radius:3px;color:${C.juniper};cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;}

/* TRANSPORT */
.tr{height:40px;flex-shrink:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;align-items:center;padding:0 12px;gap:12px;}
.tr-btn{width:24px;height:24px;border-radius:4px;cursor:pointer;background:${C.surfaceAlt};border:1px solid ${C.border};display:flex;align-items:center;justify-content:center;color:${C.textDim};font-size:10px;transition:all .1s;flex-shrink:0;}
.tr-btn:hover{border-color:${C.borderBright};color:${C.text};}
.tr-btn.on{background:${C.accentDim};border-color:${C.accentMid};color:${C.accent};}
.tr-btn.rec{background:#ff445515;border-color:#ff445540;color:${C.err};}
.tr-btn.rec.on{background:#ff445530;box-shadow:0 0 6px ${C.err};}
.tr-bpm{display:flex;align-items:center;gap:4px;}
.tr-bpm-l{font-size:8px;color:${C.textMuted};letter-spacing:.1em;}
.tr-bpm-v{font-size:17px;font-weight:600;color:${C.text};letter-spacing:-.02em;cursor:pointer;}
.tr-bpm-v:hover{color:${C.accent};}
.tr-sig{font-size:9px;color:${C.textMuted};display:flex;flex-direction:column;line-height:1.1;}
.tr-time{font-size:13px;color:${C.textDim};font-variant-numeric:tabular-nums;}
.tr-sp{flex:1;}
.tr-snap{display:flex;align-items:center;gap:3px;}
.tr-snap-l{font-size:8px;color:${C.textMuted};letter-spacing:.08em;margin-right:2px;}
.snap{background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:3px;padding:2px 5px;font-size:8px;color:${C.textDim};cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.snap.on{background:${C.accentDim};border-color:${C.accentMid};color:${C.accent};}

/* STATUSBAR */
.stb{height:21px;flex-shrink:0;background:#060606;border-top:1px solid ${C.border};display:flex;align-items:center;padding:0 6px;font-size:10px;}
.stb-i{padding:0 7px;height:100%;display:flex;align-items:center;gap:4px;color:${C.textDim};border-right:1px solid ${C.border};cursor:default;white-space:nowrap;}
.stb-i:hover{background:${C.surfaceAlt};}
.stb-dot{width:4px;height:4px;border-radius:50%;}
.stb-sp{flex:1;}

/* Scrollbars */
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:${C.borderBright};}
`;

function WaveCanvas({ active }) {
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
        const amp = active ? (0.28+.15*Math.sin(t*9+ph*.6)) : 0.03;
        const y = mid + Math.sin(t*32+ph)*amp*mid + Math.sin(t*14+ph*1.2)*amp*.3*mid;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle = active ? C.accent : C.borderBright;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = active ? C.accent : "transparent";
      ctx.shadowBlur = active ? 4 : 0;
      ctx.stroke();
      ph += active ? .07 : .006;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={ref} className="wave" width={186} height={34}/>;
}

function EQGraph({ bands }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    // grid
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 0.5;
    [0.25,0.5,0.75].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0,y*h); ctx.lineTo(w,y*h); ctx.stroke();
    });
    // EQ curve
    ctx.beginPath();
    const mid = h/2;
    const step = w/(bands.length+1);
    bands.forEach((b,i) => {
      const x = step*(i+1);
      const y = mid - (b.gain/12)*mid*0.8;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = C.accent;
    ctx.shadowBlur = 4;
    ctx.stroke();
    // dots
    bands.forEach((b,i) => {
      const x = step*(i+1);
      const y = mid - (b.gain/12)*mid*0.8;
      ctx.beginPath();
      ctx.arc(x,y,3,0,Math.PI*2);
      ctx.fillStyle = C.accent;
      ctx.fill();
    });
  }, [bands]);
  return <canvas ref={ref} className="eq-graph" width={186} height={52}/>;
}

function ChMeter({ active, color }) {
  const [lvls, setLvls] = useState([0,0]);
  useEffect(() => {
    if (!active){setLvls([0,0]);return;}
    const id = setInterval(()=>setLvls([
      Math.max(0,Math.min(1,.55+Math.random()*.4)),
      Math.max(0,Math.min(1,.5+Math.random()*.4)),
    ]),80);
    return ()=>clearInterval(id);
  },[active]);
  return (
    <div className="ch-meter">
      {lvls.map((l,i)=>{
        const col = l>.88?C.err:l>.72?C.warn:color;
        return <div key={i} className="ch-bar"><div className="ch-fill" style={{height:`${l*100}%`,background:col,opacity:.85}}/></div>;
      })}
    </div>
  );
}

function fmt(s){
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}:00`;
}

const SNAPS = ["1/1","1/2","1/4","1/8","1/16"];
const MODES = ["STUDIO","LIVE","PERFORM"];
const JUNIPER_MSGS = [
  {type:"ai",  text:"Ready — OOEPUI_NIGHT_01 indexed."},
  {type:"user",text:"make the drop harder"},
  {type:"ai",  text:"Raising kick compression to 6:1, pushing bass +2dB. Tighten snare transient?"},
  {type:"user",text:"yes + reverb tail on vocal chop"},
  {type:"ai",  text:"Done. Pre-delay 18ms, decay 1.2s. Listening..."},
];

export default function AudioMIXFull() {
  const [mode, setMode] = useState("STUDIO");
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [snap, setSnap] = useState("1/4");
  const [shellInput, setShellInput] = useState("");
  const [shellHistory, setShellHistory] = useState(AS_HISTORY);
  const [jInput, setJInput] = useState("");
  const [jMsgs, setJMsgs] = useState(JUNIPER_MSGS);
  const [eqBands, setEqBands] = useState(EQ_BANDS);
  const shellRef = useRef();

  useEffect(()=>{
    if (!playing) return;
    const id = setInterval(()=>{
      setTime(t=>t+1);
      setPlayhead(p=>{const n=p+0.0625; return n>=BARS?0:n;});
    },250);
    return ()=>clearInterval(id);
  },[playing]);

  useEffect(()=>{
    if (shellRef.current) shellRef.current.scrollTop = shellRef.current.scrollHeight;
  },[shellHistory]);

  function stop(){setPlaying(false);setRecording(false);setTime(0);setPlayhead(0);}

  function sendShell(){
    if (!shellInput.trim()) return;
    const cmd = shellInput.trim();
    setShellHistory(h=>[...h,
      {type:"user", time:fmt(time), text:`🎛️ > ${cmd}`},
      {type:"ok",   time:fmt(time), text:`${cmd} → OK`},
    ]);
    setShellInput("");
  }

  function sendJuniper(){
    if (!jInput.trim()) return;
    setJMsgs(m=>[...m,
      {type:"user", text:jInput},
      {type:"ai",   text:"Analysing context..."},
    ]);
    setJInput("");
  }

  const halStatusColor = (s) =>
    s==="online"?C.accent:s==="idle"?C.warn:C.textDim;

  return (
    <>
      <style>{css}</style>
      <div className="root">

        {/* TOPBAR */}
        <div className="tb">
          <div className="tb-logo">
            <div className="tb-pulse"/>
            AUDIOMIX
          </div>
          <div className="divv"/>
          <div className="tb-modes">
            {MODES.map(m=>(
              <button key={m} className={`tb-mode${mode===m?" on":""}`} onClick={()=>setMode(m)}>{m}</button>
            ))}
          </div>
          <div className="tb-sp"/>
          <div className="tb-proj">Project: <span>OOEPUI_NIGHT_01</span></div>
          <div className="divv"/>
          <div className="tb-j"><div className="jdot"/>Juniper2.0</div>
        </div>

        {/* BODY */}
        <div className="body">

          {/* SIDEBAR */}
          <div className="sb">
            <div className="sb-sec">
              <div className="sb-lbl">Browser</div>
              {[["Arrangement",8],["Samples",142],["Instruments",24],["Effects",38]].map(([l,c],i)=>(
                <div key={i} className={`sb-item${i===0?" on":""}`}>
                  <div className="sb-dot"/>{l}
                  <div className="sb-cnt">{c}</div>
                </div>
              ))}
            </div>
            <div className="sb-sec">
              <div className="sb-lbl">Scenes</div>
              {["drop_sequence","intro","build_up","outro"].map((s,i)=>(
                <div key={i} className={`sb-item${i===0?" on":""}`}>
                  <div className="sb-dot"/>{s}
                </div>
              ))}
            </div>
            <div className="sb-sec">
              <div className="sb-lbl">AudioScript</div>
              <div className="sb-item on"><div className="sb-dot"/>IR v1<div className="sb-cnt" style={{color:C.accent}}>✓</div></div>
              <div className="sb-item"><div className="sb-dot"/>Live<div className="sb-cnt" style={{color:C.warn}}>dev</div></div>
            </div>
            {/* HAL Devices */}
            <div className="sb-sec" style={{flex:1}}>
              <div className="sb-lbl">HAL Devices</div>
              {HAL_DEVICES.map((d,i)=>(
                <div key={i} className="hal-item">
                  <div className="hal-dot" style={{
                    background:halStatusColor(d.status),
                    boxShadow:d.status==="online"?`0 0 4px ${C.accent}`:d.status==="idle"?`0 0 4px ${C.warn}`:"none",
                    animation:d.status==="online"?"glow 2s infinite":"none",
                  }}/>
                  <div style={{flex:1}}>
                    <div className="hal-name">{d.name}</div>
                    <div className="hal-detail">{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div className="center">

            {/* ARRANGEMENT */}
            <div className="arr">
              <div className="arr-hdr">
                <span className="arr-title">Arrangement</span>
                <div className="arr-sp"/>
                <button className="abtn">+ Track</button>
                <button className="abtn pri">Compile IR</button>
              </div>
              <div className="arr-body">
                {/* Track headers */}
                <div className="th">
                  {TRACKS.map((tr,i)=>(
                    <div key={tr.id} className="thr">
                      <div className="tc" style={{background:tr.color}}/>
                      <div style={{flex:1}}>
                        <div className="tn">{tr.name}</div>
                        <div className="tt">{tr.type}</div>
                      </div>
                      <button className="tbtn m">M</button>
                      <button className="tbtn s">S</button>
                    </div>
                  ))}
                </div>
                {/* Timeline */}
                <div className="tl">
                  <div className="ruler" style={{position:"relative",width:`${BARS*BW}px`}}>
                    {Array.from({length:BARS},(_,i)=>(
                      <div key={i} className={`rbar${i%4===0?" db":""}`} style={{width:`${BW}px`}}>
                        {i%4===0?`${i/4+1}`:"·"}
                      </div>
                    ))}
                    <div className="rph" style={{left:`${playhead*BW}px`}}/>
                  </div>
                  <div className="lanes" style={{position:"relative",width:`${BARS*BW}px`}}>
                    <div className="ph" style={{left:`${playhead*BW}px`}}/>
                    {TRACKS.map(tr=>(
                      <div key={tr.id} className="lane" style={{width:`${BARS*BW}px`}}>
                        {tr.clips.map((cl,ci)=>(
                          <div key={ci} className="clip" style={{
                            left:`${cl.s*BW}px`,
                            width:`${cl.l*BW-2}px`,
                            background:`${tr.color}20`,
                            border:`1px solid ${tr.color}55`,
                            color:tr.color,
                          }}>
                            {ci===0?tr.name:""}
                            <div style={{position:"absolute",bottom:2,left:0,right:0,height:7,display:"flex",gap:1,padding:"0 4px",alignItems:"flex-end",opacity:.4}}>
                              {Array.from({length:Math.floor(cl.l*5)},(_,wi)=>(
                                <div key={wi} style={{flex:1,background:tr.color,borderRadius:1,height:`${25+Math.sin(wi*1.9)*60}%`}}/>
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
            <div className="mix">
              <div className="mix-hdr"><span className="mix-title">Mixer</span></div>
              <div className="mix-body">
                {MIXER.map((ch,i)=>(
                  <div key={i} className="ch">
                    <div className="ch-cb" style={{background:ch.color,opacity:.7}}/>
                    <ChMeter active={playing} color={ch.color}/>
                    <div className="fader-t">
                      <div className="fader-f" style={{height:`${ch.vol}%`,background:`${ch.color}33`}}/>
                      <div className="fader-th" style={{bottom:`${ch.vol}%`,marginBottom:-2}}/>
                    </div>
                    <div className="ch-btns">
                      <button className="ch-btn ch-m">M</button>
                      <button className="ch-btn ch-s">S</button>
                    </div>
                    <div className="ch-val">{ch.vol===90?"0dB":`-${((90-ch.vol)/10)|0}dB`}</div>
                    <div className="ch-name">{ch.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AS SHELL */}
            <div className="shell">
              <div className="shell-hdr">
                <span className="shell-title">AudioScript Shell</span>
                <span className="shell-badge">v0.1</span>
                <div style={{flex:1}}/>
                <span style={{fontSize:9,color:C.textMuted}}>
                  {/* TODO: show connected/disconnected based on FastAPI bridge status */}
                  FastAPI bridge — not connected
                </span>
              </div>
              <div className="shell-body" ref={shellRef}>
                {shellHistory.map((l,i)=>(
                  <div key={i} className="shell-line">
                    <span className="shell-time">{l.time}</span>
                    <span className={`shell-${l.type==="juniper"?"j":l.type}`}>{l.text}</span>
                  </div>
                ))}
                {playing && (
                  <div className="shell-line">
                    <span className="shell-time">{fmt(time)}</span>
                    <span className="shell-ok">engine running<span className="shell-cursor"/></span>
                  </div>
                )}
              </div>
              <div className="shell-input-row">
                <span className="shell-prompt">🎛️ &gt;</span>
                <input
                  className="shell-input"
                  value={shellInput}
                  onChange={e=>setShellInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendShell()}
                  placeholder="type AudioScript commands..."
                />
                <span className="shell-hint">Enter ↵</span>
              </div>
            </div>

          </div>{/* end center */}

          {/* RIGHT PANEL */}
          <div className="rp">
            <div className="rp-hdr"><span className="rp-title">Inspector</span></div>

            {/* Waveform */}
            <div className="rp-sec">
              <div className="rp-lbl">Output</div>
              <WaveCanvas active={playing}/>
            </div>

            {/* EQ */}
            <div className="rp-sec">
              <div className="rp-lbl">EQ</div>
              <EQGraph bands={eqBands}/>
              <div className="eq-bands">
                {eqBands.map((b,i)=>(
                  <div key={i} className="eq-band">
                    <div className="eq-knob">
                      <div className="eq-ind" style={{transform:`translateX(-50%) rotate(${b.gain*6}deg)`}}/>
                    </div>
                    <div className="eq-lbl">{b.label}</div>
                    <div className="eq-hz">{b.hz}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DSP Knobs */}
            <div className="rp-sec">
              <div className="rp-lbl">DSP</div>
              <div className="knobs">
                {[["GAIN","0dB",0],["REV","40%",-40],["COMP","2:1",30],["DLY","18ms",-20]].map(([l,v,a])=>(
                  <div key={l} className="knob-w">
                    <div className="knob">
                      <div className="knob-ind" style={{transform:`translateX(-50%) rotate(${a}deg)`}}/>
                    </div>
                    <div className="knob-lbl">{l}</div>
                    <div className="knob-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Juniper2.0 */}
            <div className="j-panel">
              <div style={{padding:"5px 8px 3px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:4}}>
                <div className="jdot"/>
                <span style={{fontSize:10,color:C.juniper,letterSpacing:".08em"}}>Juniper2.0</span>
              </div>
              <div className="j-msgs">
                {jMsgs.map((m,i)=>(
                  <div key={i} className={`j-msg ${m.type}`}>{m.text}</div>
                ))}
              </div>
              <div className="j-inp-row">
                <input
                  className="j-inp"
                  placeholder="ask Juniper..."
                  value={jInput}
                  onChange={e=>setJInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendJuniper()}
                />
                <button className="j-send" onClick={sendJuniper}>↵</button>
              </div>
            </div>

          </div>
        </div>

        {/* TRANSPORT */}
        <div className="tr">
          <div className="tr-btn" onClick={stop}>■</div>
          <div className={`tr-btn${playing?" on":""}`} onClick={()=>setPlaying(p=>!p)}>{playing?"⏸":"▶"}</div>
          <div className={`tr-btn rec${recording?" on":""}`} onClick={()=>setRecording(r=>!r)}>⏺</div>
          <div className="divv"/>
          <div className="tr-bpm">
            <span className="tr-bpm-l">BPM</span>
            <span className="tr-bpm-v">138</span>
          </div>
          <div className="tr-sig"><span>4</span><span>4</span></div>
          <div className="tr-time">{fmt(time)}</div>
          <div className="tr-sp"/>
          <div className="tr-snap">
            <span className="tr-snap-l">SNAP</span>
            {SNAPS.map(s=>(
              <button key={s} className={`snap${snap===s?" on":""}`} onClick={()=>setSnap(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* STATUSBAR */}
        <div className="stb">
          <div className="stb-i">
            <div className="stb-dot" style={{background:playing?C.accent:C.textMuted,boxShadow:playing?`0 0 4px ${C.accent}`:"none"}}/>
            <span style={{color:playing?C.accent:C.textDim}}>{playing?"online":"idle"}</span>
          </div>
          <div className="stb-i">OOEPUI_NIGHT_01</div>
          <div className="stb-i">{mode}</div>
          <div className="stb-i" style={{color:C.accent}}>IR v1 ✓</div>
          <div className="stb-sp"/>
          <div className="stb-i" style={{color:C.juniper}}>Juniper2.0 ready</div>
          <div className="stb-i">
            {/* TODO: real-time from engine via WebSocket */}
            48 kHz • 256 • 12.0 ms
          </div>
          <div className="stb-i">
            {/* TODO: from sys:get-stats IPC */}
            CPU 6%
          </div>
        </div>

      </div>
    </>
  );
}
