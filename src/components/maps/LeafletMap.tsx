"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { ReactNode } from "react";
import { defaultMapTileStyleId, getMapTileStyle, type MapTileStyleId } from "@/lib/mapTiles";

type LeafletMapProps = {
  children: ReactNode;
  bounds?: LatLngBoundsExpression | null;
  height?: number | string;
  controls?: ReactNode;
  tileStyleId?: MapTileStyleId;
};

export function LeafletMap({
  children,
  bounds,
  height = 520,
  controls,
  tileStyleId = defaultMapTileStyleId,
}: LeafletMapProps) {
  const tileStyle = getMapTileStyle(tileStyleId);

  return (
    <Box sx={{ position: "relative", minHeight: 320 }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={4}
        scrollWheelZoom
        style={{ height, minHeight: 320, width: "100%", borderRadius: 8 }}
      >
        <TileLayer attribution={tileStyle.attribution} url={tileStyle.url} maxZoom={tileStyle.maxZoom} />
        <FitBounds bounds={bounds} />
        {children}
      </MapContainer>
      {controls}
    </Box>
  );
}

function FitBounds({ bounds }: { bounds?: LatLngBoundsExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
}
