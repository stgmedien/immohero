"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Plus, Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  role: string;
  unreadCount: number;
}

export function StudioMobileNav({ role, unreadCount }: Props) {
  const pathname = usePathname();
  const items = [
    { href: "/studio/dashboard", label: "Heute", icon: LayoutDashboard },
    { href: "/studio/projekte", label: "Projekte", icon: FolderKanban },
    { href: "/studio/projekte/neu", label: "Neu", icon: Plus, primary: true },
    ...((role === "admin" || role === "editor")
      ? [{ href: "/studio/kunden", label: "CRM", icon: Users }]
      : []),
    { href: "/studio/einstellungen", label: "Konto", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-hair)] bg-[var(--color-bg-elev)]/95 backdrop-blur safe-bottom">
      <div className="flex items-stretch justify-around py-2 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-1.5 rounded-[var(--radius-sm)] text-[10px] transition-colors",
                isActive
                  ? "text-[var(--color-brand-1)]"
                  : "text-[var(--color-ink-3)]",
              )}
            >
              <Icon className={cn("h-5 w-5", item.primary && "h-6 w-6")} />
              <span className="leading-none">{item.label}</span>
              {item.badge && (
                <Badge tone="brand" className="absolute -top-1 right-1/4 !py-0 !px-1 !text-[9px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
