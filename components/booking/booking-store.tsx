"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { BookingDraft } from "@/lib/booking";

const STORAGE_KEY = "immohero.booking.v1";

const empty: BookingDraft = {
  bundleSlug: null,
  serviceSlugs: [],
  property: {
    type: "haus",
    address: "",
    plz: "",
    city: "",
    sizeQm: undefined,
    notes: undefined,
  },
  schedule: {
    date: "",
    timeSlot: "",
  },
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: undefined,
  },
};

interface BookingContextValue {
  draft: BookingDraft;
  patch: (patch: Partial<BookingDraft>) => void;
  patchProperty: (patch: Partial<BookingDraft["property"]>) => void;
  patchSchedule: (patch: Partial<BookingDraft["schedule"]>) => void;
  patchCustomer: (patch: Partial<BookingDraft["customer"]>) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: Partial<BookingDraft>;
}) {
  const [draft, setDraft] = useState<BookingDraft>(() => ({ ...empty, ...initial }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<BookingDraft>;
        setDraft((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const value: BookingContextValue = {
    draft,
    patch: (p) => setDraft((d) => ({ ...d, ...p })),
    patchProperty: (p) => setDraft((d) => ({ ...d, property: { ...d.property, ...p } })),
    patchSchedule: (p) => setDraft((d) => ({ ...d, schedule: { ...d.schedule, ...p } })),
    patchCustomer: (p) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...p } })),
    reset: () => {
      setDraft(empty);
      sessionStorage.removeItem(STORAGE_KEY);
    },
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
