"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiEdit,
  FiFileText,
  FiFilter,
  FiGitCommit,
  FiLayers,
  FiLock,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiTarget,
  FiActivity,
  FiZap,
} from "react-icons/fi";

// Services & Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import useMstRbb, { MstRbbResponse } from "@/app/services/useMstRbb";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import moment from "moment";

export default function MasterRbbDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { GetDetailMstRbb, isLoading } = useMstRbb();

  const rbbId = searchParams.get("id") || "";
  const [tokenData, setTokenData] = useState<string>("");
  const [detailData, setDetailData] = useState<MstRbbResponse | null>(null);

  // Tab 2 Interactive Filter States
  const [wpSearchQuery, setWpSearchQuery] = useState<string>("");
  const [wpBudgetTypeFilter, setWpBudgetTypeFilter] = useState<string>("ALL");

  // Accordion toggle states for history items
  const [expandedHistoryRows, setExpandedHistoryRows] = useState<Record<string, boolean>>({});

  const toggleHistoryRow = (id: string) => {
    setExpandedHistoryRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
      if (rbbId) {
        fetchDetail(rbbId, token);
      }
    }
  }, [rbbId]);

  const fetchDetail = async (id: string, token: string) => {
    try {
      const res = await GetDetailMstRbb(id, token);
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setDetailData(res.data);
      } else {
        showToast({ description: res?.message || "Failed to load Master RBB detail", statusToast: "error" });
      }
    } catch (err) {
      console.error("Error fetching Master RBB detail:", err);
    }
  };

  const HeaderDataContent: HeaderContentProps = useMemo(
    () => ({
      titleName: `Master RBB Detail — ${detailData?.targetCode || "Loading..."}`,
      breadCrumb: ["Home", "Master Data", "Master RBB", detailData?.targetCode || "Detail"],
    }),
    [detailData]
  );

  // Aggregated Total Budget Calculation
  const totalBudget = useMemo(() => {
    if (!detailData?.workPrograms) return 0;
    return detailData.workPrograms.reduce((acc, wp) => acc + (wp.budgetValue || 0), 0);
  }, [detailData]);

  // CAPEX vs OPEX Budget Sum & Counts
  const budgetStats = useMemo(() => {
    if (!detailData?.workPrograms || detailData.workPrograms.length === 0) {
      return { capexCount: 0, opexCount: 0, capexSum: 0, opexSum: 0 };
    }
    let capexCount = 0, opexCount = 0, capexSum = 0, opexSum = 0;
    detailData.workPrograms.forEach((wp) => {
      if (wp.budgetType?.toUpperCase() === "CAPEX") {
        capexCount++;
        capexSum += wp.budgetValue || 0;
      } else {
        opexCount++;
        opexSum += wp.budgetValue || 0;
      }
    });
    return { capexCount, opexCount, capexSum, opexSum };
  }, [detailData]);

  // Filtered Work Programs List for Tab 2
  const filteredWorkPrograms = useMemo(() => {
    if (!detailData?.workPrograms) return [];
    return detailData.workPrograms.filter((wp) => {
      const matchesSearch =
        !wpSearchQuery ||
        wp.workProgramCode.toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
        wp.workProgramDesc.toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
        wp.itspName.toLowerCase().includes(wpSearchQuery.toLowerCase());

      const matchesType =
        wpBudgetTypeFilter === "ALL" ||
        wp.budgetType.toUpperCase() === wpBudgetTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [detailData, wpSearchQuery, wpBudgetTypeFilter]);

  if (isLoading && !detailData) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="500px" w="full">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="sm" color="gray.500">Loading Master RBB Details...</Text>
          </VStack>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Hero Overview Header Card */}
      <Box
        position="relative"
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        rounded={radiusStyle}
        shadow="xl"
        mx={{ base: 2, md: 4 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        p={{ base: 5, md: 6 }}
      >
        <VStack spacing={5} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                onClick={() => router.push("/master-data/rbb")}
              >
                Back to Directory
              </Button>
              <Box w="1px" h="30px" bg="gray.300" />
              <VStack align="start" spacing={0}>
                <HStack spacing={2} wrap="wrap">
                  <Badge colorScheme="blue" rounded="md" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                    Target: {detailData?.targetCode || "-"}
                  </Badge>
                  <Badge colorScheme="purple" rounded="md" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                    Policy: {detailData?.policyCode || "-"}
                  </Badge>
                  <Badge colorScheme="teal" rounded="md" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                    Strategy: {detailData?.strategyCode || "-"}
                  </Badge>
                  <Tag size="sm" colorScheme="green" variant="subtle" rounded="full">
                    <TagLeftIcon as={FiShield} />
                    <TagLabel fontSize="3xs" fontWeight="bold">Verified Record</TagLabel>
                  </Tag>
                </HStack>
                <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"} mt={1}>
                  {detailData?.targetName || "N/A"}
                </Heading>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiRefreshCcw />}
                onClick={() => tokenData && rbbId && fetchDetail(rbbId, tokenData)}
                isLoading={isLoading}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiEdit />}
                onClick={() => router.push(`/master-data/rbb/edit?id=${rbbId}`)}
                shadow="md"
              >
                Edit Target & Programs
              </Button>
            </HStack>
          </Flex>

          <Divider />

          {/* Enhanced Quick Metrics Bar */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
            <Box p={4} rounded="xl" bg={colorMode === "light" ? "blue.50" : "gray.700"} borderLeft="4px" borderColor="blue.500">
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">DIRECTORATE / DIVISION</Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.600" noOfLines={1} mt={1}>
                {detailData?.orgDirectorateName} / {detailData?.orgDivisionName}
              </Text>
              {detailData?.orgGroupName && (
                <Text fontSize="3xs" color="gray.500" mt={0.5}>Group: {detailData.orgGroupName}</Text>
              )}
            </Box>

            <Box p={4} rounded="xl" bg={colorMode === "light" ? "purple.50" : "gray.700"} borderLeft="4px" borderColor="purple.500">
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">WORK PROGRAMS & ALLOCATION</Text>
              <Text fontSize="xs" fontWeight="bold" color="purple.600" mt={1}>
                {detailData?.workPrograms?.length || 0} Total Programs
              </Text>
              <Text fontSize="3xs" color="gray.500" mt={0.5}>
                CAPEX ({budgetStats.capexCount}) — OPEX ({budgetStats.opexCount})
              </Text>
            </Box>

            <Box p={4} rounded="xl" bg={colorMode === "light" ? "teal.50" : "gray.700"} borderLeft="4px" borderColor="teal.500">
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">TOTAL ALLOCATED BUDGET</Text>
              <Text fontSize="sm" fontWeight="bold" color="teal.600" mt={1}>
                {formatIDR(totalBudget)}
              </Text>
              <Text fontSize="3xs" color="gray.500" mt={0.5}>
                CAPEX: {formatIDR(budgetStats.capexSum)}
              </Text>
            </Box>

            <Box p={4} rounded="xl" bg={colorMode === "light" ? "orange.50" : "gray.700"} borderLeft="4px" borderColor="orange.500">
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">REGISTRATION & HISTORY</Text>
              <Text fontSize="xs" fontWeight="bold" color="orange.600" mt={1}>
                {detailData?.createdAt ? moment(detailData.createdAt).format("DD MMM YYYY, HH:mm") : "-"}
              </Text>
              <Text fontSize="3xs" color="gray.500" mt={0.5}>
                {detailData?.historyList?.length || 0} Revision Snapshots
              </Text>
            </Box>
          </Grid>
        </VStack>
      </Box>

      {/* Main Enhanced Tabbed Details Section */}
      <Box px={{ base: 2, md: 4 }} pb={12} w="full">
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList borderBottom="2px" borderColor="blue.100">
            <Tab fontWeight="bold" fontSize="sm" py={3} _selected={{ color: "blue.600", bg: colorMode === "light" ? "white" : "gray.800", borderColor: "blue.200", borderBottomColor: "transparent" }}>
              <Icon as={FiTarget} mr={2} boxSize={4} /> Target & Policy Specifications
            </Tab>
            <Tab fontWeight="bold" fontSize="sm" py={3} _selected={{ color: "teal.600", bg: colorMode === "light" ? "white" : "gray.800", borderColor: "teal.200", borderBottomColor: "transparent" }}>
              <Icon as={FiBriefcase} mr={2} boxSize={4} /> Work Programs ({detailData?.workPrograms?.length || 0})
            </Tab>
            <Tab fontWeight="bold" fontSize="sm" py={3} _selected={{ color: "purple.600", bg: colorMode === "light" ? "white" : "gray.800", borderColor: "purple.200", borderBottomColor: "transparent" }}>
              <Icon as={FiClock} mr={2} boxSize={4} /> Revision History Timeline ({detailData?.historyList?.length || 0})
            </Tab>
          </TabList>

          <TabPanels pt={6}>
            {/* TAB 1: TARGET, POLICY & STRATEGY SPECIFICATIONS */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch" w="full">
                {/* Visual Alignment Flow Diagram Banner */}
                <Card rounded="2xl" shadow="md" bg={colorMode === "light" ? "blue.50/40" : "gray.800"} border="1px" borderColor="blue.200">
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={3}>
                      <HStack spacing={3}>
                        <Box w={8} h={8} bg="blue.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                          <FiZap size={18} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="xs" color="blue.700">STRATEGIC GOAL CASCADE ALIGNMENT</Heading>
                          <Text fontSize="3xs" color="gray.500">Corporate Strategic Architecture Mapping Visualizer</Text>
                        </VStack>
                      </HStack>

                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} pt={2}>
                        <Box p={3} rounded="xl" bg={colorMode === "light" ? "white" : "gray.900"} shadow="sm" border="1px" borderColor="blue.100">
                          <Badge colorScheme="blue" mb={1} fontSize="3xs">1. Directorate & Division</Badge>
                          <Text fontWeight="bold" fontSize="xs" color="blue.600" noOfLines={1}>{detailData?.orgDirectorateName}</Text>
                          <Text fontSize="3xs" color="gray.500">{detailData?.orgDivisionName}</Text>
                        </Box>

                        <Box p={3} rounded="xl" bg={colorMode === "light" ? "white" : "gray.900"} shadow="sm" border="1px" borderColor="purple.100">
                          <Badge colorScheme="purple" mb={1} fontSize="3xs">2. Corporate Target & Policy</Badge>
                          <Text fontWeight="bold" fontSize="xs" color="purple.600" noOfLines={1}>[{detailData?.targetCode}] {detailData?.targetName}</Text>
                          <Text fontSize="3xs" color="gray.500" noOfLines={1}>Policy: {detailData?.policyName}</Text>
                        </Box>

                        <Box p={3} rounded="xl" bg={colorMode === "light" ? "white" : "gray.900"} shadow="sm" border="1px" borderColor="teal.100">
                          <Badge colorScheme="teal" mb={1} fontSize="3xs">3. Executing Strategy</Badge>
                          <Text fontWeight="bold" fontSize="xs" color="teal.600" noOfLines={1}>[{detailData?.strategyCode}] {detailData?.strategyName}</Text>
                          <Text fontSize="3xs" color="gray.500">Programs: {detailData?.workPrograms?.length || 0} items</Text>
                        </Box>
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                {/* Organization Hierarchy Specification Card */}
                <Card rounded="2xl" shadow="lg" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "blue.100" : "blue.900"}>
                  <CardHeader bg={colorMode === "light" ? "blue.50/50" : "gray.700"} roundedTop="2xl" py={4}>
                    <HStack spacing={3}>
                      <Box w={9} h={9} bg="blue.500" rounded="xl" color="white" display="flex" alignItems="center" justifyContent="center" shadow="sm">
                        <FiLayers size={20} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="xs" color="blue.600">ORGANIZATION HIERARCHY MAPPINGS</Heading>
                        <Text fontSize="3xs" color="gray.500">Master Directorate, Division & Group Structure</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={5} fontSize="xs">
                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Directorate</Text>
                        <Text fontWeight="bold" fontSize="sm" color="blue.600" mt={1}>
                          {detailData?.orgDirectorateName} ({detailData?.orgDirectorateCode})
                        </Text>
                        <Text fontSize="3xs" color="gray.400" mt={0.5}>ID: {detailData?.orgDirectorateId}</Text>
                      </Box>

                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Division</Text>
                        <Text fontWeight="bold" fontSize="sm" color="teal.600" mt={1}>
                          {detailData?.orgDivisionName} ({detailData?.orgDivisionCode})
                        </Text>
                        <Text fontSize="3xs" color="gray.400" mt={0.5}>ID: {detailData?.orgDivisionId}</Text>
                      </Box>

                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Group</Text>
                        <Text fontWeight="bold" fontSize="sm" color="purple.600" mt={1}>
                          {detailData?.orgGroupName ? `${detailData.orgGroupName} (${detailData.orgGroupCode})` : "N/A (NO GROUP ASSIGNED)"}
                        </Text>
                        {detailData?.orgGroupId && <Text fontSize="3xs" color="gray.400" mt={0.5}>ID: {detailData.orgGroupId}</Text>}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Target & Strategic Identifiers Specification Card */}
                <Card rounded="2xl" shadow="lg" bg={colorMode === "light" ? "white" : "gray.800"} border="1px" borderColor={colorMode === "light" ? "purple.100" : "purple.900"}>
                  <CardHeader bg={colorMode === "light" ? "purple.50/50" : "gray.700"} roundedTop="2xl" py={4}>
                    <HStack spacing={3}>
                      <Box w={9} h={9} bg="purple.500" rounded="xl" color="white" display="flex" alignItems="center" justifyContent="center" shadow="sm">
                        <FiCompass size={20} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="xs" color="purple.600">STRATEGIC GOALS & TARGET IDENTIFIERS</Heading>
                        <Text fontSize="3xs" color="gray.500">Corporate Target, Strategic Policy & Strategy Specs</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={5} fontSize="xs">
                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Target Code & Description</Text>
                        <HStack mt={1} spacing={3}>
                          <Badge colorScheme="blue" rounded="md" px={2.5} py={0.5} fontSize="xs">{detailData?.targetCode}</Badge>
                          <Text fontWeight="bold" fontSize="sm">{detailData?.targetName}</Text>
                        </HStack>
                      </Box>

                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Policy Code & Strategic Policy</Text>
                        <HStack mt={1} spacing={3}>
                          <Badge colorScheme="purple" rounded="md" px={2.5} py={0.5} fontSize="xs">{detailData?.policyCode}</Badge>
                          <Text fontWeight="bold" fontSize="sm">{detailData?.policyName}</Text>
                        </HStack>
                      </Box>

                      <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                        <Text color="gray.500" fontWeight="bold">Strategy Code & Strategy Name</Text>
                        <HStack mt={1} spacing={3}>
                          <Badge colorScheme="teal" rounded="md" px={2.5} py={0.5} fontSize="xs">{detailData?.strategyCode}</Badge>
                          <Text fontWeight="bold" fontSize="sm">{detailData?.strategyName}</Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
                </Grid>
              </VStack>
            </TabPanel>

            {/* TAB 2: WORK PROGRAMS ALLOCATION GRID */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch" w="full">
                {/* Summary Financial Header Banner */}
                <Card rounded="2xl" shadow="md" bg={colorMode === "light" ? "teal.50/50" : "gray.800"} border="1px" borderColor="teal.200">
                  <CardBody p={5}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                      <HStack spacing={3}>
                        <Box w={9} h={9} bg="teal.500" rounded="xl" color="white" display="flex" alignItems="center" justifyContent="center">
                          <FiBriefcase size={20} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="xs" color="teal.700">Allocated Work Programs ({detailData?.workPrograms?.length || 0})</Heading>
                          <Text fontSize="2xs" color="gray.500">Comprehensive Financial & SLA Allocation Breakdown</Text>
                        </VStack>
                      </HStack>

                      <HStack spacing={6} wrap="wrap">
                        <VStack align="end" spacing={0}>
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">CAPEX ALLOCATION</Text>
                          <Text fontSize="xs" fontWeight="bold" color="blue.600">{formatIDR(budgetStats.capexSum)} ({budgetStats.capexCount} items)</Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">OPEX ALLOCATION</Text>
                          <Text fontSize="xs" fontWeight="bold" color="purple.600">{formatIDR(budgetStats.opexSum)} ({budgetStats.opexCount} items)</Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontSize="3xs" color="gray.500" fontWeight="bold">TOTAL TARGET BUDGET</Text>
                          <Text fontSize="sm" fontWeight="bold" color="teal.600">{formatIDR(totalBudget)}</Text>
                        </VStack>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Interactive Filter Toolbar for Work Programs */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={4} bg={colorMode === "light" ? "white" : "gray.800"} p={4} rounded="2xl" shadow="sm" border="1px" borderColor="gray.100">
                  <HStack spacing={3} flex={1} minW="260px">
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search program code, description, or ITSP..."
                        rounded="lg"
                        value={wpSearchQuery}
                        onChange={(e) => setWpSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </HStack>

                  <HStack spacing={3}>
                    <HStack spacing={2}>
                      <FiFilter size={14} color="gray" />
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">Budget Type:</Text>
                    </HStack>
                    <Select
                      size="sm"
                      rounded="lg"
                      w="140px"
                      value={wpBudgetTypeFilter}
                      onChange={(e) => setWpBudgetTypeFilter(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="CAPEX">CAPEX</option>
                      <option value="OPEX">OPEX</option>
                    </Select>
                  </HStack>
                </Flex>

                {filteredWorkPrograms.length === 0 ? (
                  <Card rounded="2xl" p={8} align="center">
                    <Text color="gray.500" fontSize="sm">No Work Programs match the selected filter criteria.</Text>
                  </Card>
                ) : (
                  filteredWorkPrograms.map((wp, index) => (
                    <Card
                      key={wp.id}
                      rounded="2xl"
                      shadow="lg"
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    >
                      <CardBody p={6}>
                        <VStack spacing={5} align="stretch">
                          {/* Program Card Header */}
                          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={3}>
                              <Badge colorScheme="blue" rounded="lg" px={3} py={1} fontSize="xs" fontWeight="bold">
                                Program #{index + 1}
                              </Badge>
                              <Heading size="xs" color={colorMode === "light" ? "gray.800" : "white"}>
                                {wp.workProgramCode}
                              </Heading>
                              <Badge colorScheme={wp.budgetType === "CAPEX" ? "blue" : "purple"} rounded="lg" px={2.5} py={0.5} fontSize="2xs">
                                {wp.budgetType}
                              </Badge>
                              <Badge colorScheme="teal" rounded="lg" px={2.5} py={0.5} fontSize="2xs">
                                {wp.workProgramType}
                              </Badge>
                            </HStack>

                            <HStack spacing={3}>
                              <Badge colorScheme="green" rounded="full" px={3} py={1} fontSize="xs" fontWeight="bold">
                                Data Center: {wp.dataCenter}
                              </Badge>
                              <Text fontSize="sm" fontWeight="bold" color="purple.600">
                                {formatIDR(wp.budgetValue)}
                              </Text>
                            </HStack>
                          </Flex>

                          <Divider />

                          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5} fontSize="xs">
                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">ITSP Code / Name / Initials</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>{wp.itspCode} — {wp.itspName}</Text>
                              <Badge colorScheme="gray" fontSize="3xs" mt={0.5}>{wp.itspInit}</Badge>
                            </Box>

                            <GridItem colSpan={{ base: 1, md: 2 }} p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Work Program Description</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>{wp.workProgramDesc}</Text>
                            </GridItem>

                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Init Org Group Data</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>{wp.initOrgGroupName || "N/A"} ({wp.initOrgGroupCode || "-"})</Text>
                            </Box>

                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">LG Account Number & Name</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>{wp.lgAccountNumber}</Text>
                              <Text fontSize="3xs" color="gray.500">{wp.lgAccountName}</Text>
                            </Box>

                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Bundling Input Rembis / Budget</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>{wp.bundlingInputRembis || "-"}</Text>
                              <Text fontSize="3xs" color="purple.600" fontWeight="bold">Bundling: {formatIDR(wp.bundlingBudget)}</Text>
                            </Box>

                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Period SLA & Timeline</Text>
                              <Text fontWeight="bold" fontSize="xs" mt={1}>Year {wp.periodYear} ({wp.periodQuartal})</Text>
                              <Badge colorScheme="orange" fontSize="3xs" mt={0.5}>SLA: {wp.periodTime} Days</Badge>
                            </Box>

                            {wp.note && (
                              <GridItem colSpan={{ base: 1, md: 3 }} p={3} rounded="xl" bg={colorMode === "light" ? "yellow.50/50" : "gray.900"} borderLeft="3px" borderColor="yellow.400">
                                <Text color="gray.600" fontWeight="bold">Note / Remarks</Text>
                                <Text fontWeight="normal" color="gray.700" mt={0.5}>{wp.note}</Text>
                              </GridItem>
                            )}
                          </Grid>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            </TabPanel>

            {/* TAB 3: REVISION HISTORY TIMELINE */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch" w="full">
                {/* Timeline Header Card */}
                <Card rounded="2xl" shadow="md" bg={colorMode === "light" ? "purple.50/50" : "gray.800"} border="1px" borderColor="purple.200">
                  <CardBody p={5}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                      <HStack spacing={3}>
                        <Box w={9} h={9} bg="purple.500" rounded="xl" color="white" display="flex" alignItems="center" justifyContent="center">
                          <FiClock size={20} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="xs" color="purple.700">Audit History Timeline ({detailData?.historyList?.length || 0})</Heading>
                          <Text fontSize="2xs" color="gray.500">Automated Audit Snapshot Log Recorded During Target Revisions</Text>
                        </VStack>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>

                {!detailData?.historyList || detailData.historyList.length === 0 ? (
                  <Card rounded="2xl" p={8} align="center">
                    <Text color="gray.500" fontSize="sm">No revision history recorded for this Master RBB Target yet.</Text>
                  </Card>
                ) : (
                  <VStack spacing={6} align="stretch" w="full">
                    {detailData.historyList.map((hist, idx) => {
                      const isExpanded = expandedHistoryRows[hist.id] || false;
                      const revNum = detailData.historyList!.length - idx;
                      const isLast = idx === detailData.historyList!.length - 1;

                      return (
                        <HStack key={hist.id} align="stretch" spacing={{ base: 3, md: 4 }} w="full">
                          {/* Left Timeline Node Indicator Column */}
                          <VStack spacing={0} align="center" pt={4} w="32px">
                            <Box
                              w={8}
                              h={8}
                              bg="purple.500"
                              color="white"
                              rounded="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="md"
                              zIndex={1}
                            >
                              <FiGitCommit size={16} />
                            </Box>
                            {!isLast && <Box w="2px" bg="purple.200" flex={1} my={1} />}
                          </VStack>

                          {/* Main Revision History Detail Card */}
                          <Card
                            flex={1}
                            rounded="2xl"
                            shadow="lg"
                            bg={colorMode === "light" ? "white" : "gray.800"}
                            border="1px"
                            borderColor={colorMode === "light" ? "purple.200" : "purple.900"}
                          >
                            <CardBody p={5}>
                              <VStack spacing={4} align="stretch">
                                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                  <HStack spacing={3}>
                                    <Badge colorScheme="purple" rounded="xl" px={3} py={1} fontSize="xs" fontWeight="bold">
                                      Revision #{revNum} Snapshot
                                    </Badge>
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold" fontSize="sm" color="purple.600">
                                        {hist.targetCode} — {hist.targetName}
                                      </Text>
                                      <Text fontSize="3xs" color="gray.500">
                                        Recorded on: {hist.createdAt ? moment(hist.createdAt).format("DD MMMM YYYY, HH:mm:ss") : "-"}
                                      </Text>
                                    </VStack>
                                  </HStack>

                                  <HStack spacing={3}>
                                    <Badge colorScheme="blue" rounded="full" px={3} py={0.5} fontSize="2xs">
                                      {hist.workProgramsHistoryList?.length || 0} Historic Programs
                                    </Badge>
                                    <IconButton
                                      aria-label="Toggle details"
                                      size="xs"
                                      variant="outline"
                                      icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                      onClick={() => toggleHistoryRow(hist.id)}
                                    />
                                  </HStack>
                                </Flex>

                                <Divider />

                                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} fontSize="xs">
                                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                    <Text color="gray.500" fontWeight="bold">Historic Organization</Text>
                                    <Text fontWeight="bold" mt={0.5}>{hist.orgDirectorateName} / {hist.orgDivisionName}</Text>
                                    {hist.orgGroupName && <Text fontSize="3xs" color="gray.500">Group: {hist.orgGroupName}</Text>}
                                  </Box>

                                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                    <Text color="gray.500" fontWeight="bold">Historic Policy</Text>
                                    <Text fontWeight="bold" mt={0.5}>{hist.policyCode} — {hist.policyName}</Text>
                                  </Box>

                                  <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                    <Text color="gray.500" fontWeight="bold">Historic Strategy</Text>
                                    <Text fontWeight="bold" mt={0.5}>{hist.strategyCode} — {hist.strategyName}</Text>
                                  </Box>
                                </Grid>

                                {/* Historic Work Programs Drawer */}
                                <Collapse in={isExpanded} animateOpacity>
                                  <VStack align="stretch" spacing={3} pt={3}>
                                    <Heading size="2xs" color="purple.600">Historic Work Programs Snapshot ({hist.workProgramsHistoryList?.length || 0})</Heading>
                                    {hist.workProgramsHistoryList && hist.workProgramsHistoryList.length > 0 ? (
                                      hist.workProgramsHistoryList.map((wpHist, wpIdx) => (
                                        <Box key={wpHist.id} p={3} rounded="xl" border="1px" borderColor="purple.100" bg={colorMode === "light" ? "purple.50/30" : "gray.900"} fontSize="2xs">
                                          <Flex justify="space-between" align="center" mb={1}>
                                            <Text fontWeight="bold" color="purple.700">#{wpIdx + 1} {wpHist.workProgramCode} — {wpHist.workProgramDesc}</Text>
                                            <Text fontWeight="bold" color="teal.600">{formatIDR(wpHist.budgetValue)} ({wpHist.budgetType})</Text>
                                          </Flex>
                                          <Text color="gray.500">ITSP: {wpHist.itspCode} ({wpHist.itspInit}) | Data Center: {wpHist.dataCenter} | SLA: {wpHist.periodTime} Days</Text>
                                        </Box>
                                      ))
                                    ) : (
                                      <Text fontSize="2xs" color="gray.500">No historic work programs attached to this revision.</Text>
                                    )}
                                  </VStack>
                                </Collapse>
                              </VStack>
                            </CardBody>
                          </Card>
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}
