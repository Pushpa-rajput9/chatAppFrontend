let audioCtx;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  return audioCtx;
};

/**
 * Synthesizes a soft "pop / smooch" sound with the Web Audio API.
 * No audio file to load or host - it's generated on the fly, so it
 * plays instantly and works offline.
 *
 * Note: browsers block audio until the page has seen at least one user
 * gesture (a click, a keypress, etc). Since sending a kiss is itself a
 * click, the sender always hears it; the receiver will too as long as
 * they've interacted with the page at all (typing a message, clicking
 * anywhere) before the kiss arrives - which is true in practice for an
 * open chat window.
 */
export const playKissSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Main "pop": a sine tone that slides down in pitch with a fast
    // attack/decay envelope.
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(650, now);
    pop.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    popGain.gain.setValueAtTime(0.0001, now);
    popGain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    pop.connect(popGain).connect(ctx.destination);
    pop.start(now);
    pop.stop(now + 0.2);

    // A light high "chirp" layered on top, giving it a "smooch" character
    // instead of sounding like a dull thud.
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = "sine";
    chirp.frequency.setValueAtTime(1200, now + 0.05);
    chirp.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
    chirpGain.gain.setValueAtTime(0.0001, now + 0.05);
    chirpGain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    chirp.connect(chirpGain).connect(ctx.destination);
    chirp.start(now + 0.05);
    chirp.stop(now + 0.25);
  } catch {
    // Audio is a nice-to-have here, never let it break the feature.
  }
};
