// AudioMIX Electron
// src/hooks/useDsp.js
//
// Holds DSP param state and sends the matching AudioScript
// command over the bridge on change.
// This is the frontend's local echo of DSP intent.
// TODO: C++ engine needs query-back path
// This drives the knobs for now, need persistence
// and restoring on load.

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

    return {
        gainDb, updateGain,
        clipDrive, updateClipDrive,
        clipCeiling, updateClipCeiling,
        clipMix, updateClipMix,
    };
}