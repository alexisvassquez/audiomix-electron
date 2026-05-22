// AudioMIX Electron
// Root component

import React, { useState } from "react";

export default function App() {
    const [mode, setMode] = useState("STUDIO");

    return (
        <div style={{
            background: "#080808",
            color: "#d8d8d8",
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "JetBrains Mono, monospace",
            flexDirection: "column",
            gap: 16
        }}>
            <div style={{
                color: "#00ff9f",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: ".1em"
            }}> AUDIOMIX
            </div>
            <div style={{
                color: "#555",
                fontSize: 12
            }}>
                Electron + Vite + React - engine online
            </div>
            <div style={{
                display: "flex",
                gap: 8
            }}>
                {["STUDIO", "LIVE", "PERFORM"].map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                        background: mode === m ? "#00ff9f18" : "transparent",
                        border: `1px solid ${mode === m ? "#00ff9f55" : "#1c1c1c"}`,
                        color: mode === m ? "#00ff9f" : "#555",
                        padding: "6px 14px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 11,
                        letterSpacing: ".06em"
                    }}>
                        {m}
                    </button>
                ))}
            </div>
            <div style={{ 
                color: "#2a2a2a",
                fontSize: 11
            }}>
                mode: {mode}
            </div>
        </div>
    );
}