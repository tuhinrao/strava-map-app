export type MapTileStyleId = "positron" | "darkMatter" | "osm" | "satellite";

export type MapTileStyle = {
  id: MapTileStyleId;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
};

export const mapTileStyles: MapTileStyle[] = [
  {
    id: "positron",
    label: "Minimal",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  {
    id: "darkMatter",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  {
    id: "osm",
    label: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
];

export const defaultMapTileStyleId: MapTileStyleId = "positron";

export function getMapTileStyle(id: MapTileStyleId = defaultMapTileStyleId) {
  return mapTileStyles.find((style) => style.id === id) ?? mapTileStyles[0];
}
