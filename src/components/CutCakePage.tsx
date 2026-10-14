import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BIRTHDAY_CONFIG } from '../types';
import { playCandleBlowSound, playSliceSound, playCelebrationChime } from '../utils/audio';

interface CutCakePageProps {
  onContinue: () => void;
}

export const CutCakePage: React.FC<CutCakePageProps> = ({ onContinue }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);

  const [candlesOut, setCandlesOut] = useState(false);
  const [cuts, setCuts] = useState<number[]>([]);
  const cutsRef = useRef<number[]>([]);
  cutsRef.current = cuts;

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const cream = useRef<Array<{ x: number; y: number; r: number; a: number }>>([]);

  const pieces = cuts.length === 0 ? 1 : cuts.length * 2;

  const drawCake = useCallback(() => {
    const wrap = stageRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    if (width < 2 || height < 2) return;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.33;

    /* Plate */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, radius * 1.42, radius * 1.3, 0, 0, Math.PI * 2);
    const plate = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.45);
    plate.addColorStop(0, '#fffdf8');
    plate.addColorStop(1, '#e8dccd');
    ctx.fillStyle = plate;
    ctx.shadowColor = 'rgba(37,25,29,.22)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 14;
    ctx.fill();
    ctx.restore();

    /* Wedges */
    const currentCuts = cutsRef.current;
    const angles = currentCuts.length
      ? currentCuts
          .reduce<number[]>((acc, a) => acc.concat([a, a + Math.PI]), [])
          .map((a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2))
          .sort((a, b) => a - b)
      : [];

    const wedges: Array<[number, number]> = [];
    if (angles.length === 0) {
      wedges.push([0, Math.PI * 2]);
    } else {
      for (let i = 0; i < angles.length; i++) {
        const start = angles[i];
        const end = i === angles.length - 1 ? angles[0] + Math.PI * 2 : angles[i + 1];
        wedges.push([start, end]);
      }
    }

    wedges.forEach(([start, end]) => {
      const mid = (start + end) / 2;
      const spread = currentCuts.length ? Math.min(10, 3 + currentCuts.length * 2) : 0;
      const ox = Math.cos(mid) * spread;
      const oy = Math.sin(mid) * spread;

      /* Sponge side */
      ctx.save();
      ctx.translate(ox, oy + 16);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = '#c98d63';
      ctx.fill();
      ctx.restore();

      /* Frosted top */
      ctx.save();
      ctx.translate(ox, oy);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      const top = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.4,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      top.addColorStop(0, '#fbe3e0');
      top.addColorStop(0.55, '#f2c6c4');
      top.addColorStop(1, '#d99a9c');
      ctx.fillStyle = top;
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#fff8ed';
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 4, start, end);
      ctx.stroke();

      if (currentCuts.length) {
        ctx.strokeStyle = 'rgba(123,57,68,.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(start) * radius, cy + Math.sin(start) * radius);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(end) * radius, cy + Math.sin(end) * radius);
        ctx.stroke();
      }
      ctx.restore();
    });

    /* Name writing on cake while whole */
    if (currentCuts.length === 0) {
      ctx.save();
      ctx.fillStyle = '#7b3944';
      ctx.font = `600 ${Math.round(radius * 0.28)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${BIRTHDAY_CONFIG.shortName} ❤️`, cx, cy);
      ctx.restore();
    }

    /* Candles */
    if (!candlesOut) {
      [-0.45, 0.45].forEach((offset) => {
        const x = cx + offset * radius * 0.5;
        const y = cy - radius * 0.55;
        ctx.fillStyle = '#fff8ed';
        ctx.fillRect(x - 4, y - 40, 8, 44);
        ctx.fillStyle = '#b85f68';
        ctx.fillRect(x - 4, y - 30, 8, 5);

        ctx.beginPath();
        ctx.ellipse(x, y - 48, 6, 11, 0, 0, Math.PI * 2);
        const flame = ctx.createRadialGradient(x, y - 46, 1, x, y - 48, 12);
        flame.addColorStop(0, '#fff3c4');
        flame.addColorStop(0.5, '#ffb648');
        flame.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = flame;
        ctx.fill();
      });
    }

    /* Cream splatter */
    cream.current.forEach((blob) => {
      ctx.save();
      ctx.globalAlpha = blob.a;
      ctx.fillStyle = '#fff8ed';
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [candlesOut]);

  useEffect(() => {
    drawCake();
    window.addEventListener('resize', drawCake);
    return () => window.removeEventListener('resize', drawCake);
  }, [drawCake]);

  const handleBlowCandles = () => {
    setCandlesOut(true);
    playCandleBlowSound();
    playCelebrationChime();
    setTimeout(() => {
      drawCake();
    }, 50);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!candlesOut) return;
    const wrap = stageRef.current;
    if (!wrap) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    const box = wrap.getBoundingClientRect();
    dragStart.current = { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!candlesOut) return;
    const wrap = stageRef.current;
    const knife = knifeRef.current;
    if (!wrap || !knife) return;

    const box = wrap.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    let rotation = 0;

    if (dragStart.current) {
      const dx = x - dragStart.current.x;
      const dy = y - dragStart.current.y;
      rotation = (Math.atan2(dy, dx) * 180) / Math.PI - 90;

      cream.current.push({
        x,
        y,
        r: 2 + Math.random() * 4,
        a: 0.5 + Math.random() * 0.4,
      });
      if (cream.current.length > 150) cream.current.shift();
      drawCake();
    }

    knife.style.left = `${x - 17}px`;
    knife.style.top = `${y - 30}px`;
    knife.style.right = 'auto';
    knife.style.transform = `rotate(${rotation}deg)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const wrap = stageRef.current;
    if (!wrap) return;

    const box = wrap.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    dragStart.current = null;

    if (Math.hypot(dx, dy) < 60) return;

    if (cuts.length < 6) {
      playSliceSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      const newCuts = cuts.concat([Math.atan2(dy, dx)]);
      setCuts(newCuts);
      cutsRef.current = newCuts;
      drawCake();
    }
  };

  return (
    <div className="chapter-page page-content">
      <div className="section-intro compact">
        <div>
          <p className="eyebrow">A special birthday ritual</p>
          <h2 id="cake-heading">
            {candlesOut ? 'Now cut the cake 🍰' : 'Blow out the candles first'}
          </h2>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <img
          src="/assets/bear-cake.jpeg"
          alt="Bear with cake"
          loading="lazy"
          style={{ maxHeight: '110px', width: 'auto', borderRadius: '12px', display: 'inline-block' }}
        />
      </div>

      {!candlesOut && (
        <button
          className="unlock-button"
          id="cake-candles-btn"
          style={{ width: 'auto', padding: '13px 26px', margin: '0 auto 12px' }}
          onClick={handleBlowCandles}
        >
          Blow out the candles 🕯️
        </button>
      )}

      <div
        className="cutcake-stage"
        id="cutcake-stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas className="cutcake-canvas" id="cutcake-canvas" ref={canvasRef} />

        <div
          className={`knife ${!candlesOut ? 'hidden' : ''}`}
          id="cake-knife"
          ref={knifeRef}
        >
          <svg viewBox="0 0 34 190" width="34" height="190">
            <defs>
              <linearGradient id="blade" x1="0" x2="1">
                <stop offset="0" stopColor="#f3f6f8" />
                <stop offset=".45" stopColor="#c7ced4" />
                <stop offset=".55" stopColor="#eef2f5" />
                <stop offset="1" stopColor="#98a1a8" />
              </linearGradient>
              <linearGradient id="handle" x1="0" x2="1">
                <stop offset="0" stopColor="#4a2b24" />
                <stop offset="1" stopColor="#25150f" />
              </linearGradient>
            </defs>
            <path d="M17 0 L26 34 L26 120 L8 120 L8 34 Z" fill="url(#blade)" />
            <rect x="7" y="120" width="20" height="10" rx="2" fill="#8d959b" />
            <rect x="9" y="130" width="16" height="58" rx="7" fill="url(#handle)" />
          </svg>
        </div>

        {candlesOut && (
          <span className="cut-count" id="cut-count">
            Pieces: {pieces}
          </span>
        )}

        <span className="cut-help" id="cut-help">
          {candlesOut
            ? 'drag the knife across the cake to slice it'
            : 'candles are still burning'}
        </span>
      </div>

      {pieces >= 4 && (
        <button
          className="unlock-button"
          id="cake-done-btn"
          style={{ width: 'auto', padding: '13px 26px', marginTop: '12px', margin: '12px auto 0' }}
          onClick={onContinue}
        >
          Cake is served, open your gift 🎁
        </button>
      )}
    </div>
  );
};
