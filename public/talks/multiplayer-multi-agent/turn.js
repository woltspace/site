document.body.classList.add('cover-active');

const bookNavScript = document.createElement('script');
bookNavScript.src = 'book-nav.js?v=20261006-r2';
document.head.append(bookNavScript);

const book = document.querySelector('#book');
const inside = document.querySelector('.inside-page');
const cover = document.querySelector('#cover-page');

// In the one-page Book the cover and the lodge are two separate pages (jerpint 2026-10-06):
// this copy shows only one of them, and turning asks the Book to switch pages.
const bookShell = (() => { try { return window.parent !== window ? window.parent.bookShell : null; } catch (_error) { return null; } })();
const soloMode = bookShell ? (new URLSearchParams(location.search).has('entered') ? 'lodge' : 'cover') : null;
if (soloMode) document.body.classList.add(`solo-${soloMode}`);

function setTurned(turned) {
  if (soloMode === 'cover' && turned) return bookShell.go(new URL('index.html?entered=1', location.href).href);
  if (soloMode === 'lodge' && !turned) return bookShell.go(new URL('index.html', location.href).href);
  const changed = book.classList.contains('turned') !== turned;
  book.classList.toggle('turned', turned);
  document.body.classList.toggle('cover-active', !turned);
  inside.setAttribute('aria-hidden', String(!turned));
  cover.setAttribute('aria-hidden', String(turned));
  if (matchMedia('(max-width: 650px)').matches) cover.style.display = turned ? 'none' : '';
  if (changed) dispatchEvent(new CustomEvent('book:turned', { detail: { turned } }));
}

cover.addEventListener('click', () => setTurned(true));
document.querySelector('#turn-back').addEventListener('click', () => setTurned(false));
if (new URLSearchParams(location.search).has('entered')) setTurned(true);
window.addEventListener('book:show', event => setTurned(new URL(event.detail).searchParams.has('entered')));
window.addEventListener('book:navigate', event => {
  if (event.detail.direction === 'previous') {
    event.preventDefault();
    setTurned(false);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'Enter') setTurned(true);
  if (event.key === 'ArrowLeft') setTurned(false);
});

// Cover terminal: jerpint's memes rotate, a braille spinner keeps it alive (same as new wolt sites).
(function () {
  const line = document.querySelector('.meme-line');
  const spin = document.querySelector('.meme-spin');
  if (!line) return;
  const memes = ["there's no place like localhost", 'it works on my machine', 'how much wolt could a wolt chuck chuck', 'beavers love to give a dam'];
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // One meme at a time: type it, hold, erase, then the next. No two lines on screen at once.
  let meme = 0;
  let frame = 0;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  (async () => {
    for (;;) {
      await wait(2600);
      for (let n = line.textContent.length; n >= 0; n--) { line.textContent = line.textContent.slice(0, n); await wait(18); }
      meme = (meme + 1) % memes.length;
      await wait(250);
      for (let n = 1; n <= memes[meme].length; n++) { line.textContent = memes[meme].slice(0, n); await wait(38); }
    }
  })();
  setInterval(() => { frame = (frame + 1) % frames.length; spin.textContent = frames[frame]; }, 90);
})();
