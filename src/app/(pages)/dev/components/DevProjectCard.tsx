"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorMode,
  Flex,
} from "@chakra-ui/react";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { FiFolder } from "react-icons/fi";

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
      borderRadius="xl"
      p={5}
      bg={isDark ? "gray.900" : "white"}
      border="1px solid"
      borderColor={isDark ? "gray.800" : "gray.200"}
      transition="all 0.15s ease-in-out"
      _hover={{
        borderColor: isDark ? "purple.400" : "purple.500",
        transform: "translateY(-2px)",
        boxShadow: isDark
          ? "0 4px 12px rgba(0,0,0,0.5)"
          : "0 4px 12px rgba(0,0,0,0.06)",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      onClick={() => onClick(project)}
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minH="160px"
    >
      <VStack align="start" spacing={3} w="full">
        <HStack justify="space-between" w="full">
          <HStack spacing={2.5}>
            <Flex
              w="32px"
              h="32px"
              borderRadius="lg"
              bg={isDark ? "purple.950" : "purple.50"}
              border="1px solid"
              borderColor={isDark ? "purple.800" : "purple.200"}
              align="center"
              justify="center"
              color={isDark ? "purple.300" : "purple.600"}
            >
              <FiFolder size={16} />
            </Flex>
            <Text
              fontFamily="mono"
              fontSize="xs"
              fontWeight={600}
              color={isDark ? "gray.400" : "gray.500"}
              letterSpacing="0.04em"
            >
              {project.projectNo || "PROJ-UNASSIGNED"}
            </Text>
          </HStack>

          <Badge
            variant="subtle"
            colorScheme={statusColor}
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="md"
            textTransform="uppercase"
            letterSpacing="0.02em"
          >
            {project.projectStatus || "UNKNOWN"}
          </Badge>
        </HStack>

        <Box w="full">
          <Text
            fontWeight={600}
            fontSize="md"
            color={isDark ? "gray.100" : "gray.800"}
            noOfLines={2}
            lineHeight="short"
          >
            {project.projectName}
          </Text>
          {project.projectDesc && (
            <Text
              fontSize="xs"
              color={isDark ? "gray.400" : "gray.600"}
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
        borderColor={isDark ? "gray.850" : "gray.100"}
        fontSize="xs"
        color={isDark ? "gray.400" : "gray.500"}
      >
        <Text noOfLines={1} maxW="60%">
          {project.proManageByTeamName || "Dev Team"}
        </Text>
        <Text fontFamily="mono" fontSize="2xs">
          Select →
        </Text>
      </HStack>
    </Box>
  );
};

export default DevProjectCard;
