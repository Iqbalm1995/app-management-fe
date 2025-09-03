"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorMode,
  VStack,
  Icon,
  Divider,
} from "@chakra-ui/react";
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTarget,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiZap,
  FiFolder,
  FiX,
  FiMonitor,
  FiClipboard,
  FiGrid,
  FiList,
} from "react-icons/fi";
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
import { Search2Icon } from "@chakra-ui/icons";
import { FiRefreshCcw } from "react-icons/fi";

// Components
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentFullHeadlessGrid,
  ControlTable,
} from "@/app/components/tableComponents";

// Services and Hooks
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";

// Constants and Types
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_STATUS_LIST,
} from "@/app/constants/applicationConstants";
import {
  PaggingListPayloadCustom,
  ListSearchByParam,
} from "@/app/types/masterTypes";

// Local Components
import CardProject from "@/app/components/CardProject";

const HeaderDataContent: HeaderContentProps = {
  titleName: "My Project",
  breadCrumb: ["Home", "My Project"],
};

const ProjectManagerPage = memo(() => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { List } = useProjects();

  // Auth state
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data state
  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Table state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // New status filter state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // View mode state

  // Memoized values
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Auth setup effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []); // Empty dependency array - run only once on mount

  // Data fetching effect
  useEffect(() => {
    setIsEditMode(false);
    // if (DataAuth && DataAuth.team) {
    if (DataAuth) {
      // Build filter conditions
      const filterWhere: ListSearchByParam[] = [];

      // Add status filter if selected
      if (statusFilter) {
        filterWhere.push({
          field: "projectStatus",
          operator: "=",
          value: statusFilter,
        });
      }

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        // teamId: DataAuth.team.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhere,
        fieldOrder: ["createdAt"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        try {
          const requestData = await List(PayloadList, tokenData);
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

          const itemsData: ProjectDataResponse[] =
            requestData.data as ProjectDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;

          setDataProjects(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showToast({
            description: "Failed to fetch projects",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
        }
      };

      GetDataList();
    }
  }, [
    DataAuth,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    statusFilter,
    tokenData,
  ]);

  // Table configuration
  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.projectCode,
        id: "projectCode",
        cell: (info) => (
          <CardProject
            data={info.row.original}
            key={info.row.original.projectCode}
          />
        ),
        header: () => <span>Projects</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  const table = useReactTable({
    data: DataProjects,
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

  // Event handlers
  const RefreshAction = useCallback(() => {
    setTotalPageData(0);
    setDataProjects([]);
    setRefreshData(RefreshData + 1);
  }, [RefreshData]);

  // Status filter handler
  const handleStatusFilter = useCallback(
    (status: string) => {
      setStatusFilter(status === statusFilter ? "" : status); // Toggle filter
      setPagination({ pageIndex: 0, pageSize }); // Reset to first page
    },
    [statusFilter, pageSize]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setStatusFilter("");
    setPagination({ pageIndex: 0, pageSize });
  }, [pageSize]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Modern Header Section */}
      <Box
        bg={colorMode === "light" ? "white" : "gray.800"}
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        rounded="xl"
        shadow="xl"
        px={2}
        mx={{ base: 4, sm: 5, md: 6 }}
        // mx={{ base: 2, md: 4 }}
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
                  <Icon as={FiMonitor} boxSize={6} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading
                    size="xl"
                    color={colorMode === "light" ? "gray.800" : "white"}
                    fontWeight="bold"
                  >
                    My Project Hub
                  </Heading>
                  <Text
                    fontSize="md"
                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                    fontWeight="medium"
                  >
                    Manage your projects and track progress
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
                  <Icon as={FiTarget} w={3} h={3} mr={2} />
                  Project Tracking
                </Badge>
                <Badge
                  colorScheme="blue"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Icon as={FiUsers} w={3} h={3} mr={2} />
                  Team Collaboration
                </Badge>
                <Badge
                  colorScheme="green"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Icon as={FiBarChart2} w={3} h={3} mr={2} />
                  Progress Analytics
                </Badge>
              </HStack>
            </VStack>

            {/* Right Content - Stats Grid */}
            <Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={3} minW="260px">
                {/* Total Projects */}
                <Card
                  bg={colorMode === "light" ? "secondary.50" : "secondary.900"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "secondary.200" : "secondary.700"
                  }
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
                        <Icon as={FiFolder} boxSize={4} />
                      </Box>
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="secondary.600"
                      >
                        {DataProjects.length}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          colorMode === "light"
                            ? "secondary.600"
                            : "secondary.300"
                        }
                      >
                        Total Projects
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Active Projects */}
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
                          DataProjects.filter(
                            (p) => p.projectStatus === "ACTIVE"
                          ).length
                        }
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          colorMode === "light" ? "green.600" : "green.300"
                        }
                      >
                        Active Projects
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Average Progress */}
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
                        <Icon as={FiTrendingUp} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        {Math.round(
                          DataProjects.reduce(
                            (acc, p) => acc + p.projectStatusPercentage,
                            0
                          ) / (DataProjects.length || 1)
                        )}
                        %
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colorMode === "light" ? "blue.600" : "blue.300"}
                      >
                        Avg Progress
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Team Count */}
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
                        <Icon as={FiUsers} boxSize={4} />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="orange.600">
                        {DataAuth?.team ? 1 : 0}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={
                          colorMode === "light" ? "orange.600" : "orange.300"
                        }
                      >
                        Active Teams
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* Enhanced Main Content - Grid Layout with Sidebar */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <Grid
          templateColumns="repeat(12, 1fr)"
          // gap={{ base: 4, lg: 6 }}
          w="full"
          gap={5}
        >
          {/* Sidebar - Search & Filters */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
            <VStack spacing={4} align="stretch">
              {/* Project Search Card */}
              <Card
                rounded="xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={5}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3} align="center">
                      <Box
                        w={10}
                        h={10}
                        bg="blue.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                        flexShrink={0}
                      >
                        <Icon as={FiSearch} boxSize={5} />
                      </Box>
                      <Heading
                        size="md"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        lineHeight="1.2"
                      >
                        Project Search
                      </Heading>
                    </HStack>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="full">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        placeholder="Search projects..."
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        border="2px"
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.600"
                        }
                        _focus={{
                          borderColor:
                            colorMode === "light" ? "blue.400" : "blue.300",
                          bg: colorMode === "light" ? "white" : "gray.600",
                        }}
                        _hover={{
                          borderColor:
                            colorMode === "light" ? "gray.300" : "gray.500",
                        }}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        value={globalFilter}
                        size="md"
                        rounded="lg"
                        fontSize="sm"
                      />
                    </InputGroup>
                  </VStack>
                </CardBody>
              </Card>

              {/* Status Filters Card */}
              <Card
                rounded="xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={5}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3} align="center">
                      <Box
                        w={10}
                        h={10}
                        bg="blue.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                        flexShrink={0}
                      >
                        <Icon as={FiFilter} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading
                          size="md"
                          color={colorMode === "light" ? "gray.800" : "white"}
                          lineHeight="1.2"
                        >
                          Status Filters
                        </Heading>
                        <Text
                          fontSize="xs"
                          color={
                            colorMode === "light" ? "gray.600" : "gray.400"
                          }
                        >
                          Filter by project status
                          {statusFilter && ` • ${statusFilter}`}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Filter Tags */}
                    <Box>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        mb={3}
                        fontWeight="medium"
                      >
                        Quick Filters
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {/* All Projects Tag */}
                        <Button
                          size="sm"
                          variant={!statusFilter ? "solid" : "ghost"}
                          colorScheme={!statusFilter ? "blue" : "gray"}
                          onClick={() => setStatusFilter("")}
                          rounded="full"
                          fontSize="xs"
                          px={3}
                          h={8}
                          _hover={{
                            transform: "translateY(-1px)",
                            shadow: "sm",
                          }}
                          transition="all 0.2s"
                        >
                          All
                          <Badge
                            ml={1}
                            colorScheme={!statusFilter ? "white" : "gray"}
                            color={!statusFilter ? "blue.600" : "gray.600"}
                            rounded="full"
                            fontSize="xs"
                            px={1}
                          >
                            {DataProjects.length}
                          </Badge>
                        </Button>

                        {/* Status Filter Tags */}
                        {PROJECT_STATUS_LIST.map((status) => {
                          const isActive = statusFilter === status;
                          const projectCount = DataProjects.filter(
                            (p) => p.projectStatus === status
                          ).length;

                          return (
                            <Button
                              key={status}
                              size="sm"
                              variant={isActive ? "solid" : "outline"}
                              colorScheme={
                                status === "ACTIVE"
                                  ? "green"
                                  : status === "COMPLETED"
                                  ? "blue"
                                  : status === "ONHOLD"
                                  ? "orange"
                                  : "gray"
                              }
                              onClick={() => handleStatusFilter(status)}
                              rounded="full"
                              fontSize="xs"
                              px={3}
                              h={8}
                              _hover={{
                                transform: "translateY(-1px)",
                                shadow: "sm",
                              }}
                              transition="all 0.2s"
                            >
                              {status}
                              <Badge
                                ml={1}
                                colorScheme={isActive ? "white" : "gray"}
                                color={
                                  isActive
                                    ? status === "ACTIVE"
                                      ? "green.600"
                                      : status === "COMPLETED"
                                      ? "blue.600"
                                      : status === "ONHOLD"
                                      ? "orange.600"
                                      : "red.600"
                                    : "gray.600"
                                }
                                rounded="full"
                                fontSize="xs"
                                px={1}
                              >
                                {projectCount}
                              </Badge>
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>

                    {/* Clear Filters Button */}
                    {(statusFilter || globalFilter) && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={clearAllFilters}
                        leftIcon={<Icon as={FiX} />}
                        rounded="lg"
                        fontSize="sm"
                        _hover={{
                          bg: "red.50",
                          transform: "translateY(-1px)",
                          shadow: "sm",
                        }}
                        transition="all 0.2s"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Project Stats Card */}
              <Card
                rounded="xl"
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={5}>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3} align="center">
                      <Box
                        w={10}
                        h={10}
                        bg="purple.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="md"
                        flexShrink={0}
                      >
                        <Icon as={FiBarChart2} boxSize={5} />
                      </Box>
                      <Heading
                        size="md"
                        color={colorMode === "light" ? "gray.800" : "white"}
                        lineHeight="1.2"
                      >
                        Quick Stats
                      </Heading>
                    </HStack>

                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Total Projects
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.500">
                          {DataProjects.length}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Active
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">
                          {
                            DataProjects.filter(
                              (p) => p.projectStatus === "ACTIVE"
                            ).length
                          }
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Completed
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.500">
                          {
                            DataProjects.filter(
                              (p) => p.projectStatus === "COMPLETED"
                            ).length
                          }
                        </Text>
                      </HStack>
                      {(globalFilter || statusFilter) && (
                        <>
                          <Divider />
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">
                              Filtered Results
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="purple.500"
                            >
                              {table.getRowModel().rows.length}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          <GridItem colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }} w={"full"}>
            {/* Main Content Area */}
            <VStack spacing={{ base: 4, md: 6 }} w="full">
              {/* Mobile Search & Filters - Show only on mobile */}
              <Box display={{ base: "block", lg: "none" }} w="full">
                <VStack spacing={3} align="stretch">
                  {/* Mobile Search */}
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" h="full">
                      <Search2Icon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="Search projects..."
                      bg={colorMode === "light" ? "gray.50" : "gray.700"}
                      border="2px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.600"
                      }
                      _focus={{
                        borderColor:
                          colorMode === "light" ? "blue.400" : "blue.300",
                        bg: colorMode === "light" ? "white" : "gray.600",
                      }}
                      _hover={{
                        borderColor:
                          colorMode === "light" ? "gray.300" : "gray.500",
                      }}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      value={globalFilter}
                      size="md"
                      rounded="lg"
                      fontSize="sm"
                    />
                  </InputGroup>

                  {/* Mobile Status Filters */}
                  <Flex wrap="wrap" gap={2}>
                    <Button
                      size="xs"
                      variant={!statusFilter ? "solid" : "ghost"}
                      colorScheme={!statusFilter ? "blue" : "gray"}
                      onClick={() => setStatusFilter("")}
                      rounded="full"
                      fontSize="xs"
                      px={3}
                      h={7}
                    >
                      All ({DataProjects.length})
                    </Button>
                    {PROJECT_STATUS_LIST.map((status) => {
                      const isActive = statusFilter === status;
                      const projectCount = DataProjects.filter(
                        (p) => p.projectStatus === status
                      ).length;

                      return (
                        <Button
                          key={status}
                          size="xs"
                          variant={isActive ? "solid" : "outline"}
                          colorScheme={
                            status === "ACTIVE"
                              ? "green"
                              : status === "COMPLETED"
                              ? "blue"
                              : status === "ONHOLD"
                              ? "orange"
                              : "red"
                          }
                          onClick={() => handleStatusFilter(status)}
                          rounded="full"
                          fontSize="xs"
                          px={3}
                          h={7}
                        >
                          {status} ({projectCount})
                        </Button>
                      );
                    })}
                  </Flex>

                  {/* Mobile Clear Filters */}
                  {(statusFilter || globalFilter) && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={clearAllFilters}
                      leftIcon={<Icon as={FiX} />}
                      rounded="lg"
                      fontSize="sm"
                      w="fit-content"
                    >
                      Clear Filters
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* Projects Display Card */}
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
                    {/* Last Working Projects Section */}
                    {DataProjects.length > 0 && !IsLoadingProcess && (
                      <Box w="full">
                        <VStack spacing={4} align="stretch">
                          {/* Section Header */}
                          <HStack spacing={3} align="center">
                            <Box
                              w={{ base: 8, md: 10 }}
                              h={{ base: 8, md: 10 }}
                              bg="purple.500"
                              rounded="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontSize={{ base: "sm", md: "md" }}
                              flexShrink={0}
                            >
                              <Icon as={FiZap} boxSize={{ base: 4, md: 5 }} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading
                                size={{ base: "sm", md: "md" }}
                                color={
                                  colorMode === "light" ? "gray.800" : "white"
                                }
                                lineHeight="1.2"
                              >
                                Last Working Projects
                              </Heading>
                              <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color={
                                  colorMode === "light"
                                    ? "gray.600"
                                    : "gray.400"
                                }
                                lineHeight="1.3"
                              >
                                Recently active projects you've been working on
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Last Working Projects List */}
                          <VStack
                            spacing={0}
                            align="stretch"
                            divider={<Divider />}
                          >
                            {DataProjects.slice(0, 3).map((project, index) => (
                              <HStack
                                key={`recent-${project.id}`}
                                spacing={4}
                                align="center"
                                py={3}
                                px={2}
                                _hover={{
                                  bg:
                                    colorMode === "light"
                                      ? "gray.50"
                                      : "gray.700",
                                }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() =>
                                  (window.location.href = `project-development/development?projectId=${project.id}`)
                                }
                              >
                                {/* Project Number */}
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="purple.500"
                                  minW="20px"
                                  textAlign="center"
                                >
                                  {index + 1}.
                                </Text>

                                {/* Project Info */}
                                <VStack align="start" spacing={0} flex={1}>
                                  <HStack spacing={2} align="center">
                                    <Text
                                      fontSize="sm"
                                      fontWeight="bold"
                                      color={
                                        colorMode === "light"
                                          ? "gray.800"
                                          : "white"
                                      }
                                    >
                                      {project.projectName}
                                    </Text>
                                    <Badge
                                      colorScheme="purple"
                                      size="sm"
                                      variant="subtle"
                                    >
                                      {project.projectCategory}
                                    </Badge>
                                  </HStack>
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "light"
                                        ? "gray.500"
                                        : "gray.400"
                                    }
                                    noOfLines={1}
                                  >
                                    {project.projectNo} |{" "}
                                    {project.appsProject.appName}
                                  </Text>
                                </VStack>

                                {/* Progress */}
                                <HStack spacing={2} align="center" minW="60px">
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color="orange.600"
                                  >
                                    {project.projectStatusPercentage}%
                                  </Text>
                                  <Icon
                                    as={FiTarget}
                                    boxSize={4}
                                    color="purple.500"
                                  />
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        </VStack>
                      </Box>
                    )}

                    {/* Projects Header */}
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
                            bg="blue.500"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontSize={{ base: "sm", md: "md" }}
                            flexShrink={0}
                          >
                            <Icon
                              as={FiClipboard}
                              boxSize={{ base: 4, md: 5 }}
                            />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Heading
                              size={{ base: "sm", md: "md" }}
                              color={
                                colorMode === "light" ? "gray.800" : "white"
                              }
                              lineHeight="1.2"
                            >
                              My Projects
                            </Heading>
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              color={
                                colorMode === "light" ? "gray.600" : "gray.400"
                              }
                              lineHeight="1.3"
                            >
                              {DataProjects.length} projects found
                              {statusFilter && (
                                <Text
                                  as="span"
                                  color="blue.500"
                                  fontWeight="medium"
                                >
                                  {" "}
                                  • Status: {statusFilter}
                                </Text>
                              )}
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

                        {/* View Mode Toggle & Active Badge */}
                        <HStack spacing={3}>
                          {DataProjects.length > 0 && (
                            <Badge
                              colorScheme="green"
                              px={{ base: 2, md: 3 }}
                              py={1}
                              rounded="full"
                              fontSize={{ base: "xs", md: "sm" }}
                              flexShrink={0}
                            >
                              {
                                DataProjects.filter(
                                  (p) => p.projectStatus === "ACTIVE"
                                ).length
                              }{" "}
                              Active
                            </Badge>
                          )}

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
                                viewMode === "grid" ? "blue" : "gray"
                              }
                              onClick={() => setViewMode("grid")}
                              leftIcon={<Icon as={FiGrid} boxSize={3} />}
                              fontSize="xs"
                              px={3}
                              h={8}
                              _hover={{
                                bg:
                                  viewMode === "grid"
                                    ? "blue.500"
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
                                viewMode === "list" ? "blue" : "gray"
                              }
                              onClick={() => setViewMode("list")}
                              leftIcon={<Icon as={FiList} boxSize={3} />}
                              fontSize="xs"
                              px={3}
                              h={8}
                              _hover={{
                                bg:
                                  viewMode === "list"
                                    ? "blue.500"
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

                    {/* Projects Content */}
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
                              Loading My Projects
                            </Text>
                            <Text
                              color="gray.400"
                              fontSize={{ base: "xs", md: "sm" }}
                              textAlign="center"
                              px={{ base: 4, md: 0 }}
                            >
                              Please wait while we fetch your projects...
                            </Text>
                          </VStack>
                        </VStack>
                      ) : DataProjects.length === 0 ? (
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
                              as={FiFolder}
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
                              {globalFilter || statusFilter
                                ? "No Projects Found"
                                : "No Projects"}
                            </Heading>
                            <Text
                              color="gray.500"
                              maxW={{ base: "300px", md: "500px" }}
                              lineHeight="1.6"
                              fontSize={{ base: "sm", md: "md" }}
                              px={{ base: 4, md: 0 }}
                              textAlign="center"
                            >
                              {globalFilter || statusFilter
                                ? `No projects match your current filters${
                                    globalFilter
                                      ? ` (search: "${globalFilter}")`
                                      : ""
                                  }${
                                    statusFilter
                                      ? ` (status: ${statusFilter})`
                                      : ""
                                  }. Try adjusting your filters or clearing them.`
                                : "You don't have any projects yet. Projects will appear here once they are created and assigned to your team."}
                            </Text>
                          </VStack>
                          {(globalFilter || statusFilter) && (
                            <Button
                              variant="outline"
                              colorScheme="gray"
                              onClick={clearAllFilters}
                              rounded="lg"
                              size={{ base: "sm", md: "md" }}
                              fontSize={{ base: "sm", md: "md" }}
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </VStack>
                      ) : (
                        <>
                          {/* Grid View */}
                          <Box display={viewMode === "grid" ? "block" : "none"}>
                            <TableComponentFullHeadlessGrid table={table} />
                          </Box>

                          {/* List View */}
                          <Box display={viewMode === "list" ? "block" : "none"}>
                            <VStack spacing={3} align="stretch">
                              {table.getRowModel().rows.map((row) => {
                                const project = row.original;
                                return (
                                  <Card
                                    key={project.id}
                                    rounded="lg"
                                    shadow="sm"
                                    border="1px"
                                    borderColor={
                                      colorMode === "light"
                                        ? "gray.200"
                                        : "gray.700"
                                    }
                                    bg={
                                      colorMode === "light"
                                        ? "white"
                                        : "gray.800"
                                    }
                                    _hover={{
                                      shadow: "md",
                                      borderColor:
                                        colorMode === "light"
                                          ? "blue.300"
                                          : "blue.600",
                                      transform: "translateY(-1px)",
                                    }}
                                    transition="all 0.2s"
                                  >
                                    <CardBody p={4}>
                                      <Grid
                                        templateColumns={{
                                          base: "1fr",
                                          md: "1fr auto auto auto",
                                        }}
                                        gap={4}
                                        alignItems="center"
                                      >
                                        {/* Project Info */}
                                        <GridItem>
                                          <HStack spacing={3}>
                                            {/* Project Avatar */}
                                            <Box
                                              w={12}
                                              h={12}
                                              bg="blue.500"
                                              rounded="lg"
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="center"
                                              color="white"
                                              fontSize="lg"
                                              fontWeight="bold"
                                              flexShrink={0}
                                            >
                                              {project.appsProject?.appName?.charAt(
                                                0
                                              ) ||
                                                project.projectName.charAt(0)}
                                            </Box>

                                            {/* Project Details */}
                                            <VStack align="start" spacing={1}>
                                              <Heading
                                                size="sm"
                                                color={
                                                  colorMode === "light"
                                                    ? "gray.800"
                                                    : "white"
                                                }
                                              >
                                                {project.projectName}
                                              </Heading>
                                              <Text
                                                fontSize="sm"
                                                color={
                                                  colorMode === "light"
                                                    ? "gray.600"
                                                    : "gray.400"
                                                }
                                              >
                                                {project.projectDesc ||
                                                  "No description available"}
                                              </Text>
                                              <HStack spacing={2}>
                                                <Badge
                                                  colorScheme="blue"
                                                  size="sm"
                                                >
                                                  {project.projectType}
                                                </Badge>
                                                <Badge
                                                  colorScheme="purple"
                                                  size="sm"
                                                >
                                                  {project.projectCategory}
                                                </Badge>
                                              </HStack>
                                            </VStack>
                                          </HStack>
                                        </GridItem>

                                        {/* Status */}
                                        <GridItem
                                          display={{
                                            base: "none",
                                            md: "block",
                                          }}
                                        >
                                          <VStack spacing={1}>
                                            <Badge
                                              colorScheme={
                                                project.projectStatus ===
                                                "ACTIVE"
                                                  ? "green"
                                                  : project.projectStatus ===
                                                    "ONHOLD"
                                                  ? "orange"
                                                  : "red"
                                              }
                                              px={3}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                            >
                                              {project.projectStatus}
                                            </Badge>
                                          </VStack>
                                        </GridItem>

                                        {/* Progress */}
                                        <GridItem
                                          display={{
                                            base: "none",
                                            md: "block",
                                          }}
                                        >
                                          <VStack spacing={1} align="center">
                                            <Text
                                              fontSize="sm"
                                              fontWeight="bold"
                                              color="blue.600"
                                            >
                                              {project.projectStatusPercentage}%
                                            </Text>
                                            <Box
                                              w="60px"
                                              bg="gray.200"
                                              rounded="full"
                                              h="6px"
                                            >
                                              <Box
                                                bg="blue.500"
                                                h="6px"
                                                rounded="full"
                                                w={`${project.projectStatusPercentage}%`}
                                              />
                                            </Box>
                                          </VStack>
                                        </GridItem>

                                        {/* Action Button */}
                                        <GridItem>
                                          <Link
                                            href={`project-development/development?projectId=${project.id}`}
                                          >
                                            <Button
                                              size="sm"
                                              colorScheme="secondary"
                                              leftIcon={
                                                <Icon
                                                  as={FiTarget}
                                                  boxSize={3}
                                                />
                                              }
                                              rounded="lg"
                                              _hover={{
                                                transform: "translateY(-1px)",
                                                shadow: "md",
                                              }}
                                              transition="all 0.2s"
                                              fontWeight="bold"
                                              bgGradient="linear(to-r, secondary.500, blue.500)"
                                              _active={{
                                                bgGradient:
                                                  "linear(to-r, secondary.600, blue.600)",
                                              }}
                                            >
                                              Start Development
                                            </Button>
                                          </Link>
                                        </GridItem>
                                      </Grid>

                                      {/* Mobile Status & Progress */}
                                      <Box
                                        display={{ base: "block", md: "none" }}
                                        mt={3}
                                        pt={3}
                                        borderTop="1px"
                                        borderColor={
                                          colorMode === "light"
                                            ? "gray.200"
                                            : "gray.700"
                                        }
                                      >
                                        <HStack justify="space-between">
                                          <HStack spacing={2}>
                                            <Badge
                                              colorScheme={
                                                project.projectStatus ===
                                                "ACTIVE"
                                                  ? "green"
                                                  : project.projectStatus ===
                                                    "ONHOLD"
                                                  ? "orange"
                                                  : "red"
                                              }
                                              px={2}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                            >
                                              {project.projectStatus}
                                            </Badge>
                                          </HStack>
                                          <HStack spacing={2}>
                                            <Text
                                              fontSize="sm"
                                              fontWeight="bold"
                                              color="blue.600"
                                            >
                                              {project.projectStatusPercentage}%
                                            </Text>
                                            <Box
                                              w="40px"
                                              bg="gray.200"
                                              rounded="full"
                                              h="4px"
                                            >
                                              <Box
                                                bg="blue.500"
                                                h="4px"
                                                rounded="full"
                                                w={`${project.projectStatusPercentage}%`}
                                              />
                                            </Box>
                                          </HStack>
                                        </HStack>
                                      </Box>
                                    </CardBody>
                                  </Card>
                                );
                              })}
                            </VStack>

                            {/* Pagination Controls for List View */}
                            <Flex w="full" px={5} mt={6}>
                              <ControlTable table={table} />
                            </Flex>
                          </Box>
                        </>
                      )}
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
});

ProjectManagerPage.displayName = "ProjectManagerPage";

export default ProjectManagerPage;
