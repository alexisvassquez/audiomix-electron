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
  }
});
