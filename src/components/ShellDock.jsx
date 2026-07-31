// AudioMIX Electron
// src/components/ShellDock.jsx
//
/* The AS Shell panel
   A collapsible dock living at the bottom of STUDIO mode,
   below the Arrangement and above the Transport row.
   Talks to the FastAPI bridge exclusively through
   useShellConnection(), which itself only talks to
   window.audiomix.shell (exposed by preload).

   Reuses the app's existing .am-panel-header / .am-panel-title / .am-btn
   utility classes from src/styles/tokens.css so this panel reads as
   native to the rest of AudioMIX rather than a bolted-on piece with its
   own visual language.

   This component owns its own local command log (an array of entries),
   since useShellConnection only exposes the latest lastOutput/session
   update, not history.
   Every submitted command and every result/error that arrives gets 
   appended here.

   NOTE: the IR/LIVE toggle currently only *displays* the branch from
   session.audioscript_branch
   Clicking it does not yet call /shell/live/enter or /shell/live/exit. 
   That wiring is a deliberate follow-up step, not done here.
   TODO
*/
import { useState, useEffect, useRef, useCallback } from "react";
import { useShellConnection } from "../hooks/useShellConnection";
import "../styles/ShellDock.css";

function timestamp() {
    return new Date().toTimeString().slice(0, 8);
}

// Unique ID per log entry so React can key them w/o relying on
// array index.
// Entries can arrive faster than a timestamp changes.
let logIdCounter = 0;
function nextLogId() {
    logIdCounter += 1;
    return logIdCounter;
}

export default function ShellDock() {
    const { connected, session, lastOutput, lastError, sendCommand } = useShellConnection();

    const [open, setOpen] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [log, setLog] = useState([
        { id: nextLogId(), kind: "system", time: timestamp(), text: "shell dock mounted" },
    ]);

    const logRef = useRef(null);
    // Track the last output/error object we already logged, so the
    // useEffect below doesn't re-append the same result twice if
    // lastOutput/lastError's ref stays the same across re-renders
    // but the component re-runs for an unrelated reason.
    const lastLoggedOutput = useRef(null);
    const lastLoggedError = useRef(null);

    const appendLog = useCallback((kind, text) => {
        setLog((prev) => [...prev, { id: nextLogId(), kind, time: timestamp(), text}]);
    }, []);

    // Auto-scroll to the newest entry whenever the log grows
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    // Log connection status transitions
    useEffect(() => {
        appendLog("system", connected ? "connected to bridge" : "disconnected from bridge");
    }, [connected]);

    // Log a new shell_output result the moment it arrives
    useEffect(() => {
        if (lastOutput && lastOutput !== lastLoggedOutput.current) {
            lastLoggedOutput.current = lastOutput;
            if (lastOutput.success) {
                appendLog("result", lastOutput.result ?? "(no result)");
            } else {
                appendLog("error", lastOutput.error ?? "command failed");
            }
        }
    }, [lastOutput]);

    // Log a transport-level error
    // Not a failed command result - this is the WSMessage envelope
    // type=error, malformed message, etc.
    useEffect(() => {
        if (lastError && lastError !== lastLoggedError.current) {
            lastLoggedError.current = lastError;
            appendLog("error", lastError.message ?? "unknown error");
        }
    }, [lastError]);

    const handleSubmit = () => {
        const command = inputValue.trim();
        if (!command) return;

        appendLog("cmd", command);
        setInputValue("");

        const branch = session?.audioscript_branch ?? "live";
        const result = sendCommand(command, branch);

        // sendCommand resolves once the IPC round-trip to the main process
        // completes, not once the backend has actually responded.
        // Real result arrives async via lastOutput, handled above.
        // Only need to catch the case where the IPC call itself has failed
        // (e.g., not connected at all)
        if (result && typeof result.then === "function") {
            result.then((res) => {
                if (res && res.ok === false) {
                    appendLog("error", res.error ?? "send failed");
                }
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    const branch = session?.audioscript_branch ?? "ir";

    return (
        <div className={`shell-dock ${open ? "open" : "closed"}`}>
            <div className="am-panel-header">
                <button 
                    type="button" 
                    className={`dock-tab-btn ${open ? "active" : ""}`}
                    onClick={() => setOpen((v) => !v)}>
                        <span className="am-panel-title">Shell</span>
                        <span className="kbd">^`</span>
                </button>

                <div className="am-spacer" />

                <div className="dock-right">
                    <div className="branch-toggle" title="Branch switching not yet wired">
                        <div className={`branch-slider ${branch === "live" ? "live" : ""}`} />
                        <div className={`branch-option ir ${branch === "ir" ? "active" : ""}`}>IR</div>
                        <div className={`branch-option live ${branch === "live" ? "active" : ""}`}>LIVE</div>
                    </div>
                    <div className="am-divider-v" />
                    <div className="status-pill">
                        <span className={`dot ${connected ? "" : "off"}`} />
                        {connected ? "connected" : "disconnected"}
                    </div>
                </div>
            </div>

            {open && (
                <div className="shell-body">
                    <div className="log" ref={logRef}>
                        {log.map((entry) => (
                            <div key={entry.id} className={`log-line log-${entry.kind}`}>
                                <span className="log-time">{entry.time}</span>
                                {entry.kind === "cmd" && <span className="log-prompt">&gt;</span>}
                                {entry.kind === "result" && <span className="log-icon">↳</span>}
                                {entry.kind === "error" && <span className="log-icon">!</span>}
                                <span className="log-text">{entry.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="input-row">
                        <span className="prompt-glyph">&gt;</span>
                        <input
                            className="cmd-input"
                            type="text"
                            placeholder="type an AudioScript command..."
                            autoComplete="off"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button type="button" className="am-btn primary" onClick={handleSubmit}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}