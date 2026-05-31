/*
 * content.js — YouTube Shorts Hider
 *
 * Injected into every YouTube page. Responsibilities:
 *   1. Read saved settings from Chrome Storage on load
 *   2. Apply/remove CSS classes on <html> to activate hiding rules
 *   3. Re-apply after YouTube SPA navigations (no full page reload happens)
 *   4. Guard against YouTube resetting the <html> class via MutationObserver
 *   5. Listen for real-time toggle messages from popup.js
 */

/**
 * Maps each feature to the CSS class it controls on <html>.
 * Adding a new feature: add an entry here + scoped rules in styles.css.
 */
const FEATURE_RULES = {
  shortsHidden: "ysh-active",
  // Future examples:
  // commentsHidden: "ysh-comments-hidden",
  // suggestionsHidden: "ysh-suggestions-hidden",
};

/** Default settings applied on first install (no stored value yet). */
const DEFAULT_SETTINGS = {
  shortsHidden: true,
};

/** In-memory copy of the current settings, kept in sync with storage. */
let currentSettings = { ...DEFAULT_SETTINGS };

/**
 * Applies or removes the CSS classes for every feature based on settings.
 * Called on page load, SPA navigation, and when the popup sends an update.
 */
function applySettings(settings) {
  for (const [key, cssClass] of Object.entries(FEATURE_RULES)) {
    if (settings[key]) {
      document.documentElement.classList.add(cssClass);
    } else {
      document.documentElement.classList.remove(cssClass);
    }
  }
}

/**
 * Ensures that the CSS classes expected by currentSettings are still present.
 * YouTube occasionally mutates <html> attributes, which can strip classes.
 * Called from the MutationObserver when it detects a change to <html>.
 */
function guardClasses() {
  for (const [key, cssClass] of Object.entries(FEATURE_RULES)) {
    const shouldBeActive = currentSettings[key];
    const isActive = document.documentElement.classList.contains(cssClass);
    if (shouldBeActive && !isActive) {
      document.documentElement.classList.add(cssClass);
    }
  }
}

// ---------------------------------------------------------------------------
// Initialization: read settings from storage, then apply them
// ---------------------------------------------------------------------------

chrome.storage.sync.get("settings", (data) => {
  if (data.settings) {
    currentSettings = data.settings;
  } else {
    // First install — save defaults so popup.js can read them
    chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
  applySettings(currentSettings);
});

// ---------------------------------------------------------------------------
// SPA navigation: YouTube changes the URL without reloading the page.
// "yt-navigate-finish" fires after YouTube has rendered the new route's DOM.
// ---------------------------------------------------------------------------

window.addEventListener("yt-navigate-finish", () => {
  applySettings(currentSettings);
});

// ---------------------------------------------------------------------------
// MutationObserver: watches <html> for class list changes YouTube might make.
// With the CSS class approach, newly injected content is hidden automatically
// by the browser, so we only need to guard the root element's class list.
// ---------------------------------------------------------------------------

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // Only care about attribute changes on the root <html> element
    if (
      mutation.type === "attributes" &&
      mutation.attributeName === "class" &&
      mutation.target === document.documentElement
    ) {
      guardClasses();
      break;
    }
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});

// ---------------------------------------------------------------------------
// Message listener: popup.js sends updated settings for instant toggling
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SET_SETTINGS") {
    currentSettings = message.settings;
    applySettings(currentSettings);
    sendResponse({ success: true });
  }
});
