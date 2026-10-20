#!/usr/bin/env bash
# Builds the zip to upload to the Chrome Web Store: dist/unhooked-<version>.zip
set -euo pipefail
cd "$(dirname "$0")"
version=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
out="dist/unhooked-$version.zip"
mkdir -p dist
rm -f "$out"
zip -q -r "$out" manifest.json background.js content.js popup.html popup.js styles.css icons/*.png
echo "$out"
