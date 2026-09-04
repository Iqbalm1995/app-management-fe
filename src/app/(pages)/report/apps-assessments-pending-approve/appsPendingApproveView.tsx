"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, ORG_GROUP_WHITELIST_ALL_ACCESS, ORG_GROUP_WHITELIST_FULL_OVERRIDE, ORG_CATEGORY_KEY_GROUP, DIVISION_ID_IT_BJB } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { PaggingListPayload } from "@/app/types/masterTypes";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  AppsCriticalReportBatchSummary,
  AppsCriticalReportBatchDetailViewModel,
  AppsCriticalReportPendingListRequest,
  ApproveAssessmentRequest,
  ApproveBatchRequest,
} from "@/app/services/useAppsCriticalReport";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Alert, AlertDescription, AlertIcon, AlertTitle,
  Badge, Box, Button, Card, CardBody, Checkbox, Divider, Flex, Heading, HStack,
  Icon, IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Progress, Select, SimpleGrid, Spacer, Spinner, Stack, Text, Textarea, Tooltip, useColorMode,
  useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, PaginationState, useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiExternalLink, FiEye,
  FiLayers, FiLock, FiRefreshCw, FiShield, FiSkipForward, FiX, FiXCircle, FiZap,
} from "react-icons/fi";

type TabMode = "WA1" | "WA2" | "FINAL";

const statusColor = (s: string) => ({ "WAITING APPROVAL 1": "orange", "WAITING APPROVAL 2": "blue", "APPROVED": "green", "DECLINE": "red", DRAFT: "gray" }[s] || "gray");

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

export default function AppsPendingApproveView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { ListByStatus, CanApproveAssessment, ApproveAssessment, List, GetBatchDetail, ApproveBatch } = useAppsCriticalReport();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [tabMode, setTabMode] = useState<TabMode>("WA1");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // Tab 1 state
  const [wa1Data, setWa1Data] = useState<AppsCriticalReportAssessmentViewModel[]>([]);
  const [canApproveMap, setCanApproveMap] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();

  // WA1 filter state
  const { List: ListOrganization } = useOrganization();
  const [groupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [userOrgGroupId, setUserOrgGroupId] = useState<string | null>(null);
  const [isGroupLocked, setIsGroupLocked] = useState(false);
  const [filterGroup, setFilterGroup] = useState("");

  // WA2 is only accessible to FULL_OVERRIDE users (IAG, ADMIN) — they are the WA2 target approvers
  // Users with no orgGroupId (executives) can also see WA2
  const isWA2Approver = !userOrgGroupId || ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId);
  const [filterQ, setFilterQ] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterReview, setFilterReview] = useState<"" | "reviewed" | "pending">("");

  // Tab 2 state
  const [wa2Batches, setWa2Batches] = useState<AppsCriticalReportBatchSummary[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<AppsCriticalReportBatchSummary | null>(null);
  const [batchDetail, setBatchDetail] = useState<AppsCriticalReportBatchDetailViewModel | null>(null);
  const [batchNote, setBatchNote] = useState("");
  const [batchApproving, setBatchApproving] = useState(false);
  const [acknowledgeOverride, setAcknowledgeOverride] = useState(false);
  const { isOpen: isBatchModalOpen, onOpen: onBatchModalOpen, onClose: onBatchModalClose } = useDisclosure();
  const { isOpen: isConfirmApproveOpen, onOpen: onConfirmApproveOpen, onClose: onConfirmApproveClose } = useDisclosure();
  const { isOpen: isConfirmDeclineOpen, onOpen: onConfirmDeclineOpen, onClose: onConfirmDeclineClose } = useDisclosure();

  // Tab 2 (WA2) modal state & filters
  const [modalSearch, setModalSearch] = useState("");
  const [modalFilterQuick, setModalFilterQuick] = useState<
    | "ALL"
    | "ACTIVE"
    | "SKIPPED"
    | "INCOMPLETE"
    | "RTO_UNFILLED"
    | "RTO_IT_UNFILLED"
    | "RPO_UNFILLED"
    | "REVIEW_PENDING"
    | "REVIEW_DONE"
  >("ALL");

  // Calculated batch statistics & 5-point validation readiness for WA2 review modal
  const modalStats = useMemo(() => {
    const assessments = batchDetail?.assessments || [];
    const total = assessments.length;
    const active = assessments.filter((a) => a.isSkipReview !== "TRUE").length;
    const skipped = assessments.filter((a) => a.isSkipReview === "TRUE").length;
    const skippedPct = total > 0 ? Math.round((skipped / total) * 100) : 0;

    // 1. RTO Suggestion (IAG)
    const rtoFilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        a.appsRtoSuggestionMinutes !== null &&
        a.appsRtoSuggestionMinutes > 0
    ).length;
    const rtoSatisfied = rtoFilled + skipped;
    const rtoProgressPct =
      total > 0 ? Math.round((rtoSatisfied / total) * 100) : 0;
    const rtoUnfilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        (!a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0)
    ).length;

    // 2. RTO IT (Committed Recovery Time)
    const rtoItFilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        a.appsRtoItMinutes !== null &&
        a.appsRtoItMinutes > 0
    ).length;
    const rtoItSatisfied = rtoItFilled + skipped;
    const rtoItProgressPct =
      total > 0 ? Math.round((rtoItSatisfied / total) * 100) : 0;
    const rtoItUnfilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        (!a.appsRtoItMinutes || a.appsRtoItMinutes <= 0)
    ).length;

    // 3. RPO Target (BMT)
    const rpoFilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        a.appsRpoMinutes !== null &&
        a.appsRpoMinutes > 0
    ).length;
    const rpoSatisfied = rpoFilled + skipped;
    const rpoProgressPct =
      total > 0 ? Math.round((rpoSatisfied / total) * 100) : 0;
    const rpoUnfilled = assessments.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        (!a.appsRpoMinutes || a.appsRpoMinutes <= 0)
    ).length;

    // 4. Criteria Review
    const fullyReviewed = assessments.filter(
      (a) => a.isSkipReview !== "TRUE" && a.isFullyReviewed
    ).length;
    const reviewSatisfied = fullyReviewed + skipped;
    const reviewProgressPct =
      total > 0 ? Math.round((reviewSatisfied / total) * 100) : 0;
    const reviewPending = assessments.filter(
      (a) => a.isSkipReview !== "TRUE" && !a.isFullyReviewed
    ).length;

    // 5. Incomplete Apps Breakdown (Validation Issues)
    const incompleteApps = assessments
      .filter((a) => a.isSkipReview !== "TRUE")
      .map((a) => {
        const missing: string[] = [];
        if (!a.isFullyReviewed) missing.push("Criteria Review");
        if (!a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0)
          missing.push("RTO Suggestion (IAG)");
        if (!a.appsRtoItMinutes || a.appsRtoItMinutes <= 0)
          missing.push("RTO IT");
        if (!a.appsRpoMinutes || a.appsRpoMinutes <= 0)
          missing.push("RPO Target");

        return {
          id: a.id,
          appShortName: a.appShortName,
          appName: a.appName,
          appCode: a.appCode,
          appManageByGroupName: a.appManageByGroupName,
          missingItems: missing,
        };
      })
      .filter((a) => a.missingItems.length > 0);

    const isBatch100Ready = total > 0 && incompleteApps.length === 0;

    const avgScore =
      total > 0
        ? assessments.reduce(
            (acc, a) => acc + (Number(a.crtAssessmentFinalScore) || 0),
            0
          ) / total
        : 0;

    return {
      total,
      active,
      skipped,
      skippedPct,
      rtoFilled,
      rtoSatisfied,
      rtoProgressPct,
      rtoUnfilled,
      rtoItFilled,
      rtoItSatisfied,
      rtoItProgressPct,
      rtoItUnfilled,
      rpoFilled,
      rpoSatisfied,
      rpoProgressPct,
      rpoUnfilled,
      fullyReviewed,
      reviewSatisfied,
      reviewProgressPct,
      reviewPending,
      incompleteApps,
      isBatch100Ready,
      avgScore,
    };
  }, [batchDetail]);

  // Filtered assessments inside modal based on search & quick filter pills
  const modalFilteredAssessments = useMemo(() => {
    const list = batchDetail?.assessments || [];
    return list.filter((a) => {
      const q = modalSearch.toLowerCase().trim();
      if (
        q &&
        !(
          a.appShortName?.toLowerCase().includes(q) ||
          a.appName?.toLowerCase().includes(q) ||
          a.appCode?.toLowerCase().includes(q) ||
          a.appManageByGroupName?.toLowerCase().includes(q) ||
          a.appCrtCategoryName?.toLowerCase().includes(q)
        )
      ) {
        return false;
      }

      if (modalFilterQuick === "ACTIVE") return a.isSkipReview !== "TRUE";
      if (modalFilterQuick === "SKIPPED") return a.isSkipReview === "TRUE";
      if (modalFilterQuick === "INCOMPLETE") {
        if (a.isSkipReview === "TRUE") return false;
        const missingRto = !a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0;
        const missingRtoIt = !a.appsRtoItMinutes || a.appsRtoItMinutes <= 0;
        const missingRpo = !a.appsRpoMinutes || a.appsRpoMinutes <= 0;
        const missingReview = !a.isFullyReviewed;
        return missingRto || missingRtoIt || missingRpo || missingReview;
      }
      if (modalFilterQuick === "RTO_UNFILLED")
        return (
          a.isSkipReview !== "TRUE" &&
          (!a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0)
        );
      if (modalFilterQuick === "RTO_IT_UNFILLED")
        return (
          a.isSkipReview !== "TRUE" &&
          (!a.appsRtoItMinutes || a.appsRtoItMinutes <= 0)
        );
      if (modalFilterQuick === "RPO_UNFILLED")
        return (
          a.isSkipReview !== "TRUE" &&
          (!a.appsRpoMinutes || a.appsRpoMinutes <= 0)
        );
      if (modalFilterQuick === "REVIEW_PENDING")
        return a.isSkipReview !== "TRUE" && !a.isFullyReviewed;
      if (modalFilterQuick === "REVIEW_DONE")
        return a.isSkipReview !== "TRUE" && a.isFullyReviewed;

      return true;
    });
  }, [batchDetail, modalSearch, modalFilterQuick]);

  // Tab 3 state
  const [finalData, setFinalData] = useState<AppsCriticalReportAssessmentViewModel[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const parsed = (JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse;
      setDataAuth(parsed);
      // Group filter lock — same rule as batch detail page
      const raw = parsed.team?.orgGroupId || null;
      const orgGroupId = (raw && raw !== "-") ? raw : null;
      setUserOrgGroupId(orgGroupId);
      if (orgGroupId && !ORG_GROUP_WHITELIST_ALL_ACCESS.includes(orgGroupId)) {
        setIsGroupLocked(true);
        setFilterGroup(orgGroupId);
      }
    }
    if (token) setTokenData(token);
  }, []);

  // Load group options for filter dropdown
  useEffect(() => {
    if (!tokenData) return;
    ListOrganization({
      search: "", limit: 1000, page: 0,
      filterWhere: [
        { field: "orgType", operator: "=", value: ORG_CATEGORY_KEY_GROUP },
        { field: "parentId", operator: "=", value: DIVISION_ID_IT_BJB },
      ],
      fieldOrder: ["orgName"], orderDir: "asc",
    } as PaggingListPayload, tokenData).then(res => {
      if (res?.statusCode === RES_CODE_OK && res.data) setGroupOptions(res.data);
    });
  }, [tokenData]);

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    // WA1 is fully client-side — skip refetch when only page changes
    if (tabMode === "WA1" && wa1Data.length > 0) return;
    const load = async () => {
      setLoading(true);
      setSelectedIds(new Set()); // Clear selections on every page/tab load

      if (tabMode === "WA1") {
        // Load ALL WA1 data — client-side pagination via TanStack
        const res = await ListByStatus({ status: "WAITING APPROVAL 1", search, page: 0, limit: 9999 }, tokenData);        if (res?.statusCode === RES_CODE_OK) {
          const items: AppsCriticalReportAssessmentViewModel[] = res.data || [];
          setWa1Data(items);
          setTotalCount(items.length);
          setTotalPages(Math.ceil(items.length / pageSize));
          // Check canApprove per item
          const checks = await Promise.all(items.map(async (i) => {
            const r = await CanApproveAssessment(i.id, tokenData);
            return { id: i.id, can: r?.statusCode === RES_CODE_OK && r?.data === "true" };
          }));
          const map: Record<string, boolean> = {};
          checks.forEach(({ id, can }) => { map[id] = can; });
          setCanApproveMap(map);
        }
      } else if (tabMode === "WA2") {
        if (!isWA2Approver) {
          // User is not a WA2 target approver — show nothing
          setWa2Batches([]);
          setTotalCount(0);
          setTotalPages(0);
        } else {
          const fw: any[] = [{ field: "statusReport", operator: "=", value: "WAITING APPROVAL 2" }];
          const res = await List({ search, limit: pageSize, page: pageIndex, filterWhere: fw, fieldOrder: ["timeReport"], orderDir: "desc" }, tokenData);
          if (res?.statusCode === RES_CODE_OK) {
            setWa2Batches(res.data || []);
            setTotalCount(res.countTotal || 0);
            setTotalPages(Math.ceil((res.countTotal || 0) / pageSize));
          }
        }
      } else {
        const resApp = await ListByStatus({ status: "APPROVED", search, page: pageIndex, limit: pageSize }, tokenData);
        const resDec = await ListByStatus({ status: "DECLINE", search, page: 0, limit: 1000 }, tokenData);
        const merged = [...(resApp?.data || []), ...(resDec?.data || [])];
        setFinalData(merged);
        setTotalCount(merged.length);
        setTotalPages(Math.ceil(merged.length / pageSize));
      }
      setLoading(false);
    };
    load();
  }, [DataAuth, tokenData, tabMode, refresh, pageIndex, pageSize, search, isWA2Approver]);

  // Ensure pagination resets when switching tabs
  useEffect(() => {
    setPagination({ pageIndex: 0, pageSize });
    if (tabMode !== "WA1") setWa1Data([]); // clear so re-fetch on switch back
  }, [tabMode]);

  const handleBulkApprove = async (isApproved: boolean) => {
    setBulkApproving(true);
    for (const id of selectedIds) {
      await ApproveAssessment({ id, isApproved, note: approveNote || (isApproved ? "Approved" : "Declined") }, tokenData);
    }
    setBulkApproving(false);
    onBulkClose();
    setApproveNote("");
    setSelectedIds(new Set());
    setWa1Data([]); // force refetch
    setRefresh(p => p + 1);
    showToast({ description: `${isApproved ? "Approved" : "Declined"} ${selectedIds.size} assessment(s)`, statusToast: isApproved ? "success" : "warning" });
  };

  const handleOpenBatchDetail = async (batch: AppsCriticalReportBatchSummary) => {
    if (!tokenData) {
      const token = localStorage.getItem("tokenData") as string;
      if (token) setTokenData(token);
    }
    setSelectedBatch(batch);
    setBatchDetail(null);
    setModalSearch("");
    setModalFilterQuick("ALL");
    setBatchNote("");
    setAcknowledgeOverride(false);
    onBatchModalOpen();
    const token = tokenData || (localStorage.getItem("tokenData") as string);
    const res = await GetBatchDetail(batch.batchCode, token);
    if (res?.statusCode === RES_CODE_OK) setBatchDetail(res.data);
  };

  const handleOpenApproveConfirm = () => {
    setAcknowledgeOverride(false);
    onConfirmApproveOpen();
  };

  const handleOpenDeclineConfirm = () => {
    onConfirmDeclineOpen();
  };

  const handleBatchApprove = async (isApproved: boolean, force = false) => {
    if (!selectedBatch) return;
    setBatchApproving(true);
    const res = await ApproveBatch(
      {
        batchCode: selectedBatch.batchCode,
        isApproved,
        note: batchNote || (isApproved ? "Batch Approved" : "Batch Declined"),
        forceApprove: force,
      },
      tokenData
    );
    setBatchApproving(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: isApproved ? "Batch approved successfully" : "Batch declined",
        statusToast: isApproved ? "success" : "warning",
      });
      onConfirmApproveClose();
      onConfirmDeclineClose();
      onBatchModalClose();
      setBatchNote("");
      setAcknowledgeOverride(false);
      setWa1Data([]); // force refetch if switching tabs
      setRefresh((p) => p + 1);
    } else {
      showToast({
        description: res?.message || "Failed",
        statusToast: "error",
      });
    }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const approvableIds = wa1Data.filter(i => canApproveMap[i.id]).map(i => i.id);
  const selectAll = () => setSelectedIds(new Set(approvableIds));
  const clearAll = () => setSelectedIds(new Set());

  // WA1 columns
  const wa1Columns = useMemo<ColumnDef<AppsCriticalReportAssessmentViewModel>[]>(() => [
    {
      id: "select",
      header: () => (
        <Tooltip label="Select all on this page">
          <Checkbox isChecked={approvableIds.length > 0 && approvableIds.every(id => selectedIds.has(id))} onChange={e => e.target.checked ? selectAll() : clearAll()} />
        </Tooltip>
      ),
      cell: (info: any) => canApproveMap[info.row.original.id]
        ? <Checkbox isChecked={selectedIds.has(info.row.original.id)} onChange={() => toggleSelect(info.row.original.id)} />
        : null,
      footer: (p: any) => p.column.id,
    },
    {
      accessorKey: "appShortName",
      cell: (info) => <VStack align="start" spacing={0}><Text fontSize="sm" fontWeight="semibold">{info.getValue() as string}</Text><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{info.row.original.appName || "-"}</Text></VStack>,
      header: () => <Text>App</Text>,
      footer: (p) => p.column.id,
    },
    { accessorKey: "appManageByGroupName", cell: (info) => <Text fontSize="sm" noOfLines={1}>{(info.getValue() as string) || "-"}</Text>, header: () => <Text>Group</Text>, footer: (p) => p.column.id },
    { accessorKey: "batchCode", cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{info.getValue() as string}</Badge>, header: () => <Text>Batch</Text>, footer: (p) => p.column.id },
    { accessorKey: "statusReport", cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>, header: () => <Text>Status</Text>, footer: (p) => p.column.id },
    { accessorKey: "crtAssessmentFinalScore", cell: (info) => <Badge colorScheme="teal">{Number(info.getValue()).toFixed(3)}</Badge>, header: () => <Text>Score</Text>, footer: (p) => p.column.id },
    {
      id: "approver",
      header: () => <Text>Approver</Text>,
      cell: (info) => canApproveMap[info.row.original.id]
        ? <Badge colorScheme="green" variant="subtle">Can Approve</Badge>
        : <Badge colorScheme="gray" variant="outline" fontSize="xs">Not Assigned</Badge>,
      footer: (p) => p.column.id,
    },
    {
      id: "actions",
      header: () => <Text>Detail</Text>,
      cell: (info) => <IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost"
        onClick={() => router.push(`/report/apps-assessments/assessment?id=${info.row.original.id}&source=pending`)} />,
      footer: (p) => p.column.id,
    },
  ], [selectedIds, canApproveMap, approvableIds, isDark]);

  // WA2 batch columns
  const wa2Columns = useMemo<ColumnDef<AppsCriticalReportBatchSummary>[]>(() => [
    { accessorKey: "batchCode", cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{info.getValue() as string}</Badge>, header: () => <Text>Batch Code</Text>, footer: (p) => p.column.id },
    { accessorKey: "quartalReport", cell: (info) => <Text fontSize="sm">{info.getValue() as string} {info.row.original.yearReport}</Text>, header: () => <Text>Period</Text>, footer: (p) => p.column.id },
    { accessorKey: "statusReport", cell: (info) => <Badge colorScheme={statusColor(info.getValue() as string)} variant="subtle">{info.getValue() as string}</Badge>, header: () => <Text>Status</Text>, footer: (p) => p.column.id },
    { accessorKey: "assessmentCount", cell: (info) => <Badge colorScheme="teal">{info.getValue() as number} apps</Badge>, header: () => <Text>Apps</Text>, footer: (p) => p.column.id },
    {
      id: "actions", header: () => <Text>Review</Text>,
      cell: (info) => <Button size="sm" colorScheme="blue" leftIcon={<FiEye />} onClick={() => handleOpenBatchDetail(info.row.original)}>Review</Button>,
      footer: (p) => p.column.id,
    },
  ], []);

  // WA1 client-side filter
  const filteredWa1 = useMemo(() => {
    return wa1Data.filter(a => {
      const q = search.toLowerCase();
      if (q && !(
        a.appShortName?.toLowerCase().includes(q) ||
        a.appName?.toLowerCase().includes(q) ||
        a.appManageByGroupName?.toLowerCase().includes(q)
      )) return false;
      if (filterGroup) {
        if (a.appManageByGroupId !== filterGroup) return false;
      }
      if (filterQ && a.quartalReport !== filterQ) return false;
      if (filterYear && a.yearReport !== filterYear) return false;
      if (filterReview === "reviewed" && !a.isFullyReviewed) return false;
      if (filterReview === "pending" && a.isFullyReviewed) return false;
      return true;
    });
  }, [wa1Data, search, filterGroup, filterQ, filterYear, filterReview]);

  const wa1Table = useReactTable({ data: filteredWa1, columns: wa1Columns, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const wa2Table = useReactTable({ data: wa2Batches, columns: wa2Columns, pageCount: totalPages, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), manualFiltering: true, manualPagination: true });

  const tabConfig = [
    { mode: "WA1" as TabMode, label: "Waiting Approval 1", icon: FiClock },
    { mode: "WA2" as TabMode, label: "Waiting Approval 2", icon: FiClock },
    { mode: "FINAL" as TabMode, label: "Approved / Decline", icon: FiCheckCircle },
  ];

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Pending Approve — Apps Assessment" breadCrumb={["Home", "Report", "Pending Approve Assessment Apps"]} />
      <Box p={4}>
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <HStack spacing={3}>
                <Box w={10} h={10} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FiActivity} boxSize={5} /></Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={isDark ? "white" : "gray.800"}>Apps Assessment Approval</Heading>
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Review and approve assessment reports</Text>
                </VStack>
              </HStack>

              {/* Tabs */}
              <HStack spacing={1} bg={isDark ? "gray.700" : "gray.100"} rounded="lg" p={1} w="fit-content">
                {tabConfig.map(({ mode, label, icon }) => (
                  <Button key={mode} size="sm" px={4} variant={tabMode === mode ? "solid" : "ghost"} colorScheme={tabMode === mode ? "purple" : "gray"} leftIcon={<Icon as={icon} />}
                    onClick={() => { setTabMode(mode); setPagination({ pageIndex: 0, pageSize }); }}>
                    {label}
                  </Button>
                ))}
              </HStack>

              {/* Filters + bulk action for WA1 */}
              <Flex gap={3} wrap="wrap" align="center">
                <InputGroup maxW="260px">
                  <InputLeftElement><Search2Icon color="gray.400" /></InputLeftElement>
                  <Input placeholder="Search app name or group..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setRefresh(p => p + 1)} bg={isDark ? "gray.700" : "white"} />
                </InputGroup>

                {/* Group filter */}
                <Box minW="170px">
                  <Select
                    placeholder="All Groups"
                    value={isGroupLocked ? filterGroup : filterGroup}
                    size="md"
                    bg={isDark ? "gray.700" : "white"}
                    isDisabled={isGroupLocked}
                    title={isGroupLocked ? "Filtered by your group" : undefined}
                    onChange={e => { if (!isGroupLocked) setFilterGroup(e.target.value); }}
                  >
                    {groupOptions.map(g => (
                      <option key={g.id} value={g.id}>{g.orgName}</option>
                    ))}
                  </Select>
                  {isGroupLocked && (
                    <HStack spacing={1} mt={1}>
                      <Icon as={FiLock} boxSize={2.5} color="orange.400" />
                      <Text fontSize="2xs" color="orange.400">Filtered by your group</Text>
                    </HStack>
                  )}
                </Box>

                <Select placeholder="All Quarters" value={filterQ} onChange={e => setFilterQ(e.target.value)} maxW="130px" bg={isDark ? "gray.700" : "white"}>
                  {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                </Select>
                <Select placeholder="All Years" value={filterYear} onChange={e => setFilterYear(e.target.value)} maxW="110px" bg={isDark ? "gray.700" : "white"}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
                <Select placeholder="All Review" value={filterReview} onChange={e => setFilterReview(e.target.value as "" | "reviewed" | "pending")} maxW="130px" bg={isDark ? "gray.700" : "white"}>
                  <option value="reviewed">Reviewed</option>
                  <option value="pending">Not Yet</option>
                </Select>

                <Button variant="outline" leftIcon={<Icon as={FiX} />} onClick={() => {
                  setSearch("");
                  if (!isGroupLocked) setFilterGroup("");
                  setFilterQ("");
                  setFilterYear("");
                  setFilterReview("");
                  setRefresh(p => p + 1);
                }}>Clear</Button>
                <Spacer />
                {tabMode === "WA1" && selectedIds.size > 0 && (
                  <Button colorScheme="green" size="sm" onClick={onBulkOpen}>
                    Bulk Approve ({selectedIds.size} selected)
                  </Button>
                )}
                <Button colorScheme="gray" leftIcon={<Icon as={FiRefreshCw} />} onClick={() => { setWa1Data([]); setRefresh(p => p + 1); }}>Refresh</Button>
              </Flex>

              <HStack>
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{filteredWa1.length} / {wa1Data.length} record(s)</Text>
                <Spacer />
                <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>Page {pageIndex + 1} of {totalPages || 1}</Text>
              </HStack>

              {loading ? <Flex justify="center" py={8}><VStack spacing={3}><Spinner size="xl" color="purple.500" thickness="4px" /><Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Loading data, please wait...</Text></VStack></Flex> : (
                <>
                  {tabMode === "WA1" && <TableComponentFull table={wa1Table} />}
                  {tabMode === "WA2" && (
                    isWA2Approver
                      ? <TableComponentFull table={wa2Table} />
                      : (
                        <VStack py={12} spacing={3} textAlign="center">
                          <Box w={16} h={16} bg={isDark ? "gray.700" : "gray.100"} rounded="full" display="flex" alignItems="center" justifyContent="center">
                            <Icon as={FiLock} boxSize={8} color={isDark ? "gray.500" : "gray.400"} />
                          </Box>
                          <Text fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>Tidak memiliki akses</Text>
                          <Text fontSize="sm" color={isDark ? "gray.500" : "gray.400"}>Hanya approver target Waiting Approval 2 yang dapat melihat data ini.</Text>
                        </VStack>
                      )
                  )}
                  {tabMode === "FINAL" && (
                    <Stack spacing={3}>
                      {finalData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map(a => (
                        <Flex key={a.id} p={3} bg={isDark ? "gray.750" : "gray.50"} rounded="lg" border="1px" borderColor={isDark ? "gray.600" : "gray.200"} align="center" gap={4}>
                          <VStack align="start" spacing={0} flex={1}><Text fontWeight="semibold" fontSize="sm">{a.appShortName}</Text><Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{a.appName}</Text></VStack>
                          <Badge colorScheme="purple" fontFamily="mono" fontSize="xs">{a.batchCode}</Badge>
                          <Badge colorScheme={statusColor(a.statusReport)} variant="solid">{a.statusReport}</Badge>
                          <IconButton aria-label="View" icon={<FiEye />} size="sm" colorScheme="purple" variant="ghost"
                            onClick={() => router.push(`/report/apps-assessments/assessment?id=${a.id}&source=pending`)} />
                        </Flex>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Bulk Approve Modal */}
      <Modal isOpen={isBulkOpen} onClose={onBulkClose} size="md">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>Bulk Approval — {selectedIds.size} Assessment(s)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>You are about to approve/decline {selectedIds.size} selected assessment(s). This action follows the approval flow.</Text>
              <Textarea placeholder="Note (optional)" value={approveNote} onChange={e => setApproveNote(e.target.value)} rows={3} bg={isDark ? "gray.700" : "white"} />
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onBulkClose}>Cancel</Button>
            <Button colorScheme="red" variant="outline" isLoading={bulkApproving} onClick={() => handleBulkApprove(false)}>Decline All</Button>
            <Button colorScheme="green" isLoading={bulkApproving} onClick={() => handleBulkApprove(true)}>Approve All</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Batch Review Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={onBatchModalClose}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded={radiusStyle} maxW="1200px" maxH="90vh">
          <ModalHeader
            pb={3}
            borderBottom="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
          >
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={3}
              pr={6}
            >
              <HStack spacing={2} wrap="wrap">
                <Box
                  w="34px"
                  h="34px"
                  borderRadius="lg"
                  bg={isDark ? "purple.900" : "purple.50"}
                  color={isDark ? "purple.300" : "purple.600"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiActivity} fontSize="18px" />
                </Box>
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Text fontSize="md" fontWeight="bold">
                      Batch Review & Approval
                    </Text>
                    <Badge
                      colorScheme="purple"
                      fontFamily="mono"
                      fontSize="sm"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {selectedBatch?.batchCode}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                    Waiting Approval 2 — Final Governance & Architecture Sign-Off
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2}>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {selectedBatch?.quartalReport} {selectedBatch?.yearReport}
                </Badge>
                <Badge
                  colorScheme={statusColor(selectedBatch?.statusReport || "")}
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {selectedBatch?.statusReport}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="purple"
                  leftIcon={<FiExternalLink />}
                  onClick={() =>
                    window.open(
                      `/report/apps-assessments/detail?batchCode=${selectedBatch?.batchCode}`,
                      "_blank"
                    )
                  }
                  title="Open full batch workspace page in new tab"
                >
                  Batch Page
                </Button>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={5} px={6}>
            {!batchDetail ? (
              <Flex justify="center" align="center" py={16}>
                <VStack spacing={3}>
                  <Spinner size="xl" color="purple.500" thickness="4px" />
                  <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
                    Loading batch assessment data...
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <Stack spacing={5}>
                {/* 1. Quick Stats Metric Grid (6 Cards) */}
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 6 }}
                  spacing={3}
                >
                  {/* Card 1: Total Apps */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "ACTIVE"
                        ? "blue.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        Total Systems
                      </Text>
                      <Icon as={FiLayers} color="blue.400" fontSize="13px" />
                    </Flex>
                    <HStack align="baseline" spacing={1}>
                      <Heading size="sm">{modalStats.total}</Heading>
                      <Text fontSize="2xs" color="gray.400">
                        apps
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme="green"
                      fontSize="2xs"
                      px={1.5}
                      py={0.2}
                      borderRadius="md"
                      mt={1}
                    >
                      {modalStats.active} Active
                    </Badge>
                  </Box>

                  {/* Card 2: Skipped */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "SKIPPED"
                        ? "purple.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        Skipped
                      </Text>
                      <Icon
                        as={FiSkipForward}
                        color="purple.400"
                        fontSize="13px"
                      />
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                      <Heading size="sm">{modalStats.skipped}</Heading>
                      <Badge colorScheme="purple" fontSize="2xs">
                        {modalStats.skippedPct}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={modalStats.skippedPct}
                      size="xs"
                      colorScheme="purple"
                      borderRadius="full"
                      mt={1.5}
                    />
                  </Box>

                  {/* Card 3: Criteria Review */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "REVIEW_DONE" ||
                      modalFilterQuick === "REVIEW_PENDING"
                        ? "teal.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        Criteria Review
                      </Text>
                      <Icon
                        as={FiCheckCircle}
                        color="teal.400"
                        fontSize="13px"
                      />
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                      <Text fontSize="sm" fontWeight="bold">
                        {modalStats.reviewSatisfied}/{modalStats.total}
                      </Text>
                      <Badge
                        colorScheme={
                          modalStats.reviewProgressPct === 100
                            ? "green"
                            : "teal"
                        }
                        fontSize="2xs"
                      >
                        {modalStats.reviewProgressPct}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={modalStats.reviewProgressPct}
                      size="xs"
                      colorScheme={
                        modalStats.reviewProgressPct === 100 ? "green" : "teal"
                      }
                      borderRadius="full"
                      mt={1.5}
                    />
                  </Box>

                  {/* Card 4: RTO Suggestion (IAG) */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "RTO_UNFILLED"
                        ? "orange.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        RTO (IAG)
                      </Text>
                      <Icon as={FiZap} color="orange.400" fontSize="13px" />
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                      <Text fontSize="sm" fontWeight="bold">
                        {modalStats.rtoSatisfied}/{modalStats.total}
                      </Text>
                      <Badge
                        colorScheme={
                          modalStats.rtoProgressPct === 100 ? "green" : "orange"
                        }
                        fontSize="2xs"
                      >
                        {modalStats.rtoProgressPct}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={modalStats.rtoProgressPct}
                      size="xs"
                      colorScheme={
                        modalStats.rtoProgressPct === 100 ? "green" : "orange"
                      }
                      borderRadius="full"
                      mt={1.5}
                    />
                  </Box>

                  {/* Card 5: RTO IT (Committed) */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "RTO_IT_UNFILLED"
                        ? "yellow.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        RTO IT (Committed)
                      </Text>
                      <Icon as={FiClock} color="yellow.400" fontSize="13px" />
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                      <Text fontSize="sm" fontWeight="bold">
                        {modalStats.rtoItSatisfied}/{modalStats.total}
                      </Text>
                      <Badge
                        colorScheme={
                          modalStats.rtoItProgressPct === 100 ? "green" : "yellow"
                        }
                        fontSize="2xs"
                      >
                        {modalStats.rtoItProgressPct}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={modalStats.rtoItProgressPct}
                      size="xs"
                      colorScheme={
                        modalStats.rtoItProgressPct === 100 ? "green" : "yellow"
                      }
                      borderRadius="full"
                      mt={1.5}
                    />
                  </Box>

                  {/* Card 6: RPO Target */}
                  <Box
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    borderRadius={radiusStyle}
                    border="1px solid"
                    borderColor={
                      modalFilterQuick === "RPO_UNFILLED"
                        ? "pink.500"
                        : isDark
                        ? "gray.700"
                        : "gray.200"
                    }
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color={isDark ? "gray.400" : "gray.500"}
                        textTransform="uppercase"
                      >
                        RPO Target (BMT)
                      </Text>
                      <Icon as={FiActivity} color="pink.400" fontSize="13px" />
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                      <Text fontSize="sm" fontWeight="bold">
                        {modalStats.rpoSatisfied}/{modalStats.total}
                      </Text>
                      <Badge
                        colorScheme={
                          modalStats.rpoProgressPct === 100 ? "green" : "pink"
                        }
                        fontSize="2xs"
                      >
                        {modalStats.rpoProgressPct}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={modalStats.rpoProgressPct}
                      size="xs"
                      colorScheme={
                        modalStats.rpoProgressPct === 100 ? "green" : "pink"
                      }
                      borderRadius="full"
                      mt={1.5}
                    />
                  </Box>
                </SimpleGrid>

                {/* Warning Alert Banner (if pending items exist) */}
                {!modalStats.isBatch100Ready && (
                  <Alert
                    status="warning"
                    variant="subtle"
                    borderRadius={radiusStyle}
                    py={2.5}
                    px={4}
                    border="1px solid"
                    borderColor={isDark ? "yellow.700" : "yellow.300"}
                  >
                    <AlertIcon as={FiAlertTriangle} />
                    <Box flex="1">
                      <AlertTitle fontSize="xs" fontWeight="bold">
                        Peringatan Kelayakan Batch (Terdapat {modalStats.incompleteApps.length} Aplikasi Belum Lengkap)
                      </AlertTitle>
                      <AlertDescription fontSize="2xs">
                        {modalStats.rtoUnfilled > 0 &&
                          `• ${modalStats.rtoUnfilled} app(s) belum terisi RTO Suggestion (IAG). `}
                        {modalStats.rtoItUnfilled > 0 &&
                          `• ${modalStats.rtoItUnfilled} app(s) belum terisi RTO IT (Committed). `}
                        {modalStats.rpoUnfilled > 0 &&
                          `• ${modalStats.rpoUnfilled} app(s) belum terisi RPO Target (BMT). `}
                        {modalStats.reviewPending > 0 &&
                          `• ${modalStats.reviewPending} app(s) belum selesai Criteria Review.`}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* 2. Filter & Search Row for Apps List */}
                <VStack align="stretch" spacing={2.5}>
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={3}
                  >
                    <Text fontWeight="semibold" fontSize="sm">
                      Applications ({modalFilteredAssessments.length} /{" "}
                      {modalStats.total}):
                    </Text>
                    <InputGroup size="sm" maxW="280px">
                      <InputLeftElement>
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search app, code, or group..."
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                        borderRadius="md"
                        bg={isDark ? "gray.700" : "white"}
                      />
                    </InputGroup>
                  </Flex>

                  {/* Filter Pills */}
                  <Flex gap={1.5} wrap="wrap" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="semibold"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      Filter:
                    </Text>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      cursor="pointer"
                      fontSize="2xs"
                      colorScheme={
                        modalFilterQuick === "ALL" ? "blue" : "gray"
                      }
                      variant={
                        modalFilterQuick === "ALL" ? "solid" : "subtle"
                      }
                      onClick={() => setModalFilterQuick("ALL")}
                    >
                      All ({modalStats.total})
                    </Badge>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      cursor="pointer"
                      fontSize="2xs"
                      colorScheme={
                        modalFilterQuick === "ACTIVE" ? "green" : "gray"
                      }
                      variant={
                        modalFilterQuick === "ACTIVE" ? "solid" : "subtle"
                      }
                      onClick={() => setModalFilterQuick("ACTIVE")}
                    >
                      Active ({modalStats.active})
                    </Badge>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      cursor="pointer"
                      fontSize="2xs"
                      colorScheme={
                        modalFilterQuick === "SKIPPED" ? "purple" : "gray"
                      }
                      variant={
                        modalFilterQuick === "SKIPPED" ? "solid" : "subtle"
                      }
                      onClick={() => setModalFilterQuick("SKIPPED")}
                    >
                      Skipped ({modalStats.skipped})
                    </Badge>
                    {modalStats.incompleteApps.length > 0 && (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        cursor="pointer"
                        fontSize="2xs"
                        colorScheme={
                          modalFilterQuick === "INCOMPLETE" ? "red" : "gray"
                        }
                        variant={
                          modalFilterQuick === "INCOMPLETE"
                            ? "solid"
                            : "subtle"
                        }
                        onClick={() => setModalFilterQuick("INCOMPLETE")}
                      >
                        ⚠️ Incomplete ({modalStats.incompleteApps.length})
                      </Badge>
                    )}
                    {modalStats.rtoUnfilled > 0 && (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        cursor="pointer"
                        fontSize="2xs"
                        colorScheme={
                          modalFilterQuick === "RTO_UNFILLED"
                            ? "orange"
                            : "gray"
                        }
                        variant={
                          modalFilterQuick === "RTO_UNFILLED"
                            ? "solid"
                            : "subtle"
                        }
                        onClick={() => setModalFilterQuick("RTO_UNFILLED")}
                      >
                        Pending RTO IAG ({modalStats.rtoUnfilled})
                      </Badge>
                    )}
                    {modalStats.rtoItUnfilled > 0 && (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        cursor="pointer"
                        fontSize="2xs"
                        colorScheme={
                          modalFilterQuick === "RTO_IT_UNFILLED"
                            ? "yellow"
                            : "gray"
                        }
                        variant={
                          modalFilterQuick === "RTO_IT_UNFILLED"
                            ? "solid"
                            : "subtle"
                        }
                        onClick={() => setModalFilterQuick("RTO_IT_UNFILLED")}
                      >
                        Pending RTO IT ({modalStats.rtoItUnfilled})
                      </Badge>
                    )}
                    {modalStats.rpoUnfilled > 0 && (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        cursor="pointer"
                        fontSize="2xs"
                        colorScheme={
                          modalFilterQuick === "RPO_UNFILLED" ? "pink" : "gray"
                        }
                        variant={
                          modalFilterQuick === "RPO_UNFILLED"
                            ? "solid"
                            : "subtle"
                        }
                        onClick={() => setModalFilterQuick("RPO_UNFILLED")}
                      >
                        Pending RPO ({modalStats.rpoUnfilled})
                      </Badge>
                    )}
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      cursor="pointer"
                      fontSize="2xs"
                      colorScheme={
                        modalFilterQuick === "REVIEW_DONE" ? "teal" : "gray"
                      }
                      variant={
                        modalFilterQuick === "REVIEW_DONE" ? "solid" : "subtle"
                      }
                      onClick={() => setModalFilterQuick("REVIEW_DONE")}
                    >
                      Reviewed ({modalStats.fullyReviewed})
                    </Badge>
                  </Flex>
                </VStack>

                {/* 3. List of Assessments */}
                <Box
                  maxH="380px"
                  overflowY="auto"
                  borderRadius={radiusStyle}
                  border="1px solid"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  bg={isDark ? "gray.900" : "gray.50"}
                  p={2}
                >
                  {modalFilteredAssessments.length === 0 ? (
                    <Flex justify="center" align="center" py={10}>
                      <Text fontSize="xs" color="gray.400">
                        Tidak ada aplikasi yang sesuai dengan filter pencarian.
                      </Text>
                    </Flex>
                  ) : (
                    <Stack spacing={2}>
                      {modalFilteredAssessments.map((a, idx) => {
                        const isSkipped = a.isSkipReview === "TRUE";
                        const rtoSet =
                          !isSkipped &&
                          a.appsRtoSuggestionMinutes !== null &&
                          a.appsRtoSuggestionMinutes > 0;
                        const rtoItSet =
                          !isSkipped &&
                          a.appsRtoItMinutes !== null &&
                          a.appsRtoItMinutes > 0;
                        const rpoSet =
                          !isSkipped &&
                          a.appsRpoMinutes !== null &&
                          a.appsRpoMinutes > 0;

                        return (
                          <Box
                            key={a.id}
                            p={3}
                            bg={isDark ? "gray.800" : "white"}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={isDark ? "gray.700" : "gray.200"}
                            boxShadow="xs"
                            transition="all 0.15s ease"
                            _hover={{
                              borderColor: isDark
                                ? "purple.400"
                                : "purple.300",
                              boxShadow: "sm",
                            }}
                          >
                            <Flex
                              justify="space-between"
                              align="center"
                              wrap="wrap"
                              gap={2}
                            >
                              {/* Left: App identifiers */}
                              <HStack spacing={3} flex={1} minW="240px">
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color={isDark ? "gray.500" : "gray.400"}
                                  w="20px"
                                >
                                  #{idx + 1}
                                </Text>
                                <VStack align="start" spacing={0.5}>
                                  <HStack spacing={2}>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="bold"
                                      color={isDark ? "white" : "gray.800"}
                                    >
                                      {a.appShortName}
                                    </Text>
                                    {a.appCode && (
                                      <Badge
                                        variant="outline"
                                        fontSize="2xs"
                                        colorScheme="gray"
                                      >
                                        {a.appCode}
                                      </Badge>
                                    )}
                                    {isSkipped ? (
                                      <Badge
                                        colorScheme="purple"
                                        fontSize="2xs"
                                        variant="solid"
                                      >
                                        Stage Dev / Skipped
                                      </Badge>
                                    ) : (
                                      <Badge
                                        colorScheme={statusColor(
                                          a.statusReport
                                        )}
                                        variant="subtle"
                                        fontSize="2xs"
                                      >
                                        {a.statusReport}
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Text
                                    fontSize="xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                    noOfLines={1}
                                  >
                                    {a.appName || "-"}
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                  >
                                    Managed by:{" "}
                                    <Text as="span" fontWeight="medium">
                                      {a.appManageByGroupName || "-"}
                                    </Text>
                                  </Text>
                                </VStack>
                              </HStack>

                              {/* Center: SLA Metrics (Category, Score, RTO IAG, RTO IT, RPO Target, Criteria) */}
                              <HStack spacing={2.5} wrap="wrap">
                                {/* Category Badge */}
                                {a.appCrtCategoryName ? (
                                  <Badge
                                    colorScheme="blue"
                                    variant="subtle"
                                    fontSize="2xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                  >
                                    {a.appCrtCategoryName}
                                  </Badge>
                                ) : (
                                  <Badge
                                    colorScheme="gray"
                                    variant="outline"
                                    fontSize="2xs"
                                  >
                                    No Category
                                  </Badge>
                                )}

                                {/* Final Score */}
                                <VStack spacing={0} align="center" minW="55px">
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                  >
                                    Score
                                  </Text>
                                  <Badge
                                    colorScheme="purple"
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    px={1.5}
                                  >
                                    {Number(
                                      a.crtAssessmentFinalScore || 0
                                    ).toFixed(3)}
                                  </Badge>
                                </VStack>

                                {/* RTO (IAG) */}
                                <VStack spacing={0} align="center" minW="75px">
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                  >
                                    RTO (IAG)
                                  </Text>
                                  {isSkipped ? (
                                    <Text fontSize="2xs" color="gray.400">
                                      Skipped
                                    </Text>
                                  ) : rtoSet ? (
                                    <Badge
                                      colorScheme="orange"
                                      variant="subtle"
                                      fontSize="2xs"
                                    >
                                      {a.appsRtoSuggestionOperator || ""}{" "}
                                      {a.appsRtoSuggestionMinutes} mnt
                                    </Badge>
                                  ) : (
                                    <Badge
                                      colorScheme="orange"
                                      variant="solid"
                                      fontSize="2xs"
                                    >
                                      ⚠ Not Set
                                    </Badge>
                                  )}
                                </VStack>

                                {/* RTO IT (Committed) */}
                                <VStack spacing={0} align="center" minW="75px">
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                  >
                                    RTO (IT)
                                  </Text>
                                  {isSkipped ? (
                                    <Text fontSize="2xs" color="gray.400">
                                      Skipped
                                    </Text>
                                  ) : rtoItSet ? (
                                    <Badge
                                      colorScheme="yellow"
                                      variant="subtle"
                                      fontSize="2xs"
                                    >
                                      {a.appsRtoItOperator || ""}{" "}
                                      {a.appsRtoItMinutes} mnt
                                    </Badge>
                                  ) : (
                                    <Badge
                                      colorScheme="yellow"
                                      variant="solid"
                                      fontSize="2xs"
                                    >
                                      ⚠ Not Set
                                    </Badge>
                                  )}
                                </VStack>

                                {/* RPO Target */}
                                <VStack spacing={0} align="center" minW="75px">
                                  <Text
                                    fontSize="2xs"
                                    color={isDark ? "gray.400" : "gray.500"}
                                  >
                                    RPO Target
                                  </Text>
                                  {isSkipped ? (
                                    <Text fontSize="2xs" color="gray.400">
                                      Skipped
                                    </Text>
                                  ) : rpoSet ? (
                                    <Badge
                                      colorScheme="pink"
                                      variant="subtle"
                                      fontSize="2xs"
                                    >
                                      {a.appsRpoOperator || ""}{" "}
                                      {a.appsRpoMinutes} mnt
                                    </Badge>
                                  ) : (
                                    <Text fontSize="2xs" color="gray.400">
                                      —
                                    </Text>
                                  )}
                                </VStack>

                                {/* Criteria review tag */}
                                {isSkipped ? (
                                  <Badge
                                    colorScheme="gray"
                                    variant="subtle"
                                    fontSize="2xs"
                                  >
                                    Bypassed
                                  </Badge>
                                ) : a.isFullyReviewed ? (
                                  <Badge
                                    colorScheme="green"
                                    variant="subtle"
                                    fontSize="2xs"
                                  >
                                    ✓ Done ({a.filledCount}/{a.totalCount})
                                  </Badge>
                                ) : (
                                  <Badge
                                    colorScheme="orange"
                                    variant="outline"
                                    fontSize="2xs"
                                  >
                                    Pending ({a.filledCount}/{a.totalCount})
                                  </Badge>
                                )}

                                {/* Action Icon: View Assessment Wizard */}
                                <Tooltip
                                  label="View detailed assessment in new tab"
                                  placement="top"
                                  hasArrow
                                >
                                  <IconButton
                                    aria-label="View Assessment"
                                    icon={<FiExternalLink />}
                                    size="xs"
                                    colorScheme="purple"
                                    variant="ghost"
                                    onClick={() =>
                                      window.open(
                                        `/report/apps-assessments/assessment?id=${a.id}&source=pending`,
                                        "_blank"
                                      )
                                    }
                                  />
                                </Tooltip>
                              </HStack>
                            </Flex>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* 4. Approval Note & Guidance */}
                <VStack align="stretch" spacing={2}>
                  <Text
                    fontWeight="semibold"
                    fontSize="xs"
                    color={isDark ? "gray.300" : "gray.700"}
                  >
                    Approval / Sign-Off Note (Optional):
                  </Text>
                  <Textarea
                    placeholder="Enter approval rationale, governance notes, or reason for revision..."
                    value={batchNote}
                    onChange={(e) => setBatchNote(e.target.value)}
                    rows={2}
                    bg={isDark ? "gray.700" : "white"}
                    fontSize="sm"
                    borderRadius="md"
                  />
                </VStack>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter
            borderTop="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            py={3}
            px={6}
            justifyContent="space-between"
          >
            <Button variant="ghost" size="sm" onClick={onBatchModalClose}>
              Cancel
            </Button>
            <HStack spacing={2}>
              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                leftIcon={<FiXCircle />}
                isLoading={batchApproving}
                isDisabled={!batchDetail}
                onClick={handleOpenDeclineConfirm}
              >
                Decline Batch
              </Button>
              <Button
                colorScheme="green"
                size="sm"
                leftIcon={<FiCheckCircle />}
                isLoading={batchApproving}
                isDisabled={!batchDetail}
                onClick={handleOpenApproveConfirm}
              >
                Approve Batch
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* WA2 Batch Approval Confirmation & Readiness Dialog */}
      <Modal
        isOpen={isConfirmApproveOpen}
        onClose={onConfirmApproveClose}
        size="xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent
          bg={isDark ? "gray.800" : "white"}
          borderRadius={radiusStyle}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <ModalHeader
            borderBottom="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            py={3.5}
            px={6}
          >
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bg="green.500"
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiShield} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm">Konfirmasi Persetujuan Batch (WA2)</Heading>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                  Pemeriksaan Kesiapan Kriteria & Rekomendasi SLA
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4} px={6}>
            <VStack align="stretch" spacing={4}>
              {/* Batch Identity Bar */}
              <Flex
                p={3}
                bg={isDark ? "gray.750" : "gray.50"}
                borderRadius={radiusStyle}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
                border="1px solid"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold">
                    Batch Code
                  </Text>
                  <Text fontFamily="mono" fontWeight="bold" fontSize="sm" color="purple.400">
                    {selectedBatch?.batchCode}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                    {selectedBatch?.quartalReport} {selectedBatch?.yearReport}
                  </Badge>
                  <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                    Total: {modalStats.total} Apps
                  </Badge>
                </HStack>
              </Flex>

              {/* 5-Point Readiness Matrix */}
              <VStack align="stretch" spacing={2}>
                <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.300" : "gray.700"}>
                  Matriks Kelayakan Batch (5 Kriteria):
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                  {/* Item 1: Criteria Review */}
                  <Flex
                    p={2.5}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={modalStats.reviewPending === 0 ? "green.500" : "orange.400"}
                    bg={isDark ? "gray.750" : modalStats.reviewPending === 0 ? "green.50" : "orange.50"}
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={modalStats.reviewPending === 0 ? FiCheckCircle : FiAlertTriangle}
                        color={modalStats.reviewPending === 0 ? "green.500" : "orange.500"}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="semibold">
                          Criteria Review
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {modalStats.reviewSatisfied}/{modalStats.total} Selesai ({modalStats.reviewProgressPct}%)
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={modalStats.reviewPending === 0 ? "green" : "orange"} fontSize="2xs">
                      {modalStats.reviewPending === 0 ? "Lengkap" : `${modalStats.reviewPending} Pending`}
                    </Badge>
                  </Flex>

                  {/* Item 2: RTO Suggestion (IAG) */}
                  <Flex
                    p={2.5}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={modalStats.rtoUnfilled === 0 ? "green.500" : "orange.400"}
                    bg={isDark ? "gray.750" : modalStats.rtoUnfilled === 0 ? "green.50" : "orange.50"}
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={modalStats.rtoUnfilled === 0 ? FiCheckCircle : FiAlertTriangle}
                        color={modalStats.rtoUnfilled === 0 ? "green.500" : "orange.500"}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="semibold">
                          RTO Suggestion (IAG)
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {modalStats.rtoSatisfied}/{modalStats.total} Terisi ({modalStats.rtoProgressPct}%)
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={modalStats.rtoUnfilled === 0 ? "green" : "orange"} fontSize="2xs">
                      {modalStats.rtoUnfilled === 0 ? "Lengkap" : `${modalStats.rtoUnfilled} Kosong`}
                    </Badge>
                  </Flex>

                  {/* Item 3: RTO IT Committed */}
                  <Flex
                    p={2.5}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={modalStats.rtoItUnfilled === 0 ? "green.500" : "orange.400"}
                    bg={isDark ? "gray.750" : modalStats.rtoItUnfilled === 0 ? "green.50" : "orange.50"}
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={modalStats.rtoItUnfilled === 0 ? FiCheckCircle : FiAlertTriangle}
                        color={modalStats.rtoItUnfilled === 0 ? "green.500" : "orange.500"}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="semibold">
                          RTO IT (Committed)
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {modalStats.rtoItSatisfied}/{modalStats.total} Terisi ({modalStats.rtoItProgressPct}%)
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={modalStats.rtoItUnfilled === 0 ? "green" : "orange"} fontSize="2xs">
                      {modalStats.rtoItUnfilled === 0 ? "Lengkap" : `${modalStats.rtoItUnfilled} Kosong`}
                    </Badge>
                  </Flex>

                  {/* Item 4: RPO Target (BMT) */}
                  <Flex
                    p={2.5}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={modalStats.rpoUnfilled === 0 ? "green.500" : "orange.400"}
                    bg={isDark ? "gray.750" : modalStats.rpoUnfilled === 0 ? "green.50" : "orange.50"}
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={modalStats.rpoUnfilled === 0 ? FiCheckCircle : FiAlertTriangle}
                        color={modalStats.rpoUnfilled === 0 ? "green.500" : "orange.500"}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="semibold">
                          RPO Target (BMT)
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {modalStats.rpoSatisfied}/{modalStats.total} Terisi ({modalStats.rpoProgressPct}%)
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={modalStats.rpoUnfilled === 0 ? "green" : "orange"} fontSize="2xs">
                      {modalStats.rpoUnfilled === 0 ? "Lengkap" : `${modalStats.rpoUnfilled} Kosong`}
                    </Badge>
                  </Flex>
                </SimpleGrid>

                {/* Skipped Info Line */}
                {modalStats.skipped > 0 && (
                  <Flex
                    p={2}
                    bg={isDark ? "purple.900" : "purple.50"}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={isDark ? "purple.700" : "purple.200"}
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Icon as={FiSkipForward} color="purple.400" />
                      <Text fontSize="2xs" color={isDark ? "purple.200" : "purple.800"}>
                        <Text as="span" fontWeight="bold">
                          {modalStats.skipped} Aplikasi
                        </Text>{" "}
                        ditandai <em>Stage Dev / Bypassed</em> (Otomatis valid dan dikecualikan dari penilaian SLA).
                      </Text>
                    </HStack>
                    <Badge colorScheme="purple" fontSize="2xs">
                      Exempted
                    </Badge>
                  </Flex>
                )}
              </VStack>

              {/* Status Readiness Banner */}
              {modalStats.isBatch100Ready ? (
                <Alert
                  status="success"
                  variant="subtle"
                  borderRadius={radiusStyle}
                  py={2.5}
                  px={4}
                  border="1px solid"
                  borderColor={isDark ? "green.700" : "green.300"}
                >
                  <AlertIcon as={FiCheckCircle} />
                  <Box flex="1">
                    <AlertTitle fontSize="xs" fontWeight="bold">
                      Batch 100% Siap Disetujui
                    </AlertTitle>
                    <AlertDescription fontSize="2xs">
                      Seluruh {modalStats.total} aplikasi telah lengkap memenuhi kriteria penilaian dan SLA atau terverifikasi <em>Stage Dev</em>.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <VStack align="stretch" spacing={2.5}>
                  <Alert
                    status="warning"
                    variant="subtle"
                    borderRadius={radiusStyle}
                    py={2.5}
                    px={4}
                    border="1px solid"
                    borderColor={isDark ? "yellow.700" : "yellow.300"}
                  >
                    <AlertIcon as={FiAlertTriangle} />
                    <Box flex="1">
                      <AlertTitle fontSize="xs" fontWeight="bold">
                        Peringatan: Terdapat {modalStats.incompleteApps.length} Aplikasi Belum Lengkap
                      </AlertTitle>
                      <AlertDescription fontSize="2xs">
                        Beberapa aplikasi aktif belum memenuhi kewajiban kriteria review, rekomendasi RTO, atau target RPO.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Incomplete list box */}
                  <Box
                    p={2.5}
                    maxH="140px"
                    overflowY="auto"
                    borderRadius="md"
                    border="1px solid"
                    borderColor={isDark ? "gray.700" : "gray.200"}
                    bg={isDark ? "gray.900" : "gray.50"}
                  >
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400" mb={1.5} textTransform="uppercase">
                      Daftar Aplikasi Belum Lengkap ({modalStats.incompleteApps.length}):
                    </Text>
                    <VStack align="stretch" spacing={1.5}>
                      {modalStats.incompleteApps.map((item, idx) => (
                        <Flex
                          key={item.id}
                          justify="space-between"
                          align="center"
                          p={1.5}
                          bg={isDark ? "gray.800" : "white"}
                          borderRadius="sm"
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.100"}
                        >
                          <HStack spacing={2} minW="0">
                            <Text fontSize="2xs" fontWeight="bold" color="gray.400">
                              #{idx + 1}
                            </Text>
                            <Text fontSize="2xs" fontWeight="bold" noOfLines={1}>
                              {item.appShortName}
                            </Text>
                            <Text fontSize="2xs" color="gray.400" noOfLines={1}>
                              ({item.appManageByGroupName})
                            </Text>
                          </HStack>
                          <HStack spacing={1} wrap="wrap" justify="flex-end">
                            {item.missingItems.map((m) => (
                              <Badge key={m} colorScheme="red" variant="subtle" fontSize="3xs">
                                {m}
                              </Badge>
                            ))}
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>

                  {/* Governance Override Checkbox */}
                  <Box
                    p={2.5}
                    borderRadius="md"
                    bg={isDark ? "orange.950" : "orange.50"}
                    border="1px solid"
                    borderColor={isDark ? "orange.800" : "orange.200"}
                  >
                    <Checkbox
                      isChecked={acknowledgeOverride}
                      onChange={(e) => setAcknowledgeOverride(e.target.checked)}
                      colorScheme="orange"
                      size="sm"
                    >
                      <Text fontSize="2xs" fontWeight="medium" color={isDark ? "orange.200" : "orange.800"}>
                        Saya mengonfirmasi bahwa saya mengetahui terdapat <strong>{modalStats.incompleteApps.length} aplikasi yang belum lengkap</strong> dan menyetujui batch ini dengan diskresi tata kelola (<em>Governance Override</em>).
                      </Text>
                    </Checkbox>
                  </Box>
                </VStack>
              )}

              {/* Approval Note */}
              <VStack align="stretch" spacing={1}>
                <Text fontSize="xs" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"}>
                  Catatan Persetujuan {!modalStats.isBatch100Ready && <Text as="span" color="red.500">* (Wajib diisi untuk override)</Text>}:
                </Text>
                <Textarea
                  placeholder="Tuliskan alasan persetujuan, catatan tata kelola, atau justifikasi override..."
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                  rows={2}
                  bg={isDark ? "gray.700" : "white"}
                  fontSize="xs"
                  borderRadius="md"
                />
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            py={3}
            px={6}
            justifyContent="space-between"
          >
            <Button variant="ghost" size="sm" onClick={onConfirmApproveClose}>
              Batal / Kembali
            </Button>
            <Button
              colorScheme="green"
              size="sm"
              leftIcon={<FiCheckCircle />}
              isLoading={batchApproving}
              isDisabled={!modalStats.isBatch100Ready && (!acknowledgeOverride || !batchNote.trim())}
              onClick={() => handleBatchApprove(true, !modalStats.isBatch100Ready && acknowledgeOverride)}
            >
              Konfirmasi & Approve Batch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* WA2 Batch Decline Confirmation Dialog */}
      <Modal
        isOpen={isConfirmDeclineOpen}
        onClose={onConfirmDeclineClose}
        size="md"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent
          bg={isDark ? "gray.800" : "white"}
          borderRadius={radiusStyle}
          border="1px solid"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <ModalHeader
            borderBottom="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            py={3.5}
            px={6}
          >
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bg="red.500"
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiXCircle} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm">Konfirmasi Penolakan Batch</Heading>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                  {selectedBatch?.batchCode}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4} px={6}>
            <VStack align="stretch" spacing={3}>
              <Alert
                status="error"
                variant="subtle"
                borderRadius={radiusStyle}
                py={2.5}
                px={4}
                border="1px solid"
                borderColor={isDark ? "red.700" : "red.300"}
              >
                <AlertIcon as={FiAlertTriangle} />
                <Box flex="1">
                  <AlertTitle fontSize="xs" fontWeight="bold">
                    Penolakan Seluruh Batch
                  </AlertTitle>
                  <AlertDescription fontSize="2xs">
                    Menolak batch ini akan mengembalikan seluruh {modalStats.total} aplikasi ke status <strong>DECLINE</strong> agar dapat diperbaiki oleh masing-masing unit/pengelola aplikasi.
                  </AlertDescription>
                </Box>
              </Alert>

              <VStack align="stretch" spacing={1}>
                <Text fontSize="xs" fontWeight="semibold" color={isDark ? "gray.300" : "gray.700"}>
                  Alasan Penolakan / Catatan Perbaikan <Text as="span" color="red.500">* (Wajib)</Text>:
                </Text>
                <Textarea
                  placeholder="Tuliskan alasan penolakan dan arahan perbaikan yang harus dilakukan oleh PIC..."
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                  rows={3}
                  bg={isDark ? "gray.700" : "white"}
                  fontSize="xs"
                  borderRadius="md"
                />
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            py={3}
            px={6}
            justifyContent="space-between"
          >
            <Button variant="ghost" size="sm" onClick={onConfirmDeclineClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              leftIcon={<FiXCircle />}
              isLoading={batchApproving}
              isDisabled={!batchNote.trim()}
              onClick={() => handleBatchApprove(false, true)}
            >
              Konfirmasi Decline
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
