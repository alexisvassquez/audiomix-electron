// AudioMIX Electron
// src/components/StatusBar.jsx
//
// Bottom status strip
// Includes:
// engine health, project, mode, audio stats, 
// AudioScript IR status, Juniper2.0 (AI)

import React from "react";

export default function StatusBar({ mode, project, engineOnline }) {
    return (
        <div style={{
            height: "var(--statusbar-h)",
            flexShrink: 0,
            background: "#070707",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            fontSize: 10,
            userSelect: "none",
            zIndex: 200,
        }}>

            {/* Engine health */}
            <div className="sb-item">
                <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: engineOnline ? "var(--accent)" : "var(--text-muted)",
                    boxShadow: engineOnline ? "0 0 4px var(--accent)" : "none",
                    transition: "all .3s",
                }}/>
                <span style={{ color: engineOnline ? "var(--accent)" : "var(--text-dim)" }}>
                    {engineOnline ? "online" : "idle"}
                </span>
            </div>

            {/* Project name */}
            <div className="sb-item">
                {project}
            </div>

            {/* Current mode */}
            <div className="sb-item">
                {mode}
            </div>

            {/* AudioScript IR status */}
            <div className="sb-item" style={{ color: "var(--accent)" }}>
                IR v1 ✓
            </div>

            <div className="am-spacer"/>

            {/* Juniper2.0 */}
            <div className="sb-item" style={{ color: "var(--juniper)" }}>
                Juniper2.0 ready
            </div>

            {/* Audio stats
                 TODO: real-time data to be fed from AudioMIX core engine
                 via FastAPI/WebSocket bridge
                 Will reflect real-time sample rate, buffer size, and latency
             */
            }
            <div className="sb-item">
                48 kHz • 256 • 12.0 ms
            </div>

            {/* CPU usage
                TODO: feed from sys:get-stats IPC handler in main.js
                window.audiomix.sys.getStats() already wired in preload.cjs
             */
            }
            <div className="sb-item">
                CPU 6%
            </div>

        </div>
    );
}