import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cloud } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { getProjectFull } from "@/lib/db/project-queries";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FieldShotList } from "@/components/studio/field-shot-list";
import { germanDateTime } from "@/lib/utils";

export default async function FieldModePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/studio/projekte/${code}/feld`);
  if (!canAccessStudio(session.user.role)) redirect("/konto");

  const data = await getProjectFull(code);
  if (!data) notFound();
  const { project, shots, totals } = data;
  const pct = totals.shots === 0 ? 0 : Math.round((totals.shotsDone / totals.shots) * 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]" data-app="studio">
      <header
        className="bg-brand-grad text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #3f5a3a 0%, #6e7a3e 55%, #c2623e 100%), radial-gradient(at top right, rgba(255,255,255,0.1), transparent 40%)",
        }}
      >
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <Link
            href={`/studio/projekte/${code}`}
            className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Zurück zum Editor
          </Link>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.15em] text-white/70">FIELD-MODE</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {project.title ?? project.propertyAddress}
          </h1>
          <p className="mt-1 text-sm text-white/85">
            {project.propertyAddress}, {project.propertyPlz} {project.propertyCity}
          </p>
          {project.scheduledAt && (
            <p className="mt-0.5 text-xs text-white/70">
              Termin: {germanDateTime(project.scheduledAt)}
            </p>
          )}
          <div className="mt-4 flex items-end gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/80">Fortschritt</p>
              <Progress value={pct} className="mt-1 !bg-white/20 [&>div]:!bg-white" />
              <p className="mt-1 text-xs text-white/80">
                {totals.shotsDone} von {totals.shots} Shots fertig
              </p>
            </div>
            <p className="text-4xl font-semibold tabular-nums">{pct}%</p>
          </div>
          {project.weatherSnapshot && (
            <div className="mt-4 flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs inline-flex">
              <Cloud className="h-3.5 w-3.5" />
              <span>{project.weatherSnapshot.condition}</span>
              <span>· {project.weatherSnapshot.temp}°C</span>
              <span>· {project.weatherSnapshot.wind} km/h</span>
              {project.weatherSnapshot.flyable ? (
                <Badge tone="ok" className="!bg-white !text-[var(--color-ok)]">Flyable</Badge>
              ) : (
                <Badge tone="danger" className="!bg-white !text-[var(--color-danger)]">No-Fly</Badge>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-6 pb-32 max-w-3xl mx-auto">
        <FieldShotList
          orderId={project.id}
          orderCode={code}
          shots={shots.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            priority: s.priority,
            status: s.status,
            notes: s.notes,
            perspective: s.perspective,
            altitudeMeters: s.altitudeMeters,
            durationSec: s.durationSec,
          }))}
        />
      </main>
    </div>
  );
}
