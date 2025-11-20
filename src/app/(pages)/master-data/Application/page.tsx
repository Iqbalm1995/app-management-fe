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

      {/* Modern Colorful Header Card with Actions */}
      <Card
        bgGradient={colorMode === "light" ? "linear(135deg, white, gray.50)" : "linear(135deg, gray.800, gray.900)"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        rounded="2xl"
        shadow="xl"
        mx={{ base: 4, md: 6 }}
        mt={4}
        mb={6}
        position="relative"
        overflow="hidden"
      >
        {/* Animated Gradient Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="6px"
          bgGradient="linear(90deg, secondary.500, blue.500, green.500, orange.500, secondary.500)"
          backgroundSize="200% 100%"
          animation="gradient 3s ease infinite"
          sx={{
            "@keyframes gradient": {
              "0%, 100%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" }
            }
          }}
        />
        
        <CardBody p={6}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
            {/* Left Content with Gradient */}
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, secondary.400, secondary.600, purple.500)"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  inset: "-2px",
                  bgGradient: "linear(135deg, secondary.300, purple.400)",
                  rounded: "2xl",
                  zIndex: -1,
                  opacity: 0.3
                }}
              >
                <Icon as={HiOutlineDesktopComputer} boxSize={6} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading 
                  size="lg" 
                  bgGradient="linear(to-r, secondary.600, blue.600)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  Application Management
                </Heading>
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                  System application configuration
                </Text>
              </VStack>
            </HStack>

            {/* Center - Minimalistic Stats */}
            <HStack spacing={8}>
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="secondary.600">
                  {StatsData.total}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Total</Text>
              </VStack>
              
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {StatsData.active}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Active</Text>
              </VStack>
              
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">98%</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Health</Text>
              </VStack>
            </HStack>

            {/* Right - Action Buttons */}
            <HStack spacing={3}>
              <Button
                size="md"
                variant="outline"
                colorScheme="gray"
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
                isLoading={ActionLoading}
                rounded="xl"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
              >
                Refresh
              </Button>
              <Button
                size="md"
                bgGradient="linear(135deg, secondary.500, secondary.600)"
                color="white"
                leftIcon={<FiPlusSquare />}
                onClick={() => ModalForm.onOpen()}
                isLoading={ActionLoading}
                rounded="xl"
                shadow="lg"
                _hover={{
                  bgGradient: "linear(135deg, secondary.600, secondary.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
                Add Application
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>
      {/* Enhanced Main Content Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        mx={{ base: 4, md: 6 }}
        mb={8}
      >
        <CardBody p={8}>
          {/* Search and Controls Section */}
          <VStack spacing={6} w="full">
            <Flex justify="space-between" align="center" w="full">
              {/* Left - App Count Info with Icon */}
              <HStack spacing={3} align="center">
                <Box
                  w="40px"
                  h="40px"
                  bg="secondary.500"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                >
                  <Icon as={FiGrid} boxSize={4} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                    Master Data
                  </Heading>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                    {DataAplikasi.length} applications found
                    {globalFilter && ` • Search: "${globalFilter}"`}
                  </Text>
                </VStack>
              </HStack>

              {/* Right - Controls */}
              <HStack spacing={4}>
                {/* Search */}
                <InputGroup maxW="300px">
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
                    rounded="xl"
                    _focus={{
                      borderColor: "secondary.500",
                      bg: colorMode === "light" ? "white" : "gray.800",
                    }}
                  />
                </InputGroup>

                {/* Category Filter */}
                <Select
                  value={selectedKategori}
                  maxW="180px"
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                  rounded="xl"
                  _focus={{
                    borderColor: "secondary.500",
                    bg: colorMode === "light" ? "white" : "gray.800",
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile Application</option>
                </Select>

                {/* View Toggle */}
                <HStack
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  rounded="xl"
                  p={1}
                  spacing={1}
                >
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    colorScheme={viewMode === "grid" ? "secondary" : "gray"}
                    onClick={() => setViewMode("grid")}
                    leftIcon={<FiGrid />}
                    rounded="lg"
                    px={4}
                  >
                    Grid
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "solid" : "ghost"}
                    colorScheme={viewMode === "list" ? "secondary" : "gray"}
                    onClick={() => setViewMode("list")}
                    leftIcon={<FiList />}
                    rounded="lg"
                    px={4}
                  >
                    List
                  </Button>
                </HStack>
              </HStack>
            </Flex>

            <Divider />

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
                                h="240px"
                                minH="240px"
                                maxH="240px"
                                bg={
                                  colorMode === "light" ? "white" : "gray.800"
                                }
                                border="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.700"
                                }
                                rounded={radiusStyle}
                                shadow="lg"
                                transition="all 0.3s ease"
                                _hover={{
                                  cursor: "pointer",
                                  shadow: "2xl",
                                  transform: "translateY(-4px)",
                                  borderColor:
                                    colorMode === "light"
                                      ? "secondary.300"
                                      : "secondary.600",
                                }}
                                overflow="hidden"
                                position="relative"
                                display="flex"
                                flexDirection="column"
                              >
                                {/* Card Body */}
                                <CardBody
                                  p={2}
                                  flex="1"
                                  display="flex"
                                  flexDirection="column"
                                >
                                  <VStack spacing={4} align="stretch" flex="1">
                                    {/* Header with App Icon */}
                                    <Flex
                                      p={0}
                                      position="relative"
                                      bgGradient={
                                        "linear(to-br, secondary.700, secondary.400)"
                                      }
                                      rounded={radiusStyle}
                                      color="white"
                                      h="140px"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      <VStack
                                        spacing={3}
                                        position="relative"
                                        zIndex={1}
                                      >
                                        <Box
                                          w={"70px"}
                                          h={"70px"}
                                          bg="whiteAlpha.200"
                                          rounded="xl"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          fontSize="xl"
                                          fontWeight="bold"
                                          border="2px"
                                          borderColor="whiteAlpha.300"
                                        >
                                          {(
                                            app.appShortName ||
                                            app.appName ||
                                            "APP"
                                          ).length > 5
                                            ? (
                                                app.appShortName ||
                                                app.appName ||
                                                "A"
                                              )
                                                .charAt(0)
                                                .toUpperCase()
                                            : app.appShortName ||
                                              app.appName ||
                                              "APP"}
                                        </Box>
                                        <VStack spacing={0} align="center">
                                          <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            opacity="0.9"
                                            textAlign="center"
                                            noOfLines={1}
                                          >
                                            {app.appName}
                                          </Text>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="medium"
                                            opacity="0.8"
                                            textAlign="center"
                                          >
                                            #{app.appCode}
                                          </Text>
                                        </VStack>
                                      </VStack>
                                    </Flex>

                                    {/* Status and Actions - Always at bottom */}
                                    <Box mt="auto">
                                      <VStack spacing={3}>
                                        <HStack
                                          justify="space-between"
                                          w="full"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            fontWeight="medium"
                                          >
                                            Status
                                          </Text>
                                          <StatusBadge
                                            status={app.appsStatus}
                                            px={2}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                          />
                                        </HStack>

                                        <Button
                                          size="sm"
                                          colorScheme="secondary"
                                          w="full"
                                          rounded="lg"
                                          _hover={{
                                            transform: "translateY(-1px)",
                                            shadow: "lg",
                                          }}
                                          transition="all 0.2s"
                                          fontWeight="bold"
                                          as={Link}
                                          href={`/master-data/Application/detail?id=${app.id}`}
                                        >
                                          View Details
                                        </Button>
                                      </VStack>
                                    </Box>
                                  </VStack>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </Grid>

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
                        <VStack spacing={4} align="stretch">
                          {DataAplikasi.map((app, idx) => {

                            return (
                              <Card
                                key={app.id}
                                rounded="xl"
                                shadow="lg"
                                border="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.700"
                                }
                                bg={
                                  colorMode === "light" ? "white" : "gray.800"
                                }
                                _hover={{
                                  shadow: "2xl",
                                  borderColor:
                                    colorMode === "light"
                                      ? "secondary.300"
                                      : "secondary.600",
                                  transform: "translateY(-2px)",
                                }}
                                transition="all 0.3s ease"
                                overflow="hidden"
                                position="relative"
                              >
                                {/* Status Color Bar */}
                                <Box
                                  position="absolute"
                                  top={0}
                                  left={0}
                                  right={0}
                                  h="4px"
                                  bgGradient={`linear(to-r, secondary.400, secondary.600)`}
                                />

                                <CardBody p={6}>
                                  <Grid
                                    templateColumns={{
                                      base: "1fr",
                                      md: "auto 1fr auto auto auto",
                                    }}
                                    gap={6}
                                    alignItems="center"
                                  >
                                    {/* Modern App Avatar */}
                                    <GridItem>
                                      <Box
                                        w={24}
                                        h={24}
                                        bgGradient="linear(135deg, secondary.500, secondary.600, secondary.700)"
                                        rounded="2xl"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="white"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        flexShrink={0}
                                        shadow="lg"
                                      >
                                        {(
                                          app.appShortName ||
                                          app.appName ||
                                          "APP"
                                        ).length > 5
                                          ? (
                                              app.appShortName ||
                                              app.appName ||
                                              "A"
                                            )
                                              .charAt(0)
                                              .toUpperCase()
                                          : app.appShortName ||
                                            app.appName ||
                                            "APP"}
                                      </Box>
                                    </GridItem>

                                    {/* Enhanced App Details */}
                                    <GridItem>
                                      <VStack align="start" spacing={3}>
                                        <VStack align="start" spacing={1}>
                                          <HStack spacing={2} align="center">
                                            <Heading
                                              size="md"
                                              color={
                                                colorMode === "light"
                                                  ? "gray.800"
                                                  : "white"
                                              }
                                              fontWeight="bold"
                                            >
                                              {app.appName}
                                            </Heading>
                                            <StatusBadge
                                              status={app.appsStatus}
                                              px={3}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                              fontWeight="bold"
                                              textTransform="uppercase"
                                            />
                                          </HStack>

                                          <Text
                                            fontSize="sm"
                                            color={
                                              colorMode === "light"
                                                ? "gray.600"
                                                : "gray.400"
                                            }
                                            fontWeight="medium"
                                          >
                                            #{app.appCode}
                                          </Text>

                                          <Text
                                            fontSize="sm"
                                            color={
                                              colorMode === "light"
                                                ? "gray.500"
                                                : "gray.500"
                                            }
                                            noOfLines={2}
                                            lineHeight="1.4"
                                          >
                                            {app.appsDesc}
                                          </Text>
                                        </VStack>

                                        <HStack spacing={3} flexWrap="wrap">
                                          <Badge
                                            colorScheme="blue"
                                            variant="subtle"
                                            px={3}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="medium"
                                          >
                                            <Icon
                                              as={HiOutlineDesktopComputer}
                                              w={3}
                                              h={3}
                                              mr={1}
                                            />
                                            System Application
                                          </Badge>
                                          <Badge
                                            colorScheme="purple"
                                            variant="subtle"
                                            px={3}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="medium"
                                          >
                                            <Icon
                                              as={FiSettings}
                                              w={3}
                                              h={3}
                                              mr={1}
                                            />
                                            Configurable
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </GridItem>

                                    {/* App Type */}
                                    <GridItem
                                      display={{ base: "none", lg: "block" }}
                                    >
                                      <VStack spacing={2} align="center">
                                        <Text
                                          fontSize="xs"
                                          color={
                                            colorMode === "light"
                                              ? "gray.500"
                                              : "gray.400"
                                          }
                                          fontWeight="medium"
                                          textTransform="uppercase"
                                          letterSpacing="wide"
                                        >
                                          Type
                                        </Text>
                                        <Badge
                                          colorScheme="orange"
                                          variant="subtle"
                                          px={3}
                                          py={1}
                                          rounded="full"
                                          fontSize="xs"
                                          fontWeight="medium"
                                        >
                                          Enterprise
                                        </Badge>
                                      </VStack>
                                    </GridItem>

                                    {/* Health Status */}
                                    <GridItem
                                      display={{ base: "none", md: "block" }}
                                    >
                                      <VStack
                                        spacing={3}
                                        align="center"
                                        minW="120px"
                                      >
                                        <VStack spacing={1} align="center">
                                          <Text
                                            fontSize="xs"
                                            color={
                                              colorMode === "light"
                                                ? "gray.500"
                                                : "gray.400"
                                            }
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                          >
                                            Health
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color={
                                              app.appsStatus === "ACTIVE"
                                                ? "green.500"
                                                : "red.500"
                                            }
                                          >
                                            {app.appsStatus === "ACTIVE"
                                              ? "98%"
                                              : "0%"}
                                          </Text>
                                        </VStack>
                                        <Box w="80px" position="relative">
                                          <Box
                                            w="full"
                                            h="8px"
                                            bg={
                                              colorMode === "light"
                                                ? "gray.100"
                                                : "gray.700"
                                            }
                                            rounded="full"
                                            overflow="hidden"
                                          >
                                            <Box
                                              h="full"
                                              bgGradient={
                                                app.appsStatus === "ACTIVE"
                                                  ? "linear(to-r, green.400, green.600)"
                                                  : "linear(to-r, red.400, red.600)"
                                              }
                                              rounded="full"
                                              w={
                                                app.appsStatus === "ACTIVE"
                                                  ? "98%"
                                                  : "0%"
                                              }
                                              transition="all 0.3s ease"
                                            />
                                          </Box>
                                        </Box>
                                      </VStack>
                                    </GridItem>

                                    {/* Enhanced Action Buttons */}
                                    <GridItem>
                                      <VStack spacing={2}>
                                        <Button
                                          size="sm"
                                          colorScheme="secondary"
                                          leftIcon={
                                            <Icon as={FiSettings} boxSize={3} />
                                          }
                                          rounded="lg"
                                          _hover={{
                                            transform: "translateY(-1px)",
                                            shadow: "lg",
                                          }}
                                          transition="all 0.2s"
                                          fontWeight="bold"
                                          px={4}
                                          bgGradient="linear(to-r, secondary.500, secondary.600)"
                                          _active={{
                                            bgGradient:
                                              "linear(to-r, secondary.600, secondary.700)",
                                          }}
                                          as={Link}
                                          href={`/master-data/Application/detail?id=${app.id}`}
                                        >
                                          Configure
                                        </Button>
                                      </VStack>
                                    </GridItem>
                                  </Grid>

                                  {/* Mobile Enhanced Layout */}
                                  <Box
                                    display={{ base: "block", md: "none" }}
                                    mt={4}
                                    pt={4}
                                    borderTop="1px"
                                    borderColor={
                                      colorMode === "light"
                                        ? "gray.200"
                                        : "gray.700"
                                    }
                                  >
                                    <Grid templateColumns="1fr 1fr" gap={4}>
                                      {/* Mobile Health */}
                                      <VStack spacing={2} align="start">
                                        <Text
                                          fontSize="xs"
                                          color={
                                            colorMode === "light"
                                              ? "gray.500"
                                              : "gray.400"
                                          }
                                          fontWeight="medium"
                                          textTransform="uppercase"
                                          letterSpacing="wide"
                                        >
                                          Health
                                        </Text>
                                        <HStack spacing={3}>
                                          <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                            color={
                                              app.appsStatus === "ACTIVE"
                                                ? "green.500"
                                                : "red.500"
                                            }
                                          >
                                            {app.appsStatus === "ACTIVE"
                                              ? "98%"
                                              : "0%"}
                                          </Text>
                                          <Box flex={1} maxW="60px">
                                            <Box
                                              w="full"
                                              h="6px"
                                              bg={
                                                colorMode === "light"
                                                  ? "gray.100"
                                                  : "gray.700"
                                              }
                                              rounded="full"
                                              overflow="hidden"
                                            >
                                              <Box
                                                h="full"
                                                bgGradient={
                                                  app.appsStatus === "ACTIVE"
                                                    ? "linear(to-r, green.400, green.600)"
                                                    : "linear(to-r, red.400, red.600)"
                                                }
                                                rounded="full"
                                                w={
                                                  app.appsStatus === "ACTIVE"
                                                    ? "98%"
                                                    : "0%"
                                                }
                                              />
                                            </Box>
                                          </Box>
                                        </HStack>
                                      </VStack>

                                      {/* Mobile Type */}
                                      <VStack spacing={2} align="start">
                                        <Text
                                          fontSize="xs"
                                          color={
                                            colorMode === "light"
                                              ? "gray.500"
                                              : "gray.400"
                                          }
                                          fontWeight="medium"
                                          textTransform="uppercase"
                                          letterSpacing="wide"
                                        >
                                          Type
                                        </Text>
                                        <Badge
                                          colorScheme="orange"
                                          variant="subtle"
                                          px={2}
                                          py={1}
                                          rounded="full"
                                          fontSize="xs"
                                          fontWeight="medium"
                                        >
                                          Enterprise
                                        </Badge>
                                      </VStack>
                                    </Grid>

                                    {/* Mobile Action Buttons */}
                                    <HStack
                                      spacing={3}
                                      mt={4}
                                      justify="stretch"
                                    >
                                      <Button
                                        size="sm"
                                        colorScheme="secondary"
                                        leftIcon={
                                          <Icon as={FiSettings} boxSize={3} />
                                        }
                                        rounded="lg"
                                        flex={1}
                                        fontWeight="bold"
                                        bgGradient="linear(to-r, secondary.500, secondary.600)"
                                        as={Link}
                                        href={`/master-data/Application/detail?id=${app.id}`}
                                      >
                                        Configure
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="secondary"
                                        leftIcon={
                                          <Icon as={FiCode} boxSize={3} />
                                        }
                                        rounded="lg"
                                        flex={1}
                                        fontWeight="medium"
                                        as={Link}
                                        href={`/master-data/Application/detail?id=${app.id}`}
                                      >
                                        Details
                                      </Button>
                                    </HStack>
                                  </Box>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </VStack>

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
          </VStack>
        </CardBody>
      </Card>

      {/* Add Application Modal */}
      <Modal isOpen={ModalForm.isOpen} onClose={ModalForm.onClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          mx={4}
          maxW="900px"
        >
          <ModalHeader
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            borderTopRadius="2xl"
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            py={6}
          >
            <HStack spacing={4}>
              <Box
                p={3}
                bg="secondary.500"
                rounded="xl"
                color="white"
              >
                <Icon as={FiPlusSquare} boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                  Add New Application
                </Text>
                <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                  Create a new application in the system
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          
          <ModalCloseButton
            top={6}
            right={6}
            bg={colorMode === "light" ? "gray.100" : "gray.600"}
            rounded="full"
            _hover={{
              bg: colorMode === "light" ? "gray.200" : "gray.500",
            }}
          />
          
          <ModalBody p={8}>
            <Grid templateColumns="300px 1fr" gap={8} alignItems="start">
              {/* Left Side - Avatar Preview */}
              <VStack spacing={6}>
                <Box
                  w="full"
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="2xl"
                  p={6}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                >
                  <VStack spacing={4}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                      textAlign="center"
                    >
                      Application Preview
                    </Text>
                    
                    <Box position="relative">
                      {formData.iconApps ? (
                        <Box
                          w={24}
                          h={24}
                          rounded="2xl"
                          overflow="hidden"
                          border="3px"
                          borderColor="secondary.500"
                        >
                          <Box
                            as="img"
                            src={URL.createObjectURL(formData.iconApps)}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                        </Box>
                      ) : (
                        <Avatar
                          size="2xl"
                          name={formData.appShortName || "App"}
                          bg="secondary.500"
                          color="white"
                          fontSize="2xl"
                          fontWeight="bold"
                          borderRadius="2xl"
                          border="3px"
                          borderColor="secondary.500"
                        />
                      )}
                    </Box>

                    <VStack spacing={2} textAlign="center">
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        noOfLines={1}
                      >
                        {formData.appName || "Application Name"}
                      </Text>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        noOfLines={1}
                      >
                        {formData.appShortName || "SHORT"}
                      </Text>
                    </VStack>

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
                    <Button
                      as="label"
                      htmlFor="icon-upload"
                      size="sm"
                      variant="outline"
                      colorScheme="secondary"
                      cursor="pointer"
                      rounded="lg"
                      w="full"
                      leftIcon={<Icon as={FiPlusSquare} />}
                    >
                      {formData.iconApps ? "Change Icon" : "Upload Icon"}
                    </Button>
                    
                    {formData.iconApps && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setFormData({ ...formData, iconApps: null })}
                        w="full"
                      >
                        Remove Icon
                      </Button>
                    )}
                  </VStack>
                </Box>
              </VStack>

              {/* Right Side - Form Fields */}
              <VStack spacing={6} align="stretch">
                <Grid templateColumns="1fr 1fr" gap={6}>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="semibold"
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                      mb={2}
                    >
                      Application Name
                    </FormLabel>
                    <Input
                      value={formData.appName}
                      onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                      placeholder="Enter application name"
                      size="lg"
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      border="2px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      rounded="xl"
                      _focus={{
                        borderColor: "secondary.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="semibold"
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                      mb={2}
                    >
                      Short Name
                    </FormLabel>
                    <Input
                      value={formData.appShortName}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 10);
                        setFormData({ ...formData, appShortName: value });
                      }}
                      placeholder="Enter short name (max 10 chars)"
                      size="lg"
                      bg={colorMode === "light" ? "white" : "gray.700"}
                      border="2px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      rounded="xl"
                      _focus={{
                        borderColor: "secondary.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                      }}
                    />
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color={colorMode === "light" ? "gray.700" : "gray.300"}
                    mb={2}
                  >
                    Description
                  </FormLabel>
                  <Textarea
                    value={formData.appsDesc}
                    onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                    placeholder="Enter application description"
                    rows={4}
                    size="lg"
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    border="2px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                    resize="none"
                    _focus={{
                      borderColor: "secondary.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color={colorMode === "light" ? "gray.700" : "gray.300"}
                    mb={2}
                  >
                    Notes
                  </FormLabel>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Enter additional notes"
                    rows={3}
                    size="lg"
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    border="2px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded="xl"
                    resize="none"
                    _focus={{
                      borderColor: "secondary.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                    }}
                  />
                </FormControl>
              </VStack>
            </Grid>
          </ModalBody>

          <ModalFooter
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            borderBottomRadius="2xl"
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            p={6}
          >
            <HStack spacing={4} w="full" justify="end">
              <Button
                variant="ghost"
                onClick={ModalForm.onClose}
                rounded="xl"
                px={8}
                py={6}
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="secondary"
                onClick={handleAddApplication}
                isLoading={ActionLoading}
                isDisabled={!formData.appName || !formData.appShortName}
                rounded="xl"
                px={10}
                py={6}
                size="lg"
                bgGradient="linear(to-r, secondary.500, secondary.600)"
                _hover={{
                  bgGradient: "linear(to-r, secondary.600, secondary.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
                Create Application
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
