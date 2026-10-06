document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="candidates-fix.css?v=20260930-04"><link rel="stylesheet" href="candidates-for-you.css?v=20260930-04">');
document.querySelector('body > nav')?.remove();
const sharedNav = document.createElement('script');
sharedNav.src = '../book-nav.js?v=20261001-01';
document.head.append(sharedNav);
document.querySelector('#phone .label span').textContent='03 · REACH YOUR WOLT';
document.querySelector('#together .label span').textContent='04 · WOLTS TALK DIRECTLY';
document.querySelector('#apps .label span').textContent='05 · WHAT WOLTS BUILD';
document.querySelector('#anywhere .label span').textContent='06 · YOUR MACHINE, EVERYWHERE';
document.querySelector('#for-you .label span').textContent='12 · IS WOLTSPACE FOR YOU?';
document.querySelectorAll('[data-wolt]').forEach(el=>{el.innerHTML=woltSpriteAvatar(el.dataset.wolt,160)});
document.querySelectorAll('.dam-log').forEach(el=>{el.innerHTML=renderBgSprite(BG_SPRITE_MAPS.log,BG_SPRITE_PAL.lg,4)});
document.querySelectorAll('.candidate').forEach(scene=>{const note=scene.querySelector('.note p');scene.querySelectorAll('.question').forEach(q=>{const show=()=>{scene.querySelectorAll('.question').forEach(x=>x.classList.remove('active'));q.classList.add('active');note.textContent=q.dataset.note};q.addEventListener('mouseenter',show);q.addEventListener('focus',show);q.addEventListener('click',show)})});
const showCurrentScene = () => {
  const active = new URLSearchParams(location.search).get('qa') || location.hash.slice(1) || 'phone';
  document.querySelectorAll('.candidate').forEach(scene => { scene.hidden = scene.id !== active; });
};
showCurrentScene();
addEventListener('hashchange', showCurrentScene);
