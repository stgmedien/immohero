import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-[var(--color-ink-soft)]">
            Professionelle Immobilienmedien, in OWL & NRW geliefert. Foto, Drohne, Video, 360°, Grundriss, Text.
          </p>
        </div>
        <FooterColumn
          title="Services"
          links={[
            { href: "/services/fotografie", label: "Fotografie" },
            { href: "/services/drohne", label: "Drohne / Luftbild" },
            { href: "/services/video-reel", label: "Video / Reel" },
            { href: "/services/tour-360", label: "360°-Tour" },
            { href: "/services/grundriss-2d", label: "Grundriss 2D" },
            { href: "/services/matterport", label: "Matterport" },
          ]}
        />
        <FooterColumn
          title="Unternehmen"
          links={[
            { href: "/pakete", label: "Pakete" },
            { href: "/faq", label: "FAQ" },
            { href: "/ueber-uns", label: "Über uns" },
            { href: "/kontakt", label: "Kontakt" },
          ]}
        />
        <FooterColumn
          title="Rechtliches"
          links={[
            { href: "/impressum", label: "Impressum" },
            { href: "/datenschutz", label: "Datenschutz" },
            { href: "/agb", label: "AGB" },
          ]}
        />
      </div>
      <div className="border-t border-[var(--color-line)]">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-[var(--color-ink-mute)] md:flex-row md:items-center md:justify-between">
          <span>© {year} ImmoHero · Jonathan Kreutzheide · Gütersloh</span>
          <span>Alle Preise inkl. MwSt. wenn nicht anders ausgewiesen.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
