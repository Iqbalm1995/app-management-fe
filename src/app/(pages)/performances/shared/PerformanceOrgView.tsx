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
  DIVISION_ID_CODE_BJB,
  GROUP_CONST_BRD_STATUS,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  getCurrentQuarter,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  MyPerformanceSummaryResponse,
  MyPerformanceQuartalChartResponse,
  ReportProjectPortofolioDataResponse,
  UserEvaluationReportListResponse,
  OrgUserRankingResponse,
} from "@/app/services/useReports";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import { RequirementsResponse } from "@/app/services/useRequirements";
import {
  PaggingListPayload,
  PaggingListPayloadCustom,
  addParamFilterUpdate,
  ListSearchByParamProps,
  ColumnMetaCustom,
} from "@/app/types/masterTypes";
import EvaluationAdjustModal from "./EvaluationAdjustModal";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { Select } from "chakra-react-select";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Progress,
  Select as ChakraSelect,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiFolder,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiEye,
  FiLayers,
  FiUsers,
  FiRefreshCcw,
  FiUser,
  FiAlertTriangle,
  FiEdit3,
} from "react-icons/fi";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { TableComponentFull } from "@/app/components/tableComponents";
import LabelMaster from "@/app/components/labelMasterProps";
import { StatusBadge } from "@/app/components/StatusBadge";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type OrgViewMode = "division" | "group";

interface PerformanceOrgViewProps {
  mode: OrgViewMode;
}

const getHeaderContent = (mode: OrgViewMode): HeaderContentProps => {
  switch (mode) {
    case "division":
      return {
        titleName: "Division Performance Summary",
        breadCrumb: ["Home", "Performances", "Divisions", "Summary"],
      };
    case "group":
      return {
        titleName: "Group Performance Summary",
        breadCrumb: ["Home", "Performances", "Groups", "Summary"],
      };
  }
};

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

export default function PerformanceOrgView({ mode }: PerformanceOrgViewProps) {
  const HeaderDataContent = getHeaderContent(mode);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const cardBg = isDark ? "gray.800" : "white";
  const borderCol = isDark ? "gray.700" : "gray.200";
  const textMuted = isDark ? "gray.400" : "gray.500";
  const showToast = useToastHelper();

  const {
    GetMyPerformanceSummary,
    GetOrgQuartalChart,
    GetMyPerformanceRequirements,
    ListReportProjectPortofolio,
    ListUserEvaluationReport,
    GetOrgUserRankings,
  } = useReports();
  const { List: ListOrganization } = useOrganization();
  const { List: ListTeams } = useTeams();
  const { List: ListUsers } = useUsers();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [Summary, setSummary] =
    useState<MyPerformanceSummaryResponse>(DEFAULT_SUMMARY);
  const [QuartalChart, setQuartalChart] =
    useState<MyPerformanceQuartalChartResponse>(DEFAULT_QUARTAL);
  const [orgFilterCode, setOrgFilterCode] = useState<string>("");
  const [orgFilterLabel, setOrgFilterLabel] = useState<string>("");

  // Top rankings
  const [rankingData, setRankingData] = useState<OrgUserRankingResponse[]>([]);
  const [rankingGroupCode, setRankingGroupCode] = useState<string>("");
  const [rankingGroupOptions, setRankingGroupOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [autoRotateKey, setAutoRotateKey] = useState<number>(0);

  // Year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Requirements
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

  // Portfolio
  const [DataPortfolio, setDataPortfolio] = useState<
    ReportProjectPortofolioDataResponse[]
  >([]);
  const [portfolioTotal, setPortfolioTotal] = useState(0);
  const [portfolioTotalPages, setPortfolioTotalPages] = useState(0);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const PORTFOLIO_PAGE_SIZE = 10;
  const [
    { pageIndex: portPageIndex, pageSize: portPageSize },
    setPortPagination,
  ] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PORTFOLIO_PAGE_SIZE,
  });
  const portPagination = useMemo(
    () => ({ pageIndex: portPageIndex, pageSize: portPageSize }),
    [portPageIndex, portPageSize],
  );

  // Evaluation report
  const [EvalDataReport, setEvalDataReport] = useState<
    UserEvaluationReportListResponse[]
  >([]);
  const [evalRefresh, setEvalRefresh] = useState(0);
  const [isEvalLoading, setIsEvalLoading] = useState(false);
  const [evalTotalPages, setEvalTotalPages] = useState(0);
  const [evalCountTotal, setEvalCountTotal] = useState(0);
  const [evalGlobalFilter, setEvalGlobalFilter] = useState("");
  const [evalSelectedYear, setEvalSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [evalSelectedQuarters, setEvalSelectedQuarters] = useState<number[]>([
    getCurrentQuarter(),
  ]);
  const [evalParamFilter, setEvalParamFilter] = useState<
    ListSearchByParamProps[]
  >([]);
  const [
    { pageIndex: evalPageIndex, pageSize: evalPageSize },
    setEvalPagination,
  ] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const evalPagination = useMemo(
    () => ({ pageIndex: evalPageIndex, pageSize: evalPageSize }),
    [evalPageIndex, evalPageSize],
  );
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedEvalUser, setSelectedEvalUser] =
    useState<UserEvaluationReportListResponse | null>(null);

  // Filter options for evaluation
  const [GroupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [TeamOptions, setTeamOptions] = useState<TeamsResponse[]>([]);
  const [UserOptions, setUserOptions] = useState<UsersResponse[]>([]);
  const [FilterManageGroup, setFilterManageGroup] = useState<string>("");
  const [FilterTeamCode, setFilterTeamCode] = useState<string>("");
  const [FilterUserName, setFilterUserName] = useState<string>("");
  const [FilterProjectStatus, setFilterProjectStatus] =
    useState<string>("PROJECT_CLOSED");
  const [evalSortField, setEvalSortField] = useState<string>("nama");
  const [evalSortOrder, setEvalSortOrder] = useState<string>("asc");

  const groupOptions = useMemo(
    () => GroupOptions.map((g) => ({ value: g.orgCode, label: g.orgName })),
    [GroupOptions],
  );
  const filteredTeams = useMemo(
    () =>
      FilterManageGroup
        ? TeamOptions.filter((t) => t.orgGroupCode === FilterManageGroup)
        : TeamOptions,
    [TeamOptions, FilterManageGroup],
  );
  const teamOptions = useMemo(
    () => filteredTeams.map((t) => ({ value: t.teamCode, label: t.teamName })),
    [filteredTeams],
  );
  const userOptions = useMemo(
    () =>
      UserOptions.map((u) => ({
        value: u.userId,
        label: `${u.nama} (${u.nip || u.userId})`,
      })),
    [UserOptions],
  );
  const statusOptions = useMemo(
    () => [
      { value: "PROJECT_ACTIVE", label: "Project Active" },
      { value: "PROJECT_CLOSED", label: "Project Closed" },
    ],
    [],
  );
  const sortFieldOptions = useMemo(
    () => [
      { value: "nama", label: "Name" },
      { value: "yearPeriod", label: "Year" },
      { value: "evGrandTotal", label: "Total Points" },
    ],
    [],
  );
  const sortOrderOptions = useMemo(
    () => [
      { value: "asc", label: "Asc" },
      { value: "desc", label: "Desc" },
    ],
    [],
  );

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
      setTokenData(token);
      if (mode === "group") {
        const code = UserData.team?.orgGroupCode || "";
        setOrgFilterCode(code);
        setFilterManageGroup(code);
        if (code) {
          setEvalParamFilter([
            {
              field: "UserOrgGroupCode",
              operator: "=",
              value: code,
              filterLabel: "Group Filter",
            },
            {
              field: "projectStatus",
              operator: "=",
              value: "PROJECT_CLOSED",
              filterLabel: "Project Status",
            },
          ]);
          const fetchGroupName = async () => {
            const orgRes = await ListOrganization(
              {
                search: code,
                limit: 1,
                page: 0,
                filterWhere: [{ field: "orgCode", operator: "=", value: code }],
                fieldOrder: [],
                orderDir: "asc",
              },
              token,
            );
            setOrgFilterLabel(orgRes?.data?.[0]?.orgName || code);
          };
          fetchGroupName();
        } else {
          setOrgFilterLabel("No Group");
        }
      } else {
        const code = DIVISION_ID_CODE_BJB;
        setOrgFilterCode(code);
        setOrgFilterLabel(UserData.namaUnitKerja || "Division");
        setEvalParamFilter([
          {
            field: "ProjectManageByDivisionCode",
            operator: "=",
            value: code,
            filterLabel: "Division Filter",
          },
          {
            field: "projectStatus",
            operator: "=",
            value: "PROJECT_CLOSED",
            filterLabel: "Project Status",
          },
        ]);
      }
    }
  }, [DataAuth, mode]);

  // Load group/team/user options for evaluation filters
  useEffect(() => {
    if (!tokenData) return;
    const load = async () => {
      const [orgRes, teamRes, userRes] = await Promise.all([
        ListOrganization(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [
              { field: "orgType", operator: "=", value: "GROUP" },
              {
                field: "parentId",
                operator: "=",
                value: "8922E4AD-8183-B61B-34D1-CF629361D",
              },
            ],
            fieldOrder: ["orgName"],
            orderDir: "asc",
          },
          tokenData,
        ),
        ListTeams(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [],
            fieldOrder: ["teamName"],
            orderDir: "asc",
          },
          tokenData,
        ),
        ListUsers(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [],
            fieldOrder: ["nama"],
            orderDir: "asc",
          },
          tokenData,
        ),
      ]);
      if (orgRes?.statusCode === RES_CODE_OK && orgRes.data)
        setGroupOptions(orgRes.data);
      if (teamRes?.statusCode === RES_CODE_OK && teamRes.data)
        setTeamOptions(teamRes.data);
      if (userRes?.statusCode === RES_CODE_OK && userRes.data)
        setUserOptions(userRes.data);
    };
    load();
  }, [tokenData]);

  // Load group options for ranking filter (division page only) + set default rankingGroupCode
  useEffect(() => {
    if (!tokenData || !GroupOptions.length) return;
    const opts = GroupOptions.map((g) => ({
      value: g.orgCode,
      label: g.orgName,
    }));
    setRankingGroupOptions(opts);
    if (mode === "group" && orgFilterCode) {
      setRankingGroupCode(orgFilterCode);
    } else if (mode === "division" && opts.length > 0) {
      setRankingGroupCode((prev) => prev || opts[0].value);
    }
  }, [GroupOptions, orgFilterCode, mode, tokenData]);

  // Auto-rotate group selection every 5 seconds (division mode only)
  useEffect(() => {
    if (mode !== "division" || rankingGroupOptions.length < 2) return;
    const timer = setInterval(() => {
      setAutoRotateKey(k => k + 1);
      setRankingGroupCode(prev => {
        const idx = rankingGroupOptions.findIndex(o => o.value === prev);
        return rankingGroupOptions[(idx + 1) % rankingGroupOptions.length].value;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [mode, rankingGroupOptions]);

  // Fetch rankings from API
  useEffect(() => {
    if (!tokenData || !orgFilterCode) return;
    const fetchRankings = async () => {
      const orgGroup = mode === "group" ? orgFilterCode : undefined;
      const orgDivision = mode === "division" ? orgFilterCode : undefined;
      const res = await GetOrgUserRankings(tokenData, orgGroup, orgDivision);
      if (res?.statusCode === RES_CODE_OK && res.data) setRankingData(res.data);
    };
    fetchRankings();
  }, [tokenData, orgFilterCode]);

  // Fetch summary + quartal chart
  useEffect(() => {
    if (!orgFilterCode || !tokenData) return;
    const fetchData = async () => {
      setIsSummaryLoading(true);
      const orgGroup = mode === "group" ? orgFilterCode : undefined;
      const orgDivision = mode === "division" ? orgFilterCode : undefined;
      try {
        const [summaryRes, quartalRes] = await Promise.all([
          GetMyPerformanceSummary(
            "",
            selectedYear,
            tokenData,
            orgGroup,
            orgDivision,
          ),
          GetOrgQuartalChart(selectedYear, tokenData, orgGroup, orgDivision),
        ]);
        if (summaryRes?.statusCode === RES_CODE_OK && summaryRes.data)
          setSummary(summaryRes.data);
        if (quartalRes?.statusCode === RES_CODE_OK && quartalRes.data)
          setQuartalChart(quartalRes.data);
      } catch {
        /* silent */
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchData();
  }, [orgFilterCode, tokenData, selectedYear]);

  // Fetch requirements
  useEffect(() => {
    if (!orgFilterCode || !tokenData) return;
    const fetchReqs = async () => {
      setIsReqLoading(true);
      const orgGroup = mode === "group" ? orgFilterCode : undefined;
      const orgDivision = mode === "division" ? orgFilterCode : undefined;
      try {
        const res = await GetMyPerformanceRequirements(
          "",
          {
            search: "",
            limit: reqPageSize,
            page: reqPageIndex,
            filterWhere: [],
            fieldOrder: ["createdAt"],
            orderDir: "desc",
          },
          tokenData,
          orgGroup,
          orgDivision,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setDataRequirements(res.data as RequirementsResponse[]);
          setReqTotalCount((res as any).countTotal ?? 0);
          setReqTotalPages(
            (res as any).countTotal
              ? Math.ceil((res as any).countTotal / reqPageSize)
              : 0,
          );
        }
      } catch {
        /* silent */
      } finally {
        setIsReqLoading(false);
      }
    };
    fetchReqs();
  }, [orgFilterCode, tokenData, reqPageIndex]);

  // Fetch portfolio
  useEffect(() => {
    if (!orgFilterCode || !tokenData) return;
    const fetchPortfolio = async () => {
      setIsPortfolioLoading(true);
      const filterField =
        mode === "group" ? "proManageByGroupCode" : "proManageByDivisionCode";
      try {
        const res = await ListReportProjectPortofolio(
          {
            search: "",
            limit: portPageSize,
            page: portPageIndex,
            filterWhere: [
              { field: filterField, operator: "=", value: orgFilterCode },
            ],
            fieldOrder: ["projectRegisterDate"],
            orderDir: "desc",
          },
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setDataPortfolio(res.data);
          setPortfolioTotal((res as any).countTotal ?? 0);
          setPortfolioTotalPages(
            (res as any).countTotal
              ? Math.ceil((res as any).countTotal / portPageSize)
              : 0,
          );
        }
      } catch {
        /* silent */
      } finally {
        setIsPortfolioLoading(false);
      }
    };
    fetchPortfolio();
  }, [orgFilterCode, tokenData, portPageIndex]);

  // Evaluation year/quarter filter sync
  useEffect(() => {
    if (!orgFilterCode) return;
    const orgField =
      mode === "group" ? "UserOrgGroupCode" : "ProjectManageByDivisionCode";
    let filters: ListSearchByParamProps[] = [
      { field: orgField, operator: "=", value: orgFilterCode, filterLabel: "" },
    ];
    if (evalSelectedYear > 0) {
      filters = [
        ...filters,
        {
          field: "yearPeriod",
          operator: "=",
          value: evalSelectedYear.toString(),
          filterLabel: "Year",
        },
      ];
      if (evalSelectedQuarters.length === 1)
        filters = [
          ...filters,
          {
            field: "quartalPeriod",
            operator: "=",
            value: evalSelectedQuarters[0].toString(),
            filterLabel: "Quarter",
          },
        ];
    }
    if (FilterManageGroup)
      filters = addParamFilterUpdate(filters, {
        field: "UserOrgGroupCode",
        operator: "=",
        value: FilterManageGroup,
        filterLabel: "Group",
      });
    if (FilterTeamCode)
      filters = addParamFilterUpdate(filters, {
        field: "userTeamCode",
        operator: "=",
        value: FilterTeamCode,
        filterLabel: "Team",
      });
    if (FilterUserName)
      filters = addParamFilterUpdate(filters, {
        field: "userId",
        operator: "=",
        value: FilterUserName,
        filterLabel: "User",
      });
    if (FilterProjectStatus)
      filters = addParamFilterUpdate(filters, {
        field: "projectStatus",
        operator: "=",
        value: FilterProjectStatus,
        filterLabel: "Status",
      });
    else
      filters = addParamFilterUpdate(filters, {
        field: "projectStatus",
        operator: "=",
        value: "PROJECT_CLOSED",
        filterLabel: "Status",
      });
    setEvalParamFilter(filters);
  }, [
    orgFilterCode,
    evalSelectedYear,
    evalSelectedQuarters,
    FilterManageGroup,
    FilterTeamCode,
    FilterUserName,
    FilterProjectStatus,
    mode,
  ]);

  // Evaluation fetch
  useEffect(() => {
    if (!DataAuth || !tokenData || evalParamFilter.length === 0) return;
    const fetchEval = async () => {
      setIsEvalLoading(true);
      try {
        const res = await ListUserEvaluationReport(
          {
            search: evalGlobalFilter,
            limit: evalPageSize,
            page: evalPageIndex,
            filterWhere: evalParamFilter,
            fieldOrder: [evalSortField],
            orderDir: evalSortOrder as "asc" | "desc",
          },
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setEvalDataReport(res.data as UserEvaluationReportListResponse[]);
          setEvalCountTotal(res.countTotal ?? 0);
          setEvalTotalPages(Math.ceil((res.countTotal || 0) / evalPageSize));
        }
      } catch {
        /* silent */
      } finally {
        setIsEvalLoading(false);
      }
    };
    fetchEval();
  }, [
    DataAuth,
    tokenData,
    evalParamFilter,
    evalGlobalFilter,
    evalPageIndex,
    evalRefresh,
    evalSortField,
    evalSortOrder,
  ]);

  // Chart options — same as reference
  const lineChartOptions: any = {
    chart: {
      type: "line",
      id: "org-performance-line-chart",
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

  // StatCard — same as reference
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

  // Requirements columns — same as reference
  const reqColumns = useMemo<ColumnDef<RequirementsResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="start" h="full">
            <Text fontSize="md">
              {reqPageIndex * reqPageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
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
    [isDark, reqPageIndex, reqPageSize],
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

  const portColumns = useMemo<ColumnDef<ReportProjectPortofolioDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center">
            <Text fontSize="sm">
              {portPageIndex * portPageSize + info.row.index + 1}.
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
            {info.row.original.requirement?.requirementType && (
              <Text fontSize="xs" color="blue.500">
                Requirement Type:{" "}
                {info.row.original.requirement.requirementType}
              </Text>
            )}
            {info.row.original.projectType === "PROCUREMENT" &&
              !info.row.original.requirement && (
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
    [isDark, portPageIndex, portPageSize],
  );

  const portTable = useReactTable({
    data: DataPortfolio,
    columns: portColumns,
    pageCount: portfolioTotalPages,
    state: { pagination: portPagination },
    onPaginationChange: setPortPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
  });

  const evalColumns = useMemo<ColumnDef<UserEvaluationReportListResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="start" h="full">
            <Text fontSize="md">
              {evalPageIndex * evalPageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => `${row.yearPeriod} Q${row.quartalPeriod}`,
        id: "period",
        cell: (info) => (
          <VStack spacing="1px" align="center">
            <Badge
              colorScheme="teal"
              variant="subtle"
              rounded="full"
              px={2}
              fontSize="xs"
            >
              Q{info.row.original.quartalPeriod}
            </Badge>
            <Text fontSize="2xs" color={textMuted}>
              {info.row.original.yearPeriod}
            </Text>
          </VStack>
        ),
        header: () => <span>Period</span>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.nama,
        id: "userInfo",
        cell: (info) => (
          <Flex
            w="full"
            h="full"
            justifyContent="start"
            alignItems="start"
            as={Stack}
            spacing={1}
            minW="200px"
          >
            <Link
              href={`/performances/${mode === "group" ? "groups" : "divisions"}/detail?userId=${info.row.original.userId}`}
            >
              <Tooltip label="View user portfolio" placement="top" hasArrow>
                <Text
                  fontWeight={600}
                  fontSize="sm"
                  color="blue.600"
                  _hover={{ textDecoration: "underline" }}
                >
                  {info.row.original.nama}
                </Text>
              </Tooltip>
            </Link>
            <Text fontSize="sm" color="gray.500">
              {info.row.original.nip}
            </Text>
            <Text fontSize="xs" color="blue.500">
              {info.row.original.jabatan || "-"}
            </Text>
            <Text fontSize="xs">{info.row.original.namaUnitKerja || "-"}</Text>
          </Flex>
        ),
        header: () => <span>User Information</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "nama",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "User Name",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectNo,
        id: "projectInfo",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
              {info.row.original.projectName || "—"}
            </Text>
            <Text fontSize="xs" color={textMuted}>
              {info.row.original.projectNo}
            </Text>
            <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
              {info.row.original.projectType}
            </Badge>
          </VStack>
        ),
        header: () => <span>Project Information</span>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectStatus,
        id: "projectStatus",
        cell: (info) => (
          <VStack spacing="1px" align="center">
            <Badge
              rounded="full"
              px={2}
              fontSize="2xs"
              colorScheme={
                ["RUNNING", "INITIATING"].includes(
                  info.row.original.projectStatus,
                )
                  ? "green"
                  : info.row.original.projectStatus === "COMPLETED"
                    ? "blue"
                    : info.row.original.projectStatus === "CANCELED"
                      ? "red"
                      : info.row.original.projectStatus === "ON HOLD"
                        ? "orange"
                        : "gray"
              }
            >
              {info.row.original.projectStatus}
            </Badge>
            <Text fontSize="xs" fontWeight="bold" color="blue.500">
              {info.row.original.projectStatusPercentage}%
            </Text>
          </VStack>
        ),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.userTotalTaskAssign,
        id: "taskInfo",
        cell: (info) => (
          <VStack spacing="1px" align="center">
            <HStack spacing={1}>
              <Text fontSize="sm" fontWeight="bold" color="green.500">
                {info.row.original.userTotalTaskDone}
              </Text>
              <Text fontSize="xs" color={textMuted}>
                /
              </Text>
              <Text fontSize="sm" color={textMuted}>
                {info.row.original.userTotalTaskAssign}
              </Text>
            </HStack>
            <Text fontSize="2xs" color={textMuted}>
              Done / Total
            </Text>
          </VStack>
        ),
        header: () => <span>Tasks</span>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.evGrandTotal,
        id: "grandTotal",
        cell: (info) => (
          <VStack spacing="1px" align="center">
            <Text fontSize="md" fontWeight="bold" color="green.500">
              {info.row.original.evGrandTotal}
            </Text>
            <Text fontSize="2xs" color={textMuted}>
              B:{info.row.original.evBasicPoint} T:
              {info.row.original.evTimelessPoint} E:
              {info.row.original.evExtraPoint}
            </Text>
          </VStack>
        ),
        header: () => <span>Points</span>,
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        id: "actions",
        header: () => "",
        cell: (info) => (
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEdit3 />}
            onClick={() => {
              setSelectedEvalUser(info.row.original);
              setIsEvaluationModalOpen(true);
            }}
          >
            Adjust
          </Button>
        ),
        footer: (props) => props.column.id,
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
    ],
    [colorMode, evalPageIndex, evalPageSize, mode, textMuted],
  );

  const evalTable = useReactTable({
    data: EvalDataReport,
    columns: evalColumns,
    pageCount: evalTotalPages,
    state: { globalFilter: evalGlobalFilter, pagination: evalPagination },
    onPaginationChange: setEvalPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setEvalGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
    meta: {
      onRowClick: (row: UserEvaluationReportListResponse) => {
        setSelectedEvalUser(row);
        setIsEvaluationModalOpen(true);
      },
    },
  });

  // ── Ranking computations ──────────────────────────────────────────────────
  const computeRankings = (data: OrgUserRankingResponse[], tab: number) => {
    const getValue = (u: OrgUserRankingResponse): number => {
      switch (tab) {
        case 0:
          return u.projectsAssigned;
        case 1:
          return u.projectsActive;
        case 2:
          return u.projectsClosed;
        case 3:
          return u.tasksAssigned;
        case 4:
          return u.tasksDone;
        case 5:
          return u.taskItemsUnchecked;
        case 6:
          return u.taskItemsDone;
        default:
          return 0;
      }
    };
    return [...data]
      .map((u) => ({ ...u, value: getValue(u) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const divisionRankingData = useMemo(() => rankingData, [rankingData]);
  const groupRankingData = useMemo(() => {
    if (!rankingGroupCode) return [];
    const selectedLabel =
      rankingGroupOptions.find((o) => o.value === rankingGroupCode)?.label ||
      "";
    return rankingData.filter(
      (r) =>
        r.userOrgGroupCode === rankingGroupCode ||
        (selectedLabel && r.userOrgGroupName === selectedLabel),
    );
  }, [rankingData, rankingGroupCode, rankingGroupOptions]);

  if (!isMounted) return <LoadingMiniSignature />;

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box px={{ base: 4, md: 6 }} pb={8}>
        <VStack spacing={6} align="stretch">
          {/* ── Hero Banner ── */}
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
                  <Box
                    w={16}
                    h={16}
                    bg="blue.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="3px solid"
                    borderColor="blue.400"
                    flexShrink={0}
                  >
                    <Icon
                      as={mode === "group" ? FiUsers : FiLayers}
                      boxSize={7}
                      color="white"
                    />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color={isDark ? "white" : "gray.800"}>
                      {orgFilterLabel}
                    </Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="blue" rounded="full" px={2}>
                        {orgFilterCode}
                      </Badge>
                      <Badge
                        colorScheme="purple"
                        rounded="full"
                        px={2}
                        variant="subtle"
                      >
                        {mode === "group" ? "Group" : "Division"} Performance
                      </Badge>
                    </HStack>
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
                      {/* Stacked progress bar */}
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
                    Distribution of managed projects
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

          {/* ── Project Portfolio ── */}
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
                    Project Portfolio
                  </Heading>
                  <Badge colorScheme="blue" rounded="full">
                    {portfolioTotal}
                  </Badge>
                </HStack>
              </HStack>
              {isPortfolioLoading ? (
                <LoadingMiniSignature />
              ) : (
                <TableComponentWithFilterCTX table={portTable} />
              )}
            </CardBody>
          </Card>

          {/* ── Top 10 Rankings ── */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderCol}
            rounded={radiusStyle}
            shadow="sm"
          >
            <CardBody p={5}>
              <HStack mb={4} spacing={2} justify="space-between" wrap="wrap">
                <HStack spacing={2}>
                  <Icon as={FiAward} color="yellow.500" />
                  <Heading size="sm" color={isDark ? "white" : "gray.700"}>
                    Top 10 Rankings
                  </Heading>
                </HStack>
                {/* {mode === "division" && rankingGroupOptions.length > 0 && (
                  <HStack spacing={2}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={textMuted}
                      whiteSpace="nowrap"
                    >
                      Group:
                    </Text>
                    <ChakraSelect
                      value={rankingGroupCode}
                      size="sm"
                      rounded="lg"
                      w="200px"
                      onChange={(e) => setRankingGroupCode(e.target.value)}
                      bg={cardBg}
                      borderColor={borderCol}
                    >
                      {rankingGroupOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </ChakraSelect>
                  </HStack>
                )} */}
              </HStack>

              <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                <TabList mb={4} flexWrap="wrap" gap={2}>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiFolder} boxSize={3} />
                      <Text>Projects Assigned</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiTarget} boxSize={3} />
                      <Text>Projects Active</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiCheckCircle} boxSize={3} />
                      <Text>Projects Closed</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiBriefcase} boxSize={3} />
                      <Text>Tasks Assigned</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiAward} boxSize={3} />
                      <Text>Tasks Done</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiClipboard} boxSize={3} />
                      <Text>Sub-Task Unchecked</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiCheckCircle} boxSize={3} />
                      <Text>Sub-Task Done</Text>
                    </HStack>
                  </Tab>
                </TabList>
                <TabPanels>
                  {[0, 1, 2, 3, 4, 5, 6].map((tabIdx) => {
                    const tabMeta = [
                      {
                        label: "Projects Assigned",
                        color: "blue",
                        icon: FiFolder,
                        note: "",
                      },
                      {
                        label: "Projects Active",
                        color: "green",
                        icon: FiTarget,
                        note: "",
                      },
                      {
                        label: "Projects Closed",
                        color: "gray",
                        icon: FiCheckCircle,
                        note: "",
                      },
                      {
                        label: "Tasks Assigned",
                        color: "orange",
                        icon: FiBriefcase,
                        note: "Sum of tasks across all projects",
                      },
                      {
                        label: "Tasks Done",
                        color: "teal",
                        icon: FiAward,
                        note: "Sum of completed tasks",
                      },
                      {
                        label: "Sub Task Unchecked",
                        color: "red",
                        icon: FiClipboard,
                        note: "Estimated: Tasks Assigned − Done",
                      },
                      {
                        label: "Sub Task Done",
                        color: "purple",
                        icon: FiCheckCircle,
                        note: "Estimated: based on tasks done",
                      },
                    ];
                    const meta = tabMeta[tabIdx];
                    const divTop = computeRankings(divisionRankingData, tabIdx);
                    const grpTop = computeRankings(groupRankingData, tabIdx);
                    const maxDiv = divTop[0]?.value || 1;
                    const maxGrp = grpTop[0]?.value || 1;
                    const groupLabel =
                      mode === "group"
                        ? orgFilterLabel
                        : rankingGroupOptions.find(
                            (o) => o.value === rankingGroupCode,
                          )?.label || "Group";

                    const RankList = ({
                      data,
                      maxVal,
                      emptyLabel,
                    }: {
                      data: typeof divTop;
                      maxVal: number;
                      emptyLabel: string;
                    }) => (
                      <VStack spacing={3} align="stretch">
                        {data.length === 0 ? (
                          <Flex
                            direction="column"
                            align="center"
                            py={6}
                            gap={2}
                          >
                            <Icon
                              as={meta.icon}
                              boxSize={8}
                              color={isDark ? "gray.600" : "gray.300"}
                            />
                            <Text fontSize="sm" color={textMuted}>
                              {emptyLabel}
                            </Text>
                          </Flex>
                        ) : (
                          data.map((u, i) => (
                            <HStack
                              key={u.userId}
                              spacing={3}
                              align="center"
                              p={2}
                              rounded="lg"
                              _hover={{
                                bg: isDark ? "whiteAlpha.50" : "gray.50",
                              }}
                              transition="background 0.15s"
                            >
                              {/* Rank badge */}
                              <Box
                                w={7}
                                h={7}
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                bg={
                                  i === 0
                                    ? "yellow.400"
                                    : i === 1
                                      ? "gray.300"
                                      : i === 2
                                        ? "orange.300"
                                        : isDark
                                          ? "gray.700"
                                          : "gray.100"
                                }
                              >
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color={i < 3 ? "white" : textMuted}
                                >
                                  {i + 1}
                                </Text>
                              </Box>
                              {/* Avatar */}
                              <Box
                                w={8}
                                h={8}
                                bg={`${meta.color}.500`}
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                opacity={i < 3 ? 1 : 0.7}
                              >
                                <Text
                                  fontSize="xs"
                                  color="white"
                                  fontWeight="bold"
                                >
                                  {u.nama?.charAt(0)?.toUpperCase() || "?"}
                                </Text>
                              </Box>
                              {/* Info */}
                              <VStack
                                align="start"
                                spacing={0}
                                flex={1}
                                overflow="hidden"
                              >
                                <Link
                                  href={`/performances/${mode === "group" ? "groups" : "divisions"}/detail?userId=${u.userId}`}
                                >
                                  <Text
                                    fontSize="sm"
                                    fontWeight={600}
                                    noOfLines={1}
                                    color="blue.600"
                                    _hover={{ textDecoration: "underline" }}
                                    cursor="pointer"
                                  >
                                    {u.nama}
                                  </Text>
                                </Link>
                                <Text fontSize="2xs" color={textMuted}>
                                  {u.nip}
                                </Text>
                                <Progress
                                  value={(u.value / maxVal) * 100}
                                  size="xs"
                                  colorScheme={meta.color}
                                  rounded="full"
                                  w="full"
                                  mt="2px"
                                />
                              </VStack>
                              {/* Value */}
                              <VStack spacing={0} align="end" flexShrink={0}>
                                <Text
                                  fontSize="md"
                                  fontWeight="bold"
                                  color={`${meta.color}.500`}
                                  lineHeight="1"
                                >
                                  {u.value}
                                </Text>
                                <Text fontSize="2xs" color={textMuted}>
                                  {tabIdx <= 2
                                    ? "projects"
                                    : tabIdx <= 4
                                      ? "tasks"
                                      : "items"}
                                </Text>
                              </VStack>
                            </HStack>
                          ))
                        )}
                      </VStack>
                    );

                    return (
                      <TabPanel key={tabIdx} px={0}>
                        {meta.note && (
                          <HStack
                            mb={3}
                            spacing={2}
                            p={2}
                            bg={isDark ? "orange.900" : "orange.50"}
                            rounded="lg"
                          >
                            <Icon
                              as={FiBarChart2}
                              color="orange.500"
                              boxSize={3}
                            />
                            <Text fontSize="xs" color="orange.600">
                              {meta.note}
                            </Text>
                          </HStack>
                        )}
                        <Grid
                          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
                          gap={6}
                        >
                          <Box>
                            <HStack
                              mb={3}
                              spacing={2}
                              pb={2}
                              borderBottom="1px"
                              borderColor={borderCol}
                            >
                              <Icon
                                as={FiLayers}
                                color="blue.500"
                                boxSize={4}
                              />
                              <Text
                                fontWeight={700}
                                fontSize="sm"
                                color={isDark ? "white" : "gray.700"}
                              >
                                Division IT
                              </Text>
                              <Badge
                                colorScheme="blue"
                                variant="subtle"
                                fontSize="xs"
                              >
                                {divTop.length}
                              </Badge>
                            </HStack>
                            <RankList
                              data={divTop}
                              maxVal={maxDiv}
                              emptyLabel="No data for Division IT"
                            />
                          </Box>
                          {/* Right side: group ranking with 70/30 layout */}
                          <Box>
                            {mode === "division" ? (
                              <Card rounded={radiusStyle}>
                                <CardBody h={"full"} p={6}>
                                  <Box h={"full"}>
                                    {/* CSS-animated progress — no JS re-renders */}
                                    <Box h="3px" bg={isDark ? "gray.700" : "gray.200"} rounded="full" mb={3} overflow="hidden">
                                      <Box key={autoRotateKey} h="full" bg="purple.400" rounded="full"
                                        sx={{ animation: "orgRankFill 5s linear forwards", "@keyframes orgRankFill": { from: { width: "0%" }, to: { width: "100%" } } }} />
                                    </Box>
                                    <Grid templateColumns="7fr 3fr" gap={3}>
                                      {/* 70% — rank list */}
                                      <Box>
                                        <HStack
                                          mb={3}
                                          spacing={2}
                                          pb={2}
                                          borderBottom="1px"
                                          borderColor={borderCol}
                                        >
                                          <Icon
                                            as={FiUsers}
                                            color="purple.500"
                                            boxSize={4}
                                          />
                                          <Text
                                            fontWeight={700}
                                            fontSize="sm"
                                            color={
                                              isDark ? "white" : "gray.700"
                                            }
                                            noOfLines={1}
                                          >
                                            {groupLabel}
                                          </Text>
                                          <Badge
                                            colorScheme="purple"
                                            variant="subtle"
                                            fontSize="xs"
                                          >
                                            {grpTop.length}
                                          </Badge>
                                        </HStack>
                                        <RankList
                                          data={grpTop}
                                          maxVal={maxGrp}
                                          emptyLabel="No data for this group"
                                        />
                                      </Box>
                                      {/* 30% — group list */}
                                      <Box>
                                        <HStack
                                          mb={3}
                                          spacing={2}
                                          pb={2}
                                          borderBottom="1px"
                                          borderColor={borderCol}
                                        >
                                          <Icon
                                            as={FiLayers}
                                            color="gray.400"
                                            boxSize={3}
                                          />
                                          <Text
                                            fontWeight={600}
                                            fontSize="xs"
                                            color={textMuted}
                                          >
                                            Groups
                                          </Text>
                                        </HStack>
                                        <VStack spacing={1} align="stretch">
                                          {rankingGroupOptions.map((o, gi) => {
                                            const isSelected =
                                              o.value === rankingGroupCode;
                                            return (
                                              <Box
                                                key={o.value}
                                                px={2}
                                                py={1}
                                                rounded="md"
                                                cursor="pointer"
                                                bg={
                                                  isSelected
                                                    ? isDark
                                                      ? "secondary.800"
                                                      : "secondary.50"
                                                    : "transparent"
                                                }
                                                border="1px"
                                                borderColor={
                                                  isSelected
                                                    ? "secondary.400"
                                                    : "transparent"
                                                }
                                                onClick={() =>
                                                  setRankingGroupCode(o.value)
                                                }
                                                _hover={{
                                                  bg: isDark
                                                    ? "whiteAlpha.100"
                                                    : "gray.50",
                                                }}
                                                transition="background 0.15s"
                                              >
                                                <HStack spacing={2}>
                                                  <Box
                                                    w={4}
                                                    h={4}
                                                    rounded="full"
                                                    flexShrink={0}
                                                    bg={
                                                      isSelected
                                                        ? "secondary.500"
                                                        : isDark
                                                          ? "gray.600"
                                                          : "gray.200"
                                                    }
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                  >
                                                    <Text
                                                      fontSize="2xs"
                                                      color={
                                                        isSelected
                                                          ? "white"
                                                          : textMuted
                                                      }
                                                      fontWeight="bold"
                                                    >
                                                      {gi + 1}
                                                    </Text>
                                                  </Box>
                                                  <Text
                                                    fontSize="2xs"
                                                    fontWeight={
                                                      isSelected ? 700 : 400
                                                    }
                                                    color={
                                                      isSelected
                                                        ? "secondary.500"
                                                        : textMuted
                                                    }
                                                    noOfLines={2}
                                                    lineHeight="1.3"
                                                  >
                                                    {o.label}
                                                  </Text>
                                                </HStack>
                                              </Box>
                                            );
                                          })}
                                        </VStack>
                                      </Box>
                                    </Grid>
                                  </Box>
                                </CardBody>
                              </Card>
                            ) : (
                              <Box>
                                <HStack
                                  mb={3}
                                  spacing={2}
                                  pb={2}
                                  borderBottom="1px"
                                  borderColor={borderCol}
                                >
                                  <Icon
                                    as={FiUsers}
                                    color="purple.500"
                                    boxSize={4}
                                  />
                                  <Text
                                    fontWeight={700}
                                    fontSize="sm"
                                    color={isDark ? "white" : "gray.700"}
                                    noOfLines={1}
                                  >
                                    {groupLabel}
                                  </Text>
                                  <Badge
                                    colorScheme="purple"
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {grpTop.length}
                                  </Badge>
                                </HStack>
                                <RankList
                                  data={grpTop}
                                  maxVal={maxGrp}
                                  emptyLabel="No data for this group"
                                />
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      </TabPanel>
                    );
                  })}
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

          {/* ── Evaluation Report ── */}
          <Card
            w="fill"
            rounded={radiusStyle}
            bgColor={colorMode === "light" ? "white" : "gray.800"}
          >
            <CardBody>
              {/* Filter section */}
              <Card
                rounded={radiusStyle}
                bgColor={colorMode === "light" ? "white" : "gray.800"}
                mb={4}
                border="1px"
                borderColor={borderCol}
              >
                <CardBody>
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
                        {evalCountTotal}
                      </Badge>
                    </HStack>
                    <Button
                      size="sm"
                      leftIcon={<FiRefreshCcw />}
                      onClick={() => setEvalRefresh((p) => p + 1)}
                      isLoading={isEvalLoading}
                      variant="ghost"
                      rounded="lg"
                    >
                      Refresh
                    </Button>
                  </Flex>

                  {/* Period + Quarter + Status + Search */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "auto auto 1fr" }}
                    gap={3}
                    mb={4}
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
                        value={evalSelectedYear}
                        size="sm"
                        rounded="lg"
                        w="100px"
                        onChange={(e) =>
                          setEvalSelectedYear(Number(e.target.value))
                        }
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
                          const isActive = evalSelectedQuarters.includes(q);
                          return (
                            <Button
                              key={q}
                              size="sm"
                              rounded="lg"
                              px={3}
                              variant={isActive ? "solid" : "outline"}
                              colorScheme={isActive ? "blue" : "gray"}
                              onClick={() =>
                                setEvalSelectedQuarters((prev) =>
                                  prev.includes(q)
                                    ? prev.length > 1
                                      ? prev.filter((x) => x !== q)
                                      : prev
                                    : [...prev, q].sort(),
                                )
                              }
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
                          onChange={(opt) =>
                            setFilterProjectStatus(opt?.value || "")
                          }
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
                      value={evalGlobalFilter}
                      onChange={(e) => setEvalGlobalFilter(e.target.value)}
                      size="sm"
                      rounded="lg"
                      bg={cardBg}
                      borderColor={borderCol}
                    />
                  </Grid>

                  {/* Group / Team / Name filters */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={3}
                  >
                    <Flex alignItems="center" gap={3}>
                      <Text fontWeight={600} minW="fit-content" fontSize="sm">
                        Group:
                      </Text>
                      <Select
                        placeholder="All Groups"
                        isDisabled={mode === "group"}
                        value={
                          groupOptions.find(
                            (o) => o.value === FilterManageGroup,
                          ) || null
                        }
                        onChange={(opt) => {
                          setFilterManageGroup(opt?.value || "");
                          setFilterTeamCode("");
                        }}
                        options={groupOptions}
                        size="md"
                        isClearable
                        chakraStyles={{
                          container: (p) => ({
                            ...p,
                            width: "100%",
                            bg: cardBg,
                          }),
                        }}
                      />
                    </Flex>
                    <Flex alignItems="center" gap={3}>
                      <Text fontWeight={600} minW="fit-content" fontSize="sm">
                        Team:
                      </Text>
                      <Select
                        placeholder="All Teams"
                        isDisabled={!FilterManageGroup}
                        value={
                          teamOptions.find((o) => o.value === FilterTeamCode) ||
                          null
                        }
                        onChange={(opt) => setFilterTeamCode(opt?.value || "")}
                        options={teamOptions}
                        size="md"
                        isClearable
                        chakraStyles={{
                          container: (p) => ({
                            ...p,
                            width: "100%",
                            bg: cardBg,
                          }),
                        }}
                      />
                    </Flex>
                    <Flex alignItems="center" gap={3}>
                      <Text fontWeight={600} minW="fit-content" fontSize="sm">
                        Nama:
                      </Text>
                      <Select
                        placeholder="All Users"
                        value={
                          userOptions.find((o) => o.value === FilterUserName) ||
                          null
                        }
                        onChange={(opt) => setFilterUserName(opt?.value || "")}
                        options={userOptions}
                        size="md"
                        isClearable
                        isSearchable
                        chakraStyles={{
                          container: (p) => ({
                            ...p,
                            width: "100%",
                            bg: cardBg,
                          }),
                        }}
                      />
                    </Flex>
                  </Grid>
                </CardBody>
              </Card>

              {/* Data Table */}
              <Flex w="full" as={Stack} spacing={4}>
                {isEvalLoading ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={20}
                  >
                    <LoadingMiniSignature />
                    <Text mt={4} fontSize="sm" color="gray.500">
                      Loading performance data...
                    </Text>
                  </Flex>
                ) : EvalDataReport.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={20}
                  >
                    <Text fontSize="lg" color="gray.500" mb={2}>
                      No Data Available
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      No performance data found for the selected period
                    </Text>
                  </Flex>
                ) : (
                  <>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="sm" fontWeight="medium">
                        Total: {evalCountTotal} records
                      </Text>
                      <Flex align="center" gap={3}>
                        <Text fontSize="sm" fontWeight="medium">
                          Sort by:
                        </Text>
                        <Select
                          value={
                            sortFieldOptions.find(
                              (o) => o.value === evalSortField,
                            ) || null
                          }
                          onChange={(opt) =>
                            setEvalSortField(opt?.value || "nama")
                          }
                          options={sortFieldOptions}
                          size="sm"
                          chakraStyles={{
                            container: (p) => ({
                              ...p,
                              width: "150px",
                              bg: colorMode === "light" ? "white" : "gray.800",
                            }),
                          }}
                        />
                        <Select
                          value={
                            sortOrderOptions.find(
                              (o) => o.value === evalSortOrder,
                            ) || null
                          }
                          onChange={(opt) =>
                            setEvalSortOrder(opt?.value || "asc")
                          }
                          options={sortOrderOptions}
                          size="sm"
                          chakraStyles={{
                            container: (p) => ({
                              ...p,
                              width: "80px",
                              bg: colorMode === "light" ? "white" : "gray.800",
                            }),
                          }}
                        />
                      </Flex>
                    </Flex>
                    <TableComponentWithFilterCTX
                      table={evalTable}
                      handleFilterChange={(f: ListSearchByParamProps[]) =>
                        setEvalParamFilter(f)
                      }
                    />
                  </>
                )}
              </Flex>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <EvaluationAdjustModal
        isOpen={isEvaluationModalOpen}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setSelectedEvalUser(null);
        }}
        user={selectedEvalUser}
        onSuccess={() => setEvalRefresh((p) => p + 1)}
      />
    </LayoutAdmin>
  );
}
