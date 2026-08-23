// AudioMIX Electron
// src/hooks/usePlaybackScheduler.js
//
// Watches the transport playhead advance and fires
// clip.trigger(clipId) over the bridge at the exact moment
// playhead crosses a clip's start beat.
// Not continuously while playhead sits inside the clip's span.
//
// Only clips with a sampleRef get triggered.
// Unassigned clips have nothing registered via clip.add() on the
// backend to trigger.

import { useEffect, useRef } from "react";
import { BARS } from "../data/studioData.js";

// Any playhead jumper bigger than this many beat-units in one tick
// is treated as a seek/stop/reset, not real playback advancing through
// beats and it is not scanned for crossings.
// Real playback ticks advance by a small fraction of a beat per
// useTransport's TICK_MS, so this threshold is generous w/o risking
// false triggers on a jump.
// e.g., stop() resetting playhead to 0 should not read as "swept across
// the whole timeline" and fire every clip at once.

const MAX_TICK_DELTA = 1;

export function usePlaybackScheduler(tracks, playhead, playing) {
    const prevPlayheadRef = useRef(playhead);

    useEffect(() => {
        const prev = prevPlayheadRef.current;
        const curr = playhead;
        prevPlayheadRef.current = curr;

        // don't scan for crossings from a manual seek while stopped
        // only real playback advancing should trigger clips.
        if (!playing) return;

        // normally just [prev, curr]
        // a loop wrap splits into two ranges so clips near the very end
        // and very start are both still checked correctly across the wrap
        const ranges = curr >= prev ? [[prev, curr]] : [[prev, BARS], [0, curr]];

        const totalSpan = ranges.reduce((sum, [a, b]) => sum + (b - a), 0);
        if (totalSpan > MAX_TICK_DELTA) return;    // seek/stop jump - skip

        for (const track of tracks) {
            for (const clip of track.clips) {
                if (!clip.sampleRef) continue;

                // half-open interval avoids double-triggering a
                // clip that starts exactly on a tick boundary
                const crossed = ranges.some(([a, b]) => clip.start >= a && clip.start < b);
                if (!crossed) continue;

                const command = `clip.trigger("${clip.id}")`;
                if (window.audiomix?.shell?.sendCommand) {
                    window.audiomix.shell.sendCommand(command);
                } else {
                    console.warn("[usePlaybackScheduler] AudioMIX bridge not available, skipping:", command);
                }
            }
        }
    }, [playhead, playing, tracks]);
}