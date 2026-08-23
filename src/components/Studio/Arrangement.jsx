// AudioMIX Electron
// src/components/Studio/Arrangement.jsx
//
// Linear timeline arrangement view -
// track headers, ruler, clip lanes, playhead
// Freq view and layered clips are separate components built
// on top of this foundation
// `playhead` comes in as a prop, not internal state
// Arrangement is presentational with respect to transport.
// App.jsx owns useTransport, so `transport.playhead` is passed down.

import React from "react";
import { BARS, BEAT_W } from "../../data/studioData.js";
import { SAMPLE_BANKS } from "../../data/sampleBanks.js";

// `tracks` and `onAddClip` now come from useArrangement (owned by App.jsx)
// not impored directly - Arrangement.js no longer owns clip data
export default function Arrangement({ playhead, tracks, onAddClip, onAssignSample }) {
    const playheadX = playhead * BEAT_W;
    const containerRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = React.useState(0);
    // { trackId, clipId } | null
    const [openPicker, setOpenPicker] = React.useState(null);

    React.useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const observer = new ResizeObserver(entries => {
            setContainerWidth(entries[0].contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const timelineWidth = Math.max(BARS * BEAT_W, containerWidth);

    // Converts a mouse x-position into a beat value and calls onSeek.
    // Not snapped to BEAT_W grid like click-to-place clips are,
    // scrubbing should track the cursor continuously, not jump to the
    // nearest beat.
    const seekFromClientX = (clientX) => {
        if (!rulerRef.current || !onSeek) return;
        const rect = rulerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        // Clamp just under BARS rather than at it - useTransport's playhead
        // wraps to 0 at >= BARS, so landing exactly on BARS would visually
        // read as the very start of the loop instead of the very end.
        const beat = Math.max(0, Math.min(BARS - 0.01, x / BEAT_W));
        onSeek(beat);
    };

    // mousedown seeks immediately, then tracks mousemove/mouseup on
    // window (not just the ruler) so dragging outside the ruler's
    // bounds will still holding the mouse button continues to scrub
    // instead of stopping the moment the cursor leaves the strip.
    const handleRulerMouseDown = (e) => {
        seekFromClientX(e.clientX);
        const handleMouseMove = (moveEvent) => seekFromClientX(moveEvent.clientX);
        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderBottom: "1px solid var(--border)",
            minHeight: 0,
            minWidth: 0,
        }}>

            {/* Header */}
            <div className="am-panel-header">
                <span className="am-panel-title">Arrangement</span>
                <span style={{
                    marginLeft: 8,
                    fontSize: 9,
                    color: "var(--accent)",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-mid)",
                    borderRadius: 3,
                    padding: "1px 6px",
                }}>
                    linear view
                </span>
                <div className="am-spacer" />
                <button className="am-btn">+ Track</button>
                <button className="am-btn-primary">Compile IR</button>
            </div>

            {/* Body: track headers + scrollable timeline */}
            <div style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
            }}>

                {/* Track headers - fixed column */}
                <div style={{
                    width: 152,
                    flexShrink: 0,
                    borderRight: "1px solid var(--border)",
                    overflow: "hidden",
                }}>
                    {tracks.map(tr => (
                        <div key={tr.id} style={{
                            height: 44,
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 8px",
                            gap: 6,
                            background: "var(--surface)",
                            cursor: "pointer",
                        }}>
                            <div style={{
                                width: 3,
                                height: 18,
                                borderRadius: 2,
                                background: tr.color,
                                flexShrink: 0,
                            }} />
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{
                                    fontSize: 10,
                                    color: "var(--text)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {tr.name}
                                </div>
                                <div style={{ fontSize: 8, color: "var(--text-dim)" }}>
                                    {tr.type}
                                </div>
                            </div>
                            <button style={{
                                width: 15,
                                height: 15,
                                borderRadius: 2,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 7,
                                background: "#ffaa0018",
                                color: "var(--warn)",
                            }}>M</button>
                            <button style={{
                                width: 15,
                                height: 15,
                                borderRadius: 2,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 7,
                                background: "var(--accent-dim)",
                                color: "var(--accent)",
                            }}>S</button>
                        </div>
                    ))}
                </div>

                {/* Scrollable timeline */}
                <div ref={containerRef} style={{
                    flex: 1,
                    overflowX: "auto",
                    overflowY: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}>

                    {/* Ruler */}
                    <div style={{
                        height: 20,
                        flexShrink: 0,
                        display: "flex",
                        background: "var(--surface-alt)",
                        borderBottom: "1px solid var(--border)",
                        position: "relative",
                        minWidth: "100%",
                        width: timelineWidth,
                    }}>
                        {Array.from({ length: BARS }, (_, i) => (
                            <div key={i} style={{
                                width: BEAT_W,
                                flexShrink: 0,
                                borderRight: "1px solid var(--border)",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: 5,
                                fontSize: 8,
                                color: i % 4 === 0 ? "var(--text-dim)" : "var(--text-muted)",
                            }}>
                                {i % 4 === 0 ? `bar ${i / 4 + 1}` : "·"}
                            </div>
                        ))}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            width: 2,
                            left: playheadX,
                            background: "var(--accent)",
                            boxShadow: "0 0 6px var(--accent)",
                            transition: "left .05s linear",
                        }} />
                    </div>

                    {/* Clip lanes */}
                    <div style={{
                        position: "relative",
                        flex: 1,
                        minWidth: "100%",
                        width: timelineWidth,
                    }}>
                        {/* Playhead line across all lanes */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            width: 1,
                            left: playheadX,
                            background: "var(--accent)",
                            boxShadow: "0 0 6px var(--accent)",
                            pointerEvents: "none",
                            zIndex: 20,
                            transition: "left .05s linear",
                        }} />

                        {tracks.map((tr, ti) => (
                            <div key={tr.id} onClick={(e) => {
                                // snap click position to the BEAT_W grid
                                // getBoundingClientRect() accounts for horizontal scroll
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const beat = Math.max(0, Math.min(BARS - 1, Math.floor(x / BEAT_W)));
                                onAddClip(tr.id, beat);
                            }}
                            style={{
                                height: 44,
                                borderBottom: "1px solid var(--border)",
                                position: "relative",
                                minWidth: "100%",
                                width: timelineWidth,
                                background: ti % 2 === 0 ? "var(--surface)" : "#0b0b0b",
                                backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent ${BEAT_W - 1}px, var(--border) ${BEAT_W - 1}px, var(--border) ${BEAT_W}px)`,
                                cursor: "cell",
                            }}>
                                {tr.clips.map((clip, ci) => (
                                    <div key={ci} onClick={(e) =>
                                        // still stopPropogation so this doesn't also trigger the lane's
                                        // onClick and place a new clip underneath 
                                        {e.stopPropagation();
                                            setOpenPicker(prev => prev && prev.clipId === clip.id ? null : { trackId: tr.id, clipId: clip.id });
                                        }} 
                                        style={{
                                        position: "absolute",
                                        top: 4,
                                        left: clip.start * BEAT_W,
                                        width: clip.len * BEAT_W - 2,
                                        height: 34,
                                        borderRadius: 3,
                                        background: `${tr.color}20`,
                                        border: `1px solid ${tr.color}55`,
                                        color: tr.color,
                                        fontSize: 8,
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "0 5px",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {clip.sampleRef || (ci === 0 ? tr.name : "")}
                                    </div>
                                ))}

                                // Sample picker - rendered as a sibling of the clips, not a child.
                                // The clip div above has overflow:"hidden"
                                // (truncates long names)
                                {openPicker?.trackId === tr.id && (() => {
                                    const openClip = tr.clips.find(c => c.id === openPicker.clipId);
                                    if (!openClip) return null;
                                    return (
                                        <select 
                                            autofocus
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                onAssignSample(tr.id, openClip.id, "drums", e.target.value);
                                                setOpenPicker(null);
                                            }}
                                            defaultValue=""
                                            style={{
                                                position: "absolute",
                                                top: 40,
                                                left: openClip.start * BEAT_W,
                                                zIndex: 30,
                                                minWidth: 100,
                                                fontSize: 9,
                                                fontFamily: "var(--fomt-mono)",
                                                background: "var(--surface-alt",
                                                color: "var(--text)",
                                                border: "1px solid var(--border-bright)",
                                                borderRadius: 3,
                                            }}>
                                            <option value="" disabled>assign sample...</option>
                                            {SAMPLE_BANKS.drums.sounds.map(s => (
                                                <option key={s.alias} value={s.alias}>{s.title}</option>
                                            ))}
                                        </select>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}