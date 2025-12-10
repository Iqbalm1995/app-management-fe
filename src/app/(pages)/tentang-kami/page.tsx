"use client";

import {
  Box,
  Image,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorMode,
  Avatar,
  HStack,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { FiTarget, FiEye, FiUsers, FiCode, FiLayout, FiCheckCircle } from "react-icons/fi";
import { GiNinjaHeroicStance, GiWizardStaff, GiRobotGolem } from "react-icons/gi";
import LayoutLanding from "@/app/components/layoutLanding";
import { radiusStyle } from "@/app/constants/applicationConstants";

export default function TentangKami() {
  const { colorMode } = useColorMode();

  const teamMembers = [
    { name: "Eka Haruman RG", role: "Manager Scrum Master", icon: GiNinjaHeroicStance, color: "green" },
    { name: "Mohammad Iqbal M", role: "Senior Frontend & Backend Developer", icon: GiWizardStaff, color: "blue" },
    { name: "Refanza Pradiptha", role: "Junior Frontend Developer", icon: GiRobotGolem, color: "purple" },
  ];

  return (
    <LayoutLanding>
      <Box minH="100vh">
        {/* White background for navbar */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          h="80px"
          bg={colorMode === "light" ? "white" : "gray.800"}
          zIndex={9}
          shadow="sm"
        />

        {/* Hero Section */}
        <Box
          bgGradient={
            colorMode === "light"
              ? "linear(to-r, secondary.500, secondary.900)"
              : "linear(to-r, secondary.800, secondary.500)"
          }
          pt={40}
          pb={20}
          position="relative"
          overflow="hidden"
        >
          <Container maxW="container.xl" position="relative" zIndex={1}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={10}
            >
              {/* Left Content */}
              <VStack align={{ base: "center", md: "start" }} spacing={6} flex={1} textAlign={{ base: "center", md: "left" }}>
                {/* <Badge colorScheme="whiteAlpha" fontSize="md" px={4} py={2} rounded="full">
                  Tentang Kami
                </Badge> */}
                <Heading
                  size="2xl"
                  fontWeight="bold"
                  color="white"
                  lineHeight="1.2"
                >
                  bjb aPPs
                </Heading>
                <Text fontSize="xl" color="whiteAlpha.900" maxW="xl">
                  Make it easier to manage your Projects
                </Text>
              </VStack>

              {/* Right - BJB Logo */}
              <Box flex={1} display="flex" justifyContent="center">
                <Box
                  w={{ base: "200px", md: "300px" }}
                  h={{ base: "200px", md: "300px" }}
                  bg="whiteAlpha.200"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  backdropFilter="blur(10px)"
                  position="relative"
                >
                  <Image
                    src="/img/logo-bjb.png"
                    alt="Bank BJB"
                    w="60%"
                    filter="brightness(0) invert(1)"
                    animation="bounce 5s ease-in-out infinite"
                    sx={{
                      "@keyframes bounce": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.1)" },
                      },
                    }}
                  />
                  {/* Decorative rings */}
                  <Box
                    position="absolute"
                    w="110%"
                    h="110%"
                    border="2px dashed"
                    borderColor="whiteAlpha.400"
                    rounded="full"
                    animation="spin 64s linear infinite"
                    sx={{
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  <Box
                    position="absolute"
                    w="120%"
                    h="120%"
                    border="2px dotted"
                    borderColor="whiteAlpha.300"
                    rounded="full"
                    animation="spin 12s linear infinite reverse"
                    sx={{
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Flex>
          </Container>

          {/* Decorative circles */}
          <Box position="absolute" top="10%" left="5%" w="100px" h="100px" bg="whiteAlpha.200" rounded="full" />
          <Box position="absolute" bottom="20%" right="10%" w="150px" h="150px" bg="whiteAlpha.100" rounded="full" />
        </Box>

        {/* About bjb aPPs Section */}
        <Container maxW="container.xl" py={20}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
            {/* Left - Content */}
            <VStack align="start" spacing={6}>
              <Badge colorScheme="blue" fontSize="sm" px={4} py={1} rounded="full">
                About the Platform
              </Badge>
              <Heading
                size="2xl"
                bgGradient="linear(to-r, blue.500, purple.600)"
                bgClip="text"
                fontWeight="bold"
              >
                bjb aPPs
              </Heading>
              <Text fontSize="lg" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                Applications Performance & Productivity Projects
              </Text>
              <Box
                px={6}
                py={2}
                bg={colorMode === "light" ? "blue.500" : "blue.600"}
                rounded="full"
                color="white"
              >
                <Text fontSize="md" fontWeight="600" fontStyle="italic">
                  "Empowering Project Synergy"
                </Text>
              </Box>
              <Text
                fontSize="lg"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                lineHeight="tall"
                pt={4}
              >
                bjb aPPs is designed as a solution that drives synergy in enhancing project
                performance and productivity. This application helps both teams and individuals
                collaborate effectively, stay organized, and remain results-oriented in order
                to achieve project goals optimally.
              </Text>
            </VStack>

            {/* Right - Feature Cards */}
            <VStack spacing={4}>
              <Card
                rounded="xl"
                bg={colorMode === "light" ? "white" : "gray.800"}
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                w="full"
                transition="all 0.3s"
                _hover={{ transform: "translateX(8px)", shadow: "xl" }}
              >
                <CardBody p={6}>
                  <HStack spacing={4}>
                    <Flex
                      w={14}
                      h={14}
                      rounded="lg"
                      bgGradient="linear(135deg, blue.400, blue.600)"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiTarget} boxSize={7} color="white" />
                    </Flex>
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">Performance Tracking</Heading>
                      <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                        Monitor and optimize with real-time analytics
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card
                rounded="xl"
                bg={colorMode === "light" ? "white" : "gray.800"}
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                w="full"
                transition="all 0.3s"
                _hover={{ transform: "translateX(8px)", shadow: "xl" }}
              >
                <CardBody p={6}>
                  <HStack spacing={4}>
                    <Flex
                      w={14}
                      h={14}
                      rounded="lg"
                      bgGradient="linear(135deg, purple.400, purple.600)"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiUsers} boxSize={7} color="white" />
                    </Flex>
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">Team Collaboration</Heading>
                      <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                        Seamless tools for effective teamwork
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              <Card
                rounded="xl"
                bg={colorMode === "light" ? "white" : "gray.800"}
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                w="full"
                transition="all 0.3s"
                _hover={{ transform: "translateX(8px)", shadow: "xl" }}
              >
                <CardBody p={6}>
                  <HStack spacing={4}>
                    <Flex
                      w={14}
                      h={14}
                      rounded="lg"
                      bgGradient="linear(135deg, pink.400, pink.600)"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiCheckCircle} boxSize={7} color="white" />
                    </Flex>
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">Results-Oriented</Heading>
                      <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                        Stay focused on achieving optimal goals
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </Container>

        {/* Team Section */}
        <Box
          bgGradient={
            colorMode === "light"
              ? "linear(to-br, secondary.500, secondary.900)"
              : "linear(to-br, secondary.800, secondary.500)"
          }
          py={24}
          position="relative"
          overflow="hidden"
        >
          {/* Abstract Background Elements */}
          <Box
            position="absolute"
            top="-10%"
            right="-5%"
            w="400px"
            h="400px"
            bg="whiteAlpha.100"
            transform="rotate(45deg)"
            rounded="3xl"
          />
          <Box
            position="absolute"
            bottom="-10%"
            left="-5%"
            w="300px"
            h="300px"
            bg="whiteAlpha.100"
            transform="rotate(-30deg)"
            rounded="3xl"
          />

          <Container maxW="container.xl" position="relative" zIndex={1}>
            <VStack spacing={20}>
              {/* Header with Abstract Design */}
              <Flex
                direction={{ base: "column", lg: "row" }}
                align="center"
                justify="space-between"
                w="full"
                gap={12}
              >
                {/* Left - Abstract Shapes */}
                <Box
                  flex={1}
                  position="relative"
                  h={{ base: "200px", lg: "300px" }}
                  w="full"
                >
                  <Box
                    position="absolute"
                    top="20%"
                    left="10%"
                    w="150px"
                    h="150px"
                    bgGradient="linear(135deg, blue.400, blue.600)"
                    rounded="2xl"
                    transform="rotate(15deg)"
                    animation="float 6s ease-in-out infinite"
                    sx={{
                      "@keyframes float": {
                        "0%, 100%": { transform: "rotate(15deg) translateY(0px)" },
                        "50%": { transform: "rotate(15deg) translateY(-20px)" },
                      },
                    }}
                  />
                  <Box
                    position="absolute"
                    top="40%"
                    right="15%"
                    w="120px"
                    h="120px"
                    bgGradient="linear(135deg, purple.400, purple.600)"
                    rounded="2xl"
                    transform="rotate(-20deg)"
                    animation="float 8s ease-in-out infinite"
                    sx={{
                      "@keyframes float": {
                        "0%, 100%": { transform: "rotate(-20deg) translateY(0px)" },
                        "50%": { transform: "rotate(-20deg) translateY(-15px)" },
                      },
                    }}
                  />
                  <Box
                    position="absolute"
                    bottom="10%"
                    left="30%"
                    w="100px"
                    h="100px"
                    bgGradient="linear(135deg, pink.400, pink.600)"
                    rounded="2xl"
                    transform="rotate(30deg)"
                    animation="float 7s ease-in-out infinite"
                    sx={{
                      "@keyframes float": {
                        "0%, 100%": { transform: "rotate(30deg) translateY(0px)" },
                        "50%": { transform: "rotate(30deg) translateY(-18px)" },
                      },
                    }}
                  />
                </Box>

                {/* Right - Text Content */}
                <VStack
                  flex={1}
                  align={{ base: "center", lg: "start" }}
                  textAlign={{ base: "center", lg: "left" }}
                  spacing={6}
                >
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    fontSize="sm"
                    px={4}
                    py={2}
                    rounded="full"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    fontWeight="600"
                  >
                    Meet Our Team
                  </Badge>
                  <Heading
                    size="2xl"
                    fontWeight="bold"
                    letterSpacing="tight"
                    color="white"
                  >
                    Created by Squad IBC
                  </Heading>
                  <Text
                    fontSize="lg"
                    color="whiteAlpha.900"
                    lineHeight="tall"
                    maxW="xl"
                    fontWeight="400"
                  >
                    bjb aPPs is designed to foster synergy in boosting project performance and productivity.
                  </Text>
                </VStack>
              </Flex>

              {/* Team Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                {teamMembers.map((member, index) => (
                  <Card
                    key={index}
                    rounded="3xl"
                    bg="transparent"
                    backdropFilter="blur(20px)"
                    transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    cursor="pointer"
                    position="relative"
                    overflow="hidden"
                    border="2px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{
                      transform: "translateY(-12px) scale(1.02)",
                      borderColor: "whiteAlpha.500",
                      shadow: "2xl",
                    }}
                  >
                    <CardBody p={0}>
                      <VStack spacing={0} position="relative">
                        {/* Icon/Avatar Section */}
                        <Box
                          w="full"
                          h="120px"
                          bg="transparent"
                          position="relative"
                        />

                        {/* Overlapping Person Avatar */}
                        <Box
                          w="120px"
                          h="140px"
                          bg={`${member.color}.500`}
                          rounded="2xl"
                          position="absolute"
                          top="40px"
                          left="50%"
                          transform="translateX(-50%)"
                          border="4px solid"
                          borderColor="whiteAlpha.400"
                          shadow="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                        >
                          <Icon as={member.icon} boxSize={16} color="white" />
                        </Box>

                        {/* Info Section */}
                        <VStack spacing={3} pt={20} pb={6} px={6} w="full" bg="whiteAlpha.100">
                          <Text
                            fontSize="lg"
                            fontWeight="700"
                            color="white"
                            textAlign="center"
                          >
                            {member.name}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="whiteAlpha.800"
                            fontWeight="600"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            textAlign="center"
                          >
                            {member.role}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </Box>
    </LayoutLanding>
  );
}
