function setStatus(ok, msg) {
  const badge = document.querySelector(".status");
  const label = document.getElementById("status-label");
  if (!badge || !label) return;

  badge.classList.remove("ok", "err");
  badge.classList.add(ok ? "ok" : "err");
  label.textContent = msg;
}

async function pingOnce() {
  try {
    if (!window.audiomix?.ping) {
      setStatus(false, "bridge missing");
      return;
    }
    const res = await window.audiomix.ping();
    setStatus(true, "online");
    console.log("Main replied:", res);
  } catch (e) {
    console.error("Ping failed:", e);
    setStatus(false, "offline");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setStatus(false, "checking...");
  pingOnce();

  // Re-ping on focus (mostly for dev mode)
  window.addEventListener("focus", pingOnce);

  // 10s heartbeat (lightweight)
  setInterval(pingOnce, 10000);
});
