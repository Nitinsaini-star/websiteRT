import React from 'react';
import { Heart, CakeSlice, Gift } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../types';

export const WelcomePage: React.FC = () => {
  return (
    <div className="welcome-page page-content">
      <div className="date-stamp">{BIRTHDAY_CONFIG.dobText}</div>

      <div className="hero-copy">
        <div className="bdy-sticker bdy-floaty bdy-hb" style={{ marginBottom: '16px' }}>
          <img
            src="/assets/happy-birthday.png"
            alt="Happy Birthday"
            loading="lazy"
            style={{ maxHeight: '110px', width: 'auto', margin: '0 auto', display: 'block' }}
          />
        </div>

        <p className="eyebrow">The world got brighter on this day</p>
        <h1>
          Happiest
          <br />
          <em>Birthday</em>
        </h1>
        <div className="name-ribbon">{BIRTHDAY_CONFIG.name}</div>
        <p className="hero-note">
          To Madam Jii, my favorite person, and the reason ordinary days feel so magical.
          May your special day be overflowing with sweetness, smiles, and endless warmth.
        </p>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="big-heart">
          <Heart fill="currentColor" size={56} />
        </div>
        <span className="tape tape-one"></span>
        <span className="scribble">Madam Jii is pure magic ✨</span>
        <div className="mini-card mini-card-one">
          <CakeSlice size={20} />
        </div>
        <div className="mini-card mini-card-two">
          <Gift size={20} />
        </div>
      </div>

      <p className="scroll-note">A birthday surprise made only for you ❤️</p>
    </div>
  );
};
