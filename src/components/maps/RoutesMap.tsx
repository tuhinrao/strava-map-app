"use client";

import { useMemo, useState } from "react";
import L, { type LatLngBoundsExpression } from "leaflet";
import { Marker, Polyline, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import type { ActivityRoute } from "@/types/activity";
import { ActivityRouteDialog } from "@/components/activities/ActivityRouteDialog";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { activityMapTheme, getActivityColor } from "@/lib/activityMapTheme";
import {
  getRouteMidpoint,
  getRoutesBounds,
  shouldShowRouteAtZoom,
  shouldShowStartEndAtZoom,
  simplifyRouteForZoom,
} from "@/lib/mapGeometry";
import { formatDate, formatDistance, formatElevation } from "@/lib/format";
import { defaultMapTileStyleId, mapTileStyles, type MapTileStyleId } from "@/lib/mapTiles";

type ActivityMarker = {
  route: ActivityRoute;
  position: [number, number];
  color: string;
};

type ActivityCluster = {
  id: string;
  position: [number, number];
  color: string;
  routes: ActivityRoute[];
};

export function RoutesMap({ routes, height = 520 }: { routes: ActivityRoute[]; height?: number | string }) {
  const [selected, setSelected] = useState<ActivityRoute | null>(null);
  const [tileStyleId, setTileStyleId] = useState<MapTileStyleId>(defaultMapTileStyleId);
  const [showTrails, setShowTrails] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showStartEnd, setShowStartEnd] = useState(true);
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const routeBounds = getRoutesBounds(routes);
    if (!routeBounds) return null;
    return [
      [routeBounds.minLat, routeBounds.minLng],
      [routeBounds.maxLat, routeBounds.maxLng],
    ];
  }, [routes]);

  return (
    <>
      <LeafletMap
        bounds={bounds}
        height={height}
        tileStyleId={tileStyleId}
        controls={
          <MapControls
            tileStyleId={tileStyleId}
            showTrails={showTrails}
            showMarkers={showMarkers}
            showClusters={showClusters}
            showStartEnd={showStartEnd}
            onTileStyleChange={setTileStyleId}
            onShowTrailsChange={setShowTrails}
            onShowMarkersChange={setShowMarkers}
            onShowClustersChange={setShowClusters}
            onShowStartEndChange={setShowStartEnd}
          />
        }
      >
        <ZoomAwareActivityLayers
          routes={routes}
          selected={selected}
          showTrails={showTrails}
          showMarkers={showMarkers}
          showClusters={showClusters}
          showStartEnd={showStartEnd}
          onSelect={setSelected}
        />
      </LeafletMap>
      <ActivityRouteDialog activity={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function ZoomAwareActivityLayers({
  routes,
  selected,
  showTrails,
  showMarkers,
  showClusters,
  showStartEnd,
  onSelect,
}: {
  routes: ActivityRoute[];
  selected: ActivityRoute | null;
  showTrails: boolean;
  showMarkers: boolean;
  showClusters: boolean;
  showStartEnd: boolean;
  onSelect: (route: ActivityRoute) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: (event) => setZoom(event.target.getZoom()),
  });

  const markers = useMemo<ActivityMarker[]>(
    () =>
      routes
        .map((route) => {
          const point = getRouteMidpoint(route.points) ?? route.points[0];
          if (!point) return null;
          return {
            route,
            position: [point.lat, point.lng] as [number, number],
            color: getActivityColor(route.sportType),
          };
        })
        .filter((marker): marker is ActivityMarker => Boolean(marker)),
    [routes],
  );

  const clusters = useMemo(
    () => (showClusters && zoom <= 10 ? clusterMarkers(markers, zoom, map) : []),
    [map, markers, showClusters, zoom],
  );
  const showClusterLayer = showMarkers && showClusters && zoom <= 10;
  const showIndividualMarkers = showMarkers && (!showClusterLayer || zoom >= 11);
  const visibleRoutes = useMemo(
    () => routes.filter((route) => showTrails && shouldShowRouteAtZoom(route, zoom)),
    [routes, showTrails, zoom],
  );

  return (
    <>
      {visibleRoutes.map((route) => (
        <OutlinedRoute key={route.id} route={route} selected={selected?.id === route.id} zoom={zoom} onSelect={onSelect} />
      ))}

      {showClusterLayer &&
        clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.position}
            icon={createClusterIcon(cluster.routes.length, cluster.color)}
            eventHandlers={{
              click: () => {
                if (cluster.routes.length === 1) {
                  onSelect(cluster.routes[0]);
                  return;
                }
                const clusterBounds = getRoutesBounds(cluster.routes);
                if (clusterBounds) {
                  map.fitBounds(
                    [
                      [clusterBounds.minLat, clusterBounds.minLng],
                      [clusterBounds.maxLat, clusterBounds.maxLng],
                    ],
                    { padding: [48, 48], maxZoom: 13 },
                  );
                }
              },
            }}
          >
            <Popup>
              <ClusterPopup routes={cluster.routes} />
            </Popup>
          </Marker>
        ))}

      {showIndividualMarkers &&
        markers.map((marker) => (
          <Marker
            key={marker.route.id}
            position={marker.position}
            icon={createActivityIcon(marker.color, selected?.id === marker.route.id, zoom)}
            eventHandlers={{
              click: () => {
                onSelect(marker.route);
                if (zoom < 12) map.setView(marker.position, 12, { animate: true });
              },
            }}
          >
            <Popup>
              <ActivityPopup route={marker.route} />
            </Popup>
          </Marker>
        ))}

      {showStartEnd &&
        showTrails &&
        shouldShowStartEndAtZoom(zoom) &&
        routes.map((route) => <StartEndMarkers key={`endpoints-${route.id}`} route={route} />)}
    </>
  );
}

function OutlinedRoute({
  route,
  selected,
  zoom,
  onSelect,
}: {
  route: ActivityRoute;
  selected: boolean;
  zoom: number;
  onSelect: (route: ActivityRoute) => void;
}) {
  const points = useMemo(() => simplifyRouteForZoom(route.points, zoom), [route.points, zoom]);
  const positions = useMemo(() => points.map((point) => [point.lat, point.lng] as [number, number]), [points]);
  const color = getActivityColor(route.sportType);
  if (positions.length < 2) return null;

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: activityMapTheme.routeOutlineColor,
          weight: selected ? activityMapTheme.route.selectedOutlineWeight : activityMapTheme.route.outlineWeight,
          opacity: activityMapTheme.routeOutlineOpacity,
          lineCap: "round",
          lineJoin: "round",
        }}
        eventHandlers={{ click: () => onSelect(route) }}
      />
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: selected ? activityMapTheme.route.selectedForegroundWeight : activityMapTheme.route.foregroundWeight,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }}
        eventHandlers={{ click: () => onSelect(route) }}
      >
        <Tooltip sticky>{route.name}</Tooltip>
      </Polyline>
    </>
  );
}

function StartEndMarkers({ route }: { route: ActivityRoute }) {
  const first = route.points[0];
  const last = route.points[route.points.length - 1];
  if (!first || !last) return null;
  const color = getActivityColor(route.sportType);
  return (
    <>
      <Marker position={[first.lat, first.lng]} icon={createEndpointIcon(color, "S")}>
        <Tooltip>Start: {route.name}</Tooltip>
      </Marker>
      <Marker position={[last.lat, last.lng]} icon={createEndpointIcon(color, "E")}>
        <Tooltip>End: {route.name}</Tooltip>
      </Marker>
    </>
  );
}

function MapControls({
  tileStyleId,
  showTrails,
  showMarkers,
  showClusters,
  showStartEnd,
  onTileStyleChange,
  onShowTrailsChange,
  onShowMarkersChange,
  onShowClustersChange,
  onShowStartEndChange,
}: {
  tileStyleId: MapTileStyleId;
  showTrails: boolean;
  showMarkers: boolean;
  showClusters: boolean;
  showStartEnd: boolean;
  onTileStyleChange: (value: MapTileStyleId) => void;
  onShowTrailsChange: (value: boolean) => void;
  onShowMarkersChange: (value: boolean) => void;
  onShowClustersChange: (value: boolean) => void;
  onShowStartEndChange: (value: boolean) => void;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1000,
        width: { xs: "calc(100% - 24px)", sm: 236 },
        maxWidth: 320,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${activityMapTheme.ui.panelBorder}`,
        bgcolor: activityMapTheme.ui.panelBackground,
        backdropFilter: "blur(14px)",
        color: activityMapTheme.ui.panelText,
      }}
    >
      <Stack spacing={1}>
        <FormControl size="small" fullWidth>
          <InputLabel>Map</InputLabel>
          <Select
            label="Map"
            value={tileStyleId}
            onChange={(event) => onTileStyleChange(event.target.value as MapTileStyleId)}
          >
            {mapTileStyles.map((style) => (
              <MenuItem key={style.id} value={style.id}>
                {style.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction={{ xs: "row", sm: "column" }} sx={{ flexWrap: "wrap" }}>
          <FormControlLabel control={<Switch size="small" checked={showTrails} onChange={(_, checked) => onShowTrailsChange(checked)} />} label="Trails" />
          <FormControlLabel control={<Switch size="small" checked={showMarkers} onChange={(_, checked) => onShowMarkersChange(checked)} />} label="Markers" />
          <FormControlLabel control={<Switch size="small" checked={showClusters} onChange={(_, checked) => onShowClustersChange(checked)} />} label="Clusters" />
          <FormControlLabel control={<Switch size="small" checked={showStartEnd} onChange={(_, checked) => onShowStartEndChange(checked)} />} label="Start/end" />
        </Stack>
      </Stack>
    </Box>
  );
}

function ActivityPopup({ route }: { route: ActivityRoute }) {
  return (
    <Stack spacing={0.5} sx={{ color: "#0b1419", minWidth: 190 }}>
      <Typography variant="subtitle2">{route.name}</Typography>
      <Typography variant="body2">
        {route.sportType ?? "Activity"} · {formatDate(route.startDate)}
      </Typography>
      <Typography variant="body2">{formatDistance(route.distance)}</Typography>
      <Typography variant="body2">{formatElevation(route.totalElevationGain)}</Typography>
    </Stack>
  );
}

function ClusterPopup({ routes }: { routes: ActivityRoute[] }) {
  const totalDistance = routes.reduce((sum, route) => sum + (route.distance ?? 0), 0);
  return (
    <Stack spacing={0.5} sx={{ color: "#0b1419", minWidth: 190 }}>
      <Typography variant="subtitle2">{routes.length} activities</Typography>
      <Typography variant="body2">{formatDistance(totalDistance)}</Typography>
      {routes.slice(0, 4).map((route) => (
        <Typography key={route.id} variant="body2">
          {route.name}
        </Typography>
      ))}
    </Stack>
  );
}

function clusterMarkers(markers: ActivityMarker[], zoom: number, map: L.Map) {
  const gridSize = zoom <= 6 ? 76 : 60;
  const grouped = new Map<string, ActivityMarker[]>();

  for (const marker of markers) {
    const projected = map.project(marker.position, zoom);
    const key = `${Math.floor(projected.x / gridSize)}:${Math.floor(projected.y / gridSize)}`;
    grouped.set(key, [...(grouped.get(key) ?? []), marker]);
  }

  return Array.from(grouped.entries()).map<ActivityCluster>(([key, group]) => {
    const lat = group.reduce((sum, marker) => sum + marker.position[0], 0) / group.length;
    const lng = group.reduce((sum, marker) => sum + marker.position[1], 0) / group.length;
    return {
      id: key,
      position: [lat, lng],
      color: group[0].color,
      routes: group.map((marker) => marker.route),
    };
  });
}

function createClusterIcon(count: number, color: string) {
  const size = count >= 10 ? activityMapTheme.marker.clusterSizeLarge : activityMapTheme.marker.clusterSize;
  return L.divIcon({
    className: "activity-map-icon",
    html: `<span class="activity-cluster" style="--activity-color:${color}; width:${size}px; height:${size}px;">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createActivityIcon(color: string, selected: boolean, zoom: number) {
  const size = zoom >= 14 ? activityMapTheme.marker.pointSizeHighZoom : activityMapTheme.marker.pointSize;
  return L.divIcon({
    className: "activity-map-icon",
    html: `<span class="activity-point${selected ? " is-selected" : ""}" style="--activity-color:${color}; width:${size}px; height:${size}px;"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createEndpointIcon(color: string, label: string) {
  const size = activityMapTheme.marker.startEndSize;
  return L.divIcon({
    className: "activity-map-icon",
    html: `<span class="activity-endpoint" style="--activity-color:${color}; width:${size}px; height:${size}px;" aria-label="${label}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
