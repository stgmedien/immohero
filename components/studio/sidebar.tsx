"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, Users, Building2, Briefcase, Camera, Map,
  Settings, ClipboardList, ShieldCheck, ScrollText, BookOpen, Plus,
  CircleUser, FileCheck, Image as ImageIcon, Send, MessagesSquare, Gift,
  CalendarClock,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  exact?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
  hidden?: boolean;
}

interface ActiveProject {
  shortCode: string;
  city: string;
  shotCount: number;
  status: string;
}

interface Props {
  role: string;
  unreadCount: number;
  activeProject: ActiveProject | null;
}

export function StudioSidebar({ role, unreadCount, activeProject }: Props) {
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const canCRM = isAdmin || role === "editor";

  const sections: NavSection[] = [
    {
      label: "Workspace",
      items: [
        { href: "/studio/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/studio/projekte", label: "Projekte", icon: FolderKanban },
        { href: "/studio/projekte/neu", label: "Neues Projekt", icon: Plus },
      ],
    },
    {
      label: "CRM",
      hidden: !canCRM,
      items: [
        { href: "/studio/kunden", label: "Kunden", icon: Users },
        { href: "/studio/firmen", label: "Firmen", icon: Building2 },
        { href: "/studio/deals", label: "Deals", icon: Briefcase },
        { href: "/studio/beratung", label: "Beratungstermine", icon: CalendarClock },
        { href: "/studio/leads", label: "Messe-Leads", icon: Gift },
      ],
    },
  ];

  const activeProjectSection: NavSection | null = activeProject
    ? {
        label: `Aktives Projekt · ${activeProject.shortCode}`,
        items: [
          {
            href: `/studio/projekte/${activeProject.shortCode}`,
            label: "Shotliste",
            icon: ClipboardList,
            badge: activeProject.shotCount,
          },
          {
            href: `/studio/projekte/${activeProject.shortCode}/feld`,
            label: "Field-Mode",
            icon: Camera,
          },
          {
            href: `/studio/projekte/${activeProject.shortCode}/assets`,
            label: "Assets",
            icon: ImageIcon,
          },
          {
            href: `/studio/projekte/${activeProject.shortCode}/kommentare`,
            label: "Kommentare",
            icon: MessagesSquare,
          },
          {
            href: `/studio/projekte/${activeProject.shortCode}/share`,
            label: "Share",
            icon: Send,
          },
          {
            href: `/studio/projekte/${activeProject.shortCode}/export`,
            label: "Export",
            icon: FileCheck,
          },
        ],
      }
    : null;

  const adminSection: NavSection = {
    label: "Admin",
    hidden: !isAdmin,
    items: [
      { href: "/studio/team", label: "Team", icon: ShieldCheck },
      { href: "/studio/catalog", label: "Catalog", icon: BookOpen },
      { href: "/studio/gebiete", label: "Servicegebiete", icon: Map },
      { href: "/studio/audit", label: "Audit-Log", icon: ScrollText },
    ],
  };

  const finalSections = [
    ...sections,
    ...(activeProjectSection ? [activeProjectSection] : []),
    adminSection,
    {
      items: [
        { href: "/studio/einstellungen", label: "Einstellungen", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-[240px] shrink-0 flex-col border-r border-[var(--color-hair)] bg-[var(--color-bg-sunken)] overflow-y-auto">
      <div className="px-4 py-4 border-b border-[var(--color-hair-2)]">
        <Logo className="text-sm" />
        <p className="mt-1 ml-11 -mt-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
          Studio v1
        </p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-5">
        {finalSections.map((section, sIdx) => {
          if (section.hidden) return null;
          return (
            <div key={sIdx}>
              {section.label && (
                <p className="px-2.5 mb-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all",
                          isActive
                            ? "bg-[var(--color-bg-elev)] text-[var(--color-ink)] shadow-[var(--shadow-sm)] ring-1 ring-inset ring-[var(--color-hair)]"
                            : "text-[var(--color-ink-2)] hover:bg-black/[0.03]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-[var(--color-brand-1)]" : "text-[var(--color-ink-3)]",
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <Badge tone="neutral" className="!py-0 !px-1.5 !text-[10px]">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-[var(--color-hair-2)] mt-auto">
        <Link
          href="/studio/einstellungen/konto"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] hover:bg-black/[0.03] transition-colors"
        >
          <CircleUser className="h-4 w-4 text-[var(--color-ink-3)]" />
          <span className="text-[13px] text-[var(--color-ink-2)]">Konto</span>
          {unreadCount > 0 && (
            <Badge tone="brand" className="ml-auto !py-0 !px-1.5">
              {unreadCount}
            </Badge>
          )}
        </Link>
      </div>
    </aside>
  );
}
