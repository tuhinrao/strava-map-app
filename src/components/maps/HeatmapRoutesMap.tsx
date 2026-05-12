"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Polyline } from "react-leaflet";
import type { LatLngBoundsExpression, LeafletMouseEvent } from "leaflet";
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { ActivityRoute } from "@/types/activity";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { colorForSport, getRouteBounds, haversineMeters } from "@/lib/geo";
import { formatDate, formatDistance, formatElevation } from "@/lib/format";

type HeatmapRoutesMapProps = {
  routes: ActivityRoute[];
  opacity: number;
  lineWidth: number;
};

export function HeatmapRoutesMap({ routes, opacity, lineWidth }: HeatmapRoutesMapProps) {
  const [matches, setMatches] = useState<ActivityRoute[]>([]);
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const routeBounds = getRouteBounds(routes);
    if (!routeBounds) return null;
    return [
      [routeBounds.minLat, routeBounds.minLng],
      [routeBounds.maxLat, routeBounds.maxLng],
    ];
  }, [routes]);

  function handleClick(event: LeafletMouseEvent) {
    const target = event.latlng;
    const nearby = routes.filter((route) =>
      route.points.some((point, index) => index % 5 === 0 && haversineMeters(target, point) <= 90),
    );
    setMatches(nearby);
  }

  const dates = matches.map((route) => route.startDate).filter(Boolean).sort() as string[];
  const totalDistance = matches.reduce((sum, route) => sum + (route.distance ?? 0), 0);
  const totalElevation = matches.reduce((sum, route) => sum + (route.totalElevationGain ?? 0), 0);

  return (
    <>
      <LeafletMap bounds={bounds} height="calc(100vh - 260px)">
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.points.map((point) => [point.lat, point.lng])}
            pathOptions={{
              color: colorForSport(route.sportType),
              weight: lineWidth,
              opacity,
              lineCap: "round",
              lineJoin: "round",
            }}
            eventHandlers={{ click: handleClick }}
          />
        ))}
      </LeafletMap>
      <Drawer anchor="right" open={matches.length > 0} onClose={() => setMatches([])}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 3 }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Nearby routes
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {matches.length} repeats · {formatDistance(totalDistance)} · {formatElevation(totalElevation)}
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="body2">Earliest: {formatDate(dates[0])}</Typography>
            <Typography variant="body2">Latest: {formatDate(dates[dates.length - 1])}</Typography>
          </Stack>
          <Divider />
          <List>
            {matches.map((route) => (
              <ListItem key={route.id} disablePadding>
                <ListItemButton component={Link} href={`/activities/${route.id}`}>
                  <ListItemText
                    primary={route.name}
                    secondary={`${route.sportType ?? "Unknown"} · ${formatDate(route.startDate)} · ${formatDistance(route.distance)}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button fullWidth onClick={() => setMatches([])}>
            Close
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
