import { app } from "./app";
import "dotenv/config";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
