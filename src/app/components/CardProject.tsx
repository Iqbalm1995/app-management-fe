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
            linkPath: "/projects/manage",
            actionLabel: "Manage Deployment",
            actionIcon: FiServer,
            colorScheme: "green",
          };
        case "procurement":
          return {
            linkPath: "/projects/manage",
            actionLabel: "Manage Procurement",
            actionIcon: FiTarget,
            colorScheme: "yellow",
          };
        case "manager":
          return {
            linkPath: linkPath || `projects/manage?projectId=${data.id}`,
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
      <Link href={config.linkPath} style={{ width: "100%" }}>
        <Card
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          w="full"
          h="300px"
          minH="300px"
          maxH="300px"
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
          {/* Card Body */}
          <CardBody p={2}>
            <Flex as={Stack}>
              <Flex
                as={Stack}
                w={"full"}
                h={"60px"}
                alignItems={"center"}
                justifyContent={"start"}
                p={2}
                boxShadow={"md"}
                rounded={radiusStyle}
                bgGradient={
                  colorMode == "light"
                    ? "linear(to-br, secondary.700, secondary.400)"
                    : "linear(to-br, secondary.900, secondary.600)"
                }
                color="white"
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  {/* Icon Inititals */}
                  <Box
                    w={"40px"}
                    h={"40px"}
                    bg="whiteAlpha.200"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="smaller"
                    fontWeight="bold"
                    border="2px"
                    borderColor="whiteAlpha.300"
                  >
                    {data.appsProject?.appShortName || "N/A"}
                  </Box>
                  <Flex as={Stack} spacing={1} px={2}>
                    <Text
                      fontSize="xx-small"
                      textAlign={"end"}
                      lineHeight={1}
                      fontStyle={"italic"}
                    >
                      App Name
                    </Text>
                    <Text
                      fontSize="smaller"
                      textAlign={"end"}
                      lineHeight={1}
                      fontWeight={"bold"}
                    >
                      {data.appsProject?.appName || "- NO APPS REGISTEREED"}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <VStack spacing={1} align="stretch" flex="1" px={2} py={2}>
                {/* Project Identifier */}
                <Flex
                  as={HStack}
                  w={"full"}
                  h={"43px"}
                  justifyContent="space-between"
                  alignItems={"start"}
                >
                  <Text fontSize="smaller" color="gray.500" fontWeight="medium">
                    {data.projectNo}
                  </Text>
                  <HStack spacing={1}>
                    <Icon as={FiActivity} size="12px" color="gray.500" />
                    <Text fontSize="xs" color="gray.500">
                      {getProjectHealthRating(data.projectStatusPercentage)}
                    </Text>
                  </HStack>
                </Flex>

                {/* Project Info */}
                <VStack spacing={0} align="start">
                  <Text
                    fontSize="x-small"
                    fontWeight="medium"
                    opacity="0.8"
                    textAlign="center"
                    color={"secondary.500"}
                  >
                    {data.projectType}
                  </Text>

                  <Tooltip
                    label={data.projectName}
                    hasArrow
                    placement="top"
                    isDisabled={data.projectName.length <= 45}
                    rounded={radiusStyle}
                  >
                    <Heading
                      size="sm"
                      color={useColorModeValue("gray.800", "white")}
                      noOfLines={2}
                      minH="48px"
                      maxH="48px"
                      display="flex"
                      alignItems="start"
                      lineHeight="1.3"
                      overflow="hidden"
                    >
                      {truncateText(data.projectName, 45)}
                    </Heading>
                  </Tooltip>
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
                    size="sm"
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

                  <HStack justify="space-between" w={"full"}>
                    {data.userAssignment == null ||
                    data.userAssignment.length <= 0 ? (
                      <Flex w={"full"}>
                        <Text
                          fontSize="x-small"
                          color="gray.400"
                          fontStyle={"italic"}
                          textAlign={"left"}
                        >
                          {"- No Member Assign"}
                        </Text>
                      </Flex>
                    ) : (
                      <AvatarGroup size="2xs" max={4} spacing="-6px">
                        {data.userAssignment?.map((user, idx) => (
                          <Avatar
                            key={idx}
                            name={user.userData?.nama || "Unknown"}
                          />
                        )) || []}
                      </AvatarGroup>
                    )}

                    <Flex w={"full"} justifyContent={"end"}>
                      <StatusBadge
                        status={data.projectStatus}
                        variant="subtle"
                        fontSize={"x-small"}
                        rounded={radiusStyle}
                      />
                    </Flex>
                  </HStack>
                </VStack>
              </VStack>
            </Flex>
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
      </Link>
    );
  }
);

CardProject.displayName = "CardProject";

export default CardProject;
