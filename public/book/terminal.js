document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="terminal-type-tune.css">');
const bookNavScript = document.createElement('script');
bookNavScript.src = 'book-nav.js?v=20261006-r2';
document.head.append(bookNavScript);
document.querySelector('.back').textContent = '← back to lodge scene';
document.querySelector('#raccoon').innerHTML = woltSpriteAvatar('raccoon', 180);

const pages = [
  ['$ cat what_are_wolts.txt', '', 'Wolts are builders.', '', 'Any coding agent can be a wolt.', '(Claude Code, Codex, Pi, etc.)'],
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
    location.href = 'candidates/#apps';
    return;
  }
  showCommand(page + 1);
}

function goBack() {
  if (phase === 'content') return showCommand(page);
  if (page > 0) return showContent(page - 1);
  location.href = 'index.html?entered=1';
}

terminal.addEventListener('click', advance);
window.addEventListener('book:navigate', event => {
  event.preventDefault();
  event.detail.direction === 'next' ? advance() : goBack();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key.toLowerCase() === 'y' || event.key === 'ArrowRight') advance();
  if (event.key.toLowerCase() === 'n' || event.key === 'ArrowLeft') goBack();
  if (event.key === 'Escape') location.href = 'index.html?entered=1';
});
document.querySelector('#replay').addEventListener('click', event => {
  event.stopPropagation();
  showCommand(0);
});

showCommand(0);
