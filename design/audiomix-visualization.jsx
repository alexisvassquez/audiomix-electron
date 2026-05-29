import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:          "#070707",
  surface:     "#0e0e0e",
  surfaceAlt:  "#121212",
  surfaceHov:  "#161616",
  border:      "#1a1a1a",
  borderBr:    "#252525",
  accent:      "#00ff9f",
  accentDim:   "#00ff9f15",
  accentMid:   "#00ff9f44",
  juniper:     "#7c6af7",
  juniperDim:  "#7c6af718",
  warn:        "#ffaa00",
  err:         "#ff4455",
  text:        "#d0d0d0",
  textDim:     "#484848",
  textMuted:   "#202020",
  tracks: ["#00ff9f","#4d9fff","#ff6ac1","#ffaa00","#7c6af7","#ff4455","#00cfff","#f1fa8c"],
};

// Frequency bands for spectrogram view — maps track types to frequency ranges
const FREQ_BANDS = [
  { label:"SUB",    hz:"20–60",   range:[20,60],    color:"#ff4455" },
  { label:"BASS",   hz:"60–250",  range:[60,250],   color:"#ff6ac1" },
  { label:"LOW MID",hz:"250–500", range:[250,500],  color:"#ffaa00" },
  { label:"MID",    hz:"500–2k",  range:[500,2000], color:"#f1fa8c" },
  { label:"HI MID", hz:"2k–6k",   range:[2000,6000],color:"#00ff9f" },
  { label:"PRESENCE",hz:"6k–12k", range:[6000,12000],color:"#4d9fff"},
  { label:"AIR",    hz:"12k–20k", range:[12000,20000],color:"#7c6af7"},
];

// Track frequency profiles — which bands each track is dominant in
const TRACKS = [
  { id:0, name:"KICK",      type:"drum",  color:C.tracks[0],
    freqProfile:[0.9,0.7,0.2,0.1,0.0,0.0,0.0],
    clips:[{s:0,l:2},{s:4,l:2},{s:8,l:2},{s:12,l:2}] },
  { id:1, name:"SNARE",     type:"drum",  color:C.tracks[1],
    freqProfile:[0.1,0.3,0.8,0.6,0.4,0.2,0.0],
    clips:[{s:2,l:2},{s:6,l:2},{s:10,l:2},{s:14,l:2}] },
  { id:2, name:"BASS STB",  type:"synth", color:C.tracks[2],
    freqProfile:[0.8,0.9,0.3,0.1,0.0,0.0,0.0],
    clips:[{s:0,l:4},{s:6,l:6},{s:14,l:2}] },
  { id:3, name:"LEAD SYN",  type:"synth", color:C.tracks[3],
    freqProfile:[0.0,0.1,0.4,0.9,0.8,0.3,0.1],
    clips:[{s:4,l:8},{s:13,l:3}] },
  { id:4, name:"CHORD PAD", type:"synth", color:C.tracks[4],
    freqProfile:[0.1,0.2,0.6,0.8,0.5,0.2,0.0],
    clips:[{s:0,l:16}] },
  { id:5, name:"VOCAL CHOP",type:"audio", color:C.tracks[5],
    freqProfile:[0.0,0.1,0.3,0.7,0.9,0.6,0.2],
    clips:[{s:3,l:2},{s:7,l:1},{s:11,l:4}] },
  { id:6, name:"FX RISER",  type:"audio", color:C.tracks[6],
    freqProfile:[0.2,0.3,0.4,0.5,0.6,0.7,0.8],
    clips:[{s:14,l:2}] },
];

const BARS = 16;
const BW   = 46; // px per bar in linear view

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600&family=Syne:wght@400;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'JetBrains Mono',monospace;font-size:11px;}

.root{display:flex;flex-direction:column;height:100vh;width:100vw;overflow:hidden;background:${C.bg};}

/* TOPBAR */
.topbar{height:36px;flex-shrink:0;background:${C.surface};border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:10px;padding:0 14px;}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:${C.accent};letter-spacing:.1em;display:flex;align-items:center;gap:7px;}
.logo-dot{width:6px;height:6px;border-radius:50%;background:${C.accent};box-shadow:0 0 10px ${C.accent};animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 10px ${C.accent}}50%{opacity:.3;box-shadow:none}}
.sp{flex:1;}
.divv{width:1px;height:16px;background:${C.border};}

/* VIEW TOGGLE — the key UI element */
.view-toggle{
  display:flex;gap:0;
  background:${C.surfaceAlt};
  border:1px solid ${C.border};
  border-radius:5px;
  overflow:hidden;
  padding:0;
}
.vt-btn{
  padding:5px 14px;
  border:none;cursor:pointer;
  font-family:'JetBrains Mono',monospace;
  font-size:10px;letter-spacing:.08em;
  background:transparent;color:${C.textDim};
  display:flex;align-items:center;gap:6px;
  transition:all .2s;
  position:relative;
}
.vt-btn + .vt-btn{border-left:1px solid ${C.border};}
.vt-btn.active{background:${C.accentDim};color:${C.accent};}
.vt-btn.active.spectro{background:#7c6af718;color:#7c6af7;}
.vt-btn .vt-icon{font-size:11px;}
.vt-label{font-size:9px;letter-spacing:.1em;}

/* ARRANGEMENT CONTAINER */
.arr-wrap{
  flex:1;display:flex;flex-direction:column;
  overflow:hidden;min-height:0;
  border-bottom:1px solid ${C.border};
}
.arr-header{
  height:30px;flex-shrink:0;
  background:${C.surfaceAlt};border-bottom:1px solid ${C.border};
  display:flex;align-items:center;padding:0 12px;gap:8px;
}
.arr-title{font-size:10px;letter-spacing:.1em;color:${C.textDim};text-transform:uppercase;}
.arr-hsp{flex:1;}
.arr-btn{font-size:10px;color:${C.textDim};cursor:pointer;padding:2px 8px;border-radius:3px;border:1px solid transparent;background:none;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.arr-btn:hover{border-color:${C.border};color:${C.text};}
.arr-btn.pri{color:${C.accent};border-color:${C.accentMid};background:${C.accentDim};}
.arr-body{flex:1;display:flex;overflow:hidden;}

/* TRACK HEADERS (shared) */
.th-col{width:148px;flex-shrink:0;border-right:1px solid ${C.border};overflow:hidden;}
.th-row{
  height:36px;border-bottom:1px solid ${C.border};
  display:flex;align-items:center;padding:0 8px;gap:5px;
  background:${C.surface};cursor:pointer;transition:background .1s;
}
.th-row:hover{background:${C.surfaceHov};}
.th-pill{width:3px;height:20px;border-radius:2px;flex-shrink:0;}
.th-name{font-size:10px;color:${C.text};flex:1;white-space:nowrap;overflow:hidden;}
.th-type{font-size:8px;color:${C.textDim};}
.th-m{width:15px;height:15px;border-radius:2px;border:none;cursor:pointer;font-size:7px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;}
.th-m.m{background:#ffaa0018;color:${C.warn};}
.th-m.s{background:${C.accentDim};color:${C.accent};}

/* ── LINEAR VIEW ── */
.linear-wrap{flex:1;overflow-x:auto;overflow-y:hidden;display:flex;flex-direction:column;}
.ruler{
  height:20px;flex-shrink:0;display:flex;
  background:${C.surfaceAlt};border-bottom:1px solid ${C.border};
  position:relative;
}
.rbar{
  width:${BW}px;flex-shrink:0;border-right:1px solid ${C.border};
  display:flex;align-items:center;padding-left:5px;
  font-size:8px;color:${C.textMuted};
}
.rbar.db{color:${C.textDim};border-right-color:${C.borderBr};}
.clip-lanes{flex:1;overflow-y:hidden;position:relative;}
.clip-lane{
  height:36px;border-bottom:1px solid ${C.border};
  display:flex;align-items:center;position:relative;
  background:${C.surface};
}
.clip-lane:nth-child(even){background:#0b0b0b;}
.clip-lane::before{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(90deg,transparent 0px,transparent ${BW-1}px,${C.border} ${BW-1}px,${C.border} ${BW}px);
  pointer-events:none;
}
.clip{
  position:absolute;height:28px;border-radius:3px;
  display:flex;align-items:center;padding:0 6px;
  font-size:8px;font-weight:600;cursor:pointer;
  overflow:hidden;white-space:nowrap;
  transition:filter .1s;top:4px;
}
.clip:hover{filter:brightness(1.3);}
.clip-waves{
  position:absolute;bottom:2px;left:0;right:0;height:8px;
  display:flex;gap:1px;padding:0 4px;align-items:flex-end;opacity:.4;
}
.playhead{
  position:absolute;top:0;bottom:0;width:1px;
  background:${C.accent};box-shadow:0 0 8px ${C.accent};
  pointer-events:none;z-index:20;
  transition:left .05s linear;
}
.playhead::before{
  content:'';position:absolute;top:0;left:-4px;
  border-left:4px solid transparent;
  border-right:4px solid transparent;
  border-top:6px solid ${C.accent};
}
.ruler-ph{
  position:absolute;top:0;bottom:0;width:2px;
  background:${C.accent};pointer-events:none;z-index:30;
  box-shadow:0 0 6px ${C.accent};
  transition:left .05s linear;
}

/* ── SPECTROGRAM VIEW ── */
.spectro-wrap{
  flex:1;overflow:hidden;display:flex;flex-direction:column;
  position:relative;
}
.spectro-intro{
  position:absolute;top:8px;right:10px;
  font-size:9px;color:#7c6af7;
  background:#7c6af710;border:1px solid #7c6af730;
  border-radius:4px;padding:4px 8px;
  letter-spacing:.05em;z-index:10;
  display:flex;align-items:center;gap:5px;
}
.spectro-canvas-wrap{
  flex:1;display:flex;overflow:hidden;
}
.spectro-freq-labels{
  width:72px;flex-shrink:0;
  border-right:1px solid ${C.border};
  display:flex;flex-direction:column;
  justify-content:space-between;
  padding:4px 0;
  background:${C.surface};
}
.freq-label{
  display:flex;align-items:center;
  padding:0 8px;gap:5px;
  font-size:8px;
}
.freq-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.freq-name{color:${C.textDim};}
.freq-hz{color:${C.textMuted};font-size:7px;}
.spectro-main{flex:1;position:relative;overflow:hidden;}
.spectro-time-ruler{
  height:18px;flex-shrink:0;
  background:${C.surfaceAlt};border-bottom:1px solid ${C.border};
  display:flex;align-items:center;
  font-size:8px;color:${C.textMuted};
  padding:0 8px;gap:0;
}
.spectro-bar-label{
  flex:1;text-align:center;border-right:1px solid ${C.border};
  padding:0;display:flex;align-items:center;justify-content:center;
}
.spectro-bar-label.db{color:${C.textDim};}
.spectro-canvas{display:block;width:100%;}
.spectro-ph{
  position:absolute;top:0;bottom:0;width:2px;
  background:${C.accent};box-shadow:0 0 8px ${C.accent};
  pointer-events:none;z-index:20;
  transition:left .05s linear;
}
.spectro-ph::before{
  content:'';position:absolute;top:0;left:-4px;
  border-left:4px solid transparent;
  border-right:4px solid transparent;
  border-top:6px solid ${C.accent};
}

/* Clash indicator */
.clash-badge{
  position:absolute;
  font-size:8px;color:${C.err};
  background:#ff445518;border:1px solid #ff445544;
  border-radius:3px;padding:1px 5px;
  pointer-events:none;z-index:30;
  animation:clash-pulse .8s ease-in-out infinite;
}
@keyframes clash-pulse{0%,100%{opacity:1}50%{opacity:.5}}

/* TRANSPORT */
.transport{
  height:40px;flex-shrink:0;
  background:${C.surface};border-top:1px solid ${C.border};
  display:flex;align-items:center;padding:0 14px;gap:12px;
}
.t-btn{
  width:24px;height:24px;border-radius:4px;cursor:pointer;
  background:${C.surfaceAlt};border:1px solid ${C.border};
  display:flex;align-items:center;justify-content:center;
  color:${C.textDim};font-size:10px;transition:all .1s;
}
.t-btn:hover{border-color:${C.borderBr};color:${C.text};}
.t-btn.on{background:${C.accentDim};border-color:${C.accentMid};color:${C.accent};}
.t-bpm-v{font-size:17px;font-weight:600;color:${C.text};letter-spacing:-.02em;}
.t-bpm-l{font-size:8px;color:${C.textMuted};letter-spacing:.1em;}
.t-time{font-size:13px;color:${C.textDim};font-variant-numeric:tabular-nums;letter-spacing:.04em;}
.t-sp{flex:1;}
.snap-row{display:flex;align-items:center;gap:3px;}
.snap{background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:3px;padding:2px 5px;font-size:8px;color:${C.textDim};cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .1s;}
.snap.on{background:${C.accentDim};border-color:${C.accentMid};color:${C.accent};}

/* STATUSBAR */
.statusbar{
  height:21px;flex-shrink:0;background:#060606;
  border-top:1px solid ${C.border};
  display:flex;align-items:center;padding:0 6px;font-size:10px;
}
.sb-i{
  padding:0 8px;height:100%;display:flex;align-items:center;gap:4px;
  color:${C.textDim};border-right:1px solid ${C.border};cursor:default;
}
.sb-i:hover{background:${C.surfaceAlt};}
.sb-dot{width:4px;height:4px;border-radius:50%;}
.sb-sp{flex:1;}

::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
`;

function fmt(s){
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}:00`;
}

// ── LINEAR VIEW COMPONENT ─────────────────────────────────────────────────────
function LinearView({ playhead, playing }) {
  return (
    <div className="linear-wrap">
      {/* Ruler */}
      <div className="ruler" style={{position:"relative",width:`${BARS*BW}px`,minWidth:"100%"}}>
        {Array.from({length:BARS},(_,i)=>(
          <div key={i} className={`rbar${i%4===0?" db":""}`} style={{width:`${BW}px`}}>
            {i%4===0?`bar ${i/4+1}`:"·"}
          </div>
        ))}
        <div className="ruler-ph" style={{left:`${playhead*BW}px`}}/>
      </div>
      {/* Clip lanes */}
      <div className="clip-lanes" style={{position:"relative",width:`${BARS*BW}px`,minWidth:"100%",overflowY:"hidden"}}>
        <div className="playhead" style={{left:`${playhead*BW}px`}}/>
        {TRACKS.map(tr=>(
          <div key={tr.id} className="clip-lane" style={{width:`${BARS*BW}px`}}>
            {tr.clips.map((cl,ci)=>(
              <div key={ci} className="clip" style={{
                left:`${cl.s*BW}px`,
                width:`${cl.l*BW-2}px`,
                background:`${tr.color}20`,
                border:`1px solid ${tr.color}55`,
                color:tr.color,
              }}>
                {ci===0?tr.name:""}
                <div className="clip-waves">
                  {Array.from({length:Math.floor(cl.l*5)},(_,wi)=>(
                    <div key={wi} style={{flex:1,background:tr.color,borderRadius:1,height:`${20+Math.sin(wi*1.9+tr.id)*70}%`}}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SPECTROGRAM VIEW COMPONENT ────────────────────────────────────────────────
function SpectrogramView({ playhead, playing, time }) {
  const canvasRef = useRef();
  const animRef = useRef();
  const phaseRef = useRef(0);

  // Build frequency energy map per bar per freq band
  // For each bar, sum up which tracks are active and their frequency contribution
  const getEnergyMap = useCallback(() => {
    const map = []; // [bar][freqBand] = energy 0-1
    for (let bar=0; bar<BARS; bar++) {
      const bandEnergy = Array(FREQ_BANDS.length).fill(0);
      TRACKS.forEach(tr => {
        const active = tr.clips.some(cl => bar >= cl.s && bar < cl.s + cl.l);
        if (active) {
          tr.freqProfile.forEach((energy, bi) => {
            bandEnergy[bi] = Math.min(1, bandEnergy[bi] + energy * 0.7);
          });
        }
      });
      map.push(bandEnergy);
    }
    return map;
  }, []);

  const energyMap = getEnergyMap();

  // Detect frequency clashes — bars where SUB + BASS both high (kick/bass clash)
  const clashes = [];
  energyMap.forEach((bands, bar) => {
    if (bands[0] > 0.6 && bands[1] > 0.7) {
      clashes.push(bar);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;

      if (w === 0 || h === 0) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0,0,w,h);

      const barW = w / BARS;
      const bandH = h / FREQ_BANDS.length;
      const ph = phaseRef.current;

      // Draw energy cells
      energyMap.forEach((bands, barIdx) => {
        bands.forEach((energy, bandIdx) => {
          const x = barIdx * barW;
          const y = (FREQ_BANDS.length - 1 - bandIdx) * bandH; // flip: low freq at bottom
          const freqColor = FREQ_BANDS[bandIdx].color;

          // animate energy slightly when playing
          const animatedEnergy = playing
            ? Math.max(0, Math.min(1, energy + Math.sin(ph + barIdx*0.3 + bandIdx*0.7) * 0.08))
            : energy;

          if (animatedEnergy < 0.05) {
            // Empty cell — just a subtle grid
            ctx.fillStyle = "#0d0d0d";
            ctx.fillRect(x+1, y+1, barW-2, bandH-2);
            return;
          }

          // Color intensity based on energy
          const alpha = 0.15 + animatedEnergy * 0.75;

          // Gradient fill for each cell
          const grad = ctx.createLinearGradient(x, y, x, y+bandH);
          grad.addColorStop(0, `${freqColor}${Math.round(alpha*255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(1, `${freqColor}${Math.round(alpha*0.3*255).toString(16).padStart(2,"0")}`);
          ctx.fillStyle = grad;
          ctx.fillRect(x+1, y+1, barW-2, bandH-2);

          // Energy intensity bar at top of cell
          if (animatedEnergy > 0.3) {
            ctx.fillStyle = freqColor;
            ctx.globalAlpha = animatedEnergy * 0.9;
            ctx.fillRect(x+1, y+1, (barW-2)*animatedEnergy, 2);
            ctx.globalAlpha = 1;
          }

          // Clash highlight
          if (clashes.includes(barIdx) && bandIdx <= 1) {
            ctx.strokeStyle = C.err;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.6 + Math.sin(ph*3)*0.4;
            ctx.strokeRect(x+1, y+1, barW-2, bandH-2);
            ctx.globalAlpha = 1;
          }
        });
      });

      // Grid lines
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 0.5;
      for (let i=0;i<=BARS;i++) {
        ctx.beginPath();
        ctx.moveTo(i*barW,0);
        ctx.lineTo(i*barW,h);
        ctx.stroke();
      }
      for (let i=0;i<=FREQ_BANDS.length;i++) {
        ctx.beginPath();
        ctx.moveTo(0,i*bandH);
        ctx.lineTo(w,i*bandH);
        ctx.stroke();
      }

      // Bar number labels
      for (let i=0;i<BARS;i+=4) {
        ctx.fillStyle = C.textMuted;
        ctx.font = "8px JetBrains Mono";
        ctx.fillText(`${i/4+1}`, i*barW+4, h-4);
      }

      phaseRef.current += 0.04;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, energyMap, clashes]);

  // Playhead position as percentage of canvas width
  const playheadPct = (playhead / BARS) * 100;

  return (
    <div className="spectro-wrap">
      {/* Intro tooltip */}
      <div className="spectro-intro">
        ✦ Frequency View — see your mix, not just your clips
      </div>

      <div className="spectro-canvas-wrap">
        {/* Frequency labels on left */}
        <div className="spectro-freq-labels">
          {[...FREQ_BANDS].reverse().map((b,i)=>(
            <div key={i} className="freq-label">
              <div className="freq-dot" style={{background:b.color, boxShadow:`0 0 4px ${b.color}`}}/>
              <div>
                <div className="freq-name">{b.label}</div>
                <div className="freq-hz">{b.hz} Hz</div>
              </div>
            </div>
          ))}
        </div>

        {/* Spectrogram canvas */}
        <div className="spectro-main" style={{position:"relative",flex:1}}>
          <canvas ref={canvasRef} className="spectro-canvas" style={{width:"100%",height:"100%",display:"block"}}/>

          {/* Playhead overlay */}
          <div className="spectro-ph" style={{left:`${playheadPct}%`}}/>

          {/* Clash badges */}
          {clashes.map(bar=>(
            <div key={bar} className="clash-badge" style={{
              left:`${(bar/BARS)*100+1}%`,
              top:4,
            }}>
              ⚠ freq clash
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────
export default function AudioMIXVisualization() {
  const [view, setView] = useState("linear");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [snap, setSnap] = useState("1/4");

  useEffect(()=>{
    if (!playing) return;
    const id = setInterval(()=>{
      setTime(t=>t+1);
      setPlayhead(p=>{ const n=p+0.0625; return n>=BARS?0:n; });
    },250);
    return()=>clearInterval(id);
  },[playing]);

  function stop(){ setPlaying(false); setTime(0); setPlayhead(0); }

  const isSpectro = view === "spectro";

  return (
    <>
      <style>{css}</style>
      <div className="root">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-dot"/>
            AUDIOMIX
          </div>
          <div style={{fontSize:10,color:C.textDim,marginLeft:4}}>
            Studio — <span style={{color:C.text}}>OOEPUI_NIGHT_01</span>
          </div>
          <div className="sp"/>

          {/* THE VIEW TOGGLE */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginRight:8}}>
            <span style={{fontSize:9,color:C.textDim,letterSpacing:".1em"}}>VIEW</span>
            <div className="view-toggle">
              <button
                className={`vt-btn${!isSpectro?" active":""}`}
                onClick={()=>setView("linear")}
              >
                <span className="vt-icon">▬</span>
                <span className="vt-label">LINEAR</span>
              </button>
              <button
                className={`vt-btn spectro${isSpectro?" active spectro":""}`}
                onClick={()=>setView("spectro")}
              >
                <span className="vt-icon">◈</span>
                <span className="vt-label">FREQUENCY</span>
              </button>
            </div>
          </div>

          <div className="divv"/>
          <div style={{fontSize:10,color:"#7c6af7",background:"#7c6af718",border:"1px solid #7c6af730",borderRadius:4,padding:"3px 8px",display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#7c6af7",animation:"pulse 1.5s infinite"}}/>
            Juniper2.0
          </div>
        </div>

        {/* ARRANGEMENT */}
        <div className="arr-wrap">
          <div className="arr-header">
            <span className="arr-title">
              Arrangement
              <span style={{
                marginLeft:8,fontSize:9,
                color:isSpectro?"#7c6af7":C.accent,
                background:isSpectro?"#7c6af718":C.accentDim,
                border:`1px solid ${isSpectro?"#7c6af740":C.accentMid}`,
                borderRadius:3,padding:"1px 6px",
              }}>
                {isSpectro?"frequency view":"linear view"}
              </span>
            </span>
            <div className="arr-hsp"/>
            {isSpectro && (
              <span style={{fontSize:9,color:C.err,background:"#ff445510",border:"1px solid #ff445530",borderRadius:3,padding:"2px 7px",marginRight:4}}>
                ⚠ 2 freq clashes detected
              </span>
            )}
            <button className="arr-btn">+ Track</button>
            <button className="arr-btn pri">Compile IR</button>
          </div>

          <div className="arr-body">
            {/* Track headers — always visible */}
            <div className="th-col">
              {TRACKS.map((tr,i)=>(
                <div key={tr.id} className="th-row">
                  <div className="th-pill" style={{background:tr.color}}/>
                  <div style={{flex:1}}>
                    <div className="th-name">{tr.name}</div>
                    <div className="th-type">{tr.type}</div>
                  </div>
                  <button className="th-m m">M</button>
                  <button className="th-m s">S</button>
                </div>
              ))}
              {/* Freq band legend when in spectro mode */}
              {isSpectro && (
                <div style={{padding:"6px 8px",borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontSize:8,color:C.textMuted,letterSpacing:".1em",marginBottom:4}}>FREQ BANDS</div>
                  {FREQ_BANDS.map((b,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"1px 0"}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:b.color,boxShadow:`0 0 3px ${b.color}`}}/>
                      <span style={{fontSize:7,color:C.textDim}}>{b.label}</span>
                      <span style={{fontSize:7,color:C.textMuted,marginLeft:"auto"}}>{b.hz}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visualization area — swaps between views */}
            <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
              {view === "linear"
                ? <LinearView playhead={playhead} playing={playing}/>
                : <SpectrogramView playhead={playhead} playing={playing} time={time}/>
              }
            </div>
          </div>
        </div>

        {/* Explanation panel — only in spectro mode */}
        {isSpectro && (
          <div style={{
            height:52,flexShrink:0,
            background:"#0a0a0f",
            borderTop:`1px solid #7c6af730`,
            padding:"8px 16px",
            display:"flex",alignItems:"center",gap:24,
          }}>
            <div style={{fontSize:10,color:"#7c6af7",letterSpacing:".06em",fontWeight:600}}>
              ◈ FREQUENCY VIEW
            </div>
            <div style={{display:"flex",gap:16,fontSize:9,color:C.textDim}}>
              <span>Color intensity = energy at that frequency</span>
              <span style={{color:C.textMuted}}>|</span>
              <span>Height position = frequency range</span>
              <span style={{color:C.textMuted}}>|</span>
              <span style={{color:C.err}}>⚠ Red border = frequency clash</span>
              <span style={{color:C.textMuted}}>|</span>
              <span style={{color:C.accent}}>White bar = peak energy</span>
            </div>
            <div style={{marginLeft:"auto",fontSize:9,color:"#7c6af7",opacity:.6}}>
              Juniper2.0 can suggest fixes for detected clashes →
            </div>
          </div>
        )}

        {/* TRANSPORT */}
        <div className="transport">
          <div className="t-btn" onClick={stop}>■</div>
          <div className={`t-btn${playing?" on":""}`} onClick={()=>setPlaying(p=>!p)}>
            {playing?"⏸":"▶"}
          </div>
          <div className="divv"/>
          <span className="t-bpm-l">BPM</span>
          <span className="t-bpm-v">138</span>
          <div style={{fontSize:9,color:C.textMuted,display:"flex",flexDirection:"column",lineHeight:1.1}}>
            <span>4</span><span>4</span>
          </div>
          <div className="t-time">{fmt(time)}</div>
          <div className="t-sp"/>
          <div className="snap-row">
            <span style={{fontSize:8,color:C.textMuted,letterSpacing:".08em",marginRight:3}}>SNAP</span>
            {["1/1","1/2","1/4","1/8","1/16"].map(s=>(
              <button key={s} className={`snap${snap===s?" on":""}`} onClick={()=>setSnap(s)}>{s}</button>
            ))}
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
            {isSpectro?"◈ frequency view":"▬ linear view"}
          </div>
          <div className="sb-i" style={{color:C.accent}}>IR v1 ✓</div>
          <div className="sb-sp"/>
          {isSpectro && (
            <div className="sb-i" style={{color:C.err}}>⚠ 2 clashes</div>
          )}
          <div className="sb-i" style={{color:"#7c6af7"}}>Juniper2.0 ready</div>
          <div className="sb-i">48 kHz • 256 • 12.0 ms</div>
        </div>

      </div>
    </>
  );
}
