"use client";

import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type ActivityFilterState = {
  search: string;
  sportType: string;
  after: string;
  before: string;
};

type ActivitySearchFiltersProps = {
  filters: ActivityFilterState;
  sportTypes: string[];
  onChange: (filters: ActivityFilterState) => void;
  onReset: () => void;
};

export function ActivitySearchFilters({ filters, sportTypes, onChange, onReset }: ActivitySearchFiltersProps) {
  function update<K extends keyof ActivityFilterState>(key: K, value: ActivityFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr auto" },
        gap: 2,
        alignItems: "center",
      }}
    >
      <TextField
        label="Search"
        value={filters.search}
        onChange={(event) => update("search", event.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
          },
        }}
      />
      <FormControl>
        <InputLabel>Sport</InputLabel>
        <Select label="Sport" value={filters.sportType} onChange={(event) => update("sportType", event.target.value)}>
          <MenuItem value="">All sports</MenuItem>
          {sportTypes.map((sport) => (
            <MenuItem key={sport} value={sport}>
              {sport}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="After"
        type="date"
        value={filters.after}
        onChange={(event) => update("after", event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        label="Before"
        type="date"
        value={filters.before}
        onChange={(event) => update("before", event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Button onClick={onReset}>Reset</Button>
    </Box>
  );
}
