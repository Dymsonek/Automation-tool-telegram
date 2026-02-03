import { google } from "googleapis";
import { pool } from "./db";

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is missing");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET is missing");
  if (!redirectUri) throw new Error("GOOGLE_REDIRECT_URI is missing");

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

const USER_ID = "me";

export async function saveTokens(tokens: unknown) {
  await pool.query(
    `
    INSERT INTO google_tokens (user_id, tokens)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (user_id)
    DO UPDATE SET tokens = EXCLUDED.tokens, updated_at = now();
    `,
    [USER_ID, JSON.stringify(tokens)]
  );
}

export async function loadTokens(): Promise<any | null> {
  const res = await pool.query(
    "SELECT tokens FROM google_tokens WHERE user_id = $1;",
    [USER_ID]
  );
  return res.rowCount ? res.rows[0].tokens : null;
}