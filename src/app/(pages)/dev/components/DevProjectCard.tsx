"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { FiFolder } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface DevProjectCardProps {
  project: ProjectDataResponse;
  onClick: (project: ProjectDataResponse) => void;
}

const statusColorMap: Record<string, string> = {
  RUNNING: "green",
  INITIATING: "blue",
  "ON HOLD": "orange",
  "TEMPORARY CLOSED": "yellow",
  COMPLETED: "teal",
  CANCELED: "red",
};

export const DevProjectCard: React.FC<DevProjectCardProps> = ({
  project,
  onClick,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const statusColor = statusColorMap[project.projectStatus] || "gray";

  return (
    <Box
      as="button"
      type="button"
      w="full"
      textAlign="left"
      borderRadius={radiusStyle}
      p={5}
      bg={isDark ? "rgba(255, 255, 255, 0.03)" : "white"}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "gray.200"}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        borderColor: "purple.500",
        transform: "translateY(-3px)",
        boxShadow: isDark
          ? "0 10px 25px -5px rgba(139, 92, 246, 0.25), 0 0 15px rgba(139, 92, 246, 0.15)"
          : "0 10px 25px -5px rgba(139, 92, 246, 0.15)",
        bg: isDark ? "rgba(255, 255, 255, 0.05)" : "purple.50",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      onClick={() => onClick(project)}
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minH="150px"
    >
      <VStack align="start" spacing={3} w="full">
        <HStack justify="space-between" w="full">
          <HStack spacing={2.5}>
            {/* Color dot/avatar representing project */}
            <Box
              w="10px"
              h="10px"
              borderRadius="full"
              bg={
                project.projectStatus === "RUNNING"
                  ? "emerald.400"
                  : project.projectStatus === "INITIATING"
                  ? "purple.400"
                  : "pink.400"
              }
              boxShadow="0 0 8px currentColor"
            />
            <Text
              fontSize="xs"
              fontWeight={600}
              color={isDark ? "gray.400" : "gray.500"}
              letterSpacing="0.04em"
            >
              #{project.projectNo || "PROJ"}
            </Text>
          </HStack>

          <Badge
            variant="subtle"
            colorScheme={statusColor}
            fontSize="3xs"
            px={2}
            py={0.5}
            borderRadius="md"
            textTransform="uppercase"
            letterSpacing="0.02em"
          >
            {project.projectStatus || "ACTIVE"}
          </Badge>
        </HStack>

        <Box w="full">
          <Text
            fontWeight={700}
            fontSize="md"
            color={isDark ? "white" : "gray.900"}
            noOfLines={2}
            lineHeight="short"
          >
            {project.projectName}
          </Text>
          {project.projectDesc && (
            <Text
              fontSize="xs"
              color={isDark ? "gray.400" : "gray.500"}
              noOfLines={1}
              mt={1}
            >
              {project.projectDesc}
            </Text>
          )}
        </Box>
      </VStack>

      <HStack
        justify="space-between"
        w="full"
        pt={3}
        borderTop="1px solid"
        borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "gray.100"}
        fontSize="xs"
        color={isDark ? "gray.400" : "gray.500"}
      >
        <Text noOfLines={1} maxW="70%">
          {project.proManageByTeamName || "Dev Team"}
        </Text>
        <Text fontSize="xs" color="purple.400" fontWeight={600}>
          Select →
        </Text>
      </HStack>
    </Box>
  );
};

export default DevProjectCard;
