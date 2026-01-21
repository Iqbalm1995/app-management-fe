"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  SimpleGrid,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { FiInfo, FiCalendar, FiUsers } from "react-icons/fi";

interface ProjectInfoPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const ProjectInfoPreview = ({ DataProject }: ProjectInfoPreviewProps) => {
  const { colorMode } = useColorMode();

  if (!DataProject) {
    return (
      <Card shadow="md" rounded={radiusStyle}>
        <CardBody p={12}>
          <Text color="gray.500" textAlign="center">No project data available</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={colorMode === "light" ? "gray.800" : "white"}>
        Project Information
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Basic Information */}
        <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="blue.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, blue.400, blue.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiInfo size={20} color="white" />
              </Box>
              <Heading size="md" color="blue.700">
                Basic Information
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Project Number:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {DataProject.projectNo || "N/A"}
                </Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Project Code:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.projectCode || "N/A"}
                </Text>
              </HStack>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Project Name:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.projectName}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Description:
                </Text>
                <Text fontSize="sm">
                  {DataProject.projectDesc || "No description"}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Status & Category */}
        <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="green.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, green.400, green.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiCalendar size={20} color="white" />
              </Box>
              <Heading size="md" color="green.700">
                Status & Category
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Status:
                </Text>
                <Badge
                  colorScheme={
                    DataProject.projectStatus === "RUNNING"
                      ? "green"
                      : DataProject.projectStatus === "COMPLETED"
                      ? "blue"
                      : "orange"
                  }
                >
                  {DataProject.projectStatus}
                </Badge>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Category:
                </Text>
                <Badge colorScheme="purple">{DataProject.projectCategory}</Badge>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Type:
                </Text>
                <Badge colorScheme="cyan">{DataProject.projectType}</Badge>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Progress:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">
                  {DataProject.projectStatusPercentage}%
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Organization */}
        <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="purple.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, purple.400, purple.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiUsers size={20} color="white" />
              </Box>
              <Heading size="md" color="purple.700">
                Organization
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Owner Directorate:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.proOwnerDirectorateName || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Owner Division:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.proOwnerDivisionName || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Owner Group:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.proOwnerGroupName || "N/A"}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Characteristics */}
        <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="orange.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, orange.400, orange.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiInfo size={20} color="white" />
              </Box>
              <Heading size="md" color="orange.700">
                Characteristics
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Characteristic:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.projectCharasteristicName || "N/A"}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                  Sub-Characteristic:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {DataProject.projectSubCharasteristicName || "N/A"}
                </Text>
              </Box>
              {DataProject.projectSubCharasteristicDesc && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                      Description:
                    </Text>
                    <Text fontSize="sm">
                      {DataProject.projectSubCharasteristicDesc}
                    </Text>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default ProjectInfoPreview;
