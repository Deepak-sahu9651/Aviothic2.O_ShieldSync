const API_BASE = "http://127.0.0.1:5000";

function classifyViaBackground(url) {
  return new Promise(resolve => chrome.runtime.sendMessage({type:"classify", url}, resolve));
}

async function init() {
  const urlEl = document.getElementById("currentUrl");
  const resultEl = document.getElementById("result");
  const checkBtn = document.getElementById("checkBtn");
  const reportBtn = document.getElementById("reportBtn");
  const reportUrlInput = document.getElementById("reportUrl");
  const reportReason = document.getElementById("reportReason");
  const statusEl = document.getElementById("status");

  let currentUrl = "";
  chrome.tabs.query({active:true,currentWindow:true}, (tabs) => {
    currentUrl = tabs[0]?.url || "";
    urlEl.textContent = currentUrl;
  });

  checkBtn.addEventListener("click", async () => {
    resultEl.textContent = "Checking...";
    const resp = await classifyViaBackground(currentUrl);
    if (!resp) {
      resultEl.textContent = "No response";
      return;
    }
    resultEl.textContent = `${resp.prediction.toUpperCase()} ${resp.probability ? JSON.stringify(resp.probability) : ""}`;
  });

  reportBtn.addEventListener("click", async () => {
    const u = reportUrlInput.value || currentUrl;
    const reason = reportReason.value || "";
    statusEl.textContent = "Sending...";
    try {
      const r = await fetch(`${API_BASE}/report`, {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ url: u, reason, page_url: currentUrl, ts: new Date().toISOString() })
      });
      const j = await r.json();
      statusEl.textContent = j.status === "ok" ? "Reported - thanks!" : "Error reporting";
    } catch (err) {
      statusEl.textContent = "Network error (backend not running?)";
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
