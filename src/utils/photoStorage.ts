import { MEMORIES_LIST, MemoryItem } from '../types';

const DB_NAME = 'bdy_madam_photos_db';
const STORE_NAME = 'photos';

export function openPhotosDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhoto(index: number, dataUrl: string): Promise<void> {
  try {
    const db = await openPhotosDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: index, dataUrl, updatedAt: Date.now() });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch {
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem(`bdy_photo_${index}`, dataUrl);
    } catch {
      // Storage quota exceeded fallback
    }
  }
}

export async function loadAllPhotos(): Promise<string[]> {
  const result: string[] = new Array(MEMORIES_LIST.length).fill('');
  try {
    const db = await openPhotosDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    const records = await new Promise<Array<{ id: number; dataUrl: string }>>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = reject;
    });
    records.forEach((rec) => {
      if (rec.id >= 0 && rec.id < result.length && rec.dataUrl) {
        result[rec.id] = rec.dataUrl;
      }
    });
  } catch {
    // Try localStorage
    for (let i = 0; i < MEMORIES_LIST.length; i++) {
      const saved = localStorage.getItem(`bdy_photo_${i}`);
      if (saved) result[i] = saved;
    }
  }
  return result;
}

export async function clearAllCustomPhotos(): Promise<void> {
  try {
    const db = await openPhotosDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // Ignore
  }
  for (let i = 0; i < MEMORIES_LIST.length; i++) {
    localStorage.removeItem(`bdy_photo_${i}`);
  }
}

export function compressImageFile(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context error'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image decode error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}
