// Servicegebiete für ImmoHero-Launch: OWL + NRW (Auswahl der wichtigsten Städte/PLZs).
// Die PLZs sind aus dem deutschen PLZ-System abgeleitet (OWL: 32xxx-33xxx, übriges NRW: 40xxx-59xxx).
// Erweiterbar im Admin nachträglich.

export interface ServiceAreaSeed {
  plz: string;
  city: string;
  region: string;
}

const RANGES: { from: number; to: number; city: string; region: string }[] = [
  // OWL Kerngebiet
  { from: 32049, to: 32130, city: "Herford & Umgebung", region: "OWL" },
  { from: 32257, to: 32339, city: "Bünde / Lübbecke", region: "OWL" },
  { from: 32339, to: 32760, city: "Detmold / Lippe", region: "OWL" },
  { from: 33098, to: 33106, city: "Paderborn", region: "OWL" },
  { from: 33129, to: 33189, city: "Delbrück / Salzkotten", region: "OWL" },
  { from: 33330, to: 33335, city: "Gütersloh", region: "OWL" },
  { from: 33378, to: 33449, city: "Rheda-Wiedenbrück / Halle Westf.", region: "OWL" },
  { from: 33602, to: 33739, city: "Bielefeld", region: "OWL" },

  // Münsterland
  { from: 48143, to: 48167, city: "Münster", region: "Münsterland" },
  { from: 48565, to: 48599, city: "Steinfurt / Rheine", region: "Münsterland" },

  // Ruhrgebiet
  { from: 44135, to: 44388, city: "Dortmund", region: "Ruhrgebiet" },
  { from: 45127, to: 45359, city: "Essen", region: "Ruhrgebiet" },
  { from: 47051, to: 47279, city: "Duisburg", region: "Ruhrgebiet" },
  { from: 44787, to: 44894, city: "Bochum", region: "Ruhrgebiet" },
  { from: 58095, to: 58135, city: "Hagen", region: "Ruhrgebiet" },

  // Rheinland
  { from: 40210, to: 40629, city: "Düsseldorf", region: "Rheinland" },
  { from: 50667, to: 51149, city: "Köln", region: "Rheinland" },
  { from: 51373, to: 51381, city: "Leverkusen", region: "Rheinland" },
  { from: 53111, to: 53229, city: "Bonn", region: "Rheinland" },

  // Bergisches Land / Niederrhein
  { from: 42103, to: 42399, city: "Wuppertal", region: "Bergisches Land" },
  { from: 41061, to: 41239, city: "Mönchengladbach", region: "Niederrhein" },
];

export function buildServiceAreas(): ServiceAreaSeed[] {
  const out: ServiceAreaSeed[] = [];
  const seen = new Set<string>();
  for (const range of RANGES) {
    for (let n = range.from; n <= range.to; n++) {
      const plz = String(n).padStart(5, "0");
      if (seen.has(plz)) continue;
      seen.add(plz);
      out.push({ plz, city: range.city, region: range.region });
    }
  }
  return out;
}
