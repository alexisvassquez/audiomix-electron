// AudioMIX Electron
// src/hooks/useArrangement.js
//
// Owns clip/track state for the Arrangement view
// Receives tracks and calls addClip on click, but never mutates
// state directly.

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
            bank: null,
            sampleRef: null,
            ...clip,
        })),
    }));
}

// seeded past the static "seed" ids above
let nextClipId = 1000;

export function useArrangement() {
    const [tracks, setTracks] = useState(() => withClipIds(INITIAL_TRACKS));

    // default clip length = 2 beats on click
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

    const assignSample = useCallback((trackId, clipId, bank, alias) => {
        setTracks(prev => prev.map(tr => {
            if (tr.id !== trackId) return tr;
            return {
                ...tr,
                clips: tr.clips.map(c => c.id === clipId ? { ...c, bank, sampleRef: alias } : c),
            };
        }));

        // Register with the backend so clip.trigger(clipId) has something
        // real to play.
        // clip_add()'s params are positional-or-keyword, so passing bank as
        // the 4th positional arg matches its signature
        // matches the quoting style parse_and_execute() already expects.
        const command = `clip.add("${clipId}", "sampler", "${alias}", "${bank}")`;
        if (window.audiomix?.shell?.sendCommand) {
            window.audiomix.shell.sendCommand(command);
        } else {
            console.warn("[useArrangement] AudioMIX bridge not available, skipping: ", command);
        }
    }, []);

    {/** Overlap clips, drag and drop */}
    const moveClip = useCallback((trackId, clipId, newStart) => {
        setTracks(prev => prev.map(tr => {
            if (tr.id !== trackId) return tr;

            const movingClip = tr.clips.find(c => c.id == clipId);
            if (!movingClip) return tr;

            const start = Math.max(0, newStart);

            {/* Same overlap check as addClip - reject the move (state
                stays unchanged) rather than let it land on top of
                another clip.
                The caller clears its drag preview either way, so a rejected
                move visually snaps back to the clip's original position. 
            */}
            const overlaps = tr.clips.some(c =>
                c.id !== clipId &&
                start < c.start + c.len &&
                start + movingClip.len > c.start
            );
            if (overlaps) return tr;

            return {
                ...tr,
                clips: tr.clips.map(c => c.id === clipId ? { ...c, start } : c),
            };
        }));
    }, []);

    return { tracks, addClip, removeClip, assignSample, moveClip };
}