import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrderByShortCode } from "@/lib/db/queries";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ErfolgPage({ searchParams }: PageProps) {
  const { order: code } = await searchParams;
  const order = code ? await getOrderByShortCode(code) : null;
  const locale = await getLocale();

  return (
    <section className="container-narrow py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5 5 11-12" />
        </svg>
      </span>
      <h1 className="mt-6 font-serif text-4xl md:text-5xl">{t(locale, "erfolg_title")}</h1>
      <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
        {order
          ? t(locale, "erfolg_with_order", { code: order.shortCode, email: order.customerEmail })
          : t(locale, "erfolg_no_order")}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/konto">{t(locale, "erfolg_btn_account")}</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">{t(locale, "erfolg_btn_home")}</Link>
        </Button>
      </div>
    </section>
  );
}
