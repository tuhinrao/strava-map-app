"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ActivitySummary } from "@/types/activity";
import { formatDate, formatDistance, formatDuration, formatElevation } from "@/lib/format";

type ActivityListProps = {
  activities: ActivitySummary[];
  loading?: boolean;
  error?: string | null;
};

export function ActivityList({ activities, loading, error }: ActivityListProps) {
  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (activities.length === 0) {
    return <Alert severity="info">No activities match the current filters.</Alert>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Activity</TableCell>
            <TableCell>Sport</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Distance</TableCell>
            <TableCell align="right">Elevation</TableCell>
            <TableCell align="right">Moving</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activity.id}
              hover
              component={Link}
              href={`/activities/${activity.id}`}
              sx={{ cursor: "pointer", "& td": { borderBottomColor: "divider" } }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>{activity.name}</Typography>
              </TableCell>
              <TableCell>{activity.sportType ?? "Unknown"}</TableCell>
              <TableCell>{formatDate(activity.startDate)}</TableCell>
              <TableCell align="right">{formatDistance(activity.distance)}</TableCell>
              <TableCell align="right">{formatElevation(activity.totalElevationGain)}</TableCell>
              <TableCell align="right">{formatDuration(activity.movingTime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
