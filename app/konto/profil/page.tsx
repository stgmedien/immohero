import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export default async function ProfilPage() {
  const session = await auth();
  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Profil</h1>
      <Card className="mt-6 p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="Name" value={session?.user?.name ?? "—"} />
          <Row label="E-Mail" value={session?.user?.email ?? "—"} />
        </dl>
        <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
          Profilbearbeitung folgt im nächsten Release. Schreibe uns vorerst direkt an jonathan@stg-medien.com, wenn du Daten ändern möchtest.
        </p>
      </Card>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
