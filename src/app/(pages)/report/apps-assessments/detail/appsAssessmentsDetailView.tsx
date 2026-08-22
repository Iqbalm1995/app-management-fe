"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ORG_CATEGORY_KEY_GROUP,
  DIVISION_ID_IT_BJB,
  ORG_GROUP_WHITELIST_ALL_ACCESS,
  ORG_GROUP_WHITELIST_FULL_OVERRIDE,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
  AppsCriticalReportBatchDetailViewModel,
} from "@/app/services/useAppsCriticalReport";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { Search2Icon } from "@chakra-ui/icons";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { FaArrowLeft } from "react-icons/fa6";
import { FiActivity, FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiClock, FiEye, FiInfo, FiLock, FiPlusCircle, FiRefreshCw, FiX } from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";

const boolBadge = (v: string) => (
  <Badge
    colorScheme={v === "TRUE" ? "green" : "gray"}
    variant="subtle"
    fontSize="xs"
  >
    {v}
  </Badge>
);
const statusColor = (s: string) =>
  ({ DRAFT: "gray", PUBLISHED: "green", APPROVED: "blue", ARCHIVED: "orange" })[
    s
  ] || "gray";

export default function AppsAssessmentsDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchCode = searchParams.get("batchCode");

  const {
    GetBatchDetail,
    SubmitBatchForApproval,
    SyncBatchStatus,
    ReviseBatch,
    GetUnassignedApps,
    AssignAppsToBatch,
  } = useAppsCriticalReport();
  const { List: ListOrganization } = useOrganization();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [batchData, setBatchData] =
    useState<AppsCriticalReportBatchDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AppsCriticalReportAssessmentViewModel | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Unassigned Apps Modal State & 3-Second Confirmation Countdown Safeguard State
  const [isUnassignedModalOpen, setIsUnassignedModalOpen] = useState(false);
  const [unassignedAppsList, setUnassignedAppsList] = useState<any[]>([]);
  const [selectedUnassignedAppIds, setSelectedUnassignedAppIds] = useState<string[]>([]);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [isFetchingUnassigned, setIsFetchingUnassigned] = useState(false);
  const [isAssignConfirmOpen, setIsAssignConfirmOpen] = useState(false);
  const [assignCountdown, setAssignCountdown] = useState(3);
  const [isAssigning, setIsAssigning] = useState(false);

  // Group org state
  const [groupOptions, setGroupOptions] = useState<OrganizationResponse[]>([]);
  const [userOrgGroupId, setUserOrgGroupId] = useState<string | null>(null);
  const [isGroupLocked, setIsGroupLocked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check New Apps action button is ONLY available to users in ORG_GROUP_WHITELIST_FULL_OVERRIDE
  const canCheckNewApps = userOrgGroupId
    ? ORG_GROUP_WHITELIST_FULL_OVERRIDE.includes(userOrgGroupId)
    : false;

  const handleRefreshBatchData = async () => {
    if (!batchCode || !tokenData) return;
    setIsRefreshing(true);
    const res = await GetBatchDetail(batchCode, tokenData);
    setIsRefreshing(false);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setBatchData(res.data);
      showToast({
        description: "Assessment list data refreshed successfully",
        statusToast: "success",
      });
    } else {
      showToast({
        description: res?.message || "Failed to refresh batch data",
        statusToast: "error",
      });
    }
  };

  // Filter states
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReview, setFilterReview] = useState<"" | "reviewed" | "pending">(
    "",
  );

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const parsed = (JSON.parse(storedData) as AuthDataModelInterface)
        .dataLogin as AuthDataResponse;
      setDataAuth(parsed);

      // Determine group filter lock based on orgGroupId
      // Note: JWT encodes null as "-" — treat "-" as no group
      const rawOrgGroupId = parsed.team?.orgGroupId || null;
      const orgGroupId =
        rawOrgGroupId && rawOrgGroupId !== "-" ? rawOrgGroupId : null;
      setUserOrgGroupId(orgGroupId);

      // Lock group filter only if user has a real orgGroupId AND it's NOT in the whitelist
      if (orgGroupId && !ORG_GROUP_WHITELIST_ALL_ACCESS.includes(orgGroupId)) {
        setIsGroupLocked(true);
        setFilterGroup(orgGroupId);
      }
    }
    if (token) setTokenData(token);
  }, []);

  // Load group org options for the manual group filter dropdown
  useEffect(() => {
    if (!tokenData) return;
    const loadGroups = async () => {
      try {
        const res = await ListOrganization(
          {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [
              {
                field: "orgType",
                operator: "=",
                value: ORG_CATEGORY_KEY_GROUP,
              },
              { field: "parentId", operator: "=", value: DIVISION_ID_IT_BJB },
            ],
            fieldOrder: ["orgName"],
            orderDir: "asc",
          } as PaggingListPayload,
          tokenData,
        );
        if (res?.statusCode === RES_CODE_OK && res.data) {
          setGroupOptions(res.data);
        }
      } catch {
        /* silent */
      }
    };
    loadGroups();
  }, [tokenData]);

  useEffect(() => {
    if (!tokenData || !batchCode) return;
    const load = async () => {
      setLoading(true);
      const res = await GetBatchDetail(batchCode, tokenData);
      if (res?.statusCode === RES_CODE_OK && res.data) setBatchData(res.data);
      else
        showToast({
          description: res?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      setLoading(false);
    };
    load();
  }, [tokenData, batchCode]);

  // Countdown timer effect for Assign Confirmation Modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAssignConfirmOpen && assignCountdown > 0) {
      timer = setTimeout(() => setAssignCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isAssignConfirmOpen, assignCountdown]);

  // Fetch Unassigned Apps from Master Data
  const handleFetchUnassignedApps = async () => {
    if (!batchCode || !tokenData) return;
    setIsFetchingUnassigned(true);
    const res = await GetUnassignedApps(batchCode, tokenData);
    setIsFetchingUnassigned(false);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setUnassignedAppsList(res.data);
      setSelectedUnassignedAppIds([]);
      setUnassignedSearch("");
      setIsUnassignedModalOpen(true);
    } else {
      showToast({
        description: res?.message || "Failed to fetch unassigned applications",
        statusToast: "error",
      });
    }
  };

  // Client-side filtering for unassigned apps modal
  const filteredUnassignedApps = useMemo(() => {
    if (!unassignedSearch) return unassignedAppsList;
    const q = unassignedSearch.toLowerCase();
    return unassignedAppsList.filter(
      (app) =>
        app.appCode?.toLowerCase().includes(q) ||
        app.appShortName?.toLowerCase().includes(q) ||
        app.appName?.toLowerCase().includes(q) ||
        app.appOwnerGroupName?.toLowerCase().includes(q),
    );
  }, [unassignedAppsList, unassignedSearch]);

  const handleToggleSelectAllUnassigned = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUnassignedAppIds(filteredUnassignedApps.map((a) => a.id));
    } else {
      setSelectedUnassignedAppIds([]);
    }
  };

  const handleToggleSelectUnassignedApp = (id: string) => {
    setSelectedUnassignedAppIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleOpenAssignConfirm = () => {
    if (selectedUnassignedAppIds.length === 0) return;
    setAssignCountdown(3);
    setIsAssignConfirmOpen(true);
  };

  const handleExecuteAssignApps = async () => {
    if (!batchCode || !tokenData || selectedUnassignedAppIds.length === 0) return;
    setIsAssigning(true);
    const res = await AssignAppsToBatch(
      { batchCode, appIds: selectedUnassignedAppIds },
      tokenData,
    );
    setIsAssigning(false);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({
        description: res.data || "Successfully assigned applications to batch",
        statusToast: "success",
      });
      setIsAssignConfirmOpen(false);
      setIsUnassignedModalOpen(false);
      setSelectedUnassignedAppIds([]);

      // Reload Batch Detail
      const reload = await GetBatchDetail(batchCode, tokenData);
      if (reload?.statusCode === RES_CODE_OK && reload.data) {
        setBatchData(reload.data);
      }
    } else {
      showToast({
        description: res?.message || "Failed to assign applications to batch",
        statusToast: "error",
      });
    }
  };

  // groupOptions loaded from master org data (via useEffect above)

  // Client-side filtered data
  const filteredAssessments = useMemo(() => {
    const all = batchData?.assessments || [];
    return all.filter((a) => {
      const q = search.toLowerCase();
      if (
        q &&
        !(
          a.appShortName?.toLowerCase().includes(q) ||
          a.appName?.toLowerCase().includes(q) ||
          a.appManageByGroupName?.toLowerCase().includes(q)
        )
      )
        return false;
      if (filterGroup) {
        // filterGroup always stores orgGroupId (UUID) — compare against appManageByGroupId
        if (a.appManageByGroupId !== filterGroup) return false;
      }
      if (filterStatus && a.statusReport !== filterStatus) return false;
      if (filterReview === "reviewed" && !a.isFullyReviewed) return false;
      if (filterReview === "pending" && a.isFullyReviewed) return false;
      return true;
    });
  }, [batchData, search, filterGroup, filterStatus, filterReview]);

  const clearFilters = () => {
    setSearch("");
    // Only clear group filter if not locked
    if (!isGroupLocked) setFilterGroup("");
    setFilterStatus("");
    setFilterReview("");
  };

  const handleExportExcel = async () => {
    if (!batchData || filteredAssessments.length === 0) return;
    setExportLoading(true);
    try {
      const XLSX = await import("xlsx-js-style");
      const excelData = filteredAssessments.map((a, i) => {
        // Get criteria values by position
        const getScore = (pos: number) => {
          const detail = a.details?.find((d) => d.appsCriteriaPos === pos);
          return detail?.appsCriteriaScaleValue !== null &&
            detail?.appsCriteriaScaleValue !== undefined
            ? Number(detail.appsCriteriaScaleValue).toFixed(3)
            : "-";
        };
        return {
          "NO.": i + 1,
          "NAMA APLIKASI": a.appShortName || "-",
          "GRUP PENGELOLA": a.appManageByGroupName || "-",
          "DAMPAK BISNIS (1-5)": getScore(1),
          "FREKUENSI PENGGUNAAN (1-5)": getScore(2),
          "KETERGANTUNGAN APLIKASI LAIN (1-5)": getScore(3),
          "JUMLAH PENGGUNA TERDAMPAK (1-5)": getScore(4),
          "REGULASI / KEPATUHAN (1-5)": getScore(5),
          "KERAHASIAAN (1-5)": getScore(6),
          "INTEGRITAS (1-5)": getScore(7),
          "KETERSEDIAAN (1-5)": getScore(8),
          "BERHUBUNGAN LANGSUNG DENGAN NASABAH (YA/TIDAK)":
            a.isRelationWithCustomers === "TRUE" ? "Ya" : "Tidak",
          "BERSIFAT TRANSAKSIONAL (YA/TIDAK)":
            a.isTransactionalApp === "TRUE" ? "Ya" : "Tidak",
          "MEMILIKI CUT OFF TIME YANG KETAT (YA/TIDAK)":
            a.isStrictCutoffTime === "TRUE" ? "Ya" : "Tidak",
          "BERHUBUNGAN DENGAN PEMDA (YA/TIDAK)":
            a.isRelationWithGov === "TRUE" ? "Ya" : "Tidak",
          "JUMLAH YA": a.countTrueIsAdditionalFlag || 0,
          "FAKTOR PENGALI": a.weightTrueIsAdditionalFlag || 0,
          "TOTAL SKOR": a.crtAssessmentScore || 0,
          "RATA-RATA SKOR": a.crtAssessmentAverageScore || 0,
          "SKOR FINAL": a.crtAssessmentFinalScore || 0,
          "KATEGORI KRITIKALITAS": a.appCrtCategoryName || "-",
          "RTO HARAPAN USER & MRO":
            a.appsRtoSuggestionMinutes !== null
              ? `${a.appsRtoSuggestionOperator || ""} ${(a.appsRtoSuggestionMinutes / 60).toFixed(2)} Jam`
              : "-",
          "RTO IT 2025":
            a.appsRtoItMinutes !== null
              ? `${a.appsRtoItOperator || ""} ${(a.appsRtoItMinutes / 60).toFixed(2)} Jam`
              : "-",
          RPO:
            a.appsRpoMinutes !== null
              ? `${a.appsRpoOperator || ""} ${(a.appsRpoMinutes / 60).toFixed(2)} Jam`
              : "-",
        };
      });
      const wb = XLSX.utils.book_new();
      const headers = Object.keys(excelData[0] || {});

      // Build AOA: row 0 = title, row 1 = blank, row 2 = headers, row 3+ = data
      const aoa: unknown[][] = [
        ["Penilaian Aplikasi Kritikal bank bjb"],
        [],
        headers,
        ...excelData.map((row) =>
          headers.map((h) => (row as Record<string, unknown>)[h]),
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Style: title row
      const baseFont = { name: "Trebuchet MS", sz: 12 };
      const titleStyle = {
        font: { ...baseFont, sz: 14, bold: true },
        alignment: { horizontal: "center", vertical: "center" },
      };
      const headerStyle = {
        font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
      const cellStyle = {
        font: baseFont,
        alignment: { horizontal: "left", vertical: "top" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
      const cellStyleWrap = {
        font: baseFont,
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[addr]) ws[addr] = { t: "s", v: "" };
          if (R === 0) (ws[addr] as Record<string, unknown>).s = titleStyle;
          else if (R === 2)
            (ws[addr] as Record<string, unknown>).s = headerStyle;
          else if (R > 2)
            (ws[addr] as Record<string, unknown>).s =
              C === 2 ? cellStyleWrap : cellStyle;
        }
      }

      // Merge title across all columns
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      ];
      // Column widths
      ws["!cols"] = headers.map((h, idx) => {
        if (idx === 0) return { wch: 5 }; // NO.
        if (idx === 1) return { wpx: 400 }; // Nama Aplikasi
        // Last 3 columns: RTO Suggestion, RTO IT, RPO - same width
        if (idx >= headers.length - 3) return { wch: 20 };
        return { wch: Math.max(h.length + 2, 15) };
      });
      // Header row height
      const rows: { hpx?: number }[] = [];
      rows[2] = { hpx: 40 };
      ws["!rows"] = rows;

      XLSX.utils.book_append_sheet(wb, ws, "Perhitungan Kritikalitas");
      const buf = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
      });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report_Apps_Assessment_${batchData.quartalReport}_${batchData.yearReport}-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast({
        description: "Excel exported successfully",
        statusToast: "success",
      });
    } catch (e) {
      console.error(e);
      showToast({
        description: "Failed to export Excel",
        statusToast: "error",
      });
    }
    setExportLoading(false);
  };

  const handleExportPDF = async () => {
    if (!batchData || filteredAssessments.length === 0) return;
    setExportLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF("l", "mm", "a4");
      doc.setFontSize(14);
      doc.text(`Apps Assessment Report — ${batchData.batchCode}`, 14, 15);
      doc.setFontSize(10);
      doc.text(
        `${batchData.quartalReport} ${batchData.yearReport} | Generated: ${new Date().toLocaleString()}`,
        14,
        22,
      );
      const tableData = filteredAssessments.map((a, i) => [
        i + 1,
        a.appShortName || "-",
        a.appName || "-",
        a.appManageByGroupName || "-",
        a.statusReport || "-",
        a.isRelationWithCustomers,
        a.isTransactionalApp,
        a.isStrictCutoffTime,
        a.crtAssessmentFinalScore || 0,
        a.appCrtCategoryName || "-",
        a.isFullyReviewed ? "Reviewed" : "Pending",
      ]);
      autoTable(doc, {
        head: [
          [
            "No",
            "Short Name",
            "App Name",
            "Group",
            "Status",
            "Cust.",
            "Trans.",
            "Cutoff",
            "Score",
            "Category",
            "Review",
          ],
        ],
        body: tableData,
        startY: 28,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
      });
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report_Apps_Assessment_${batchData.quartalReport}_${batchData.yearReport}-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast({
        description: "PDF exported successfully",
        statusToast: "success",
      });
    } catch (e) {
      console.error(e);
      showToast({ description: "Failed to export PDF", statusToast: "error" });
    }
    setExportLoading(false);
  };

  const assessmentColumns = useMemo<
    ColumnDef<AppsCriticalReportAssessmentViewModel>[]
  >(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center">
            <Text fontSize="sm">{info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "appShortName",
        cell: (info) => {
          const name = info.getValue() as string;
          const initials = (name || "")
            .split(" ")
            .slice(0, 5)
            .map((w) => w[0] || "")
            .join("")
            .toUpperCase();
          return (
            <HStack spacing={3}>
              <Flex
                w="40px"
                h="40px"
                bg="secondary.50"
                rounded="xl"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                  {initials}
                </Text>
              </Flex>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={isDark ? "white" : "gray.800"}
                >
                  {name}
                </Text>
                <Text
                  fontSize="xs"
                  color={isDark ? "gray.400" : "gray.500"}
                  noOfLines={1}
                >
                  {info.row.original.appName || "-"}
                </Text>
              </VStack>
            </HStack>
          );
        },
        header: () => <Text>Application</Text>,
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "appManageByGroupName",
        cell: (info) => {
          const groupName = info.getValue() as string;
          const groupId = info.row.original.appManageByGroupId;
          const hasGroup = groupId && groupName && groupName !== "-";

          if (!hasGroup) {
            return (
              <Badge colorScheme="red" variant="subtle" rounded="md" px={2} py={0.5} fontSize="2xs">
                <HStack spacing={1}>
                  <FiAlertTriangle size={10} />
                  <Text as="span">Unassigned Group</Text>
                </HStack>
              </Badge>
            );
          }

          return (
            <Text
              fontSize="sm"
              color={isDark ? "gray.400" : "gray.600"}
              noOfLines={1}
            >
              {groupName}
            </Text>
          );
        },
        header: () => <Text>Manage Group</Text>,
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "statusReport",
        cell: (info) => (
          <VStack align="start" spacing={1}>
            <Badge
              colorScheme={statusColor(info.getValue() as string)}
              variant="subtle"
            >
              {info.getValue() as string}
            </Badge>
            {info.row.original.statusHistories?.length > 0 &&
              info.row.original.statusHistories[0].note && (
                <Text
                  fontSize="2xs"
                  color="gray.500"
                  noOfLines={2}
                  maxW="160px"
                  title={info.row.original.statusHistories[0].note}
                >
                  💬 {info.row.original.statusHistories[0].note}
                </Text>
              )}
          </VStack>
        ),
        header: () => <Text>Status</Text>,
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "appCrtCategoryName",
        cell: (info) => {
          const val = info.getValue() as string | null;
          return (
            <Flex justifyContent="center">
              {val ? (
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                  {val}
                </Badge>
              ) : (
                <Text fontSize="xs" color="gray.400">
                  -
                </Text>
              )}
            </Flex>
          );
        },
        header: () => (
          <Flex justifyContent="center">
            <Text>Category</Text>
          </Flex>
        ),
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "crtAssessmentFinalScore",
        cell: (info) => (
          <Flex justifyContent="center">
            <Text fontSize="sm" fontWeight="bold" color="purple.600">
              {(info.getValue() as number).toFixed(3)}
            </Text>
          </Flex>
        ),
        header: () => (
          <Flex justifyContent="center">
            <Text>Final Score</Text>
          </Flex>
        ),
        footer: (p) => p.column.id,
      },
      {
        accessorKey: "isFullyReviewed",
        cell: (info) => {
          const row = info.row.original;
          return row.isFullyReviewed ? (
            <Badge colorScheme="green" variant="subtle">
              ✓ Reviewed ({row.filledCount}/{row.totalCount})
            </Badge>
          ) : (
            <Badge colorScheme="orange" variant="subtle">
              ⚠ Pending ({row.filledCount}/{row.totalCount})
            </Badge>
          );
        },
        header: () => <Text>Review Status</Text>,
        footer: (p) => p.column.id,
      },
      ...(
        [
          {
            key: "appsRtoSuggestionOperator",
            mKey: "appsRtoSuggestionMinutes",
            label: "RTO Suggestion",
            required: true,
          },
          {
            key: "appsRtoItOperator",
            mKey: "appsRtoItMinutes",
            label: "RTO IT",
            required: true,
          },
          {
            key: "appsRpoOperator",
            mKey: "appsRpoMinutes",
            label: "RPO",
            required: false,
          },
        ] as {
          key: keyof AppsCriticalReportAssessmentViewModel;
          mKey: keyof AppsCriticalReportAssessmentViewModel;
          label: string;
          required: boolean;
        }[]
      ).map(({ key, mKey, label, required }) => ({
        accessorKey: key,
        cell: (info: any) => {
          const op = info.row.original[key] as string | null;
          const min = info.row.original[mKey] as number | null;
          const skipReview = info.row.original.isSkipReview === "TRUE";
          const isFilled = !!op && min !== null && min > 0;
          const isNotSet = !op && min === null;

          // If skip review — show neutral "Skipped" badge, no highlight
          if (skipReview) {
            return (
              <Badge colorScheme="gray" variant="subtle" fontSize="2xs">
                Skipped
              </Badge>
            );
          }

          // Not set + required → orange warning highlight
          if (isNotSet) {
            return (
              <Tooltip
                label={`${label} not configured yet`}
                placement="top"
                hasArrow
              >
                <Badge
                  colorScheme={required ? "orange" : "gray"}
                  variant={required ? "solid" : "outline"}
                  fontSize="2xs"
                  cursor="default"
                >
                  {required ? "⚠ Not Set" : "—"}
                </Badge>
              </Tooltip>
            );
          }

          return (
            <HStack spacing={1}>
              {op && (
                <Badge colorScheme="orange" fontFamily="mono" fontSize="xs">
                  {op}
                </Badge>
              )}
              {min !== null && min !== undefined && (
                <Text fontSize="sm" fontWeight="medium">
                  {min}{" "}
                  <Text
                    as="span"
                    fontSize="2xs"
                    color={isDark ? "gray.400" : "gray.500"}
                  >
                    min
                  </Text>
                </Text>
              )}
            </HStack>
          );
        },
        header: () => <Text fontSize="xs">{label}</Text>,
        footer: (p: any) => p.column.id,
      })),
      {
        id: "actions",
        header: () => <Text>Details</Text>,
        cell: (info) => (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            _hover={{ bg: "blue.500", color: "white" }}
            onClick={() =>
              router.push(
                `/report/apps-assessments/assessment?id=${info.row.original.id}`,
              )
            }
          >
            Show
          </Button>
        ),
        footer: (p) => p.column.id,
      },
    ],
    [isDark],
  );

  const table = useReactTable({
    data: filteredAssessments,
    columns: assessmentColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Batch Assessment Detail"
        breadCrumb={["Home", "Report", "Assessment of Critical Apps", "Detail"]}
      />
      <Box p={4}>
        <VStack spacing={5} align="stretch">
          {/* Header */}
          <Card rounded={radiusStyle} overflow="hidden" shadow="md" border="0">
            <Box bg="secondary.500" px={6} py={5}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <IconButton
                    aria-label="Back"
                    icon={<FaArrowLeft />}
                    variant="ghost"
                    size="sm"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => router.push("/report/apps-assessments")}
                  />
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color="white">
                      {batchCode || "Loading..."}
                    </Heading>
                    {batchData && (
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={
                            batchData.statusReport === "APPROVED"
                              ? "green"
                              : "yellow"
                          }
                          variant="solid"
                          fontSize="xs"
                        >
                          {batchData.statusReport}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                  {batchData && (
                    <HStack spacing={3} ml={4}>
                      <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        px={2}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                      >
                        <Text as="span" color="whiteAlpha.700" mr={1}>
                          Batch:
                        </Text>
                        {batchData.batchCode}
                      </Badge>
                      <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        px={2}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                      >
                        <Text as="span" color="whiteAlpha.700" mr={1}>
                          Quarter:
                        </Text>
                        {batchData.quartalReport}
                      </Badge>
                      <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        px={2}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                      >
                        <Text as="span" color="whiteAlpha.700" mr={1}>
                          Year:
                        </Text>
                        {batchData.yearReport}
                      </Badge>
                      <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        px={2}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                      >
                        <Text as="span" color="whiteAlpha.700" mr={1}>
                          Total Apps:
                        </Text>
                        {batchData.assessments?.length || 0}
                      </Badge>
                    </HStack>
                  )}
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {/* Refresh Data button */}
                  <Button
                    size="sm"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    leftIcon={<FiRefreshCw />}
                    isLoading={isRefreshing || loading}
                    onClick={handleRefreshBatchData}
                  >
                    Refresh Data
                  </Button>
                  {/* Export buttons */}
                  <Button
                    size="sm"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    leftIcon={<FaFileExcel />}
                    isLoading={exportLoading}
                    isDisabled={filteredAssessments.length === 0}
                    onClick={handleExportExcel}
                  >
                    Export Excel
                  </Button>
                  <Button
                    size="sm"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    leftIcon={<FaFilePdf />}
                    isLoading={exportLoading}
                    isDisabled={filteredAssessments.length === 0}
                    onClick={handleExportPDF}
                  >
                    Export PDF
                  </Button>
                  {/* Check New Master Data Apps Button — ONLY for FULL OVERRIDE whitelist users */}
                  {canCheckNewApps && (
                    <Button
                      size="sm"
                      colorScheme="purple"
                      leftIcon={<FiPlusCircle />}
                      isLoading={isFetchingUnassigned}
                      onClick={handleFetchUnassignedApps}
                    >
                      Check New Apps
                    </Button>
                  )}
                  {/* Sync button — show when batch is DRAFT or WAITING APPROVAL 1 */}
                  {/* {(batchData?.statusReport === "DRAFT" || batchData?.statusReport === "WAITING APPROVAL 1") && (
                    <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} isLoading={isSyncing}
                      onClick={async () => {
                        setIsSyncing(true);
                        const res = await SyncBatchStatus(batchCode!, tokenData);
                        setIsSyncing(false);
                        if (res?.statusCode === RES_CODE_OK) {
                          showToast({ description: res.message || "Sync complete", statusToast: "success" });
                          const reload = await GetBatchDetail(batchCode!, tokenData);
                          if (reload?.statusCode === RES_CODE_OK && reload.data) setBatchData(reload.data);
                        } else showToast({ description: res?.message || "Sync failed", statusToast: "error" });
                      }}>
                      Sync Status
                    </Button>
                  )} */}
                  {/* Revise button — show when batch is DECLINE */}
                  {batchData?.statusReport === "DECLINE" && (
                    <Button
                      size="sm"
                      bg="yellow.400"
                      color="gray.800"
                      _hover={{ bg: "yellow.300" }}
                      isLoading={isRevising}
                      onClick={async () => {
                        setIsRevising(true);
                        const res = await ReviseBatch(batchCode!, tokenData);
                        setIsRevising(false);
                        if (res?.statusCode === RES_CODE_OK) {
                          showToast({
                            description:
                              "Batch reset to revision — all assessments back to WAITING APPROVAL 1",
                            statusToast: "success",
                          });
                          const reload = await GetBatchDetail(
                            batchCode!,
                            tokenData,
                          );
                          if (reload?.statusCode === RES_CODE_OK && reload.data)
                            setBatchData(reload.data);
                        } else
                          showToast({
                            description: res?.message || "Revise failed",
                            statusToast: "error",
                          });
                      }}
                    >
                      Revise Batch
                    </Button>
                  )}
                  {/* Submit for Approval — only when batch is WAITING APPROVAL 2 */}
                  {/* {batchData?.statusReport === "WAITING APPROVAL 2" && (
                    <Button size="sm" bg="orange.400" color="white" _hover={{ bg: "orange.300" }} onClick={() => setIsSubmitConfirmOpen(true)}>
                      Submit for Approval
                    </Button>
                  )} */}
                </HStack>
              </Flex>
            </Box>
          </Card>

          {/* Assessments Table */}
          <Card
            rounded={radiusStyle}
            shadow="md"
            border="1px"
            borderColor={isDark ? "gray.700" : "gray.200"}
            bg={isDark ? "gray.800" : "white"}
          >
            <CardHeader py={4} px={6}>
              <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>
                App Assessments ({filteredAssessments.length}/
                {batchData?.assessments.length || 0})
              </Heading>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              {/* Filter Row */}
              <Flex gap={3} wrap="wrap" mb={4} align="center">
                <InputGroup maxW="260px">
                  <InputLeftElement>
                    <Search2Icon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search app name or group..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg={isDark ? "gray.700" : "white"}
                  />
                </InputGroup>
                <HStack spacing={2}>
                  <Box minW="180px">
                    <Select
                      placeholder="All Groups"
                      value={isGroupLocked ? filterGroup : filterGroup}
                      onChange={(e) => {
                        if (!isGroupLocked) setFilterGroup(e.target.value);
                      }}
                      size="sm"
                      bg={isDark ? "gray.700" : "white"}
                      isDisabled={isGroupLocked}
                      title={
                        isGroupLocked ? "Filtered by your group" : undefined
                      }
                    >
                      {groupOptions.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.orgName}
                        </option>
                      ))}
                    </Select>
                    {isGroupLocked && (
                      <HStack spacing={1} mt={1}>
                        <Icon as={FiLock} boxSize={2.5} color="orange.400" />
                        <Text fontSize="2xs" color="orange.400">
                          Filtered by your group
                        </Text>
                      </HStack>
                    )}
                  </Box>
                  <Box minW="160px">
                    <ChakraSelect
                      value={
                        filterStatus
                          ? { label: filterStatus, value: filterStatus }
                          : null
                      }
                      onChange={(option) =>
                        setFilterStatus(option?.value || "")
                      }
                      options={[
                        "DRAFT",
                        "WAITING APPROVAL 1",
                        "WAITING APPROVAL 2",
                        "APPROVED",
                        "DECLINE",
                      ].map((s) => ({ label: s, value: s }))}
                      placeholder="All Status"
                      isClearable
                      size="sm"
                      menuPortalTarget={
                        typeof document !== "undefined"
                          ? document.body
                          : undefined
                      }
                      chakraStyles={{
                        control: (provided) => ({
                          ...provided,
                          bg: isDark ? "gray.700" : "white",
                          minH: "40px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          bg: isDark ? "gray.700" : "white",
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </Box>
                  <Box minW="140px">
                    <ChakraSelect
                      value={
                        filterReview
                          ? {
                              label:
                                filterReview === "reviewed"
                                  ? "Reviewed"
                                  : "Not Yet",
                              value: filterReview,
                            }
                          : null
                      }
                      onChange={(option) =>
                        setFilterReview(
                          (option?.value || "") as "" | "reviewed" | "pending",
                        )
                      }
                      options={[
                        { label: "Reviewed", value: "reviewed" },
                        { label: "Not Yet", value: "pending" },
                      ]}
                      placeholder="All Review"
                      isClearable
                      size="sm"
                      menuPortalTarget={
                        typeof document !== "undefined"
                          ? document.body
                          : undefined
                      }
                      chakraStyles={{
                        control: (provided) => ({
                          ...provided,
                          bg: isDark ? "gray.700" : "white",
                          minH: "40px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          bg: isDark ? "gray.700" : "white",
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </Box>
                </HStack>
                {(search || filterGroup || filterStatus || filterReview) && (
                  <Button
                    variant="outline"
                    leftIcon={<FiX />}
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
              <Box overflowX="auto" w="full">
                <Box minW="1800px">
                  <TableComponentFull table={table} />
                </Box>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* Criteria Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                w={7}
                h={7}
                bg="teal.500"
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiInfo} boxSize={3.5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md">
                  {selectedAssessment?.appShortName}
                </Text>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                  {selectedAssessment?.appCode}
                </Badge>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAssessment && (
              <Stack spacing={4}>
                {/* Criteria detail rows */}
                {selectedAssessment.details.map((d, i) => (
                  <Flex
                    key={d.id}
                    gap={3}
                    p={3}
                    bg={isDark ? "gray.750" : "gray.50"}
                    rounded="md"
                    border="1px"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                    align="center"
                  >
                    <Badge
                      colorScheme="purple"
                      variant="solid"
                      minW="24px"
                      textAlign="center"
                    >
                      {d.appsCriteriaPos}
                    </Badge>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {d.appsCriteriaName}
                      </Text>
                      {d.appsCriteriaDesc && (
                        <Text
                          fontSize="xs"
                          color={isDark ? "gray.400" : "gray.500"}
                        >
                          {d.appsCriteriaDesc}
                        </Text>
                      )}
                    </VStack>
                    <VStack align="end" spacing={0}>
                      {d.appsCriteriaScaleValue !== null ? (
                        <Badge colorScheme="green" fontSize="sm">
                          {Number(d.appsCriteriaScaleValue).toFixed(3)}
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme="gray"
                          variant="outline"
                          fontSize="xs"
                        >
                          Not filled
                        </Badge>
                      )}
                    </VStack>
                  </Flex>
                ))}
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        isOpenTrigger={isSubmitConfirmOpen}
        trigger={setIsSubmitConfirmOpen}
        action={async () => {
          const res = await SubmitBatchForApproval(batchCode!, tokenData);
          if (res?.statusCode === RES_CODE_OK) {
            showToast({
              description: "Batch submitted for approval",
              statusToast: "success",
            });
            const reload = await GetBatchDetail(batchCode!, tokenData);
            if (reload?.statusCode === RES_CODE_OK && reload.data)
              setBatchData(reload.data);
          } else
            showToast({
              description: res?.message || "Submit failed",
              statusToast: "error",
            });
        }}
        captionMsg="Submit for Approval"
        questionMsg={`Are you sure you want to submit batch "${batchCode}" for the next approval level? All remaining assessments will be advanced.`}
      />

      {/* 1. Unassigned Master Data Applications Selection Modal */}
      <Modal
        isOpen={isUnassignedModalOpen}
        onClose={() => setIsUnassignedModalOpen(false)}
        size="xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" shadow="2xl">
          <ModalHeader bg={isDark ? "gray.700" : "purple.50"} roundedTop="2xl" py={4}>
            <HStack spacing={3}>
              <Box w={8} h={8} bg="purple.500" rounded="lg" color="white" display="flex" alignItems="center" justifyContent="center">
                <FiPlusCircle size={18} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="xs" color="purple.700">Check & Assign New Applications</Heading>
                <Text fontSize="3xs" color="gray.500">Unassigned Master Data Apps for Batch {batchCode}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={5}>
            <VStack spacing={4} align="stretch">
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search app code, short name, or owner group..."
                  rounded="lg"
                  value={unassignedSearch}
                  onChange={(e) => setUnassignedSearch(e.target.value)}
                />
              </InputGroup>

              {filteredUnassignedApps.length === 0 ? (
                <Box p={8} textAlign="center" alignContent="center">
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No unassigned applications found matching Master Data records.
                  </Text>
                </Box>
              ) : (
                <Box border="1px" borderColor={isDark ? "gray.700" : "gray.200"} rounded="xl" overflow="hidden">
                  <Table size="sm" variant="simple">
                    <Thead bg={isDark ? "gray.800" : "gray.50"}>
                      <Tr>
                        <Th w="40px">
                          <Checkbox
                            colorScheme="purple"
                            isChecked={
                              filteredUnassignedApps.length > 0 &&
                              selectedUnassignedAppIds.length === filteredUnassignedApps.length
                            }
                            isIndeterminate={
                              selectedUnassignedAppIds.length > 0 &&
                              selectedUnassignedAppIds.length < filteredUnassignedApps.length
                            }
                            onChange={handleToggleSelectAllUnassigned}
                          />
                        </Th>
                        <Th>App Code & Name</Th>
                        <Th>Owner Group</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUnassignedApps.map((app) => {
                        const isSelected = selectedUnassignedAppIds.includes(app.id);
                        return (
                          <Tr key={app.id} _hover={{ bg: isDark ? "gray.700" : "purple.50/40" }}>
                            <Td>
                              <Checkbox
                                colorScheme="purple"
                                isChecked={isSelected}
                                onChange={() => handleToggleSelectUnassignedApp(app.id)}
                              />
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="xs" color="purple.600">
                                  {app.appShortName || app.appCode} — {app.appName}
                                </Text>
                                <Text fontSize="3xs" color="gray.500">Code: {app.appCode}</Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                                {app.appOwnerGroupName || "-"}
                              </Text>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter bg={isDark ? "gray.800" : "gray.50"} roundedBottom="2xl" py={3}>
            <HStack spacing={3}>
              <Button size="sm" variant="ghost" onClick={() => setIsUnassignedModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<FiCheckCircle />}
                isDisabled={selectedUnassignedAppIds.length === 0}
                onClick={handleOpenAssignConfirm}
              >
                Proceed to Assign ({selectedUnassignedAppIds.length})
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2. 3-Second Confirmation Countdown Safeguard Modal */}
      <Modal
        isOpen={isAssignConfirmOpen}
        onClose={() => !isAssigning && setIsAssignConfirmOpen(false)}
        isCentered
        size="md"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" shadow="2xl">
          <ModalHeader bg="purple.500" color="white" roundedTop="2xl" py={4}>
            <HStack spacing={3}>
              <FiAlertCircle size={22} />
              <Heading size="xs">Confirm Application Assignment</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" isDisabled={isAssigning} />

          <ModalBody p={6}>
            <VStack spacing={4} align="center" textAlign="center">
              <Box p={3} rounded="full" bg="purple.50" color="purple.600">
                <FiClock size={32} />
              </Box>

              <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                Assign {selectedUnassignedAppIds.length} Selected App(s) to Batch {batchCode}?
              </Text>

              <Text fontSize="xs" color="gray.500">
                This operation will seed new criticality assessment records and criteria details for all selected apps.
              </Text>

              <Box p={3} rounded="xl" bg="orange.50" border="1px" borderColor="orange.200" w="full">
                <HStack justify="center" spacing={2} color="orange.700">
                  <FiAlertTriangle size={16} />
                  <Text fontSize="xs" fontWeight="bold">
                    {assignCountdown > 0
                      ? `Safeguard active: Button unlocks in ${assignCountdown}s`
                      : "Safeguard timer elapsed — Ready to submit!"}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter bg={isDark ? "gray.800" : "gray.50"} roundedBottom="2xl" py={3}>
            <HStack spacing={3} justify="flex-end" w="full">
              <Button
                size="sm"
                variant="ghost"
                isDisabled={isAssigning}
                onClick={() => setIsAssignConfirmOpen(false)}
              >
                Back to Selection
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                isDisabled={assignCountdown > 0}
                isLoading={isAssigning}
                loadingText="Assigning Apps..."
                onClick={handleExecuteAssignApps}
              >
                {assignCountdown > 0 ? `Wait (${assignCountdown}s)` : "Confirm & Assign Now"}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
