"use client";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Button,
  Divider,
  Icon,
  Avatar,
  useColorMode,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBriefcase,
  FiLayers,
  FiUsers,
  FiPackage,
  FiInfo,
  FiShield,
} from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  ProjectDataResponse,
  AppsResponse,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import { formatToRupiah } from "@/app/helper/MasterHelper";

interface ProjectPreviewSidebarProps {
  DataProject: ProjectDataResponse | null;
  DataApps?: AppsResponse | null;
  canApprove?: boolean;
  approvalMode?: boolean;
  onApproveClick?: () => void;
  onDeclineClick?: () => void;
  backlogCount?: number;
  teamMemberCount?: number;
  statusHistory?: any[];
}

export const ProjectPreviewSidebar = ({
  DataProject,
  DataApps,
  canApprove = false,
  approvalMode = false,
  onApproveClick,
  onDeclineClick,
  backlogCount = 0,
  teamMemberCount = 0,
  statusHistory = [],
}: ProjectPreviewSidebarProps) => {
  const { colorMode } = useColorMode();

  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";
  const bgCard = colorMode === "light" ? "white" : "gray.800";

  // Calculate total budget from work programs
  const totalBudget =
    DataProject?.workPrograms?.reduce(
      (sum, wp) => sum + (Number(wp.workProgramBudget) || 0),
      0
    ) || 0;

  const app = DataProject?.appsProject;

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* 1. Panel Keputusan Approval (Jika dalam Mode Approval) */}
      {approvalMode && (
        <Card
          shadow="md"
          rounded={radiusStyle}
          border="2px solid"
          borderColor={canApprove ? "orange.400" : borderColor}
          bg={bgCard}
          overflow="hidden"
        >
          <CardHeader
            bg={
              canApprove
                ? colorMode === "light"
                  ? "orange.50"
                  : "orange.950"
                : colorMode === "light"
                ? "gray.50"
                : "gray.900"
            }
            borderBottom="1px solid"
            borderColor={canApprove ? "orange.200" : borderColor}
            py={4}
            px={5}
          >
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bg={canApprove ? "orange.500" : "gray.500"}
                color="white"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <FiShield size={16} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="xs" color={canApprove ? "orange.800" : "gray.700"}>
                  {canApprove
                    ? "Approval Decision"
                    : "Approval Status"}
                </Heading>
                <Text fontSize="2xs" color="gray.500">
                  {canApprove
                    ? "Your Decision is Required"
                    : "Waiting for Approval"}
                </Text>
              </VStack>
            </HStack>
          </CardHeader>

          <CardBody p={5}>
            <VStack spacing={4} align="stretch">
              <Box
                p={3}
                rounded="md"
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
                border="1px solid"
                borderColor={borderColor}
              >
                <Text fontSize="2xs" color="gray.500" textTransform="uppercase">
                  Current Stage
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="secondary.600" mt={0.5}>
                  {DataProject?.approvalStatus ||
                    DataProject?.projectStatus ||
                    "WAITING APPROVAL"}
                </Text>
              </Box>

              {canApprove ? (
                <VStack spacing={3} align="stretch">
                  <Button
                    colorScheme="green"
                    size="md"
                    rounded="lg"
                    leftIcon={<FiCheckCircle />}
                    onClick={onApproveClick}
                    shadow="sm"
                    _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    Approve Project
                  </Button>

                  <Button
                    colorScheme="red"
                    variant="outline"
                    size="md"
                    rounded="lg"
                    leftIcon={<FiXCircle />}
                    onClick={onDeclineClick}
                    _hover={{ bg: "red.50" }}
                  >
                    Decline / Request Revision
                  </Button>
                </VStack>
              ) : (
                <Box
                  p={3}
                  rounded="md"
                  bg="yellow.50"
                  color="yellow.800"
                  fontSize="xs"
                  border="1px solid"
                  borderColor="yellow.200"
                >
                  <Text>
                    This proposal is awaiting evaluation and approval from the authorized officer at this stage.
                  </Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* 2. Executive Summary (Snapshot Card) */}
      <Card
        shadow="sm"
        rounded={radiusStyle}
        border="1px"
        borderColor={borderColor}
        bg={bgCard}
        overflow="hidden"
      >
        <CardHeader
          bg={colorMode === "light" ? "gray.50" : "gray.900"}
          borderBottom="1px"
          borderColor={borderColor}
          py={3.5}
          px={5}
        >
          <HStack spacing={2}>
            <Icon as={FiInfo} color="secondary.600" />
            <Heading size="xs" textTransform="uppercase" letterSpacing="wider">
              Executive Summary
            </Heading>
          </HStack>
        </CardHeader>

        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Work Programs Budget (No $ Icon, No "Anggaran") */}
            <Box>
              <HStack spacing={1.5} color="gray.500" mb={1}>
                <Icon as={FiBriefcase} boxSize={3.5} />
                <Text fontSize="2xs" textTransform="uppercase" fontWeight="bold">
                  Work Programs Budget
                </Text>
              </HStack>
              <Text fontSize="md" fontWeight="bold" color="green.600">
                {totalBudget > 0 ? formatToRupiah(totalBudget) : "Rp 0"}
              </Text>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Total Feature Scope */}
            <Box>
              <HStack spacing={1.5} color="gray.500" mb={1}>
                <Icon as={FiLayers} boxSize={3.5} />
                <Text fontSize="2xs" textTransform="uppercase" fontWeight="bold">
                  Feature Scope
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="bold">
                  {backlogCount} Backlogs Proposed
                </Text>
                <Badge colorScheme="blue" fontSize="2xs">
                  Scope
                </Badge>
              </HStack>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Team Allocation */}
            <Box>
              <HStack spacing={1.5} color="gray.500" mb={1}>
                <Icon as={FiUsers} boxSize={3.5} />
                <Text fontSize="2xs" textTransform="uppercase" fontWeight="bold">
                  Team Allocation
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">
                {teamMemberCount} Assigned Members
              </Text>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Procurement & SDLC */}
            <Box>
              <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold" mb={1}>
                Procurement & SDLC
              </Text>
              <VStack align="start" spacing={1} fontSize="xs">
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Procurement:</Text>
                  <Text fontWeight="semibold">
                    {DataProject?.projectAcquisitionName || "In-House"}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">SDLC Category:</Text>
                  <Text fontWeight="semibold">
                    {DataProject?.sdlcName || "Standard"}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* 3. Connected Application */}
      {app && (
        <Card
          w="full"
          shadow="lg"
          rounded={radiusStyle}
          border="1px"
          borderColor="gray.200"
          bgGradient="linear(to-b, secondary.500, secondary.800)"
          color="white"
          _hover={{
            shadow: "xl",
            transform: "translateY(-2px)",
          }}
          transition="all 0.3s ease"
          overflow="hidden"
          position="relative"
        >
          {/* Logo BJB Watermark */}
          <Box
            position="absolute"
            top={{ base: "-5px", md: "-10px" }}
            right={{ base: "-20px", md: "-40px" }}
            zIndex={0}
            opacity={0.08}
            transform="rotate(15deg)"
          >
            <Box
              as="img"
              src="/img/logo-bjb-black-wing.svg"
              alt="BJB Logo Background"
              w={{ base: "180px", md: "240px" }}
              h="auto"
              filter="brightness(0) invert(1)"
            />
          </Box>

          <CardHeader py={3.5} px={5} position="relative" zIndex={1}>
            <HStack spacing={2}>
              <Icon as={FiPackage} color="whiteAlpha.900" />
              <Heading
                size="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="white"
              >
                Connected Application
              </Heading>
            </HStack>
          </CardHeader>

          <CardBody p={5} pt={0} position="relative" zIndex={1}>
            <VStack spacing={3} align="stretch">
              <HStack spacing={3}>
                <Avatar
                  size="md"
                  name={app.appName}
                  bg="whiteAlpha.300"
                  color="white"
                  border="2px solid whiteAlpha.400"
                />
                <Box flex={1} overflow="hidden">
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1} color="white">
                    {app.appName}
                  </Text>
                  <Text fontSize="2xs" color="whiteAlpha.800" noOfLines={1}>
                    {app.appCode || "App Code N/A"}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={2} wrap="wrap">
                {app.appShortName && (
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    fontSize="2xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                    border="1px solid whiteAlpha.300"
                  >
                    {app.appShortName}
                  </Badge>
                )}
                {app.appsStatus && (
                  <Badge
                    bg="green.400"
                    color="gray.900"
                    fontSize="2xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                    fontWeight="bold"
                  >
                    {app.appsStatus}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};
