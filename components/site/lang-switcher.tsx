"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LangSwitcher() {
  const [locale, setLocale] = useState<"de" | "en">("de");
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)locale=(de|en)/);
    if (m) setLocale(m[1] as "de" | "en");
    else {
      const al = navigator.language.toLowerCase();
      if (al.startsWith("en")) setLocale("en");
    }
  }, []);

  function set(next: "de" | "en") {
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    location.reload();
  }

  return (
    <div className="inline-flex items-center gap-0 rounded-full border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-0.5 text-[11px] font-mono">
      <button
        onClick={() => set("de")}
        className={cn(
          "rounded-full px-2 py-0.5",
          locale === "de" ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "text-[var(--color-ink-3)]",
        )}
      >
        DE
      </button>
      <button
        onClick={() => set("en")}
        className={cn(
          "rounded-full px-2 py-0.5",
          locale === "en" ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "text-[var(--color-ink-3)]",
        )}
      >
        EN
      </button>
    </div>
  );
}
