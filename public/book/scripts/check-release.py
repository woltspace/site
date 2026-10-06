#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import sys


root = Path(sys.argv[1]).resolve()
errors = []


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, _tag, attrs):
        values = dict(attrs)
        for key in ("href", "src"):
            if key in values:
                self.references.append(values[key])


for html_file in root.rglob("*.html"):
    parser = AssetParser()
    parser.feed(html_file.read_text())
    for reference in parser.references:
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc or reference.startswith(("#", "mailto:")):
            continue
        target = (html_file.parent / parsed.path).resolve()
        if not target.exists():
            errors.append(f"{html_file.relative_to(root)} -> missing {reference}")

manifest = json.loads((root / "release-manifest.json").read_text())
for chapter in manifest["chapters"]:
    target = (root / urlsplit(chapter["url"]).path).resolve()
    if not target.exists():
        errors.append(f"chapter {chapter['id']} -> missing {chapter['url']}")

if errors:
    print("release validation failed:", file=sys.stderr)
    print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
    raise SystemExit(1)

print(f"validated {len(manifest['chapters'])} chapters and local HTML assets")
