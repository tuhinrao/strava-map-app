"use client";

import Link from "next/link";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import type { ActivityRoute } from "@/types/activity";
import { formatDateTime, formatDistance, formatElevation, formatDuration } from "@/lib/format";

export function ActivityRouteDialog({
  activity,
  onClose,
}: {
  activity: ActivityRoute | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(activity)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{activity?.name}</DialogTitle>
      <DialogContent>
        {activity && (
          <Stack spacing={1}>
            <Typography color="text.secondary">{formatDateTime(activity.startDate)}</Typography>
            <Typography>{activity.sportType ?? "Unknown sport"}</Typography>
            <Typography>{formatDistance(activity.distance)} · {formatElevation(activity.totalElevationGain)}</Typography>
            <Typography>{formatDuration(activity.movingTime)} moving time</Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {activity && (
          <Button component={Link} href={`/activities/${activity.id}`} variant="contained">
            Open activity
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
