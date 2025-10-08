"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Box,
  useColorMode,
  Flex,
  Progress,
  StackDivider,
} from "@chakra-ui/react";
import { FiRefreshCcw } from "react-icons/fi";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectWorkflowResponse,
} from "@/app/services/useProjects";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { DynamicWorkflowBox } from "./WorkflowComponents";
import { colorProgression } from "@/app/helper/MasterHelper";

interface ProjectDocumentationSectionProps {
  DataProject: ProjectDataResponse | null;
}

const ProjectDocumentationSection = ({
  DataProject,
}: ProjectDocumentationSectionProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListProjectWorkflow } = useProjects();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [DataWorkflow, setDataWorkflow] = useState<
    ProjectWorkflowResponse[] | null
  >(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Overall Progression State
  const [OverallProgress, setOverallProgress] = useState<number>(0);
  const [TotalLeafNodes, setTotalLeafNodes] = useState<number>(0);
  const [CompletedLeafNodes, setCompletedLeafNodes] = useState<number>(0);

  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  // Count all leaf nodes (nodes without children) recursively
  const countLeafNodes = (workflows: ProjectWorkflowResponse[]): { total: number; completed: number } => {
    let totalLeaf = 0;
    let completedLeaf = 0;
    
    workflows.forEach((workflow) => {
      const hasChildren = workflow.workflowChild && workflow.workflowChild.length > 0;
      
      if (!hasChildren) {
        // This is a leaf node - count it
        totalLeaf++;
        if (workflow.workflowValues && workflow.workflowValues.length > 0) {
          completedLeaf++;
        }
      } else {
        // Recursively count children
        const childCounts = countLeafNodes(workflow.workflowChild!);
        totalLeaf += childCounts.total;
        completedLeaf += childCounts.completed;
      }
    });
    
    return { total: totalLeaf, completed: completedLeaf };
  };

  useEffect(() => {
    if (DataAuth && DataProject) {
      setIsLoadingProcess(true);
      const GetWorkflowData = async () => {
        const requestData = await ListProjectWorkflow(
          DataProject.id,
          tokenData
        );
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          if (requestData.data == null) {
            showToast({
              description: "Workflow data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const workflowData: ProjectWorkflowResponse[] =
            requestData.data as ProjectWorkflowResponse[];

          // Calculate overall progression using dynamic leaf nodes
          const leafCounts = countLeafNodes(workflowData);
          const progressPercentage =
            leafCounts.total > 0
              ? Math.round((leafCounts.completed / leafCounts.total) * 100)
              : 0;

          setTotalLeafNodes(leafCounts.total);
          setCompletedLeafNodes(leafCounts.completed);
          setOverallProgress(progressPercentage);
          setDataWorkflow(workflowData);
          setIsLoadingProcess(false);
        }
      };
      GetWorkflowData();
    }
  }, [DataAuth, RefreshData, DataProject, tokenData]);

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Project Documentation
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project documentation as workflow stage project
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
            onClick={RefreshAction}
            isLoading={IsLoadingProcess}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      {/* Overall Progression */}
      {DataWorkflow && DataWorkflow.length > 0 && (
        <VStack
          w="full"
          p={4}
          bg={colorMode === "light" ? "blue.50" : "blue.900"}
          rounded="lg"
          border="1px"
          borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
          spacing={3}
        >
          <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
            <Text fontSize="sm" fontWeight={600}>
              Overall Progression - {OverallProgress}%
            </Text>
            <Text fontSize="sm" fontWeight={500}>
              {CompletedLeafNodes}
              <Text as="span" fontWeight={600} ml={1}>
                / {TotalLeafNodes} Documents Completed
              </Text>
            </Text>
          </HStack>
          <Progress
            colorScheme={colorProgression(OverallProgress)}
            hasStripe
            value={OverallProgress}
            w="full"
            rounded={radiusStyle}
          />
        </VStack>
      )}

      {/* Workflow Content */}
      {IsLoadingProcess ? (
        <Box textAlign="center" py={12}>
          <LoadingMiniSignature />
          <Text mt={4} color="gray.500">
            Loading workflow documentation...
          </Text>
        </Box>
      ) : DataWorkflow && DataWorkflow.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {DataWorkflow.map((workflow: ProjectWorkflowResponse) => (
            <DynamicWorkflowBox
              key={workflow.id}
              workflow={workflow}
              onRefresh={RefreshAction}
              level={1}
            />
          ))}
        </VStack>
      ) : (
        <Box
          p={8}
          textAlign="center"
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
          rounded="lg"
          border="2px dashed"
          borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
        >
          <Text color="gray.500" fontSize="sm">
            No workflow documentation available
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default ProjectDocumentationSection;
