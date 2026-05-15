import type { ActivityPoint, ActivityRoute, LatLngPoint } from "@/types/activity";
import { getActivityColor } from "@/lib/activityMapTheme";

export function colorForSport(sportType?: string | null) {
  return getActivityColor(sportType);
}

export function getRouteBounds(routes: ActivityRoute[]) {
  const points = routes.flatMap((route) => route.points);
  if (points.length === 0) return null;
  return points.reduce(
    (bounds, point) => ({
      minLat: Math.min(bounds.minLat, point.lat),
      minLng: Math.min(bounds.minLng, point.lng),
      maxLat: Math.max(bounds.maxLat, point.lat),
      maxLng: Math.max(bounds.maxLng, point.lng),
    }),
    {
      minLat: points[0].lat,
      minLng: points[0].lng,
      maxLat: points[0].lat,
      maxLng: points[0].lng,
    },
  );
}

export function haversineMeters(a: LatLngPoint, b: LatLngPoint) {
  const radius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function nearestPoint(target: LatLngPoint, points: ActivityPoint[]) {
  let best: { point: ActivityPoint; distanceMeters: number } | null = null;
  for (const point of points) {
    const distanceMeters = haversineMeters(target, point);
    if (!best || distanceMeters < best.distanceMeters) {
      best = { point, distanceMeters };
    }
  }
  return best;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
