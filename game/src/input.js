// Simmer & Serve — mouse and keyboard input, routed through hit regions.

import { BIN_ORDER } from './config.js';
import {
  clickBin, clickBoard, clickPan, clickTray, serveOrder, serveReadyPlate,
  startShift, trashPlate,
} from './logic.js';
import { hitRegions } from './render.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function handleClick(state, x, y, sfx) {
  if (state.phase === 'title' || state.phase === 'over') {
    if (state.startButton && inside(x, y, state.startButton)) {
      startShift(state, sfx);
      return 'start';
    }
    return null;
  }
  // Tickets first (they overlap nothing else, but check before the bell).
  const regions = hitRegions(state);
  for (let i = regions.length - 1; i >= 0; i--) {
    const r = regions[i];
    if (!inside(x, y, r)) continue;
    switch (r.kind) {
      case 'bin': return clickBin(state, r.id, sfx) ? 'bin' : 'bin-busy';
      case 'board': return clickBoard(state, sfx) ? 'chop' : null;
      case 'pan': return clickPan(state, r.index, sfx) ? 'pan' : null;
      case 'tray': return clickTray(state, r.index, sfx) ? 'tray' : 'tray-no';
      case 'bell': return serveReadyPlate(state, sfx) ? 'serve' : 'bell-no';
      case 'ticket': return serveOrder(state, r.id, sfx) ? 'serve' : 'ticket-no';
      case 'trash': return trashPlate(state, sfx) ? 'trash' : null;
      case 'plate': return null;
      default: return null;
    }
  }
  return null;
}

export function handleKey(state, key, sfx) {
  const k = key.toLowerCase();
  if (state.phase === 'playing') {
    if (/^[1-8]$/.test(k)) {
      clickBin(state, BIN_ORDER[parseInt(k, 10) - 1], sfx);
      return;
    }
    if (k === ' ' || k === 'spacebar') { clickBoard(state, sfx); return; }
    if (k === 's' || k === 'enter') { serveReadyPlate(state, sfx); return; }
    if (k === 'c') { trashPlate(state, sfx); return; }
    if (k === 'p') { state.paused = !state.paused; return; }
  } else if (k === 'enter' || k === ' ') {
    startShift(state, sfx);
    return;
  }
  if (k === 'm' && sfx) sfx.toggleMute();
}
