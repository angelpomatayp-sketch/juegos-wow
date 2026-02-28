// ============================================================
//  PAC-MAN  —  game.js
//  Secciones: MAP · RENDERER · PACMAN · GHOSTS · GAME LOGIC
// ============================================================

'use strict';

// ─── CONSTANTES DEL MAPA ────────────────────────────────────
const T = {
  EMPTY:  0,
  WALL:   1,
  DOT:    2,
  POWER:  3,
  GATE:   4,   // puerta de la jaula de fantasmas
  TUNNEL: 5,   // túnel lateral (teleport)
};

// ============================================================
//  PAC-MAN WOW EDITION - MAPA ÚNICO HORIZONTAL
//  Diseño: Logo "WOW" formado por el camino del laberinto
//  Dimensiones: 50 columnas × 28 filas (horizontal)
//  Colores: Negro y Dorado (#000000 + #FFD700)
// ============================================================
// 0=vacío, 1=pared negra, 2=punto dorado, 3=power pellet, 4=gate, 5=tunnel

// MAPA WOW ÚNICO (horizontal 50×28)
const MAP_WOW = [
  // ═══════════════ FILA 0: BORDE SUPERIOR ═══════════════
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  
  // ═══════════════ FILA 1: POWER PELLET + PASILLO SUPERIOR ═══════════════
  [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
  
  // ══════════ ZONA W IZQUIERDA (cols 1-15) ══════════
  // Fila 2: Bloques superiores estilo clásico
  [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,2,1],
  
  // Fila 3
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 4: Primera "W" - brazos externos
  [1,2,1,1,2,2,2,2,2,1,1,2,1,1,1,1,1,1,2,2,2,2,1,1,1,1,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,1,2,1],
  
  // Fila 5: Espacios W
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,2,1],
  
  // Fila 6: Centro W con forma en V
  [1,2,1,1,2,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,2,1],
  
  // Fila 7: Base W que converge
  [1,2,1,1,2,2,1,2,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,1,1,2,2,1,2,2,1,1,2,1,2,1],
  
  // Fila 8: Transición al centro
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 9: Bloques antes del centro
  [1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1],
  
  // ══════════ ZONA O CENTRAL (cols 16-33) con GHOST HOUSE ══════════
  // Fila 10: Apertura superior O
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 11: Borde superior ghost house
  [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1],
  
  // Fila 12: Entrada ghost house con GATE
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,4,4,4,4,4,4,4,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 13: Interior ghost house superior
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  
  // Fila 14: TÚNEL HORIZONTAL + Ghost house center
  [5,5,5,5,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,5,5,5,5,5],
  
  // Fila 15: Interior ghost house inferior
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  
  // Fila 16: Salida ghost house
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 17: Borde inferior O
  [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,2,1],
  
  // Fila 18: Cierre zona O
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 19: Transición a W derecha
  [1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1],
  
  // ══════════ ZONA W DERECHA (cols 34-48) ══════════
  // Fila 20: Apertura W derecha
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 21: Base W derecha converge
  [1,2,1,1,2,2,1,2,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,1,1,2,2,1,2,2,1,1,2,1,2,1],
  
  // Fila 22: Centro W derecha en V
  [1,2,1,1,2,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,2,1],
  
  // Fila 23: Espacios W derecha
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1,2,1],
  
  // Fila 24: Brazos externos W derecha
  [1,2,1,1,2,2,2,2,2,1,1,2,1,1,1,1,1,1,2,2,2,2,1,1,1,1,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,1,2,1],
  
  // Fila 25: Bloques inferiores
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  
  // Fila 26: Final con bloques
  [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,2,1],
  
  // ═══════════════ FILA 26: POWER PELLET + PASILLO INFERIOR ═══════════════
  [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
  
  // ═══════════════ FILA 27: BORDE INFERIOR ═══════════════
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Array de mapas (ahora solo 1 - WOW Edition)
const ALL_MAPS = [MAP_WOW];

const COLS = 50;  // 28 → 50 (horizontal WOW Edition)
const ROWS = 28;  // 31 → 28 (más compacto)

// ─── CONSTANTES DE JUEGO ────────────────────────────────────
const TILE        = 23;          // px por tile (20 → 23 = +15%)
const PACMAN_SPD  = 4.5;         // tiles/segundo base
const GHOST_SPD   = 4.0;
const FRIGHT_SPD  = 2.5;
const FRIGHT_DUR  = 7000;        // ms en modo frightened
const FRIGHT_BLINK= 2000;        // ms antes de acabar que parpadea
const SCATTER_DUR = 7000;
const CHASE_DUR   = 20000;
const GHOST_SCORE = [200, 400, 800, 1600];
const DOT_SCORE   = 10;
const POWER_SCORE = 50;

// ─── ESTADO GLOBAL ──────────────────────────────────────────
let map, pacman, ghosts, gameState;
let animId = null;
let lastTime = 0;
let freezeTimer = 0;  // para animación de comer

// ─── CANVAS SETUP ───────────────────────────────────────────
const canvas  = document.getElementById('game-canvas');
const ctx     = canvas.getContext('2d');

// Canvas offscreen para el mapa estático (optimización)
let offscreenCanvas = null;
let offscreenCtx = null;
let offscreenLevel = -1; // nivel del mapa en cache

function resizeCanvas() {
  const hud    = document.getElementById('hud');
  const livRow = document.getElementById('lives-row');
  const hudH   = (hud    ? hud.offsetHeight    : 48) + 2;
  const livH   = (livRow ? livRow.offsetHeight : 38) + 2;
  const maxH   = window.innerHeight - hudH - livH;
  const maxW   = window.innerWidth;
  const s      = Math.max(Math.min(maxH / (ROWS * TILE), maxW / (COLS * TILE)), 0.2);
  canvas.width  = COLS * TILE;
  canvas.height = ROWS * TILE;
  canvas.style.width  = Math.round(COLS * TILE * s) + 'px';
  canvas.style.height = Math.round(ROWS * TILE * s) + 'px';
  offscreenLevel = -1;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── MAPA ───────────────────────────────────────────────────
// ─── SISTEMA DE PROGRESIÓN GRADUAL WOW ─────────────────────
function getDifficultyForLevel(lvl) {
  // Progresión gradual hasta nivel 20 (después mantiene máximos)
  return {
    // Velocidad Pac-Man: +3% por nivel, máx 160% (nivel 20)
    pacmanSpeed: Math.min(PACMAN_SPD * (1 + lvl * 0.03), PACMAN_SPD * 1.6),
    
    // Velocidad fantasmas: +4% por nivel, máx 180% (nivel 20)
    ghostSpeed: Math.min(GHOST_SPD * (1 + lvl * 0.04), GHOST_SPD * 1.8),
    
    // Duración frightened: -5% por nivel, mín 3 segundos
    frightDuration: Math.max(FRIGHT_DUR * (1 - lvl * 0.05), 3000),
    
    // Duración scatter: -10% por nivel, mín 0 (nivel 10+)
    scatterDuration: Math.max(SCATTER_DUR * (1 - lvl * 0.10), 0),
    
    // Tiempo salida fantasmas: -5% por nivel, mín 1 segundo
    releaseDelay: Math.max(3000 * (1 - lvl * 0.05), 1000)
  };
}

function initMap() {
  // WOW Edition: Siempre el mismo mapa (MAP_WOW)
  map = MAP_WOW.map(row => [...row]);
}

function isWall(col, row) {
  if (row < 0 || row >= ROWS) return true;
  // túnel horizontal
  if (col < 0 || col >= COLS) return false;
  const t = map[row][col];
  return t === T.WALL || t === T.GATE;
}

function isWalkable(col, row, isGhost = false) {
  if (col < 0 || col >= COLS) return true; // túnel
  if (row < 0 || row >= ROWS) return false;
  const t = map[row][col];
  if (t === T.WALL) return false;
  if (t === T.GATE) return isGhost; // solo fantasmas pasan la puerta
  return true;
}

// ─── UTILS ──────────────────────────────────────────────────
function wrapCol(col) {
  if (col < 0)    return COLS - 1;
  if (col >= COLS) return 0;
  return col;
}

function tileCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

function dist(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function pixelToTile(px) { return Math.floor(px / TILE); }

// BFS pathfinding para fantasmas
function bfsNext(startCol, startRow, targetCol, targetRow, isGhost = true, banned = null) {
  const key = (c, r) => r * COLS + c;
  const queue = [{ c: startCol, r: startRow, firstDir: null }];
  const visited = new Set([key(startCol, startRow)]);
  const dirs = [{ dc: 0, dr: -1 }, { dc: 1, dr: 0 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }];

  while (queue.length) {
    const cur = queue.shift();
    if (cur.c === targetCol && cur.r === targetRow) return cur.firstDir;

    for (const d of dirs) {
      let nc = wrapCol(cur.c + d.dc);
      let nr = cur.r + d.dr;
      if (!isWalkable(nc, nr, isGhost)) continue;
      if (banned && cur.firstDir === null && d === banned) continue;
      const k = key(nc, nr);
      if (visited.has(k)) continue;
      visited.add(k);
      queue.push({ c: nc, r: nr, firstDir: cur.firstDir ?? d });
    }
  }
  return null;
}

// ─── PAC-MAN ────────────────────────────────────────────────
function createPacman() {
  return {
    col: 25, row: 20,        // posición inicial (tile) - centro del mapa
    x: 25 * TILE + TILE / 2, // posición en píxeles (centro)
    y: 20 * TILE + TILE / 2,
    dir:  { dc: 0, dr: 0 },  // dirección actual
    next: { dc: -1, dr: 0 }, // siguiente dirección encolada
    speed: PACMAN_SPD * TILE, // px/s
    mouthAngle: 0.25,         // en fracciones de PI (0=cerrado, 0.25=max abierto)
    mouthDir: 1,              // 1 cierra, -1 abre (inicia abriendo)
    facing: 0,                // ángulo de rotación en radianes
    dead: false,
    deathAnim: 0,             // 0-1
    moving: false,
    eating: false,            // true cuando está comiendo algo
    eatingTimer: 0,           // tiempo restante en estado comiendo
  };
}

function updatePacman(dt) {
  const p = pacman;
  if (p.dead) {
    p.deathAnim = Math.min(1, p.deathAnim + dt * 0.7);
    return;
  }

  // ── gestionar timer de comer ──
  if (p.eatingTimer > 0) {
    p.eatingTimer -= dt * 1000;
    if (p.eatingTimer <= 0) {
      p.eating = false;
      p.eatingTimer = 0;
    }
  }

  // ── animar boca ──
  if (p.eating) {
    // COMIENDO: boca hace chomp (abre y cierra rápidamente)
    p.mouthAngle += p.mouthDir * dt * 12; // muy rápido
    if (p.mouthAngle >= 0.25) { 
      p.mouthAngle = 0.25; 
      p.mouthDir = -1; // empieza a cerrar
    }
    if (p.mouthAngle <= 0) { 
      p.mouthAngle = 0; 
      p.mouthDir = 1; // empieza a abrir
    }
  } else {
    // NO COMIENDO: boca abierta estática (siempre)
    p.mouthAngle = 0.25; // totalmente abierta
  }

  // ── tile actual usando el CENTRO de Pac-Man (sin bias) ──
  const curCol = Math.floor(p.x / TILE);
  const curRow = Math.floor(p.y / TILE);
  const cx = curCol * TILE + TILE / 2;
  const cy = curRow * TILE + TILE / 2;

  // ── intentar cambio de dirección encolado (solo cerca del centro del tile) ──
  const SNAP = 4;
  if (Math.abs(p.x - cx) < SNAP && Math.abs(p.y - cy) < SNAP) {
    const nd = p.next;
    const nc = wrapCol(curCol + nd.dc);
    const nr = curRow + nd.dr;
    if (isWalkable(nc, nr, false)) {
      p.dir = { ...nd };
      if (nd.dc === 1)  p.facing = 0;
      if (nd.dc === -1) p.facing = Math.PI;
      if (nd.dr === -1) p.facing = -Math.PI / 2;
      if (nd.dr === 1)  p.facing = Math.PI / 2;
    }
  }

  // ── mover ──
  if (p.dir.dc === 0 && p.dir.dr === 0) { p.moving = false; return; }

  const { dc, dr } = p.dir;
  const spd = p.speed * dt;
  const newX = p.x + dc * spd;
  const newY = p.y + dr * spd;

  // Radio del hitbox (Pac-Man ocupa casi un tile completo)
  const R = TILE / 2 - 1; // 9px

  // Borde frontal de Pac-Man según dirección de movimiento
  const checkX = newX + dc * R;
  const checkY = newY + dr * R;

  // Columna/fila del borde frontal SIN wrapping para poder detectar túneles
  const tcRaw = Math.floor(checkX / TILE);
  const trRaw = Math.floor(checkY / TILE);

  // Fuera del mapa horizontalmente → túnel, siempre transitable
  // Validar que trRaw esté dentro de límites antes de verificar walkable
  const walkable = (tcRaw < 0 || tcRaw >= COLS)
    ? (trRaw >= 0 && trRaw < ROWS) // túnel solo si la fila es válida
    : isWalkable(tcRaw, trRaw, false);

  if (walkable) {
    p.x = newX;
    p.y = newY;
    p.moving = true;
    // Teleport del túnel
    if (p.x < -R)              p.x += COLS * TILE;
    if (p.x > COLS * TILE + R) p.x -= COLS * TILE;
  } else {
    // Snap suave al borde de la pared
    if (dc > 0) {
      const wallEdge = tcRaw * TILE - R;
      p.x = Math.min(p.x, wallEdge);
    }
    if (dc < 0) {
      const wallEdge = (tcRaw + 1) * TILE + R;
      p.x = Math.max(p.x, wallEdge);
    }
    if (dr > 0) {
      const wallEdge = trRaw * TILE - R;
      p.y = Math.min(p.y, wallEdge);
    }
    if (dr < 0) {
      const wallEdge = (trRaw + 1) * TILE + R;
      p.y = Math.max(p.y, wallEdge);
    }
    
    p.moving = false;
  }
}

// ─── FANTASMAS ──────────────────────────────────────────────
const GHOST_DEFS = [
  { name: 'Blinky', color: '#FF0000', startCol: 22, startRow: 12, scatterCol: 48, scatterRow: 1  },
  { name: 'Pinky',  color: '#FFB8FF', startCol: 20, startRow: 14, scatterCol: 1,  scatterRow: 1  },
  { name: 'Inky',   color: '#00FFFF', startCol: 24, startRow: 14, scatterCol: 48, scatterRow: 26 },
  { name: 'Clyde',  color: '#FFB852', startCol: 22, startRow: 15, scatterCol: 1,  scatterRow: 26 },
];

// Temporizador de modo: ciclos Chase/Scatter
const MODE_SEQUENCE = [
  { mode: 'scatter', dur: SCATTER_DUR },
  { mode: 'chase',   dur: CHASE_DUR   },
  { mode: 'scatter', dur: SCATTER_DUR },
  { mode: 'chase',   dur: CHASE_DUR   },
  { mode: 'scatter', dur: 5000        },
  { mode: 'chase',   dur: CHASE_DUR   },
  { mode: 'scatter', dur: 5000        },
  { mode: 'chase',   dur: Infinity    },
];

function createGhost(def, idx) {
  const c = tileCenter(def.startCol, def.startRow);
  return {
    idx,
    name:        def.name,
    color:       def.color,
    scatterCol:  def.scatterCol,
    scatterRow:  def.scatterRow,
    col:  def.startCol,
    row:  def.startRow,
    x:    c.x,
    y:    c.y,
    dir:  { dc: 0, dr: -1 },
    speed: GHOST_SPD * TILE,
    mode: 'house',       // house | scatter | chase | frightened | eaten
    prevMode: 'scatter',
    frightTimer: 0,
    modeTimer: 0,
    modeIdx: 0,
    eyeAngle: -Math.PI / 2,
    blinking: false,
    releaseTimer: idx * 3000, // cada fantasma sale con retraso
    dotsEaten: 0,
  };
}

function ghostTarget(g) {
  const p = pacman;
  const pc = pixelToTile(p.x);
  const pr = pixelToTile(p.y);
  const bc = pixelToTile(ghosts[0].x);
  const br = pixelToTile(ghosts[0].y);

  switch (g.idx) {
    case 0: // Blinky: persigue directamente
      return { tc: pc, tr: pr };
    case 1: // Pinky: 4 tiles adelante de Pac-Man
      return { tc: wrapCol(pc + p.dir.dc * 4), tr: Math.max(0, Math.min(ROWS - 1, pr + p.dir.dr * 4)) };
    case 2: // Inky: vector Blinky → 2 tiles adelante de Pac * 2
      { const tx = wrapCol(pc + p.dir.dc * 2); const ty = pr + p.dir.dr * 2;
        return { tc: wrapCol(tx + (tx - bc)), tr: Math.max(0, Math.min(ROWS - 1, ty + (ty - br))) }; }
    case 3: // Clyde: persigue si lejos, scatter si cerca
      { const d = dist(g.x, g.y, p.x, p.y) / TILE;
        return d > 8 ? { tc: pc, tr: pr } : { tc: g.scatterCol, tr: g.scatterRow }; }
    default:
      return { tc: 13, tr: 15 };
  }
}

function updateGhost(g, dt, globalMode) {
  // ── gestión de modo ──
  if (g.mode === 'house') {
    g.releaseTimer -= dt * 1000;
    if (g.releaseTimer <= 0) g.mode = globalMode;
    return;
  }
  if (g.mode === 'frightened') {
    g.frightTimer -= dt * 1000;
    g.blinking = g.frightTimer < FRIGHT_BLINK;
    if (g.frightTimer <= 0) {
      g.mode = g.prevMode;
      g.blinking = false;
    }
  }
  if (g.mode === 'eaten') {
    // volver a la casa
    const { tc, tr } = { tc: 13, tr: 14 };
    const next = bfsNext(pixelToTile(g.x), pixelToTile(g.y), tc, tr, true);
    if (next) moveGhostDir(g, next, GHOST_SPD * 2 * TILE * dt);
    else {
      // Al llegar a casa, restaurar al modo global actual (NO prevMode que podría ser frightened)
      g.mode = globalMode;
      g.prevMode = globalMode;
    }
    return;
  }

  // ── elegir próximo tile ──
  const spd = (g.mode === 'frightened' ? FRIGHT_SPD : GHOST_SPD) * TILE * dt;

  // moverse hacia siguiente tile
  const snap = 3;
  const gc = pixelToTile(g.x);
  const gr = pixelToTile(g.y);
  const cx = gc * TILE + TILE / 2;
  const cy = gr * TILE + TILE / 2;
  const near = Math.abs(g.x - cx) < snap && Math.abs(g.y - cy) < snap;

  if (near) {
    // elegir dirección
    let target;
    if (g.mode === 'frightened') {
      // random, pero priorizar mantener dirección actual si es válida (evita oscilación)
      const dirs = [{ dc: 0, dr: -1 }, { dc: 1, dr: 0 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }];
      const valid = dirs.filter(d => {
        const nc = wrapCol(gc + d.dc);
        const nr = gr + d.dr;
        return isWalkable(nc, nr, true) && !(d.dc === -g.dir.dc && d.dr === -g.dir.dr);
      });
      
      if (valid.length) {
        // 30% probabilidad de mantener dirección actual si es válida
        const currentValid = valid.find(d => d.dc === g.dir.dc && d.dr === g.dir.dr);
        if (currentValid && Math.random() < 0.3) {
          g.dir = currentValid;
        } else {
          // Elegir aleatoriamente entre direcciones válidas
          g.dir = valid[Math.floor(Math.random() * valid.length)];
        }
      }
    } else {
      if (g.mode === 'scatter') target = { tc: g.scatterCol, tr: g.scatterRow };
      else                      target = ghostTarget(g);
      const next = bfsNext(gc, gr, target.tc, target.tr, true);
      if (next) g.dir = next;
    }
    g.col = gc; g.row = gr;
  }

  moveGhostDir(g, g.dir, spd);
}

function moveGhostDir(g, dir, spd) {
  if (!dir) return;
  g.x += dir.dc * spd;
  g.y += dir.dr * spd;
  if (g.x < 0)           g.x = COLS * TILE;
  if (g.x > COLS * TILE) g.x = 0;
  // actualizar ángulo de ojos
  if (dir.dc === 1)  g.eyeAngle = 0;
  if (dir.dc === -1) g.eyeAngle = Math.PI;
  if (dir.dr === -1) g.eyeAngle = -Math.PI / 2;
  if (dir.dr === 1)  g.eyeAngle = Math.PI / 2;
}

// ─── RENDERER ───────────────────────────────────────────────
// ─── TEMAS POR NIVEL ────────────────────────────────────────
// WOW Edition: Tema único Negro y Dorado
const WOW_THEME = {
  wall: '#000000',  // Negro sólido
  glow: '#FFB800',  // Ámbar WOW Technologies
  dot: '#FFB800',   // Ámbar WOW Technologies
  bg: '#040404'     // Negro profundo
};

function getTheme() {
  return WOW_THEME;  // Siempre el mismo tema
}

// Renderiza paredes y puertas estáticas en canvas offscreen (se cachea por nivel)
function renderStaticMap() {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = COLS * TILE;
    offscreenCanvas.height = ROWS * TILE;
    offscreenCtx = offscreenCanvas.getContext('2d');
  }
  
  const theme = getTheme();
  offscreenCtx.fillStyle = theme.bg;
  offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = map[r][c];
      const x = c * TILE, y = r * TILE;
      if (t === T.WALL) {
        offscreenCtx.fillStyle = theme.wall;
        offscreenCtx.fillRect(x, y, TILE, TILE);
        offscreenCtx.strokeStyle = theme.glow;
        offscreenCtx.lineWidth = 1;
        offscreenCtx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      } else if (t === T.GATE) {
        offscreenCtx.fillStyle = '#FFB8FF';
        offscreenCtx.fillRect(x + 2, y + TILE / 2 - 1, TILE - 4, 2);
      }
    }
  }
  offscreenLevel = level;
}

function drawMap() {
  // Cachear elementos estáticos (paredes) en offscreen canvas
  if (offscreenLevel !== level) {
    renderStaticMap();
  }
  
  // Dibujar elementos estáticos desde cache
  ctx.drawImage(offscreenCanvas, 0, 0);
  
  // Dibujar elementos dinámicos (dots y power pellets)
  const theme = getTheme();
  const now = Date.now();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = map[r][c];
      const x = c * TILE, y = r * TILE;
      if (t === T.DOT) {
        ctx.fillStyle = theme.dot;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === T.POWER) {
        const pulse = 0.7 + 0.3 * Math.sin(now / 200);
        ctx.fillStyle = theme.dot;
        ctx.shadowColor = theme.dot;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function drawPacman() {
  const p = pacman;
  const r = TILE / 2 - 1;

  // ¿algún fantasma está asustado? → Pac-Man está en modo poder
  const anyFrightened = ghosts && ghosts.some(g => g.mode === 'frightened');
  const t = Date.now();
  let fillColor, glowColor, glowBlur;
  if (!p.dead && anyFrightened) {
    // Pulsa entre blanco brillante y cyan para indicar poder activo
    const pulse = (Math.sin(t / 80) + 1) / 2;
    const r1 = Math.round(255);
    const g1 = Math.round(200 + pulse * 55);
    const b1 = Math.round(50 + pulse * 205);
    fillColor = `rgb(${r1},${g1},${b1})`;
    glowColor = '#ffffff';
    glowBlur  = 18 + pulse * 10;
  } else {
    fillColor = '#FFB800';
    glowColor = '#FFB800';
    glowBlur  = 8;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing);

  if (!p.dead) {
    const mouth = p.mouthAngle * Math.PI;
    ctx.fillStyle = fillColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // animación de muerte: colapsa a línea
    const angle = p.deathAnim * Math.PI;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, angle, Math.PI * 2 - angle);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGhost(g) {
  const x = g.x, y = g.y;
  const r = TILE / 2 - 1;
  const frightened = g.mode === 'frightened';
  const eaten      = g.mode === 'eaten';

  ctx.save();
  ctx.translate(x, y);

  if (eaten) {
    // solo ojos
    drawGhostEyes(g, 0, 0, true);
    ctx.restore();
    return;
  }

  // cuerpo
  let bodyColor = frightened ? (g.blinking ? '#fff' : '#0000ff') : g.color;
  ctx.fillStyle = bodyColor;
  ctx.shadowColor = bodyColor;
  ctx.shadowBlur = 6;

  // cabeza (semicírculo)
  ctx.beginPath();
  ctx.arc(0, -r * 0.3, r, Math.PI, 0, false);
  // cuerpo rectangular
  ctx.lineTo(r, r * 0.8);
  // faldón ondulado
  const waves = 3;
  for (let i = waves; i >= 0; i--) {
    const wx = -r + (2 * r / waves) * (i + 0.5);
    const wy = r * 0.8 + (i % 2 === 0 ? r * 0.3 : 0);
    ctx.lineTo(wx, wy);
  }
  ctx.lineTo(-r, r * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  drawGhostEyes(g, 0, -r * 0.1, frightened);
  ctx.restore();
}

function drawGhostEyes(g, ox, oy, frightened) {
  if (frightened) {
    // cara asustada
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ox - 4, oy - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ox + 4, oy - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox - 5, oy + 4);
    ctx.lineTo(ox - 3, oy + 2);
    ctx.lineTo(ox - 1, oy + 4);
    ctx.lineTo(ox + 1, oy + 2);
    ctx.lineTo(ox + 3, oy + 4);
    ctx.lineTo(ox + 5, oy + 2);
    ctx.stroke();
    return;
  }
  // ojos normales con pupila dirigida
  const ea = g.eyeAngle;
  const pupils = [
    { bx: ox - 4, by: oy - 2 },
    { bx: ox + 4, by: oy - 2 },
  ];
  pupils.forEach(({ bx, by }) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00f';
    ctx.beginPath();
    ctx.arc(bx + Math.cos(ea) * 1.2, by + Math.sin(ea) * 1.2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFloatingScore(x, y, val) {
  // pequeño texto flotante al comer fantasma
  ctx.fillStyle = '#00ff88';
  ctx.font = `bold ${TILE * 0.8}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(val, x, y);
}

// ─── SISTEMA DE PUNTUACIÓN FLOTANTE ─────────────────────────
let floatScores = []; // { x, y, val, timer }

function spawnFloatScore(x, y, val) {
  floatScores.push({ x, y, val, timer: 1.2 });
}

function updateFloatScores(dt) {
  floatScores = floatScores.filter(f => {
    f.y -= 20 * dt;
    f.timer -= dt;
    return f.timer > 0;
  });
}

function drawFloatScores() {
  floatScores.forEach(f => {
    ctx.globalAlpha = Math.min(1, f.timer);
    drawFloatingScore(f.x, f.y, f.val);
    ctx.globalAlpha = 1;
  });
}

// ─── FRUTAS ──────────────────────────────────────────────────
const FRUIT_DEFS = [
  { emoji: '🍒', label: 'CEREZA',  pts: 100  }, // nivel 1
  { emoji: '🍓', label: 'FRESA',   pts: 300  }, // nivel 2
  { emoji: '🍊', label: 'NARANJA', pts: 500  }, // nivel 3
  { emoji: '🍊', label: 'NARANJA', pts: 500  }, // nivel 4
  { emoji: '🍎', label: 'MANZANA', pts: 700  }, // nivel 5
  { emoji: '🍎', label: 'MANZANA', pts: 700  }, // nivel 6
  { emoji: '🍇', label: 'UVA',     pts: 1000 }, // nivel 7
  { emoji: '🍇', label: 'UVA',     pts: 1000 }, // nivel 8
  { emoji: '🔑', label: 'LLAVE',   pts: 5000 }, // nivel 9+
];

// Posición de la fruta: centro del mapa, en la zona O
const FRUIT_COL = 22, FRUIT_ROW = 16;
const FRUIT_DURATION = 10000; // 10 segundos visible
// Se spawnea cuando quedan 174 dots (=70 comidos) y 74 dots (=170 comidos)
const FRUIT_TRIGGERS = [174, 74];

let fruit = null;        // { x, y, def, timer, eaten, eatTimer }
let fruitSpawnIdx = 0;   // cuántas frutas ya spawneamos este nivel
let totalDots = 0;       // total de dots al inicio del nivel

function getFruitDef() {
  return FRUIT_DEFS[Math.min(level - 1, FRUIT_DEFS.length - 1)];
}

function spawnFruit() {
  const c = tileCenter(FRUIT_COL, FRUIT_ROW);
  fruit = { x: c.x, y: c.y, def: getFruitDef(), timer: FRUIT_DURATION, eaten: false, eatTimer: 0 };
  fruitSpawnIdx++;
}

function updateFruit(dt) {
  if (!fruit) return;
  if (fruit.eaten) {
    fruit.eatTimer -= dt * 1000;
    if (fruit.eatTimer <= 0) fruit = null;
    return;
  }
  fruit.timer -= dt * 1000;
  if (fruit.timer <= 0) fruit = null;
}

function drawFruit() {
  if (!fruit) return;
  ctx.save();
  if (fruit.eaten) {
    // mostrar puntos obtenidos flotando
    ctx.globalAlpha = Math.min(1, fruit.eatTimer / 800);
    ctx.fillStyle = '#FFB800';
    ctx.font = `bold ${TILE * 0.7}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.def.pts, fruit.x, fruit.y - (1 - fruit.eatTimer / 1000) * 15);
    ctx.restore();
    return;
  }
  // parpadeo cuando queda poco tiempo
  const blink = fruit.timer < 3000 && Math.floor(Date.now() / 200) % 2 === 0;
  if (!blink) {
    ctx.font = `${TILE * 1.1}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // halo/glow detrás del emoji
    ctx.shadowColor = '#FFB800';
    ctx.shadowBlur = 14;
    ctx.fillText(fruit.def.emoji, fruit.x, fruit.y + 1);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function checkFruitCollision() {
  if (!fruit || fruit.eaten) return;
  if (dist(pacman.x, pacman.y, fruit.x, fruit.y) < TILE * 1.1) {
    fruit.eaten = true;
    fruit.eatTimer = 1000;
    addScore(fruit.def.pts);
    spawnFloatScore(fruit.x, fruit.y - TILE, fruit.def.pts);
    SFX.eatFruit();
    // Pausa al comer fruta
    freezeTimer = 100; // ~100ms de pausa
    // Activar animación de boca cerrada
    pacman.eating = true;
    pacman.eatingTimer = 150; // 150ms comiendo fruta
  }
}

// ─── LÓGICA DEL JUEGO ───────────────────────────────────────
let score = 0;
let hiScore = parseInt(localStorage.getItem('pacman_hi') || '0');
let lives = 3;
let level = 1;
let dotsLeft = 0;
let ghostsEatenCombo = 0;
let globalMode = 'scatter';
let modeTimer  = 0;
let modeIdx    = 0;
let paused        = false;
let gameRunning   = false;
let transitioning = false;  // bloquea colisiones durante cambio de nivel/muerte

function countDots() {
  dotsLeft = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (map[r][c] === T.DOT || map[r][c] === T.POWER) dotsLeft++;
  totalDots = dotsLeft;
  fruit = null;
  fruitSpawnIdx = 0;
}

function addScore(pts) {
  score += pts;
  if (score > hiScore) {
    hiScore = score;
    localStorage.setItem('pacman_hi', hiScore);
  }
  updateHUD();
}

function updateHUD() {
  document.getElementById('hud-score').textContent   = score;
  document.getElementById('hud-level').textContent   = level;
  document.getElementById('hud-hiscore').textContent  = hiScore;
  document.getElementById('hi-score-start').textContent = hiScore;

  const livesEl = document.getElementById('lives-icons');
  livesEl.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const d = document.createElement('div');
    d.className = 'life-icon';
    livesEl.appendChild(d);
  }
}

function checkCollisions() {
  const pc = pixelToTile(pacman.x);
  const pr = pixelToTile(pacman.y);

  // comer puntos - validar que el tile existe
  if (pr < 0 || pr >= ROWS || pc < 0 || pc >= COLS) return;
  const tile = map[pr][pc];
  if (tile === T.DOT) {
    map[pr][pc] = T.EMPTY;
    addScore(DOT_SCORE);
    dotsLeft--;
    SFX.dot();
    // Micro-pausa al comer (efecto visual clásico)
    freezeTimer = 30; // ~30ms de pausa
    // Activar animación de boca cerrada
    pacman.eating = true;
    pacman.eatingTimer = 80; // 80ms comiendo
    // spawn fruta en los triggers clásicos (70 y 170 dots comidos)
    if (fruitSpawnIdx < FRUIT_TRIGGERS.length && dotsLeft === FRUIT_TRIGGERS[fruitSpawnIdx]) {
      spawnFruit();
    }
    if (dotsLeft <= 0) nextLevel();
  } else if (tile === T.POWER) {
    map[pr][pc] = T.EMPTY;
    addScore(POWER_SCORE);
    dotsLeft--;
    SFX.power();
    // Pausa más larga al comer power pellet
    freezeTimer = 60; // ~60ms de pausa
    // Activar animación de boca cerrada (más tiempo)
    pacman.eating = true;
    pacman.eatingTimer = 120; // 120ms comiendo
    ghostsEatenCombo = 0;
    const diff = getDifficultyForLevel(level);
    ghosts.forEach(g => {
      if (g.mode !== 'eaten' && g.mode !== 'house') {
        g.prevMode = g.mode;
        g.mode = 'frightened';
        g.frightTimer = diff.frightDuration;  // Duración dinámica
        g.blinking = false;
      }
    });
    if (dotsLeft <= 0) nextLevel();
  }

  // colisión con fruta
  checkFruitCollision();

  // colisión con fantasmas
  ghosts.forEach(g => {
    if (g.mode === 'house') return;
    if (dist(pacman.x, pacman.y, g.x, g.y) < TILE * 0.85) {
      if (g.mode === 'frightened') {
        g.mode = 'eaten';
        ghostsEatenCombo++;
        const pts = GHOST_SCORE[Math.min(ghostsEatenCombo - 1, 3)];
        addScore(pts);
        spawnFloatScore(g.x, g.y, pts);
        SFX.eatGhost();
        // Pausa más dramática al comer fantasma
        freezeTimer = 150; // ~150ms de pausa
        // Activar animación de boca cerrada (mucho tiempo)
        pacman.eating = true;
        pacman.eatingTimer = 200; // 200ms comiendo fantasma
      } else if (g.mode !== 'eaten') {
        pacmanDie();
      }
    }
  });
}

function pacmanDie() {
  if (pacman.dead || transitioning) return;
  transitioning = true;
  pacman.dead = true;
  pacman.deathAnim = 0;
  sirenStop();
  SFX.death();
  setTimeout(() => {
    lives--;
    updateHUD();
    if (lives <= 0) {
      transitioning = false;
      endGame();
    } else {
      pacman = createPacman();
      ghosts = GHOST_DEFS.map((d, i) => createGhost(d, i));
      ghostsEatenCombo = 0;
      showOverlay('LISTO!', 'WASD / ← → ↑ ↓ para mover');
      setTimeout(() => {
        hideOverlay();
        transitioning = false;
        sirenStart('normal');
      }, 2000);
    }
  }, 1500);
}

function nextLevel() {
  if (transitioning) return;
  transitioning = true;
  sirenStop();
  level++;
  SFX.levelUp();
  showOverlay('NIVEL ' + level, '¡Completado!');
  setTimeout(() => {
    initMap();
    countDots();
    pacman = createPacman();
    ghosts = GHOST_DEFS.map((d, i) => createGhost(d, i));
    ghostsEatenCombo = 0;
    
    // WOW Edition: Aplicar dificultad gradual
    const diff = getDifficultyForLevel(level);
    pacman.speed = diff.pacmanSpeed * TILE;
    ghosts.forEach(g => {
      g.speed = diff.ghostSpeed * TILE;
      g.releaseTimer = g.idx * diff.releaseDelay;
    });
    
    updateHUD();
    showOverlay('LISTO!', 'WASD / ← → ↑ ↓ para mover');
    setTimeout(() => {
      hideOverlay();
      transitioning = false;
      sirenStart('normal');
    }, 2000);
  }, 2000);
}

function updateGlobalMode(dt) {
  if (globalMode === 'frightened') return;
  modeTimer -= dt * 1000;
  if (modeTimer <= 0) {
    modeIdx = Math.min(modeIdx + 1, MODE_SEQUENCE.length - 1);
    const cur = MODE_SEQUENCE[modeIdx];
    globalMode = cur.mode;
    
    // WOW Edition: Aplicar duración dinámica de scatter
    const diff = getDifficultyForLevel(level);
    modeTimer = (cur.mode === 'scatter') ? diff.scatterDuration : cur.dur;
    
    // Si scatter duration es 0 (nivel 10+), saltar a chase
    if (modeTimer === 0) {
      globalMode = 'chase';
      modeTimer = CHASE_DUR;
    }
    
    // invertir dirección de fantasmas al cambiar modo
    ghosts.forEach(g => {
      if (g.mode !== 'frightened' && g.mode !== 'eaten' && g.mode !== 'house') {
        g.dir = { dc: -g.dir.dc, dr: -g.dir.dr };
        g.mode = globalMode;
      }
    });
  }
}

// ─── OVERLAY ─────────────────────────────────────────────────
function showOverlay(text, sub) {
  const ov = document.getElementById('overlay');
  document.getElementById('overlay-text').textContent = text;
  document.getElementById('overlay-sub').textContent  = sub;
  ov.classList.remove('hidden');
}
function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

// ─── GAME LOOP ───────────────────────────────────────────────
function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (!paused && gameRunning && !transitioning) {
    // Gestionar freeze timer (pausa breve al comer)
    if (freezeTimer > 0) {
      freezeTimer -= dt * 1000;
      // Durante freeze, solo actualizar animaciones visuales
      updateFruit(dt);
      updateFloatScores(dt);
    } else {
      // Juego normal
      updateGlobalMode(dt);
      updatePacman(dt);
      ghosts.forEach(g => updateGhost(g, dt, globalMode));
      checkCollisions();
      updateFruit(dt);
      updateFloatScores(dt);
      // Sirena dinámica: actualizar modo y tono cada frame
      const anyFrightened = ghosts.some(g => g.mode === 'frightened');
      if (anyFrightened) { sirenSetMode('frightened'); }
      else               { sirenSetMode('normal'); sirenUpdate(dotsLeft, totalDots); }
    }
  }

  // render
  const theme = getTheme();
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawFruit();
  ghosts.forEach(drawGhost);
  drawPacman();
  drawFloatScores();

  animId = requestAnimationFrame(gameLoop);
}

// ─── CONTROLES ───────────────────────────────────────────────
const KEY_MAP = {
  ArrowLeft:  { dc: -1, dr: 0 },
  ArrowRight: { dc:  1, dr: 0 },
  ArrowUp:    { dc:  0, dr: -1 },
  ArrowDown:  { dc:  0, dr:  1 },
  a: { dc: -1, dr: 0 }, A: { dc: -1, dr: 0 },
  d: { dc:  1, dr: 0 }, D: { dc:  1, dr: 0 },
  w: { dc:  0, dr: -1 }, W: { dc:  0, dr: -1 },
  s: { dc:  0, dr:  1 }, S: { dc:  0, dr:  1 },
};

document.addEventListener('keydown', e => {
  if (!gameRunning) return;
  if (e.key === 'p' || e.key === 'P') {
    paused = !paused;
    if (paused) { sirenStop(); showOverlay('PAUSA', 'P = continuar'); }
    else        { hideOverlay(); sirenStart('normal'); }
    return;
  }
  const dir = KEY_MAP[e.key];
  if (dir) {
    pacman.next = { ...dir };
    e.preventDefault();
  }
});

// Soporte táctil básico (swipe)
let touchStart = null;
canvas.addEventListener('touchstart', e => { touchStart = e.touches[0]; }, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.clientX;
  const dy = e.changedTouches[0].clientY - touchStart.clientY;
  if (Math.abs(dx) > Math.abs(dy)) {
    pacman.next = dx > 0 ? { dc: 1, dr: 0 } : { dc: -1, dr: 0 };
  } else {
    pacman.next = dy > 0 ? { dc: 0, dr: 1 } : { dc: 0, dr: -1 };
  }
  touchStart = null;
}, { passive: true });

// D-pad para móvil
(function setupDpad() {
  const map = {
    'dpad-up':    { dc:  0, dr: -1 },
    'dpad-down':  { dc:  0, dr:  1 },
    'dpad-left':  { dc: -1, dr:  0 },
    'dpad-right': { dc:  1, dr:  0 },
  };
  Object.entries(map).forEach(([id, dir]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); pacman.next = dir; }, { passive: false });
    btn.addEventListener('mousedown',  () => { pacman.next = dir; });
  });
})();

// ─── PANTALLAS ───────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = (id === 'screen-game') ? 'hidden' : '';
  // Recalcular canvas cuando la pantalla ya tiene dimensiones reales
  if (id === 'screen-game') requestAnimationFrame(resizeCanvas);
}

function startGame() {
  initAudio(); // seguro aquí: ya hubo gesto del usuario (clic en el botón)
  score = 0; lives = 3; level = 1;
  ghostsEatenCombo = 0;
  transitioning = false;
  modeIdx = 0;
  globalMode = MODE_SEQUENCE[0].mode;
  modeTimer  = MODE_SEQUENCE[0].dur;
  initMap();
  countDots();
  pacman = createPacman();
  ghosts = GHOST_DEFS.map((d, i) => createGhost(d, i));
  updateHUD();
  showScreen('screen-game');
  showOverlay('LISTOS?', 'WASD / ← → ↑ ↓ para mover');
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);
  lastTime = performance.now();
  animId = requestAnimationFrame(gameLoop);
  setTimeout(() => {
    hideOverlay();
    gameRunning = true;
    SFX.start();
    setTimeout(() => sirenStart('normal'), 800);
  }, 3000);
}

function endGame() {
  gameRunning = false;
  sirenStop();
  SFX.gameOver();
  showScreen('screen-gameover');
  document.getElementById('final-score').textContent = score;
  const isRecord = score > 0 && score === hiScore && parseInt(localStorage.getItem('pacman_hi') || '0') === hiScore;
  document.getElementById('new-record').classList.toggle('hidden', !isRecord);
}

// ─── BOTONES ─────────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', () => {
  if (animId) cancelAnimationFrame(animId);
  gameRunning = false;
  sirenStop();
  showScreen('screen-start');
  document.getElementById('hi-score-start').textContent = hiScore;
});

// Arranque inicial
showScreen('screen-start');
document.getElementById('hi-score-start').textContent = hiScore;
