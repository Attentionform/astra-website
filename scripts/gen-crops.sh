#!/usr/bin/env bash
# Crops detail shots out of the rendered showcase pages for the feature tiles. Needs ImageMagick.
set -euo pipefail
cd "$(dirname "$0")/../public/showcase"
crop() { magick "$1" -crop "$2" +repage -strip -quality 90 "$3"; }
crop atlas-p2.webp 1100x340+70+545 crop-table.webp
crop atlas-p2.webp 1000x480+120+880 crop-chart.webp
crop hale-p1.webp 1100x118+70+437 crop-redline.webp
