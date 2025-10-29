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
import { getStatusColor } from "@/app/utils/statusUtils";
import { StatusBadge } from "@/app/components/StatusBadge";
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

interface CardProjectProps {
  data: ProjectDataResponse;
  variant?: "manager" | "development" | "procurement" | "deployment";
  linkPath?: string;
  actionLabel?: string;
  actionIcon?: any;
}

const CardProject = memo(
  ({
    data,
    variant = "development",
    linkPath,
    actionLabel,
    actionIcon,
  }: CardProjectProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { colorMode } = useColorMode();

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
              linkPath || `projects-manager/manage?projectId=${data.id}`,
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
        h="480px"
        minH="480px"
        maxH="480px"
        bg={useColorModeValue("white", "gray.800")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        rounded="2xl"
        shadow={isHovered ? "2xl" : "lg"}
        transition="all 0.3s ease"
        // transform={isHovered ? "translateY(-8px)" : "translateY(0)"}
        _hover={{
          cursor: "pointer",
          // borderColor: variant === "manager" ? "blue.300" : "secondary.300",
        }}
        overflow="hidden"
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {/* Header with App Icon and Status */}
        <CardHeader
          p={0}
          position="relative"
          // bgGradient={
          //   variant === "manager"
          //     ? "linear(to-br, teal.700, teal.400)"
          //     : "linear(to-br, secondary.700, secondary.400)"
          // }
          bgGradient={"linear(to-br, secondary.700, secondary.400)"}
          color="white"
          h="200px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* App Icon */}
          <VStack spacing={3} position="relative" zIndex={1}>
            <Box
              w={"60px"}
              h={"60px"}
              bg="whiteAlpha.200"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="3xl"
              fontWeight="bold"
              border="2px"
              borderColor="whiteAlpha.300"
            >
              {data.appsProject?.appShortName?.charAt(0) ||
                data.appsProject?.appName?.charAt(0) ||
                data.projectName.charAt(0)}
            </Box>
            <VStack spacing={0} align="center">
              <Text
                fontSize="sm"
                fontWeight="bold"
                opacity="0.9"
                textAlign="center"
              >
                {data.appsProject?.appName}
              </Text>
              <Text
                fontSize="xs"
                fontWeight="medium"
                opacity="0.8"
                textAlign="center"
              >
                {data.projectType} | {data.projectCategory}
              </Text>
            </VStack>
          </VStack>

          {/* Status Badge */}
          {/* <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme={getStatusColor(data.projectStatus)}
            rounded="full"
            px={2}
            py={1}
            fontSize="xs"
            fontWeight="bold"
          >
            {data.projectStatus}
          </Badge> */}
        </CardHeader>

        {/* Card Body */}
        <CardBody p={6} flex="1" display="flex" flexDirection="column">
          <VStack spacing={4} align="stretch" flex="1">
            {/* Project Info */}
            <VStack spacing={2} align="start">
              <HStack spacing={2} w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  #{data.projectNo || data.projectCode}
                </Text>
                <HStack spacing={1}>
                  <Icon as={FiActivity} size="12px" color="gray.400" />
                  <Text fontSize="xs" color="gray.500">
                    {getProjectHealthRating(data.projectStatusPercentage)}
                  </Text>
                </HStack>
              </HStack>

              <Tooltip
                label={data.projectName}
                hasArrow
                placement="top"
                isDisabled={data.projectName.length <= 45}
              >
                <Heading
                  size="md"
                  color={useColorModeValue("gray.800", "white")}
                  noOfLines={2}
                  minH="48px"
                  maxH="48px"
                  display="flex"
                  alignItems="start"
                  lineHeight="1.3"
                  overflow="hidden"
                >
                  {data.projectName}
                </Heading>
              </Tooltip>

              {/* App Name - Show if different from project name */}
              {/* {data.appsProject?.appName &&
                data.appsProject?.appName !== data.projectName && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    App: {data.appsProject?.appName}
                  </Text>
                )} */}
            </VStack>

            {/* Progress Section */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Progress
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
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
                size="md"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </VStack>

            {/* Team Section */}
            <VStack spacing={1} align="stretch" flex="1">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiUsers} size="14px" color="gray.500" />
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Team
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {data.userAssignment?.length || 0} members
                </Text>
              </HStack>

              <HStack justify="space-between" align="center">
                <AvatarGroup size="xs" max={4} spacing="-6px">
                  {data.userAssignment?.map((user, idx) => (
                    <Avatar
                      key={idx}
                      name={user.userData?.nama || "Unknown"}
                      size="xs"
                      border="1px"
                      borderColor={useColorModeValue("white", "gray.800")}
                    />
                  )) || []}
                </AvatarGroup>

                {data.userAssignment && data.userAssignment.length > 4 && (
                  <Text fontSize="xs" color="gray.500">
                    +{data.userAssignment.length - 4} more
                  </Text>
                )}
              </HStack>
            </VStack>

            {/* Quick Actions - Always at bottom */}
            <Box mt="auto">
              <Link href={config.linkPath} style={{ width: "100%" }}>
                <Button
                  size="md"
                  colorScheme={config.colorScheme}
                  leftIcon={<Icon as={config.actionIcon} />}
                  w="full"
                  rounded="lg"
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                  fontWeight="bold"
                  // bgGradient={
                  //   variant === "manager"
                  //     ? "linear(to-r, teal.700, teal.400)"
                  //     : "linear(to-r, secondary.700, secondary.400)"
                  // }
                >
                  {config.actionLabel}
                </Button>
              </Link>
            </Box>
          </VStack>
        </CardBody>

        {/* Hover Overlay */}
        {isHovered && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg={
              variant === "manager"
                ? "blue.500"
                : variant === "procurement"
                ? "yellow.500"
                : variant === "deployment"
                ? "green.500"
                : "secondary.500"
            }
            opacity="0.05"
            rounded="2xl"
            pointerEvents="none"
          />
        )}
      </Card>
    );
  }
);

CardProject.displayName = "CardProject";

export default CardProject;
