"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  Box,
  useColorMode,
  Progress,
  SimpleGrid,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { FiFileText, FiCheckCircle } from "react-icons/fi";

interface DocumentationListPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const DocumentationListPreview = ({ DataProject }: DocumentationListPreviewProps) => {
  const { colorMode } = useColorMode();

  const workflows = DataProject?.projectWorkflowProjectData || [];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "green";
      case "IN_PROGRESS": return "blue";
      case "PENDING": return "orange";
      default: return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={colorMode === "light" ? "gray.800" : "white"}>
            Work Documentation
          </Heading>
          <Text fontSize="sm" color="gray.500">
            View project documentation and workflows
          </Text>
        </VStack>
        <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
          {workflows.length} Documents
        </Badge>
      </HStack>

      {workflows.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {workflows.map((workflow, index) => (
            <Card
              key={workflow.id}
              shadow="md"
              rounded={radiusStyle}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Badge colorScheme="purple" size="sm">
                      Level {workflow.wfgLevel}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      #{index + 1}
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={2}>
                      {workflow.wfgName || `Documentation ${index + 1}`}
                    </Text>
                    {workflow.wfgDesc && (
                      <Text fontSize="xs" color="gray.500" noOfLines={2}>
                        {workflow.wfgDesc}
                      </Text>
                    )}
                  </VStack>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Category: {workflow.wfCategoryName}
                    </Text>
                  </Box>

                  {workflow.workflowValues && workflow.workflowValues.length > 0 && (
                    <HStack justify="space-between" fontSize="xs">
                      <HStack color="gray.500">
                        <FiCheckCircle size={12} />
                        <Text>Documents:</Text>
                      </HStack>
                      <Text fontWeight="medium">
                        {workflow.workflowValues.length}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card shadow="md" rounded={radiusStyle} border="1px" borderColor="gray.200">
          <CardBody p={12}>
            <VStack spacing={4}>
              <FiFileText size={48} color="gray" />
              <Text color="gray.500" fontSize="lg">No documentation found</Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                This project doesn't have documentation workflows yet
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default DocumentationListPreview;
