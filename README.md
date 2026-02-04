Automation Tool — API + Postgres (MVP)

Uruchomienie szybkiego MVP z Express + TypeScript, Postgres i cron. W zestawie proste integracje: Google Calendar (OAuth2), Telegram oraz briefing łączący TODO + kalendarz.

Szybki start (Docker Compose)
- Wymagane: Docker + Docker Compose.
- Skonfiguruj zmienne środowiskowe (opcjonalnie) w pliku `.env` w katalogu głównym lub eksportuj je w powłoce:
  - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (domyślnie `http://localhost:3000/auth/google/callback`)
- Uruchom: `docker compose up --build`
- API: `http://localhost:3000`
- Postgres: `localhost:5432` (user: `app`, pass: `app`, db: `app`)

Środowisko i konfiguracja
- `api/.env.example` zawiera pełną listę zmiennych. Dla Dockera `DATABASE_URL` jest ustawiany automatycznie na `postgres://app:app@db:5432/app`.
- Cron uruchamia briefing codziennie o 08:00 (patrz `api/src/server.ts`). Do wysyłki przez Telegram wymagane są `TELEGRAM_*`.

Integracje (MVP)
- Google Calendar OAuth2:
  - Ustaw w konsoli Google OAuth 2.0 `Authorized redirect URI` na: `http://localhost:3000/auth/google/callback`.
  - Wejdź na: `GET /auth/google` aby wywołać zgodę, potem zostaniesz przekierowany na callback.
  - Sprawdź dzisiejsze eventy: `GET /calendar/today`.
- Telegram:
  - Ustaw `TELEGRAM_BOT_TOKEN` i `TELEGRAM_CHAT_ID`.
  - Wyślij ręcznie briefing: `POST /notify`.

Endpointy
- `GET /healthz` – status API.
- `GET /tasks` / `POST /tasks` / `PATCH /tasks/:id` / `DELETE /tasks/:id`.
- `GET /briefing` – tekst briefingu (TODO + kalendarz).
- `GET /auth/google`, `GET /auth/google/callback`, `GET /calendar/today`.

Struktura kontenerów
- `db` – Postgres 16, inicjalizacja schematu z `api/sql/init.sql` (tabele `tasks`, `google_tokens`).
- `api` – Node 20 (alpine), build TypeScript i start `dist/server.js`.

Lokalny development (bez Dockera)
- `cd api && cp .env.example .env` i uzupełnij wartości.
- `npm install` i `npm run dev`.
- Upewnij się, że `DATABASE_URL` wskazuje na Twoją instancję Postgresa.

Następne kroki (propozycje)
- Konfiguracja godziny briefingu + włącz/wyłącz sekcje (DB settings).
- Refaktor do `services/` (tasks/briefing/telegram/calendar).
- OpenAPI/Swagger + walidacja (zod).
- Observability: pino + request id + /metrics.

