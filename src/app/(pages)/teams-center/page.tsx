"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useColorMode } from "@chakra-ui/react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaUsersRays } from "react-icons/fa6";
import { FiRefreshCcw, FiSearch, FiFilter } from "react-icons/fi";
import { useState } from "react";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Teams Center`,
  breadCrumb: ["Home", "Teams Center"],
};

function TeamsCenterPage() {
  const { colorMode } = useColorMode();

  // Refresh state management (following other pages pattern)
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* UX-Friendly Dashboard Hero */}
      <Box mx={{ base: 4, md: 6 }} mt={4} mb={6}>
        <Box
          bg={colorMode === "light" ? "white" : "gray.800"}
          rounded="2xl"
          shadow="lg"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          overflow="hidden"
        >
          {/* Hero Section */}
          <Box
            bgGradient="linear(135deg, secondary.500, secondary.600, purple.500, secondary.500)"
            backgroundSize="400% 400%"
            animation="gradientMove 8s ease infinite"
            color="white"
            p={{ base: 6, md: 8 }}
            position="relative"
            sx={{
              "@keyframes gradientMove": {
                "0%, 100%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
              },
            }}
          >
            <VStack spacing={6} align="stretch">
              {/* Title & Stats Layout */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
                {/* Left - Title & Description */}
                <VStack align="start" spacing={2} flex="1" minW="300px">
                  <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
                    Teams Center
                  </Heading>
                  <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9}>
                    Manage teams, track collaboration, and boost productivity
                  </Text>
                </VStack>

                {/* Right - Quick Stats */}
                <SimpleGrid
                  columns={{ base: 3, md: 3 }}
                  spacing={3}
                  minW="300px"
                >
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      24
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Active Teams
                    </Text>
                  </Box>
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      156
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Members
                    </Text>
                  </Box>
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      89%
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Active Rate
                    </Text>
                  </Box>
                </SimpleGrid>
              </Flex>
            </VStack>
          </Box>

          {/* Controls Section - Separated for Better UX */}
          <Box
            p={{ base: 4, md: 6 }}
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
          >
            <VStack spacing={4}>
              {/* Controls Row - Search & Filter Left, Refresh Right */}
              <Flex
                w="full"
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={4}
              >
                {/* Left - Search & Filter */}
                <HStack spacing={4} flex="1">
                  <InputGroup maxW="400px" flex="1">
                    <InputLeftElement>
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search teams by name or member..."
                      bg={colorMode === "light" ? "white" : "gray.600"}
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.300" : "gray.500"
                      }
                      rounded="xl"
                      _focus={{
                        borderColor: "secondary.500",
                        shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                      }}
                    />
                  </InputGroup>

                  <Select
                    maxW="180px"
                    bg={colorMode === "light" ? "white" : "gray.600"}
                    border="1px"
                    borderColor={
                      colorMode === "light" ? "gray.300" : "gray.500"
                    }
                    rounded="xl"
                    _focus={{
                      borderColor: "secondary.500",
                      shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                    }}
                  >
                    <option value="all">All Teams</option>
                    <option value="active">Active Teams</option>
                    <option value="inactive">Inactive Teams</option>
                    <option value="recent">Recently Active</option>
                  </Select>
                </HStack>

                {/* Right - Refresh Button */}
                {/* <Button
                  variant="ghost"
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => RefreshAction()}
                  isLoading={IsLoadingProcess}
                  rounded="xl"
                  size="md"
                  color={colorMode === "light" ? "gray.600" : "gray.300"}
                >
                  Refresh
                </Button> */}
              </Flex>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Main Content Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        mx={{ base: 4, md: 6 }}
        mb={8}
      >
        <CardBody p={8}>
          {/* Top Section with Action Buttons */}
          <Flex
            justify="space-between"
            align="center"
            mb={8}
            wrap="wrap"
            gap={4}
          >
            <Heading
              size="lg"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              Team Management
            </Heading>

            <HStack spacing={3}>
              <Button
                colorScheme="secondary"
                leftIcon={<Icon as={FaUsersRays} />}
                rounded="xl"
                size="md"
              >
                Create Team
              </Button>
              {/* <Button
                variant="outline"
                colorScheme="secondary"
                rounded="xl"
                size="md"
              >
                Invite Members
              </Button> */}
              <Button
                variant="ghost"
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
                isLoading={IsLoadingProcess}
                rounded="xl"
                size="md"
                color={colorMode === "light" ? "gray.600" : "gray.300"}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>

          <VStack spacing={8} align="center" py={20}>
            <Box
              w="120px"
              h="120px"
              bgGradient="linear(135deg, secondary.400, purple.500, blue.500)"
              rounded="3xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              shadow="2xl"
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                inset: "-4px",
                bgGradient:
                  "linear(135deg, secondary.300, purple.400, blue.400)",
                rounded: "3xl",
                zIndex: -1,
                opacity: 0.4,
                filter: "blur(8px)",
              }}
            >
              <Icon as={FaUsersRays} boxSize={16} />
            </Box>

            <VStack spacing={4} textAlign="center">
              <Heading
                size="2xl"
                bgGradient="linear(to-r, secondary.600, purple.600, blue.600)"
                bgClip="text"
                fontWeight="bold"
              >
                Coming Soon
              </Heading>
              <Text
                fontSize="xl"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                maxW="600px"
                lineHeight="1.6"
              >
                We're building something amazing for team collaboration and
                management. Stay tuned for powerful features that will
                revolutionize how you work with teams.
              </Text>
              <Text
                fontSize="md"
                color={colorMode === "light" ? "gray.500" : "gray.500"}
                fontWeight="medium"
              >
                Expected Launch: Q1 2026
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

export default TeamsCenterPage;
