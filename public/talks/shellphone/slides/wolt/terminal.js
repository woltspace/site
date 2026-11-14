document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="terminal-type-tune.css">');
document.querySelector('.back').textContent = '← back to lodge scene';
document.querySelector('#raccoon').innerHTML = woltSpriteAvatar('raccoon', 180);

const pages = [
  ['$ cat what_are_wolts.txt', '', 'Wolts are builders.', '', 'Any coding agent can be a wolt.', '(Claude Code, Codex, OpenCode, etc.)'],
];

const story = document.querySelector('#story');
const terminal = document.querySelector('.terminal');
let timer;
let page = 0;
let phase = 'typing';
let finishTyping = null;

function typeLines(lines, done, clear = true) {
  clearTimeout(timer);
  const prefix = clear ? '' : story.textContent;
  const finalText = `${prefix}${lines.join('\n')}`;
  if (clear) story.textContent = '';
  let line = 0;
  let character = 0;
  const complete = () => {
    clearTimeout(timer);
    story.textContent = finalText;
    finishTyping = null;
    done();
  };
  finishTyping = complete;
  function tick() {
    if (line >= lines.length) return complete();
    if (character < lines[line].length) {
      story.textContent += lines[line][character++];
      timer = setTimeout(tick, 24);
    } else {
      if (line === lines.length - 1) return complete();
      story.textContent += '\n';
      line += 1;
      character = 0;
      timer = setTimeout(tick, lines[line - 1] === '' ? 160 : 380);
    }
  }
  tick();
}

function showCommand(index) {
  page = index;
  phase = 'typing';
  terminal.classList.remove('awaiting');
  typeLines([pages[index][0]], () => {
    phase = 'command';
    terminal.classList.add('awaiting');
  });
}

function showContent(index = page) {
  page = index;
  phase = 'typing';
  terminal.classList.remove('awaiting');
  story.textContent = `${pages[page][0]}\n`;
  typeLines(pages[page].slice(1), () => {
    story.textContent += '\nContinue (Y/n)? ';
    phase = 'content';
    terminal.classList.add('awaiting');
  }, false);
}

function advance() {
  if (phase === 'typing') {
    finishTyping?.();
    return;
  }
  if (phase === 'command') return showContent();
  if (page === pages.length - 1) {
    window.parent.Reveal.next();
    return;
  }
  showCommand(page + 1);
}

function goBack() {
  if (phase === 'content') return showCommand(page);
  if (page > 0) return showContent(page - 1);
  window.parent.Reveal.prev();
}

terminal.addEventListener('click', advance);
// The deck asks before it turns the slide: true means this page used the key for its own step.
window.deckStep = direction => {
  if (direction === 'next') { if (phase === 'content') return false; advance(); return true; }
  if (phase === 'content') { goBack(); return true; }
  return false;
};
document.querySelector('#replay').addEventListener('click', event => {
  event.stopPropagation();
  showCommand(0);
});

// One-page Book: replay the lines each time the chapter comes on screen.
window.addEventListener('book:show', () => showCommand(0));

showCommand(0);
