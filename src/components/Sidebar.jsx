// AudioMIX Electron
// src/components/Sidebar.jsx
//
// Left sidebar
// Includes:
// browser, scenes, AudioScript branch status

import React, { useState } from "react";
import { SIDEBAR_BROWSER, SIDEBAR_SCENES } from "../data/studioData.js";

export default function Sidebar() {
    const [activeScene, setActiveScene] = useState("drop_sequence");
    const [activeBranch, setActiveBranch] = useState("IR");

    const sectionLabel = {
        padding: "3px 10px 5px",
        fontSize: 9,
        letterSpacing: ".15em",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        fontWeight: 600,
    };

    const item = {
        padding: "4px 10px",
        fontSize: 11,
        color: "var(--text-dim)",
        display: "flex",
        alignItems: "center",
        gap: 7,
        cursor: "pointer",
        transition: "all .1s",
    };

    const itemActive = {
        ...item,
        color: "var(--accent)",
        background: "var(--accent-dim)",
    };

    const dot = {
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "currentColor",
        flexShrink: 0,
    };

    const count = {
        marginLeft: "auto",
        fontSize: 9,
        color: "var(--text-muted)",
        background: "var(--surface-alt)",
        borderRadius: 8,
        padding: "1px 5px",
    };

    const section = {
        borderBottom: "1px solid var(--border)",
        padding: "6px 0",
    };

    return (
        <div style={{
            width: "var(--sidebar-w)",
            flexShrink: 0,
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        }}>

            {/* Browser section
                TODO: populate from AudioMIX core project file system via FastAPI
             */
            }
            <div style={section}>
                <div style={sectionLabel}>Browser</div>
                {SIDEBAR_BROWSER.map((b, i) => (
                    <div key={i} style={i === 0 ? itemActive: item}>
                        <div style={dot}/>
                        {b.label}
                        <div style={count}>{b.count}</div>
                    </div>
                ))}
            </div>

            {/* Scenes section
                TODO: populate from AudioMIX core session state via FastAPI
             */
            }
            <div style={section}>
                <div style={sectionLabel}>Scenes</div>
                {SIDEBAR_SCENES.map((s, i) => (
                    <div
                      key={i}
                      style={activeScene === s.label ? itemActive : item}
                      onClick={() => setActiveScene(s.label)}>
                        <div style={dot}/>
                        {s.label}
                    </div>
                ))}
            </div>

            {/* AudioScript section */}
            <div style={section}>
                <div style={sectionLabel}>AudioScript</div>

                {/* IR branch */}
                <div
                  style={activeBranch === "IR" ? itemActive : item}
                  onClick={() => setActiveBranch("IR")}>
                    <div style={dot}/>
                    IR v1
                    <div style={{
                        ...count,
                        color: "var(--accent)",
                        background: "var(--accent-dim)",
                    }}>
                        ✓
                    </div>
                  </div>

                  {/* Live branch */}
                  <div
                    style={activeBranch === "LIVE" ? itemActive : item}
                    onClick={() => setActiveBranch("LIVE")}>
                        <div style={dot}/>
                        Live
                        <div style={{
                            ...count,
                            color: "var(--warn)",
                        }}>
                            dev
                        </div>
                    </div>
                
                </div>

                {/* Hardware section
                    TODO: HAL integration - LED bridge, MIDI, OSC device list
                    Will show connected hardware devices when HAL is implemented
                 */
                }
                <div style={section}>
                    <div style={sectionLabel}>Hardware</div>
                    <div style={{
                        ...item,
                        color: "var(--text-muted)",
                        fontSize: 10,
                        fontStyle: "italic",
                        cursor: "default",
                    }}>
                        <div style={dot}/>
                        HAL - coming soon. In development
                    </div>
                </div>

            </div>

    );
}