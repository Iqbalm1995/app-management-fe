"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select as ChakraSelect,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiCode,
  FiEye,
  FiFilter,
  FiGrid,
  FiInfo,
  FiLayers,
  FiList,
  FiLock,
  FiPlus,
  FiPlusSquare,
  FiRefreshCcw,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";

// Services & Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ControlTable } from "@/app/components/tableComponents";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import {
  ListSearchByParam,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Application Master Data",
  breadCrumb: ["Home", "Master Data", "Application"],
};

export default function MasterDataAplikasiPage() {
  useDocumentTitle("Application Master Data");
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Services
  const { List, InsertData } = useApps();
  const { List: ListOrganization } = useOrganization();

  // Auth State
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data State
  const [dataAplikasi, setDataAplikasi] = useState<ApplicationMasterResponse[]>([]);
  const [orgList, setOrgList] = useState<OrganizationResponse[]>([]);
  const [isLoadingProcess, setIsLoadingProcess] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [refreshData, setRefreshData] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Stats State
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    critical: 0,
  });

  // Filter States
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedManageByGroupId, setSelectedManageByGroupId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCriticality, setSelectedCriticality] = useState<string>("ALL");

  // Pagination State
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Derived Total Projects Count from current applications list
  const totalProjectsCount = useMemo(() => {
    return dataAplikasi.reduce((acc, curr) => acc + (curr.countProjectAll || 0), 0);
  }, [dataAplikasi]);

  // Modal State for New Application
  const ModalForm = useDisclosure();
  const [formData, setFormData] = useState({
    appName: "",
    appShortName: "",
    appsDesc: "",
    note: "",
    iconApps: null as File | null,
  });

  // Load Organization Directory
  const loadOrganizations = async (token: string) => {
    try {
      const res = await ListOrganization(
        { page: 0, limit: 1000, search: "", filterWhere: [], fieldOrder: ["orgName"], orderDir: "asc" },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOrgList(res.data);
      }
    } catch (err) {
      console.error("Error loading organizations:", err);
    }
  };

  // Fetch Stats Summary (Total, Active, Critical)
  const fetchStatsSummary = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const [totalRes, activeRes, criticalRes] = await Promise.all([
        List({ search: "", limit: 1, page: 0, fieldOrder: ["createdAt"], orderDir: "desc", filterWhere: [] } as any, token),
        List({ search: "", limit: 1, page: 0, fieldOrder: ["createdAt"], orderDir: "desc", filterWhere: [{ field: "appsStatus", operator: "=", value: "ACTIVE" }] } as any, token),
        List({ search: "", limit: 1, page: 0, fieldOrder: ["createdAt"], orderDir: "desc", filterWhere: [{ field: "appIsCritical", operator: "=", value: "true" }] } as any, token),
      ]);

      setStatsData({
        total: totalRes?.countTotal || 0,
        active: activeRes?.countTotal || 0,
        critical: criticalRes?.countTotal || 0,
      });
    } catch (err) {
      console.error("Error fetching stats summary:", err);
    }
  }, []);

  // Initialize Auth Data & Token (Runs once on mount)
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      try {
        const storageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setDataAuth(storageAuth.dataLogin as AuthDataResponse);
      } catch (e) {
        console.error("Failed to parse authData", e);
      }
    }

    if (token) {
      setTokenData(token);
      loadOrganizations(token);
      fetchStatsSummary(token);
    }
  }, []);

  // Find Division IT (Parent Lock)
  const itDivision = useMemo(() => {
    if (!orgList.length) return null;
    return orgList.find((org) => {
      const isDiv = org.orgType?.toUpperCase() === "DIVISION" || org.orgType?.toUpperCase() === "DIV";
      if (!isDiv) return false;
      const code = org.orgCode?.toUpperCase() || "";
      const name = org.orgName?.toUpperCase() || "";
      return (
        code === "IT" ||
        code === "DIV_IT" ||
        code === "DIV-IT" ||
        code === "DIT" ||
        name.includes("TEKNOLOGI INFORMASI") ||
        name.includes("INFORMATION TECHNOLOGY") ||
        name === "DIVISI IT" ||
        name === "IT"
      );
    });
  }, [orgList]);

  // Extract Groups under Division IT
  const itGroupOptions = useMemo(() => {
    if (!orgList.length) return [];
    return orgList.filter((org) => {
      const isGroup = org.orgType?.toUpperCase() === "GROUP" || org.orgType?.toUpperCase() === "GRP";
      if (!isGroup) return false;
      if (itDivision) {
        return org.parentId === itDivision.id || org.orgParentCode === itDivision.orgCode;
      }
      return true;
    });
  }, [orgList, itDivision]);

  // Fetch Application List with Filters
  const GetDataAplikasi = useCallback(async () => {
    if (!tokenData) return;

    try {
      setIsLoadingProcess(true);

      const filterWhere: ListSearchByParam[] = [];

      // Manage By Group Filter (Child of Division IT)
      if (selectedManageByGroupId) {
        filterWhere.push({
          field: "appManageByGroupId",
          operator: "=",
          value: selectedManageByGroupId,
        });
      }

      // Status Filter
      if (selectedStatus && selectedStatus !== "ALL") {
        filterWhere.push({
          field: "appsStatus",
          operator: "=",
          value: selectedStatus,
        });
      }

      // Criticality Filter
      if (selectedCriticality && selectedCriticality !== "ALL") {
        filterWhere.push({
          field: "appIsCritical",
          operator: "=",
          value: selectedCriticality === "CRITICAL" ? "true" : "false",
        });
      }

      const payloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: filterWhere,
      };

      const requestData = await List(payloadList as any, tokenData);

      if (requestData?.statusCode !== RES_CODE_OK || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      const data = (requestData.data as ApplicationMasterResponse[]) || [];
      setDataAplikasi(data);

      const totalData = requestData.countTotal || 0;
      setTotalCount(totalData);
      const computedTotalPages = totalData > 0 ? Math.ceil(totalData / pageSize) : 0;
      setTotalPageData(computedTotalPages);
    } catch (error) {
      console.error("Error fetching applications:", error);
      showToast({
        description: "An unexpected error occurred while fetching application data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  }, [
    tokenData,
    globalFilter,
    selectedManageByGroupId,
    selectedStatus,
    selectedCriticality,
    pageSize,
    pageIndex,
  ]);

  useEffect(() => {
    if (tokenData) {
      GetDataAplikasi();
    }
  }, [GetDataAplikasi, refreshData]);

  // Toggle Row Expansion
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setGlobalFilter("");
    setSelectedManageByGroupId("");
    setSelectedStatus("ALL");
    setSelectedCriticality("ALL");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters = Boolean(
    globalFilter || selectedManageByGroupId || (selectedStatus && selectedStatus !== "ALL") || (selectedCriticality && selectedCriticality !== "ALL")
  );

  // Handle Add Application
  const handleAddApplication = async () => {
    if (!tokenData) return;

    try {
      setActionLoading(true);

      const payload = {
        appName: formData.appName,
        appShortName: formData.appShortName,
        appsDesc: formData.appsDesc || null,
        note: formData.note || null,
        appOwnerDivisionId: null,
        appOwnerGroupId: null,
        appManageByDivisionId: itDivision?.id || null,
        appManageByGroupId: null,
        appManageByTeamId: null,
        reqParentId: null,
      };

      const requestData = await InsertData(payload, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Application successfully registered into repository",
        statusToast: "success",
      });

      setFormData({ appName: "", appShortName: "", appsDesc: "", note: "", iconApps: null });
      ModalForm.onClose();
      setRefreshData((prev) => prev + 1);
      fetchStatsSummary(tokenData);
    } catch (error) {
      showToast({
        description: "Failed to register new application",
        statusToast: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // TanStack React Table
  const columnsData = useMemo<ColumnDef<ApplicationMasterResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.appCode,
        id: "appCode",
        header: () => <span>Application</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: dataAplikasi,
    columns: columnsData,
    pageCount: totalPages ?? 0,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* ── SECTION 1: HERO HEADER BANNER ── */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="xl"
      >
        {/* Subtle Watermark Logo */}
        <Box
          position="absolute"
          bottom={{ base: -4, md: -6 }}
          right={{ base: 2, md: 6 }}
          zIndex={0}
          opacity={0.1}
          pointerEvents="none"
        >
          <Icon as={HiOutlineDesktopComputer} boxSize={{ base: "140px", md: "200px" }} />
        </Box>

        <VStack spacing={5} align="stretch" position="relative" zIndex={1}>
          {/* Top Bar: Title & Action Buttons */}
          <Flex justify="space-between" align={{ base: "start", md: "center" }} wrap="wrap" gap={4}>
            <HStack spacing={4} align="center">
              <Box
                w={{ base: "48px", md: "56px" }}
                h={{ base: "48px", md: "56px" }}
                bgGradient="linear(to-br, secondary.100, secondary.50)"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="secondary.800"
                shadow="lg"
                flexShrink={0}
              >
                <Icon as={HiOutlineDesktopComputer} boxSize={{ base: 6, md: 7 }} />
              </Box>
              <VStack align="start" spacing={1}>
                <HStack spacing={2} wrap="wrap">
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    px={2.5}
                    py={0.5}
                    rounded="full"
                    fontSize="2xs"
                    fontWeight="bold"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    Enterprise Repository
                  </Badge>
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    px={2.5}
                    py={0.5}
                    rounded="full"
                    fontSize="2xs"
                    fontWeight="bold"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    Parent: Division IT (Locked)
                  </Badge>
                </HStack>
                <Heading size={{ base: "md", md: "lg" }} fontWeight="800" color="white">
                  Application Master Data & IT Portfolio
                </Heading>
                <Text fontSize="xs" color="whiteAlpha.850">
                  Unified Bank Application Catalog, IT Governance Mapping, and Connected Projects
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} alignSelf={{ base: "flex-end", md: "center" }}>
              <Button
                leftIcon={<FiRefreshCcw />}
                variant="outline"
                size="md"
                h="40px"
                onClick={() => {
                  setRefreshData((prev) => prev + 1);
                  if (tokenData) fetchStatsSummary(tokenData);
                }}
                isLoading={isLoadingProcess}
                borderColor="whiteAlpha.300"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: "whiteAlpha.200",
                  borderColor: "whiteAlpha.400",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={4}
                transition="all 0.2s ease"
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                size="md"
                h="40px"
                bg="secondary.400"
                color="white"
                _hover={{
                  bg: "secondary.300",
                  transform: "translateY(-1px)",
                }}
                rounded="full"
                px={5}
                fontSize="sm"
                fontWeight="bold"
                shadow="md"
                onClick={() => router.push("/master-data/Application/add")}
                transition="all 0.2s ease"
              >
                Add Application
              </Button>
            </HStack>
          </Flex>

          {/* Quick Metrics Cards */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
            <Box
              p={3.5}
              rounded="xl"
              bg="whiteAlpha.150"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="2xs" color="whiteAlpha.800" fontWeight="bold">TOTAL APPLICATIONS</Text>
                <Icon as={FiLayers} color="secondary.200" boxSize={4} />
              </HStack>
              <Text fontSize="xl" fontWeight="800" color="white" mt={1}>
                {statsData.total}
              </Text>
              <Text fontSize="3xs" color="whiteAlpha.800">
                Registered in IT directory
              </Text>
            </Box>

            <Box
              p={3.5}
              rounded="xl"
              bg="whiteAlpha.150"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="2xs" color="whiteAlpha.800" fontWeight="bold">ACTIVE STATUS</Text>
                <Icon as={FiCheckCircle} color="green.200" boxSize={4} />
              </HStack>
              <Text fontSize="xl" fontWeight="800" color="white" mt={1}>
                {statsData.active}
              </Text>
              <Text fontSize="3xs" color="green.200">
                Operational Active ({statsData.total > 0 ? Math.round((statsData.active / statsData.total) * 100) : 0}%)
              </Text>
            </Box>

            <Box
              p={3.5}
              rounded="xl"
              bg="whiteAlpha.150"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="2xs" color="whiteAlpha.800" fontWeight="bold">CRITICAL APPLICATIONS</Text>
                <Icon as={FiShield} color="red.200" boxSize={4} />
              </HStack>
              <Text fontSize="xl" fontWeight="800" color="white" mt={1}>
                {statsData.critical}
              </Text>
              <Text fontSize="3xs" color="red.200">
                Tier-1 / Mission Critical
              </Text>
            </Box>

            <Box
              p={3.5}
              rounded="xl"
              bg="whiteAlpha.150"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="2xs" color="whiteAlpha.800" fontWeight="bold">CONNECTED PROJECTS</Text>
                <Icon as={FiBriefcase} color="orange.200" boxSize={4} />
              </HStack>
              <Text fontSize="xl" fontWeight="800" color="white" mt={1}>
                {totalProjectsCount}
              </Text>
              <Text fontSize="3xs" color="whiteAlpha.800">
                Active SDLC & Portfolio
              </Text>
            </Box>
          </Grid>
        </VStack>
      </Box>

      {/* ── SECTION 2: ADVANCED SEARCH & MULTI-FILTER BAR ── */}
      <Card
        rounded={radiusStyle}
        shadow="md"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
        mb={6}
      >
        <CardHeader bg={isDark ? "gray.750" : "gray.50"} py={3.5} px={{ base: 4, md: 5 }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={2.5}>
              <Icon as={FiFilter} color="secondary.500" boxSize={4} />
              <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                Application Directory Search & Filters
              </Heading>
            </HStack>
            {hasActiveFilters && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                leftIcon={<FiX />}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            )}
          </Flex>
        </CardHeader>

        <CardBody p={{ base: 4, md: 5 }}>
          <VStack spacing={4} align="stretch">
            {/* Search Input */}
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by Application Name, Short Name, or App Code..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setRefreshData((prev) => prev + 1)}
                rounded="xl"
                bg={isDark ? "gray.750" : "gray.50"}
                border="1px"
                borderColor={isDark ? "gray.600" : "gray.300"}
                fontSize="sm"
                _focus={{
                  borderColor: "secondary.500",
                  boxShadow: "0 0 0 1px #805ad5",
                  bg: isDark ? "gray.700" : "white",
                }}
              />
              {globalFilter && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setGlobalFilter("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            {/* Cascading Filter Selectors */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
              {/* Parent Lock: Division IT Selector */}
              <FormControl size="sm">
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1} display="flex" alignItems="center" gap={1.5}>
                  <Icon as={FiLock} color="secondary.500" boxSize={3} />
                  Managing Division (Locked)
                </FormLabel>
                <Tooltip label="Managing Division is locked to IT Division as the parent management of application groups" hasArrow placement="top">
                  <ChakraSelect
                    size="md"
                    rounded="xl"
                    value={itDivision?.id || "IT"}
                    isDisabled
                    bg={isDark ? "gray.700" : "gray.100"}
                    borderColor={isDark ? "gray.600" : "gray.300"}
                    fontSize="xs"
                    fontWeight="semibold"
                    cursor="not-allowed"
                    opacity={0.9}
                  >
                    <option value={itDivision?.id || "IT"}>
                      {itDivision ? `${itDivision.orgName} (${itDivision.orgCode})` : "Information Technology Division (IT)"}
                    </option>
                  </ChakraSelect>
                </Tooltip>
              </FormControl>

              {/* Manage By Group Selector (Child of Division IT) */}
              <FormControl size="sm">
                <FormLabel fontSize="xs" fontWeight="bold" color="secondary.500" mb={1} display="flex" alignItems="center" gap={1}>
                  <Icon as={FiUsers} boxSize={3} />
                  Managed By IT Group
                </FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="xl"
                  value={selectedManageByGroupId}
                  onChange={(e) => {
                    setSelectedManageByGroupId(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  bg={isDark ? "gray.750" : "gray.50"}
                  borderColor={selectedManageByGroupId ? "secondary.500" : isDark ? "gray.600" : "gray.300"}
                  fontSize="xs"
                  _focus={{ borderColor: "secondary.500" }}
                >
                  <option value="">All IT Groups</option>
                  {itGroupOptions.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.orgName} ({grp.orgCode})
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>

              {/* Status Selector */}
              <FormControl size="sm">
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                  Operational Status
                </FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="xl"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  bg={isDark ? "gray.750" : "gray.50"}
                  borderColor={isDark ? "gray.600" : "gray.300"}
                  fontSize="xs"
                  _focus={{ borderColor: "secondary.500" }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </ChakraSelect>
              </FormControl>

              {/* Criticality Selector */}
              <FormControl size="sm">
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                  Criticality Level
                </FormLabel>
                <ChakraSelect
                  size="md"
                  rounded="xl"
                  value={selectedCriticality}
                  onChange={(e) => {
                    setSelectedCriticality(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  bg={isDark ? "gray.750" : "gray.50"}
                  borderColor={isDark ? "gray.600" : "gray.300"}
                  fontSize="xs"
                  _focus={{ borderColor: "secondary.500" }}
                >
                  <option value="ALL">All Levels</option>
                  <option value="CRITICAL">Critical (Mission Critical)</option>
                  <option value="STANDARD">Standard / Regular</option>
                </ChakraSelect>
              </FormControl>
            </SimpleGrid>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <HStack spacing={2} wrap="wrap" pt={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  Active Filters:
                </Text>
                {globalFilter && (
                  <Badge colorScheme="blue" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                    Search: "{globalFilter}"
                    <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setGlobalFilter("")} />
                  </Badge>
                )}
                {selectedManageByGroupId && (
                  <Badge colorScheme="purple" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                    IT Group: {itGroupOptions.find((g) => g.id === selectedManageByGroupId)?.orgName || selectedManageByGroupId}
                    <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedManageByGroupId("")} />
                  </Badge>
                )}
                {selectedStatus && selectedStatus !== "ALL" && (
                  <Badge colorScheme={selectedStatus === "ACTIVE" ? "green" : "red"} variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                    Status: {selectedStatus}
                    <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedStatus("ALL")} />
                  </Badge>
                )}
                {selectedCriticality && selectedCriticality !== "ALL" && (
                  <Badge colorScheme="red" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                    Criticality: {selectedCriticality}
                    <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedCriticality("ALL")} />
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* ── SECTION 3: 80% / 20% LAYOUT ── */}
      <Grid templateColumns={{ base: "repeat(12, 1fr)" }} gap={{ base: 4, md: 6 }} pb={12}>
        {/* ── LEFT 80%: MAIN DIRECTORY LIST SECTION ── */}
        <GridItem colSpan={{ base: 12, lg: 9, xl: 9.5 }}>
          <Card
            rounded={radiusStyle}
            shadow="xl"
            border="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "white"}
            overflow="hidden"
            w="full"
          >
            {/* Section Panel Header */}
            <CardHeader
              bg={isDark ? "gray.750" : "gray.50"}
              borderBottom="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              py={4}
              px={{ base: 4, md: 6 }}
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3.5}>
                  <Box
                    w={10}
                    h={10}
                    bg="secondary.500"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    shadow="sm"
                  >
                    <Icon as={FiLayers} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2.5}>
                      <Heading size="md" color={isDark ? "white" : "gray.800"} fontWeight="800">
                        Application Master Directory
                      </Heading>
                      <Badge
                        colorScheme="purple"
                        rounded="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {totalCount} Applications
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      Showing {dataAplikasi.length} of {totalCount} total registered applications
                    </Text>
                  </VStack>
                </HStack>

                {/* View Mode Switcher */}
                <HStack spacing={2}>
                  <HStack
                    bg={isDark ? "gray.700" : "gray.100"}
                    rounded="xl"
                    p={1}
                    spacing={1}
                    border="1px solid"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                  >
                    <Tooltip label="Table View" hasArrow>
                      <Button
                        size="xs"
                        variant={viewMode === "table" ? "solid" : "ghost"}
                        colorScheme={viewMode === "table" ? "secondary" : "gray"}
                        onClick={() => setViewMode("table")}
                        rounded="lg"
                        px={2.5}
                        leftIcon={<FiList />}
                      >
                        Table
                      </Button>
                    </Tooltip>
                    <Tooltip label="Grid View" hasArrow>
                      <Button
                        size="xs"
                        variant={viewMode === "grid" ? "solid" : "ghost"}
                        colorScheme={viewMode === "grid" ? "secondary" : "gray"}
                        onClick={() => setViewMode("grid")}
                        rounded="lg"
                        px={2.5}
                        leftIcon={<FiGrid />}
                      >
                        Grid
                      </Button>
                    </Tooltip>
                    <Tooltip label="Compact View" hasArrow>
                      <Button
                        size="xs"
                        variant={viewMode === "list" ? "solid" : "ghost"}
                        colorScheme={viewMode === "list" ? "secondary" : "gray"}
                        onClick={() => setViewMode("list")}
                        rounded="lg"
                        px={2.5}
                        leftIcon={<FiActivity />}
                      >
                        Compact
                      </Button>
                    </Tooltip>
                  </HStack>
                </HStack>
              </Flex>
            </CardHeader>

            {/* Section Panel Table Body */}
            <CardBody p={5}>
              {/* Results Info Strip */}
              <HStack mb={4} fontSize="sm" color="gray.600">
                <Text>
                  Showing {dataAplikasi.length} of {totalCount} Application records
                </Text>
                <Spacer />
                <Text>
                  Page {pageIndex + 1} of {totalPages || 1}
                </Text>
              </HStack>

              {isLoadingProcess ? (
                <Flex justify="center" align="center" minH="350px" w="full">
                  <LoadingMiniSignature />
                </Flex>
              ) : dataAplikasi.length === 0 ? (
                <VStack spacing={6} py={16} textAlign="center">
                  <Box
                    w={20}
                    h={20}
                    bg={isDark ? "gray.700" : "gray.100"}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={HiOutlineDesktopComputer} boxSize={10} color="gray.400" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color={isDark ? "gray.300" : "gray.600"}>
                      {globalFilter || selectedManageByGroupId ? "No Applications Found" : "No Application Data Available"}
                    </Heading>
                    <Text color="gray.500" fontSize="sm" maxW="450px">
                      {globalFilter || selectedManageByGroupId
                        ? "No applications match your search and filter criteria. Please adjust your filters."
                        : "No applications are registered yet. Use the Add Application button to register."}
                    </Text>
                  </VStack>
                  {hasActiveFilters && (
                    <Button size="sm" variant="outline" onClick={handleResetFilters} rounded="xl">
                      Reset Filters
                    </Button>
                  )}
                </VStack>
              ) : (
                <>
                  {/* ── MODE 1: TABLE VIEW (Standard Master Table Pattern) ── */}
                  {viewMode === "table" && (
                    <Box overflowX="auto" w="full">
                      <Box
                        overflow="hidden"
                        border="1px solid"
                        borderRadius={radiusStyle}
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        w="full"
                        boxShadow="sm"
                      >
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr bg={isDark ? "gray.900" : "secondary.50"}>
                              <Th py={3.5} w="40px"></Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  No.
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Application & Code
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Managing Group & Division
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"} textAlign="center">
                                <Heading as="h5" size="xs">
                                  Criticality
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"} textAlign="center">
                                <Heading as="h5" size="xs">
                                  Status
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"} textAlign="center">
                                <Heading as="h5" size="xs">
                                  Connected Projects
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"} textAlign="center">
                                <Heading as="h5" size="xs">
                                  Actions
                                </Heading>
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {dataAplikasi.map((app, index) => {
                              const isExpanded = !!expandedRows[app.id];
                              const isCritical = app.appIsCritical === "true" || app.appIsCritical === "1";

                              return (
                                <React.Fragment key={app.id}>
                                  <Tr
                                    _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                                    transition="background 0.15s ease"
                                    bg={isExpanded ? (isDark ? "gray.750" : "purple.50") : undefined}
                                  >
                                    {/* Expand Button */}
                                    <Td py={3}>
                                      <IconButton
                                        aria-label="Expand application details"
                                        icon={<Icon as={isExpanded ? FiChevronUp : FiChevronDown} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="secondary"
                                        onClick={() => toggleRow(app.id)}
                                      />
                                    </Td>

                                    {/* Row Number */}
                                    <Td py={3} fontWeight="medium" color="gray.500" fontSize="xs">
                                      {pageIndex * pageSize + index + 1}
                                    </Td>

                                    {/* App Info */}
                                    <Td py={3}>
                                      <HStack spacing={3}>
                                        <Box
                                          w={9}
                                          h={9}
                                          bg={isDark ? "secondary.900" : "secondary.50"}
                                          color="secondary.500"
                                          rounded="lg"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          fontWeight="bold"
                                          fontSize="2xs"
                                          border="1px solid"
                                          borderColor={isDark ? "secondary.700" : "secondary.200"}
                                          flexShrink={0}
                                        >
                                          {(app.appShortName || app.appName || "APP")
                                            .split(/\s+/)
                                            .slice(0, 3)
                                            .map((w) => w.charAt(0).toUpperCase())
                                            .join("")}
                                        </Box>
                                        <VStack align="start" spacing={0.5}>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color={isDark ? "white" : "gray.800"}
                                            noOfLines={1}
                                          >
                                            {app.appName}
                                          </Text>
                                          <HStack spacing={1.5}>
                                            <Badge colorScheme="purple" variant="subtle" fontSize="3xs" rounded="md" px={1.5}>
                                              {app.appShortName || "-"}
                                            </Badge>
                                            <Text fontSize="3xs" color="gray.500">
                                              ({app.appCode})
                                            </Text>
                                          </HStack>
                                        </VStack>
                                      </HStack>
                                    </Td>

                                    {/* Manage By Group & Division */}
                                    <Td py={3}>
                                      <VStack align="start" spacing={0.5}>
                                        <Text fontSize="xs" fontWeight="semibold" color={isDark ? "gray.200" : "gray.700"} noOfLines={1}>
                                          {app.appManageByGroupName || "IT Group (Unassigned)"}
                                        </Text>
                                        <Text fontSize="3xs" color="gray.500">
                                          {app.appManageByDivisionName || itDivision?.orgName || "Information Technology Division"}
                                        </Text>
                                      </VStack>
                                    </Td>

                                    {/* Criticality */}
                                    <Td py={3} textAlign="center">
                                      {isCritical ? (
                                        <Badge colorScheme="red" variant="solid" rounded="full" px={2} py={0.5} fontSize="3xs">
                                          CRITICAL
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="gray" variant="subtle" rounded="full" px={2} py={0.5} fontSize="3xs">
                                          STANDARD
                                        </Badge>
                                      )}
                                    </Td>

                                    {/* Status */}
                                    <Td py={3} textAlign="center">
                                      <StatusBadge status={app.appsStatus} fontSize="3xs" rounded="full" />
                                    </Td>

                                    {/* Linked Projects */}
                                    <Td py={3} textAlign="center">
                                      <HStack justify="center" spacing={2}>
                                        <Badge colorScheme="purple" variant="outline" rounded="md" px={1.5} fontSize="3xs">
                                          {app.countProjectAll || 0} Total
                                        </Badge>
                                        {(app.countProjectOnGoing || 0) > 0 && (
                                          <Badge colorScheme="orange" variant="solid" rounded="md" px={1.5} fontSize="3xs">
                                            {app.countProjectOnGoing} Run
                                          </Badge>
                                        )}
                                        {(app.countProjectCompleted || 0) > 0 && (
                                          <Badge colorScheme="green" variant="solid" rounded="md" px={1.5} fontSize="3xs">
                                            {app.countProjectCompleted} Done
                                          </Badge>
                                        )}
                                      </HStack>
                                    </Td>

                                    {/* Actions */}
                                    <Td py={3} textAlign="center">
                                      <Button
                                        as={Link}
                                        href={`/master-data/Application/detail?id=${app.id}`}
                                        size="xs"
                                        colorScheme="secondary"
                                        variant="outline"
                                        rounded="lg"
                                        rightIcon={<FiEye />}
                                      >
                                        Detail
                                      </Button>
                                    </Td>
                                  </Tr>

                                  {/* Expandable Row Details Drawer */}
                                  {isExpanded && (
                                    <Tr bg={isDark ? "gray.850" : "gray.50"}>
                                      <Td colSpan={8} p={4}>
                                        <Card
                                          size="sm"
                                          rounded="xl"
                                          border="1px"
                                          borderColor={isDark ? "gray.700" : "gray.200"}
                                          bg={isDark ? "gray.800" : "white"}
                                          shadow="sm"
                                        >
                                          <CardBody p={4}>
                                            <VStack align="stretch" spacing={3}>
                                              {/* Description & Technical Stack */}
                                              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                {/* Column 1: Deskripsi & Profil */}
                                                <VStack align="start" spacing={2}>
                                                  <HStack spacing={2}>
                                                    <Icon as={FiInfo} color="secondary.500" />
                                                    <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                                                      Application Description & Notes
                                                    </Text>
                                                  </HStack>
                                                  <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"}>
                                                    {app.appsDesc || "No detailed description recorded."}
                                                  </Text>
                                                  {app.note && (
                                                    <Text fontSize="2xs" color="gray.500" fontStyle="italic">
                                                      Note: {app.note}
                                                    </Text>
                                                  )}
                                                  {app.appInitaiteYear && (
                                                    <Badge colorScheme="teal" variant="subtle" fontSize="3xs" rounded="full">
                                                      Initiation Year: {app.appInitaiteYear}
                                                    </Badge>
                                                  )}
                                                </VStack>

                                                {/* Column 2: Tech Stack & Operasional */}
                                                <VStack align="start" spacing={2}>
                                                  <HStack spacing={2}>
                                                    <Icon as={FiCode} color="secondary.500" />
                                                    <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                                                      Architecture & Tech Stack
                                                    </Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Languages:</Text>
                                                    <Text fontWeight="semibold">{app.appProgrammingLanguages || "-"}</Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Frameworks:</Text>
                                                    <Text fontWeight="semibold">{app.appProgrammingFrameworks || "-"}</Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Dev Method:</Text>
                                                    <Text fontWeight="semibold">{app.appDevelopmentMethod || "-"}</Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">24/7 Operational:</Text>
                                                    <Badge colorScheme={app.appOperational24hrs === "true" ? "green" : "gray"} fontSize="3xs">
                                                      {app.appOperational24hrs === "true" ? "YES (24/7)" : "NO"}
                                                    </Badge>
                                                  </HStack>
                                                </VStack>

                                                {/* Column 3: PIC & Akses Jaringan */}
                                                <VStack align="start" spacing={2}>
                                                  <HStack spacing={2}>
                                                    <Icon as={FiUsers} color="secondary.500" />
                                                    <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                                                      Person In Charge (PIC) & Network
                                                    </Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Business Owner PIC:</Text>
                                                    <Text fontWeight="semibold">{app.appOwnerPicName || "-"}</Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Managing PIC:</Text>
                                                    <Text fontWeight="semibold">{app.appManagePicName || "-"}</Text>
                                                  </HStack>
                                                  <HStack spacing={2} fontSize="2xs">
                                                    <Text color="gray.500">Frontsite DNS:</Text>
                                                    <Text fontWeight="semibold" noOfLines={1}>{app.appAccessFrontsiteDns || "-"}</Text>
                                                  </HStack>
                                                  <Button
                                                    as={Link}
                                                    href={`/master-data/Application/detail?id=${app.id}`}
                                                    size="xs"
                                                    colorScheme="secondary"
                                                    rounded="lg"
                                                    mt={1}
                                                    rightIcon={<FiArrowRight />}
                                                  >
                                                    Manage Full Details
                                                  </Button>
                                                </VStack>
                                              </SimpleGrid>
                                            </VStack>
                                          </CardBody>
                                        </Card>
                                      </Td>
                                    </Tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  )}

                  {/* ── MODE 2: GRID CARDS VIEW (HERO PATTERN) ── */}
                  {viewMode === "grid" && (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                      {dataAplikasi.map((app) => {
                        const isCritical = app.appIsCritical === "true" || app.appIsCritical === "1";
                        const totalProjects = app.countProjectAll || 0;
                        const completedProjects = app.countProjectCompleted || 0;
                        const onGoingProjects = app.countProjectOnGoing || 0;
                        const progressPercent = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
                        const initials = (app.appShortName || app.appName || "APP")
                          .split(/\s+/)
                          .slice(0, 3)
                          .map((w) => w.charAt(0).toUpperCase())
                          .join("");

                        return (
                          <Card
                            key={app.id}
                            as={Link}
                            href={`/master-data/Application/detail?id=${app.id}`}
                            rounded={radiusStyle}
                            border="1px"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            bg={isDark ? "gray.800" : "white"}
                            shadow="md"
                            overflow="hidden"
                            display="flex"
                            flexDirection="column"
                            cursor="pointer"
                            role="group"
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            _hover={{
                              shadow: "2xl",
                              transform: "translateY(-5px)",
                              borderColor: "secondary.400",
                            }}
                          >
                            {/* ── CARD HERO BANNER HEADER ── */}
                            <Box
                              bgGradient="linear(to-br, secondary.800, secondary.500)"
                              color="white"
                              p={4}
                              position="relative"
                              overflow="hidden"
                            >
                              {/* Background Decorative Shapes */}
                              <Box
                                position="absolute"
                                top="-15px"
                                right="-15px"
                                w="70px"
                                h="70px"
                                bg="whiteAlpha.150"
                                rounded="full"
                                pointerEvents="none"
                              />
                              <Box
                                position="absolute"
                                bottom="-10px"
                                right="50px"
                                w="45px"
                                h="45px"
                                bg="whiteAlpha.100"
                                transform="rotate(45deg)"
                                pointerEvents="none"
                              />

                              <Flex justify="space-between" align="start" position="relative" zIndex={1} mb={3}>
                                <HStack spacing={3} align="center">
                                  {/* Frosted Glass Initial Box */}
                                  <Box
                                    w="44px"
                                    h="44px"
                                    bg="whiteAlpha.250"
                                    rounded="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontSize="sm"
                                    fontWeight="extrabold"
                                    letterSpacing="wider"
                                    shadow="md"
                                    backdropFilter="blur(8px)"
                                    border="1px solid"
                                    borderColor="whiteAlpha.350"
                                    flexShrink={0}
                                  >
                                    {initials}
                                  </Box>

                                  <VStack align="start" spacing={0.5} overflow="hidden">
                                    <HStack spacing={1.5} wrap="wrap">
                                      <Badge
                                        bg="whiteAlpha.300"
                                        color="white"
                                        fontSize="3xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        fontWeight="bold"
                                      >
                                        {app.appCode}
                                      </Badge>
                                      <Badge
                                        bg="blackAlpha.400"
                                        color="white"
                                        fontSize="3xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        fontWeight="semibold"
                                      >
                                        {app.appShortName || "-"}
                                      </Badge>
                                    </HStack>
                                    <Text
                                      fontSize="2xs"
                                      color="whiteAlpha.850"
                                      fontWeight="medium"
                                      noOfLines={1}
                                    >
                                      {app.appManageByGroupName || "Group IT"}
                                    </Text>
                                  </VStack>
                                </HStack>

                                {/* Status and Criticality Badges */}
                                <VStack align="end" spacing={1}>
                                  {isCritical && (
                                    <Badge
                                      bg="red.500"
                                      color="white"
                                      fontSize="3xs"
                                      px={2}
                                      py={0.5}
                                      rounded="full"
                                      fontWeight="extrabold"
                                      shadow="sm"
                                    >
                                      CRITICAL
                                    </Badge>
                                  )}
                                  <StatusBadge status={app.appsStatus} fontSize="3xs" rounded="full" />
                                </VStack>
                              </Flex>

                              {/* Hero Sub-bar: Tech & SLA Pills */}
                              <HStack justify="space-between" align="center" pt={1} borderTop="1px solid" borderColor="whiteAlpha.200">
                                <HStack spacing={1.5} wrap="wrap">
                                  {app.appOperational24hrs === "true" && (
                                    <Badge bg="green.400" color="green.900" fontSize="3xs" px={1.5} rounded="md" fontWeight="bold">
                                      24/7 SLA
                                    </Badge>
                                  )}
                                  <Text fontSize="3xs" color="whiteAlpha.800">
                                    {app.appManageByDivisionName || "IT Division"}
                                  </Text>
                                </HStack>

                                <Badge
                                  bg="white"
                                  color="secondary.700"
                                  fontSize="3xs"
                                  px={2}
                                  py={0.5}
                                  rounded="full"
                                  fontWeight="extrabold"
                                >
                                  {totalProjects} Projects
                                </Badge>
                              </HStack>
                            </Box>

                            {/* ── CARD BODY ── */}
                            <CardBody p={4} display="flex" flexDirection="column" gap={3} flex={1}>
                              {/* App Name & Tooltip */}
                              <Box>
                                <Tooltip label={app.appName} hasArrow placement="top" isDisabled={app.appName.length <= 40}>
                                  <Heading
                                    size="xs"
                                    fontWeight="800"
                                    color={isDark ? "white" : "gray.800"}
                                    noOfLines={1}
                                    _groupHover={{ color: "secondary.500" }}
                                    transition="color 0.2s"
                                  >
                                    {app.appName}
                                  </Heading>
                                </Tooltip>
                                <Text fontSize="2xs" color="gray.500" mt={1} noOfLines={2} minH="30px" lineHeight="shorter">
                                  {app.appsDesc || "No detailed description for this application."}
                                </Text>
                              </Box>

                              {/* Architecture & Tech Stack Micro Badges */}
                              <HStack spacing={1.5} wrap="wrap">
                                {app.appProgrammingLanguages && (
                                  <Badge colorScheme="blue" variant="subtle" fontSize="3xs" rounded="md" px={1.5}>
                                    {app.appProgrammingLanguages}
                                  </Badge>
                                )}
                                {app.appProgrammingFrameworks && (
                                  <Badge colorScheme="purple" variant="subtle" fontSize="3xs" rounded="md" px={1.5}>
                                    {app.appProgrammingFrameworks}
                                  </Badge>
                                )}
                                {app.appDevelopmentMethod && (
                                  <Badge colorScheme="teal" variant="subtle" fontSize="3xs" rounded="md" px={1.5}>
                                    {app.appDevelopmentMethod}
                                  </Badge>
                                )}
                              </HStack>

                              {/* Project SDLC Progress Bar */}
                              <VStack spacing={1.5} align="stretch" pt={1}>
                                <Flex justify="space-between" align="center" fontSize="3xs">
                                  <HStack spacing={1} color="gray.500">
                                    <Icon as={FiBriefcase} />
                                    <Text fontWeight="semibold">Project Portfolio:</Text>
                                  </HStack>
                                  <HStack spacing={1.5}>
                                    {onGoingProjects > 0 && (
                                      <Text color="orange.500" fontWeight="bold">
                                        {onGoingProjects} Run
                                      </Text>
                                    )}
                                    {completedProjects > 0 && (
                                      <Text color="green.500" fontWeight="bold">
                                        {completedProjects} Done
                                      </Text>
                                    )}
                                    {totalProjects === 0 && (
                                      <Text color="gray.400">No projects yet</Text>
                                    )}
                                  </HStack>
                                </Flex>
                                <Progress
                                  value={progressPercent}
                                  size="xs"
                                  colorScheme={progressPercent === 100 ? "green" : progressPercent > 0 ? "secondary" : "gray"}
                                  rounded="full"
                                  bg={isDark ? "gray.700" : "gray.100"}
                                />
                              </VStack>

                              <Divider borderColor={isDark ? "gray.700" : "gray.200"} mt="auto" />

                              {/* Card Footer Strip: PIC & View Detail */}
                              <Flex justify="space-between" align="center" fontSize="2xs" pt={0.5}>
                                <HStack spacing={1.5} color="gray.500" maxW="60%">
                                  <Icon as={FiUsers} color="secondary.500" boxSize={3} />
                                  <Text noOfLines={1} fontSize="3xs">
                                    {app.appManagePicName || app.appOwnerPicName || "IT PIC"}
                                  </Text>
                                </HStack>

                                <HStack
                                  spacing={1}
                                  color="secondary.500"
                                  fontWeight="bold"
                                  fontSize="3xs"
                                  _groupHover={{ transform: "translateX(2px)" }}
                                  transition="transform 0.2s"
                                >
                                  <Text>Details</Text>
                                  <Icon as={FiArrowRight} />
                                </HStack>
                              </Flex>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}

                  {/* ── MODE 3: COMPACT LIST VIEW ── */}
                  {viewMode === "list" && (
                    <VStack spacing={2} align="stretch">
                      {dataAplikasi.map((app) => (
                        <Flex
                          key={app.id}
                          as={Link}
                          href={`/master-data/Application/detail?id=${app.id}`}
                          align="center"
                          gap={3}
                          py={2.5}
                          px={3.5}
                          rounded="xl"
                          border="1px"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          bg={isDark ? "gray.800" : "white"}
                          transition="all 0.15s ease"
                          _hover={{
                            bg: isDark ? "gray.750" : "purple.50",
                            borderColor: "secondary.300",
                          }}
                        >
                          <Box
                            w={8}
                            h={8}
                            bg={isDark ? "secondary.900" : "secondary.50"}
                            color="secondary.500"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="3xs"
                          >
                            {(app.appShortName || "APP").substring(0, 3).toUpperCase()}
                          </Box>
                          <Box flex={1} minW={0}>
                            <HStack spacing={2}>
                              <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                                {app.appName}
                              </Text>
                              <Badge colorScheme="purple" fontSize="3xs">{app.appShortName}</Badge>
                            </HStack>
                            <Text fontSize="3xs" color="gray.500">
                              {app.appManageByGroupName || "Group IT"} • {app.appCode}
                            </Text>
                          </Box>
                          <HStack spacing={3} display={{ base: "none", sm: "flex" }}>
                            <StatusBadge status={app.appsStatus} fontSize="3xs" rounded="full" />
                            <Badge colorScheme="purple" variant="outline" fontSize="3xs">
                              {app.countProjectAll || 0} Projects
                            </Badge>
                          </HStack>
                          <Icon as={FiArrowRight} color="gray.400" boxSize={3.5} />
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </>
              )}
            </CardBody>

            {/* Card Footer with Standard ControlTable Pagination */}
            <CardFooter
              bg={isDark ? "gray.750" : "gray.50"}
              borderTop="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              py={4}
              px={{ base: 4, md: 6 }}
            >
              <ControlTable table={table} />
            </CardFooter>
          </Card>
        </GridItem>

        {/* ── RIGHT 20%: SIDEBAR (Quick Actions & Status Distribution) ── */}
        <GridItem colSpan={{ base: 12, lg: 3, xl: 2.5 }}>
          <VStack spacing={4} align="stretch" position="sticky" top="85px">
            {/* Sidebar Card 1: Quick Actions & Operations */}
            <Card
              rounded={radiusStyle}
              shadow="md"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
            >
              <CardHeader pb={2} pt={4} px={4}>
                <HStack spacing={2}>
                  <Icon as={FiZap} color="secondary.500" />
                  <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                    Quick Actions & Operations
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody px={4} pb={4} pt={2}>
                <VStack spacing={2.5} align="stretch">
                  <Button
                    leftIcon={<FiPlus />}
                    size="md"
                    h="44px"
                    colorScheme="secondary"
                    w="full"
                    rounded="xl"
                    fontSize="sm"
                    fontWeight="bold"
                    shadow="sm"
                    onClick={() => router.push("/master-data/Application/add")}
                  >
                    Add New Application
                  </Button>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    variant="outline"
                    w="full"
                    rounded="xl"
                    onClick={() => {
                      setRefreshData((prev) => prev + 1);
                      if (tokenData) fetchStatsSummary(tokenData);
                    }}
                    isLoading={isLoadingProcess}
                  >
                    Reload Data
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Sidebar Card 2: Status & Health Distribution */}
            <Card
              rounded={radiusStyle}
              shadow="md"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
            >
              <CardHeader pb={2} pt={4} px={4}>
                <HStack spacing={2}>
                  <Icon as={FiActivity} color="green.500" />
                  <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                    Application Status Distribution
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody px={4} pb={4} pt={2}>
                <VStack spacing={3.5} align="stretch">
                  {/* Active vs Inactive Ratio */}
                  <Box>
                    <Flex justify="space-between" fontSize="2xs" mb={1}>
                      <Text fontWeight="semibold">Active Operations</Text>
                      <Text color="green.500" fontWeight="bold">
                        {statsData.total > 0 ? Math.round((statsData.active / statsData.total) * 100) : 0}% ({statsData.active})
                      </Text>
                    </Flex>
                    <Progress
                      value={statsData.total > 0 ? (statsData.active / statsData.total) * 100 : 0}
                      size="xs"
                      colorScheme="green"
                      rounded="full"
                    />
                  </Box>

                  {/* Critical Ratio */}
                  <Box>
                    <Flex justify="space-between" fontSize="2xs" mb={1}>
                      <Text fontWeight="semibold">Critical Level (Tier-1)</Text>
                      <Text color="red.500" fontWeight="bold">
                        {statsData.total > 0 ? Math.round((statsData.critical / statsData.total) * 100) : 0}% ({statsData.critical})
                      </Text>
                    </Flex>
                    <Progress
                      value={statsData.total > 0 ? (statsData.critical / statsData.total) * 100 : 0}
                      size="xs"
                      colorScheme="red"
                      rounded="full"
                    />
                  </Box>

                  <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                  <HStack justify="space-between" fontSize="2xs">
                    <Text color="gray.500">Total Registered:</Text>
                    <Badge colorScheme="purple" fontSize="3xs" rounded="full" px={2}>
                      {statsData.total} Apps
                    </Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Sidebar Card 3: IT Governance Guidelines */}
            <Card
              rounded={radiusStyle}
              shadow="md"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
              bg={isDark ? "gray.800" : "white"}
            >
              <CardHeader pb={2} pt={4} px={4}>
                <HStack spacing={2}>
                  <Icon as={FiBookOpen} color="blue.500" />
                  <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                    IT Group Governance
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody px={4} pb={4} pt={2}>
                <VStack spacing={2.5} align="start" fontSize="2xs" color="gray.500">
                  <HStack align="start" spacing={2}>
                    <Icon as={FiCheckCircle} color="secondary.500" mt={0.5} boxSize={3} />
                    <Text>
                      All applications are governed under the <strong>IT Division</strong> as the parent system architecture.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={2}>
                    <Icon as={FiCheckCircle} color="secondary.500" mt={0.5} boxSize={3} />
                    <Text>
                      <strong>Manage By Group</strong> mapping streamlines PIC delegation for development and maintenance.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={2}>
                    <Icon as={FiCheckCircle} color="secondary.500" mt={0.5} boxSize={3} />
                    <Text>
                      Applications designated as <strong>Critical</strong> must fulfill SLA profiles and redundant DC placement.
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* ── SECTION 4: MODAL ADD APPLICATION ── */}
      <Modal isOpen={ModalForm.isOpen} onClose={ModalForm.onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent
          bg={isDark ? "gray.800" : "white"}
          rounded={radiusStyle}
          border="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
          mx={4}
          shadow="2xl"
        >
          <ModalHeader py={4} px={6} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bg="secondary.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiPlusSquare} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                  Register New Application
                </Text>
                <Text fontSize="2xs" color="gray.500">
                  Add a new application repository to IT Master Data
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody px={6} py={5}>
            <VStack spacing={4} align="stretch">
              {/* Icon Upload */}
              <HStack spacing={4}>
                <Box
                  as="label"
                  htmlFor="icon-upload"
                  cursor="pointer"
                  position="relative"
                  _hover={{ opacity: 0.8 }}
                  transition="opacity 0.2s"
                >
                  {formData.iconApps ? (
                    <Box w={12} h={12} rounded="xl" overflow="hidden" border="1px" borderColor="gray.200">
                      <Box as="img" src={URL.createObjectURL(formData.iconApps)} w="full" h="full" objectFit="cover" />
                    </Box>
                  ) : (
                    <Box
                      w={12}
                      h={12}
                      rounded="xl"
                      bg={isDark ? "gray.700" : "gray.100"}
                      border="2px dashed"
                      borderColor={isDark ? "gray.600" : "gray.300"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiPlusSquare} boxSize={5} color="gray.400" />
                    </Box>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, iconApps: file });
                    }}
                    display="none"
                    id="icon-upload"
                  />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"} fontWeight="medium">
                    Application Icon
                  </Text>
                  <HStack spacing={2}>
                    <Text as="label" htmlFor="icon-upload" fontSize="xs" color="secondary.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      {formData.iconApps ? "Change Image" : "Click to upload icon"}
                    </Text>
                    {formData.iconApps && (
                      <Text as="span" fontSize="xs" color="red.400" cursor="pointer" _hover={{ textDecoration: "underline" }} onClick={() => setFormData({ ...formData, iconApps: null })}>
                        Remove
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              {/* Name Fields */}
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">
                    Application Name
                  </FormLabel>
                  <Input
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    placeholder="e.g. Mobile Banking Core"
                    size="sm"
                    rounded="lg"
                    bg={isDark ? "gray.750" : "gray.50"}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">
                    Short Name
                  </FormLabel>
                  <Input
                    value={formData.appShortName}
                    onChange={(e) => setFormData({ ...formData, appShortName: e.target.value.slice(0, 15) })}
                    placeholder="e.g. MBC (Max 15 chars)"
                    size="sm"
                    rounded="lg"
                    bg={isDark ? "gray.750" : "gray.50"}
                  />
                </FormControl>
              </Grid>

              {/* Description */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">
                  Application Description
                </FormLabel>
                <Textarea
                  value={formData.appsDesc}
                  onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                  placeholder="Summary of application functionality and scope..."
                  rows={3}
                  size="sm"
                  rounded="lg"
                  resize="none"
                  bg={isDark ? "gray.750" : "gray.50"}
                />
              </FormControl>

              {/* Notes */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">
                  Additional Notes
                </FormLabel>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Architectural notes or special details..."
                  rows={2}
                  size="sm"
                  rounded="lg"
                  resize="none"
                  bg={isDark ? "gray.750" : "gray.50"}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter px={6} py={4} borderTop="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={ModalForm.onClose} rounded="xl">
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="secondary"
                onClick={handleAddApplication}
                isLoading={actionLoading}
                isDisabled={!formData.appName || !formData.appShortName}
                rounded="xl"
                shadow="sm"
              >
                Save Application
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
