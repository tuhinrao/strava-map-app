"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff6b35" },
    secondary: { main: "#31d0aa" },
    background: {
      default: "#071015",
      paper: "#101d24",
    },
    divider: "rgba(255,255,255,0.12)",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700, letterSpacing: 0 },
    h2: { fontSize: "1.35rem", fontWeight: 700, letterSpacing: 0 },
    h3: { fontSize: "1rem", fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 700 },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
