"use server";

import { getAvailableConsultationSlots, type DaySlots } from "@/lib/consultation";

export async function loadConsultationSlots(): Promise<DaySlots[]> {
  try {
    return await getAvailableConsultationSlots(14);
  } catch (err) {
    console.error("[slots-action] failed", err);
    return [];
  }
}
