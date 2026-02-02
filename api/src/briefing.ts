import { pool } from "./db";
import { getTodayEvents } from "./calendar";

export async function buildBriefingText() {
  const tasksRes = await pool.query(
    "SELECT id, title FROM tasks WHERE done = false ORDER BY id;"
  );

  const tasksLines = tasksRes.rows.map((t) => `- [${t.id}] ${t.title}`);
  const tasksText = tasksLines.length ? tasksLines.join("\n") : "- (empty)";

  const events = await getTodayEvents();
  let eventsText = "- (not connected)";
  if (events) {
    const lines = events.map((e) => {
      const start = e.start?.dateTime || e.start?.date || "";
      const title = e.summary || "(no title)";
      return `- ${start} ${title}`;
    });
    eventsText = lines.length ? lines.join("\n") : "- (no events)";
  }

  return (
    `morning briefing\n\n` +
    `todo:\n${tasksText}\n\n` +
    `calendar (today):\n${eventsText}\n`
  );
}