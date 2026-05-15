import type { ActivityPoint, ActivityRoute, LatLngPoint } from "@/types/activity";
import { getActivityColor } from "@/lib/activityMapTheme";

export { getActivityColor };

export function getRouteMidpoint(points: ActivityPoint[]): LatLngPoint | null {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];

  const distances = cumulativeDistances(points);
  const halfDistance = distances[distances.length - 1] / 2;
  const midpointIndex = distances.findIndex((distance) => distance >= halfDistance);
  return points[Math.max(0, midpointIndex)];
}

export function getRouteBounds(points: LatLngPoint[]) {
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

export function getRoutesBounds(routes: ActivityRoute[]) {
  return getRouteBounds(routes.flatMap((route) => route.points));
}

export function simplifyRouteForZoom(points: ActivityPoint[], zoom: number) {
  if (points.length <= 2 || zoom >= 15) return points;

  const step = zoom < 10 ? 35 : zoom <= 12 ? 10 : zoom <= 14 ? 4 : 1;
  const simplified = points.filter((_, index) => index % step === 0);
  const lastPoint = points[points.length - 1];

  if (simplified[0] !== points[0]) simplified.unshift(points[0]);
  if (simplified[simplified.length - 1] !== lastPoint) simplified.push(lastPoint);

  return simplified;
}

export function shouldShowRouteAtZoom(route: ActivityRoute, zoom: number) {
  if (zoom <= 6) return false;
  if (zoom <= 10) return (route.distance ?? 0) >= 12000;
  return true;
}

export function shouldShowStartEndAtZoom(zoom: number) {
  return zoom >= 14;
}

function cumulativeDistances(points: ActivityPoint[]) {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances[index] = distances[index - 1] + haversineMeters(points[index - 1], points[index]);
  }
  return distances;
}

function haversineMeters(a: LatLngPoint, b: LatLngPoint) {
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

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
