// =============================================
// DYNAMIC BACKGROUND TREES
// A couple of small, hand-drawn-feeling trees on the right side of the
// hero that sway gently in the wind. The foliage colour flows through
// the same gradient as the clock, so the leaves shimmer along with it.
// =============================================
(function () {
  const canvas = document.getElementById('trees-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let trees = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Same palette/phase as the clock gradient (see styles.css .h-clock span),
  // anchored to wall-clock time so the leaves and clock stay in step.
  const EPOCH = Date.UTC(2024, 0, 1);
  const GRAD = [
    [16, 54, 56], [26, 50, 58], [38, 44, 60],
    [22, 50, 57], [8, 48, 57], [22, 50, 57], [16, 54, 56]
  ];
  function gradColor(p, alpha) {
    p = ((p % 1) + 1) % 1;
    const seg = p * (GRAD.length - 1);
    const i = Math.floor(seg);
    const f = seg - i;
    const a = GRAD[i], b = GRAD[Math.min(i + 1, GRAD.length - 1)];
    const h = a[0] + (b[0] - a[0]) * f;
    const s = a[1] + (b[1] - a[1]) * f;
    const l = a[2] + (b[2] - a[2]) * f;
    return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%, ${alpha})`;
  }

  // Tiny seeded RNG so each tree's shape is stable across frames/resizes.
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
    // Two larger trees clustered on the right side of the hero.
    const spots = [0.71, 0.90];
    spots.forEach((fx, i) => {
      const rng = mulberry32(2024 + i * 131);
      const height = (i === 0 ? 235 : 200) + rng() * 50; // left tree a touch larger
      trees.push({
        seed: 2024 + i * 131,
        x: W * fx + (rng() - 0.5) * 28,
        base: H - 6 - rng() * 8,
        height,
        depth: 6 + Math.floor(rng() * 2),  // deeper → more leaves
        spread: 0.5 + rng() * 0.22,
        lean: (rng() - 0.5) * 0.16,
        phase: rng() * Math.PI * 2,
        sway: 0.7 + rng() * 0.7,
        leaf: 0.78 + rng() * 0.1,          // opaque enough for shapes to read
        leafSize: 10 + height * 0.04
      });
    });
  }

  function drawLeaf(x, y, angle, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.55, -size * 0.42, size, 0);
    ctx.quadraticCurveTo(size * 0.55, size * 0.42, 0, 0);
    ctx.closePath();
    ctx.fill();
    // faint midrib to define the leaf shape
    ctx.strokeStyle = 'hsla(28, 24%, 22%, 0.20)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.92, 0);
    ctx.stroke();
    ctx.restore();
  }

  function branch(tree, x, y, angle, len, width, depth, t, gp) {
    // Slow sway + a faster gentle self-shake, both stronger toward the tips.
    const reach = 1 - depth / tree.depth;
    const sway  = reduceMotion ? 0
      : Math.sin(t * 0.9 + tree.phase + (tree.depth - depth) * 0.6) * tree.sway * reach * 0.13;
    const shake = reduceMotion ? 0
      : Math.sin(t * 2.7 + tree.phase * 1.7 + depth) * 0.024 * (reach + 0.25);
    const a = angle + sway + shake + tree.lean * reach;

    if (depth === 0 || len < 5) {
      // a small fan of distinct leaves per tip — colour sampled from the
      // flowing gradient, shifted by horizontal position so it sweeps across.
      const base = gp - (x / W) * 0.6;
      drawLeaf(x, y, a - 0.30, tree.leafSize,        gradColor(base,        tree.leaf));
      drawLeaf(x, y, a + 0.05, tree.leafSize * 1.06, gradColor(base + 0.02, tree.leaf));
      drawLeaf(x, y, a + 0.36, tree.leafSize * 0.9,  gradColor(base + 0.04, tree.leaf));
      return;
    }

    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;

    ctx.strokeStyle = `hsla(28, 24%, 28%, ${0.16 + depth * 0.035})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const r = tree._rng;
    branch(tree, x2, y2, a - tree.spread * (0.8 + r() * 0.4), len * 0.76, width * 0.7, depth - 1, t, gp);
    branch(tree, x2, y2, a + tree.spread * (0.8 + r() * 0.4), len * 0.74, width * 0.7, depth - 1, t, gp);
    if (depth > 2 && r() > 0.3) {
      branch(tree, x2, y2, a + (r() - 0.5) * 0.5, len * 0.62, width * 0.62, depth - 1, t, gp);
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const gp = ((Date.now() - EPOCH) / 1000) / 6; // gradient phase, ~6s loop
    for (const tree of trees) {
      tree._rng = mulberry32(tree.seed); // reset per frame for a stable shape
      branch(tree, tree.x, tree.base, -Math.PI / 2, tree.height * 0.32, 4.5 + tree.height / 45, tree.depth, t, gp);
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
