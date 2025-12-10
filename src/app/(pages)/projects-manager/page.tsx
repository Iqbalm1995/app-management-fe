"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlusSquare,
  FiArrowRightCircle,
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
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useWorkspace from "@/app/services/useWorkspace";
import { ProjectDataResponse } from "@/app/services/useProjects";

// Constants and Types
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
} from "@/app/constants/applicationConstants";
import {
  PROJECT_STATUSES,
  PRO_STATUS_RUNNING,
} from "@/app/constants/masterStatusConstants";
import { StatusBadge } from "@/app/components/StatusBadge";
import {
  PaggingListPayloadCustom,
  ListSearchByParam,
} from "@/app/types/masterTypes";

// Local Components
import CardProject from "@/app/components/CardProject";
import ManagerSidebar from "./components/ManagerSidebar";
import ModalRegisterProject from "./components/ModalRegisterProject";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Projects Manager",
  breadCrumb: ["Home", "Projects Manager"],
};

const ProjectManagerPage = () => {
  useDocumentTitle("Projects Manager");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { GetAssignedProjects } = useWorkspace();

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
  const [statusFilter, setStatusFilter] = useState<string[]>([]); // Fixed: array instead of string
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
      if (statusFilter.length > 0) {
        statusFilter.forEach((status: string) => {
          filterWhere.push({
            field: "projectStatus",
            operator: "=",
            value: status, // Handle each status filter
          });
        });
      }

      filterWhere.push({
        field: "projectType",
        operator: "=",
        value: PROJECT_TYPE_INTERNAL_DEVELOPMENT,
      });

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        // teamId: DataAuth.team.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhere,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        try {
          const requestData = await GetAssignedProjects(PayloadList, tokenData);
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
            variant="manager"
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
      if (statusFilter.includes(status)) {
        setStatusFilter(statusFilter.filter((s) => s !== status));
      } else {
        setStatusFilter([...statusFilter, status]);
      } // Toggle filter
      setPagination({ pageIndex: 0, pageSize }); // Reset to first page
    },
    [statusFilter, pageSize]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setStatusFilter([]);
    setPagination({ pageIndex: 0, pageSize });
  }, [pageSize]);

  const ModalForm = useDisclosure();


  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Modern Abstract Project Manager Header */}
      <Box
        position="relative"
        bgColor={colorMode == "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="2xl"
        mx={{ base: 4, sm: 5, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        overflow="hidden"
        h={{ base: "160px", md: "180px" }}
      >
        {/* Abstract Geometric Shapes */}
        <Box
          position="absolute"
          top="-20px"
          right="20px"
          w="80px"
          h="80px"
          bg={colorMode == "light" ? "secondary.100" : "whiteAlpha.200"}
          rounded="full"
        />
        <Box
          position="absolute"
          bottom="-10px"
          left="30px"
          w="60px"
          h="60px"
          bg={colorMode == "light" ? "secondary.200" : "whiteAlpha.300"}
          transform="rotate(45deg)"
        />
        <Box
          position="absolute"
          top="30px"
          left="60%"
          w="40px"
          h="40px"
          bg={colorMode == "light" ? "secondary.100" : "whiteAlpha.200"}
          rounded="md"
          transform="rotate(30deg)"
        />

        <VStack
          h="full"
          justify="center"
          align="stretch"
          px={{ base: 6, md: 8 }}
          py={4}
          position="relative"
          zIndex={1}
          spacing={4}
        >
          {/* Top Row */}
          <Flex justify="space-between" align="center">
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
                borderColor={
                  colorMode == "light" ? "blackAlpha.100" : "whiteAlpha.200"
                }
              >
                <Icon as={FiSettings} boxSize={6} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading
                  size="lg"
                  color={colorMode == "light" ? "gray.900" : "white"}
                  fontWeight="700"
                  letterSpacing="tight"
                >
                  Projects Management Hub
                </Heading>
                <Text
                  fontSize="sm"
                  color={colorMode == "light" ? "gray.500" : "white"}
                  fontWeight="500"
                >
                  Oversee and manage all team projects
                </Text>
              </VStack>
            </HStack>

            {/* Quick Stats */}
            <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode == "light" ? "gray.900" : "white"}
                >
                  {DataProjects.length}
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode == "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Projects
                </Text>
              </VStack>
              <Box
                w="1px"
                h="40px"
                bg={colorMode == "light" ? "blackAlpha.500" : "whiteAlpha.500"}
              />
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode == "light" ? "gray.900" : "white"}
                >
                  {
                    DataProjects.filter(
                      (p) => p.projectStatus === PRO_STATUS_RUNNING
                    ).length
                  }
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode == "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Active
                </Text>
              </VStack>
              <Box w="1px" h="40px" bg="blackAlpha.300" />
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode == "light" ? "gray.900" : "white"}
                >
                  {Math.round(
                    DataProjects.reduce(
                      (acc, p) => acc + p.projectStatusPercentage,
                      0
                    ) / (DataProjects.length || 1)
                  )}%
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode == "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Avg Progress
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Enhanced Main Content - Grid Layout with Sidebar */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <Grid
          templateColumns="repeat(12, 1fr)"
          w="full"
          gap={5}
        >
          {/* Enhanced Manager Sidebar */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w={"full"}>
            <ManagerSidebar
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              DataProjects={DataProjects}
              colorMode={colorMode}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w={"full"}>
            {/* Main Content Area */}
            <VStack spacing={{ base: 4, md: 6 }} w="full">
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
                                  size={"md"}
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                  lineHeight="1.2"
                                >
                                  Projects Management
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
                            <Link href={`projects-manager/register`}>
                              <Button
                                size={"md"}
                                colorScheme={"secondary"}
                                leftIcon={<FiPlusSquare />}
                                isLoading={ActionLoading}
                              >
                                Register New Project
                              </Button>
                            </Link>
                          </Flex>
                        </Flex>

                        <Divider />
                      </VStack>
                    </Box>
                    {/* Last Working Projects Section */}
                    {DataProjects.length > 0 && !IsLoadingProcess && (
                      <Card
                        rounded={radiusStyle}
                        shadow="lg"
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        w="full"
                      >
                        <CardBody p={{ base: 4, md: 6 }}>
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
                                  (window.location.href = `/projects/manage?projectId=${project.id}`)
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
                                    {project.appsProject?.appName}
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
                        </CardBody>
                      </Card>
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
                              {statusFilter.length > 0 && (
                                <Text
                                  as="span"
                                  color="blue.500"
                                  fontWeight="medium"
                                >
                                  {" "}
                                  • Status: {statusFilter.join(", ")}
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
                                  (p) => p.projectStatus === PRO_STATUS_RUNNING
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
                              {globalFilter || statusFilter.length > 0
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
                              {globalFilter || statusFilter.length > 0
                                ? `No projects match your current filters${globalFilter
                                  ? ` (search: "${globalFilter}")`
                                  : ""
                                }${statusFilter.length > 0
                                  ? ` (status: ${statusFilter.join(", ")})`
                                  : ""
                                }. Try adjusting your filters or clearing them.`
                                : "You don't have any projects yet. Projects will appear here once they are created and assigned to your team."}
                            </Text>
                          </VStack>
                          {(globalFilter || statusFilter.length > 0) && (
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
                                    rounded={radiusStyle}
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
                                          ? "secondary.300"
                                          : "secondary.600",
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
                                              bgGradient={
                                                "linear(to-br, secondary.600, secondary.400)"
                                              }
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
                                              <Text
                                                fontSize="x-small"
                                                color={
                                                  colorMode === "light"
                                                    ? "gray.600"
                                                    : "gray.400"
                                                }
                                              >
                                                {project.projectNo}
                                              </Text>

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
                                            <StatusBadge
                                              status={project.projectStatus}
                                              px={3}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                            />
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
                                            href={`/projects/manage?projectId=${project.id}`}
                                          >
                                            <Button
                                              size="sm"
                                              colorScheme="blue"
                                              rightIcon={
                                                <Icon
                                                  as={FiArrowRightCircle}
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
                                              bgGradient="linear(to-r, blue.500, blue.500)"
                                              _active={{
                                                bgGradient:
                                                  "linear(to-r, blue.600, blue.600)",
                                              }}
                                            >
                                              Manage
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
                                            <StatusBadge
                                              status={project.projectStatus}
                                              px={2}
                                              py={1}
                                              rounded="full"
                                              fontSize="xs"
                                            />
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
      {/* Modal for Memo Selection */}
      <Modal
        size="6xl"
        isOpen={ModalForm.isOpen}
        onClose={ModalForm.onClose}
        closeOnOverlayClick={false}
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded="xl"
          mt={8}
          mx={4}
          bg={colorMode === "light" ? "white" : "gray.900"}
        >
          <ModalHeader>Pilih Memo Requirement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ModalRegisterProject />
          </ModalBody>
        </ModalContent>
}
      </Modal>

    </LayoutAdmin>
  );
};

ProjectManagerPage.displayName = "ProjectManagerPage";

export default ProjectManagerPage;
