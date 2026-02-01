import express from "express";

export const app = express();

app.use(express.json()); 

app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});
