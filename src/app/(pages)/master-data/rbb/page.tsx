"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
  Input,
  Select as ChakraSelect,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiLayers,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiSliders,
  FiTarget,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiFilter,
  FiX,
  FiCheckCircle,
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
import ModalRegisterMstRbb from "./components/ModalRegisterMstRbb";

// Services
import useMstRbb, { MstRbbResponse, MstRbbWorkProgramResponse } from "@/app/services/useMstRbb";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { ListSearchByParam } from "@/app/types/masterTypes";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master RBB Directory & Work Programs",
  breadCrumb: ["Home", "Master Data", "Master RBB"],
};

export default function MasterRbbDirectoryPage() {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const modalRegister = useDisclosure();
  const { ListMstRbb } = useMstRbb();
  const { List: ListOrganization } = useOrganization();

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
    setIsLoading(false);
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
    refreshData,
  ]);

  useEffect(() => {
    fetchRbbList();
  }, [fetchRbbList]);

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
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const columns = useMemo<ColumnDef<MstRbbResponse>[]>(
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
    columns,
    pageCount: totalPages,
    state: { globalFilter, pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const nextState = updater({ pageIndex, pageSize });
        setPagination(nextState);
      } else {
        setPagination(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Hero Header Banner Card */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 2, md: 4 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
      >
        <VStack align="stretch" px={{ base: 6, md: 8 }} py={6} spacing={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                bg="secondary.500"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="md"
              >
                <FiTarget size={28} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={colorMode === "light" ? "gray.900" : "white"} fontWeight="700">
                  Master RBB & Work Programs Hub
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Directory of Corporate RBB Targets, Strategic Policies & ITSP Work Program Budget Allocations
                </Text>
              </VStack>
            </HStack>

            {/* Metric Summary Counters */}
            <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {totalCount}
                </Text>
                <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  RBB Targets
                </Text>
              </VStack>
              <Box w="1px" h="40px" bg={colorMode === "light" ? "gray.200" : "gray.700"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                  {totalWorkProgramsCount}
                </Text>
                <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Work Programs
                </Text>
              </VStack>
              <Box w="1px" h="40px" bg={colorMode === "light" ? "gray.200" : "gray.700"} />
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="purple.500">
                  {formatIDR(totalBudgetValueSum)}
                </Text>
                <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                  Total Budget Value
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Main Content Layout */}
      <Box px={{ base: 2, md: 4 }} w="full">
        <VStack spacing={5} w="full">
          {/* Cascading Filter Bar Card */}
          <Card rounded="2xl" shadow="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"} w="full">
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                  <HStack spacing={2} color="secondary.600">
                    <FiFilter size={18} />
                    <Heading size="xs" textTransform="uppercase" letterSpacing="wider">
                      Master Organization & Period Filters
                    </Heading>
                  </HStack>
                  {(globalFilter || selectedDirectorateId || selectedDivisionId || selectedGroupId || selectedYear || selectedQuartal) && (
                    <Button size="xs" variant="ghost" colorScheme="red" leftIcon={<FiX />} onClick={handleResetFilters}>
                      Reset All Filters
                    </Button>
                  )}
                </Flex>

                {/* Filter Controls Grid */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3}>
                  {/* Directorate Selector */}
                  <GridItem colSpan={{ base: 1, md: 1, lg: 2 }}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Directorate</FormLabel>
                      <ChakraSelect
                        size="sm"
                        rounded="md"
                        value={selectedDirectorateId}
                        onChange={(e) => {
                          setSelectedDirectorateId(e.target.value);
                          setSelectedDivisionId("");
                          setSelectedGroupId("");
                        }}
                      >
                        <option value="">All Directorates</option>
                        {directorateOptions.map((dir) => (
                          <option key={dir.id} value={dir.id}>
                            {dir.orgName} ({dir.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Division Selector */}
                  <GridItem colSpan={{ base: 1, md: 1, lg: 2 }}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Division</FormLabel>
                      <ChakraSelect
                        size="sm"
                        rounded="md"
                        value={selectedDivisionId}
                        onChange={(e) => {
                          setSelectedDivisionId(e.target.value);
                          setSelectedGroupId("");
                        }}
                      >
                        <option value="">All Divisions</option>
                        {divisionOptions.map((div) => (
                          <option key={div.id} value={div.id}>
                            {div.orgName} ({div.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Group Selector */}
                  <GridItem colSpan={{ base: 1, md: 1, lg: 2 }}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Group</FormLabel>
                      <ChakraSelect
                        size="sm"
                        rounded="md"
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                      >
                        <option value="">All Groups</option>
                        {groupOptions.map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {grp.orgName} ({grp.orgCode})
                          </option>
                        ))}
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Search Box */}
                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Search Target / Policy</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        placeholder="Search Target Code, Name, Policy..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>

                  {/* Period Year Selector */}
                  <GridItem colSpan={1}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Period Year</FormLabel>
                      <ChakraSelect size="sm" rounded="md" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">All Years</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>

                  {/* Period Quartal Selector */}
                  <GridItem colSpan={1}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" fontWeight="bold" color="gray.500">Period Quartal</FormLabel>
                      <ChakraSelect size="sm" rounded="md" value={selectedQuartal} onChange={(e) => setSelectedQuartal(e.target.value)}>
                        <option value="">All Quartals</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </ChakraSelect>
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Directory Content Table Card */}
          <Card rounded="2xl" shadow="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"} w="full" minH="500px">
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack spacing={4} w="full" align="stretch">
                {/* Header Toolbar */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack spacing={3}>
                    <Box w={8} h={8} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                      <FiLayers size={16} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                        Master RBB Target Directory
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Showing {dataMstRbb.length} of {totalCount} records (10 per page)
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FiRefreshCcw />}
                      onClick={() => setRefreshData((prev) => prev + 1)}
                      isLoading={isLoading}
                    >
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FiPlus />}
                      onClick={() => router.push("/master-data/rbb/register")}
                    >
                      Register Target
                    </Button>
                  </HStack>
                </Flex>

                <Divider />

                {/* Table Data Render */}
                {isLoading ? (
                  <Flex justify="center" align="center" minH="300px" w="full">
                    <LoadingMiniSignature />
                  </Flex>
                ) : dataMstRbb.length > 0 ? (
                  <Box overflowX="auto" w="full">
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                          <Th py={3} w="40px"></Th>
                          <Th py={3}>No.</Th>
                          <Th py={3}>Directorate & Division</Th>
                          <Th py={3}>Target Code & Title</Th>
                          <Th py={3}>Policy Code & Name</Th>
                          <Th py={3} textAlign="center">Work Programs</Th>
                          <Th py={3} textAlign="right">Total Budget (IDR)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {dataMstRbb.map((rbb, index) => {
                          const isExpanded = !!expandedRows[rbb.id];
                          const rbbBudgetSum = (rbb.workPrograms || []).reduce((acc, curr) => acc + (curr.budgetValue || 0), 0);

                          return (
                            <React.Fragment key={rbb.id}>
                              {/* Main RBB Target Row */}
                              <Tr
                                _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
                                cursor="pointer"
                                onClick={() => toggleRowExpansion(rbb.id)}
                              >
                                <Td py={3} textAlign="center">
                                  <Button size="2xs" variant="ghost" colorScheme="blue">
                                    <Icon as={isExpanded ? FiChevronUp : FiChevronDown} boxSize={4} />
                                  </Button>
                                </Td>
                                <Td py={3} fontWeight="bold">
                                  {pageIndex * pageSize + index + 1}.
                                </Td>
                                <Td py={3}>
                                  <VStack align="start" spacing={0.5}>
                                    <Badge colorScheme="purple" fontSize="2xs" rounded="md" px={2}>
                                      {rbb.orgDirectorateName || rbb.orgDirectorateCode}
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
                                <Td py={3}>
                                  <VStack
                                    align="start"
                                    spacing={0.5}
                                    maxW="280px"
                                    cursor="pointer"
                                    onClick={() => router.push(`/master-data/rbb/detail?id=${rbb.id}`)}
                                    _hover={{ opacity: 0.8 }}
                                  >
                                    <Badge colorScheme="blue" fontSize="2xs" rounded="md" px={2}>
                                      {rbb.targetCode}
                                    </Badge>
                                    <Text fontSize="xs" fontWeight="700" color="blue.600" textDecoration="underline" noOfLines={2}>
                                      {rbb.targetName}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td py={3}>
                                  <VStack align="start" spacing={0.5} maxW="280px">
                                    <Badge colorScheme="teal" fontSize="2xs" rounded="md" px={2}>
                                      {rbb.policyCode}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                      {rbb.policyName}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td py={3} textAlign="center">
                                  <Badge colorScheme="teal" rounded="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="bold">
                                    {rbb.workPrograms?.length || 0} Programs
                                  </Badge>
                                </Td>
                                <Td py={3} textAlign="right" fontWeight="bold" color="purple.600">
                                  {formatIDR(rbbBudgetSum)}
                                </Td>
                              </Tr>

                              {/* Collapsible Nested Work Programs Drawer */}
                              <Tr>
                                <Td colSpan={7} p={0} borderBottom={isExpanded ? "1px" : "none"} borderColor="gray.200">
                                  <Collapse in={isExpanded} animateOpacity>
                                    <Box p={4} bg={colorMode === "light" ? "blue.50/30" : "gray.900"}>
                                      <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between" align="center">
                                          <HStack spacing={2}>
                                            <Icon as={FiBriefcase} color="blue.500" />
                                            <Heading size="xs" color="blue.700">
                                              Nested ITSP Work Programs ({rbb.workPrograms?.length || 0})
                                            </Heading>
                                          </HStack>
                                          <HStack spacing={3}>
                                            <Button
                                              size="xs"
                                              colorScheme="blue"
                                              variant="outline"
                                              onClick={() => router.push(`/master-data/rbb/detail?id=${rbb.id}`)}
                                            >
                                              View Full Details
                                            </Button>
                                            <Button
                                              size="xs"
                                              colorScheme="teal"
                                              leftIcon={<FiEdit />}
                                              onClick={() => router.push(`/master-data/rbb/edit?id=${rbb.id}`)}
                                            >
                                              Edit Target
                                            </Button>
                                            <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                              Total Target Budget: {formatIDR(rbbBudgetSum)}
                                            </Text>
                                          </HStack>
                                        </HStack>

                                        {rbb.workPrograms && rbb.workPrograms.length > 0 ? (
                                          <Table size="xs" variant="simple" rounded="lg" overflow="hidden">
                                            <Thead bg={colorMode === "light" ? "white" : "gray.800"}>
                                              <Tr>
                                                <Th py={2}>No.</Th>
                                                <Th py={2}>ITSP Code & Initials</Th>
                                                <Th py={2}>Work Program Code & Description</Th>
                                                <Th py={2}>GL Account Number & Name</Th>
                                                <Th py={2}>Budget Type</Th>
                                                <Th py={2}>Period</Th>
                                                <Th py={2} textAlign="right">Budget Value (IDR)</Th>
                                              </Tr>
                                            </Thead>
                                            <Tbody>
                                              {rbb.workPrograms.map((wp, wpIdx) => (
                                                <Tr key={wp.id || wpIdx} _hover={{ bg: colorMode === "light" ? "blue.50/50" : "gray.800" }}>
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
                                            No Work Programs attached to this target.
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
                ) : (
                  <Flex justify="center" align="center" py={14} direction="column" gap={3} w="full">
                    <Icon as={FiTarget} boxSize={10} color="gray.400" />
                    <Text color="gray.500" fontSize="md" fontWeight="500">
                      No Master RBB records match your search parameters
                    </Text>
                  </Flex>
                )}

                {/* Pagination Controls */}
                {totalCount > 0 && (
                  <Box w="full" pt={2}>
                    <ControlTable table={table} />
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </LayoutAdmin>
  );
}
