"use client";

import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import type { ActivitySummary } from "@/types/activity";
import { formatDateTime, formatDistance, formatDuration, formatElevation, formatSpeed } from "@/lib/format";

export function ActivityStatsCard({ activity }: { activity: ActivitySummary }) {
  const stats = [
    ["Sport", activity.sportType ?? "Unknown"],
    ["Start", formatDateTime(activity.startDate)],
    ["Distance", formatDistance(activity.distance)],
    ["Elevation", formatElevation(activity.totalElevationGain)],
    ["Moving time", formatDuration(activity.movingTime)],
    ["Elapsed time", formatDuration(activity.elapsedTime)],
    ["Avg speed", formatSpeed(activity.averageSpeed)],
    ["Max speed", formatSpeed(activity.maxSpeed)],
    ["Avg HR", activity.averageHeartrate ? `${Math.round(activity.averageHeartrate)} bpm` : "n/a"],
    ["Max HR", activity.maxHeartrate ? `${Math.round(activity.maxHeartrate)} bpm` : "n/a"],
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          {activity.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Activity details
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={1}>
          {stats.map(([label, value]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography sx={{ textAlign: "right", fontWeight: 700 }}>{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
