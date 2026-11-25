// Simmer & Serve — configuration: ingredients, dishes, tuning and layout.
// All original content: a cozy bistro dinner-rush cooking game.

export const LOGICAL_W = 1280;
export const LOGICAL_H = 720;

export const TUNING = {
  shiftSeconds: 180, // a 3 minute dinner rush
  targetCoins: 120, // coins needed to win the shift
  maxHearts: 3, // lost orders cost a heart; no hearts ends the shift early
  maxOrders: 3, // tickets on the board at once
  orderEveryMin: 9, // seconds between new orders, early
  orderEveryMax: 16, // seconds between new orders, late
  patienceSeconds: 62, // how long a ticket waits before walking out
  burnSeconds: 6, // a finished pan burns if left this long
  tipMax: 12, // extra coins for serving fast, scaled by patience left
  comboBonus: 2, // extra coins per combo step
};

// Ingredients. prep: 'chop' goes to the chopping board, 'cook' goes to a pan.
export const INGREDIENTS = {
  tomato: { id: 'tomato', name: 'Tomato', prep: 'chop', chopHits: 3, color: '#e8443a', dark: '#b32d24' },
  lettuce: { id: 'lettuce', name: 'Lettuce', prep: 'chop', chopHits: 3, color: '#5da83c', dark: '#3e7a26' },
  cheese: { id: 'cheese', name: 'Cheese', prep: 'chop', chopHits: 2, color: '#f7c948', dark: '#d9a41f' },
  mushroom: { id: 'mushroom', name: 'Mushroom', prep: 'chop', chopHits: 3, color: '#c98f5f', dark: '#9a6a42' },
  berries: { id: 'berries', name: 'Berries', prep: 'chop', chopHits: 2, color: '#7b4fd0', dark: '#5a34a3' },
  pasta: { id: 'pasta', name: 'Pasta', prep: 'cook', cookTime: 6, color: '#f2d38a', dark: '#c9a45c' },
  steak: { id: 'steak', name: 'Steak', prep: 'cook', cookTime: 8, color: '#a8542f', dark: '#7c3a1e' },
  dough: { id: 'dough', name: 'Dough', prep: 'cook', cookTime: 7, color: '#f0e2c8', dark: '#cbb690' },
};

export const BIN_ORDER = ['tomato', 'lettuce', 'cheese', 'mushroom', 'berries', 'pasta', 'steak', 'dough'];

// Dishes: each needs exactly three prepared components.
export const DISHES = {
  pasta: {
    id: 'pasta', name: 'Sunny Pasta', price: 18,
    recipe: ['pasta', 'tomato', 'cheese'],
    blurb: 'Golden pasta, fresh tomato, melted cheese',
    color: '#f2a541',
  },
  salad: {
    id: 'salad', name: 'Garden Salad', price: 14,
    recipe: ['lettuce', 'tomato', 'mushroom'],
    blurb: 'Crisp leaves, tomato and earthy mushroom',
    color: '#6fbf4a',
  },
  steak: {
    id: 'steak', name: 'Sizzle Steak', price: 24,
    recipe: ['steak', 'mushroom', 'cheese'],
    blurb: 'Seared steak, mushroom and cheese melt',
    color: '#c96a3b',
  },
  tart: {
    id: 'tart', name: 'Berry Tart', price: 20,
    recipe: ['dough', 'berries', 'cheese'],
    blurb: 'Baked crust, warm berries, soft cheese',
    color: '#9a6ee0',
  },
};

export const DISH_ORDER = ['pasta', 'salad', 'steak', 'tart'];

// Fixed logical layout (canvas is 1280x720). Input hit-testing uses the same rects.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 62 },
  board: { x: 872, y: 74, w: 384, h: 208 },
  bins: { x: 24, y: 300, w: 800, h: 96 },
  binW: 96, binGap: 4,
  chopping: { x: 24, y: 420, w: 300, h: 150 },
  stove: { x: 348, y: 420, w: 300, h: 150 },
  panW: 138,
  tray: { x: 672, y: 420, w: 152, h: 150 },
  plate: { x: 848, y: 420, w: 220, h: 150 },
  bell: { x: 1092, y: 420, w: 164, h: 150 },
  trash: { x: 1092, y: 300, w: 164, h: 96 },
  footer: { x: 0, y: 592, w: 1280, h: 128 },
};
