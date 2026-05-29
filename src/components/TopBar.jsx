// AudioMIX Electron
// src/components/TopBar.jsx
//
// Top bar of Electron UI
// Includes:
// logo (currently a prototype), mode switcher, project name,
// Juniper2.0 (AI) status

import React from "react";
import { defaultClientConditions } from "vite";

const MODES = ["STUDIO", "LIVE", "PERFORM"];

export default function TopBar({ mode, onModeChange, project }) {
    return (
        <div style={{
            height: "var(--topbar-h)",
            flexShrink: 0,
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px",
            zIndex: 200,
            userSelect: "none",
        }}>

            {/* Logo */}
            <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--accent)",
                letterSpacing: ".1em",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent)",
                    animation: "am-pulse 2s ease-in-out infinite",
                }}/>
                AUDIOMIX
            </div>

            <div className="am-divider-v"/>

            {/* Mode switcher */}
            <div style={{
                display: "flex",
                gap: 2,
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: 2,
            }}>
                {MODES.map(m => (
                    <button
                        key={m}
                        onClick={() => onModeChange(m)}
                        style={{
                            padding: "3px 10px",
                            borderRadius: 3,
                            border: mode === m ? "1px solid var(--accent-mid)" : "1px solid transparent",
                            cursor: "pointer",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: ".06em",
                            background: mode === m ? "var(---accent-dim)" : "transparent",
                            color: mode === m ? "var(--accent)" : "var(--text-dim)",
                            transition: "all .15s",
                        }}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="am-spacer"/>

            {/* Project name */}
            <div style={{
                fontSize: 11,
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                Project:
                <span style= {{ color: "var(--text)" }}>{project}</span>
            </div>

            <div className="am-divider-v"/>

            {/* Juniper2.0 status pill */}
            <div style={{
                fontSize: 10,
                color: "var(--juniper)",
                background: "var(--juniper-dim)",
                border: "1px solid #7c6af733",
                borderRadius: 4,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                transition: "all .15s",
            }}>
                <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--juniper)",
                    animation: "am-pulse-juniper 1.5s ease-in-out infinite",
                }}/>
                Juniper2.0
            </div>

        </div>
    );
}