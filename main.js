import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/* ============================================
   🎂 BIRTHDAY PAGE — MAIN SCRIPT
   ============================================ */

// ---- Constants ----
const BIRTHDAY_MESSAGE = `On this beautiful day, 17 years ago, the world became a brighter place because you were born! 🌟\n\nYou bring so much joy, laughter, and love into everyone's life. Your kindness, your smile, and your amazing spirit make every day better.\n\nHere's to an incredible year of new adventures, big dreams, and endless happiness. You deserve all the wonderful things this world has to offer! 🎀\n\nHappy 17th Birthday, loo! 🥳💖`;

const REASONS = [
  { emoji: '💖', text: 'Your smile lights up every room' },
  { emoji: '🌟', text: 'You always know how to cheer people up' },
  { emoji: '🦋', text: 'You\'re beautiful inside and out' },
  { emoji: '🎨', text: 'Your creativity is inspiring' },
  { emoji: '🌻', text: 'You see the good in everyone' },
  { emoji: '✨', text: 'You make everything more fun' },
  { emoji: '🎀', text: 'Your kindness knows no bounds' },
  { emoji: '🌈', text: 'You bring color to gray days' },
  { emoji: '💫', text: 'You\'re stronger than you know' },
  { emoji: '🦄', text: 'You\'re one of a kind' },
  { emoji: '🌸', text: 'You bloom wherever you\'re planted' },
  { emoji: '🎵', text: 'Your laughter is the best melody' },
  { emoji: '🍰', text: 'Life is sweeter with you in it' },
  { emoji: '💝', text: 'You have the biggest heart' },
  { emoji: '🌙', text: 'You shine even in the dark' },
  { emoji: '🎪', text: 'Every moment with you is an adventure' },
  { emoji: '👑', text: 'You\'re a queen, never forget that!' },
];

const FLOATING_ITEMS = ['💖', '🌸', '✨', '🎀', '🦋', '💜', '⭐', '🌟', '🎂', '🎈', '💫', '🌺', '🧁', '🎉'];

// ---- DOM Elements ----
const preloader = document.getElementById('preloader');
const giftBox = document.getElementById('giftBox');
const birthdayPage = document.getElementById('birthdayPage');
const musicToggle = document.getElementById('musicToggle');
const confettiCanvas = document.getElementById('confettiCanvas');
const cakeCanvas = document.getElementById('cakeCanvas');
const typewriterText = document.getElementById('typewriterText');
const reasonsGrid = document.getElementById('reasonsGrid');
const floatingElements = document.getElementById('floatingElements');
const blowCandlesBtn = document.getElementById('blowCandlesBtn');

// ---- State ----
let musicPlaying = false;
let audioContext = null;
let musicGainNode = null;
let birthdayMusicBufferSource = null;
let candlesBlown = false;

// ============================================
// 🎁 PRELOADER / GIFT BOX
// ============================================

giftBox.addEventListener('click', openGift);
document.querySelector('.tap-text').addEventListener('click', openGift);

function openGift() {
  giftBox.classList.add('opened');

  // Burst of sparkles from gift
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSparkle(
      window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      window.innerHeight / 2 + (Math.random() - 0.5) * 100
    ), i * 30);
  }

  setTimeout(() => {
    preloader.classList.add('fade-out');
    birthdayPage.classList.remove('hidden');
    initPage();
    // Auto-start music — safe inside a click handler
    startMusicAutoPlay();
  }, 800);

  setTimeout(() => {
    preloader.style.display = 'none';
  }, 1600);
}

// ============================================
// 🎉 PAGE INITIALIZATION
// ============================================

function initPage() {
  initFloatingElements();
  initParticles();   // richer multi-shape particle engine
  initShootingStars();
  init3DCake();
  initTypewriter();
  initReasons();
  initMouseSparkles();
  initClickBurst();
}

// ============================================
// ✨ FLOATING ELEMENTS
// ============================================

function initFloatingElements() {
  for (let i = 0; i < 25; i++) {
    const el = document.createElement('div');
    el.className = 'floating-item';
    el.textContent = FLOATING_ITEMS[Math.floor(Math.random() * FLOATING_ITEMS.length)];
    el.style.setProperty('--left', Math.random() * 100 + '%');
    el.style.setProperty('--delay', Math.random() * 10 + 's');
    el.style.setProperty('--duration', 6 + Math.random() * 8 + 's');
    el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    floatingElements.appendChild(el);
  }
}

// ============================================
// 🎊 RICH PARTICLE ENGINE  (hearts · stars · circles · diamonds)
// ============================================

function initParticles() {
  const ctx = confettiCanvas.getContext('2d');
  let particles = [];
  const COLORS = ['#ff6ba8','#c084fc','#67e8f9','#fbbf24','#ff9ecb','#a855f7','#34d399','#fb7185','#f472b6','#818cf8'];
  const SHAPES = ['heart','star','circle','diamond','rect'];

  function resize() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function mkParticle(burst, ox, oy) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const size  = shape === 'heart' ? 10 + Math.random() * 10
                : shape === 'star'  ?  6 + Math.random() * 8
                :                       5 + Math.random() * 9;
    return {
      x:        ox ?? (burst ? window.innerWidth / 2 + (Math.random()-0.5)*500 : Math.random()*window.innerWidth),
      y:        oy ?? (burst ? window.innerHeight * 0.35 : -14),
      shape,
      size,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:       burst ? (Math.random()-0.5)*10 : (Math.random()-0.5)*2.5,
      vy:       burst ? -(Math.random()*7+3)   : Math.random()*1.8+0.4,
      rot:      Math.random()*Math.PI*2,
      rotSpd:   (Math.random()-0.5)*0.25,
      grav:     0.04 + Math.random()*0.04,
      drag:     0.988,
      life:     1,
      fade:     0.004 + Math.random()*0.003,
    };
  }

  // heart path helper
  function drawHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.65, x, y + s * 0.9, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.9, x + s * 0.5, y + s * 0.65, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.closePath();
  }

  // 5-point star helper
  function drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a   = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      i === 0 ? ctx.moveTo(cx + rad*Math.cos(a), cy + rad*Math.sin(a))
               : ctx.lineTo(cx + rad*Math.cos(a), cy + rad*Math.sin(a));
    }
    ctx.closePath();
  }

  function drawDiamond(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s*0.6, cy);
    ctx.lineTo(cx, cy + s);
    ctx.lineTo(cx - s*0.6, cy);
    ctx.closePath();
  }

  function drawParticle(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    if (p.shape === 'heart') {
      drawHeart(ctx, -p.size/2, -p.size/2, p.size);
    } else if (p.shape === 'star') {
      drawStar(ctx, 0, 0, p.size);
    } else if (p.shape === 'diamond') {
      drawDiamond(ctx, 0, 0, p.size);
    } else if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size/2, 0, Math.PI*2);
    } else {
      ctx.beginPath();
      ctx.rect(-p.size/2, -p.size*0.4, p.size, p.size*0.8);
    }
    ctx.fill();
    ctx.restore();
  }

  // Initial opening burst
  for (let i = 0; i < 160; i++) particles.push(mkParticle(true));

  // Gentle continuous shower
  setInterval(() => {
    if (particles.length < 120) particles.push(mkParticle(false));
  }, 180);

  // expose burst function for click handler
  window._burstParticles = (ox, oy, count = 40) => {
    for (let i = 0; i < count; i++) particles.push(mkParticle(true, ox, oy));
  };

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      p.vy  += p.grav;
      p.vx  *= p.drag;
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotSpd;
      if (p.y > confettiCanvas.height + 20) p.life = 0;
      else p.life -= p.fade;
      if (p.life > 0) drawParticle(ctx, p);
    });
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(animate);
  }
  animate();
}

// ============================================
// 🌠 SHOOTING STARS
// ============================================

function initShootingStars() {
  const canvas = document.createElement('canvas');
  canvas.id = 'shootingStarsCanvas';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '1',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  const STAR_COLORS = ['#ff9ecb','#c084fc','#67e8f9','#fbbf24','#ffffff','#f472b6'];

  function mkStar() {
    const angle = (20 + Math.random() * 25) * Math.PI / 180;
    const speed = 6 + Math.random() * 8;
    return {
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height * 0.5,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      len:   60 + Math.random() * 80,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      life:  1,
      fade:  0.016 + Math.random() * 0.012,
    };
  }

  // Spawn shooting star every 1.8s
  setInterval(() => { if (stars.length < 8) stars.push(mkStar()); }, 1800);
  stars.push(mkStar()); // immediate first one

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx*(s.len/6), s.y - s.vy*(s.len/6));
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx*(s.len/6), s.y - s.vy*(s.len/6));
      ctx.stroke();
      // small circle head
      ctx.fillStyle   = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      s.x    += s.vx;
      s.y    += s.vy;
      s.life -= s.fade;
    });
    // Filter alive stars without the self-clearing bug
    const alive = stars.filter(s => s.life > 0 && s.x < canvas.width + 100 && s.y < canvas.height + 100);
    stars.length = 0;
    stars.push(...alive);
    requestAnimationFrame(animate);
  })();
}

// ============================================
// 🎂 3D CAKE (THREE.JS)
// ============================================

function init3DCake() {
  const section = document.getElementById('cakeSection');
  const width = section.clientWidth;
  const height = section.clientHeight;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 3, 7);
  camera.lookAt(0, 1.5, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: cakeCanvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfff0f6, 0.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(3, 6, 4);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const pinkLight = new THREE.PointLight(0xff69b4, 0.6, 15);
  pinkLight.position.set(-3, 4, 2);
  scene.add(pinkLight);

  const purpleLight = new THREE.PointLight(0xc084fc, 0.4, 15);
  purpleLight.position.set(3, 3, -2);
  scene.add(purpleLight);

  // === Build the cake ===
  const cakeGroup = new THREE.Group();

  // Cake plate
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xfff8f0, metalness: 0.1, roughness: 0.3 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.15, 64), plateMat);
  plate.position.y = 0;
  plate.receiveShadow = true;
  cakeGroup.add(plate);

  // Bottom tier
  const tier1Mat = new THREE.MeshStandardMaterial({ color: 0xff9ecb, roughness: 0.4, metalness: 0.05 });
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1.2, 64), tier1Mat);
  tier1.position.y = 0.7;
  tier1.castShadow = true;
  cakeGroup.add(tier1);

  // Frosting ring bottom
  const frostMat1 = new THREE.MeshStandardMaterial({ color: 0xfff0f6, roughness: 0.5, metalness: 0 });
  const frost1 = new THREE.Mesh(new THREE.TorusGeometry(2, 0.15, 16, 64), frostMat1);
  frost1.position.y = 1.3;
  frost1.rotation.x = Math.PI / 2;
  cakeGroup.add(frost1);

  // Middle tier
  const tier2Mat = new THREE.MeshStandardMaterial({ color: 0xdbb4fe, roughness: 0.4, metalness: 0.05 });
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1, 64), tier2Mat);
  tier2.position.y = 1.8;
  tier2.castShadow = true;
  cakeGroup.add(tier2);

  // Frosting ring middle
  const frost2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 16, 64), frostMat1);
  frost2.position.y = 2.3;
  frost2.rotation.x = Math.PI / 2;
  cakeGroup.add(frost2);

  // Top tier
  const tier3Mat = new THREE.MeshStandardMaterial({ color: 0xff6ba8, roughness: 0.4, metalness: 0.05 });
  const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.8, 64), tier3Mat);
  tier3.position.y = 2.7;
  tier3.castShadow = true;
  cakeGroup.add(tier3);

  // Frosting drips (decorative spheres along cake sides)
  const dripMat = new THREE.MeshStandardMaterial({ color: 0xfff0f6, roughness: 0.3, metalness: 0 });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), dripMat);
    drip.position.set(Math.cos(angle) * 2, 1.3 + Math.sin(i * 2) * 0.1, Math.sin(angle) * 2);
    cakeGroup.add(drip);
  }

  // Small candy dots on middle tier
  const candyColors = [0xff6ba8, 0xfbbf24, 0x67e8f9, 0xc084fc, 0x34d399];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const candy = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: candyColors[i % candyColors.length], roughness: 0.3 })
    );
    candy.position.set(Math.cos(angle) * 1.52, 1.8, Math.sin(angle) * 1.52);
    cakeGroup.add(candy);
  }

  // Candles
  const candlePositions = [];
  for (let i = 0; i < 17; i++) {
    const angle = (i / 17) * Math.PI * 2;
    const radius = i < 7 ? 0.65 : (i < 14 ? 1.3 : 0);
    const baseY = i < 7 ? 3.1 : (i < 14 ? 2.3 : 3.1);
    const x = radius === 0 ? 0 : Math.cos(angle) * radius;
    const z = radius === 0 ? 0 : Math.sin(angle) * radius;

    // Candle stick
    const candleColor = candyColors[i % candyColors.length];
    const candleMat = new THREE.MeshStandardMaterial({ color: candleColor, roughness: 0.3 });
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16), candleMat);
    candle.position.set(x, baseY + 0.2, z);
    cakeGroup.add(candle);

    // Flame
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      emissive: 0xff6600,
      emissiveIntensity: 2,
      roughness: 0.2,
    });
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), flameMat);
    flame.scale.set(1, 1.8, 1);
    flame.position.set(x, baseY + 0.48, z);
    cakeGroup.add(flame);

    // Flame glow
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffdd44,
      emissive: 0xffaa00,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), glowMat);
    glow.position.set(x, baseY + 0.48, z);
    cakeGroup.add(glow);

    candlePositions.push({ flame, glow, baseY: baseY + 0.48 });
  }

  // "17" topper — loaded via FontLoader for real readable numbers
  const topperMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.4,
  });

  const fontLoader = new FontLoader();
  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
      const textGeo = new TextGeometry('17', {
        font,
        size: 0.55,
        depth: 0.18,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5,
      });
      textGeo.computeBoundingBox();
      const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
      const textMesh = new THREE.Mesh(textGeo, topperMat);
      // Centre it above top tier
      textMesh.position.set(-textWidth / 2, 3.25, 0);
      cakeGroup.add(textMesh);
    }
  );

  // Heart decoration on top
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(0, -0.15, -0.25, -0.3, -0.25, -0.1);
  heartShape.bezierCurveTo(-0.25, 0.1, 0, 0.2, 0, 0.35);
  heartShape.bezierCurveTo(0, 0.2, 0.25, 0.1, 0.25, -0.1);
  heartShape.bezierCurveTo(0.25, -0.3, 0, -0.15, 0, 0);

  const heartGeom = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  const heartMat = new THREE.MeshStandardMaterial({
    color: 0xff3d8b,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0xff3d8b,
    emissiveIntensity: 0.2,
  });

  // Add small hearts around top tier
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const heart = new THREE.Mesh(heartGeom, heartMat);
    heart.scale.set(0.3, 0.3, 0.3);
    heart.position.set(Math.cos(angle) * 1.05, 2.85, Math.sin(angle) * 1.05);
    heart.rotation.z = Math.PI;
    heart.rotation.y = -angle + Math.PI / 2;
    cakeGroup.add(heart);
  }

  scene.add(cakeGroup);

  // Star particles around cake
  const starParticles = [];
  const starGeo = new THREE.BufferGeometry();
  const starPositions = [];
  const starSizes = [];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.5 + Math.random() * 2;
    starPositions.push(Math.cos(angle) * radius, Math.random() * 5, Math.sin(angle) * radius);
    starSizes.push(Math.random() * 3 + 1);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

  const starMat = new THREE.PointsMaterial({
    color: 0xfbbf24,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Animate
  const clock = new THREE.Clock();

  // Show button after a delay
  setTimeout(() => {
    if (blowCandlesBtn) blowCandlesBtn.classList.remove('hidden');
  }, 4000);

  if (blowCandlesBtn) {
    blowCandlesBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        blowCandlesBtn.textContent = 'Keep blowing... 🌬️';
        blowCandlesBtn.style.animation = 'pulseButton 0.5s infinite';
        
        function checkBlow() {
          if (candlesBlown) return;
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for(let i = 0; i < 20; i++) {
            sum += dataArray[i];
          }
          let average = sum / 20;
          
          if (average > 150) { // Threshold for blow detection
            candlesBlown = true;
            blowCandlesBtn.classList.add('hidden');
            document.querySelector('.cake-glow').style.opacity = '0.2';
            stream.getTracks().forEach(track => track.stop());
            
            if (window._burstParticles) {
              window._burstParticles(window.innerWidth / 2, window.innerHeight / 2, 250);
            }
            for (let i = 0; i < 30; i++) {
              setTimeout(() => createDOMParticle(window.innerWidth / 2 + (Math.random()-0.5)*300, window.innerHeight / 2 + (Math.random()-0.5)*300), i * 30);
            }
          } else {
            requestAnimationFrame(checkBlow);
          }
        }
        
        checkBlow();
      } catch (err) {
        // Fallback if no mic
        candlesBlown = true;
        blowCandlesBtn.classList.add('hidden');
        document.querySelector('.cake-glow').style.opacity = '0.2';
        
        if (window._burstParticles) {
          window._burstParticles(window.innerWidth / 2, window.innerHeight / 2, 250);
        }
        for (let i = 0; i < 30; i++) {
          setTimeout(() => createDOMParticle(window.innerWidth / 2 + (Math.random()-0.5)*300, window.innerHeight / 2 + (Math.random()-0.5)*300), i * 30);
        }
      }
    });
  }

  function animateCake() {
    requestAnimationFrame(animateCake);
    const t = clock.getElapsedTime();

    // Slow rotation
    cakeGroup.rotation.y = t * 0.3;

    // Flame flicker
    candlePositions.forEach((c, i) => {
      if (candlesBlown) {
        c.flame.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        c.glow.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        c.glow.material.opacity = Math.max(0, c.glow.material.opacity - 0.05);
      } else {
        const flicker = Math.sin(t * 8 + i * 2) * 0.03 + Math.sin(t * 12 + i * 3) * 0.02;
        c.flame.position.y = c.baseY + flicker;
        c.flame.scale.x = 1 + Math.sin(t * 10 + i) * 0.2;
        c.flame.scale.z = 1 + Math.cos(t * 10 + i) * 0.2;
        c.glow.scale.setScalar(1 + Math.sin(t * 6 + i) * 0.3);
        c.glow.material.opacity = 0.2 + Math.sin(t * 8 + i) * 0.1;
      }
    });

    // Star rotation
    stars.rotation.y = t * 0.1;

    // Gentle camera bob
    camera.position.y = 3 + Math.sin(t * 0.5) * 0.15;

    renderer.render(scene, camera);
  }

  animateCake();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = section.clientWidth;
    const h = section.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// ============================================
// ✍️ TYPEWRITER EFFECT
// ============================================

function initTypewriter() {
  let index = 0;
  const speed = 35;
  const cursor = document.createElement('span');
  cursor.className = 'cursor';

  function type() {
    if (index < BIRTHDAY_MESSAGE.length) {
      const char = BIRTHDAY_MESSAGE[index];
      if (char === '\n') {
        typewriterText.appendChild(document.createElement('br'));
      } else {
        typewriterText.appendChild(document.createTextNode(char));
      }
      typewriterText.appendChild(cursor);
      index++;
      setTimeout(type, char === '\n' ? speed * 3 : speed);
    } else {
      cursor.remove();
      document.querySelector('.signature').classList.add('visible');
    }
  }

  // Start after a brief delay for effect
  setTimeout(type, 1500);
}

// ============================================
// ⭐ REASONS GRID
// ============================================

function initReasons() {
  REASONS.forEach((reason, i) => {
    const card = document.createElement('div');
    card.className = 'reason-card';
    card.style.setProperty('--delay', `${i * 0.1}s`);
    card.innerHTML = `
      <span class="reason-emoji">${reason.emoji}</span>
      <span class="reason-text">${reason.text}</span>
    `;
    reasonsGrid.appendChild(card);
  });
}

// ============================================
// ✨ MOUSE SPARKLES
// ============================================

function initMouseSparkles() {
  let lastSparkle = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle > 60) {
      createSparkle(e.clientX, e.clientY);
      // randomly also spawn a tiny heart or star DOM element
      if (Math.random() < 0.3) createDOMParticle(e.clientX, e.clientY);
      lastSparkle = now;
    }
  });
}

function createSparkle(x, y) {
  const sparkle = document.createElement('div');
  sparkle.className = 'magic-dust';
  sparkle.style.left = x + 'px';
  sparkle.style.top  = y + 'px';
  sparkle.style.setProperty('--tx', (Math.random()-0.5)*120+'px');
  sparkle.style.setProperty('--ty', -(Math.random()*80+20)+'px');
  sparkle.style.background = ['#ff69b4','#fbbf24','#c084fc','#67e8f9','#ff6ba8','#818cf8'][Math.floor(Math.random()*6)];
  const sz = 4 + Math.random()*8;
  sparkle.style.width  = sz+'px';
  sparkle.style.height = sz+'px';
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 1000);
}

function createDOMParticle(x, y) {
  const items = ['💖','✨','🌸','⭐','💫','🦋','🌺','💜','🎀'];
  const el = document.createElement('div');
  el.textContent = items[Math.floor(Math.random()*items.length)];
  Object.assign(el.style, {
    position: 'fixed', left: x+'px', top: y+'px',
    fontSize: (0.8+Math.random()*0.8)+'rem',
    pointerEvents: 'none', zIndex: '200',
    animation: 'domParticleFloat 1.2s ease-out forwards',
    '--tx': (Math.random()-0.5)*60+'px',
    '--ty': -(30+Math.random()*50)+'px',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ============================================
// 💥 CLICK BURST ANYWHERE
// ============================================

function initClickBurst() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#preloader') || e.target.closest('.music-btn')) return;
    // canvas burst
    if (window._burstParticles) window._burstParticles(e.clientX, e.clientY, 28);
    // DOM emoji burst
    for (let i = 0; i < 6; i++) {
      setTimeout(() => createDOMParticle(e.clientX, e.clientY), i * 40);
    }
  });
}

// ============================================
// 🎵 BIRTHDAY MUSIC (Web Audio API — generated)
// ============================================

musicToggle.addEventListener('click', toggleMusic);

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    musicGainNode = audioContext.createGain();
    musicGainNode.gain.value = 0.28;
    musicGainNode.connect(audioContext.destination);
  }
}

function toggleMusic() {
  ensureAudioContext();
  if (musicPlaying) {
    stopMusic();
  } else {
    playBirthdayMusic();
  }
}

// Called from openGift — user click satisfies browser autoplay policy
function startMusicAutoPlay() {
  ensureAudioContext();
  if (!musicPlaying) playBirthdayMusic();
}

function playBirthdayMusic() {
  musicPlaying = true;
  musicToggle.classList.add('playing');
  musicToggle.querySelector('.music-label').textContent = 'On';

  // "Happy Birthday" melody notes (frequencies in Hz)
  const melody = [
    // Happy Birthday to you
    { note: 262, dur: 0.3 }, { note: 262, dur: 0.15 }, { note: 294, dur: 0.5 },
    { note: 262, dur: 0.5 }, { note: 349, dur: 0.5 }, { note: 330, dur: 0.9 },
    // Happy Birthday to you
    { note: 262, dur: 0.3 }, { note: 262, dur: 0.15 }, { note: 294, dur: 0.5 },
    { note: 262, dur: 0.5 }, { note: 392, dur: 0.5 }, { note: 349, dur: 0.9 },
    // Happy Birthday dear...
    { note: 262, dur: 0.3 }, { note: 262, dur: 0.15 }, { note: 523, dur: 0.5 },
    { note: 440, dur: 0.5 }, { note: 349, dur: 0.5 }, { note: 330, dur: 0.5 }, { note: 294, dur: 0.9 },
    // Happy Birthday to you
    { note: 466, dur: 0.3 }, { note: 466, dur: 0.15 }, { note: 440, dur: 0.5 },
    { note: 349, dur: 0.5 }, { note: 392, dur: 0.5 }, { note: 349, dur: 0.9 },
  ];

  function playMelody() {
    if (!musicPlaying) return;

    let time = audioContext.currentTime;
    const gap = 0.05;

    melody.forEach((n) => {
      // Main oscillator (soft sine wave)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = n.note;
      gain1.gain.setValueAtTime(0, time);
      gain1.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gain1.gain.linearRampToValueAtTime(0.12, time + n.dur * 0.7);
      gain1.gain.linearRampToValueAtTime(0, time + n.dur);
      osc1.connect(gain1);
      gain1.connect(musicGainNode);
      osc1.start(time);
      osc1.stop(time + n.dur);

      // Harmonic (octave up, quiet — for sparkle)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = n.note * 2;
      gain2.gain.setValueAtTime(0, time);
      gain2.gain.linearRampToValueAtTime(0.03, time + 0.05);
      gain2.gain.linearRampToValueAtTime(0, time + n.dur);
      osc2.connect(gain2);
      gain2.connect(musicGainNode);
      osc2.start(time);
      osc2.stop(time + n.dur);

      time += n.dur + gap;
    });

    // Loop melody
    const totalDuration = melody.reduce((sum, n) => sum + n.dur + gap, 0);
    if (musicPlaying) {
      setTimeout(playMelody, totalDuration * 1000 + 500);
    }
  }

  playMelody();
}

function stopMusic() {
  musicPlaying = false;
  musicToggle.classList.remove('playing');
  musicToggle.querySelector('.music-label').textContent = 'Music';
}
