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
import { BsLightningChargeFill } from "react-icons/bs";

interface WorkStagesSectionProps {
  DataProject: ProjectDataResponse;
}

export const WorkStagesSection = ({ DataProject }: WorkStagesSectionProps) => {
  const { colorMode } = useColorMode();

  // Filter non-procurement workflows
  const workStages = DataProject.projectWorkflowData?.filter(
    wf => wf.wfCategoryCode !== "PROCUREMENT"
  ) || [];

  if (workStages.length === 0) {
    return null;
  }

  const renderWorkflowLevel = (workflows: any[], level: number = 0) => {
    if (level >= 3) return null;

    return workflows.map((workflow) => (
      <Box key={workflow.id} w="full" ml={level * 4}>
        <HStack spacing={2} py={1}>
          <Icon
            as={FiCheckSquare}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            boxSize={5}
          />
          <Text
            fontWeight={level === 0 ? "bold" : "normal"}
            color={level === 0 ? (colorMode === "light" ? "blue.600" : "blue.300") : "inherit"}
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
      <CardHeader bg={colorMode === "light" ? "blue.50" : "blue.900"} roundedTop="xl" py={4}>
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
            <BsLightningChargeFill size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "blue.700" : "blue.200"}>
            Work Stages
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack align="stretch" spacing={2}>
          {renderWorkflowLevel(workStages)}
        </VStack>
      </CardBody>
    </Card>
  );
};
