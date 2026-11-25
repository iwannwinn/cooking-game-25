// Simmer & Serve — staged scenes for the entry screenshots.
// Each shot is a real render of the running game with a fixed, seeded state:
//   ?shot=start    title screen over the kitchen
//   ?shot=play     mid-rush: tickets, ingredients, chopping, timer running
//   ?shot=assemble a dish mid-assembly on the plate, pans cooking
//   ?shot=serve    a finished plate ready to ring the bell
// The game is fully playable from any staged scene.

import { TUNING } from './config.js';
import { createState, refreshPlateReadyForShot } from './logic.js';

export function stageShot(name, seed = 1) {
  const state = createState();
  state.rngSeed = seed * 7919 + 13;
  state.phase = 'playing';
  if (name === 'start') {
    state.phase = 'title';
    // A lively kitchen behind the title: two tickets already up.
    state.orders = [
      { id: 1, dish: 'pasta', patience: 48, maxPatience: TUNING.patienceSeconds },
      { id: 2, dish: 'salad', patience: 55, maxPatience: TUNING.patienceSeconds },
    ];
    state.coins = 0;
    state.score = 0;
    return state;
  }
  state.timeLeft = 134;
  state.coins = 42;
  state.score = 610;
  state.combo = 2;
  state.orders = [
    { id: 1, dish: 'pasta', patience: 44, maxPatience: TUNING.patienceSeconds },
    { id: 2, dish: 'steak', patience: 30, maxPatience: TUNING.patienceSeconds },
    { id: 3, dish: 'tart', patience: 55, maxPatience: TUNING.patienceSeconds },
  ];
  if (name === 'play') {
    state.board = { ing: 'tomato', hits: 1 };
    state.pans = [
      { ing: 'pasta', progress: 0.55, state: 'cooking', burn: 0 },
      { ing: null, progress: 0, state: 'empty', burn: 0 },
    ];
    state.tray = ['cheese', 'lettuce'];
    state.plate = [];
  } else if (name === 'assemble') {
    state.board = { ing: 'mushroom', hits: 2 };
    state.pans = [
      { ing: 'steak', progress: 0.8, state: 'cooking', burn: 0 },
      { ing: 'dough', progress: 1, state: 'ready', burn: 2 },
    ];
    state.tray = ['cheese', 'berries'];
    state.plate = ['steak', 'mushroom'];
    state.timeLeft = 98;
    state.coins = 64;
    state.score = 940;
  } else if (name === 'serve') {
    state.board = null;
    state.pans = [
      { ing: null, progress: 0, state: 'empty', burn: 0 },
      { ing: 'pasta', progress: 1, state: 'ready', burn: 1 },
    ];
    state.tray = ['lettuce'];
    // Sunny Pasta complete on the plate, matching ticket #1.
    state.plate = ['pasta', 'tomato', 'cheese'];
    state.timeLeft = 112;
    state.coins = 86;
    state.score = 1230;
    state.combo = 3;
    state.floaters = [{ x: 958, y: 470, text: '+24 coins', color: '#ffd76a', life: 1.2 }];
  }
  refreshPlateReadyForShot(state);
  return state;
}
