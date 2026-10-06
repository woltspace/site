# The Book of Wolt

An animated, mobile-first field guide to Woltspace.

The app is self-contained static HTML, CSS, and JavaScript. Woltspace serves it
on port 4025 using the no-cache development server in `server.py`.

## Shipping contract

`release-manifest.json` is the canonical chapter and release index shared by
the public-web and lodge editions. Both targets use the same static files and
the same `index.html` entry point; no lodge authentication or runtime state is
required by the book itself. Desktop chapter navigation and mobile paging read
that manifest, with an embedded fallback for offline previews.

Build the portable release with:

```sh
./scripts/build-release.sh
```

This produces an ignored `dist/` directory and a versioned zip in `releases/`.
The release currently has seven chapters and reserves two extension slots for
the remaining story work. The build also checks every local HTML asset and
chapter target before creating the archive.

Before promoting a release, verify every changed chapter at 390×844 and a
16:10 desktop viewport, then update the release number in
`release-manifest.json`.

## Mobile interaction

- Tap anywhere on the cover to enter.
- Tap the left half of a story scene to go back.
- Tap the right half to go forward.
- Horizontal swipes follow the same direction.
- A tap during terminal typing completes the active animation.
