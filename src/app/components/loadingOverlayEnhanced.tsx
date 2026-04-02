"use client";

import { Box, Center, Flex, Text, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import logoBjbFile from "../json/bjb_loading_v01.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MotionCenter = motion(Center);
const MotionBox = motion(Box);

interface LoadingOverlayEnhancedProps {
  isLoading: boolean;
  loadingText?: string;
  showProgress?: boolean;
}

export const LoadingOverlayEnhanced = ({ 
  isLoading, 
  loadingText = "Loading...",
  showProgress = false 
}: LoadingOverlayEnhancedProps) => {
  const { colorMode } = useColorMode();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading && showProgress) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading, showProgress]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
    }
  }, [isLoading]);

  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      pointerEvents={isLoading ? "all" : "none"}
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg={colorMode === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)"}
      backdropFilter="blur(8px)"
      zIndex="1000"
    >
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Flex direction="column" align="center" gap={6}>
          {/* Lottie Animation */}
          <Box boxSize="200px">
            <Lottie
              autoplay
              loop
              animationData={logoBjbFile}
              style={{ height: "100%", width: "100%" }}
            />
          </Box>

          {/* Loading Text */}
          <Flex direction="column" align="center" gap={2}>
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colorMode === "light" ? "gray.700" : "gray.200"}
            >
              {loadingText}
            </Text>
            
            {showProgress && (
              <Text
                fontSize="sm"
                color={colorMode === "light" ? "gray.500" : "gray.400"}
              >
                {Math.round(progress)}%
              </Text>
            )}
          </Flex>

          {/* Progress Bar */}
          {showProgress && (
            <Box w="200px" h="4px" bg="gray.200" borderRadius="full" overflow="hidden">
              <MotionBox
                h="100%"
                bg="linear-gradient(90deg, #4299E1, #3182CE)"
                borderRadius="full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </Box>
          )}
        </Flex>
      </MotionBox>
    </MotionCenter>
  );
};

// Route-aware loading overlay that shows page names
export const RouteAwareLoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  const pathname = usePathname();
  const [loadingText, setLoadingText] = useState("Loading...");

  useEffect(() => {
    // Set loading text based on current route
    const routeNames: { [key: string]: string } = {
      "/home": "Loading Dashboard...",
      "/projects-manager": "Loading Projects Manager...",
      "/teams": "Loading Teams Manager...",
      "/file-archives": "Loading File Archives...",
      "/requirements": "Loading Requirements...",
      "/requirements/brd": "Loading BRD...",
      "/requirements/rfc": "Loading RFC...",
    };

    const currentRoute = Object.keys(routeNames).find(route => 
      pathname.startsWith(route)
    );

    setLoadingText(currentRoute ? routeNames[currentRoute] : "Loading Page...");
  }, [pathname]);

  return (
    <LoadingOverlayEnhanced 
      isLoading={isLoading} 
      loadingText={loadingText}
      showProgress={true}
    />
  );
};

// Simple loading overlay with just animation
export const SimpleLoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  const { colorMode } = useColorMode();

  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      pointerEvents={isLoading ? "all" : "none"}
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg={colorMode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.95)"}
      zIndex="1000"
    >
      <Box boxSize="sm">
        <Lottie
          autoplay
          loop
          animationData={logoBjbFile}
          style={{ height: "100%", width: "100%" }}
        />
      </Box>
    </MotionCenter>
  );
};
