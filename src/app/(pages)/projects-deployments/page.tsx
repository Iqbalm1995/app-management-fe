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
  FiServer,
  FiCloud,
  FiGitBranch,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlusSquare,
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
  PROJECT_TYPE_DEPLOYMENT,
} from "@/app/constants/applicationConstants";
import { PROJECT_STATUSES } from "@/app/constants/masterStatusConstants";
import {
  PaggingListPayloadCustom,
  ListSearchByParam,
} from "@/app/types/masterTypes";

// Local Components
import CardProject from "@/app/components/CardProject";
import ManagerSidebarDeployments from "./components/ManagerSidebarDeployments";
import CardProjectDeployment from "@/app/components/CardProjectDeployment";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Projects Deployments",
  breadCrumb: ["Home", "Projects Deployments"],
};

const ProjectDeploymentsPage = () => {
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
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  // Memoized pagination
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Data fetching effect
  useEffect(() => {
    setIsEditMode(false);
    if (DataAuth) {
      // Build filter conditions
      const filterWhere: ListSearchByParam[] = [];

      // Add status filter if selected
      if (statusFilter.length > 0) {
        statusFilter.forEach((status: string) => {
          filterWhere.push({
            field: "projectStatus",
            operator: "=",
            value: status,
          });
        });
      }

      filterWhere.push({
        field: "projectType",
        operator: "=",
        value: PROJECT_TYPE_DEPLOYMENT,
      });

      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
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
          <CardProjectDeployment
            data={info.row.original}
            key={info.row.original.projectCode}
            variant="deployment"
          />
        ),
        header: () => <span>Projects</span>,
        footer: (props) => props.column.id,
      },
    ],
    [IsLoadingProcess, pageIndex, pageSize, colorMode]
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

  const refreshAction = () => setRefreshData((prev) => prev + 1);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Modern Abstract Deployment Header */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
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
          bg={colorMode === "light" ? "secondary.100" : "whiteAlpha.200"}
          rounded="full"
          // filter="blur(20px)"
        />
        <Box
          position="absolute"
          bottom="-10px"
          left="30px"
          w="60px"
          h="60px"
          bg={colorMode === "light" ? "secondary.200" : "whiteAlpha.300"}
          transform="rotate(45deg)"
          // filter="blur(15px)"
        />
        <Box
          position="absolute"
          top="30px"
          left="60%"
          w="40px"
          h="40px"
          // bg="whiteAlpha.200"
          bg={colorMode === "light" ? "secondary.100" : "whiteAlpha.200"}
          rounded="md"
          transform="rotate(30deg)"
          // filter="blur(10px)"
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
                bg="blue.500"
                backdropFilter="blur(10px)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={
                  colorMode === "light" ? "blackAlpha.100" : "whiteAlpha.200"
                }
              >
                <Icon as={FiServer} boxSize={6} color="white" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading
                  size="lg"
                  color={colorMode === "light" ? "gray.900" : "white"}
                  fontWeight="700"
                  letterSpacing="tight"
                >
                  Deployments Management Hub (Coming Soon)
                </Heading>
                <Text
                  fontSize="sm"
                  color={colorMode === "light" ? "gray.500" : "white"}
                  fontWeight="500"
                >
                  Infrastructure deployment & release management
                </Text>
              </VStack>
            </HStack>

            {/* Quick Stats */}
            <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.900" : "white"}
                >
                  {DataProjects.length}
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode === "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Projects
                </Text>
              </VStack>
              <Box
                w="1px"
                h="40px"
                bg={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.500"}
              />
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.900" : "white"}
                >
                  {
                    DataProjects.filter((p) => p.projectStatus === "ACTIVE")
                      .length
                  }
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode === "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Active
                </Text>
              </VStack>
              <Box
                w="1px"
                h="40px"
                bg={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.500"}
              />
              <VStack spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.900" : "white"}
                >
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
                  color={colorMode === "light" ? "gray.900" : "white"}
                  textTransform="uppercase"
                >
                  Progress
                </Text>
              </VStack>
            </HStack>
          </Flex>

          {/* Bottom Row - Feature Tags & Mobile Stats */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                colorScheme="blue"
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
                fontWeight="medium"
              >
                <Icon as={FiServer} w={3} h={3} mr={1} />
                Infrastructure
              </Badge>
              <Badge
                colorScheme="blue"
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
                fontWeight="medium"
              >
                <Icon as={FiCloud} w={3} h={3} mr={1} />
                Cloud Deployment
              </Badge>
              <Badge
                colorScheme="green"
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
                fontWeight="medium"
              >
                <Icon as={FiGitBranch} w={3} h={3} mr={1} />
                Release Management
              </Badge>
            </HStack>

            {/* Mobile Stats */}
            <HStack spacing={4} display={{ base: "flex", lg: "none" }}>
              <VStack spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {DataProjects.length}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  Total
                </Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {
                    DataProjects.filter((p) => p.projectStatus === "ACTIVE")
                      .length
                  }
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  Active
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Enhanced Main Content - Grid Layout with Sidebar */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          {/* Enhanced Deployment Sidebar */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
            <ManagerSidebarDeployments
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              DataProjects={DataProjects}
              colorMode={colorMode}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }} w={"full"}>
            {/* Main Content Area */}
            <VStack spacing={{ base: 4, md: 6 }} w="full">
              {/* Enhanced Projects List */}
              <Card
                rounded={radiusStyle}
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
                                bgGradient="linear(to-br, blue.500, purple.500)"
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
                                  Deployment Management
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
                              // onClick={() => RefreshAction()}
                              isLoading={ActionLoading}
                            >
                              Refresh
                            </Button>
                            <Button
                              size={"md"}
                              colorScheme={"blue"}
                              leftIcon={<FiPlusSquare />}
                              type={"submit"}
                              isLoading={ActionLoading}
                              isDisabled
                            >
                              Register New Deployment
                            </Button>
                          </Flex>
                        </Flex>

                        <Divider />
                      </VStack>
                    </Box>
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
                                    {project.projectNo}
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
                            bgGradient="linear(to-br, blue.500, purple.500)"
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
                                  (p) => p.projectStatus === "ACTIVE"
                                ).length
                              }{" "}
                              Active
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    </Flex>

                    {/* Content */}
                    <Box w="full">
                      {IsLoadingProcess ? (
                        <VStack spacing={4}>
                          <LoadingMiniSignature />
                          <Text color="gray.500">Loading projects...</Text>
                        </VStack>
                      ) : DataProjects.length === 0 ? (
                        <VStack spacing={4}>
                          <Icon as={FiFolder} boxSize={12} color="gray.300" />
                          <Text color="gray.500" textAlign="center">
                            No projects found. Create your first project to get
                            started.
                          </Text>
                        </VStack>
                      ) : (
                        <TableComponentFullHeadlessGrid table={table} />
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
};

export default ProjectDeploymentsPage;
