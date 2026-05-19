import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAboCustomerByEmail, resolveAboServices, listAboSubmissions } from "@/lib/abo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AboSubmissionForm } from "@/components/abo/submission-form";
import { eurosPrecise, germanDate } from "@/lib/utils";

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  wohnung: "Wohnung",
  haus: "Haus",
  villa: "Villa",
  mfh: "Mehrfamilienhaus",
  gewerbe: "Gewerbe",
  industrie: "Industrie",
  grundstueck: "Grundstück",
  bauprojekt: "Bauprojekt",
};

const STATUS_LABEL: Record<
  string,
  { label: string; tone: "neutral" | "primary" | "warn" | "success" | "danger" }
> = {
  pending: { label: "In Prüfung", tone: "warn" },
  approved: { label: "Bestätigt", tone: "primary" },
  converted: { label: "In Produktion", tone: "success" },
  rejected: { label: "Abgelehnt", tone: "danger" },
};

export default async function AboPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const abo = email ? await getAboCustomerByEmail(email) : null;

  if (!abo) {
    return (
      <section className="container-page py-16">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <h1 className="font-serif text-3xl">Kein aktives Abo</h1>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Für die Adresse <strong>{email}</strong> ist aktuell kein Abo hinterlegt.
            Wenn du denkst, das ist ein Fehler, melde dich bei uns unter{" "}
            <a
              href="mailto:jonathan@stg-medien.com"
              className="underline decoration-[var(--color-brand-1)] underline-offset-2"
            >
              jonathan@stg-medien.com
            </a>
            .
          </p>
        </Card>
      </section>
    );
  }

  const services = resolveAboServices(abo);
  const submissions = await listAboSubmissions(abo.id);

  return (
    <section className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl">
          Willkommen, {abo.companyName ?? abo.displayName}.
        </h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">
          Reiche hier deine Objekte ein — wir kümmern uns um den Rest. Deine Leistungen
          sind im Abo bereits festgelegt.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="font-serif text-2xl">Neues Objekt einreichen</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Adresse, Objektart und optional ein paar Fotos oder Unterlagen. Unser
              Team prüft die Einreichung und legt den Auftrag an.
            </p>
            <div className="mt-6">
              <AboSubmissionForm />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-serif text-2xl">Deine Einreichungen</h2>
            {submissions.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Noch keine Einreichungen. Reiche oben dein erstes Objekt ein.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {submissions.map((s) => {
                  const st = STATUS_LABEL[s.status] ?? STATUS_LABEL.pending;
                  return (
                    <li
                      key={s.id}
                      className="rounded-[var(--radius-md)] border border-[var(--color-hair)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {s.propertyAddress}, {s.propertyPlz} {s.propertyCity}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-ink-mute)]">
                            {PROPERTY_TYPE_LABEL[s.propertyType] ?? s.propertyType} ·
                            eingereicht {germanDate(s.createdAt)}
                          </p>
                          {s.status === "rejected" && s.reviewNotes && (
                            <p className="mt-2 text-xs text-[var(--color-danger)]">
                              Hinweis vom Team: {s.reviewNotes}
                            </p>
                          )}
                          {s.convertedShareToken && (
                            <Link
                              href={`/share/${s.convertedShareToken}`}
                              className="mt-2 inline-block text-xs underline decoration-[var(--color-brand-1)] underline-offset-2"
                            >
                              Projekt ansehen{" "}
                              {s.convertedShortCode ? `(${s.convertedShortCode})` : ""}
                            </Link>
                          )}
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              Deine Abo-Leistungen
            </h3>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Deine Leistungen werden gerade eingerichtet. Du kannst trotzdem schon
                Objekte einreichen — wir ordnen sie zu.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {services.map((svc) => (
                  <li key={svc.slug} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{svc.name}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {svc.shortDescription}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-ink-3)]">
                      {eurosPrecise(svc.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-5 border-t border-[var(--color-hair)] pt-4 text-xs text-[var(--color-ink-mute)]">
              Abrechnung läuft über dein Abo — bei jeder Einreichung fallen keine
              zusätzlichen Schritte für dich an.
            </p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
