"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  radiusStyle,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "@/app/constants/applicationConstants";
import {
  getProjectHealthRating,
  truncateText,
  buildUrlPort,
} from "@/app/helper/MasterHelper";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  FiCode,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiGitBranch,
  FiActivity,
  FiExternalLink,
  FiPlay,
  FiTarget,
  FiSettings,
  FiServer,
} from "react-icons/fi";
import { BsKanban } from "react-icons/bs";
import Link from "next/link";
import { memo, useState } from "react";

interface CardProjectDeploymentProps {
  data: ProjectDataResponse;
  variant?: "manager" | "development" | "procurement" | "deployment";
  linkPath?: string;
  actionLabel?: string;
  actionIcon?: any;
}

const CardProjectDeployment = memo(
  ({
    data,
    variant = "development",
    linkPath,
    actionLabel,
    actionIcon,
  }: CardProjectDeploymentProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { colorMode } = useColorMode();

    const getStatusColor = (status: string) => {
      switch (status) {
        case "ACTIVE":
          return "green";
        case "COMPLETED":
          return "blue";
        case "ONHOLD":
          return "orange";
        case "INACTIVE":
          return "red";
        default:
          return "gray";
      }
    };

    const getProgressColor = (percentage: number) => {
      if (percentage >= 80) return "green";
      if (percentage >= 60) return "blue";
      if (percentage >= 40) return "orange";
      return "red";
    };

    // Default configurations based on variant
    const getDefaultConfig = () => {
      switch (variant) {
        case "deployment":
          return {
            linkPath: "/projects-deployments/detail",
            actionLabel: "Manage Deployment",
            actionIcon: FiServer,
            colorScheme: "green",
          };
        case "procurement":
          return {
            linkPath: "/projects-procurements/detail",
            actionLabel: "Manage Procurement",
            actionIcon: FiTarget,
            colorScheme: "yellow",
          };
        case "manager":
          return {
            linkPath:
              linkPath || `projects-manager/detail?projectId=${data.id}`,
            actionLabel: actionLabel || "Manage Project",
            actionIcon: actionIcon || FiSettings,
            colorScheme: "blue",
          };
        case "development":
        default:
          return {
            linkPath:
              linkPath ||
              `project-development/development?projectId=${data.id}`,
            actionLabel: actionLabel || "Start Development",
            actionIcon: actionIcon || FiCode,
            colorScheme: "secondary",
          };
      }
    };

    const config = getDefaultConfig();

    return (
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        w="full"
        h="320px"
        minH="320px"
        maxH="320px"
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        rounded="xl"
        shadow={isHovered ? "xl" : "md"}
        transition="all 0.3s ease"
        transform={isHovered ? "translateY(-4px)" : "translateY(0)"}
        _hover={{
          cursor: "pointer",
          borderColor:
            variant === "deployment"
              ? "green.300"
              : variant === "procurement"
              ? "yellow.300"
              : variant === "manager"
              ? "blue.300"
              : "secondary.300",
        }}
        overflow="hidden"
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {/* Small Colored Header */}
        <CardHeader
          p={0}
          position="relative"
          bgGradient={
            variant === "deployment"
              ? "linear(to-r, green.500, teal.500)"
              : variant === "procurement"
              ? "linear(to-r, yellow.500, orange.500)"
              : variant === "manager"
              ? "linear(to-r, blue.500, purple.500)"
              : "linear(to-r, purple.500, blue.500)"
          }
          color="white"
          h="120px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={4}
        >
          {/* Project Initial */}
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              minW="40px"
              flexShrink={0}
              bg="whiteAlpha.300"
              rounded="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="lg"
              fontWeight="bold"
            >
              {data.projectName.charAt(0)}
            </Box>
            <VStack spacing={0} align="start">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                opacity="0.9"
                noOfLines={1}
              >
                {data.projectName}
              </Text>
              <Text fontSize="xs" opacity="0.7">
                {data.projectType}
              </Text>
            </VStack>
          </HStack>

          {/* Status Badge */}
          <Badge
            colorScheme={getStatusColor(data.projectStatus)}
            rounded="md"
            px={2}
            py={1}
            fontSize="xs"
            fontWeight="medium"
          >
            {data.projectStatus}
          </Badge>
        </CardHeader>

        {/* Compact Card Body */}
        <CardBody p={4} flex="1" display="flex" flexDirection="column">
          <VStack spacing={4} align="stretch" flex="1">
            {/* Project Code & Health */}
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.400" fontWeight="medium">
                #{data.projectNo || data.projectCode}
              </Text>
              <Text
                fontSize="xs"
                color={`${getProgressColor(data.projectStatusPercentage)}.500`}
                fontWeight="semibold"
              >
                {getProjectHealthRating(data.projectStatusPercentage)}
              </Text>
            </HStack>

            {/* Progress & Team Row */}
            <HStack spacing={4} align="start">
              {/* Progress */}
              <VStack spacing={2} align="start" flex="1">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    Progress
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={`${getProgressColor(
                      data.projectStatusPercentage
                    )}.500`}
                  >
                    {data.projectStatusPercentage}%
                  </Text>
                </HStack>
                <Progress
                  value={data.projectStatusPercentage}
                  colorScheme={getProgressColor(data.projectStatusPercentage)}
                  rounded="full"
                  size="sm"
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  w="full"
                />
              </VStack>

              {/* Team */}
              <VStack spacing={2} align="end" minW="80px">
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  Team
                </Text>
                <AvatarGroup size="xs" max={3} spacing="-4px">
                  {data.userAssignment?.map((user, idx) => (
                    <Avatar
                      key={idx}
                      name={user.userData?.nama || "Unknown"}
                      size="xs"
                      border="1px"
                      borderColor={colorMode === "light" ? "white" : "gray.800"}
                    />
                  )) || []}
                </AvatarGroup>
              </VStack>
            </HStack>

            {/* Action Button */}
            <Box mt="auto">
              <Link href={config.linkPath} style={{ width: "100%" }}>
                <Button
                  size="sm"
                  colorScheme={config.colorScheme}
                  leftIcon={<Icon as={config.actionIcon} />}
                  w="full"
                  rounded="lg"
                  fontWeight="500"
                  h="40px"
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  {config.actionLabel}
                </Button>
              </Link>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    );
  }
);

CardProjectDeployment.displayName = "CardProjectDeployment";

export default CardProjectDeployment;
