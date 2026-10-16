// AudioMIX Electron
// src/components/Studio/EqDrawer.jsx
//
// Horizontal, collapsible 10-band EQ drawer.
// Sits in the canvas column between the Arrangement and the
// Shell dock.
// Each band sends eq.set("<band>", dB) via useDsp - cpp EqModule
// does the work.
// Collapsing is a VIEW operation only, engine keeps processing.

import React from "react";
import { EQ_BANDS, EQ_MIN, EQ_MAX, EQ_PRESETS, EQ_PRESET_LABELS, EQ_CHIPS } from "../../data/eqBands.js";
import "../../styles/EqDrawer.css";

const clamp = (v) => Math.max(EQ_MIN, Math.min(EQ_MAX, v));

// Shared value -> curve mapping, svg overlay and sliders line up.
// Amplitude is 0.88 of the 1/2-height, center is 0dB
function curvePaths(values, h) {
    const cy = h / 2;
    const amp = cy * 0.88;
    const pts = values.map((v, i) => [(i + 0.5) * 100, cy - v * (amp / EQ_MAX)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = "M0 " + cy + " " + pts.map((p) => "L" + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ") + " L1000 " + cy + " Z";
    return { line, area };
}

// One vertical band slider.
// Same vertical-drag + step-throttle idea as Knob
// only fires onChange when the integer-dB value actually changes.
const TRACK_H = 150;
// full -12..+12 sweep over this much drag
const SWEEP_PX = 150;
function EqBandSlider({ index, band, value, onChange }) {
    const draggingRef = React.useRef(false);
    const cy = TRACK_H / 2;
    const pxPerDb = (cy * 0.88) / EQ_MAX;
    const y = cy - value * pxPerDb;
    const neg = value < 0;

    const handleDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;
        const startY = e.clientY;
        const startVal = value;
        const range = EQ_MAX - EQ_MIN;
        let lastSent = value;

        const move = (ev) => {
            if (!draggingRef.current) return;
            // up = increase
            const deltaPx = startY - ev.clientY;
            const next = clamp(Math.round(startVal + (deltaPx / SWEEP_PX) * range));
            if (next !== lastSent) {
                lastSent = next;
                onChange(index, next);
            }
        };
        const up = () => {
            draggingRef.current = false;
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    };

    const handleDbl = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(index, 0);
    };

    return (
        <div 
            className="eqband" 
            onMouseDown={handleDown} 
            onDoubleClick={handleDbl} 
            title={`${band.label} ${band.hz} - drag to adjust, double-click to flatten`}
        >
            <div className={"eqband-val" + (value > 0 ? " pos" : neg ? " neg" : "")}>
                {value > 0 ? "+" : ""}{value}
            </div>
            <div className="eqband-track">
                <div className="eqband-rail" />
                <div className="eqband-zero" />
                <div 
                    className={"eqband-fill" + (neg ? " neg" : "")}
                    style={{ 
                        top: Math.min(cy, y),
                        height: Math.abs(cy -y)
                    }}
                />
                <div
                    className={"eqband-handle" + (neg ? " neg" : "")}
                    style={{ top: y }} 
                />
            </div>
            <div className="eqband-label">{band.label}</div>
            <div className="eqband-hz">{band.hz}</div>
        </div>
    );
}

export default function EqDrawer({ dsp }) {
    const [open, setOpen] = React.useState(true);
    const [preset, setPreset] = React.useState("flat");
    const bands = dsp.eqBands;

    const onBand = (index, v) => {
        dsp.updateEqBand(index, v);
        // a manual move = custom
        setPreset("");
    };
    const onPreset = (e) => {
        const name = e.target.value;
        setPreset(name);
        const vals = EQ_PRESETS[name];
        if (vals) dsp.applyEqValues(vals);
    };
    const onChip = (chip) => {
        const next = bands.slice();
        Object.entries(chip.deltas).forEach(([key, d]) => {
            const i = EQ_BANDS.findIndex((b) => b.key === key);
            if (i >= 0) next[i] = clamp(next[i] + d);
        });
        dsp.applyEqValues(next);
        setPreset("");
    };
    const onReset = () => {
        dsp.resetEq();
        setPreset("flat");
    };

    const curve = curvePaths(bands, 150);
    const spark = curvePaths(bands, 120);
    const ranked = bands.map((v, i) => ({ v, i })).filter((o) => Math.abs(o.v) >= 1).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 3);

    return (
        <div className={"eq-drawer " + (open ? "open" : "collapsed")}>
            <div className="eq-head">
                <span className="eq-title">EQ</span>
                <span className="eq-badge">10-BAND</span>
                {open && (
                    <div className="eq-head-ctl">
                        <select className="eq-preset" value={preset} onChange={onPreset}>
                            {preset === "" && (
                                <option value="" disabled>custom</option>
                            )}
                            {EQ_PRESET_LABELS.map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>
                        <button className="eq-mini-btn" onClick={onReset}>Reset</button>
                    </div>
                )}
                <div className="eq-spacer" />
                <button className="eq-hide-btn" onClick={() => setOpen((o) => !o)}>
                    {open ? "- Hide" : "+ Show"}
                </button>
            </div>

            {/* Shows EQ summary when not expanded */}
            {!open && (
                <div className="eq-summary">
                    <svg className="eq-spark" viewBox="0 0 1000 120" preserveAspectRatio="none">
                        <line x1="0" y1="60" x2="1000" y2="60" stroke="var(--border)" strokeWidth="1" />
                        <path d={spark.line} fill="none" stroke="var(--accent)" strokeWidth="3" strokeOpacity="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <span className="eq-sum-text">
                        {ranked.length === 0
                            ? <span className="muted">flat</span>
                            : ranked.map((o, i) => (
                                <span key={o.i}>
                                    {i > 0 && <span className="sep">  .  </span>}
                                    <span className={o.v > 0 ? "up" : "dn"}>
                                        {o.v > 0 ? "+" : ""}{o.v} {EQ_BANDS[o.i].label}
                                    </span>
                                </span>
                            ))}
                    </span>
                    <div className="eq-spacer" />
                    <span className="eq-sum-active">● processing</span>
                </div>
            )}

            {open && (
                <div className="eq-body">
                    <div className="eq-bands">
                        <svg className="eq-curve" viewBox="0 0 1000 150" preserveAspectRatio="none">
                            <path d={curve.area} fill="var(--accent-dim)" />
                            <line x1="0" y1="75" x2="1000" y2="75" stroke="var(--border-bright)" strokeWidth="1" />
                            <path d={curve.line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.85" vectorEffect="non-scaling-stroke" />
                        </svg>
                        {EQ_BANDS.map((b, i) => (
                            <EqBandSlider 
                                key={b.key}
                                index={i}
                                band={b}
                                value={bands[i]}
                                onChange={onBand}    
                            />
                        ))}
                    </div>
                    <div className="eq-foot">
                        <span className="eq-foot-label">Character</span>
                        <div className="eq-chips">
                            {EQ_CHIPS.map((c) => (
                                <button key={c.name} className="eq-chip" onClick={() => onChip(c)}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}