// Sovereign Soundscapes - Client-Side Web Audio Synthesizer
// Generates ambient binaural alpha-wave loops and mechanical keyboard switch clicks on the fly!

let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;
let breathingLFO = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export const playMechanicalClick = () => {
  try {
    initAudio();
    const now = audioCtx.currentTime;

    // 1. High-frequency switch metallic snap (Noise burst)
    const bufferSize = audioCtx.sampleRate * 0.02; // 20ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1600, now);
    noiseFilter.Q.setValueAtTime(8, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    // 2. Low-frequency tactile spring bounce (Sine sweep)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.025);

    oscGain.gain.setValueAtTime(0.12, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    // Play snap & click
    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Fail silently if browser blocks audio
  }
};

export const startAmbientDrone = () => {
  try {
    initAudio();
    const now = audioCtx.currentTime;

    if (ambientOsc1) return; // Already running

    // Master Gain
    ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(0.15, now + 2.0); // Smooth fade in

    // Binaural Beats Left Ear (220Hz Sub-bass carrier)
    const pannerL = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    if (pannerL) pannerL.pan.setValueAtTime(-0.8, now);

    ambientOsc1 = audioCtx.createOscillator();
    ambientOsc1.type = "triangle";
    ambientOsc1.frequency.setValueAtTime(220, now); // Left frequency

    // Binaural Beats Right Ear (228Hz -> creates 8Hz Alpha binaural wave)
    const pannerR = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    if (pannerR) pannerR.pan.setValueAtTime(0.8, now);

    ambientOsc2 = audioCtx.createOscillator();
    ambientOsc2.type = "sine";
    ambientOsc2.frequency.setValueAtTime(228, now); // Right frequency

    // Lowpass filter for warm analog feel
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(150, now); // Keep it ultra warm and deep

    // Wave/Breathing LFO (Low-frequency oscillator to swell volume gently)
    breathingLFO = audioCtx.createOscillator();
    breathingLFO.frequency.setValueAtTime(0.12, now); // One sweep every 8 seconds

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.05, now); // Gentle intensity swell

    // Connect LFO to masters
    breathingLFO.connect(lfoGain);
    lfoGain.connect(ambientGain.gain);

    // Route Left & Right channels
    if (pannerL && pannerR) {
      ambientOsc1.connect(pannerL);
      pannerL.connect(lowpass);

      ambientOsc2.connect(pannerR);
      pannerR.connect(lowpass);
    } else {
      ambientOsc1.connect(lowpass);
      ambientOsc2.connect(lowpass);
    }

    lowpass.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    // Start oscillators
    ambientOsc1.start(now);
    ambientOsc2.start(now);
    breathingLFO.start(now);
  } catch (e) {
    console.error("Ambient Focus loop failed to initialize", e);
  }
};

export const stopAmbientDrone = () => {
  try {
    if (!audioCtx || !ambientOsc1) return;
    const now = audioCtx.currentTime;

    // Smooth fade out
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(0, now + 1.5);

    setTimeout(() => {
      if (ambientOsc1) {
        ambientOsc1.stop();
        ambientOsc2.stop();
        breathingLFO.stop();
        ambientOsc1 = null;
        ambientOsc2 = null;
        breathingLFO = null;
      }
    }, 1600);
  } catch (e) {}
};

export const playCoinSound = () => {
  try {
    initAudio();
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const oscGain1 = audioCtx.createGain();

    osc1.type = "sine";
    // First Note (B5) starts immediately and ends after 0.08 seconds
    osc1.frequency.setValueAtTime(987.77, now);
    // Second Note (E6) starts at 0.08 seconds and decays
    osc1.frequency.setValueAtTime(1318.51, now + 0.08);

    oscGain1.gain.setValueAtTime(0.12, now);
    oscGain1.gain.setValueAtTime(0.12, now + 0.08);
    oscGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(oscGain1);
    oscGain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (e) {
    // Fail silently if audio is blocked
  }
};
