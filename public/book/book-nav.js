(async function () {
  if (document.querySelector('.book-nav')) return;

  const inCandidates = location.pathname.includes('/candidates/');
  const prefix = inCandidates ? '../' : '';
  const path = location.pathname;
  const hashChapter = {
    '#phone': 'reach',
    '#together': 'together',
    '#apps': 'build',
    '#anywhere': 'anywhere',
    '#connectors': 'connectors',
    '#share': 'share',
    '#multiplayer': 'multiplayer',
    '#stick-overflow': 'stick-overflow',
    '#woodipedia': 'woodipedia',
    '#for-you': 'for-you',
    '#demo': 'demo',
    '#swarms': 'swarms',
  };
  const currentChapter = () => {
    if (path.endsWith('/terminal.html')) return 'workshop';
    if (path.endsWith('/text.html')) return 'text';
    if (inCandidates) return hashChapter[location.hash] || 'build';
    return 'lodge';
  };

  const fallback = [
    { id: 'lodge', number: 1, title: 'Lodge', url: 'index.html?entered=1' },
    { id: 'workshop', number: 2, title: 'Wolt', url: 'terminal.html' },
    { id: 'build', number: 3, title: 'Today', url: 'candidates/#apps' },
    { id: 'together', number: 4, title: 'Together', url: 'candidates/#together' },
    { id: 'share', number: 5, title: 'Share', url: 'candidates/#share' },
    { id: 'multiplayer', number: 6, title: 'Multiplayer', url: 'candidates/#multiplayer' },
    { id: 'demo', number: 7, title: 'Live demo', url: 'candidates/#demo' },
    { id: 'swarms', number: 8, title: 'Axe or teeth', url: 'candidates/#swarms' },
  ];
  let chapters = fallback;
  try {
    const response = await fetch(`${prefix}release-manifest.json`, { cache: 'no-store' });
    if (response.ok) chapters = (await response.json()).chapters;
  } catch (_error) {
    // The embedded fallback keeps navigation functional in offline previews.
  }

  const hrefFor = chapter => `${prefix}${chapter.url}`;
  const active = currentChapter();
  document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${prefix}book-nav.css?v=20261001-01">`);
  document.body.insertAdjacentHTML('afterbegin', `<nav class="book-nav" aria-label="Book chapters"><a class="book-brand" href="${prefix}index.html" aria-label="The Book of Wolt, beginning"><span>THE BOOK OF WOLT</span><small class="book-progress"></small></a><div class="book-chapters">${chapters.map(chapter => `<a data-chapter="${chapter.id}" title="${chapter.title}" class="${active === chapter.id ? 'active' : ''}" href="${hrefFor(chapter)}" ${active === chapter.id ? 'aria-current="page"' : ''}><i>${chapter.number}</i>${chapter.title}</a>`).join('')}</div><a class="book-text" href="${prefix}text.html">Text edition</a><button class="book-fullscreen" type="button" aria-label="Enter fullscreen presentation" title="Fullscreen">⛶</button></nav>`);
  document.body.insertAdjacentHTML('beforeend', '<nav class="mobile-pager" aria-label="Story navigation"><button type="button" data-direction="previous" aria-label="Go back"><span>←</span></button><button type="button" data-direction="next" aria-label="Go forward"><span>→</span></button></nav>');

  const setActive = chapterId => {
    document.querySelectorAll('.book-chapters a').forEach(link => {
      const selected = link.dataset.chapter === chapterId;
      link.classList.toggle('active', selected);
      selected ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    });
    const index = chapters.findIndex(chapter => chapter.id === chapterId);
    document.querySelector('.book-progress').textContent = chapterId === 'text' ? 'TEXT EDITION' : `${String(index + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
  };
  setActive(active);

  const fullscreen = document.querySelector('.book-fullscreen');
  if (!document.documentElement.requestFullscreen) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => {
    document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreen.textContent = isFullscreen ? '×' : '⛶';
    fullscreen.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen presentation' : 'Enter fullscreen presentation');
  });
  if (inCandidates) addEventListener('hashchange', () => setActive(currentChapter()));

  const navigate = direction => {
    const event = new CustomEvent('book:navigate', { detail: { direction }, cancelable: true });
    if (!window.dispatchEvent(event)) return;
    const chapterId = currentChapter();
    const index = chapters.findIndex(chapter => chapter.id === chapterId);
    const target = direction === 'next' ? chapters[index + 1] : chapters[index - 1];
    if (target) location.href = hrefFor(target);
    else if (direction === 'next' && chapterId === chapters.at(-1).id) location.href = `${prefix}index.html`;
  };
  document.querySelectorAll('.mobile-pager button').forEach(button => button.addEventListener('click', event => {
    const ripple = document.createElement('i');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    navigate(button.dataset.direction);
  }));
})();
