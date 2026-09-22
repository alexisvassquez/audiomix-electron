// AudioMIX Electron
// Electron main entrypoint

import "dotenv/config";
import { createShellBridge } from "./shellBridge.js";
import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron";
import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";
import os from "os";
import process from "process";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ipcMain.handle("ping", () => {
  console.log("Renderer pinged AudioMIX Core");
  return "pong from main";
});

ipcMain.handle("toggle-fullscreen", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.setFullScreen(!w.isFullScreen());
});

ipcMain.handle("sys:get-stats", () => {
  return {
    loadAvg: os.loadavg()[0],
    totalMem: os.totalmem(),
    freeMem: os.freemem()
  };
});

ipcMain.handle("cmd:run", async (_evt, id) => {
  const w = BrowserWindow.getFocusedWindow();
  switch (id) {
    case "view:toggleFullscreen":
      w && w.setFullScreen(!w.isFullScreen());
      return "Toggled fullscreen";
    case "file:open":
      if (!w) return "No window";
      await dialog.showOpenDialog(w, { properties: ["openFile"] });
      return "Open dialog shown";
    case "devtools:toggle":
      w && w.webContents.toggleDevTools();
      return "DevTools toogled";
    default:
      return `Unknown command: ${id}`;
  }
});

// Project save/load
// File I/O has to happen here in the main process.
// The renderer has no direct filesys access under sandbox (contextIsolation)
// Renderer hands plan JS obj and returns back.
// v1 scope: arrangement (tracks/clips/samples/mute/solo), project name, and
// BPM/snap.
// TODO: DSP param values (gain, clipper, EQ, etc) are not saved yet.
// Working on cpp engine reporting its own values back.
// Frontend does not currently track the values, so nothing accurate to
// serialize as of yet.
ipcMain.handle("project:save", async (_evt, projectData) => {
  const w = BrowserWindow.getFocusedWindow();
  if (!w) return { ok: false, error: "no_window" };

  const { canceled, filePath } = await dialog.showSaveDialog(w, {
    title: "Save AudioMIX Project",
    defaultPath: `${projectData.projectName || "untitled"}.audiomix`,
    filters: [{ name: "AudioMIX Project", extensions: ["audiomix"] }],
  });

  if (canceled || !filePath) return { ok: false, error: "cancelled" };

  try {
    const json = JSON.stringify(projectData, null, 2);
    await fs.writeFile(filePath, json, "utf-8");
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,    // lets users resize but keeps sane minimums
    minHeight: 540,
    useContentSize: true,    // size refers to web content (not incl frame)
    fullscreenable: true,
    autoHideMenuBar: true,    // clean look; ALT shows menu on Windows/Linux
    title: "🎧 AudioMIX - Dev Shell",
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "../preload/preload.cjs"),
    },
  });

  // start maximized ("full canvas")
  win.maximize();
  console.log("Window bounds after maximize:", win.getBounds());

  // view menu with a native "Toggle Full Screen"
  const menu = Menu.buildFromTemplate([
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // in development, load from Vite dev server
  // in production, load the built file
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  const shellBridge = createShellBridge(win);
  win.on("closed", () => shellBridge.destroy());
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
