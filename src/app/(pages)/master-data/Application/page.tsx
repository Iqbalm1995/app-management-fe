"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import {
  addParamFilter,
  addParamFilterUpdate,
  ListSearchByParamProps,
  PaggingListPayload,
  removeParamFilter,
} from "@/app/types/masterTypes";
import {
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
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
  Stack,
  Text,
  useColorMode,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiFilter, FiPlusSquare, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";

// Import table components
import {
  ControlTable,
} from "@/app/components/tableComponents";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Aplikasi`,
  breadCrumb: ["Home", "Master Data", "Aplikasi"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

// Temporary interface for aplikasi data (replace with actual interface later)
interface AplikasiResponse {
  id: string;
  appName: string;
  appCode: string;
  appDesc: string;
  appStatus: string;
}

function MasterDataAplikasiPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataAplikasi, setDataAplikasi] = useState<AplikasiResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<string>("all");

  // Pagination state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Memoized pagination
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Function Data Load Services Aplikasi with pagination
  const GetDataAplikasi = useCallback(async (): Promise<AplikasiResponse[]> => {
    setIsLoadingProcess(true);
    
    // Simulate API call with dummy data and pagination
    await delay(1000);
    
    const allDummyData: AplikasiResponse[] = [
      {
        id: "1",
        appName: "Project Management System",
        appCode: "PMS001",
        appDesc: "Comprehensive project management application for enterprise use",
        appStatus: "ACTIVE"
      },
      {
        id: "2", 
        appName: "Human Resource Management",
        appCode: "HRM002",
        appDesc: "Complete HR management solution with payroll integration",
        appStatus: "ACTIVE"
      },
      {
        id: "3",
        appName: "Customer Relationship Management", 
        appCode: "CRM003",
        appDesc: "Advanced CRM system for customer engagement and sales tracking",
        appStatus: "INACTIVE"
      },
      {
        id: "4",
        appName: "Financial Management System",
        appCode: "FMS004",
        appDesc: "Complete financial management and accounting solution",
        appStatus: "ACTIVE"
      },
      {
        id: "5",
        appName: "Inventory Management",
        appCode: "IMS005",
        appDesc: "Advanced inventory tracking and management system",
        appStatus: "ACTIVE"
      },
      {
        id: "6",
        appName: "Document Management System",
        appCode: "DMS006",
        appDesc: "Digital document storage and management platform",
        appStatus: "INACTIVE"
      },
      {
        id: "7",
        appName: "Learning Management System",
        appCode: "LMS007",
        appDesc: "Online learning and training management platform",
        appStatus: "ACTIVE"
      },
      {
        id: "8",
        appName: "Asset Management System",
        appCode: "AMS008",
        appDesc: "Complete asset tracking and management solution",
        appStatus: "ACTIVE"
      },
      {
        id: "9",
        appName: "Quality Management System",
        appCode: "QMS009",
        appDesc: "Quality control and assurance management platform",
        appStatus: "ACTIVE"
      },
      {
        id: "10",
        appName: "Supply Chain Management",
        appCode: "SCM010",
        appDesc: "End-to-end supply chain management solution",
        appStatus: "INACTIVE"
      }
    ];

    // Apply category filter
    let filteredData = allDummyData;
    if (selectedKategori !== "all") {
      // In real implementation, filter by category
      filteredData = allDummyData.filter(app => app.appStatus === "ACTIVE");
    }

    // Apply search filter
    if (globalFilter) {
      filteredData = filteredData.filter(app => 
        app.appName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        app.appCode.toLowerCase().includes(globalFilter.toLowerCase()) ||
        app.appDesc.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Calculate pagination
    const totalData = filteredData.length;
    const totalPages = totalData > 0 ? Math.ceil(totalData / pageSize) : 0;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setDataAplikasi(paginatedData);
    setTotalPageData(totalPages);
    setIsLoadingProcess(false);
    return paginatedData;
  }, [pageIndex, pageSize, globalFilter, selectedKategori]);
  // END - Function Data Load Services Aplikasi

  const RefreshAction = useCallback(() => {
    setTotalPageData(0);
    setDataAplikasi([]);
    setRefreshData(RefreshData + 1);
  }, [RefreshData]);

  // Table configuration
  const columnsData = useMemo<ColumnDef<AplikasiResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.appCode,
        id: "appCode",
        cell: (info) => (
          <div key={info.row.original.appCode}>
            {/* This will be rendered in grid, not table */}
          </div>
        ),
        header: () => <span>Applications</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  const table = useReactTable({
    data: DataAplikasi,
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  // Update useEffect to include pagination dependencies
  useEffect(() => {
    GetDataAplikasi();
  }, [GetDataAplikasi, RefreshData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        {/* TABLE SECTION */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            minH={"500px"}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                Master Data Aplikasi
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER DATA & ACTION */}
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="full">
                        <FiSearch color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        placeholder="Search applications..."
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        value={globalFilter}
                        size="md"
                      />
                    </InputGroup>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <HStack justifyContent={"end"} spacing={2} w={"full"}>
                      <Select
                        value={selectedKategori}
                        size={"sm"}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                        maxW={"180px"}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="web">Web Application</option>
                        <option value="mobile">Mobile Application</option>
                        <option value="desktop">Desktop Application</option>
                      </Select>
                      <Button
                        colorScheme={"secondary"}
                        leftIcon={<FiPlusSquare />}
                        size={"sm"}
                        isLoading={ActionLoading}
                        onClick={() => {
                          // Add new aplikasi functionality here
                        }}
                      >
                        Tambah Aplikasi
                      </Button>
                      <Button
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Muat Ulang
                      </Button>
                    </HStack>
                  </GridItem>
                </Grid>
                {/* DATA RENDER */}
                {IsLoadingProcess ? <LoadingMiniSignature /> : <></>}
                <Grid templateColumns="repeat(3, 1fr)" gap={5} w={"full"}>
                  {DataAplikasi.map((dt, idx) => (
                    <GridItem
                      colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                      w={"full"}
                      key={idx}
                    >
                      <Card
                        w="full"
                        shadow="lg"
                        rounded="2xl"
                        overflow="hidden"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.600"
                        }
                        transition="all 0.3s ease"
                        _hover={{
                          transform: "translateY(-8px)",
                          shadow: "2xl",
                          borderColor: "secondary.400",
                        }}
                      >
                        <CardHeader
                          bg="secondary.500"
                          color="white"
                          p={6}
                          h={"120px"}
                        >
                          <HStack justify="space-between">
                            <Heading size="md" fontWeight="700">
                              {dt.appName}
                            </Heading>
                            <Text
                              fontSize="xs"
                              bg="whiteAlpha.200"
                              px={2}
                              py={1}
                              rounded="full"
                              fontFamily="mono"
                            >
                              #{dt.appCode}
                            </Text>
                          </HStack>
                        </CardHeader>

                        <CardBody p={6}>
                          <Stack spacing={4} h={"120px"}>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "light" ? "gray.600" : "gray.400"
                              }
                            >
                              {dt.appDesc}
                              <Divider my={2} />
                              Application management for enterprise systems.
                            </Text>

                            <HStack justify="space-between">
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="medium"
                              >
                                Status: {dt.appStatus}
                              </Text>

                              <Button
                                size="sm"
                                colorScheme="secondary"
                                variant="ghost"
                                onClick={() => {
                                  // Detail functionality here
                                }}
                              >
                                Detail →
                              </Button>
                            </HStack>
                          </Stack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>
                
                {/* Pagination Controls */}
                {DataAplikasi.length > 0 && (
                  <Flex w="full" px={0} mt={6}>
                    <ControlTable table={table} />
                  </Flex>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
