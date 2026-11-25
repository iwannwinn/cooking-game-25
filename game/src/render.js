// Simmer & Serve — all canvas drawing: the bistro kitchen, stations, tickets, HUD.
// Original vector art drawn in code; no image assets are loaded.

import { BIN_ORDER, DISHES, INGREDIENTS, LAYOUT, LOGICAL_H, LOGICAL_W, TUNING } from './config.js';
import { dishOf } from './logic.js';

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold', font = 'Trebuchet MS') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "${font}", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---------- ingredient icons (drawn, not images) ----------

export function drawIngredient(ctx, id, x, y, r, opts = {}) {
  const ing = INGREDIENTS[id];
  if (!ing) return;
  ctx.save();
  ctx.translate(x, y);
  if (opts.glow) {
    ctx.shadowColor = '#ffd76a';
    ctx.shadowBlur = 14;
  }
  switch (id) {
    case 'tomato': {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff7a6b';
      ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3e7a26';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        ctx.ellipse(Math.cos(a) * r * 0.45, -r * 0.85 + Math.sin(a) * r * 0.2, r * 0.32, r * 0.16, a, 0, Math.PI * 2);
      }
      ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = ing.dark;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ing.color;
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#8ed06a';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.55); ctx.lineTo(r, r * 0.55); ctx.lineTo(r * 0.7, -r * 0.7); ctx.lineTo(-r * 0.7, -r * 0.2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = ing.dark;
      for (const [hx, hy, hr] of [[-0.3, 0.2, 0.14], [0.3, 0.25, 0.11], [0.05, -0.3, 0.12]]) {
        ctx.beginPath(); ctx.arc(hx * r, hy * r, hr * r, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = '#f3e6cf';
      rr(ctx, -r * 0.28, -r * 0.1, r * 0.56, r * 0.85, r * 0.2); ctx.fill();
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.95, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#efe0c2';
      for (const [sx, sy] of [[-0.45, -0.45], [0.1, -0.7], [0.5, -0.35]]) {
        ctx.beginPath(); ctx.arc(sx * r, sy * r, r * 0.13, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'berries': {
      ctx.fillStyle = '#5a34a3';
      for (const [bx, by, br] of [[-0.4, 0.25, 0.42], [0.4, 0.3, 0.42], [0, -0.45, 0.46], [-0.05, 0.45, 0.34]]) {
        ctx.beginPath(); ctx.arc(bx * r, by * r, br * r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#a78be8';
      for (const [bx, by] of [[-0.5, 0.1], [0.3, 0.15], [-0.1, -0.6]]) {
        ctx.beginPath(); ctx.arc(bx * r, by * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#3e7a26';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.85, r * 0.4, r * 0.16, -0.4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = ing.color;
      ctx.lineWidth = r * 0.16;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * (0.25 + i * 0.22), Math.PI * 0.15, Math.PI * 1.5);
        ctx.stroke();
      }
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = r * 0.1;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.8, Math.PI * 0.7, Math.PI * 1.1); ctx.stroke();
      break;
    }
    case 'steak': {
      ctx.fillStyle = ing.color;
      rr(ctx, -r, -r * 0.62, r * 2, r * 1.24, r * 0.55); ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(-r * 0.55, -r * 0.62, r * 0.16, r * 1.24);
      ctx.fillRect(0, -r * 0.62, r * 0.16, r * 1.24);
      ctx.fillRect(r * 0.55, -r * 0.62, r * 0.16, r * 1.24);
      ctx.fillStyle = '#e8b48a';
      ctx.beginPath(); ctx.arc(-r * 0.55, r * 0.25, r * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'dough': {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      for (const [dx, dy] of [[-0.4, -0.25], [0.3, 0.15], [0.1, -0.4]]) {
        ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    default: break;
  }
  ctx.restore();
}

// ---------- kitchen background ----------

function drawKitchen(ctx, t) {
  // Wall
  ctx.fillStyle = '#f6e3bd';
  ctx.fillRect(0, 62, LOGICAL_W, 300);
  // Brick accent strip
  ctx.fillStyle = '#e8c9a0';
  ctx.fillRect(0, 62, LOGICAL_W, 8);
  // Window with a sunny street
  ctx.fillStyle = '#7fb8d9';
  rr(ctx, 40, 84, 220, 150, 10); ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(210, 120, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5da83c';
  ctx.beginPath(); ctx.ellipse(150, 225, 110, 16, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(144, 84, 10, 150);
  ctx.fillRect(40, 152, 220, 10);
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 6;
  rr(ctx, 40, 84, 220, 150, 10); ctx.stroke();
  // Hanging lamps
  for (const lx of [420, 640, 860]) {
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 62); ctx.lineTo(lx, 108); ctx.stroke();
    ctx.fillStyle = '#c96a3b';
    ctx.beginPath(); ctx.moveTo(lx - 26, 108); ctx.lineTo(lx + 26, 108); ctx.lineTo(lx + 12, 128); ctx.lineTo(lx - 12, 128); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255, 214, 106, ${0.5 + 0.2 * Math.sin(t * 2 + lx)})`;
    ctx.beginPath(); ctx.arc(lx, 132, 10, 0, Math.PI * 2); ctx.fill();
  }
  // Shelf with jars
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(300, 250, 560, 12);
  const jarColors = ['#e8443a', '#5da83c', '#f7c948', '#7b4fd0'];
  jarColors.forEach((c, i) => {
    const jx = 330 + i * 130;
    ctx.fillStyle = c;
    rr(ctx, jx, 208, 52, 42, 8); ctx.fill();
    ctx.fillStyle = '#5b4636';
    ctx.fillRect(jx + 8, 200, 36, 10);
  });
  // Floor tiles
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 10; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#a5663f' : '#b5764a';
      ctx.fillRect(col * 128 + (row % 2 ? 64 : 0) - 64, 592 + row * 64, 128, 64);
    }
  }
  // Wooden counter top
  ctx.fillStyle = '#8a5a33';
  rr(ctx, 12, 282, 1232, 308, 14); ctx.fill();
  ctx.fillStyle = '#a06a3e';
  rr(ctx, 12, 282, 1232, 18, 9); ctx.fill();
  // Counter front panel lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  for (let x = 132; x < 1244; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 590); ctx.stroke();
  }
}

// ---------- HUD ----------

function drawHUD(ctx, state, sfx) {
  const { hud } = LAYOUT;
  ctx.fillStyle = '#3a2c22';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
  ctx.fillStyle = '#ffd76a';
  text(ctx, 'SIMMER & SERVE', 20, 32, 24, '#ffd76a', 'left');
  text(ctx, 'bistro rush', 258, 36, 13, '#e8c9a0', 'left', 'normal');
  // Coins
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.arc(430, 31, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  text(ctx, '¢', 430, 32, 15, '#8a6d1f');
  text(ctx, `${state.coins}`, 450, 32, 22, '#fff', 'left');
  text(ctx, `/ ${TUNING.targetCoins} target`, 496, 34, 13, '#e8c9a0', 'left', 'normal');
  // Score
  text(ctx, `SCORE ${state.score}`, 640, 32, 16, '#fff');
  // Timer bar
  const tw = 220;
  const tx = 760;
  ctx.fillStyle = '#5b4636';
  rr(ctx, tx, 18, tw, 26, 13); ctx.fill();
  const frac = Math.max(0, state.timeLeft / TUNING.shiftSeconds);
  ctx.fillStyle = frac < 0.2 ? '#ff5a4e' : '#6fbf4a';
  if (frac > 0) { rr(ctx, tx + 3, 21, (tw - 6) * frac, 20, 10); ctx.fill(); }
  const mm = Math.floor(state.timeLeft / 60);
  const ss = Math.floor(state.timeLeft % 60).toString().padStart(2, '0');
  text(ctx, `${mm}:${ss}`, tx + tw / 2, 31, 15, '#fff');
  // Hearts
  for (let i = 0; i < TUNING.maxHearts; i++) {
    const hx = 1010 + i * 30;
    ctx.fillStyle = i < state.hearts ? '#ff5a6e' : '#5b4636';
    ctx.beginPath();
    ctx.arc(hx - 6, 26, 8, 0, Math.PI * 2);
    ctx.arc(hx + 6, 26, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 13, 28); ctx.lineTo(hx + 13, 28); ctx.lineTo(hx, 44); ctx.closePath(); ctx.fill();
  }
  // Mute
  text(ctx, sfx.muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', 1180, 32, 12, '#e8c9a0');
  // Combo
  if (state.combo > 1) text(ctx, `COMBO x${state.combo}`, 640, 52, 13, '#ff9d5c');
}

// ---------- order board ----------

function drawBoard(ctx, state, t) {
  const { board } = LAYOUT;
  ctx.fillStyle = '#2f4f3e';
  rr(ctx, board.x, board.y, board.w, board.h, 12); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 5;
  rr(ctx, board.x, board.y, board.w, board.h, 12); ctx.stroke();
  text(ctx, '— ORDER BOARD —', board.x + board.w / 2, board.y + 18, 15, '#ffe9a8');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet…', board.x + board.w / 2, board.y + 110, 16, '#cfe8c9', 'center', 'normal');
  }
  state.orders.forEach((order, i) => {
    const dish = dishOf(order);
    const ty = board.y + 34 + i * 58;
    const ready = state.plateReadyOrder === order.id;
    ctx.fillStyle = ready ? '#fff3c4' : '#fff8e6';
    rr(ctx, board.x + 10, ty, board.w - 20, 50, 8); ctx.fill();
    if (ready) {
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 3;
      rr(ctx, board.x + 10, ty, board.w - 20, 50, 8); ctx.stroke();
    }
    text(ctx, dish.name, board.x + 20, ty + 14, 15, '#3a2c22', 'left');
    text(ctx, `$${dish.price}`, board.x + board.w - 20, ty + 14, 14, '#a8542f', 'right');
    dish.recipe.forEach((ingId, j) => {
      const done = state.plate.includes(ingId) && ready === false;
      drawIngredient(ctx, ingId, board.x + 34 + j * 34, ty + 34, 12);
      if (done) {
        ctx.strokeStyle = '#5da83c';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(board.x + 34 + j * 34, ty + 34, 14, 0, Math.PI * 2); ctx.stroke();
      }
    });
    // Patience bar
    const pw = 150;
    const px = board.x + board.w - 20 - pw;
    ctx.fillStyle = '#e0d4bd';
    rr(ctx, px, ty + 30, pw, 9, 4); ctx.fill();
    const pf = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = pf > 0.5 ? '#6fbf4a' : pf > 0.25 ? '#f2a541' : '#e8443a';
    if (pf > 0) { rr(ctx, px, ty + 30, pw * pf, 9, 4); ctx.fill(); }
    if (ready) text(ctx, 'SERVE!', px - 8, ty + 34, 13, '#c96a3b', 'right');
  });
}

function drawBins(ctx, state) {
  const { bins, binW, binGap } = LAYOUT;
  text(ctx, 'INGREDIENTS — click to prep  (keys 1–8)', bins.x + 4, bins.y - 12, 13, '#fff8e6', 'left');
  BIN_ORDER.forEach((id, i) => {
    const ing = INGREDIENTS[id];
    const x = bins.x + i * (binW + binGap);
    ctx.fillStyle = '#f3e6cf';
    rr(ctx, x, bins.y, binW, bins.h, 10); ctx.fill();
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2;
    rr(ctx, x, bins.y, binW, bins.h, 10); ctx.stroke();
    drawIngredient(ctx, id, x + binW / 2, bins.y + 36, 24);
    text(ctx, ing.name, x + binW / 2, bins.y + 70, 12, '#3a2c22');
    text(ctx, ing.prep === 'chop' ? 'chop' : 'cook', x + binW / 2, bins.y + 86, 10, '#a8542f', 'center', 'normal');
    ctx.fillStyle = '#3a2c22';
    ctx.beginPath(); ctx.arc(x + 12, bins.y + 12, 9, 0, Math.PI * 2); ctx.fill();
    text(ctx, `${i + 1}`, x + 12, bins.y + 13, 11, '#fff');
  });
}

function drawChopping(ctx, state, t) {
  const { chopping } = LAYOUT;
  ctx.fillStyle = '#f3e6cf';
  rr(ctx, chopping.x, chopping.y, chopping.w, chopping.h, 10); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  rr(ctx, chopping.x, chopping.y, chopping.w, chopping.h, 10); ctx.stroke();
  text(ctx, 'CHOPPING BOARD', chopping.x + chopping.w / 2, chopping.y + 16, 13, '#3a2c22');
  if (state.board) {
    const ing = INGREDIENTS[state.board.ing];
    const cx = chopping.x + 120;
    const cy = chopping.y + 78;
    drawIngredient(ctx, state.board.ing, cx, cy, 34);
    // knife slashes show progress
    for (let i = 0; i < ing.chopHits; i++) {
      ctx.fillStyle = i < state.board.hits ? '#6fbf4a' : '#d8c9a8';
      ctx.beginPath(); ctx.arc(chopping.x + 210 + i * 24, cy, 8, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, `Click ${ing.chopHits - state.board.hits} more time${ing.chopHits - state.board.hits === 1 ? '' : 's'}!`, chopping.x + chopping.w / 2, chopping.y + 130, 12, '#a8542f');
    // knife
    ctx.save();
    ctx.translate(chopping.x + 250, chopping.y + 46 + Math.sin(t * 6) * 3);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#cfd6dd';
    rr(ctx, 0, 0, 34, 10, 4); ctx.fill();
    ctx.fillStyle = '#3a2c22';
    rr(ctx, 34, 1, 18, 8, 3); ctx.fill();
    ctx.restore();
  } else {
    text(ctx, 'Empty — pick a', chopping.x + chopping.w / 2, chopping.y + 66, 13, '#8a7a5c', 'center', 'normal');
    text(ctx, 'choppable ingredient', chopping.x + chopping.w / 2, chopping.y + 86, 13, '#8a7a5c', 'center', 'normal');
    text(ctx, '(tomato, lettuce, cheese,', chopping.x + chopping.w / 2, chopping.y + 112, 11, '#b3a586', 'center', 'normal');
    text(ctx, 'mushroom, berries)', chopping.x + chopping.w / 2, chopping.y + 128, 11, '#b3a586', 'center', 'normal');
  }
}

function drawStove(ctx, state, t) {
  const { stove, panW } = LAYOUT;
  ctx.fillStyle = '#5b4636';
  rr(ctx, stove.x, stove.y, stove.w, stove.h, 10); ctx.fill();
  text(ctx, 'STOVE', stove.x + stove.w / 2, stove.y + 16, 13, '#ffe9a8');
  state.pans.forEach((pan, i) => {
    const cx = stove.x + 78 + i * 148;
    const cy = stove.y + 88;
    // burner
    ctx.fillStyle = pan.state === 'cooking' ? '#ff9d5c' : '#3a2c22';
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
    // pan
    ctx.fillStyle = '#2e2a28';
    ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a4440';
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
    if (pan.ing) {
      const ing = INGREDIENTS[pan.ing];
      drawIngredient(ctx, pan.ing, cx, cy, 26);
      if (pan.state === 'cooking') {
        // progress ring
        ctx.strokeStyle = '#ffd76a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pan.progress);
        ctx.stroke();
        // steam
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (let s = 0; s < 3; s++) {
          const sy = cy - 46 - ((t * 30 + s * 18) % 40);
          ctx.beginPath();
          ctx.arc(cx - 14 + s * 14 + Math.sin(t * 3 + s) * 4, sy, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (pan.state === 'ready') {
        ctx.strokeStyle = '#6fbf4a';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.stroke();
        text(ctx, 'READY!', cx, cy - 58, 13, '#6fbf4a');
      } else if (pan.state === 'burnt') {
        ctx.fillStyle = 'rgba(20,20,20,0.75)';
        ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#777';
        ctx.beginPath(); ctx.arc(cx - 8, cy - 52 - ((t * 20) % 20), 6, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'BURNT — click to toss', cx, cy + 62, 11, '#ff8a7a');
      }
    } else {
      text(ctx, 'empty pan', cx, cy, 12, '#b3a586', 'center', 'normal');
    }
  });
}

function drawTray(ctx, state) {
  const { tray } = LAYOUT;
  ctx.fillStyle = '#f3e6cf';
  rr(ctx, tray.x, tray.y, tray.w, tray.h, 10); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  rr(ctx, tray.x, tray.y, tray.w, tray.h, 10); ctx.stroke();
  text(ctx, 'READY TRAY', tray.x + tray.w / 2, tray.y + 16, 13, '#3a2c22');
  if (state.tray.length === 0) {
    text(ctx, 'Chopped & cooked', tray.x + tray.w / 2, tray.y + 66, 11, '#8a7a5c', 'center', 'normal');
    text(ctx, 'items land here', tray.x + tray.w / 2, tray.y + 84, 11, '#8a7a5c', 'center', 'normal');
    text(ctx, 'Click one to plate it', tray.x + tray.w / 2, tray.y + 110, 11, '#a8542f', 'center', 'normal');
  }
  state.tray.forEach((ingId, i) => {
    const ix = tray.x + 30 + (i % 3) * 46;
    const iy = tray.y + 52 + Math.floor(i / 3) * 48;
    drawIngredient(ctx, ingId, ix, iy, 18);
  });
}

function drawPlate(ctx, state, t) {
  const { plate } = LAYOUT;
  ctx.fillStyle = '#f3e6cf';
  rr(ctx, plate.x, plate.y, plate.w, plate.h, 10); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  rr(ctx, plate.x, plate.y, plate.w, plate.h, 10); ctx.stroke();
  const ready = !!state.plateReadyOrder;
  const cx = plate.x + plate.w / 2;
  const cy = plate.y + 82;
  // plate
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx, cy, 56, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ready ? '#ffd76a' : '#d8c9a8';
  ctx.lineWidth = ready ? 5 : 3;
  ctx.beginPath(); ctx.arc(cx, cy, 56, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.stroke();
  // slots
  const slotPos = [[-32, -8], [32, -8], [0, 26]];
  slotPos.forEach(([dx, dy], i) => {
    if (state.plate[i]) {
      drawIngredient(ctx, state.plate[i], cx + dx, cy + dy, 19, { glow: ready });
    } else {
      ctx.strokeStyle = '#d8c9a8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 19, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
  });
  if (ready) {
    const pulse = 1 + 0.08 * Math.sin(t * 5);
    ctx.save();
    ctx.translate(cx, plate.y + 16);
    ctx.scale(pulse, pulse);
    text(ctx, 'READY TO SERVE!', 0, 0, 14, '#c96a3b');
    ctx.restore();
  } else {
    text(ctx, `PLATE — ${state.plate.length}/3`, cx, plate.y + 16, 13, '#3a2c22');
  }
}

function drawBellAndTrash(ctx, state, t) {
  const { bell, trash } = LAYOUT;
  // Serve bell
  const ready = !!state.plateReadyOrder;
  ctx.fillStyle = ready ? '#ffe9a8' : '#f3e6cf';
  rr(ctx, bell.x, bell.y, bell.w, bell.h, 10); ctx.fill();
  ctx.strokeStyle = ready ? '#ffd76a' : '#8a5a33';
  ctx.lineWidth = ready ? 4 : 2;
  rr(ctx, bell.x, bell.y, bell.w, bell.h, 10); ctx.stroke();
  const bx = bell.x + bell.w / 2;
  const by = bell.y + 78;
  const ring = ready ? Math.sin(t * 6) * 0.06 : 0;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(ring);
  ctx.fillStyle = '#f7c948';
  ctx.beginPath(); ctx.arc(0, 0, 40, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(-44, -4, 88, 8);
  ctx.fillStyle = '#d9a41f';
  ctx.beginPath(); ctx.arc(0, 8, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  text(ctx, ready ? 'RING TO SERVE!' : 'SERVE BELL', bx, bell.y + 16, 13, ready ? '#c96a3b' : '#3a2c22');
  text(ctx, ready ? '(or click the ticket)' : 'serves a finished plate', bx, bell.y + 132, 11, '#8a7a5c', 'center', 'normal');
  // Trash
  ctx.fillStyle = '#f3e6cf';
  rr(ctx, trash.x, trash.y, trash.w, trash.h, 10); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  rr(ctx, trash.x, trash.y, trash.w, trash.h, 10); ctx.stroke();
  ctx.fillStyle = '#7a6a58';
  rr(ctx, trash.x + 58, trash.y + 34, 48, 46, 6); ctx.fill();
  ctx.fillStyle = '#5b4636';
  ctx.fillRect(trash.x + 52, trash.y + 28, 60, 8);
  text(ctx, 'TRASH — clear plate', trash.x + trash.w / 2, trash.y + 16, 12, '#3a2c22');
}

function drawFooter(ctx, state) {
  text(ctx, '1) Click an ingredient to chop or cook it   •   2) Click the tray to plate it   •   3) Ring the bell to serve   •   Space = chop   •   S = serve   •   C = clear   •   P = pause',
    LOGICAL_W / 2, 616, 13, '#fff8e6', 'center', 'normal');
  text(ctx, 'Tip: serve fast for a bigger tip — a ticket that waits too long walks out and costs a heart!',
    LOGICAL_W / 2, 642, 13, '#ffd76a', 'center', 'normal');
  if (state.message && state.messageLife > 0) {
    ctx.fillStyle = 'rgba(58,44,34,0.92)';
    const w = ctx.measureText(state.message).width + 40;
    rr(ctx, LOGICAL_W / 2 - w / 2, 660, w, 34, 17); ctx.fill();
    text(ctx, state.message, LOGICAL_W / 2, 678, 14, '#fff');
  }
}

function drawOverlay(ctx, state, t, onStart) {
  ctx.fillStyle = 'rgba(30,20,12,0.55)';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  const px = 340;
  const py = state.phase === 'title' ? 130 : 110;
  const pw = 600;
  const ph = state.phase === 'title' ? 440 : 480;
  ctx.fillStyle = '#fff8e6';
  rr(ctx, px, py, pw, ph, 18); ctx.fill();
  ctx.strokeStyle = '#c96a3b';
  ctx.lineWidth = 4;
  rr(ctx, px, py, pw, ph, 18); ctx.stroke();
  if (state.phase === 'title') {
    text(ctx, 'SIMMER & SERVE', px + pw / 2, py + 52, 44, '#c96a3b');
    text(ctx, 'A cozy bistro dinner rush', px + pw / 2, py + 92, 18, '#5b4636', 'center', 'normal');
    // mini dish parade
    ['pasta', 'salad', 'steak', 'tart'].forEach((d, i) => {
      const dish = DISHES[d];
      const dx = px + 110 + i * 130;
      ctx.fillStyle = dish.color;
      ctx.beginPath(); ctx.arc(dx, py + 168, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(dx, py + 168, 34, 0, Math.PI * 2); ctx.fill();
      dish.recipe.forEach((ingId, j) => drawIngredient(ctx, ingId, dx - 26 + j * 26, py + 168, 11));
      text(ctx, dish.name, dx, py + 228, 13, '#3a2c22');
      text(ctx, `$${dish.price}`, dx, py + 248, 12, '#a8542f', 'center', 'normal');
    });
    text(ctx, 'Tickets arrive on the order board. Chop, cook, plate, serve —', px + pw / 2, py + 296, 15, '#3a2c22', 'center', 'normal');
    text(ctx, 'before patience runs out. Earn 120 coins in 3 minutes to win!', px + pw / 2, py + 320, 15, '#3a2c22', 'center', 'normal');
    // Start button
    const bw = 260;
    const bh = 60;
    const bx = px + pw / 2 - bw / 2;
    const by = py + 352;
    ctx.fillStyle = '#c96a3b';
    rr(ctx, bx, by, bw, bh, 14); ctx.fill();
    text(ctx, 'START THE RUSH', px + pw / 2, by + 31, 20, '#fff');
    state.startButton = { x: bx, y: by, w: bw, h: bh };
  } else {
    const won = state.won;
    text(ctx, won ? 'SHIFT COMPLETE!' : 'SHIFT OVER', px + pw / 2, py + 52, 38, won ? '#6fbf4a' : '#c96a3b');
    text(ctx, won ? 'The bistro loves you — target reached!' : 'The dinner rush got away… try again!', px + pw / 2, py + 92, 16, '#5b4636', 'center', 'normal');
    // stars
    for (let i = 0; i < 3; i++) {
      const sx = px + pw / 2 - 90 + i * 90;
      const sy = py + 158;
      ctx.fillStyle = i < state.stars ? '#ffd76a' : '#d8c9a8';
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        const rad = k % 2 === 0 ? 34 : 15;
        const vx = sx + Math.cos(a) * rad;
        const vy = sy + Math.sin(a) * rad;
        if (k === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath(); ctx.fill();
    }
    const rows = [
      ['Coins earned', `${state.coins} / ${TUNING.targetCoins}`],
      ['Score', `${state.score}`],
      ['Dishes served', `${state.stats.served}`],
      ['Orders lost', `${state.stats.lost}`],
      ['Best combo', `x${state.bestCombo}`],
    ];
    rows.forEach(([label, value], i) => {
      const ry = py + 226 + i * 34;
      text(ctx, label, px + 90, ry, 16, '#5b4636', 'left', 'normal');
      text(ctx, value, px + pw - 90, ry, 16, '#3a2c22', 'right');
    });
    const bw = 260;
    const bh = 60;
    const bx = px + pw / 2 - bw / 2;
    const by = py + 400;
    ctx.fillStyle = '#c96a3b';
    rr(ctx, bx, by, bw, bh, 14); ctx.fill();
    text(ctx, 'PLAY AGAIN', px + pw / 2, by + 31, 20, '#fff');
    state.startButton = { x: bx, y: by, w: bw, h: bh };
  }
  void onStart;
  void t;
}

export function draw(ctx, state, t, sfx) {
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
  if (state.phase === 'playing') state.startButton = null;
  drawKitchen(ctx, t);
  drawHUD(ctx, state, sfx);
  drawBoard(ctx, state, t);
  drawBins(ctx, state);
  drawChopping(ctx, state, t);
  drawStove(ctx, state, t);
  drawTray(ctx, state);
  drawPlate(ctx, state, t);
  drawBellAndTrash(ctx, state, t);
  drawFooter(ctx, state);
  // particles
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // floaters
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    text(ctx, f.text, f.x, f.y, 18, f.color);
  }
  ctx.globalAlpha = 1;
  if (state.phase !== 'playing') drawOverlay(ctx, state, t);
}

export function hitRegions(state) {
  // Shared with input handling: every clickable rect, in draw order.
  const regions = [];
  const { bins, binW, binGap, chopping, stove, panW, tray, plate, bell, trash, board } = LAYOUT;
  BIN_ORDER.forEach((id, i) => {
    regions.push({ kind: 'bin', id, x: bins.x + i * (binW + binGap), y: bins.y, w: binW, h: bins.h });
  });
  regions.push({ kind: 'board', x: chopping.x, y: chopping.y, w: chopping.w, h: chopping.h });
  state.pans.forEach((pan, i) => {
    regions.push({
      kind: 'pan', index: i,
      x: stove.x + 78 + i * 148 - panW / 2, y: stove.y + 30, w: panW, h: 120,
    });
  });
  state.tray.forEach((ingId, i) => {
    regions.push({
      kind: 'tray', index: i,
      x: tray.x + 30 + (i % 3) * 46 - 20, y: tray.y + 52 + Math.floor(i / 3) * 48 - 20, w: 40, h: 40,
    });
  });
  regions.push({ kind: 'plate', x: plate.x, y: plate.y, w: plate.w, h: plate.h });
  regions.push({ kind: 'bell', x: bell.x, y: bell.y, w: bell.w, h: bell.h });
  regions.push({ kind: 'trash', x: trash.x, y: trash.y, w: trash.w, h: trash.h });
  state.orders.forEach((order, i) => {
    regions.push({
      kind: 'ticket', id: order.id,
      x: board.x + 10, y: board.y + 34 + i * 58, w: board.w - 20, h: 50,
    });
  });
  if (state.startButton) regions.push({ kind: 'start', ...state.startButton });
  return regions;
}
