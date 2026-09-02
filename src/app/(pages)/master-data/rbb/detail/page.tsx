"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  Progress,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
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
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiEdit,
  FiFileText,
  FiFilter,
  FiGitCommit,
  FiLayers,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiTarget,
  FiActivity,
  FiZap,
  FiBarChart,
  FiCpu,
  FiServer,
  FiPieChart,
} from "react-icons/fi";

// Services & Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import useMstRbb, { MstRbbResponse } from "@/app/services/useMstRbb";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { TabButtonCustomStyle, TabButtonCustomStyleHighLight } from "@/app/components/TabsCustom";
import moment from "moment";

function MasterRbbDetailView() {
  useDocumentTitle("Detail Master RBB");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { GetDetailMstRbb, isLoading } = useMstRbb();
  const tabsRef = useRef<HTMLDivElement>(null);

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

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 250;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
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
      titleName: "Master RBB Detail",
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
      return { capexCount: 0, opexCount: 0, capexSum: 0, opexSum: 0, capexPercent: 0, opexPercent: 0 };
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
    const total = capexSum + opexSum;
    const capexPercent = total > 0 ? Math.round((capexSum / total) * 100) : 0;
    const opexPercent = total > 0 ? Math.round((opexSum / total) * 100) : 0;

    return { capexCount, opexCount, capexSum, opexSum, capexPercent, opexPercent };
  }, [detailData]);

  // Data Center Distribution Analytics
  const dataCenterStats = useMemo(() => {
    if (!detailData?.workPrograms) return { dc1Count: 0, dc2Count: 0, otherCount: 0 };
    let dc1Count = 0, dc2Count = 0, otherCount = 0;
    detailData.workPrograms.forEach((wp) => {
      const dc = (wp.dataCenter || "").toUpperCase();
      if (dc.includes("DC1")) dc1Count++;
      if (dc.includes("DC2")) dc2Count++;
      if (!dc.includes("DC1") && !dc.includes("DC2") && dc.length > 0) otherCount++;
    });
    return { dc1Count, dc2Count, otherCount };
  }, [detailData]);

  // Quartal Breakdown Analytics
  const quartalStats = useMemo(() => {
    if (!detailData?.workPrograms) return { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const qMap: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    detailData.workPrograms.forEach((wp) => {
      const q = wp.periodQuartal?.toUpperCase() || "Q1";
      if (qMap[q] !== undefined) qMap[q]++;
      else qMap[q] = 1;
    });
    return qMap;
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
            <Spinner size="xl" color="secondary.500" thickness="4px" />
            <Text fontSize="sm" color="gray.500">Loading Master RBB Details...</Text>
          </VStack>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent titleName={HeaderDataContent.titleName} breadCrumb={HeaderDataContent.breadCrumb} />

      {/* Simplified & Clean Hero Header */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="xl"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
        >
          {/* Left: Back Action + Target Icon + Details */}
          <HStack spacing={{ base: 3, md: 4 }} align="center" flex={1}>
            <IconButton
              aria-label="Back to Directory"
              icon={<FiArrowLeft />}
              variant="ghost"
              size="sm"
              color="white"
              bg="whiteAlpha.150"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{
                bg: "whiteAlpha.300",
                transform: "translateX(-2px)",
              }}
              rounded="full"
              onClick={() => router.push("/master-data/rbb")}
              transition="all 0.2s ease"
            />

            <Box
              w={{ base: "44px", md: "50px" }}
              h={{ base: "44px", md: "50px" }}
              bgGradient="linear(to-br, secondary.100, secondary.50)"
              rounded="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="secondary.800"
              flexShrink={0}
              shadow="md"
            >
              <FiTarget size={24} />
            </Box>

            <VStack align="start" spacing={1}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  px={2.5}
                  py={0.5}
                  rounded="full"
                  fontSize="2xs"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  Target: {detailData?.targetCode || "-"}
                </Badge>
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  px={2.5}
                  py={0.5}
                  rounded="full"
                  fontSize="2xs"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  Policy: {detailData?.policyCode || "-"}
                </Badge>
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  px={2.5}
                  py={0.5}
                  rounded="full"
                  fontSize="2xs"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  Strategy: {detailData?.strategyCode || "-"}
                </Badge>
              </HStack>

              <Heading
                size="md"
                fontWeight="700"
                color="white"
                lineHeight="shorter"
              >
                {detailData?.targetName || "N/A"}
              </Heading>

              <HStack spacing={2} fontSize="2xs" color="whiteAlpha.850" wrap="wrap">
                <Text fontWeight="semibold">{detailData?.orgDirectorateName || "-"}</Text>
                <Text opacity={0.6}>•</Text>
                <Text fontWeight="semibold">{detailData?.orgDivisionName || "-"}</Text>
                {detailData?.orgGroupName && (
                  <>
                    <Text opacity={0.6}>•</Text>
                    <Text fontWeight="semibold">{detailData.orgGroupName}</Text>
                  </>
                )}
                <Text opacity={0.6}>•</Text>
                <Text color="secondary.200" fontWeight="bold">
                  {detailData?.workPrograms?.length || 0} Programs ({formatIDR(totalBudget)})
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Right: Quick Action Buttons */}
          <HStack spacing={2} alignSelf={{ base: "flex-end", md: "center" }}>
            <Button
              leftIcon={<FiRefreshCcw />}
              variant="outline"
              size="sm"
              onClick={() => tokenData && rbbId && fetchDetail(rbbId, tokenData)}
              isLoading={isLoading}
              borderColor="whiteAlpha.300"
              color="white"
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              _hover={{
                bg: "whiteAlpha.200",
                borderColor: "whiteAlpha.400",
              }}
              rounded="full"
              px={3.5}
              transition="all 0.2s ease"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiEdit />}
              size="sm"
              bg="secondary.400"
              color="white"
              _hover={{
                bg: "secondary.300",
                transform: "translateY(-1px)",
              }}
              rounded="full"
              px={4}
              shadow="md"
              onClick={() => router.push(`/master-data/rbb/edit?id=${rbbId}`)}
              transition="all 0.2s ease"
            >
              Edit Target & Programs
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Full-Width Tabbed Details Section (No Sidebar) */}
      <Box px={{ base: 2, md: 4 }} pb={12} w="full">
        <Tabs variant="unstyled" isLazy>
          {/* Tab Navigation Header with Left/Right Scroll Controls */}
          <Box position="relative" mb={4}>
            <Flex
              ref={tabsRef}
              gap={2}
              p={2}
              overflowX="auto"
              justifyContent="start"
              alignItems="center"
              sx={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              <TabList gap={2} border="none">
                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiTarget size={16} />
                    <Text>Overview & Hierarchy</Text>
                  </HStack>
                </TabButtonCustomStyle>

                <TabButtonCustomStyleHighLight>
                  <HStack spacing={2}>
                    <FiBriefcase size={16} />
                    <Text>Work Programs ({detailData?.workPrograms?.length || 0})</Text>
                  </HStack>
                </TabButtonCustomStyleHighLight>

                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiBarChart size={16} />
                    <Text>Financial Analytics</Text>
                  </HStack>
                </TabButtonCustomStyle>

                <TabButtonCustomStyle>
                  <HStack spacing={2}>
                    <FiClock size={16} />
                    <Text>Revision History ({detailData?.historyList?.length || 0})</Text>
                  </HStack>
                </TabButtonCustomStyle>
              </TabList>

              <Flex ml="auto" pl={2}>
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("left")}
                    bg={colorMode === "light" ? "secondary.500" : "secondary.700"}
                    shadow="md"
                    _hover={{
                      bg: colorMode === "light" ? "secondary.400" : "secondary.600",
                    }}
                    color="white"
                  >
                    <FiChevronLeft />
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => scrollTabs("right")}
                    bg={colorMode === "light" ? "secondary.500" : "secondary.700"}
                    shadow="md"
                    _hover={{
                      bg: colorMode === "light" ? "secondary.400" : "secondary.600",
                    }}
                    color="white"
                  >
                    <FiChevronRight />
                  </Button>
                </HStack>
              </Flex>
            </Flex>
          </Box>

          {/* Main Tab Panels Container */}
          <Card
            shadow="xl"
            rounded={radiusStyle}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            overflow="hidden"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <TabPanels minH="550px">
                {/* ========================================================= */}
                {/* TAB 1: OVERVIEW & STRATEGIC HIERARCHY */}
                {/* ========================================================= */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch" w="full">
                    {/* Visual Alignment Flow Diagram Banner */}
                    <Card
                      rounded="2xl"
                      shadow="sm"
                      bg={colorMode === "light" ? "secondary.50" : "gray.900"}
                      border="1px"
                      borderColor={colorMode === "light" ? "secondary.200" : "secondary.800"}
                    >
                      <CardBody p={5}>
                        <VStack align="stretch" spacing={3}>
                          <HStack spacing={3}>
                            <Box
                              w={9}
                              h={9}
                              bg="secondary.500"
                              rounded="xl"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="sm"
                            >
                              <FiZap size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color={colorMode === "light" ? "secondary.800" : "secondary.200"}>
                                STRATEGIC GOAL CASCADE ALIGNMENT
                              </Heading>
                              <Text fontSize="2xs" color="gray.500">
                                Corporate Strategic Architecture Mapping Visualizer
                              </Text>
                            </VStack>
                          </HStack>

                          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} pt={2}>
                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="sm"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            >
                              <Badge colorScheme="blue" mb={1.5} fontSize="3xs" rounded="md" px={2}>
                                1. Directorate & Division
                              </Badge>
                              <Text fontWeight="bold" fontSize="xs" color="blue.600" noOfLines={1}>
                                {detailData?.orgDirectorateName}
                              </Text>
                              <Text fontSize="3xs" color="gray.500">
                                {detailData?.orgDivisionName}
                              </Text>
                            </Box>

                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="sm"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            >
                              <Badge colorScheme="purple" mb={1.5} fontSize="3xs" rounded="md" px={2}>
                                2. Corporate Target & Policy
                              </Badge>
                              <Text fontWeight="bold" fontSize="xs" color="purple.600" noOfLines={1}>
                                [{detailData?.targetCode}] {detailData?.targetName}
                              </Text>
                              <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                                Policy: {detailData?.policyName}
                              </Text>
                            </Box>

                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.800"}
                              shadow="sm"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                            >
                              <Badge colorScheme="teal" mb={1.5} fontSize="3xs" rounded="md" px={2}>
                                3. Executing Strategy
                              </Badge>
                              <Text fontWeight="bold" fontSize="xs" color="teal.600" noOfLines={1}>
                                [{detailData?.strategyCode}] {detailData?.strategyName}
                              </Text>
                              <Text fontSize="3xs" color="gray.500">
                                Programs: {detailData?.workPrograms?.length || 0} items
                              </Text>
                            </Box>
                          </Grid>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Specification Cards Grid */}
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                      {/* Organization Hierarchy Specification Card */}
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardHeader bg={colorMode === "light" ? "secondary.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack spacing={3}>
                            <Box
                              w={9}
                              h={9}
                              bg="secondary.500"
                              rounded="xl"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="sm"
                            >
                              <FiLayers size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color={colorMode === "light" ? "secondary.800" : "secondary.200"}>
                                ORGANIZATION HIERARCHY MAPPINGS
                              </Heading>
                              <Text fontSize="3xs" color="gray.500">
                                Master Directorate, Division & Group Structure
                              </Text>
                            </VStack>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4} fontSize="xs">
                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Directorate</Text>
                              <Text fontWeight="bold" fontSize="sm" color="blue.600" mt={1}>
                                {detailData?.orgDirectorateName} ({detailData?.orgDirectorateCode})
                              </Text>
                              <Text fontSize="3xs" color="gray.400" mt={0.5}>ID: {detailData?.orgDirectorateId}</Text>
                            </Box>

                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Division</Text>
                              <Text fontWeight="bold" fontSize="sm" color="teal.600" mt={1}>
                                {detailData?.orgDivisionName} ({detailData?.orgDivisionCode})
                              </Text>
                              <Text fontSize="3xs" color="gray.400" mt={0.5}>ID: {detailData?.orgDivisionId}</Text>
                            </Box>

                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
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
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardHeader bg={colorMode === "light" ? "purple.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack spacing={3}>
                            <Box
                              w={9}
                              h={9}
                              bg="purple.500"
                              rounded="xl"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="sm"
                            >
                              <FiCompass size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color="purple.600">
                                STRATEGIC GOALS & TARGET IDENTIFIERS
                              </Heading>
                              <Text fontSize="3xs" color="gray.500">
                                Corporate Target, Strategic Policy & Strategy Specs
                              </Text>
                            </VStack>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4} fontSize="xs">
                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Target Code & Description</Text>
                              <HStack mt={1} spacing={3}>
                                <Badge colorScheme="blue" rounded="md" px={2.5} py={0.5} fontSize="xs">
                                  {detailData?.targetCode}
                                </Badge>
                                <Text fontWeight="bold" fontSize="sm">{detailData?.targetName}</Text>
                              </HStack>
                            </Box>

                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Policy Code & Strategic Policy</Text>
                              <HStack mt={1} spacing={3}>
                                <Badge colorScheme="purple" rounded="md" px={2.5} py={0.5} fontSize="xs">
                                  {detailData?.policyCode}
                                </Badge>
                                <Text fontWeight="bold" fontSize="sm">{detailData?.policyName}</Text>
                              </HStack>
                            </Box>

                            <Box p={3.5} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text color="gray.500" fontWeight="bold">Strategy Code & Strategy Name</Text>
                              <HStack mt={1} spacing={3}>
                                <Badge colorScheme="teal" rounded="md" px={2.5} py={0.5} fontSize="xs">
                                  {detailData?.strategyCode}
                                </Badge>
                                <Text fontWeight="bold" fontSize="sm">{detailData?.strategyName}</Text>
                              </HStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* ========================================================= */}
                {/* TAB 2: WORK PROGRAMS ALLOCATION GRID */}
                {/* ========================================================= */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch" w="full">
                    {/* Summary Financial Header Banner */}
                    <Card
                      rounded="2xl"
                      shadow="sm"
                      bg={colorMode === "light" ? "secondary.50" : "gray.900"}
                      border="1px"
                      borderColor={colorMode === "light" ? "secondary.200" : "secondary.800"}
                    >
                      <CardBody p={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                          <HStack spacing={3}>
                            <Box
                              w={9}
                              h={9}
                              bg="secondary.500"
                              rounded="xl"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="sm"
                            >
                              <FiBriefcase size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color={colorMode === "light" ? "secondary.800" : "secondary.200"}>
                                Allocated Work Programs ({detailData?.workPrograms?.length || 0})
                              </Heading>
                              <Text fontSize="2xs" color="gray.500">
                                Comprehensive Financial & SLA Allocation Breakdown
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={6} wrap="wrap">
                            <VStack align="end" spacing={0}>
                              <Text fontSize="3xs" color="gray.500" fontWeight="bold">CAPEX ALLOCATION</Text>
                              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                                {formatIDR(budgetStats.capexSum)} ({budgetStats.capexCount} items)
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="3xs" color="gray.500" fontWeight="bold">OPEX ALLOCATION</Text>
                              <Text fontSize="xs" fontWeight="bold" color="purple.600">
                                {formatIDR(budgetStats.opexSum)} ({budgetStats.opexCount} items)
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="3xs" color="gray.500" fontWeight="bold">TOTAL TARGET BUDGET</Text>
                              <Text fontSize="sm" fontWeight="bold" color="secondary.600">
                                {formatIDR(totalBudget)}
                              </Text>
                            </VStack>
                          </HStack>
                        </Flex>
                      </CardBody>
                    </Card>

                    {/* Interactive Filter Toolbar */}
                    <Flex
                      justify="space-between"
                      align="center"
                      wrap="wrap"
                      gap={4}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      p={4}
                      rounded="2xl"
                      shadow="sm"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    >
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
                      <Card rounded="2xl" p={8} align="center" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                        <Text color="gray.500" fontSize="sm">No Work Programs match the selected filter criteria.</Text>
                      </Card>
                    ) : (
                      filteredWorkPrograms.map((wp, index) => (
                        <Card
                          key={wp.id}
                          rounded="2xl"
                          shadow="md"
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          border="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                          _hover={{
                            borderColor: "secondary.300",
                            shadow: "lg",
                          }}
                          transition="all 0.2s ease"
                        >
                          <CardBody p={6}>
                            <VStack spacing={4} align="stretch">
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
                                  <Text fontSize="sm" fontWeight="bold" color="secondary.600">
                                    {formatIDR(wp.budgetValue)}
                                  </Text>
                                </HStack>
                              </Flex>

                              <Divider />

                              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} fontSize="xs">
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
                                  <Text fontSize="3xs" color="secondary.600" fontWeight="bold">Bundling: {formatIDR(wp.bundlingBudget)}</Text>
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

                {/* ========================================================= */}
                {/* TAB 3: FINANCIAL ANALYTICS & DISTRIBUTION */}
                {/* ========================================================= */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch" w="full">
                    {/* Budget Breakdown Comparison Cards */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {/* CAPEX Breakdown Card */}
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "blue.200" : "blue.900"}
                      >
                        <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Box w={8} h={8} bg="blue.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                                <FiBarChart size={16} />
                              </Box>
                              <Heading size="xs" color="blue.600">CAPEX BUDGET ALLOCATION</Heading>
                            </HStack>
                            <Badge colorScheme="blue" fontSize="xs" px={2.5} py={0.5} rounded="md">
                              {budgetStats.capexPercent}% of Total
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                {formatIDR(budgetStats.capexSum)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">Total {budgetStats.capexCount} Work Programs</Text>
                            </Box>
                            <Progress value={budgetStats.capexPercent} colorScheme="blue" size="sm" rounded="full" />
                            <Text fontSize="xs" color="gray.600">
                              Capital Expenditure funds allocated for long-term infrastructure, core software, and hardware assets.
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* OPEX Breakdown Card */}
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "purple.200" : "purple.900"}
                      >
                        <CardHeader bg={colorMode === "light" ? "purple.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Box w={8} h={8} bg="purple.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                                <FiPieChart size={16} />
                              </Box>
                              <Heading size="xs" color="purple.600">OPEX BUDGET ALLOCATION</Heading>
                            </HStack>
                            <Badge colorScheme="purple" fontSize="xs" px={2.5} py={0.5} rounded="md">
                              {budgetStats.opexPercent}% of Total
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                {formatIDR(budgetStats.opexSum)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">Total {budgetStats.opexCount} Work Programs</Text>
                            </Box>
                            <Progress value={budgetStats.opexPercent} colorScheme="purple" size="sm" rounded="full" />
                            <Text fontSize="xs" color="gray.600">
                              Operational Expenditure allocated for recurring maintenance, licenses, and operational services.
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Infrastructure & Timeline Distribution Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {/* Data Center Distribution */}
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardHeader bg={colorMode === "light" ? "teal.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bg="teal.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                              <FiServer size={16} />
                            </Box>
                            <Heading size="xs" color="teal.600">DATA CENTER DEPLOYMENTS</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <SimpleGrid columns={3} spacing={3} textAlign="center">
                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">DC1 (Primary)</Text>
                              <Text fontSize="lg" fontWeight="bold" color="teal.600" mt={1}>
                                {dataCenterStats.dc1Count}
                              </Text>
                              <Text fontSize="3xs" color="gray.400">Programs</Text>
                            </Box>
                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">DC2 (DRC)</Text>
                              <Text fontSize="lg" fontWeight="bold" color="blue.600" mt={1}>
                                {dataCenterStats.dc2Count}
                              </Text>
                              <Text fontSize="3xs" color="gray.400">Programs</Text>
                            </Box>
                            <Box p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="bold">Other/Cloud</Text>
                              <Text fontSize="lg" fontWeight="bold" color="purple.600" mt={1}>
                                {dataCenterStats.otherCount}
                              </Text>
                              <Text fontSize="3xs" color="gray.400">Programs</Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Period Quartal Distribution */}
                      <Card
                        rounded="2xl"
                        shadow="md"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardHeader bg={colorMode === "light" ? "orange.50" : "gray.700"} roundedTop="2xl" py={4}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bg="orange.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                              <FiCalendar size={16} />
                            </Box>
                            <Heading size="xs" color="orange.600">PERIOD QUARTAL TIMELINE</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody p={6}>
                          <SimpleGrid columns={4} spacing={2} textAlign="center">
                            {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                              <Box key={q} p={3} rounded="xl" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                                <Text fontSize="2xs" color="gray.500" fontWeight="bold">{q}</Text>
                                <Text fontSize="lg" fontWeight="bold" color="orange.600" mt={1}>
                                  {quartalStats[q as keyof typeof quartalStats] || 0}
                                </Text>
                                <Text fontSize="3xs" color="gray.400">Programs</Text>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* ========================================================= */}
                {/* TAB 4: REVISION HISTORY TIMELINE */}
                {/* ========================================================= */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch" w="full">
                    {/* Timeline Header Card */}
                    <Card
                      rounded="2xl"
                      shadow="sm"
                      bg={colorMode === "light" ? "purple.50" : "gray.900"}
                      border="1px"
                      borderColor={colorMode === "light" ? "purple.200" : "purple.800"}
                    >
                      <CardBody p={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                          <HStack spacing={3}>
                            <Box
                              w={9}
                              h={9}
                              bg="purple.500"
                              rounded="xl"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              shadow="sm"
                            >
                              <FiClock size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="xs" color="purple.700">
                                Audit History Timeline ({detailData?.historyList?.length || 0})
                              </Heading>
                              <Text fontSize="2xs" color="gray.500">
                                Automated Audit Snapshot Log Recorded During Target Revisions
                              </Text>
                            </VStack>
                          </HStack>
                        </Flex>
                      </CardBody>
                    </Card>

                    {!detailData?.historyList || detailData.historyList.length === 0 ? (
                      <Card rounded="2xl" p={8} align="center" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
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
                              {/* Left Timeline Node Indicator */}
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

                              {/* Main Revision Detail Card */}
                              <Card
                                flex={1}
                                rounded="2xl"
                                shadow="md"
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
            </CardBody>
          </Card>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}

export default function MasterRbbDetailPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" minH="500px">
          <Spinner size="xl" color="secondary.500" thickness="4px" />
        </Flex>
      }
    >
      <MasterRbbDetailView />
    </Suspense>
  );
}
