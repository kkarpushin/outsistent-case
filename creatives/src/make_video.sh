#!/usr/bin/env bash
# Видео 9:16: апскейл Seedance 720p -> 1080x1920, сдвиг сцены вниз (как в статике; пустой стол сверху достраивается зеркалом),
# сверху прозрачная PNG-накладка с текстом из render.py (python3 render.py overlays).
# Usage: make_video.sh <raw.mp4> <overlay.png> <shift_px> <out.mp4>
set -euo pipefail
RAW=$1; OVL=$2; SHIFT=$3; OUT=$4
ffmpeg -v error -y -i "$RAW" -i "$OVL" -filter_complex "\
[0:v]scale=1080:1920:flags=lanczos,split[a][b];\
[a]crop=1080:${SHIFT}:0:0,vflip[top];\
[b]crop=1080:$((1920-SHIFT)):0:0[main];\
[top][main]vstack,setsar=1[bg];\
[bg][1:v]overlay=0:0,format=yuv420p[v]" \
  -map "[v]" -r 24 -c:v libx264 -crf 18 -preset slow -profile:v high -movflags +faststart -an "$OUT"
echo "ok $OUT"
