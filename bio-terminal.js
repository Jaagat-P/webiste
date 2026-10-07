(() => {
  const paragraph = document.querySelector('[data-terminal-typewriter]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!paragraph || reducedMotion.matches || document.hidden) return;

  const characters = Array.from(paragraph.textContent);
  const original = document.createElement('span');
  original.className = 'terminal-typewriter-original';
  original.append(...paragraph.childNodes);

  const output = document.createElement('span');
  output.className = 'terminal-typewriter-output';
  output.setAttribute('aria-hidden', 'true');
  paragraph.append(original, output);
  paragraph.classList.add('is-typing');

  let frame;
  let started;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    paragraph.classList.remove('is-typing');
    output.remove();
    original.replaceWith(...original.childNodes);
    reducedMotion.removeEventListener('change', finish);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    paragraph.removeEventListener('pointerdown', finish);
  }

  function onVisibilityChange() {
    if (document.hidden) finish();
  }

  function type(timestamp) {
    if (started === undefined) started = timestamp;
    const progress = Math.min(1, (timestamp - started) / 4200);
    output.textContent = characters.slice(0, Math.ceil(progress * characters.length)).join('');
    if (progress === 1) finish();
    else frame = requestAnimationFrame(type);
  }

  reducedMotion.addEventListener('change', finish);
  document.addEventListener('visibilitychange', onVisibilityChange);
  paragraph.addEventListener('pointerdown', finish);
  frame = requestAnimationFrame(type);
})();
