// AudioMIX Electron
// src/components/Studio/RightPanel.jsx
//
// Right-side DSP control panel for STUDIO mode.
// Houses the master output chain's knobs (Gain Clipper)
// Mirrors the left Sidebar's visual language - same section
// dividers, uppercase labels, panel header conventions from
// tokens.css
// Reads as native, not bolted on.
//
// First pass covers the single-float DSP params that are already
// wired end-to-end (gain.set, clipper.set).
// EQ and Compressor are multi-param and come in later (TODO)

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
                        onChange={dsp.updateClipDrive}
                    />
                    <Knob 
                        label="Ceiling"
                        value={dsp.clipCeiling}
                        min={-60}
                        max={0}
                        step={0.1}
                        unit="dB"
                        onChange={dsp.updateClipCeiling}
                    />
                    <Knob 
                        label="Mix"
                        value={dsp.clipMix}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={dsp.updateClipMix}
                    />
                </div>
            </div>

            <div style={{ flex: 1 }} />
        </div>
    );
}