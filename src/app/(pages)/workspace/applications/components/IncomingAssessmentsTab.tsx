"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  InputRightElement,
  Progress,
  Select as ChakraSelect,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiEdit3,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiFilter,
  FiInfo,
  FiLayers,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiX,
  FiZap,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { RiCalendarEventLine, RiFileList3Line } from "react-icons/ri";

import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  AppsCriticalReportBatchDetailViewModel,
  AppsCriticalReportBatchSummary,
} from "@/app/services/useAppsCriticalReport";
import { StatusBadge } from "@/app/components/StatusBadge";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";

interface IncomingAssessmentsTabProps {
  userOrgGroupId: string | null;
  userGroupName?: string | null;
  userDivisionName?: string | null;
  tokenData: string;
  onActionRequiredCountChange?: (count: number) => void;
}

interface BatchWithGroupStats extends AppsCriticalReportBatchSummary {
  groupTotalApps: number;
  groupReviewedApps: number;
  groupActionRequiredApps: number;
  groupPendingRtoApps: number;
  groupProgressPct: number;
}

export default function IncomingAssessmentsTab({
  userOrgGroupId,
  userGroupName,
  userDivisionName,
  tokenData,
  onActionRequiredCountChange,
}: IncomingAssessmentsTabProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();

  const { List, GetBatchDetail } = useAppsCriticalReport();

  // Active Ongoing Batches
  const [batches, setBatches] = useState<BatchWithGroupStats[]>([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("");
  const [selectedBatchDetail, setSelectedBatchDetail] =
    useState<AppsCriticalReportBatchDetailViewModel | null>(null);

  // Assessments for the selected batch filtered by group
  const [groupAssessments, setGroupAssessments] = useState<
    AppsCriticalReportAssessmentViewModel[]
  >([]);

  // Loading & Refresh State
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(true);
  const [isLoadingBatchDetail, setIsLoadingBatchDetail] =
    useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [activeFilterTab, setActiveFilterTab] = useState<
    "ALL" | "ACTION_REQUIRED" | "PENDING_RTO" | "COMPLETED" | "APPROVAL"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // 1. Fetch All Active Ongoing Batches and compute Group Statistics per batch
  const fetchActiveBatches = useCallback(async () => {
    if (!tokenData) return;
    setIsLoadingBatches(true);

    try {
      const res = await List(
        {
          search: "",
          limit: 10,
          page: 0,
          filterWhere: [
            {
              field: "statusReport",
              operator: "in",
              value:
                "DRAFT,WAITING APPROVAL 1,WAITING APPROVAL 2,DECLINE,REVISE",
            } as any,
          ],
          fieldOrder: ["timeReport"],
          orderDir: "desc",
        },
        tokenData,
      );

      if (res?.statusCode === RES_CODE_OK && res.data && res.data.length > 0) {
        const batchList = res.data;
        const enrichedBatches: BatchWithGroupStats[] = [];
        let totalGlobalActionRequired = 0;

        // Fetch details for each batch to get group application counts
        for (const b of batchList) {
          let gTotal = 0;
          let gReviewed = 0;
          let gActionRequired = 0;
          let gPendingRto = 0;

          try {
            const detailRes = await GetBatchDetail(b.batchCode, tokenData);
            if (
              detailRes?.statusCode === RES_CODE_OK &&
              detailRes.data?.assessments
            ) {
              const allAssessments = (detailRes.data.assessments ||
                []) as AppsCriticalReportAssessmentViewModel[];
              const userGroupApps = userOrgGroupId
                ? allAssessments.filter(
                    (a: AppsCriticalReportAssessmentViewModel) =>
                      a.appManageByGroupId === userOrgGroupId,
                  )
                : allAssessments;

              gTotal = userGroupApps.length;
              gReviewed = userGroupApps.filter(
                (a: AppsCriticalReportAssessmentViewModel) => a.isFullyReviewed,
              ).length;
              gActionRequired = userGroupApps.filter(
                (a: AppsCriticalReportAssessmentViewModel) =>
                  a.statusReport === "DRAFT" ||
                  a.statusReport === "DECLINE" ||
                  !a.isFullyReviewed,
              ).length;
              gPendingRto = userGroupApps.filter(
                (a: AppsCriticalReportAssessmentViewModel) =>
                  !a.appsRtoSuggestionMinutes ||
                  a.appsRtoSuggestionMinutes <= 0,
              ).length;

              totalGlobalActionRequired += gActionRequired;
            }
          } catch (e) {
            console.error(`Error loading batch detail for ${b.batchCode}:`, e);
          }

          enrichedBatches.push({
            ...b,
            groupTotalApps: gTotal,
            groupReviewedApps: gReviewed,
            groupActionRequiredApps: gActionRequired,
            groupPendingRtoApps: gPendingRto,
            groupProgressPct:
              gTotal > 0 ? Math.round((gReviewed / gTotal) * 100) : 0,
          });
        }

        setBatches(enrichedBatches);

        if (onActionRequiredCountChange) {
          onActionRequiredCountChange(totalGlobalActionRequired);
        }

        // Auto-select the first batch if not already selected
        if (!selectedBatchCode && enrichedBatches.length > 0) {
          setSelectedBatchCode(enrichedBatches[0].batchCode);
        }
      } else {
        setBatches([]);
        setSelectedBatchCode("");
        setSelectedBatchDetail(null);
        setGroupAssessments([]);
        if (onActionRequiredCountChange) {
          onActionRequiredCountChange(0);
        }
      }
    } catch (err) {
      console.error("Failed to load assessment batches:", err);
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [tokenData, userOrgGroupId, onActionRequiredCountChange]);

  useEffect(() => {
    fetchActiveBatches();
  }, [fetchActiveBatches, refreshKey]);

  // 2. Load Selected Batch Detail & Applications Roster
  const fetchSelectedBatchData = useCallback(async () => {
    if (!tokenData || !selectedBatchCode) return;
    setIsLoadingBatchDetail(true);

    try {
      const detailRes = await GetBatchDetail(selectedBatchCode, tokenData);
      if (detailRes?.statusCode === RES_CODE_OK && detailRes.data) {
        setSelectedBatchDetail(detailRes.data);
        const allAssessments = (detailRes.data.assessments ||
          []) as AppsCriticalReportAssessmentViewModel[];
        const filtered = userOrgGroupId
          ? allAssessments.filter(
              (a: AppsCriticalReportAssessmentViewModel) =>
                a.appManageByGroupId === userOrgGroupId,
            )
          : allAssessments;

        setGroupAssessments(filtered);
      } else {
        setSelectedBatchDetail(null);
        setGroupAssessments([]);
      }
    } catch (err) {
      console.error("Failed to load selected batch detail:", err);
      setSelectedBatchDetail(null);
      setGroupAssessments([]);
    } finally {
      setIsLoadingBatchDetail(false);
    }
  }, [tokenData, selectedBatchCode, userOrgGroupId]);

  useEffect(() => {
    fetchSelectedBatchData();
  }, [fetchSelectedBatchData, refreshKey]);

  // Filtered Applications for Display
  const displayedAssessments = useMemo(() => {
    return groupAssessments.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.appName?.toLowerCase().includes(q);
        const matchShort = item.appShortName?.toLowerCase().includes(q);
        const matchCode = item.appCode?.toLowerCase().includes(q);
        if (!matchName && !matchShort && !matchCode) return false;
      }

      // Filter Tabs
      if (activeFilterTab === "ACTION_REQUIRED") {
        const isActionRequired =
          item.statusReport === "DRAFT" ||
          item.statusReport === "DECLINE" ||
          item.statusReport === "REVISE" ||
          !item.isFullyReviewed;
        if (!isActionRequired) return false;
      } else if (activeFilterTab === "PENDING_RTO") {
        const isRtoMissing =
          !item.appsRtoSuggestionMinutes || item.appsRtoSuggestionMinutes <= 0;
        if (!isRtoMissing) return false;
      } else if (activeFilterTab === "COMPLETED") {
        if (!item.isFullyReviewed) return false;
      } else if (activeFilterTab === "APPROVAL") {
        const isApproval =
          item.statusReport === "WAITING APPROVAL 1" ||
          item.statusReport === "WAITING APPROVAL 2";
        if (!isApproval) return false;
      }

      // Dropdown Status Filter
      if (statusFilter !== "ALL" && item.statusReport !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [groupAssessments, search, activeFilterTab, statusFilter]);

  // Active Batch Statistics
  const selectedBatchInfo = batches.find(
    (b) => b.batchCode === selectedBatchCode,
  );

  const metrics = useMemo(() => {
    const total = groupAssessments.length;
    const actionRequired = groupAssessments.filter(
      (a) =>
        a.statusReport === "DRAFT" ||
        a.statusReport === "DECLINE" ||
        !a.isFullyReviewed,
    ).length;
    const pendingRto = groupAssessments.filter(
      (a) => !a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0,
    ).length;
    const completed = groupAssessments.filter((a) => a.isFullyReviewed).length;
    const inApproval = groupAssessments.filter(
      (a) =>
        a.statusReport === "WAITING APPROVAL 1" ||
        a.statusReport === "WAITING APPROVAL 2",
    ).length;
    const critical = groupAssessments.filter((a) =>
      a.appCrtCategoryName?.toUpperCase().includes("CRITICAL"),
    ).length;

    return {
      total,
      actionRequired,
      pendingRto,
      completed,
      inApproval,
      critical,
    };
  }, [groupAssessments]);

  const cardBg = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* TIER 1: ACTIVE ONGOING BATCHES LIST / CARDS */}
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius={radiusStyle}
        boxShadow="sm"
        overflow="hidden"
      >
        <CardHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          py={4}
          px={6}
          bg={isDark ? "gray.900" : "gray.50"}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={2}
          >
            <VStack align="start" spacing={0.5}>
              <Heading size="sm" color={isDark ? "white" : "gray.900"}>
                Active Assessment Review Batches
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Select an ongoing quarterly cycle to review and complete
                assessment criteria for {userGroupName || "your group"}
              </Text>
            </VStack>

            <Tooltip label="Refresh Batches" hasArrow>
              <IconButton
                aria-label="Refresh Batches"
                icon={<FiRefreshCw />}
                size="xs"
                variant="outline"
                borderRadius={radiusStyle}
                onClick={() => setRefreshKey((k) => k + 1)}
                isLoading={isLoadingBatches}
              />
            </Tooltip>
          </Flex>
        </CardHeader>

        <CardBody p={5}>
          {isLoadingBatches ? (
            <Flex justify="center" align="center" minH="120px">
              <LoadingMiniSignature />
            </Flex>
          ) : batches.length === 0 ? (
            <Box py={8} textAlign="center">
              <VStack spacing={2}>
                <Icon as={FiClock} fontSize="36px" color="gray.400" />
                <Heading size="xs" color={isDark ? "gray.300" : "gray.700"}>
                  No Active Ongoing Assessment Batches
                </Heading>
                <Text fontSize="xs" color="gray.500" maxW="480px">
                  There are currently no assessment batches in draft or approval
                  stage. Incoming quarterly assessment cycles will appear here
                  automatically when generated.
                </Text>
              </VStack>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {batches.map((batch) => {
                const isSelected = batch.batchCode === selectedBatchCode;
                const isComplete =
                  batch.groupProgressPct === 100 && batch.groupTotalApps > 0;

                return (
                  <Card
                    key={batch.batchCode}
                    bg={
                      isSelected
                        ? isDark
                          ? "secondary.900"
                          : "secondary.50"
                        : isDark
                          ? "gray.900"
                          : "white"
                    }
                    border="2px solid"
                    borderColor={isSelected ? "secondary.500" : borderColor}
                    borderRadius={radiusStyle}
                    p={4}
                    cursor="pointer"
                    onClick={() => setSelectedBatchCode(batch.batchCode)}
                    transition="all 0.2s ease"
                    boxShadow={isSelected ? "md" : "xs"}
                    _hover={{
                      borderColor: "secondary.500",
                      transform: "translateY(-2px)",
                    }}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Top Batch Header */}
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={isSelected ? "secondary" : "blue"}
                            variant="solid"
                            fontSize="2xs"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            {batch.quartalReport} {batch.yearReport}
                          </Badge>
                          <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="gray.500"
                          >
                            {batch.batchCode}
                          </Text>
                        </HStack>
                        <StatusBadge
                          status={batch.statusReport}
                          fontSize="2xs"
                        />
                      </Flex>

                      {/* Group Applications Metrics */}
                      <Box>
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color={isDark ? "gray.300" : "gray.700"}
                          >
                            Group Applications:
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={isSelected ? "secondary.600" : "gray.800"}
                          >
                            {batch.groupTotalApps} Systems
                          </Text>
                        </Flex>

                        <Flex
                          justify="space-between"
                          align="center"
                          fontSize="2xs"
                          color="gray.500"
                          mb={1.5}
                        >
                          <Text>
                            {batch.groupReviewedApps} of {batch.groupTotalApps}{" "}
                            Reviewed
                          </Text>
                          <Text
                            fontWeight="bold"
                            color={isComplete ? "green.500" : "orange.500"}
                          >
                            {batch.groupProgressPct}%
                          </Text>
                        </Flex>

                        <Progress
                          value={batch.groupProgressPct}
                          size="xs"
                          colorScheme={isComplete ? "green" : "secondary"}
                          borderRadius="full"
                        />
                      </Box>

                      {/* Action Required & Pending RTO Badge / Status */}
                      <Flex
                        justify="space-between"
                        align="center"
                        pt={1}
                        wrap="wrap"
                        gap={1}
                      >
                        <HStack spacing={1}>
                          {batch.groupActionRequiredApps > 0 && (
                            <Badge
                              colorScheme="red"
                              variant="subtle"
                              fontSize="2xs"
                              px={1.5}
                              borderRadius="full"
                            >
                              {batch.groupActionRequiredApps} Need Action
                            </Badge>
                          )}
                          {batch.groupPendingRtoApps > 0 && (
                            <Tooltip
                              label="Aplikasi dalam batch ini yang RTO Suggestion-nya belum dilakukan review oleh IAG"
                              hasArrow
                            >
                              <Badge
                                colorScheme="orange"
                                variant="subtle"
                                fontSize="2xs"
                                px={1.5}
                                borderRadius="full"
                              >
                                {batch.groupPendingRtoApps} Pending RTO
                              </Badge>
                            </Tooltip>
                          )}
                          {batch.groupActionRequiredApps === 0 &&
                            batch.groupPendingRtoApps === 0 &&
                            batch.groupTotalApps > 0 && (
                              <Badge
                                colorScheme="green"
                                variant="subtle"
                                fontSize="2xs"
                                px={2}
                                borderRadius="full"
                              >
                                All Ready
                              </Badge>
                            )}
                        </HStack>

                        <Button
                          size="xs"
                          colorScheme="secondary"
                          variant={isSelected ? "solid" : "outline"}
                          fontSize="2xs"
                        >
                          {isSelected ? "Active View" : "View Batch"}
                        </Button>
                      </Flex>
                    </VStack>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      {/* TIER 2: APPLICATIONS ROSTER FOR SELECTED BATCH */}
      {selectedBatchCode && (
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={radiusStyle}
          boxShadow="sm"
          overflow="hidden"
        >
          {/* Panel Header */}
          <CardHeader
            borderBottom="1px solid"
            borderColor={borderColor}
            py={4}
            px={6}
            bg={isDark ? "gray.900" : "gray.50"}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              gap={3}
            >
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Heading size="sm" color={isDark ? "white" : "gray.900"}>
                    Batch Applications Roster — {selectedBatchCode}
                  </Heading>
                  {selectedBatchInfo && (
                    <StatusBadge
                      status={selectedBatchInfo.statusReport}
                      fontSize="2xs"
                    />
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Applications managed by{" "}
                  <Text
                    as="span"
                    fontWeight="semibold"
                    color={isDark ? "gray.200" : "gray.800"}
                  >
                    {userGroupName || "your IT group"}
                  </Text>{" "}
                  for {selectedBatchInfo?.quartalReport}{" "}
                  {selectedBatchInfo?.yearReport} cycle
                </Text>
              </VStack>

              {/* Quick Filter Pill Tabs */}
              <HStack spacing={1.5} wrap="wrap">
                <Button
                  size="xs"
                  variant={activeFilterTab === "ALL" ? "solid" : "outline"}
                  colorScheme={activeFilterTab === "ALL" ? "secondary" : "gray"}
                  onClick={() => setActiveFilterTab("ALL")}
                  borderRadius={radiusStyle}
                >
                  All ({metrics.total})
                </Button>
                <Button
                  size="xs"
                  variant={
                    activeFilterTab === "ACTION_REQUIRED" ? "solid" : "outline"
                  }
                  colorScheme={
                    activeFilterTab === "ACTION_REQUIRED" ? "red" : "gray"
                  }
                  onClick={() => setActiveFilterTab("ACTION_REQUIRED")}
                  borderRadius={radiusStyle}
                >
                  Action Required ({metrics.actionRequired})
                </Button>
                <Button
                  size="xs"
                  variant={
                    activeFilterTab === "PENDING_RTO" ? "solid" : "outline"
                  }
                  colorScheme={
                    activeFilterTab === "PENDING_RTO" ? "orange" : "gray"
                  }
                  onClick={() => setActiveFilterTab("PENDING_RTO")}
                  borderRadius={radiusStyle}
                >
                  Pending IAG RTO ({metrics.pendingRto})
                </Button>
                <Button
                  size="xs"
                  variant={
                    activeFilterTab === "COMPLETED" ? "solid" : "outline"
                  }
                  colorScheme={
                    activeFilterTab === "COMPLETED" ? "green" : "gray"
                  }
                  onClick={() => setActiveFilterTab("COMPLETED")}
                  borderRadius={radiusStyle}
                >
                  Fully Filled ({metrics.completed})
                </Button>
                <Button
                  size="xs"
                  variant={activeFilterTab === "APPROVAL" ? "solid" : "outline"}
                  colorScheme={
                    activeFilterTab === "APPROVAL" ? "purple" : "gray"
                  }
                  onClick={() => setActiveFilterTab("APPROVAL")}
                  borderRadius={radiusStyle}
                >
                  In Approval ({metrics.inApproval})
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          {/* RTO Suggestion Pending Alert Notification */}
          {metrics.pendingRto > 0 && (
            <Box px={6} pt={4}>
              <Alert
                status="warning"
                variant="subtle"
                borderRadius={radiusStyle}
                border="1px solid"
                borderColor={isDark ? "yellow.700" : "yellow.300"}
                bg={isDark ? "yellow.900" : "yellow.50"}
                py={3}
                px={4}
              >
                <AlertIcon as={FiAlertTriangle} color="yellow.500" />
                <Box flex="1">
                  <AlertTitle
                    fontSize="xs"
                    fontWeight="bold"
                    color={isDark ? "yellow.200" : "yellow.900"}
                  >
                    Perhatian: {metrics.pendingRto} Aplikasi Belum Dilakukan
                    Review RTO Suggestion oleh IAG
                  </AlertTitle>
                  <AlertDescription
                    fontSize="2xs"
                    color={isDark ? "yellow.300" : "yellow.800"}
                  >
                    Aplikasi dengan tanda{" "}
                    <Badge
                      colorScheme="orange"
                      variant="solid"
                      fontSize="2xs"
                      mx={1}
                    >
                      BELUM DIREVIEW IAG
                    </Badge>{" "}
                    memerlukan review dan pengisian RTO Suggestion oleh tim IAG
                    sebelum dapat disubmit ke tahap approval final.
                  </AlertDescription>
                </Box>
              </Alert>
            </Box>
          )}

          {/* Search and Dropdown Filter Bar */}
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={3}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
            >
              {/* Search Box */}
              <InputGroup maxW={{ base: "full", md: "380px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search app by name, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  borderRadius={radiusStyle}
                  fontSize="sm"
                />
                {search && (
                  <InputRightElement>
                    <IconButton
                      aria-label="Clear search"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setSearch("")}
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Status Filter */}
              <HStack spacing={2}>
                <ChakraSelect
                  size="sm"
                  w="170px"
                  borderRadius={radiusStyle}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="WAITING APPROVAL 1">Waiting Approval 1</option>
                  <option value="WAITING APPROVAL 2">Waiting Approval 2</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINE">Decline / Revise</option>
                </ChakraSelect>
              </HStack>
            </Flex>
          </Box>

          {/* Table Content */}
          <CardBody p={0}>
            {isLoadingBatchDetail ? (
              <Flex justify="center" align="center" minH="240px">
                <LoadingMiniSignature />
              </Flex>
            ) : displayedAssessments.length === 0 ? (
              <Box p={12} textAlign="center">
                <VStack spacing={3}>
                  <Icon as={FiCheckCircle} fontSize="40px" color="green.500" />
                  <Heading size="sm" color={isDark ? "gray.200" : "gray.700"}>
                    No Applications Match Current Criteria
                  </Heading>
                  <Text fontSize="xs" color="gray.500" maxW="450px">
                    {search ||
                    activeFilterTab !== "ALL" ||
                    statusFilter !== "ALL"
                      ? "No application records match your active search and filter selection. Try resetting filters."
                      : `There are no applications assigned to "${userGroupName || "your group"}" in this batch.`}
                  </Text>
                  {(search ||
                    activeFilterTab !== "ALL" ||
                    statusFilter !== "ALL") && (
                    <Button
                      size="xs"
                      colorScheme="secondary"
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setActiveFilterTab("ALL");
                        setStatusFilter("ALL");
                      }}
                    >
                      Reset Filters
                    </Button>
                  )}
                </VStack>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg={isDark ? "gray.900" : "gray.50"}>
                    <Tr>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                        textAlign="center"
                        w="48px"
                      >
                        #
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                      >
                        Application
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                      >
                        Criteria Progress
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                      >
                        Assessment Status
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                      >
                        Calculated Score & Tier
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                      >
                        RTO & RPO SLA
                      </Th>
                      <Th
                        color={isDark ? "gray.300" : "gray.600"}
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={3}
                        textAlign="right"
                      >
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedAssessments.map((item, index) => {
                      const isComplete = item.isFullyReviewed;
                      const isCritical = item.appCrtCategoryName
                        ?.toUpperCase()
                        .includes("CRITICAL");
                      const fillPct =
                        item.totalCount > 0
                          ? Math.round(
                              (item.filledCount / item.totalCount) * 100,
                            )
                          : 0;

                      const canEdit =
                        item.statusReport === "DRAFT" ||
                        item.statusReport === "DECLINE" ||
                        item.statusReport === "REVISE";

                      const latestHistory =
                        item.statusHistories && item.statusHistories.length > 0
                          ? item.statusHistories[0]
                          : null;

                      const isRtoSuggestionPresent =
                        !!item.appsRtoSuggestionMinutes &&
                        item.appsRtoSuggestionMinutes > 0;

                      return (
                        <Tr
                          key={item.id}
                          _hover={{ bg: isDark ? "whiteAlpha.50" : "gray.50" }}
                          transition="background 0.15s ease"
                        >
                          {/* Row Number */}
                          <Td
                            py={3}
                            textAlign="center"
                            fontSize="xs"
                            fontWeight="medium"
                            color={isDark ? "gray.400" : "gray.500"}
                          >
                            {index + 1}
                          </Td>

                          {/* Application Info */}
                          <Td py={3}>
                            <HStack spacing={3} align="center">
                              <Avatar
                                size="sm"
                                name={
                                  item.appShortName || item.appName || "APP"
                                }
                                bg={isCritical ? "red.600" : "secondary.600"}
                                color="white"
                                borderRadius="md"
                              />
                              <VStack align="start" spacing={0.5}>
                                <HStack spacing={2}>
                                  <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color={isDark ? "white" : "gray.900"}
                                    noOfLines={1}
                                  >
                                    {item.appName || item.appShortName}
                                  </Text>
                                  {item.appShortName && (
                                    <Text
                                      fontSize="xs"
                                      fontWeight="semibold"
                                      color="gray.500"
                                    >
                                      ({item.appShortName})
                                    </Text>
                                  )}
                                </HStack>
                                <HStack spacing={1.5}>
                                  <Badge
                                    fontSize="2xs"
                                    colorScheme="blue"
                                    variant="subtle"
                                  >
                                    {item.appShortName || "-"}
                                  </Badge>
                                  {!isRtoSuggestionPresent && (
                                    <Tooltip
                                      label="RTO Pada Aplikasi ini Belum Dilakukan Review oleh IAG"
                                      hasArrow
                                    >
                                      <Badge
                                        colorScheme="orange"
                                        variant="solid"
                                        fontSize="2xs"
                                        px={1.5}
                                        py={0.2}
                                        borderRadius="md"
                                        cursor="help"
                                      >
                                        RTO PENDING
                                      </Badge>
                                    </Tooltip>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>
                          </Td>

                          {/* Review Completion Progress */}
                          <Td py={3}>
                            <VStack align="start" spacing={1} minW="140px">
                              <HStack justify="space-between" w="full">
                                <Text
                                  fontSize="2xs"
                                  fontWeight="semibold"
                                  color={
                                    isComplete ? "green.500" : "orange.500"
                                  }
                                >
                                  {isComplete
                                    ? "100% Filled"
                                    : `${item.filledCount}/${item.totalCount} Criteria`}
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                  {fillPct}%
                                </Text>
                              </HStack>
                              <Progress
                                value={fillPct}
                                size="xs"
                                w="full"
                                colorScheme={isComplete ? "green" : "orange"}
                                borderRadius="full"
                              />
                            </VStack>
                          </Td>

                          {/* Assessment Status */}
                          <Td py={3}>
                            <VStack align="start" spacing={1}>
                              <StatusBadge
                                status={item.statusReport}
                                fontSize="2xs"
                              />
                              {latestHistory?.note && (
                                <Tooltip
                                  label={`Review Note: ${latestHistory.note}`}
                                  hasArrow
                                >
                                  <HStack spacing={1} cursor="pointer">
                                    <Icon
                                      as={FiMessageSquare}
                                      color="orange.400"
                                      fontSize="10px"
                                    />
                                    <Text
                                      fontSize="2xs"
                                      color="orange.400"
                                      noOfLines={1}
                                      maxW="120px"
                                    >
                                      {latestHistory.note}
                                    </Text>
                                  </HStack>
                                </Tooltip>
                              )}
                            </VStack>
                          </Td>

                          {/* Calculated Score & Tier */}
                          <Td py={3}>
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={1.5}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color={isDark ? "white" : "gray.800"}
                                >
                                  {item.crtAssessmentFinalScore != null
                                    ? item.crtAssessmentFinalScore.toFixed(2)
                                    : "—"}
                                </Text>
                                <Badge
                                  fontSize="2xs"
                                  px={1.5}
                                  py={0.2}
                                  borderRadius="md"
                                  colorScheme={isCritical ? "red" : "gray"}
                                  variant={isCritical ? "solid" : "subtle"}
                                >
                                  {item.appCrtCategoryName || "Pending"}
                                </Badge>
                              </HStack>
                              <Text fontSize="2xs" color="gray.400">
                                Avg:{" "}
                                {item.crtAssessmentAverageScore != null
                                  ? item.crtAssessmentAverageScore.toFixed(1)
                                  : "—"}
                              </Text>
                            </VStack>
                          </Td>

                          {/* RTO & RPO SLA Targets & Status */}
                          <Td py={3}>
                            <VStack align="start" spacing={1} fontSize="2xs">
                              {/* RTO Suggestion (IAG Benchmark) */}
                              {isRtoSuggestionPresent ? (
                                <HStack spacing={1.5}>
                                  <Badge
                                    colorScheme="blue"
                                    variant="solid"
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.2}
                                    borderRadius="md"
                                  >
                                    IAG
                                  </Badge>
                                  <Text
                                    fontWeight="semibold"
                                    color={isDark ? "gray.200" : "gray.800"}
                                  >
                                    {item.appsRtoSuggestionOperator || "<="}{" "}
                                    {item.appsRtoSuggestionMinutes}m
                                  </Text>
                                </HStack>
                              ) : (
                                <Tooltip
                                  label="RTO Pada Aplikasi ini Belum Dilakukan Review oleh IAG. Hubungi tim IAG untuk melengkapi RTO Suggestion sebelum final submission."
                                  hasArrow
                                >
                                  <Badge
                                    colorScheme="orange"
                                    variant="subtle"
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="md"
                                    cursor="help"
                                  >
                                    <HStack spacing={1}>
                                      <Icon
                                        as={FiAlertTriangle}
                                        color="orange.500"
                                      />
                                      <Text
                                        color="orange.600"
                                        fontWeight="bold"
                                      >
                                        Belum Direview IAG
                                      </Text>
                                    </HStack>
                                  </Badge>
                                </Tooltip>
                              )}

                              {/* RTO IT (IT Group Commitment) */}
                              {item.appsRtoItMinutes &&
                              item.appsRtoItMinutes > 0 ? (
                                <HStack spacing={1.5}>
                                  <Badge
                                    colorScheme="teal"
                                    variant="subtle"
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.2}
                                    borderRadius="md"
                                  >
                                    IT
                                  </Badge>
                                  <Text
                                    color={isDark ? "gray.300" : "gray.600"}
                                  >
                                    {item.appsRtoItOperator || "<="}{" "}
                                    {item.appsRtoItMinutes}m
                                  </Text>
                                </HStack>
                              ) : (
                                <Text color="gray.400" fontSize="2xs">
                                  IT:{" "}
                                  <Text as="span" fontStyle="italic">
                                    Belum Diisi
                                  </Text>
                                </Text>
                              )}

                              {/* RPO Target (Business Continuity) */}
                              {item.appsRpoMinutes &&
                              item.appsRpoMinutes > 0 ? (
                                <HStack spacing={1.5}>
                                  <Badge
                                    colorScheme="purple"
                                    variant="subtle"
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.2}
                                    borderRadius="md"
                                  >
                                    RPO
                                  </Badge>
                                  <Text
                                    color={isDark ? "gray.300" : "gray.600"}
                                  >
                                    {item.appsRpoOperator || "<="}{" "}
                                    {item.appsRpoMinutes}m
                                  </Text>
                                </HStack>
                              ) : (
                                <Text color="gray.400" fontSize="2xs">
                                  RPO:{" "}
                                  <Text as="span" fontStyle="italic">
                                    Stage 2
                                  </Text>
                                </Text>
                              )}
                            </VStack>
                          </Td>

                          {/* Actions */}
                          <Td py={3} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Button
                                as={Link}
                                href={`/workspace/applications/assessment?id=${item.id}&source=workspace`}
                                size="xs"
                                colorScheme={canEdit ? "secondary" : "gray"}
                                variant={canEdit ? "solid" : "outline"}
                                leftIcon={canEdit ? <FiEdit3 /> : <FiEye />}
                              >
                                {canEdit
                                  ? "Fill Assessment"
                                  : "View Assessment"}
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}
