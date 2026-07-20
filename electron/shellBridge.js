// AudioMIX Electron
// electron/shellBridge.js
//
// Owns the WebSocket connection to WS /shell/ws on the FastAPI bridge.
// Speaks the WSMessage envelope ({ type, payload }) in both directions.
// Renderer never touches the socket, it goes through IPC only.
// Auth: sends x-audiomix-token as a handshake header, matching the
// check added in audiomix/api/routes/shell.py's /ws route.
// AUDIOMIX_API_TOKEN must be present in this process's environment

import WebSocket from "ws";
import { ipcMain } from "electron";

const SHELL_WS_URL = `ws://127.0.0.1:${process.env.AUDIOMIX_API_PORT || 8000}/shell/ws`;
const API_TOKEN = process.env.AUDIOMIX_API_TOKEN;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;

if (!API_TOKEN) {
    // Fail loudly, matches audiomix/api/main.py's own refusal to start w/o a token.
    throw new Error(
        "AUDIOMIX_API_TOKEN is not set in the Electron process environment. " +
        "Copy .env.example to .env in this repo and set the same token used by the backend."
    );
}

class ShellBridge {
    constructor(win) {
        this.win = win;
        this.ws = null;
        this.reconnectAttempt = 0;
        this.reconnectTimer = null;
        this.manuallyClosed = false;

        this._registerIpcHandlers();
        this.reconnectAttempt();
    }

    connect() {
        if (this.ws) this.ws.removeAllListeners();

        this.ws = new WebSocket(SHELL_WS_URL, {
            headers: { "x-audio-mix-token": API_TOKEN },
        });

        this.ws.on("open", () => {
            this.reconnectAttempt = 0;
            this._emit("shell:status", { connected: true });
        });

        this.ws.on("message", (data) => {
            let envelope;
            try {
                envelope = JSON.parse(data.toString());
            } catch (err) {
                this._emit("shell:status", { connected: true, parseError: true });
                return;
            }
            // Message type below:
            // envelope: { type: "session_update" | "shell_output" | "error" | "pong", payload: {...} }
            this._emit("shell:message", envelope);
        });

        this.ws.on("close", (code) => {
            this._emit("shell:status", { connected: false });
            if (code === 4401) {
                // close code for "unauthorized", don't retry with same bad token
                // surface instead.
                this._emit("shell:error", { error: "unauthorized", detail: "Token rejected by server" });
                return;
            }
            if (!this.manuallyClosed) this._scheduleReconnect();
        });

        this.ws.on("error", () => {
            // 'close' fires after 'error' for most failure modes
            // handles reconnect
        });
    }

    _scheduleReconnect() {
        if (this.reconnectTimer) return;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_MS);
        this.reconnectAttempt += 1;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    sendCommand(command, branch = "live") {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return { ok: false, error: "not_connected" };
        }
        const envelope = { type: "shell_input", payload: { command, branch } };
        try {
            this.ws.send(JSON.stringify(envelope));
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    _emit(channel, payload) {
        if (this.win && !this.win.isDestroyed()) {
            this.win.webContents.send(channel, payload);
        }
    }

    _registerIpcHandlers() {
        ipcMain.handle("shell:send", (_event, { command, branch }) => {
            return this.sendCommand(command, branch);
        });
        ipcMain.handle("shell:isConnected", () => {
            return this.ws?.readyState === WebSocket.OPEN;
        });
    }

    destroy() {
        this.manuallyClosed = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.ws) this.ws.close();
    }
}

export function createShellBridge(win) {
    return new ShellBridge(win);
}