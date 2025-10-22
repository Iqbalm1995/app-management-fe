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
import { FiArrowLeft, FiClock, FiCode, FiStar, FiZap } from "react-icons/fi";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ComingSoonPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();

  const features = [
    {
      icon: FiZap,
      title: "Advanced Analytics",
      description: "Real-time insights and reporting",
    },
    {
      icon: FiCode,
      title: "API Integration",
      description: "Seamless third-party connections",
    },
    {
      icon: FiStar,
      title: "Premium Features",
      description: "Enhanced functionality and tools",
    },
  ];

  return (
    <LayoutAdmin>
      <Box
        minH="calc(100vh - 80px)"
        bgGradient={
          colorMode === "light"
            ? "linear(135deg, blue.50, purple.50, pink.50)"
            : "linear(135deg, gray.900, blue.900, purple.900)"
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
          bgGradient="linear(45deg, blue.400, purple.500)"
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
          bgGradient="linear(45deg, pink.400, orange.500)"
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
          px={8}
          py={12}
          position="relative"
          zIndex={1}
        >
          {/* Main Content */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            textAlign="center"
            maxW="4xl"
          >
            {/* Icon */}
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              mb={8}
            >
              <Box
                w={24}
                h={24}
                mx="auto"
                bgGradient="linear(135deg, blue.500, purple.600)"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="2xl"
                position="relative"
              >
                <Icon as={FiClock} boxSize={12} color="white" />
                <Box
                  position="absolute"
                  inset={-2}
                  bgGradient="linear(135deg, blue.500, purple.600)"
                  rounded="2xl"
                  opacity={0.3}
                  filter="blur(10px)"
                />
              </Box>
            </MotionBox>

            {/* Title */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              mb={6}
            >
              <Heading
                size="3xl"
                bgGradient="linear(135deg, blue.500, purple.600, pink.500)"
                bgClip="text"
                mb={4}
                fontWeight="extrabold"
              >
                Coming Soon
              </Heading>
              <Text
                fontSize="xl"
                color={colorMode === "light" ? "gray.600" : "gray.300"}
                maxW="2xl"
                mx="auto"
                lineHeight="tall"
              >
                We're working hard to bring you something amazing. This feature is currently under development and will be available soon.
              </Text>
            </MotionBox>

            {/* Features Preview */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              mb={8}
            >
              <Text
                fontSize="lg"
                fontWeight="semibold"
                mb={6}
                color={colorMode === "light" ? "gray.700" : "gray.200"}
              >
                What's Coming
              </Text>
              <HStack spacing={6} justify="center" flexWrap="wrap">
                {features.map((feature, index) => (
                  <MotionCard
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    shadow="lg"
                    rounded={radiusStyle}
                    border="1px solid"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    maxW="200px"
                    cursor="pointer"
                  >
                    <CardBody textAlign="center" py={6}>
                      <Box
                        w={12}
                        h={12}
                        mx="auto"
                        mb={4}
                        bg={colorMode === "light" ? "blue.50" : "blue.900"}
                        color="blue.500"
                        rounded="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={feature.icon} boxSize={6} />
                      </Box>
                      <Text fontWeight="semibold" mb={2} fontSize="sm">
                        {feature.title}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                      >
                        {feature.description}
                      </Text>
                    </CardBody>
                  </MotionCard>
                ))}
              </HStack>
            </MotionBox>

            {/* Action Button */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={() => router.back()}
                size="lg"
                bgGradient="linear(135deg, blue.500, purple.600)"
                color="white"
                rounded="full"
                px={8}
                py={6}
                shadow="xl"
                _hover={{
                  bgGradient: "linear(135deg, blue.600, purple.700)",
                  transform: "translateY(-2px)",
                  shadow: "2xl",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.2s"
              >
                Go Back
              </Button>
            </MotionBox>
          </MotionBox>

          {/* Bottom Text */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            position="absolute"
            bottom={8}
            textAlign="center"
          >
            <Text
              fontSize="sm"
              color={colorMode === "light" ? "gray.500" : "gray.400"}
            >
              Stay tuned for updates • Follow our progress
            </Text>
          </MotionBox>
        </Flex>
      </Box>
    </LayoutAdmin>
  );
}
