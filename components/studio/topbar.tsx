"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { CommandMenu } from "@/components/studio/command-menu";
import { NotificationBell } from "@/components/studio/notification-bell";

interface Props {
  breadcrumbs?: Crumb[];
  user: { id: string; name?: string | null; email?: string | null; image?: string | null; initials?: string | null };
  unreadCount: number;
}

export function StudioTopbar({ breadcrumbs, user, unreadCount }: Props) {
  const [openCmd, setOpenCmd] = useState(false);

  const initials =
    user.initials ??
    (user.name
      ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
      : (user.email ?? "??").slice(0, 2).toUpperCase());

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg)]/85 backdrop-blur border-b border-[var(--color-hair)]">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <div className="flex-1 min-w-0">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        </div>

        <button
          type="button"
          onClick={() => setOpenCmd(true)}
          className="hidden md:flex items-center gap-2 h-9 w-72 px-3 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] text-[var(--color-ink-3)] hover:border-[var(--color-ink-4)] transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="text-[13px] flex-1 text-left">Suchen…</span>
          <Kbd>⌘K</Kbd>
        </button>

        <button
          type="button"
          onClick={() => setOpenCmd(true)}
          className="md:hidden grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)]"
          aria-label="Suche"
        >
          <Search className="h-4 w-4" />
        </button>

        <NotificationBell initialUnreadCount={unreadCount} userId={user.id} />

        <Link
          href="/studio/einstellungen"
          className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
          aria-label="Konto"
        >
          <Avatar size={32}>
            {user.image ? <AvatarImage src={user.image} alt={user.name ?? ""} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <CommandMenu open={openCmd} onOpenChange={setOpenCmd} />
    </header>
  );
}
