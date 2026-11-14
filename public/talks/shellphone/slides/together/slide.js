document.querySelectorAll('[data-wolt]').forEach(el=>{el.innerHTML=woltSpriteAvatar(el.dataset.wolt,160)});
document.querySelectorAll('.dam-log').forEach(el=>{el.innerHTML=renderBgSprite(BG_SPRITE_MAPS.log,BG_SPRITE_PAL.lg,4)});
