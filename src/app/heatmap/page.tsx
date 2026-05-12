"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ActivityRoute } from "@/types/activity";
import { AppShell } from "@/components/layout/AppShell";

const HeatmapRoutesMap = dynamic(
  () => import("@/components/maps/HeatmapRoutesMap").then((mod) => mod.HeatmapRoutesMap),
  { ssr: false, loading: () => <MapLoading /> },
);

export default function HeatmapPage() {
  const [routes, setRoutes] = useState<ActivityRoute[]>([]);
  const [sportTypes, setSportTypes] = useState<string[]>([]);
  const [sportType, setSportType] = useState("");
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");
  const [opacity, setOpacity] = useState(0.18);
  const [lineWidth, setLineWidth] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (sportType) params.set("sport_type", sportType);
    if (after) params.set("after", after);
    if (before) params.set("before", before);
    return params.toString();
  }, [after, before, sportType]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/heatmap?${queryString}`);
        if (!response.ok) throw new Error("Unable to load heatmap routes");
        const data = await response.json();
        setRoutes(data.routes ?? []);
        setSportTypes(data.sportTypes ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load heatmap routes");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [queryString]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <div>
          <Typography variant="h1">Personal heatmap</Typography>
          <Typography color="text.secondary">Low-opacity route overlays make repeated segments glow from your own data.</Typography>
        </div>

        <Card>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Sport</InputLabel>
                  <Select label="Sport" value={sportType} onChange={(event) => setSportType(event.target.value)}>
                    <MenuItem value="">All sports</MenuItem>
                    {sportTypes.map((sport) => (
                      <MenuItem key={sport} value={sport}>
                        {sport}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="After"
                  type="date"
                  value={after}
                  onChange={(event) => setAfter(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="Before"
                  type="date"
                  value={before}
                  onChange={(event) => setBefore(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.5 }}>
                <Typography variant="body2">Opacity</Typography>
                <Slider min={0.05} max={0.7} step={0.01} value={opacity} onChange={(_, value) => setOpacity(value as number)} />
              </Grid>
              <Grid size={{ xs: 12, md: 2.5 }}>
                <Typography variant="body2">Line width</Typography>
                <Slider min={1} max={12} step={1} value={lineWidth} onChange={(_, value) => setLineWidth(value as number)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <MapLoading />
        ) : routes.length ? (
          <HeatmapRoutesMap routes={routes} opacity={opacity} lineWidth={lineWidth} />
        ) : (
          <Alert severity="info">No route points match these filters.</Alert>
        )}
      </Stack>
    </AppShell>
  );
}

function MapLoading() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
      <CircularProgress />
    </Box>
  );
}
