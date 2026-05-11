import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"),
  title: {
    default: "ImmoHero — Professionelle Immobilienmedien aus OWL & NRW",
    template: "%s — ImmoHero",
  },
  description:
    "Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse und Texte für Ihre Immobilie. Schnell gebucht, kuratiert geliefert.",
  applicationName: "ImmoHero",
  authors: [{ name: "ImmoHero", url: "https://immohero.org" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://immohero.org",
    siteName: "ImmoHero",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#3F5A3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: "var(--font-inter-tight)" }}
    >
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          theme="light"
          toastOptions={{
            style: {
              background: "var(--color-bg-elev)",
              border: "1px solid var(--color-hair)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
