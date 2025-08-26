"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  useColorModeValue,
  VStack,
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
import { Search2Icon } from "@chakra-ui/icons";
import { FiRefreshCcw } from "react-icons/fi";

// Components
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFullHeadlessGrid } from "@/app/components/tableComponents";

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
} from "@/app/constants/applicationConstants";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";

// Local Components
import CardProject from "./components/CardProject";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Development",
  breadCrumb: ["Home", "Project Development"],
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
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  // Memoized values
  const delay = useCallback((ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms)), []);

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
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []); // Empty dependency array - run only once on mount

  // Data fetching effect
  useEffect(() => {
    setIsEditMode(false);
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        teamId: DataAuth.team.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [],
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

          const itemsData: ProjectDataResponse[] = requestData.data as ProjectDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          
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
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, tokenData]);

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

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Modern Header Section */}
      <Box
        bg={useColorModeValue("white", "gray.800")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        rounded="xl"
        shadow="xl"
        mx={{ base: 2, md: 4 }}
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

        <Box p={{ base: 5, md: 6 }} position="relative" zIndex={1}>
          <Grid templateColumns={{ base: "1fr", lg: "1fr auto" }} gap={6} alignItems="center">
            {/* Left Content */}
            <VStack align="start" spacing={4}>
              {/* Title Section */}
              <HStack spacing={4}>
                <Box
                  w={14}
                  h={14}
                  bg="secondary.500"
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="xl"
                  shadow="lg"
                >
                  💻
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading 
                    size="xl" 
                    color={useColorModeValue("gray.800", "white")}
                    fontWeight="bold"
                  >
                    Development Hub
                  </Heading>
                  <Text 
                    fontSize="md" 
                    color={useColorModeValue("gray.600", "gray.300")}
                    fontWeight="medium"
                  >
                    Manage your development projects and track progress
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
                  🚀 Project Tracking
                </Badge>
                <Badge
                  colorScheme="blue"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  👥 Team Collaboration
                </Badge>
                <Badge
                  colorScheme="green"
                  px={4}
                  py={2}
                  rounded="full"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  📊 Progress Analytics
                </Badge>
              </HStack>
            </VStack>

            {/* Right Content - Stats Grid */}
            <Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={3} minW="260px">
                {/* Total Projects */}
                <Card 
                  bg={useColorModeValue("secondary.50", "secondary.900")} 
                  border="1px" 
                  borderColor={useColorModeValue("secondary.200", "secondary.700")}
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
                        📁
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="secondary.600">
                        {DataProjects.length}
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue("secondary.600", "secondary.300")}>
                        Total Projects
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Active Projects */}
                <Card 
                  bg={useColorModeValue("green.50", "green.900")} 
                  border="1px" 
                  borderColor={useColorModeValue("green.200", "green.700")}
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
                        ⚡
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        {DataProjects.filter(p => p.projectStatus === "ACTIVE").length}
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue("green.600", "green.300")}>
                        Active Projects
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Average Progress */}
                <Card 
                  bg={useColorModeValue("blue.50", "blue.900")} 
                  border="1px" 
                  borderColor={useColorModeValue("blue.200", "blue.700")}
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
                        📈
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        {Math.round(DataProjects.reduce((acc, p) => acc + p.projectStatusPercentage, 0) / (DataProjects.length || 1))}%
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue("blue.600", "blue.300")}>
                        Avg Progress
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Team Count */}
                <Card 
                  bg={useColorModeValue("orange.50", "orange.900")} 
                  border="1px" 
                  borderColor={useColorModeValue("orange.200", "orange.700")}
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
                        👥
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color="orange.600">
                        {DataAuth?.team ? 1 : 0}
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue("orange.600", "orange.300")}>
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

      {/* Enhanced Main Content - Separate Cards Layout */}
      <Box px={{ base: 2, md: 4 }} w="full">
        <VStack spacing={6} w="full">
          {/* Search and Actions Card */}
          <Card 
            rounded="xl" 
            shadow="lg" 
            border="1px" 
            borderColor={useColorModeValue("gray.200", "gray.700")}
            bg={useColorModeValue("white", "gray.800")}
            w="full"
          >
            <CardBody p={6}>
              <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={6} alignItems="center">
                <GridItem>
                  <VStack align="start" spacing={4}>
                    <HStack spacing={3} align="center">
                      <Box
                        w={10}
                        h={10}
                        bg="secondary.500"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                      >
                        🔍
                      </Box>
                      <Heading size="md" color={useColorModeValue("gray.800", "white")}>
                        Project Search & Management
                      </Heading>
                    </HStack>
                    <InputGroup maxW="500px">
                      <InputLeftElement pointerEvents="none" h="full">
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        placeholder="Search development projects..."
                        bg={useColorModeValue("gray.50", "gray.700")}
                        border="2px"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        _focus={{
                          borderColor: "secondary.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                          bg: useColorModeValue("white", "gray.600"),
                        }}
                        _hover={{
                          borderColor: useColorModeValue("gray.300", "gray.500"),
                        }}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        value={globalFilter}
                        size="lg"
                        rounded="lg"
                      />
                    </InputGroup>
                  </VStack>
                </GridItem>
                
                <GridItem>
                  <Button
                    leftIcon={<FiRefreshCcw />}
                    onClick={RefreshAction}
                    isLoading={IsLoadingProcess}
                    variant="outline"
                    colorScheme="secondary"
                    size="lg"
                    rounded="lg"
                    px={8}
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    Refresh Projects
                  </Button>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Projects Display Card */}
          <Card 
            rounded="xl" 
            shadow="lg" 
            border="1px" 
            borderColor={useColorModeValue("gray.200", "gray.700")}
            bg={useColorModeValue("white", "gray.800")}
            w="full"
            minH="400px"
          >
            <CardBody p={6}>
              <VStack spacing={6} w="full">
                {/* Projects Header */}
                <HStack justify="space-between" w="full">
                  <HStack spacing={3}>
                    <Box
                      w={10}
                      h={10}
                      bg="blue.500"
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                    >
                      📋
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color={useColorModeValue("gray.800", "white")}>
                        Development Projects
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                        {DataProjects.length} projects found
                        {globalFilter && ` for "${globalFilter}"`}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {DataProjects.length > 0 && (
                    <Badge
                      colorScheme="green"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                    >
                      {DataProjects.filter(p => p.projectStatus === "ACTIVE").length} Active
                    </Badge>
                  )}
                </HStack>

                {/* Projects Content */}
                <Box w="full">
                  {IsLoadingProcess ? (
                    <VStack spacing={6} py={16}>
                      <LoadingMiniSignature />
                      <VStack spacing={2}>
                        <Text color="gray.500" fontSize="lg" fontWeight="medium">
                          Loading Development Projects
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          Please wait while we fetch your projects...
                        </Text>
                      </VStack>
                    </VStack>
                  ) : DataProjects.length === 0 ? (
                    <VStack spacing={8} py={20} textAlign="center">
                      <Box
                        w={24}
                        h={24}
                        bg={useColorModeValue("gray.100", "gray.700")}
                        rounded="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="4xl"
                      >
                        📂
                      </Box>
                      <VStack spacing={3}>
                        <Heading size="lg" color={useColorModeValue("gray.600", "gray.400")}>
                          {globalFilter ? "No Projects Found" : "No Development Projects"}
                        </Heading>
                        <Text color={useColorModeValue("gray.500", "gray.500")} maxW="500px" lineHeight="1.6">
                          {globalFilter 
                            ? `No projects match "${globalFilter}". Try adjusting your search terms or check the spelling.`
                            : "You don't have any development projects yet. Projects will appear here once they are created and assigned to your team."
                          }
                        </Text>
                      </VStack>
                      {globalFilter && (
                        <Button
                          variant="outline"
                          colorScheme="gray"
                          onClick={() => setGlobalFilter("")}
                          rounded="lg"
                        >
                          Clear Search
                        </Button>
                      )}
                    </VStack>
                  ) : (
                    <TableComponentFullHeadlessGrid table={table} />
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </LayoutAdmin>
  );
});

ProjectManagerPage.displayName = "ProjectManagerPage";

export default ProjectManagerPage;
