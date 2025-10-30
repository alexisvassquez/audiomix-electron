const { contextBridge, ipcRenderer } = require("electron");

// Expose minimal, safe API to renderer
contextBridge.exposeInMainWorld("audiomix", {
  ping: () => ipcRenderer.invoke("ping"),
  window: {
    toggleFullScreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  }
});
