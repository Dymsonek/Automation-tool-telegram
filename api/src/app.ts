import express from "express";
import { pool } from "./db";

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
  const result = await pool.query(
    "SELECT id, title FROM tasks WHERE done = false ORDER BY id;"
  );

  const lines = result.rows.map((t) => `- [${t.id}] ${t.title}`);
  const text =
    `Morning briefing\n\nTodo:\n` + (lines.length ? lines.join("\n") : "- (empty)");

  res.type("text/plain").send(text);
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
