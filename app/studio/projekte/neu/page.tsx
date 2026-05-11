import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canCreateProjects } from "@/lib/access";
import { db } from "@/lib/db/client";
import { isNull, desc } from "drizzle-orm";
import { customers } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { NewProjectWizard } from "@/components/studio/new-project-wizard";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canCreateProjects(session.user.role)) redirect("/studio/dashboard");

  const customerList = await db
    .select({
      id: customers.id,
      displayName: customers.displayName,
      primaryEmail: customers.primaryEmail,
      primaryPhone: customers.primaryPhone,
    })
    .from(customers)
    .where(isNull(customers.archivedAt))
    .orderBy(desc(customers.createdAt));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[
          { label: "Workspace", href: "/studio" },
          { label: "Projekte", href: "/studio/projekte" },
          { label: "Neu" },
        ]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Neues Projekt</h1>
        <p className="text-[var(--color-ink-3)]">In 5 Schritten zum produktionsbereiten Auftrag.</p>

        <NewProjectWizard customers={customerList} />
      </main>
    </>
  );
}
