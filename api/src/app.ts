import express from "express";
import { pool } from "./db";
import "dotenv/config";

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
