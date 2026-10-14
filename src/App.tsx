/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Heart, MailOpen, RotateCcw, Camera } from 'lucide-react';
import { BIRTHDAY_CONFIG, MEMORIES_LIST } from './types';
import { LockScreen } from './components/LockScreen';
import { WelcomePage } from './components/WelcomePage';
import { EnvelopeLetterPage } from './components/EnvelopeLetterPage';
import { PlayGamesPage } from './components/PlayGamesPage';
import { AtmPage } from './components/AtmPage';
import { CutCakePage } from './components/CutCakePage';
import { AcceptGiftPage } from './components/AcceptGiftPage';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { startMusic, stopMusic, isMusicPlaying } from './utils/audio';
import { loadAllPhotos, savePhoto, compressImageFile } from './utils/photoStorage';

const pageNames = [
  'Welcome',
  'Letter',
  'Play',
  'Memory ATM',
  'Cut the Cake',
  'Accept Gift',
];

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [page, setPage] = useState(0);
  const [letterView, setLetterView] = useState<'envelope' | 'letter'>('envelope');
  const [playPart, setPlayPart] = useState<1 | 2>(1);
  const [musicOn, setMusicOn] = useState(false);
  const [customPhotos, setCustomPhotos] = useState<string[]>(new Array(MEMORIES_LIST.length).fill(''));
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadAllPhotos().then((photos) => {
      if (photos && photos.length) setCustomPhotos(photos);
    });
  }, []);

  const handleGlobalFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const next = [...customPhotos];
    for (let i = 0; i < Math.min(files.length, MEMORIES_LIST.length); i++) {
      try {
        const dataUrl = await compressImageFile(files[i]);
        await savePhoto(i, dataUrl);
        next[i] = dataUrl;
      } catch {
        // Ignore
      }
    }
    setCustomPhotos(next);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files) {
        handleGlobalFiles(e.clipboardData.files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [customPhotos]);

  useEffect(() => {
    const handleAudioStatus = () => {
      setMusicOn(isMusicPlaying());
    };
    const interval = setInterval(handleAudioStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMusic = () => {
    if (musicOn) {
      stopMusic(() => setMusicOn(false));
    } else {
      startMusic(() => setMusicOn(true));
    }
  };

  const handleNavBack = () => {
    if (page === 1 && letterView === 'letter') {
      setLetterView('envelope');
      return;
    }
    if (page === 2 && playPart === 2) {
      setPlayPart(1);
      return;
    }
    if (page === 2 && playPart === 1) {
      setPage(1);
      setLetterView('letter');
      return;
    }
    setPage((p) => Math.max(0, p - 1));
    setLetterView('envelope');
    setPlayPart(1);
  };

  const handleNavForward = () => {
    if (page === 1 && letterView === 'envelope') {
      setLetterView('letter');
      return;
    }
    if (page === 1 && letterView === 'letter') {
      setPage(2);
      setPlayPart(1);
      return;
    }
    if (page === 2 && playPart === 1) {
      setPlayPart(2);
      return;
    }
    if (page === 2 && playPart === 2) {
      setPage(3);
      return;
    }
    if (page < pageNames.length - 1) {
      setPage((p) => p + 1);
      setLetterView('envelope');
      setPlayPart(1);
    } else {
      setPage(0);
      setLetterView('envelope');
      setPlayPart(1);
    }
  };

  // Compute Page Title for Nav
  let currentTitle = pageNames[page];
  if (page === 1) {
    currentTitle = letterView === 'letter' ? 'A Love Letter' : 'Envelope';
  } else if (page === 2) {
    currentTitle = playPart === 2 ? 'Love Meter' : 'Secret Prize';
  }

  // Forward Button Label
  let forwardBtnContent = (
    <>
      Continue <Heart size={16} fill="currentColor" />
    </>
  );
  if (page === 1 && letterView === 'envelope') {
    forwardBtnContent = (
      <>
        Open Letter <MailOpen size={16} />
      </>
    );
  } else if (page === 2 && playPart === 1) {
    forwardBtnContent = (
      <>
        Next: Love Meter <Heart size={16} fill="currentColor" />
      </>
    );
  } else if (page === pageNames.length - 1) {
    forwardBtnContent = (
      <>
        Again <RotateCcw size={16} />
      </>
    );
  }

  if (!unlocked) {
    return (
      <div id="app">
        <LockScreen
          onUnlock={() => {
            setUnlocked(true);
            setMusicOn(true);
          }}
        />
        <div className="bdy-vignette" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div id="app">
      <main className="experience-shell">
        <div className="floating-decor" aria-hidden="true">
          <Heart className="float-heart heart-a" fill="currentColor" size={26} />
          <span className="float-spark spark-a">✨</span>
          <span className="float-spark spark-b">⭐</span>
          <Heart className="float-heart heart-b" fill="currentColor" size={30} />
          <span className="grain" />
        </div>

        {/* Hidden batch photo file input */}
        <input
          id="app-batch-file-input"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleGlobalFiles(e.target.files)}
        />

        {/* Prominent banner to set real photos from phone */}
        {customPhotos.filter(Boolean).length < 6 && (
          <div
            onClick={() => document.getElementById('app-batch-file-input')?.click()}
            style={{
              backgroundColor: '#7b3944',
              color: '#fff8ed',
              padding: '10px 16px',
              borderRadius: '12px',
              margin: '8px 16px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(123, 57, 68, 0.35)',
            }}
          >
            <Camera size={16} />
            <span>📸 Tap to select Madam Ji&apos;s 6 real screenshots from gallery ({customPhotos.filter(Boolean).length}/6 added)</span>
          </div>
        )}

        {/* Journey Header with Music Toggle & Photos Button */}
        <header className="journey-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <button
            className="music-button photo-header-btn"
            style={{ width: 'auto', padding: '0 12px', gap: '6px', flexShrink: 0 }}
            onClick={() => setIsUploadModalOpen(true)}
            title="Set Madam Ji's Photos"
          >
            <Camera size={16} />
            <span className="hide-on-xs">Photos ({customPhotos.filter(Boolean).length}/6)</span>
            <span className="show-on-xs">{customPhotos.filter(Boolean).length}/6</span>
          </button>

          <button
            className="music-button"
            id="music-button"
            onClick={toggleMusic}
            aria-label={musicOn ? 'Pause music' : 'Play music'}
            style={{ minWidth: 0, overflow: 'hidden' }}
          >
            {musicOn ? (
              <>
                <Volume2 size={18} style={{ flexShrink: 0 }} />
                <span className="hide-on-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Now playing {BIRTHDAY_CONFIG.songTitle}
                </span>
                <span className="show-on-sm">Playing 🎵</span>
              </>
            ) : (
              <>
                <VolumeX size={18} style={{ flexShrink: 0 }} />
                <span className="hide-on-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Play {BIRTHDAY_CONFIG.songTitle}
                </span>
                <span className="show-on-sm">Play Song</span>
              </>
            )}
          </button>
        </header>

        {/* Dynamic Page Stage */}
        <section className="page-stage" id="page-stage" key={`${page}-${letterView}-${playPart}`}>
          {page === 0 && <WelcomePage />}
          {page === 1 && (
            <EnvelopeLetterPage
              view={letterView}
              onViewChange={setLetterView}
              onContinue={handleNavForward}
            />
          )}
          {page === 2 && (
            <PlayGamesPage
              part={playPart}
              onPartChange={setPlayPart}
              onContinue={handleNavForward}
            />
          )}
          {page === 3 && (
            <AtmPage
              onContinue={handleNavForward}
              customPhotos={customPhotos}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}
          {page === 4 && <CutCakePage onContinue={handleNavForward} />}
          {page === 5 && (
            <AcceptGiftPage
              onReplay={() => {
                setPage(0);
                setLetterView('envelope');
                setPlayPart(1);
              }}
            />
          )}
        </section>

        {/* Bottom Navigation */}
        <nav className="page-nav">
          <button
            className="nav-button secondary"
            id="nav-back"
            onClick={handleNavBack}
            disabled={page === 0}
          >
            Back
          </button>
          <div className="page-label">
            <strong id="page-title">{currentTitle}</strong>
          </div>
          <button
            className="nav-button primary"
            id="nav-forward"
            onClick={handleNavForward}
          >
            {forwardBtnContent}
          </button>
        </nav>
      </main>

      <div className="bdy-vignette" aria-hidden="true" />
      <div className="bdy-watermark" aria-hidden="true">
        Happy Birthday Ritti Devi Jii • 18 Oct 2009
      </div>

      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        customPhotos={customPhotos}
        onPhotosUpdated={setCustomPhotos}
      />
    </div>
  );
}
