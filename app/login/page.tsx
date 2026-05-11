import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const session = await auth();
  if (session?.user) {
    const target = session.user.role === "admin" ? "/admin"
      : session.user.role === "customer" ? "/konto" : "/studio";
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : target);
  }

  return (
    <main className="container-narrow flex min-h-screen flex-col justify-center py-16">
      <div className="text-center">
        <Logo />
      </div>
      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <h1 className="font-serif text-3xl leading-tight">Einloggen</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Wir senden dir einen Magic-Link an deine E-Mail. Kein Passwort nötig.
        </p>
        <form
          action={async (formData) => {
            "use server";
            const email = String(formData.get("email") ?? "").trim();
            if (!email) return;
            await signIn("resend", {
              email,
              redirectTo: callbackUrl ?? "/konto",
            });
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {error && (
            <p className="text-sm text-[var(--color-danger)]">
              Login fehlgeschlagen. Bitte versuche es erneut.
            </p>
          )}
          <Button type="submit" size="lg" className="w-full">
            Login-Link senden
          </Button>
        </form>
        <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
          Noch kein Konto? Es wird automatisch beim ersten Login erstellt. Mit dem Login akzeptierst du unsere{" "}
          <Link href="/datenschutz" className="underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
