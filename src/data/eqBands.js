// AudioMIX Electron
// src/data/eqBands.js
//
// Client-side mirror of the 10-band EQ the C++ engine
// runs and the forwarder's band names.
// See audio/dsp/core/eq_params.h and
// performance_engine/modules/eq.py in core engine repo for
// reference.
// STOPGAP, same as sampleBanks.js: frontend holds the authoritative
// band values and sends eq.set(band, dB).
// Reconciles when engine read-back lands.

export const EQ_BANDS = [
    { key: "sub_bass", label: "SUB", hz: "60" },
    { key: "bass", label: "BASS", hz: "120" },
    { key: "low_mid", label: "LMID", hz: "250" },
    { key: "mid", label: "MID", hz: "500" },
    { key: "high_mid", label: "HMID", hz: "1k" },
    { key: "presence", label: "PRES", hz: "2k" },
    { key: "brilliance", label: "BRIL", hz: "4k" },
    { key: "air", label: "AIR", hz: "8k" },
    { key: "sparkle", label: "SPKL", hz: "12k" },
    { key: "ultra", label: "ULTR", hz: "16k" },
];

// UI range in dB
// Cpp side clamps to +-24
export const EQ_MIN = -12;
export const EQ_MAX = 12;

// Preset curves, indexed to EQ_BANDS order.
// Mirrors the semantic intent of presets_combined.json w/o the
// filter chains.
// Refer to core engine repo.
export const EQ_PRESETS = {
    // SUB, BASS, LMID, MID, HMID, PRES, BRIL, AIR, SPKL, ULTR
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass_boost: [6, 5, 2, 0, 0, 0, 0, 0, 0, 0],
    v_shape: [6, 5, 2, -1, -3, -1, 1, 3, 4, 2],
    vocal_clarity: [-2, -2, -1, 1, 3, 4, 3, 2, 1, 0],
    air_lift: [0, 0, 0, 0, 0, 0, 1, 3, 5, 4], 
};

export const EQ_PRESET_LABELS = [
    ["flat", "Flat"],
    ["bass_boost", "Bass Boost"],
    ["v_shape", "V-Shape"],
    ["vocal_clarity", "Vocal Clarity"],
    ["air_lift", "Air Lift"],
];

// Character chips: a macro nudge over a group of bands
// key -> dB delta
// Applied client-side as eq.set calls.
// No backend boost_semantic needed.
export const EQ_CHIPS = [
    { name: "Warm", deltas: { bass: 3, low_mid: 2 } },
    { name: "Body", deltas: { low_mid: 2, mid: 2 } },
    { name: "Clarity", deltas: { presence: 3, brilliance: 2 } },
    { name: "Air", deltas: { air: 3, sparkle: 2, ultra: 2 } },
    { name: "Scoop", deltas: { mid: -4, low_mid: -2 } },
];