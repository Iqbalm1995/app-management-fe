"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ORG_CATEGORY_KEY_GROUP,
  DIVISION_ID_IT_BJB,
  GROUP_CONST_BRD_STATUS,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  getCurrentQuarter,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  UserEvaluationReportListResponse,
  MyPerformanceSummaryResponse,
  MyPerformanceQuartalChartResponse,
} from "@/app/services/useReports";
import { RequirementsResponse } from "@/app/services/useRequirements";
import useWorkspace from "@/app/services/useWorkspace";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  addParamFilterUpdate,
  ListSearchByParamProps,
  PaggingListPayloadCustom,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Progress,
  Select as ChakraSelect,
  SimpleGrid,
  Text,
  useColorMode,
  VStack,
  Stack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  FiRefreshCcw,
  FiDownload,
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiFolder,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiAward,
  FiBarChart2,
  FiEye,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { TableComponentFull } from "@/app/components/tableComponents";
import { exportMyPerformancePDF } from "@/app/helper/MyPerformancePdfExport";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { motion } from "framer-motion";
import EvaluationAdjustModal from "../shared/EvaluationAdjustModal";
import Link from "next/link";
import LabelMaster from "@/app/components/labelMasterProps";
import { StatusBadge } from "@/app/components/StatusBadge";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MotionCard = motion(Card);

// Header content is derived from mode prop inside component

// ─── Default fallback (used until API responds) ───────────────────────────────
const DEFAULT_SUMMARY: MyPerformanceSummaryResponse = {
  totalProjects: 0,
  projectActive: 0,
  projectClose: 0,
  projectInternalDev: 0,
  projectInternalDevClose: 0,
  projectProcurement: 0,
  projectProcurementClose: 0,
  projectRfc: 0,
  projectRfcClose: 0,
  projectDeployment: 0,
  projectDeploymentClose: 0,
  totalRequirements: 0,
  requirementBrd: 0,
  requirementRfc: 0,
  totalTaskAssigned: 0,
  totalTaskCompleted: 0,
  taskPriorityHigh: 0,
  taskPriorityMedium: 0,
  taskPriorityLow: 0,
  totalTaskItemCompleted: 0,
  taskTodo: 0,
  taskInProgress: 0,
  taskInReview: 0,
  taskDone: 0,
  totalTaskItems: 0,
};

const DEFAULT_QUARTAL: MyPerformanceQuartalChartResponse = {
  year: new Date().getFullYear(),
  chart: [
    { quarter: "Q1", activeCount: 0, closedCount: 0 },
    { quarter: "Q2", activeCount: 0, closedCount: 0 },
    { quarter: "Q3", activeCount: 0, closedCount: 0 },
    { quarter: "Q4", activeCount: 0, closedCount: 0 },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

export type PortfolioMode = "my" | "division" | "group" | "team";

interface PerformancePortfolioViewProps {
  mode: PortfolioMode;
}

const getPortfolioConfig = (mode: PortfolioMode) => {
  switch (mode) {
    case "my":
      return {
        title: "My Performance",
        breadCrumb: ["Home", "Performances", "My Performance"],
        backUrl: "",
        backLabel: "",
      };
    case "division":
      return {
        title: "User Performance Detail",
        breadCrumb: ["Home", "Performances", "Divisions", "Detail"],
        backUrl: "/performances/divisions",
        backLabel: "← Back to Division Performance",
      };
    case "group":
      return {
        title: "User Performance Detail",
        breadCrumb: ["Home", "Performances", "Groups", "Detail"],
        backUrl: "/performances/groups",
        backLabel: "← Back to Group Performance",
      };
    case "team":
      return {
        title: "User Performance Detail",
        breadCrumb: ["Home", "Performances", "Teams", "Detail"],
        backUrl: "/performances/teams",
        backLabel: "← Back to Team Performance",
      };
  }
};

export default function PerformancePortfolioView({
  mode,
}: PerformancePortfolioViewProps) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const portfolioConfig = getPortfolioConfig(mode);
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [CurrentUserId, setCurrentUserId] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  const {
    ListUserEvaluationReport,
    ExportUserEvaluationReportExcel,
    isLoading: reportsLoading,
    GetMyPerformanceSummary,
    GetMyPerformanceQuartalChart,
    GetMyPerformanceRequirements,
  } = useReports();
  const { GetAssignedProjects } = useWorkspace();
  const { GetAssignedProjects: GetAssignedProjectsFull } = useProjects();
  const { List: ListOrganization } = useOrganization();
  const { List: ListTeams } = useTeams();

  const lineChartRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (!DataAuth || !tokenData) return;
    setIsExportingPdf(true);
    try {
      const projRes = await GetAssignedProjects(
        {
          search: "",
          limit: 9999,
          page: 0,
          projectType: null,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        },
        tokenData,
      );
      const allProjects =
        projRes?.statusCode === RES_CODE_OK && projRes.data ? projRes.data : [];
      await exportMyPerformancePDF({
        auth: DataAuth,
        summary: Summary,
        quartalChart: QuartalChart,
        projects: allProjects,
        evaluations: DataReport,
        selectedYear,
        selectedQuarters,
      });
    } catch {
      showToast({ description: "Failed to export PDF", statusToast: "error" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const [DataReport, setDataReport] = useState<
    UserEvaluationReportListResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [UserIdFilter, setUserIdFilter] = useState<string>("");
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([
    {
      field: "projectStatus",
      operator: "=",
      value: "PROJECT_CLOSED",
      filterLabel: "Project Status",
    },
  ]);
  const [FilterProjectStatus, setFilterProjectStatus] =
    useState<string>("PROJECT_CLOSED");
  const [GroupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [TeamOptions, setTeamOptions] = useState<TeamsResponse[]>([]);

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarters, setSelectedQuarters] = useState<number[]>([
    currentQuarter,
  ]);
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserEvaluationReportListResponse | null>(null);

  const handleOpenEvaluationModal = (
    user: UserEvaluationReportListResponse,
  ) => {
    setSelectedUser(user);
    setIsEvaluationModalOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth setup
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
      setCurrentUserId(UserData.userId);
      const effectiveUserId =
        mode === "my" ? UserData.userId : urlUserId || UserData.userId;
      setUserIdFilter(effectiveUserId);
      setParamFilter([
        {
          field: "userId",
          operator: "=",
          value: effectiveUserId,
          filterLabel: "User ID Filter",
        },
        {
          field: "projectStatus",
          operator: "=",
          value: "PROJECT_CLOSED",
          filterLabel: "Project Status",
        },
      ]);
    }
    if (token) setTokenData(token);
  }, [DataAuth]);

  // Summary + quartal chart state
  const [Summary, setSummary] =
    useState<MyPerformanceSummaryResponse>(DEFAULT_SUMMARY);
  const [QuartalChart, setQuartalChart] =
    useState<MyPerformanceQuartalChartResponse>(DEFAULT_QUARTAL);
  const [IsSummaryLoading, setIsSummaryLoading] = useState(false);

  // Fetch summary + quartal chart when auth + year ready
  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    const fetchPortfolio = async () => {
      setIsSummaryLoading(true);
      try {
        const [summaryRes, quartalRes] = await Promise.all([
          GetMyPerformanceSummary(UserIdFilter, selectedYear, tokenData),
          GetMyPerformanceQuartalChart(UserIdFilter, selectedYear, tokenData),
        ]);
        if (summaryRes?.statusCode === RES_CODE_OK && summaryRes.data)
          setSummary(summaryRes.data);
        if (quartalRes?.statusCode === RES_CODE_OK && quartalRes.data)
          setQuartalChart(quartalRes.data);
      } catch {
        /* silent — keep defaults */
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchPortfolio();
  }, [DataAuth, tokenData, selectedYear, UserIdFilter]);

  // Requirements assigned list
  const [DataRequirements, setDataRequirements] = useState<
    RequirementsResponse[]
  >([]);
  const [reqTotalCount, setReqTotalCount] = useState(0);
  const [reqTotalPages, setReqTotalPages] = useState(0);
  const [IsReqLoading, setIsReqLoading] = useState(false);
  const REQ_PAGE_SIZE = 5;
  const [{ pageIndex: reqPageIndex, pageSize: reqPageSize }, setReqPagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: REQ_PAGE_SIZE });
  const reqPagination = useMemo(
    () => ({ pageIndex: reqPageIndex, pageSize: reqPageSize }),
    [reqPageIndex, reqPageSize],
  );

  // Assigned projects portfolio
  const [DataAssignedProjects, setDataAssignedProjects] = useState<
    ProjectDataResponse[]
  >([]);
  const [assignedProjTotal, setAssignedProjTotal] = useState(0);
  const [assignedProjTotalPages, setAssignedProjTotalPages] = useState(0);
  const [isAssignedProjLoading, setIsAssignedProjLoading] = useState(false);
  const PROJ_PAGE_SIZE = 10;
  const [
    { pageIndex: projPageIndex, pageSize: projPageSize },
    setProjPagination,
  ] = useState<PaginationState>({ pageIndex: 0, pageSize: PROJ_PAGE_SIZE });
  const projPagination = useMemo(
    () => ({ pageIndex: projPageIndex, pageSize: projPageSize }),
    [projPageIndex, projPageSize],
  );

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    const fetchReqs = async () => {
      setIsReqLoading(true);
      try {
        const res = await GetMyPerformanceRequirements(
          UserIdFilter,
          {
            search: "",
            limit: reqPageSize,
            page: reqPageIndex,
            filterWhere: [],
            fieldOrder: ["createdAt"],
            orderDir: "desc",
          },
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setDataRequirements(res.data as RequirementsResponse[]);
          setReqTotalCount(res.countTotal ?? 0);
          setReqTotalPages(
            res.countTotal ? Math.ceil(res.countTotal / reqPageSize) : 0,
          );
        }
      } catch {
        /* silent */
      } finally {
        setIsReqLoading(false);
      }
    };
    fetchReqs();
  }, [DataAuth, tokenData, reqPageIndex]);

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    const fetchProjects = async () => {
      setIsAssignedProjLoading(true);
      try {
        const res = await GetAssignedProjectsFull(
          {
            search: "",
            limit: projPageSize,
            page: projPageIndex,
            filterWhere: [],
            fieldOrder: ["projectRegisterDate"],
            orderDir: "desc",
          },
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setDataAssignedProjects(res.data);
          setAssignedProjTotal((res as any).countTotal ?? 0);
          setAssignedProjTotalPages(
            (res as any).countTotal
              ? Math.ceil((res as any).countTotal / projPageSize)
              : 0,
          );
        }
      } catch {
        /* silent */
      } finally {
        setIsAssignedProjLoading(false);
      }
    };
    fetchProjects();
  }, [DataAuth, tokenData, projPageIndex]);

  const reqColumns = useMemo<ColumnDef<RequirementsResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="start" h={"full"}>
            <Text fontSize="md">
              {reqPageIndex * reqPageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.reqNarative,
        id: "reqNarative",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex
              as={Stack}
              w="full"
              spacing={2}
              display={info.row.original.isHaveMemo === "N" ? "flex" : "none"}
            >
              <Flex
                as={HStack}
                spacing={2}
                color="red.500"
                alignItems="center"
                fontSize={"x-small"}
              >
                <FiAlertTriangle />
                <Text>
                  {info.row.original.requirementType} Belum ada Memo Pengantar
                </Text>
                <Badge
                  colorScheme={
                    info.row.original.requirementType === "RFC"
                      ? "orange"
                      : "blue"
                  }
                  variant="subtle"
                  fontSize="2xs"
                  rounded="sm"
                  px={2}
                >
                  {info.row.original.requirementType}
                </Badge>
              </Flex>
              <Flex as={Stack} spacing={0}>
                <Text>{info.row.original.reqNarative}</Text>
              </Flex>
            </Flex>
            <Flex
              as={Stack}
              spacing={2}
              display={info.row.original.isHaveMemo == "Y" ? "flex" : "none"}
            >
              <Flex as={Stack} spacing={0}>
                <HStack>
                  <Text fontWeight={600}>{info.row.original.reqNumber}</Text>
                  <Badge
                    colorScheme={
                      info.row.original.requirementType === "RFC"
                        ? "orange"
                        : "blue"
                    }
                    variant="subtle"
                    fontSize="2xs"
                    rounded="sm"
                    px={2}
                  >
                    {info.row.original.requirementType}
                  </Badge>
                </HStack>

                <Text>{info.row.original.reqNarative}</Text>
              </Flex>
              <Flex as={Stack} spacing={0}>
                <Text>Divisi Pengirim :</Text>
                <Text fontWeight={600}>
                  {info.row.original.senderDivisionName}
                </Text>
              </Flex>
              <Flex pt={2}>
                {info.row.original.isCarryOver == "Y" && (
                  <Badge
                    variant="solid"
                    colorScheme="purple"
                    fontSize={"small"}
                    rounded={radiusStyle}
                    px={4}
                  >
                    CARRYOVER
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Perihal</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.reqInititateDate,
        id: "reqInititateDate",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text fontSize={"x-small"}>Memo Dibuat :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqInititateDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqInititateDate,
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text fontSize={"x-small"}>Memo Diterima :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqAcceptedDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqAcceptedDate,
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text fontSize={"x-small"}>Ditugaskan Pada :</Text>
              <Text fontWeight={600}>
                {info.row.original.assignedToDate
                  ? stringToDateFormatedReverse(
                      info.row.original.assignedToDate,
                    )
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.appInitialName,
        id: "appInitialName",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={2}>
              <Flex as={Stack} spacing={0}>
                {info?.row?.original?.appInitialCode &&
                info.row.original.appInitialCode.trim() !== "" ? (
                  <>
                    <Text fontWeight={600}>
                      ({info.row.original.appInitialCode})
                    </Text>
                    <Text fontWeight={600}>
                      {info.row.original.appInitialName}
                    </Text>
                  </>
                ) : (
                  <Text
                    color="gray.500"
                    fontStyle="italic"
                    fontSize={"x-small"}
                  >
                    Product Belum Disematkan
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>PRODUK</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.reqStatus,
        id: "reqStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={1}>
              {info.row.original.reqStatus ? (
                <LabelMaster
                  groupLabel={GROUP_CONST_BRD_STATUS}
                  labelName={info.row.original.reqStatus}
                />
              ) : (
                "-"
              )}
            </Flex>
            <Text>
              Next Step :
              <Text as="span" fontWeight="bold" pl={1}>
                {info.row.original.nextStep}
              </Text>
            </Text>
          </Flex>
        ),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.id,
        id: "actions",
        cell: (info) => {
          const status = info.row.original.reqStatus;
          const isHaveMemo = info.row.original.isHaveMemo;

          return (
            <Flex w={"full"} justifyContent={"center"}>
              <VStack spacing={1} w="full">
                {/* Preview - All access for all statuses */}
                <Link
                  href={`/requirements/detail?reqId=${info.row.original.id}&type=${info.row.original.requirementType}`}
                  style={{ width: "100%" }}
                  target="_blank"
                >
                  <Button
                    leftIcon={<FiEye />}
                    bg="purple.50"
                    color="purple.700"
                    size="xs"
                    py={4}
                    fontSize="sm"
                    w="full"
                    _hover={{
                      bg: "purple.300",
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    Preview
                  </Button>
                </Link>

                {/* CANCEL: Only Preview (already shown above) */}
              </VStack>
            </Flex>
          );
        },
        header: () => "",
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        },
      },
    ],
    [colorMode, reqPageIndex, reqPageSize],
  );

  const reqTable = useReactTable({
    data: DataRequirements,
    columns: reqColumns,
    pageCount: reqTotalPages,
    state: { pagination: reqPagination },
    onPaginationChange: setReqPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
  });

  const projColumns = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center">
            <Text fontSize="sm">
              {projPageIndex * projPageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.projectName,
        id: "projectInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="250px"
          >
            <Text fontWeight={600} fontSize="sm">
              {info.row.original.projectNo}
            </Text>
            <Text fontSize="sm">{info.row.original.projectName}</Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.projectCategory} |{" "}
              {info.row.original.projectType}
            </Text>
            {info.row.original.requirementData?.requirementType && (
              <Text fontSize="xs" color="blue.500">
                Requirement Type:{" "}
                {info.row.original.requirementData.requirementType}
              </Text>
            )}
            {info.row.original.projectType === "PROCUREMENT" &&
              !info.row.original.requirementData && (
                <Text fontSize="xs" color="orange.500">
                  Pengadaan Internal IT
                </Text>
              )}
          </Flex>
        ),
        header: () => <span>Project Information</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.proOwnerDivisionName,
        id: "organization",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={0}
            minW="200px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Project Owner Division:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proOwnerDivisionName || "-"}
              </Text>
            </Flex>

            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Group In Division IT:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proManageByGroupName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Organization Structure</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.projectStatus,
        id: "projectStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="160px"
          >
            <StatusBadge
              status={info.row.original.projectStatus}
              variant="solid"
              rounded={radiusStyle}
              px={3}
              py={1}
            />
            <Text fontSize="xs">
              Progress: {info.row.original.projectStatusPercentage}%
            </Text>
            <Text fontSize="xs">
              Duration: {info.row.original.projectDurationDays} days
            </Text>
            {info.row.original.projectRegisterDate && (
              <Text fontSize="xs" color="gray.500">
                Registered:{" "}
                {stringToDateFormatedReverse(
                  info.row.original.projectRegisterDate,
                )}
              </Text>
            )}
            {info.row.original.projectClosedDate && (
              <Text fontSize="xs" color="gray.500">
                Closed:{" "}
                {stringToDateFormatedReverse(
                  info.row.original.projectClosedDate,
                )}
              </Text>
            )}
          </Flex>
        ),
        header: () => <span>Status & Timeline</span>,
        footer: (props) => props.column.id,
      },

      {
        accessorFn: (row) => row.sdlcId,
        id: "sdlcStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="150px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                SDLC Stage:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.sdlcStageName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                App Short Name (Initial):
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.appsProject?.appShortName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                App Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.appsProject?.appName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>SDLC & Application</span>,
        size: 150,
      },

      {
        id: "actions",
        header: () => "",
        cell: (info) => (
          <a
            href={`/projects/preview?projectId=${info.row.original.id}`}
            target="_blank"
          >
            <Badge
              colorScheme="blue"
              variant="ghost"
              cursor="pointer"
              fontSize="xs"
            >
              <Button
                leftIcon={<FiEye />}
                bg="purple.50"
                color="purple.700"
                size="xs"
                py={4}
                fontSize="sm"
                w="full"
                _hover={{
                  bg: "purple.300",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
              >
                Preview
              </Button>
            </Badge>
          </a>
        ),
      },
    ],
    [colorMode, projPageIndex, projPageSize],
  );

  const projTable = useReactTable({
    data: DataAssignedProjects,
    columns: projColumns,
    pageCount: assignedProjTotalPages,
    state: { pagination: projPagination },
    onPaginationChange: setProjPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
  });

  // Year/Quarter filter sync
  useEffect(() => {
    let updatedFilters = ParamFilter.filter(
      (f) => f.field !== "yearPeriod" && f.field !== "quartalPeriod",
    );
    // Only add year filter if not "All Data" (0)
    if (selectedYear > 0) {
      updatedFilters = addParamFilterUpdate(updatedFilters, {
        field: "yearPeriod",
        operator: "=",
        value: selectedYear.toString(),
        filterLabel: "Year Filter",
      });
    }
    // Use first selected quarter for filter (skip if All Data)
    if (selectedYear > 0 && selectedQuarters.length === 1) {
      updatedFilters = addParamFilterUpdate(updatedFilters, {
        field: "quartalPeriod",
        operator: "=",
        value: selectedQuarters[0].toString(),
        filterLabel: "Quarter Filter",
      });
    } else {
      updatedFilters = updatedFilters.filter(
        (f) => f.field !== "quartalPeriod",
      );
    }
    setParamFilter(updatedFilters);
  }, [selectedYear, selectedQuarters]);

  // Data fetch
  useEffect(() => {
    if (DataAuth && tokenData && UserIdFilter) {
      let finalFilters = ParamFilter.filter((f) => f.field !== "userId");
      finalFilters.unshift({
        field: "userId",
        operator: "=",
        value: UserIdFilter,
        filterLabel: "User ID Filter",
      });
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: 99999,
        page: 0,
        filterWhere: finalFilters,
        fieldOrder: ["nama"],
        orderDir: "asc",
      };
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListUserEvaluationReport(
          PayloadList,
          tokenData,
        );
        if (requestData?.statusCode !== RES_CODE_OK || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }
        setDataReport(requestData.data as UserEvaluationReportListResponse[]);
        setIsLoadingProcess(false);
      };
      GetDataList();
    }
  }, [
    DataAuth,
    RefreshData,
    globalFilter,
    ParamFilter,
    tokenData,
    UserIdFilter,
  ]);

  const RefreshAction = () => {
    setDataReport([]);
    setRefreshData((p) => p + 1);
  };

  const handleExportToExcel = async () => {
    if (!DataReport.length) {
      showToast({ description: "No data to export", statusToast: "warning" });
      return;
    }
    setIsExporting(true);
    try {
      const blob = await ExportUserEvaluationReportExcel(DataReport);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `My_Performance_${selectedYear}_Q${selectedQuarters.join("-")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast({
          description: "Exported successfully",
          statusToast: "success",
        });
      }
    } catch {
      showToast({ description: "Export failed", statusToast: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const statusOptions = useMemo(
    () => [
      { value: "PROJECT_ACTIVE", label: "Project Active" },
      { value: "PROJECT_CLOSED", label: "Project Closed" },
    ],
    [],
  );

  const totalGrandTotal = useMemo(
    () => DataReport.reduce((s, i) => s + (i.evGrandTotal || 0), 0),
    [DataReport],
  );
  const averagePoints = useMemo(
    () => (DataReport.length ? totalGrandTotal / DataReport.length : 0),
    [totalGrandTotal, DataReport.length],
  );

  const isDark = colorMode === "dark";

  // Profile info: use target user data from report when viewing another user
  const isViewingOther = mode !== "my" && !!urlUserId;
  const profileInfo = useMemo(() => {
    if (isViewingOther && DataReport.length > 0) {
      const r = DataReport[0];
      return {
        nama: r.nama,
        nip: r.nip,
        jabatan: r.jabatan || "—",
        namaUnitKerja: r.namaUnitKerja || "—",
        profilePict: null,
      };
    }
    return {
      nama: DataAuth?.nama || "—",
      nip: DataAuth?.nip || "—",
      jabatan: DataAuth?.jabatan || "—",
      namaUnitKerja: DataAuth?.namaUnitKerja || "—",
      profilePict: DataAuth?.profilePict || null,
    };
  }, [isViewingOther, DataReport, DataAuth]);
  const cardBg = isDark ? "gray.800" : "white";
  const borderCol = isDark ? "gray.700" : "gray.200";
  const textMuted = isDark ? "gray.400" : "gray.500";

  // ─── Chart configs ────────────────────────────────────────────────────────
  const lineChartOptions: any = {
    chart: {
      type: "line",
      id: "my-performance-line-chart",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: QuartalChart.chart.map((p) => p.quarter) },
    colors: ["#3182CE", "#48BB78"],
    legend: { position: "top" },
    grid: { borderColor: isDark ? "#2D3748" : "#E2E8F0" },
    theme: { mode: isDark ? "dark" : "light" },
    tooltip: { theme: isDark ? "dark" : "light" },
    dataLabels: { enabled: true },
  };

  const donutOptions: any = {
    chart: { type: "donut", background: "transparent" },
    labels: ["Internal Dev", "Procurement", "RFC"],
    colors: ["#3182CE", "#805AD5", "#ED8936"],
    legend: { position: "bottom" },
    theme: { mode: isDark ? "dark" : "light" },
    tooltip: { theme: isDark ? "dark" : "light" },
    plotOptions: { pie: { donut: { size: "65%" } } },
  };

  // ─── Stat card helper ─────────────────────────────────────────────────────
  const StatCard = ({
    label,
    value,
    color,
    icon,
  }: {
    label: string;
    value: number;
    color: string;
    icon: any;
  }) => (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderCol}
      rounded="xl"
      shadow="sm"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody p={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bg={`${color}.500`}
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={`${color}.500`}
              lineHeight="1"
            >
              {value}
            </Text>
            <Text fontSize="xs" color={textMuted} fontWeight="medium">
              {label}
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={portfolioConfig.title}
        breadCrumb={portfolioConfig.breadCrumb}
      />

      <Box px={{ base: 4, md: 6 }} pb={8}>
        <VStack spacing={6} align="stretch">
          {/* Back button when viewing another user */}
          {isViewingOther && portfolioConfig.backUrl && (
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blue"
                rounded="lg"
                as="a"
                href={portfolioConfig.backUrl}
              >
                {portfolioConfig.backLabel}
              </Button>
              <Badge colorScheme="blue" variant="subtle" rounded="full" px={3}>
                Viewing: {urlUserId}
              </Badge>
            </HStack>
          )}
          {/* ── Hero / Profile Banner ── */}
          <Box
            position="relative"
            bg={cardBg}
            rounded={radiusStyle}
            shadow="xl"
            border="1px"
            borderColor={borderCol}
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="6px"
              bgGradient="linear(to-r, blue.500, purple.500, pink.400)"
            />
            <Box
              position="absolute"
              top="-30px"
              right="40px"
              w="120px"
              h="120px"
              bg={isDark ? "whiteAlpha.50" : "blue.50"}
              rounded="full"
            />
            <Box
              position="absolute"
              bottom="-20px"
              right="160px"
              w="80px"
              h="80px"
              bg={isDark ? "whiteAlpha.50" : "purple.50"}
              rounded="full"
            />

            <Box p={6} position="relative" zIndex={1}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={5}>
                  <Avatar
                    size="xl"
                    name={profileInfo.nama}
                    src={profileInfo.profilePict || undefined}
                    border="3px solid"
                    borderColor="blue.400"
                  />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color={isDark ? "white" : "gray.800"}>
                      {profileInfo.nama}
                    </Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="blue" rounded="full" px={2}>
                        {profileInfo.nip}
                      </Badge>
                      <Badge
                        colorScheme="purple"
                        rounded="full"
                        px={2}
                        variant="subtle"
                      >
                        {profileInfo.jabatan}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="blue.400" fontWeight="medium">
                      {profileInfo.namaUnitKerja}
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </Box>
          </Box>

          {/* ── Summary Stats ── */}
          <Box>
            <HStack mb={3} spacing={2}>
              <Icon as={FiBarChart2} color="blue.500" />
              <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                Portfolio Summary
              </Heading>
              <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                Realtime
              </Badge>
            </HStack>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3}>
              <StatCard
                label="Requirements"
                value={Summary.totalRequirements}
                color="purple"
                icon={FiClipboard}
              />
              <StatCard
                label="Total Projects"
                value={Summary.totalProjects}
                color="blue"
                icon={FiFolder}
              />
              <StatCard
                label="Active Projects"
                value={Summary.projectActive}
                color="green"
                icon={FiTarget}
              />
              <StatCard
                label="Closed Projects"
                value={Summary.projectClose}
                color="gray"
                icon={FiCheckCircle}
              />
              <StatCard
                label="Tasks Assigned"
                value={Summary.totalTaskAssigned}
                color="orange"
                icon={FiBriefcase}
              />
              <StatCard
                label="Tasks Completed"
                value={Summary.totalTaskCompleted}
                color="teal"
                icon={FiAward}
              />
            </SimpleGrid>
          </Box>

          {/* ── Project Type Breakdown ── */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {[
              {
                label: "Internal Dev",
                total: Summary.projectInternalDev,
                close: Summary.projectInternalDevClose,
                color: "blue",
              },
              {
                label: "Procurement",
                total: Summary.projectProcurement,
                close: Summary.projectProcurementClose,
                color: "purple",
              },
              {
                label: "RFC",
                total: Summary.projectRfc,
                close: Summary.projectRfcClose,
                color: "orange",
              },
              {
                label: "Deployment",
                total: Summary.projectDeployment,
                close: Summary.projectDeploymentClose,
                color: "gray",
              },
            ].map(({ label, total, close, color }) => {
              const active = total - close;
              const closePct =
                total > 0 ? Math.round((close / total) * 100) : 0;
              return (
                <Card
                  key={label}
                  bg={cardBg}
                  border="1px"
                  borderColor={borderCol}
                  rounded="xl"
                  shadow="sm"
                  _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <CardBody p={4}>
                    <VStack align="start" spacing={3}>
                      {/* Header */}
                      <HStack justify="space-between" w="full">
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={isDark ? "white" : "gray.700"}
                        >
                          {label}
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={`${color}.500`}
                        >
                          {total}
                        </Text>
                      </HStack>

                      {/* Stacked progress bar: colored = close, gray = active */}
                      <Box w="full">
                        <Box
                          h="10px"
                          bg={isDark ? "gray.600" : "gray.200"}
                          rounded="full"
                          overflow="hidden"
                          position="relative"
                        >
                          <Box
                            h="full"
                            w={`${closePct}%`}
                            bg={`${color}.500`}
                            rounded="full"
                            transition="width 0.4s ease"
                          />
                        </Box>
                      </Box>

                      {/* Stats row */}
                      <HStack justify="space-between" w="full">
                        <HStack spacing={1}>
                          <Box w={2} h={2} bg={`${color}.500`} rounded="full" />
                          <Text fontSize="xs" color={textMuted}>
                            Close
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={`${color}.500`}
                          >
                            {close}
                          </Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Box
                            w={2}
                            h={2}
                            bg={isDark ? "gray.500" : "gray.300"}
                            rounded="full"
                          />
                          <Text fontSize="xs" color={textMuted}>
                            Active
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={textMuted}
                          >
                            {active}
                          </Text>
                        </HStack>
                      </HStack>

                      {/* Legend */}
                      <Box
                        w="full"
                        pt={1}
                        borderTop="1px"
                        borderColor={borderCol}
                      >
                        <HStack spacing={3} justify="center">
                          <HStack spacing={1}>
                            <Box w={3} h={3} bg={`${color}.500`} rounded="sm" />
                            <Text fontSize="2xs" color={textMuted}>
                              Closed ({closePct}%)
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Box
                              w={3}
                              h={3}
                              bg={isDark ? "gray.600" : "gray.200"}
                              rounded="sm"
                            />
                            <Text fontSize="2xs" color={textMuted}>
                              Active ({100 - closePct}%)
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* ── Charts Row ── */}
          <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={5}>
            {/* Line Chart */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderCol}
              rounded={radiusStyle}
              shadow="sm"
            >
              <CardBody p={5}>
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Icon as={FiTrendingUp} color="blue.500" />
                      <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                        Project Quartal Progress
                      </Heading>
                    </HStack>
                    <Text fontSize="xs" color={textMuted}>
                      Active vs Closed per quarter
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <ChakraSelect
                      value={selectedYear}
                      size="sm"
                      rounded="lg"
                      w="90px"
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      bg={cardBg}
                      borderColor={borderCol}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </ChakraSelect>
                  </HStack>
                </HStack>
                {isMounted && (
                  <Box ref={lineChartRef}>
                    <Chart
                      options={lineChartOptions}
                      series={[
                        {
                          name: "Active Projects",
                          data: QuartalChart.chart.map((p) =>
                            Number(p.activeCount),
                          ),
                        },
                        {
                          name: "Closed Projects",
                          data: QuartalChart.chart.map((p) =>
                            Number(p.closedCount),
                          ),
                        },
                      ]}
                      type="line"
                      height={220}
                    />
                  </Box>
                )}
              </CardBody>
            </Card>

            {/* Donut Chart */}
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderCol}
              rounded={radiusStyle}
              shadow="sm"
            >
              <CardBody p={5}>
                <VStack align="start" spacing={0} mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiFolder} color="purple.500" />
                    <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                      Project by Type
                    </Heading>
                  </HStack>
                  <Text fontSize="xs" color={textMuted}>
                    Distribution of assigned projects
                  </Text>
                </VStack>
                {isMounted && (
                  <Chart
                    options={donutOptions}
                    series={[
                      Summary.projectInternalDev,
                      Summary.projectProcurement,
                      Summary.projectRfc,
                    ]}
                    type="donut"
                    height={220}
                  />
                )}
              </CardBody>
            </Card>
          </Grid>

          {/* ── Task Stats ── */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderCol}
            rounded={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              <HStack mb={4} spacing={2}>
                <Icon as={FiBriefcase} color="orange.500" />
                <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                  Task Overview
                </Heading>
              </HStack>

              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={5}
              >
                {/* Assigned + Board Positions */}
                <Box
                  p={4}
                  bg={isDark ? "gray.700" : "blue.50"}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.600" : "blue.100"}
                >
                  <HStack justify="space-between" mb={3}>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={textMuted}
                      textTransform="uppercase"
                    >
                      Assigned
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {Summary.totalTaskAssigned}
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {[
                      {
                        label: "To Do",
                        value: Summary.taskTodo,
                        color: "gray",
                      },
                      {
                        label: "In Progress",
                        value: Summary.taskInProgress,
                        color: "blue",
                      },
                      {
                        label: "In Review",
                        value: Summary.taskInReview,
                        color: "purple",
                      },
                      {
                        label: "Done",
                        value: Summary.taskDone,
                        color: "green",
                      },
                    ].map(({ label, value, color }) => (
                      <Box key={label}>
                        <HStack justify="space-between" mb="2px">
                          <Text fontSize="2xs" color={textMuted}>
                            {label}
                          </Text>
                          <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color={`${color}.500`}
                          >
                            {value}
                          </Text>
                        </HStack>
                        <Progress
                          value={
                            Summary.totalTaskAssigned > 0
                              ? (value / Summary.totalTaskAssigned) * 100
                              : 0
                          }
                          colorScheme={color}
                          size="xs"
                          rounded="full"
                        />
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Priority Breakdown */}
                <Box
                  p={4}
                  bg={isDark ? "gray.700" : "red.50"}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.600" : "red.100"}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={textMuted}
                    textTransform="uppercase"
                    mb={3}
                  >
                    Priority
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {[
                      {
                        label: "HIGH",
                        value: Summary.taskPriorityHigh,
                        color: "red",
                      },
                      {
                        label: "MEDIUM",
                        value: Summary.taskPriorityMedium,
                        color: "orange",
                      },
                      {
                        label: "LOW",
                        value: Summary.taskPriorityLow,
                        color: "green",
                      },
                    ].map(({ label, value, color }) => (
                      <Box key={label}>
                        <HStack justify="space-between" mb="2px">
                          <HStack spacing={1}>
                            <Box
                              w={2}
                              h={2}
                              bg={`${color}.500`}
                              rounded="full"
                            />
                            <Text fontSize="xs" color={textMuted}>
                              {label}
                            </Text>
                          </HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={`${color}.500`}
                          >
                            {value}
                          </Text>
                        </HStack>
                        <Progress
                          value={
                            Summary.totalTaskAssigned > 0
                              ? (value / Summary.totalTaskAssigned) * 100
                              : 0
                          }
                          colorScheme={color}
                          size="xs"
                          rounded="full"
                        />
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Sub-tasks */}
                <Box
                  p={4}
                  bg={isDark ? "gray.700" : "teal.50"}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.600" : "teal.100"}
                >
                  <HStack justify="space-between" mb={3}>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={textMuted}
                      textTransform="uppercase"
                    >
                      Sub-tasks
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                      {Summary.totalTaskItems}
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon
                          as={FiCheckCircle}
                          color="green.500"
                          boxSize={4}
                        />
                        <Text fontSize="sm" color={textMuted}>
                          Done
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold" color="green.500">
                        {Summary.totalTaskItemCompleted}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Box
                          w={4}
                          h={4}
                          border="2px"
                          borderColor={isDark ? "gray.500" : "gray.300"}
                          rounded="sm"
                        />
                        <Text fontSize="sm" color={textMuted}>
                          Pending
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold" color={textMuted}>
                        {Summary.totalTaskItems -
                          Summary.totalTaskItemCompleted}
                      </Text>
                    </HStack>
                    <Progress
                      mt={1}
                      value={
                        Summary.totalTaskItems > 0
                          ? (Summary.totalTaskItemCompleted /
                              Summary.totalTaskItems) *
                            100
                          : 0
                      }
                      colorScheme="teal"
                      size="sm"
                      rounded="full"
                    />
                    <Text fontSize="2xs" color={textMuted} textAlign="right">
                      {Summary.totalTaskItems > 0
                        ? Math.round(
                            (Summary.totalTaskItemCompleted /
                              Summary.totalTaskItems) *
                              100,
                          )
                        : 0}
                      % completed
                    </Text>
                  </VStack>
                </Box>
              </Grid>
            </CardBody>
          </Card>

          {/* ── Requirements Assigned ── */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderCol}
            rounded={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={2}>
                  <Icon as={FiClipboard} color="purple.500" />
                  <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                    Requirements Assigned
                  </Heading>
                  <Badge colorScheme="purple" rounded="full">
                    {reqTotalCount}
                  </Badge>
                </HStack>
              </HStack>

              {IsReqLoading ? (
                <VStack py={8}>
                  <LoadingMiniSignature />
                  <Text fontSize="sm" color={textMuted}>
                    Loading...
                  </Text>
                </VStack>
              ) : (
                <TableComponentFull table={reqTable} />
              )}
            </CardBody>
          </Card>

          {/* ── Assigned Projects Portfolio ── */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderCol}
            rounded={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={2}>
                  <Icon as={FiFolder} color="blue.500" />
                  <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                    Assigned Projects
                  </Heading>
                  <Badge colorScheme="blue" rounded="full">
                    {assignedProjTotal}
                  </Badge>
                </HStack>
              </HStack>
              {isAssignedProjLoading ? (
                <VStack py={8}>
                  <LoadingMiniSignature />
                  <Text fontSize="sm" color={textMuted}>
                    Loading...
                  </Text>
                </VStack>
              ) : (
                <TableComponentFull table={projTable} />
              )}
            </CardBody>
          </Card>

          {/* ── Filter + Report Table ── */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderCol}
            rounded={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              {/* Filter Header */}
              <Flex
                justify="space-between"
                align="center"
                mb={4}
                wrap="wrap"
                gap={3}
              >
                <HStack spacing={2}>
                  <Icon as={FiUser} color="blue.500" />
                  <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                    Evaluation Report
                  </Heading>
                  <Badge colorScheme="blue" rounded="full">
                    {DataReport.length}
                  </Badge>
                </HStack>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<FiRefreshCcw />}
                    onClick={RefreshAction}
                    isLoading={IsLoadingProcess}
                    variant="ghost"
                    rounded="lg"
                  >
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiDownload />}
                    onClick={handleExportToExcel}
                    isLoading={isExporting}
                    isDisabled={!DataReport.length}
                    colorScheme="green"
                    variant="outline"
                    rounded="lg"
                  >
                    Export Excel
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiDownload />}
                    onClick={handleExportPDF}
                    isLoading={isExportingPdf}
                    loadingText="Generating..."
                    colorScheme="red"
                    variant="outline"
                    rounded="lg"
                  >
                    Export PDF
                  </Button>
                </HStack>
              </Flex>

              {/* Filters */}
              <Grid
                templateColumns={{ base: "1fr", md: "auto auto 1fr auto" }}
                gap={3}
                mb={5}
                alignItems="center"
              >
                <HStack spacing={2}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textMuted}
                    whiteSpace="nowrap"
                  >
                    Period:
                  </Text>
                  <ChakraSelect
                    value={selectedYear}
                    size="sm"
                    rounded="lg"
                    w="100px"
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    bg={cardBg}
                  >
                    <option value={0}>All Data</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </ChakraSelect>
                  <HStack spacing={1}>
                    {[1, 2, 3, 4].map((q) => {
                      const isActive = selectedQuarters.includes(q);
                      return (
                        <Button
                          key={q}
                          size="sm"
                          rounded="lg"
                          px={3}
                          variant={isActive ? "solid" : "outline"}
                          colorScheme={isActive ? "blue" : "gray"}
                          onClick={() => {
                            setSelectedQuarters((prev) =>
                              prev.includes(q)
                                ? prev.length > 1
                                  ? prev.filter((x) => x !== q)
                                  : prev
                                : [...prev, q].sort(),
                            );
                          }}
                        >
                          Q{q}
                        </Button>
                      );
                    })}
                  </HStack>
                </HStack>
                <HStack spacing={2}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textMuted}
                    whiteSpace="nowrap"
                  >
                    Status:
                  </Text>
                  <Box minW="160px">
                    <Select
                      placeholder="All Status"
                      size="sm"
                      value={
                        statusOptions.find(
                          (o) => o.value === FilterProjectStatus,
                        ) || null
                      }
                      onChange={(opt) => {
                        const v = opt?.value || "";
                        setFilterProjectStatus(v);
                        setParamFilter(
                          addParamFilterUpdate(ParamFilter, {
                            field: "projectStatus",
                            value: v,
                            operator: "=",
                            filterLabel: "Project Status",
                          }),
                        );
                      }}
                      options={statusOptions}
                      isClearable
                      chakraStyles={{
                        container: (p) => ({ ...p, bg: cardBg }),
                      }}
                    />
                  </Box>
                </HStack>
                <Input
                  placeholder="Search project, name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  size="sm"
                  rounded="lg"
                  bg={cardBg}
                  borderColor={borderCol}
                />
                {/* Temp hide */}
                <HStack spacing={3} display={"none"}>
                  <VStack spacing={0} align="center">
                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                      {totalGrandTotal.toFixed(1)}
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      Grand Total
                    </Text>
                  </VStack>
                  <Divider orientation="vertical" h="30px" />
                  <VStack spacing={0} align="center">
                    <Text fontSize="lg" fontWeight="bold" color="blue.500">
                      {averagePoints.toFixed(1)}
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      Average
                    </Text>
                  </VStack>
                </HStack>
              </Grid>

              <Divider mb={4} />

              {/* Report List */}
              {IsLoadingProcess ? (
                <VStack py={12} spacing={3}>
                  <LoadingMiniSignature />
                  <Text fontSize="sm" color={textMuted}>
                    Loading performance data...
                  </Text>
                </VStack>
              ) : DataReport.length === 0 ? (
                <VStack py={12} spacing={3}>
                  <Box
                    w={16}
                    h={16}
                    bg={isDark ? "gray.700" : "gray.100"}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={FiClipboard}
                      boxSize={8}
                      color={isDark ? "gray.500" : "gray.400"}
                    />
                  </Box>
                  <Text fontWeight="semibold" color={textMuted}>
                    No evaluation data found
                  </Text>
                  <Text fontSize="sm" color={textMuted} textAlign="center">
                    No records for {selectedYear} Q{selectedQuarters.join(",")}.
                    Try changing the period filter.
                  </Text>
                </VStack>
              ) : (
                <Box>
                  {/* Header */}
                  <Grid
                    templateColumns={
                      mode !== "my"
                        ? "30px 2fr 1fr 1fr 1fr 1fr auto"
                        : "30px 2fr 1fr 1fr 1fr 1fr"
                    }
                    px={2}
                    pb={2}
                    borderBottom="2px"
                    borderColor={borderCol}
                  >
                    {[
                      "No.",
                      "Project Information",
                      "Period",
                      "Status",
                      "Tasks",
                      "Points",
                      ...(mode !== "my" ? ["Action"] : []),
                    ].map((h, i) => (
                      <Text
                        key={h}
                        fontSize="xs"
                        fontWeight="bold"
                        color={textMuted}
                        textTransform="uppercase"
                        textAlign={i === 0 ? "left" : "center"}
                      >
                        {h}
                      </Text>
                    ))}
                  </Grid>

                  {/* Rows */}
                  {DataReport.map((item, index) => (
                    <Box key={item.id}>
                      <Grid
                        templateColumns={
                          mode !== "my"
                            ? "30px 2fr 1fr 1fr 1fr 1fr auto"
                            : "30px 2fr 1fr 1fr 1fr 1fr"
                        }
                        px={2}
                        h="64px"
                        alignItems="flex-start"
                        my={1}
                        _hover={{ bg: isDark ? "whiteAlpha.50" : "blue.50" }}
                        rounded="lg"
                        transition="background 0.15s"
                        cursor="default"
                      >
                        {/* No. */}
                        <Text fontSize="sm" color={textMuted} textAlign="start">
                          {index + 1}.
                        </Text>

                        {/* Project Info */}
                        <Box pr={3} overflow="hidden">
                          <HStack spacing={2} mb="1px">
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              noOfLines={1}
                              color={isDark ? "white" : "gray.800"}
                            >
                              {item.projectName || "—"}
                            </Text>
                            <Badge
                              colorScheme="blue"
                              variant="subtle"
                              fontSize="2xs"
                              flexShrink={0}
                            >
                              {item.projectType}
                            </Badge>
                            {item.requirementType && (
                              <Badge
                                colorScheme="purple"
                                variant="subtle"
                                fontSize="2xs"
                                flexShrink={0}
                              >
                                {item.requirementType}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color={textMuted} noOfLines={1}>
                            {item.projectNo}
                            {item.appShortName ? ` · ${item.appShortName}` : ""}
                            {item.proSdlcStageNameActive
                              ? ` · ${item.proSdlcStageNameActive}`
                              : ""}
                          </Text>
                        </Box>

                        {/* Period */}
                        <VStack spacing="1px" align="center">
                          <Badge
                            colorScheme="teal"
                            variant="subtle"
                            rounded="full"
                            px={2}
                            fontSize="xs"
                          >
                            Q{item.quartalPeriod}
                          </Badge>
                          <Text fontSize="2xs" color={textMuted}>
                            {item.yearPeriod}
                          </Text>
                        </VStack>

                        {/* Status */}
                        <VStack spacing="1px" align="center">
                          <Badge
                            rounded="full"
                            px={2}
                            fontSize="2xs"
                            colorScheme={
                              ["RUNNING", "INITIATING"].includes(
                                item.projectStatus,
                              )
                                ? "green"
                                : item.projectStatus === "COMPLETED"
                                  ? "blue"
                                  : item.projectStatus === "CANCELED"
                                    ? "red"
                                    : item.projectStatus === "ON HOLD"
                                      ? "orange"
                                      : "gray"
                            }
                          >
                            {item.projectStatus}
                          </Badge>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="blue.500"
                          >
                            {item.projectStatusPercentage}%
                          </Text>
                        </VStack>

                        {/* Tasks */}
                        <VStack spacing="1px" align="center">
                          <HStack spacing={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="green.500"
                            >
                              {item.userTotalTaskDone}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>
                              /
                            </Text>
                            <Text fontSize="sm" color={textMuted}>
                              {item.userTotalTaskAssign}
                            </Text>
                          </HStack>
                          <Text fontSize="2xs" color={textMuted}>
                            Done / Total
                          </Text>
                        </VStack>

                        {/* Points */}
                        <VStack spacing="1px" align="center">
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            color="green.500"
                          >
                            {item.evGrandTotal}
                          </Text>
                          <Text fontSize="2xs" color={textMuted}>
                            B:{item.evBasicPoint} T:{item.evTimelessPoint} E:
                            {item.evExtraPoint}
                          </Text>
                        </VStack>

                        {/* Action - only on detail pages */}
                        {mode !== "my" && (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            rounded="lg"
                            onClick={() => handleOpenEvaluationModal(item)}
                          >
                            Adjust
                          </Button>
                        )}
                      </Grid>
                      {index < DataReport.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <EvaluationAdjustModal
        isOpen={isEvaluationModalOpen}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={RefreshAction}
      />
    </LayoutAdmin>
  );
}

// end of PerformancePortfolioView
