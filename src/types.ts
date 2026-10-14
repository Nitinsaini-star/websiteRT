export interface MemoryItem {
  img: string;
  caption: string;
}

export interface BalanceItem {
  label: string;
  value: string;
  pct: number;
}

export const BIRTHDAY_CONFIG = {
  name: "Ritti Devi Jii",
  shortName: "Ritti",
  madamTitle: "Madam Jii",
  dobText: "18 OCTOBER 2009",
  dobStamp: "18.10",
  passkey: "18102009",
  atmPin: "1810",
  songTitle: "Mujhe Tumse Bahut Hai Pyar",
  songUrl: "/assets/our-song.mp3",
};

export const MEMORIES_LIST: MemoryItem[] = [
  { img: "/assets/images/atm/photo-1.jpg", caption: "Night Lights & Striped Sweater • Pure Elegance ❤️" },
  { img: "/assets/images/atm/photo-2.jpg", caption: "Pink Lehenga & White Rose • Queen Vibes ✨" },
  { img: "/assets/images/atm/photo-3.jpg", caption: "Royal Enfield Motorcycle • Coolest Madam Jii 🏍️" },
  { img: "/assets/images/atm/photo-4.jpg", caption: "Traditional Jhumkas & Gentle Smile • Pure Magic 🌸" },
  { img: "/assets/images/atm/photo-5.jpg", caption: "Sunlit Park & Leather Jacket • Effortlessly Gorgeous ☀️" },
  { img: "/assets/images/atm/photo-6.jpg", caption: "Red Bangles & Evening Glow • Breathtakingly Beautiful 🌙" },
];

export const BALANCE_LIST: BalanceItem[] = [
  { label: "Madam Ji's Smile", value: "100%", pct: 100 },
  { label: "Cute Anger (Nakhre)", value: "98%", pct: 98 },
  { label: "Late Replies", value: "82%", pct: 82 },
  { label: "Love & Respect", value: "∞", pct: 100 },
];
