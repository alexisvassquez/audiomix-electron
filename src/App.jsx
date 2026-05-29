// AudioMIX Electron
// src/App.jsx
//
// Root component
// Mode routing and global layout shell

import React, { useState } from "react";
import TopBar from "./components/TopBar.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Transport from "./components/Transport.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { useTransport } from "./hooks/useTransport.js";

const PROJECT = "OOEPUI_NIGHT_01";

export default function App() {
    const [mode, setMode] = useState("STUDIO");

    const transport = useTransport();

    return (
        <div style={{
            background: "var(--bg)",
            height: "100vh",
            width: "100vw",
            display: "flex",
            fontFamily: "var(--font-mono)",
            flexDirection: "column",
            fontSize: 11,
            overflow: "hidden",
        }}>

            {/* Top bar - always visible */}
            <TopBar
              mode={mode}
              onModeChange={setMode}
              project={PROJECT}
            />

            {/* Main body */}
            <div style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
                minHeight: 0
            }}>
                {/* Sidebar - always visible */}
                <Sidebar />

            {/* Center canvas - mode dependent, placeholder */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: 12,
                letterSpacing: ".1em",
                flexDirection: "column",
                gap: 8,            
            }}>
                <div style={{ 
                    color: "var(--accent)", 
                    fontSize: 10,
                    letterSpacing: ".2em",
                }}>
                    {mode} MODE
                </div>
                <div>Canvas coming soon</div>
            </div>
        </div>

        {/* Transport - always visible */}
        <Transport
          playing={transport.playing}
          recording={transport.recording}
          time={transport.time}
          bpm={transport.bpm}
          snap={transport.snap}
          snapOptions={transport.snapOptions}
          onTogglePlay={transport.togglePlay}
          onStop={transport.stop}
          onToggleRecord={transport.toggleRecord}
          onSnapChange={transport.setSnap}
          onBpmChange={transport.setBpm}
        />

        {/* Status bar - always visible */}
        <StatusBar
          mode={mode}
          project={PROJECT}
          engineOnline={transport.playing}
        />

        </div>
    );
}