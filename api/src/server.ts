import "dotenv/config";
import { app } from "./app";
import { buildBriefingText } from "./briefing";
import { sendTelegramMessage } from "./telegram";
import cron from "node-cron";


const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

cron.schedule("0 8 * * *", async () => {
  try {
    console.log("running daily briefing job...");
    const text = await buildBriefingText();
    await sendTelegramMessage(text);
  } catch (err) {
    console.error("briefing cron failed", err);
  }
});