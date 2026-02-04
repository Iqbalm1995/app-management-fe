"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import useRequirements, { BacklogDataResponse } from "@/app/services/useRequirements";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Box,
  Card,
  CardBody,
  useColorMode,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProjectInfoPreview from "./components/ProjectInfoPreview";

interface ProjectPreviewViewProps {
  projectId?: string;
  approvalMode?: boolean;
}

export default function ProjectPreviewView({
  projectId: propProjectId,
  approvalMode: propApprovalMode,
}: ProjectPreviewViewProps = {}) {
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const [isInitialized, setIsInitialized] = useState(false);
  const approvalMode = propApprovalMode ?? searchParams.get("approvalMode") === "true";

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { 
    GetDetailById, 
    GetDetailAppsByProjectId, 
    CanApproveProject, 
    ApproveProject,
    GetProjectStatusHistory,
    ListProjectWorkflowBacklog,
    GetProjectBacklogStats,
    GetProjectMembers
  } = useProjects();
  const { ListBacklog } = useRequirements();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [workflowBacklogs, setWorkflowBacklogs] = useState<any[]>([]);
  const [backlogStats, setBacklogStats] = useState<any>(null);
  const [backlogList, setBacklogList] = useState<BacklogDataResponse[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectUserAssignmentResponse[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  useEffect(() => {
    const id = propProjectId || searchParams.get("projectId");
    if (id) {
      setProjectId(id);
    }
  }, [searchParams, propProjectId]);

  useEffect(() => {
    const initializeComponent = async () => {
      await delay(3000);
      if (searchParams && (DataAuth || localStorage.getItem("authData"))) {
        setIsInitialized(true);
      }
    };
    initializeComponent();
  }, [searchParams, DataAuth]);

  useEffect(() => {
    if (DataAuth && projectId && isInitialized) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        if (requestData.data == null) {
          showToast({
            description: "Data return error",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        const itemsData: ProjectDataResponse =
          requestData.data as ProjectDataResponse;
        setDataProject(itemsData);
        setIsLoadingProcess(false);
      };
      GetDataList();
    }
  }, [DataAuth, projectId, isInitialized]);

  useEffect(() => {
    if (DataAuth && DataProject && !DataApps && isInitialized) {
      const GetAppData = async () => {
        const requestData = await GetDetailAppsByProjectId(
          DataProject.id,
          tokenData
        );
        if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
          setDataApps(requestData.data as AppsResponse);
        }
      };
      GetAppData();
    }
  }, [DataAuth, DataProject, DataApps, isInitialized]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData) {
      const CheckCanApprove = async () => {
        const response = await CanApproveProject(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setCanApprove(true);
        }
      };
      CheckCanApprove();
    }
  }, [DataAuth, projectId, tokenData]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData && isInitialized) {
      const LoadStatusHistory = async () => {
        const response = await GetProjectStatusHistory(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setStatusHistory(response.data);
        }
      };
      LoadStatusHistory();
    }
  }, [DataAuth, projectId, tokenData, isInitialized]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData && isInitialized) {
      const LoadWorkflowBacklogs = async () => {
        const response = await ListProjectWorkflowBacklog(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setWorkflowBacklogs(response.data);
        }
      };
      LoadWorkflowBacklogs();
    }
  }, [DataAuth, projectId, tokenData, isInitialized]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData && isInitialized) {
      const LoadBacklogStats = async () => {
        const response = await GetProjectBacklogStats(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setBacklogStats(response.data);
        }
      };
      LoadBacklogStats();
    }
  }, [DataAuth, projectId, tokenData, isInitialized]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData && isInitialized) {
      const LoadBacklogList = async () => {
        const payload: PaggingListPayload = {
          search: "",
          page: 0,
          limit: 1000,
          filterWhere: [
            {
              field: "projectId",
              operator: "=",
              value: projectId,
            },
          ],
          fieldOrder: ["createdAt"],
          orderDir: "asc",
        };
        const response = await ListBacklog(payload, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setBacklogList(response.data);
        }
      };
      LoadBacklogList();
    }
  }, [DataAuth, projectId, tokenData, isInitialized]);

  useEffect(() => {
    if (DataAuth && projectId && tokenData && isInitialized) {
      const LoadProjectMembers = async () => {
        const response = await GetProjectMembers(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setProjectMembers(response.data);
        }
      };
      LoadProjectMembers();
    }
  }, [DataAuth, projectId, tokenData, isInitialized]);

  const isInternalDev =
    DataProject?.projectType === PROJECT_TYPE_INTERNAL_DEVELOPMENT;
  const isProcurement = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT;
  const hasRequirement = DataProject?.reqParentId !== null;
  const showFeaturesTab = isInternalDev || (isProcurement && hasRequirement);
  const showWorkstageTab = isProcurement;

  if (!isInitialized) {
    return (
      <LayoutAdmin>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="80vh"
        >
          <VStack spacing={6}>
            <LoadingMiniSquare />
            <VStack spacing={2}>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
              >
                Loading Project Preview
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "light" ? "gray.500" : "gray.500"}
              >
                Please wait while we prepare the project details...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <Box w="full" px={{ base: 4, md: 6 }} py={6}>
        <Suspense fallback={<LoadingMiniSquare />}>
          <ProjectInfoPreview 
            DataProject={DataProject}
            DataApps={DataApps}
            statusHistory={statusHistory}
            workflowBacklogs={workflowBacklogs}
            backlogStats={backlogStats}
            backlogList={backlogList}
            projectMembers={projectMembers}
            canApprove={canApprove}
            approvalMode={approvalMode}
            onApprove={async (isApproved: boolean, note?: string) => {
              if (!projectId) return;
              const response = await ApproveProject(
                { projectId, isApproved, note },
                tokenData
              );
              if (response?.statusCode === RES_CODE_OK) {
                showToast({
                  description: response.message || "Action completed",
                  statusToast: "success",
                });
                // Redirect back to pending approve list
                setTimeout(() => {
                  router.push("/projects/pending-approve");
                }, 1500);
              } else {
                showToast({
                  description: response?.message || "Action failed",
                  statusToast: "error",
                });
              }
            }}
          />
        </Suspense>
      </Box>
    </LayoutAdmin>
  );
}
