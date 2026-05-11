import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrderByShortCode } from "@/lib/db/queries";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ErfolgPage({ searchParams }: PageProps) {
  const { order: code } = await searchParams;
  const order = code ? await getOrderByShortCode(code) : null;

  return (
    <section className="container-narrow py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5 5 11-12" />
        </svg>
      </span>
      <h1 className="mt-6 font-serif text-4xl md:text-5xl">Buchung bestätigt.</h1>
      <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
        {order
          ? `Auftrag ${order.shortCode} ist bei uns. Du bekommst gleich eine Bestätigung an ${order.customerEmail}.`
          : "Du bekommst gleich eine Bestätigungs-E-Mail mit allen Details und einem Login-Link zu deinem Kundenbereich."}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/konto">Zum Kundenbereich</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </div>
    </section>
  );
}
