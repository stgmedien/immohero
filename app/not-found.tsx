import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-16">
      <div className="container-page max-w-xl">
        <Logo />
        <Card className="mt-8 p-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            404 — Seite nicht gefunden
          </p>
          <h1 className="mt-3 font-serif text-3xl">Ups, hier ist nichts.</h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            Die Seite wurde umbenannt oder existiert nicht (mehr). Falls du einen
            gespeicherten Link genutzt hast, ist er evtl. veraltet.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/buchen">Jetzt buchen</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/changelog">Was gibt's Neues?</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
            Falls du oft 404s siehst, könnte ein veralteter Browser-Cache schuld
            sein — einmal mit Cmd+Shift+R (Mac) bzw. Ctrl+F5 (Windows) hart
            neuladen behebt das in den meisten Fällen.
          </p>
        </Card>
      </div>
    </main>
  );
}
