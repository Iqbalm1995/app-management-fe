"use client";

import React, { useEffect, useState } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import { useAuth, isTokenExpiredByDate } from "@/app/context/AuthContext";
import { LoadingOverlay } from "@/app/components/loadingOverlay";
import NotFound from "@/app/not-found";
import { STATUS_LOGIN_ON } from "@/app/constants/applicationConstants";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Direct-URL access guard: /dev is a public route in AuthContext (no redirect-to-login
  // happens for it there), so this layout is the sole gatekeeper. Anyone hitting a /dev/*
  // URL without a valid, non-expired session must see a 404 in place — not the dev content,
  // and not a login redirect (which would leak that /dev exists as a valid route).
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  useEffect(() => {
    let valid = false;
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("authData");
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          valid =
            parsedAuth.statusLogin === STATUS_LOGIN_ON &&
            !isTokenExpiredByDate(parsedAuth.dataAuth?.expiration);
        } catch {
          valid = false;
        }
      }
    }
    setHasValidSession(valid);
    setSessionChecked(true);
  }, []);

  if (isLoading || !sessionChecked) {
    return (
      <Box position="relative" minHeight="100vh">
        <LoadingOverlay isLoading={true} />
      </Box>
    );
  }

  if (!hasValidSession) {
    return <NotFound />;
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
