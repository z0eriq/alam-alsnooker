import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "عالم السنوكر — Snooker World",
    short_name: "عالم السنوكر",
    description:
      "عالم السنوكر في إربد — الحي الشرقي شارع الهاشمي مقابل حلويات السلطان. مفتوح دائماً.",
    start_url: "/",
    display: "standalone",
    background_color: "#050807",
    theme_color: "#0B3D2E",
    lang: "ar",
    dir: "rtl",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.jpg",
        sizes: "720x720",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
