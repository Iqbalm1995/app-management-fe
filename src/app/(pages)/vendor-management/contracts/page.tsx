"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  SimpleGrid,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiList,
  FiPlus,
  FiRefreshCcw,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEye,
  FiEyeOff,
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
import CardContract, { formatIDR, getContractDeadlineStatus } from "@/app/components/CardContract";
import ContractSidebar from "./components/ContractSidebar";
import { ControlTable } from "@/app/components/tableComponents";

// Services & Helpers
import useVendor, { VendorContractResponse, VendorResponse } from "@/app/services/useVendor";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { ListSearchByParam } from "@/app/types/masterTypes";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Vendor Contracts Hub",
  breadCrumb: ["Home", "Vendor Management", "Contracts"],
};

const VendorContractsPage = () => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { ListContract, List: ListVendors } = useVendor();

  const [tokenData, setTokenData] = useState<string>("");
  const [DataContracts, setDataContracts] = useState<VendorContractResponse[]>([]);
  const [VendorOptions, setVendorOptions] = useState<VendorResponse[]>([]);
  const [IsLoading, setIsLoading] = useState<boolean>(true);
  const [RefreshData, setRefreshData] = useState<number>(0);

  // Filters & Pagination
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showWorkValue, setShowWorkValue] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPortfolioWorkValue, setTotalPortfolioWorkValue] = useState<number>(0);
  const [activeContractsCount, setActiveContractsCount] = useState<number>(0);
  const [expiringSoonContractsCount, setExpiringSoonContractsCount] = useState<number>(0);
  const [expiredContractsCount, setExpiredContractsCount] = useState<number>(0);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  const handleSwitchViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    const newPageSize = mode === "grid" ? 9 : 20;
    setPagination({ pageIndex: 0, pageSize: newPageSize });
  };

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
      loadVendorDropdown(token);
    }
  }, []);

  const loadVendorDropdown = async (token: string) => {
    const res = await ListVendors({ page: 0, limit: 200, search: "", filterWhere: [], fieldOrder: ["vendorName"], orderDir: "asc" }, token);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setVendorOptions(res.data);
    }
  };

  const fetchContracts = useCallback(async () => {
    if (!tokenData) return;
    setIsLoading(true);

    const filterWhere: ListSearchByParam[] = [];
    if (selectedVendorId) {
      filterWhere.push({ field: "vendorId", operator: "=", value: selectedVendorId });
    }

    if (statusFilter.length > 0) {
      statusFilter.forEach((st) => {
        filterWhere.push({ field: "status", operator: "=", value: st });
      });
    }

    const res = await ListContract(
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
      setDataContracts(res.data);
      setTotalCount(res.countTotal || res.data.length);
      setTotalPortfolioWorkValue(res.totalWorkValue || 0);
      setActiveContractsCount(res.activeCount || 0);
      setExpiringSoonContractsCount(res.expiringSoonCount || 0);
      setExpiredContractsCount(res.expiredCount || 0);
    } else {
      setDataContracts([]);
      setTotalCount(0);
      setTotalPortfolioWorkValue(0);
      setActiveContractsCount(0);
      setExpiringSoonContractsCount(0);
      setExpiredContractsCount(0);
      showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    }
    setIsLoading(false);
  }, [tokenData, pageIndex, pageSize, globalFilter, statusFilter, selectedVendorId, RefreshData]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Derived metrics
  const totalWorkValueSum = DataContracts.reduce((acc, c) => acc + (c.workValue || 0), 0);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const columns = useMemo<ColumnDef<VendorContractResponse>[]>(
    () => [
      { accessorKey: "corpNumber", header: "SPK / Corp Ref" },
      { accessorKey: "corpName", header: "Contract Title" },
      { accessorKey: "contractNumber", header: "Contract Number" },
      { accessorKey: "workValue", header: "Work Value (IDR)" },
      { accessorKey: "contractStartDate", header: "Start Date" },
      { accessorKey: "contractEndDate", header: "End Date" },
      { accessorKey: "status", header: "Status" },
    ],
    []
  );

  const table = useReactTable({
    data: DataContracts,
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
    debugTable: false,
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Abstract Geometric Hero Header Card */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 2, md: 4 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "auto", md: "170px" }}
      >
        <Box position="absolute" top="-20px" right="20px" w="80px" h="80px" bg={colorMode === "light" ? "secondary.100" : "whiteAlpha.200"} rounded="full" />
        <Box position="absolute" bottom="-10px" left="30px" w="60px" h="60px" bg={colorMode === "light" ? "secondary.200" : "whiteAlpha.300"} transform="rotate(45deg)" />
        <Box position="absolute" top="30px" left="60%" w="40px" h="40px" bg={colorMode === "light" ? "secondary.100" : "whiteAlpha.200"} rounded="md" transform="rotate(30deg)" />

        <VStack h="full" justify="center" align="stretch" px={{ base: 6, md: 8 }} py={4} position="relative" zIndex={1} spacing={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                bg="secondary.500"
                backdropFilter="blur(10px)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={colorMode === "light" ? "blackAlpha.100" : "whiteAlpha.200"}
              >
                <Icon as={FiFileText} boxSize={6} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={colorMode === "light" ? "gray.900" : "white"} fontWeight="700" letterSpacing="tight">
                  Vendor Contracts Management Hub
                </Heading>
                <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "white"} fontWeight="500">
                  Oversee procurement contracts, timelines, monetary allocations & payment milestones
                </Text>
              </VStack>
            </HStack>

            {/* Quick Metrics */}
            <HStack spacing={5} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color={colorMode === "light" ? "gray.900" : "white"}>
                  {totalCount}
                </Text>
                <Text fontSize="2xs" color={colorMode === "light" ? "gray.600" : "white"} textTransform="uppercase" fontWeight="600">
                  Total
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.400"} />
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="teal.500">
                  {activeContractsCount}
                </Text>
                <Text fontSize="2xs" color={colorMode === "light" ? "gray.600" : "white"} textTransform="uppercase" fontWeight="600">
                  Active
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.400"} />
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="orange.500">
                  {expiringSoonContractsCount}
                </Text>
                <Text fontSize="2xs" color="orange.500" textTransform="uppercase" fontWeight="700">
                  Expiring Soon (1-Mo)
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.400"} />
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="red.500">
                  {expiredContractsCount}
                </Text>
                <Text fontSize="2xs" color="red.500" textTransform="uppercase" fontWeight="700">
                  Expired
                </Text>
              </VStack>
              <Box w="1px" h="36px" bg={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.400"} />
              <VStack spacing={0} cursor="pointer" onClick={() => setShowWorkValue(!showWorkValue)}>
                <HStack spacing={1}>
                  <Text fontSize="md" fontWeight="bold" color="secondary.600">
                    {showWorkValue ? formatIDR(totalWorkValueSum) : "••••••"}
                  </Text>
                  <Icon as={showWorkValue ? FiEye : FiEyeOff} boxSize={3} color="gray.400" />
                </HStack>
                <Text fontSize="2xs" color={colorMode === "light" ? "gray.600" : "white"} textTransform="uppercase" fontWeight="600">
                  Page Work Value
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Main Content Layout Grid */}
      <Box px={{ base: 2, md: 4 }} w="full">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          {/* Sidebar Filters (3 Cols) */}
          <GridItem colSpan={{ base: 12, lg: 3 }} w="full">
            <ContractSidebar
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedVendorId={selectedVendorId}
              setSelectedVendorId={setSelectedVendorId}
              DataContracts={DataContracts}
              VendorOptions={VendorOptions}
              totalContractsCount={totalCount}
              totalActiveContractsCount={activeContractsCount}
              totalWorkValue={totalPortfolioWorkValue}
              colorMode={colorMode}
              showWorkValue={showWorkValue}
              tokenData={tokenData}
            />
          </GridItem>

          {/* Main Grid & Table Canvas (9 Cols) */}
          <GridItem colSpan={{ base: 12, lg: 9 }} w="full">
            <VStack spacing={5} w="full">
              <Card rounded="2xl" shadow="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"} w="full" minH="500px">
                <CardBody p={{ base: 4, md: 5 }}>
                  <VStack spacing={5} w="full">
                    {/* Toolbar Header */}
                    <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={3}>
                      <HStack spacing={3}>
                        <Box w={8} h={8} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                          <FiBriefcase size={16} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                            Contract Portfolio Directory
                          </Heading>
                          <Text fontSize="xs" color="gray.500">Showing {DataContracts.length} of {totalCount} records ({viewMode === "grid" ? "9 per page" : "20 per page"})</Text>
                        </VStack>
                      </HStack>

                      <HStack spacing={2}>
                        {/* Grid / List View Toggle */}
                        <HStack spacing={1} bg={colorMode === "light" ? "gray.100" : "gray.700"} p={1} rounded="lg">
                          <Button
                            size="xs"
                            variant={viewMode === "grid" ? "solid" : "ghost"}
                            colorScheme={viewMode === "grid" ? "blue" : "gray"}
                            onClick={() => handleSwitchViewMode("grid")}
                          >
                            <FiGrid />
                          </Button>
                          <Button
                            size="xs"
                            variant={viewMode === "list" ? "solid" : "ghost"}
                            colorScheme={viewMode === "list" ? "blue" : "gray"}
                            onClick={() => handleSwitchViewMode("list")}
                          >
                            <FiList />
                          </Button>
                        </HStack>

                        <Button size="sm" variant="outline" leftIcon={<FiRefreshCcw />} onClick={() => setRefreshData((prev) => prev + 1)} isLoading={IsLoading}>
                          Refresh
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={showWorkValue ? <FiEyeOff /> : <FiEye />}
                          onClick={() => setShowWorkValue((prev) => !prev)}
                        >
                          {showWorkValue ? "Hide Value" : "Show Value"}
                        </Button>

                        <Link href="/vendor-management/contracts/register">
                          <Button size="sm" colorScheme="blue" bg="secondary.500" _hover={{ bg: "secondary.600" }} leftIcon={<FiPlus />}>
                            Register New Contract
                          </Button>
                        </Link>
                      </HStack>
                    </Flex>

                    <Divider />

                    {/* Data Display: Grid vs List Mode */}
                    {IsLoading ? (
                      <Flex justify="center" align="center" minH="300px" w="full">
                        <LoadingMiniSignature />
                      </Flex>
                    ) : DataContracts.length > 0 ? (
                      viewMode === "grid" ? (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} w="full">
                          {DataContracts.map((contract) => (
                            <CardContract key={contract.id} data={contract} showWorkValue={showWorkValue} />
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Box overflowX="auto" w="full">
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                <Th py={3}>No.</Th>
                                <Th py={3}>Vendor Partner</Th>
                                <Th py={3}>SPK / Corp Ref</Th>
                                <Th py={3}>Contract Title</Th>
                                <Th py={3}>Contract Number</Th>
                                <Th py={3}>Work Value (IDR)</Th>
                                <Th py={3}>Start Date</Th>
                                <Th py={3}>End Date</Th>
                                <Th py={3}>Status</Th>
                                <Th py={3} textAlign="right">Action</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {DataContracts.map((contract, index) => (
                                <Tr key={contract.id} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}>
                                  <Td py={3}>{pageIndex * pageSize + index + 1}.</Td>
                                  <Td py={3}>
                                    <Text fontSize="xs" color="secondary.700">
                                      <strong>{contract.vendorName || contract.vendorId || "-"}</strong>
                                    </Text>
                                  </Td>
                                  <Td py={3}><Text fontSize="xs" fontWeight="700" color="secondary.700">{contract.corpNumber}</Text></Td>
                                  <Td py={3}><Text fontSize="xs" fontWeight="600" maxW="200px" noOfLines={1}>{contract.corpName}</Text></Td>
                                  <Td py={3}><Text fontSize="xs">{contract.contractNumber}</Text></Td>
                                  <Td py={3}><Text fontSize="xs" fontWeight="700">{formatIDR(contract.workValue, showWorkValue)}</Text></Td>
                                  <Td py={3}><Text fontSize="xs">{new Date(contract.contractStartDate).toLocaleDateString("id-ID")}</Text></Td>
                                  <Td py={3}><Text fontSize="xs">{new Date(contract.contractEndDate).toLocaleDateString("id-ID")}</Text></Td>
                                  <Td py={3}>
                                    <Badge
                                      colorScheme={getContractDeadlineStatus(contract.contractEndDate).badgeColor}
                                      fontSize="2xs"
                                      rounded="md"
                                      px={2}
                                    >
                                      {getContractDeadlineStatus(contract.contractEndDate).badgeLabel}
                                    </Badge>
                                  </Td>
                                  <Td py={3} textAlign="right">
                                    <Link href={`/vendor-management/contracts/detail?id=${contract.id}`}>
                                      <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FiEye />}>
                                        View Detail
                                      </Button>
                                    </Link>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )
                    ) : (
                      <Flex justify="center" align="center" py={14} direction="column" gap={3} w="full">
                        <Icon as={FiFileText} boxSize={10} color="gray.400" />
                        <Text color="gray.500" fontSize="md" fontWeight="500">No contracts match your search parameters</Text>
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
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

export default VendorContractsPage;
