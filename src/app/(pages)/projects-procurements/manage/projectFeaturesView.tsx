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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiXCircle,
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
import useLogActivityUsers from "@/app/services/useLogActivityUsers";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { HamburgerIcon } from "@chakra-ui/icons";
import { BsKanban } from "react-icons/bs";
import Link from "next/link";

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

  const { GetProjectBacklogProgression } = useProjects();

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
  } = useRequirements();

  const { GetProjectBacklogProgression } = useProjects();

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

  const { UpdateBacklog, GetDetailBacklogById } = useRequirements();

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
        header: () => <Flex justifyContent={"start"}>Feature</Flex>,
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
          <Flex w={"full"} justifyContent={"center"} as={Wrap}>
            <Button
              size={"xs"}
              colorScheme={"blue"}
              leftIcon={<FiEdit />}
              onClick={() => handleEditBacklog(info.row.original)}
            >
              Edit
            </Button>
            <Link href={`/kanban-view`}>
              <Button size={"xs"} colorScheme={"purple"} leftIcon={<FiEye />}>
                Preview
              </Button>
            </Link>
            <Link
              href={`/kanban?projectId=${DataProject?.id}&backlogId=${info.row.original.id}&from=projects-procurements`}
            >
              <Button size={"xs"} colorScheme={"gray"} leftIcon={<BsKanban />}>
                Go To Kanban
              </Button>
            </Link>
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
      // LOAD BACKLOGS DATA
      const PayloadGetBacklogList: PaggingListPayload = {
        search: globalFilter,
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "reqId",
            operator: "=",
            value: DataProject.reqParentId,
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
    <Flex w={"full"} as={Stack}>
      <Flex w={"full"} as={Stack} spacing={6}>
        <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
          <Heading as="h5" size="md" w={"full"}>
            Data Project Features
          </Heading>

          <Flex
            w={"full"}
            as={HStack}
            justifyContent={"start"}
            alignItems={"end"}
          >
            <Flex w={"full"} as={Stack}>
              <HStack
                divider={<StackDivider borderColor="gray.200" />}
                w={"full"}
              >
                <Text fontSize={"smaller"} fontWeight={600}>
                  Overall Progression -{" "}
                  {ProjectBacklogProgression.progressionBacklog.toString()} %
                </Text>

                <Text fontSize={"smaller"} fontWeight={500}>
                  {ProjectBacklogProgression.totalBacklogsDone}
                  <Text as={"span"} fontWeight={600} ml={1}>
                    / {ProjectBacklogProgression.totalBacklogs} Feature Done
                  </Text>
                </Text>
              </HStack>

              <Progress
                colorScheme={colorProgression(
                  ProjectBacklogProgression.progressionBacklog
                )}
                hasStripe
                value={ProjectBacklogProgression.progressionBacklog}
                w={"full"}
                rounded={radiusStyle}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
          <Flex as={HStack}>
            <Input
              id="backlogSearch"
              name="backlogSearch"
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`Cari Fitur`}
              minLength={3}
              maxLength={150}
            />
          </Flex>
          <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
            <Button leftIcon={<FiRefreshCcw />} onClick={() => RefreshAction()}>
              Refresh
            </Button>
          </Flex>
        </Flex>

        {/* TABLE DATA */}
        <Flex as={Stack} w={"full"} spacing={5}>
          {IsLoadingProcess ? (
            <LoadingMiniSignature />
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
                      <Text fontSize="sm" color="gray.600">
                        {selectedBacklog.backlogCode}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Tabs for Edit and History */}
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList bg="gray.100" p={1} rounded="md">
                    <Tab
                      rounded="md"
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <HStack>
                        <FiEdit size={16} />
                        <Text>Edit Details</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      rounded="md"
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
    </Flex>
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
  const [TotalLeafNodes, setTotalLeafNodes] = useState<number>(0);
  const [CompletedLeafNodes, setCompletedLeafNodes] = useState<number>(0);

  // Count all leaf nodes (nodes without children) recursively
  const countLeafNodes = (
    workflows: ProjectWorkflowResponse[]
  ): { total: number; completed: number } => {
    let totalLeaf = 0;
    let completedLeaf = 0;

    workflows.forEach((workflow) => {
      const hasChildren =
        workflow.workflowChild && workflow.workflowChild.length > 0;

      if (!hasChildren) {
        // This is a leaf node - count it
        totalLeaf++;
        if (
          workflow.workflowBacklog &&
          workflow.workflowBacklog.developmentStatus == "DONE" &&
          workflow.workflowBacklog.progressionPercentage == 100
        ) {
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
          spacing={3}
        >
          <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
            <Text fontSize="sm" fontWeight={600}>
              Overall Progression - {OverallProgress}%
            </Text>
            <Text fontSize="sm" fontWeight={500}>
              {CompletedLeafNodes}
              <Text as="span" fontWeight={600} ml={1}>
                / {TotalLeafNodes} Completed
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
            <WorkflowBacklogBox
              key={workflow.id}
              workflow={workflow}
              onRefresh={onRefresh}
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
            No workflow documentation available
          </Text>
        </Box>
      )}
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
  const { UpdateBacklog } = useRequirements();
  const { ProjectWorkflowBacklogInitialize } = useProjects();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBacklog, setSelectedBacklog] =
    useState<BacklogDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  const handlePreviewBacklog = (backlog: BacklogDataResponse) => {
    console.log("Preview button clicked", backlog);
    setSelectedBacklog(backlog);
    onOpen();
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
      rppb: selectedBacklog.rppb || "",
      licensing: selectedBacklog.licensing || "",
      backogRegistered: values.backogRegistered,
      backlogStartdate: values.backlogStartdate,
      backlogEnddate: values.backlogEnddate,
      urgency: values.urgency,
      impact: values.impact,
      priority: values.priority,
      developmentStatus: selectedBacklog.developmentStatus || "",
      backlogImplementStartdate: values.backlogImplementStartdate || null,
      backlogImplementEnddate: values.backlogImplementEnddate || null,
      reffId: selectedBacklog.reffId || null,
      posOrder: selectedBacklog.posOrder || 0,
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
                        handlePreviewBacklog(workflow.workflowBacklog!)
                      }
                    >
                      Edit
                    </Button>
                    <Link
                      href={`/kanban?projectId=${DataProject?.id}&backlogId=${workflow.workflowBacklog.id}&from=projects-procurements`}
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

      {/* Backlog Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Backlog Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
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
                <BacklogEditForm
                  backlog={selectedBacklog}
                  onSubmit={handleUpdateBacklog}
                  isLoading={isLoading}
                />
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

export default ProjectFeatureView;
