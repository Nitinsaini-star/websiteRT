import React, { useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MEMORIES_LIST } from '../types';
import { savePhoto, compressImageFile, clearAllCustomPhotos } from '../utils/photoStorage';
import { playAtmBeep, playCelebrationChime } from '../utils/audio';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPhotos: string[];
  onPhotosUpdated: (newPhotos: string[]) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  customPhotos,
  onPhotosUpdated,
}) => {
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileForSlot = async (slotIndex: number, file: File) => {
    try {
      setLoadingSlot(slotIndex);
      setStatusMsg(`Optimizing photo ${slotIndex + 1}…`);
      const dataUrl = await compressImageFile(file);
      await savePhoto(slotIndex, dataUrl);

      const next = [...customPhotos];
      next[slotIndex] = dataUrl;
      onPhotosUpdated(next);

      playAtmBeep(1200, 'sine', 0.1);
      setStatusMsg(`Photo ${slotIndex + 1} saved! ❤️`);
      setTimeout(() => setStatusMsg(''), 2000);
    } catch {
      setStatusMsg('Failed to process image. Try a smaller file.');
    } finally {
      setLoadingSlot(null);
    }
  };

  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStatusMsg(`Loading ${files.length} photo(s)…`);
    const next = [...customPhotos];

    for (let i = 0; i < Math.min(files.length, MEMORIES_LIST.length); i++) {
      setLoadingSlot(i);
      try {
        const dataUrl = await compressImageFile(files[i]);
        await savePhoto(i, dataUrl);
        next[i] = dataUrl;
      } catch {
        // Continue
      }
    }

    onPhotosUpdated(next);
    setLoadingSlot(null);
    playCelebrationChime();
    setStatusMsg('All photos updated successfully! 🎉');

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 1400);
  };

  const handleReset = async () => {
    if (confirm('Reset to default photos?')) {
      await clearAllCustomPhotos();
      onPhotosUpdated(new Array(MEMORIES_LIST.length).fill(''));
      setStatusMsg('Reset to defaults.');
      setTimeout(() => setStatusMsg(''), 1500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 10, 15, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff8ed',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90dvh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 'clamp(14px, 4vw, 24px)',
          color: '#25191d',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: '#7b3944',
          }}
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fbe3e0',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#7b3944',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={14} /> Madam Ji&apos;s Photo Bank
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0', color: '#7b3944' }}>
            Set Ritti Devi Jii&apos;s Real Photos
          </h2>
          <p style={{ fontSize: '13px', color: '#7b6969', margin: '4px 0 0' }}>
            Select your 6 uploaded Instagram photos to display them in the Photo Bank ATM &amp; memories.
          </p>
        </div>

        {/* Batch Upload Button */}
        <div
          style={{
            border: '2px dashed #d6b48c',
            borderRadius: '14px',
            padding: '18px',
            textAlign: 'center',
            backgroundColor: '#fffdf8',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
          onClick={() => {
            const input = document.getElementById('batch-photo-input') as HTMLInputElement;
            input?.click();
          }}
        >
          <input
            id="batch-photo-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleBatchFiles(e.target.files)}
          />
          <Upload size={32} color="#b85f68" style={{ margin: '0 auto 6px' }} />
          <strong style={{ display: 'block', fontSize: '15px', color: '#7b3944' }}>
            Select All 6 Photos at Once
          </strong>
          <span style={{ fontSize: '12px', color: '#7b6969' }}>
            Tap here to pick your 6 Instagram screenshots from your device
          </span>
        </div>

        {statusMsg && (
          <div
            style={{
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#f2c6c4',
              color: '#7b3944',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* 6 Individual Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
          {MEMORIES_LIST.map((mem, idx) => {
            const currentImg = customPhotos[idx] || mem.img;
            const isCustom = Boolean(customPhotos[idx]);

            return (
              <div
                key={idx}
                style={{
                  border: isCustom ? '2px solid #b85f68' : '1px solid #e8dccd',
                  borderRadius: '12px',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                  <img
                    src={currentImg}
                    alt={mem.caption}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {isCustom && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        backgroundColor: '#7b3944',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '3px',
                        display: 'flex',
                      }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                  {loadingSlot === idx && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Saving…
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7b3944' }}>
                    Photo #{idx + 1}
                  </span>
                  <p style={{ fontSize: '11px', color: '#7b6969', margin: '2px 0 0', lineHeight: 1.2 }}>
                    {mem.caption}
                  </p>
                </div>

                <label
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    backgroundColor: isCustom ? '#fbe3e0' : '#f7ead7',
                    color: '#7b3944',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileForSlot(idx, e.target.files[0]);
                      }
                    }}
                  />
                  {isCustom ? 'Change Photo' : 'Upload This Photo'}
                </label>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e8dccd',
            paddingTop: '16px',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#7b6969',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trash2 size={14} /> Reset Photos
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#7b3944',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
