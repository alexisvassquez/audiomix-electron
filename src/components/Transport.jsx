// AudioMIX Electron
// src/components/Transport.jsx
//
// Transport bar
// Includes:
// play, stop, record, BPM, time, snap controls

import React from "react";
import { fmtTime } from "../data/studioData.js";

export default function Transport({
    playing,
    recording,
    time,
    bpm,
    snap,
    snapOptions,
    onTogglePlay,
    onStop,
    onToggleRecord,
    onSnapChange,
    onBpmChange,
}) { 
    const btnBase = {
        width: 26,
        height: 26,
        borderRadius: 4,
        cursor: "pointer",
        background: "var(--surface-alt)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-dim)",
        fontSize: 10,
        transition: "all .1s",
        flexShrink: 0,
    };

    const btnActive = {
        ...btnBase,
        background: "var(--accent-dim)",
        border: "1px solid var(--accent-mid)",
        color: "var(--accent)",
    };

    const btnRec = {
        ...btnBase,
        background: "#ff445518",
        border: "1px solid #ff445544",
        color: "var(--err)",
    };

    const btnRecActive = {
        ...btnRec,
        background: "#ff445533",
        boxShadow: "0 0 6px var(--err)",
    };

    return (
        <div style={{
            height: "var(--transport-h)",
            flexShrink: 0,
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 14,
            userSelect: "none",
        }}>
            {/* Stop */}
            <button style={btnBase} onClick={onStop}>■</button>

            {/* Play/Pause */}
            <button style={playing ? btnActive : btnBase} onClick={onTogglePlay}>{playing ? "⏸" : "▶"}</button>

            {/* Record */}
            <button style={recording ? btnRecActive : btnRec} onClick={onToggleRecord}>⏺</button>

            <div className="am-divider-v"/>

            {/* BPM
                TODO: sync with AudioMIX core engine tempo via WebSocket
             */
            }
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
            }}>
                <span style={{
                    fontSize: 9,
                    color: "var(--text-mutued)",
                    letterSpacing: ".1em",
                }}>
                    BPM
                </span>
                <span style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text)",
                    letterSpacing: "-.02em",
                    cursor: "pointer",
                    transition: "color .1s",
                }}
                onClick={() => {
                    const val = prompt("Set BPM:", bpm);
                    if (val && !isNaN(val)) onBpmChange(Number(val));
                }}
                title="Click to change BPM">
                    {bpm}
                </span>
            </div>

            {/* Time signature */}
            <div style={{
                fontSize: 10,
                color: "var(--text-muted)",
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
            }}>
                <span>4</span>
                <span>4</span>
            </div>

            {/* Elapsed Time
                TODO: sync with AudioMIX core engine clock via WebSocket
             */
            }
            <div style={{
                fontSize: 14,
                color: "var(--text-dim)",
                letterSpacing: ".05em",
                fontVariantNumeric: "tabular-nums",
            }}>
                {fmtTime(time)}
            </div>

            <div className="am-spacer"/>

            {/* Snap controls */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                color: "var(--text-dim)",
            }}>
                <span style={{
                    color: "var(--text-mutued)",
                    fontSize: 9,
                    letterSpacing: ".08em",
                }}>
                    SNAP
                </span>
                {snapOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => onSnapChange(s)}
                      style={{
                        background: snap === s ? "var(--accent-dim)" : "var(--surface-alt)",
                        border: snap === s ? "1px solid var(--accent-mid)" : "1px solid var(--border)",
                        borderRadius: 3,
                        padding: "2px 6px",
                        fontSize: 9,
                        color: snap === s ? "var(--accent)" : "var(--text-dim)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        transition: "all .1s",
                      }}>
                        {s}
                      </button>
                ))}
            </div>

        </div>
    );
}