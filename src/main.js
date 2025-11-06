import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import process from "process";

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
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
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // start maximized ("full canvas")
  win.maximize();

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

  win.loadFile(path.join(__dirname, "renderer.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
