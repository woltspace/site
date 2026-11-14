// Builds the deck from deck.json: one iframe per slide, a nested list is a vertical stack. reveal.js does the rest.
(async function () {
  const deck = await (await fetch('deck.json', { cache: 'no-cache' })).json();
  const slides = document.querySelector('.slides');
  document.title = deck.title;
  let n = 0;
  const section = slide => {
    const el = document.createElement('section'), frame = document.createElement('iframe');
    const query = new URLSearchParams({ ...slide.params, n: n++ });
    el.id = slide.as || slide.id;
    // Reveal loads each slide page when it comes near and unloads it when far (phones keep only a few: the cover scene is heavy).
    frame.dataset.src = `slides/${slide.id}/index.html?${query}`;
    frame.setAttribute('data-preload', '');
    frame.title = el.id;
    el.append(frame);
    if (slide.notes) { const notes = document.createElement('aside'); notes.className = 'notes'; notes.textContent = slide.notes; el.append(notes); }
    return el;
  };
  deck.slides.forEach(item => {
    if (!Array.isArray(item)) return slides.append(section(item));
    const stack = document.createElement('section');
    item.forEach(slide => stack.append(section(slide)));
    slides.append(stack);
  });

  const frameNow = () => Reveal.getCurrentSlide()?.querySelector('iframe');
  // A slide page can use a key for its own step first (the Wolt terminal).
  const step = direction => { try { return frameNow()?.contentWindow.deckStep?.(direction) === true; } catch (_error) { return false; } };
  const directionOf = key => ['ArrowRight', ' ', 'PageDown', 'Enter'].includes(key) ? 'next' : ['ArrowLeft', 'PageUp'].includes(key) ? 'previous' : null;
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = directionOf(event.key);
    if (direction && step(direction)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  // Keys pressed while a slide page has the focus arrive here.
  window.deckKey = key => {
    const direction = directionOf(key);
    if (direction && step(direction)) return;
    const k = key.length === 1 ? key.toLowerCase() : key;
    const act = { ArrowRight: () => Reveal.right(), ArrowLeft: () => Reveal.left(), ArrowUp: () => Reveal.up(), ArrowDown: () => Reveal.down(), ' ': () => Reveal.next(), PageDown: () => Reveal.next(), Enter: () => Reveal.next(), PageUp: () => Reveal.prev(), o: () => Reveal.toggleOverview(), Escape: () => Reveal.toggleOverview(), b: () => Reveal.togglePause(), f: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(), s: () => Reveal.getPlugin('notes')?.open() }[k];
    if (act) act();
    focus();
  };
  // The cover page turns through the deck.
  window.bookShell = { go: target => (new URL(target).searchParams.has('entered') ? Reveal.next() : Reveal.prev()), fullscreen() {} };

  const sync = () => {
    const now = frameNow();
    document.querySelectorAll('.slides iframe').forEach(frame => {
      const doc = frame.contentDocument;
      doc?.documentElement?.classList.toggle('deck-paused', frame !== now && !Reveal.isOverview() && !Reveal.isPrintView());
    });
    if (now && now !== sync.last) now.contentWindow.dispatchEvent(new CustomEvent('book:show', { detail: now.src }));
    sync.last = now;
  };

  await Reveal.initialize({
    width: 1305, height: 816, margin: 0, minScale: 0.1, maxScale: 4, center: false,
    hash: true, controls: true, progress: true, slideNumber: 'c', showSlideNumber: 'all', transition: 'fade', transitionSpeed: 'fast', backgroundTransition: 'none',
    viewDistance: 99, mobileViewDistance: 2, plugins: [RevealNotes],
  });
  Reveal.on('slidechanged', () => { sync(); focus(); });
  Reveal.on('overviewshown', sync);
  Reveal.on('overviewhidden', sync);
  sync();
  document.querySelectorAll('.slides iframe').forEach(frame => frame.addEventListener('load', sync));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
