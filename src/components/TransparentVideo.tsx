import React, { useEffect, useRef } from 'react';

interface TransparentVideoProps {
  src: string;
  className?: string;
  label?: string;
}

export const TransparentVideo: React.FC<TransparentVideoProps> = ({ src, className = '', label = 'sticker' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId: number;
    let lastTime = 0;
    let ctx: CanvasRenderingContext2D | null = null;
    const LOWER = 28;
    const UPPER = 74;
    const RANGE = UPPER - LOWER;

    const renderLoop = (time: number) => {
      if (!canvas || !video) return;

      if (time - lastTime >= 24) {
        lastTime = time;
        if (video.videoWidth && video.videoHeight && !video.paused && !video.ended) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          if (!ctx) {
            ctx = canvas.getContext('2d', { willReadFrequently: true });
          }
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const d = frame.data;
              const len = d.length;
              for (let i = 0; i < len; i += 4) {
                const r = d[i];
                const g = d[i + 1];
                const b = d[i + 2];
                const maxC = r > g ? (r > b ? r : b) : (g > b ? g : b);
                if (maxC <= LOWER) {
                  d[i + 3] = 0;
                } else if (maxC < UPPER) {
                  const t = (maxC - LOWER) / RANGE;
                  d[i + 3] = Math.round(t * t * (3 - 2 * t) * 255);
                }
              }
              ctx.putImageData(frame, 0, 0);
            } catch {
              // Ignore cross-origin error if any
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    video.play().catch(() => {});
    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`bdy-vsticker ${className}`}
      role="img"
      aria-label={label}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="bdy-vsticker-source"
        style={{ display: 'none' }}
      />
      <canvas ref={canvasRef} className="bdy-vsticker-canvas" />
    </div>
  );
};
