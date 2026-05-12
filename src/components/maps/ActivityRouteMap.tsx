"use client";

import { useMemo, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import type { LatLngBoundsExpression, LeafletMouseEvent } from "leaflet";
import type { ActivityPoint, ActivityRoute } from "@/types/activity";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { formatDistance, formatElevation, formatDateTime } from "@/lib/format";
import { colorForSport, getRouteBounds, nearestPoint } from "@/lib/geo";
import { Stack, Typography } from "@mui/material";

export function ActivityRouteMap({ activity }: { activity: ActivityRoute }) {
  const [selectedPoint, setSelectedPoint] = useState<ActivityPoint | null>(null);
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const routeBounds = getRouteBounds([activity]);
    if (!routeBounds) return null;
    return [
      [routeBounds.minLat, routeBounds.minLng],
      [routeBounds.maxLat, routeBounds.maxLng],
    ];
  }, [activity]);

  function handleRouteClick(event: LeafletMouseEvent) {
    const nearest = nearestPoint(event.latlng, activity.points);
    setSelectedPoint(nearest?.point ?? null);
  }

  return (
    <LeafletMap bounds={bounds} height={560}>
      <Polyline
        positions={activity.points.map((point) => [point.lat, point.lng])}
        pathOptions={{ color: colorForSport(activity.sportType), weight: 5, opacity: 0.95 }}
        eventHandlers={{ click: handleRouteClick, mousemove: handleRouteClick }}
      />
      {selectedPoint && (
        <Popup position={[selectedPoint.lat, selectedPoint.lng]} eventHandlers={{ remove: () => setSelectedPoint(null) }}>
          <Stack spacing={0.5} sx={{ color: "#0b1419", minWidth: 160 }}>
            <Typography variant="subtitle2">Nearest point</Typography>
            <Typography variant="body2">{formatDistance(selectedPoint.distance)}</Typography>
            <Typography variant="body2">{formatElevation(selectedPoint.altitude)}</Typography>
            <Typography variant="body2">HR {selectedPoint.heartrate ? Math.round(selectedPoint.heartrate) : "n/a"}</Typography>
            <Typography variant="body2">{formatDateTime(selectedPoint.time)}</Typography>
          </Stack>
        </Popup>
      )}
    </LeafletMap>
  );
}
