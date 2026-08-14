// AudioMIX Electron
// src/hooks/useArrangement.js

import { useState, useCallback } from "react";
import { TRACKS as INITIAL_TRACKS } from "../data/studioData.js";

// studioData.js clips have no id, so give each one a stable
// id up front
// array-index keys break once clips can be added/removed
function withClipIds(tracks) {
    return tracks.map(tr => ({
        ...tr,
        clips: tr.clips.map((clip, i) => ({
            id: `${tr.id}-seed-${i}`,
            ...clip,
        })),
    }));
}

// seeded past the static "seed" ids above
let nextClipId = 1000;

export function useArrangement() {
    const [tracks, setTracks] = useState(() => withClipIds(INITIAL_TRACKS));

    // default clip lenght = 2 beats on click
    const addClip = useCallback((trackId, startBeat, lenBeats = 2) => {
        setTracks(prev => prev.map(tr => {
            if (tr.id !== trackId) return tr;
            // don't stack new clip on top of an existing one
            const overlaps = tr.clips.some(
                c => startBeat < c.start + c.len && startBeat + lenBeats > c.start
            );
            if (overlaps) return tr;
            return {
                ...tr,
                clips: [...tr.clips, { id: nextClipId++, start: startBeat, len: lenBeats }],
            };
        }));
    }, []);

    const removeClip = useCallback((trackId, clipId) => {
        setTracks(prev => prev.map(tr =>
            tr.id === trackId ? { ...tr, clips: tr.clips.filter(c => c.id !== clipId) } : tr
        ));
    }, []);

    return { tracks, addClip, removeClip };
}