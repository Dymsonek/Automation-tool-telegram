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