"use client";

import { ReactNode, useEffect } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import { LoadingOverlay } from "./loadingOverlay";
import { useRouter } from "next/navigation";
import NavigationAdmin from "./sidebar";
import { useAuth } from "../context/AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";

const LayoutAdmin = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasAccess, isLoading: isCheckingAccess, redirectTo } = useAccessControl(isAuthenticated, isAuthLoading);

  useEffect(() => {
    if (!isCheckingAccess && !hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [isCheckingAccess, hasAccess, redirectTo, router]);

  if (!isCheckingAccess && !hasAccess) {
    return (
      <Box position="relative" minHeight="100vh">
        <LoadingOverlay isLoading={true} />
      </Box>
    );
  }

  return (
    <>
      <Box position="relative" minHeight="100vh">
        <LoadingOverlay isLoading={isCheckingAccess} />
        <Box
          opacity={isCheckingAccess ? 0.5 : 1}
          pointerEvents={isCheckingAccess ? "none" : "auto"}
          transition="opacity 0.2s ease"
        >
          <Box minH="100vh" bg={colorMode == "light" ? "gray.100" : "gray.900"}>
            <NavigationAdmin>{children}</NavigationAdmin>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdmin;

