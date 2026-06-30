// =============================================
// DYNAMIC BACKGROUND TREES
// Small, hand-drawn-feeling trees that sway gently in the wind.
// Procedural recursive branches + soft foliage, rendered on a canvas
// pinned to the bottom of the hero so the robot stands in a little grove.
// =============================================
(function () {
  const canvas = document.getElementById('trees-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let trees = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tiny seeded RNG so each tree is consistent across frames/resizes.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildTrees();
  }

  function buildTrees() {
    trees = [];
    const count = Math.max(4, Math.round(W / 190)); // a handful, evenly spaced
    for (let i = 0; i < count; i++) {
      const rng = mulberry32(2024 + i * 131);
      trees.push({
        rng,
        x: ((i + 0.5) / count) * W + (rng() - 0.5) * 50,
        base: H - 4 - rng() * 6,
        height: 58 + rng() * 52,        // kept small
        depth: 6 + Math.floor(rng() * 2),
        spread: 0.42 + rng() * 0.22,
        lean: (rng() - 0.5) * 0.18,
        phase: rng() * Math.PI * 2,
        sway: 0.6 + rng() * 0.7,
        hue: 96 + rng() * 38,           // sage → soft green
        leaf: 0.14 + rng() * 0.08
      });
    }
  }

  function branch(tree, x, y, angle, len, width, depth, t) {
    if (depth === 0 || len < 3) {
      // soft foliage cluster at the tips
      const r = 5 + len * 0.5;
      ctx.fillStyle = `hsla(${tree.hue}, 32%, 52%, ${tree.leaf})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Wind: stronger toward the thinner outer branches, gentle overall.
    const reach = 1 - depth / tree.depth;
    const wind = reduceMotion ? 0
      : Math.sin(t * 0.9 + tree.phase + (tree.depth - depth) * 0.6) * tree.sway * reach * 0.10;
    const a = angle + wind + tree.lean * reach;

    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;

    ctx.strokeStyle = `hsla(28, 24%, 28%, ${0.16 + depth * 0.035})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const r = tree.rng;
    branch(tree, x2, y2, a - tree.spread * (0.8 + r() * 0.4), len * 0.74, width * 0.68, depth - 1, t);
    branch(tree, x2, y2, a + tree.spread * (0.8 + r() * 0.4), len * 0.72, width * 0.68, depth - 1, t);
    // occasional middle shoot for a fuller, organic silhouette
    if (depth > 3 && r() > 0.45) {
      branch(tree, x2, y2, a + (r() - 0.5) * 0.4, len * 0.6, width * 0.6, depth - 2, t);
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const tree of trees) {
      tree.rng = mulberry32(Math.round(tree.x) * 7 + tree.depth); // reset per frame for stable shape
      branch(tree, tree.x, tree.base, -Math.PI / 2, tree.height * 0.32, 3 + tree.height / 70, tree.depth, t);
    }
  }

  function loop(ms) {
    draw(ms / 1000);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (reduceMotion) draw(0);
  else requestAnimationFrame(loop);
})();
