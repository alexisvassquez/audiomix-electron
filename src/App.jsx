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
import Arrangement from "./components/Studio/Arrangement.jsx";
import ShellDock from "./components/ShellDock.jsx";

const PROJECT = "OOEPUI_NIGHT_01";

export default function App() {
    const [mode, setMode] = useState("STUDIO");

    const transport = useTransport();

    // Debug
    React.useEffect(() => {
        console.log("window.innerWidth:", window.innerWidth);
        console.log("window.innerHeight:", window.innerHeight);
        console.log("devicePixelRatio:", window.devicePixelRatio);
    }, []);

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
                minHeight: 0,
                minWidth: 0,
            }}>
                {/* Sidebar - always visible */}
                <Sidebar />

                {/* Canvas column: Arrangement + Shell dock stacked,
                    so the dock spans only the canvas width, not sidebar too */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    minWidth: 0,
                }}>

                    {/* Center canvas, fed from Arrangement.jsx */}
                    <Arrangement playhead={transport.playhead} />

                    {/* AS Shell dock - collapsible, sits btwn Arrangement
                        and Transport */}
                    <ShellDock />
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