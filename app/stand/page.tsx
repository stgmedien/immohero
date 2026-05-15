import type { Metadata } from "next";
import QRCode from "qrcode";

export const metadata: Metadata = {
  title: "ImmoHero · Messestand",
  robots: { index: false, follow: false },
};

export default async function StandPage() {
  const target = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/messe`;
  const qr = await QRCode.toString(target, {
    type: "svg",
    margin: 1,
    color: { dark: "#1e2319", light: "#ffffff" },
    width: 520,
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-grad px-6 py-12 text-center text-white">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-white/80">
        ImmoHero · Messe-Aktion
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl">
        15 € geschenkt.
      </h1>
      <p className="mt-3 max-w-xl text-lg text-white/90 sm:text-2xl">
        Scan den Code, trag dich ein — Gutschein sofort aufs Handy.
      </p>

      <div
        className="mt-10 rounded-[28px] bg-white p-6 shadow-2xl"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: qr }}
      />

      <p className="mt-8 text-xl font-medium text-white/90">immohero.org/messe</p>
      <p className="mt-2 text-sm text-white/70">
        Profi-Fotos, Drohne, Video & mehr · Lieferung in 48 Std.
      </p>
    </main>
  );
}
