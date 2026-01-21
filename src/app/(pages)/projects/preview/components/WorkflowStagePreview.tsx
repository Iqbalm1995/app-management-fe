"use client";

import { useEffect, useState } from "react";
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
import { FiPlayCircle, FiCheckCircle, FiClock } from "react-icons/fi";

interface WorkflowStagePreviewProps {
  DataProject: ProjectDataResponse | null;
}

const WorkflowStagePreview = ({ DataProject }: WorkflowStagePreviewProps) => {
  const { colorMode } = useColorMode();

  const workflows = DataProject?.projectWorkflowData || [];

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
            Procurement Workflow Stages
          </Heading>
          <Text fontSize="sm" color="gray.500">
            View procurement workflow progress
          </Text>
        </VStack>
        <Badge colorScheme="green" fontSize="md" px={3} py={1}>
          {workflows.length} Workflows
        </Badge>
      </HStack>

      {workflows.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {workflows.map((workflow, index) => (
            <Card
              key={workflow.id}
              shadow="md"
              rounded={radiusStyle}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold">
                      {workflow.wfgName || `Workflow ${index + 1}`}
                    </Text>
                    <Badge colorScheme="blue" size="sm">
                      Level {workflow.wfgLevel}
                    </Badge>
                  </HStack>

                  {workflow.wfgDesc && (
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {workflow.wfgDesc}
                    </Text>
                  )}

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Category: {workflow.wfCategoryName}
                    </Text>
                  </Box>

                  {workflow.workflowValues && workflow.workflowValues.length > 0 && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Documents: {workflow.workflowValues.length}
                      </Text>
                    </Box>
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
              <FiPlayCircle size={48} color="gray" />
              <Text color="gray.500" fontSize="lg">No workflow stages found</Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                This project doesn't have workflow stages configured
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default WorkflowStagePreview;
