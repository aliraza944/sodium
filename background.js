const ALARM_NAME = "focusEnd";

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.sync.get("settings", (data) => {
    if (!data.settings) return;
    const settings = { ...data.settings, focusEndTime: 0 };
    chrome.storage.sync.set({ settings });
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_FOCUS") {
    chrome.alarms.create(ALARM_NAME, { when: Date.now() + message.durationMs });
    sendResponse({ success: true });
  } else if (message.type === "STOP_FOCUS") {
    chrome.alarms.clear(ALARM_NAME);
    sendResponse({ success: true });
  }
});
