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

window.addEventListener("DOMContentLoaded", () => {
  seedPlaceholders();
  Status.set("sb-health", { ok: null, text: "checking..." });
  pingOnce();
  window.addEventListener("focus", pingOnce);
  setInterval(pingOnce, 10_000);
});

window.addEventListener("keydown", (e) => {
  const isCtrlShiftF = e.ctrlKey && e.shiftKey && (e.key === "F" || e.key === "f");
  if (isCtrlShiftF) {
    e.preventDefault();
    window.audiomix?.window?.toggleFullScreen();
  }
});
