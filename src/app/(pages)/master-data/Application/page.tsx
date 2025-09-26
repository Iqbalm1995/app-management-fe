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
  const { List } = useApps();
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
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        page: pageIndex + 1,
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
    }
  }, [pageIndex, pageSize, globalFilter, selectedKategori, RefreshData, DataAuth, tokenData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Modern Master Data Header Section */}
      <Box
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        rounded="2xl"
        shadow="2xl"
        px={2}
        mx={{ base: 4, sm: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        position="relative"
      >
        {/* BJB Logo Overlay Pattern */}
        <Box
          position="absolute"
          top="50%"
          left="-100px"
          transform="translateY(-50%)"
          w="300px"
          h="300px"
          opacity="0.15"
          zIndex={0}
          backgroundImage="url('/img/logo-bjb-black-wing.svg')"
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          filter="brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1352%) hue-rotate(170deg) brightness(96%) contrast(97%)"
        />

        {/* Decorative Background Elements */}
        <Box
          position="absolute"
          top="-40px"
          right="-40px"
          w="160px"
          h="160px"
          bg="secondary.100"
          rounded="full"
          opacity="0.3"
          zIndex={0}
        />

        <Box
          px={{ base: 4, sm: 5, md: 6 }}
          py={{ base: 5, md: 6 }}
          position="relative"
          zIndex={1}
        >
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr auto" }}
            gap={6}
            alignItems="center"
          >
            {/* Left Content */}
            <VStack align="start" spacing={4}>
              {/* Title Section */}
              <HStack spacing={4}>
                <Box
                  w={"80px"}
                  h={"80px"}
                  bgGradient={"linear(to-br, secondary.700, secondary.400)"}
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="xl"
                  shadow="lg"
                >
                  <Icon as={HiOutlineDesktopComputer} boxSize={6} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading
                    size="xl"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    fontWeight="bold"
                  >
                    Master Data Applications
                  </Heading>
                  <Text
                    fontSize="md"
                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                    fontWeight="medium"
                  >
                    Manage and configure all system applications
                  </Text>
                </VStack>
              </HStack>

              {/* Feature Tags */}
              <HStack spacing={3} flexWrap="wrap">
                <Badge
                  colorScheme="secondary"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Icon as={HiOutlineDesktopComputer} w={3} h={3} mr={2} />
                  Application Management
                </Badge>
                <Badge
                  colorScheme="secondary"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Icon as={FiSettings} w={3} h={3} mr={2} />
                  Configuration
                </Badge>
                <Badge
                  colorScheme="green"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Icon as={FiBarChart} w={3} h={3} mr={2} />
                  System Analytics
                </Badge>
              </HStack>
            </VStack>

            {/* Right Content - Stats Grid */}
            <Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={3} minW="260px">
                {/* Total Applications */}
                <Card
                  bg={colorMode === "light" ? "secondary.50" : "secondary.900"}
                  border="1px"
                  borderColor={colorMode === "light" ? "secondary.200" : "secondary.700"}
                  rounded="lg"
                >
                  <CardBody p={4} textAlign="center">
                    <VStack spacing={2}>
                      <Box
                        w={8}
                        h={8}
                        bg="secondary.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                      >
                        <Icon as={HiOutlineDesktopComputer} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="secondary.600">
                        {DataAplikasi.length}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colorMode === "light" ? "secondary.600" : "secondary.300"}
                      >
                        Total Apps
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Active Applications */}
                <Card
                  bg={colorMode === "light" ? "green.50" : "green.900"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "green.200" : "green.700"
                  }
                  rounded="lg"
                >
                  <CardBody p={4} textAlign="center">
                    <VStack spacing={2}>
                      <Box
                        w={8}
                        h={8}
                        bg="green.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                      >
                        <Icon as={FiZap} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        {
                          DataAplikasi.filter(
                            (app) => app.appsStatus === "ACTIVE"
                          ).length
                        }
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          colorMode === "light" ? "green.600" : "green.300"
                        }
                      >
                        Active Apps
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Categories */}
                <Card
                  bg={colorMode === "light" ? "blue.50" : "blue.900"}
                  border="1px"
                  borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                  rounded="lg"
                >
                  <CardBody p={4} textAlign="center">
                    <VStack spacing={2}>
                      <Box
                        w={8}
                        h={8}
                        bg="blue.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                      >
                        <Icon as={FiGrid} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        4
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colorMode === "light" ? "blue.600" : "blue.300"}
                      >
                        Categories
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* System Health */}
                <Card
                  bg={colorMode === "light" ? "orange.50" : "orange.900"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "orange.200" : "orange.700"
                  }
                  rounded="lg"
                >
                  <CardBody p={4} textAlign="center">
                    <VStack spacing={2}>
                      <Box
                        w={8}
                        h={8}
                        bg="orange.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                      >
                        <Icon as={FiActivity} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="orange.600">
                        98%
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          colorMode === "light" ? "orange.600" : "orange.300"
                        }
                      >
                        System Health
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </Box>
          </Grid>
        </Box>
      </Box>
      {/* Enhanced Main Content */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <VStack spacing={{ base: 4, md: 6 }} w="full">
          {/* Applications Display Card */}
          <Card
            rounded={{ base: "lg", md: "xl" }}
            shadow={{ base: "md", md: "lg" }}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            w="full"
            minH={{ base: "300px", md: "400px" }}
          >
            <CardBody p={{ base: 4, sm: 5, md: 6 }}>
              <VStack spacing={{ base: 6, md: 8 }} w="full">
                {/* Header with Controls */}
                <Box w="full">
                  <VStack spacing={4} align="stretch">
                    <Flex
                      as={HStack}
                      justifyContent={"space-between"}
                      px={0}
                      w={"full"}
                    >
                      <Flex
                        as={HStack}
                        justifyContent={"left"}
                        px={0}
                        w={"full"}
                      >
                        <HStack spacing={3} align="center">
                          <Box
                            w={{ base: 8, md: 10 }}
                            h={{ base: 8, md: 10 }}
                            bg="secondary.500"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontSize={{ base: "sm", md: "md" }}
                            flexShrink={0}
                          >
                            <Icon
                              as={HiOutlineDesktopComputer}
                              boxSize={{ base: 4, md: 5 }}
                            />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Heading
                              size={"md"}
                              color={
                                colorMode === "light" ? "gray.800" : "white"
                              }
                              lineHeight="1.2"
                            >
                              Applications Management
                            </Heading>
                          </VStack>
                        </HStack>
                      </Flex>
                      <Flex
                        as={HStack}
                        justifyContent={"right"}
                        px={0}
                        w={"full"}
                      >
                        <Button
                          size={"md"}
                          leftIcon={<FiRefreshCcw />}
                          onClick={() => RefreshAction()}
                          isLoading={ActionLoading}
                        >
                          Refresh
                        </Button>
                        <Button
                          size={"md"}
                          colorScheme={"secondary"}
                          leftIcon={<FiPlusSquare />}
                          type={"submit"}
                          isLoading={ActionLoading}
                          onClick={() => {
                            // Add new aplikasi functionality here
                          }}
                        >
                          Add Application
                        </Button>
                      </Flex>
                    </Flex>

                    <Divider />
                  </VStack>
                </Box>

                {/* Search and Filter Controls */}
                <Flex
                  justify="space-between"
                  align={{ base: "start", sm: "center" }}
                  w="full"
                  direction={{ base: "column", sm: "row" }}
                  gap={{ base: 3, sm: 0 }}
                >
                  <HStack justify="space-between" align="center" w="full">
                    <HStack spacing={3} align="center">
                      <Box
                        w={{ base: 8, md: 10 }}
                        h={{ base: 8, md: 10 }}
                        bg="secondary.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize={{ base: "sm", md: "md" }}
                        flexShrink={0}
                      >
                        <Icon as={FiGrid} boxSize={{ base: 4, md: 5 }} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading
                          size={{ base: "sm", md: "md" }}
                          color={
                            colorMode === "light" ? "gray.800" : "white"
                          }
                          lineHeight="1.2"
                        >
                          My Applications
                        </Heading>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={
                            colorMode === "light" ? "gray.600" : "gray.400"
                          }
                          lineHeight="1.3"
                        >
                          {DataAplikasi.length} applications found
                          {globalFilter && (
                            <Text
                              as="span"
                              display={{ base: "block", sm: "inline" }}
                            >
                              {" "}
                              • Search: "{globalFilter}"
                            </Text>
                          )}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* View Mode Toggle & Controls */}
                    <HStack spacing={3}>
                      {DataAplikasi.length > 0 && (
                        <Badge
                          colorScheme="green"
                          px={{ base: 2, md: 3 }}
                          py={1}
                          rounded="full"
                          fontSize={{ base: "xs", md: "sm" }}
                          flexShrink={0}
                        >
                          {
                            DataAplikasi.filter(
                              (app) => app.appsStatus === "ACTIVE"
                            ).length
                          }{" "}
                          Active
                        </Badge>
                      )}

                      {/* Search Input */}
                      <InputGroup maxW={"250px"}>
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
                          rounded="lg"
                        />
                      </InputGroup>

                      {/* Category Filter */}
                      <Select
                        value={selectedKategori}
                        size={"md"}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                        maxW={"180px"}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                        rounded="lg"
                      >
                        <option value="all">All Categories</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="web">Web Application</option>
                        <option value="mobile">Mobile Application</option>
                        <option value="desktop">Desktop Application</option>
                      </Select>

                      {/* View Mode Toggle Buttons */}
                      <HStack
                        spacing={1}
                        bg={colorMode === "light" ? "gray.100" : "gray.700"}
                        rounded="lg"
                        p={1}
                      >
                        <Button
                          size="sm"
                          variant={viewMode === "grid" ? "solid" : "ghost"}
                          colorScheme={
                            viewMode === "grid" ? "secondary" : "gray"
                          }
                          onClick={() => setViewMode("grid")}
                          leftIcon={<Icon as={FiGrid} boxSize={3} />}
                          fontSize="xs"
                          px={3}
                          h={8}
                          _hover={{
                            bg:
                              viewMode === "grid"
                                ? "secondary.500"
                                : colorMode === "light"
                                ? "gray.200"
                                : "gray.600",
                          }}
                          transition="all 0.2s"
                        >
                          Grid
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === "list" ? "solid" : "ghost"}
                          colorScheme={
                            viewMode === "list" ? "secondary" : "gray"
                          }
                          onClick={() => setViewMode("list")}
                          leftIcon={<Icon as={FiList} boxSize={3} />}
                          fontSize="xs"
                          px={3}
                          h={8}
                          _hover={{
                            bg:
                              viewMode === "list"
                                ? "secondary.500"
                                : colorMode === "light"
                                ? "gray.200"
                                : "gray.600",
                          }}
                          transition="all 0.2s"
                        >
                          List
                        </Button>
                      </HStack>
                    </HStack>
                  </HStack>
                </Flex>

                {/* Applications Content */}
                <Box w="full">
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
                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case "ACTIVE": return "green";
                                case "INACTIVE": return "red";
                                default: return "gray";
                              }
                            };

                            return (
                              <Card
                                key={app.id}
                                w="full"
                                h="320px"
                                minH="320px"
                                maxH="320px"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                border="1px"
                                borderColor={
                                  colorMode === "light" ? "gray.200" : "gray.700"
                                }
                                rounded="2xl"
                                shadow="lg"
                                transition="all 0.3s ease"
                                _hover={{
                                  cursor: "pointer",
                                  shadow: "2xl",
                                  transform: "translateY(-4px)",
                                  borderColor: colorMode === "light" ? "secondary.300" : "secondary.600",
                                }}
                                overflow="hidden"
                                position="relative"
                                display="flex"
                                flexDirection="column"
                              >
                                {/* Status Color Bar */}
                                <Box
                                  position="absolute"
                                  top={0}
                                  left={0}
                                  right={0}
                                  h="4px"
                                  bgGradient={`linear(to-r, ${getStatusColor(app.appsStatus)}.400, ${getStatusColor(app.appsStatus)}.600)`}
                                />

                                {/* Header with App Icon */}
                                <CardHeader
                                  p={0}
                                  position="relative"
                                  bgGradient={"linear(to-br, secondary.700, secondary.400)"}
                                  color="white"
                                  h="140px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <VStack spacing={3} position="relative" zIndex={1}>
                                    <Box
                                      w={"50px"}
                                      h={"50px"}
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
                                      {app.appCode.slice(-3)}
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
                                </CardHeader>

                                {/* Card Body */}
                                <CardBody p={6} flex="1" display="flex" flexDirection="column">
                                  <VStack spacing={4} align="stretch" flex="1">
                                    {/* App Description */}
                                    <VStack spacing={2} align="start">
                                      <Text
                                        fontSize="sm"
                                        color={
                                          colorMode === "light"
                                            ? "gray.600"
                                            : "gray.400"
                                        }
                                        noOfLines={3}
                                        lineHeight="1.4"
                                        minH="60px"
                                      >
                                        {app.appsDesc || "No description available"}
                                      </Text>
                                    </VStack>

                                    {/* Status and Actions - Always at bottom */}
                                    <Box mt="auto">
                                      <VStack spacing={3}>
                                        <HStack justify="space-between" w="full">
                                          <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            fontWeight="medium"
                                          >
                                            Status
                                          </Text>
                                          <Badge
                                            colorScheme={getStatusColor(app.appsStatus)}
                                            px={2}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                          >
                                            {app.appsStatus}
                                          </Badge>
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
                                          onClick={() => {
                                            // Detail functionality here
                                          }}
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
                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case "ACTIVE": return "green";
                                case "INACTIVE": return "red";
                                default: return "gray";
                              }
                            };

                            return (
                              <Card
                                key={app.id}
                                rounded="xl"
                                shadow="lg"
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                _hover={{
                                  shadow: "2xl",
                                  borderColor: colorMode === "light" ? "secondary.300" : "secondary.600",
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
                                  bgGradient={`linear(to-r, ${getStatusColor(app.appStatus)}.400, ${getStatusColor(app.appStatus)}.600)`}
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
                                        w={16}
                                        h={16}
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
                                        {app.appCode.slice(-3)}
                                      </Box>
                                    </GridItem>

                                    {/* Enhanced App Details */}
                                    <GridItem>
                                      <VStack align="start" spacing={3}>
                                        <VStack align="start" spacing={1}>
                                          <HStack spacing={2} align="center">
                                            <Heading
                                              size="md"
                                              color={colorMode === "light" ? "gray.800" : "white"}
                                              fontWeight="bold"
                                            >
                                              {app.appName}
                                            </Heading>
                                            <Badge
                                              colorScheme={getStatusColor(app.appStatus)}
                                              px={3}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                              fontWeight="bold"
                                              textTransform="uppercase"
                                            >
                                              {app.appStatus}
                                            </Badge>
                                          </HStack>
                                          
                                          <Text
                                            fontSize="sm"
                                            color={colorMode === "light" ? "gray.600" : "gray.400"}
                                            fontWeight="medium"
                                          >
                                            #{app.appCode} • Application System
                                          </Text>
                                          
                                          <Text
                                            fontSize="sm"
                                            color={colorMode === "light" ? "gray.500" : "gray.500"}
                                            noOfLines={2}
                                            lineHeight="1.4"
                                          >
                                            {app.appDesc}
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
                                            <Icon as={HiOutlineDesktopComputer} w={3} h={3} mr={1} />
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
                                            <Icon as={FiSettings} w={3} h={3} mr={1} />
                                            Configurable
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </GridItem>

                                    {/* App Type */}
                                    <GridItem display={{ base: "none", lg: "block" }}>
                                      <VStack spacing={2} align="center">
                                        <Text
                                          fontSize="xs"
                                          color={colorMode === "light" ? "gray.500" : "gray.400"}
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
                                    <GridItem display={{ base: "none", md: "block" }}>
                                      <VStack spacing={3} align="center" minW="120px">
                                        <VStack spacing={1} align="center">
                                          <Text
                                            fontSize="xs"
                                            color={colorMode === "light" ? "gray.500" : "gray.400"}
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                          >
                                            Health
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color={app.appStatus === "ACTIVE" ? "green.500" : "red.500"}
                                          >
                                            {app.appStatus === "ACTIVE" ? "98%" : "0%"}
                                          </Text>
                                        </VStack>
                                        <Box w="80px" position="relative">
                                          <Box
                                            w="full"
                                            h="8px"
                                            bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                            rounded="full"
                                            overflow="hidden"
                                          >
                                            <Box
                                              h="full"
                                              bgGradient={app.appStatus === "ACTIVE" ? "linear(to-r, green.400, green.600)" : "linear(to-r, red.400, red.600)"}
                                              rounded="full"
                                              w={app.appStatus === "ACTIVE" ? "98%" : "0%"}
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
                                          leftIcon={<Icon as={FiSettings} boxSize={3} />}
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
                                            bgGradient: "linear(to-r, secondary.600, secondary.700)",
                                          }}
                                          onClick={() => {
                                            // Detail functionality here
                                          }}
                                        >
                                          Configure
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          colorScheme="secondary"
                                          leftIcon={<Icon as={FiCode} boxSize={3} />}
                                          rounded="lg"
                                          _hover={{
                                            transform: "translateY(-1px)",
                                            shadow: "md",
                                            bg: "secondary.50",
                                          }}
                                          transition="all 0.2s"
                                          fontWeight="medium"
                                          px={4}
                                          onClick={() => {
                                            // Detail functionality here
                                          }}
                                        >
                                          Details
                                        </Button>
                                      </VStack>
                                    </GridItem>
                                  </Grid>

                                  {/* Mobile Enhanced Layout */}
                                  <Box display={{ base: "block", md: "none" }} mt={4} pt={4} borderTop="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                                    <Grid templateColumns="1fr 1fr" gap={4}>
                                      {/* Mobile Health */}
                                      <VStack spacing={2} align="start">
                                        <Text
                                          fontSize="xs"
                                          color={colorMode === "light" ? "gray.500" : "gray.400"}
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
                                            color={app.appStatus === "ACTIVE" ? "green.500" : "red.500"}
                                          >
                                            {app.appStatus === "ACTIVE" ? "98%" : "0%"}
                                          </Text>
                                          <Box flex={1} maxW="60px">
                                            <Box
                                              w="full"
                                              h="6px"
                                              bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                              rounded="full"
                                              overflow="hidden"
                                            >
                                              <Box
                                                h="full"
                                                bgGradient={app.appStatus === "ACTIVE" ? "linear(to-r, green.400, green.600)" : "linear(to-r, red.400, red.600)"}
                                                rounded="full"
                                                w={app.appStatus === "ACTIVE" ? "98%" : "0%"}
                                              />
                                            </Box>
                                          </Box>
                                        </HStack>
                                      </VStack>

                                      {/* Mobile Type */}
                                      <VStack spacing={2} align="start">
                                        <Text
                                          fontSize="xs"
                                          color={colorMode === "light" ? "gray.500" : "gray.400"}
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
                                    <HStack spacing={3} mt={4} justify="stretch">
                                      <Button
                                        size="sm"
                                        colorScheme="secondary"
                                        leftIcon={<Icon as={FiSettings} boxSize={3} />}
                                        rounded="lg"
                                        flex={1}
                                        fontWeight="bold"
                                        bgGradient="linear(to-r, secondary.500, secondary.600)"
                                        onClick={() => {
                                          // Detail functionality here
                                        }}
                                      >
                                        Configure
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="secondary"
                                        leftIcon={<Icon as={FiCode} boxSize={3} />}
                                        rounded="lg"
                                        flex={1}
                                        fontWeight="medium"
                                        onClick={() => {
                                          // Detail functionality here
                                        }}
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
        </VStack>
      </Box>
    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
