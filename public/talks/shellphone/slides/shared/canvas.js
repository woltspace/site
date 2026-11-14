// The IWCL and scaffold slides from the Lodge Show deck, on their 1600×1000 canvas. candidates.js switches the scenes.
// Each slide's 1600×1000 canvas, scaled to fit its box and centred (one column on phones: no scaling).
const fitCanvas = () => document.querySelectorAll('.candidate:not([hidden]) .cv').forEach(cv => {
  const box = cv.parentElement, w = box.clientWidth, h = box.clientHeight;
  if (innerWidth <= 760) { cv.style.transform = ''; return; }
  const k = Math.min(w / 1600, h / 1000);
  cv.style.transform = `translate(${(w - 1600 * k) / 2}px, ${(h - 1000 * k) / 2}px) scale(${k})`;
});
fitCanvas();
addEventListener('hashchange', fitCanvas);
addEventListener('resize', fitCanvas);
if (window.ResizeObserver) document.querySelectorAll('.tk').forEach(c => new ResizeObserver(fitCanvas).observe(c));

document.querySelectorAll('.tk [data-wolt]').forEach(el => { el.innerHTML = woltSpriteAvatar(el.dataset.wolt, 112); });
// Provider badges (IWCL slide): the model's mark over each wolt.
// Each provider's own colours, the same badges as on the scaffold slide.
const BRANDS = {
  claude:      { bg: '#fff3dc', fg: '#d97757', c: '#d97757' },
  openai:      { bg: '#ffffff', fg: '#000000', c: '#ffffff' },
  deepseek:    { bg: '#ffffff', fg: '#4d6bfe', c: '#4d6bfe' },
  huggingface: { bg: '#111111', fg: '#ffd21e', c: '#ffd21e' },
};
document.querySelectorAll('[data-logo]').forEach(el => {
  const k = el.dataset.logo, b = BRANDS[k];
  el.innerHTML = `<svg viewBox="0 0 24 24"><path d="${LOGOS[k]}"/></svg>`;
  if (b) el.setAttribute('style', `--bg-b:${b.bg};--fg:${b.fg};--c:${b.c}`);
});
// The lodge, in pixels: a log cabin with a chimney (the IWCL slide's middle).
document.querySelectorAll('.lodge-px').forEach(el => {
  const px = [];
  const R = (x, y, w, h, c) => px.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
  R(21, 2, 3, 6, '#7a3010'); R(20, 1, 5, 1, '#5a2008');                                  // chimney
  for (let i = 0; i < 8; i++) R(15 - i * 2, 2 + i, 2 + i * 4, 1, i % 2 ? '#c4531e' : '#e9824b'); // roof, stepped
  R(1, 10, 30, 1, '#6a2a0e');
  for (let y = 11; y < 24; y += 2) { R(2, y, 28, 1, '#8b4a22'); R(2, y + 1, 28, 1, '#a35d2c'); }  // logs
  R(13, 16, 6, 8, '#3a1a0a'); R(17, 20, 1, 1, '#ffca4e');                                // door + knob
  R(5, 14, 5, 4, '#ffca4e'); R(22, 14, 5, 4, '#ffca4e'); R(7, 14, 1, 4, '#6a2a0e'); R(24, 14, 1, 4, '#6a2a0e'); // lit windows
  R(0, 24, 32, 2, '#3c6b2f');                                                             // grass
  el.innerHTML = `<svg viewBox="0 0 32 26" shape-rendering="crispEdges">${px.join('')}</svg>`;
});

