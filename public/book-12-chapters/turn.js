document.body.classList.add('cover-active');

const bookNavScript = document.createElement('script');
bookNavScript.src = 'book-nav.js?v=20261001-01';
document.head.append(bookNavScript);

const book = document.querySelector('#book');
const inside = document.querySelector('.inside-page');
const cover = document.querySelector('#cover-page');

function setTurned(turned) {
  book.classList.toggle('turned', turned);
  document.body.classList.toggle('cover-active', !turned);
  inside.setAttribute('aria-hidden', String(!turned));
  cover.setAttribute('aria-hidden', String(turned));
  if (matchMedia('(max-width: 650px)').matches) cover.style.display = turned ? 'none' : '';
}

cover.addEventListener('click', () => setTurned(true));
document.querySelector('#turn-back').addEventListener('click', () => setTurned(false));
if (new URLSearchParams(location.search).has('entered')) setTurned(true);
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
