"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useColorMode } from "@chakra-ui/react";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload, ListSearchByParam } from "@/app/types/masterTypes";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaUserPlus } from "react-icons/fa6";
import { FiRefreshCcw, FiSearch, FiFilter, FiUsers } from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { Select as ChakraSelect } from "chakra-react-select";
import Link from "next/link";
import {
  ColumnDef,
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  ControlTable,
} from "@/app/components/tableComponents";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Teams Center`,
  breadCrumb: ["Home", "Teams Center"],
};

function TeamsCenterPage() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { List } = useTeams();
  const { List: ListOrganizations } = useOrganization();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Teams data
  const [TeamsData, setTeamsData] = useState<TeamsResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [StatsData, setStatsData] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
  });
  const [OrganizationData, setOrganizationData] = useState<OrganizationResponse[]>([]);
  const [DirectorateData, setDirectorateData] = useState<OrganizationResponse[]>([]);
  const [DivisionData, setDivisionData] = useState<OrganizationResponse[]>([]);
  const [GroupData, setGroupData] = useState<OrganizationResponse[]>([]);

  // Pagination state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Refresh state management (following other pages pattern)
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Auth effect
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

  // Reset division and group when directorate changes
  useEffect(() => {
    if (selectedDirectorate !== "all") {
      setSelectedDivision("all");
      setSelectedGroup("all");
    }
  }, [selectedDirectorate]);

  // Reset group selection when division changes (same pattern as add team form)
  useEffect(() => {
    if (selectedDivision !== "all") {
      setSelectedGroup("all");
    }
  }, [selectedDivision]);

  // Get statistics data
  const GetStatsData = async () => {
    if (!tokenData || !DataAuth) return;

    try {
      const PayloadStats: PaggingListPayload = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: [],
      };

      const requestData = await List(PayloadStats, tokenData);

      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        const allTeams = requestData.data as TeamsResponse[];
        const activeTeams = allTeams.filter(team => team.isActive === "ACTIVE");

        // Calculate active rate
        const activeRate = allTeams.length > 0 ? Math.round((activeTeams.length / allTeams.length) * 100) : 0;

        setStatsData({
          totalTeams: allTeams.length,
          activeTeams: activeTeams.length,
          totalMembers: activeRate, // Using active rate as placeholder for now
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Load organization data
  const GetOrganizationData = async () => {
    if (!tokenData || !DataAuth) return;

    try {
      // Load Directorates
      const PayloadDirectorate: PaggingListPayload = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: [
          { field: "orgType", operator: "=" as const, value: "DIRECTORATE" }
        ],
      };

      const directorateResponse = await ListOrganizations(PayloadDirectorate, tokenData);
      if (directorateResponse?.statusCode === RES_CODE_OK && directorateResponse.data) {
        setDirectorateData(directorateResponse.data as OrganizationResponse[]);
      }

      // Load Divisions
      const PayloadDivision: PaggingListPayload = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: [
          { field: "orgType", operator: "=" as const, value: "DIVISION" }
        ],
      };

      const divisionResponse = await ListOrganizations(PayloadDivision, tokenData);
      if (divisionResponse?.statusCode === RES_CODE_OK && divisionResponse.data) {
        setDivisionData(divisionResponse.data as OrganizationResponse[]);
      }

      // Load Groups
      const PayloadGroup: PaggingListPayload = {
        search: "",
        limit: 999999,
        page: 0,
        fieldOrder: ["orgName"],
        orderDir: "asc",
        filterWhere: [
          { field: "orgType", operator: "=" as const, value: "GROUP" }
        ],
      };

      const groupResponse = await ListOrganizations(PayloadGroup, tokenData);
      if (groupResponse?.statusCode === RES_CODE_OK && groupResponse.data) {
        setGroupData(groupResponse.data as OrganizationResponse[]);
      }

    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  // Load teams data
  const GetTeamsData = async () => {
    if (!tokenData || !DataAuth) return;

    try {
      setIsLoadingProcess(true);

      // Build filter conditions based on selected filters
      const filterConditions: ListSearchByParam[] = []; // Group filtering only - following standard pattern

      // Filter by group only (under division) - standard organization filtering pattern
      if (selectedGroup !== "all") {
        const selectedOrg = GroupData.find(org => org.id === selectedGroup);
        if (selectedOrg) {
          filterConditions.push({
            field: "orgGroupCode",
            operator: "=" as const,
            value: selectedOrg.orgCode
          });
        }
      }

      if (selectedDirectorate !== "all") {
        const selectedOrg = DirectorateData.find(org => org.id === selectedDirectorate);
        if (selectedOrg) {
        }
      }

      if (selectedDivision !== "all") {
        const selectedOrg = DivisionData.find(org => org.id === selectedDivision);
        if (selectedOrg) {
        }
      }

      if (selectedGroup !== "all") {
        const selectedOrg = GroupData.find(org => org.id === selectedGroup);
        if (selectedOrg) {
          filterConditions.push({
            field: "orgGroupCode",
            operator: "=" as const,
            value: selectedOrg.orgCode
          });
        }
      }


      // Check if any selected filter doesn't exist - return no data if so
      let shouldReturnNoData = false;

      if (selectedDirectorate !== "all" && !DirectorateData.find(org => org.id === selectedDirectorate)) {
        shouldReturnNoData = true;
      }

      if (selectedDivision !== "all" && !DivisionData.find(org => org.id === selectedDivision)) {
        shouldReturnNoData = true;
      }

      if (selectedGroup !== "all" && !GroupData.find(org => org.id === selectedGroup)) {
        shouldReturnNoData = true;
      }

      // If any selected filter doesn't exist, return empty data
      if (shouldReturnNoData) {
        setTeamsData([]);
        setTotalPageData(0);
        setIsLoadingProcess(false);
        return;
      }
      const PayloadList: PaggingListPayload = {
        search: searchQuery,
        limit: pageSize,
        page: pageIndex,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
        filterWhere: filterConditions,
      };

      const requestData = await List(PayloadList, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as TeamsResponse[];
      const totalData: number = requestData.countTotal as number;
      const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : 0;

      setTeamsData(data);
      setTotalPageData(totalPages);

    } catch (error) {
      console.error("Error fetching teams:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Load data effect
  useEffect(() => {
    if (DataAuth && tokenData) {
      GetOrganizationData(); // Load organization data first
      GetTeamsData();
      GetStatsData(); // Load statistics separately
    }
  }, [pageIndex, pageSize, RefreshData, DataAuth, tokenData, searchQuery, selectedDirectorate, selectedDivision, selectedGroup]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setTeamsData([]);
    setRefreshData(RefreshData + 1);
  };

  // Table configuration for pagination
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: TeamsData,
    columns: [], // Empty columns since we're using custom cards
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

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
          {/* Header Row */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
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
                <Icon as={FiUsers} boxSize={5} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                  Teams Center
                </Heading>
                <HStack spacing={4} mt={1}>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                    <Text as="span" fontWeight="semibold" color="secondary.500">{StatsData.totalTeams}</Text> teams
                  </Text>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                    <Text as="span" fontWeight="semibold" color="green.500">{StatsData.activeTeams}</Text> active
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              {/* Search */}
              <InputGroup maxW="250px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Group Filter */}
              <Box minW="200px">
                <ChakraSelect
                  value={
                    selectedGroup === "all"
                      ? { label: "All Groups", value: "all" }
                      : GroupData.find(g => g.id === selectedGroup)
                        ? { label: `${GroupData.find(g => g.id === selectedGroup)!.orgName} (${GroupData.find(g => g.id === selectedGroup)!.orgCode})`, value: selectedGroup }
                        : null
                  }
                  onChange={(option) => {
                    setSelectedGroup(option?.value || "all");
                  }}
                  options={[
                    { label: "All Groups", value: "all" },
                    ...GroupData.map(org => ({
                      label: `${org.orgName} (${org.orgCode})`,
                      value: org.id
                    }))
                  ]}
                  placeholder="Select Group"
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

              {/* Hidden filters (keep functionality) */}
              <Select
                value={selectedDirectorate}
                display="none"
                onChange={(e) => setSelectedDirectorate(e.target.value)}
              >
                <option value="all">All Directorates</option>
                {DirectorateData.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.orgName} ({org.orgCode})
                  </option>
                ))}
              </Select>
              <Select
                value={selectedDivision}
                display="none"
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="all">All Divisions</option>
                {DivisionData.filter(division => {
                  if (selectedDirectorate !== "all") {
                    return division.parentId === selectedDirectorate;
                  }
                  return true;
                }).map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.orgName} ({org.orgCode})
                  </option>
                ))}
              </Select>

              <Button
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={() => RefreshAction()}
                isLoading={IsLoadingProcess}
                rounded="lg"
                px={2}
              >
                <Icon as={FiRefreshCcw} boxSize={4} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                colorScheme="secondary"
                rounded="lg"
                px={2}
                as={Link}
                href="/teams-center/add"
              >
                <Icon as={FaUserPlus} boxSize={4} />
              </Button>
            </HStack>
          </Flex>

          <Box borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"} mb={6} />

          <VStack spacing={6} align="stretch">
            {IsLoadingProcess ? (
              <VStack spacing={4} py={16}>
                <Text color="gray.500" fontSize="lg">Loading teams...</Text>
              </VStack>
            ) : TeamsData.length === 0 ? (
              <VStack spacing={4} py={16}>
                <Text color="gray.500" fontSize="lg">No teams found</Text>
                {searchQuery && (
                  <Text color="gray.400" fontSize="sm">
                    Try adjusting your search terms
                  </Text>
                )}
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {TeamsData.map((team) => (
                  <Card
                    key={team.id}
                    as={Link}
                    href={`/teams-center/detail?id=${team.id}`}
                    rounded="xl"
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    shadow="sm"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{
                      shadow: "lg",
                      borderColor: colorMode === "light" ? "secondary.200" : "secondary.700",
                      bg: colorMode === "light" ? "secondary.50" : "secondary.900",
                      textDecoration: "none",
                    }}
                  >
                    <CardBody p={5} display="flex" flexDirection="column" gap={3}>
                      {/* Header: Avatar + Name */}
                      <HStack spacing={3}>
                        <Box
                          w={14}
                          h={14}
                          bg="secondary.500"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="md"
                          flexShrink={0}
                        >
                          {team.teamCode.substring(0, 2).toUpperCase()}
                        </Box>
                        <Box flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight="semibold" color="secondary.600" noOfLines={1}>
                            {team.teamName}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500">{team.teamCode}</Text>
                            <Box w="6px" h="6px" bg={team.isActive === "ACTIVE" ? "green.400" : "red.400"} rounded="full" />
                          </HStack>
                        </Box>
                        <HStack spacing={1}>
                          <Icon as={FiUsers} color="gray.400" boxSize={3.5} />
                          <Text fontSize="xs" fontWeight="semibold" color={colorMode === "light" ? "gray.600" : "gray.300"}>
                            {team.memberCount || 0}
                          </Text>
                        </HStack>
                      </HStack>

                      {/* Description */}
                      <Text fontSize="xs" color={colorMode === "light" ? "gray.600" : "gray.400"} noOfLines={2} lineHeight="tall">
                        {team.teamDesc || "No description available"}
                      </Text>

                      {/* Organization */}
                      <VStack spacing={1.5} align="start" mt="auto">
                        <HStack spacing={2}>
                          <Box w="3px" h="14px" bg="orange.400" rounded="full" />
                          <Text fontSize="xs" color={colorMode === "light" ? "orange.600" : "orange.300"} fontWeight="medium" noOfLines={1}>
                            {team.directorate?.orgName || "—"}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Box w="3px" h="14px" bg="teal.400" rounded="full" />
                          <Text fontSize="xs" color={colorMode === "light" ? "teal.600" : "teal.300"} fontWeight="medium" noOfLines={1}>
                            {team.division?.orgName || "—"}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Box w="3px" h="14px" bg="purple.400" rounded="full" />
                          <Text fontSize="xs" color={colorMode === "light" ? "purple.600" : "purple.300"} fontWeight="medium" noOfLines={1}>
                            {team.group?.orgName || "—"}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}

            {/* Pagination Controls - Same as other pages */}
            {TeamsData.length > 0 && (
              <Box mt={8}>
                <ControlTable table={table} />
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

export default TeamsCenterPage;
