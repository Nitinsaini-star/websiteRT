import React, { useState, useEffect, useRef } from 'react';
import { BIRTHDAY_CONFIG, MEMORIES_LIST, BALANCE_LIST } from '../types';
import { playAtmBeep, playCelebrationChime } from '../utils/audio';

interface AtmPageProps {
  onContinue: () => void;
  customPhotos?: string[];
  onOpenUploadModal?: () => void;
}

type AtmStep =
  | 'insert'
  | 'reading'
  | 'pin'
  | 'pinWrong'
  | 'pinOk'
  | 'menu'
  | 'vault'
  | 'memories'
  | 'checking'
  | 'balance'
  | 'wish'
  | 'wishDone'
  | 'exitAsk'
  | 'receipt'
  | 'cardReturn'
  | 'thanks';

export const AtmPage: React.FC<AtmPageProps> = ({
  onContinue,
  customPhotos = [],
  onOpenUploadModal,
}) => {
  const [step, setStep] = useState<AtmStep>('insert');
  const [pin, setPin] = useState('');
  const [cardStatus, setCardStatus] = useState<'idle' | 'inserting' | 'gone' | 'returning' | 'taken'>('idle');
  const [readingProgress, setReadingProgress] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [viewedCount, setViewedCount] = useState(1);
  const [wish, setWish] = useState('');
  const [balanceShown, setBalanceShown] = useState(false);
  const [receiptOut, setReceiptOut] = useState(0);
  const [receiptTaken, setReceiptTaken] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1600);
  };

  /* Insert Card Action */
  const handleInsertCard = () => {
    if (step !== 'insert' || cardStatus !== 'idle') return;
    setCardStatus('inserting');
    playAtmBeep(900, 'sine', 0.15);
    showToast('Card accepted • beep');

    setTimeout(() => {
      setCardStatus('gone');
      setStep('reading');
      setReadingProgress(0);

      const interval = setInterval(() => {
        setReadingProgress((p) => {
          const next = p + 12;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('pin'), 400);
            return 100;
          }
          return next;
        });
      }, 100);
    }, 1200);
  };

  /* Keypad Press */
  const handleKeyPress = (key: string) => {
    playAtmBeep(1200 + (key.charCodeAt(0) % 10) * 80, 'sine', 0.06);

    if (step === 'pin' || step === 'pinWrong') {
      if (key === 'C') {
        setPin('');
        return;
      }
      if (key === 'E') {
        if (pin === BIRTHDAY_CONFIG.atmPin) {
          playCelebrationChime();
          setStep('pinOk');
          setTimeout(() => setStep('menu'), 1300);
        } else {
          setStep('pinWrong');
          playAtmBeep(260, 'sawtooth', 0.2);
          setTimeout(() => {
            setPin('');
            setStep('pin');
          }, 1400);
        }
        return;
      }
      if (pin.length < 4) {
        setPin((prev) => prev + key);
      }
    } else if (step === 'menu') {
      if (['1', '2', '3', '4'].includes(key)) {
        handleMenuSelect(Number(key));
      }
    }
  };

  /* Menu Selection */
  const handleMenuSelect = (option: number) => {
    playAtmBeep(1100, 'sine', 0.08);
    if (option === 1) {
      setStep('vault');
      setReadingProgress(0);
      const interval = setInterval(() => {
        setReadingProgress((p) => {
          const next = p + 15;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setMemoryIndex(0);
              setStep('memories');
            }, 300);
            return 100;
          }
          return next;
        });
      }, 80);
    } else if (option === 2) {
      setBalanceShown(false);
      setStep('checking');
      setTimeout(() => {
        setStep('balance');
        setTimeout(() => setBalanceShown(true), 200);
      }, 1400);
    } else if (option === 3) {
      setStep('wish');
    } else if (option === 4) {
      setStep('exitAsk');
    }
  };

  /* Memory Navigation */
  const nextMemory = () => {
    playAtmBeep(1000, 'sine', 0.06);
    const next = Math.min(MEMORIES_LIST.length - 1, memoryIndex + 1);
    setMemoryIndex(next);
    setViewedCount((v) => Math.max(v, next + 1));
  };

  const prevMemory = () => {
    playAtmBeep(1000, 'sine', 0.06);
    setMemoryIndex((idx) => Math.max(0, idx - 1));
  };

  /* Exit & Print Receipt */
  const handleExit = () => {
    setReceiptOut(0);
    setReceiptTaken(false);
    setStep('receipt');
    playAtmBeep(800, 'sine', 0.1);

    const interval = setInterval(() => {
      setReceiptOut((r) => {
        const next = r + 5;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 90);
  };

  const handleTakeReceipt = () => {
    if (receiptOut < 90) {
      showToast('Printing receipt…');
      return;
    }
    if (receiptTaken) return;
    setReceiptTaken(true);
    playAtmBeep(1400, 'sine', 0.1);

    setTimeout(() => {
      setCardStatus('returning');
      setStep('cardReturn');
    }, 600);
  };

  const handleTakeCard = () => {
    if (step !== 'cardReturn') return;
    setCardStatus('taken');
    playCelebrationChime();

    setTimeout(() => {
      setStep('thanks');
      setTimeout(() => {
        onContinue();
      }, 1600);
    }, 500);
  };

  return (
    <div className="chapter-page page-content">
      <div className="section-intro compact">
        <div>
          <p className="eyebrow">A special memory chapter</p>
          <h2>Browse Madam Ji&apos;s Photo Bank Memory ATM</h2>
          {onOpenUploadModal && (
            <div style={{ marginTop: '6px' }}>
              <button
                onClick={onOpenUploadModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#7b3944',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(123, 57, 68, 0.25)',
                }}
              >
                📸 Update / Upload Photos
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="atm-stage" id="atm-stage">
        <img
          className="atm-booth-bg"
          src="/assets/atm-booth.jpg"
          alt="ATM booth"
          loading="lazy"
        />

        {toastMsg && <div className="atm-toast">{toastMsg}</div>}

        <div className="atm-machine">
          <div className="atm-topper">PHOTO BANK</div>

          <div className="atm-body">
            <div className="atm-face">
              {/* Left Side Rail */}
              <div className="side-rail left" id="rail-left">
                {[0, 1, 2, 3].map((i) => {
                  const armed =
                    (step === 'menu' && true) ||
                    (step === 'memories' && i === 3) ||
                    (step === 'balance' && i === 3) ||
                    (step === 'wishDone' && i === 3) ||
                    (step === 'exitAsk' && i === 3);
                  return (
                    <button
                      key={`l-${i}`}
                      className={`side-btn ${armed ? 'armed' : ''}`}
                      disabled={!armed}
                      onClick={() => {
                        if (step === 'menu') handleMenuSelect(i + 1);
                        else if (step === 'memories' && i === 3) prevMemory();
                        else if ((step === 'balance' || step === 'wishDone') && i === 3) setStep('menu');
                        else if (step === 'exitAsk' && i === 3) handleExit();
                      }}
                    />
                  );
                })}
              </div>

              {/* Screen */}
              <div className="atm-screen-frame">
                <div className="atm-screen screen-fade" id="atm-screen">
                  {step === 'insert' && (
                    <>
                      <h4>WELCOME TO PHOTO BANK</h4>
                      <p>Please insert your ATM card</p>
                      <small>{BIRTHDAY_CONFIG.name} • 18 Oct 2009</small>
                    </>
                  )}

                  {step === 'reading' && (
                    <>
                      <h4>READING CARD…</h4>
                      <div className="atm-progress">
                        <span style={{ width: `${readingProgress}%` }}></span>
                      </div>
                      <p>Please Wait…</p>
                    </>
                  )}

                  {(step === 'pin' || step === 'pinWrong') && (
                    <>
                      <h4>ENTER ATM PIN</h4>
                      <div className="pin-dots">
                        {[0, 1, 2, 3].map((i) => (
                          <i key={i} className={i < pin.length ? 'filled' : ''}></i>
                        ))}
                      </div>
                      {step === 'pinWrong' ? (
                        <p style={{ color: '#ff9a92' }}>❌ Incorrect PIN (Must be 1810)</p>
                      ) : (
                        <p>Use the keypad, then press ENTER</p>
                      )}
                      <small>hint: birthday day + month ({BIRTHDAY_CONFIG.atmPin})</small>
                    </>
                  )}

                  {step === 'pinOk' && (
                    <>
                      <h4>✅ WELCOME, MADAM JII</h4>
                      <p>Authenticating your photo vault…</p>
                    </>
                  )}

                  {step === 'menu' && (
                    <>
                      <h4>PHOTO BANK MENU</h4>
                      <div className="atm-menu">
                        {['View Photos', 'Check Love Balance', 'Deposit Wishes', 'Exit'].map(
                          (label, idx) => (
                            <button
                              key={label}
                              className="atm-menu-row"
                              onClick={() => handleMenuSelect(idx + 1)}
                            >
                              <b>
                                {idx + 1} {label}
                              </b>
                              <em>◀</em>
                            </button>
                          )
                        )}
                      </div>
                      <small>tap an option or press 1-4 on keypad</small>
                    </>
                  )}

                  {step === 'vault' && (
                    <>
                      <h4>ACCESSING PHOTO VAULT…</h4>
                      <div className="atm-progress">
                        <span style={{ width: `${readingProgress}%` }}></span>
                      </div>
                    </>
                  )}

                  {step === 'memories' && (
                    <>
                      <small>
                        Photo {memoryIndex + 1}/{MEMORIES_LIST.length}
                      </small>
                      <div
                        className="memory-frame"
                        onClick={onOpenUploadModal}
                        style={{ cursor: 'pointer', position: 'relative' }}
                        title="Tap to set or change this photo"
                      >
                        <img
                          src={customPhotos[memoryIndex] || MEMORIES_LIST[memoryIndex].img}
                          alt={MEMORIES_LIST[memoryIndex].caption}
                          loading="lazy"
                        />
                      </div>
                      <p>&quot;{MEMORIES_LIST[memoryIndex].caption}&quot;</p>
                      <div className="atm-nav-row">
                        <button className="atm-nav" onClick={prevMemory}>
                          ◀ Prev
                        </button>
                        <button
                          className="atm-nav"
                          onClick={() => {
                            if (memoryIndex === MEMORIES_LIST.length - 1) setStep('menu');
                            else nextMemory();
                          }}
                        >
                          {memoryIndex === MEMORIES_LIST.length - 1 ? 'Menu ▶' : 'Next ▶'}
                        </button>
                      </div>
                    </>
                  )}

                  {step === 'checking' && (
                    <>
                      <h4>CHECKING ACCOUNT…</h4>
                      <p>▚▚▚▚▚▚▚▚</p>
                    </>
                  )}

                  {step === 'balance' && (
                    <>
                      <h4>LOVE BALANCE FOR MADAM JII</h4>
                      <div className="balance-rows">
                        {BALANCE_LIST.map((row) => (
                          <div className="balance-row" key={row.label}>
                            <span>{row.label}</span>
                            <b>{row.value}</b>
                            <div className="balance-bar">
                              <span style={{ width: balanceShown ? `${row.pct}%` : '0%' }}></span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="atm-nav-row">
                        <button className="atm-nav" onClick={() => setStep('menu')}>
                          ◀ Back to Menu
                        </button>
                      </div>
                    </>
                  )}

                  {step === 'wish' && (
                    <>
                      <h4>INSERT YOUR BIRTHDAY WISH</h4>
                      <input
                        className="atm-input"
                        id="atm-wish"
                        placeholder="Write your wish, Madam Jii..."
                        value={wish}
                        onChange={(e) => setWish(e.target.value)}
                      />
                      <button
                        className="key enter"
                        style={{ width: '60%', margin: '8px auto', height: '36px' }}
                        onClick={() => {
                          if (wish.trim()) setStep('wishDone');
                        }}
                      >
                        Confirm Wish ❤️
                      </button>
                    </>
                  )}

                  {step === 'wishDone' && (
                    <>
                      <h4>WISH DEPOSITED SUCCESSFULLY</h4>
                      <p>Your wish has been saved forever ❤️</p>
                      <div className="atm-nav-row">
                        <button className="atm-nav" onClick={() => setStep('menu')}>
                          ◀ Back to Menu
                        </button>
                      </div>
                    </>
                  )}

                  {step === 'exitAsk' && (
                    <>
                      <h4>END ATM SESSION?</h4>
                      <div className="atm-nav-row">
                        <button className="atm-nav" onClick={handleExit}>
                          ◀ YES (Print Receipt)
                        </button>
                        <button className="atm-nav" onClick={() => setStep('menu')}>
                          NO ▶
                        </button>
                      </div>
                    </>
                  )}

                  {step === 'receipt' && (
                    <>
                      <h4>PRINTING RECEIPT</h4>
                      <p>Please pull your receipt below</p>
                    </>
                  )}

                  {step === 'cardReturn' && (
                    <>
                      <h4>PLEASE TAKE YOUR CARD</h4>
                      <p style={{ color: '#ffd58a' }}>Tap your card in the slot to retrieve it</p>
                    </>
                  )}

                  {step === 'thanks' && (
                    <>
                      <h4>THANK YOU FOR VISITING</h4>
                      <p>Madam Ji&apos;s Photo Bank</p>
                      <small>Happy Birthday, Ritti Devi Jii ❤️</small>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side Rail */}
              <div className="side-rail right" id="rail-right">
                {[0, 1, 2, 3].map((i) => {
                  const armed =
                    (step === 'memories' && i === 3) ||
                    (step === 'exitAsk' && i === 3);
                  return (
                    <button
                      key={`r-${i}`}
                      className={`side-btn ${armed ? 'armed' : ''}`}
                      disabled={!armed}
                      onClick={() => {
                        if (step === 'memories' && i === 3) {
                          if (memoryIndex === MEMORIES_LIST.length - 1) setStep('menu');
                          else nextMemory();
                        } else if (step === 'exitAsk' && i === 3) {
                          setStep('menu');
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hardware: Slots & Keypad */}
            <div className="atm-hardware">
              <div className="atm-slot-row">
                {/* Receipt Slot */}
                <div className="receipt-slot">
                  <span>RECEIPT</span>
                </div>

                {/* Card Slot */}
                <div
                  className={`card-slot ${step === 'insert' || step === 'cardReturn' ? 'hot' : ''}`}
                  onClick={step === 'insert' ? handleInsertCard : handleTakeCard}
                >
                  <span
                    className={`slot-led ${
                      cardStatus === 'gone' || cardStatus === 'inserting'
                        ? 'green'
                        : step === 'cardReturn'
                        ? 'green blink'
                        : ''
                    }`}
                  ></span>
                  <span>CARD</span>
                </div>
              </div>

              {/* Keypad */}
              <div
                className={`atm-keypad ${
                  step === 'pin' || step === 'pinWrong' ? 'keypad-lit' : ''
                }`}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'E'].map((k) => (
                  <button
                    key={k}
                    className={`key ${k === 'C' ? 'clear' : k === 'E' ? 'enter' : ''}`}
                    onClick={() => handleKeyPress(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical ATM Debit Card */}
        <div
          className={`atm-card ${
            cardStatus === 'gone'
              ? 'hidden'
              : cardStatus === 'inserting'
              ? 'inserting'
              : cardStatus === 'returning'
              ? 'returning'
              : cardStatus === 'taken'
              ? 'taken'
              : ''
          }`}
          onClick={step === 'cardReturn' ? handleTakeCard : handleInsertCard}
          style={
            cardStatus === 'returning'
              ? { left: '50%', top: '78%', transform: 'translate(-50%, -20%)' }
              : undefined
          }
        >
          <div className="card-top">
            <span className="card-bank">PHOTO BANK</span>
            <span className="card-type">DEBIT</span>
          </div>
          <div className="card-chip"></div>
          <div className="card-number">•••• •••• •••• {BIRTHDAY_CONFIG.atmPin}</div>
          <div className="card-bottom">
            <span className="card-holder">{BIRTHDAY_CONFIG.name.toUpperCase()}</span>
            <span className="card-expiry">VALID 18/10</span>
          </div>
        </div>

        {/* ATM Receipt */}
        {receiptOut > 0 && !receiptTaken && (
          <div
            className="atm-receipt"
            onClick={handleTakeReceipt}
            style={{
              transform: `translateX(-50%) scaleY(${Math.max(0.02, receiptOut / 100)})`,
              opacity: 1,
              left: '32%',
              top: '68%',
              cursor: 'pointer',
            }}
          >
            <b>PHOTO BANK</b>
            <hr />
            <div className="receipt-line">
              <span>DATE</span>
              <span>18 OCT 2009</span>
            </div>
            <div className="receipt-line">
              <span>CARD</span>
              <span>**** RITTI</span>
            </div>
            <hr />
            <div className="receipt-line">
              <span>Photos Viewed</span>
              <span>
                {viewedCount}/{MEMORIES_LIST.length}
              </span>
            </div>
            {MEMORIES_LIST.slice(0, viewedCount).map((m, idx) => (
              <div className="receipt-line" key={idx}>
                <span>{idx + 1}.</span>
                <span>{m.caption}</span>
              </div>
            ))}
            <hr />
            {BALANCE_LIST.map((row) => (
              <div className="receipt-line" key={row.label}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
            <hr />
            <div className="receipt-line">
              <span>Wish Deposited</span>
              <span>{wish ? 'YES' : 'NONE'}</span>
            </div>
            {wish && <p style={{ margin: '4px 0', fontSize: '11px' }}>&quot;{wish}&quot;</p>}
            <hr />
            <div className="receipt-line">
              <span>LOVE BALANCE</span>
              <span>∞</span>
            </div>
            <p className="receipt-heart">Happy Birthday Ritti Devi Jii ❤️</p>
            <small>tap to tear receipt</small>
          </div>
        )}

        <div className="card-hint">
          {step === 'insert' && cardStatus === 'idle' && 'tap card to slide into slot'}
          {step === 'cardReturn' && cardStatus !== 'taken' && 'tap card to retrieve it'}
        </div>
      </div>
    </div>
  );
};
