import { query } from "@/lib/db";
import type { ActivityPoint, ActivityRoute, ActivitySummary, DashboardSummary } from "@/types/activity";

type ActivityRow = {
  id: string | number;
  name: string | null;
  sport_type: string | null;
  start_date: Date | string | null;
  distance: string | number | null;
  moving_time: string | number | null;
  elapsed_time: string | number | null;
  total_elevation_gain: string | number | null;
  average_speed: string | number | null;
  max_speed: string | number | null;
  average_heartrate: string | number | null;
  max_heartrate: string | number | null;
  synced_at?: Date | string | null;
};

type PointRow = {
  point_index: string | number | null;
  time: Date | string | null;
  lat: string | number | null;
  lng: string | number | null;
  distance: string | number | null;
  altitude: string | number | null;
  heartrate: string | number | null;
  cadence?: string | number | null;
  watts?: string | number | null;
  velocity_smooth?: string | number | null;
};

export type ActivityFilters = {
  search?: string;
  sportType?: string;
  after?: string;
  before?: string;
  limit: number;
  offset: number;
};

const activityColumns = `
  id,
  name,
  sport_type,
  start_date,
  distance,
  moving_time,
  elapsed_time,
  total_elevation_gain,
  average_speed,
  max_speed,
  average_heartrate,
  max_heartrate,
  fetched_at AS synced_at
`;

export async function getSummary(): Promise<DashboardSummary> {
  const [summary] = await query<{
    total_activities: string | number | null;
    total_distance: string | number | null;
    total_elevation: string | number | null;
    latest_activity_date: Date | string | null;
  }>(`
    SELECT
      COUNT(*) AS total_activities,
      COALESCE(SUM(distance), 0) AS total_distance,
      COALESCE(SUM(total_elevation_gain), 0) AS total_elevation,
      MAX(start_date) AS latest_activity_date
    FROM public.strava_activities
  `);

  const counts = await query<{ sport_type: string | null; count: string | number }>(`
    SELECT sport_type, COUNT(*) AS count
    FROM public.strava_activities
    GROUP BY sport_type
    ORDER BY count DESC
  `);

  return {
    totalActivities: toNumber(summary?.total_activities) ?? 0,
    totalDistance: toNumber(summary?.total_distance) ?? 0,
    totalElevation: toNumber(summary?.total_elevation) ?? 0,
    latestActivityDate: toIso(summary?.latest_activity_date),
    sportTypeCounts: Object.fromEntries(
      counts.map((row) => [row.sport_type ?? "Unknown", toNumber(row.count) ?? 0]),
    ),
  };
}

export async function getSportTypes() {
  const rows = await query<{ sport_type: string | null }>(`
    SELECT DISTINCT sport_type
    FROM public.strava_activities
    WHERE sport_type IS NOT NULL
    ORDER BY sport_type
  `);
  return rows.map((row) => row.sport_type).filter(Boolean) as string[];
}

export async function getActivities(filters: ActivityFilters): Promise<ActivitySummary[]> {
  const values: unknown[] = [];
  const where = buildFilters(filters, values);

  values.push(filters.limit);
  values.push(filters.offset);

  const rows = await query<ActivityRow>(
    `
      SELECT ${activityColumns}
      FROM public.strava_activities
      ${where}
      ORDER BY start_date DESC NULLS LAST
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  return rows.map(mapActivity);
}

export async function getActivityById(id: number): Promise<ActivityRoute | null> {
  const [activity] = await query<ActivityRow>(
    `SELECT ${activityColumns} FROM public.strava_activities WHERE id = $1`,
    [id],
  );

  if (!activity) return null;

  const points = await query<PointRow>(
    `
      SELECT
        point_index,
        NULL::timestamptz AS "time",
        latitude AS lat,
        longitude AS lng,
        distance_meters AS distance,
        altitude_meters AS altitude,
        heartrate,
        cadence,
        watts,
        velocity_smooth
      FROM public.strava_activity_points
      WHERE activity_id = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY point_index ASC
    `,
    [id],
  );

  return { ...mapActivity(activity), points: points.map(mapPoint).filter(isValidPoint) };
}

export async function getRecentRoutes(limit: number): Promise<ActivityRoute[]> {
  const activities = await query<ActivityRow>(
    `
      SELECT ${activityColumns}
      FROM public.strava_activities
      ORDER BY start_date DESC NULLS LAST
      LIMIT $1
    `,
    [limit],
  );

  return hydrateRoutes(activities);
}

export async function getHeatmapRoutes(filters: Omit<ActivityFilters, "search" | "limit" | "offset">) {
  const values: unknown[] = [];
  const where = buildFilters({ ...filters, limit: 0, offset: 0 }, values);
  const activities = await query<ActivityRow>(
    `
      SELECT ${activityColumns}
      FROM public.strava_activities
      ${where}
      ORDER BY start_date DESC NULLS LAST
    `,
    values,
  );

  // TODO: Add route simplification and bounding-box filtering once the dataset grows beyond local browser comfort.
  return hydrateRoutes(activities);
}

async function hydrateRoutes(activities: ActivityRow[]) {
  if (activities.length === 0) return [];

  const ids = activities.map((activity) => Number(activity.id));
  const pointRows = await query<(PointRow & { activity_id: string | number })>(
    `
      SELECT
        activity_id,
        point_index,
        NULL::timestamptz AS "time",
        latitude AS lat,
        longitude AS lng,
        distance_meters AS distance,
        altitude_meters AS altitude,
        heartrate
      FROM public.strava_activity_points
      WHERE activity_id = ANY($1::bigint[]) AND latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY activity_id, point_index ASC
    `,
    [ids],
  );

  const pointsByActivity = new Map<number, ActivityPoint[]>();
  for (const row of pointRows) {
    const activityId = Number(row.activity_id);
    const existing = pointsByActivity.get(activityId) ?? [];
    const point = mapPoint(row);
    if (isValidPoint(point)) existing.push(point);
    pointsByActivity.set(activityId, existing);
  }

  return activities.map((activity) => ({
    ...mapActivity(activity),
    points: pointsByActivity.get(Number(activity.id)) ?? [],
  }));
}

function buildFilters(filters: Partial<ActivityFilters>, values: unknown[]) {
  const clauses: string[] = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    clauses.push(`name ILIKE $${values.length}`);
  }

  if (filters.sportType) {
    values.push(filters.sportType);
    clauses.push(`sport_type = $${values.length}`);
  }

  if (filters.after) {
    values.push(filters.after);
    clauses.push(`start_date >= $${values.length}::timestamptz`);
  }

  if (filters.before) {
    values.push(filters.before);
    clauses.push(`start_date <= $${values.length}::timestamptz`);
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

function mapActivity(row: ActivityRow): ActivitySummary {
  return {
    id: Number(row.id),
    name: row.name ?? "Untitled activity",
    sportType: row.sport_type,
    startDate: toIso(row.start_date),
    distance: toNumber(row.distance),
    movingTime: toNumber(row.moving_time),
    elapsedTime: toNumber(row.elapsed_time),
    totalElevationGain: toNumber(row.total_elevation_gain),
    averageSpeed: toNumber(row.average_speed),
    maxSpeed: toNumber(row.max_speed),
    averageHeartrate: toNumber(row.average_heartrate),
    maxHeartrate: toNumber(row.max_heartrate),
    syncedAt: toIso(row.synced_at),
  };
}

function mapPoint(row: PointRow): ActivityPoint {
  return {
    pointIndex: toNumber(row.point_index) ?? undefined,
    time: toIso(row.time),
    lat: toNumber(row.lat) ?? Number.NaN,
    lng: toNumber(row.lng) ?? Number.NaN,
    distance: toNumber(row.distance),
    altitude: toNumber(row.altitude),
    heartrate: toNumber(row.heartrate),
    cadence: toNumber(row.cadence),
    watts: toNumber(row.watts),
    velocitySmooth: toNumber(row.velocity_smooth),
  };
}

function isValidPoint(point: ActivityPoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}
