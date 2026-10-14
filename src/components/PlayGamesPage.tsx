import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Gift, Sparkles, Play, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BIRTHDAY_CONFIG } from '../types';
import { TransparentVideo } from './TransparentVideo';
import { playAtmBeep, playCelebrationChime } from '../utils/audio';

interface PlayGamesPageProps {
  part: 1 | 2;
  onPartChange: (part: 1 | 2) => void;
  onContinue: () => void;
}

export const PlayGamesPage: React.FC<PlayGamesPageProps> = ({
  part,
  onPartChange,
  onContinue,
}) => {
  /* ================= Part 1: Scratch ================= */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [scratched, setScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const isScratching = useRef(false);

  const initScratchCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const area = areaRef.current;
    if (!canvas || !area) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = area.clientWidth;
    const height = area.clientHeight;
    if (width < 2 || height < 2) return;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#d6b48c';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fff8ed';
    ctx.font = '600 15px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH ME MADAM JII', width / 2, height / 2);

    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = i % 2 ? '#f7d1cf' : '#b85f68';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    if (part === 1) {
      setTimeout(initScratchCanvas, 50);
      window.addEventListener('resize', initScratchCanvas);
      return () => window.removeEventListener('resize', initScratchCanvas);
    }
  }, [part, initScratchCanvas]);

  const handleScratchMove = (clientX: number, clientY: number) => {
    if (!isScratching.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    setScratchProgress((p) => {
      const next = p + 2;
      if (next > 20 && !scratched) {
        setScratched(true);
        playAtmBeep(600, 'sine', 0.1);
      }
      return next;
    });
  };

  /* ================= Part 2: Love Meter ================= */
  const [meterValue, setMeterValue] = useState(20);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const startLoveMeter = () => {
    if (isMeasuring || isDone) return;
    setIsMeasuring(true);

    let current = 20;
    const interval = setInterval(() => {
      current += 4;
      setMeterValue(current);
      playAtmBeep(300 + current * 4, 'sine', 0.03);

      if (current >= 100) {
        clearInterval(interval);
        setIsMeasuring(false);
        setIsDone(true);
        playCelebrationChime();

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#b85f68', '#f2c6c4', '#ffffff', '#ffd700'],
          });
        } catch {
          // Ignore
        }
      }
    }, 32);
  };

  if (part === 1) {
    return (
      <div className="play-page page-content">
        <div className="section-intro compact">
          <div>
            <p className="eyebrow">A little birthday play • Part 1</p>
            <h2>Find the secret hiding under the sparkles</h2>
          </div>
        </div>

        <div className="game-solo-layout">
          <article className="game-card scratch-game" style={{ position: 'relative' }}>
            <TransparentVideo
              src="/assets/hug-bears.mp4"
              className="bdy-scratch-vid"
              label="Bears hugging"
            />

            <span className="game-tag">
              <Gift size={15} /> Secret prize
            </span>
            <h3>Madam Ji's Birthday Coupon</h3>

            <div className="scratch-area" id="scratch-area" ref={areaRef}>
              <div className="scratch-prize">
                <Heart fill="currentColor" size={28} />
                <strong>UNLIMITED HUGS & RESPECT</strong>
                <span>Valid forever for {BIRTHDAY_CONFIG.name}, especially on difficult days</span>
              </div>
              <canvas
                id="scratch-canvas"
                ref={canvasRef}
                onMouseDown={() => (isScratching.current = true)}
                onMouseUp={() => (isScratching.current = false)}
                onMouseLeave={() => (isScratching.current = false)}
                onMouseMove={(e) => handleScratchMove(e.clientX, e.clientY)}
                onTouchStart={() => (isScratching.current = true)}
                onTouchEnd={() => (isScratching.current = false)}
                onTouchCancel={() => (isScratching.current = false)}
                onTouchMove={(e) => {
                  if (e.touches[0]) {
                    handleScratchMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
              />
            </div>

            <p id="scratch-copy">
              {scratched
                ? 'Keep going, your special prize is revealed! ❤️'
                : 'Use your finger or cursor to scratch and reveal.'}
            </p>

            <button
              className={`game-proceed-btn ${scratched ? 'visible' : ''}`}
              id="scratch-proceed-btn"
              onClick={() => onPartChange(2)}
            >
              Proceed to Love Meter <Heart size={15} fill="currentColor" />
            </button>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="play-page page-content">
      <div className="section-intro compact">
        <div>
          <p className="eyebrow">A little birthday play • Part 2</p>
          <h2>How much love is in the air?</h2>
        </div>
      </div>

      <div className="game-solo-layout">
        <article className="game-card meter-game" style={{ position: 'relative' }}>
          <TransparentVideo
            src="/assets/i-love-you.mp4"
            className="bdy-meter-vid"
            label="Bear holding heart"
          />

          <span className="game-tag">
            <Sparkles size={15} /> Cute Experiment
          </span>
          <h3>How loved is {BIRTHDAY_CONFIG.name}?</h3>

          <div className="meter-visual">
            <div
              className="meter-fill"
              id="meter-fill"
              style={{
                transform: `scaleY(${Math.min(1, meterValue / 100)})`,
                transition: 'transform 0.05s linear',
              }}
            ></div>
            <Heart fill="currentColor" size={28} />
          </div>

          <strong className="meter-number" id="meter-number">
            {isDone ? '100% (∞)' : `${meterValue}%`}
          </strong>

          <p id="meter-copy">
            {isDone
              ? 'Result confirmed: Completely, endlessly, and infinitely loved! ❤️'
              : 'Press the button for a very scientific answer.'}
          </p>

          {!isDone ? (
            <button id="meter-button" onClick={startLoveMeter} disabled={isMeasuring}>
              <Play size={15} fill="currentColor" />{' '}
              {isMeasuring ? 'Measuring love…' : 'Measure the love'}
            </button>
          ) : (
            <button className="game-proceed-btn visible" onClick={onContinue}>
              Next: Memory ATM <ArrowRight size={15} />
            </button>
          )}
        </article>
      </div>
    </div>
  );
};
