import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "عالم السنوكر",
    short_name: "السنوكر",
    description:
      "نادي عالم السنوكر — إربد دوار السلطان. حجز طاولات، بطولات، وبث مباشر.",
    start_url: "/",
    display: "standalone",
    background_color: "#050807",
    theme_color: "#0B3D2E",
    lang: "ar",
    dir: "rtl",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
