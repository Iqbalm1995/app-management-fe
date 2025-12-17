"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Text,
  useColorMode,
} from "@chakra-ui/react";
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
import { WorkflowBacklogBox } from "../projectFeaturesView";

interface WorkflowProgressionContentProps {
  DataProject: ProjectDataResponse;
  refreshTrigger: number;
}

const WorkflowProgressionContent = ({
  DataProject,
  refreshTrigger,
}: WorkflowProgressionContentProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListProjectWorkflowBacklog } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [DataWorkflow, setDataWorkflow] = useState<
    ProjectWorkflowResponse[] | null
  >(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

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

  useEffect(() => {
    if (DataAuth && DataProject) {
      setIsLoadingProcess(true);
      const GetWorkflowData = async () => {
        const requestData = await ListProjectWorkflowBacklog(
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

          setDataWorkflow(workflowData);
          setIsLoadingProcess(false);
        }
      };
      GetWorkflowData();
    }
  }, [DataAuth, refreshTrigger, DataProject, tokenData]);

  const handleRefresh = () => {
    // Trigger refresh
    if (DataAuth && DataProject) {
      setIsLoadingProcess(true);
      const GetWorkflowData = async () => {
        const requestData = await ListProjectWorkflowBacklog(
          DataProject.id,
          tokenData
        );
        if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
          setDataWorkflow(requestData.data as ProjectWorkflowResponse[]);
        }
        setIsLoadingProcess(false);
      };
      GetWorkflowData();
    }
  };

  return (
    <>
      {IsLoadingProcess ? (
        <Box textAlign="center" py={12}>
          <LoadingMiniSignature />
          <Text mt={4} color="gray.500">
            Loading workflow progression...
          </Text>
        </Box>
      ) : DataWorkflow && DataWorkflow.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {DataWorkflow.map((workflow: ProjectWorkflowResponse) => (
            <WorkflowBacklogBox
              key={workflow.id}
              workflow={workflow}
              onRefresh={handleRefresh}
              level={1}
              DataProject={DataProject}
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
            No workflow progression data available
          </Text>
        </Box>
      )}
    </>
  );
};

export default WorkflowProgressionContent;
