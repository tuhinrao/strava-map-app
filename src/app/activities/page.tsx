"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityList } from "@/components/activities/ActivityList";
import {
  ActivityFilterState,
  ActivitySearchFilters,
} from "@/components/activities/ActivitySearchFilters";
import type { ActivitySummary } from "@/types/activity";

const emptyFilters: ActivityFilterState = {
  search: "",
  sportType: "",
  after: "",
  before: "",
};

export default function ActivitiesPage() {
  const [filters, setFilters] = useState<ActivityFilterState>(emptyFilters);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [sportTypes, setSportTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (filters.search) params.set("search", filters.search);
    if (filters.sportType) params.set("sport_type", filters.sportType);
    if (filters.after) params.set("after", filters.after);
    if (filters.before) params.set("before", filters.before);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/activities?${queryString}`);
        if (!response.ok) throw new Error("Unable to load activities");
        const data = await response.json();
        setActivities(data.activities ?? []);
        setSportTypes(data.sportTypes ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load activities");
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [queryString]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <div>
          <Typography variant="h1">Activities</Typography>
          <Typography color="text.secondary">Search by name, sport type, and date range.</Typography>
        </div>
        <Card>
          <CardContent>
            <ActivitySearchFilters
              filters={filters}
              sportTypes={sportTypes}
              onChange={setFilters}
              onReset={() => setFilters(emptyFilters)}
            />
          </CardContent>
        </Card>
        <ActivityList activities={activities} loading={loading} error={error} />
      </Stack>
    </AppShell>
  );
}
