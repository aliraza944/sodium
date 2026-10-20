# Chrome Web Store listing

Copy-paste text and answers for the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Upload

```bash
./package.sh
```

Upload `dist/unhooked-<version>.zip`. Bump `version` in `manifest.json` before every later upload — the store rejects a version it has already seen.

## Store listing tab

**Name** (from manifest): Unhooked – Focus for YouTube

**Summary** (from manifest description, max 132 chars):
Hide YouTube Shorts, hide recommendations with a focus timer, and hide clickbait thumbnails.

**Description:**

```
Unhooked helps you stop losing hours to YouTube. Watch what you came for, then get out.

SHORTS BLOCKER
Shorts are hidden from the homepage, sidebar, search results and recommendations. No more doom scrolling.

FOCUS MODE
Pick a duration in the popup. Until the timer runs out, every video recommendation is hidden, so nothing pulls you into the next video.

ZEN MODE
Hides every thumbnail. You decide whether a video is worth your time by reading its title, not by reacting to a clickbait image.

PRIVATE BY DESIGN
Unhooked only runs on youtube.com. It does not collect, track or send any data anywhere. Your settings are saved in your browser's own sync storage.

Unhooked is not affiliated with or endorsed by YouTube or Google.
```

**Category:** Productivity → Workflow & Planning
**Language:** English

**Graphic assets:**
- Store icon (128×128): `icons/icon128.png`
- Small promo tile (440×280): `store/promo-small-440x280.png`
- Screenshots (1280×800 or 640×400, at least one): take these yourself. Good ones: the popup open over the YouTube homepage, the homepage with Zen Mode on, and a video page with Focus Mode hiding the sidebar.

## Privacy practices tab

**Single purpose:**
Reduce distractions on YouTube by hiding Shorts, recommendations and thumbnails based on the user's settings.

**Permission justifications:**
- `storage` — Saves the user's on/off settings and the focus timer's end time.
- `alarms` — Ends Focus Mode when the timer the user set runs out, even if the popup is closed.
- Host permission `https://www.youtube.com/*` — The content script has to run on YouTube pages to hide Shorts, recommendations and thumbnails.

**Remote code:** No, I am not using remote code.

**Data usage:** Tick none of the data types. Then tick all three certifications (no selling data, no unrelated use, no creditworthiness use).

**Privacy policy URL:** not required, since no user data is collected. If the dashboard insists, link to the "Private by design" section of the README.

## Distribution tab

Visibility: Public. Regions: all.
