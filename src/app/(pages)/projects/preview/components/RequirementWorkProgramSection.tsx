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
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { FiFileText, FiDollarSign } from "react-icons/fi";

interface RequirementWorkProgramSectionProps {
  DataProject: ProjectDataResponse;
}

export const RequirementWorkProgramSection = ({ DataProject }: RequirementWorkProgramSectionProps) => {
  const { colorMode } = useColorMode();

  const hasRequirement = DataProject.requirementData;
  const hasWorkPrograms = DataProject.workPrograms && DataProject.workPrograms.length > 0;

  if (!hasRequirement && !hasWorkPrograms) {
    return null;
  }

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
            Requirements & Work Programs
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Requirement Data */}
          {hasRequirement && DataProject.requirementData && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
                Requirement Information
              </Text>
              <Box
                p={4}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                rounded="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
              >
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold">
                      {DataProject.requirementData.reqNumber}
                    </Text>
                    <Badge colorScheme="purple" fontSize="xs">
                      {DataProject.requirementData.requirementType}
                    </Badge>
                  </HStack>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Status</Text>
                    <Badge colorScheme="green" fontSize="xs" mt={1}>
                      {DataProject.requirementData.reqStatus || "N/A"}
                    </Badge>
                  </Box>
                </VStack>
              </Box>
            </Box>
          )}

          {/* Work Programs */}
          {hasWorkPrograms && (
            <>
              {hasRequirement && <Divider />}
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
                  Work Programs
                </Text>
                <VStack spacing={3} align="stretch">
                  {DataProject.workPrograms.map((workProgram, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg={colorMode === "light" ? "gray.50" : "gray.700"}
                      rounded="lg"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="bold">
                            {workProgram.workProgramName || "Work Program"}
                          </Text>
                          <Badge colorScheme="blue" fontSize="xs">
                            {workProgram.workProgramCode || "N/A"}
                          </Badge>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <VStack spacing={1} align="start">
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                              Budget:
                            </Text>
                            <HStack spacing={1}>
                              <FiDollarSign size={14} color="green" />
                              <Text fontSize="sm" fontWeight="bold" color="green.600">
                                {workProgram.workProgramBudget
                                  ? `Rp ${workProgram.workProgramBudget.toLocaleString()}`
                                  : "Not specified"}
                              </Text>
                            </HStack>
                          </VStack>

                          <VStack spacing={1} align="start">
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                              Division:
                            </Text>
                            <Text fontSize="sm">
                              {workProgram.divisionName || "Not assigned"}
                            </Text>
                          </VStack>

                          <VStack spacing={1} align="start">
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                              Source:
                            </Text>
                            <Text fontSize="sm">
                              {workProgram.workProgramSource || "Not specified"}
                            </Text>
                          </VStack>
                        </SimpleGrid>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
