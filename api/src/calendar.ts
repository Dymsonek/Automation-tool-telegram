import { google } from "googleapis";
import { getOAuthClient, loadTokens } from "./googleAuth";

export async function getTodayEvents() {
  const oauth2Client = getOAuthClient();
  const tokens = loadTokens();
  
  if (!tokens) return null; 

  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const resp = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  return resp.data.items ?? [];
}