import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} د.أ`;
}

export function whatsappLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Club info sourced from Facebook page عالم السنوكر/Snooker world */
export const CLUB = {
  name: "عالم السنوكر",
  nameEn: "Snooker World",
  tagline: "نادي السنوكر والبلياردو في إربد",
  location: "الحي الشرقي، شارع الهاشمي / مقابل حلويات السلطان، إربد",
  locationShort: "إربد — مقابل حلويات السلطان",
  phone: "0790245899",
  phoneDisplay: "07 9024 5899",
  whatsapp: "962790245899",
  email: "emadelmahmoud52@gmail.com",
  hours: "مفتوح دائماً",
  facebook:
    "https://www.facebook.com/profile.php?id=100062809076591",
  followers: "2.8 ألف متابع",
  rating: "100% توصية · 12 تقييم",
  category: "فعالية رياضية · سنوكر وبلياردو",
  games: {
    billiards: 5,
    snooker: 6,
    cards: 5,
  },
} as const;
