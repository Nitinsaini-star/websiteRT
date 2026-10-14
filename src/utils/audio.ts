import { BIRTHDAY_CONFIG } from '../types';

let bgAudio: HTMLAudioElement | null = null;
let fadeInterval: number | null = null;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playAtmBeep(freq = 1400, type: OscillatorType = 'sine', duration = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors
  }
}

export function playCandleBlowSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore
  }
}

export function playSliceSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Ignore
  }
}

export function playCelebrationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }, idx * 110);
    });
  } catch {
    // Ignore
  }
}

export function initBgAudio(): HTMLAudioElement {
  if (bgAudio) return bgAudio;
  bgAudio = new Audio(BIRTHDAY_CONFIG.songUrl);
  bgAudio.loop = true;
  bgAudio.preload = 'auto';
  bgAudio.volume = 0;
  return bgAudio;
}

export function startMusic(onStarted?: () => void) {
  const audio = initBgAudio();
  getAudioContext();
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        fadeAudio(0.65, 1500);
        onStarted?.();
      })
      .catch(() => {
        // Fallback or user gesture requirement handled
      });
  }
}

export function stopMusic(onStopped?: () => void) {
  if (!bgAudio) return;
  fadeAudio(0, 600, () => {
    bgAudio?.pause();
    onStopped?.();
  });
}

function fadeAudio(targetVolume: number, duration: number, onComplete?: () => void) {
  if (!bgAudio) return;
  if (fadeInterval) {
    window.clearInterval(fadeInterval);
    fadeInterval = null;
  }
  const startVolume = bgAudio.volume;
  const startTime = performance.now();
  fadeInterval = window.setInterval(() => {
    if (!bgAudio) {
      if (fadeInterval) clearInterval(fadeInterval);
      return;
    }
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    bgAudio.volume = Math.max(0, Math.min(1, startVolume + (targetVolume - startVolume) * progress));
    if (progress >= 1) {
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
      onComplete?.();
    }
  }, 25);
}

export function isMusicPlaying(): boolean {
  return Boolean(bgAudio && !bgAudio.paused && bgAudio.volume > 0.05);
}
