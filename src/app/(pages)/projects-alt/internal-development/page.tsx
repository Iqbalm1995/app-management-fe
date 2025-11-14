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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Progress,
  Avatar,
  AvatarGroup,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
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
  FiMoreVertical,
  FiStar,
  FiCalendar,
  FiActivity,
  FiLayers,
  FiEye,
} from "react-icons/fi";
import { Search2Icon } from "@chakra-ui/icons";

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
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";

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

const HeaderDataContent: HeaderContentProps = {
  titleName: "Internal Development",
  breadCrumb: ["Home", "Projects(ALT)", "Internal Development"],
};

const ProjectManagerPage = () => {
  useDocumentTitle("Internal Development");
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
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(9); // Show 9 initially
  const [totalCount, setTotalCount] = useState<number>(0);

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // View mode state

  // Memoized values
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
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
        limit: displayCount,
        page: 0,
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

          setDataProjects(itemsData);
          setTotalCount(totalData);
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
    displayCount,
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
    [ActionLoading, colorMode]
  );

  const table = useReactTable({
    data: DataProjects,
    columns: columnsData,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
  });

  // Event handlers
  const RefreshAction = useCallback(() => {
    setTotalPageData(0);
    setDataProjects([]);
    setDisplayCount(9);
    setRefreshData(RefreshData + 1);
  }, [RefreshData]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 9);
  };

  const ModalForm = useDisclosure();

  const handleAddNew = () => {
    if (DataAuth && DataAuth.team) {
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  // Calculate stats
  const totalProjects = DataProjects.length;
  const activeProjects = DataProjects.filter(
    (p) => p.projectStatus === PRO_STATUS_RUNNING
  ).length;
  const closedProjects = DataProjects.filter(
    (p) => p.projectStatus === "CLOSED"
  ).length;

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Sidebar + Content Layout */}
      <Grid
        templateColumns={{ base: "1fr", lg: "280px 1fr" }}
        gap={6}
        px={6}
        mt={4}
      >
        {/* Left Sidebar */}
        <VStack spacing={4} align="stretch">
          {/* Register Button - Highlighted */}
          <Card
            bgGradient="linear(to-br, secondary.500, secondary.600)"
            rounded={radiusStyle}
            shadow="xl"
            overflow="hidden"
            position="relative"
            _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              w="100px"
              h="100px"
              bg="whiteAlpha.200"
              rounded="full"
              filter="blur(30px)"
            />
            <CardBody p={5} position="relative" zIndex={1}>
              <VStack spacing={3}>
                <Icon as={FiPlusSquare} boxSize={10} color="white" />
                <Text
                  color="white"
                  fontWeight="bold"
                  fontSize="lg"
                  textAlign="center"
                >
                  Create New Project
                </Text>
                <Link
                  href="/projects-alt/internal-development/register"
                  style={{ width: "100%" }}
                >
                  <Button
                    w="full"
                    size="lg"
                    bg="white"
                    color="secondary.600"
                    rounded={radiusStyle}
                    _hover={{ bg: "gray.50", transform: "scale(1.05)" }}
                    transition="all 0.2s"
                    fontWeight="bold"
                  >
                    Register Now
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>

          {/* Project Stats */}
          <Card
            bg={colorMode === "light" ? "white" : "gray.800"}
            rounded={radiusStyle}
            shadow="lg"
          >
            <CardBody p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">
                Project Statistics
              </Text>
              <VStack spacing={3} align="stretch">
                <Box
                  p={3}
                  bg="secondary.50"
                  rounded={radiusStyle}
                  border="2px"
                  borderColor="secondary.200"
                >
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiFolder} color="secondary.600" />
                      <Text
                        fontSize="sm"
                        color="secondary.700"
                        fontWeight="medium"
                      >
                        Total Projects
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="secondary.600">
                      {totalProjects}
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p={3}
                  bg="green.50"
                  rounded={radiusStyle}
                  border="2px"
                  borderColor="green.200"
                >
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiZap} color="green.600" />
                      <Text fontSize="sm" color="green.700" fontWeight="medium">
                        Active
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {activeProjects}
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p={3}
                  bg="gray.50"
                  rounded={radiusStyle}
                  border="2px"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiCheckCircle} color="gray.600" />
                      <Text fontSize="sm" color="gray.700" fontWeight="medium">
                        Closed
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="gray.600">
                      {closedProjects}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Status Filter */}
          <Card
            bg={colorMode === "light" ? "white" : "gray.800"}
            rounded={radiusStyle}
            shadow="lg"
          >
            <CardBody p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">
                Filter by Status
              </Text>
              <VStack spacing={2} align="stretch">
                <Button
                  size="sm"
                  variant={statusFilter.length === 0 ? "solid" : "outline"}
                  colorScheme="secondary"
                  rounded={radiusStyle}
                  justifyContent="flex-start"
                  onClick={() => setStatusFilter([])}
                >
                  All Projects
                </Button>
                <Button
                  size="sm"
                  variant={
                    statusFilter.includes(PRO_STATUS_RUNNING)
                      ? "solid"
                      : "outline"
                  }
                  colorScheme="green"
                  rounded={radiusStyle}
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiZap} />}
                  onClick={() => {
                    if (statusFilter.includes(PRO_STATUS_RUNNING)) {
                      setStatusFilter(
                        statusFilter.filter((s) => s !== PRO_STATUS_RUNNING)
                      );
                    } else {
                      setStatusFilter([PRO_STATUS_RUNNING]);
                    }
                  }}
                >
                  Active Only
                </Button>
                <Button
                  size="sm"
                  variant={
                    statusFilter.includes("CLOSED") ? "solid" : "outline"
                  }
                  colorScheme="gray"
                  rounded={radiusStyle}
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiCheckCircle} />}
                  onClick={() => {
                    if (statusFilter.includes("CLOSED")) {
                      setStatusFilter(
                        statusFilter.filter((s) => s !== "CLOSED")
                      );
                    } else {
                      setStatusFilter(["CLOSED"]);
                    }
                  }}
                >
                  Closed Only
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card
            bg={colorMode === "light" ? "white" : "gray.800"}
            rounded={radiusStyle}
            shadow="lg"
          >
            <CardBody p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">
                Quick Actions
              </Text>
              <VStack spacing={2} align="stretch">
                <Button
                  w="full"
                  size="sm"
                  variant="ghost"
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={RefreshAction}
                  isLoading={IsLoadingProcess}
                  rounded={radiusStyle}
                  justifyContent="flex-start"
                >
                  Refresh Data
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Content Area */}
        <VStack spacing={4} align="stretch" w="full" overflow="hidden" px={2}>
          {/* Header Bar */}
          <Flex
            bg={colorMode === "light" ? "white" : "gray.800"}
            p={4}
            rounded={radiusStyle}
            shadow="lg"
            justify="space-between"
            align="center"
            gap={4}
            flexWrap="wrap"
          >
            <VStack align="start" spacing={0}>
              <Heading size="lg" color="secondary.600">
                Internal Development
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {statusFilter.length > 0
                  ? `Showing ${statusFilter.join(", ")} projects`
                  : "Manage your development projects"}
              </Text>
            </VStack>
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search projects..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                rounded={radiusStyle}
                borderColor="secondary.200"
                _focus={{ borderColor: "secondary.500", shadow: "md" }}
              />
            </InputGroup>
          </Flex>

          {/* Projects Grid */}
          {IsLoadingProcess ? (
            <Flex
              justify="center"
              align="center"
              minH="500px"
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
            >
              <VStack spacing={4}>
                <LoadingMiniSignature />
                <Text color="gray.500">Loading projects...</Text>
              </VStack>
            </Flex>
          ) : DataProjects.length === 0 ? (
            <Flex
              bg={colorMode === "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              shadow="lg"
              p={16}
              justify="center"
              align="center"
              direction="column"
              gap={4}
            >
              <Icon as={FiFolder} boxSize={16} color="secondary.300" />
              <VStack spacing={2}>
                <Heading size="md" color="gray.600">
                  No projects found
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {globalFilter || statusFilter.length > 0
                    ? "Try different filters"
                    : "Create your first project"}
                </Text>
              </VStack>
              {!globalFilter && statusFilter.length === 0 && (
                <Link href="/projects-alt/internal-development/register">
                  <Button
                    colorScheme="secondary"
                    leftIcon={<Icon as={FiPlusSquare} />}
                    rounded={radiusStyle}
                    size="lg"
                  >
                    Create Project
                  </Button>
                </Link>
              )}
            </Flex>
          ) : (
            <Box w="full" >
              {/* Grid Cards */}
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={4}
                w="full"
              >
                {table.getRowModel().rows.map((row) => {
                  const project = row.original;
                  return (
                    <Link
                      href={`/project-development/development?projectId=${project.id}`}
                    >
                      <Card
                        key={project.id}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        rounded={radiusStyle}
                        shadow="lg"
                        border="2px"
                        borderColor="transparent"
                        _hover={{
                          borderColor: "secondary.400",
                          shadow: "2xl",
                          transform: "scale(1.02)",
                        }}
                        transition="all 0.2s"
                        cursor={"pointer"}
                      >
                        <CardBody p={0}>
                          {/* Top Section */}
                          <Box
                            p={3}
                            m={1}
                            bgGradient={
                              colorMode == "light"
                                ? "linear(135deg, secondary.100, purple.100)"
                                : "linear(135deg, secondary.900, purple.900)"
                            }
                            rounded={radiusStyle}
                            boxShadow={"md"}
                          >
                            <HStack justify="space-between" mb={3} w={"full"}>
                              <Box
                                w="48px"
                                h="48px"
                                minW="48px"
                                minH="48px"
                                bgGradient={
                                  "linear(135deg, secondary.400, secondary.600)"
                                }
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontSize="lg"
                                fontWeight="bold"
                                shadow="md"
                                style={{
                                  borderRadius: "28%",
                                }}
                              >
                                {project.projectName
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </Box>
                              <Flex
                                w={"full"}
                                h={"full"}
                                justifyContent={"end"}
                                alignItems={"end"}
                                as={Stack}
                                spacing={0}
                              >
                                <Text
                                  fontSize="xx-small"
                                  color="gray.500"
                                  noOfLines={1}
                                >
                                  {project.projectNo}
                                </Text>
                                <Tooltip
                                  label={project.projectName}
                                  placement="top"
                                  hasArrow
                                  rounded={radiusStyle}
                                  bg={
                                    colorMode === "light" ? "white" : "gray.700"
                                  }
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                  shadow="lg"
                                >
                                  <Heading
                                    size="xs"
                                    noOfLines={2}
                                    mb={1}
                                    textAlign={"right"}
                                  >
                                    {project.projectName}
                                  </Heading>
                                </Tooltip>
                              </Flex>
                            </HStack>

                            <Flex
                              w={"full"}
                              h={"full"}
                              justifyContent={"space-between"}
                              as={HStack}
                              spacing={0}
                            >
                              <HStack spacing={1} fontSize="xs">
                                <Icon
                                  as={FiUsers}
                                  color="secondary.600"
                                  boxSize={3}
                                />
                                <Text
                                  color="secondary.700"
                                  fontWeight="medium"
                                  fontSize={"xx-small"}
                                >
                                  {project.userAssignment &&
                                  project.userAssignment.length > 0
                                    ? `${project.userAssignment.length} Member${
                                        project.userAssignment.length > 1
                                          ? "s"
                                          : ""
                                      }`
                                    : "0 Members"}
                                </Text>
                              </HStack>
                              <HStack spacing={1} fontSize="xs">
                                <Icon
                                  as={FiMonitor}
                                  color="purple.600"
                                  boxSize={3}
                                />
                                <Text
                                  color="purple.700"
                                  fontWeight="bold"
                                  noOfLines={1}
                                  fontSize={"xx-small"}
                                >
                                  {project.appsProject?.appName ||
                                    "No apps assign"}
                                </Text>
                              </HStack>
                            </Flex>

                            {/* Team & App Info */}
                            <VStack spacing={1} align="start"></VStack>
                          </Box>

                          {/* Bottom Section */}
                          <Box px={2} py={2}>
                            <VStack spacing={1} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="xs" color="gray.500">
                                  Progress
                                </Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="secondary.600"
                                >
                                  {project.projectStatusPercentage}%
                                </Text>
                              </HStack>
                              <Progress
                                value={project.projectStatusPercentage}
                                size="sm"
                                colorScheme="secondary"
                                rounded="full"
                              />
                              <Flex
                                as={HStack}
                                justifyContent={"end"}
                                alignItems={"center"}
                              >
                                <Text fontSize="xx-small" color="gray.500">
                                  Status
                                </Text>
                                <StatusBadge
                                  status={project.projectStatus}
                                  variant="subtle"
                                  size="sm"
                                  rounded={"md"}
                                />
                              </Flex>
                            </VStack>
                          </Box>
                        </CardBody>
                      </Card>
                    </Link>
                  );
                })}
              </SimpleGrid>

              {/* Load More Button */}
              {DataProjects.length < totalCount && (
                <Flex
                  justify="center"
                  p={4}
                  mt={4}
                >
                  <Button
                    size="lg"
                    colorScheme="secondary"
                    onClick={handleLoadMore}
                    isLoading={IsLoadingProcess}
                    rounded={radiusStyle}
                    leftIcon={<Icon as={FiArrowRightCircle} />}
                  >
                    Load More Projects ({DataProjects.length} of {totalCount})
                  </Button>
                </Flex>
              )}
            </Box>
          )}
        </VStack>
      </Grid>
    </LayoutAdmin>
  );
};

ProjectManagerPage.displayName = "ProjectManagerPage";

export default ProjectManagerPage;
