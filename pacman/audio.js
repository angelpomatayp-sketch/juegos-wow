// ============================================================
//  PAC-MAN — audio.js
//  Sistema de audio híbrido adaptativo
// ============================================================
//
//  FUNCIONAMIENTO:
//  ───────────────
//  1. Al iniciar el juego, intenta cargar archivos de sonido desde 
//     la carpeta assets/sounds/ (chomp.wav, power_pellet.wav, etc.)
//
//  2. Si los archivos NO existen o fallan al cargar, automáticamente
//     genera sonidos sintéticos usando Web Audio API (sin archivos externos)
//
//  3. El usuario NO notará diferencia - el juego siempre tiene sonido
//
//  VENTAJAS DEL SISTEMA SINTÉTICO:
//  ────────────────────────────────
//  ✓ No requiere archivos externos (.wav/.mp3)
//  ✓ Carga instantánea (sin latencia de red)
//  ✓ Tamaño mínimo del proyecto
//  ✓ Sonidos procedurales personalizables en tiempo real
//  ✓ Compatible con todos los navegadores modernos
//
//  PARA USAR ARCHIVOS DE SONIDO (OPCIONAL):
//  ─────────────────────────────────────────
//  Coloca archivos .wav o .mp3 en: pacman/assets/sounds/
//  - chomp.wav         (comer punto)
//  - power_pellet.wav  (comer power pellet)
//  - eat_ghost.wav     (comer fantasma)
//  - death.wav         (muerte de Pac-Man)
//  - game_start.wav    (inicio de juego)
//  - game_over.wav     (fin de juego)
//  - level_up.wav      (completar nivel)
//
// ============================================================

'use strict';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx_audio = null;

function getAudioCtx() {
  if (!ctx_audio) ctx_audio = new AudioCtx();
  // reanudar si estaba suspendido (política autoplay del browser)
  if (ctx_audio.state === 'suspended') ctx_audio.resume();
  return ctx_audio;
}

// ─── CARGADOR DE ARCHIVOS ────────────────────────────────────
const soundBuffers = {};

async function loadSound(name, path) {
  try {
    const ac = getAudioCtx();
    const res = await fetch(path);
    if (!res.ok) return false;
    const ab = await res.arrayBuffer();
    soundBuffers[name] = await ac.decodeAudioData(ab);
    return true;
  } catch {
    return false;
  }
}

function playBuffer(name, volume = 1, loop = false) {
  if (!soundBuffers[name]) return null;
  const ac = getAudioCtx();
  const src = ac.createBufferSource();
  src.buffer = soundBuffers[name];
  src.loop = loop;
  const gain = ac.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(ac.destination);
  src.start();
  return { src, gain };
}

// ─── SONIDOS SINTÉTICOS (fallback) ───────────────────────────
function synth_dot() {
  const ac = getAudioCtx();
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.05);
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
  osc.start(); osc.stop(ac.currentTime + 0.07);
}

function synth_power() {
  const ac = getAudioCtx();
  for (let i = 0; i < 4; i++) {
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300 + i * 150, ac.currentTime + i * 0.08);
    g.gain.setValueAtTime(0.15, ac.currentTime + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.08 + 0.1);
    osc.start(ac.currentTime + i * 0.08);
    osc.stop(ac.currentTime + i * 0.08 + 0.12);
  }
}

function synth_eatGhost() {
  const ac = getAudioCtx();
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.25);
  g.gain.setValueAtTime(0.3, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
  osc.start(); osc.stop(ac.currentTime + 0.35);
}

function synth_death() {
  const ac = getAudioCtx();
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(880, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 1.2);
  g.gain.setValueAtTime(0.3, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.3);
  osc.start(); osc.stop(ac.currentTime + 1.4);
}

function synth_start() {
  const ac  = getAudioCtx();
  const seq = [
    { f: 523, t: 0 }, { f: 659, t: 0.15 }, { f: 784, t: 0.3 },
    { f: 659, t: 0.45 }, { f: 784, t: 0.55 }, { f: 1047, t: 0.7 },
  ];
  seq.forEach(({ f, t }) => {
    const osc = ac.createOscillator();
    const gn  = ac.createGain();
    osc.connect(gn); gn.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.value = f;
    gn.gain.setValueAtTime(0.15, ac.currentTime + t);
    gn.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.12);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.14);
  });
}

function synth_gameOver() {
  const ac  = getAudioCtx();
  const seq = [
    { f: 440, t: 0 }, { f: 370, t: 0.25 }, { f: 311, t: 0.5 },
    { f: 277, t: 0.75 }, { f: 220, t: 1.1 },
  ];
  seq.forEach(({ f, t }) => {
    const osc = ac.createOscillator();
    const gn  = ac.createGain();
    osc.connect(gn); gn.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    gn.gain.setValueAtTime(0.2, ac.currentTime + t);
    gn.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.22);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.25);
  });
}

function synth_levelUp() {
  const ac  = getAudioCtx();
  const seq = [
    { f: 523, t: 0 }, { f: 659, t: 0.1 }, { f: 784, t: 0.2 },
    { f: 1047, t: 0.3 },
  ];
  seq.forEach(({ f, t }) => {
    const osc = ac.createOscillator();
    const gn  = ac.createGain();
    osc.connect(gn); gn.connect(ac.destination);
    osc.type = 'triangle';
    osc.frequency.value = f;
    gn.gain.setValueAtTime(0.2, ac.currentTime + t);
    gn.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.1);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.12);
  });
}

// ─── SFX PÚBLICO ─────────────────────────────────────────────
// Alterna entre archivo de sonido (si existe) y sintético
let useFiles = false;
let dotToggle = false; // alterna dos frecuencias para el chomp

const SOUND_FILES = {
  dot:       'assets/sounds/chomp.wav',
  power:     'assets/sounds/power_pellet.wav',
  eatGhost:  'assets/sounds/eat_ghost.wav',
  death:     'assets/sounds/death.wav',
  start:     'assets/sounds/game_start.wav',
  gameOver:  'assets/sounds/game_over.wav',
  levelUp:   'assets/sounds/level_up.wav',
};

const SFX = {
  dot() {
    if (soundBuffers.dot) { playBuffer('dot', 0.5); return; }
    // sintetizado con alternancia de tono (como el original)
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.value = dotToggle ? 570 : 430;
    dotToggle = !dotToggle;
    g.gain.setValueAtTime(0.07, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.055);
    osc.start(); osc.stop(ac.currentTime + 0.06);
  },
  power()     { soundBuffers.power     ? playBuffer('power', 0.7)     : synth_power(); },
  eatGhost()  { soundBuffers.eatGhost  ? playBuffer('eatGhost', 0.8)  : synth_eatGhost(); },
  death()     { soundBuffers.death     ? playBuffer('death', 0.8)     : synth_death(); },
  start()     { soundBuffers.start     ? playBuffer('start', 0.6)     : synth_start(); },
  gameOver()  { soundBuffers.gameOver  ? playBuffer('gameOver', 0.7)  : synth_gameOver(); },
  levelUp()   { soundBuffers.levelUp   ? playBuffer('levelUp', 0.7)   : synth_levelUp(); },
  eatFruit()  {
    if (soundBuffers.eatFruit) { playBuffer('eatFruit', 0.8); return; }
    // síntesis: escala ascendente rápida
    const ac = getAudioCtx();
    [523, 659, 784, 1047, 1318].forEach((f, i) => {
      const osc = ac.createOscillator();
      const gn  = ac.createGain();
      osc.connect(gn); gn.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.value = f;
      gn.gain.setValueAtTime(0.2, ac.currentTime + i * 0.055);
      gn.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.055 + 0.1);
      osc.start(ac.currentTime + i * 0.055);
      osc.stop(ac.currentTime + i * 0.055 + 0.12);
    });
  },
};

// initAudio() se llama desde game.js tras el primer gesto del usuario
// para cumplir la política autoplay de los navegadores
let audioInitialized = false;

async function initAudio() {
  if (audioInitialized) return;
  audioInitialized = true;
  getAudioCtx(); // crea el contexto ya con gesto previo
  const results = await Promise.allSettled(
    Object.entries(SOUND_FILES).map(([k, v]) => loadSound(k, v))
  );
  const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;
  if (loaded > 0)
    console.log(`[Audio] ${loaded}/${Object.keys(SOUND_FILES).length} archivos de sonido cargados.`);
  else
    console.log('[Audio] Usando síntesis Web Audio API (sin archivos .wav).');
}

// ─── AMBIENTE ESPACIAL DE FONDO (Pad atmosférico) ────────────
// 4 osciladores levemente desafinados crean un pad suave tipo sintetizador.
// Los acordes cambian cada 6 s (normal) o 3 s (frightened) con transición suave.
// API compatible con el sistema de sirena anterior (mismas funciones).

// Progresión Am atmosférica: A2-C3-E3-A3 → A2-D3-F3-A3 → E2-A2-E3-B3 → G2-C3-E3-G3
const _PAD_CHORDS_NORMAL = [
  [110.0, 130.8, 164.8, 220.0],
  [110.0, 146.8, 174.6, 220.0],
  [ 82.4, 110.0, 164.8, 246.9],
  [ 98.0, 130.8, 164.8, 196.0],
];
// Modo frightened: más agudo y tenso (Am octava 3 + acorde disminuido)
const _PAD_CHORDS_FRIGHT = [
  [220.0, 261.6, 329.6, 440.0],
  [207.7, 261.6, 311.1, 415.3],
];
// Detuning en centavos para efecto chorus/pad natural
const _PAD_DETUNE = [-9, -3, 3, 9];

let _padOscs       = [];
let _padGain       = null;
let _padLfo        = null;
let _padLfoGain    = null;
let _padMode       = 'off';
let _padChordTimer = null;
let _padChordIdx   = 0;

function sirenStart(mode) {
  sirenStop();
  if (!audioInitialized) return;
  const ac = getAudioCtx();

  // Ganancia maestra con fade-in lento (1.5 s) → muy sutil
  _padGain = ac.createGain();
  _padGain.gain.setValueAtTime(0.0, ac.currentTime);
  _padGain.gain.linearRampToValueAtTime(0.055, ac.currentTime + 1.5);
  _padGain.connect(ac.destination);

  // LFO de tremolo muy lento (respiración: 0.25 Hz = un ciclo cada 4 s)
  _padLfo           = ac.createOscillator();
  _padLfo.type      = 'sine';
  _padLfo.frequency.value = 0.25;
  _padLfoGain       = ac.createGain();
  _padLfoGain.gain.value  = 0.015; // ±0.015 sobre 0.055 → rango 0.04-0.07
  _padLfo.connect(_padLfoGain);
  _padLfoGain.connect(_padGain.gain);

  // 4 osciladores en unísono desafinado = textura pad
  _padMode     = mode || 'normal';
  _padChordIdx = 0;
  const initChord = _padMode === 'frightened'
    ? _PAD_CHORDS_FRIGHT[0]
    : _PAD_CHORDS_NORMAL[0];

  _padOscs = [];
  for (let i = 0; i < 4; i++) {
    const osc = ac.createOscillator();
    osc.type           = 'sine';
    osc.frequency.value = initChord[i];
    osc.detune.value   = _PAD_DETUNE[i];
    osc.connect(_padGain);
    osc.start();
    _padOscs.push(osc);
  }
  _padLfo.start();
  _schedulePadChord();
}

function sirenStop() {
  if (_padChordTimer) { clearTimeout(_padChordTimer); _padChordTimer = null; }
  if (!_padOscs.length && !_padGain) return;
  try {
    const ac  = getAudioCtx();
    const t   = ac.currentTime;
    if (_padGain) {
      _padGain.gain.cancelScheduledValues(t);
      _padGain.gain.setValueAtTime(_padGain.gain.value, t);
      _padGain.gain.linearRampToValueAtTime(0.0, t + 0.6); // fade-out suave
    }
    const stopAt = t + 0.65;
    _padOscs.forEach(o => { try { o.stop(stopAt); } catch(e) {} });
    if (_padLfo) try { _padLfo.stop(stopAt); } catch(e) {}
  } catch(e) {}
  setTimeout(() => {
    _padOscs = []; _padGain = null;
    _padLfo  = null; _padLfoGain = null;
    _padMode = 'off';
  }, 700);
}

// Cambia entre modo normal y frightened con transición suave de acorde
function sirenSetMode(mode) {
  if (_padMode === mode || !_padOscs.length) return;
  _padMode = mode;
  if (_padChordTimer) { clearTimeout(_padChordTimer); _padChordTimer = null; }
  _padChordIdx = 0;
  const chord = mode === 'frightened'
    ? _PAD_CHORDS_FRIGHT[0]
    : _PAD_CHORDS_NORMAL[0];
  _applyPadChord(chord, 1.2);
  // Tremolo: más rápido en frightened (1 Hz) vs normal (0.25 Hz)
  if (_padLfo) {
    _padLfo.frequency.setTargetAtTime(
      mode === 'frightened' ? 1.0 : 0.25,
      getAudioCtx().currentTime, 0.4
    );
  }
  _schedulePadChord();
}

// Compatibilidad con game.js — el pad no necesita actualización por frame
function sirenUpdate(_dotsLeft, _totalDots) {}

function _schedulePadChord() {
  const chords = _padMode === 'frightened' ? _PAD_CHORDS_FRIGHT : _PAD_CHORDS_NORMAL;
  const dur    = _padMode === 'frightened' ? 3000 : 6000;
  _padChordTimer = setTimeout(() => {
    if (_padMode === 'off' || !_padOscs.length) return;
    _padChordIdx = (_padChordIdx + 1) % chords.length;
    _applyPadChord(chords[_padChordIdx], 1.5);
    _schedulePadChord();
  }, dur);
}

function _applyPadChord(chord, transitionSecs) {
  if (!_padOscs.length) return;
  const ac = getAudioCtx();
  const t  = ac.currentTime;
  const tc = transitionSecs / 3; // timeConstant para setTargetAtTime
  _padOscs.forEach((osc, i) => {
    osc.frequency.setTargetAtTime(chord[i], t, tc);
  });
}
