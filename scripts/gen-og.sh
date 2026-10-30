#!/usr/bin/env bash
# Builds public/og/default.png from the recorded report pages. Needs ImageMagick.
set -euo pipefail
cd "$(dirname "$0")/.."
F=/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf
R=/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf
magick \( public/demo/report-p1.webp -resize x520 \) -bordercolor '#2a2a2e' -border 1 /tmp/og-p1.png
magick -size 1200x630 xc:'#0b0b0c' \
  -font "$F" -fill '#f4f4f5' -pointsize 58 -annotate +64+230 'The Word engine' \
  -annotate +64+305 'built for AI agents.' \
  -font "$R" -fill '#a1a1aa' -pointsize 26 -annotate +64+375 'MCP server · CLI · TypeScript engine' \
  -annotate +64+415 'Typed edits. All-or-nothing batches. Undo.' \
  -font "$F" -fill '#f4f4f5' -pointsize 30 -annotate +64+560 'ASTra' \
  -font "$R" -fill '#71717a' -pointsize 24 -annotate +170+560 'by Attentionform' \
  /tmp/og-p1.png -geometry +790+55 -composite \
  public/og/default.png
