import type { Metadata, Viewport } from "next";
import { Amiri, Cairo } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/layout/SiteShell";

import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "عالم السنوكر | Snooker World — إربد",
    template: "%s | عالم السنوكر",
  },
  description:
    "عالم السنوكر / Snooker World في إربد — الحي الشرقي شارع الهاشمي مقابل حلويات السلطان. بلياردو، سنوكر، ورق، حجوزات، بطولات، وبث مباشر. مفتوح دائماً. هاتف: 07 9024 5899",
  applicationName: "عالم السنوكر",
  keywords: [
    "سنوكر",
    "بلياردو",
    "إربد",
    "حلويات السلطان",
    "شارع الهاشمي",
    "عالم السنوكر",
    "Snooker World",
    "حجز طاولة",
    "بطولات",
  ],
  authors: [{ name: "عالم السنوكر" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "عالم السنوكر",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    siteName: "عالم السنوكر",
    title: "عالم السنوكر | Snooker World — إربد",
    description:
      "الحي الشرقي شارع الهاشمي / مقابل حلويات السلطان. مفتوح دائماً. احجز طاولتك وتابع البطولات.",
    images: [{ url: "/logo.jpg", width: 720, height: 720, alt: "عالم السنوكر" }],
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B3D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${amiri.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
