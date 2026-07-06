"use server";

import { getAvailableConsultationSlots, type DaySlots } from "@/lib/consultation";
import { DEMO_MODE, demoConsultationSlots } from "@/lib/demo";

export async function loadConsultationSlots(): Promise<DaySlots[]> {
  if (DEMO_MODE) return demoConsultationSlots(14);
  try {
    return await getAvailableConsultationSlots(14);
  } catch (err) {
    console.error("[slots-action] failed", err);
    return [];
  }
}
