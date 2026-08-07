"use client";

import { useState, useEffect } from "react";
import { VStack, Box, Text, useColorMode } from "@chakra-ui/react";
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

interface WorkflowDocumentationContentProps {
  DataProject: ProjectDataResponse;
  refreshTrigger: number;
  onParentRefresh?: () => void;
}

const WorkflowDocumentationContent = ({
  DataProject,
  refreshTrigger,
  onParentRefresh,
}: WorkflowDocumentationContentProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListProjectWorkflowBacklog } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [DataWorkflow, setDataWorkflow] = useState<
    ProjectWorkflowResponse[] | null
  >(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
    if (onParentRefresh) onParentRefresh();
  };

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
  }, [DataAuth, RefreshData, refreshTrigger, DataProject, tokenData]);

  return (
    <>
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
    </>
  );
};

export default WorkflowDocumentationContent;
