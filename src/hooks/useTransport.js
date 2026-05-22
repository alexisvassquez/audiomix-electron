// AudioMIX Electron
// src/hooks/useTransport.js

// Transport state:
// play, stop, record, time, playhead, BPM, snap
// Currently local state. Will be driven by AudioMIX core engine
// via WebSocket/FastAPI when the bridge is live.

import { useState, useEffect, useRef } from "react";
import { SNAP_OPTIONS, BARS, BEAT_W } from "../data/studioData.js";

export function useTransport() {
    const [playing, setPlaying] = useState(false);
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [playhead,setPlayhead] = useState(0);
    const [bpm, setBpm] = useState(138);
    const [snap, setSnap] = useState("1/4");

    const intervalRef = useRef(null);

    useEffect(() => {
        if (!playing) return;

        intervalRef.current = setInterval(() => {
            setTime(t => t + 1);
            setPlayhead(p => {
                const next = p + 0.0625;
                return next => BARS ? 0 : next;
            });
        }, 250);

        return () => clearInterval(intervalRef.current);
    }, [playing]);

    function play() {
        setPlaying(true);
    }

    function pause() {
        setPlaying(false);
    }

    function stop() {
        setPlaying(false);
        setRecording(false);
        setTime(0);
        setPlayhead(0);
    }

    function togglePlay() {
        setPlaying(p => !p);
        if (recording && playing) setRecording(false);
    }

    function toggleRecord() {
        setRecording(r => !r);
        if (!playing) setPlaying(true);
    }

    function seekTo(bar) {
        setPlayhead(bar);
    }

    return {
        // state
        playing,
        recording,
        time,
        playhead,
        bpm,
        snap,
        // actions
        play,
        pause,
        stop,
        togglePlay,
        seekTo,
        setBpm,
        setSnap,
        snapOptions: SNAP_OPTIONS,
    };
}