"use client";

import React, { useEffect } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { LoadingOverlay } from "@/app/components/loadingOverlay";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  useEffect(() => {
    let hasStoredSession = false;
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("authData");
      if (storedAuth) {
        try {
          hasStoredSession = JSON.parse(storedAuth).statusLogin === "ON";
        } catch {
          hasStoredSession = false;
        }
      }
    }

    if (!isLoading && !isAuthenticated && !hasStoredSession) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Box position="relative" minHeight="100vh">
        <LoadingOverlay isLoading={true} />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={isDark ? "gray.950" : "gray.50"}
      color={isDark ? "gray.100" : "gray.800"}
      position="relative"
    >
      {children}
    </Box>
  );
}
