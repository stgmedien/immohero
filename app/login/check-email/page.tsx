import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function CheckEmailPage() {
  return (
    <main className="container-narrow flex min-h-screen flex-col justify-center py-16 text-center">
      <Logo className="mx-auto" />
      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <h1 className="font-serif text-3xl">Prüfe deine E-Mails</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          Wir haben dir einen Login-Link geschickt. Klicke einfach drauf — du landest direkt in deinem Bereich.
        </p>
        <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
          Keine Mail? Schaue im Spam-Ordner oder{" "}
          <Link href="/login" className="underline">
            sende den Link erneut
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
