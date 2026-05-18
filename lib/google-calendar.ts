import { OAuth2Client } from "google-auth-library";

/**
 * Google Calendar integration for the central sales/consultation calendar.
 *
 * One shared Google account connected once via OAuth (refresh token).
 * Env vars (set in Vercel):
 *   GOOGLE_CALENDAR_CLIENT_ID
 *   GOOGLE_CALENDAR_CLIENT_SECRET
 *   GOOGLE_CALENDAR_REFRESH_TOKEN
 *   GOOGLE_CALENDAR_ID            (optional, default "primary")
 *
 * If not fully configured, isGoogleCalendarConfigured() is false and the
 * booking funnel falls back to fixed time windows; the Studio still works
 * (events just aren't pushed to Google).
 */

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
export const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

const API = "https://www.googleapis.com/calendar/v3";

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
}

function client(): OAuth2Client {
  const c = new OAuth2Client({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
  c.setCredentials({ refresh_token: REFRESH_TOKEN });
  return c;
}

export interface BusyInterval {
  start: string; // ISO
  end: string;
}

export async function getFreeBusy(timeMinIso: string, timeMaxIso: string): Promise<BusyInterval[]> {
  if (!isGoogleCalendarConfigured()) return [];
  const auth = client();
  const res = await auth.request<{
    calendars: Record<string, { busy: BusyInterval[] }>;
  }>({
    url: `${API}/freeBusy`,
    method: "POST",
    data: {
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      timeZone: "Europe/Berlin",
      items: [{ id: CALENDAR_ID }],
    },
  });
  return res.data.calendars?.[CALENDAR_ID]?.busy ?? [];
}

export interface CreatedEvent {
  eventId: string;
  htmlLink: string | null;
  meetUrl: string | null;
}

export async function createConsultationEvent(input: {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  attendees: { email: string; displayName?: string }[];
  addGoogleMeet: boolean;
  location?: string;
}): Promise<CreatedEvent> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Google Calendar not configured");
  }
  const auth = client();
  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startIso, timeZone: "Europe/Berlin" },
    end: { dateTime: input.endIso, timeZone: "Europe/Berlin" },
    attendees: input.attendees.map((a) => ({ email: a.email, displayName: a.displayName })),
    reminders: { useDefault: true },
  };
  if (input.location) body.location = input.location;
  if (input.addGoogleMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: `immohero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const res = await auth.request<{
    id: string;
    htmlLink?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
  }>({
    url: `${API}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=all`,
    method: "POST",
    data: body,
  });

  const video = res.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video");
  return {
    eventId: res.data.id,
    htmlLink: res.data.htmlLink ?? null,
    meetUrl: res.data.hangoutLink ?? video?.uri ?? null,
  };
}

export async function updateConsultationEvent(
  eventId: string,
  patch: {
    startIso?: string;
    endIso?: string;
    description?: string;
    location?: string;
    summary?: string;
  },
): Promise<void> {
  if (!isGoogleCalendarConfigured()) return;
  const auth = client();
  const data: Record<string, unknown> = {};
  if (patch.summary) data.summary = patch.summary;
  if (patch.description) data.description = patch.description;
  if (patch.location) data.location = patch.location;
  if (patch.startIso) data.start = { dateTime: patch.startIso, timeZone: "Europe/Berlin" };
  if (patch.endIso) data.end = { dateTime: patch.endIso, timeZone: "Europe/Berlin" };

  await auth.request({
    url: `${API}/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    method: "PATCH",
    data,
  });
}

export async function deleteConsultationEvent(eventId: string): Promise<void> {
  if (!isGoogleCalendarConfigured()) return;
  const auth = client();
  try {
    await auth.request({
      url: `${API}/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      method: "DELETE",
    });
  } catch (err) {
    console.error("[google-calendar] delete failed", err);
  }
}
