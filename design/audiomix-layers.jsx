import { useState, useEffect, useRef, useCallback } from "react";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg:         "#070707",
  surface:    "#0e0e0e",
  surfaceAlt: "#121212",
  surfaceHov: "#161616",
  border:     "#1a1a1a",
  borderBr:   "#252525",
  accent:     "#00ff9f",
  accentDim:  "#00ff9f15",
  accentMid:  "#00ff9f44",
  juniper:    "#7c6af7",
  juniperDim: "#7c6af718",
  pink:       "#ff6ac1",
  blue:       "#4d9fff",
  warn:       "#ffaa00",
  err:        "#ff4455",
  cyan:       "#00cfff",
  yellow:     "#f1fa8c",
  text:       "#d0d0d0",
  textDim:    "#484848",
  textMuted:  "#1e1e1e",
};

// ── FREQ BANDS ────────────────────────────────────────────────────────────────
const FREQ_BANDS = [
  { label:"SUB",     hz:"20–60",    color:"#ff4455" },
  { label:"BASS",    hz:"60–250",   color:"#ff6ac1" },
  { label:"LO MID",  hz:"250–500",  color:"#ffaa00" },
  { label:"MID",     hz:"500–2k",   color:"#f1fa8c" },
  { label:"HI MID",  hz:"2k–6k",    color:"#00ff9f" },
  { label:"PRESENCE",hz:"6k–12k",   color:"#4d9fff" },
  { label:"AIR",     hz:"12k–20k",  color:"#7c6af7" },
];

// ── CLIP DATA MODEL ───────────────────────────────────────────────────────────
// Each clip is a container with layers inside
// layers blend together to form the final sound
const INITIAL_CLIPS = [
  {
    id:"c1", track:0, start:0, len:4,
    name:"BASS FOUNDATION",
    layers:[
      { id:"l1a", name:"bass_stab.wav",  color:"#ff6ac1", gain:0.85,
        freqProfile:[0.8,0.9,0.3,0.1,0.0,0.0,0.0] },
      { id:"l1b", name:"sub_sine.wav",   color:"#ff4455", gain:0.6,
        freqProfile:[0.95,0.5,0.1,0.0,0.0,0.0,0.0] },
      { id:"l1c", name:"reese_bass.wav", color:"#ffaa00", gain:0.4,
        freqProfile:[0.4,0.8,0.6,0.2,0.0,0.0,0.0] },
    ],
  },
  {
    id:"c2", track:0, start:6, len:6,
    name:"BASS FOUNDATION",
    layers:[
      { id:"l2a", name:"bass_stab.wav",  color:"#ff6ac1", gain:0.85,
        freqProfile:[0.8,0.9,0.3,0.1,0.0,0.0,0.0] },
      { id:"l2b", name:"sub_sine.wav",   color:"#ff4455", gain:0.6,
        freqProfile:[0.95,0.5,0.1,0.0,0.0,0.0,0.0] },
    ],
  },
  {
    id:"c3", track:1, start:4, len:8,
    name:"TEXTURE CLOUD",
    layers:[
      { id:"l3a", name:"lead_synth.wav", color:"#00ff9f", gain:0.75,
        freqProfile:[0.0,0.1,0.4,0.9,0.8,0.3,0.1] },
      { id:"l3b", name:"synth_pad.wav",  color:"#7c6af7", gain:0.5,
        freqProfile:[0.1,0.2,0.6,0.8,0.5,0.2,0.0] },
    ],
  },
  {
    id:"c4", track:2, start:0, len:16,
    name:"ATMOSPHERE",
    layers:[
      { id:"l4a", name:"chord_pad.wav",  color:"#7c6af7", gain:0.6,
        freqProfile:[0.1,0.2,0.6,0.8,0.5,0.2,0.0] },
      { id:"l4b", name:"strings.wav",    color:"#4d9fff", gain:0.35,
        freqProfile:[0.0,0.1,0.3,0.7,0.9,0.6,0.2] },
      { id:"l4c", name:"shimmer.wav",    color:"#00cfff", gain:0.25,
        freqProfile:[0.0,0.0,0.1,0.3,0.6,0.9,0.8] },
    ],
  },
  {
    id:"c5", track:3, start:3, len:5,
    name:"VOCAL TEXTURE",
    layers:[
      { id:"l5a", name:"vocal_chop.wav", color:"#ff4455", gain:0.8,
        freqProfile:[0.0,0.1,0.3,0.7,0.9,0.6,0.2] },
      { id:"l5b", name:"formant.wav",    color:"#ffaa00", gain:0.3,
        freqProfile:[0.0,0.0,0.2,0.8,0.7,0.4,0.1] },
    ],
  },
  {
    id:"c6", track:3, start:11, len:4,
    name:"VOCAL TEXTURE",
    layers:[
      { id:"l6a", name:"vocal_chop.wav", color:"#ff4455", gain:0.8,
        freqProfile:[0.0,0.1,0.3,0.7,0.9,0.6,0.2] },
    ],
  },
];

const TRACKS = [
  { id:0, name:"BASS LAYER",   type:"synth", color:"#ff6ac1" },
  { id:1, name:"TEXTURE",      type:"synth", color:"#00ff9f" },
  { id:2, name:"ATMOSPHERE",   type:"synth", color:"#7c6af7" },
  { id:3, name:"VOCAL CHOP",   type:"audio", color:"#ff4455" },
];

const BARS = 16;
const BW   = 52;
const TRACK_H = 64; // taller tracks to show layer stack

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;1,300&family=Syne:wght@400;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'JetBrains Mono',monospace;font-size:11px;}
.root{display:flex;flex-direction:column;height:100vh;width:100vw;overflow:hidden;background:${C.bg};}

/* TOPBAR */
.topbar{height:38px;flex-shrink:0;background:${C.surface};border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:10px;padding:0 14px;}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:${C.accent};letter-spacing:.1em;display:flex;align-items:center;gap:7px;}
.logo-dot{width:6px;height:6px;border-radius:50%;background:${C.accent};box-shadow:0 0 10px ${C.accent};animation:glow 2s ease-in-out infinite;}
@keyframes glow{0%,100%{opacity:1;box-shadow:0 0 10px ${C.accent}}50%{opacity:.3;box-shadow:none}}
.sp{flex:1;}
.divv{width:1px;height:16px;background:${C.border};}

/* VIEW TOGGLE */
.vtog{display:flex;background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:5px;overflow:hidden;}
.vbtn{padding:5px 14px;border:none;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;background:transparent;color:${C.textDim};display:flex;align-items:center;gap:6px;transition:all .2s;}
.vbtn+.vbtn{border-left:1px solid ${C.border};}
.vbtn.on{background:${C.accentDim};color:${C.accent};}
.vbtn.on.sp{background:#7c6af718;color:#7c6af7;}

/* MAIN LAYOUT */
.body{flex:1;display:flex;overflow:hidden;min-height:0;}

/* LEFT PANEL — track headers + layer inspector */
.left{width:220px;flex-shrink:0;background:${C.surface};border-right:1px solid ${C.border};display:flex;flex-direction:column;overflow:hidden;}
.left-top{flex:1;overflow-y:auto;min-height:0;}
.th{height:${TRACK_H}px;border-bottom:1px solid ${C.border};display:flex;flex-direction:column;justify-content:center;padding:6px 10px;background:${C.surface};cursor:pointer;transition:background .1s;gap:3px;}
.th:hover{background:${C.surfaceHov};}
.th.selected{background:#00ff9f08;border-left:2px solid ${C.accent};}
.th-top{display:flex;align-items:center;gap:6px;}
.th-pill{width:3px;height:18px;border-radius:2px;flex-shrink:0;}
.th-name{font-size:10px;color:${C.text};flex:1;}
.th-type{font-size:8px;color:${C.textDim};}
.th-btns{display:flex;gap:2px;}
.th-btn{width:16px;height:14px;border-radius:2px;border:none;cursor:pointer;font-size:7px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;}
.th-m{background:#ffaa0018;color:${C.warn};}
.th-s{background:${C.accentDim};color:${C.accent};}

/* Layer stack preview in track header */
.layer-stack{display:flex;gap:2px;align-items:center;padding-left:9px;}
.layer-pip{height:8px;border-radius:2px;flex-shrink:0;opacity:.8;}
.layer-count{font-size:8px;color:${C.textDim};margin-left:3px;}

/* CENTER — arrangement canvas */
.center{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}

/* ARRANGEMENT */
.arr{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
.arr-hdr{height:30px;flex-shrink:0;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 12px;gap:8px;}
.arr-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.arr-sp{flex:1;}
.abtn{font-size:10px;color:${C.textDim};cursor:pointer;padding:2px 8px;border-radius:3px;border:1px solid transparent;background:none;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.abtn:hover{border-color:${C.border};color:${C.text};}
.abtn.pri{color:${C.accent};border-color:${C.accentMid};background:${C.accentDim};}
.arr-body{flex:1;display:flex;overflow:hidden;}

/* Timeline */
.tl{flex:1;overflow-x:auto;display:flex;flex-direction:column;}
.ruler{height:20px;flex-shrink:0;display:flex;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};position:relative;}
.rb{width:${BW}px;flex-shrink:0;border-right:1px solid ${C.border};display:flex;align-items:center;padding-left:5px;font-size:8px;color:${C.textMuted};}
.rb.db{color:${C.textDim};border-right-color:${C.borderBr};}
.rph{position:absolute;top:0;bottom:0;width:2px;background:${C.accent};pointer-events:none;z-index:30;box-shadow:0 0 6px ${C.accent};transition:left .05s linear;}

/* Clip lanes */
.lanes{flex:1;overflow-y:hidden;position:relative;}
.lane{
  height:${TRACK_H}px;border-bottom:1px solid ${C.border};
  position:relative;background:${C.surface};
  transition:background .1s;
}
.lane:nth-child(even){background:#0b0b0b;}
.lane.drag-over{background:#00ff9f08;border:1px dashed ${C.accentMid};}
.lane::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0px,transparent ${BW-1}px,${C.border} ${BW-1}px,${C.border} ${BW}px);pointer-events:none;}
.ph{position:absolute;top:0;bottom:0;width:1px;background:${C.accent};box-shadow:0 0 8px ${C.accent};pointer-events:none;z-index:20;transition:left .05s linear;}
.ph::before{content:'';position:absolute;top:0;left:-4px;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid ${C.accent};}

/* LAYERED CLIP */
.clip-container{
  position:absolute;top:6px;
  border-radius:5px;
  overflow:hidden;
  cursor:grab;
  transition:filter .1s, box-shadow .1s, transform .1s;
  user-select:none;
}
.clip-container:hover{filter:brightness(1.15);box-shadow:0 4px 16px rgba(0,0,0,.5);}
.clip-container.dragging{
  cursor:grabbing;
  filter:brightness(1.3);
  box-shadow:0 8px 32px rgba(0,0,0,.8);
  transform:scale(1.02);
  z-index:100;
  opacity:.9;
}
.clip-container.selected{box-shadow:0 0 0 1.5px ${C.accent}, 0 4px 16px rgba(0,255,159,.2);}

/* Layer strips inside clip */
.clip-layers{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
}
.clip-layer-strip{
  flex:1;
  display:flex;align-items:center;
  padding:0 6px;
  gap:4px;
  position:relative;
  overflow:hidden;
}
.cls-name{font-size:7px;letter-spacing:.03em;white-space:nowrap;overflow:hidden;flex:1;font-weight:500;}
.cls-gain{font-size:7px;opacity:.7;flex-shrink:0;}

/* Layer waveform inside strip */
.cls-wave{position:absolute;inset:0;opacity:.3;display:flex;align-items:center;}

/* Clip header */
.clip-header{
  position:absolute;top:0;left:0;right:0;
  height:16px;
  display:flex;align-items:center;
  padding:0 6px;gap:4px;
  z-index:10;
  background:rgba(0,0,0,.4);
  backdrop-filter:blur(2px);
}
.clip-title{font-size:8px;font-weight:600;letter-spacing:.04em;white-space:nowrap;overflow:hidden;flex:1;}
.clip-layer-badge{
  font-size:7px;padding:0 4px;border-radius:8px;
  background:rgba(0,0,0,.5);flex-shrink:0;
}

/* Drop zone indicator */
.drop-indicator{
  position:absolute;top:6px;bottom:6px;
  width:3px;border-radius:2px;
  background:${C.accent};
  box-shadow:0 0 8px ${C.accent};
  pointer-events:none;z-index:50;
  animation:drop-pulse .6s ease-in-out infinite;
}
@keyframes drop-pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* RIGHT PANEL */
.rp{width:260px;flex-shrink:0;background:${C.surface};border-left:1px solid ${C.border};display:flex;flex-direction:column;overflow:hidden;}
.rp-hdr{height:30px;background:${C.surfaceAlt};border-bottom:1px solid ${C.border};display:flex;align-items:center;padding:0 10px;}
.rp-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.rp-sec{border-bottom:1px solid ${C.border};padding:8px 10px;}
.rp-lbl{font-size:9px;letter-spacing:.12em;color:${C.textMuted};text-transform:uppercase;margin-bottom:6px;}

/* Layer editor in right panel */
.layer-editor{display:flex;flex-direction:column;gap:4px;}
.layer-row{
  display:flex;align-items:center;gap:6px;
  padding:5px 7px;border-radius:4px;
  background:${C.surfaceAlt};border:1px solid ${C.border};
  cursor:pointer;transition:all .1s;
}
.layer-row:hover{border-color:${C.borderBr};}
.layer-row.active{border-color:var(--lc);}
.layer-color{width:3px;height:28px;border-radius:2px;flex-shrink:0;}
.layer-info{flex:1;}
.layer-lname{font-size:9px;color:${C.text};}
.layer-lfile{font-size:8px;color:${C.textDim};}
.gain-track{flex:1;height:3px;background:${C.border};border-radius:2px;position:relative;cursor:pointer;}
.gain-fill{height:100%;border-radius:2px;transition:width .1s;}
.gain-val{font-size:8px;color:${C.textDim};width:26px;text-align:right;flex-shrink:0;}
.add-layer-btn{
  width:100%;padding:5px;border-radius:4px;
  border:1px dashed ${C.border};background:none;
  color:${C.textDim};font-size:9px;cursor:pointer;
  font-family:'JetBrains Mono',monospace;
  transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px;
  letter-spacing:.06em;
}
.add-layer-btn:hover{border-color:${C.accent};color:${C.accent};background:${C.accentDim};}

/* Combined freq profile */
.freq-profile{display:flex;gap:3px;align-items:flex-end;height:36px;margin-top:4px;}
.fp-bar{flex:1;border-radius:2px 2px 0 0;transition:height .3s ease;position:relative;}
.fp-lbl{font-size:6px;position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);white-space:nowrap;}

/* Juniper insight */
.j-insight{
  background:${C.juniperDim};border:1px solid #7c6af730;
  border-radius:4px;padding:6px 8px;font-size:9px;
  color:#7c6af7;line-height:15px;
}
.j-insight-title{font-size:8px;letter-spacing:.1em;color:#7c6af7;opacity:.7;margin-bottom:3px;text-transform:uppercase;}

/* AUDIOSCRIPT preview */
.as-preview{
  background:#070710;border:1px solid #7c6af720;
  border-radius:4px;padding:6px 8px;font-size:9px;
  line-height:16px;
}
.as-kw{color:#ff79c6;}
.as-fn{color:#50fa7b;}
.as-str{color:#f1fa8c;}
.as-num{color:#bd93f9;}
.as-cm{color:#444;font-style:italic;}

/* SPECTRO */
.spectro-wrap{flex:1;display:flex;overflow:hidden;}
.spectro-labels{width:72px;flex-shrink:0;border-right:1px solid ${C.border};display:flex;flex-direction:column;justify-content:space-between;padding:4px 0;background:${C.surface};}
.spectro-label{display:flex;align-items:center;padding:0 8px;gap:4px;font-size:7px;}
.spectro-canvas-area{flex:1;position:relative;overflow:hidden;}

/* TRANSPORT */
.transport{height:40px;flex-shrink:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;align-items:center;padding:0 14px;gap:12px;}
.t-btn{width:24px;height:24px;border-radius:4px;cursor:pointer;background:${C.surfaceAlt};border:1px solid ${C.border};display:flex;align-items:center;justify-content:center;color:${C.textDim};font-size:10px;transition:all .1s;}
.t-btn:hover{border-color:${C.borderBr};color:${C.text};}
.t-btn.on{background:${C.accentDim};border-color:${C.accentMid};color:${C.accent};}
.t-bpm-v{font-size:17px;font-weight:600;color:${C.text};letter-spacing:-.02em;}
.t-bpm-l{font-size:8px;color:${C.textMuted};letter-spacing:.1em;}
.t-time{font-size:13px;color:${C.textDim};font-variant-numeric:tabular-nums;}
.t-sp{flex:1;}

/* STATUSBAR */
.statusbar{height:21px;flex-shrink:0;background:#060606;border-top:1px solid ${C.border};display:flex;align-items:center;padding:0 6px;font-size:10px;}
.sb-i{padding:0 8px;height:100%;display:flex;align-items:center;gap:4px;color:${C.textDim};border-right:1px solid ${C.border};cursor:default;}
.sb-i:hover{background:${C.surfaceAlt};}
.sb-dot{width:4px;height:4px;border-radius:50%;}
.sb-sp{flex:1;}

::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(s){return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}:00`;}

function computeFreqProfile(layers) {
  // Blend all layer freq profiles weighted by gain
  const result = Array(7).fill(0);
  const totalGain = layers.reduce((s,l)=>s+l.gain,0);
  layers.forEach(l => {
    l.freqProfile.forEach((e,i) => {
      result[i] += e * (l.gain / totalGain);
    });
  });
  return result.map(v => Math.min(1, v));
}

function generateASCode(clip) {
  const lines = [];
  lines.push(`<span class="as-cm">// ${clip.name}</span>`);
  lines.push(`<span class="as-kw">layer</span>(`);
  clip.layers.forEach((l,i) => {
    const comma = i < clip.layers.length-1 ? "," : "";
    lines.push(`  <span class="as-str">"${l.name}"</span>, blend=<span class="as-num">${l.gain.toFixed(2)}</span>${comma}`);
  });
  lines.push(`)`);
  return lines.join("\n");
}

// ── SPECTROGRAM CANVAS ────────────────────────────────────────────────────────
function SpectroCanvas({ clips, playhead, playing }) {
  const ref = useRef();
  const phaseRef = useRef(0);

  useEffect(()=>{
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    // Build energy map from layered clips
    function buildEnergyMap() {
      const map = [];
      for (let bar=0;bar<BARS;bar++) {
        const bandEnergy = Array(7).fill(0);
        clips.forEach(clip => {
          if (bar >= clip.start && bar < clip.start + clip.len) {
            const profile = computeFreqProfile(clip.layers);
            profile.forEach((e,i) => {
              bandEnergy[i] = Math.min(1, bandEnergy[i] + e * 0.8);
            });
          }
        });
        map.push(bandEnergy);
      }
      return map;
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h;
      if (!w||!h){raf=requestAnimationFrame(draw);return;}

      ctx.clearRect(0,0,w,h);
      const energyMap = buildEnergyMap();
      const barW = w/BARS;
      const bandH = h/7;
      const ph = phaseRef.current;

      energyMap.forEach((bands,bi)=>{
        bands.forEach((energy,fi)=>{
          const x = bi*barW;
          const y = (6-fi)*bandH;
          const col = FREQ_BANDS[fi].color;
          const anim = playing ? Math.max(0,Math.min(1,energy+Math.sin(ph+bi*.3+fi*.7)*.07)) : energy;
          if (anim < 0.05){ctx.fillStyle="#0d0d0d";ctx.fillRect(x+1,y+1,barW-2,bandH-2);return;}
          const alpha = 0.12 + anim*0.78;
          const grad = ctx.createLinearGradient(x,y,x,y+bandH);
          grad.addColorStop(0,`${col}${Math.round(alpha*255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(1,`${col}${Math.round(alpha*.25*255).toString(16).padStart(2,"0")}`);
          ctx.fillStyle=grad;
          ctx.fillRect(x+1,y+1,barW-2,bandH-2);
          if (anim>.35){
            ctx.fillStyle=col;
            ctx.globalAlpha=anim*.85;
            ctx.fillRect(x+1,y+1,(barW-2)*anim,2);
            ctx.globalAlpha=1;
          }
        });
      });

      // Grid
      ctx.strokeStyle=C.border;ctx.lineWidth=.5;
      for(let i=0;i<=BARS;i++){ctx.beginPath();ctx.moveTo(i*barW,0);ctx.lineTo(i*barW,h);ctx.stroke();}
      for(let i=0;i<=7;i++){ctx.beginPath();ctx.moveTo(0,i*bandH);ctx.lineTo(w,i*bandH);ctx.stroke();}

      // Bar numbers
      for(let i=0;i<BARS;i+=4){
        ctx.fillStyle=C.textMuted;ctx.font="8px JetBrains Mono";
        ctx.fillText(`${i/4+1}`,i*barW+4,h-4);
      }

      // Clash detection — highlight SUB+BASS conflicts
      energyMap.forEach((bands,bi)=>{
        if(bands[0]>.55&&bands[1]>.65){
          ctx.strokeStyle=C.err;ctx.lineWidth=1.5;
          ctx.globalAlpha=.5+Math.sin(ph*3)*.4;
          ctx.strokeRect(bi*barW+1,0,barW-2,bandH*2);
          ctx.globalAlpha=1;
        }
      });

      phaseRef.current += .04;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return()=>cancelAnimationFrame(raf);
  },[clips,playing]);

  const pct = (playhead/BARS)*100;
  return (
    <div className="spectro-canvas-area">
      <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>
      <div style={{position:"absolute",top:0,bottom:0,left:`${pct}%`,width:2,background:C.accent,boxShadow:`0 0 8px ${C.accent}`,pointerEvents:"none",transition:"left .05s linear",zIndex:20}}/>
    </div>
  );
}

// ── LAYERED CLIP COMPONENT ────────────────────────────────────────────────────
function LayeredClip({ clip, isSelected, isDragging, onMouseDown, onClick }) {
  const w = clip.len * BW - 3;
  const h = TRACK_H - 12;

  return (
    <div
      className={`clip-container${isSelected?" selected":""}${isDragging?" dragging":""}`}
      style={{
        left: clip.start * BW,
        width: w,
        height: h,
        top: 6,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Layer strips stacked vertically */}
      <div className="clip-layers">
        {clip.layers.map((layer, li) => (
          <div
            key={layer.id}
            className="clip-layer-strip"
            style={{
              background: `${layer.color}${Math.round(layer.gain * 0.35 * 255).toString(16).padStart(2,"00")}`,
              borderBottom: li < clip.layers.length-1 ? `1px solid ${layer.color}20` : "none",
            }}
          >
            {/* Mini waveform */}
            <div className="cls-wave">
              <svg width="100%" height="100%" preserveAspectRatio="none">
                <polyline
                  points={Array.from({length:20},(_,i)=>{
                    const x = (i/(19))*100;
                    const y = 50 + Math.sin(i*1.3+li*2.1)*30*layer.gain;
                    return `${x}%,${y}%`;
                  }).join(" ")}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth="1"
                  opacity="0.6"
                />
              </svg>
            </div>
            <span className="cls-name" style={{color:layer.color}}>{layer.name.replace(".wav","")}</span>
            <span className="cls-gain">{Math.round(layer.gain*100)}%</span>
          </div>
        ))}
      </div>

      {/* Clip header overlay */}
      <div className="clip-header">
        <span className="clip-title" style={{color:clip.layers[0].color}}>
          {clip.name}
        </span>
        <span className="clip-layer-badge" style={{color:clip.layers[0].color}}>
          {clip.layers.length}L
        </span>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AudioMIXLayers() {
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [view, setView] = useState("linear");
  const [selectedClip, setSelectedClip] = useState("c1");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [jMsg, setJMsg] = useState(null);

  useEffect(()=>{
    if(!playing)return;
    const id=setInterval(()=>{
      setTime(t=>t+1);
      setPlayhead(p=>{const n=p+0.0625;return n>=BARS?0:n;});
    },250);
    return()=>clearInterval(id);
  },[playing]);

  // Generate Juniper insight when clip selected
  useEffect(()=>{
    const clip = clips.find(c=>c.id===selectedClip);
    if (!clip) return;
    const profile = computeFreqProfile(clip.layers);
    const dominant = FREQ_BANDS[profile.indexOf(Math.max(...profile))];
    const layerCount = clip.layers.length;
    setJMsg(
      layerCount > 1
        ? `This ${layerCount}-layer clip is dominant in ${dominant.label} (${dominant.hz} Hz). ${layerCount===3?"Rich texture — consider a subtle high-pass on the lowest layer to reduce muddiness.":"Good layering. Adding a shimmer layer could add air above 8kHz."}`
        : `Single layer clip. Try dragging another clip on top to create a layered texture.`
    );
  },[selectedClip, clips]);

  const selected = clips.find(c=>c.id===selectedClip);
  const selectedProfile = selected ? computeFreqProfile(selected.layers) : Array(7).fill(0);

  // ── DRAG AND DROP ──────────────────────────────────────────────────────────
  function handleClipMouseDown(clipId, e) {
    e.preventDefault();
    setDragging({ clipId, startX: e.clientX, startBar: clips.find(c=>c.id===clipId)?.start });
  }

  useEffect(()=>{
    if (!dragging) return;

    function onMove(e) {
      const dx = e.clientX - dragging.startX;
      const barDelta = Math.round(dx / BW);
      const newStart = Math.max(0, Math.min(BARS-1, dragging.startBar + barDelta));
      setDropIndicator({ x: newStart * BW });
    }

    function onUp(e) {
      const dx = e.clientX - dragging.startX;
      const barDelta = Math.round(dx / BW);
      setClips(prev => prev.map(c =>
        c.id === dragging.clipId
          ? { ...c, start: Math.max(0, Math.min(BARS - c.len, c.start + barDelta)) }
          : c
      ));
      setDragging(null);
      setDragOver(null);
      setDropIndicator(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // ── LAYER CONTROLS ─────────────────────────────────────────────────────────
  function updateLayerGain(clipId, layerId, gain) {
    setClips(prev => prev.map(c =>
      c.id === clipId
        ? { ...c, layers: c.layers.map(l => l.id === layerId ? {...l, gain} : l) }
        : c
    ));
  }

  function removeLayer(clipId, layerId) {
    setClips(prev => prev.map(c =>
      c.id === clipId
        ? { ...c, layers: c.layers.filter(l => l.id !== layerId) }
        : c
    ));
  }

  const isSpectro = view === "spectro";

  return (
    <>
      <style>{css}</style>
      <div className="root">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="logo"><div className="logo-dot"/>AUDIOMIX</div>
          <div style={{fontSize:10,color:C.textDim,marginLeft:4}}>
            Studio — <span style={{color:C.text}}>OOEPUI_NIGHT_01</span>
          </div>
          <div className="sp"/>
          <div style={{fontSize:9,color:C.textDim,letterSpacing:".1em",marginRight:6}}>VIEW</div>
          <div className="vtog">
            <button className={`vbtn${!isSpectro?" on":""}`} onClick={()=>setView("linear")}>
              ▬ LINEAR
            </button>
            <button className={`vbtn sp${isSpectro?" on sp":""}`} onClick={()=>setView("spectro")}>
              ◈ FREQUENCY
            </button>
          </div>
          <div className="divv"/>
          <div style={{fontSize:10,color:"#7c6af7",background:"#7c6af718",border:"1px solid #7c6af730",borderRadius:4,padding:"3px 8px",display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#7c6af7",animation:"glow 1.5s infinite"}}/>
            Juniper2.0
          </div>
        </div>

        {/* BODY */}
        <div className="body">

          {/* LEFT — track headers */}
          <div className="left">
            <div className="left-top">
              {TRACKS.map(tr=>{
                const trackClips = clips.filter(c=>c.track===tr.id);
                const totalLayers = trackClips.reduce((s,c)=>s+c.layers.length,0);
                return (
                  <div key={tr.id} className="th">
                    <div className="th-top">
                      <div className="th-pill" style={{background:tr.color}}/>
                      <div style={{flex:1}}>
                        <div className="th-name">{tr.name}</div>
                        <div className="th-type">{tr.type} • {totalLayers} layers total</div>
                      </div>
                      <div className="th-btns">
                        <button className="th-btn th-m">M</button>
                        <button className="th-btn th-s">S</button>
                      </div>
                    </div>
                    {/* Layer color stack preview */}
                    <div className="layer-stack">
                      {trackClips.flatMap(c=>c.layers).slice(0,6).map((l,i)=>(
                        <div key={i} className="layer-pip" style={{
                          width: Math.max(8, 32/Math.max(1,trackClips.flatMap(c=>c.layers).length)),
                          background:l.color,
                          boxShadow:`0 0 4px ${l.color}66`,
                        }}/>
                      ))}
                      {totalLayers > 0 && (
                        <span className="layer-count">{totalLayers}L</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drag hint */}
            <div style={{padding:"8px 10px",borderTop:`1px solid ${C.border}`,fontSize:9,color:C.textDim,lineHeight:15}}>
              <div style={{color:C.accent,marginBottom:3,letterSpacing:".06em"}}>LAYERING</div>
              Drag any clip on top of another to create a layered texture. Blend ratios are adjustable in the inspector.
            </div>
          </div>

          {/* CENTER */}
          <div className="center">
            <div className="arr">
              <div className="arr-hdr">
                <span className="arr-title">
                  Arrangement
                  <span style={{marginLeft:8,fontSize:9,color:isSpectro?"#7c6af7":C.accent,background:isSpectro?"#7c6af718":C.accentDim,border:`1px solid ${isSpectro?"#7c6af740":C.accentMid}`,borderRadius:3,padding:"1px 6px"}}>
                    {isSpectro?"frequency view":"linear view"}
                  </span>
                </span>
                <div className="arr-sp"/>
                <button className="abtn">+ Track</button>
                <button className="abtn pri">Compile IR</button>
              </div>

              <div className="arr-body">
                {/* Timeline */}
                <div className="tl">

                  {/* LINEAR VIEW */}
                  {!isSpectro && (
                    <>
                      <div className="ruler" style={{position:"relative",width:`${BARS*BW}px`,minWidth:"100%"}}>
                        {Array.from({length:BARS},(_,i)=>(
                          <div key={i} className={`rb${i%4===0?" db":""}`} style={{width:`${BW}px`}}>
                            {i%4===0?`${i/4+1}`:"·"}
                          </div>
                        ))}
                        <div className="rph" style={{left:`${playhead*BW}px`}}/>
                      </div>
                      <div className="lanes" style={{position:"relative",width:`${BARS*BW}px`,minWidth:"100%"}}>
                        <div className="ph" style={{left:`${playhead*BW}px`}}/>
                        {dropIndicator && (
                          <div className="drop-indicator" style={{left:dropIndicator.x,top:0}}/>
                        )}
                        {TRACKS.map((tr,ti)=>(
                          <div
                            key={tr.id}
                            className={`lane${dragOver===ti?" drag-over":""}`}
                            style={{width:`${BARS*BW}px`}}
                            onDragOver={e=>{e.preventDefault();setDragOver(ti);}}
                            onDragLeave={()=>setDragOver(null)}
                          >
                            {clips.filter(c=>c.track===tr.id).map(clip=>(
                              <LayeredClip
                                key={clip.id}
                                clip={clip}
                                isSelected={selectedClip===clip.id}
                                isDragging={dragging?.clipId===clip.id}
                                onMouseDown={(e)=>handleClipMouseDown(clip.id,e)}
                                onClick={()=>setSelectedClip(clip.id)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* FREQUENCY VIEW */}
                  {isSpectro && (
                    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
                      <div className="spectro-labels">
                        {[...FREQ_BANDS].reverse().map((b,i)=>(
                          <div key={i} className="spectro-label">
                            <div style={{width:5,height:5,borderRadius:"50%",background:b.color,boxShadow:`0 0 4px ${b.color}`,flexShrink:0}}/>
                            <div>
                              <div style={{fontSize:7,color:C.textDim}}>{b.label}</div>
                              <div style={{fontSize:6,color:C.textMuted}}>{b.hz}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <SpectroCanvas clips={clips} playhead={playhead} playing={playing}/>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div style={{
              height:40,flexShrink:0,
              background:isSpectro?"#0a0a0f":C.surfaceAlt,
              borderTop:`1px solid ${isSpectro?"#7c6af730":C.border}`,
              display:"flex",alignItems:"center",padding:"0 14px",gap:16,fontSize:9,
            }}>
              {isSpectro ? (
                <>
                  <span style={{color:"#7c6af7",fontWeight:600,letterSpacing:".06em"}}>◈ FREQUENCY VIEW</span>
                  <span style={{color:C.textDim}}>Color = frequency energy</span>
                  <span style={{color:C.textDim}}>Height = frequency range</span>
                  <span style={{color:C.err}}>⚠ Red = frequency clash</span>
                  <span style={{marginLeft:"auto",color:"#7c6af7",opacity:.6}}>Juniper2.0 detects clashes automatically →</span>
                </>
              ) : (
                <>
                  <span style={{color:C.accent,fontWeight:600,letterSpacing:".06em"}}>▬ LINEAR VIEW</span>
                  <span style={{color:C.textDim}}>Drag clips to reposition</span>
                  <span style={{color:C.textDim}}>Drop a clip onto another to layer</span>
                  <span style={{color:C.textDim}}>Click a clip to inspect layers →</span>
                  {selected && (
                    <span style={{marginLeft:"auto",color:C.accent}}>
                      {selected.name} — {selected.layers.length} layer{selected.layers.length!==1?"s":""}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — Layer Inspector */}
          <div className="rp">
            <div className="rp-hdr">
              <span className="rp-title">
                {selected ? `${selected.name}` : "Inspector"}
              </span>
            </div>

            {selected && (
              <>
                {/* Layer editor */}
                <div className="rp-sec">
                  <div className="rp-lbl">Layers — {selected.layers.length} active</div>
                  <div className="layer-editor">
                    {selected.layers.map(layer=>(
                      <div key={layer.id} className="layer-row" style={{"--lc":layer.color}}>
                        <div className="layer-color" style={{background:layer.color,boxShadow:`0 0 4px ${layer.color}66`}}/>
                        <div className="layer-info">
                          <div className="layer-lname" style={{color:layer.color}}>{layer.name.replace(".wav","")}</div>
                          <div className="layer-lfile">{layer.name}</div>
                          {/* Gain slider */}
                          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                            <div
                              className="gain-track"
                              onClick={e=>{
                                const rect = e.currentTarget.getBoundingClientRect();
                                const gain = Math.max(0.05, Math.min(1, (e.clientX-rect.left)/rect.width));
                                updateLayerGain(selected.id, layer.id, gain);
                              }}
                            >
                              <div className="gain-fill" style={{width:`${layer.gain*100}%`,background:layer.color}}/>
                            </div>
                            <span className="gain-val">{Math.round(layer.gain*100)}%</span>
                          </div>
                        </div>
                        <button
                          onClick={()=>removeLayer(selected.id,layer.id)}
                          style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10,padding:"0 2px"}}
                        >×</button>
                      </div>
                    ))}
                    <button className="add-layer-btn">
                      + drag a clip here to add layer
                    </button>
                  </div>
                </div>

                {/* Combined freq profile */}
                <div className="rp-sec">
                  <div className="rp-lbl">Combined Frequency Profile</div>
                  <div className="freq-profile">
                    {FREQ_BANDS.map((b,i)=>(
                      <div key={i} className="fp-bar" style={{
                        height:`${Math.max(4,selectedProfile[i]*100)}%`,
                        background:b.color,
                        boxShadow:selectedProfile[i]>.6?`0 0 6px ${b.color}`:"none",
                        opacity:0.7+selectedProfile[i]*.3,
                      }}>
                        <span className="fp-lbl" style={{color:b.color}}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{height:14}}/>
                </div>

                {/* Juniper2.0 insight */}
                <div className="rp-sec">
                  <div className="rp-lbl">Juniper2.0 Insight</div>
                  {jMsg && (
                    <div className="j-insight">
                      <div className="j-insight-title">◈ Analysis</div>
                      {jMsg}
                    </div>
                  )}
                </div>

                {/* AudioScript preview */}
                <div className="rp-sec" style={{flex:1}}>
                  <div className="rp-lbl">AudioScript IR</div>
                  <div className="as-preview">
                    <div dangerouslySetInnerHTML={{__html:generateASCode(selected)}}/>
                  </div>
                  <div style={{marginTop:6,fontSize:8,color:C.textDim}}>
                    This clip compiles to AudioScript IR automatically
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TRANSPORT */}
        <div className="transport">
          <div className="t-btn" onClick={()=>{setPlaying(false);setTime(0);setPlayhead(0);}}>■</div>
          <div className={`t-btn${playing?" on":""}`} onClick={()=>setPlaying(p=>!p)}>{playing?"⏸":"▶"}</div>
          <div className="divv"/>
          <span className="t-bpm-l">BPM</span>
          <span className="t-bpm-v">138</span>
          <div style={{fontSize:9,color:C.textMuted,display:"flex",flexDirection:"column",lineHeight:1.1}}>
            <span>4</span><span>4</span>
          </div>
          <div className="t-time">{fmt(time)}</div>
          <div className="t-sp"/>
          <div style={{fontSize:9,color:C.textDim}}>
            {clips.reduce((s,c)=>s+c.layers.length,0)} total layers across {clips.length} clips
          </div>
        </div>

        {/* STATUSBAR */}
        <div className="statusbar">
          <div className="sb-i">
            <div className="sb-dot" style={{background:playing?C.accent:C.textDim,boxShadow:playing?`0 0 4px ${C.accent}`:"none"}}/>
            <span style={{color:playing?C.accent:C.textDim}}>{playing?"online":"idle"}</span>
          </div>
          <div className="sb-i">OOEPUI_NIGHT_01</div>
          <div className="sb-i" style={{color:isSpectro?"#7c6af7":C.accent}}>
            {isSpectro?"◈ frequency":"▬ linear"}
          </div>
          <div className="sb-i" style={{color:C.accent}}>IR v1 ✓</div>
          <div className="sb-sp"/>
          <div className="sb-i" style={{color:"#7c6af7"}}>Juniper2.0 ready</div>
          <div className="sb-i">48 kHz • 256 • 12.0 ms</div>
        </div>

      </div>
    </>
  );
}
