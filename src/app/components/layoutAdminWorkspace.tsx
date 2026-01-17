"use client";

import { ReactNode, useEffect, useState } from "react";
import { DELAY_MEDIUM } from "../constants/applicationConstants";
import { Box, useColorMode } from "@chakra-ui/react";
import { LoadingOverlay } from "./loadingOverlay";
import { usePathname, useRouter } from "next/navigation";
import NavigationAdminWorkspace from "./navbarWorkspace";
import { useAuth } from "../context/AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";

const LayoutAdminWorkspace = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasAccess, isLoading: isCheckingAccess, redirectTo } = useAccessControl(isAuthenticated, isAuthLoading);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading on route change
    setLoading(true);

    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), DELAY_MEDIUM);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Handle access control redirect
    if (!isCheckingAccess && !hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [isCheckingAccess, hasAccess, redirectTo, router]);

  // Show loading while checking access or during route transition
  const isLoadingState = loading || isCheckingAccess;

  // Don't render children if no access
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
        <LoadingOverlay isLoading={isLoadingState} />
        <Box
          opacity={isLoadingState ? 0.5 : 1}
          pointerEvents={isLoadingState ? "none" : "auto"}
          transition="opacity 0.3s ease"
        >
          <Box minH="100vh" bg={colorMode == "light" ? "gray.100" : "gray.900"}>
            <NavigationAdminWorkspace>{children}</NavigationAdminWorkspace>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdminWorkspace;
