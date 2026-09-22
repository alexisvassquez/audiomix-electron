// AudioMIX Electron
// src/components/TopBar.jsx
//
// Top bar of Electron UI
// Includes:
// logo (currently a prototype), mode switcher, project name,
// Juniper2.0 (AI) status

import React from "react";

const MODES = ["STUDIO", "LIVE", "PERFORM"];

export default function TopBar({ mode, onModeChange, project, onRename, onSave, onLoad }) {
    // Click to rename: local edit state only, commits back up to
    // App.jsx (real source of truth for projectName) on blur or
    // Enter.
    // Esc reverts w/o committing.
    const [editing, setEditing] = React.useState(false);
    const [draftName, setDraftName] = React.useState(project);

    // Keep the draft in sync if the real project name changes from
    // elsewhere, such as a project just loaded.
    React.useEffect(() => {
        if (!editing) setDraftName(project);
    }, [project, editing]);

    const commitRename = () => {
        setEditing(false);
        const trimmed = draftName.trim();
        if (trimmed && trimmed !== project && onRename) {
            onRename(trimmed);
        } else {
            setDraftName(project);
        }
    };

    return (
        <div style={{
            height: "var(--topbar-h)",
            flexShrink: 0,
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px",
            zIndex: 200,
            userSelect: "none",
        }}>

            {/* Logo */}
            <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--accent)",
                letterSpacing: ".1em",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent)",
                    animation: "am-pulse 2s ease-in-out infinite",
                }}/>
                AUDIOMIX
            </div>

            <div className="am-divider-v"/>

            {/* Mode switcher */}
            <div style={{
                display: "flex",
                gap: 2,
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: 2,
            }}>
                {MODES.map(m => (
                    <button
                        key={m}
                        onClick={() => onModeChange(m)}
                        style={{
                            padding: "3px 10px",
                            borderRadius: 3,
                            border: mode === m ? "1px solid var(--accent-mid)" : "1px solid transparent",
                            cursor: "pointer",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: ".06em",
                            background: mode === m ? "var(---accent-dim)" : "transparent",
                            color: mode === m ? "var(--accent)" : "var(--text-dim)",
                            transition: "all .15s",
                        }}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="am-spacer"/>

            {/* Save / Open */}
            <button className="am-btn" onClick={onSave} title="Save project">Save</button>
            <button className="am-btn" onClick={onLoad} title="Open project">Open</button>

            <div className="am-divider-v"/>

            {/* Project name - click to rename */}
            <div style={{
                fontSize: 11,
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                Project:
                {editing ? (
                    <input
                        autoFocus
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") {
                                setDraftName(project);
                                setEditing(false);
                            }
                        }}
                        style={{
                            background: "var(--surface-alt)",
                            border: "1px solid var(--accent-mid)",
                            color: "var(--text)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            padding: "1px 4px",
                            borderRadius: 3,
                            width: 150,
                        }}
                    />    
                ) : (
                    <span
                        onClick={() => setEditing(true)}
                        title="Click to rename" 
                        style= {{ color: "var(--text)", cursor: "text" }}
                    >
                        {project}
                    </span>
                )}
            </div>

            <div className="am-divider-v"/>

            {/* Juniper2.0 status pill */}
            <div style={{
                fontSize: 10,
                color: "var(--juniper)",
                background: "var(--juniper-dim)",
                border: "1px solid #7c6af733",
                borderRadius: 4,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                transition: "all .15s",
            }}>
                <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--juniper)",
                    animation: "am-pulse-juniper 1.5s ease-in-out infinite",
                }}/>
                Juniper2.0
            </div>

        </div>
    );
}