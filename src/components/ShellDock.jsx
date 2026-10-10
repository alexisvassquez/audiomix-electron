// AudioMIX Electron
// src/components/ShellDock.jsx
//
/* The AS Shell panel
   A collapsible dock living at the bottom of STUDIO mode,
   below the Arrangement and above the Transport row.

   The shell connection is owned by App.jsx and passed in as props so that
   this panel and StatusBar share a single backend subscription.
   useShellConnection is one instance for the whole application.

   This component owns its own local command log (an array of entries),
   since useShellConnection only exposes the latest lastOutput/session
   update, not history.

   Input, Send, and the IR/LIVE toggle are disabled until engineReady is true.
   The backend runtime boots a few seconds after launch and firing a command
   before it's up is the race condition we close here.

   The IR/LIVE toggle displays the branch from session.audioscript_branch and
   calls /shell/live/enter or /exit via enter/exitLive.
*/

import { useState, useEffect, useRef, useCallback } from "react";
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

export default function ShellDock({
    connected, 
    session, 
    lastOutput, 
    lastError,
    engineReady, 
    sendCommand, 
    enterLive, 
    exitLive,
}) {
    const [open, setOpen] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [log, setLog] = useState([
        { id: nextLogId(), kind: "system", time: timestamp(), text: "shell dock mounted" },
    ]);
    const [branchPending, setBranchPending] = useState(false);

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

    // Log when the engine finishes booting.
    // Fires on the false->true transition and again if a reconnect re-readies
    // the runtime.
    useEffect(() => {
        if (engineReady) appendLog("system", "engine ready");
    }, [engineReady]);

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

    // Gating: nothing that talks to the runtime is allowed until the
    // socket is up AND the engine has signaled ready.
    const engineBooting = connected && !engineReady;
    const inputDisabled = !connected || !engineReady;

    const handleSubmit = () => {
        // if engine not ready, swallow the send
        if (inputDisabled) return;
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

    // The branch toggle is disabled while a switch is in flight or while
    // the engine is still booting.
    // Entering LIVE before the runtime is up is the same race as sending a
    // command early.
    const controlsDisabled = branchPending || !engineReady;

    // Shared handler for both toggle halves.
    // `target` is "ir" or "live" - the branch that half represents.
    // Clicking the half that's already active is a no-op rather than
    // re-sending the same request.
    const handleBranchClick = async (target) => {
        if (branchPending || target === branch) return;

        setBranchPending(true);
        appendLog("system", target === "live" ? "entering LIVE mode..." : "exiting LIVE mode...");

        try {
            const fn = target === "live" ? enterLive : exitLive;
            const res = await fn();
            if (!res || res.ok === false) {
                appendLog("error", res?.error ?? `failed to switch to ${target}`);
            }
            // no local branch state to flip here on success
            // the backend's session_update (handled in useEffect above)
            // is what actually moves `branch` once the switch lands.
        } catch (err) {
            appendLog("error", err.message ?? `failed to switch to ${target}`);
        } finally {
            setBranchPending(false);
        }
    };

    // Status pill text: 3 states, not 2.
    const statusText = !connected ? "disconnected" : engineReady ? "connected" : "booting...";

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
                    <div 
                        className="branch-toggle" 
                        title={!engineReady ? "Engine booting..." : branchPending ? "Switching..." : "Click IR or LIVE to switch branch"}
                        style={{ opacity: branchPending ? 0.6 : 1 }} 
                    >
                        <div className={`branch-slider ${branch === "live" ? "live" : ""}`} />
                        <div 
                            className={`branch-option ir ${branch === "ir" ? "active" : ""}`}
                            onClick={() => handleBranchClick("ir")}
                            style={{ cursor: controlsDisabled ? "not-allowed" : "pointer" }}
                        >IR</div>
                        <div 
                            className={`branch-option live ${branch === "live" ? "active" : ""}`}
                            onClick={() => handleBranchClick("live")}
                            style={{ cursor: controlsDisabled ? "not-allowed" : "pointer" }}
                        >LIVE</div>
                    </div>
                    <div className="am-divider-v" />
                    <div className="status-pill">
                        <span className={`dot ${!connected ? "off" : !engineReady ? "booting" : ""}`} />
                        {statusText}
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
                            placeholder={engineBooting ? "engine booting..." : "type an AudioScript command..."}
                            autoComplete="off"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={inputDisabled}
                        />
                        <button 
                            type="button" 
                            className="am-btn primary" 
                            onClick={handleSubmit}
                            disabled={inputDisabled}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}