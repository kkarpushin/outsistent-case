#!/usr/bin/env bash
# Image-to-video Seedance 2.0, 9:16, 5 s, 720p, без звука. Usage: gen_video.sh <key> <start_image> <prompt>
set -u
DIR=/home/karpushin/WebinarK/karina/creatives
key=$1; img=$2; prompt=$3
higgsfield generate create seedance_2_0 --prompt "$prompt" --start-image "$img" --duration 5 --resolution 720p --aspect_ratio 9:16 --generate_audio false --wait --wait-timeout 25m --json > "$DIR/scenes/$key.json" 2> "$DIR/scenes/$key.err"
url=$(python3 -c "
import json;d=json.load(open('$DIR/scenes/$key.json'));d=d[0] if isinstance(d,list) else d
print(d.get('result_url') or '')" 2>/dev/null)
if [ -n "$url" ]; then curl -s -o "$DIR/scenes/$key.mp4" "$url" && echo "OK $key $url"; else echo "FAIL $key"; cat "$DIR/scenes/$key.err"; fi
