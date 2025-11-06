// simple status registry for future modules to update items by id
const Status = {
  set(id, { ok = null, text = null } = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    const label = el.querySelector("span[id$='-label']");
    if (text && label) label.textContent = text;
    if (ok === true) { el.classList.remove("err"); el.classList.add("ok"); }
    else if (ok === false) { el.classList.remove("ok"); el.classList.add("err"); }
  }
};

// backend heartbeat using preload bridge
async function pingOnce() {
  try {
    if (!window.audiomix?.ping) {
      Status.set("sb-health", { ok: false, text: "bridge missing" });
      return;
    }
    const res = await window.audiomix.ping();    // pong from main
    Status.set("sb-health", { ok: true, text: "online" });
  } catch (e) {
    Status.set("sb-health", { ok: false, text: "offline" });
    console.error("Ping failed:", e);
  }
}

// seed placeholders (wire into real data)
function seedPlaceholders() {
  document.getElementById("sb-project-label").textContent = "Untitled Project";
  document.getElementById("sb-transport-label").textContent = "Idle";
  document.getElementById("sb-audio-label").textContent = "48 kHz • 256 • 12.0 ms";
  document.getElementById("sb-cpu-label").textContent = "CPU 4%";
}

// UI utilities (toast + console log)
function toast(text, ms = 1600) {
  const n = document.createElement("div");
  n.textContent = text;
  Object.assign(n.style, {
    position:"fixed", bottom:"42px", right:"12px", padding:"10px 12px",
    background:"#202020", color:"#eee", border:"1px solid #2a2a2a",
    borderRadius:"8px", zIndex:9999, opacity:0, transition:"opacity .15s"
  });
  document.body.appendChild(n);
  requestAnimationFrame(()=> n.style.opacity = 1);
  setTimeout(() => { n.style.opacity = 0; setTimeout(()=> n.remove(), 150); }, ms);
}

function log(msg){
  const c = document.getElementById("console");
  if (!c) return;
  const line = document.createElement("div");
  line.textContent = msg;
  c.appendChild(line);
  c.scrollTop = c.scrollHeight;
}

// Command palette top bar
const Commands = [
  { id: "view:toggleFullscreen", label: "Toggle Fullscreen", hint: "Switch full screen mode" },
  { id: "file:new", label: "New File", hint: "Create a new blank project" },
  { id: "file:open", label: "Open File...", hint: "Open existing file from your system" },
  { id: "app:about", label: "About AudioMIX", hint: "Show info dialog" },
  { id: "console:clear", label: "Clear console", hint: "Clear the log area" },
];

function openPalette() {
  const root = document.getElementById("palette");
  const input = document.getElementById("pal-input");
  const list = document.getElementById("pal-list");
  if (!root || !input || !list) return;

  root.classList.add("show");
  root.setAttribute("aria-hidden", "false");
  input.value = "";
  render("");

  requestAnimationFrame(() => input.focus());

  function render(q) {
    const qn = q.trim().toLowerCase();
    const items = Commands.filter(c => c.label.toLowerCase().includes(qn));
    list.innerHTML = items.map((c,i) => {
      return `
        <li data-id="#{c.id}" class="${i === 0 ? "active" : ""}" role="option">
          <span>${c.label}</span>
          <span class="hint">${c.hint}</span>
        </li>
      `;
    }).join("");
  }

  function pickActive() {
    const el = list.querySelector("li.active");
    if (!el) return;
    runCommand(el.dataset.id);
  }

  function move(dir) {
    const items = [...list.querySelectorAll("li")];
    if (!items.length) return;
    const idx = items.findIndex(li => li.classList.contains("active"));
    let next = 0;
    if (dir === 1) next = (idx + 1) % items.length;
    if (dir === -1) next = (idx - 1 + items.length) % items.length;
    items.forEach(li => li.classList.remove("active"));
    items[next].classList.add("active");
    items[next].scrollIntoView({ block: "nearest" });
  }

  function close() {
    root.classList.remove("show");
    root.setAttribute("aria-hidden", "true");
    // cleanup listeners
    input.removeEventListener("input", onInput);
    root.removeEventListener("keydown", onKeys);
    root.removeEventListener("click", onClick);
  }

  function onInput(e){ render(e.target.value); }
  function onKeys(e){
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return close(); 
    }
    if (e.key === "Enter") { 
      e.preventDefault(); 
      pickActive(); 
      return;
    }
    if (e.key === "ArrowDown") { 
      e.preventDefault();
      move(1); 
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
      return;
    }
  }
  function onClick(e){
    const li = e.target.closest("li[data-id]");
    if (li) { runCommand(li.dataset.id); }
  }

  input.addEventListener("input", onInput);
  root.addEventListener("keydown", onKeys);
  root.addEventListener("click", onClick);
}

async function runCommand(id){
  switch (id) {
    case "view:toggleFullscreen":
      await window.audiomix?.window?.toggleFullScreen?.();
      toast("Toggled fullscreen");
      break;

    case "file:new":
      log("[file] Created new blank project");
      Status.set("sb-project", { text: "Untitled Project*" });
      toast("New project started");
      break;

    case "file:open":
      await window.audiomix?.commands?.run?.("file:open");
      log("[file] Open dialog requested");
      toast("Open file dialog");
      break;

    case "app:about":
      log("AudioMIX v0.1");
      toast("AudioMIX - v0.1 demo build");
      break;

    case "console:clear":
      const c = document.getElementById("console");
      if (c) c.innerHTML = "";
      toast("Console cleared");
      break;

    default:
      toast(`In development`);
  }

  // close palette after running
  document.getElementById("palette")?.classList.remove("show");
  document.getElementById("palette")?.setAttribute("aria-hidden", "true");
}

// Close button hook
document.getElementById("pal-close")?.addEventListener("click", () => {
  document.getElementById("palette")?.classList.remove("show");
  document.getElementById("palette")?.setAttribute("aria-hidden", "true");
});

// Global hotkey -- Ctrl+K opens palette
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  const mod = e.ctrlKey;
  if (mod && k === "k") {
    e.preventDefault();
    openPalette();
  }
});

// Statusbar heartbeat
window.addEventListener("DOMContentLoaded", () => {
  seedPlaceholders();
  Status.set("sb-health", { ok: null, text: "checking..." });
  pingOnce();
  window.addEventListener("focus", pingOnce);
  setInterval(pingOnce, 10_000);
});

// Extra hotkeys 
// -- Ctrl+Shift+F toggles fullscreen
window.addEventListener("keydown", (e) => {
  const isCtrlShiftF = e.ctrlKey && e.shiftKey && (e.key === "F" || e.key === "f");
  if (isCtrlShiftF) {
    e.preventDefault();
    window.audiomix?.window?.toggleFullScreen();
  }
});

// -- Esc closes out command palette
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const palette = document.getElementById("palette");
    if (palette?.classList.remove("show")); {
      palette.classList.remove("show");
      palette.setAttribute("aria-hidden", "true");
    }
  }
});
