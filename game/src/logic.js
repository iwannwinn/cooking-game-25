// Simmer & Serve — game state and rules (no drawing here).
// Flow: take an order from the board -> chop or cook its ingredients ->
// plate the three components -> ring the bell to serve -> earn coins.

import { DISHES, DISH_ORDER, INGREDIENTS, TUNING } from './config.js';

let nextOrderId = 1;

export function createState() {
  return {
    phase: 'title', // title | playing | over
    timeLeft: TUNING.shiftSeconds,
    coins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hearts: TUNING.maxHearts,
    orders: [], // {id, dish, patience, maxPatience}
    orderTimer: 4, // first ticket arrives quickly
    board: null, // {ing, hits} on the chopping board
    pans: [
      { ing: null, progress: 0, state: 'empty', burn: 0 }, // state: empty|cooking|ready|burnt
      { ing: null, progress: 0, state: 'empty', burn: 0 },
    ],
    tray: [], // prepared components waiting to be plated
    plate: [], // components on the plate (max 3)
    plateReadyOrder: null, // order id the plate completes, or null
    particles: [],
    floaters: [], // {x, y, text, color, life}
    stats: { served: 0, lost: 0, burnt: 0, earned: 0 },
    won: false,
    stars: 0,
    message: '',
    messageLife: 0,
    shake: 0,
    lastTickSecond: -1,
    rngSeed: 1,
  };
}

export function seededRandom(state) {
  // Small deterministic PRNG so staged screenshots are reproducible.
  state.rngSeed = (state.rngSeed * 1103515245 + 12345) % 2147483648;
  return state.rngSeed / 2147483648;
}

function pickDish(state) {
  return DISH_ORDER[Math.floor(seededRandom(state) * DISH_ORDER.length)];
}

export function spawnOrder(state, sfx) {
  if (state.orders.length >= TUNING.maxOrders) return false;
  const dish = pickDish(state);
  state.orders.push({
    id: nextOrderId++,
    dish,
    patience: TUNING.patienceSeconds,
    maxPatience: TUNING.patienceSeconds,
  });
  if (sfx) sfx.orderIn();
  return true;
}

export function dishOf(order) {
  return DISHES[order.dish];
}

export function recipeNeeds(state, ing) {
  // True when some open order still needs this ingredient on top of the plate.
  return state.orders.some((o) => {
    const recipe = [...dishOf(o).recipe];
    for (const p of state.plate) {
      const i = recipe.indexOf(p);
      if (i >= 0) recipe.splice(i, 1);
    }
    return recipe.includes(ing);
  });
}

export function plateMatchesOrder(state) {
  if (state.plate.length !== 3) return null;
  const sorted = [...state.plate].sort().join('|');
  const match = state.orders.find((o) => [...dishOf(o).recipe].sort().join('|') === sorted);
  return match ? match.id : null;
}

function refreshPlateReady(state) {
  state.plateReadyOrder = plateMatchesOrder(state);
}

export function addFloater(state, x, y, text, color = '#fff') {
  state.floaters.push({ x, y, text, color, life: 1.4 });
}

export function burst(state, x, y, color, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 120;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      life: 0.6 + Math.random() * 0.5, max: 1.1, color, r: 2 + Math.random() * 4,
    });
  }
}

export function showMessage(state, text) {
  state.message = text;
  state.messageLife = 1.8;
}

function loseOrder(state, order, sfx) {
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.hearts -= 1;
  state.combo = 0;
  state.stats.lost += 1;
  if (sfx) sfx.error();
  addFloater(state, 1064, 130, 'Order walked out!', '#ff8a7a');
  refreshPlateReady(state);
  if (state.hearts <= 0) endShift(state, sfx);
}

export function refreshPlateReadyForShot(state) {
  refreshPlateReady(state);
}

export function serveOrder(state, orderId, sfx) {
  if (state.phase !== 'playing') return false;
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || state.plateReadyOrder !== orderId) return false;
  const dish = dishOf(order);
  const tip = Math.round((order.patience / order.maxPatience) * TUNING.tipMax);
  const comboBonus = state.combo * TUNING.comboBonus;
  const earned = dish.price + tip + comboBonus;
  state.coins += earned;
  state.score += earned * 10 + 50;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.stats.served += 1;
  state.stats.earned += earned;
  state.orders = state.orders.filter((o) => o.id !== orderId);
  state.plate = [];
  refreshPlateReady(state);
  burst(state, 1064, 290, '#ffd76a', 22);
  addFloater(state, 958, 480, `+${earned} coins`, '#ffd76a');
  if (state.combo > 1) addFloater(state, 958, 510, `Combo x${state.combo}!`, '#ff9d5c');
  if (sfx) { sfx.serve(); sfx.coin(); }
  return true;
}

export function serveReadyPlate(state, sfx) {
  if (state.plateReadyOrder) return serveOrder(state, state.plateReadyOrder, sfx);
  return false;
}

export function clickBin(state, ingId, sfx) {
  if (state.phase !== 'playing') return false;
  const ing = INGREDIENTS[ingId];
  if (!ing) return false;
  if (ing.prep === 'chop') {
    if (state.board) { showMessage(state, 'Chopping board is busy!'); if (sfx) sfx.error(); return false; }
    state.board = { ing: ingId, hits: 0 };
    if (sfx) sfx.pick();
    return true;
  }
  const pan = state.pans.find((p) => p.state === 'empty');
  if (!pan) { showMessage(state, 'No free pan — wait or serve first!'); if (sfx) sfx.error(); return false; }
  pan.ing = ingId;
  pan.progress = 0;
  pan.state = 'cooking';
  pan.burn = 0;
  if (sfx) sfx.place();
  return true;
}

export function clickBoard(state, sfx) {
  if (state.phase !== 'playing' || !state.board) return false;
  const ing = INGREDIENTS[state.board.ing];
  state.board.hits += 1;
  if (sfx) sfx.chop();
  burst(state, 174, 470, '#fff3c4', 4);
  if (state.board.hits >= ing.chopHits) {
    state.tray.push(state.board.ing);
    state.board = null;
    if (sfx) sfx.ding();
  }
  return true;
}

export function clickPan(state, index, sfx) {
  if (state.phase !== 'playing') return false;
  const pan = state.pans[index];
  if (!pan) return false;
  if (pan.state === 'ready') {
    state.tray.push(pan.ing);
    pan.ing = null;
    pan.progress = 0;
    pan.state = 'empty';
    if (sfx) sfx.pick();
    return true;
  }
  if (pan.state === 'burnt') {
    pan.ing = null;
    pan.progress = 0;
    pan.state = 'empty';
    pan.burn = 0;
    state.stats.burnt += 1;
    burst(state, 420 + index * 150, 470, '#666', 10);
    if (sfx) sfx.burn();
    showMessage(state, 'Burnt! Tossed in the bin.');
    return true;
  }
  return false;
}

export function clickTray(state, index, sfx) {
  if (state.phase !== 'playing') return false;
  const ing = state.tray[index];
  if (!ing) return false;
  if (state.plate.length >= 3) { showMessage(state, 'Plate is full — serve it!'); if (sfx) sfx.error(); return false; }
  if (!recipeNeeds(state, ing)) {
    showMessage(state, 'No open order needs that right now.');
    if (sfx) sfx.error();
    return false;
  }
  state.tray.splice(index, 1);
  state.plate.push(ing);
  refreshPlateReady(state);
  if (sfx) sfx.place();
  return true;
}

export function trashPlate(state, sfx) {
  if (state.phase !== 'playing') return false;
  if (state.plate.length === 0 && !state.board) return false;
  state.plate = [];
  state.board = null;
  refreshPlateReady(state);
  if (sfx) sfx.error();
  showMessage(state, 'Cleared the plate.');
  return true;
}

export function startShift(state, sfx) {
  const fresh = createState();
  Object.assign(state, fresh, { phase: 'playing' });
  spawnOrder(state, null);
  state.orderTimer = 9;
  if (sfx) sfx.orderIn();
}

export function endShift(state, sfx) {
  if (state.phase !== 'playing') return;
  state.phase = 'over';
  state.won = state.coins >= TUNING.targetCoins;
  state.stars = state.coins >= TUNING.targetCoins * 1.6 ? 3
    : state.coins >= TUNING.targetCoins ? 2
    : state.coins >= TUNING.targetCoins * 0.6 ? 1 : 0;
  if (sfx) { if (state.won) sfx.win(); else sfx.lose(); }
}

export function update(state, dt, sfx) {
  if (state.phase !== 'playing') {
    // Particles and floaters still animate on title / end screens.
    stepFx(state, dt);
    return;
  }
  state.timeLeft -= dt;
  const sec = Math.ceil(state.timeLeft);
  if (sec <= 10 && sec !== state.lastTickSecond && sec > 0) {
    state.lastTickSecond = sec;
    if (sfx) sfx.tick();
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endShift(state, sfx);
    return;
  }
  // Orders arrive over time.
  state.orderTimer -= dt;
  if (state.orderTimer <= 0) {
    if (spawnOrder(state, sfx)) {
      state.orderTimer = TUNING.orderEveryMin
        + seededRandom(state) * (TUNING.orderEveryMax - TUNING.orderEveryMin);
    } else {
      state.orderTimer = 4; // board full: retry soon
    }
  }
  // Patience drains; an impatient ticket walks out.
  for (const order of [...state.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) loseOrder(state, order, sfx);
  }
  if (state.phase !== 'playing') return;
  // Pans cook, then burn.
  for (const pan of state.pans) {
    if (pan.state === 'cooking') {
      const ing = INGREDIENTS[pan.ing];
      pan.progress += dt / ing.cookTime;
      if (pan.progress >= 1) {
        pan.progress = 1;
        pan.state = 'ready';
        pan.burn = 0;
        if (sfx) sfx.ding();
      }
    } else if (pan.state === 'ready') {
      pan.burn += dt;
      if (pan.burn >= TUNING.burnSeconds) {
        pan.state = 'burnt';
        if (sfx) sfx.burn();
        addFloater(state, 420, 440, 'Burnt!', '#999');
      }
    }
  }
  if (sfx) sfx.setSizzle(state.pans.some((p) => p.state === 'cooking'));
  if (state.messageLife > 0) state.messageLife -= dt;
  if (state.shake > 0) state.shake -= dt * 4;
  stepFx(state, dt);
}

function stepFx(state, dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.floaters) {
    f.y -= 34 * dt;
    f.life -= dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);
}
