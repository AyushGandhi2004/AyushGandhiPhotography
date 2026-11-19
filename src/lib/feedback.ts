/**
 * Quiet, synthesised UI feedback: no audio files, nothing loud.
 *
 * Levels are set so even at full system volume they sit well below normal speech:
 * every sound is a few milliseconds long, peaks around -30 dBFS, and is filtered to
 * the soft mid range (no piercing highs, no thumping lows).
 *
 * Browsers only allow sound after the visitor has tapped or clicked the page, so
 * nothing here can play before that — calls simply stay silent.
 */

const KEY = 'ag-sound';
let ctx: AudioContext | undefined;
let master: GainNode | undefined;

/** Sound is on unless the visitor turned it off. */
export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function setSound(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {}
}

function audio(): AudioContext | undefined {
  if (!soundOn()) return undefined;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return undefined;
      ctx = new AC();
      // One gentle master level. (No compressor: browsers add make-up gain that would
      // make these quiet sounds louder. Each sound's level is fixed instead.)
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'running') return ctx;
    // Starting audio is only allowed inside a tap/click/key press. Sounds scheduled now
    // play the moment it starts. Outside a gesture stay silent rather than queue a
    // sound that would fire at some random later tap.
    const active = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation?.isActive ?? true;
    if (!active) return undefined;
    void ctx.resume();
    return ctx;
  } catch {
    return undefined;
  }
}

/** A soft sine blip with a smooth attack and release (no clicks). */
function blip(c: AudioContext, freq: number, at: number, dur: number, peak: number) {
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** A short band-limited noise burst: the body of a mechanical click. */
function click(c: AudioContext, at: number, dur: number, freq: number, peak: number) {
  const t = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let max = 0;
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    max = Math.max(max, Math.abs(d[i]));
  }
  // Normalise so every click has the same level (random noise can otherwise spike).
  for (let i = 0; i < len; i++) d[i] /= max || 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = 1.4;
  const g = c.createGain();
  g.gain.value = peak;
  src.connect(bp).connect(g).connect(master!);
  src.start(t);
}

/** Focus confirmed: two quiet, rounded blips, like a camera's AF beep but softer and lower. */
export function focusBeep(): void {
  const c = audio();
  if (!c) return;
  blip(c, 1568, 0, 0.07, 0.05);
  blip(c, 1568, 0.09, 0.07, 0.05);
}

/** Shutter: a muted two-part curtain click. */
export function shutter(): void {
  const c = audio();
  if (!c) return;
  click(c, 0, 0.035, 2200, 0.09);
  click(c, 0.065, 0.03, 1700, 0.075);
}

/** One dial detent: a tiny rounded tick, like a picker wheel. */
export function tick(at = 0): void {
  const c = audio();
  if (!c) return;
  blip(c, 2200, at, 0.016, 0.022);
}

/* ---------- haptics ---------- */

let iosSwitch: HTMLLabelElement | undefined;

/**
 * A single light tap. Android uses the Vibration API with the shortest pulse that is
 * still felt. iPhone (iOS 18+) has no Vibration API, but toggling a native switch
 * control plays the system's own selection tick — the same one used by iOS pickers.
 * Must be called from a tap / click / key press.
 */
export function haptic(): void {
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(8);
      return;
    }
    // Only phones/tablets have a haptic engine; desktop browsers skip this entirely.
    if (!matchMedia('(pointer: coarse)').matches) return;
    if (!iosSwitch) {
      iosSwitch = document.createElement('label');
      iosSwitch.setAttribute('aria-hidden', 'true');
      iosSwitch.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      iosSwitch.appendChild(input);
      document.body.appendChild(iosSwitch);
    }
    const focused = document.activeElement as HTMLElement | null;
    iosSwitch.click();
    focused?.focus({ preventScroll: true });
  } catch {}
}
