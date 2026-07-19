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
    default: "عالم السنوكر | إربد - دوار السلطان",
    template: "%s | عالم السنوكر",
  },
  description:
    "نادي عالم السنوكر في إربد - دوار السلطان: بلياردو، سنوكر، ورق، حجوزات، بطولات، وبث مباشر للمباريات.",
  applicationName: "عالم السنوكر",
  keywords: [
    "سنوكر",
    "بلياردو",
    "إربد",
    "دوار السلطان",
    "عالم السنوكر",
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
    title: "عالم السنوكر | إربد - دوار السلطان",
    description:
      "تجربة فاخرة للسنوكر والبلياردو في إربد. احجز طاولتك، تابع البطولات والبث المباشر.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
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
