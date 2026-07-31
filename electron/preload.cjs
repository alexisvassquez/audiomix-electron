const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("audiomix", {
  ping: () => ipcRenderer.invoke("ping"),
  window: {
    toggleFullScreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  },
  sys: {
    getStats: () => ipcRenderer.invoke("sys:get-stats")
  },
  commands: {
    run: (id) => ipcRenderer.invoke("cmd:run", id)
  },
  shell: {
    sendCommand: (command, branch = "live") =>
      ipcRenderer.invoke("shell:send", { command, branch }),
    isConnected: () => ipcRenderer.invoke("shell:isConnected"),
    onMessage: (callback) => {
      const listener = (_event, envelope) => callback(envelope);
      ipcRenderer.on("shell:message", listener);
      return () => ipcRenderer.removeListener("shell:message", listener);
    },
    onStatus: (callback) => {
      const listener = (_event, status) => callback(status);
      ipcRenderer.on("shell:status", listener);
      return () => ipcRenderer.removeListener("shell:status", listener);
    },
  },
});
