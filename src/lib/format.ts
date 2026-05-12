import { format, parseISO } from "date-fns";

const metersPerMile = 1609.344;

export function formatDistance(meters?: number | null) {
  if (!meters) return "0.0 mi";
  return `${(meters / metersPerMile).toFixed(1)} mi`;
}

export function formatElevation(meters?: number | null) {
  if (!meters) return "0 ft";
  return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
}

export function formatDuration(seconds?: number | null) {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  return `${remainingSeconds}s`;
}

export function formatSpeed(metersPerSecond?: number | null) {
  if (!metersPerSecond) return "n/a";
  return `${(metersPerSecond * 2.23694).toFixed(1)} mph`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "n/a";
  try {
    return format(parseISO(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "n/a";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}
