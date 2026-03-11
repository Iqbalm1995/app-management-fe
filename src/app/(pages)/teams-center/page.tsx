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
import { FaUsersRays } from "react-icons/fa6";
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

      {/* UX-Friendly Dashboard Hero */}
      <Box mx={{ base: 4, md: 6 }} mt={4} mb={6}>
        <Box
          bg={colorMode === "light" ? "white" : "gray.800"}
          rounded="2xl"
          shadow="lg"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          overflow="hidden"
        >
          {/* Hero Section */}
          <Box
            bgGradient="linear(135deg, secondary.500, secondary.600, purple.500, secondary.500)"
            backgroundSize="400% 400%"
            animation="gradientMove 8s ease infinite"
            color="white"
            p={{ base: 6, md: 8 }}
            position="relative"
            sx={{
              "@keyframes gradientMove": {
                "0%, 100%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
              },
            }}
          >
            <VStack spacing={6} align="stretch">
              {/* Title & Stats Layout */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
                {/* Left - Title & Description */}
                <VStack align="start" spacing={2} flex="1" minW="300px">
                  <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
                    Teams Center
                  </Heading>
                  <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9}>
                    Manage teams, track collaboration, and boost productivity
                  </Text>
                </VStack>

                {/* Right - Quick Stats */}
                {/* <SimpleGrid
                  columns={{ base: 2, md: 2 }}
                  spacing={2}
                  minW="300px"
                >
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      {StatsData.activeTeams}
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Active Teams
                    </Text>
                  </Box>
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      {StatsData.totalTeams}
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Total Teams
                    </Text>
                  </Box>
                  <Box
                    bg="whiteAlpha.200"
                    rounded="xl"
                    p={4}
                    border="1px"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      {StatsData.totalMembers}%
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Active Rate
                    </Text>
                  </Box>
                </SimpleGrid> */}
              </Flex>
            </VStack>
          </Box>

          {/* Controls Section - Separated for Better UX */}
          <Box
            p={{ base: 4, md: 6 }}
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
          >
            <VStack spacing={4}>
              {/* Controls Row - Search & Filter Left, Refresh Right */}
              <Flex
                w="full"
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={4}
              >
                {/* Left - Search */}
                <HStack spacing={4} flex="1">
                  <InputGroup maxW="400px" flex="1">
                    <InputLeftElement>
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search teams by name or member..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={colorMode === "light" ? "white" : "gray.600"}
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.300" : "gray.500"
                      }
                      rounded="xl"
                      _focus={{
                        borderColor: "secondary.500",
                        shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                      }}
                    />
                  </InputGroup>
                </HStack>

                {/* Right - Organization Filters */}
                <HStack spacing={3}>
                  {/* Directorate Filter - HIDDEN FROM USER */}
                  <Select
                    value={selectedDirectorate}
                    isDisabled={false}
                    display="none" onChange={(e) => setSelectedDirectorate(e.target.value)}
                    maxW="160px"
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                    rounded="xl"
                    _focus={{
                      borderColor: "secondary.500",
                      bg: colorMode === "light" ? "white" : "gray.800",
                    }}
                  >
                    <option value="all">All Directorates</option>
                    {DirectorateData.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.orgName} ({org.orgCode})
                      </option>
                    ))}
                  </Select>

                  {/* Division Filter - HIDDEN FROM USER */}
                  <Select
                    value={selectedDivision}
                    isDisabled={false}
                    display="none" onChange={(e) => setSelectedDivision(e.target.value)}
                    maxW="160px"
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                    rounded="xl"
                    _focus={{
                      borderColor: "secondary.500",
                      bg: colorMode === "light" ? "white" : "gray.800",
                    }}
                  >
                    <option value="all">All Divisions</option>
                    {DivisionData.filter(division => {
                      // If directorate is selected, filter divisions under that directorate
                      if (selectedDirectorate !== "all") {
                        return division.parentId === selectedDirectorate;
                      }
                      // Otherwise show all divisions
                      return true;
                    }).map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.orgName} ({org.orgCode})
                      </option>
                    ))}
                  </Select>

                  {/* Group Filter */}
                  <Box minW="240px" maxW="380px">
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
                </HStack>

                {/* Right - Refresh Button */}
                {/* <Button
                  variant="ghost"
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => RefreshAction()}
                  isLoading={IsLoadingProcess}
                  rounded="xl"
                  size="md"
                  color={colorMode === "light" ? "gray.600" : "gray.300"}
                >
                  Refresh
                </Button> */}
              </Flex>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Main Content Card */}
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
          {/* Top Section with Action Buttons */}
          <Flex
            justify="space-between"
            align="center"
            mb={8}
            wrap="wrap"
            gap={4}
          >
            <Heading
              size="lg"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              Team Management
            </Heading>

            <HStack spacing={3}>
              <Button
                colorScheme="secondary"
                leftIcon={<Icon as={FaUsersRays} />}
                rounded="xl"
                size="md"
                as={Link}
                href="/teams-center/add"
              >
                Create Team
              </Button>
              {/* <Button
                variant="outline"
                colorScheme="secondary"
                rounded="xl"
                size="md"
              >
                Invite Members
              </Button> */}
              <Button
                variant="ghost"
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
                isLoading={IsLoadingProcess}
                rounded="xl"
                size="md"
                color={colorMode === "light" ? "gray.600" : "gray.300"}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>

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
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {TeamsData.map((team) => (
                  <Card
                    key={team.id}
                    rounded="2xl"
                    shadow="lg"
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    overflow="hidden"
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    h="full"
                    _hover={{
                      shadow: "2xl",
                      transform: "translateY(-4px)",
                      borderColor: "secondary.300",
                    }}
                    transition="all 0.3s ease"
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      h: "3px",
                      bg: team.isActive === "ACTIVE" ? "green.400" : "red.400",
                    }}
                  >
                    <CardBody p={6} display="flex" flexDirection="column">
                      <VStack spacing={5} align="start" flex="1">
                        {/* Team Header */}
                        <HStack spacing={4} w="full">
                          <Box
                            w="55px"
                            h="55px"
                            bgGradient="linear(135deg, secondary.500, secondary.600)"
                            rounded="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="bold"
                            fontSize="lg"
                            shadow="md"
                          >
                            {team.teamCode.substring(0, 2).toUpperCase()}
                          </Box>
                          <VStack align="start" spacing={1} flex="1">
                            <HStack spacing={2} align="center">
                              <Heading
                                size="md"
                                color={colorMode === "light" ? "gray.800" : "white"}
                                noOfLines={1}
                                fontWeight="bold"
                              >
                                {team.teamName}
                              </Heading>
                              <Text
                                fontSize="md"
                                color="gray.400"
                                fontWeight="medium"
                              >
                                |
                              </Text>
                              <HStack spacing={1}>
                                <Icon as={FiUsers} color="secondary.500" boxSize={4} />
                                <Text
                                  fontSize="sm"
                                  color={colorMode === "light" ? "gray.600" : "gray.400"}
                                  fontWeight="semibold"
                                >
                                  {team.memberCount || 0}
                                </Text>
                              </HStack>
                            </HStack>
                            <HStack spacing={2}>
                              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                {team.teamCode}
                              </Text>
                              <Box
                                w="8px"
                                h="8px"
                                bg={team.isActive === "ACTIVE" ? "green.400" : "red.400"}
                                rounded="full"
                                shadow="sm"
                              />
                            </HStack>
                          </VStack>
                        </HStack>

                        {/* Description */}
                        <Text
                          fontSize="sm"
                          color={colorMode === "light" ? "gray.600" : "gray.400"}
                          noOfLines={2}
                          lineHeight="1.6"
                        >
                          {team.teamDesc || "No description available"}
                        </Text>

                        {/* Organization Info */}
                        <Box w="full">
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={2}
                          >
                            Organization
                          </Text>
                          <VStack spacing={2} w="full" align="start">
                            <HStack spacing={2}>
                              <Box w="3px" h="16px" bg="orange.400" rounded="full" />
                              <Text fontSize="sm" color="orange.600" fontWeight="medium" noOfLines={1}>
                                {team.directorate?.orgName || "N/A"}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Box w="3px" h="16px" bg="teal.400" rounded="full" />
                              <Text fontSize="sm" color="teal.600" fontWeight="medium" noOfLines={1}>
                                {team.division?.orgName || "N/A"}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Box w="3px" h="16px" bg="pink.400" rounded="full" />
                              <Text fontSize="sm" color="pink.600" fontWeight="medium" noOfLines={1}>
                                {team.group?.orgName || "N/A"}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                      </VStack>

                      {/* Actions - Always at bottom */}
                      <Button
                        size="md"
                        bgGradient="linear(to-r, secondary.500, secondary.600)"
                        color="white"
                        rounded="xl"
                        w="full"
                        mt={4}
                        _hover={{
                          bgGradient: "linear(to-r, secondary.600, secondary.700)",
                          transform: "translateY(-1px)",
                          shadow: "lg",
                        }}
                        transition="all 0.2s"
                        fontWeight="semibold"
                        as={Link}
                        href={`/teams-center/detail?id=${team.id}`}
                      >
                        Details
                      </Button>
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
