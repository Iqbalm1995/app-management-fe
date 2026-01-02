"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { buildUrlPort } from "@/app/helper/MasterHelper";
import { PaggingListPayload } from "@/app/types/masterTypes";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorMode,
  Stack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiActivity, FiBarChart, FiRefreshCw } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import {
  UserTeamResponse,
  UserTeamRoleResponse,
} from "@/app/services/useUsers";
import { span } from "framer-motion/client";

const headerProps: HeaderContentProps = {
  titleName: "Resource Monitor",
  breadCrumb: ["Home", "Resource Monitor"],
};

interface UserResourceLoad {
  id: string;
  userId: string;
  nama: string;
  email?: string;
  profilePict?: string;
  namaCabang?: string;
  namaUnitKerja?: string;
  kodeUnitKerja?: string;
  jabatan?: string;
  team?: UserTeamResponse | null;
  teamRole?: UserTeamRoleResponse | null;
  activeProjectCount: number;
  assignedTaskCount: number;
}

const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1;
  return Math.ceil(month / 3);
};

const getQuarterDateRange = (year: number, quarter: number) => {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export default function ResourceMonitorPage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { List: GetTeamList } = useTeams();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [Data, setData] = useState<UserResourceLoad[] | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] =
    useState<number>(currentQuarter);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("activeProjectCount");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");
  const [teams, setTeams] = useState<TeamsResponse[]>([]);

  // Heatmap states
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [viewMode, setViewMode] = useState<string>("week");
  const [userSearch, setUserSearch] = useState<string>("");
  const [taskThreshold, setTaskThreshold] = useState<string>("all");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);

      // Load teams
      GetTeamList(
        {
          search: "",
          limit: 1000,
          page: 0,
          filterWhere: [],
          fieldOrder: ["teamName"],
          orderDir: "asc",
        },
        token
      ).then((response) => {
        if (response?.data) {
          setTeams(response.data);
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (tokenData) {
        setIsLoadingProcess(true);
        try {
          const dateRange = getQuarterDateRange(selectedYear, selectedQuarter);

          const filterWhere: any[] = [
            {
              field: "startDate",
              operator: "=",
              value: dateRange.startDate,
            },
            {
              field: "endDate",
              operator: "=",
              value: dateRange.endDate,
            },
          ];

          if (selectedTeam) {
            filterWhere.push({
              field: "teamId",
              operator: "=",
              value: selectedTeam,
            });
          }

          const payload: PaggingListPayload = {
            search: globalFilter,
            limit: pageSize,
            page: pageIndex,
            filterWhere,
            fieldOrder: [orderBy],
            orderDir: orderDir,
          };

          const UrlEndpoint = buildUrlPort(
            ENDPOINT_API_BASEURL,
            ENDPOINT_PORT_BASIC
          );
          const response = await fetch(
            `${UrlEndpoint}/v1/Users/resource-load-tracking`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenData}`,
              },
              body: JSON.stringify(payload),
            }
          );

          const requestData = await response.json();

          if (!requestData || requestData.statusCode !== RES_CODE_OK) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            return;
          }

          const data = requestData.data;
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;

          setData(data);
          setTotalUsers(totalData);
          setTotalPageData(totalPages);
        } catch (error) {
          console.error("Error fetching users:", error);
          showToast({
            description: "Failed to load resource data",
            statusToast: "error",
          });
        } finally {
          setIsLoadingProcess(false);
        }
      }
    };

    fetchData();
  }, [
    tokenData,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    selectedYear,
    selectedQuarter,
    selectedTeam,
    orderBy,
    orderDir,
  ]);

  // Fetch heatmap data
  useEffect(() => {
    const fetchHeatmap = async () => {
      if (tokenData) {
        setHeatmapLoading(true);
        try {
          const UrlEndpoint = buildUrlPort(
            ENDPOINT_API_BASEURL,
            ENDPOINT_PORT_BASIC
          );
          const response = await fetch(`${UrlEndpoint}/v1/Users/task-heatmap`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenData}`,
            },
            body: JSON.stringify({
              year: selectedYear,
              quarter: selectedQuarter,
              viewMode: viewMode,
              userId: userSearch || null,
            }),
          });

          const requestData = await response.json();

          if (requestData && requestData.statusCode === RES_CODE_OK) {
            setHeatmapData(requestData.data || []);
          }
        } catch (error) {
          console.error("Error fetching heatmap:", error);
        } finally {
          setHeatmapLoading(false);
        }
      }
    };

    fetchHeatmap();
  }, [tokenData, selectedYear, selectedQuarter, viewMode, userSearch]);

  // Filter heatmap data by task threshold
  const filteredHeatmapData = useMemo(() => {
    if (taskThreshold === "all") return heatmapData;

    return heatmapData.filter((user: any) => {
      const maxTaskCount = Math.max(...user.taskCounts.map((tc: any) => tc.taskCount));
      
      switch (taskThreshold) {
        case "0":
          return maxTaskCount === 0;
        case "1-2":
          return maxTaskCount >= 1 && maxTaskCount <= 2;
        case "3-5":
          return maxTaskCount >= 3 && maxTaskCount <= 5;
        case "6-10":
          return maxTaskCount >= 6 && maxTaskCount <= 10;
        case "11+":
          return maxTaskCount >= 11;
        default:
          return true;
      }
    });
  }, [heatmapData, taskThreshold]);

  const columns: ColumnDef<UserResourceLoad>[] = useMemo(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontWeight="semibold" color="gray.500">
              {pageIndex * pageSize + info.row.index + 1}
            </Text>
          </Flex>
        ),
        header: () => (
          <Flex justifyContent="center" fontWeight="bold">
            No.
          </Flex>
        ),
        size: 60,
      },
      {
        accessorKey: "avatar",
        header: () => <Text fontWeight="bold">User</Text>,
        size: 280,
        cell: ({ row }) => (
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={row.original.nama}
              src={row.original.profilePict || undefined}
              //   bg="blue.500"
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold" fontSize="sm">
                {row.original.nama}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {row.original.userId}
              </Text>
              <Text fontSize="xs" color="secondary.500">
                {row.original.email}
              </Text>
            </VStack>
          </HStack>
        ),
      },
      {
        accessorKey: "namaUnitKerja",
        header: () => <Text fontWeight="bold">Work Unit</Text>,
        size: 150,
        cell: ({ row }) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Division :</Text>
              <Text fontWeight={600}>{row.original.namaUnitKerja}</Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Jabatan :</Text>
              <Text fontWeight={600}>{row.original.jabatan}</Text>
            </Flex>
          </Flex>
        ),
      },
      {
        accessorKey: "team",
        header: () => <Text fontWeight="bold">Team</Text>,
        size: 150,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            {row.original.team ? (
              <>
                <Text fontWeight="semibold" fontSize="sm">
                  {row.original.team?.teamName || "-"} (
                  {row.original.team?.teamCode || "-"})
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {row.original.teamRole?.specName || "-"}
                </Text>
              </>
            ) : (
              <Text fontSize="xs" fontStyle={"italic"} color="gray.500">
                No Assign In Team
              </Text>
            )}
          </VStack>
        ),
      },
      {
        accessorKey: "activeProjectCountX",
        header: () => (
          <Flex justifyContent="center" fontWeight="bold">
            Work Load On Going
          </Flex>
        ),
        size: 150,
        cell: ({ row }: any) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Active Project :</Text>
              <Text fontWeight={600}>{row.original.activeProjectCount}</Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Assign Task :</Text>
              <Text fontWeight={600}>{row.original.assignedTaskCount}</Text>
            </Flex>
          </Flex>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: Data || [],
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const years = useMemo(() => {
    const yearList = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      yearList.push(i);
    }
    return yearList;
  }, [currentYear]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={headerProps.titleName}
        breadCrumb={headerProps.breadCrumb}
      />
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Flex w={"full"}>
            <Tabs variant="soft-rounded" colorScheme="blue" w={"full"}>
              <Card
                w={"full"}
                mb={6}
                rounded={radiusStyle}
                shadow="lg"
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody>
                  <TabList
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    p={1}
                    rounded={radiusStyle}
                    w={"auto"}
                  >
                    <Tab
                      mx={1}
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <FiBarChart style={{ marginRight: "8px" }} />
                      Resource Load Tracking
                    </Tab>
                    <Tab
                      mx={1}
                      rounded={radiusStyle}
                      _selected={{ bg: "blue.500", color: "white" }}
                    >
                      <FiActivity style={{ marginRight: "8px" }} />
                      Resource Allocation & Availability
                    </Tab>
                  </TabList>
                </CardBody>
              </Card>

              <TabPanels>
                <TabPanel px={0}>
                  {/* Filters for Resource Load Tracking */}
                  <Card
                    w={"full"}
                    mb={6}
                    rounded={radiusStyle}
                    shadow="lg"
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  >
                    <CardBody>
                      <HStack
                        spacing={4}
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        p={4}
                        rounded={radiusStyle}
                        flexWrap="wrap"
                      >
                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Year
                          </Text>
                          <Select
                            value={selectedYear}
                            onChange={(e) => {
                              setSelectedYear(Number(e.target.value));
                              setPagination({ pageIndex: 0, pageSize });
                            }}
                            size="sm"
                            rounded={radiusStyle}
                            minW="100px"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Select>
                        </VStack>

                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Quarter
                          </Text>
                          <Select
                            value={selectedQuarter}
                            onChange={(e) => {
                              setSelectedQuarter(Number(e.target.value));
                              setPagination({ pageIndex: 0, pageSize });
                            }}
                            size="sm"
                            rounded={radiusStyle}
                            minW="100px"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                          >
                            <option value={1}>Q1</option>
                            <option value={2}>Q2</option>
                            <option value={3}>Q3</option>
                            <option value={4}>Q4</option>
                          </Select>
                        </VStack>

                        <VStack spacing={1} align="start" flex={1} minW="200px">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Team
                          </Text>
                          <Select
                            value={selectedTeam}
                            onChange={(e) => {
                              setSelectedTeam(e.target.value);
                              setPagination({ pageIndex: 0, pageSize });
                            }}
                            size="sm"
                            rounded={radiusStyle}
                            minW="150px"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                            placeholder="All Teams"
                          >
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.teamName}
                              </option>
                            ))}
                          </Select>
                        </VStack>

                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Search
                          </Text>
                          <Flex
                            borderWidth="1px"
                            borderRadius={radiusStyle}
                            overflow="hidden"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                            minW="250px"
                          >
                            <Input
                              placeholder="Name, email, user ID..."
                              border="none"
                              size="sm"
                              value={globalFilter}
                              onChange={(e) => {
                                setGlobalFilter(e.target.value);
                                setPagination({ pageIndex: 0, pageSize });
                              }}
                              _focus={{ outline: "none" }}
                            />
                            <Flex align="center" px={3}>
                              <Search2Icon color="gray.400" />
                            </Flex>
                          </Flex>
                        </VStack>

                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Order By
                          </Text>
                          <Select
                            value={orderBy}
                            onChange={(e) => {
                              setOrderBy(e.target.value);
                              setPagination({ pageIndex: 0, pageSize });
                            }}
                            size="sm"
                            rounded={radiusStyle}
                            minW="150px"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                          >
                            <option value="nama">Name</option>
                            <option value="activeProjectCount">Projects</option>
                            <option value="assignedTaskCount">Tasks</option>
                          </Select>
                        </VStack>

                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "light" ? "gray.600" : "gray.300"
                            }
                            fontWeight="medium"
                          >
                            Direction
                          </Text>
                          <Select
                            value={orderDir}
                            onChange={(e) => {
                              setOrderDir(e.target.value as "asc" | "desc");
                              setPagination({ pageIndex: 0, pageSize });
                            }}
                            size="sm"
                            rounded={radiusStyle}
                            minW="100px"
                            bg={colorMode === "light" ? "white" : "gray.600"}
                          >
                            <option value="asc">ASC</option>
                            <option value="desc">DESC</option>
                          </Select>
                        </VStack>

                        <VStack spacing={1} align="start">
                          <Text
                            fontSize="xs"
                            color="transparent"
                            fontWeight="medium"
                          >
                            Action
                          </Text>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            leftIcon={<FiRefreshCw />}
                            onClick={() => setRefreshData((prev) => prev + 1)}
                            isLoading={IsLoadingProcess}
                          >
                            Refresh
                          </Button>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Table */}
                  <Card
                    rounded={radiusStyle}
                    shadow="lg"
                    bg={colorMode === "light" ? "white" : "gray.800"}
                  >
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Heading
                            size="md"
                            color={
                              colorMode === "light" ? "blue.700" : "blue.300"
                            }
                          >
                            User Resource Load
                          </Heading>
                          <Text fontSize="sm" color="gray.500">
                            Ongoing projects and tasks within Q{selectedQuarter}{" "}
                            {selectedYear}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme="blue"
                          borderRadius={radiusStyle}
                          fontSize="md"
                          px={3}
                          py={1}
                        >
                          {totalUsers} Users
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody overflowX="auto">
                      <TableComponentFull
                        table={table}
                        isLoading={IsLoadingProcess}
                        totalPages={totalPages}
                      />
                    </CardBody>
                  </Card>
                </TabPanel>

                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Heatmap Filters */}
                    <Card
                      rounded={radiusStyle}
                      shadow="lg"
                      bg={colorMode === "light" ? "white" : "gray.800"}
                    >
                      <CardBody>
                        <HStack spacing={4} flexWrap="wrap">
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" fontWeight="600">
                              View Mode
                            </Text>
                            <Select
                              value={viewMode}
                              onChange={(e) => setViewMode(e.target.value)}
                              size="sm"
                              rounded={radiusStyle}
                              minW="120px"
                            >
                              <option value="day">Day</option>
                              <option value="week">Week</option>
                              <option value="month">Month</option>
                            </Select>
                          </VStack>

                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" fontWeight="600">
                              Task Threshold
                            </Text>
                            <Select
                              value={taskThreshold}
                              onChange={(e) => setTaskThreshold(e.target.value)}
                              size="sm"
                              rounded={radiusStyle}
                              minW="120px"
                            >
                              <option value="all">All</option>
                              <option value="0">0</option>
                              <option value="1-2">1-2</option>
                              <option value="3-5">3-5</option>
                              <option value="6-10">6-10</option>
                              <option value="11+">11+</option>
                            </Select>
                          </VStack>

                          <VStack
                            spacing={1}
                            align="start"
                            flex={1}
                            minW="200px"
                          >
                            <Text fontSize="sm" fontWeight="600">
                              Search User
                            </Text>
                            <Flex
                              borderWidth="1px"
                              borderRadius={radiusStyle}
                              overflow="hidden"
                              bg={colorMode === "light" ? "white" : "gray.600"}
                              w="full"
                            >
                              <Input
                                placeholder="Name, email, user ID..."
                                border="none"
                                size="sm"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                _focus={{ outline: "none" }}
                              />
                              <Flex align="center" px={3}>
                                <Search2Icon color="gray.400" />
                              </Flex>
                            </Flex>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>

                    {/* Heatmap Chart */}
                    <Card
                      rounded={radiusStyle}
                      shadow="lg"
                      bg={colorMode === "light" ? "white" : "gray.800"}
                    >
                      <CardHeader>
                        <VStack align="start" spacing={1}>
                          <Heading
                            size="md"
                            color={
                              colorMode === "light" ? "blue.700" : "blue.300"
                            }
                          >
                            Task Allocation Heatmap
                          </Heading>
                          <Text fontSize="sm" color="gray.500">
                            Q{selectedQuarter} {selectedYear} - View by{" "}
                            {viewMode}
                          </Text>
                        </VStack>
                      </CardHeader>
                      <CardBody>
                        {heatmapLoading ? (
                          <Flex justify="center" align="center" h="400px">
                            <VStack>
                              <Text>Loading heatmap...</Text>
                            </VStack>
                          </Flex>
                        ) : heatmapData.length > 0 ? (
                          <Box overflowX="auto">
                            <Chart
                              options={
                                {
                                  chart: {
                                    type: "heatmap",
                                    toolbar: { show: true },
                                  },
                                  dataLabels: { enabled: false },
                                  colors: ["#008FFB"],
                                  xaxis: {
                                    type: "category",
                                  },
                                  yaxis: {
                                    labels: {
                                      style: {
                                        fontSize: "12px",
                                      },
                                    },
                                  },
                                  plotOptions: {
                                    heatmap: {
                                      shadeIntensity: 0.5,
                                      colorScale: {
                                        ranges: [
                                          {
                                            from: 0,
                                            to: 0,
                                            color: "#f3f4f6",
                                            name: "0",
                                          },
                                          {
                                            from: 1,
                                            to: 2,
                                            color: "#dbeafe",
                                            name: "1-2",
                                          },
                                          {
                                            from: 3,
                                            to: 5,
                                            color: "#93c5fd",
                                            name: "3-5",
                                          },
                                          {
                                            from: 6,
                                            to: 10,
                                            color: "#3b82f6",
                                            name: "6-10",
                                          },
                                          {
                                            from: 11,
                                            to: 999,
                                            color: "#1e40af",
                                            name: "11+",
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  tooltip: {
                                    y: {
                                      formatter: (val: number) =>
                                        `${val} tasks`,
                                    },
                                  },
                                } as ApexOptions
                              }
                              series={filteredHeatmapData.map((user: any) => ({
                                name: user.userName,
                                data: user.taskCounts.map((tc: any) => ({
                                  x: tc.period,
                                  y: tc.taskCount,
                                })),
                              }))}
                              type="heatmap"
                              height={Math.max(400, filteredHeatmapData.length * 40)}
                            />
                          </Box>
                        ) : (
                          <Flex justify="center" align="center" h="400px">
                            <VStack>
                              <FiActivity size={48} color="gray" />
                              <Text color="gray.500">No data available</Text>
                            </VStack>
                          </Flex>
                        )}
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}
