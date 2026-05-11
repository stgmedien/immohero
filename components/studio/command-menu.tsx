"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FolderKanban, Users, Briefcase, Plus, Settings, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "order" | "customer" | "deal";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await r.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden gap-0">
        <DialogTitle className="sr-only">Suche und Quick-Actions</DialogTitle>
        <Command shouldFilter={false} className="flex flex-col max-h-[60vh]">
          <div className="flex items-center gap-3 border-b border-[var(--color-hair)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--color-ink-3)]" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Suchen oder Aktion ausführen…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--color-ink-4)]"
            />
          </div>
          <Command.List className="flex-1 overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-[var(--color-ink-3)]">
              {loading ? "Suche läuft…" : query.length < 2 ? "Tippe mindestens 2 Zeichen…" : "Nichts gefunden."}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group heading="Treffer" className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {results.map((r) => (
                  <Command.Item
                    key={`${r.type}-${r.id}`}
                    onSelect={() => handleSelect(r.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] cursor-pointer text-sm aria-selected:bg-[var(--color-bg-subtle)]"
                  >
                    <ResultIcon type={r.type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      {r.subtitle && (
                        <p className="text-xs text-[var(--color-ink-3)] truncate">{r.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
                      {r.type === "order" ? "Projekt" : r.type === "customer" ? "Kunde" : "Deal"}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Aktionen" className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mt-2">
              {[
                { label: "Neues Projekt", icon: Plus, href: "/studio/projekte/neu" },
                { label: "Alle Projekte", icon: FolderKanban, href: "/studio/projekte" },
                { label: "Neuer Kunde", icon: Users, href: "/studio/kunden?new=1" },
                { label: "Pipeline", icon: Briefcase, href: "/studio/deals" },
                { label: "Einstellungen", icon: Settings, href: "/studio/einstellungen" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Command.Item
                    key={action.href}
                    onSelect={() => handleSelect(action.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] cursor-pointer text-sm aria-selected:bg-[var(--color-bg-subtle)]"
                  >
                    <Icon className="h-4 w-4 text-[var(--color-ink-3)]" />
                    <span>{action.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
          <div className="border-t border-[var(--color-hair)] px-4 py-2 text-[10px] text-[var(--color-ink-4)]">
            ↑↓ Navigation · Enter zum Auswählen · Esc zum Schließen
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function ResultIcon({ type }: { type: string }) {
  const Icon = type === "order" ? FolderKanban : type === "customer" ? Users : Briefcase;
  return (
    <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] text-[var(--color-ink-2)]">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
