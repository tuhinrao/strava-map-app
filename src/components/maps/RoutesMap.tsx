"use client";

import { useMemo, useState } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { ActivityRoute } from "@/types/activity";
import { ActivityRouteDialog } from "@/components/activities/ActivityRouteDialog";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { colorForSport, getRouteBounds } from "@/lib/geo";

export function RoutesMap({ routes, height = 520 }: { routes: ActivityRoute[]; height?: number | string }) {
  const [selected, setSelected] = useState<ActivityRoute | null>(null);
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const routeBounds = getRouteBounds(routes);
    if (!routeBounds) return null;
    return [
      [routeBounds.minLat, routeBounds.minLng],
      [routeBounds.maxLat, routeBounds.maxLng],
    ];
  }, [routes]);

  return (
    <>
      <LeafletMap bounds={bounds} height={height}>
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.points.map((point) => [point.lat, point.lng])}
            pathOptions={{ color: colorForSport(route.sportType), weight: 4, opacity: 0.85 }}
            eventHandlers={{ click: () => setSelected(route) }}
          >
            <Tooltip sticky>{route.name}</Tooltip>
          </Polyline>
        ))}
      </LeafletMap>
      <ActivityRouteDialog activity={selected} onClose={() => setSelected(null)} />
    </>
  );
}
