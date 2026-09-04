"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Collapse,
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
  Select as ChakraSelect,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiEye,
  FiFilter,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiX,
} from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from "@tanstack/react-table";

// Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { ControlTable } from "@/app/components/tableComponents";
import { formatIDR } from "@/app/components/CardContract";
import { RbbSidebar } from "./components/RbbSidebar";

// Services & Constants
import useMstRbb, { MstRbbResponse, MstRbbWorkProgramResponse } from "@/app/services/useMstRbb";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { ListSearchByParam } from "@/app/types/masterTypes";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master RBB & Work Programs Hub",
  breadCrumb: ["Home", "Master Data", "Master RBB"],
};

export default function MasterRbbDirectoryPage() {
  useDocumentTitle("Master RBB");
  const router = useRouter();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const { ListMstRbb } = useMstRbb();
  const { List: ListOrganization } = useOrganization();

  // State
  const [tokenData, setTokenData] = useState<string>("");
  const [dataMstRbb, setDataMstRbb] = useState<MstRbbResponse[]>([]);
  const [orgList, setOrgList] = useState<OrganizationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshData, setRefreshData] = useState<number>(0);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filter States
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedDirectorateId, setSelectedDirectorateId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedQuartal, setSelectedQuartal] = useState<string>("");

  // Pagination
  const [totalCount, setTotalCount] = useState<number>(0);
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

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
      loadOrganizationDropdowns(token);
    }
  }, []);

  // Fetch Organizations (Directorate / Division / Group)
  const loadOrganizationDropdowns = async (token: string) => {
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

  // Filtered Organizations for Cascading Dropdowns
  const directorateOptions = useMemo(() => {
    return orgList.filter((org) => org.orgType?.toUpperCase() === "DIRECTORATE");
  }, [orgList]);

  const divisionOptions = useMemo(() => {
    return orgList.filter((org) => {
      if (org.orgType?.toUpperCase() !== "DIVISION") return false;
      if (!selectedDirectorateId) return true;
      return org.parentId === selectedDirectorateId || org.orgParentCode === selectedDirectorateId;
    });
  }, [orgList, selectedDirectorateId]);

  const groupOptions = useMemo(() => {
    return orgList.filter((org) => {
      if (org.orgType?.toUpperCase() !== "GROUP") return false;
      if (!selectedDivisionId) return true;
      return org.parentId === selectedDivisionId || org.orgParentCode === selectedDivisionId;
    });
  }, [orgList, selectedDivisionId]);

  // Fetch Master RBB List from Backend
  const fetchRbbList = useCallback(async () => {
    if (!tokenData) return;
    setIsLoading(true);

    try {
      const filterWhere: ListSearchByParam[] = [];

      if (selectedDirectorateId) {
        const targetDir = directorateOptions.find((d) => d.id === selectedDirectorateId);
        if (targetDir) {
          filterWhere.push({ field: "orgDirectorateId", operator: "=", value: targetDir.id });
        }
      }

      if (selectedDivisionId) {
        const targetDiv = divisionOptions.find((d) => d.id === selectedDivisionId);
        if (targetDiv) {
          filterWhere.push({ field: "orgDivisionId", operator: "=", value: targetDiv.id });
        }
      }

      if (selectedGroupId) {
        const targetGrp = groupOptions.find((g) => g.id === selectedGroupId);
        if (targetGrp) {
          filterWhere.push({ field: "orgGroupId", operator: "=", value: targetGrp.id });
        }
      }

      const res = await ListMstRbb(
        {
          page: pageIndex,
          limit: pageSize,
          search: globalFilter,
          filterWhere,
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        },
        tokenData
      );

      if (res?.statusCode === RES_CODE_OK && res.data) {
        let resultData = res.data;

        // Local filtering for periodYear and periodQuartal if selected
        if (selectedYear || selectedQuartal) {
          resultData = resultData.filter((rbb) => {
            if (!rbb.workPrograms || rbb.workPrograms.length === 0) return false;
            return rbb.workPrograms.some((wp) => {
              const matchYear = !selectedYear || wp.periodYear === selectedYear;
              const matchQuartal = !selectedQuartal || wp.periodQuartal === selectedQuartal;
              return matchYear && matchQuartal;
            });
          });
        }

        setDataMstRbb(resultData);
        setTotalCount(res.countTotal || resultData.length);
      } else {
        setDataMstRbb([]);
        setTotalCount(0);
        showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
      }
    } catch (error) {
      console.error("Error fetching Master RBB:", error);
      showToast({
        description: "Failed to fetch Master RBB data",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    tokenData,
    pageIndex,
    pageSize,
    globalFilter,
    selectedDirectorateId,
    selectedDivisionId,
    selectedGroupId,
    selectedYear,
    selectedQuartal,
    directorateOptions,
    divisionOptions,
    groupOptions,
  ]);

  useEffect(() => {
    if (tokenData) {
      fetchRbbList();
    }
  }, [fetchRbbList, tokenData, refreshData]);

  // Derived Header Metrics
  const totalWorkProgramsCount = useMemo(() => {
    return dataMstRbb.reduce((acc, curr) => acc + (curr.workPrograms?.length || 0), 0);
  }, [dataMstRbb]);

  const totalBudgetValueSum = useMemo(() => {
    return dataMstRbb.reduce((acc, curr) => {
      const sum = (curr.workPrograms || []).reduce((wAcc, wCurr) => wAcc + (wCurr.budgetValue || 0), 0);
      return acc + sum;
    }, 0);
  }, [dataMstRbb]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setSelectedDirectorateId("");
    setSelectedDivisionId("");
    setSelectedGroupId("");
    setSelectedYear("");
    setSelectedQuartal("");
    setPagination({ pageIndex: 0, pageSize: 10 });
    setRefreshData((prev) => prev + 1);
  };

  const hasActiveFilters = Boolean(
    globalFilter ||
      selectedDirectorateId ||
      selectedDivisionId ||
      selectedGroupId ||
      selectedYear ||
      selectedQuartal
  );

  // Column Definitions
  const columnsData = useMemo<ColumnDef<MstRbbResponse>[]>(
    () => [
      { accessorKey: "targetCode", header: "Target Code" },
      { accessorKey: "targetName", header: "Target Name" },
      { accessorKey: "policyCode", header: "Policy Code" },
      { accessorKey: "policyName", header: "Policy Name" },
      { accessorKey: "orgDivisionName", header: "Division" },
    ],
    []
  );

  const table = useReactTable({
    data: dataMstRbb,
    columns: columnsData,
    pageCount: totalPages,
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

      {/* ── Modern Hero Header Banner ── */}
      <Box
        position="relative"
        bgColor={isDark ? "gray.800" : "white"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 4, sm: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "auto", md: "170px" }}
        py={{ base: 6, md: 0 }}
      >
        {/* Abstract Geometric Shapes */}
        <Box
          position="absolute"
          top="-20px"
          right="30px"
          w="80px"
          h="80px"
          bg={isDark ? "whiteAlpha.200" : "secondary.100"}
          rounded="full"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-15px"
          left="40px"
          w="60px"
          h="60px"
          bg={isDark ? "whiteAlpha.300" : "secondary.200"}
          transform="rotate(45deg)"
          pointerEvents="none"
        />

        <VStack
          h="full"
          justify="center"
          align="stretch"
          px={{ base: 5, md: 8 }}
          position="relative"
          zIndex={1}
          spacing={3}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            {/* Title & Icon */}
            <HStack spacing={4}>
              <Box
                w="56px"
                h="56px"
                bgGradient="linear(to-br, secondary.600, secondary.400)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="md"
              >
                <Icon as={FiTarget} boxSize={7} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading
                  size="lg"
                  color={isDark ? "white" : "gray.900"}
                  fontWeight="800"
                  letterSpacing="tight"
                >
                  Master RBB & Work Programs Hub
                </Heading>
                <Text
                  fontSize="md"
                  color={isDark ? "whiteAlpha.800" : "gray.600"}
                  fontWeight="500"
                >
                  Corporate RBB Target Directory, Strategic Policies, and ITSP Work Program Budget Allocations
                </Text>
              </VStack>
            </HStack>

            {/* Quick Metric Strip */}
            <HStack spacing={4} display={{ base: "none", xl: "flex" }}>
              <Box
                px={4}
                py={2.5}
                rounded="xl"
                bg={isDark ? "gray.750" : "gray.50"}
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                textAlign="center"
              >
                <Text fontSize="xl" fontWeight="extrabold" color="blue.500">
                  {totalCount}
                </Text>
                <Text fontSize="3xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  RBB Targets
                </Text>
              </Box>

              <Box
                px={4}
                py={2.5}
                rounded="xl"
                bg={isDark ? "gray.750" : "gray.50"}
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                textAlign="center"
              >
                <Text fontSize="xl" fontWeight="extrabold" color="teal.500">
                  {totalWorkProgramsCount}
                </Text>
                <Text fontSize="3xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Work Programs
                </Text>
              </Box>

              <Box
                px={4}
                py={2.5}
                rounded="xl"
                bg={isDark ? "purple.950" : "purple.50"}
                border="1px"
                borderColor={isDark ? "purple.800" : "purple.200"}
                textAlign="center"
              >
                <Text fontSize="md" fontWeight="extrabold" color={isDark ? "purple.200" : "purple.600"}>
                  {formatIDR(totalBudgetValueSum)}
                </Text>
                <Text fontSize="3xs" fontWeight="bold" color="purple.500" textTransform="uppercase">
                  Total Budget
                </Text>
              </Box>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* ── Main Layout Container (80% / 20% Proportions) ── */}
      <Box px={{ base: 4, sm: 5, md: 6 }} pb={12} w="full">
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "calc(80% - 12px) calc(20% - 12px)",
          }}
          gap={6}
          w="full"
        >
          {/* ── Left Main Directory Section (80%) ── */}
          <GridItem w="full">
            <VStack spacing={5} align="stretch" w="full">
              {/* ── SECTION CARD 1: Master RBB Search & Multi-Filter ── */}
              <Card
                rounded={radiusStyle}
                shadow="lg"
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                bg={isDark ? "gray.800" : "white"}
                w="full"
              >
                <CardHeader py={4} px={{ base: 4, md: 5 }} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack spacing={2.5} color="secondary.500">
                      <Icon as={FiFilter} boxSize={5} />
                      <Heading size="xs" textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                        Master RBB Search & Multi-Filter
                      </Heading>
                    </HStack>
                    {hasActiveFilters && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<Icon as={FiX} />}
                        onClick={handleResetFilters}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </Flex>
                </CardHeader>

                <CardBody p={{ base: 4, md: 5 }}>
                  <VStack spacing={4} align="stretch">
                    {/* Search Input */}
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by Target Code, Target Name, Policy, or Division..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && setRefreshData((prev) => prev + 1)}
                        rounded="xl"
                        bg={isDark ? "gray.750" : "gray.50"}
                        border="1px"
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        fontSize="md"
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

                    {/* Cascading Filter Dropdowns */}
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                      {/* Directorate Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Directorate
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={selectedDirectorateId}
                          onChange={(e) => {
                            setSelectedDirectorateId(e.target.value);
                            setSelectedDivisionId("");
                            setSelectedGroupId("");
                          }}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value="">All Directorates</option>
                          {directorateOptions.map((dir) => (
                            <option key={dir.id} value={dir.id}>
                              {dir.orgName} ({dir.orgCode})
                            </option>
                          ))}
                        </ChakraSelect>
                      </FormControl>

                      {/* Division Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Division
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={selectedDivisionId}
                          onChange={(e) => {
                            setSelectedDivisionId(e.target.value);
                            setSelectedGroupId("");
                          }}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value="">All Divisions</option>
                          {divisionOptions.map((div) => (
                            <option key={div.id} value={div.id}>
                              {div.orgName} ({div.orgCode})
                            </option>
                          ))}
                        </ChakraSelect>
                      </FormControl>

                      {/* Group Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Organization Group
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={selectedGroupId}
                          onChange={(e) => setSelectedGroupId(e.target.value)}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value="">All Groups</option>
                          {groupOptions.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                              {grp.orgName} ({grp.orgCode})
                            </option>
                          ))}
                        </ChakraSelect>
                      </FormControl>

                      {/* Year Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Period Year
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value="">All Years</option>
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                        </ChakraSelect>
                      </FormControl>

                      {/* Quartal Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Period Quarter
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={selectedQuartal}
                          onChange={(e) => setSelectedQuartal(e.target.value)}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value="">All Quarters</option>
                          <option value="Q1">Q1 (Quarter 1)</option>
                          <option value="Q2">Q2 (Quarter 2)</option>
                          <option value="Q3">Q3 (Quarter 3)</option>
                          <option value="Q4">Q4 (Quarter 4)</option>
                        </ChakraSelect>
                      </FormControl>

                      {/* Per Page Selector */}
                      <FormControl size="sm">
                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                          Items Per Page
                        </FormLabel>
                        <ChakraSelect
                          size="md"
                          rounded="xl"
                          value={pageSize}
                          onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
                          bg={isDark ? "gray.750" : "gray.50"}
                          borderColor={isDark ? "gray.600" : "gray.300"}
                          fontSize="sm"
                          _focus={{ borderColor: "secondary.500" }}
                        >
                          <option value={10}>10 Rows</option>
                          <option value={20}>20 Rows</option>
                          <option value={50}>50 Rows</option>
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
                        {selectedDirectorateId && (
                          <Badge colorScheme="purple" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                            Dir: {directorateOptions.find((d) => d.id === selectedDirectorateId)?.orgName}
                            <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedDirectorateId("")} />
                          </Badge>
                        )}
                        {selectedDivisionId && (
                          <Badge colorScheme="teal" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                            Div: {divisionOptions.find((d) => d.id === selectedDivisionId)?.orgName}
                            <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedDivisionId("")} />
                          </Badge>
                        )}
                        {selectedYear && (
                          <Badge colorScheme="orange" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                            Year: {selectedYear}
                            <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedYear("")} />
                          </Badge>
                        )}
                        {selectedQuartal && (
                          <Badge colorScheme="green" variant="subtle" px={2.5} py={1} rounded="full" fontSize="xs">
                            Quarter: {selectedQuartal}
                            <Icon as={FiX} ml={1.5} cursor="pointer" onClick={() => setSelectedQuartal("")} />
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* ── SECTION CARD 2: Master RBB & Work Programs Directory (Audit Trail Pattern Table) ── */}
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
                            Master RBB Target & Work Programs Directory
                          </Heading>
                          <Badge
                            colorScheme="purple"
                            rounded="full"
                            px={2.5}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {totalCount} Targets
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          Showing {dataMstRbb.length} of {totalCount} registered Master RBB targets in the system
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={2.5}>
                      <Button
                        size="sm"
                        variant="outline"
                        rounded="xl"
                        leftIcon={<Icon as={FiRefreshCw} />}
                        onClick={() => setRefreshData((prev) => prev + 1)}
                        isLoading={isLoading}
                        borderColor={isDark ? "gray.600" : "gray.300"}
                        _hover={{ bg: isDark ? "gray.700" : "gray.100" }}
                      >
                        Refresh
                      </Button>

                      <Link href="/master-data/rbb/register" style={{ textDecoration: "none" }}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          bg="secondary.500"
                          _hover={{ bg: "secondary.600" }}
                          rounded="xl"
                          leftIcon={<Icon as={FiPlus} />}
                          fontWeight="bold"
                          shadow="sm"
                        >
                          Register Target
                        </Button>
                      </Link>
                    </HStack>
                  </Flex>
                </CardHeader>

                {/* Section Panel Table Body */}
                <CardBody p={5}>
                  {/* Results Info Strip */}
                  <HStack mb={4}>
                    <Text fontSize="sm" color="gray.600">
                      Showing {dataMstRbb.length} of {totalCount} Master RBB records
                    </Text>
                    <Spacer />
                    <Text fontSize="sm" color="gray.600">
                      Page {pageIndex + 1} of {totalPages}
                    </Text>
                  </HStack>

                  {isLoading ? (
                    <Flex justify="center" align="center" minH="350px" w="full">
                      <LoadingMiniSignature />
                    </Flex>
                  ) : dataMstRbb.length > 0 ? (
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
                                  Directorate & Division
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Target Code & Name
                                </Heading>
                              </Th>
                              <Th py={3.5} color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Policy Code & Name
                                </Heading>
                              </Th>
                              <Th py={3.5} textAlign="center" color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Work Programs
                                </Heading>
                              </Th>
                              <Th py={3.5} textAlign="right" color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Total Budget (IDR)
                                </Heading>
                              </Th>
                              <Th py={3.5} textAlign="center" color={isDark ? "secondary.400" : "secondary.800"}>
                                <Heading as="h5" size="xs">
                                  Actions
                                </Heading>
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {dataMstRbb.map((rbb, index) => {
                              const isExpanded = !!expandedRows[rbb.id];
                              const rbbBudgetSum = (rbb.workPrograms || []).reduce(
                                (acc, curr) => acc + (curr.budgetValue || 0),
                                0
                              );

                              return (
                                <React.Fragment key={rbb.id}>
                                  {/* Main RBB Target Row */}
                                  <Tr
                                    _hover={{ bg: isDark ? "gray.750" : "gray.50" }}
                                    cursor="pointer"
                                    onClick={() => toggleRowExpansion(rbb.id)}
                                  >
                                    <Td py={3.5} textAlign="center">
                                      <IconButton
                                        aria-label="Expand row"
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="purple"
                                        icon={<Icon as={isExpanded ? FiChevronUp : FiChevronDown} boxSize={4} />}
                                      />
                                    </Td>
                                    <Td py={3.5} fontWeight="bold">
                                      {pageIndex * pageSize + index + 1}.
                                    </Td>
                                    <Td py={3.5}>
                                      <VStack align="start" spacing={0.5}>
                                        <Badge colorScheme="purple" fontSize="2xs" rounded="md" px={2}>
                                          {rbb.orgDirectorateName || rbb.orgDirectorateCode || "IT Directorate"}
                                        </Badge>
                                        <Text fontSize="xs" fontWeight="700" color="secondary.700">
                                          {rbb.orgDivisionName || rbb.orgDivisionCode}
                                        </Text>
                                        {rbb.orgGroupName && (
                                          <Text fontSize="2xs" color="gray.500">
                                            Group: {rbb.orgGroupName}
                                          </Text>
                                        )}
                                      </VStack>
                                    </Td>
                                    <Td py={3.5}>
                                      <VStack align="start" spacing={0.5} maxW="280px">
                                        <Badge colorScheme="blue" fontSize="2xs" rounded="md" px={2}>
                                          {rbb.targetCode}
                                        </Badge>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color={isDark ? "white" : "gray.800"}
                                          noOfLines={2}
                                        >
                                          {rbb.targetName}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td py={3.5}>
                                      <VStack align="start" spacing={0.5} maxW="240px">
                                        <Badge colorScheme="teal" fontSize="2xs" rounded="md" px={2}>
                                          {rbb.policyCode || "POL-RBB"}
                                        </Badge>
                                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                          {rbb.policyName || "Related Policy"}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td py={3.5} textAlign="center">
                                      <Badge colorScheme="teal" rounded="full" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                                        {rbb.workPrograms?.length || 0} Programs
                                      </Badge>
                                    </Td>
                                    <Td py={3.5} textAlign="right" fontWeight="extrabold" color="purple.500" fontSize="sm">
                                      {formatIDR(rbbBudgetSum)}
                                    </Td>
                                    <Td py={3.5} textAlign="center" onClick={(e) => e.stopPropagation()}>
                                      <HStack spacing={1} justify="center">
                                        <Link href={`/master-data/rbb/detail?id=${rbb.id}`} title="View Target Detail">
                                          <IconButton
                                            aria-label="Target detail"
                                            icon={<FiEye />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="blue"
                                          />
                                        </Link>
                                        <Link href={`/master-data/rbb/edit?id=${rbb.id}`} title="Edit RBB Target">
                                          <IconButton
                                            aria-label="Edit target"
                                            icon={<FiEdit />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="teal"
                                          />
                                        </Link>
                                      </HStack>
                                    </Td>
                                  </Tr>

                                  {/* Collapsible Nested Work Programs Drawer */}
                                  <Tr>
                                    <Td colSpan={8} p={0} borderBottom={isExpanded ? "1px" : "none"} borderColor={isDark ? "gray.700" : "gray.200"}>
                                      <Collapse in={isExpanded} animateOpacity>
                                        <Box p={4} bg={isDark ? "gray.900" : "secondary.50/40"}>
                                          <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between" align="center" onClick={(e) => e.stopPropagation()}>
                                              <HStack spacing={2}>
                                                <Icon as={FiBriefcase} color="secondary.500" />
                                                <Heading size="xs" color={isDark ? "white" : "secondary.800"}>
                                                  Attached Work Programs ({rbb.workPrograms?.length || 0})
                                                </Heading>
                                              </HStack>
                                              <HStack spacing={2}>
                                                <Link href={`/master-data/rbb/detail?id=${rbb.id}`}>
                                                  <Button size="xs" colorScheme="purple" variant="outline" rounded="md" leftIcon={<FiEye />}>
                                                    View Full Details
                                                  </Button>
                                                </Link>
                                                <Link href={`/master-data/rbb/edit?id=${rbb.id}`}>
                                                  <Button size="xs" colorScheme="teal" leftIcon={<FiEdit />} rounded="md">
                                                    Edit Target
                                                  </Button>
                                                </Link>
                                              </HStack>
                                            </HStack>

                                            {rbb.workPrograms && rbb.workPrograms.length > 0 ? (
                                              <Table size="xs" variant="simple" rounded="md" overflow="hidden">
                                                <Thead bg={isDark ? "gray.800" : "white"}>
                                                  <Tr>
                                                    <Th py={2}>No.</Th>
                                                    <Th py={2}>ITSP Code & Initials</Th>
                                                    <Th py={2}>Work Program Code & Description</Th>
                                                    <Th py={2}>GL Account No. & Name</Th>
                                                    <Th py={2}>Budget Type</Th>
                                                    <Th py={2}>Period</Th>
                                                    <Th py={2} textAlign="right">Budget Value (IDR)</Th>
                                                  </Tr>
                                                </Thead>
                                                <Tbody>
                                                  {rbb.workPrograms.map((wp, wpIdx) => (
                                                    <Tr
                                                      key={wp.id || wpIdx}
                                                      _hover={{ bg: isDark ? "gray.800" : "white" }}
                                                    >
                                                      <Td py={2}>{wpIdx + 1}.</Td>
                                                      <Td py={2}>
                                                        <VStack align="start" spacing={0}>
                                                          <Badge colorScheme="blue" fontSize="3xs" rounded="md">
                                                            {wp.itspCode} ({wp.itspInit})
                                                          </Badge>
                                                          <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                                                            {wp.itspName}
                                                          </Text>
                                                        </VStack>
                                                      </Td>
                                                      <Td py={2}>
                                                        <VStack align="start" spacing={0} maxW="250px">
                                                          <Text fontSize="xs" fontWeight="700" color="secondary.700">
                                                            {wp.workProgramCode}
                                                          </Text>
                                                          <Text fontSize="2xs" color="gray.600" noOfLines={2}>
                                                            {wp.workProgramDesc}
                                                          </Text>
                                                        </VStack>
                                                      </Td>
                                                      <Td py={2}>
                                                        <VStack align="start" spacing={0}>
                                                          <Text fontSize="2xs" fontWeight="bold">
                                                            {wp.lgAccountNumber}
                                                          </Text>
                                                          <Text fontSize="3xs" color="gray.500">
                                                            {wp.lgAccountName}
                                                          </Text>
                                                        </VStack>
                                                      </Td>
                                                      <Td py={2}>
                                                        <Badge
                                                          colorScheme={wp.budgetType?.toUpperCase() === "CAPEX" ? "blue" : "purple"}
                                                          fontSize="3xs"
                                                          rounded="md"
                                                          px={2}
                                                        >
                                                          {wp.budgetType}
                                                        </Badge>
                                                      </Td>
                                                      <Td py={2}>
                                                        <Badge colorScheme="gray" fontSize="3xs" rounded="md" px={2}>
                                                          {wp.periodYear} {wp.periodQuartal} ({wp.periodTime})
                                                        </Badge>
                                                      </Td>
                                                      <Td py={2} textAlign="right" fontWeight="bold" color="purple.600">
                                                        {formatIDR(wp.budgetValue)}
                                                      </Td>
                                                    </Tr>
                                                  ))}
                                                </Tbody>
                                              </Table>
                                            ) : (
                                              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                                No work programs attached to this target yet.
                                              </Text>
                                            )}
                                          </VStack>
                                        </Box>
                                      </Collapse>
                                    </Td>
                                  </Tr>
                                </React.Fragment>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  ) : (
                    <Flex justify="center" align="center" direction="column" gap={3} py={14} px={4}>
                      <Icon as={FiTarget} boxSize={12} color="gray.400" />
                      <Heading size="sm" color={isDark ? "white" : "gray.800"}>
                        No Master RBB Targets Found
                      </Heading>
                      <Text color="gray.500" fontSize="sm" textAlign="center" maxW="400px">
                        Please adjust your search keywords or change the selected organization and period filters.
                      </Text>
                      {hasActiveFilters && (
                        <Button size="sm" colorScheme="purple" variant="outline" mt={2} onClick={handleResetFilters}>
                          Reset Filters
                        </Button>
                      )}
                    </Flex>
                  )}
                </CardBody>

                {/* Section Panel Footer (Pagination) */}
                {totalCount > 0 && (
                  <CardFooter
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderTop="1px"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    py={3}
                    px={{ base: 4, md: 6 }}
                    w="full"
                  >
                    <Box w="full">
                      <ControlTable table={table} />
                    </Box>
                  </CardFooter>
                )}
              </Card>
            </VStack>
          </GridItem>

          {/* ── Right Sidebar Section (20%) ── */}
          <GridItem w="full">
            <Box position="sticky" top="20px">
              <RbbSidebar
                dataMstRbb={dataMstRbb}
                totalCount={totalCount}
                totalWorkProgramsCount={totalWorkProgramsCount}
                totalBudgetValueSum={totalBudgetValueSum}
                selectedDirectorateId={selectedDirectorateId}
                onSelectDirectorate={setSelectedDirectorateId}
              />
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}
