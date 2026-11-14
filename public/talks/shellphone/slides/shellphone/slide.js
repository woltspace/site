// Shellphone: two lodges, two humans, two wolts, one room. The chat plays each time the slide shows, then loops.
(function shellphone() {
  const slide = document.getElementById('shellphone');
  if (!slide) return;
  const feed = slide.querySelector('.sp-feed');
  slide.querySelectorAll('[data-av]').forEach(el => { el.innerHTML = woltSpriteAvatar(el.dataset.av, 30); });
  // Each player has their own colour; a wolt's tag names its human.
  const P = {
    jerpint: { n: 'jerpint', tag: 'HUMAN', a: '#d8ecd0', b: '#e4f2dc', t: '#40702b' },
    malik:   { n: 'malik', tag: 'HUMAN', a: '#e6dcf6', b: '#efe8fa', t: '#7240b8' },
    beaver:  { n: 'Beaver', tag: "jerpint's wolt", w: 'beaver', a: '#fbe1cc', b: '#fdeadb', t: '#b4501e' },
    otter:   { n: 'Otter', tag: "malik's wolt", w: 'otter', a: '#d2ecea', b: '#dff3f1', t: '#227a72' },
  };
  const SCRIPT = [
    ['jerpint', '<span class="at">@beaver</span> <span class="at">@otter</span> let\'s build a trail map together'],
    ['beaver', 'on it. otter, can you pull the trail data?'],
    ['malik', '<span class="at">@otter</span> add the waterfalls too 💧'],
    ['otter', 'pulled 42 trails + 7 waterfalls. beaver, your turn'],
    ['beaver', 'shipped ✓ trail-map v1, built across two lodges'],
    ['jerpint', 'multiplayer wolts 🐚'],
  ];
  const row = (id, html, cls = '') => {
    const p = P[id], el = document.createElement('div');
    el.className = `sp-msg ${cls}`;
    el.style.cssText = `--pa:${p.a};--pb:${p.b};--pt:${p.t}`;
    const av = p.w ? woltSpriteAvatar(p.w, 56) : p.n[0].toUpperCase();
    el.innerHTML = `<div class="av">${av}</div><div class="tx"><small>${p.n}<span class="who">${p.tag}</span></small>${html}</div>`;
    return el;
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let run = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function play() {
    const me = ++run;
    feed.innerHTML = '';
    if (still) { SCRIPT.forEach(([id, h]) => feed.append(row(id, h))); return; }
    await wait(500);
    while (me === run) {
      for (const [id, h] of SCRIPT) {
        if (me !== run) return;
        const dots = row(id, P[id].w ? 'gnawing…' : '•••', 'typing');
        feed.append(dots); await wait(P[id].w ? 1300 : 800); dots.remove();
        if (me !== run) return;
        feed.append(row(id, h));
        while (feed.children.length > 6) feed.firstChild.remove();
        await wait(1700);
      }
      await wait(4000); feed.innerHTML = '';
    }
  }
  // In the deck: restart the chat each time the slide is shown.
  addEventListener('book:show', play);
  play();
})();
