// Offline deck: on first open, cache every file once; after that it runs from the device, wifi or not. Bump VERSION to ship a new copy.
const VERSION = 'wolt-reveal-20261114-98';
const FILES = ["./", "favicon.png", "deck.js", "deck.json", "index.html", "reveal/LICENSE", "reveal/reset.css", "reveal/reveal.css", "reveal/reveal.js", "reveal/plugin/notes.js", "slides/cover/home-scene.js", "slides/cover/home.css", "slides/cover/index.html", "slides/cover/mobile-cover.css", "slides/cover/turn-real.css", "slides/cover/turn.js", "slides/crew/index.html", "slides/crew/img/c-beaver.png", "slides/crew/img/c-raccoon.png", "slides/crew/img/h-beret.png", "slides/crew/img/h-graduation-cap.png", "slides/crew/img/h-hard-hat.png", "slides/crew/img/h-wizard-hat.png", "slides/cta/index.html", "slides/cta/img/onboardie-card.png", "slides/cta/img/qr-shellphone.png", "slides/cta/img/qr-woltspace.png", "slides/examples/c-ali-ask.png", "slides/examples/c-ali-ready.png", "slides/examples/c-ali-review.png", "slides/examples/c-lauren-idea.png", "slides/examples/c-lauren-uaaa.png", "slides/examples/c-noam-fix.png", "slides/examples/index.html", "slides/examples/noam-bug-question.png", "slides/examples/noam-trace-says-hi.png", "slides/graph/index.html", "slides/handoff/index.html", "slides/lodge/index.html", "slides/lodge/img/c-beaver.png", "slides/lodge/img/c-otter.png", "slides/lodge/img/c-raccoon.png", "slides/lodge/img/h-blue-cap.png", "slides/lodge/img/h-chef-hat.png", "slides/lodge/img/h-cowboy-hat.png", "slides/lodge/img/h-crown.png", "slides/lodge/img/h-fedora.png", "slides/lodge/img/h-flower-crown.png", "slides/lodge/img/h-orange-beanie.png", "slides/lodge/img/h-party-hat.png", "slides/lodge/img/h-pirate-hat.png", "slides/lodge/img/h-propeller-hat.png", "slides/lodge/img/h-red-beanie.png", "slides/lodge/img/h-straw-hat.png", "slides/lodge/img/h-top-hat.png", "slides/lodge/img/h-viking-helmet.png", "slides/lodge/img/h-wizard-hat.png", "slides/lodge/img/n-acorn.png", "slides/lodge/img/n-berry-bush.png", "slides/lodge/img/n-big-pine.png", "slides/lodge/img/n-campfire.png", "slides/lodge/img/n-cattails.png", "slides/lodge/img/n-dragonfly.png", "slides/lodge/img/n-fern.png", "slides/lodge/img/n-fish.png", "slides/lodge/img/n-flower.png", "slides/lodge/img/n-lily-pad.png", "slides/lodge/img/n-log.png", "slides/lodge/img/n-mushroom.png", "slides/lodge/img/n-pebble.png", "slides/lodge/img/n-pine.png", "slides/lodge/img/n-pond.png", "slides/lodge/img/n-rock.png", "slides/lodge/img/n-snail.png", "slides/lodge/img/n-stump.png", "slides/lodge/img/qr-github.png", "slides/map/index.html", "slides/map/img/c-beaver.png", "slides/map/img/c-raccoon.png", "slides/map/img/h-beret.png", "slides/map/img/hills.png", "slides/pool/index.html", "slides/roster/index.html", "slides/roster/img/c-beaver.png", "slides/roster/img/c-raccoon.png", "slides/roster/img/h-beret.png", "slides/roster/img/h-graduation-cap.png", "slides/roster/img/h-hard-hat.png", "slides/roster/img/h-wizard-hat.png", "slides/scaffold/index.html", "slides/scaffold/slide.js", "slides/shared/candidates-fix.css", "slides/shared/candidates-for-you.css", "slides/shared/candidates-more.css", "slides/shared/candidates-new.css", "slides/shared/candidates.css", "slides/shared/canvas.js", "slides/shared/kit.css", "slides/shared/kit.js", "slides/shared/logos.js", "slides/shared/polish.css", "slides/shared/refocus.css", "slides/shared/show.css", "slides/shared/sprites.js", "slides/shared/fonts/DMSans-OFL.txt", "slides/shared/fonts/DMSans.woff2", "slides/shared/fonts/JetBrainsMono-OFL.txt", "slides/shared/fonts/JetBrainsMono.woff2", "slides/shared/fonts/Preahvihear-OFL.txt", "slides/shared/fonts/Preahvihear.woff2", "slides/shared/fonts/fonts.css", "slides/shellphone-pwa/index.html", "slides/shellphone-pwa/img/f01.jpg", "slides/shellphone-pwa/img/f02.jpg", "slides/shellphone-pwa/img/f03.jpg", "slides/shellphone-pwa/img/f04.jpg", "slides/shellphone-pwa/img/f05.jpg", "slides/shellphone-pwa/img/f06.jpg", "slides/shellphone-pwa/img/home.jpg", "slides/shellphone-pwa/img/qr-shellphone.png", "slides/terms/index.html", "slides/terms/img/claude-api.png", "slides/terms/img/claude-app.png", "slides/terms/img/claude-site.png", "slides/terms/img/codex.png", "slides/terms/img/tmux-2x2.png", "slides/text/index.html", "slides/text/img/create-wolt.png", "slides/text/img/lauren-home.png", "slides/together/index.html", "slides/together/slide.js", "slides/together/img/h-hard-hat.png", "slides/together/img/h-wizard-hat.png", "slides/video/index.html", "slides/video/img/desk-pinned.mp4", "slides/wolt/index.html", "slides/wolt/terminal-type-tune.css", "slides/wolt/terminal.css", "slides/wolt/terminal.js"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('wolt-reveal-') && key !== VERSION).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// Videos ask for byte ranges (Safari always does); answer them from the cached file.
async function rangeResponse(request, cached) {
  const blob = await cached.blob();
  const match = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  const start = match && match[1] ? Number(match[1]) : 0;
  const end = match && match[2] ? Number(match[2]) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

// Network first (so a reload always shows the latest Book), the saved copy when offline or slow.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (request.headers.has('range')) return cached ? rangeResponse(request, cached) : fetch(request);
    try {
      const response = await Promise.race([
        fetch(request, { cache: 'no-cache' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), cached ? 2500 : 30000)),
      ]);
      if (response.ok && response.status === 200) cache.put(request, response.clone());
      return response;
    } catch (_error) {
      if (cached) return cached;
      throw _error;
    }
  })());
});
