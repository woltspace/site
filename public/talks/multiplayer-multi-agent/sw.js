// Offline Book: on first open, cache every file once; after that the whole
// talk runs from the device, wifi or not. Bump VERSION to ship a new copy.
const VERSION = 'book-20261007-offline-45';
const FILES = [
  './', 'book.html', 'index.html', 'terminal.html', 'candidates/', 'candidates/index.html', 'text.html', 'turn.html',
  'book-nav.css', 'book-nav.js', 'presenter-keys.js', 'polish.css', 'mobile-cover.css', 'text.css',
  'terminal.css', 'terminal.js', 'terminal-type-tune.css', 'turn-real.css', 'turn.js',
  'release-manifest.json', 'manifest.webmanifest',
  'candidates/candidates.css', 'candidates/candidates-new.css', 'candidates/candidates-more.css',
  'candidates/candidates-fix.css', 'candidates/candidates-for-you.css', 'candidates/refocus.css',
  'candidates/candidates.js',
  'static/home.css', 'static/home-scene.js', 'static/sprites.js', 'static/fonts/fonts.css',
  'static/fonts/DMSans.woff2', 'static/fonts/JetBrainsMono.woff2', 'static/fonts/Preahvihear.woff2',
  'static/media/onboardie-card.png', 'static/media/metr-figure.png', 'static/media/metr-header.png', 'static/media/stick-overflow-shot.png', 'static/media/woodipedia-shot.png', 'static/media/single-to-multiplayer.svg', 'static/media/blog-qr.svg', 'static/media/repo-qr.svg', 'static/media/onboardie-qr.svg', 'static/media/wolts-replay-poster.jpg', 'static/media/wolts-replay.mp4',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('book-') && key !== VERSION).map(key => caches.delete(key))))
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
