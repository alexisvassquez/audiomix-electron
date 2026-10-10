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
import { useArrangement } from "./hooks/useArrangement.js";
import { usePlaybackScheduler } from "./hooks/usePlaybackScheduler.js";
import { useDsp } from "./hooks/useDsp.js";
import RightPanel from "./components/Studio/RightPanel.jsx";
import { useShellConnection } from "./hooks/useShellConnection.js";

const DEFAULT_PROJECT_NAME = "OOEPUI_NIGHT_01";

export default function App() {
    const [mode, setMode] = useState("STUDIO");
    // Project name is now real state, not a hardcoded constant.
    // Producers need to rename/create their own projects.
    // Original name is kept as default for fresh session and
    // it is not a fixed identity.
    const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);

    const transport = useTransport();
    const { tracks, addClip, assignSample, moveClip, toggleMute, toggleSolo, loadTracks } = useArrangement();
    usePlaybackScheduler(tracks, transport.playhead, transport.playing);
    const dsp = useDsp();

    // Single shell connection for the whole application.
    // ShellDock and StatusBar both read from this one instance (passed down
    // as props) rather than each opening its own IPC subscription to the
    // backend.
    const shell = useShellConnection();

    // Gathers everything persisted in v1: arrangement, project name,
    // BPM/snap.
    // DSP is saved now that the knobs are the frontend source of truth.
    // useDsp's values are what the user set (persistence)
    // Still working on query-back from cpp engine but can now be saved w/o
    // UI is authoritative, loadDspState resends the values to the engine on
    // load to keep in sync.
    const handleSave = async () => {
        if (!window.audiomix?.project?.save) {
            console.warn("[AudioMIX] project.save not available");
            return;
        }
        const projectData = {
            projectName,
            bpm: transport.bpm,
            snap: transport.snap,
            tracks,
            dsp: dsp.getDspState(),
        };
        const result = await window.audiomix.project.save(projectData);
        if (!result.ok && result.error !== "cancelled") {
            console.error("[AudioMIX] Save failed:", result.error);
        }
    };

    const handleLoad = async () => {
        if (!window.audiomix?.project?.load) {
            console.warn("[AudioMIX] project.load not available");
            return;
        }
        const result = await window.audiomix.project.load();
        if (!result.ok) {
            if (result.error != "cancelled") {
                console.error("[AudioMIX] Load failed:", result.error);
            }
            return;
        }
        const { projectData } = result;
        if (projectData?.projectName) setProjectName(projectData.projectName);
        if (typeof projectData?.bpm === "number") transport.setBpm(projectData.bpm);
        if (typeof projectData?.snap === "string") transport.setSnap(projectData.snap);
        if (Array.isArray(projectData?.tracks)) loadTracks(projectData.tracks);
        // no-ops on a missing/partial dsp field rather than erroring
        dsp.loadDspState(projectData?.dsp);
    };

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
                project={projectName}
                onRename={setProjectName}
                onSave={handleSave}
                onLoad={handleLoad}
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
                    <Arrangement 
                        playhead={transport.playhead} 
                        tracks={tracks}
                        onAddClip={addClip}
                        onAssignSample={assignSample}
                        onSeek={transport.seekTo}
                        onMoveClip={moveClip}
                        onToggleMute={toggleMute}
                        onToggleSolo={toggleSolo} 
                    />

                    {/* AS Shell dock - collapsible, sits btwn Arrangement
                        and Transport.
                        Fed from the single shell connection. */}
                    <ShellDock 
                        connected={shell.connected}
                        session={shell.session}
                        lastOutput={shell.lastOutput}
                        lastError={shell.lastError}
                        engineReady={shell.engineReady}
                        sendCommand={shell.sendCommand}
                        enterLive={shell.enterLive}
                        exitLive={shell.exitLive}    
                    />
                </div>

                {/* Right-side DSP panel - master gain + clipper knobs */}
                <RightPanel dsp={dsp} />
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

            {/* Status bar - always visible.
                engineOnline now reflects real runtime readiness, not
                whether transport is playing.
                engine_ready signal */}
            <StatusBar
                mode={mode}
                project={projectName}
                engineOnline={transport.playing}
            />

        </div>
    );
}