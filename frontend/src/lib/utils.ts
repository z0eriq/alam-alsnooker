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

export const CLUB = {
  name: "عالم السنوكر",
  location: "إربد - دوار السلطان",
  whatsapp: "962790000000",
  hours: "10:00 ص — 2:00 ص",
  games: {
    billiards: 5,
    snooker: 6,
    cards: 5,
  },
} as const;
