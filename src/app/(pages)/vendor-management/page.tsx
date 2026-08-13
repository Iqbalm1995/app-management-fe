"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  SimpleGrid,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiRefreshCcw,
  FiSearch,
  FiFilter,
  FiFolder,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiPlusSquare,
  FiEye,
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

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";

import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useVendor, { VendorResponse } from "@/app/services/useVendor";

import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";

// ─── Vendor status constants ─────────────────────────────────────────────────
const VENDOR_STATUS_ACTIVE = "ACTIVE";
const VENDOR_STATUS_INACTIVE = "INACTIVE";
const VENDOR_STATUS_BLACKLIST = "BLACKLIST";
const VENDOR_STATUSES = [VENDOR_STATUS_ACTIVE, VENDOR_STATUS_INACTIVE, VENDOR_STATUS_BLACKLIST];

const getStatusColor = (status: string) => {
  switch (status) {
    case VENDOR_STATUS_ACTIVE: return "green";
    case VENDOR_STATUS_INACTIVE: return "orange";
    case VENDOR_STATUS_BLACKLIST: return "red";
    default: return "gray";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case VENDOR_STATUS_ACTIVE: return FiCheckCircle;
    case VENDOR_STATUS_INACTIVE: return FiAlertCircle;
    case VENDOR_STATUS_BLACKLIST: return FiSlash;
    default: return FiBriefcase;
  }
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const VendorManagementPage = () => {
  useDocumentTitle("Vendor Management");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { List } = useVendor();

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data
  const [DataVendors, setDataVendors] = useState<VendorResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Filter
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pagination
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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

  // Data fetch
  useEffect(() => {
    if (!DataAuth) return;

    const filterWhere: PaggingListPayload["filterWhere"] = [];
    if (statusFilter) {
      filterWhere.push({ field: "Status", operator: "=", value: statusFilter });
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

    const fetchData = async () => {
      try {
        const res = await List(payload, tokenData);
        if (!res || res.statusCode !== RES_CODE_OK) {
          showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
          setIsLoadingProcess(false);
          return;
        }
        const items = (res.data as VendorResponse[]) ?? [];
        const total = res.countTotal ?? 0;
        setDataVendors(items);
        setTotalCount(total);
        setTotalPages(total > 0 ? Math.ceil(total / pageSize) : 0);
      } catch {
        showToast({ description: RES_GENERIC_ERROR_MSG, statusToast: "error" });
      } finally {
        setIsLoadingProcess(false);
      }
    };

    fetchData();
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, statusFilter, tokenData]);

  // Stats
  const countByStatus = useCallback(
    (s: string) => DataVendors.filter((v) => v.status === s).length,
    [DataVendors]
  );

  // Table columns
  const columns = useMemo<ColumnDef<VendorResponse>[]>(
    () => [
      {
        id: "rowNumber",
        header: "No.",
        cell: (info) => (
          <Text fontSize="sm" textAlign="center">{info.row.index + 1 + pagination.pageIndex * pagination.pageSize}.</Text>
        ),
      },
      {
        accessorKey: "vendorCode",
        header: "Code",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="medium">{info.getValue() as string}</Text>
        ),
      },
      {
        accessorKey: "vendorName",
        header: "Vendor Name",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="semibold">{info.getValue() as string}</Text>
            <Text fontSize="xs" color="gray.500">{info.row.original.vendorType}</Text>
          </VStack>
        ),
      },
      {
        accessorKey: "city",
        header: "City",
        cell: (info) => (
          <Text fontSize="sm">{info.getValue() as string}, {info.row.original.country}</Text>
        ),
      },
      {
        accessorKey: "picBusinessName",
        header: "Business PIC",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm">{info.getValue() as string}</Text>
            <Text fontSize="xs" color="gray.500">{info.row.original.picBusinessEmail}</Text>
          </VStack>
        ),
      },
      {
        accessorKey: "depedencyLevel",
        header: "Dependency",
        cell: (info) => (
          <Badge colorScheme="blue" variant="subtle" rounded="full" px={2}>
            {info.getValue() as string}
          </Badge>
        ),
      },
      {
        accessorKey: "businessImpact",
        header: "Impact",
        cell: (info) => {
          const val = info.getValue() as string;
          const scheme = val === "HIGH" ? "red" : val === "MEDIUM" ? "orange" : "gray";
          return <Badge colorScheme={scheme} variant="subtle" rounded="full" px={2}>{val}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <Badge colorScheme={getStatusColor(val)} rounded="full" px={3} py={1} fontSize="xs">
              {val}
            </Badge>
          );
        },
      },
      {
        id: "tdrExpiry",
        header: "TDR Expiry",
        cell: (info) => {
          const activeTdr = info.row.original.tdrList?.[0];
          if (!activeTdr) return <Text fontSize="xs" color="gray.400">—</Text>;
          const expired = new Date(activeTdr.expiredAt) < new Date();
          return (
            <Text fontSize="xs" color={expired ? "red.500" : "green.600"} fontWeight="medium">
              {new Date(activeTdr.expiredAt).toLocaleDateString("id-ID")}
            </Text>
          );
        },
      },
      {
        id: "contractValue",
        header: "Contract Value",
        cell: (info) => {
          const contract = info.row.original.contractList?.[0];
          if (!contract) return <Text fontSize="xs" color="gray.400">—</Text>;
          return (
            <Text fontSize="xs" fontWeight="medium">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(contract.workValue)}
            </Text>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: (info) => (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => router.push(`/vendor-management/detail?id=${info.row.original.id}`)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [colorMode, router]
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter((prev) => (prev === status ? "" : status));
    setPagination({ pageIndex: 0, pageSize });
  };

  const RefreshAction = () => {
    setDataVendors([]);
    setTotalCount(0);
    setTotalPages(0);
    setRefreshData((p) => p + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Vendor Management"
        breadCrumb={["Home", "Vendor Management"]}
      />

      {/* Hero Banner */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 4, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "160px", md: "180px" }}
      >
        {/* Abstract shapes */}
        <Box position="absolute" top="-20px" right="20px" w="80px" h="80px"
          bg={colorMode === "light" ? "blue.100" : "whiteAlpha.200"} rounded="full" />
        <Box position="absolute" bottom="-10px" left="30px" w="60px" h="60px"
          bg={colorMode === "light" ? "blue.200" : "whiteAlpha.300"} transform="rotate(45deg)" />
        <Box position="absolute" top="30px" left="60%" w="40px" h="40px"
          bg={colorMode === "light" ? "blue.100" : "whiteAlpha.200"} rounded="md" transform="rotate(30deg)" />

        <VStack h="full" justify="center" align="stretch" px={{ base: 6, md: 8 }} py={4}
          position="relative" zIndex={1} spacing={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Box w="60px" h="60px" bg="blue.500" rounded="xl"
                display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiBriefcase} boxSize={6} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={colorMode === "light" ? "gray.900" : "white"}
                  fontWeight="700" letterSpacing="tight">
                  Vendor Management Hub
                </Heading>
                <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "whiteAlpha.800"}>
                  Manage vendors, contracts, and TDR registrations
                </Text>
              </VStack>
            </HStack>

            {/* Quick Stats */}
            <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.900" : "white"}>
                  {totalCount}
                </Text>
                <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "whiteAlpha.800"} textTransform="uppercase">
                  Total
                </Text>
              </VStack>
              <Box w="1px" h="40px" bg={colorMode === "light" ? "blackAlpha.300" : "whiteAlpha.300"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.900" : "white"}>
                  {countByStatus(VENDOR_STATUS_ACTIVE)}
                </Text>
                <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "whiteAlpha.800"} textTransform="uppercase">
                  Active
                </Text>
              </VStack>
              <Box w="1px" h="40px" bg={colorMode === "light" ? "blackAlpha.300" : "whiteAlpha.300"} />
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.900" : "white"}>
                  {countByStatus(VENDOR_STATUS_BLACKLIST)}
                </Text>
                <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "whiteAlpha.800"} textTransform="uppercase">
                  Blacklist
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      <Box px={{ base: 4, md: 6 }} w="full">
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">

          {/* ── Sidebar ── */}
          <GridItem colSpan={{ base: 12, lg: 3 }}>
            <VStack spacing={5} align="stretch">

              {/* Dashboard Card */}
              <Card rounded="2xl" shadow="xl" border="1px"
                borderColor={colorMode === "light" ? "blue.400" : "blue.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
              >
                <Box bgGradient="linear(to-br, blue.700, blue.400)" p={4} color="white">
                  <HStack spacing={3}>
                    <Box w={12} h={12} bg="whiteAlpha.200" rounded="xl"
                      display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiBriefcase} boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" fontWeight="bold">Vendor Dashboard</Heading>
                      <Text fontSize="sm" opacity={0.9}>Vendor Overview & Control</Text>
                    </VStack>
                  </HStack>
                </Box>
                <CardBody p={5}>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">{totalCount}</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">Total Vendors</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {countByStatus(VENDOR_STATUS_ACTIVE)}
                      </Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">Active</Text>
                    </Box>
                  </SimpleGrid>
                  <Divider my={4} />
                  <VStack spacing={2} w="full">
                    {VENDOR_STATUSES.map((s) => (
                      <HStack key={s} justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Box w={3} h={3} bg={`${getStatusColor(s)}.500`} rounded="full" />
                          <Text fontSize="xs" color="gray.600">{s}</Text>
                        </HStack>
                        <Text fontSize="xs" fontWeight="bold" color={`${getStatusColor(s)}.600`}>
                          {countByStatus(s)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Search Card */}
              <Card rounded="2xl" shadow="lg" border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={5}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Box w={10} h={10} bg="blue.500" rounded="xl"
                        display="flex" alignItems="center" justifyContent="center" color="white">
                        <Icon as={FiSearch} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold"
                          color={colorMode === "light" ? "gray.800" : "white"}>
                          Search Vendor
                        </Text>
                        <Text fontSize="xs" color="gray.500">Find vendors quickly</Text>
                      </VStack>
                    </HStack>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="full">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by name, code, city..."
                        value={globalFilter}
                        onChange={(e) => { setGlobalFilter(e.target.value); setPagination({ pageIndex: 0, pageSize }); }}
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                        rounded="xl"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </InputGroup>
                  </VStack>
                </CardBody>
              </Card>

              {/* Status Filter Card */}
              <Card rounded="2xl" shadow="lg" border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={5}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Box w={10} h={10} bg="purple.500" rounded="xl"
                        display="flex" alignItems="center" justifyContent="center" color="white">
                        <Icon as={FiFilter} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold"
                          color={colorMode === "light" ? "gray.800" : "white"}>
                          Status Filter
                        </Text>
                        <Text fontSize="xs" color="gray.500">Filter by vendor status</Text>
                      </VStack>
                    </HStack>

                    <VStack spacing={2} align="stretch">
                      {VENDOR_STATUSES.map((s) => {
                        const isSelected = statusFilter === s;
                        const colorScheme = getStatusColor(s);
                        const StatusIcon = getStatusIcon(s);
                        return (
                          <Button
                            key={s}
                            variant={isSelected ? "solid" : "ghost"}
                            colorScheme={colorScheme}
                            size="md"
                            justifyContent="space-between"
                            leftIcon={<Icon as={StatusIcon} />}
                            onClick={() => handleStatusFilter(s)}
                            rounded="xl"
                            _hover={{ transform: "translateY(-1px)" }}
                            transition="all 0.2s"
                          >
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="medium">{s}</Text>
                              <Badge
                                colorScheme={colorScheme}
                                variant={isSelected ? "solid" : "subtle"}
                                rounded="full" px={2}
                              >
                                {countByStatus(s)}
                              </Badge>
                            </HStack>
                          </Button>
                        );
                      })}
                    </VStack>

                    {statusFilter && (
                      <Button size="sm" variant="outline" colorScheme="gray"
                        onClick={() => { setStatusFilter(""); setPagination({ pageIndex: 0, pageSize }); }}
                        rounded="xl">
                        Clear Filter
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>

            </VStack>
          </GridItem>

          {/* ── Main Content ── */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            <Card rounded="xl" shadow="lg" border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
              w="full" minH="400px"
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <VStack spacing={6} w="full">

                  {/* Header */}
                  <Flex justify="space-between" align="center" w="full">
                    <HStack spacing={3}>
                      <Box w={10} h={10} bg="blue.500" rounded="lg"
                        display="flex" alignItems="center" justifyContent="center" color="white">
                        <Icon as={FiBriefcase} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                          Vendor List
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                          {totalCount} vendors found
                          {statusFilter && <Text as="span" color="blue.500" fontWeight="medium"> • {statusFilter}</Text>}
                          {globalFilter && <Text as="span"> • "{globalFilter}"</Text>}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      <Button size="md" leftIcon={<FiRefreshCcw />} onClick={RefreshAction}
                        isLoading={IsLoadingProcess}>
                        Refresh
                      </Button>
                      <Link href="/vendor-management/register">
                        <Button size="md" colorScheme="blue" leftIcon={<FiPlusSquare />}>
                          Add Vendor
                        </Button>
                      </Link>
                    </HStack>
                  </Flex>

                  <Divider />

                  {/* Content */}
                  {IsLoadingProcess ? (
                    <VStack spacing={4} py={16}>
                      <LoadingMiniSignature />
                      <Text color="gray.500" fontWeight="medium">Loading vendors...</Text>
                    </VStack>
                  ) : DataVendors.length === 0 ? (
                    <VStack spacing={6} py={20}>
                      <Box w={20} h={20} bg={colorMode === "light" ? "gray.100" : "gray.700"}
                        rounded="full" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={FiFolder} boxSize={10} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Heading size="md" color="gray.500">
                          {globalFilter || statusFilter ? "No Vendors Found" : "No Vendors"}
                        </Heading>
                        <Text color="gray.400" fontSize="sm" textAlign="center" maxW="400px">
                          {globalFilter || statusFilter
                            ? "No vendors match your current filters. Try adjusting or clearing them."
                            : "No vendor data available yet."}
                        </Text>
                      </VStack>
                      {(globalFilter || statusFilter) && (
                        <Button variant="outline" colorScheme="gray" rounded="lg"
                          onClick={() => { setGlobalFilter(""); setStatusFilter(""); setPagination({ pageIndex: 0, pageSize }); }}>
                          Clear All Filters
                        </Button>
                      )}
                    </VStack>
                  ) : (
                    <Box w="full">
                      <Box overflowX="auto" w="full">
                        <Box minW="1400px">
                          <TableComponentFull table={table} />
                        </Box>
                      </Box>
                    </Box>
                  )}

                </VStack>
              </CardBody>
            </Card>
          </GridItem>

        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

export default VendorManagementPage;
