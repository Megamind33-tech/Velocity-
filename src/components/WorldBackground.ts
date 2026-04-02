// Dynamic animated world backgrounds for each of the 5 game worlds.
// Each world has a unique multi-layer parallax background with animated elements.

export interface BgCloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  opacity: number;
  type: number; // cloud shape variant
}

export interface BgMountain {
  points: number[];
  color: string;
  speed: number;
  offsetX: number;
}

export interface BgBuilding {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number; lit: boolean }[];
  speed: number;
}

export interface BgSnowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
}

export interface BgStar {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
  twinklePhase: number;
}

export interface BgPlanet {
  x: number;
  y: number;
  radius: number;
  color1: string;
  color2: string;
  ringColor?: string;
  speed: number;
}

export interface BgShootingStar {
  x: number;
  y: number;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
  length: number;
}

export interface BgBird {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  size: number;
}

export interface BgAurora {
  points: number[];
  color: string;
  speed: number;
  amplitude: number;
  yBase: number;
  phase: number;
}

export interface BgTree {
  x: number;
  h: number;
  speed: number;
}

export interface WorldBgState {
  worldId: number;
  clouds: BgCloud[];
  mountains: BgMountain[];
  buildings: BgBuilding[];
  snowflakes: BgSnowflake[];
  stars: BgStar[];
  planets: BgPlanet[];
  shootingStars: BgShootingStar[];
  birds: BgBird[];
  auroras: BgAurora[];
  trees: BgTree[];
  timeOffset: number;
}

let seeded = 42;
function srand(): number {
  seeded = (seeded * 1103515245 + 12345) & 0x7fffffff;
  return (seeded % 10000) / 10000;
}

function generateClouds(w: number, h: number, count: number, minY: number, maxY: number): BgCloud[] {
  const clouds: BgCloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: srand() * w * 1.5,
      y: minY + srand() * (maxY - minY),
      w: 80 + srand() * 160,
      h: 30 + srand() * 50,
      speed: 0.15 + srand() * 0.4,
      opacity: 0.3 + srand() * 0.5,
      type: Math.floor(srand() * 3),
    });
  }
  return clouds;
}

function generateMountains(w: number, layers: number, colors: string[]): BgMountain[] {
  const mts: BgMountain[] = [];
  for (let l = 0; l < layers; l++) {
    const pts: number[] = [];
    const segCount = 12 + l * 4;
    for (let i = 0; i <= segCount; i++) {
      const baseH = 0.3 + l * 0.12;
      pts.push(baseH + srand() * 0.2 - 0.1 + Math.sin(i * 0.8) * 0.05);
    }
    mts.push({
      points: pts,
      color: colors[l % colors.length],
      speed: 0.05 + l * 0.08,
      offsetX: 0,
    });
  }
  return mts;
}

function generateBuildings(w: number, _h: number, count: number): BgBuilding[] {
  const blds: BgBuilding[] = [];
  for (let i = 0; i < count; i++) {
    const bw = 20 + srand() * 50;
    const bh = 60 + srand() * 180;
    const windows: { x: number; y: number; lit: boolean }[] = [];
    const cols = Math.floor(bw / 12);
    const rows = Math.floor(bh / 16);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        windows.push({ x: c * 12 + 4, y: r * 16 + 8, lit: srand() > 0.4 });
      }
    }
    blds.push({
      x: i * (w / count) + srand() * 30,
      w: bw,
      h: bh,
      windows,
      speed: 0.3,
    });
  }
  return blds;
}

function generateStars(w: number, h: number, count: number): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: srand() * w,
      y: srand() * h * 0.85,
      size: srand() * 2 + 0.3,
      brightness: srand() * 0.6 + 0.3,
      speed: srand() * 0.15 + 0.02,
      twinklePhase: srand() * Math.PI * 2,
    });
  }
  return stars;
}

function generateSnowflakes(w: number, h: number, count: number): BgSnowflake[] {
  const flakes: BgSnowflake[] = [];
  for (let i = 0; i < count; i++) {
    flakes.push({
      x: srand() * w,
      y: srand() * h,
      size: srand() * 3 + 1,
      speed: srand() * 1.2 + 0.3,
      drift: srand() * 0.5 - 0.25,
      phase: srand() * Math.PI * 2,
    });
  }
  return flakes;
}

function generateBirds(w: number, h: number, count: number): BgBird[] {
  const birds: BgBird[] = [];
  for (let i = 0; i < count; i++) {
    birds.push({
      x: srand() * w * 1.5,
      y: 40 + srand() * (h * 0.3),
      speed: 0.5 + srand() * 1.0,
      wingPhase: srand() * Math.PI * 2,
      size: 3 + srand() * 5,
    });
  }
  return birds;
}

function generateAuroras(w: number, h: number): BgAurora[] {
  const auroras: BgAurora[] = [];
  const colors = [
    'rgba(0,255,128,0.12)',
    'rgba(100,0,255,0.08)',
    'rgba(0,200,100,0.10)',
    'rgba(50,100,255,0.06)',
  ];
  for (let i = 0; i < 4; i++) {
    const pts: number[] = [];
    for (let j = 0; j <= 20; j++) {
      pts.push(srand() * 0.15);
    }
    auroras.push({
      points: pts,
      color: colors[i],
      speed: 0.0005 + srand() * 0.001,
      amplitude: 20 + srand() * 40,
      yBase: h * 0.1 + i * h * 0.08,
      phase: srand() * Math.PI * 2,
    });
  }
  return auroras;
}

function generateTrees(w: number, count: number): BgTree[] {
  const trees: BgTree[] = [];
  for (let i = 0; i < count; i++) {
    trees.push({
      x: srand() * w * 2,
      h: 20 + srand() * 40,
      speed: 0.6 + srand() * 0.3,
    });
  }
  return trees;
}

export function createWorldBgState(worldId: number, w: number, h: number): WorldBgState {
  seeded = worldId * 7919 + 42;

  const state: WorldBgState = {
    worldId,
    clouds: [],
    mountains: [],
    buildings: [],
    snowflakes: [],
    stars: [],
    planets: [],
    shootingStars: [],
    birds: [],
    auroras: [],
    trees: [],
    timeOffset: 0,
  };

  switch (worldId) {
    case 1: // NOVICE SKIES - Bright day
      state.clouds = generateClouds(w, h, 14, h * 0.05, h * 0.45);
      state.mountains = generateMountains(w, 3, [
        'rgba(34,139,34,0.6)', 'rgba(50,160,50,0.7)', 'rgba(60,180,60,0.85)',
      ]);
      state.birds = generateBirds(w, h, 6);
      state.trees = generateTrees(w, 25);
      break;

    case 2: // INTERMEDIATE AIRWAYS - Sunset
      state.clouds = generateClouds(w, h, 10, h * 0.05, h * 0.35);
      state.mountains = generateMountains(w, 4, [
        'rgba(80,30,60,0.5)', 'rgba(100,40,70,0.6)', 'rgba(120,50,80,0.7)', 'rgba(60,20,40,0.85)',
      ]);
      state.stars = generateStars(w, h, 30);
      state.birds = generateBirds(w, h, 3);
      break;

    case 3: // ADVANCED ALTITUDES - Night City
      state.stars = generateStars(w, h, 80);
      state.buildings = generateBuildings(w, h, 30);
      state.clouds = generateClouds(w, h, 5, h * 0.02, h * 0.2);
      break;

    case 4: // MASTER FLIGHT - Aurora / Arctic
      state.stars = generateStars(w, h, 100);
      state.mountains = generateMountains(w, 3, [
        'rgba(150,170,200,0.4)', 'rgba(180,200,230,0.5)', 'rgba(200,220,245,0.7)',
      ]);
      state.snowflakes = generateSnowflakes(w, h, 80);
      state.auroras = generateAuroras(w, h);
      break;

    case 5: // LEGENDARY HEIGHTS - Space / Cosmic
      state.stars = generateStars(w, h, 200);
      state.planets = [
        { x: w * 0.8, y: h * 0.15, radius: 40, color1: '#FF6B4A', color2: '#CC3311', speed: 0.02 },
        { x: w * 0.3, y: h * 0.08, radius: 15, color1: '#8888FF', color2: '#4444AA', ringColor: 'rgba(180,180,255,0.3)', speed: 0.01 },
        { x: w * 1.2, y: h * 0.25, radius: 60, color1: '#44AA77', color2: '#227755', speed: 0.015 },
      ];
      break;

    default: // Fallback to world 1
      state.clouds = generateClouds(w, h, 10, h * 0.1, h * 0.4);
      break;
  }

  return state;
}

// ────────────────── Drawing functions ──────────────────

function drawSkyGradient(ctx: CanvasRenderingContext2D, W: number, H: number, worldId: number, now: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  const pulse = Math.sin(now * 0.0002) * 0.03;

  switch (worldId) {
    case 1: { // Bright day
      grad.addColorStop(0, '#1E90FF');
      grad.addColorStop(0.35, '#56B4F9');
      grad.addColorStop(0.65, '#87CEEB');
      grad.addColorStop(1, '#B0E0E6');
      break;
    }
    case 2: { // Sunset
      const r = Math.floor(255 - pulse * 200);
      grad.addColorStop(0, `rgb(${Math.max(30, 45 + pulse * 100)},20,60)`);
      grad.addColorStop(0.25, `rgb(${Math.min(255, 120 + pulse * 200)},50,80)`);
      grad.addColorStop(0.5, `rgb(${r},${Math.floor(100 + pulse * 80)},60)`);
      grad.addColorStop(0.75, '#FF8C42');
      grad.addColorStop(1, '#FFD166');
      break;
    }
    case 3: { // Night city
      grad.addColorStop(0, '#05051A');
      grad.addColorStop(0.3, '#0A0A2E');
      grad.addColorStop(0.6, '#12103A');
      grad.addColorStop(1, '#1A1040');
      break;
    }
    case 4: { // Arctic / Aurora
      grad.addColorStop(0, '#050520');
      grad.addColorStop(0.4, '#0A0A30');
      grad.addColorStop(0.7, '#101840');
      grad.addColorStop(1, '#182848');
      break;
    }
    case 5: { // Space
      grad.addColorStop(0, '#000008');
      grad.addColorStop(0.3, '#020015');
      grad.addColorStop(0.7, '#08001A');
      grad.addColorStop(1, '#0A0020');
      break;
    }
    default: {
      grad.addColorStop(0, '#07090E');
      grad.addColorStop(1, '#0A0D15');
    }
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawSun(ctx: CanvasRenderingContext2D, W: number, H: number, worldId: number, now: number) {
  if (worldId === 1) {
    const sunX = W * 0.82;
    const sunY = H * 0.12 + Math.sin(now * 0.0003) * 5;
    const sunR = 35;

    // Outer glow
    const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 4);
    glow.addColorStop(0, 'rgba(255,255,200,0.25)');
    glow.addColorStop(0.4, 'rgba(255,220,100,0.08)');
    glow.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - sunR * 4, sunY - sunR * 4, sunR * 8, sunR * 8);

    // Sun body
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#FFFDE8');
    sunGrad.addColorStop(0.7, '#FFE566');
    sunGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Light rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(now * 0.0001);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const len = sunR * 1.6 + Math.sin(now * 0.002 + i) * 8;
      ctx.strokeStyle = `rgba(255,230,100,${0.08 + Math.sin(now * 0.003 + i) * 0.04})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * sunR * 1.1, Math.sin(angle) * sunR * 1.1);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (worldId === 2) {
    const sunX = W * 0.5 + Math.sin(now * 0.00015) * 30;
    const sunY = H * 0.72;
    const sunR = 50;

    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
    glow.addColorStop(0, 'rgba(255,200,80,0.5)');
    glow.addColorStop(0.2, 'rgba(255,150,50,0.2)');
    glow.addColorStop(0.5, 'rgba(255,100,30,0.05)');
    glow.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, sunY - sunR * 5, W, sunR * 5.5);

    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#FFF5E0');
    sunGrad.addColorStop(0.5, '#FFAA44');
    sunGrad.addColorStop(1, '#FF6622');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: BgCloud, worldId: number) {
  ctx.save();

  let fillColor: string;
  if (worldId === 1) {
    fillColor = `rgba(255,255,255,${cloud.opacity * 0.7})`;
  } else if (worldId === 2) {
    fillColor = `rgba(60,30,50,${cloud.opacity * 0.5})`;
  } else if (worldId === 3) {
    fillColor = `rgba(30,20,50,${cloud.opacity * 0.4})`;
  } else {
    fillColor = `rgba(200,210,230,${cloud.opacity * 0.3})`;
  }

  ctx.fillStyle = fillColor;

  const cx = cloud.x;
  const cy = cloud.y;
  const cw = cloud.w;
  const ch = cloud.h;

  // Draw a fluffy cloud shape using overlapping circles
  ctx.beginPath();
  ctx.arc(cx, cy, ch * 0.5, 0, Math.PI * 2);
  ctx.arc(cx + cw * 0.2, cy - ch * 0.2, ch * 0.6, 0, Math.PI * 2);
  ctx.arc(cx + cw * 0.45, cy - ch * 0.1, ch * 0.55, 0, Math.PI * 2);
  ctx.arc(cx + cw * 0.65, cy, ch * 0.45, 0, Math.PI * 2);
  ctx.arc(cx + cw * 0.3, cy + ch * 0.15, ch * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Highlight for day clouds
  if (worldId === 1) {
    ctx.fillStyle = `rgba(255,255,255,${cloud.opacity * 0.3})`;
    ctx.beginPath();
    ctx.arc(cx + cw * 0.2, cy - ch * 0.3, ch * 0.35, 0, Math.PI * 2);
    ctx.arc(cx + cw * 0.45, cy - ch * 0.25, ch * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawMountainLayer(ctx: CanvasRenderingContext2D, mt: BgMountain, W: number, H: number) {
  const pts = mt.points;
  const segW = (W * 1.5) / (pts.length - 1);

  ctx.fillStyle = mt.color;
  ctx.beginPath();
  ctx.moveTo(-segW + mt.offsetX % (segW * 2), H);

  for (let i = 0; i < pts.length; i++) {
    const x = i * segW + (mt.offsetX % (segW * 2)) - segW;
    const y = H - pts[i] * H * 0.35;
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      const px = (i - 1) * segW + (mt.offsetX % (segW * 2)) - segW;
      const py = H - pts[i - 1] * H * 0.35;
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  }

  ctx.lineTo(W + segW, H);
  ctx.closePath();
  ctx.fill();
}

function drawBuildings(ctx: CanvasRenderingContext2D, buildings: BgBuilding[], H: number, now: number) {
  for (const b of buildings) {
    const bx = b.x;
    const by = H - b.h;

    // Building body
    ctx.fillStyle = '#0A0A1A';
    ctx.fillRect(bx, by, b.w, b.h);

    // Windows
    for (const win of b.windows) {
      const flicker = win.lit && Math.sin(now * 0.001 + bx + win.y * 0.1) > -0.3;
      if (flicker) {
        const colors = ['rgba(255,220,100,0.7)', 'rgba(100,200,255,0.5)', 'rgba(255,150,50,0.6)'];
        ctx.fillStyle = colors[Math.floor((bx + win.x) * 0.1) % colors.length];
      } else {
        ctx.fillStyle = 'rgba(20,20,40,0.8)';
      }
      ctx.fillRect(bx + win.x, by + win.y, 6, 8);
    }

    // Roof detail
    ctx.fillStyle = 'rgba(255,50,50,0.3)';
    ctx.beginPath();
    ctx.arc(bx + b.w / 2, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground glow (neon reflection)
  const groundGlow = ctx.createLinearGradient(0, H - 5, 0, H);
  groundGlow.addColorStop(0, 'rgba(125,50,255,0.15)');
  groundGlow.addColorStop(1, 'rgba(0,200,255,0.05)');
  ctx.fillStyle = groundGlow;
  ctx.fillRect(0, H - 5, ctx.canvas.width, 5);
}

function drawAurora(ctx: CanvasRenderingContext2D, aurora: BgAurora, W: number, now: number) {
  const pts = aurora.points;
  const segW = W / (pts.length - 1);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let band = 0; band < 3; band++) {
    const bandOffset = band * 15;
    ctx.fillStyle = aurora.color;
    ctx.beginPath();

    const baseY = aurora.yBase + bandOffset;
    ctx.moveTo(0, baseY + aurora.amplitude * 2);

    for (let i = 0; i <= pts.length - 1; i++) {
      const x = i * segW;
      const waveY = Math.sin(now * aurora.speed + aurora.phase + i * 0.5 + band * 0.3) * aurora.amplitude;
      const y = baseY + waveY + pts[i] * 30;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * segW;
        const cpx = (prevX + x) / 2;
        const prevY = baseY + Math.sin(now * aurora.speed + aurora.phase + (i - 1) * 0.5 + band * 0.3) * aurora.amplitude + pts[i - 1] * 30;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    }

    ctx.lineTo(W, baseY + aurora.amplitude * 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawSnowflakes(ctx: CanvasRenderingContext2D, flakes: BgSnowflake[], now: number) {
  for (const f of flakes) {
    const alpha = 0.4 + Math.sin(now * 0.002 + f.phase) * 0.3;
    ctx.fillStyle = `rgba(220,230,255,${Math.max(0.1, alpha)})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBird(ctx: CanvasRenderingContext2D, bird: BgBird, now: number) {
  const wingY = Math.sin(now * 0.006 + bird.wingPhase) * bird.size * 0.7;

  ctx.strokeStyle = 'rgba(40,40,60,0.6)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(bird.x - bird.size, bird.y + wingY);
  ctx.quadraticCurveTo(bird.x, bird.y - Math.abs(wingY) * 0.3, bird.x + bird.size, bird.y + wingY);
  ctx.stroke();
}

function drawPlanets(ctx: CanvasRenderingContext2D, planets: BgPlanet[], now: number) {
  for (const p of planets) {
    // Planet glow
    const glow = ctx.createRadialGradient(p.x, p.y, p.radius * 0.8, p.x, p.y, p.radius * 2.5);
    glow.addColorStop(0, p.color1.replace(')', ',0.15)').replace('rgb', 'rgba'));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Planet body
    const bodyGrad = ctx.createRadialGradient(
      p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0,
      p.x, p.y, p.radius
    );
    bodyGrad.addColorStop(0, p.color1);
    bodyGrad.addColorStop(1, p.color2);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Atmospheric band
    const bandY = Math.sin(now * 0.0003) * p.radius * 0.15;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(p.x - p.radius, p.y + bandY - 3, p.radius * 2, 6);
    ctx.fillRect(p.x - p.radius, p.y + bandY + p.radius * 0.3 - 2, p.radius * 2, 4);
    ctx.restore();

    // Ring if present
    if (p.ringColor) {
      ctx.save();
      ctx.strokeStyle = p.ringColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius * 1.8, p.radius * 0.4, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawNebula(ctx: CanvasRenderingContext2D, W: number, H: number, now: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const nebulae = [
    { x: W * 0.2, y: H * 0.3, r: 200, color: 'rgba(100,0,180,0.04)' },
    { x: W * 0.7, y: H * 0.15, r: 160, color: 'rgba(0,80,200,0.03)' },
    { x: W * 0.5, y: H * 0.6, r: 250, color: 'rgba(180,0,100,0.025)' },
  ];

  for (const n of nebulae) {
    const shift = Math.sin(now * 0.0001) * 15;
    const grad = ctx.createRadialGradient(n.x + shift, n.y, 0, n.x + shift, n.y, n.r);
    grad.addColorStop(0, n.color);
    grad.addColorStop(0.6, n.color.replace(/[\d.]+\)$/, '0.01)'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
  }

  ctx.restore();
}

function drawShootingStar(ctx: CanvasRenderingContext2D, ss: BgShootingStar) {
  const alpha = (ss.life / ss.maxLife) * 0.8;
  const grad = ctx.createLinearGradient(
    ss.x, ss.y,
    ss.x - Math.cos(ss.angle) * ss.length,
    ss.y - Math.sin(ss.angle) * ss.length
  );
  grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
  grad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ss.x, ss.y);
  ctx.lineTo(
    ss.x - Math.cos(ss.angle) * ss.length,
    ss.y - Math.sin(ss.angle) * ss.length
  );
  ctx.stroke();
}

function drawGroundTerrain(ctx: CanvasRenderingContext2D, W: number, H: number, worldId: number, now: number) {
  if (worldId === 1) {
    // Rolling green hills with grass tufts
    const grad = ctx.createLinearGradient(0, H * 0.82, 0, H);
    grad.addColorStop(0, '#4CAF50');
    grad.addColorStop(0.3, '#388E3C');
    grad.addColorStop(1, '#2E7D32');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const hill1 = Math.sin(x * 0.005 + now * 0.0001) * 15;
      const hill2 = Math.sin(x * 0.012 + 1.5) * 8;
      const y = H * 0.86 + hill1 + hill2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Grass highlight
    const highlightGrad = ctx.createLinearGradient(0, H * 0.84, 0, H * 0.88);
    highlightGrad.addColorStop(0, 'rgba(139,195,74,0.5)');
    highlightGrad.addColorStop(1, 'rgba(139,195,74,0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const hill1 = Math.sin(x * 0.005 + now * 0.0001) * 15;
      const hill2 = Math.sin(x * 0.012 + 1.5) * 8;
      ctx.lineTo(x, H * 0.86 + hill1 + hill2);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  if (worldId === 2) {
    const grad = ctx.createLinearGradient(0, H * 0.85, 0, H);
    grad.addColorStop(0, '#3D1F1F');
    grad.addColorStop(1, '#1A0A0A');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) {
      const hill = Math.sin(x * 0.004 + now * 0.00008) * 12 + Math.sin(x * 0.015) * 5;
      ctx.lineTo(x, H * 0.88 + hill);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  if (worldId === 4) {
    // Snow/ice terrain
    const grad = ctx.createLinearGradient(0, H * 0.85, 0, H);
    grad.addColorStop(0, 'rgba(200,220,240,0.6)');
    grad.addColorStop(0.5, 'rgba(150,180,210,0.5)');
    grad.addColorStop(1, 'rgba(100,130,170,0.4)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const hill = Math.sin(x * 0.006 + now * 0.00005) * 10 + Math.sin(x * 0.02) * 4;
      ctx.lineTo(x, H * 0.88 + hill);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Ice sparkles
    ctx.fillStyle = 'rgba(220,240,255,0.4)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 73 + now * 0.01) % W;
      const sy = H * 0.89 + Math.sin(sx * 0.05) * 5;
      const sparkle = Math.sin(now * 0.005 + i) * 0.5 + 0.5;
      ctx.globalAlpha = sparkle * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawTrees(ctx: CanvasRenderingContext2D, trees: BgTree[], H: number) {
  for (const tree of trees) {
    const tx = tree.x;
    const baseY = H * 0.86 + Math.sin(tx * 0.005) * 15 + Math.sin(tx * 0.012 + 1.5) * 8;

    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(tx - 2, baseY - tree.h * 0.3, 4, tree.h * 0.3);

    // Foliage (triangles)
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.moveTo(tx, baseY - tree.h);
    ctx.lineTo(tx - tree.h * 0.3, baseY - tree.h * 0.3);
    ctx.lineTo(tx + tree.h * 0.3, baseY - tree.h * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.moveTo(tx, baseY - tree.h * 0.75);
    ctx.lineTo(tx - tree.h * 0.35, baseY - tree.h * 0.15);
    ctx.lineTo(tx + tree.h * 0.35, baseY - tree.h * 0.15);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCityGlow(ctx: CanvasRenderingContext2D, W: number, H: number, now: number) {
  // Neon glow at the base of the city
  const glowColors = [
    { x: W * 0.2, color: 'rgba(255,0,100,0.06)' },
    { x: W * 0.5, color: 'rgba(0,100,255,0.05)' },
    { x: W * 0.8, color: 'rgba(100,0,255,0.06)' },
  ];

  for (const g of glowColors) {
    const shift = Math.sin(now * 0.0005 + g.x) * 30;
    const grad = ctx.createRadialGradient(g.x + shift, H, 0, g.x + shift, H, H * 0.4);
    grad.addColorStop(0, g.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
  }
}

// ────────────────── Update & Render ──────────────────

export function updateWorldBg(state: WorldBgState, dt: number, W: number, H: number) {
  // Clouds
  for (const c of state.clouds) {
    c.x -= c.speed * dt * 60;
    if (c.x + c.w < -50) {
      c.x = W + 50 + Math.random() * 100;
      c.y = c.y + (Math.random() - 0.5) * 30;
    }
  }

  // Mountains parallax
  for (const mt of state.mountains) {
    mt.offsetX -= mt.speed * dt * 60;
  }

  // Buildings scroll
  for (const b of state.buildings) {
    b.x -= b.speed * dt * 60;
    if (b.x + b.w < -10) {
      b.x = W + 10 + Math.random() * 50;
    }
  }

  // Stars drift
  for (const st of state.stars) {
    st.x -= st.speed * dt * 60;
    if (st.x < -5) {
      st.x = W + 5;
      st.y = Math.random() * H * 0.85;
    }
  }

  // Snowflakes
  for (const f of state.snowflakes) {
    f.y += f.speed * dt * 60;
    f.x += Math.sin(f.phase + f.y * 0.02) * f.drift * dt * 60;
    if (f.y > H + 5) {
      f.y = -5;
      f.x = Math.random() * W;
    }
  }

  // Birds
  for (const b of state.birds) {
    b.x -= b.speed * dt * 60;
    if (b.x < -30) {
      b.x = W + 30 + Math.random() * 100;
      b.y = 40 + Math.random() * H * 0.3;
    }
  }

  // Planets drift slowly
  for (const p of state.planets) {
    p.x -= p.speed * dt * 60;
    if (p.x + p.radius * 3 < 0) {
      p.x = W + p.radius * 3;
    }
  }

  // Shooting stars
  for (const ss of state.shootingStars) {
    ss.x += Math.cos(ss.angle) * ss.speed * dt * 60;
    ss.y += Math.sin(ss.angle) * ss.speed * dt * 60;
    ss.life -= dt;
  }
  state.shootingStars = state.shootingStars.filter(ss => ss.life > 0);

  // Spawn new shooting stars (world 5)
  if (state.worldId === 5 && Math.random() < 0.002) {
    state.shootingStars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.4,
      speed: 4 + Math.random() * 6,
      angle: Math.PI * 0.15 + Math.random() * 0.3,
      life: 0.8 + Math.random() * 0.5,
      maxLife: 1.3,
      length: 30 + Math.random() * 50,
    });
  }

  // Trees parallax
  for (const t of state.trees) {
    t.x -= t.speed * dt * 60;
    if (t.x < -30) {
      t.x = W + 30 + Math.random() * 100;
    }
  }

  state.timeOffset += dt;
}

export function renderWorldBg(
  ctx: CanvasRenderingContext2D,
  state: WorldBgState,
  W: number,
  H: number,
  now: number,
) {
  const worldId = state.worldId;

  // 1. Sky gradient
  drawSkyGradient(ctx, W, H, worldId, now);

  // 2. Nebula (space world)
  if (worldId === 5) {
    drawNebula(ctx, W, H, now);
  }

  // 3. Stars (worlds 2-5)
  if (state.stars.length > 0) {
    for (const st of state.stars) {
      const twinkle = st.brightness + Math.sin(now * 0.003 + st.twinklePhase) * 0.2;
      const alpha = Math.max(0.05, Math.min(1, twinkle));

      if (worldId === 5 && st.size > 1.5) {
        // Colorful stars in space
        const hue = (st.twinklePhase * 60) % 360;
        ctx.fillStyle = `hsla(${hue},60%,80%,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(220,230,255,${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Planets (world 5)
  if (state.planets.length > 0) {
    drawPlanets(ctx, state.planets, now);
  }

  // 5. Aurora (world 4)
  for (const a of state.auroras) {
    drawAurora(ctx, a, W, now);
  }

  // 6. Sun (worlds 1, 2)
  drawSun(ctx, W, H, worldId, now);

  // 7. Shooting stars (world 5)
  for (const ss of state.shootingStars) {
    drawShootingStar(ctx, ss);
  }

  // 8. Back mountains / terrain
  for (const mt of state.mountains) {
    drawMountainLayer(ctx, mt, W, H);
  }

  // 9. Birds (world 1, 2)
  for (const bird of state.birds) {
    drawBird(ctx, bird, now);
  }

  // 10. Clouds
  for (const cloud of state.clouds) {
    drawCloud(ctx, cloud, worldId);
  }

  // 11. City glow (world 3)
  if (worldId === 3) {
    drawCityGlow(ctx, W, H, now);
  }

  // 12. Buildings (world 3)
  if (state.buildings.length > 0) {
    drawBuildings(ctx, state.buildings, H, now);
  }

  // 13. Ground terrain
  drawGroundTerrain(ctx, W, H, worldId, now);

  // 14. Trees (world 1)
  if (state.trees.length > 0) {
    drawTrees(ctx, state.trees, H);
  }

  // 15. Snowflakes (world 4)
  if (state.snowflakes.length > 0) {
    drawSnowflakes(ctx, state.snowflakes, now);
  }

  // 16. Atmospheric overlay — subtle vignette for depth
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.8);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, `rgba(0,0,0,${worldId <= 2 ? 0.15 : 0.25})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}
