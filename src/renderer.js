window.addEventListener("DOMContentLoaded", () => {
  if (window.audiomix?.ping) {
    window.audiomix.ping()
      .then(res => console.log("Main replied:", res))
      .catch(err => console.error("Ping failed:", err));
  } else {
    console.warn("AudioMIX bridge not available");
  }
});
