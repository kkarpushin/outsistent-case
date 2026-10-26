#!/usr/bin/env bash
# Генерация сцен-диорам через Higgsfield (gpt_image_2, 2k, high). Usage: gen_scenes.sh key [key...]
set -u
DIR=/home/karpushin/WebinarK/karina/creatives
for key in "$@"; do
  prompt=$(python3 -c "import json,sys;print(json.load(open('$DIR/src/scene_prompts.json'))['$key']['prompt'])")
  ar=$(python3 -c "import json,sys;print(json.load(open('$DIR/src/scene_prompts.json'))['$key']['aspect_ratio'])")
  (
    higgsfield generate create gpt_image_2 --prompt "$prompt" --aspect_ratio "$ar" --resolution 2k --quality high --wait --wait-timeout 15m --json > "$DIR/scenes/$key.json" 2> "$DIR/scenes/$key.err"
    url=$(python3 -c "import json;d=json.load(open('$DIR/scenes/$key.json'));d=d[0] if isinstance(d,list) else d;print(d.get('result_url') or (d.get('results') or {}).get('raw',{}).get('url',''))" 2>/dev/null)
    if [ -n "$url" ]; then curl -s -o "$DIR/scenes/$key.png" "$url" && echo "OK $key $url"; else echo "FAIL $key"; fi
  ) &
done
wait
