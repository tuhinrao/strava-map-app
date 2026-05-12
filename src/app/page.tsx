"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import type { ActivityRoute, DashboardSummary } from "@/types/activity";
import { AppShell } from "@/components/layout/AppShell";
import { formatDate, formatDistance, formatElevation } from "@/lib/format";

const RoutesMap = dynamic(() => import("@/components/maps/RoutesMap").then((mod) => mod.RoutesMap), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function HomePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [routes, setRoutes] = useState<ActivityRoute[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [summaryResponse, routesResponse] = await Promise.all([
          fetch("/api/summary"),
          fetch("/api/routes/recent?limit=25"),
        ]);
        if (!summaryResponse.ok || !routesResponse.ok) throw new Error("Unable to load dashboard data");
        setSummary(await summaryResponse.json());
        const routeData = await routesResponse.json();
        setRoutes(routeData.routes ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1">Personal activity map</Typography>
          <Typography color="text.secondary">Routes and stats from your Strava-synced PostgreSQL database.</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <SummaryCard label="Activities" value={summary?.totalActivities.toLocaleString() ?? "-"} />
          <SummaryCard label="Distance" value={formatDistance(summary?.totalDistance)} />
          <SummaryCard label="Elevation" value={formatElevation(summary?.totalElevation)} />
          <SummaryCard label="Latest" value={formatDate(summary?.latestActivityDate)} />
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h2">Recent routes</Typography>
                  <Button component={Link} href="/heatmap" startIcon={<MapIcon />} size="small">
                    Heatmap
                  </Button>
                </Stack>
                {loading ? <MapLoading /> : <RoutesMap routes={routes} />}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h2">Recent activities</Typography>
                  <Button component={Link} href="/activities" size="small">
                    View all
                  </Button>
                </Stack>
                <List>
                  {routes.slice(0, 8).map((route) => (
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
                {!loading && routes.length === 0 && <Alert severity="info">No routes found yet.</Alert>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Card>
        <CardContent>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography variant="h2">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

function MapLoading() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
      <CircularProgress />
    </Box>
  );
}
