"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { ActivityRoute } from "@/types/activity";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityStatsCard } from "@/components/activities/ActivityStatsCard";

const ActivityRouteMap = dynamic(
  () => import("@/components/maps/ActivityRouteMap").then((mod) => mod.ActivityRouteMap),
  { ssr: false, loading: () => <MapLoading /> },
);

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await fetch(`/api/activities/${params.id}`);
        if (!response.ok) throw new Error("Unable to load activity");
        setActivity(await response.json());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load activity");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Button component={Link} href="/activities" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
            Back to activities
          </Button>
          <Typography variant="h1">{activity?.name ?? "Activity"}</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {loading && <MapLoading />}

        {activity && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  {activity.points.length > 0 ? (
                    <ActivityRouteMap activity={activity} />
                  ) : (
                    <Alert severity="info">This activity does not have GPS points.</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ActivityStatsCard activity={activity} />
            </Grid>
          </Grid>
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
