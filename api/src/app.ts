import express from "express";
import { pool } from "./db";
import { sendTelegramMessage } from "./telegram";
import { getTodayEvents } from "./calendar";
import { getOAuthClient, loadTokens, saveTokens } from "./googleAuth";
import { google } from "googleapis";
import { buildBriefingText } from "./briefing";

export const app = express();
app.use(express.json()); 

app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id;");
  res.json(result.rows);
});

app.get("/briefing", async (req, res) => {
  const text = await buildBriefingText();
  res.type("text/plain").send(text);
});

app.get("/auth/google", (req, res) => {
  const oauth2Client = getOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    prompt: "consent",
  });

  res.redirect(url);
});

app.get("/calendar/today", async (req, res) => {
  const oauth2Client = getOAuthClient();
  const tokens = loadTokens();
  if (!tokens) return res.status(401).json({ error: "not connected. visit /auth/google" });

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

  const items = resp.data.items ?? [];
  res.json(items);
});

app.get("/auth/google/callback", async (req, res) => {
  const code = String(req.query.code || "");
  if (!code) return res.status(400).send("missing code");

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  saveTokens(tokens);
  res.type("text/plain").send("google calendar connected. you can call /calendar/today");
});

app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }

  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *;",
    [title]
  );

  res.status(201).json(result.rows[0]);
});

app.post("/notify", async (req, res) => {
  const text = await buildBriefingText();
  await sendTelegramMessage(text);
  res.json({ ok: true });
});

app.patch("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { done } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be boolean" });
  }

  const result = await pool.query(
    "UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *;",
    [done, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  res.json(result.rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  const result = await pool.query("DELETE FROM tasks WHERE id = $1;", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  res.status(204).send();
});


