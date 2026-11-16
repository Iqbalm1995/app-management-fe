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
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiRefreshCcw,
  FiFileText,
  FiCalendar,
  FiTarget,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import {
  radiusStyle,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import {
  ProjectDataResponse,
  AppsResponse,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import { MdSettings } from "react-icons/md";
import { TbContract } from "react-icons/tb";
import { FaCode } from "react-icons/fa";

interface ProjectPreviewHeaderProps {
  DataProject: ProjectDataResponse | null;
  DataApps?: AppsResponse | null;
  projectId?: string | null;
  IsLoadingProcess?: boolean;
  onRefresh?: () => void;
  approvalMode?: boolean;
  projectMembers?: ProjectUserAssignmentResponse[];
}

export const ProjectPreviewHeader = ({
  DataProject,
  DataApps,
  projectId,
  IsLoadingProcess = false,
  onRefresh,
  approvalMode = false,
  projectMembers = [],
}: ProjectPreviewHeaderProps) => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic back URL - defaults always to /projects/pending-approve
  const fromParam = searchParams?.get("from");
  const returnUrlParam = searchParams?.get("returnUrl");
  let backUrl = "/projects/pending-approve";
  let backLabel = "Back to Pending Approval";

  if (returnUrlParam) {
    backUrl = returnUrlParam;
    backLabel = "Back to Previous Page";
  } else if (fromParam === "projects-manager") {
    backUrl = "/projects-manager";
    backLabel = "Back to Projects Manager";
  } else if (fromParam === "projects-procurements") {
    backUrl = "/projects-procurements";
    backLabel = "Back to Procurements";
  } else {
    backUrl = "/projects/pending-approve";
    backLabel = "Back to Pending Approval";
  }

  // Determine icon based on project type
  const renderIcon = () => {
    if (DataProject?.projectType === PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      return <FaCode size={32} />;
    } else if (DataProject?.projectType === PROJECT_TYPE_PROCUREMENT) {
      return <TbContract size={32} />;
    }
    return <MdSettings size={32} />;
  };

  // Status color resolver
  const getStatusColorScheme = (status?: string | null) => {
    if (!status) return "yellow";
    const s = status.toUpperCase();
    if (s.includes("APPROV")) return "green";
    if (s.includes("DECLIN") || s.includes("REJECT")) return "red";
    if (s.includes("HOLD")) return "orange";
    return "yellow";
  };

  const activeMembers =
    projectMembers.length > 0
      ? projectMembers
      : DataProject?.userAssignment || [];

  return (
    <Box
      bgGradient={"linear(to-br, secondary.800, secondary.600)"}
      color="white"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      mb={6}
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
      {/* Official BJB Logo Watermark in Bottom Right Corner */}
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
        {/* Top Navigation Ribbon */}
        <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
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
                {backLabel}
              </Button>
            </Link>
          </HStack>

          <HStack spacing={2}>
            {DataProject?.id && (
              <Button
                leftIcon={<FiFileText />}
                variant="ghost"
                size="sm"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  bg: "blue.500",
                  borderColor: "blue.400",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={3.5}
                transition="all 0.2s ease"
                onClick={() =>
                  router.push(`/projects/doc?projectId=${DataProject.id}`)
                }
              >
                View As Doc
              </Button>
            )}

            {onRefresh && (
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
            )}
          </HStack>
        </HStack>

        {/* Project Information Hero Row */}
        {DataProject ? (
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 4, md: 6 }}
            align={{ base: "start", md: "center" }}
            pt={2}
          >
            {/* Left Squircle Application / Type Icon */}
            <VStack spacing={2} align="center" minW="85px">
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
                color={"secondary.800"}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s ease"
              >
                {renderIcon()}
              </Box>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                opacity={0.9}
                textAlign="center"
                maxW="95px"
                lineHeight={1.2}
                noOfLines={2}
              >
                {DataProject.appsProject?.appName ||
                  DataApps?.appName ||
                  DataProject.projectType ||
                  "Project"}
              </Text>
            </VStack>

            {/* Center Project Headline & Identity Badges */}
            <Box flex={1}>
              <VStack spacing={2.5} align="start">
                <Heading
                  size="xl"
                  fontWeight="700"
                  bgGradient="linear(to-r, white, whiteAlpha.900)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  {DataProject.projectName}
                </Heading>

                {/* Status & Category Badges */}
                <HStack spacing={2.5} wrap="wrap">
                  {DataProject.projectCode && (
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      px={3}
                      py={0.5}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="semibold"
                      shadow="sm"
                    >
                      {DataProject.projectCode}
                    </Badge>
                  )}
                  {DataProject.projectNo && (
                    <Badge
                      colorScheme="cyan"
                      variant="solid"
                      px={3}
                      py={0.5}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="semibold"
                      shadow="sm"
                    >
                      No: {DataProject.projectNo}
                    </Badge>
                  )}
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    px={3}
                    py={0.5}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    shadow="sm"
                  >
                    {DataProject.projectType}
                  </Badge>
                  <Badge
                    colorScheme={getStatusColorScheme(
                      DataProject.approvalStatus || DataProject.projectStatus
                    )}
                    variant="solid"
                    px={3}
                    py={0.5}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                    shadow="md"
                  >
                    {DataProject.approvalStatus ||
                      DataProject.projectStatus ||
                      "WAITING APPROVAL"}
                  </Badge>
                </HStack>

                {/* Focused Proposal Metadata (NO Execution Progression Bar) */}
                <HStack
                  spacing={{ base: 3, md: 5 }}
                  wrap="wrap"
                  pt={1}
                  fontSize="xs"
                  opacity={0.95}
                >
                  <HStack spacing={1.5}>
                    <Icon as={FiUser} />
                    <Text color="whiteAlpha.800">Requested by:</Text>
                    <Text fontWeight="semibold" color="white">
                      {DataProject.createdByName || DataProject.createdBy || "-"}
                      {DataProject.createdByJabatan
                        ? ` (${DataProject.createdByJabatan})`
                        : ""}
                    </Text>
                  </HStack>

                  <HStack spacing={1.5}>
                    <Icon as={FiCalendar} />
                    <Text color="whiteAlpha.800">Registration Date:</Text>
                    <Text fontWeight="semibold" color="white">
                      {DataProject.projectRegisterDate
                        ? new Date(
                            DataProject.projectRegisterDate
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </Text>
                  </HStack>

                  {DataProject.projectClosedDate && (
                    <HStack spacing={1.5}>
                      <Icon as={FiTarget} />
                      <Text color="whiteAlpha.800">Target Go-Live:</Text>
                      <Text fontWeight="semibold" color="white">
                        {new Date(
                          DataProject.projectClosedDate
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Box>

            {/* Right Team Delivery Avatars */}
            {activeMembers.length > 0 && (
              <VStack
                spacing={1.5}
                align={{ base: "start", md: "center" }}
                minW="120px"
              >
                <Text
                  fontSize="2xs"
                  textTransform="uppercase"
                  color="whiteAlpha.700"
                  fontWeight="bold"
                  letterSpacing="wider"
                >
                  Project Team ({activeMembers.length})
                </Text>
                <AvatarGroup size="sm" max={4} spacing="-0.5rem">
                  {activeMembers.slice(0, 5).map((assignment, index) => (
                    <Avatar
                      key={index}
                      name={assignment.userData?.nama || "User"}
                      src={assignment.userData?.profilePict || undefined}
                      border="2px solid white"
                      shadow="md"
                      _hover={{
                        transform: "scale(1.1)",
                        zIndex: 10,
                      }}
                      transition="all 0.2s ease"
                    />
                  ))}
                </AvatarGroup>
              </VStack>
            )}
          </Stack>
        ) : (
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 4, md: 6 }}
            align="center"
            py={4}
          >
            <LoadingMiniSquare />
            <Box flex={1}>
              <Heading size="lg" color="whiteAlpha.800" fontWeight="700">
                Loading Project Information...
              </Heading>
              <Text opacity={0.8} fontSize="sm" mt={1}>
                Please wait while project details are being prepared
              </Text>
            </Box>
          </Stack>
        )}
      </VStack>
    </Box>
  );
};
