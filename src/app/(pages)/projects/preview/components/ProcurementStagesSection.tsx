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
  Icon,
} from "@chakra-ui/react";
import { FiCheckSquare } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";

interface ProcurementStagesSectionProps {
  DataProject: ProjectDataResponse;
}

export const ProcurementStagesSection = ({ DataProject }: ProcurementStagesSectionProps) => {
  const { colorMode } = useColorMode();

  // Only show for procurement projects
  if (DataProject.projectType !== "PROCUREMENT") {
    return null;
  }

  // Filter procurement workflows (category PROCUREMENT)
  const procurementWorkflows = DataProject.projectWorkflowData?.filter(
    wf => wf.wfCategoryCode === "PROCUREMENT"
  ) || [];

  if (procurementWorkflows.length === 0) {
    return null;
  }

  const renderWorkflowLevel = (workflows: any[], level: number = 0) => {
    if (level >= 3) return null;

    return workflows.map((workflow) => (
      <Box key={workflow.id} w="full" ml={level * 4}>
        <HStack spacing={2} py={1}>
          <Icon
            as={FiCheckSquare}
            color={colorMode === "light" ? "teal.500" : "teal.300"}
            boxSize={5}
          />
          <Text
            fontWeight={level === 0 ? "bold" : "normal"}
            color={level === 0 ? (colorMode === "light" ? "teal.600" : "teal.300") : "inherit"}
            fontSize={level === 0 ? "md" : "sm"}
          >
            {workflow.wfgName}
          </Text>
        </HStack>
        {workflow.workflowChild?.length > 0 && (
          <VStack align="start" spacing={1} mt={level === 0 ? 2 : 1}>
            {renderWorkflowLevel(workflow.workflowChild, level + 1)}
          </VStack>
        )}
      </Box>
    ));
  };

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "teal.50" : "teal.900"} roundedTop="xl" py={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, teal.400, teal.600)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaShoppingCart size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "teal.700" : "teal.200"}>
            Procurement Stages
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack align="stretch" spacing={2}>
          {renderWorkflowLevel(procurementWorkflows)}
        </VStack>
      </CardBody>
    </Card>
  );
};
