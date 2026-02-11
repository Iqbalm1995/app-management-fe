"use client";

import {
  LocalPrioritiesOptions,
  MAINTENANCE_CATEGORY_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS,
  MAX_SIZE_TABLE,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import useProjects, {
  AppsLogsResponse,
  ProjectBacklogProgressionResponse,
  ProjectDataResponse,
  ProjectFeatureInsertPayload,
  ProjectFeatureResponse,
  ProjectWorkflowBacklogInitializePayload,
  ProjectWorkflowResponse,
} from "@/app/services/useProjects";
import { ApiGenericResponse } from "@/app/types/masterTypes";
import {
  ColumnMetaCustom,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Box,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Spinner,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  StackDivider,
  Switch,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  VStack,
  Wrap,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { ApexOptions } from "apexcharts";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiX,
  FiXCircle,
  FiCheckCircle,
  FiCircle,
  FiLoader,
  FiArchive,
  FiInfo,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import {
  colorProgression,
  DeadlineStatusTag,
  formatDateInputCustom,
  getPriorityFromMatrix,
  getRandomNumber,
  priorityColor,
} from "@/app/helper/MasterHelper";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import { InputLayoutFull } from "@/app/components/layoutContentBody";

import useRequirements, {
  BacklogDataResponse,
  BacklogHistoryDataResponse,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useTasks, { TasksCountResponse } from "@/app/services/useTasks";
import useLogActivityUsers from "@/app/services/useLogActivityUsers";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { HamburgerIcon } from "@chakra-ui/icons";
import { BsKanban } from "react-icons/bs";
import Link from "next/link";
import WorkflowProgressionContent from "./components/WorkflowProgressionContent";
import WorkflowDocumentationContent from "./components/WorkflowDocumentationContent";

interface ProjectFeatureViewProps {
  DataProject: ProjectDataResponse | null;
  viewType?: "backlogs" | "workflow";
}

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

const ProjectFeatureView = ({
  DataProject,
  viewType = "workflow",
}: ProjectFeatureViewProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const {
    GetDetailById: GetReqDetail,
    ListBacklog,
    UpdateBacklogBatch,
  } = useRequirements();

  const { GetProjectBacklogProgression, AssignBacklogsToProject } = useProjects();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ActionLoading, setActionLoading] = useState(false);
  const [RefreshData, setRefreshData] = useState<number>(0);

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

  // if (DataProject == null) {
  //   return (
  //     <Heading as="h4" size="md">
  //       Data Invalid
  //     </Heading>
  //   );
  // }

  // Requirement Data
  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Consolidated refresh action
  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };
  // Load Requirements
  useEffect(() => {
    if (DataAuth && DataProject && DataProject.reqParentId) {
      // LOAD REQ DATA
      const GetDataRequirement = async () => {
        setIsLoadingProcess(true);
        const requestData = await GetReqDetail(
          DataProject.reqParentId || "",
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
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }
          const itemsData: RequirementsResponse =
            requestData.data as RequirementsResponse;
          setDataRequirement(itemsData);
          setIsLoadingProcess(false);
        }
      };

      GetDataRequirement();
    }
  }, [DataAuth, RefreshData, DataProject]);

  return (
    <Flex w={"full"} as={Stack} spacing={6}>
      {DataProject == null ? (
        <Heading as="h4" size="md">
          Data Invalid
        </Heading>
      ) : IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <>
          {/* SECTION FOR TYPE INTERNAL DEVELOPMENT AND HAVE REQUIREMENT DATA */}
          {DataProject.projectType == PROJECT_TYPE_INTERNAL_DEVELOPMENT &&
            DataRequirement && (
              <FeatureBacklogsView
                DataProject={DataProject}
                DataRequirement={DataRequirement}
                onRefresh={RefreshAction}
                refreshTrigger={RefreshData}
              />
            )}

          {/* SECTION FOR TYPE PROCUREMENT */}
          {DataProject.projectType == PROJECT_TYPE_PROCUREMENT && (
            <>
              {viewType === "backlogs" && DataRequirement ? (
                <FeatureBacklogsView
                  DataProject={DataProject}
                  DataRequirement={DataRequirement}
                  onRefresh={RefreshAction}
                  refreshTrigger={RefreshData}
                />
              ) : (
                <WorkFlowBacklogsView
                  DataProject={DataProject}
                  onRefresh={RefreshAction}
                  refreshTrigger={RefreshData}
                />
              )}
            </>
          )}
        </>
      )}
    </Flex>
  );
};

interface FeatureBacklogsViewProps {
  DataProject: ProjectDataResponse;
  DataRequirement: RequirementsResponse;
  onRefresh: () => void;
  refreshTrigger: number;
}

const FeatureBacklogsView = ({
  DataProject,
  DataRequirement,
  onRefresh,
  refreshTrigger,
}: FeatureBacklogsViewProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const {
    GetDetailById: GetReqDetail,
    ListBacklog,
    UpdateBacklogBatch,
    UpdateBacklog,
    GetDetailBacklogById,
  } = useRequirements();

  const { GetProjectBacklogProgression, AssignBacklogsToProject } = useProjects();
  const { CountTaskByBacklogId } = useTasks();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ActionLoading, setActionLoading] = useState(false);

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

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  // GetServiceListBacklog
  const [IsloadingBacklogs, setIsloadingBacklogs] = useState(false);
  const [DataBacklogsRequirement, setDataBacklogsRequirement] = useState<
    BacklogDataResponse[]
  >([]);

  // PROGRESS REPORT

  const [ProjectBacklogProgression, setProjectBacklogProgression] =
    useState<ProjectBacklogProgressionResponse>({
      totalBacklogs: 0,
      progressionBacklog: 0,
      totalBacklogsDone: 0,
    });
  const [OverallProgress, setOverallProgress] = useState<number>(0);
  const [ProgressColor, setProgressColor] = useState<string>("red");

  // Modal state for editing backlog
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBacklog, setSelectedBacklog] =
    useState<BacklogDataResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state for assigning backlogs
  const [isAssignBacklogModalOpen, setIsAssignBacklogModalOpen] = useState(false);
  const [availableBacklogs, setAvailableBacklogs] = useState<BacklogDataResponse[]>([]);
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([]);
  const [isLoadingBacklogs, setIsLoadingBacklogs] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelRef = useRef<any>(null);

  // Modal state for preview backlog
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedBacklogPreview, setSelectedBacklogPreview] =
    useState<BacklogDataResponse | null>(null);
  const [taskStats, setTaskStats] = useState<TasksCountResponse | null>(null);
  const [loadingTaskStats, setLoadingTaskStats] = useState(false);

  const handleEditBacklog = async (backlog: BacklogDataResponse) => {
    setIsEditModalOpen(true);
    setSelectedBacklog(backlog); // Set initial data

    // Get token from localStorage
    const token: string = localStorage.getItem("tokenData") as string;

    // Fetch full backlog detail with history
    const backlogDetail = await GetDetailBacklogById(backlog.id, token);
    if (backlogDetail?.statusCode === RES_CODE_OK && backlogDetail.data) {
      setSelectedBacklog(backlogDetail.data);
    }
  };

  const handlePreviewBacklog = async (backlog: BacklogDataResponse) => {
    setSelectedBacklogPreview(backlog);
    setIsPreviewModalOpen(true);
    setTaskStats(null);

    const token: string = localStorage.getItem("tokenData") as string;

    setLoadingTaskStats(true);
    const stats = await CountTaskByBacklogId(backlog.id, token);
    if (stats?.statusCode === RES_CODE_OK && stats.data) {
      setTaskStats(stats.data);
    }
    setLoadingTaskStats(false);
  };

  const handleSaveBacklog = async (values: any) => {
    if (!selectedBacklog) return;

    setIsSaving(true);

    // Prepare payload with all required fields
    const payload = {
      id: selectedBacklog.id,
      backlogName: values.backlogName,
      backlogDesc: values.backlogDesc || null,
      envSide: selectedBacklog.envSide,
      maintenanceCategory: selectedBacklog.maintenanceCategory,
      maintenanceType: selectedBacklog.maintenanceType,
      rppb: selectedBacklog.rppb,
      licensing: selectedBacklog.licensing,
      backogRegistered: selectedBacklog.backogRegistered,
      backlogStartdate: values.backlogStartdate || null,
      backlogEnddate: values.backlogEnddate || null,
      urgency: values.urgency,
      impact: values.impact,
      priority: values.priority,
      developmentStatus: selectedBacklog.developmentStatus, // Keep original status
      backlogImplementStartdate: values.backlogImplementStartdate || null,
      backlogImplementEnddate: values.backlogImplementEnddate || null,
      reffId: selectedBacklog.reffId,
      posOrder: selectedBacklog.posOrder,
      version: selectedBacklog.version,
      isLive: selectedBacklog.isLive,
    };

    const requestData = await UpdateBacklog(payload, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsSaving(false);
      return;
    }

    // Reload backlog detail with updated history
    const updatedBacklogData = await GetDetailBacklogById(
      selectedBacklog.id,
      tokenData
    );
    if (
      updatedBacklogData?.statusCode === RES_CODE_OK &&
      updatedBacklogData.data
    ) {
      setSelectedBacklog(updatedBacklogData.data);
    }

    showToast({
      description: "Backlog updated successfully",
      statusToast: "success",
    });
    setIsSaving(false);
    onRefresh();
  };

  // Load available backlogs from requirement
  const loadAvailableBacklogs = async () => {
    if (!DataProject?.reqParentId) return;

    setIsLoadingBacklogs(true);
    try {
      const token = localStorage.getItem("tokenData") as string;
      const payload: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "reqId",
            operator: "=",
            value: DataProject.reqParentId,
          },
        ],
        fieldOrder: ["backlogName"],
        orderDir: "asc",
      };

      const response = await ListBacklog(payload, token);
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setAvailableBacklogs(response.data);
      }
    } catch (error) {
      showToast({
        description: "Failed to load backlogs",
        statusToast: "error",
      });
    } finally {
      setIsLoadingBacklogs(false);
    }
  };

  // Assign selected backlogs to project
  const handleAssignBacklogs = async () => {
    if (selectedBacklogIds.length === 0) {
      showToast({
        description: "Please select at least one backlog",
        statusToast: "warning",
      });
      return;
    }

    // Show confirmation dialog
    setIsConfirmOpen(true);
  };

  const confirmAssignBacklogs = async () => {
    setIsConfirmOpen(false);
    setActionLoading(true);
    try {
      const token = localStorage.getItem("tokenData") as string;
      const response = await AssignBacklogsToProject(
        {
          projectId: DataProject.id,
          backlogIds: selectedBacklogIds,
        },
        token
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: response.message || "Backlogs assigned successfully",
          statusToast: "success",
        });
        setIsAssignBacklogModalOpen(false);
        setSelectedBacklogIds([]);
        onRefresh();
      } else {
        showToast({
          description: response?.message || "Failed to assign backlogs",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Error assigning backlogs",
        statusToast: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Load backlogs when modal opens
  useEffect(() => {
    if (isAssignBacklogModalOpen) {
      loadAvailableBacklogs();
    }
  }, [isAssignBacklogModalOpen]);

  const columnsData = useMemo<ColumnDef<BacklogDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text>{info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogCode,
        id: "backlogCode",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
          >
            <Text fontWeight={600}>{info.row.original.backlogName}</Text>
            <Text as={"p"} fontSize={"smaller"}>
              {info.row.original.backlogDesc}
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Scopes</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogEnddate,
        id: "backlogEnddate",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            {info.row.original.backlogEnddate != null ? (
              <DeadlineStatusTag
                deadline={info.row.original.backlogEnddate}
                remindBeforeDays={10}
              />
            ) : (
              <Text fontWeight={600}>-</Text>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Deadline</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.priority,
        id: "priority",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Text
              fontWeight={600}
              color={priorityColor(info.row.original.priority)}
            >
              {info.row.original.priority}
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Priority</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.developmentStatus,
        id: "developmentStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Text fontWeight={600}>{info.row.original.developmentStatus}</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Status</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogStartdate,
        id: "devProgression",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            as={Stack}
            spacing={0}
          >
            <Text fontSize={"smaller"} textAlign={"center"} fontWeight={600}>
              {info.row.original.progressionPercentage.toString()}%
            </Text>
            <Progress
              colorScheme={colorProgression(
                info.row.original.progressionPercentage
              )}
              hasStripe
              value={info.row.original.progressionPercentage}
              w={"full"}
              rounded={radiusStyle}
              size={"sm"}
            />
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Progress</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                size={"xs"}
                variant={"ghost"}
                aria-label="Actions"
              />
              <MenuList>
                <MenuItem
                  icon={<FiEdit />}
                  onClick={() => handleEditBacklog(info.row.original)}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FiEye />}
                  onClick={() => handlePreviewBacklog(info.row.original)}
                >
                  Preview
                </MenuItem>
                <MenuItem
                  icon={<BsKanban />}
                  as={Link}
                  href={`/workspace/project?projectId=${DataProject?.id}&backlogId=${info.row.original.id}`}
                >
                  Go To Kanban
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        ),
        header: () => <Flex justifyContent={"start"}>Action</Flex>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        },
      },
    ],
    [colorMode, OverallProgress, ProgressColor, DataProject]
  );

  // Load Requirements
  useEffect(() => {
    if (DataAuth && DataProject && DataProject.reqParentId) {
      // LOAD BACKLOGS DATA - Filter by project ID instead of requirement ID
      const PayloadGetBacklogList: PaggingListPayload = {
        search: globalFilter,
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "projectId",
            operator: "=",
            value: DataProject.id,
          },
        ],
        fieldOrder: ["createdAt"],
        orderDir: "asc",
      };

      const GetDataBacklogsList = async () => {
        setIsLoadingProcess(true);
        const requestData = await ListBacklog(PayloadGetBacklogList, tokenData);
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
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }
          const itemsData: BacklogDataResponse[] =
            requestData.data as BacklogDataResponse[];
          setDataBacklogsRequirement(itemsData);
          setIsLoadingProcess(false);
        }
      };

      // Load Backlog Progression
      const GetProgression = async () => {
        const requestData = await GetProjectBacklogProgression(
          DataProject.id || "",
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
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }
          const itemsData: ProjectBacklogProgressionResponse =
            requestData.data as ProjectBacklogProgressionResponse;
          setProjectBacklogProgression(itemsData);
        }
      };

      GetDataBacklogsList();
      GetProgression();
    }
  }, [DataAuth, refreshTrigger, DataProject, globalFilter]);

  // auto page
  const tableBacklogs = useReactTable({
    data: DataBacklogsRequirement,
    columns: columnsData,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);
    // not implemented
  };

  const RefreshAction = () => {
    setGlobalFilter("");
    setDataBacklogsRequirement([]);
    onRefresh();
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Data Scope Projects
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project Scope and backlogs
          </Text>
        </VStack>
        <HStack spacing={3}>
          {DataProject?.isImported === "Y" && DataBacklogsRequirement.length === 0 && (
            <Button
              size="sm"
              leftIcon={<FiPlus />}
              colorScheme="blue"
              rounded="full"
              onClick={() => setIsAssignBacklogModalOpen(true)}
              isLoading={ActionLoading}
            >
              Assign Backlog
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
            onClick={() => RefreshAction()}
            isLoading={ActionLoading}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      {/* Overall Progression */}
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
            Overall Progression - {ProjectBacklogProgression.progressionBacklog}
            %
          </Text>
          <Text fontSize="sm" fontWeight={500}>
            {ProjectBacklogProgression.totalBacklogsDone}
            <Text as="span" fontWeight={600} ml={1}>
              / {ProjectBacklogProgression.totalBacklogs} Scopess Completed
            </Text>
          </Text>
        </HStack>
        <Progress
          colorScheme={colorProgression(
            ProjectBacklogProgression.progressionBacklog
          )}
          hasStripe
          value={ProjectBacklogProgression.progressionBacklog}
          w="full"
          rounded={radiusStyle}
        />
      </VStack>

      {/* Search and Actions */}
      <Flex w={"full"} as={Stack} spacing={6}>
        <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
          <Flex as={HStack}>
            <Input
              id="backlogSearch"
              name="backlogSearch"
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`Search Scopes...`}
              minLength={3}
              maxLength={150}
            />
          </Flex>
        </Flex>

        {/* TABLE DATA */}
        <Flex as={Stack} w={"full"} spacing={5}>
          {IsLoadingProcess ? (
            <Box textAlign="center" py={12}>
              <LoadingMiniSignature />
              <Text mt={4} color="gray.500">
                Loading Scopes...
              </Text>
            </Box>
          ) : (
            <TableComponentWithFilterCTX
              table={tableBacklogs}
              handleFilterChange={handleFilterChange}
            />
          )}
        </Flex>
      </Flex>
      {/* ------------ DEBUG DATA ------------------ */}

      <Box
        w={"full"}
        overflowY={"auto"}
        overflowX={"auto"}
        maxH={"350px"}
        p={4}
        bgColor={"gray.200"}
        rounded={radiusStyle}
        display={"none"}
      >
        <Text fontWeight={600}>Data Requirement</Text>
        <pre>{JSON.stringify(DataRequirement, null, 2)}</pre>
      </Box>
      <Box
        w={"full"}
        overflowY={"auto"}
        overflowX={"auto"}
        maxH={"350px"}
        p={4}
        bgColor={"gray.200"}
        rounded={radiusStyle}
        display={"none"}
      >
        <Text fontWeight={600}>Data Project</Text>
        <pre>{JSON.stringify(DataProject, null, 2)}</pre>
      </Box>

      {/* Edit Backlog Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Edit Backlog</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto">
            {selectedBacklog && (
              <>
                {/* Beautiful Backlog Name Highlight */}
                <Box
                  p={4}
                  bg="blue.50"
                  border="1px"
                  borderColor="blue.200"
                  rounded="lg"
                  borderLeft="4px"
                  borderLeftColor="blue.500"
                  mb={4}
                >
                  <HStack spacing={3}>
                    <Box w={3} h={3} bg="blue.500" rounded="full" />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">
                        {selectedBacklog.backlogName}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Tabs for Edit and History */}
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList bg="gray.100" p={1} rounded={radiusStyle}>
                    <Tab
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <HStack>
                        <FiEdit size={16} />
                        <Text>Edit Details</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <HStack>
                        <FiClock size={16} />
                        <Text>
                          History (
                          {selectedBacklog.backlogHistories?.length || 0})
                        </Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0}>
                      <BacklogEditFormFeatures
                        backlog={selectedBacklog}
                        onSubmit={handleSaveBacklog}
                        isLoading={isSaving}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <BacklogHistoryList
                        histories={selectedBacklog.backlogHistories || []}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Backlog Preview Modal - Modern Design */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        size="4xl"
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent maxH="90vh" rounded="2xl" overflow="hidden" shadow="2xl">
          {/* Hero Header with Gradient */}
          <Box
            position="relative"
            bgGradient={
              colorMode === "light"
                ? "linear(135deg, blue.500, purple.600)"
                : "linear(135deg, blue.600, purple.700)"
            }
            p={8}
            color="white"
          >
            {/* Decorative Background Pattern */}
            <Box
              position="absolute"
              top={0}
              right={0}
              bottom={0}
              left={0}
              opacity={0.1}
              bgImage="radial-gradient(circle, white 1px, transparent 1px)"
              bgSize="20px 20px"
            />

            <VStack align="stretch" spacing={4} position="relative" zIndex={1}>
              <HStack justify="space-between">
                <VStack align="start" spacing={2} flex={1}>
                  <HStack spacing={3}>
                    <Box
                      bg="whiteAlpha.200"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="bold"
                      backdropFilter="blur(10px)"
                    >
                      {selectedBacklogPreview?.backlogCode}
                    </Box>
                    <Badge
                      colorScheme={
                        selectedBacklogPreview?.developmentStatus === "DONE"
                          ? "green"
                          : selectedBacklogPreview?.developmentStatus ===
                            "IN PROGRESS"
                            ? "blue"
                            : "orange"
                      }
                      fontSize="xs"
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      {selectedBacklogPreview?.developmentStatus}
                    </Badge>
                  </HStack>
                  <Heading size="lg" fontWeight="bold" lineHeight="shorter">
                    {selectedBacklogPreview?.backlogName}
                  </Heading>
                  {selectedBacklogPreview?.backlogDesc && (
                    <Text fontSize="sm" opacity={0.9} noOfLines={2}>
                      {selectedBacklogPreview.backlogDesc}
                    </Text>
                  )}
                </VStack>
                <IconButton
                  aria-label="Close"
                  icon={<FiXCircle />}
                  onClick={() => setIsPreviewModalOpen(false)}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  size="lg"
                  rounded="full"
                />
              </HStack>

              {/* Progress Bar in Header */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Overall Progress
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {selectedBacklogPreview?.progressionPercentage}%
                  </Text>
                </HStack>
                <Progress
                  value={selectedBacklogPreview?.progressionPercentage || 0}
                  size="sm"
                  rounded="full"
                  bg="whiteAlpha.300"
                  sx={{
                    "& > div": {
                      bg: "white",
                    },
                  }}
                />
              </Box>
            </VStack>
          </Box>
          <ModalBody
            pb={6}
            overflowY="auto"
            bg={colorMode === "light" ? "gray.50" : "gray.900"}
          >
            {selectedBacklogPreview && (
              <VStack spacing={6} align="stretch" p={6}>
                {/* Task Statistics - Hero Section */}
                <Box>
                  <HStack mb={4}>
                    <FiActivity
                      size={20}
                      color={colorMode === "light" ? "#3182CE" : "#63B3ED"}
                    />
                    <Heading
                      size="md"
                      color={colorMode === "light" ? "gray.700" : "white"}
                    >
                      Task Statistics
                    </Heading>
                  </HStack>
                  {loadingTaskStats ? (
                    <Card
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      shadow="lg"
                      rounded="xl"
                      p={12}
                    >
                      <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text color="gray.500">Loading task statistics...</Text>
                      </VStack>
                    </Card>
                  ) : (
                    <VStack spacing={6} align="stretch">
                      {(() => {
                        // Fallback for when taskStats is null
                        const stats = taskStats || {
                          all: 0,
                          toDo: 0,
                          inProgress: 0,
                          inReview: 0,
                          done: 0,
                          archived: 0,
                        };

                        return (
                          <>
                            {/* Overall Backlog Progression */}
                            <Card
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="lg"
                              rounded="xl"
                            >
                              <CardBody p={6}>
                                <VStack spacing={3} align="stretch">
                                  <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="gray.600"
                                  >
                                    OVERALL BACKLOG PROGRESSION
                                  </Text>
                                  <HStack justify="space-between">
                                    <Text
                                      fontSize="3xl"
                                      fontWeight="bold"
                                      color="blue.500"
                                    >
                                      {selectedBacklogPreview?.progressionPercentage ||
                                        0}
                                      %
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        selectedBacklogPreview?.developmentStatus ===
                                          "DONE"
                                          ? "green"
                                          : selectedBacklogPreview?.developmentStatus ===
                                            "IN PROGRESS"
                                            ? "blue"
                                            : "orange"
                                      }
                                      fontSize="sm"
                                      px={3}
                                      py={1}
                                    >
                                      {
                                        selectedBacklogPreview?.developmentStatus
                                      }
                                    </Badge>
                                  </HStack>
                                  <Progress
                                    value={
                                      selectedBacklogPreview?.progressionPercentage ||
                                      0
                                    }
                                    colorScheme={
                                      (selectedBacklogPreview?.progressionPercentage ||
                                        0) > 70
                                        ? "green"
                                        : (selectedBacklogPreview?.progressionPercentage ||
                                          0) > 30
                                          ? "orange"
                                          : "red"
                                    }
                                    size="lg"
                                    rounded="full"
                                  />
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Task Metrics Table */}
                            <Card
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="lg"
                              rounded="xl"
                            >
                              <CardHeader
                                bg={
                                  colorMode === "light" ? "gray.50" : "gray.700"
                                }
                                borderBottom="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.600"
                                }
                              >
                                <Heading size="sm">TASK METRICS</Heading>
                              </CardHeader>
                              <CardBody p={0}>
                                <Table size="sm">
                                  <Thead>
                                    <Tr>
                                      <Th>Metric</Th>
                                      <Th isNumeric>Current</Th>
                                      <Th>Target</Th>
                                      <Th>Status</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      <Td fontWeight="medium">Total Tasks</Td>
                                      <Td isNumeric fontWeight="bold">
                                        {stats.all}
                                      </Td>
                                      <Td>
                                        {(() => {
                                          const start =
                                            selectedBacklogPreview?.backlogStartdate;
                                          const end =
                                            selectedBacklogPreview?.backlogEnddate;
                                          if (!start || !end) return "8-12";
                                          const duration = Math.ceil(
                                            (new Date(end).getTime() -
                                              new Date(start).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                          );
                                          const multiplier =
                                            selectedBacklogPreview?.priority ===
                                              "HIGH"
                                              ? 1.5
                                              : selectedBacklogPreview?.priority ===
                                                "MEDIUM"
                                                ? 1.0
                                                : 0.7;
                                          const base = Math.ceil(duration / 3);
                                          const min = Math.floor(
                                            base * multiplier
                                          );
                                          const max = Math.ceil(min * 1.5);
                                          return `${min}-${max}`;
                                        })()}
                                      </Td>
                                      <Td>
                                        {stats.all === 0 ? (
                                          <Badge
                                            colorScheme="orange"
                                            fontSize="xs"
                                          >
                                            ⚠️ Not Started
                                          </Badge>
                                        ) : (
                                          <Badge
                                            colorScheme="green"
                                            fontSize="xs"
                                          >
                                            ✓ Active
                                          </Badge>
                                        )}
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td fontWeight="medium">
                                        Completed Tasks
                                      </Td>
                                      <Td isNumeric fontWeight="bold">
                                        {stats.done}
                                      </Td>
                                      <Td>-</Td>
                                      <Td>
                                        {stats.done > 0 && (
                                          <Badge
                                            colorScheme="green"
                                            fontSize="xs"
                                          >
                                            {stats.done} done
                                          </Badge>
                                        )}
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td fontWeight="medium">
                                        In Progress Tasks
                                      </Td>
                                      <Td isNumeric fontWeight="bold">
                                        {stats.inProgress}
                                      </Td>
                                      <Td>-</Td>
                                      <Td>
                                        {stats.inProgress > 0 && (
                                          <Badge
                                            colorScheme="blue"
                                            fontSize="xs"
                                          >
                                            {stats.inProgress} active
                                          </Badge>
                                        )}
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td fontWeight="medium">Pending Tasks</Td>
                                      <Td isNumeric fontWeight="bold">
                                        {stats.toDo}
                                      </Td>
                                      <Td>-</Td>
                                      <Td>
                                        {stats.toDo > 0 && (
                                          <Badge
                                            colorScheme="gray"
                                            fontSize="xs"
                                          >
                                            {stats.toDo} pending
                                          </Badge>
                                        )}
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td fontWeight="medium">
                                        Task Completion %
                                      </Td>
                                      <Td isNumeric fontWeight="bold">
                                        {stats.all > 0
                                          ? Math.round(
                                            (stats.done / stats.all) * 100
                                          )
                                          : 0}
                                        %
                                      </Td>
                                      <Td>100%</Td>
                                      <Td>
                                        {stats.all === 0 ? (
                                          <Badge
                                            colorScheme="orange"
                                            fontSize="xs"
                                          >
                                            ⚠️ No tasks
                                          </Badge>
                                        ) : (
                                          <Badge
                                            colorScheme={
                                              stats.all > 0 &&
                                                stats.done === stats.all
                                                ? "green"
                                                : stats.done > 0
                                                  ? "blue"
                                                  : "gray"
                                            }
                                            fontSize="xs"
                                          >
                                            {stats.all > 0 &&
                                              stats.done === stats.all
                                              ? "✓ Complete"
                                              : stats.done > 0
                                                ? "In Progress"
                                                : "Not Started"}
                                          </Badge>
                                        )}
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </CardBody>
                            </Card>

                            {/* Backlog Details */}
                            <Card
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="lg"
                              rounded="xl"
                            >
                              <CardHeader
                                bg={
                                  colorMode === "light" ? "gray.50" : "gray.700"
                                }
                                borderBottom="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.600"
                                }
                              >
                                <Heading size="sm">BACKLOG DETAILS</Heading>
                              </CardHeader>
                              <CardBody p={6}>
                                <VStack spacing={6} align="stretch">
                                  {/* Basic Information */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiInfo size={16} color="#3182CE" />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="blue.600"
                                      >
                                        Basic Information
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 1, md: 2 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Code
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogCode}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Name
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogName}
                                        </Text>
                                      </Box>
                                      {selectedBacklogPreview?.backlogDesc && (
                                        <Box
                                          gridColumn={{
                                            base: "1",
                                            md: "1 / -1",
                                          }}
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                          >
                                            Description
                                          </Text>
                                          <Text fontSize="sm">
                                            {selectedBacklogPreview.backlogDesc}
                                          </Text>
                                        </Box>
                                      )}
                                    </SimpleGrid>
                                  </Box>

                                  <Divider />

                                  {/* Priority Matrix */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiActivity size={16} color="#805AD5" />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="purple.600"
                                      >
                                        Priority Matrix
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 2, md: 4 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Priority
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            selectedBacklogPreview?.priority ===
                                              "HIGH"
                                              ? "red"
                                              : selectedBacklogPreview?.priority ===
                                                "MEDIUM"
                                                ? "orange"
                                                : "gray"
                                          }
                                        >
                                          {selectedBacklogPreview?.priority}
                                        </Badge>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Urgency
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            selectedBacklogPreview?.urgency ===
                                              "HIGH"
                                              ? "red"
                                              : selectedBacklogPreview?.urgency ===
                                                "MEDIUM"
                                                ? "orange"
                                                : "gray"
                                          }
                                        >
                                          {selectedBacklogPreview?.urgency}
                                        </Badge>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Impact
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            selectedBacklogPreview?.impact ===
                                              "HIGH"
                                              ? "red"
                                              : selectedBacklogPreview?.impact ===
                                                "MEDIUM"
                                                ? "orange"
                                                : "gray"
                                          }
                                        >
                                          {selectedBacklogPreview?.impact}
                                        </Badge>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Risk Level
                                        </Text>
                                        <Badge
                                          colorScheme={(() => {
                                            const score = {
                                              HIGH: 3,
                                              MEDIUM: 2,
                                              LOW: 1,
                                            };
                                            const total =
                                              (score[
                                                selectedBacklogPreview?.priority as keyof typeof score
                                              ] || 0) +
                                              (score[
                                                selectedBacklogPreview?.urgency as keyof typeof score
                                              ] || 0) +
                                              (score[
                                                selectedBacklogPreview?.impact as keyof typeof score
                                              ] || 0);
                                            return total >= 8
                                              ? "red"
                                              : total >= 6
                                                ? "orange"
                                                : "green";
                                          })()}
                                        >
                                          {(() => {
                                            const score = {
                                              HIGH: 3,
                                              MEDIUM: 2,
                                              LOW: 1,
                                            };
                                            const total =
                                              (score[
                                                selectedBacklogPreview?.priority as keyof typeof score
                                              ] || 0) +
                                              (score[
                                                selectedBacklogPreview?.urgency as keyof typeof score
                                              ] || 0) +
                                              (score[
                                                selectedBacklogPreview?.impact as keyof typeof score
                                              ] || 0);
                                            return total >= 8
                                              ? "CRITICAL"
                                              : total >= 6
                                                ? "HIGH"
                                                : total >= 4
                                                  ? "MEDIUM"
                                                  : "LOW";
                                          })()}
                                        </Badge>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>

                                  <Divider />

                                  {/* Timeline */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiClock size={16} color="#3182CE" />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="blue.600"
                                      >
                                        Timeline
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 1, md: 2 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Start Date
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogStartdate
                                            ? new Date(
                                              selectedBacklogPreview.backlogStartdate
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          End Date
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogEnddate
                                            ? new Date(
                                              selectedBacklogPreview.backlogEnddate
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Duration
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogStartdate &&
                                            selectedBacklogPreview?.backlogEnddate
                                            ? `${Math.ceil(
                                              (new Date(
                                                selectedBacklogPreview.backlogEnddate
                                              ).getTime() -
                                                new Date(
                                                  selectedBacklogPreview.backlogStartdate
                                                ).getTime()) /
                                              (1000 * 60 * 60 * 24)
                                            )} days`
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Days Elapsed
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogStartdate
                                            ? `${Math.max(
                                              0,
                                              Math.ceil(
                                                (new Date().getTime() -
                                                  new Date(
                                                    selectedBacklogPreview.backlogStartdate
                                                  ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                              )
                                            )} days`
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Days Remaining
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.backlogEnddate
                                            ? `${Math.max(
                                              0,
                                              Math.ceil(
                                                (new Date(
                                                  selectedBacklogPreview.backlogEnddate
                                                ).getTime() -
                                                  new Date().getTime()) /
                                                (1000 * 60 * 60 * 24)
                                              )
                                            )} days`
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Timeline Status
                                        </Text>
                                        {selectedBacklogPreview?.backlogStartdate &&
                                          selectedBacklogPreview?.backlogEnddate ? (
                                          (() => {
                                            const duration = Math.ceil(
                                              (new Date(
                                                selectedBacklogPreview.backlogEnddate
                                              ).getTime() -
                                                new Date(
                                                  selectedBacklogPreview.backlogStartdate
                                                ).getTime()) /
                                              (1000 * 60 * 60 * 24)
                                            );
                                            const elapsed = Math.max(
                                              0,
                                              Math.ceil(
                                                (new Date().getTime() -
                                                  new Date(
                                                    selectedBacklogPreview.backlogStartdate
                                                  ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                              )
                                            );
                                            const expectedProgress =
                                              (elapsed / duration) * 100;
                                            const actualProgress =
                                              selectedBacklogPreview.progressionPercentage ||
                                              0;
                                            const diff =
                                              actualProgress - expectedProgress;
                                            return (
                                              <Badge
                                                colorScheme={
                                                  diff >= 0
                                                    ? "green"
                                                    : diff > -10
                                                      ? "orange"
                                                      : "red"
                                                }
                                                fontSize="xs"
                                              >
                                                {diff >= 0
                                                  ? "🟢 On Track"
                                                  : diff > -10
                                                    ? "🟡 Slightly Behind"
                                                    : `🔴 Behind (${Math.abs(
                                                      Math.round(diff)
                                                    )}%)`}
                                              </Badge>
                                            );
                                          })()
                                        ) : (
                                          <Text fontSize="sm">-</Text>
                                        )}
                                      </Box>
                                    </SimpleGrid>
                                  </Box>

                                  {/* Implementation Dates */}
                                  {(selectedBacklogPreview?.backlogImplementStartdate ||
                                    selectedBacklogPreview?.backlogImplementEnddate) && (
                                      <>
                                        <Divider />
                                        <Box>
                                          <HStack mb={3}>
                                            <FiClock size={16} color="#805AD5" />
                                            <Text
                                              fontSize="sm"
                                              fontWeight="bold"
                                              color="purple.600"
                                            >
                                              Implementation Dates
                                            </Text>
                                          </HStack>
                                          <SimpleGrid
                                            columns={{ base: 1, md: 3 }}
                                            spacing={3}
                                            pl={6}
                                          >
                                            <Box>
                                              <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Impl. Start
                                              </Text>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                              >
                                                {selectedBacklogPreview?.backlogImplementStartdate
                                                  ? new Date(
                                                    selectedBacklogPreview.backlogImplementStartdate
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                      year: "numeric",
                                                    }
                                                  )
                                                  : "-"}
                                              </Text>
                                            </Box>
                                            <Box>
                                              <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Impl. End
                                              </Text>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                              >
                                                {selectedBacklogPreview?.backlogImplementEnddate
                                                  ? new Date(
                                                    selectedBacklogPreview.backlogImplementEnddate
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                      year: "numeric",
                                                    }
                                                  )
                                                  : "-"}
                                              </Text>
                                            </Box>
                                            <Box>
                                              <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Impl. Duration
                                              </Text>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                              >
                                                {selectedBacklogPreview?.backlogImplementStartdate &&
                                                  selectedBacklogPreview?.backlogImplementEnddate
                                                  ? `${Math.ceil(
                                                    (new Date(
                                                      selectedBacklogPreview.backlogImplementEnddate
                                                    ).getTime() -
                                                      new Date(
                                                        selectedBacklogPreview.backlogImplementStartdate
                                                      ).getTime()) /
                                                    (1000 * 60 * 60 * 24)
                                                  )} days`
                                                  : "-"}
                                              </Text>
                                            </Box>
                                          </SimpleGrid>
                                        </Box>
                                      </>
                                    )}

                                  <Divider />

                                  {/* Technical Information */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiSettings size={16} color="#3182CE" />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="blue.600"
                                      >
                                        Technical Information
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 2, md: 4 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      {selectedBacklogPreview?.envSide && (
                                        <Box>
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                          >
                                            Environment
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                          >
                                            {selectedBacklogPreview.envSide}
                                          </Text>
                                        </Box>
                                      )}
                                      {selectedBacklogPreview?.maintenanceCategory && (
                                        <Box>
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                          >
                                            Maintenance Category
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                          >
                                            {
                                              selectedBacklogPreview.maintenanceCategory
                                            }
                                          </Text>
                                        </Box>
                                      )}
                                      {selectedBacklogPreview?.maintenanceType && (
                                        <Box>
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                          >
                                            Maintenance Type
                                          </Text>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                          >
                                            {
                                              selectedBacklogPreview.maintenanceType
                                            }
                                          </Text>
                                        </Box>
                                      )}
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          RPPB
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.rppb}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Licensing
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.licensing}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Version
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.version}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Live Status
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            selectedBacklogPreview?.isLive ===
                                              "YES"
                                              ? "green"
                                              : "gray"
                                          }
                                        >
                                          {selectedBacklogPreview?.isLive ===
                                            "YES"
                                            ? "LIVE"
                                            : "NOT LIVE"}
                                        </Badge>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>

                                  <Divider />

                                  {/* Project Context */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiMoreVertical
                                        size={16}
                                        color="#805AD5"
                                      />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="purple.600"
                                      >
                                        Project Context
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 1, md: 3 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Project
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {DataProject?.projectName ||
                                            selectedBacklogPreview?.projectId ||
                                            "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Requirement
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.reqId || "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Application
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {DataProject?.appsProject?.appName ||
                                            selectedBacklogPreview?.appsId ||
                                            "-"}
                                        </Text>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>

                                  <Divider />

                                  {/* Team & Assignment */}
                                  <Box>
                                    <HStack mb={3}>
                                      <FiUsers size={16} color="#3182CE" />
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="blue.600"
                                      >
                                        Team & Assignment
                                      </Text>
                                    </HStack>
                                    <SimpleGrid
                                      columns={{ base: 1, md: 2 }}
                                      spacing={3}
                                      pl={6}
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Created By
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.createdBy}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Created At
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.createdAt
                                            ? new Date(
                                              selectedBacklogPreview.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Updated By
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.updatedBy}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Updated At
                                        </Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {selectedBacklogPreview?.updatedAt
                                            ? new Date(
                                              selectedBacklogPreview.updatedAt
                                            ).toLocaleString()
                                            : "-"}
                                        </Text>
                                      </Box>
                                      <Box
                                        gridColumn={{ base: "1", md: "1 / -1" }}
                                      >
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          mb={1}
                                        >
                                          Assigned Team
                                        </Text>
                                        <Text
                                          fontSize="sm"
                                          fontStyle="italic"
                                          color="gray.500"
                                        >
                                          No tasks created yet
                                        </Text>
                                      </Box>
                                    </SimpleGrid>
                                  </Box>

                                  {/* Additional Notes */}
                                  {(selectedBacklogPreview?.reffId ||
                                    selectedBacklogPreview?.note ||
                                    selectedBacklogPreview?.posOrder) && (
                                      <>
                                        <Divider />
                                        <Box>
                                          <HStack mb={3}>
                                            <FiEdit size={16} color="#805AD5" />
                                            <Text
                                              fontSize="sm"
                                              fontWeight="bold"
                                              color="purple.600"
                                            >
                                              Additional Notes
                                            </Text>
                                          </HStack>
                                          <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                            spacing={3}
                                            pl={6}
                                          >
                                            {selectedBacklogPreview?.reffId && (
                                              <Box>
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                  mb={1}
                                                >
                                                  Reference
                                                </Text>
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="medium"
                                                >
                                                  {selectedBacklogPreview.reffId}
                                                </Text>
                                              </Box>
                                            )}
                                            {selectedBacklogPreview?.posOrder !==
                                              undefined && (
                                                <Box>
                                                  <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                    mb={1}
                                                  >
                                                    Position Order
                                                  </Text>
                                                  <Text
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                  >
                                                    {
                                                      selectedBacklogPreview.posOrder
                                                    }
                                                  </Text>
                                                </Box>
                                              )}
                                            {selectedBacklogPreview?.note && (
                                              <Box
                                                gridColumn={{
                                                  base: "1",
                                                  md: "1 / -1",
                                                }}
                                              >
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                  mb={1}
                                                >
                                                  Notes
                                                </Text>
                                                <Text fontSize="sm">
                                                  {selectedBacklogPreview.note}
                                                </Text>
                                              </Box>
                                            )}
                                          </SimpleGrid>
                                        </Box>
                                      </>
                                    )}
                                </VStack>
                              </CardBody>
                            </Card>
                          </>
                        );
                      })()}
                    </VStack>
                  )}
                </Box>

                {/* Timeline & Details Grid */}
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  {/* Timeline */}
                  <Card
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    shadow="lg"
                    rounded="xl"
                  >
                    <CardBody p={6}>
                      <HStack mb={4}>
                        <FiClock
                          size={18}
                          color={colorMode === "light" ? "#3182CE" : "#63B3ED"}
                        />
                        <Heading
                          size="sm"
                          color={colorMode === "light" ? "gray.700" : "white"}
                        >
                          Timeline
                        </Heading>
                      </HStack>
                      <VStack align="stretch" spacing={4}>
                        <HStack>
                          <Box
                            bg={colorMode === "light" ? "blue.50" : "blue.900"}
                            p={3}
                            rounded="lg"
                          >
                            <FiClock
                              color={
                                colorMode === "light" ? "#3182CE" : "#63B3ED"
                              }
                            />
                          </Box>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontWeight="medium"
                            >
                              START DATE
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {selectedBacklogPreview.backlogStartdate
                                ? new Date(
                                  selectedBacklogPreview.backlogStartdate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                                : "Not set"}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack>
                          <Box
                            bg={
                              colorMode === "light" ? "purple.50" : "purple.900"
                            }
                            p={3}
                            rounded="lg"
                          >
                            <FiClock
                              color={
                                colorMode === "light" ? "#805AD5" : "#B794F4"
                              }
                            />
                          </Box>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontWeight="medium"
                            >
                              END DATE
                            </Text>
                            <HStack>
                              <Text fontSize="sm" fontWeight="bold">
                                {selectedBacklogPreview.backlogEnddate
                                  ? new Date(
                                    selectedBacklogPreview.backlogEnddate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                  : "Not set"}
                              </Text>
                              {selectedBacklogPreview.backlogEnddate && (
                                <DeadlineStatusTag
                                  deadline={
                                    selectedBacklogPreview.backlogEnddate
                                  }
                                  remindBeforeDays={10}
                                />
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Priority & Impact */}
                  <Card
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    shadow="lg"
                    rounded="xl"
                  >
                    <CardBody p={6}>
                      <HStack mb={4}>
                        <FiActivity
                          size={18}
                          color={colorMode === "light" ? "#805AD5" : "#B794F4"}
                        />
                        <Heading
                          size="sm"
                          color={colorMode === "light" ? "gray.700" : "white"}
                        >
                          Priority & Impact
                        </Heading>
                      </HStack>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box
                          p={4}
                          bg={
                            selectedBacklogPreview.priority === "HIGH"
                              ? colorMode === "light"
                                ? "red.50"
                                : "red.900"
                              : colorMode === "light"
                                ? "gray.50"
                                : "gray.700"
                          }
                          rounded="lg"
                          textAlign="center"
                        >
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            PRIORITY
                          </Text>
                          <Badge
                            colorScheme={
                              selectedBacklogPreview.priority === "HIGH"
                                ? "red"
                                : selectedBacklogPreview.priority === "MEDIUM"
                                  ? "orange"
                                  : "gray"
                            }
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {selectedBacklogPreview.priority}
                          </Badge>
                        </Box>
                        <Box
                          p={4}
                          bg={
                            selectedBacklogPreview.impact === "HIGH"
                              ? colorMode === "light"
                                ? "red.50"
                                : "red.900"
                              : colorMode === "light"
                                ? "gray.50"
                                : "gray.700"
                          }
                          rounded="lg"
                          textAlign="center"
                        >
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            IMPACT
                          </Text>
                          <Badge
                            colorScheme={
                              selectedBacklogPreview.impact === "HIGH"
                                ? "red"
                                : selectedBacklogPreview.impact === "MEDIUM"
                                  ? "orange"
                                  : "gray"
                            }
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {selectedBacklogPreview.impact}
                          </Badge>
                        </Box>
                        <Box
                          p={4}
                          bg={
                            selectedBacklogPreview.urgency === "HIGH"
                              ? colorMode === "light"
                                ? "orange.50"
                                : "orange.900"
                              : colorMode === "light"
                                ? "gray.50"
                                : "gray.700"
                          }
                          rounded="lg"
                          textAlign="center"
                        >
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            URGENCY
                          </Text>
                          <Badge
                            colorScheme={
                              selectedBacklogPreview.urgency === "HIGH"
                                ? "orange"
                                : "gray"
                            }
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {selectedBacklogPreview.urgency}
                          </Badge>
                        </Box>
                        <Box
                          p={4}
                          bg={
                            selectedBacklogPreview.isLive === "YES"
                              ? colorMode === "light"
                                ? "green.50"
                                : "green.900"
                              : colorMode === "light"
                                ? "gray.50"
                                : "gray.700"
                          }
                          rounded="lg"
                          textAlign="center"
                        >
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            STATUS
                          </Text>
                          <Badge
                            colorScheme={
                              selectedBacklogPreview.isLive === "YES"
                                ? "green"
                                : "gray"
                            }
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {selectedBacklogPreview.isLive === "YES"
                              ? "LIVE"
                              : "NOT LIVE"}
                          </Badge>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Additional Info */}
                <Card
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  shadow="lg"
                  rounded="xl"
                >
                  <CardBody p={6}>
                    <HStack mb={4}>
                      <FiMoreVertical
                        size={18}
                        color={colorMode === "light" ? "#3182CE" : "#63B3ED"}
                      />
                      <Heading
                        size="sm"
                        color={colorMode === "light" ? "gray.700" : "white"}
                      >
                        Additional Information
                      </Heading>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      {selectedBacklogPreview.envSide && (
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                            fontWeight="medium"
                          >
                            ENVIRONMENT
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedBacklogPreview.envSide}
                          </Text>
                        </Box>
                      )}
                      {selectedBacklogPreview.maintenanceCategory && (
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                            fontWeight="medium"
                          >
                            MAINTENANCE CATEGORY
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedBacklogPreview.maintenanceCategory}
                          </Text>
                        </Box>
                      )}
                      {selectedBacklogPreview.maintenanceType && (
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                            fontWeight="medium"
                          >
                            MAINTENANCE TYPE
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedBacklogPreview.maintenanceType}
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          mb={1}
                          fontWeight="medium"
                        >
                          RPPB
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedBacklogPreview.rppb}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          mb={1}
                          fontWeight="medium"
                        >
                          LICENSING
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedBacklogPreview.licensing}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          mb={1}
                          fontWeight="medium"
                        >
                          VERSION
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedBacklogPreview.version}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            p={6}
          >
            <HStack spacing={3} w="full" justify="space-between">
              <Link
                href={`/kanban?projectId=${DataProject?.id}&backlogId=${selectedBacklogPreview?.id}`}
              >
                <Button
                  colorScheme="blue"
                  leftIcon={<BsKanban />}
                  size="md"
                  rounded="lg"
                  shadow="md"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s"
                >
                  Open Kanban Board
                </Button>
              </Link>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  leftIcon={<FiEdit />}
                  size="md"
                  rounded="lg"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    if (selectedBacklogPreview) {
                      handleEditBacklog(selectedBacklogPreview);
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsPreviewModalOpen(false)}
                  size="md"
                  rounded="lg"
                >
                  Close
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Backlog Modal */}
      <AssignBacklogModal
        isOpen={isAssignBacklogModalOpen}
        onClose={() => {
          setIsAssignBacklogModalOpen(false);
          setSelectedBacklogIds([]);
        }}
        availableBacklogs={availableBacklogs}
        selectedBacklogIds={selectedBacklogIds}
        setSelectedBacklogIds={setSelectedBacklogIds}
        onAssign={handleAssignBacklogs}
        isLoading={ActionLoading}
        isLoadingBacklogs={isLoadingBacklogs}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Assign Backlogs
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to assign {selectedBacklogIds.length} backlog(s) to this project?
              This action will link the selected backlogs to the project.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={confirmAssignBacklogs}
                ml={3}
                isLoading={ActionLoading}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

// Backlog Edit Form Component for Features Tab
interface BacklogEditFormFeaturesProps {
  backlog: BacklogDataResponse;
  onSubmit: (values: any) => void;
  isLoading: boolean;
}

const BacklogEditFormFeatures = ({
  backlog,
  onSubmit,
  isLoading,
}: BacklogEditFormFeaturesProps) => {
  const formik = useFormik({
    initialValues: {
      backlogName: backlog.backlogName || "",
      backlogDesc: backlog.backlogDesc || "",
      backlogStartdate: backlog.backlogStartdate
        ? backlog.backlogStartdate.split("T")[0]
        : "",
      backlogEnddate: backlog.backlogEnddate
        ? backlog.backlogEnddate.split("T")[0]
        : "",
      urgency: backlog.urgency || "",
      impact: backlog.impact || "",
      priority: backlog.priority || "",
      backlogImplementStartdate: backlog.backlogImplementStartdate
        ? backlog.backlogImplementStartdate.split("T")[0]
        : "",
      backlogImplementEnddate: backlog.backlogImplementEnddate
        ? backlog.backlogImplementEnddate.split("T")[0]
        : "",
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Auto-calculate priority when impact or urgency changes
  useEffect(() => {
    if (formik.values.impact && formik.values.urgency) {
      const calculatedPriority = getPriorityFromMatrix(
        formik.values.impact,
        formik.values.urgency
      );
      if (formik.values.priority !== calculatedPriority) {
        formik.setFieldValue("priority", calculatedPriority);
      }
    }
  }, [formik.values.impact, formik.values.urgency]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Backlog Name</FormLabel>
          <Input
            name="backlogName"
            value={formik.values.backlogName}
            onChange={formik.handleChange}
            placeholder="Enter backlog name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="backlogDesc"
            value={formik.values.backlogDesc}
            onChange={formik.handleChange}
            placeholder="Enter backlog description"
          />
        </FormControl>

        <Grid templateColumns="1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              name="backlogStartdate"
              value={formik.values.backlogStartdate}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              name="backlogEnddate"
              value={formik.values.backlogEnddate}
              onChange={formik.handleChange}
            />
          </FormControl>
        </Grid>

        <Grid templateColumns="1fr 1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Urgency</FormLabel>
            <Select
              name="urgency"
              value={formik.values.urgency}
              onChange={formik.handleChange}
              placeholder="Select urgency"
            >
              {LocalPrioritiesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Impact</FormLabel>
            <Select
              name="impact"
              value={formik.values.impact}
              onChange={formik.handleChange}
              placeholder="Select impact"
            >
              {LocalPrioritiesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Priority</FormLabel>
            <Input
              name="priority"
              value={formik.values.priority}
              isReadOnly
              bg="gray.100"
              placeholder="Auto-calculated"
            />
          </FormControl>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Implementation Start</FormLabel>
            <Input
              type="date"
              name="backlogImplementStartdate"
              value={formik.values.backlogImplementStartdate}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Implementation End</FormLabel>
            <Input
              type="date"
              name="backlogImplementEnddate"
              value={formik.values.backlogImplementEnddate}
              onChange={formik.handleChange}
            />
          </FormControl>
        </Grid>

        <HStack spacing={3} w="full" justify="end">
          <Button variant="outline" onClick={() => formik.resetForm()}>
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Updating..."
          >
            Update Backlog
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

interface WorkFlowBacklogsViewProps {
  DataProject: ProjectDataResponse;
  onRefresh: () => void;
  refreshTrigger: number;
}

const WorkFlowBacklogsView = ({
  DataProject,
  onRefresh,
  refreshTrigger,
}: WorkFlowBacklogsViewProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListProjectWorkflowBacklog, ProjectWorkflowBacklogInitialize } =
    useProjects();

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
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Overall Progression State
  const [OverallProgress, setOverallProgress] = useState<number>(0);
  const [ProgressionProgress, setProgressionProgress] = useState<number>(0);
  const [DocumentationProgress, setDocumentationProgress] = useState<number>(0);
  const [TotalLeafNodes, setTotalLeafNodes] = useState<number>(0);
  const [CompletedLeafNodes, setCompletedLeafNodes] = useState<number>(0);
  const [TotalDocNodes, setTotalDocNodes] = useState<number>(0);
  const [CompletedDocNodes, setCompletedDocNodes] = useState<number>(0);

  // Count progression leaf nodes (based on workflowBacklog)
  const countLeafNodes = (
    workflows: ProjectWorkflowResponse[]
  ): { total: number; completed: number } => {
    let totalLeaf = 0;
    let completedLeaf = 0;

    workflows.forEach((workflow) => {
      const hasChildren =
        workflow.workflowChild && workflow.workflowChild.length > 0;

      if (!hasChildren) {
        totalLeaf++;
        if (
          workflow.workflowBacklog &&
          workflow.workflowBacklog.developmentStatus == "DONE" &&
          workflow.workflowBacklog.progressionPercentage == 100
        ) {
          completedLeaf++;
        }
      } else {
        const childCounts = countLeafNodes(workflow.workflowChild!);
        totalLeaf += childCounts.total;
        completedLeaf += childCounts.completed;
      }
    });

    return { total: totalLeaf, completed: completedLeaf };
  };

  // Count documentation leaf nodes (based on workflowValues)
  const countDocumentationNodes = (
    workflows: ProjectWorkflowResponse[]
  ): { total: number; completed: number } => {
    let totalLeaf = 0;
    let completedLeaf = 0;

    workflows.forEach((workflow) => {
      const hasChildren =
        workflow.workflowChild && workflow.workflowChild.length > 0;

      if (!hasChildren) {
        totalLeaf++;
        if (workflow.workflowValues && workflow.workflowValues.length > 0) {
          completedLeaf++;
        }
      } else {
        const childCounts = countDocumentationNodes(workflow.workflowChild!);
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

          // Calculate progression (backlog-based)
          const leafCounts = countLeafNodes(workflowData);
          const progressionPercentage =
            leafCounts.total > 0
              ? Math.round((leafCounts.completed / leafCounts.total) * 100)
              : 0;

          // Calculate documentation (values-based)
          const docCounts = countDocumentationNodes(workflowData);
          const documentationPercentage =
            docCounts.total > 0
              ? Math.round((docCounts.completed / docCounts.total) * 100)
              : 0;

          // Calculate overall average
          const overallPercentage = Math.round(
            (progressionPercentage + documentationPercentage) / 2
          );

          setTotalLeafNodes(leafCounts.total);
          setCompletedLeafNodes(leafCounts.completed);
          setProgressionProgress(progressionPercentage);
          setTotalDocNodes(docCounts.total);
          setCompletedDocNodes(docCounts.completed);
          setDocumentationProgress(documentationPercentage);
          setOverallProgress(overallPercentage);
          setDataWorkflow(workflowData);
          setIsLoadingProcess(false);
        }
      };
      GetWorkflowData();
    }
  }, [DataAuth, refreshTrigger, DataProject, tokenData]);

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Workstage Procurement
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project workstage progression
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
            onClick={onRefresh}
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
          spacing={4}
        >
          {/* Overall Average */}
          <VStack w="full" spacing={2}>
            <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
              <Text fontSize="sm" fontWeight={700}>
                Overall Progression - {OverallProgress}%
              </Text>
              <Text fontSize="xs" color="gray.500">
                Average of Progression & Documentation
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

          {/* Progression Tab Progress */}
          <VStack w="full" spacing={2}>
            <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
              <Text fontSize="sm" fontWeight={600}>
                Progression - {ProgressionProgress}%
              </Text>
              <Text fontSize="sm" fontWeight={500}>
                {CompletedLeafNodes}
                <Text as="span" fontWeight={600} ml={1}>
                  / {TotalLeafNodes} Completed
                </Text>
              </Text>
            </HStack>
            <Progress
              colorScheme={colorProgression(ProgressionProgress)}
              hasStripe
              value={ProgressionProgress}
              w="full"
              rounded={radiusStyle}
            />
          </VStack>

          {/* Documentation Tab Progress */}
          <VStack w="full" spacing={2}>
            <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
              <Text fontSize="sm" fontWeight={600}>
                Documentation - {DocumentationProgress}%
              </Text>
              <Text fontSize="sm" fontWeight={500}>
                {CompletedDocNodes}
                <Text as="span" fontWeight={600} ml={1}>
                  / {TotalDocNodes} Uploaded
                </Text>
              </Text>
            </HStack>
            <Progress
              colorScheme={colorProgression(DocumentationProgress)}
              hasStripe
              value={DocumentationProgress}
              w="full"
              rounded={radiusStyle}
            />
          </VStack>
        </VStack>
      )}

      {/* Tabs Section */}
      <Tabs colorScheme="secondary" w="full">
        <TabList>
          <Tab>Progression</Tab>
          <Tab>Documentations</Tab>
        </TabList>

        <TabPanels>
          {/* Progression Tab */}
          <TabPanel px={0}>
            <WorkflowProgressionContent
              DataProject={DataProject}
              refreshTrigger={refreshTrigger}
            />
          </TabPanel>

          {/* Documentations Tab */}
          <TabPanel px={0}>
            <WorkflowDocumentationContent
              DataProject={DataProject}
              refreshTrigger={refreshTrigger}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

// Dedicated WorkflowBacklogBox component for WorkFlowBacklogsView
interface WorkflowBacklogBoxProps {
  workflow: ProjectWorkflowResponse;
  onRefresh: () => void;
  level: number;
  DataProject: ProjectDataResponse;
}

const WorkflowBacklogBox = ({
  workflow,
  onRefresh,
  level,
  DataProject,
}: WorkflowBacklogBoxProps) => {
  const { colorMode } = useColorMode();
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren =
    workflow.workflowChild && workflow.workflowChild.length > 0;
  const hasValues = workflow.workflowBacklog;
  const shouldShowTable = !hasChildren;

  // Calculate progress for this workflow node
  const calculateProgress = (wf: ProjectWorkflowResponse): number => {
    if (!hasChildren) {
      return hasValues ? 100 : 0;
    }

    if (wf.workflowChild && wf.workflowChild.length > 0) {
      const childProgresses = wf.workflowChild.map((child) =>
        calculateProgress(child)
      );
      return Math.round(
        childProgresses.reduce((sum, progress) => sum + progress, 0) /
        childProgresses.length
      );
    }

    return 0;
  };

  const progress = calculateProgress(workflow);

  return (
    <Box
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      rounded={radiusStyle}
      bg={colorMode === "light" ? "white" : "gray.800"}
      shadow="sm"
    >
      {/* Header */}
      <Flex
        p={4}
        rounded={radiusStyle}
        align="center"
        justify="space-between"
        cursor={hasChildren ? "pointer" : "default"}
        onClick={hasChildren ? () => setIsExpanded(!isExpanded) : undefined}
        _hover={
          hasChildren
            ? { bg: colorMode === "light" ? "gray.50" : "gray.700" }
            : {}
        }
      >
        <HStack spacing={3}>
          {hasChildren && (
            <Box>{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</Box>
          )}
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="md" color="secondary.600">
              {workflow.wfgName}
            </Text>
            {workflow.wfgDesc && (
              <Text fontSize="sm" color="gray.500">
                {workflow.wfgDesc}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack spacing={4}>
          {!hasChildren && (
            <VStack align="end" spacing={1}>
              {/* <Text
                fontSize="sm"
                fontWeight="bold"
                color={colorProgression(progress) + ".500"}
              >
                {progress}%
              </Text>
              <Progress
                value={progress}
                colorScheme={colorProgression(progress)}
                size="sm"
                w="100px"
                rounded="full"
              /> */}
            </VStack>
          )}
        </HStack>
      </Flex>

      {/* Content */}
      {shouldShowTable && (
        <Box p={4} pt={0}>
          <WorkflowBacklogTable
            workflow={workflow}
            onRefresh={onRefresh}
            DataProject={DataProject}
          />
        </Box>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <Box p={4} pt={2}>
          <VStack spacing={3} align="stretch">
            {workflow.workflowChild!.map((child) => (
              <WorkflowBacklogBox
                key={child.id}
                workflow={child}
                onRefresh={onRefresh}
                level={level + 1}
                DataProject={DataProject}
              />
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

// Dedicated table component for workflow values
interface WorkflowBacklogTableProps {
  workflow: ProjectWorkflowResponse;
  onRefresh: () => void;
  DataProject: ProjectDataResponse;
}

const WorkflowBacklogTable = ({
  workflow,
  onRefresh,
  DataProject,
}: WorkflowBacklogTableProps) => {
  const { colorMode } = useColorMode();

  const showToast = useToastHelper();
  const { UpdateBacklog, GetDetailBacklogById } = useRequirements();
  const { ProjectWorkflowBacklogInitialize } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");

  // Edit modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBacklog, setSelectedBacklog] =
    useState<BacklogDataResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  const handleEditBacklog = async (backlog: BacklogDataResponse) => {
    setSelectedBacklog(backlog); // Set initial data
    onOpen();

    // Get token from localStorage
    const token: string = localStorage.getItem("tokenData") as string;

    // Fetch full backlog detail with history
    const backlogDetail = await GetDetailBacklogById(backlog.id, token);
    if (backlogDetail?.statusCode === RES_CODE_OK && backlogDetail.data) {
      setSelectedBacklog(backlogDetail.data);
    }
  };

  const handleUpdateBacklog = async (values: any) => {
    if (!selectedBacklog) return;

    setIsLoading(true);
    const payload = {
      id: selectedBacklog.id,
      backlogName: selectedBacklog.backlogName,
      backlogDesc: values.backlogDesc,
      envSide: selectedBacklog.envSide || null,
      maintenanceCategory: selectedBacklog.maintenanceCategory || null,
      maintenanceType: selectedBacklog.maintenanceType || null,
      rppb: selectedBacklog.rppb,
      licensing: selectedBacklog.licensing,
      backogRegistered: values.backogRegistered,
      backlogStartdate: values.backlogStartdate || null,
      backlogEnddate: values.backlogEnddate || null,
      urgency: values.urgency,
      impact: values.impact,
      priority: values.priority,
      developmentStatus: selectedBacklog.developmentStatus,
      backlogImplementStartdate: values.backlogImplementStartdate || null,
      backlogImplementEnddate: values.backlogImplementEnddate || null,
      reffId: selectedBacklog.reffId,
      posOrder: selectedBacklog.posOrder,
      version: selectedBacklog.version,
      isLive: selectedBacklog.isLive,
    };

    const result = await UpdateBacklog(payload, tokenData);

    if (result?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Backlog updated successfully",
        statusToast: "success",
      });
      onRefresh();
      onClose();
    } else {
      showToast({
        description: result?.message || "Failed to update backlog",
        statusToast: "error",
      });
    }

    setIsLoading(false);
  };

  const handleInitializeWorkflow = async () => {
    if (!tokenData || !workflow.id) return;

    try {
      const payload = { projectWorkflowId: workflow.id };
      const response = await ProjectWorkflowBacklogInitialize(
        payload,
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Workflow initialized successfully",
          statusToast: "success",
        });
        onRefresh();
      } else {
        showToast({
          description: response?.message || "Failed to initialize workflow",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while initializing workflow",
        statusToast: "error",
      });
    }
  };

  if (!workflow.workflowBacklog) {
    return (
      <Box
        p={6}
        textAlign="center"
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        rounded="md"
        border="2px dashed"
        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
      >
        <Text color="gray.500" fontSize="sm">
          No documents available for this workflow
        </Text>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={handleInitializeWorkflow}
          mt={4}
        >
          Initialize works
        </Button>{" "}
      </Box>
    );
  }

  return (
    <>
      <Box
        shadow="md"
        rounded={radiusStyle}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
        overflowX={"auto"}
      >
        <Table
          size="sm"
          // variant="unstyled"
          colorScheme={"secondary"}
        >
          <Thead>
            <Tr>
              <Th py={3} rowSpan={2}>
                Deskripsi
              </Th>
              <Th py={3} rowSpan={2}>
                Deadline
              </Th>
              <Th py={3} colSpan={2} textAlign="center">
                Rencana
              </Th>
              <Th py={3} colSpan={2} textAlign="center">
                Realisasi
              </Th>
              <Th py={3} rowSpan={2}>
                Status
              </Th>
              <Th py={3} rowSpan={2}>
                Progress
              </Th>
              <Th py={3} rowSpan={2} width="200px">
                Actions
              </Th>
            </Tr>
            <Tr>
              <Th py={2} textAlign="center">
                Mulai
              </Th>
              <Th py={2} textAlign="center">
                Selesai
              </Th>
              <Th py={2} textAlign="center">
                Mulai
              </Th>
              <Th py={2} textAlign="center">
                Selesai
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {workflow.workflowBacklog && (
              <Tr>
                <Td py={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="sm">
                      {workflow.workflowBacklog.backlogName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {workflow.workflowBacklog.backlogDesc || "No description"}
                    </Text>
                  </VStack>
                </Td>
                <Td py={3} textAlign="center">
                  {workflow.workflowBacklog.backlogEnddate ? (
                    <DeadlineStatusTag
                      deadline={workflow.workflowBacklog.backlogEnddate}
                      remindBeforeDays={10}
                    />
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      -
                    </Text>
                  )}
                </Td>
                <Td py={3} textAlign="center">
                  <Text fontSize="sm">
                    {workflow.workflowBacklog.backlogStartdate
                      ? new Date(
                        workflow.workflowBacklog.backlogStartdate
                      ).toLocaleDateString()
                      : "-"}
                  </Text>
                </Td>
                <Td py={3} textAlign="center">
                  <Text fontSize="sm">
                    {workflow.workflowBacklog.backlogEnddate
                      ? new Date(
                        workflow.workflowBacklog.backlogEnddate
                      ).toLocaleDateString()
                      : "-"}
                  </Text>
                </Td>
                <Td py={3} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    -
                  </Text>
                </Td>
                <Td py={3} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    -
                  </Text>
                </Td>
                <Td py={3} textAlign="center">
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={priorityColor(
                      workflow.workflowBacklog.developmentStatus
                    )}
                  >
                    {workflow.workflowBacklog.developmentStatus}
                  </Text>
                </Td>
                <Td py={3}>
                  <VStack spacing={1}>
                    <Text fontSize="xs" fontWeight="bold">
                      {workflow.workflowBacklog.progressionPercentage}%
                    </Text>
                    <Progress
                      value={workflow.workflowBacklog.progressionPercentage}
                      colorScheme={colorProgression(
                        workflow.workflowBacklog.progressionPercentage
                      )}
                      size="sm"
                      w="full"
                      rounded="full"
                    />
                  </VStack>
                </Td>
                <Td py={3}>
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      leftIcon={<FiEdit />}
                      onClick={() =>
                        handleEditBacklog(workflow.workflowBacklog!)
                      }
                    >
                      Edit
                    </Button>
                    <Link
                      href={`/kanban?projectId=${DataProject?.id}&backlogId=${workflow.workflowBacklog.id}`}
                    >
                      <Button
                        size="xs"
                        colorScheme="gray"
                        leftIcon={<BsKanban />}
                      >
                        Kanban
                      </Button>
                    </Link>
                  </HStack>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Edit Backlog Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Edit Backlog</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto">
            {selectedBacklog && (
              <>
                {/* Beautiful Backlog Name Highlight */}
                <Box
                  p={4}
                  bg="blue.50"
                  border="1px"
                  borderColor="blue.200"
                  rounded="lg"
                  borderLeft="4px"
                  borderLeftColor="blue.500"
                  mb={4}
                >
                  <HStack spacing={3}>
                    <Box w={3} h={3} bg="blue.500" rounded="full" />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">
                        {selectedBacklog.backlogName}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedBacklog.backlogCode}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Tabs for Edit and History */}
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList bg="gray.100" p={1} rounded={radiusStyle}>
                    <Tab
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <HStack>
                        <FiEdit size={16} />
                        <Text>Edit Details</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <HStack>
                        <FiClock size={16} />
                        <Text>
                          History (
                          {selectedBacklog.backlogHistories?.length || 0})
                        </Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0}>
                      <BacklogEditForm
                        backlog={selectedBacklog}
                        onSubmit={handleUpdateBacklog}
                        isLoading={isLoading}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <BacklogHistoryList
                        histories={selectedBacklog.backlogHistories || []}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Backlog Edit Form Component
interface BacklogEditFormProps {
  backlog: BacklogDataResponse;
  onSubmit: (values: any) => void;
  isLoading: boolean;
}

const BacklogEditForm = ({
  backlog,
  onSubmit,
  isLoading,
}: BacklogEditFormProps) => {
  const formik = useFormik({
    initialValues: {
      backlogDesc: backlog.backlogDesc || "",
      backogRegistered: backlog.backogRegistered || new Date().toISOString(),
      backlogStartdate: backlog.backlogStartdate
        ? backlog.backlogStartdate.split("T")[0]
        : "",
      backlogEnddate: backlog.backlogEnddate
        ? backlog.backlogEnddate.split("T")[0]
        : "",
      urgency: backlog.urgency || "",
      impact: backlog.impact || "",
      priority: backlog.priority || "",
      backlogImplementStartdate: backlog.backlogImplementStartdate
        ? backlog.backlogImplementStartdate.split("T")[0]
        : "",
      backlogImplementEnddate: backlog.backlogImplementEnddate
        ? backlog.backlogImplementEnddate.split("T")[0]
        : "",
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Auto-calculate priority when impact or urgency changes
  useEffect(() => {
    if (formik.values.impact && formik.values.urgency) {
      const calculatedPriority = getPriorityFromMatrix(
        formik.values.impact,
        formik.values.urgency
      );
      if (formik.values.priority !== calculatedPriority) {
        formik.setFieldValue("priority", calculatedPriority);
      }
    }
  }, [formik.values.impact, formik.values.urgency, formik.setFieldValue]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="backlogDesc"
            value={formik.values.backlogDesc}
            onChange={formik.handleChange}
            placeholder="Enter backlog description"
          />
        </FormControl>

        <Grid templateColumns="1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              name="backlogStartdate"
              value={formik.values.backlogStartdate}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              name="backlogEnddate"
              value={formik.values.backlogEnddate}
              onChange={formik.handleChange}
            />
          </FormControl>
        </Grid>

        <Grid templateColumns="1fr 1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Urgency</FormLabel>
            <Select
              name="urgency"
              value={formik.values.urgency}
              onChange={formik.handleChange}
              placeholder="Select urgency"
            >
              {LocalPrioritiesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Impact</FormLabel>
            <Select
              name="impact"
              value={formik.values.impact}
              onChange={formik.handleChange}
              placeholder="Select impact"
            >
              {LocalPrioritiesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Priority</FormLabel>
            <Input
              name="priority"
              value={formik.values.priority}
              isReadOnly
              bg="gray.100"
              placeholder="Will be calculated automatically"
            />
          </FormControl>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4} w="full">
          <FormControl>
            <FormLabel>Implementation Start</FormLabel>
            <Input
              type="date"
              name="backlogImplementStartdate"
              value={formik.values.backlogImplementStartdate}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Implementation End</FormLabel>
            <Input
              type="date"
              name="backlogImplementEnddate"
              value={formik.values.backlogImplementEnddate}
              onChange={formik.handleChange}
            />
          </FormControl>
        </Grid>

        <HStack spacing={3} w="full" justify="end">
          <Button variant="outline" onClick={() => formik.resetForm()}>
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Updating..."
          >
            Update Backlog
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

// User Detail Popover Component
const UserDetailPopover = ({ userId }: { userId: string }) => {
  const [userDetail, setUserDetail] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { GetDetailByUserId } = useUsers();

  const handleFetchUser = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("tokenData") || "";
    try {
      const response = await GetDetailByUserId(userId, token);
      if (response?.data) {
        setUserDetail(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover onOpen={handleFetchUser} placement="left">
      <PopoverTrigger>
        <Text
          fontSize="sm"
          cursor="pointer"
          color="blue.500"
          _hover={{ textDecoration: "underline" }}
        >
          {userId}
        </Text>
      </PopoverTrigger>
      <PopoverContent rounded={radiusStyle}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">User Details</PopoverHeader>
        <PopoverBody>
          {isLoading ? (
            <Flex justify="center" py={4}>
              <Spinner size="sm" />
            </Flex>
          ) : userDetail ? (
            <VStack align="start" spacing={1}>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  User Id
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {userDetail.userId}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  Name
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {userDetail.nama}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  Email
                </Text>
                <Text fontSize="sm">{userDetail.email}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  Jabatan
                </Text>
                <Text fontSize="sm">{userDetail.jabatan || "-"}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  Unit Kerja
                </Text>
                <Text fontSize="sm">{userDetail.namaUnitKerja || "-"}</Text>
              </Box>
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.500">
              No user data available
            </Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

// Backlog History List Component
interface BacklogHistoryListProps {
  histories: BacklogHistoryDataResponse[];
}

const BacklogHistoryList = ({ histories }: BacklogHistoryListProps) => {
  const { colorMode } = useColorMode();

  if (histories.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No history records found</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {histories.map((history, index) => (
        <Box
          key={history.id}
          p={4}
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          rounded={radiusStyle}
          boxShadow={"md"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <HStack justify="space-between" mb={3}>
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Updated at
              </Text>
              <Text fontSize="sm">
                {new Date(history.createdAt).toLocaleString()}
              </Text>
            </VStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Updated by
              </Text>
              <UserDetailPopover userId={history.createdBy} />
            </VStack>
          </HStack>

          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Backlog Name
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {history.backlogName}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Priority
              </Text>
              <Badge colorScheme={priorityColor(history.priority)}>
                {history.priority}
              </Badge>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Start Date
              </Text>
              <Text fontSize="sm">
                {history.backlogStartdate
                  ? new Date(history.backlogStartdate).toLocaleDateString()
                  : "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                End Date
              </Text>
              <Text fontSize="sm">
                {history.backlogEnddate
                  ? new Date(history.backlogEnddate).toLocaleDateString()
                  : "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Urgency / Impact
              </Text>
              <HStack>
                <Badge size="sm">{history.urgency}</Badge>
                <Text>/</Text>
                <Badge size="sm">{history.impact}</Badge>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Development Status
              </Text>
              <Badge>{history.developmentStatus}</Badge>
            </Box>
          </Grid>

          {history.backlogDesc && (
            <Box mt={3}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Description
              </Text>
              <Text fontSize="sm" noOfLines={2}>
                {history.backlogDesc}
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </VStack>
  );
};

// Assign Backlog Modal Component
const AssignBacklogModal = ({
  isOpen,
  onClose,
  availableBacklogs,
  selectedBacklogIds,
  setSelectedBacklogIds,
  onAssign,
  isLoading,
  isLoadingBacklogs,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableBacklogs: BacklogDataResponse[];
  selectedBacklogIds: string[];
  setSelectedBacklogIds: (ids: string[]) => void;
  onAssign: () => void;
  isLoading: boolean;
  isLoadingBacklogs: boolean;
}) => {
  const { colorMode } = useColorMode();
  const [availableFilter, setAvailableFilter] = useState("");

  const toggleBacklog = (backlogId: string) => {
    if (selectedBacklogIds.includes(backlogId)) {
      setSelectedBacklogIds(selectedBacklogIds.filter((id) => id !== backlogId));
    } else {
      setSelectedBacklogIds([...selectedBacklogIds, backlogId]);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const availableIds = filteredAvailable.filter(b => !b.projectId).map(b => b.id);
      setSelectedBacklogIds(availableIds);
    } else {
      setSelectedBacklogIds([]);
    }
  };

  // Separate backlogs
  const assignedBacklogs = availableBacklogs.filter(b => b.projectId !== null);
  const availableOnly = availableBacklogs.filter(b => b.projectId === null);

  const filteredAvailable = availableFilter
    ? availableOnly.filter(b =>
      b.backlogName.toLowerCase().includes(availableFilter.toLowerCase()) ||
      b.backlogDesc?.toLowerCase().includes(availableFilter.toLowerCase())
    )
    : availableOnly;

  const selectedBacklogs = availableBacklogs.filter(b => selectedBacklogIds.includes(b.id));

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "red";
      case "MEDIUM": return "orange";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Assign Backlogs to Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto">
          {isLoadingBacklogs ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Assigned Backlogs */}
              {assignedBacklogs.length > 0 && (
                <Card rounded={radiusStyle}>
                  <CardHeader>
                    <Heading size="md">Already Assigned to Other Projects</Heading>
                    <Text fontSize="sm" color="gray.500">
                      These backlogs are already assigned and cannot be selected
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Backlog Name</Th>
                          <Th>Priority</Th>
                          <Th>Status</Th>
                          <Th>Project ID</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {assignedBacklogs.map((backlog) => (
                          <Tr key={backlog.id} opacity={0.6}>
                            <Td>{backlog.backlogName}</Td>
                            <Td>
                              <Badge colorScheme={priorityColor(backlog.priority)}>
                                {backlog.priority}
                              </Badge>
                            </Td>
                            <Td>{backlog.developmentStatus}</Td>
                            <Td>
                              <Text fontSize="xs" color="gray.500">
                                {backlog.projectId}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              )}

              {/* Available Backlogs */}
              <Card rounded={radiusStyle}>
                <CardHeader>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">
                        Available Backlogs ({filteredAvailable.length})
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        Select backlogs to assign to this project
                      </Text>
                    </VStack>
                    <HStack spacing={3}>
                      <Input
                        placeholder="Search backlogs..."
                        size="sm"
                        onChange={(e) => setAvailableFilter(e.target.value)}
                        value={availableFilter}
                        w="250px"
                      />
                      <Checkbox
                        isChecked={
                          filteredAvailable.length > 0 &&
                          selectedBacklogIds.length === filteredAvailable.length
                        }
                        isIndeterminate={
                          selectedBacklogIds.length > 0 &&
                          selectedBacklogIds.length < filteredAvailable.length
                        }
                        onChange={(e) => toggleAll(e.target.checked)}
                      >
                        Select All
                      </Checkbox>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {filteredAvailable.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      {availableFilter
                        ? `No backlogs found matching "${availableFilter}"`
                        : "No available backlogs to select"}
                    </Text>
                  ) : (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th w="50px">Select</Th>
                          <Th>Backlog Name</Th>
                          <Th>Priority</Th>
                          <Th>Urgency</Th>
                          <Th>Impact</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredAvailable.map((backlog) => (
                          <Tr key={backlog.id}>
                            <Td>
                              <Checkbox
                                isChecked={selectedBacklogIds.includes(backlog.id)}
                                onChange={() => toggleBacklog(backlog.id)}
                              />
                            </Td>
                            <Td>{backlog.backlogName}</Td>
                            <Td>
                              <Badge colorScheme={priorityColor(backlog.priority)}>
                                {backlog.priority}
                              </Badge>
                            </Td>
                            <Td>{backlog.urgency}</Td>
                            <Td>{backlog.impact}</Td>
                            <Td>{backlog.developmentStatus}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>

              {/* Selected Backlogs */}
              {selectedBacklogs.length > 0 && (
                <Card rounded={radiusStyle} borderColor="blue.500" borderWidth="2px">
                  <CardHeader>
                    <Heading size="md">
                      Selected Backlogs ({selectedBacklogs.length})
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      These backlogs will be assigned to the project
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Backlog Name</Th>
                          <Th>Priority</Th>
                          <Th>Urgency</Th>
                          <Th>Impact</Th>
                          <Th>Status</Th>
                          <Th w="50px">Remove</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedBacklogs.map((backlog) => (
                          <Tr key={backlog.id}>
                            <Td>{backlog.backlogName}</Td>
                            <Td>
                              <Badge colorScheme={priorityColor(backlog.priority)}>
                                {backlog.priority}
                              </Badge>
                            </Td>
                            <Td>{backlog.urgency}</Td>
                            <Td>{backlog.impact}</Td>
                            <Td>{backlog.developmentStatus}</Td>
                            <Td>
                              <IconButton
                                aria-label="Remove"
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => toggleBacklog(backlog.id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={onAssign}
            isLoading={isLoading}
            isDisabled={selectedBacklogIds.length === 0 || isLoadingBacklogs}
          >
            Assign {selectedBacklogIds.length > 0 && `(${selectedBacklogIds.length})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectFeatureView;
export { WorkflowBacklogBox };
