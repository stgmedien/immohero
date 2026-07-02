/**
 * Kuratierter Equipment-Katalog (Richtwerte, Stand Mitte 2026).
 * Die Auswahl ist Datenlogik — das LLM formuliert nur.
 */
export interface EquipmentEntry {
  model: string;
  priceEur: number; // Richtwert Neupreis
  euClass: string;
  weightG: number;
  realEstateSuitability: "sehr gut" | "gut" | "bedingt";
  immoheroReady: boolean; // erfüllt Mindestanforderung für ImmoHero-Aufträge
  note: string;
}

export const EQUIPMENT_CATALOG: EquipmentEntry[] = [
  { model: "DJI Neo", priceEur: 199, euClass: "C0", weightG: 135, realEstateSuitability: "bedingt", immoheroReady: false, note: "Günstiger Einstieg zum Üben; Bildqualität für bezahlte Immo-Aufträge zu begrenzt." },
  { model: "DJI Mini 4K", priceEur: 299, euClass: "C0", weightG: 249, realEstateSuitability: "bedingt", immoheroReady: false, note: "Solide zum Lernen, 4K-Video; für Kundenaufträge fehlen Sensorgröße und D-Log." },
  { model: "DJI Mini 4 Pro", priceEur: 759, euClass: "C0", weightG: 249, realEstateSuitability: "gut", immoheroReady: true, note: "Bester Einstieg in bezahlte Aufträge: unter 250 g (A1), 4K/60, D-Log M, Hindernissensoren." },
  { model: "DJI Air 3S", priceEur: 1099, euClass: "C1", weightG: 724, realEstateSuitability: "sehr gut", immoheroReady: true, note: "Dual-Kamera (24+70 mm), 1-Zoll-Sensor — sehr flexibel für Objekt + Detail." },
  { model: "DJI Mavic 3 Pro", priceEur: 2099, euClass: "C2", weightG: 958, realEstateSuitability: "sehr gut", immoheroReady: true, note: "Profi-Standard: 4/3-Sensor, Tele-Optionen; C2 + A2-Zertifikat sinnvoll." },
  { model: "DJI Mavic 4 Pro", priceEur: 2199, euClass: "C2", weightG: 1063, realEstateSuitability: "sehr gut", immoheroReady: true, note: "Aktuelles Flaggschiff; für hochwertige Liegenschaften und Video-Reels." },
  { model: "DJI Avata 2", priceEur: 989, euClass: "C1", weightG: 377, realEstateSuitability: "bedingt", immoheroReady: false, note: "FPV-Innenflüge als Add-on-Skill; ersetzt keine Foto-Drohne." },
];

export function recommendEquipment(budgetEur: number): EquipmentEntry[] {
  const affordable = EQUIPMENT_CATALOG.filter((e) => e.priceEur <= budgetEur);
  const order = { "sehr gut": 0, gut: 1, bedingt: 2 } as const;
  return affordable
    .sort((a, b) => order[a.realEstateSuitability] - order[b.realEstateSuitability] || b.priceEur - a.priceEur)
    .slice(0, 3);
}
