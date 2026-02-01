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
