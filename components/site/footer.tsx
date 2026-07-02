import Link from "next/link";
import { Logo } from "./logo";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export async function Footer() {
  const locale = await getLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-[var(--color-ink-soft)]">
            {t(locale, "footer_tagline")}
          </p>
        </div>
        <FooterColumn
          title={t(locale, "footer_col_services")}
          links={[
            { href: "/services/fotografie", label: "Fotografie" },
            { href: "/services/drohne", label: "Drohne / Drone" },
            { href: "/services/video-reel", label: "Video / Reel" },
            { href: "/services/tour-360", label: "360°" },
            { href: "/services/grundriss-2d", label: "Grundriss 2D" },
            { href: "/services/matterport", label: "Matterport" },
          ]}
        />
        <FooterColumn
          title={t(locale, "footer_col_company")}
          links={[
            { href: "/pakete", label: t(locale, "footer_link_packages") },
            { href: "/academy", label: "Academy" },
            { href: "/faq", label: t(locale, "footer_link_faq") },
            { href: "/ueber-uns", label: t(locale, "footer_link_about") },
            { href: "/changelog", label: t(locale, "footer_link_changelog") },
            { href: "/status", label: t(locale, "footer_link_status") },
            { href: "/kontakt", label: t(locale, "footer_link_contact") },
          ]}
        />
        <FooterColumn
          title={t(locale, "footer_col_legal")}
          links={[
            { href: "/impressum", label: t(locale, "footer_link_imprint") },
            { href: "/datenschutz", label: t(locale, "footer_link_privacy") },
            { href: "/agb", label: t(locale, "footer_link_terms") },
          ]}
        />
      </div>
      <div className="border-t border-[var(--color-line)]">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-[var(--color-ink-mute)] md:flex-row md:items-center md:justify-between">
          <span>© {year} ImmoHero · Jonathan Kreutzheide · Gütersloh</span>
          <span>{t(locale, "footer_copy")}</span>
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
