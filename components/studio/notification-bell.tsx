"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsRead, markNotificationRead } from "@/app/studio/actions/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  orderId: string | null;
  orderShortCode?: string | null;
  readAt: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  project_assignment: "Zuweisung",
  client_comment: "Kunden-Kommentar",
  share_approval: "Freigabe",
  weather_warning: "Wetter",
  delivery_ready: "Lieferung",
  status_change: "Status",
  asset_uploaded: "Upload",
};

export function NotificationBell({
  initialUnreadCount,
  userId,
}: {
  initialUnreadCount: number;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnread(data.unreadCount ?? 0);
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch("/api/notifications?unread_count_only=1");
        const data = await r.json();
        if (typeof data.unreadCount === "number") setUnread(data.unreadCount);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((ns) => ns.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          aria-label={`Benachrichtigungen (${unread} ungelesen)`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-brand-3)] px-1 text-[10px] font-semibold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hair)]">
          <div>
            <h3 className="text-sm font-semibold">Benachrichtigungen</h3>
            <p className="text-xs text-[var(--color-ink-3)]">
              {unread > 0 ? `${unread} ungelesen` : "Alles gelesen"}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="xs" onClick={handleMarkAllRead}>
              Alle gelesen
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-[var(--color-ink-3)]">Lade…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-[var(--color-ink-4)]" />
              <p className="mt-3 text-sm text-[var(--color-ink-3)]">Keine Benachrichtigungen.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-hair)]">
              {notifications.map((n) => {
                const isUnread = !n.readAt;
                const href = n.orderShortCode ? `/studio/projekte/${n.orderShortCode}` : "/studio/dashboard";
                return (
                  <li key={n.id} className="group">
                    <Link
                      href={href}
                      onClick={() => isUnread && handleMarkRead(n.id)}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg-subtle)]"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          isUnread ? "bg-[var(--color-brand-3)]" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone="brand-soft" className="!py-0 !text-[9px]">
                            {TYPE_LABELS[n.type] ?? n.type}
                          </Badge>
                          <time className="text-[10px] text-[var(--color-ink-4)]">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              locale: de,
                              addSuffix: true,
                            })}
                          </time>
                        </div>
                        <p className="mt-1 text-[13px] font-medium leading-tight">{n.title}</p>
                        {n.body && (
                          <p className="mt-0.5 text-xs text-[var(--color-ink-3)] line-clamp-2">{n.body}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
