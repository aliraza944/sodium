const DEFAULT_SETTINGS = {
  shortsHidden: true,
  focusEndTime: 0,
};

const shortsToggle  = document.getElementById("shorts-toggle");
const shortsStatus  = document.getElementById("status-text");
const focusIdleView    = document.getElementById("focus-idle");
const focusActiveView  = document.getElementById("focus-active");
const focusCountdownEl = document.getElementById("focus-countdown");
const focusStartBtn    = document.getElementById("focus-start-btn");
const focusStopBtn     = document.getElementById("focus-stop-btn");
const customInputRow   = document.getElementById("custom-input-row");
const customMinInput   = document.getElementById("custom-min-input");
const durationBtns     = document.querySelectorAll(".duration-btn");

let focusCountdownInterval = null;
let selectedDurationMs = 15 * 60 * 1000;

function updateShortsStatus(isHidden) {
  shortsStatus.textContent = isHidden ? "Shorts are hidden" : "Shorts are visible";
  isHidden
    ? shortsStatus.classList.add("active")
    : shortsStatus.classList.remove("active");
}

function notifyTab(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "SET_SETTINGS", settings },
      () => void chrome.runtime.lastError,
    );
  });
}

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderIdleState() {
  clearInterval(focusCountdownInterval);
  focusCountdownInterval = null;
  focusIdleView.style.display   = "block";
  focusActiveView.style.display = "none";
}

function renderActiveState(focusEndTime) {
  focusIdleView.style.display   = "none";
  focusActiveView.style.display = "block";
  startCountdown(focusEndTime);
}

function startCountdown(focusEndTime) {
  clearInterval(focusCountdownInterval);

  function tick() {
    const remaining = focusEndTime - Date.now();
    if (remaining <= 0) {
      clearInterval(focusCountdownInterval);
      focusCountdownInterval = null;
      renderIdleState();
      return;
    }
    focusCountdownEl.textContent = formatCountdown(remaining);
  }

  tick();
  focusCountdownInterval = setInterval(tick, 1000);
}

chrome.storage.sync.get("settings", (data) => {
  const settings = data.settings ?? DEFAULT_SETTINGS;

  shortsToggle.checked = settings.shortsHidden;
  updateShortsStatus(settings.shortsHidden);

  const focusEndTime = settings.focusEndTime ?? 0;
  if (focusEndTime > 0 && Date.now() < focusEndTime) {
    renderActiveState(focusEndTime);
  } else {
    renderIdleState();
  }
});

shortsToggle.addEventListener("change", () => {
  chrome.storage.sync.get("settings", (data) => {
    const settings = { ...(data.settings ?? DEFAULT_SETTINGS) };
    settings.shortsHidden = shortsToggle.checked;
    chrome.storage.sync.set({ settings });
    updateShortsStatus(settings.shortsHidden);
    notifyTab(settings);
  });
});

const PRESET_DURATIONS = { "15m": 15, "30m": 30, "1h": 60, "custom": null };

durationBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    durationBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const key = btn.dataset.duration;
    if (key === "custom") {
      customInputRow.style.display = "flex";
      const mins = parseInt(customMinInput.value, 10) || 15;
      selectedDurationMs = mins * 60 * 1000;
    } else {
      customInputRow.style.display = "none";
      selectedDurationMs = PRESET_DURATIONS[key] * 60 * 1000;
    }
  });
});

customMinInput.addEventListener("input", () => {
  const mins = Math.min(480, Math.max(1, parseInt(customMinInput.value, 10) || 1));
  selectedDurationMs = mins * 60 * 1000;
});

focusStartBtn.addEventListener("click", () => {
  const focusEndTime = Date.now() + selectedDurationMs;

  chrome.storage.sync.get("settings", (data) => {
    const settings = { ...(data.settings ?? DEFAULT_SETTINGS) };
    settings.focusEndTime = focusEndTime;
    chrome.storage.sync.set({ settings });
    notifyTab(settings);
  });

  chrome.runtime.sendMessage({ type: "START_FOCUS", durationMs: selectedDurationMs });
  renderActiveState(focusEndTime);
});

focusStopBtn.addEventListener("click", () => {
  chrome.storage.sync.get("settings", (data) => {
    const settings = { ...(data.settings ?? DEFAULT_SETTINGS) };
    settings.focusEndTime = 0;
    chrome.storage.sync.set({ settings });
    notifyTab(settings);
  });

  chrome.runtime.sendMessage({ type: "STOP_FOCUS" });
  renderIdleState();
});
