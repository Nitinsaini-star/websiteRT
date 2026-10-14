import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BIRTHDAY_CONFIG } from '../types';
import { TransparentVideo } from './TransparentVideo';
import { playCelebrationChime, playAtmBeep } from '../utils/audio';

interface AcceptGiftPageProps {
  onReplay: () => void;
}

export const AcceptGiftPage: React.FC<AcceptGiftPageProps> = ({ onReplay }) => {
  const [opened, setOpened] = useState(false);

  const handleOpenGift = () => {
    if (opened) return;
    setOpened(true);
    playCelebrationChime();
    playAtmBeep(1200, 'sine', 0.2);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    try {
      // Magnificent confetti burst
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="chapter-page page-content">
      <div className="section-intro compact">
        <div>
          <p className="eyebrow">A little surprise for you</p>
          <h2 id="gift-heading">
            {opened ? 'It was always yours, Madam Jii ❤️' : 'One last thing, accept your gift'}
          </h2>
        </div>
      </div>

      <div className="gift-stage" id="gift-stage">
        {!opened ? (
          <>
            <TransparentVideo
              src="/assets/gift-box.mp4"
              className="bdy-gift-vid"
              label="Gift box opening"
            />

            <button
              className="gift-box"
              id="gift-box"
              aria-label="Open your gift"
              onClick={handleOpenGift}
              style={{ border: 0, background: 'none', padding: 0 }}
            >
              <span className="gift-body"></span>
              <span className="gift-shine"></span>
              <span className="gift-ribbon-v"></span>
              <span className="gift-lid"></span>
              <span className="gift-bow">
                <svg width="70" height="46" viewBox="0 0 70 46" fill="currentColor">
                  <path d="M35 30C24 30 18 22 18 14S24 2 30 6s5 16 5 24Zm0 0c11 0 17-8 17-16S46 2 40 6s-5 16-5 24Z" />
                  <circle cx="35" cy="31" r="8" />
                </svg>
              </span>
            </button>
            <p className="cut-help" id="gift-hint" style={{ position: 'static', transform: 'none' }}>
              tap the box to accept your gift
            </p>
          </>
        ) : (
          <div className="gift-reveal" id="gift-reveal" style={{ animation: 'fade-up 0.8s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <img
                src="/assets/thank-you.png"
                alt="Thank You Madam Jii"
                loading="lazy"
                style={{ maxHeight: '120px', width: 'auto', display: 'inline-block' }}
              />
            </div>

            <h3>Happiest Birthday, {BIRTHDAY_CONFIG.name}!</h3>
            <p>
              The real gift is not in any box. It is every moment of joy you bring, the locked door
              only your birthday code could open, the scratch card, the love meter that went past 100%,
              the letter written from the bottom of my heart, the Photo Bank ATM memory vault, and a
              cake sliced by your hands.
            </p>
            <p>Consider all of it yours, Madam Jii. Forever. No expiry, no conditions.</p>

            <div className="gift-coupons">
              <span className="gift-coupon">Unlimited Hugs & Smiles</span>
              <span className="gift-coupon">Late Night Talks & Ice Cream</span>
              <span className="gift-coupon">One Wish, Granted Always</span>
              <span className="gift-coupon">Me, By Your Side Forever</span>
            </div>

            <div className="signature">Gift accepted with love ❤️</div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                className="unlock-button"
                onClick={onReplay}
                style={{ width: 'auto', padding: '12px 24px', margin: '0 auto' }}
              >
                Replay From Beginning ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
