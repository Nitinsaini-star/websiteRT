import React, { useState } from 'react';
import { LockKeyhole, KeyRound, Sparkles, Heart, Stars } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BIRTHDAY_CONFIG } from '../types';
import { playAtmBeep, playCelebrationChime, startMusic } from '../utils/audio';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkey.trim().replace(/\D/g, '');

    // Allow 18102009 (full DOB) or 1810 (ATM pass)
    if (clean === BIRTHDAY_CONFIG.passkey || clean === BIRTHDAY_CONFIG.atmPin) {
      setError(false);
      setIsLoading(true);
      playCelebrationChime();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#b85f68', '#f2c6c4', '#d6b48c', '#ffffff'],
        });
      } catch {
        // Ignore
      }

      startMusic();

      window.setTimeout(() => {
        onUnlock();
      }, 2400);
    } else {
      setError(true);
      setPasskey('');
      setShake(true);
      playAtmBeep(260, 'sawtooth', 0.15);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 55, 100]);
      }
      setTimeout(() => setShake(false), 700);
    }
  };

  if (isLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-sticker">
          <Heart size={44} fill="currentColor" />
          <span className="orbit orbit-one">
            <Stars size={18} />
          </span>
          <span className="orbit orbit-two">
            <Sparkles size={15} />
          </span>
        </div>
        <h2>Unlocking your little universe</h2>
        <p>Gathering hugs, wishes and stars for Madam Jii</p>
        <div className="loading-track">
          <span style={{ animation: 'loading-fill 2.4s ease forwards' }}></span>
        </div>
      </main>
    );
  }

  return (
    <main className="lock-screen">
      <div className="floating-decor" aria-hidden="true">
        <Heart className="float-heart heart-a" fill="currentColor" size={26} />
        <Sparkles className="float-spark spark-a" size={20} />
        <Stars className="float-spark spark-b" size={24} />
        <Heart className="float-heart heart-b" fill="currentColor" size={30} />
        <span className="grain"></span>
      </div>

      <div className={`lock-card ${shake ? 'shake' : ''}`} id="lock-card">
        <div className="lock-seal">
          <LockKeyhole size={30} />
        </div>

        <p className="eyebrow">A little secret for</p>
        <h1>{BIRTHDAY_CONFIG.name}</h1>
        <p className="lock-copy">Something beautiful is waiting behind this tiny lock.</p>

        <form id="lock-form" onSubmit={handleSubmit}>
          <label htmlFor="passkey">Enter the passkey</label>
          <div className="input-wrap">
            <KeyRound size={18} />
            <input
              id="passkey"
              type="text"
              placeholder="DDMMYYYY (or 1810)"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value.replace(/\D/g, '').slice(0, 8))}
            />
          </div>

          <p className="hint">
            <Sparkles size={14} /> Hint: Birthday date (18102009) or ATM PIN (1810)
          </p>

          {error && (
            <p className="error-message">
              Nope, Madam Jii. That key does not fit. Try 1810 or 18102009 ❤️
            </p>
          )}

          <button className="unlock-button" type="submit">
            Open my surprise <Heart size={18} fill="currentColor" />
          </button>
        </form>

        <span className="tiny-note">Made with a ridiculous amount of love & respect</span>
      </div>
    </main>
  );
};
