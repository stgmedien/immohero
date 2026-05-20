import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { MaintenanceBanner } from "@/components/site/maintenance-banner";
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
        {/*
          Kill-switch for the legacy Serwist PWA service worker. Older builds
          registered an aggressive SW that cached a stale precache manifest and
          served 404s on newer routes (e.g. /login, /studio/*). This runs on
          every page load: if any SW is registered it unregisters it, wipes all
          caches, and does exactly one reload so the next navigation is clean.
          No-op for visitors who never had the old SW.
        */}
        {/*
          Kill-switch + Lock: zerstört vorhandene Service Worker, blockiert
          jede neue Registrierung, und reloaded einmal pro Session, falls etwas
          gefunden wurde. Schützt vor 404s aus alten Serwist-Precache-Manifesten.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('serviceWorker'in navigator){var sw=navigator.serviceWorker;var origReg=sw.register&&sw.register.bind(sw);if(origReg){sw.register=function(){return Promise.reject(new Error('SW registration disabled'))}}sw.getRegistrations().then(function(rs){var hadAny=rs&&rs.length>0;var p=Promise.all((rs||[]).map(function(r){return r.unregister().catch(function(){})}));p.then(function(){return (window.caches?caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}):Promise.resolve())}).then(function(){if(!hadAny)return;try{if(!sessionStorage.getItem('ih_sw_purged_v2')){sessionStorage.setItem('ih_sw_purged_v2','1');location.reload()}}catch(e){location.reload()}})})}}catch(e){}})();`,
          }}
        />
        <MaintenanceBanner />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        ) : null}
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
