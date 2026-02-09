"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  HStack,
  VStack,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";

interface RequirementWorkProgramSectionProps {
  DataProject: ProjectDataResponse;
}

export const RequirementWorkProgramSection = ({ DataProject }: RequirementWorkProgramSectionProps) => {
  const { colorMode } = useColorMode();

  const hasRequirement = DataProject.requirementData;

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "pink.50" : "pink.900"} roundedTop="xl" py={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, pink.400, pink.600)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiFileText size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "pink.700" : "pink.200"}>
            Requirement Information
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        {!hasRequirement ? (
          <Box textAlign="center" py={8}>
            <Text color={colorMode === "light" ? "gray.500" : "gray.400"}>
              No requirement data available
            </Text>
          </Box>
        ) : (
          <Box
            p={4}
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
            rounded="lg"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    Requirement Number
                  </Text>
                  <Text fontWeight="bold" fontSize="md">
                    {hasRequirement?.reqNumber}
                  </Text>
                </VStack>
                <Badge colorScheme="purple" variant="solid" fontSize="sm">
                  {hasRequirement?.requirementType}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    Status
                  </Text>
                  <Badge colorScheme="green" variant="solid">
                    {hasRequirement?.reqStatus || "N/A"}
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};
