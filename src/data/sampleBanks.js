// AudioMIX Electron
// src/data/sampleBanks.js
//
// Mirrors performance_engine/config/sampler_bank_drums.json
// The WebSocket bridge only speaks shell_input strings right now,
// not structured queries.
// This duplicates the data client-side.
// TODO: Replace w/ a real query once bridge supports one
// Will drift out of sync if backend bank JSON changes & this doesnt

export const SAMPLE_BANKS = {
    drums: {
        label: "Drums",
        sounds: [
            { alias: "kick", title: "kick84" },
            { alias: "snare", title: "dr-snare-126" },
            { alias: "hihat", title: "open-hihat-5" },
            { alias: "clap", title: "handclap11" },
        ],
    },
};