"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiArrowLeft,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
  FiClock,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiFilter,
  FiFolder,
  FiKey,
  FiLayers,
  FiLock,
  FiRefreshCcw,
  FiSearch,
  FiUnlock,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import Link from "next/link";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { TabButtonCustomStyle } from "@/app/components/TabsCustom";
import { ListSearchByParam } from "@/app/types/masterTypes";
import { useAdminConsoleAuth } from "@/app/context/AdminConsoleAuthContext";

// Helper: Securely resolve authorization token from localStorage
function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const directToken = localStorage.getItem("tokenData");
    if (directToken && directToken.trim()) return directToken.trim();

    const authDataStr = localStorage.getItem("authData");
    if (authDataStr) {
      const parsed = JSON.parse(authDataStr);
      const key = parsed?.dataAuth?.apiKey || parsed?.token || "";
      if (key && key.trim()) return key.trim();
    }
  } catch (err) {
    console.error("Error reading auth token:", err);
  }
  return "";
}

// Helper: Format Date
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

// Helper: Format Date & Time
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return String(dateStr);
  }
}

export default function AdminModePage() {
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Color Tokens matching Bank BJB Enterprise Palette
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const theadBg = useColorModeValue("secondary.50", "gray.900");
  const theadColor = useColorModeValue("secondary.800", "secondary.200");
  const tableHoverBg = useColorModeValue("gray.50", "gray.750");

  // Admin Console Auth from Unified Provider
  const { isUnlocked, lockConsole } = useAdminConsoleAuth();

  // Active Tab & Refresh Counter
  const [activeTab, setActiveTab] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Requirements Data & Server Pagination State
  const [requirements, setRequirements] = useState<RequirementsResponse[]>([]);
  const [reqTotalCount, setReqTotalCount] = useState<number>(0);
  const [reqTotalPages, setReqTotalPages] = useState<number>(1);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState<boolean>(false);

  // Projects Data & Server Pagination State
  const [projects, setProjects] = useState<ProjectDataResponse[]>([]);
  const [projTotalCount, setProjTotalCount] = useState<number>(0);
  const [projTotalPages, setProjTotalPages] = useState<number>(1);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Requirements Filters
  const [reqSearch, setReqSearch] = useState<string>("");
  const [reqTypeFilter, setReqTypeFilter] = useState<string>("ALL");
  const [reqStatusFilter, setReqStatusFilter] = useState<string>("ALL");
  const [reqMemoFilter, setReqMemoFilter] = useState<string>("ALL");
  const [reqSortOrder, setReqSortOrder] = useState<"NEWEST" | "OLDEST" | "CODE_ASC" | "CODE_DESC">("NEWEST");
  const [isReqAdvanceFilterOpen, setIsReqAdvanceFilterOpen] = useState<boolean>(false);

  // Projects Filters
  const [projSearch, setProjSearch] = useState<string>("");
  const [projTypeFilter, setProjTypeFilter] = useState<string>("ALL");
  const [projApprovalFilter, setProjApprovalFilter] = useState<string>("ALL");
  const [projStatusFilter, setProjStatusFilter] = useState<string>("ALL");
  const [projSortOrder, setProjSortOrder] = useState<"NEWEST" | "OLDEST" | "CODE_ASC" | "CODE_DESC">("NEWEST");
  const [isProjAdvanceFilterOpen, setIsProjAdvanceFilterOpen] = useState<boolean>(false);

  // TanStack Pagination States
  const [{ pageIndex: reqPageIndex, pageSize: reqPageSize }, setReqPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [{ pageIndex: projPageIndex, pageSize: projPageSize }, setProjPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  // Service Methods
  const { List: ListRequirements } = useRequirements();
  const { List: ListProjects } = useProjects();

  // Reset pagination to page 0 whenever filters change
  useEffect(() => {
    setReqPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [reqSearch, reqTypeFilter, reqStatusFilter, reqMemoFilter, reqSortOrder]);

  useEffect(() => {
    setProjPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [projSearch, projTypeFilter, projApprovalFilter, projStatusFilter, projSortOrder]);

  // ==========================================================================
  // Data Fetch: Requirements (Standard Server-Side Pagination Pattern)
  // ==========================================================================
  useEffect(() => {
    if (!isUnlocked || activeTab !== 0) return;
    const token = getAuthToken();
    if (!token) return;

    let isSubscribed = true;
    setIsLoadingRequirements(true);

    // Build filterWhere parameters matching backend RequestPagedFilterModel
    const filterWhere: ListSearchByParam[] = [];
    if (reqTypeFilter !== "ALL") {
      filterWhere.push({
        field: "requirementType",
        operator: "=",
        value: reqTypeFilter,
      });
    }
    if (reqStatusFilter !== "ALL") {
      filterWhere.push({
        field: "reqStatus",
        operator: "=",
        value: reqStatusFilter,
      });
    }
    if (reqMemoFilter !== "ALL") {
      filterWhere.push({
        field: "isHaveMemo",
        operator: "=",
        value: reqMemoFilter === "WITH_MEMO" ? "YES" : "NO",
      });
    }

    let fieldOrder = ["createdAt"];
    let orderDir: "asc" | "desc" = "desc";
    if (reqSortOrder === "OLDEST") {
      orderDir = "asc";
    } else if (reqSortOrder === "CODE_ASC") {
      fieldOrder = ["reqNumber"];
      orderDir = "asc";
    } else if (reqSortOrder === "CODE_DESC") {
      fieldOrder = ["reqNumber"];
      orderDir = "desc";
    }

    ListRequirements(
      {
        search: reqSearch.trim(),
        limit: reqPageSize,
        page: reqPageIndex,
        filterWhere,
        fieldOrder,
        orderDir,
      },
      token
    )
      .then((res) => {
        if (!isSubscribed) return;
        if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
          setRequirements(res.data);
          const total = res.countTotal ?? res.data.length ?? 0;
          setReqTotalCount(total);
          setReqTotalPages(Math.max(1, Math.ceil(total / reqPageSize)));
        } else {
          setRequirements([]);
          setReqTotalCount(0);
          setReqTotalPages(1);
        }
        setLastRefreshed(new Date());
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Error fetching requirements:", err);
        setRequirements([]);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingRequirements(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [
    isUnlocked,
    activeTab,
    reqPageIndex,
    reqPageSize,
    reqSearch,
    reqTypeFilter,
    reqStatusFilter,
    reqMemoFilter,
    reqSortOrder,
    refreshTrigger,
  ]);

  // ==========================================================================
  // Data Fetch: Projects (Standard Server-Side Pagination Pattern)
  // ==========================================================================
  useEffect(() => {
    if (!isUnlocked || activeTab !== 1) return;
    const token = getAuthToken();
    if (!token) return;

    let isSubscribed = true;
    setIsLoadingProjects(true);

    // Build filterWhere parameters matching backend RequestPagedFilterModel
    const filterWhere: ListSearchByParam[] = [];
    if (projTypeFilter !== "ALL") {
      filterWhere.push({
        field: "projectType",
        operator: "=",
        value: projTypeFilter,
      });
    }
    if (projApprovalFilter !== "ALL") {
      filterWhere.push({
        field: "approvalStatus",
        operator: "=",
        value: projApprovalFilter,
      });
    }
    if (projStatusFilter !== "ALL") {
      filterWhere.push({
        field: "projectStatus",
        operator: "=",
        value: projStatusFilter,
      });
    }

    let fieldOrder = ["createdAt"];
    let orderDir: "asc" | "desc" = "desc";
    if (projSortOrder === "OLDEST") {
      orderDir = "asc";
    } else if (projSortOrder === "CODE_ASC") {
      fieldOrder = ["projectCode"];
      orderDir = "asc";
    } else if (projSortOrder === "CODE_DESC") {
      fieldOrder = ["projectCode"];
      orderDir = "desc";
    }

    ListProjects(
      {
        search: projSearch.trim(),
        limit: projPageSize,
        page: projPageIndex,
        filterWhere,
        fieldOrder,
        orderDir,
      },
      token
    )
      .then((res) => {
        if (!isSubscribed) return;
        if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
          setProjects(res.data);
          const total = res.countTotal ?? res.data.length ?? 0;
          setProjTotalCount(total);
          setProjTotalPages(Math.max(1, Math.ceil(total / projPageSize)));
        } else {
          setProjects([]);
          setProjTotalCount(0);
          setProjTotalPages(1);
        }
        setLastRefreshed(new Date());
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Error fetching projects:", err);
        setProjects([]);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingProjects(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [
    isUnlocked,
    activeTab,
    projPageIndex,
    projPageSize,
    projSearch,
    projTypeFilter,
    projApprovalFilter,
    projStatusFilter,
    projSortOrder,
    refreshTrigger,
  ]);

  // Master Data Refresh Trigger
  const handleRefreshAll = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    toast({
      title: "Memuat Ulang",
      description: "Memperbarui data tabel...",
      status: "info",
      duration: 1500,
      isClosable: true,
    });
  }, [toast]);

  // Requirements Quick Stats
  const reqStats = useMemo(() => {
    let brd = 0;
    let rfc = 0;
    let draft = 0;
    let approved = 0;
    let withMemo = 0;

    requirements.forEach((r) => {
      const type = (r.requirementType || "").toUpperCase();
      const status = (r.reqStatus || "").toUpperCase();
      if (type === "BRD") brd++;
      if (type === "RFC") rfc++;
      if (status.includes("DRAFT") || status.includes("REVIEW")) draft++;
      if (status.includes("APPROV")) approved++;
      if (r.isHaveMemo === "YES" || r.isHaveMemo === "TRUE" || r.isHaveMemo === "1") withMemo++;
    });

    return { total: reqTotalCount, brd, rfc, draft, approved, withMemo };
  }, [requirements, reqTotalCount]);

  // Projects Quick Stats
  const projStats = useMemo(() => {
    let internalDev = 0;
    let procurement = 0;
    let waitingApproval = 0;
    let approved = 0;
    let active = 0;

    projects.forEach((p) => {
      const type = (p.projectType || "").toUpperCase();
      const approval = (p.approvalStatus || "").toUpperCase();
      const status = (p.projectStatus || "").toUpperCase();

      if (type.includes("INTERNAL")) internalDev++;
      if (type.includes("PROCUREMENT")) procurement++;
      if (approval.includes("WAIT") || approval.includes("PENDING")) waitingApproval++;
      if (approval.includes("APPROV")) approved++;
      if (status.includes("PROGRESS") || status.includes("PLANNING") || status.includes("ACTIVE")) active++;
    });

    return { total: projTotalCount, internalDev, procurement, waitingApproval, approved, active };
  }, [projects, projTotalCount]);

  // ==========================================================================
  // TanStack Columns: Requirements
  // ==========================================================================
  const reqColumns = useMemo<ColumnDef<RequirementsResponse>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: (info) => (
          <Text fontSize="2xs" fontWeight="700" color="gray.500">
            {reqPageIndex * reqPageSize + info.row.index + 1}
          </Text>
        ),
      },
      {
        accessorKey: "reqNumber",
        header: "REQ CODE",
        cell: (info) => {
          const code = info.getValue<string>() || "-";
          const type = (info.row.original.requirementType || "").toUpperCase();
          const hasMemo =
            info.row.original.isHaveMemo === "YES" ||
            info.row.original.isHaveMemo === "TRUE" ||
            info.row.original.isHaveMemo === "1";
          return (
            <VStack align="start" spacing={1}>
              <Badge
                variant="subtle"
                colorScheme={type === "RFC" ? "purple" : "blue"}
                fontSize="2xs"
                fontFamily="mono"
                px={2}
                py={0.5}
                rounded="md"
              >
                {code}
              </Badge>
              {info.row.original.isHaveMemo && (
                <Badge
                  colorScheme={hasMemo ? "teal" : "gray"}
                  variant="outline"
                  fontSize="3xs"
                  rounded="full"
                >
                  {hasMemo ? "MEMO ATTACHED" : "NO MEMO"}
                </Badge>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "reqNarative",
        header: "NARRATIVE & APP",
        cell: (info) => {
          const title = info.getValue<string>() || "-";
          const appName = info.row.original.appInitialName || info.row.original.appInitialCode;
          return (
            <VStack align="start" spacing={1} maxW="380px">
              <Text fontSize="xs" fontWeight="700" noOfLines={2} title={title}>
                {title}
              </Text>
              {appName && (
                <HStack spacing={1}>
                  <Tag size="sm" variant="subtle" colorScheme="cyan" rounded="md">
                    <TagLabel fontSize="3xs" fontWeight="bold">
                      {appName}
                    </TagLabel>
                  </Tag>
                </HStack>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "requirementType",
        header: "TYPE",
        cell: (info) => {
          const type = (info.getValue<string>() || "-").toUpperCase();
          return (
            <Badge
              colorScheme={type === "RFC" ? "purple" : "blue"}
              variant="solid"
              fontSize="2xs"
              px={2.5}
              py={0.5}
              rounded="full"
            >
              {type}
            </Badge>
          );
        },
      },
      {
        id: "initiator",
        header: "INITIATOR / PIC",
        cell: (info) => {
          const div = info.row.original.senderDivisionName || "-";
          const pic = info.row.original.userPicName || "-";
          return (
            <VStack align="start" spacing={0.5}>
              <Text fontSize="xs" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                {div}
              </Text>
              <HStack spacing={1} color="gray.500" fontSize="2xs">
                <Icon as={FiUser} boxSize={3} />
                <Text noOfLines={1}>{pic}</Text>
              </HStack>
            </VStack>
          );
        },
      },
      {
        id: "dates",
        header: "TIMELINE",
        cell: (info) => {
          const initDate = formatDate(info.row.original.reqInititateDate);
          const targetDate = formatDate(info.row.original.appLiveTargetDate);
          return (
            <VStack align="start" spacing={0.5} fontSize="2xs">
              <HStack spacing={1} color="gray.600">
                <Icon as={FiCalendar} boxSize={3} />
                <Text>Init: {initDate}</Text>
              </HStack>
              <HStack spacing={1} color="teal.600">
                <Icon as={FiClock} boxSize={3} />
                <Text fontWeight="600">Target: {targetDate}</Text>
              </HStack>
            </VStack>
          );
        },
      },
      {
        accessorKey: "reqStatus",
        header: "STATUS",
        cell: (info) => {
          const status = (info.getValue<string>() || "DRAFT").toUpperCase();
          let color = "gray";
          if (status.includes("APPROV")) color = "green";
          else if (status.includes("REVIEW")) color = "orange";
          else if (status.includes("REJECT")) color = "red";
          else if (status.includes("DRAFT")) color = "gray";

          return (
            <Badge colorScheme={color} variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "backlogsCount",
        header: "BACKLOGS",
        cell: (info) => {
          const count = info.row.original.backlogCount || 0;
          return (
            <Badge
              variant="outline"
              colorScheme={count > 0 ? "teal" : "gray"}
              fontSize="2xs"
              rounded="full"
              px={2}
            >
              {count} Items
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "REGISTERED",
        cell: (info) => {
          const created = formatDateTime(info.getValue<string>());
          const creator = info.row.original.createdBy || "-";
          return (
            <VStack align="start" spacing={0.5} fontSize="3xs" color="gray.500">
              <Text fontWeight="600">{created}</Text>
              <Text noOfLines={1}>by: {creator}</Text>
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: "ACTION",
        cell: (info) => {
          const item = info.row.original;
          return (
            <HStack spacing={1}>
              <Tooltip label="Edit Requirement (Admin Console)">
                <Link href={`/conf/admin-mode/requirement/edit?id=${item.id}`}>
                  <IconButton
                    aria-label="Edit Requirement"
                    icon={<FiEdit2 />}
                    size="xs"
                    variant="solid"
                    colorScheme="blue"
                    rounded="md"
                  />
                </Link>
              </Tooltip>
              <Tooltip label="Buka Requirement Detail">
                <Link
                  href={`/requirements/detail?reqId=${item.id}&type=${item.requirementType || "BRD"}`}
                  target="_blank"
                >
                  <IconButton
                    aria-label="Open Detail"
                    icon={<FiExternalLink />}
                    size="xs"
                    variant="outline"
                    colorScheme="gray"
                    rounded="md"
                  />
                </Link>
              </Tooltip>
            </HStack>
          );
        },
      },
    ],
    [reqPageIndex, reqPageSize, colorMode]
  );

  const reqTable = useReactTable({
    data: requirements,
    columns: reqColumns,
    pageCount: reqTotalPages,
    state: {
      pagination: { pageIndex: reqPageIndex, pageSize: reqPageSize },
    },
    onPaginationChange: setReqPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // ==========================================================================
  // TanStack Columns: Projects
  // ==========================================================================
  const projColumns = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: (info) => (
          <Text fontSize="2xs" fontWeight="700" color="gray.500">
            {projPageIndex * projPageSize + info.row.index + 1}
          </Text>
        ),
      },
      {
        accessorKey: "projectCode",
        header: "PROJECT CODE",
        cell: (info) => {
          const code = info.getValue<string>() || "-";
          const type = (info.row.original.projectType || "").toUpperCase();
          const isProcurement = type.includes("PROCUREMENT");
          return (
            <VStack align="start" spacing={1}>
              <Badge
                variant="subtle"
                colorScheme={isProcurement ? "teal" : "purple"}
                fontSize="2xs"
                fontFamily="mono"
                px={2}
                py={0.5}
                rounded="md"
              >
                {code}
              </Badge>
              {info.row.original.sdlcName && (
                <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                  SDLC: {info.row.original.sdlcName}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "projectName",
        header: "PROJECT NAME & CONNECTED APP",
        cell: (info) => {
          const title = info.getValue<string>() || "-";
          const app = info.row.original.appsProject;
          return (
            <VStack align="start" spacing={1} maxW="380px">
              <Text fontSize="xs" fontWeight="700" noOfLines={2} title={title}>
                {title}
              </Text>
              {app && (
                <Tag size="sm" variant="subtle" colorScheme="cyan" rounded="md">
                  <TagLabel fontSize="3xs" fontWeight="bold">
                    {app.appName || app.appCode}
                  </TagLabel>
                </Tag>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "projectType",
        header: "TYPE",
        cell: (info) => {
          const type = (info.getValue<string>() || "-").toUpperCase();
          const isProcurement = type.includes("PROCUREMENT");
          return (
            <Badge
              colorScheme={isProcurement ? "teal" : "purple"}
              variant="solid"
              fontSize="2xs"
              px={2.5}
              py={0.5}
              rounded="full"
            >
              {isProcurement ? "PROCUREMENT" : "INTERNAL DEV"}
            </Badge>
          );
        },
      },
      {
        id: "owner",
        header: "OWNER / DIVISION",
        cell: (info) => {
          const div = info.row.original.proOwnerDivisionName || "-";
          const group = info.row.original.proOwnerGroupName || "";
          return (
            <VStack align="start" spacing={0.5}>
              <Text fontSize="xs" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.200"}>
                {div}
              </Text>
              {group && (
                <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                  {group}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        id: "timeline",
        header: "TIMELINE",
        cell: (info) => {
          const regDate = formatDate(info.row.original.projectRegisterDate);
          const closeDate = formatDate(info.row.original.projectClosedDate);
          return (
            <VStack align="start" spacing={0.5} fontSize="2xs">
              <HStack spacing={1} color="gray.600">
                <Icon as={FiCalendar} boxSize={3} />
                <Text>Reg: {regDate}</Text>
              </HStack>
              <HStack spacing={1} color="teal.600">
                <Icon as={FiClock} boxSize={3} />
                <Text fontWeight="600">Target: {closeDate}</Text>
              </HStack>
            </VStack>
          );
        },
      },
      {
        accessorKey: "approvalStatus",
        header: "APPROVAL STATUS",
        cell: (info) => {
          const status = (info.getValue<string>() || "WAITING_APPROVAL").toUpperCase();
          let color = "orange";
          if (status.includes("APPROV")) color = "green";
          else if (status.includes("REVISE") || status.includes("REVISION")) color = "red";
          else if (status.includes("DRAFT")) color = "gray";

          return (
            <Badge colorScheme={color} variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "projectStatus",
        header: "LIFECYCLE STATUS",
        cell: (info) => {
          const status = (info.getValue<string>() || "PLANNING").toUpperCase();
          let color = "blue";
          if (status.includes("DONE") || status.includes("CLOSE")) color = "green";
          else if (status.includes("HOLD")) color = "orange";

          return (
            <Badge colorScheme={color} variant="outline" fontSize="2xs" px={2} py={0.5} rounded="full">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "REGISTERED",
        cell: (info) => {
          const created = formatDateTime(info.getValue<string>());
          const creator = info.row.original.createdByName || info.row.original.createdBy || "-";
          return (
            <VStack align="start" spacing={0.5} fontSize="3xs" color="gray.500">
              <Text fontWeight="600">{created}</Text>
              <Text noOfLines={1}>by: {creator}</Text>
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: "ACTIONS",
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <HStack spacing={1.5}>
              <Tooltip label="Buka Project Manager">
                <Link href={`/projects/manage?projectId=${id}`} target="_blank">
                  <IconButton
                    aria-label="Manage Project"
                    icon={<FiFolder />}
                    size="xs"
                    variant="outline"
                    colorScheme="purple"
                    rounded="md"
                  />
                </Link>
              </Tooltip>
              <Tooltip label="Buka Project Preview">
                <Link href={`/projects/preview?projectId=${id}`} target="_blank">
                  <IconButton
                    aria-label="Preview Project"
                    icon={<FiEye />}
                    size="xs"
                    variant="outline"
                    colorScheme="teal"
                    rounded="md"
                  />
                </Link>
              </Tooltip>
            </HStack>
          );
        },
      },
    ],
    [projPageIndex, projPageSize, colorMode]
  );

  const projTable = useReactTable({
    data: projects,
    columns: projColumns,
    pageCount: projTotalPages,
    state: {
      pagination: { pageIndex: projPageIndex, pageSize: projPageSize },
    },
    onPaginationChange: setProjPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <Box position="relative" bg={pageBg} minH="100vh" py={6}>
      <Container maxW="container.xl">
          {/* Top Operations Header */}
          <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Link href="/">
                <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />}>
                  Kembali
                </Button>
              </Link>
              <Box>
                <HStack spacing={2}>
                  <Heading as="h3" size="lg" letterSpacing="tight">
                    Admin Mode Console
                  </Heading>
                  <Tag size="sm" colorScheme="red" variant="solid" rounded="full">
                    <TagLabel fontWeight="bold">OPS / ADMIN</TagLabel>
                  </Tag>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Data Registry & Master Governance (Requirements & Projects Multi-Entity Supervisor)
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3}>
              <Link href="/conf/user-manage">
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FiUsers />}
                  rounded="lg"
                >
                  User Manage
                </Button>
              </Link>

              {/* Manual Refresh Button */}
              <Tooltip label="Muat Ulang Data Tabel Aktif">
                <IconButton
                  aria-label="Refresh Data"
                  icon={<FiRefreshCcw />}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  isLoading={isLoadingRequirements || isLoadingProjects}
                  onClick={handleRefreshAll}
                />
              </Tooltip>

              {/* Lock Console Button */}
              <Tooltip label="Kunci kembali console admin mode">
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FiLock />}
                  onClick={lockConsole}
                >
                  Lock Console
                </Button>
              </Tooltip>
            </HStack>
          </Flex>

          {/* Dual Tabs Navigation */}
          <Tabs
            index={activeTab}
            onChange={(idx) => setActiveTab(idx)}
            variant="unstyled"
            isLazy
          >
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
              <TabList as={HStack} spacing={2}>
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <Icon as={FiFileText} />
                    <Text>Requirements Management</Text>
                    <Badge colorScheme="blue" variant="solid" rounded="full" fontSize="3xs" px={2}>
                      {reqTotalCount}
                    </Badge>
                  </HStack>
                </TabButtonCustomStyle>

                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <Icon as={FiLayers} />
                    <Text>Projects Management</Text>
                    <Badge colorScheme="purple" variant="solid" rounded="full" fontSize="3xs" px={2}>
                      {projTotalCount}
                    </Badge>
                  </HStack>
                </TabButtonCustomStyle>
              </TabList>

              <Text fontSize="3xs" color="gray.400">
                Terakhir Diperbarui: {lastRefreshed.toLocaleTimeString()}
              </Text>
            </Flex>

            <TabPanels>
              {/* ============================================================== */}
              {/* TAB 1: REQUIREMENTS MANAGEMENT CONSOLE                        */}
              {/* ============================================================== */}
              <TabPanel p={0}>
                {/* Requirements Quick Stats Grid */}
                <Grid
                  templateColumns={{
                    base: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(6, 1fr)",
                  }}
                  gap={3}
                  mb={5}
                >
                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="gray.400" fontWeight="700">
                          TOTAL REQS
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold">
                          {reqStats.total}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="blue.500" fontWeight="700">
                          BRD (CURRENT PAGE)
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="blue.500">
                          {reqStats.brd}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="purple.500" fontWeight="700">
                          RFC (CURRENT PAGE)
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="purple.500">
                          {reqStats.rfc}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="orange.400" fontWeight="700">
                          DRAFT / IN-REVIEW
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="orange.500">
                          {reqStats.draft}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="green.500" fontWeight="700">
                          APPROVED
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="green.500">
                          {reqStats.approved}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="teal.500" fontWeight="700">
                          WITH MEMO
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="teal.500">
                          {reqStats.withMemo}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Table Container Card */}
                <Card bg={cardBg} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor}>
                  <CardHeader borderBottomWidth="1px" borderColor={borderColor} py={4}>
                    <VStack spacing={3} align="stretch">
                      {/* Primary Filter Toolbar */}
                      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(12, 1fr)" }} gap={3}>
                        <GridItem colSpan={{ base: 1, md: 5 }}>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <FiSearch color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Cari Kode REQ, Naratif, Inisiator, PIC, atau Aplikasi..."
                              value={reqSearch}
                              onChange={(e) => setReqSearch(e.target.value)}
                              rounded="lg"
                            />
                            {reqSearch && (
                              <InputRightElement>
                                <IconButton
                                  aria-label="Clear Search"
                                  icon={<FiX />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => setReqSearch("")}
                                />
                              </InputRightElement>
                            )}
                          </InputGroup>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Select
                            size="sm"
                            rounded="lg"
                            value={reqTypeFilter}
                            onChange={(e) => setReqTypeFilter(e.target.value)}
                          >
                            <option value="ALL">Semua Tipe (BRD/RFC)</option>
                            <option value="BRD">BRD Only</option>
                            <option value="RFC">RFC Only</option>
                          </Select>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Select
                            size="sm"
                            rounded="lg"
                            value={reqStatusFilter}
                            onChange={(e) => setReqStatusFilter(e.target.value)}
                          >
                            <option value="ALL">Semua Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="REVIEW">In Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </Select>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <Flex justify="flex-end" gap={2}>
                            <Button
                              size="sm"
                              variant={isReqAdvanceFilterOpen ? "solid" : "outline"}
                              colorScheme="blue"
                              leftIcon={<FiFilter />}
                              rightIcon={isReqAdvanceFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
                              onClick={() => setIsReqAdvanceFilterOpen(!isReqAdvanceFilterOpen)}
                            >
                              Advance Filter
                            </Button>

                            <IconButton
                              aria-label="Refresh Reqs"
                              icon={<FiRefreshCcw />}
                              size="sm"
                              isLoading={isLoadingRequirements}
                              onClick={handleRefreshAll}
                            />
                          </Flex>
                        </GridItem>
                      </Grid>

                      {/* Advance Filter Collapsible Section */}
                      <Collapse in={isReqAdvanceFilterOpen} animateOpacity>
                        <Box
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.850")}
                          rounded="xl"
                          border="1px"
                          borderColor={borderColor}
                          mt={1}
                        >
                          <Grid
                            templateColumns={{
                              base: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(3, 1fr)",
                            }}
                            gap={3}
                          >
                            {/* Memo Status */}
                            <Box>
                              <Text fontSize="3xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">
                                Status Memo
                              </Text>
                              <Select
                                size="xs"
                                rounded="md"
                                value={reqMemoFilter}
                                onChange={(e) => setReqMemoFilter(e.target.value)}
                              >
                                <option value="ALL">Semua Status Memo</option>
                                <option value="WITH_MEMO">Ada Memo Pengantar</option>
                                <option value="NO_MEMO">Tanpa Memo Pengantar</option>
                              </Select>
                            </Box>

                            {/* Sort Order (Default Newest First) */}
                            <Box>
                              <Text fontSize="3xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">
                                Urutan (Sort By)
                              </Text>
                              <Select
                                size="xs"
                                rounded="md"
                                value={reqSortOrder}
                                onChange={(e) =>
                                  setReqSortOrder(e.target.value as "NEWEST" | "OLDEST" | "CODE_ASC" | "CODE_DESC")
                                }
                              >
                                <option value="NEWEST">Terbaru (Newest First)</option>
                                <option value="OLDEST">Terlama (Oldest First)</option>
                                <option value="CODE_ASC">Kode REQ (A-Z)</option>
                                <option value="CODE_DESC">Kode REQ (Z-A)</option>
                              </Select>
                            </Box>

                            {/* Reset Button */}
                            <Box display="flex" alignItems="flex-end">
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                leftIcon={<FiXCircle />}
                                onClick={() => {
                                  setReqSearch("");
                                  setReqTypeFilter("ALL");
                                  setReqStatusFilter("ALL");
                                  setReqMemoFilter("ALL");
                                  setReqSortOrder("NEWEST");
                                }}
                              >
                                Reset Filter
                              </Button>
                            </Box>
                          </Grid>
                        </Box>
                      </Collapse>
                    </VStack>
                  </CardHeader>

                  <CardBody p={0}>
                    {isLoadingRequirements ? (
                      <Flex justify="center" align="center" minH="250px" direction="column" gap={3}>
                        <Spinner size="lg" color="blue.500" thickness="3px" />
                        <Text fontSize="sm" color="gray.500">
                          Memuat data Requirements...
                        </Text>
                      </Flex>
                    ) : (
                      <Box overflowX="auto">
                        <Table size="sm" variant="simple">
                          <Thead bg={theadBg}>
                            {reqTable.getHeaderGroups().map((headerGroup) => (
                              <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <Th
                                    key={header.id}
                                    color={theadColor}
                                    py={3}
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="wider"
                                  >
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(header.column.columnDef.header, header.getContext())}
                                  </Th>
                                ))}
                              </Tr>
                            ))}
                          </Thead>
                          <Tbody>
                            {reqTable.getRowModel().rows.length > 0 ? (
                              reqTable.getRowModel().rows.map((row) => (
                                <Tr
                                  key={row.id}
                                  _hover={{ bg: tableHoverBg }}
                                  transition="background-color 0.15s ease"
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id} py={2.5}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                  ))}
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={reqColumns.length} textAlign="center" py={12}>
                                  <VStack spacing={2}>
                                    <Icon as={FiFileText} boxSize={8} color="gray.400" />
                                    <Text fontWeight="600" color="gray.500">
                                      Tidak ada data Requirements yang cocok
                                    </Text>
                                    <Text fontSize="xs" color="gray.400">
                                      Coba ubah kata kunci pencarian atau sesuaikan filter Anda.
                                    </Text>
                                  </VStack>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    )}

                    {/* Pagination Bar */}
                    <Flex
                      justify="space-between"
                      align="center"
                      px={4}
                      py={3}
                      borderTopWidth="1px"
                      borderColor={borderColor}
                      wrap="wrap"
                      gap={2}
                    >
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          Menampilkan{" "}
                          <Text as="span" fontWeight="bold" color="gray.700">
                            {reqTotalCount === 0 ? 0 : reqPageIndex * reqPageSize + 1}
                            -
                            {Math.min((reqPageIndex + 1) * reqPageSize, reqTotalCount)}
                          </Text>{" "}
                          dari{" "}
                          <Text as="span" fontWeight="bold" color="gray.700">
                            {reqTotalCount}
                          </Text>{" "}
                          data
                        </Text>

                        <Select
                          size="xs"
                          w="85px"
                          rounded="md"
                          value={reqPageSize}
                          onChange={(e) => {
                            setReqPagination({
                              pageIndex: 0,
                              pageSize: Number(e.target.value),
                            });
                          }}
                        >
                          <option value={10}>10 / hal</option>
                          <option value={15}>15 / hal</option>
                          <option value={25}>25 / hal</option>
                          <option value={50}>50 / hal</option>
                          <option value={100}>100 / hal</option>
                        </Select>
                      </HStack>

                      <HStack spacing={1}>
                        <IconButton
                          aria-label="First page"
                          icon={<FiChevronsLeft />}
                          size="xs"
                          isDisabled={!reqTable.getCanPreviousPage()}
                          onClick={() => reqTable.setPageIndex(0)}
                        />
                        <IconButton
                          aria-label="Previous page"
                          icon={<FiChevronLeft />}
                          size="xs"
                          isDisabled={!reqTable.getCanPreviousPage()}
                          onClick={() => reqTable.previousPage()}
                        />
                        <Text fontSize="xs" px={2}>
                          Hal {reqPageIndex + 1} dari {reqTotalPages}
                        </Text>
                        <IconButton
                          aria-label="Next page"
                          icon={<FiChevronRight />}
                          size="xs"
                          isDisabled={!reqTable.getCanNextPage()}
                          onClick={() => reqTable.nextPage()}
                        />
                        <IconButton
                          aria-label="Last page"
                          icon={<FiChevronsRight />}
                          size="xs"
                          isDisabled={!reqTable.getCanNextPage()}
                          onClick={() => reqTable.setPageIndex(reqTotalPages - 1)}
                        />
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* ============================================================== */}
              {/* TAB 2: PROJECTS MANAGEMENT CONSOLE                             */}
              {/* ============================================================== */}
              <TabPanel p={0}>
                {/* Projects Quick Stats Grid */}
                <Grid
                  templateColumns={{
                    base: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(6, 1fr)",
                  }}
                  gap={3}
                  mb={5}
                >
                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="gray.400" fontWeight="700">
                          TOTAL PROJECTS
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold">
                          {projStats.total}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="purple.500" fontWeight="700">
                          INTERNAL DEV (PAGE)
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="purple.500">
                          {projStats.internalDev}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="teal.500" fontWeight="700">
                          PROCUREMENT (PAGE)
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="teal.500">
                          {projStats.procurement}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="orange.400" fontWeight="700">
                          WAITING APPROVAL
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="orange.500">
                          {projStats.waitingApproval}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="green.500" fontWeight="700">
                          APPROVED
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="green.500">
                          {projStats.approved}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
                    <CardBody p={3}>
                      <Stat>
                        <StatLabel fontSize="3xs" color="blue.500" fontWeight="700">
                          ACTIVE / PLANNING
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="bold" color="blue.500">
                          {projStats.active}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Table Container Card */}
                <Card bg={cardBg} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor}>
                  <CardHeader borderBottomWidth="1px" borderColor={borderColor} py={4}>
                    <VStack spacing={3} align="stretch">
                      {/* Primary Filter Toolbar */}
                      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(12, 1fr)" }} gap={3}>
                        <GridItem colSpan={{ base: 1, md: 5 }}>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <FiSearch color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Cari Kode PRJ, Nama Project, Aplikasi, atau Divisi..."
                              value={projSearch}
                              onChange={(e) => setProjSearch(e.target.value)}
                              rounded="lg"
                            />
                            {projSearch && (
                              <InputRightElement>
                                <IconButton
                                  aria-label="Clear Search"
                                  icon={<FiX />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => setProjSearch("")}
                                />
                              </InputRightElement>
                            )}
                          </InputGroup>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Select
                            size="sm"
                            rounded="lg"
                            value={projTypeFilter}
                            onChange={(e) => setProjTypeFilter(e.target.value)}
                          >
                            <option value="ALL">Semua Tipe Project</option>
                            <option value="INTERNAL_DEVELOPMENT">Internal Dev</option>
                            <option value="PROCUREMENT">Pengadaan</option>
                          </Select>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Select
                            size="sm"
                            rounded="lg"
                            value={projApprovalFilter}
                            onChange={(e) => setProjApprovalFilter(e.target.value)}
                          >
                            <option value="ALL">Semua Approval</option>
                            <option value="WAITING_APPROVAL">Waiting Approval</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REVISION_REQUIRED">Revisi</option>
                            <option value="DRAFT">Draft</option>
                          </Select>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 3 }}>
                          <Flex justify="flex-end" gap={2}>
                            <Button
                              size="sm"
                              variant={isProjAdvanceFilterOpen ? "solid" : "outline"}
                              colorScheme="purple"
                              leftIcon={<FiFilter />}
                              rightIcon={isProjAdvanceFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
                              onClick={() => setIsProjAdvanceFilterOpen(!isProjAdvanceFilterOpen)}
                            >
                              Advance Filter
                            </Button>

                            <IconButton
                              aria-label="Refresh Projects"
                              icon={<FiRefreshCcw />}
                              size="sm"
                              isLoading={isLoadingProjects}
                              onClick={handleRefreshAll}
                            />
                          </Flex>
                        </GridItem>
                      </Grid>

                      {/* Advance Filter Collapsible Section */}
                      <Collapse in={isProjAdvanceFilterOpen} animateOpacity>
                        <Box
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.850")}
                          rounded="xl"
                          border="1px"
                          borderColor={borderColor}
                          mt={1}
                        >
                          <Grid
                            templateColumns={{
                              base: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(3, 1fr)",
                            }}
                            gap={3}
                          >
                            {/* Lifecycle Status */}
                            <Box>
                              <Text fontSize="3xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">
                                Status Lifecycle
                              </Text>
                              <Select
                                size="xs"
                                rounded="md"
                                value={projStatusFilter}
                                onChange={(e) => setProjStatusFilter(e.target.value)}
                              >
                                <option value="ALL">Semua Status</option>
                                <option value="PLANNING">Planning</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done / Closed</option>
                                <option value="ON_HOLD">On Hold</option>
                              </Select>
                            </Box>

                            {/* Sort Order (Default Newest First) */}
                            <Box>
                              <Text fontSize="3xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">
                                Urutan (Sort By)
                              </Text>
                              <Select
                                size="xs"
                                rounded="md"
                                value={projSortOrder}
                                onChange={(e) =>
                                  setProjSortOrder(e.target.value as "NEWEST" | "OLDEST" | "CODE_ASC" | "CODE_DESC")
                                }
                              >
                                <option value="NEWEST">Terbaru (Newest First)</option>
                                <option value="OLDEST">Terlama (Oldest First)</option>
                                <option value="CODE_ASC">Kode Project (A-Z)</option>
                                <option value="CODE_DESC">Kode Project (Z-A)</option>
                              </Select>
                            </Box>

                            {/* Reset Button */}
                            <Box display="flex" alignItems="flex-end">
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                leftIcon={<FiXCircle />}
                                onClick={() => {
                                  setProjSearch("");
                                  setProjTypeFilter("ALL");
                                  setProjApprovalFilter("ALL");
                                  setProjStatusFilter("ALL");
                                  setProjSortOrder("NEWEST");
                                }}
                              >
                                Reset Filter
                              </Button>
                            </Box>
                          </Grid>
                        </Box>
                      </Collapse>
                    </VStack>
                  </CardHeader>

                  <CardBody p={0}>
                    {isLoadingProjects ? (
                      <Flex justify="center" align="center" minH="250px" direction="column" gap={3}>
                        <Spinner size="lg" color="purple.500" thickness="3px" />
                        <Text fontSize="sm" color="gray.500">
                          Memuat data Projects...
                        </Text>
                      </Flex>
                    ) : (
                      <Box overflowX="auto">
                        <Table size="sm" variant="simple">
                          <Thead bg={theadBg}>
                            {projTable.getHeaderGroups().map((headerGroup) => (
                              <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <Th
                                    key={header.id}
                                    color={theadColor}
                                    py={3}
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="wider"
                                  >
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(header.column.columnDef.header, header.getContext())}
                                  </Th>
                                ))}
                              </Tr>
                            ))}
                          </Thead>
                          <Tbody>
                            {projTable.getRowModel().rows.length > 0 ? (
                              projTable.getRowModel().rows.map((row) => (
                                <Tr
                                  key={row.id}
                                  _hover={{ bg: tableHoverBg }}
                                  transition="background-color 0.15s ease"
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id} py={2.5}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                  ))}
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={projColumns.length} textAlign="center" py={12}>
                                  <VStack spacing={2}>
                                    <Icon as={FiLayers} boxSize={8} color="gray.400" />
                                    <Text fontWeight="600" color="gray.500">
                                      Tidak ada data Projects yang cocok
                                    </Text>
                                    <Text fontSize="xs" color="gray.400">
                                      Coba ubah kata kunci pencarian atau sesuaikan filter Anda.
                                    </Text>
                                  </VStack>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    )}

                    {/* Pagination Bar */}
                    <Flex
                      justify="space-between"
                      align="center"
                      px={4}
                      py={3}
                      borderTopWidth="1px"
                      borderColor={borderColor}
                      wrap="wrap"
                      gap={2}
                    >
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          Menampilkan{" "}
                          <Text as="span" fontWeight="bold" color="gray.700">
                            {projTotalCount === 0 ? 0 : projPageIndex * projPageSize + 1}
                            -
                            {Math.min((projPageIndex + 1) * projPageSize, projTotalCount)}
                          </Text>{" "}
                          dari{" "}
                          <Text as="span" fontWeight="bold" color="gray.700">
                            {projTotalCount}
                          </Text>{" "}
                          data
                        </Text>

                        <Select
                          size="xs"
                          w="85px"
                          rounded="md"
                          value={projPageSize}
                          onChange={(e) => {
                            setProjPagination({
                              pageIndex: 0,
                              pageSize: Number(e.target.value),
                            });
                          }}
                        >
                          <option value={10}>10 / hal</option>
                          <option value={15}>15 / hal</option>
                          <option value={25}>25 / hal</option>
                          <option value={50}>50 / hal</option>
                          <option value={100}>100 / hal</option>
                        </Select>
                      </HStack>

                      <HStack spacing={1}>
                        <IconButton
                          aria-label="First page"
                          icon={<FiChevronsLeft />}
                          size="xs"
                          isDisabled={!projTable.getCanPreviousPage()}
                          onClick={() => projTable.setPageIndex(0)}
                        />
                        <IconButton
                          aria-label="Previous page"
                          icon={<FiChevronLeft />}
                          size="xs"
                          isDisabled={!projTable.getCanPreviousPage()}
                          onClick={() => projTable.previousPage()}
                        />
                        <Text fontSize="xs" px={2}>
                          Hal {projPageIndex + 1} dari {projTotalPages}
                        </Text>
                        <IconButton
                          aria-label="Next page"
                          icon={<FiChevronRight />}
                          size="xs"
                          isDisabled={!projTable.getCanNextPage()}
                          onClick={() => projTable.nextPage()}
                        />
                        <IconButton
                          aria-label="Last page"
                          icon={<FiChevronsRight />}
                          size="xs"
                          isDisabled={!projTable.getCanNextPage()}
                          onClick={() => projTable.setPageIndex(projTotalPages - 1)}
                        />
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
    </Box>
  );
}
