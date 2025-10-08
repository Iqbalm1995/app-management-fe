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
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FiHome, FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Container maxW="lg" py={{ base: "12", md: "24" }} px={{ base: 4, sm: 8 }}>
      <VStack spacing={8} textAlign="center">
        {/* 404 Number */}
        <VStack spacing={6}>
          <Text
            fontSize={{ base: "8xl", md: "9xl" }}
            fontWeight="bold"
            bgGradient="linear(135deg, secondary.400, secondary.500, secondary.900)"
            bgClip="text"
            lineHeight="1"
            opacity={0.8}
          >
            404
          </Text>
          <Box
            p={4}
            bg={colorMode === "light" ? "white" : "gray.800"}
            rounded="full"
            shadow="lg"
            border="2px solid"
            borderColor={colorMode === "light" ? "orange.200" : "orange.600"}
          >
            <Icon as={FiAlertTriangle} boxSize={8} color="orange.400" />
          </Box>
        </VStack>

        {/* Content */}
        <VStack spacing={4} maxW="md">
          <Heading
            size="xl"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Page Not Found
          </Heading>
          <Text
            fontSize="lg"
            color={colorMode === "light" ? "gray.600" : "gray.300"}
            lineHeight="tall"
          >
            Sorry, we couldn't find the page you're looking for. The page might
            have been moved, deleted, or you entered the wrong URL.
          </Text>
        </VStack>

        {/* Action Buttons */}
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="blue"
            size="lg"
            rounded="full"
            onClick={() => router.back()}
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg",
            }}
            transition="all 0.2s"
          >
            Go Back
          </Button>

          <Link href="/">
            <Button
              leftIcon={<FiHome />}
              variant="outline"
              colorScheme="blue"
              size="lg"
              rounded="full"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg",
                bg: colorMode === "light" ? "blue.50" : "blue.900",
              }}
              transition="all 0.2s"
            >
              Home Page
            </Button>
          </Link>
        </HStack>

        {/* Decorative Elements */}
        <Box position="relative" w="full" h="100px" overflow="hidden">
          <Box
            position="absolute"
            top="-50px"
            left="10%"
            w="100px"
            h="100px"
            bg="blue.400"
            rounded="full"
            opacity={0.1}
            animation="float 6s ease-in-out infinite"
          />
          <Box
            position="absolute"
            top="-30px"
            right="15%"
            w="60px"
            h="60px"
            bg="purple.400"
            rounded="full"
            opacity={0.1}
            animation="float 4s ease-in-out infinite reverse"
          />
          <Box
            position="absolute"
            bottom="-40px"
            left="60%"
            w="80px"
            h="80px"
            bg="pink.400"
            rounded="full"
            opacity={0.1}
            animation="float 5s ease-in-out infinite"
          />
        </Box>
      </VStack>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Container>
  );
}
