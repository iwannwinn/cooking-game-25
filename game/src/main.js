// Simmer & Serve — bootstrap: canvas setup, game loop, input wiring, shot staging.
// The game is plain static files: no network request is made at any point.

import { LOGICAL_H, LOGICAL_W } from './config.js';
import { SoundFX } from './audio.js';
import { createState, update } from './logic.js';
import { draw } from './render.js';
import { handleClick, handleKey } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sfx = new SoundFX();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

let state;
if (shot) {
  state = stageShot(shot, seed);
} else {
  state = createState();
}

// Exposed for automated play-testing only (clicks and state reads in tests).
window.__game = state;
window.__layout = { w: LOGICAL_W, h: LOGICAL_H };

function fitCanvas() {
  const scale = Math.min(window.innerWidth / LOGICAL_W, window.innerHeight / LOGICAL_H);
  canvas.style.width = `${Math.floor(LOGICAL_W * scale)}px`;
  canvas.style.height = `${Math.floor(LOGICAL_H * scale)}px`;
}

window.addEventListener('resize', fitCanvas);
fitCanvas();

function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * LOGICAL_W,
    y: ((event.clientY - rect.top) / rect.height) * LOGICAL_H,
  };
}

canvas.addEventListener('click', (event) => {
  sfx.ensure();
  const p = toLogical(event);
  handleClick(state, p.x, p.y, sfx);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  sfx.ensure();
  handleKey(state, event.key, sfx);
});

let last = performance.now();
let elapsed = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  elapsed += dt;
  if (!state.paused) update(state, dt, sfx);
  draw(ctx, state, elapsed, sfx);
  if (state.paused) {
    ctx.fillStyle = 'rgba(30,20,12,0.6)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED — press P to resume', LOGICAL_W / 2, LOGICAL_H / 2);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
