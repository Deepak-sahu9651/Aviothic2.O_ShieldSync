function classifyUrl(url) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "classify", url }, (resp) => {
      resolve(resp);
    });
  });
}

function attachToLinks() {
  document.querySelectorAll("a[href]").forEach(a => {
    if (a.dataset.phishguardAttached) return;
    a.dataset.phishguardAttached = "1";
    a.addEventListener("click", async (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const url = a.href;
      try {
        const result = await classifyUrl(url);
        if (result && result.prediction === "phishing") {
          const proceed = confirm(`⚠️ PhishGuard detected possible phishing for:\\n${url}\\n\\nProceed?`);
          if (!proceed) return;
        }
      } catch (err) {
        console.error("PhishGuard error", err);
      }
      window.location.href = url;
    });
  });
}

attachToLinks();
const mo = new MutationObserver(attachToLinks);
mo.observe(document, { childList: true, subtree: true });
