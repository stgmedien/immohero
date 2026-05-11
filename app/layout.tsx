import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
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
    <html lang="de" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
