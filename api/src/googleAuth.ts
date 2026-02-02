import { google } from "googleapis";
import fs from "node:fs";

const tokenPath = "tokens.json";

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is missing");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET is missing");
  if (!redirectUri) throw new Error("GOOGLE_REDIRECT_URI is missing");

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function saveTokens(tokens: unknown) {
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
}

export function loadTokens(): any | null {
  if (!fs.existsSync(tokenPath)) return null;
  return JSON.parse(fs.readFileSync(tokenPath, "utf8"));
}
