// AudioMIX Electron
// src/components/Studio/RightPanel.jsx
//
// Right-side DSP control panel for STUDIO mode.
// Houses the master output chain's knobs (Gain, Clipper, Compressor)
// Mirrors the left Sidebar's visual language - same section
// dividers, uppercase labels, panel header conventions from
// tokens.css
// Reads as native, not bolted on.
//
// EQ is being worked on (TODO)

import React from "react";
import Knob from "./Knob.jsx";

export default function RightPanel({ dsp }) {
    const sectionLabel = {
        padding: "8px 10px 6px",
        fontSize: 9,
        letterSpacing: ".15em",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        fontWeight: 600,
    };

    const knobRow = {
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        padding: "4px 12px 12px",
        justifyContent: "flex-start",
    };

    const section = {
        borderBottom: "1px solid var(--border)",
        paddingBottom: 4,
    };

    return (
        <div style={{
            width: "var(--right-panel-w)",
            flexShrink: 0,
            background: "var(--surface)",
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        }}>
            <div className="am-panel-header">
                <span className="am-panel-title">DSP</span>
            </div>

            {/* Master output gain */}
            <div style={section}>
                <div style={sectionLabel}>Master</div>
                <div style={knobRow}>
                    <Knob
                        label="Gain"
                        value={dsp.gainDb}
                        min={-60}
                        max={24}
                        step={0.5}
                        unit="dB"
                        size={60}
                        onChange={dsp.updateGain}
                    />
                </div>
            </div>

            {/* Clipper / limiter */}
            <div style={section}>
                <div style={sectionLabel}>Clipper</div>
                <div style={knobRow}>
                    <Knob
                        label="Drive"
                        value={dsp.clipDrive}
                        min={-24}
                        max={24}
                        step={0.5}
                        unit="dB"
                        size={48}
                        onChange={dsp.updateClipDrive}
                    />
                    <Knob 
                        label="Ceiling"
                        value={dsp.clipCeiling}
                        min={-60}
                        max={0}
                        step={0.1}
                        unit="dB"
                        size={48}
                        onChange={dsp.updateClipCeiling}
                    />
                    <Knob 
                        label="Mix"
                        value={dsp.clipMix}
                        min={0}
                        max={1}
                        step={0.01}
                        size={48}
                        onChange={dsp.updateClipMix}
                    />
                </div>
            </div>

            {/* Compressor - 7 params, 3 rows */}
            <div style={section}>
                <div style={sectionLabel}>Compressor</div>
                <div style={knobRow}>
                    <Knob
                        label="Thresh"
                        value={dsp.compThreshold}
                        min={-60}
                        max={0}
                        step={0.5}
                        unit="dB"
                        size={48}
                        onChange={dsp.updateCompThreshold}
                    />
                    <Knob
                        label="Ratio"
                        value={dsp.compRatio}
                        min={1}
                        max={20}
                        step={0.1}
                        unit=":1"
                        size={48}
                        onChange={dsp.updateCompRatio}
                    />
                    <Knob
                        label="Attack"
                        value={dsp.compAttack}
                        min={0.1}
                        max={500}
                        step={0.1}
                        unit="ms"
                        size={48}
                        onChange={dsp.updateCompAttack}
                    />
                </div>
                <div style={knobRow}>
                    <Knob 
                        label="Release"
                        value={dsp.compRelease}
                        min={1}
                        max={5000}
                        step={1}
                        unit="ms"
                        size={48}
                        onChange={dsp.updateCompRelease}
                    />
                    <Knob 
                        label="Knee"
                        value={dsp.compKnee}
                        min={0}
                        max={24}
                        step={0.5}
                        unit="dB"
                        size={48}
                        onChange={dsp.updateCompKnee}
                    />
                    <Knob 
                        label="Makeup"
                        value={dsp.compMakeup}
                        min={-24}
                        max={24}
                        step={0.5}
                        unit="dB"
                        size={48}
                        onChange={dsp.updateCompMakeup}
                    />
                </div>
                <div style={knobRow}>
                    <Knob 
                        label="Mix"
                        value={dsp.compMix}
                        min={0}
                        max={1}
                        step={0.01}
                        size={48}
                        onChange={dsp.updateCompMix}
                    />
                </div>
            </div>

            <div style={{ flex: 1 }} />
        </div>
    );
}