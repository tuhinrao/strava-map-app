"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WhatshotIcon from "@mui/icons-material/Whatshot";

const navItems = [
  { href: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { href: "/activities", label: "Activities", icon: <ListAltIcon fontSize="small" /> },
  { href: "/heatmap", label: "Heatmap", icon: <WhatshotIcon fontSize="small" /> },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(7,16,21,0.86)",
      }}
    >
      <Toolbar sx={{ gap: 2, maxWidth: 1440, width: "100%", mx: "auto" }}>
        <Typography component={Link} href="/" variant="h6" sx={{ fontWeight: 800, mr: "auto" }}>
          Strava Explorer
        </Typography>
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              startIcon={item.icon}
              variant={pathname === item.href ? "contained" : "text"}
              color={pathname === item.href ? "primary" : "inherit"}
              size="small"
              sx={{ whiteSpace: "nowrap" }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
