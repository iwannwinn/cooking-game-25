// Simmer & Serve — synthesized sound effects (WebAudio, no audio files).
// Every sound is generated at run time, so the game ships no audio assets.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = new Map(); // pan index -> {src, gain}
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type = 'sine', vol = 0.16, when = 0, slideTo = null) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.12, freq = 1200, when = 0) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t0);
  }

  chop() { this.noise(0.07, 0.22, 900); this.tone(180, 0.06, 'triangle', 0.12); }
  pick() { this.tone(520, 0.07, 'sine', 0.1, 0, 760); }
  place() { this.tone(340, 0.08, 'triangle', 0.12, 0, 260); }
  ding() { this.tone(1180, 0.35, 'sine', 0.14); this.tone(1760, 0.3, 'sine', 0.07, 0.02); }
  coin() { this.tone(990, 0.09, 'square', 0.07); this.tone(1320, 0.16, 'square', 0.07, 0.08); }
  serve() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.13, i * 0.07));
  }
  error() { this.tone(160, 0.16, 'sawtooth', 0.08, 0, 110); }
  burn() { this.noise(0.4, 0.16, 500); this.tone(220, 0.3, 'sawtooth', 0.07, 0, 90); }
  orderIn() { this.tone(660, 0.1, 'sine', 0.1); this.tone(880, 0.12, 'sine', 0.1, 0.09); }
  tick() { this.tone(980, 0.05, 'square', 0.05); }
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.13, i * 0.1));
  }
  lose() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.11, i * 0.12));
  }

  // A soft looping sizzle while any pan cooks; started/stopped by the game.
  setSizzle(on) {
    const ctx = this.ensure();
    if (!ctx) return;
    if (on && !this.sizzleNodes.has('loop')) {
      const len = ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2500;
      const gain = ctx.createGain();
      gain.gain.value = this.muted ? 0 : 0.018;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
      this.sizzleNodes.set('loop', { src, gain });
    } else if (!on && this.sizzleNodes.has('loop')) {
      const n = this.sizzleNodes.get('loop');
      try { n.src.stop(); } catch { /* already stopped */ }
      this.sizzleNodes.delete('loop');
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    const n = this.sizzleNodes.get('loop');
    if (n) n.gain.gain.value = this.muted ? 0 : 0.018;
    return this.muted;
  }
}
