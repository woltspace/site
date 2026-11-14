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
    const act = { ArrowRight: () => Reveal.right(), ArrowLeft: () => Reveal.left(), ArrowUp: () => Reveal.up(), ArrowDown: () => Reveal.down(), ' ': () => Reveal.next(), PageDown: () => Reveal.next(), Enter: () => Reveal.next(), PageUp: () => Reveal.prev(), o: () => Reveal.toggleOverview(), Escape: () => Reveal.toggleOverview(), b: () => Reveal.togglePause(), f: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(), s: () => Reveal.getPlugin('notes')?.open(), l: () => laser.toggle() }[k];
    if (act) act();
    focus();
  };
  // Laser pointer: L shows a red dot that follows the mouse, over the deck and inside every slide page.
  const laser = (() => {
    const dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#ff2020;box-shadow:0 0 2px 1px #ff6060,0 0 6px 1px #ff202080;opacity:0;transition:opacity .25s;pointer-events:none;z-index:99999;display:none';
    document.body.appendChild(dot);
    let on = false;
    const css = 'html.laser-on, html.laser-on * { cursor: none !important; }';
    let idle; // it shows while the mouse moves and fades after 1.5 s still, like Google Slides
    const place = (x, y) => { dot.style.transform = `translate(${x}px, ${y}px)`; if (!on) return; dot.style.opacity = '1'; clearTimeout(idle); idle = setTimeout(() => { dot.style.opacity = '0'; }, 1500); };
    const hook = frame => { try {
      const doc = frame.contentDocument; if (!doc || doc.laserHooked) return; doc.laserHooked = true;
      const st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);
      doc.documentElement.classList.toggle('laser-on', on);
      doc.addEventListener('mousemove', e => { const r = frame.getBoundingClientRect(); place(r.left + e.clientX * r.width / frame.clientWidth, r.top + e.clientY * r.height / frame.clientHeight); });
    } catch (_e) {} };
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    document.addEventListener('mousemove', e => place(e.clientX, e.clientY));
    document.querySelectorAll('.slides iframe').forEach(f => { hook(f); f.addEventListener('load', () => { hook(f); f.contentDocument?.documentElement.classList.toggle('laser-on', on); }); });
    const toggle = () => { on = !on; dot.style.display = on ? 'block' : 'none';
      [document, ...[...document.querySelectorAll('.slides iframe')].map(f => { try { return f.contentDocument; } catch (_e) { return null; } })].forEach(d => d?.documentElement?.classList.toggle('laser-on', on)); };
    addEventListener('keydown', e => { if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'l' || e.key === 'L')) toggle(); });
    return { toggle };
  })();
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
    keyboard: { 72: null, 74: null, 75: null, 76: null }, // h j k l: L is the laser, not "next"
  });
  Reveal.on('slidechanged', () => { sync(); focus(); });
  Reveal.on('overviewshown', sync);
  Reveal.on('overviewhidden', sync);
  sync();
  document.querySelectorAll('.slides iframe').forEach(frame => frame.addEventListener('load', sync));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
