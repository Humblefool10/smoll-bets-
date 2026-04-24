// ── sound design ───────────────────────────────────────────────────────────
//
// three sounds. one for each emotional register:
//
// 1. stamp  — the commitment moment ("i'm in"). warm, low, decisive.
//             like a rubber seal hitting paper. you can't un-stamp.
//
// 2. chime  — daily ritual closure ("logged"). bright, short, clean.
//             like ringing a small bell once. the day's work is done.
//
// 3. pop    — celebration ("bet accepted"). bubbly, ascending, joyful.
//             paired with confetti. the peak-end moment.
//
// all generated with Web Audio API — no files, no latency, no loading.
// respects user preference: muted until first interaction.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

// warm, low thud — commitment
export function playStamp() {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(180, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.15);

  gain.gain.setValueAtTime(0.4, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.2);

  // add a subtle click layer
  const click = c.createOscillator();
  const clickGain = c.createGain();
  click.type = "square";
  click.frequency.setValueAtTime(600, c.currentTime);
  clickGain.gain.setValueAtTime(0.08, c.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.05);
  click.connect(clickGain);
  clickGain.connect(c.destination);
  click.start(c.currentTime);
  click.stop(c.currentTime + 0.05);
}

// bright, clean bell — ritual closure
export function playChime() {
  const c = getCtx();
  if (!c) return;

  const freqs = [880, 1108.73]; // A5, C#6 — major third, feels resolved
  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);

    const delay = i * 0.08;
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.2, c.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + delay + 0.35);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + 0.35);
  });
}

// bubbly ascending pop — celebration
export function playCelebrate() {
  const c = getCtx();
  if (!c) return;

  // ascending tone cluster: C6 → E6 → G6
  const freqs = [1046.5, 1318.5, 1568];
  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);

    const delay = i * 0.07;
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.18, c.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + delay + 0.3);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + 0.3);
  });

  // add sparkle noise
  const bufferSize = c.sampleRate * 0.15;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.03;
  }
  const noise = c.createBufferSource();
  const noiseGain = c.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.15, c.currentTime + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.4);
  noise.connect(noiseGain);
  noiseGain.connect(c.destination);
  noise.start(c.currentTime + 0.1);
}
