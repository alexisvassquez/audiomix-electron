// AudioMIX Electron
// src/data/studioData.js

// Static placeholder data for STUDIO mode
// These will eventually be driven by the AudioMIX
// core engine via FastAPI/WebSocket

export const TRACK_COLORS = [
    "#00ff9f",
    "#4d9fff",
    "#ff6ac1",
    "#7c6af7",
    "#ff4455",
    "#00cfff",
    "#f1fa8c",
];

export const BARS = 16;
export const BEAT_W = 48; // px per beat

export const TRACKS = [
    {
        id: 0,
        name: "KICK",
        type: "drum",
        color: TRACK_COLORS[0],
        clips: [
            { start: 0, len: 2 },
            { start: 4, len: 2 },
            { start: 8, len: 2 },
            { start: 12, len: 2 },
        ],
    },
    {
        id: 1,
        name: "SNARE",
        type: "drum",
        color: TRACK_COLORS[1],
        clips: [
            { start: 2, len: 2 },
            { start: 6, len: 2 },
            { start: 10, len: 2 },
            { start: 14, len: 2 },
        ],
    },
    {
        id: 2,
        name: "BASS STB",
        type: "synth",
        color: TRACK_COLORS[2],
        clips: [
            { start: 0, len: 4 },
            { start: 6, len: 6 },
            { start: 14, len: 2 },
        ],
    },
    {
        id: 3,
        name: "LEAD SYN",
        type: "synth",
        color: TRACK_COLORS[3],
        clips: [
            { start: 4, len: 8 },
            { start: 13, len: 3 },
        ],
    },
    {
        id: 4,
        name: "CHORD PAD",
        type: "synth",
        color: TRACK_COLORS[4],
        clips: [
            { start: 0, len: 16 },
        ],
    },
    {
        id: 5,
        name: "VOCAL CHOP",
        type: "audio",
        color: TRACK_COLORS[5],
        clips: [
            { start: 3, len: 2 },
            { start: 7, len: 1 },
            { start: 11, len: 4 },
        ],
    },
    {
        id: 6,
        name: "FX RISER",
        type: "audio", 
        color: TRACK_COLORS[6],
        clips: [
            { start: 14, len: 2 },
        ],
    },
    {
        id: 7,
        name: "MASTER BUS",
        type: "bus",
        color: TRACK_COLORS[7],
        clips: [],
    },
];

export const MIXER_CHANNELS = [
    {
        name: "KICK",
        color: TRACK_COLORS[0],
        vol: 80,
        pan: 0,
        mute: false,
        solo: false,
    },
    {
        name: "SNARE",
        color: TRACK_COLORS[1],
        vol: 75,
        pan: 5,
        mute: false,
        solo: false,
    },
    {
        name: "BASS",
        color: TRACK_COLORS[2],
        vol: 85,
        pan: -8,
        mute: false,
        solo: false,
    },
    {
        name: "LEAD",
        color: TRACK_COLORS[3],
        vol: 70,
        pan: 12,
        mute: false,
        solo: false,
    },
    {
        name: "PAD",
        color: TRACK_COLORS[4],
        vol: 60,
        pan: 0,
        mute: false,
        solo: false,
    },
    {
        name: "VOX",
        color: TRACK_COLORS[5],
        vol: 78,
        pan: -5,
        mute: false,
        solo: false,
    },
    {
        name: "FX",
        color: TRACK_COLORS[6],
        vol: 65,
        pan: 0,
        mute: false,
        solo: false,
    },
    {
        name: "MASTER",
        color: TRACK_COLORS[7],
        vol: 90,
        pan: 0,
        mute: false,
        solo: false,
    },
];

export const SNAP_OPTIONS = ["1/1", "1/2", "1/4", "1/8", "1/16"];

export const SIDEBAR_BROWSER = [
    { label: "Arrangement", count: 8 },
    { label: "Samples", count: 142 },
    { label: "Instruments", count: 24 },
    { label: "Effects", count: 38 },
];

export const SIDEBAR_SCENES = [
    { label: "drop_sequence", active: true },
    { label: "intro", active: false },
    { label: "build_up", active: false },
    { label: "outro", active: false },
];

export const JUNIPER_INITIAL_MSGS = [
    { type: "ai", text: "Ready - OOEPUI_NIGHT_01 indexed." },
    { type: "user", text: "make the drop harder" },
    { type: "ai", text: "Raising kick compression to 6:1, pushing bass stab +2dB, adding overdrive to lead. Tighten the snare transient too?" },
    { type: "user", text: "yes and add reverb tail on the vocal chop" },
    { type: "ai", text: "Done. Pre-delay 18ms, decay 1.2s on vocal chop. Listening now..." },
];

// Helpers
export function fmtTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (second % 60).toString().padStart(2, "0");
    return `${m}:${s}:00`;
}