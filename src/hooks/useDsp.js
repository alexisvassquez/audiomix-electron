// AudioMIX Electron
// src/hooks/useDsp.js
//
// Holds DSP param state and sends the matching AudioScript
// command over the bridge on change.
// This is the frontend's local echo of DSP intent.
// Saves DSP values to project files

import { useState, useCallback } from "react";

function sendCommand(command) {
    if (window.audiomix?.shell?.sendCommand) {
        window.audiomix?.shell.sendCommand(command);
    } else {
        console.warn("[useDsp] bridge not available, skipping:", command);
    }
}

export function useDsp() {
    // defaults mirror the cpp module boot defaults in main.cpp,
    // so knobs START in the same position the engine actually boots at.
    // TODO: engine reads back to confirms it stays in sync after.
    // only accounts for gain and clipper modules for now
    const [gainDb, setGainDb] = useState(0.0);
    const [clipDrive, setClipDrive] = useState(0.0);
    const [clipCeiling, setClipCeiling] = useState(-0.1);
    const [clipMix, setClipMix] = useState(1.0);

    const updateGain = useCallback((v) => {
        setGainDb(v);
        sendCommand(`gain.set(gain_db=${v})`);
    }, []);

    const updateClipDrive = useCallback((v) => {
        setClipDrive(v);
        sendCommand(`clipper.set(drive_db=${v})`);
    }, []);

    const updateClipCeiling = useCallback((v) => {
        setClipCeiling(v);
        sendCommand(`clipper.set(ceiling_db=${v})`);
    }, []);

    const updateClipMix = useCallback((v) => {
        setClipMix(v);
        sendCommand(`clipper.set(mix=${v})`);
    }, []);

    // Restores DSP state from a loaded project.
    // Tolerant of missing fields (no dsp key at all or partial)
    // Keeps the current default for anything absent, rather than setting
    // a knob to undefined.
    // Also resends each command to the engine, loading a project has to
    // push the restored values down to cpp, not just move knobs visually
    // or else audio wouldn't match the UI until each knob was manually turned.
    const loadDspState = useCallback((saved) => {
        if (!saved || typeof saved !== "object") return;

        if (typeof saved.gainDb === "number") {
            setGainDb(saved.gainDb);
            sendCommand(`gain.set(gain_db=${saved.gainDb})`);
        }
        if (typeof saved.clipDrive === "number") {
            setClipDrive(saved.clipDrive);
            sendCommand(`clipper.set(drive_db=${saved.clipDrive})`);
        }
        if (typeof saved.clipCeiling === "number") {
            setClipCeiling(saved.clipCeiling);
            sendCommand(`clipper.set(ceiling_db=${saved.clipCeiling})`);
        }
        if (typeof saved.clipMix === "number") {
            setClipMix(saved.clipMix);
            sendCommand(`clipper.set(mix=${saved.clipMix})`);
        }
    }, []);

    // snapshot of current values, for saving into a project file
    const getDspState = useCallback(() => ({
        gainDb, clipDrive, clipCeiling, clipMix,
    }), [gainDb, clipDrive, clipCeiling, clipMix]);

    return {
        gainDb, updateGain,
        clipDrive, updateClipDrive,
        clipCeiling, updateClipCeiling,
        clipMix, updateClipMix,
        loadDspState, getDspState,
    };
}