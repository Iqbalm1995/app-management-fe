"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  InputGroup,
  InputLeftElement,
  Select as ChakraSelect,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiPlusSquare,
  FiEye,
  FiGrid,
  FiList,
  FiRefreshCcw,
  FiFolder,
  FiX,
  FiMapPin,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { Search2Icon } from "@chakra-ui/icons";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

// Components
import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { ControlTable, TableComponentFull } from "@/app/components/tableComponents";
import CardVendor from "@/app/components/CardVendor";
import VendorSidebar from "./components/VendorSidebar";

// Context, Hooks & Services
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useVendor, { VendorResponse } from "@/app/services/useVendor";

// Constants & Types
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { ListSearchByParam, PaggingListPayload } from "@/app/types/masterTypes";

// ─── Status helpers ──────────────────────────────────────────────────────────
const VENDOR_STATUS_ACTIVE = "ACTIVE";
const VENDOR_STATUS_INACTIVE = "INACTIVE";
const VENDOR_STATUS_BLACKLIST = "BLACKLIST";

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case VENDOR_STATUS_ACTIVE:
      return "green";
    case VENDOR_STATUS_INACTIVE:
      return "orange";
    case VENDOR_STATUS_BLACKLIST:
      return "red";
    default:
      return "gray";
  }
};

const getRiskScheme = (val?: string | null) => {
  switch (val?.toUpperCase()) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "orange";
    case "LOW":
      return "teal";
    default:
      return "gray";
  }
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const VendorManagementPage = () => {
  useDocumentTitle("Vendor Management Hub");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const { List } = useVendor();

  // Auth state
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data state
  const [DataVendors, setDataVendors] = useState<VendorResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dependencyFilter, setDependencyFilter] = useState<string>("");
  const [impactFilter, setImpactFilter] = useState<string>("");

  // Pagination
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9, // default grid page size
  });

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // Auth setup
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    if (token) setTokenData(token);
  }, []);

  // Fetch Vendor List
  const fetchVendors = useCallback(async () => {
    if (!tokenData) return;

    const filterWhere: ListSearchByParam[] = [];
    if (statusFilter) {
      filterWhere.push({ field: "Status", operator: "=", value: statusFilter });
    }
    if (dependencyFilter) {
      filterWhere.push({ field: "DepedencyLevel", operator: "=", value: dependencyFilter });
    }
    if (impactFilter) {
      filterWhere.push({ field: "BusinessImpact", operator: "=", value: impactFilter });
    }

    const payload: PaggingListPayload = {
      search: globalFilter,
      limit: pageSize,
      page: pageIndex,
      filterWhere,
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    setIsLoadingProcess(true);

    try {
      const res = await List(payload, tokenData);
      if (!res || res.statusCode !== RES_CODE_OK) {
        showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
        setIsLoadingProcess(false);
        return;
      }
      const items = (res.data as VendorResponse[]) ?? [];
      const total = res.countTotal ?? items.length;
      setDataVendors(items);
      setTotalCount(total);
      setTotalPages(total > 0 ? Math.ceil(total / pageSize) : 1);
    } catch {
      showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
    } finally {
      setIsLoadingProcess(false);
    }
  }, [tokenData, pageIndex, pageSize, globalFilter, statusFilter, dependencyFilter, impactFilter, RefreshData]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Handle Switch View Mode
  const handleSwitchViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    const newSize = mode === "grid" ? 9 : 10;
    setPagination({ pageIndex: 0, pageSize: newSize });
  };

  // Status breakdown counters
  const activeCount = useMemo(
    () => DataVendors.filter((v) => v.status?.toUpperCase() === VENDOR_STATUS_ACTIVE).length,
    [DataVendors]
  );
  const inactiveCount = useMemo(
    () => DataVendors.filter((v) => v.status?.toUpperCase() === VENDOR_STATUS_INACTIVE).length,
    [DataVendors]
  );
  const blacklistCount = useMemo(
    () => DataVendors.filter((v) => v.status?.toUpperCase() === VENDOR_STATUS_BLACKLIST).length,
    [DataVendors]
  );

  // Clear all filters
  const handleClearAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter("");
    setDependencyFilter("");
    setImpactFilter("");
    setPagination({ pageIndex: 0, pageSize });
  };

  const hasActiveFilters = Boolean(globalFilter || statusFilter || dependencyFilter || impactFilter);

  // Table Columns Definition for List Mode with elevated readable typography
  const columns = useMemo<ColumnDef<VendorResponse>[]>(
    () => [
      {
        id: "rowNumber",
        header: "No.",
        cell: (info) => (
          <Text fontSize="md" fontWeight="bold" textAlign="center" color={isDark ? "gray.300" : "gray.600"}>
            {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}.
          </Text>
        ),
      },
      {
        accessorKey: "vendorName",
        header: "Vendor / Partner",
        cell: (info) => {
          const item = info.row.original;
          const initials = item.vendorName
            ? item.vendorName
                .replace(/^(PT|CV|UD|Firma|Koperasi)\.?\s*/i, "")
                .trim()
                .substring(0, 2)
                .toUpperCase()
            : "VN";

          return (
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, secondary.700, secondary.500)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="extrabold"
                fontSize="sm"
                shadow="sm"
                flexShrink={0}
              >
                {initials}
              </Box>
              <VStack align="start" spacing={1}>
                <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                  {item.vendorName}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={0.5} rounded="md">
                    {item.vendorCode}
                  </Badge>
                  <Badge colorScheme="purple" variant="outline" fontSize="xs" px={2} py={0.5} rounded="md">
                    {item.vendorType || "PT"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          );
        },
      },
      {
        accessorKey: "city",
        header: "Location & Domicile",
        cell: (info) => {
          const row = info.row.original;
          const loc = [row.city, row.province, row.country].filter(Boolean).join(", ");
          return (
            <HStack spacing={2} fontSize="md">
              <Icon as={FiMapPin} color="red.400" boxSize={4} flexShrink={0} />
              <Text fontSize="md" color={isDark ? "gray.200" : "gray.700"} fontWeight="medium">
                {loc || "—"}
              </Text>
            </HStack>
          );
        },
      },
      {
        accessorKey: "picBusinessName",
        header: "Business PIC",
        cell: (info) => (
          <VStack align="start" spacing={0.5}>
            <HStack spacing={1.5}>
              <Icon as={FiUser} color="secondary.500" boxSize={3.5} />
              <Text fontSize="md" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                {info.getValue() as string || "—"}
              </Text>
            </HStack>
            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"} pl={5}>
              {info.row.original.picBusinessEmail || info.row.original.picBusinessNumberHotline || "—"}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "depedencyLevel",
        header: "Risk Profile",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={1.5}>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold">Dependency:</Text>
                <Badge colorScheme={getRiskScheme(item.depedencyLevel)} fontSize="xs" rounded="md" px={2} py={0.5}>
                  {item.depedencyLevel || "LOW"}
                </Badge>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold">Impact:</Text>
                <Badge colorScheme={getRiskScheme(item.businessImpact)} fontSize="xs" rounded="md" px={2} py={0.5}>
                  {item.businessImpact || "LOW"}
                </Badge>
              </HStack>
            </VStack>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const val = (info.getValue() as string) || "UNKNOWN";
          return (
            <Badge
              colorScheme={getStatusColor(val)}
              rounded="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="bold"
            >
              {val}
            </Badge>
          );
        },
      },
      {
        id: "tdrExpiry",
        header: "TDR Status",
        cell: (info) => {
          const activeTdr = info.row.original.tdrList?.[0];
          if (!activeTdr) return <Badge colorScheme="gray" fontSize="xs" px={2} py={0.5} rounded="md">No TDR</Badge>;
          const expired = new Date(activeTdr.expiredAt).getTime() < new Date().getTime();
          return (
            <VStack align="start" spacing={0.5}>
              <Badge colorScheme={expired ? "red" : "teal"} fontSize="xs" px={2} py={0.5} rounded="md">
                {expired ? "TDR Expired" : "TDR Active"}
              </Badge>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                Exp: {new Date(activeTdr.expiredAt).toLocaleDateString("en-US")}
              </Text>
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: (info) => (
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => router.push(`/vendor-management/detail?id=${info.row.original.id}`)}
            rounded="xl"
            fontSize="xs"
            fontWeight="bold"
            _hover={{ bg: "secondary.500", color: "white", borderColor: "secondary.500" }}
          >
            Details
          </Button>
        ),
      },
    ],
    [isDark, pagination.pageIndex, pagination.pageSize, router]
  );

  const table = useReactTable({
    data: DataVendors,
    columns,
    pageCount: totalPages,
    state: { globalFilter, pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: true,
    manualPagination: true,
    debugTable: false,
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Vendor Management Hub"
        breadCrumb={["Home", "Vendor Management"]}
      />

      {/* ── Modern Hero Banner ── */}
      <Box
        position="relative"
        bgColor={isDark ? "gray.800" : "white"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 4, sm: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "auto", md: "180px" }}
        py={{ base: 6, md: 0 }}
      >
        {/* Abstract Geometric Accents */}
        <Box
          position="absolute"
          top="-20px"
          right="20px"
          w="80px"
          h="80px"
          bg={isDark ? "whiteAlpha.200" : "secondary.100"}
          rounded="full"
        />
        <Box
          position="absolute"
          bottom="-10px"
          left="30px"
          w="60px"
          h="60px"
          bg={isDark ? "whiteAlpha.300" : "secondary.200"}
          transform="rotate(45deg)"
        />
        <Box
          position="absolute"
          top="30px"
          left="60%"
          w="40px"
          h="40px"
          bg={isDark ? "whiteAlpha.200" : "secondary.100"}
          rounded="md"
          transform="rotate(30deg)"
        />

        <VStack
          h="full"
          justify="center"
          align="stretch"
          px={{ base: 5, md: 8 }}
          position="relative"
          zIndex={1}
          spacing={4}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            {/* Title & Icon */}
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(to-br, secondary.600, secondary.400)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="md"
              >
                <Icon as={FiBriefcase} boxSize={7} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading
                  size="lg"
                  color={isDark ? "white" : "gray.900"}
                  fontWeight="800"
                  letterSpacing="tight"
                >
                  Vendor Management Hub
                </Heading>
                <Text
                  fontSize="md"
                  color={isDark ? "whiteAlpha.800" : "gray.600"}
                  fontWeight="500"
                >
                  Manage vendor master data, TDR legal qualifications, risk profiles, and partnership governance
                </Text>
              </VStack>
            </HStack>

            {/* Quick Stats Metric Strip */}
            <HStack spacing={5} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={isDark ? "white" : "gray.900"}>
                  {totalCount}
                </Text>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Total Vendors
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {activeCount}
                </Text>
                <Text fontSize="xs" color="green.500" textTransform="uppercase" fontWeight="700">
                  Active
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {inactiveCount}
                </Text>
                <Text fontSize="xs" color="orange.500" textTransform="uppercase" fontWeight="700">
                  Inactive / Review
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {blacklistCount}
                </Text>
                <Text fontSize="xs" color="red.500" textTransform="uppercase" fontWeight="700">
                  Blacklist
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* ── 12-Column Layout Grid ── */}
      <Box px={{ base: 4, sm: 5, md: 6 }} pb={8} w="full">
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">
          {/* ── Left Sidebar (3 Cols / 25%) ── */}
          <GridItem colSpan={{ base: 12, lg: 3 }}>
            <VendorSidebar
              DataVendors={DataVendors}
              totalVendorsCount={totalCount}
              totalActiveVendorsCount={activeCount}
              totalInactiveVendorsCount={inactiveCount}
              totalBlacklistVendorsCount={blacklistCount}
              selectedStatusFilter={statusFilter}
              onSelectStatus={(status) => {
                setStatusFilter((prev) => (prev === status ? "" : status));
                setPagination({ pageIndex: 0, pageSize });
              }}
            />
          </GridItem>

          {/* ── Right Main Section (9 Cols / 75%) ── */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            <VStack spacing={5} align="stretch" w="full">
              {/* ── Top Search & Multi-Filter Card ── */}
              <Card
                rounded="2xl"
                shadow="lg"
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                bg={isDark ? "gray.800" : "white"}
              >
                <CardBody p={5}>
                  <VStack spacing={4} align="stretch">
                    {/* Search Row */}
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" h="full">
                        <Search2Icon color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        placeholder="Search vendors (company name, vendor code, city domicile, or PIC)..."
                        value={globalFilter}
                        onChange={(e) => {
                          setGlobalFilter(e.target.value);
                          setPagination({ pageIndex: 0, pageSize });
                        }}
                        bg={isDark ? "gray.700" : "gray.50"}
                        border="1px"
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        rounded="xl"
                        _focus={{ borderColor: "secondary.500", bg: isDark ? "gray.700" : "white" }}
                        fontSize="md"
                        h="46px"
                      />
                    </InputGroup>

                    {/* Filter Select Dropdowns */}
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                      {/* Filter Status */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1.5} textTransform="uppercase">
                          Vendor Status
                        </Text>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          bg={isDark ? "gray.700" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination({ pageIndex: 0, pageSize });
                          }}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <option value="">All Statuses</option>
                          <option value="ACTIVE">Active (ACTIVE)</option>
                          <option value="INACTIVE">Inactive (INACTIVE)</option>
                          <option value="BLACKLIST">Blacklist</option>
                        </ChakraSelect>
                      </Box>

                      {/* Filter Dependency */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1.5} textTransform="uppercase">
                          Dependency Level
                        </Text>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          bg={isDark ? "gray.700" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          value={dependencyFilter}
                          onChange={(e) => {
                            setDependencyFilter(e.target.value);
                            setPagination({ pageIndex: 0, pageSize });
                          }}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <option value="">All Dependency Levels</option>
                          <option value="HIGH">HIGH (Critical)</option>
                          <option value="MEDIUM">MEDIUM (Moderate)</option>
                          <option value="LOW">LOW (Low)</option>
                        </ChakraSelect>
                      </Box>

                      {/* Filter Business Impact */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1.5} textTransform="uppercase">
                          Business Impact
                        </Text>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          bg={isDark ? "gray.700" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          value={impactFilter}
                          onChange={(e) => {
                            setImpactFilter(e.target.value);
                            setPagination({ pageIndex: 0, pageSize });
                          }}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <option value="">All Impact Levels</option>
                          <option value="HIGH">HIGH (Significant)</option>
                          <option value="MEDIUM">MEDIUM (Moderate)</option>
                          <option value="LOW">LOW (Minor)</option>
                        </ChakraSelect>
                      </Box>
                    </SimpleGrid>

                    {/* Active Filters Tag Bar */}
                    {hasActiveFilters && (
                      <Flex justify="space-between" align="center" pt={1} wrap="wrap" gap={2}>
                        <Wrap spacing={2}>
                          {globalFilter && (
                            <WrapItem>
                              <Tag size="md" rounded="full" colorScheme="blue" variant="solid">
                                <TagLabel>Search: "{globalFilter}"</TagLabel>
                                <TagCloseButton onClick={() => setGlobalFilter("")} />
                              </Tag>
                            </WrapItem>
                          )}
                          {statusFilter && (
                            <WrapItem>
                              <Tag size="md" rounded="full" colorScheme={getStatusColor(statusFilter)} variant="solid">
                                <TagLabel>Status: {statusFilter}</TagLabel>
                                <TagCloseButton onClick={() => setStatusFilter("")} />
                              </Tag>
                            </WrapItem>
                          )}
                          {dependencyFilter && (
                            <WrapItem>
                              <Tag size="md" rounded="full" colorScheme="purple" variant="solid">
                                <TagLabel>Dependency: {dependencyFilter}</TagLabel>
                                <TagCloseButton onClick={() => setDependencyFilter("")} />
                              </Tag>
                            </WrapItem>
                          )}
                          {impactFilter && (
                            <WrapItem>
                              <Tag size="md" rounded="full" colorScheme="teal" variant="solid">
                                <TagLabel>Impact: {impactFilter}</TagLabel>
                                <TagCloseButton onClick={() => setImpactFilter("")} />
                              </Tag>
                            </WrapItem>
                          )}
                        </Wrap>

                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiX />}
                          onClick={handleClearAllFilters}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          Reset All Filters
                        </Button>
                      </Flex>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* ── Main Content Directory Card ── */}
              <Card
                rounded="2xl"
                shadow="xl"
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                bg={isDark ? "gray.800" : "white"}
                w="full"
                minH="500px"
              >
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack spacing={5} w="full" align="stretch">
                    {/* Directory Toolbar Header */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                      <HStack spacing={3}>
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
                          <Icon as={FiBriefcase} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={isDark ? "white" : "gray.800"}>
                            Master Vendor Partners Directory
                          </Heading>
                          <Text fontSize="sm" color="gray.500">
                            Showing {DataVendors.length} of {totalCount} registered vendors (
                            {viewMode === "grid" ? "9 per page" : `${pageSize} per page`})
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Right Toolbar Controls */}
                      <HStack spacing={2.5}>
                        {/* Dual-View Mode Switcher */}
                        <HStack
                          spacing={1}
                          bg={isDark ? "gray.700" : "gray.100"}
                          p={1}
                          rounded="xl"
                        >
                          <Button
                            size="sm"
                            variant={viewMode === "grid" ? "solid" : "ghost"}
                            colorScheme={viewMode === "grid" ? "blue" : "gray"}
                            onClick={() => handleSwitchViewMode("grid")}
                            title="Grid Mode"
                            rounded="lg"
                          >
                            <FiGrid />
                          </Button>
                          <Button
                            size="sm"
                            variant={viewMode === "list" ? "solid" : "ghost"}
                            colorScheme={viewMode === "list" ? "blue" : "gray"}
                            onClick={() => handleSwitchViewMode("list")}
                            title="List Table Mode"
                            rounded="lg"
                          >
                            <FiList />
                          </Button>
                        </HStack>

                        <Button
                          size="md"
                          variant="outline"
                          leftIcon={<FiRefreshCcw />}
                          onClick={() => setRefreshData((p) => p + 1)}
                          isLoading={IsLoadingProcess}
                          rounded="xl"
                          fontSize="sm"
                          fontWeight="semibold"
                        >
                          Refresh
                        </Button>

                        <Link href="/vendor-management/register" style={{ textDecoration: "none" }}>
                          <Button
                            size="md"
                            colorScheme="blue"
                            bg="secondary.500"
                            _hover={{ bg: "secondary.600" }}
                            leftIcon={<FiPlusSquare />}
                            rounded="xl"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            Add Vendor
                          </Button>
                        </Link>
                      </HStack>
                    </Flex>

                    <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

                    {/* Content View Canvas */}
                    {IsLoadingProcess ? (
                      <VStack spacing={4} py={20}>
                        <LoadingMiniSignature />
                        <Text color="gray.500" fontWeight="medium" fontSize="md">
                          Loading vendor master data...
                        </Text>
                      </VStack>
                    ) : DataVendors.length === 0 ? (
                      <VStack spacing={5} py={20}>
                        <Box
                          w={20}
                          h={20}
                          bg={isDark ? "gray.700" : "gray.100"}
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={FiFolder} boxSize={10} color="gray.400" />
                        </Box>
                        <VStack spacing={1}>
                          <Heading size="md" color="gray.500">
                            {hasActiveFilters ? "No Vendors Found" : "No Vendor Data Available"}
                          </Heading>
                          <Text color="gray.400" fontSize="md" textAlign="center" maxW="440px">
                            {hasActiveFilters
                              ? "No vendor partners match your active filters or search criteria."
                              : "No vendor partners are registered in the system yet."}
                          </Text>
                        </VStack>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            colorScheme="blue"
                            rounded="xl"
                            size="md"
                            onClick={handleClearAllFilters}
                            fontSize="sm"
                          >
                            Reset All Filters
                          </Button>
                        )}
                      </VStack>
                    ) : viewMode === "grid" ? (
                      /* Grid View (CardVendor) */
                      <Box w="full">
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} w="full">
                          {DataVendors.map((vendor) => (
                            <CardVendor key={vendor.id} data={vendor} />
                          ))}
                        </SimpleGrid>
                      </Box>
                    ) : (
                      /* List View (Table) */
                      <Box w="full">
                        <Box overflowX="auto" w="full">
                          <Box minW="1100px">
                            <TableComponentFull table={table} />
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Pagination Controls */}
                    {DataVendors.length > 0 && (
                      <Box pt={4} borderTop="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
                        <ControlTable table={table} />
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

export default VendorManagementPage;
