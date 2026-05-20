"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const LocaleCtx = createContext<Locale>("de");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>;
}

/** Hook für Client-Komponenten — gibt den vom Server gesetzten Locale zurück. */
export function useLocale(): Locale {
  return useContext(LocaleCtx);
}
