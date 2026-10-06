#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
dist_dir="$project_dir/dist"
release_dir="$project_dir/releases"
release_version="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["release"])' "$project_dir/release-manifest.json")"

required=(
  index.html turn.html terminal.html text.html text.css manifest.webmanifest release-manifest.json
  book-copy.md book-nav.css book-nav.js mobile-cover.css
  terminal.css terminal-type-tune.css terminal.js turn-real.css turn.js
  candidates static
)

for item in "${required[@]}"; do
  test -e "$project_dir/$item" || { echo "missing required release item: $item" >&2; exit 1; }
done

rm -rf "$dist_dir"
mkdir -p "$dist_dir" "$release_dir"

for item in "${required[@]}"; do
  cp -R "$project_dir/$item" "$dist_dir/"
done

find "$dist_dir" -name '.DS_Store' -delete
python3 "$project_dir/scripts/check-release.py" "$dist_dir"
(cd "$dist_dir" && python3 -m zipfile -c "$release_dir/book-of-wolt-$release_version.zip" .)

echo "built dist/ and releases/book-of-wolt-$release_version.zip"
