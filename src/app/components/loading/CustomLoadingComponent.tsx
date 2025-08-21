"use client";

import { Box, Center, Flex, Spinner, Text, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionCenter = motion(Center);
const MotionBox = motion(Box);

// Main custom loading component for dynamic imports
export const CustomLoadingComponent = () => {
  const { colorMode } = useColorMode();

  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      minH="60vh"
      w="full"
    >
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Flex direction="column" align="center" gap={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor={colorMode === "light" ? "gray.200" : "gray.600"}
            color="primary.500"
            size="xl"
          />
          <Text
            textAlign="center"
            color={colorMode === "light" ? "gray.600" : "gray.300"}
            fontSize="lg"
            fontWeight="medium"
          >
            Loading page...
          </Text>
        </Flex>
      </MotionBox>
    </MotionCenter>
  );
};

// Lightweight spinner for smaller components
export const CustomSpinnerLoading = () => {
  const { colorMode } = useColorMode();

  return (
    <Center minH="40vh" w="full">
      <Flex direction="column" align="center" gap={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor={colorMode === "light" ? "gray.200" : "gray.600"}
          color="primary.500"
          size="xl"
        />
        <Text
          color={colorMode === "light" ? "gray.600" : "gray.300"}
          fontSize="sm"
        >
          Loading...
        </Text>
      </Flex>
    </Center>
  );
};

// Skeleton loading for specific content types
export const CustomSkeletonLoading = () => {
  const { colorMode } = useColorMode();

  return (
    <Box p={6} w="full">
      <Flex direction="column" gap={4}>
        {/* Header skeleton */}
        <MotionBox
          h="8"
          bg={colorMode === "light" ? "gray.200" : "gray.600"}
          borderRadius="md"
          w="60%"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Content skeleton */}
        {[...Array(3)].map((_, i) => (
          <MotionBox
            key={i}
            h="4"
            bg={colorMode === "light" ? "gray.200" : "gray.600"}
            borderRadius="md"
            w={`${80 - i * 10}%`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </Flex>
    </Box>
  );
};

// Page-specific loading component
export const CustomPageLoading = ({ pageName }: { pageName?: string }) => {
  const { colorMode } = useColorMode();

  return (
    <MotionCenter
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      minH="70vh"
      w="full"
    >
      <Flex direction="column" align="center" gap={6}>
        <Spinner
          thickness="6px"
          speed="0.65s"
          emptyColor={colorMode === "light" ? "gray.200" : "gray.600"}
          color="secondary.500"
          size="xl"
        />
        
        <Flex direction="column" align="center" gap={2}>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={colorMode === "light" ? "gray.700" : "gray.200"}
          >
            Loading {pageName || "Page"}
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "light" ? "gray.500" : "gray.400"}
          >
            Please wait while we prepare your content...
          </Text>
        </Flex>
      </Flex>
    </MotionCenter>
  );
};
