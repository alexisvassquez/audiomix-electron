// AudioMIX Electron
// src/hooks/useShellConnection.js
//
// React hook for the AudioMIX AS Shell panel and
// any other component that needs live backend state.
// Gives the ability to send AudioScript command to 
// the FastAPI bridge.
// This hook is a thin renderer-side wrapper around
// window.audiomix.shell, which is exposed by the
// IPC renderer in preload.cjs via contextBridge.
// It never touches Node APIs or the raw WebSocket directly.
// That lives in the main process (electron/shellBridge.js)

import { useEffect, useRef, useState, useCallback } from "react";

export function useShellConnection() {
    /* Whether the main process currently has an open WebSocket
       to the backend.
       Reflects shellBridge.js's own reconnect state: flips false on
       disconnect, true again auto once it reconnects
    */
    const [connected, setConnected] = useState(false);
    
    /* Most recent full SessionStateModel payload from a
       "session_update" message.
       The backend pushes this on every meaningful state change,
       not just in response to commands.
       Can update at any time.
    */
    const [session, setSession] = useState(null);

    /* Result payload from the most recent "shell_output" message.
       Response to the last AS command that was sent via sendCommand().
    */
    const [lastOutput, setLastOutput] = useState(null);

    /* Payload from the most recent "error" message pushed by the
       backend.
       Not the same as a JS/network error. 
       This is a structured error
       that the server chose to send back over the WSMessage envelope.
    */
    const [lastError, setLastError] = useState(null);

    /* Holds the unsubscribe functions returned by the preload API's
      onMessage/onStatus listeners, so they can be cleaned up on unmount
      without leaking IPC listeners across re-renders.
    */
    const unsubsRef = useRef([]);

    useEffect(() => {
        // Guards against setting state after unmount if isConnected()
        // resolves after the component has already gone away.
        let cancelled = false;

    // On mount, ask the main process for current connection status
    // directly, rather than waiting for the next "shell:status" push.
    // Covers the case where the connection was already established before
    // this component rendered.
    window.audiomix.shell.isConnected().then((status) => {
        if (!cancelled) setConnected(status);
    });

    // Subscribe to every WSMessage envelope forwarded from the backend.
    // Dispatches on envelope.type to keep state updates isolated per
    // message kind (see audiomix/api/models.py) rather than dumping
    // everything into one generic "lastMessage" blob.
    const unsubMessage = window.audiomix.shell.onMessage((envelope) => {
        switch (envelope.type) {
            case "session_update":
                setSession(envelope.payload);
                break;
            case "shell_output":
                setLastOutput(envelope.payload);
                break;
            case "error":
                setLastError(envelope.payload);
                break;
            case "pong":
                // Keepalive acknowledgment only, no state to update
                break;
            default:
                // Unrecognized type - ignore rather than throw in case the
                // backend adds a new WSMessageType before the renderer is
                // updated to handle it.
                break;
        }
    });

    // Subscribe to connection status changes pushed by shellBridge.js
    // Fires on both initial connect and any subsequent disconnect/
    // reconnect cycle.
    const unsubStatus = window.audiomix.shell.onStatus(({ connected }) => {
        setConnected(connected);
    });

    unsubsRef.current = [unsubMessage, unsubStatus];

    // Cleanup on unmount: mark cancelled so the isConnected() promise
    // above becomes a no-op if it resolves late
    // Removes both IPC listeners so they don't keep firing (and/or leaking)
    // after this component is gone.
    return () => {
        cancelled = true;
        unsubsRef.current.forEach((unsub) => unsub());
    };
   }, []);

   /* Sends a single AS command over the WebSocket.
      Wrapped in useCallback so consumers can safely pass this down as
      a prop or dependency w/o it changing identity on every render.

      command: AudioScript command string
      branch: "live" or "ir", "live" is default
      Live coding features are still being actively developed.

      Returns a promise resolving to { ok: true } or { ok: false, error }
      (see shellBridge.js source)
      Resolves once the IPC round-trip of the main process completes, not once the backend has responded.
      The actual command result arrives async via the "shell_output" message
      above, reflected in lastOutput.
   */
    const sendCommand = useCallback((command, branch = "live") => {
        return window.audiomix.shell.sendCommand(command, branch);
    }, []);

    return { connected, session, lastOutput, lastError, sendCommand };
}
