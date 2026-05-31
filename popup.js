/*
 * popup.js — Sodium
 *
 * Runs inside popup.html. Responsibilities:
 *   1. Load saved settings from Chrome Storage and render the UI
 *   2. On toggle change: save new settings and notify the active tab's
 *      content script so the change takes effect without a page refresh
 */

/** Matches the DEFAULT_SETTINGS in content.js */
const DEFAULT_SETTINGS = {
  shortsHidden: true,
};

const toggle = document.getElementById("shorts-toggle");
const statusText = document.getElementById("status-text");

/** Updates the status label text and style to match the current value. */
function updateStatusText(isHidden) {
  if (isHidden) {
    statusText.textContent = "Shorts are hidden";
    statusText.classList.add("active");
  } else {
    statusText.textContent = "Shorts are visible";
    statusText.classList.remove("active");
  }
}

// ---------------------------------------------------------------------------
// Load saved settings on popup open
// ---------------------------------------------------------------------------

chrome.storage.sync.get("settings", (data) => {
  const settings = data.settings ?? DEFAULT_SETTINGS;
  toggle.checked = settings.shortsHidden;
  updateStatusText(settings.shortsHidden);
});

// ---------------------------------------------------------------------------
// Handle toggle change
// ---------------------------------------------------------------------------

toggle.addEventListener("change", () => {
  // Build updated settings object
  // Read current settings first so we don't overwrite unrelated keys
  chrome.storage.sync.get("settings", (data) => {
    const settings = { ...(data.settings ?? DEFAULT_SETTINGS) };
    settings.shortsHidden = toggle.checked;

    // 1. Persist to storage (affects future page loads)
    chrome.storage.sync.set({ settings });

    // 2. Update popup UI immediately
    updateStatusText(settings.shortsHidden);

    // 3. Send message to the active tab's content script (affects current page now)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "SET_SETTINGS", settings },
        // Ignore errors: the tab might not have a content script (e.g. chrome:// pages)
        () => void chrome.runtime.lastError,
      );
    });
  });
});
