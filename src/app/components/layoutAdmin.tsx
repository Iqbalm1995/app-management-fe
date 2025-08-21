"use client";

import { ReactNode, useEffect, useState } from "react";
import { DELAY_MEDIUM } from "../constants/applicationConstants";
import { Box, useColorMode } from "@chakra-ui/react";
import { LoadingOverlay } from "./loadingOverlay";
import { usePathname } from "next/navigation";
import NavigationAdmin from "./sidebar";

const LayoutAdmin = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Show loading on route change
    setLoading(true);
    
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), DELAY_MEDIUM);
    return () => clearTimeout(timer);
  }, [pathname]); // Re-run when pathname changes

  return (
    <>
      <Box position="relative" minHeight="100vh">
        <LoadingOverlay isLoading={loading} />
        <Box
          opacity={loading ? 0.5 : 1}
          pointerEvents={loading ? "none" : "auto"}
          transition="opacity 0.3s ease"
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
