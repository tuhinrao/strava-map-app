export const activityMapTheme = {
  routeOutlineColor: "#05070a",
  routeOutlineOpacity: 0.9,
  routeColors: {
    walk: "#12f7ff",
    hike: "#12f7ff",
    trek: "#12f7ff",
    run: "#ff2fb3",
    trailrun: "#ff2fb3",
    ride: "#247cff",
    virtualride: "#247cff",
    mountainbikeride: "#00a3ff",
    swim: "#38e4ff",
    workout: "#c9ff31",
    other: "#f5fbff",
  },
  route: {
    outlineWeight: 8,
    foregroundWeight: 4.5,
    selectedOutlineWeight: 11,
    selectedForegroundWeight: 6.5,
  },
  marker: {
    clusterSize: 46,
    clusterSizeLarge: 58,
    pointSize: 18,
    pointSizeHighZoom: 14,
    startEndSize: 10,
    glow: "0 0 18px rgba(18, 247, 255, 0.65)",
  },
  ui: {
    panelBackground: "rgba(7, 16, 21, 0.86)",
    panelBorder: "rgba(255, 255, 255, 0.14)",
    panelText: "#f2f7f8",
  },
} as const;

const activityColorMatchers: Array<[string[], string]> = [
  [["walk", "hike", "trek"], activityMapTheme.routeColors.walk],
  [["run"], activityMapTheme.routeColors.run],
  [["ride", "bike", "cycling"], activityMapTheme.routeColors.ride],
  [["swim"], activityMapTheme.routeColors.swim],
  [["workout", "training"], activityMapTheme.routeColors.workout],
];

export function getActivityColor(activityType?: string | null) {
  const normalized = activityType?.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!normalized) return activityMapTheme.routeColors.other;

  const direct = activityMapTheme.routeColors[normalized as keyof typeof activityMapTheme.routeColors];
  if (direct) return direct;

  return activityColorMatchers.find(([tokens]) => tokens.some((token) => normalized.includes(token)))?.[1] ?? activityMapTheme.routeColors.other;
}
