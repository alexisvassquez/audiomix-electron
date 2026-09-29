// AudioMIX Electron
// src/hooks/useDsp.js
//
// Holds DSP param state and sends the matching AudioScript
// command over the bridge on change.
// This is the frontend's local echo of DSP intent.
// Saves DSP values to project files.

import { cp } from "original-fs";
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
    const [gainDb, setGainDb] = useState(0.0);
    const [clipDrive, setClipDrive] = useState(0.0);
    const [clipCeiling, setClipCeiling] = useState(-0.1);
    const [clipMix, setClipMix] = useState(1.0);

    // Compressor - 7 params.
    // Defaults mirror compressor.py's DEFAULTS and CompressorParams
    // in compressor_params.h
    const [compThreshold, setCompThreshold] = useState(-18.0);
    const [compRatio, setCompRatio] = useState(4.0);
    const [compAttack, setCompAttack] = useState(10.0);
    const [compRelease, setCompRelease] = useState(100.0);
    const [compKnee, setCompKnee] = useState(6.0);
    const [compMakeup, setCompMakeup] = useState(0.0);
    const [compMix, setCompMix] = useState(1.0);

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

    const updateCompThreshold = useCallback((v) => {
        setCompThreshold(v);
        sendCommand(`compressor.set(threshold=${v})`);
    }, []);

    const updateCompRatio = useCallback((v) => {
        setCompRatio(v);
        sendCommand(`compressor.set(ratio=${v})`);
    }, []);

    const updateCompAttack = useCallback((v) => {
        setCompAttack(v);
        sendCommand(`compressor.set(attack_ms=${v})`);
    }, []);

    const updateCompRelease = useCallback((v) => {
        setCompRelease(v);
        sendCommand(`compressor.set(release_ms=${v})`);
    }, []);

    const updateCompKnee = useCallback((v) => {
        setCompKnee(v);
        sendCommand(`compressor.set(knee_db=${v})`);
    }, []);

    const updateCompMakeup = useCallback((v) => {
        setCompMakeup(v);
        sendCommand(`compressor.set(makeup_db=${v})`);
    }, []);

    const updateCompMix = useCallback((v) => {
        setCompMix(v);
        sendCommand(`compressor.set(mix=${v})`);
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

        if (typeof saved.compThreshold === "number") {
            setCompThreshold(saved.compThreshold);
            sendCommand(`compressor.set(threshold=${saved.compThreshold})`);
        }
        if (typeof saved.compRatio === "number") {
            setCompRatio(saved.compRatio);
            sendCommand(`compressor.set(ratio=${saved.compRatio})`);
        }
        if (typeof saved.compAttack === "number") {
            setCompAttack(saved.compAttack);
            sendCommand(`compressor.set(attack_ms=${saved.compAttack})`);
        }
        if (typeof saved.compRelease === "number") {
            setCompRelease(saved.compRelease);
            sendCommand(`compressor.set(release_ms=${saved.compRelease})`);
        }
        if (typeof saved.compKnee === "number") {
            setCompKnee(saved.compKnee);
            sendCommand(`compressor.set(knee_db=${saved.compKnee})`);
        }
        if (typeof saved.compMakeup === "number") {
            setCompMakeup(saved.compMakeup);
            sendCommand(`compressor.set(makeup_db=${saved.compMakeup})`);
        }
        if (typeof saved.compMix === "number") {
            setCompMix(saved.compMix);
            sendCommand(`compressor.set(mix=${saved.compMix})`);
        }
    }, []);

    // snapshot of current values, for saving into a project file
    const getDspState = useCallback(() => ({
        gainDb, clipDrive, clipCeiling, clipMix,
        compThreshold, compRatio, compAttack, compRelease,
        compKnee, compMakeup, compMix,
    }), [gainDb, clipDrive, clipCeiling, clipMix,
        compThreshold, compRatio, compAttack, compRelease,
        compKnee, compMakeup, compMix]);

    return {
        gainDb, updateGain,
        clipDrive, updateClipDrive,
        clipCeiling, updateClipCeiling,
        clipMix, updateClipMix,
        compThreshold, updateCompThreshold,
        compRatio, updateCompRatio,
        compAttack, updateCompAttack,
        compRelease, updateCompRelease,
        compKnee, updateCompKnee,
        compMakeup, updateCompMakeup,
        compMix, updateCompMix,
        loadDspState, getDspState,
    };
}