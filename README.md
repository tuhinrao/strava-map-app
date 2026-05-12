# Strava Map App

Personal Next.js activity explorer for Strava/Garmin data already synced into PostgreSQL.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

## Required Environment

Create `.env.local` locally:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
```

Do not commit `.env.local`. The browser never connects to PostgreSQL directly; all database access goes through Next.js API routes under `src/app/api`.

## Pointing To The VPS DB

Use a PostgreSQL connection string that reaches the VPS database from your PC. Common options:

- SSH tunnel from local port `5432` to the VPS PostgreSQL service, then use `localhost` in `DATABASE_URL`.
- A restricted PostgreSQL user and firewall rule that only allows your development machine.

Keep DB credentials server-side only. Do not expose `DATABASE_URL` through `NEXT_PUBLIC_*` variables or client code.

## Pages

- `/` dashboard with summary cards, recent routes map, and recent activity list.
- `/activities` searchable activity table.
- `/activities/[id]` detail page with one route, stats, and nearest point popups.
- `/heatmap` personal heatmap using low-opacity route overlays from your own tracks.

## API Routes

- `GET /api/summary`
- `GET /api/activities`
- `GET /api/activities/[id]`
- `GET /api/routes/recent`
- `GET /api/heatmap`

## Database Assumptions

The app assumes these existing tables and columns:

- `public.strava_activities`: `id`, `name`, `sport_type`, `start_date`, `distance`, `moving_time`, `elapsed_time`, `total_elevation_gain`, `average_speed`, `max_speed`, `average_heartrate`, `max_heartrate`, `synced_at`
- `public.strava_activity_points`: `activity_id`, `point_index`, `time`, `lat`, `lng`, `distance`, `altitude`, `heartrate`, `cadence`, `watts`, `velocity_smooth`

If the VPS schema differs, adjust the SQL in `src/lib/activityQueries.ts`.

## Build

```bash
npm run build
```
