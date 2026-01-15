"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiLock, FiShield, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ForbiddenPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <LayoutAdmin>
      <Box
        minH="calc(100vh - 80px)"
        bgGradient={
          colorMode === "light"
            ? "linear(135deg, red.50, orange.50, yellow.50)"
            : "linear(135deg, gray.900, red.900, orange.900)"
        }
        position="relative"
        overflow="hidden"
      >
        {/* Background Elements */}
        <MotionBox
          position="absolute"
          top="10%"
          right="10%"
          w="200px"
          h="200px"
          bgGradient="linear(45deg, red.400, orange.500)"
          rounded="full"
          opacity={0.1}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <MotionBox
          position="absolute"
          bottom="20%"
          left="5%"
          w="150px"
          h="150px"
          bgGradient="linear(45deg, orange.400, yellow.500)"
          rounded="full"
          opacity={0.1}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="calc(100vh - 80px)"
          px={4}
          position="relative"
          zIndex={1}
        >
          <MotionCard
            maxW="600px"
            w="full"
            bg={colorMode === "light" ? "white" : "gray.800"}
            shadow="2xl"
            rounded={radiusStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardBody p={8}>
              <VStack spacing={6} align="center">
                {/* Lock Icon */}
                <MotionBox
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Box
                    p={6}
                    bg={colorMode === "light" ? "red.50" : "red.900"}
                    rounded="full"
                  >
                    <Icon
                      as={FiLock}
                      boxSize={16}
                      color={colorMode === "light" ? "red.500" : "red.300"}
                    />
                  </Box>
                </MotionBox>

                {/* Title */}
                <VStack spacing={2}>
                  <Heading
                    size="2xl"
                    bgGradient="linear(to-r, red.400, orange.500)"
                    bgClip="text"
                    textAlign="center"
                  >
                    403
                  </Heading>
                  <Heading size="lg" textAlign="center">
                    Access Forbidden
                  </Heading>
                </VStack>

                {/* Description */}
                <Text
                  textAlign="center"
                  color={colorMode === "light" ? "gray.600" : "gray.400"}
                  fontSize="lg"
                >
                  You don't have permission to access this page.
                </Text>

                {/* Info Cards */}
                <VStack spacing={3} w="full" pt={4}>
                  <HStack
                    w="full"
                    p={4}
                    bg={colorMode === "light" ? "orange.50" : "orange.900"}
                    rounded={radiusStyle}
                    spacing={3}
                  >
                    <Icon
                      as={FiShield}
                      boxSize={5}
                      color={colorMode === "light" ? "orange.500" : "orange.300"}
                    />
                    <Text fontSize="sm" flex={1}>
                      This page requires specific permissions
                    </Text>
                  </HStack>

                  <HStack
                    w="full"
                    p={4}
                    bg={colorMode === "light" ? "yellow.50" : "yellow.900"}
                    rounded={radiusStyle}
                    spacing={3}
                  >
                    <Icon
                      as={FiAlertCircle}
                      boxSize={5}
                      color={colorMode === "light" ? "yellow.600" : "yellow.300"}
                    />
                    <Text fontSize="sm" flex={1}>
                      Contact your administrator for access
                    </Text>
                  </HStack>
                </VStack>

                {/* Action Buttons */}
                <HStack spacing={4} pt={4} w="full">
                  <Button
                    leftIcon={<FiArrowLeft />}
                    onClick={() => router.back()}
                    variant="outline"
                    colorScheme="gray"
                    size="lg"
                    flex={1}
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={() => router.push("/home")}
                    colorScheme="orange"
                    size="lg"
                    flex={1}
                  >
                    Go Home
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Footer Text */}
          <Text
            mt={8}
            color={colorMode === "light" ? "gray.500" : "gray.400"}
            fontSize="sm"
          >
            Need help? Contact your system administrator
          </Text>
        </Flex>
      </Box>
    </LayoutAdmin>
  );
}
