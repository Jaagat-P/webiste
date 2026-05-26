// =============================================
// STICKY NAV
// =============================================
const hero = document.getElementById('hero');
const snav = document.getElementById('snav');
new IntersectionObserver(
  ([e]) => snav.classList.toggle('show', !e.isIntersecting),
  { threshold: 0.1 }
).observe(hero);

// =============================================
// MAGNETIC BUTTONS
// =============================================
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-(r.left+r.width/2))*0.28}px,${(e.clientY-(r.top+r.height/2))*0.28}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// =============================================
// THREE.JS — HUMANOID ROBOT
// =============================================
if (typeof THREE === 'undefined') {
  console.warn('Three.js not loaded.');
} else {
  const canvas = document.getElementById('robot-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
  camera.position.z = 8.2;

  function resize() {
    const w = canvas.parentElement ? canvas.parentElement.clientWidth : Math.round(window.innerWidth / 2);
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // --- LIGHTING ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const keyLight = new THREE.DirectionalLight(0xEEF4FF, 3.5);
  keyLight.position.set(4, 6, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x2255FF, 1.6);
  rimLight.position.set(-5, 1, -5);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(0x44AAFF, 2.2, 14);
  accentLight.position.set(0, -1.5, 3);
  scene.add(accentLight);

  const fillLight = new THREE.DirectionalLight(0xDDEEFF, 0.8);
  fillLight.position.set(0, -4, 3);
  scene.add(fillLight);

  // --- MATERIALS ---
  const chrome     = new THREE.MeshPhongMaterial({ color: 0xBBC8DC, specular: 0xFFFFFF, shininess: 280 });
  const chromeDark = new THREE.MeshPhongMaterial({ color: 0x7A8899, specular: 0xBBBBCC, shininess: 160 });
  const accentMat  = new THREE.MeshPhongMaterial({ color: 0x1A3A6A, specular: 0x4477BB, shininess: 200, emissive: 0x0A1A3A });
  const glowMat    = new THREE.MeshStandardMaterial({ color: 0x44AAFF, emissive: 0x2266CC, emissiveIntensity: 3.5, roughness: 0.9 });
  const visorMat   = new THREE.MeshPhongMaterial({ color: 0x060812, specular: 0x2244AA, shininess: 500, transparent: true, opacity: 0.92 });

  // --- ROBOT ---
  const bot = new THREE.Group();

  function addTo(grp, geo, mat, x, y, z, rx, ry, rz) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx !== undefined) m.rotation.set(rx, ry || 0, rz || 0);
    grp.add(m);
    return m;
  }
  function bp(geo, mat, x, y, z, rx, ry, rz) {
    return addTo(bot, geo, mat, x, y, z, rx, ry, rz);
  }

  // HEAD
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.47, 0);
  addTo(headGroup, new THREE.BoxGeometry(0.52, 0.46, 0.44),  chrome,     0,      0.23,  0);
  addTo(headGroup, new THREE.BoxGeometry(0.44, 0.07, 0.36),  chromeDark, 0,      0.45,  0);
  addTo(headGroup, new THREE.BoxGeometry(0.48, 0.055, 0.10), chromeDark, 0,      0.35,  0.19);
  addTo(headGroup, new THREE.BoxGeometry(0.055, 0.32, 0.28), chromeDark, -0.275, 0.20,  0.04);
  addTo(headGroup, new THREE.BoxGeometry(0.055, 0.32, 0.28), chromeDark,  0.275, 0.20,  0.04);
  addTo(headGroup, new THREE.BoxGeometry(0.34, 0.12, 0.22),  chromeDark, 0,      0.02,  0.04);
  addTo(headGroup, new THREE.BoxGeometry(0.40, 0.28, 0.055), chromeDark, 0,      0.23, -0.247);
  addTo(headGroup, new THREE.BoxGeometry(0.40, 0.20, 0.018), visorMat,   0,      0.25,  0.229);
  addTo(headGroup, new THREE.BoxGeometry(0.32, 0.062, 0.016),glowMat,    0,      0.27,  0.238);
  addTo(headGroup, new THREE.SphereGeometry(0.017, 6, 6),    glowMat,   -0.12,   0.27,  0.242);
  addTo(headGroup, new THREE.SphereGeometry(0.017, 6, 6),    glowMat,    0.12,   0.27,  0.242);
  addTo(headGroup, new THREE.CylinderGeometry(0.012, 0.020, 0.16, 6), accentMat, 0.18, 0.51, 0);
  addTo(headGroup, new THREE.SphereGeometry(0.024, 6, 6),    glowMat,    0.18,   0.60,  0);
  bot.add(headGroup);

  // NECK
  bp(new THREE.CylinderGeometry(0.09, 0.12, 0.18, 10), accentMat, 0, 1.36, 0);

  // TORSO
  bp(new THREE.BoxGeometry(0.76, 0.86, 0.40), chrome,     0,     0.74, 0);
  bp(new THREE.BoxGeometry(0.08, 0.86, 0.40), chromeDark, -0.34, 0.74, 0);
  bp(new THREE.BoxGeometry(0.08, 0.86, 0.40), chromeDark,  0.34, 0.74, 0);
  bp(new THREE.BoxGeometry(0.48, 0.50, 0.04), accentMat,  0,     0.80, 0.22);
  bp(new THREE.SphereGeometry(0.078, 14, 14), glowMat,    0,     0.76, 0.265);
  bp(new THREE.TorusGeometry(0.115, 0.018, 8, 24), glowMat, 0,   0.76, 0.255, Math.PI / 2);
  bp(new THREE.BoxGeometry(0.20, 0.018, 0.02), accentMat, -0.12, 0.96, 0.225);
  bp(new THREE.BoxGeometry(0.20, 0.018, 0.02), accentMat,  0.12, 0.96, 0.225);
  bp(new THREE.BoxGeometry(0.46, 0.014, 0.04), glowMat,    0,    0.39, 0.21);
  [-0.08, -0.02, 0.04].forEach(dy =>
    bp(new THREE.BoxGeometry(0.30, 0.016, 0.018), chromeDark, 0, 0.56 + dy, 0.225)
  );
  bp(new THREE.BoxGeometry(0.60, 0.12, 0.36), chromeDark, 0, 0.32, 0);

  // SHOULDERS
  [-1, 1].forEach(side => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 10), accentMat);
    s.position.set(side * 0.54, 1.07, 0);
    s.scale.set(1, 0.82, 0.85);
    bot.add(s);
  });

  // LEFT ARM
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.54, 1.07, 0);
  addTo(leftArm, new THREE.BoxGeometry(0.14, 0.06, 0.16),  chromeDark, -0.02, 0.05,   0.04);
  addTo(leftArm, new THREE.CylinderGeometry(0.092, 0.098, 0.48, 10), chrome, -0.01, -0.30, 0, 0, 0, -0.16);
  addTo(leftArm, new THREE.SphereGeometry(0.105, 10, 8),   accentMat,  -0.06, -0.57,  0);
  addTo(leftArm, new THREE.CylinderGeometry(0.075, 0.068, 0.44, 10), chrome, -0.08, -0.81, 0, 0, 0, -0.10);
  addTo(leftArm, new THREE.CylinderGeometry(0.082, 0.082, 0.05, 10), accentMat, -0.10, -0.89, 0, 0, 0, -0.10);
  addTo(leftArm, new THREE.BoxGeometry(0.155, 0.175, 0.115), chrome,   -0.11, -1.04,  0);
  [-1.01, -1.05, -1.09].forEach(dy =>
    addTo(leftArm, new THREE.BoxGeometry(0.155, 0.016, 0.125), chromeDark, -0.11, dy, 0)
  );
  [-0.040, 0, 0.040].forEach(dz =>
    addTo(leftArm, new THREE.BoxGeometry(0.038, 0.07, 0.028), chrome, -0.11, -1.135, dz)
  );
  bot.add(leftArm);

  // RIGHT ARM
  const rightArm = new THREE.Group();
  rightArm.position.set(0.54, 1.07, 0);
  addTo(rightArm, new THREE.BoxGeometry(0.14, 0.06, 0.16),  chromeDark,  0.02, 0.05,   0.04);
  addTo(rightArm, new THREE.CylinderGeometry(0.092, 0.098, 0.48, 10), chrome,  0.01, -0.30, 0, 0, 0, 0.16);
  addTo(rightArm, new THREE.SphereGeometry(0.105, 10, 8),   accentMat,   0.06, -0.57,  0);
  addTo(rightArm, new THREE.CylinderGeometry(0.075, 0.068, 0.44, 10), chrome,  0.08, -0.81, 0, 0, 0, 0.10);
  addTo(rightArm, new THREE.CylinderGeometry(0.082, 0.082, 0.05, 10), accentMat, 0.10, -0.89, 0, 0, 0, 0.10);
  addTo(rightArm, new THREE.BoxGeometry(0.155, 0.175, 0.115), chrome,    0.11, -1.04,  0);
  [-1.01, -1.05, -1.09].forEach(dy =>
    addTo(rightArm, new THREE.BoxGeometry(0.155, 0.016, 0.125), chromeDark, 0.11, dy, 0)
  );
  [-0.040, 0, 0.040].forEach(dz =>
    addTo(rightArm, new THREE.BoxGeometry(0.038, 0.07, 0.028), chrome, 0.11, -1.135, dz)
  );
  bot.add(rightArm);

  // PELVIS
  bp(new THREE.BoxGeometry(0.65, 0.24, 0.38), chrome,     0, 0.28, 0);
  bp(new THREE.BoxGeometry(0.65, 0.08, 0.38), chromeDark, 0, 0.20, 0);

  // HIPS
  [-1, 1].forEach(side =>
    bp(new THREE.SphereGeometry(0.125, 10, 8), accentMat, side * 0.23, 0.25, 0)
  );

  // THIGHS
  [-1, 1].forEach(side =>
    bp(new THREE.CylinderGeometry(0.115, 0.105, 0.54, 10), chrome, side * 0.23, -0.03, 0)
  );

  // KNEES
  [-1, 1].forEach(side => {
    bp(new THREE.SphereGeometry(0.112, 10, 8),     accentMat,  side * 0.23, -0.31, 0);
    bp(new THREE.BoxGeometry(0.14, 0.08, 0.04),    chromeDark, side * 0.23, -0.31, 0.125);
  });

  // SHINS
  [-1, 1].forEach(side => {
    bp(new THREE.CylinderGeometry(0.092, 0.105, 0.50, 10), chrome,    side * 0.23, -0.57, 0);
    bp(new THREE.BoxGeometry(0.12, 0.38, 0.04),             accentMat, side * 0.23, -0.56, 0.13);
  });

  // ANKLES + FEET
  [-1, 1].forEach(side => {
    bp(new THREE.SphereGeometry(0.09, 10, 8),       accentMat,  side * 0.23, -0.83, 0);
    bp(new THREE.BoxGeometry(0.20, 0.11, 0.33),     chrome,     side * 0.23, -0.86, 0.045);
    bp(new THREE.BoxGeometry(0.20, 0.03, 0.33),     chromeDark, side * 0.23, -0.92, 0.045);
  });

  bot.position.y = -0.10;
  bot.scale.setScalar(0);
  scene.add(bot);

  // --- MOUSE PARALLAX ---
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.55;
    my = (e.clientY / window.innerHeight - 0.5) * 0.38;
  }, { passive: true });

  // --- CLOCK ELEMENTS (hero only, for color sync) ---
  const clockEls = document.querySelectorAll('.h-clock [data-clock]');

  // --- ANIMATE ---
  let t = 0;
  let fc = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    fc++;

    // Ease robot in on page load
    if (fc <= 80) {
      const p = fc / 80;
      bot.scale.setScalar((1 - Math.pow(1 - p, 3)) * 0.72);
    }

    bot.rotation.y = t * 0.75 + mx * 0.5;
    bot.rotation.x = Math.sin(t * 0.2) * 0.04 + my * 0.35;
    bot.position.y = -0.10 + Math.sin(t * 1.4) * 0.07;

    headGroup.rotation.x = Math.sin(t * 0.85) * 0.13;
    headGroup.rotation.y = Math.sin(t * 0.55) * 0.20;
    headGroup.rotation.z = Math.sin(t * 1.20) * 0.04;

    const swing = Math.sin(t * 1.4) * 0.32;
    leftArm.rotation.x  =  swing;
    rightArm.rotation.x = -swing;

    const hue = (t * 0.032) % 1;
    glowMat.color.setHSL(hue, 0.88, 0.60);
    glowMat.emissive.setHSL(hue, 1.0, 0.28);
    accentLight.color.setHSL(hue, 0.9, 0.55);
    accentLight.intensity = 1.8 + Math.sin(t * 2.5) * 0.5;

    // Sync clock color with robot glow — pastel lightness
    const clockColor = `hsl(${Math.round(hue * 360)}, 55%, 62%)`;
    clockEls.forEach(el => { el.style.color = clockColor; });

    renderer.render(scene, camera);
  })();
}
