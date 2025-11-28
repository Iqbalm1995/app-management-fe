"use client";

import {
  LocalPrioritiesOptions,
  MAX_SIZE_TABLE,
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
} from "@/app/services/useProjects";
import {
  ColumnMetaCustom,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Box,
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
  Progress,
  Stack,
  StackDivider,
  Switch,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
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
  FiChevronDown,
  FiChevronUp,
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
import { Select } from "chakra-react-select";
import useRequirements, {
  BacklogDataResponse,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { HamburgerIcon } from "@chakra-ui/icons";
import { BsKanban } from "react-icons/bs";
import Link from "next/link";

const FormSchemaFeatures = Yup.object().shape({
  projectId: Yup.string().required("Required"),
  featureName: Yup.string().required("Required"),
  featureDesc: Yup.string().nullable(),
  featureSide: Yup.string().nullable(),
  maintenanceCategory: Yup.string().nullable(),
  maintenanceType: Yup.string().nullable(),
  rppb: Yup.string().nullable(),
  licensing: Yup.string().nullable(),
  featureStartDate: Yup.string().nullable(),
  featureEndDate: Yup.string().nullable(),
  urgency: Yup.string().nullable(),
  impact: Yup.string().nullable(),
  priority: Yup.string().nullable(),
  developmentStatus: Yup.string().nullable(),
});

interface ProjectFeatureViewProps {
  DataProject: ProjectDataResponse | null;
}

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

const ProjectFeatureView = ({ DataProject }: ProjectFeatureViewProps) => {
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

  const [RefreshData, setRefreshData] = useState<number>(0);
  // Requirement Data
  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);
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
            <Link href={`/kanban-view`}>
              <Button size={"xs"} colorScheme={"purple"} leftIcon={<FiEye />}>
                Preview
              </Button>
            </Link>
            <Link
              href={`/kanban?projectId=${DataProject?.id}&backlogId=${info.row.original.id}`}
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

      // LOAD BACKLOGS DATA
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

      GetDataRequirement();
      GetDataBacklogsList();
      GetProgression();
    }
  }, [DataAuth, RefreshData, DataProject, globalFilter]);

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
    setDataRequirement(null);
    setDataBacklogsRequirement([]);
    setRefreshData(RefreshData + 1);
  };

  return (
    <Flex w={"full"} as={Stack} spacing={6}>
      {DataProject == null ? (
        <Heading as="h4" size="md">
          Data Invalid
        </Heading>
      ) : (
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
              <Button
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
              >
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
      )}
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
    </Flex>
  );
};

export default ProjectFeatureView;
