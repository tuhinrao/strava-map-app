"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { ReactNode } from "react";

type LeafletMapProps = {
  children: ReactNode;
  bounds?: LatLngBoundsExpression | null;
  height?: number | string;
};

export function LeafletMap({ children, bounds, height = 520 }: LeafletMapProps) {
  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      scrollWheelZoom
      style={{ height, minHeight: 320, width: "100%", borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds bounds={bounds} />
      {children}
    </MapContainer>
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
