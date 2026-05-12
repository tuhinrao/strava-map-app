export type LatLngPoint = {
  lat: number;
  lng: number;
};

export type ActivityPoint = LatLngPoint & {
  pointIndex?: number;
  time: string | null;
  distance: number | null;
  altitude: number | null;
  heartrate: number | null;
  cadence?: number | null;
  watts?: number | null;
  velocitySmooth?: number | null;
};

export type ActivitySummary = {
  id: number;
  name: string;
  sportType: string | null;
  startDate: string | null;
  distance: number | null;
  movingTime: number | null;
  elapsedTime: number | null;
  totalElevationGain: number | null;
  averageSpeed: number | null;
  maxSpeed: number | null;
  averageHeartrate: number | null;
  maxHeartrate: number | null;
  syncedAt?: string | null;
};

export type ActivityRoute = ActivitySummary & {
  points: ActivityPoint[];
};

export type DashboardSummary = {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  latestActivityDate: string | null;
  sportTypeCounts: Record<string, number>;
};

export type ActivitiesResponse = {
  activities: ActivitySummary[];
  limit: number;
  offset: number;
};

export type HeatmapSelection = {
  activityIds: number[];
  repeatCount: number;
  earliestDate: string | null;
  latestDate: string | null;
  totalDistance: number;
  totalElevation: number;
};
