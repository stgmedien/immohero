import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { StudioSidebar } from "@/components/studio/sidebar";
import { StudioMobileNav } from "@/components/studio/mobile-nav";
import { db } from "@/lib/db/client";
import { eq, and, isNull, count, desc } from "drizzle-orm";
import { notifications, orderShots, orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function StudioRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/studio/dashboard");
  }
  const role = session.user.role;
  if (!canAccessStudio(role)) {
    redirect("/konto");
  }

  const [{ unread = 0 } = { unread: 0 }] = await db
    .select({ unread: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt)));

  return (
    <div
      className="flex min-h-screen flex-row bg-[var(--color-bg)]"
      data-app="studio"
    >
      <StudioSidebar role={role} unreadCount={Number(unread)} activeProject={null} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      <StudioMobileNav role={role} unreadCount={Number(unread)} />
    </div>
  );
}
