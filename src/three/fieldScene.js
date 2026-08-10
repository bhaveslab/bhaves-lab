// Shared Three.js particle-field scene for Bhavé's Lab (Home + Shop).
// Round glowing orbs, always-on ambient drift/pulse/sway, rare shooting stars,
// cursor/touch disturbance, scroll-driven camera dolly, gold wireframe polyhedron mark.

function makeOrbTexture(THREE) {
  const size = 64;
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = size;
  const ctx = cnv.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,250,240,1)');
  g.addColorStop(0.25, 'rgba(240,220,180,0.85)');
  g.addColorStop(0.55, 'rgba(201,169,106,0.35)');
  g.addColorStop(1, 'rgba(201,169,106,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cnv);
  tex.needsUpdate = true;
  return tex;
}

export async function mountField(canvas, opts) {
  opts = opts || {};
  const THREE = await import('three');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const density = opts.particleDensity || 'moderate';
  const baseCount = density === 'sparse' ? 1800 : density === 'dense' ? 5200 : 3400;
  const count = isMobile ? Math.round(baseCount * 0.4) : baseCount;
  const targetFrameMs = isMobile ? 1000 / 30 : 1000 / 60;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06060a);
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
  camera.position.set(0, 0, 40);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const positions = new Float32Array(count * 3);
  const home = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  // Independent per-particle randomness for the firefly pulses below —
  // deliberately decoupled from `phases` so pulse timing never lines up
  // with the ambient breathing sine.
  const pulseSeed = new Float32Array(count);
  const depthSpan = opts.depthSpan || 220;
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 130;
    const y = (Math.random() - 0.5) * 90;
    const z = Math.random() * -depthSpan + 60;
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    home[i * 3] = x; home[i * 3 + 1] = y; home[i * 3 + 2] = z;
    colors[i * 3] = 0.79; colors[i * 3 + 1] = 0.66; colors[i * 3 + 2] = 0.42;
    phases[i] = Math.random() * Math.PI * 2;
    pulseSeed[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const orbTex = makeOrbTexture(THREE);
  const material = new THREE.PointsMaterial({
    size: isMobile ? 1.1 : 1.0, map: orbTex, transparent: true, opacity: 0,
    vertexColors: true, sizeAttenuation: true, blending: THREE.AdditiveBlending,
    depthWrite: false, alphaTest: 0.01,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const showPolyhedronMark = opts.showPolyhedronMark !== false;
  let wire = null, lineMat = null;
  if (showPolyhedronMark) {
    const poly = new THREE.IcosahedronGeometry(11, 0);
    const edges = new THREE.EdgesGeometry(poly);
    lineMat = new THREE.LineBasicMaterial({ color: 0xd8be84, transparent: true, opacity: 0 });
    wire = new THREE.LineSegments(edges, lineMat);
    wire.position.set(0, 0, 15);
    scene.add(wire);
  }

  // Shooting stars: small pool, rare bright streaks distinct from the ambient field.
  const STAR_COUNT = 6, TRAIL_LEN = 10;
  const stars = [];
  for (let s = 0; s < STAR_COUNT; s++) {
    const spriteMat = new THREE.SpriteMaterial({ map: orbTex, color: 0xfff6e2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.6, 1.6, 1);
    const trailPos = new Float32Array(TRAIL_LEN * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0xd8be84, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const trail = new THREE.Line(trailGeo, trailMat);
    scene.add(sprite, trail);
    stars.push({ sprite, trail, trailPos, active: false, life: 0, duration: 1, start: new THREE.Vector3(), vel: new THREE.Vector3(), history: [] });
  }
  let nextStarAt = performance.now() + 2500 + Math.random() * 4000;

  function spawnStar(camZ) {
    const idle = stars.find((st) => !st.active);
    if (!idle) return;
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -80 : 80;
    const startY = (Math.random() - 0.5) * 50 + 15;
    const startZ = camZ - 30 - Math.random() * 90;
    idle.start.set(startX, startY, startZ);
    idle.vel.set((fromLeft ? 1 : -1) * (120 + Math.random() * 60), -(40 + Math.random() * 30), 0);
    idle.duration = 0.55 + Math.random() * 0.35;
    idle.life = 0;
    idle.active = true;
    idle.history = new Array(TRAIL_LEN).fill(0).map(() => idle.start.clone());
  }

  const mouse = { x: 0, y: 0 };
  const onMove = (e) => {
    const t = e.touches ? e.touches[0] : e;
    if (!t) return;
    mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  let scrollT = 0;
  const onScroll = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollT = Math.min(Math.max(window.scrollY / max, 0), 1);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  let lastFrame = 0;
  let raf = null;

  function animate(now) {
    raf = requestAnimationFrame(animate);
    if (now - lastFrame < targetFrameMs - 2) return;
    lastFrame = now;
    const t = clock.getElapsedTime();
    const fadeIn = Math.min(t / 1.4, 1);
    material.opacity = 0.75 * fadeIn;
    if (lineMat) lineMat.opacity = 0.85 * fadeIn;

    const dollyRange = opts.dollyRange != null ? opts.dollyRange : 170;
    camera.position.z = 40 - scrollT * dollyRange;
    if (wire) {
      wire.position.z = camera.position.z - 20;
      wire.rotation.y += 0.0022;
      wire.rotation.x += 0.0009;
      wire.scale.setScalar(0.4 + 0.6 * fadeIn);
    }

    // Collective sway — the field never fully stops, even at rest.
    points.rotation.z = Math.sin(t * 0.045) * 0.035;
    points.position.x = Math.sin(t * 0.026) * 2.2;
    points.position.y = Math.cos(t * 0.021) * 1.4;

    const targetX = mouse.x * 42;
    const targetY = mouse.y * 26;
    const targetZ = camera.position.z - 12;
    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const dx = pos[ix] - targetX, dy = pos[iy] - targetY, dz = pos[iz] - targetZ;
      const distSq = dx * dx + dy * dy + dz * dz;
      const radius = 22, radiusSq = radius * radius;
      if (distSq < radiusSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / radius) * 0.06;
        velocities[ix] += (dx / dist) * force;
        velocities[iy] += (dy / dist) * force;
        velocities[iz] += (dz / dist) * force;
      }
      velocities[ix] += (home[ix] - pos[ix]) * 0.012;
      velocities[iy] += (home[iy] - pos[iy]) * 0.012;
      velocities[iz] += (home[iz] - pos[iz]) * 0.012;
      velocities[ix] *= 0.9; velocities[iy] *= 0.9; velocities[iz] *= 0.9;
      // Ambient idle drift — always on, independent of interaction.
      pos[ix] += velocities[ix] + Math.sin(t * 0.12 + phases[i]) * 0.018;
      pos[iy] += velocities[iy] + Math.cos(t * 0.1 + phases[i]) * 0.018;
      pos[iz] += velocities[iz] + Math.sin(t * 0.08 + phases[i] * 1.7) * 0.01;
      // Ambient brightness pulse — a quiet breathing field.
      const b = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.5 + phases[i]));
      // Firefly pulses — each particle brightens on its own slow, private
      // clock (70–220s between pulses, ~1.5–2.5s each), so only a handful
      // are ever lit at once and none share a rhythm with each other or
      // with the ambient breathing above.
      const seed = pulseSeed[i];
      const period = 70 + seed * 150;
      const pulseDur = 1.5 + ((seed * 53) % 1) * 1.0;
      const cyclePos = (t + seed * 8191) % period;
      const pulse = cyclePos < pulseDur ? Math.sin((cyclePos / pulseDur) * Math.PI) : 0;
      const bTotal = Math.min(b + pulse * 0.85, 1.35);
      col[ix] = 0.79 * bTotal; col[iy] = 0.66 * bTotal; col[iz] = 0.42 * bTotal;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    if (!opts.noShootingStars) {
      if (now > nextStarAt) {
        spawnStar(camera.position.z);
        nextStarAt = now + 5000 + Math.random() * 3000;
      }
      for (const st of stars) {
        if (!st.active) continue;
        st.life += clock.getDelta() === 0 ? 0.016 : 0.016;
        const tt = st.life / st.duration;
        if (tt >= 1) { st.active = false; st.sprite.material.opacity = 0; st.trail.material.opacity = 0; continue; }
        const p = st.start.clone().add(st.vel.clone().multiplyScalar(tt));
        st.sprite.position.copy(p);
        st.history.unshift(p.clone());
        st.history.length = TRAIL_LEN;
        for (let h = 0; h < TRAIL_LEN; h++) {
          st.trailPos[h * 3] = st.history[h].x;
          st.trailPos[h * 3 + 1] = st.history[h].y;
          st.trailPos[h * 3 + 2] = st.history[h].z;
        }
        st.trail.geometry.attributes.position.needsUpdate = true;
        const glow = Math.sin(Math.min(tt, 1) * Math.PI);
        st.sprite.material.opacity = glow;
        st.trail.material.opacity = glow * 0.5;
      }
    }

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(animate);

  return {
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}
