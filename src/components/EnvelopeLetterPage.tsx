import React, { useState, useEffect } from 'react';
import { Heart, MailOpen, MailCheck, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../types';
import { TransparentVideo } from './TransparentVideo';
import { playAtmBeep } from '../utils/audio';

interface EnvelopeLetterPageProps {
  onContinue: () => void;
  view: 'envelope' | 'letter';
  onViewChange: (view: 'envelope' | 'letter') => void;
}

export const EnvelopeLetterPage: React.FC<EnvelopeLetterPageProps> = ({
  onContinue,
  view,
  onViewChange,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [typedParagraphs, setTypedParagraphs] = useState<string[]>([]);
  const [retypeKey, setRetypeKey] = useState(0);

  const letterData = [
    `My dearest ${BIRTHDAY_CONFIG.name} (${BIRTHDAY_CONFIG.madamTitle}),`,
    `Happy Birthday to the most special person in my universe! Born on 18th October 2009, your gentle presence, kindness, and that effortless smile bring unmatched joy into my world. Your laughter can brighten even the gloomiest day.`,
    `I pray this year unfolds with gentle mornings, loud and carefree laughter, grand dreams coming true, and every ounce of happiness you deserve. Madam Jii, you are truly one of a kind.`,
    `Thank you for being my calm, my favorite hello, my greatest comfort, and my brightest blessing.`,
    `Always wishing you the very best, with all my love and deepest respect ❤️`,
  ];

  const handleOpenEnvelope = () => {
    setIsOpening(true);
    playAtmBeep(880, 'sine', 0.2);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 50, 40]);
    }
    setTimeout(() => {
      setIsOpening(false);
      onViewChange('letter');
    }, 700);
  };

  useEffect(() => {
    if (view !== 'letter') return;
    setTypedParagraphs([]);

    let pIndex = 0;
    let charIndex = 0;
    const currentLines = ['', '', '', '', ''];

    const timer = setInterval(() => {
      if (pIndex >= letterData.length) {
        clearInterval(timer);
        return;
      }

      const targetText = letterData[pIndex];
      charIndex += 2;
      if (charIndex > targetText.length) {
        currentLines[pIndex] = targetText;
        pIndex++;
        charIndex = 0;
      } else {
        currentLines[pIndex] = targetText.slice(0, charIndex);
      }

      setTypedParagraphs([...currentLines]);
    }, 18);

    return () => clearInterval(timer);
  }, [view, retypeKey]);

  if (view === 'envelope') {
    return (
      <div className="envelope-page page-content">
        <div className="section-intro">
          <div>
            <p className="eyebrow">A note from my heart</p>
            <h2>There are things I need you to know</h2>
          </div>
        </div>

        <div className="envelope-wrapper">
          <TransparentVideo
            src="/assets/cheek-love.mp4"
            className="bdy-letter-vid"
            label="Bears kissing cheeks"
          />

          <button
            className={`envelope ${isOpening ? 'open' : ''}`}
            id="envelope"
            aria-label="Open birthday letter"
            onClick={handleOpenEnvelope}
          >
            <div className="envelope-back"></div>
            <div className="envelope-front">
              <Heart fill="currentColor" size={24} />
            </div>
            <span className="open-prompt" id="open-prompt">
              {isOpening ? (
                <>
                  Opening letter… <Heart size={14} fill="currentColor" />
                </>
              ) : (
                <>
                  Tap to open <Sparkles size={14} />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="letter-page page-content">
      <div className="section-intro compact">
        <div>
          <p className="eyebrow">A note from my heart</p>
          <h2>A letter written for Madam Jii</h2>
        </div>
      </div>

      <div className="letter-card-wrapper">
        <article className="letter-card" id="letter-card">
          <div className="letter-card-header">
            <div className="letter-stamp">
              <MailCheck size={20} />
              <span>{BIRTHDAY_CONFIG.dobStamp}</span>
            </div>
            <div className="letter-tag">
              <Heart size={14} fill="currentColor" /> Sealed with Love
            </div>
          </div>

          <div className="letter-body" id="letter-body">
            <p className="letter-salutation">{typedParagraphs[0] || letterData[0]}</p>
            <p>{typedParagraphs[1] || letterData[1]}</p>
            <p>{typedParagraphs[2] || letterData[2]}</p>
            <p>{typedParagraphs[3] || letterData[3]}</p>
            <strong className="letter-sign">{typedParagraphs[4] || letterData[4]}</strong>
          </div>

          <div className="letter-card-actions">
            <button
              className="letter-action-btn"
              id="letter-replay-btn"
              onClick={() => setRetypeKey((k) => k + 1)}
            >
              <RotateCcw size={14} /> Replay Note
            </button>
            <button
              className="letter-action-btn primary"
              id="letter-continue-btn"
              onClick={onContinue}
            >
              Next Chapter <ArrowRight size={14} />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
