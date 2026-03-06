#!/usr/bin/env bash
# Generate low-res thumbnails for activity cards.
# Keeps originals as backup; thumbnails load faster in the carousel.
#
# Usage: ./scripts/generate-activity-thumbnails.sh
# Requires: sips (macOS) or ImageMagick (convert)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="$(cd "$SCRIPT_DIR/../assets" && pwd)"
WIDTH=560   # 2x for 280px cards, sharp on retina

cd "$ASSETS_DIR"

for f in ev-*.jpg; do
  [ -f "$f" ] || continue
  base="${f%.jpg}"
  thumb="${base}-thumb.jpg"
  if [ -f "$thumb" ] && [ "$thumb" -nt "$f" ]; then
    echo "Skip $f (thumb exists and newer)"
    continue
  fi
  echo "Creating $thumb from $f"
  if command -v sips &>/dev/null; then
    sips -Z "$WIDTH" "$f" --out "$thumb"
  elif command -v convert &>/dev/null; then
    convert "$f" -resize "${WIDTH}x" -quality 85 "$thumb"
  else
    echo "Error: need sips (macOS) or ImageMagick (convert)"
    exit 1
  fi
done

echo "Done. Originals kept as backup."
