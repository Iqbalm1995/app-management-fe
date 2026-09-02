"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  Select as ChakraSelect,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiExternalLink,
  FiFilter,
  FiFolder,
  FiGrid,
  FiInfo,
  FiLayers,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";

import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ControlTable } from "@/app/components/tableComponents";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";
import ApplicationCard from "./ApplicationCard";

interface ManagedAppsTabProps {
  userOrgGroupId: string | null;
  userGroupName?: string | null;
  userDivisionName?: string | null;
  tokenData: string;
  onDataLoaded?: (totalCount: number) => void;
}

export default function ManagedAppsTab({
  userOrgGroupId,
  userGroupName,
  userDivisionName,
  tokenData,
  onDataLoaded,
}: ManagedAppsTabProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();

  const { List } = useApps();

  // Data & State
  const [dataAplikasi, setDataAplikasi] = useState<ApplicationMasterResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState<string>("ALL");

  // Pagination State
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
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

  // Group Stats Summary (Accurately computed from backend group roster)
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    critical: 0,
    projects: 0,
  });

  // Fetch Accurate Stats for the current group
  const fetchGroupStats = useCallback(async () => {
    if (!tokenData) return;
    try {
      const baseFilter: any[] = [];
      if (userOrgGroupId) {
        baseFilter.push({
          field: "appManageByGroupId",
          operator: "=",
          value: userOrgGroupId,
        });
      }

      // Query full group application roster to aggregate statistics and sum projects accurately
      const groupAppsRes = await List(
        {
          search: "",
          limit: 500,
          page: 0,
          fieldOrder: ["createdAt"],
          orderDir: "desc",
          filterWhere: [...baseFilter],
        } as any,
        tokenData
      );

      if (groupAppsRes?.statusCode === RES_CODE_OK && groupAppsRes.data) {
        const allGroupApps = groupAppsRes.data;
        const total = groupAppsRes.countTotal ?? allGroupApps.length;
        const active = allGroupApps.filter((a) => a.appsStatus === "ACTIVE").length;
        const critical = allGroupApps.filter(
          (a) =>
            a.appIsCritical?.toUpperCase() === "Y" ||
            a.appIsCritical?.toUpperCase() === "TRUE" ||
            a.appIsCritical === "1"
        ).length;
        const sumProjects = allGroupApps.reduce(
          (acc, curr) => acc + (curr.countProjectAll || 0),
          0
        );

        setStatsData({
          total,
          active,
          critical,
          projects: sumProjects,
        });

        if (onDataLoaded) {
          onDataLoaded(total);
        }
      }
    } catch (err) {
      console.error("Error fetching group stats:", err);
    }
  }, [tokenData, userOrgGroupId, onDataLoaded]);

  useEffect(() => {
    fetchGroupStats();
  }, [fetchGroupStats, refreshKey]);

  // Load Managed Applications Paginated List
  const fetchManagedApplications = useCallback(async () => {
    if (!tokenData) return;
    setIsLoading(true);

    try {
      const filterWhere: any[] = [];

      // Locked group filter
      if (userOrgGroupId) {
        filterWhere.push({
          field: "appManageByGroupId",
          operator: "=",
          value: userOrgGroupId,
        });
      }

      // Status filter
      if (statusFilter && statusFilter !== "ALL") {
        filterWhere.push({
          field: "appsStatus",
          operator: "=",
          value: statusFilter,
        });
      }

      // Criticality filter
      if (criticalityFilter === "CRITICAL") {
        filterWhere.push({
          field: "appIsCritical",
          operator: "in",
          value: "Y,true,1,TRUE",
        } as any);
      } else if (criticalityFilter === "NON-CRITICAL") {
        filterWhere.push({
          field: "appIsCritical",
          operator: "in",
          value: "N,false,0,FALSE",
        } as any);
      }

      const payload: PaggingListPayloadCustom = {
        search: search.trim(),
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere,
      };

      const res = await List(payload as any, tokenData);

      if (res?.statusCode === RES_CODE_OK && res.data) {
        setDataAplikasi(res.data);
        const count = res.countTotal || 0;
        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize));
      } else {
        setDataAplikasi([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Failed to load managed applications:", err);
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setDataAplikasi([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    tokenData,
    userOrgGroupId,
    search,
    statusFilter,
    criticalityFilter,
    pageIndex,
    pageSize,
  ]);

  useEffect(() => {
    fetchManagedApplications();
  }, [fetchManagedApplications, refreshKey]);

  // Table Columns Definition with # Row Number
  const columns = useMemo<ColumnDef<ApplicationMasterResponse>[]>(
    () => [
      {
        id: "rowNumber",
        header: "#",
        cell: ({ row }) => {
          const rowNum = pageIndex * pageSize + row.index + 1;
          return (
            <Text
              fontSize="xs"
              fontWeight="medium"
              color={isDark ? "gray.400" : "gray.500"}
              textAlign="center"
            >
              {rowNum}
            </Text>
          );
        },
      },
      {
        accessorKey: "appName",
        header: "Application",
        cell: ({ row }) => {
          const app = row.original;
          const isCrit =
            app.appIsCritical?.toUpperCase() === "Y" ||
            app.appIsCritical?.toUpperCase() === "TRUE" ||
            app.appIsCritical === "1";

          return (
            <HStack spacing={3} align="center" py={1}>
              <Avatar
                size="sm"
                name={app.appShortName || app.appName || "APP"}
                src={app.iconApps || undefined}
                bg={isCrit ? "red.600" : "secondary.600"}
                color="white"
                borderRadius="md"
              />
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    color={isDark ? "white" : "gray.900"}
                    noOfLines={1}
                  >
                    {app.appName}
                  </Text>
                  {app.appShortName && (
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                      ({app.appShortName})
                    </Text>
                  )}
                </HStack>
                <HStack spacing={1}>
                  <Badge fontSize="2xs" colorScheme="blue" variant="subtle">
                    {app.appShortName || "-"}
                  </Badge>
                  {app.appTypes && (
                    <Badge
                      fontSize="2xs"
                      colorScheme="purple"
                      variant="outline"
                    >
                      {app.appTypes}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
          );
        },
      },
      {
        accessorKey: "appTargetUsers",
        header: "Target Users",
        cell: ({ row }) => {
          const val = row.original.appTargetUsers || "INTERNAL";
          return (
            <Badge
              fontSize="2xs"
              px={2}
              py={0.5}
              borderRadius="md"
              colorScheme={
                val === "EXTERNAL" ? "orange" : val === "BOTH" ? "teal" : "cyan"
              }
              variant="subtle"
            >
              {val}
            </Badge>
          );
        },
      },
      {
        accessorKey: "appIsCritical",
        header: "Criticality Tier",
        cell: ({ row }) => {
          const app = row.original;
          const isCrit =
            app.appIsCritical?.toUpperCase() === "Y" ||
            app.appIsCritical?.toUpperCase() === "TRUE" ||
            app.appIsCritical === "1";

          return (
            <Badge
              fontSize="2xs"
              px={2}
              py={0.5}
              borderRadius="md"
              colorScheme={isCrit ? "red" : "gray"}
              variant={isCrit ? "solid" : "subtle"}
              display="inline-flex"
              alignItems="center"
              gap={1}
            >
              <Icon as={FiShield} />
              {isCrit
                ? `Critical ${app.appCriticalLevel ? `(${app.appCriticalLevel})` : ""}`
                : "Non-Critical"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "appsStatus",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.appsStatus || "ACTIVE"} fontSize="2xs" />
        ),
      },
      {
        accessorKey: "appBusinessOwnerDivisionName",
        header: "Business Owner",
        cell: ({ row }) => (
          <VStack align="start" spacing={0} maxW="180px">
            <Text
              fontSize="xs"
              fontWeight="medium"
              noOfLines={1}
              color={isDark ? "gray.200" : "gray.800"}
              title={row.original.appBusinessOwnerDivisionName || "—"}
            >
              {row.original.appBusinessOwnerDivisionName || "—"}
            </Text>
            {row.original.appBusinessOwnerGroupName && (
              <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                {row.original.appBusinessOwnerGroupName}
              </Text>
            )}
          </VStack>
        ),
      },
      {
        accessorKey: "countProjectAll",
        header: "Connected Projects",
        cell: ({ row }) => {
          const count = row.original.countProjectAll || 0;
          return (
            <HStack spacing={1.5}>
              <Icon as={FiFolder} color="secondary.500" />
              <Text fontSize="xs" fontWeight="bold" color={isDark ? "blue.300" : "secondary.600"}>
                {count} {count === 1 ? "Project" : "Projects"}
              </Text>
            </HStack>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const app = row.original;
          return (
            <HStack spacing={2} justify="flex-end">
              <Tooltip label="View Full Application Detail" hasArrow>
                <Button
                  as={Link}
                  href={`/master-data/Application/detail?id=${app.id}`}
                  size="xs"
                  colorScheme="secondary"
                  variant="outline"
                  rightIcon={<FiArrowRight />}
                >
                  Detail
                </Button>
              </Tooltip>
            </HStack>
          );
        },
      },
    ],
    [isDark, pageIndex, pageSize]
  );

  const table = useReactTable({
    data: dataAplikasi,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const cardBg = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Top Summary Metrics Panel */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={radiusStyle}
          p={4}
          boxShadow="sm"
        >
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Managed Applications
              </Text>
              <Heading size="lg" color={isDark ? "blue.300" : "secondary.600"}>
                {statsData.total}
              </Heading>
              <Text fontSize="2xs" color="gray.400">
                Assigned to your IT group
              </Text>
            </VStack>
            <Flex
              p={3}
              borderRadius="xl"
              bg={isDark ? "blue.900" : "blue.50"}
              color={isDark ? "blue.200" : "secondary.500"}
            >
              <Icon as={HiOutlineDesktopComputer} fontSize="24px" />
            </Flex>
          </Flex>
        </Card>

        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={radiusStyle}
          p={4}
          boxShadow="sm"
        >
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Active Systems
              </Text>
              <Heading size="lg" color={isDark ? "green.300" : "green.600"}>
                {statsData.active}
              </Heading>
              <Text fontSize="2xs" color="gray.400">
                In operational production
              </Text>
            </VStack>
            <Flex
              p={3}
              borderRadius="xl"
              bg={isDark ? "green.900" : "green.50"}
              color={isDark ? "green.200" : "green.500"}
            >
              <Icon as={FiCheckCircle} fontSize="24px" />
            </Flex>
          </Flex>
        </Card>

        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={radiusStyle}
          p={4}
          boxShadow="sm"
        >
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Critical Tier
              </Text>
              <Heading size="lg" color={isDark ? "red.300" : "red.600"}>
                {statsData.critical}
              </Heading>
              <Text fontSize="2xs" color="gray.400">
                Tier-1 / High Impact
              </Text>
            </VStack>
            <Flex
              p={3}
              borderRadius="xl"
              bg={isDark ? "red.900" : "red.50"}
              color={isDark ? "red.200" : "red.500"}
            >
              <Icon as={FiShield} fontSize="24px" />
            </Flex>
          </Flex>
        </Card>

        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={radiusStyle}
          p={4}
          boxShadow="sm"
        >
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                Connected Projects
              </Text>
              <Heading size="lg" color={isDark ? "purple.300" : "purple.600"}>
                {statsData.projects}
              </Heading>
              <Text fontSize="2xs" color="gray.400">
                Total linked project portfolio
              </Text>
            </VStack>
            <Flex
              p={3}
              borderRadius="xl"
              bg={isDark ? "purple.900" : "purple.50"}
              color={isDark ? "purple.200" : "purple.500"}
            >
              <Icon as={FiFolder} fontSize="24px" />
            </Flex>
          </Flex>
        </Card>
      </SimpleGrid>

      {/* Main Panel Container for Managed Applications */}
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius={radiusStyle}
        boxShadow="sm"
        overflow="hidden"
      >
        {/* Panel Header */}
        <CardHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          py={4}
          px={6}
          bg={isDark ? "gray.900" : "gray.50"}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={3}
            justify="space-between"
            align={{ base: "start", md: "center" }}
          >
            <VStack align="start" spacing={0.5}>
              <Heading size="sm" color={isDark ? "white" : "gray.900"}>
                Group Application Portfolio
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Showing systems managed by {userGroupName || "your IT group"} in {userDivisionName || "IT Division"}
              </Text>
            </VStack>

            <HStack spacing={2} wrap="wrap">
              {/* View Switcher */}
              <HStack
                spacing={0}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={radiusStyle}
                p={0.5}
                bg={cardBg}
              >
                <Tooltip label="Table View" hasArrow>
                  <IconButton
                    aria-label="Table View"
                    icon={<FiList />}
                    size="xs"
                    variant={viewMode === "table" ? "solid" : "ghost"}
                    colorScheme={viewMode === "table" ? "blue" : "gray"}
                    onClick={() => setViewMode("table")}
                  />
                </Tooltip>
                <Tooltip label="Grid Cards View" hasArrow>
                  <IconButton
                    aria-label="Grid Cards View"
                    icon={<FiGrid />}
                    size="xs"
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    colorScheme={viewMode === "grid" ? "blue" : "gray"}
                    onClick={() => setViewMode("grid")}
                  />
                </Tooltip>
              </HStack>

              {/* Refresh Button */}
              <Tooltip label="Refresh Roster" hasArrow>
                <IconButton
                  aria-label="Refresh Data"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="outline"
                  borderRadius={radiusStyle}
                  onClick={() => setRefreshKey((k) => k + 1)}
                  isLoading={isLoading}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>

        {/* Search & Filter Bar */}
        <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={3}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            {/* Search Box */}
            <InputGroup maxW={{ base: "full", md: "380px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by app name, code, short name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                borderRadius={radiusStyle}
                fontSize="sm"
              />
              {search && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearch("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            {/* Filter Dropdowns */}
            <HStack spacing={2} wrap="wrap">
              {/* Status Filter */}
              <ChakraSelect
                size="sm"
                w="140px"
                borderRadius={radiusStyle}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="RETIRED">Retired</option>
              </ChakraSelect>

              {/* Criticality Filter */}
              <ChakraSelect
                size="sm"
                w="150px"
                borderRadius={radiusStyle}
                value={criticalityFilter}
                onChange={(e) => {
                  setCriticalityFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                <option value="ALL">All Criticality</option>
                <option value="CRITICAL">Critical</option>
                <option value="NON-CRITICAL">Non-Critical</option>
              </ChakraSelect>
            </HStack>
          </Flex>
        </Box>

        {/* Panel Body / Data Display */}
        <CardBody p={0}>
          {isLoading ? (
            <Flex justify="center" align="center" minH="240px">
              <LoadingMiniSignature />
            </Flex>
          ) : dataAplikasi.length === 0 ? (
            <Box p={12} textAlign="center">
              <VStack spacing={3}>
                <Icon as={HiOutlineDesktopComputer} fontSize="40px" color="gray.400" />
                <Heading size="sm" color={isDark ? "gray.200" : "gray.700"}>
                  No Managed Applications Found
                </Heading>
                <Text fontSize="xs" color="gray.500" maxW="450px">
                  {search || statusFilter !== "ALL" || criticalityFilter !== "ALL"
                    ? "No applications matched your active filter criteria. Try adjusting your search query or reset filters."
                    : `There are currently no applications assigned to group "${userGroupName || userOrgGroupId || "your group"}".`}
                </Text>
                {(search || statusFilter !== "ALL" || criticalityFilter !== "ALL") && (
                  <Button
                    size="xs"
                    colorScheme="secondary"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setCriticalityFilter("ALL");
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </VStack>
            </Box>
          ) : viewMode === "grid" ? (
            <Box p={6}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
                {dataAplikasi.map((app) => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
              </SimpleGrid>
              <ControlTable table={table} />
            </Box>
          ) : (
            /* Table View */
            <Box>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg={isDark ? "gray.900" : "gray.50"}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Th
                            key={header.id}
                            color={isDark ? "gray.300" : "gray.600"}
                            fontSize="2xs"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            py={3}
                            textAlign={header.id === "rowNumber" ? "center" : "left"}
                            w={header.id === "rowNumber" ? "48px" : undefined}
                          >
                            {typeof header.column.columnDef.header === "function"
                              ? (header.column.columnDef.header as any)(header.getContext())
                              : header.column.columnDef.header}
                          </Th>
                        ))}
                      </Tr>
                    ))}
                  </Thead>
                  <Tbody>
                    {table.getRowModel().rows.map((row) => (
                      <Tr
                        key={row.id}
                        _hover={{ bg: isDark ? "whiteAlpha.50" : "gray.50" }}
                        transition="background 0.15s ease"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <Td
                            key={cell.id}
                            py={3}
                            textAlign={cell.column.id === "rowNumber" ? "center" : "left"}
                          >
                            {typeof cell.column.columnDef.cell === "function"
                              ? (cell.column.columnDef.cell as any)(cell.getContext())
                              : (cell.getValue() as any)}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Box p={3} borderTop="1px solid" borderColor={borderColor}>
                <ControlTable table={table} />
              </Box>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
