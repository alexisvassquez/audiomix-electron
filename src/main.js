import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

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
