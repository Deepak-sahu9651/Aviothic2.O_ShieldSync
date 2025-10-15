const API_BASE = "http://127.0.0.1:5000"; // change when deployed
const cache = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "classify") {
    const url = msg.url;
    if (cache[url]) {
      sendResponse(cache[url]);
      return true;
    }
    fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
      .then(r => r.json())
      .then(data => {
        cache[url] = data;
        sendResponse(data);
      })
      .catch(err => {
        console.error("PhishGuard fetch error", err);
        sendResponse({ prediction: "unknown" });
      });
    return true;
  }
});
