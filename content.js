const FEATURE_RULES = {
  shortsHidden: "ysh-active",
  focusActive:  "ysf-active",
};

const DEFAULT_SETTINGS = {
  shortsHidden: true,
  focusEndTime: 0,
};

let currentSettings = { ...DEFAULT_SETTINGS };

function isFocusActive(settings) {
  return (
    typeof settings.focusEndTime === "number" &&
    settings.focusEndTime > 0 &&
    Date.now() < settings.focusEndTime
  );
}

function applySettings(settings) {
  const effective = { ...settings, focusActive: isFocusActive(settings) };
  for (const [key, cssClass] of Object.entries(FEATURE_RULES)) {
    if (effective[key]) {
      document.documentElement.classList.add(cssClass);
    } else {
      document.documentElement.classList.remove(cssClass);
    }
  }
}

function guardClasses() {
  const effective = { ...currentSettings, focusActive: isFocusActive(currentSettings) };
  for (const [key, cssClass] of Object.entries(FEATURE_RULES)) {
    if (effective[key] && !document.documentElement.classList.contains(cssClass)) {
      document.documentElement.classList.add(cssClass);
    }
  }
}

chrome.storage.sync.get("settings", (data) => {
  if (data.settings) {
    currentSettings = data.settings;
  } else {
    chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
  applySettings(currentSettings);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !("settings" in changes)) return;
  currentSettings = changes.settings.newValue ?? DEFAULT_SETTINGS;
  applySettings(currentSettings);
});

setInterval(() => {
  const focusShouldBeOn = isFocusActive(currentSettings);
  const focusIsOn = document.documentElement.classList.contains("ysf-active");
  if (focusShouldBeOn !== focusIsOn) applySettings(currentSettings);
}, 10_000);

window.addEventListener("yt-navigate-finish", () => {
  applySettings(currentSettings);
});

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SET_SETTINGS") {
    currentSettings = message.settings;
    applySettings(currentSettings);
    sendResponse({ success: true });
  }
});
