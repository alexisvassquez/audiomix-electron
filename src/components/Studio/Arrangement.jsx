// AudioMIX Electron
// src/components/Studio/Arrangement.jsx
//
// Linear timeline arrangement view -
// track headers, ruler, clip lanes, playhead
// Freq view and layered clips are separae components built
// on top of this foundation
// `playhead` comes in as a prop, not internal state
// Arrangement is presentational with respect to transport.
// App.jsx owns useTransport, so `transport.playhead` is passed down.
// Foundational - no drag and drop (yet)

import React from "react";
import { TRACKS, BARS, BEAT_W } from "../../data/studioData.js";

export default function Arrangement({ playhead }) {
    const playheadX = playhead * BEAT_W;

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
                    {TRACKS.map(tr => (
                        <div key={tr.id} style={{
                            height: 36,
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
                <div style={{
                    flex: 1,
                    overflowX: "auto",
                    overflowY: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}>

                    {/* Ruler */}
                    <div style={{
                        height: 20,
                        flexShrink: 0,
                        display: "flex",
                        background: "var(--surface-alt)",
                        borderBottom: "1px solid var(--border)",
                        position: "relative",
                        width: BARS * BEAT_W,
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
                    <div style={{ position: "relative", width: BARS * BEAT_W }}>
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
                        
                        {TRACKS.map((tr, ti) => (
                            <div key={tr.id} style={{
                                height: 36,
                                borderBottom: "1px solid var(--border)",
                                position: "relative",
                                background: ti % 2 === 0 ? "var(--surface)" : "#0b0b0b",
                                backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent ${BEAT_W - 1}px, var(--border) ${BEAT_W -1}px, var(--border) ${BEAT_W}px)`,
                            }}>
                                {tr.clips.map((clip, ci) => (
                                    <div key={ci} style={{
                                        position: "absolute",
                                        top: 4,
                                        left: clip.start * BEAT_W,
                                        width: clip.len * BEAT_W - 2,
                                        height: 28,
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
                                        {ci === 0 ? tr.name : ""}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}