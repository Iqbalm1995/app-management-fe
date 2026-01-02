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
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiActivity, FiBarChart, FiRefreshCw } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
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
  const [teams, setTeams] = useState<TeamsResponse[]>([]);

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
            fieldOrder: ["nama"],
            orderDir: "asc",
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
  ]);

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
      <HeaderContent {...headerProps} />
      <Box p={6}>
        <Tabs variant="soft-rounded" colorScheme="blue">
          <Card
            mb={6}
            rounded={radiusStyle}
            shadow="lg"
            bg={colorMode === "light" ? "white" : "gray.800"}
          >
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <TabList
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  p={1}
                  rounded={radiusStyle}
                >
                  <Tab
                    rounded={radiusStyle}
                    _selected={{ bg: "blue.500", color: "white" }}
                  >
                    <FiBarChart style={{ marginRight: "8px" }} />
                    Resource Load Tracking
                  </Tab>
                  <Tab
                    rounded={radiusStyle}
                    _selected={{ bg: "blue.500", color: "white" }}
                  >
                    <FiActivity style={{ marginRight: "8px" }} />
                    Resource Allocation & Availability
                  </Tab>
                </TabList>

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
                      color={colorMode === "light" ? "gray.600" : "gray.300"}
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
                      color={colorMode === "light" ? "gray.600" : "gray.300"}
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
                      color={colorMode === "light" ? "gray.600" : "gray.300"}
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
                      color={colorMode === "light" ? "gray.600" : "gray.300"}
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
                    <Text fontSize="xs" color="transparent" fontWeight="medium">
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
              </Flex>
            </CardBody>
          </Card>

          <TabPanels>
            <TabPanel px={0}>
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
                        color={colorMode === "light" ? "blue.700" : "blue.300"}
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
              <Card
                rounded={radiusStyle}
                shadow="lg"
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody>
                  <VStack spacing={4} py={8}>
                    <FiActivity size={48} color="gray" />
                    <Text color="gray.500" fontSize="lg">
                      Coming soon...
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}
