import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { NavBar } from "@/components/layout/NavBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #071015 0%, #0d171b 100%)" }}>
      <NavBar />
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}
