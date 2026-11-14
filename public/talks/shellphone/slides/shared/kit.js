// Shared by every slide page: fills in the deck's params, sends keys and clicks up to the deck.
(function () {
  const deck = window.parent !== window ? window.parent : null;
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-param]').forEach(el => { if (params.has(el.dataset.param)) el.textContent = params.get(el.dataset.param); });
  const label = document.querySelector('.label span');
  if (label && params.has('n')) label.textContent = label.textContent.replace(/^\d+/, params.get('n').padStart(2, '0'));
  if (!deck || !deck.deckKey) return;
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    deck.deckKey(event.key);
  });
  // A click on the slide goes forward, like a clicker. Links, buttons and the terminal keep their own clicks.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.target.closest('a, button, video, input, textarea, select, label, summary, .terminal, #cover-page, .question')) return;
    deck.Reveal.next();
  });
})();
