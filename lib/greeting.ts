// Dynamic, time-of-day-aware greetings inspired by Aero One

const GREETINGS_BY_SLOT: Record<string, string[]> = {
  morning: [
    "Guten Morgen",
    "Schönen guten Morgen",
    "Moin",
  ],
  midday: [
    "Guten Mittag",
    "Hallo",
    "Hi",
  ],
  afternoon: [
    "Guten Nachmittag",
    "Schönen Nachmittag",
    "Hallo",
  ],
  evening: [
    "Guten Abend",
    "Schönen Abend",
    "Hallo",
  ],
  night: [
    "Späte Schicht",
    "Hallo nochmal",
    "Späten Abend",
  ],
};

const SUBTITLES_BY_SLOT: Record<string, string[]> = {
  morning: [
    "Heute ist {weekday}. {tasks}.",
    "Frischer Start in den Tag. {tasks}.",
    "Ein neuer Tag, viele Möglichkeiten. {tasks}.",
  ],
  midday: [
    "Mittagspause? {tasks}.",
    "Halbzeit. {tasks}.",
    "Gut gemacht bis hierher. {tasks}.",
  ],
  afternoon: [
    "Noch ein paar Stunden. {tasks}.",
    "Das Tagesziel im Blick. {tasks}.",
    "Heute ist {weekday}. {tasks}.",
  ],
  evening: [
    "Feierabend bald. {tasks}.",
    "Letzte Runde. {tasks}.",
    "Abend-Check. {tasks}.",
  ],
  night: [
    "Späte Schicht. {tasks}.",
    "Noch im Studio. {tasks}.",
    "Heute lang dran. {tasks}.",
  ],
};

const WEEKDAYS = [
  "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag",
];

function pickStable<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function getGreeting(name?: string | null, now = new Date()) {
  const hour = now.getHours();
  const slot =
    hour < 5 ? "night"
    : hour < 11 ? "morning"
    : hour < 14 ? "midday"
    : hour < 18 ? "afternoon"
    : hour < 22 ? "evening"
    : "night";

  const seedDay = Math.floor(now.getTime() / (1000 * 60 * 60));
  const greeting = pickStable(GREETINGS_BY_SLOT[slot], seedDay);
  const firstName = name?.split(" ")[0] ?? "";

  return {
    slot,
    title: firstName ? `${greeting}, ${firstName}.` : `${greeting}.`,
    weekday: WEEKDAYS[now.getDay()],
    subtitleTemplate: pickStable(SUBTITLES_BY_SLOT[slot], seedDay),
  };
}

export function formatTasksHint(scheduledToday: number, scheduledWeek: number): string {
  if (scheduledToday > 0) {
    return scheduledToday === 1
      ? "Du hast 1 Termin heute"
      : `Du hast ${scheduledToday} Termine heute`;
  }
  if (scheduledWeek > 0) {
    return scheduledWeek === 1
      ? "1 Termin diese Woche"
      : `${scheduledWeek} Termine diese Woche`;
  }
  return "Keine geplanten Termine";
}
