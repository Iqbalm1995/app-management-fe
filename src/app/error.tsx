"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import { FiRefreshCw, FiHome, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { colorMode } = useColorMode();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container maxW="lg" py={{ base: "12", md: "24" }} px={{ base: 4, sm: 8 }}>
      <VStack spacing={8} textAlign="center">
        {/* Error Icon */}
        <Box
          p={6}
          bg={colorMode === "light" ? "red.50" : "red.900"}
          rounded="full"
          border="4px solid"
          borderColor={colorMode === "light" ? "red.100" : "red.700"}
        >
          <Icon 
            as={FiAlertCircle} 
            boxSize={12} 
            color={colorMode === "light" ? "red.500" : "red.300"} 
          />
        </Box>

        {/* Content */}
        <VStack spacing={4} maxW="md">
          <Heading
            size="xl"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Something went wrong!
          </Heading>
          <Text
            fontSize="lg"
            color={colorMode === "light" ? "gray.600" : "gray.300"}
            lineHeight="tall"
          >
            An unexpected error occurred while loading this page. Please try
            refreshing or go back to the home page.
          </Text>
          
          {/* Error Details (Development) */}
          {process.env.NODE_ENV === "development" && (
            <Box
              p={4}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              rounded="md"
              fontSize="sm"
              fontFamily="mono"
              color={colorMode === "light" ? "gray.700" : "gray.300"}
              maxW="full"
              overflow="auto"
            >
              <Text fontWeight="bold" mb={2}>Error Details:</Text>
              <Text>{error.message}</Text>
            </Box>
          )}
        </VStack>

        {/* Action Buttons */}
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="red"
            size="lg"
            rounded="full"
            onClick={reset}
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg",
            }}
            transition="all 0.2s"
          >
            Try Again
          </Button>
          
          <Link href="/">
            <Button
              leftIcon={<FiHome />}
              variant="outline"
              colorScheme="red"
              size="lg"
              rounded="full"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg",
                bg: colorMode === "light" ? "red.50" : "red.900",
              }}
              transition="all 0.2s"
            >
              Home Page
            </Button>
          </Link>
        </HStack>
      </VStack>
    </Container>
  );
}
