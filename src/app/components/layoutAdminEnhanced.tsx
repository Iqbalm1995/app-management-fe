"use client";

import { ReactNode, useEffect, useState } from "react";
import { DELAY_MEDIUM } from "../constants/applicationConstants";
import { Box, useColorMode } from "@chakra-ui/react";
import { RouteAwareLoadingOverlay } from "./loadingOverlayEnhanced";
import { usePathname } from "next/navigation";
import NavigationAdmin from "./sidebar";

const LayoutAdminEnhanced = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Show loading on route change
    setLoading(true);
    
    // Simulate loading time with variable duration based on route
    const getLoadingDuration = (path: string) => {
      if (path.includes('projects-manager')) return DELAY_MEDIUM + 500;
      if (path.includes('teams')) return DELAY_MEDIUM + 300;
      if (path.includes('file-archives')) return DELAY_MEDIUM + 200;
      return DELAY_MEDIUM;
    };

    const duration = getLoadingDuration(pathname);
    const timer = setTimeout(() => setLoading(false), duration);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <Box position="relative" minHeight="100vh">
        <RouteAwareLoadingOverlay isLoading={loading} />
        <Box
          opacity={loading ? 0.3 : 1}
          pointerEvents={loading ? "none" : "auto"}
          transition="opacity 0.5s ease"
          transform={loading ? "scale(0.98)" : "scale(1)"}
          style={{ transition: "all 0.5s ease" }}
        >
          <Box minH="100vh" bg={colorMode == "light" ? "gray.100" : "gray.900"}>
            <NavigationAdmin>{children}</NavigationAdmin>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdminEnhanced;
