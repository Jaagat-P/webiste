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

  const keyLight = new THREE.DirectionalLight(0xFFF4E8, 3.5);
  keyLight.position.set(4, 6, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xCC5A33, 1.6);
  rimLight.position.set(-5, 1, -5);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(0xFFA866, 2.2, 14);
  accentLight.position.set(0, -1.5, 3);
  scene.add(accentLight);

  const fillLight = new THREE.DirectionalLight(0xFFEEDD, 0.8);
  fillLight.position.set(0, -4, 3);
  scene.add(fillLight);

  // --- MATERIALS ---
  const chrome     = new THREE.MeshPhongMaterial({ color: 0xC2AE98, specular: 0xE0CFB8, shininess: 130 });
  const chromeDark = new THREE.MeshPhongMaterial({ color: 0x806A56, specular: 0xB59A7C, shininess: 100 });
  const accentMat  = new THREE.MeshPhongMaterial({ color: 0x7B9FD4, specular: 0xC0D4F0, shininess: 200, emissive: 0x1E2C46 });
  const glowMat    = new THREE.MeshStandardMaterial({ color: 0xE0905C, emissive: 0xCC6633, emissiveIntensity: 3.5, roughness: 0.9 });
  const visorMat   = new THREE.MeshPhongMaterial({ color: 0x120C08, specular: 0xAA6644, shininess: 500, transparent: true, opacity: 0.92 });



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
  const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xEEF4FF, specular: 0xFFFFFF, shininess: 320 });
  const eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x040810, specular: 0x1122AA, shininess: 200 });
  [[-0.12, 0.27], [0.12, 0.27]].forEach(([ex, ey]) => {
    addTo(headGroup, new THREE.SphereGeometry(0.040, 14, 12), eyeWhiteMat, ex, ey,  0.232);
    addTo(headGroup, new THREE.SphereGeometry(0.024, 12, 10), glowMat,     ex, ey,  0.248);
    addTo(headGroup, new THREE.SphereGeometry(0.012,  8,  6), eyePupilMat, ex, ey,  0.256);
  });
  addTo(headGroup, new THREE.CylinderGeometry(0.012, 0.020, 0.16, 6), accentMat, 0.18, 0.51, 0);
  addTo(headGroup, new THREE.SphereGeometry(0.024, 6, 6),    glowMat,    0.18,   0.60,  0);
  // Smile — half-torus arc on front face, flipped to U-shape
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.080, 0.010, 8, 20, Math.PI), glowMat);
  smile.position.set(0, 0.12, 0.241);
  smile.rotation.z = Math.PI;
  headGroup.add(smile);
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

  // LEGS — grouped at hip pivot so they can rotate interactively
  const leftLeg  = new THREE.Group();
  const rightLeg = new THREE.Group();
  leftLeg.position.set(-0.23, 0.25, 0);
  rightLeg.position.set( 0.23, 0.25, 0);

  [leftLeg, rightLeg].forEach(leg => {
    addTo(leg, new THREE.SphereGeometry(0.125, 10, 8),               accentMat,  0,  0,      0);
    addTo(leg, new THREE.CylinderGeometry(0.115, 0.105, 0.54, 10),   chrome,     0, -0.28,   0);
    addTo(leg, new THREE.SphereGeometry(0.112, 10, 8),               accentMat,  0, -0.56,   0);
    addTo(leg, new THREE.BoxGeometry(0.14, 0.08, 0.04),              chromeDark, 0, -0.56,   0.125);
    addTo(leg, new THREE.CylinderGeometry(0.092, 0.105, 0.50, 10),   chrome,     0, -0.82,   0);
    addTo(leg, new THREE.BoxGeometry(0.12, 0.38, 0.04),              accentMat,  0, -0.81,   0.13);
    addTo(leg, new THREE.SphereGeometry(0.09, 10, 8),                accentMat,  0, -1.08,   0);
    addTo(leg, new THREE.BoxGeometry(0.20, 0.11, 0.33),              chrome,     0, -1.11,   0.045);
    addTo(leg, new THREE.BoxGeometry(0.20, 0.03, 0.33),              chromeDark, 0, -1.17,   0.045);
    bot.add(leg);
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

  // --- CANVAS INTERACTION (arm + leg control) ---
  const raycaster = new THREE.Raycaster();
  const mouse2D   = new THREE.Vector2();

  // Pre-collect arm meshes for raycasting
  const leftArmMeshes = [], rightArmMeshes = [];
  leftArm.traverse(o  => { if (o.isMesh) leftArmMeshes.push(o); });
  rightArm.traverse(o => { if (o.isMesh) rightArmMeshes.push(o); });

  let iX = 0, iY = 0, hovering = false, hoveredArm = null;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    iX = (e.clientX - r.left) / r.width  * 2 - 1;
    iY = (e.clientY - r.top)  / r.height * 2 - 1;
    mouse2D.set(iX, -iY);
    hovering = true;
  });
  canvas.addEventListener('mouseleave', () => { hovering = false; hoveredArm = null; });
  canvas.style.cursor = 'crosshair';

  // Separate lerp vars per arm
  let armLZ = 0, armLX = 0, armRZ = 0, armRX = 0, legL = 0, legR = 0;

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

    const swing    = Math.sin(t * 1.4) * 0.32;       // arm fore/aft idle
    const legSwing = Math.sin(t * 1.4) * 0.22;        // leg gait, paired with arms
    const armSway  = Math.sin(t * 0.9) * 0.12;        // gentle lateral arm sway

    // Raycast to detect which arm is hovered
    if (hovering) {
      raycaster.setFromCamera(mouse2D, camera);
      const hitL = raycaster.intersectObjects(leftArmMeshes).length  > 0;
      const hitR = raycaster.intersectObjects(rightArmMeshes).length > 0;
      hoveredArm = hitL ? 'left' : hitR ? 'right' : null;
      canvas.style.cursor = hoveredArm ? 'grab' : 'crosshair';
    }

    // Left arm: mouse-controlled when hovered, else idle swing
    if (hoveredArm === 'left') {
      armLZ += (-iY * 2.4 - armLZ) * 0.14;
      armLX += ( iX * 1.0 - armLX) * 0.14;
    } else {
      armLZ += (armSway - armLZ) * 0.04;
      armLX += (swing   - armLX) * 0.06;
    }

    // Right arm: mouse-controlled when hovered, else idle swing
    if (hoveredArm === 'right') {
      armRZ += (-iY * 2.4 - armRZ) * 0.14;
      armRX += (-iX * 1.0 - armRX) * 0.14;
    } else {
      armRZ += (armSway - armRZ) * 0.04;
      armRX += (-swing  - armRX) * 0.06;
    }

    leftArm.rotation.x  =  armLX;
    leftArm.rotation.z  = -armLZ;
    rightArm.rotation.x =  armRX;
    rightArm.rotation.z =  armRZ;

    // Legs: hover to control (left half = left leg, right half = right leg),
    // otherwise an autonomous gait counter-phased to the same-side arm.
    legL += ((hovering && iX < 0 ? -iY * 2.0 : -legSwing) - legL) * (hovering && iX < 0 ? 0.14 : 0.05);
    legR += ((hovering && iX > 0 ? -iY * 2.0 :  legSwing) - legR) * (hovering && iX > 0 ? 0.14 : 0.05);
    leftLeg.rotation.x  = legL;
    rightLeg.rotation.x = legR;

    const hue = (t * 0.032) % 1;
    const rh = 0.03 + hue * 0.07; // terracotta → amber, matches warm clay palette
    glowMat.color.setHSL(rh, 0.68, 0.62);
    glowMat.emissive.setHSL(rh, 0.72, 0.40);
    accentLight.color.setHSL(rh, 0.70, 0.62);
    accentLight.intensity = 1.8 + Math.sin(t * 2.5) * 0.5;

    renderer.render(scene, camera);
  })();
}
