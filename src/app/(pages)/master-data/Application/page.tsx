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
import { getStatusColor } from "@/app/utils/statusUtils";
import { StatusBadge } from "@/app/components/StatusBadge";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import {
  addParamFilter,
  addParamFilterUpdate,
  ListSearchByParamProps,
  PaggingListPayload,
  PaggingListPayloadCustom,
  removeParamFilter,
} from "@/app/types/masterTypes";
import {
  Avatar,
  AvatarGroup,
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
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Select,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
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
import { FiFilter, FiGrid, FiList, FiPlusSquare, FiRefreshCcw, FiSearch, FiX, FiSettings, FiBarChart, FiZap, FiActivity, FiTarget, FiBriefcase, FiUsers, FiCode } from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { Select as ChakraSelect } from "chakra-react-select";

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

function MasterDataAplikasiPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { List, InsertData } = useApps();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataAplikasi, setDataAplikasi] = useState<ApplicationMasterResponse[]>([]);
  const [StatsData, setStatsData] = useState({
    total: 0,
    active: 0,
  });
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Pagination state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Modal state
  const ModalForm = useDisclosure();
  const [formData, setFormData] = useState({
    appName: "",
    appShortName: "",
    appsDesc: "",
    note: "",
    iconApps: null as File | null,
  });

  // Memoized pagination
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Function to get stats data (total counts)
  const GetStatsData = async () => {
    if (!tokenData || !DataAuth) return;

    try {
      // Get total count
      const PayloadTotal: PaggingListPayloadCustom = {
        search: "",
        limit: 1,
        page: 0,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: [],
      };

      // Get active count
      const PayloadActive: PaggingListPayloadCustom = {
        search: "",
        limit: 1,
        page: 0,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: [
          {
            field: "appsStatus",
            operator: "=",
            value: "ACTIVE",
          },
        ],
      };

      const [totalResponse, activeResponse] = await Promise.all([
        List(PayloadTotal as any, tokenData),
        List(PayloadActive as any, tokenData),
      ]);

      if (totalResponse?.statusCode === RES_CODE_OK && activeResponse?.statusCode === RES_CODE_OK) {
        setStatsData({
          total: totalResponse.countTotal || 0,
          active: activeResponse.countTotal || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Function Data Load Services Aplikasi with pagination
  const GetDataAplikasi = async () => {
    if (!tokenData || !DataAuth) {
      console.log("Missing auth data:", { tokenData: !!tokenData, DataAuth: !!DataAuth });
      return;
    }

    try {
      setIsLoadingProcess(true);

      console.log("Making API call with token:", tokenData.substring(0, 20) + "...");

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: [],
      };

      const requestData = await List(PayloadList as any, tokenData);

      console.log("API Response:", requestData);

      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      const data = requestData.data as ApplicationMasterResponse[];
      setDataAplikasi(data);

      // Use API pagination data
      const totalData = requestData.countTotal || 0;
      const totalPages = totalData > 0 ? Math.ceil(totalData / pageSize) : 0;
      setTotalPageData(totalPages);

    } catch (error) {
      console.error("Error fetching applications:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };
  // END - Function Data Load Services Aplikasi

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataAplikasi([]);
    setRefreshData(RefreshData + 1);
  };
  // Handle Add Application
  const handleAddApplication = async () => {
    if (!tokenData || !DataAuth) return;

    try {
      setActionLoading(true);

      const payload = {

        appName: formData.appName,
        appShortName: formData.appShortName,
        appsDesc: formData.appsDesc || null,
        note: formData.note || null,
        appOwnerDivisionId: null,
        appOwnerGroupId: null,
        appManageByDivisionId: null,
        appManageByGroupId: null,
        appManageByTeamId: null,
        reqParentId: null,
      };

      // Simulate API call for now
      const requestData = await InsertData(payload, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Application added successfully",
        statusToast: "success",
      });

      setFormData({ appName: "", appShortName: "", appsDesc: "", note: "", iconApps: null });
      ModalForm.onClose();
      RefreshAction();

    } catch (error) {
      showToast({
        description: "Failed to add application",
        statusToast: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };
  // Table configuration
  const columnsData = useMemo<ColumnDef<ApplicationMasterResponse>[]>(
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
    if (DataAuth && tokenData) {
      GetDataAplikasi();
      GetStatsData(); // Get stats data separately
    }
  }, [pageIndex, pageSize, globalFilter, RefreshData, DataAuth, tokenData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Main Content Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        mx={{ base: 4, md: 6 }}
        mt={4}
        mb={8}
      >
        <CardBody p={6}>
          {/* Header + Controls in one row */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
            {/* Left - Title & Stats */}
            <HStack spacing={4}>
              <Box
                w="44px"
                h="44px"
                bg="secondary.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={HiOutlineDesktopComputer} boxSize={5} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                  Application Management
                </Heading>
                <HStack spacing={4} mt={1}>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                    <Text as="span" fontWeight="semibold" color="secondary.600">{StatsData.total}</Text> Total
                  </Text>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                    <Text as="span" fontWeight="semibold" color="green.500">{StatsData.active}</Text> Active
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Right - Search, Filter, View Toggle, Actions */}
            <HStack spacing={3}>
              {/* Search */}
              <InputGroup maxW="250px">
                <InputLeftElement>
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search applications..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                  rounded="lg"
                  size="sm"
                  _focus={{
                    borderColor: "secondary.500",
                    bg: colorMode === "light" ? "white" : "gray.800",
                  }}
                />
              </InputGroup>

              {/* Category Filter */}
              <Box minW="160px">
                <ChakraSelect
                  value={
                    selectedKategori === "all"
                      ? { label: "All Categories", value: "all" }
                      : selectedKategori === "enterprise"
                        ? { label: "Enterprise", value: "enterprise" }
                        : selectedKategori === "web"
                          ? { label: "Web Application", value: "web" }
                          : { label: "Mobile Application", value: "mobile" }
                  }
                  onChange={(option) => {
                    setSelectedKategori(option?.value || "all");
                  }}
                  options={[
                    { label: "All Categories", value: "all" },
                    { label: "Enterprise", value: "enterprise" },
                    { label: "Web Application", value: "web" },
                    { label: "Mobile Application", value: "mobile" },
                  ]}
                  placeholder="Select Category"
                  size="sm"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      width: "100%",
                    }),
                    control: (provided) => ({
                      ...provided,
                      bg: "white",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      bg: "white",
                      zIndex: 9999,
                    }),
                  }}
                />
              </Box>

              {/* View Toggle */}
              <HStack
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                rounded="lg"
                p={1}
                spacing={1}
              >
                <Button
                  size="xs"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  colorScheme={viewMode === "grid" ? "secondary" : "gray"}
                  onClick={() => setViewMode("grid")}
                  rounded="md"
                  px={2}
                >
                  <Icon as={FiGrid} boxSize={3.5} />
                </Button>
                <Button
                  size="xs"
                  variant={viewMode === "list" ? "solid" : "ghost"}
                  colorScheme={viewMode === "list" ? "secondary" : "gray"}
                  onClick={() => setViewMode("list")}
                  rounded="md"
                  px={2}
                >
                  <Icon as={FiList} boxSize={3.5} />
                </Button>
              </HStack>

              <Button
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={() => RefreshAction()}
                isLoading={ActionLoading}
                rounded="lg"
                px={2}
              >
                <Icon as={FiRefreshCcw} boxSize={4} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="secondary"
                onClick={() => ModalForm.onOpen()}
                isLoading={ActionLoading}
                rounded="lg"
                px={2}
              >
                <Icon as={FiPlusSquare} boxSize={4} />
              </Button>
            </HStack>
          </Flex>

          <Divider mb={6} borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

            {/* Applications Content */}
            <Box w="full" minH="400px">
              {IsLoadingProcess ? (
                <VStack
                  spacing={{ base: 4, md: 6 }}
                  py={{ base: 12, md: 16 }}
                >
                  <LoadingMiniSignature />
                  <VStack spacing={2}>
                    <Text
                      color="gray.500"
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="medium"
                      textAlign="center"
                    >
                      Loading Applications
                    </Text>
                    <Text
                      color="gray.400"
                      fontSize={{ base: "xs", md: "sm" }}
                      textAlign="center"
                      px={{ base: 4, md: 0 }}
                    >
                      Please wait while we fetch your applications...
                    </Text>
                  </VStack>
                </VStack>
              ) : DataAplikasi.length === 0 ? (
                <VStack
                  spacing={{ base: 6, md: 8 }}
                  py={{ base: 16, md: 20 }}
                  textAlign="center"
                >
                  <Box
                    w={{ base: 16, md: 24 }}
                    h={{ base: 16, md: 24 }}
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={{ base: "2xl", md: "4xl" }}
                  >
                    <Icon
                      as={HiOutlineDesktopComputer}
                      boxSize={{ base: 8, md: 12 }}
                      color={
                        colorMode === "light" ? "gray.400" : "gray.500"
                      }
                    />
                  </Box>
                  <VStack spacing={{ base: 2, md: 3 }}>
                    <Heading
                      size={{ base: "md", md: "lg" }}
                      color={
                        colorMode === "light" ? "gray.600" : "gray.400"
                      }
                      textAlign="center"
                    >
                      {globalFilter
                        ? "No Applications Found"
                        : "No Applications"}
                    </Heading>
                    <Text
                      color="gray.500"
                      maxW={{ base: "300px", md: "500px" }}
                      lineHeight="1.6"
                      fontSize={{ base: "sm", md: "md" }}
                      px={{ base: 4, md: 0 }}
                      textAlign="center"
                    >
                      {globalFilter
                        ? `No applications match your search "${globalFilter}". Try adjusting your search terms.`
                        : "No applications have been configured yet. Applications will appear here once they are added to the system."}
                    </Text>
                  </VStack>
                  {globalFilter && (
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => setGlobalFilter("")}
                      rounded="lg"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Clear Search
                    </Button>
                  )}
                </VStack>
              ) : (
                <>
                  {/* Grid View */}
                  <Box display={viewMode === "grid" ? "block" : "none"}>
                    <Box
                      maxH="calc(100vh - 400px)"
                      overflowY="auto"
                      pr={2}
                      css={{
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-track': { background: colorMode === 'light' ? '#f1f1f1' : '#2D3748', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb': { background: colorMode === 'light' ? '#CBD5E0' : '#4A5568', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb:hover': { background: colorMode === 'light' ? '#A0AEC0' : '#718096' },
                      }}
                    >
                      <Grid
                        templateColumns={{
                          base: "1fr",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(3, 1fr)",
                        }}
                        gap={6}
                        w="full"
                      >
                        {DataAplikasi.map((app, idx) => {

                          return (
                            <Card
                              key={app.id}
                              w="full"
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                              rounded="xl"
                              shadow="sm"
                              transition="all 0.2s"
                              _hover={{
                                cursor: "pointer",
                                shadow: "lg",
                                borderColor: colorMode === "light" ? "secondary.200" : "secondary.700",
                                bg: colorMode === "light" ? "secondary.50" : "secondary.900",
                              }}
                              overflow="hidden"
                              as={Link}
                              href={`/master-data/Application/detail?id=${app.id}`}
                            >
                              <CardBody p={5} display="flex" flexDirection="column" gap={4}>
                                {/* Top row: icon + status */}
                                <Flex justify="space-between" align="start">
                                  <Box
                                    w={12}
                                    h={12}
                                    bg="secondary.500"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontSize="xl"
                                    fontWeight="bold"
                                  >
                                    {(app.appShortName || app.appName || "APP").split(/\s+/).slice(0, 3).map(w => w.charAt(0).toUpperCase()).join("")}
                                  </Box>
                                  <StatusBadge status={app.appsStatus} fontSize="xs" rounded="full" />
                                </Flex>

                                {/* App Info */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"} noOfLines={1}>
                                    {app.appName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                                    {app.appCode}
                                  </Text>
                                </Box>

                                {/* Description */}
                                <Text fontSize="xs" color="gray.400" noOfLines={2} lineHeight="tall">
                                  {app.appsDesc || "No description"}
                                </Text>

                                {/* Footer - project counts */}
                                <HStack mt="auto" spacing={4}>
                                  <HStack spacing={1}>
                                    <Box w={2} h={2} rounded="full" bg="secondary.400" />
                                    <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.300"} fontWeight="medium">
                                      {app.countProjectAll || 0} projects
                                    </Text>
                                  </HStack>
                                  {(app.countProjectOnGoing || 0) > 0 && (
                                    <HStack spacing={1}>
                                      <Box w={2} h={2} rounded="full" bg="orange.400" />
                                      <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.300"}>
                                        {app.countProjectOnGoing} ongoing
                                      </Text>
                                    </HStack>
                                  )}
                                  {(app.countProjectCompleted || 0) > 0 && (
                                    <HStack spacing={1}>
                                      <Box w={2} h={2} rounded="full" bg="green.400" />
                                      <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.300"}>
                                        {app.countProjectCompleted} done
                                      </Text>
                                    </HStack>
                                  )}
                                </HStack>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </Grid>
                    </Box>

                    {/* Enhanced Pagination Controls for Grid View */}
                    <Box
                      mt={8}
                      p={6}
                      bg={colorMode === "light" ? "gray.50" : "gray.900"}
                      rounded="xl"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    >
                      <ControlTable table={table} />
                    </Box>
                  </Box>
                  {/* List View */}
                  <Box display={viewMode === "list" ? "block" : "none"}>
                    <Box
                      maxH="calc(100vh - 400px)"
                      overflowY="auto"
                      pr={2}
                      css={{
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-track': { background: colorMode === 'light' ? '#f1f1f1' : '#2D3748', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb': { background: colorMode === 'light' ? '#CBD5E0' : '#4A5568', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb:hover': { background: colorMode === 'light' ? '#A0AEC0' : '#718096' },
                      }}
                    >
                      <VStack spacing={0} align="stretch" divider={<Divider borderColor={colorMode === "light" ? "gray.100" : "gray.700"} />}>
                        {DataAplikasi.map((app, idx) => {

                          return (
                            <Flex
                              key={app.id}
                              as={Link}
                              href={`/master-data/Application/detail?id=${app.id}`}
                              align="center"
                              gap={4}
                              py={3}
                              px={4}
                              rounded="lg"
                              cursor="pointer"
                              transition="all 0.15s"
                              _hover={{
                                bg: colorMode === "light" ? "secondary.50" : "secondary.900",
                                textDecoration: "none",
                              }}
                            >
                              {/* App Avatar */}
                              <Box
                                w={10}
                                h={10}
                                bg={colorMode === "light" ? "secondary.50" : "secondary.900"}
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="secondary.500"
                                fontSize="xs"
                                fontWeight="bold"
                                flexShrink={0}
                              >
                                {(app.appShortName || app.appName || "APP").split(/\s+/).slice(0, 3).map(w => w.charAt(0).toUpperCase()).join("")}
                              </Box>

                              {/* App Details */}
                              <Box flex={1} minW={0}>
                                <HStack spacing={2} align="center">
                                  <Text fontSize="sm" fontWeight="medium" color="secondary.600" noOfLines={1}>
                                    {app.appName}
                                  </Text>
                                  <StatusBadge status={app.appsStatus} fontSize="xs" rounded="full" />
                                </HStack>
                                <Text fontSize="xs" color="gray.500">{app.appCode}</Text>
                              </Box>

                              {/* Project counts */}
                              <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                                <Text fontSize="xs" color="gray.500">
                                  <Text as="span" fontWeight="semibold" color="secondary.500">{app.countProjectAll || 0}</Text> projects
                                </Text>
                                {(app.countProjectOnGoing || 0) > 0 && (
                                  <Text fontSize="xs" color="orange.500">
                                    <Text as="span" fontWeight="semibold">{app.countProjectOnGoing}</Text> ongoing
                                  </Text>
                                )}
                                {(app.countProjectCompleted || 0) > 0 && (
                                  <Text fontSize="xs" color="green.500">
                                    <Text as="span" fontWeight="semibold">{app.countProjectCompleted}</Text> completed
                                  </Text>
                                )}
                              </HStack>
                            </Flex>
                          );
                        })}
                      </VStack>
                    </Box>

                    {/* Enhanced Pagination Controls */}
                    <Box
                      mt={8}
                      p={6}
                      bg={colorMode === "light" ? "gray.50" : "gray.900"}
                      rounded="xl"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    >
                      <ControlTable table={table} />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
        </CardBody>
      </Card>

      {/* Add Application Modal */}
      <Modal isOpen={ModalForm.isOpen} onClose={ModalForm.onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent
          bg={colorMode === "light" ? "white" : "gray.800"}
          rounded="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          mx={4}
        >
          <ModalHeader py={4} px={6}>
            <Text fontSize="lg" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
              Add New Application
            </Text>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody px={6} pb={6}>
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
                      bg={colorMode === "light" ? "gray.100" : "gray.700"}
                      border="2px dashed"
                      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
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
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"} fontWeight="medium">
                    App Icon
                  </Text>
                  <HStack spacing={2}>
                    <Text as="label" htmlFor="icon-upload" fontSize="xs" color="secondary.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      {formData.iconApps ? "Change" : "Click to upload"}
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
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    Application Name
                  </FormLabel>
                  <Input
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    placeholder="Application name"
                    size="sm"
                    rounded="lg"
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    Short Name
                  </FormLabel>
                  <Input
                    value={formData.appShortName}
                    onChange={(e) => setFormData({ ...formData, appShortName: e.target.value.slice(0, 10) })}
                    placeholder="Max 10 chars"
                    size="sm"
                    rounded="lg"
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  />
                </FormControl>
              </Grid>

              {/* Description */}
              <FormControl>
                <FormLabel fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                  Description
                </FormLabel>
                <Textarea
                  value={formData.appsDesc}
                  onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                  size="sm"
                  rounded="lg"
                  resize="none"
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                />
              </FormControl>

              {/* Notes */}
              <FormControl>
                <FormLabel fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                  Notes
                </FormLabel>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                  size="sm"
                  rounded="lg"
                  resize="none"
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter px={6} py={4} borderTop="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={ModalForm.onClose} rounded="lg">
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="secondary"
                onClick={handleAddApplication}
                isLoading={ActionLoading}
                isDisabled={!formData.appName || !formData.appShortName}
                rounded="lg"
              >
                Create
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
