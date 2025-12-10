"use client";

import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Avatar,
  AvatarGroup,
  Stack,
  Progress,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiHeart,
  FiShare,
  FiRefreshCcw,
  FiCode,
} from "react-icons/fi";
import {
  radiusStyle,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { ProjectDataResponse, AppsResponse } from "@/app/services/useProjects";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import { MdSettings } from "react-icons/md";
import { TbContract } from "react-icons/tb";
import { FaCode } from "react-icons/fa";

// Route configuration for easy management
// To add new project types or modify routes:
// 1. Add new entry with project type constant as key
// 2. Define back URL, devView URL (optional), and showDevView flag
// Example:
//   [NEW_PROJECT_TYPE]: {
//     back: "/your-back-route",
//     devView: "/your-dev-view-route",  // optional
//     showDevView: true,  // show Dev View button
//   }
const PROJECT_ROUTES = {
  [PROJECT_TYPE_INTERNAL_DEVELOPMENT]: {
    back: "/projects-manager",
    devView: "/projects-manager/development",
    showDevView: true,
  },
  [PROJECT_TYPE_PROCUREMENT]: {
    back: "/projects-procurements",
    devView: null,
    showDevView: false,
  },
};

interface ProjectDetailHeaderProps {
  DataProject: ProjectDataResponse | null;
  DataApps: AppsResponse | null;
  projectId: string | null;
  IsLoadingProcess: boolean;
  onRefresh: () => void;
}

export const ProjectDetailHeader = ({
  DataProject,
  DataApps,
  projectId,
  IsLoadingProcess,
  onRefresh,
}: ProjectDetailHeaderProps) => {
  const { colorMode } = useColorMode();

  // Get route configuration based on project type
  const routeConfig = DataProject?.projectType
    ? PROJECT_ROUTES[DataProject.projectType as keyof typeof PROJECT_ROUTES]
    : PROJECT_ROUTES[PROJECT_TYPE_PROCUREMENT]; // Default fallback

  const backUrl = routeConfig?.back || "/projects-procurements";
  const devViewUrl = routeConfig?.devView
    ? `${routeConfig.devView}?projectId=${projectId}`
    : null;
  const showDevView = routeConfig?.showDevView || false;

  // Determine which icon to show
  const renderIcon = () => {
    if (DataProject?.projectType === PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      return <FaCode size={32} />;
    } else if (DataProject?.projectType === PROJECT_TYPE_PROCUREMENT) {
      return <TbContract size={32} />;
    }
    return <MdSettings size={32} />;
  };

  return (
    <Box
      bgGradient={"linear(to-br, secondary.800, secondary.600)"}
      color="white"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      mt={{ base: 2, md: 4 }}
      mb={{ base: 4, md: 6 }}
      rounded={radiusStyle}
      position="relative"
      overflow="hidden"
      shadow="xl"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient:
          "linear(45deg, whiteAlpha.100 0%, transparent 50%, whiteAlpha.150 100%)",
        zIndex: 0,
      }}
    >
      {/* BJB Logo in Bottom Right Corner */}
      <Box
        position="absolute"
        bottom={{ base: 2, md: 4 }}
        right={{ base: 4, md: 6 }}
        zIndex={3}
        opacity={0.7}
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s ease"
      >
        <Box
          as="img"
          src="/img/logo-bjb-black-wing.svg"
          alt="BJB Logo"
          w={{ base: "40px", md: "60px" }}
          h="auto"
          filter="brightness(0) invert(1)"
        />
      </Box>

      {/* Main Header Content */}
      <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
        {/* Compact Top Navigation */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Link href={backUrl}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                size="sm"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  bg: "whiteAlpha.200",
                  borderColor: "whiteAlpha.300",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={4}
                transition="all 0.2s ease"
              >
                Back
              </Button>
            </Link>

            {/* {showDevView && devViewUrl && (
              <Link href={devViewUrl}>
                <Button
                  leftIcon={<FiCode />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    bg: "whiteAlpha.200",
                    borderColor: "whiteAlpha.300",
                    transform: "translateY(-1px)",
                  }}
                  rounded="full"
                  px={4}
                  transition="all 0.2s ease"
                >
                  Dev View
                </Button>
              </Link>
            )} */}
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<FiHeart />}
              variant="ghost"
              size="sm"
              color="white"
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{
                bg: "pink.400",
                borderColor: "pink.300",
                transform: "translateY(-1px)",
              }}
              rounded="full"
              px={3}
              transition="all 0.2s ease"
            >
              Favorite
            </Button>

            <Button
              leftIcon={<FiShare />}
              variant="ghost"
              size="sm"
              color="white"
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{
                bg: "blue.400",
                borderColor: "blue.300",
                transform: "translateY(-1px)",
              }}
              rounded="full"
              px={3}
              transition="all 0.2s ease"
            >
              Share
            </Button>

            <Button
              leftIcon={<FiRefreshCcw />}
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={IsLoadingProcess}
              borderColor="whiteAlpha.300"
              color="white"
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              _hover={{
                bg: "whiteAlpha.200",
                borderColor: "whiteAlpha.400",
                transform: "translateY(-1px)",
              }}
              rounded="full"
              px={3}
              transition="all 0.2s ease"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Compact Main Project Information */}
        {DataProject ? (
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 4, md: 6 }}
            align={{ base: "center", md: "start" }}
          >
            {/* Compact Application Avatar */}
            <VStack spacing={3} align="center">
              <Box position="relative">
                <Box
                  w={"75px"}
                  h={"75px"}
                  bgGradient={"linear(to-br, secondary.100, secondary.50)"}
                  rounded={"30%"}
                  display={"flex"}
                  alignItems="center"
                  justifyContent="center"
                  fontSize={"x-large"}
                  fontWeight={"bold"}
                  shadow={"lg"}
                  position="relative"
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  transition="all 0.2s ease"
                  color={"secondary.800"}
                >
                  {renderIcon()}
                </Box>
              </Box>

              <VStack spacing={1} align="center">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  opacity={0.95}
                  textAlign="center"
                  maxW="100px"
                  lineHeight={1}
                >
                  {DataProject?.appsProject?.appName ||
                    DataApps?.appName ||
                    "No Application"}
                </Text>
              </VStack>
            </VStack>

            {/* Compact Project Details */}
            <Box flex={1}>
              <VStack spacing={3} align="start">
                <Heading
                  size="xl"
                  fontWeight="700"
                  bgGradient="linear(to-r, white, whiteAlpha.900)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  {DataProject.projectName}
                </Heading>

                <HStack spacing={3} wrap="wrap">
                  <Badge
                    colorScheme={
                      DataProject.projectStatus === "ACTIVE"
                        ? "green"
                        : DataProject.projectStatus === "ONHOLD"
                          ? "orange"
                          : DataProject.projectStatus === "COMPLETED"
                            ? "blue"
                            : "gray"
                    }
                    px={2}
                    rounded="full"
                    fontSize="small"
                    fontWeight="semibold"
                    shadow="md"
                    size={"sm"}
                  >
                    {DataProject.projectStatus}
                  </Badge>
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    px={2}
                    rounded="full"
                    fontSize="small"
                    fontWeight="semibold"
                    shadow="md"
                    size={"sm"}
                  >
                    {DataProject.projectType}
                  </Badge>
                </HStack>
                <HStack spacing={4} fontSize="sm" opacity={0.95}>
                  <Progress
                    value={DataProject.projectStatusPercentage || 0}
                    size="md"
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.200"
                    rounded="full"
                    shadow="inner"
                    flex="1"
                    w="480px"
                    minW="80px"
                  />
                  <Text fontSize="md" fontWeight="bold" opacity={0.9}>
                    {DataProject.projectStatusPercentage || 0}%
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Compact Team & Progress */}
            <VStack spacing={3} align="center" minW="120px">
              {DataProject.userAssignment &&
                DataProject.userAssignment.length > 0 && (
                  <AvatarGroup size={"sm"} max={4} spacing="-0.5rem">
                    {DataProject.userAssignment
                      .slice(0, 5)
                      .map((assignment, index) => (
                        <Avatar
                          key={index}
                          name={assignment.userData?.nama || "User"}
                          src={assignment.userData?.profilePict || undefined}
                          border="2px solid white"
                          shadow={"md"}
                          _hover={{
                            transform: "scale(1.05)",
                            zIndex: 10,
                          }}
                          transition="all 0.2s ease"
                        />
                      ))}
                  </AvatarGroup>
                )}

              <VStack spacing={2} align="center">

              </VStack>
            </VStack>
          </Stack>
        ) : (
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 4, md: 6 }}
            align="center"
            py={4}
          >
            <Box>
              <LoadingMiniSquare />
            </Box>
            <Box flex={1}>
              <Heading size="xl" color="whiteAlpha.800" fontWeight="700">
                Just a moment...
              </Heading>
              <Text opacity={0.8} fontSize="sm" mt={1}>
                Please wait while we fetch project details
              </Text>
            </Box>
          </Stack>
        )}
      </VStack>
    </Box>
  );
};
