// Open-Meteo integration (free, no API key)
// https://open-meteo.com/en/docs

export interface WeatherSnapshot {
  condition: string;
  temp: number;
  wind: number;
  gust?: number;
  precipitationProbability?: number;
  flyable: boolean;
  forecastDate?: string;
  locationName?: string;
  updatedAt: string;
}

const WMO_CODES: Record<number, string> = {
  0: "Klar",
  1: "Überwiegend klar",
  2: "Teilweise bewölkt",
  3: "Bewölkt",
  45: "Nebel",
  48: "Nebel mit Reif",
  51: "Leichter Nieselregen",
  53: "Nieselregen",
  55: "Starker Nieselregen",
  61: "Leichter Regen",
  63: "Regen",
  65: "Starker Regen",
  71: "Leichter Schneefall",
  73: "Schneefall",
  75: "Starker Schneefall",
  80: "Regenschauer",
  81: "Regenschauer",
  82: "Heftige Regenschauer",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "Schweres Gewitter",
};

async function geocode(plz: string, city: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&country=DE&count=1`,
      { next: { revalidate: 86400 } },
    );
    const data = await res.json();
    const first = data.results?.[0];
    if (!first) return null;
    return { lat: first.latitude, lng: first.longitude, name: first.name };
  } catch {
    return null;
  }
}

export async function fetchWeatherForOrder(input: {
  plz: string;
  city: string;
  scheduledAt: Date | null;
}): Promise<WeatherSnapshot | null> {
  const coords = await geocode(input.plz, input.city);
  if (!coords) return null;

  const targetDate = input.scheduledAt ?? new Date();
  const dateStr = targetDate.toISOString().slice(0, 10);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lng));
    url.searchParams.set(
      "daily",
      "weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,windgusts_10m_max,precipitation_probability_max",
    );
    url.searchParams.set("timezone", "Europe/Berlin");
    url.searchParams.set("start_date", dateStr);
    url.searchParams.set("end_date", dateStr);

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    const daily = data.daily;
    if (!daily || !daily.time?.length) return null;

    const idx = 0;
    const code = Number(daily.weathercode[idx] ?? 0);
    const condition = WMO_CODES[code] ?? `Code ${code}`;
    const tempMax = Number(daily.temperature_2m_max[idx] ?? 0);
    const windMax = Number(daily.windspeed_10m_max[idx] ?? 0);
    const gustMax = Number(daily.windgusts_10m_max[idx] ?? 0);
    const precip = Number(daily.precipitation_probability_max[idx] ?? 0);
    const flyable = windMax < 30 && gustMax < 50 && precip < 80 && ![95, 96, 99].includes(code);

    return {
      condition,
      temp: Math.round(tempMax),
      wind: Math.round(windMax),
      gust: Math.round(gustMax),
      precipitationProbability: precip,
      flyable,
      forecastDate: dateStr,
      locationName: coords.name,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
