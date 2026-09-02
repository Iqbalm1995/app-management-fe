"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiFilter,
  FiGrid,
  FiImage,
  FiLayers,
  FiMoreVertical,
  FiRotateCcw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
  FiZoomIn,
} from "react-icons/fi";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { AppTabList, AppTabItem } from "@/app/components/TabsCustom";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  ColumnMetaCustom,
  ListSearchByParamProps,
  addParamFilterUpdate,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { BuktiImplementasiItem, CabRequestItem } from "@/app/types/cabTypes";
import { exportCabReportsGroupPdf, exportSingleCabMeetingPdf } from "@/app/helper/CabReportPdfExport";
import { exportCabComplianceChecklistExcel, exportCabComplianceChecklistBulkExcel } from "@/app/helper/CabComplianceChecklistExcelExport";
import { exportCabComplianceChecklistPdf, exportCabComplianceChecklistBulkPdf } from "@/app/helper/CabComplianceChecklistPdfExport";
import useCabRequest from "@/app/services/useCabRequest";
import {
  useToastError,
  useToastSuccess,
  useToastWarning,
} from "@/app/helper/ToastMessagesHelper";

type TabPeriodMode = "DAY" | "WEEK" | "MONTH" | "QUARTER";

interface CabReportsTabProps {
  items: CabRequestItem[];
  onRefresh?: () => void;
}

// ─── Date Utility Helpers ────────────────────────────────────────────────────
const getTodayStr = (): string => new Date().toISOString().slice(0, 10);
const getCurrentMonthStr = (): string => new Date().toISOString().slice(0, 7);

const getWeekRange = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.getFullYear(), d.getMonth(), diffToMon);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return {
    startStr: mon.toISOString().slice(0, 10),
    endStr: sun.toISOString().slice(0, 10),
    label: `${mon.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${sun.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`,
  };
};

const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatMonthIndo = (yyyyMm: string) => {
  if (!yyyyMm) return "-";
  const [y, m] = yyyyMm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const getQuarterKeyFromDate = (dateStr: string) => {
  if (!dateStr) {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return { key: `${now.getFullYear()}-Q${q}`, label: `Kuartal ${q} (${now.getFullYear()})` };
  }
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return { key: `${y}-Q${q}`, label: `Kuartal ${q} (${y})` };
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getCabCategory = (item: CabRequestItem): "SOFTWARE" | "HARDWARE" => {
  if (item.category === "HARDWARE" || item.category === "SOFTWARE") return item.category;
  const typeUpper = String(item.requestType || "").toUpperCase();
  if (
    typeUpper === "INFRASTRUCTURE" ||
    typeUpper === "HARDWARE" ||
    typeUpper === "PROCUREMENT" ||
    (item.projectName && item.projectName.toLowerCase().includes("hardware"))
  ) {
    return "HARDWARE";
  }
  return "SOFTWARE";
};

const renderCabResultBadge = (_result?: string, _status?: string) => {
  return (
    <Badge colorScheme="green" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="semibold">
      COMPLETED
    </Badge>
  );
};

const CabReportsTab = ({ items, onRefresh }: CabReportsTabProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const { UpdateCabResult } = useCabRequest();

  const showToastSuccess = useToastSuccess();
  const showToastError = useToastError();
  const showToastWarning = useToastWarning();

  // Local synced items state
  const [localItems, setLocalItems] = useState<CabRequestItem[]>(items);
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Active Tab Period Mode
  const [periodMode, setPeriodMode] = useState<TabPeriodMode>("DAY");

  // Selected Filter Values
  const [selectedDay, setSelectedDay] = useState<string>(getTodayStr());
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(getTodayStr());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getQuarterKeyFromDate(getTodayStr()).key);

  // Search, Type, Column Filter, and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const {
    isOpen: isFilterPopoverOpen,
    onOpen: onFilterPopoverOpen,
    onClose: onFilterPopoverClose,
  } = useDisclosure();

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );
    setParamFilter(updatedFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const removeFilterData = (target: ListSearchByParamProps) => {
    const updated = removeParamFilter(ParamFilter, target);
    setParamFilter(updated);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearAllFilters = () => {
    setParamFilter([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isExporting, setIsExporting] = useState(false);

  // ─── Modal States ─────────────────────────────────────────────────────────
  // 1. Quick Upload Bukti Modal
  const [activeUploadItem, setActiveUploadItem] = useState<CabRequestItem | null>(null);
  const [uploadModalFiles, setUploadModalFiles] = useState<BuktiImplementasiItem[]>([]);
  const [isSavingBukti, setIsSavingBukti] = useState(false);

  // 2. Lightbox Fullscreen Preview Modal
  const [previewModalData, setPreviewModalData] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    size?: number;
  }>({
    isOpen: false,
    url: "",
    name: "",
    size: undefined,
  });

  // 3. Warning Dialog when bulk exporting with missing evidence
  const [isWarningExportOpen, setIsWarningExportOpen] = useState(false);
  const cancelRef = useRef<any>(null);

  // 1. Base Filter: ONLY items with status COMPLETED
  const doneCabItems = useMemo(() => {
    return localItems.filter((item) => {
      const s = String(item.status || "").toUpperCase();
      return s === "COMPLETED";
    });
  }, [localItems]);

  // Distinct available options extracted from completed items
  const availableDays = useMemo(() => {
    const set = new Set<string>();
    doneCabItems.forEach((i) => {
      const d = i.scheduledDate ? i.scheduledDate.slice(0, 10) : i.targetDate;
      if (d) set.add(d);
    });
    return Array.from(set).sort().reverse();
  }, [doneCabItems]);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    doneCabItems.forEach((i) => {
      const d = i.scheduledDate ? i.scheduledDate.slice(0, 7) : i.targetDate?.slice(0, 7);
      if (d) set.add(d);
    });
    if (!set.has(getCurrentMonthStr())) set.add(getCurrentMonthStr());
    return Array.from(set).sort().reverse();
  }, [doneCabItems]);

  const availableQuarters = useMemo(() => {
    const map = new Map<string, string>();
    doneCabItems.forEach((i) => {
      const d = i.scheduledDate ? i.scheduledDate.slice(0, 10) : i.targetDate;
      if (d) {
        const qInfo = getQuarterKeyFromDate(d);
        map.set(qInfo.key, qInfo.label);
      }
    });
    const currQ = getQuarterKeyFromDate(getTodayStr());
    if (!map.has(currQ.key)) map.set(currQ.key, currQ.label);
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [doneCabItems]);

  // 2. Filter items strictly by active Period Tab Mode
  const periodFilteredItems = useMemo(() => {
    return doneCabItems.filter((item) => {
      const itemDate = item.scheduledDate ? item.scheduledDate.slice(0, 10) : item.targetDate || "";

      if (periodMode === "DAY") {
        return itemDate === selectedDay;
      }

      if (periodMode === "WEEK") {
        const week = getWeekRange(selectedWeekDate);
        return itemDate >= week.startStr && itemDate <= week.endStr;
      }

      if (periodMode === "MONTH") {
        return itemDate.startsWith(selectedMonth);
      }

      if (periodMode === "QUARTER") {
        const itemQ = getQuarterKeyFromDate(itemDate);
        return itemQ.key === selectedQuarter;
      }

      return true;
    });
  }, [doneCabItems, periodMode, selectedDay, selectedWeekDate, selectedMonth, selectedQuarter]);

  // 3. Search & Filter by keyword, type, and column filters
  const tableData = useMemo(() => {
    return periodFilteredItems.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (item.requestNo && item.requestNo.toLowerCase().includes(q)) ||
        (item.requestTitle && item.requestTitle.toLowerCase().includes(q)) ||
        (item.projectName && item.projectName.toLowerCase().includes(q)) ||
        (item.requesterName && item.requesterName.toLowerCase().includes(q)) ||
        (item.cabNotes && item.cabNotes.toLowerCase().includes(q));

      const matchType = typeFilter === "ALL" || getCabCategory(item) === typeFilter;
      if (!matchSearch || !matchType) return false;

      // Column-specific filters from ParamFilter (from header popovers)
      for (const filter of ParamFilter) {
        if (!filter.value || !String(filter.value).trim()) continue;
        const filterVal = String(filter.value).trim();
        const field = filter.field as keyof CabRequestItem;
        const itemVal = item[field];
        const itemStr = itemVal !== null && itemVal !== undefined ? String(itemVal) : "";

        if (filter.operator === "like" || filter.operator === "%") {
          if (filter.field === "requestTitle") {
            const matchesTitle = itemStr.toLowerCase().includes(filterVal.toLowerCase());
            const matchesProj = (item.projectName || "").toLowerCase().includes(filterVal.toLowerCase());
            if (!matchesTitle && !matchesProj) return false;
          } else if (filter.field === "projectName") {
            if (!(item.projectName || "").toLowerCase().includes(filterVal.toLowerCase())) return false;
          } else if (filter.field === "requesterName") {
            const matchesReq = itemStr.toLowerCase().includes(filterVal.toLowerCase());
            const matchesAppr = (item.approverName || "").toLowerCase().includes(filterVal.toLowerCase());
            if (!matchesReq && !matchesAppr) return false;
          } else if (filter.field === "approverName") {
            if (!(item.approverName || "").toLowerCase().includes(filterVal.toLowerCase())) return false;
          } else {
            if (!itemStr.toLowerCase().includes(filterVal.toLowerCase())) {
              return false;
            }
          }
        } else if (filter.operator === "=") {
          if (filter.field === "category") {
            const itemCategory = getCabCategory(item);
            if (itemCategory.toUpperCase() !== filterVal.toUpperCase()) return false;
          } else if (filter.field === "status") {
            const fStatus = filterVal.toUpperCase();
            const iStatus = itemStr.toUpperCase();
            if (fStatus === "COMPLETED" || fStatus === "APPROVED") {
              if (iStatus !== "COMPLETED" && iStatus !== "APPROVED") return false;
            } else {
              if (iStatus !== fStatus) return false;
            }
          } else {
            if (itemStr.toLowerCase() !== filterVal.toLowerCase()) {
              return false;
            }
          }
        } else if (filter.operator === "!=") {
          if (itemStr.toLowerCase() === filterVal.toLowerCase()) {
            return false;
          }
        } else if (filter.operator === ">=") {
          const itemDate = itemStr.slice(0, 10);
          const filterDate = filterVal.slice(0, 10);
          if (itemDate < filterDate) return false;
        } else if (filter.operator === "<=") {
          const itemDate = itemStr.slice(0, 10);
          const filterDate = filterVal.slice(0, 10);
          if (itemDate > filterDate) return false;
        } else if (filter.operator === ">") {
          const itemDate = itemStr.slice(0, 10);
          const filterDate = filterVal.slice(0, 10);
          if (itemDate <= filterDate) return false;
        } else if (filter.operator === "<") {
          const itemDate = itemStr.slice(0, 10);
          const filterDate = filterVal.slice(0, 10);
          if (itemDate >= filterDate) return false;
        }
      }

      return true;
    });
  }, [periodFilteredItems, searchQuery, typeFilter, ParamFilter]);

  // Missing evidence count for active period
  const missingEvidenceCount = useMemo(() => {
    return tableData.filter((i) => !i.buktiImplementasi || i.buktiImplementasi.length === 0).length;
  }, [tableData]);

  // Active Period Label for Heading & PDF
  const activePeriodLabel = useMemo(() => {
    if (periodMode === "DAY") {
      const isToday = selectedDay === getTodayStr();
      return `${formatDateIndo(selectedDay)}${isToday ? " (Hari Ini)" : ""}`;
    }
    if (periodMode === "WEEK") {
      const week = getWeekRange(selectedWeekDate);
      const isCurrWeek = getWeekRange(getTodayStr()).startStr === week.startStr;
      return `Minggu: ${week.label}${isCurrWeek ? " (Minggu Ini)" : ""}`;
    }
    if (periodMode === "MONTH") {
      const isCurrMonth = selectedMonth === getCurrentMonthStr();
      return `Bulan: ${formatMonthIndo(selectedMonth)}${isCurrMonth ? " (Bulan Ini)" : ""}`;
    }
    const qObj = availableQuarters.find((q) => q.key === selectedQuarter);
    return qObj ? qObj.label : selectedQuarter;
  }, [periodMode, selectedDay, selectedWeekDate, selectedMonth, selectedQuarter, availableQuarters]);

  // Period Navigation handlers
  const handleNavDay = (delta: number) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d.toISOString().slice(0, 10));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleNavWeek = (deltaWeeks: number) => {
    const d = new Date(selectedWeekDate);
    d.setDate(d.getDate() + deltaWeeks * 7);
    setSelectedWeekDate(d.toISOString().slice(0, 10));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleNavMonth = (deltaMonths: number) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + deltaMonths, 1);
    const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(nextMonth);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetToCurrent = () => {
    const today = getTodayStr();
    if (periodMode === "DAY") setSelectedDay(today);
    else if (periodMode === "WEEK") setSelectedWeekDate(today);
    else if (periodMode === "MONTH") setSelectedMonth(getCurrentMonthStr());
    else if (periodMode === "QUARTER") setSelectedQuarter(getQuarterKeyFromDate(today).key);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Dropzone setup for Quick Upload Modal
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const newItems: BuktiImplementasiItem[] = acceptedFiles.map((file) => ({
          id: `bukti-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }));
        setUploadModalFiles((prev) => [...prev, ...newItems]);
        showToastSuccess({
          description: `${acceptedFiles.length} berkas bukti implementasi berhasil ditambahkan.`,
        });
      }
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        if (rejection.errors[0]?.code === "file-too-large") {
          showToastError({
            description: `Berkas ${rejection.file.name} melebihi batas ukuran 10MB.`,
          });
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          showToastError({
            description: `Berkas ${rejection.file.name} bukan format gambar yang didukung (PNG, JPG, WEBP).`,
          });
        }
      });
    },
  });

  const handleOpenUpload = (item: CabRequestItem) => {
    setActiveUploadItem(item);
    setUploadModalFiles(item.buktiImplementasi ? [...item.buktiImplementasi] : []);
  };

  const handleRemoveModalFile = (id: string) => {
    setUploadModalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveModalBukti = async () => {
    if (!activeUploadItem) return;
    if (uploadModalFiles.length === 0) {
      showToastWarning({
        description: "Mohon unggah minimal 1 berkas gambar bukti implementasi.",
      });
      return;
    }

    setIsSavingBukti(true);
    try {
      await UpdateCabResult("", activeUploadItem.id, {
        buktiImplementasi: uploadModalFiles,
      });

      // Update local state immediately
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === activeUploadItem.id
            ? { ...i, buktiImplementasi: uploadModalFiles }
            : i
        )
      );

      showToastSuccess({
        description: `Bukti implementasi untuk ${activeUploadItem.requestNo} berhasil disimpan. Laporan Berita Acara siap diekspor.`,
      });

      if (onRefresh) onRefresh();
      setActiveUploadItem(null);
    } catch {
      showToastError({
        description: "Gagal menyimpan bukti implementasi. Silakan coba kembali.",
      });
    } finally {
      setIsSavingBukti(false);
    }
  };

  // PDF Export Handlers
  // const handleExportCurrentPeriodPdf = async () => {
  //   if (missingEvidenceCount > 0) {
  //     setIsWarningExportOpen(true);
  //     return;
  //   }
  //   executeGroupExport();
  // };

  // const executeGroupExport = async () => {
  //   setIsWarningExportOpen(false);
  //   setIsExporting(true);
  //   try {
  //     await exportCabReportsGroupPdf({
  //       title: "Laporan Sidang Change Advisory Board (CAB)",
  //       periodLabel: activePeriodLabel,
  //       groupType: periodMode,
  //       items: tableData,
  //     });
  //     showToastSuccess({
  //       description: "Laporan rekapitulasi sidang CAB berhasil diunduh.",
  //     });
  //   } catch {
  //     showToastError({
  //       description: "Terjadi kesalahan saat membuat dokumen PDF.",
  //     });
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExportCurrentPeriodChecklistPdf = async () => {
    if (tableData.length === 0) return;
    setIsExporting(true);
    try {
      await exportCabComplianceChecklistBulkPdf(tableData, activePeriodLabel);
      showToastSuccess({
        description: `Formulir Compliance Checklist PDF (${tableData.length} agenda) berhasil diunduh.`,
      });
    } catch {
      showToastError({
        description: "Terjadi kesalahan saat mengekspor formulir Checklist PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingleChecklistPdf = async (item: CabRequestItem) => {
    setIsExporting(true);
    try {
      await exportCabComplianceChecklistPdf(item);
      showToastSuccess({
        description: `Compliance Checklist PDF untuk ${item.requestNo} berhasil diekspor.`,
      });
    } catch {
      showToastError({
        description: "Gagal mengekspor Compliance Checklist PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentPeriodExcel = async () => {
    if (tableData.length === 0) return;
    setIsExporting(true);
    try {
      await exportCabComplianceChecklistBulkExcel(tableData, activePeriodLabel);
      showToastSuccess({
        description: `Formulir Compliance Checklist Excel (${tableData.length} agenda) berhasil diunduh.`,
      });
    } catch {
      showToastError({
        description: "Terjadi kesalahan saat mengekspor file Excel.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingle = async (item: CabRequestItem) => {
    setIsExporting(true);
    try {
      await exportSingleCabMeetingPdf(item);
      showToastSuccess({
        description: `Berita Acara untuk ${item.requestNo} berhasil diekspor.`,
      });
    } catch {
      showToastError({
        description: "Gagal mengekspor Berita Acara CAB.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ─── TanStack Table Columns Definition (/requirements/brd-rfc Style) ─────
  const columns = useMemo<ColumnDef<CabRequestItem>[]>(
    () => [
      {
        id: "rowNumber",
        header: "NO.",
        cell: (info) => (
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} textAlign="center" fontWeight="medium">
            {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}.
          </Text>
        ),
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
      {
        accessorKey: "requestNo",
        id: "requestNo",
        header: "REQUEST NO",
        cell: (info) => {
          const item = info.row.original;
          const dateStr = item.scheduledDate
            ? item.scheduledDate.slice(0, 10)
            : item.targetDate || "-";
          return (
            <VStack align="start" spacing={0.5} minW="130px" maxW="150px">
              <Text fontSize="xs" fontWeight="bold" color="secondary.600" noOfLines={1}>
                {info.getValue() as string}
              </Text>
              <Text fontSize="2xs" color={isDark ? "gray.400" : "gray.500"} noOfLines={1}>
                {dateStr}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requestNo",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nomor CAB",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "requestTitle",
        id: "requestTitle",
        header: "JUDUL CAB",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={0.5} minW="220px" maxW="280px">
              <Text fontSize="xs" fontWeight="semibold" noOfLines={2} title={info.getValue() as string}>
                {info.getValue() as string}
              </Text>
              <Text fontSize="2xs" color={isDark ? "gray.400" : "gray.500"} noOfLines={1} title={item.projectName}>
                Project: {item.projectName || "-"}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requestTitle",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Judul Perubahan",
            },
            {
              field: "projectName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Proyek",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "category",
        header: "TIPE",
        cell: (info) => {
          const cat = getCabCategory(info.row.original);
          return (
            <Badge
              colorScheme={cat === "HARDWARE" ? "orange" : "purple"}
              variant="subtle"
              rounded="full"
              px={2}
              py={0.5}
              fontSize="3xs"
              fontWeight="bold"
            >
              {cat}
            </Badge>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "category",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Tipe Kategori",
              sourceListData: [
                { label: "SOFTWARE", value: "SOFTWARE" },
                { label: "HARDWARE", value: "HARDWARE" },
              ],
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "scheduledDate",
        id: "scheduledDate",
        header: "PELAKSANAAN",
        cell: (info) => {
          const item = info.row.original;
          const timeStr = item.scheduledDate
            ? `${item.scheduledDate.slice(11, 16)} - ${item.scheduledEndDate ? item.scheduledEndDate.slice(11, 16) : ""} WIB`
            : "-";
          return (
            <VStack align="start" spacing={0.5} minW="130px" maxW="160px">
              <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                {timeStr}
              </Text>
              <Text fontSize="2xs" color={isDark ? "gray.400" : "gray.500"} noOfLines={1} title={item.cabLocation || "Online Meeting"}>
                {item.cabLocation || "Online Meeting"}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "scheduledDate",
              operator: ">=",
              value: "",
              filterType: "date",
              filterLabel: "Dari Tgl Pelaksanaan",
            },
            {
              field: "scheduledDate",
              operator: "<=",
              value: "",
              filterType: "date",
              filterLabel: "Sampai Tgl Pelaksanaan",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "requesterName",
        id: "requesterName",
        header: "PEMOHON",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={0.5} minW="120px" maxW="150px">
              <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                {item.requesterName || "-"}
              </Text>
              <Text fontSize="2xs" color={isDark ? "gray.400" : "gray.500"} noOfLines={1}>
                Appr: {item.approverName || "-"}
              </Text>
            </VStack>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "requesterName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Pemohon",
            },
            {
              field: "approverName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Approver",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "keputusanBukti",
        header: "STATUS",
        cell: (info) => {
          const item = info.row.original;
          return (
            <Flex align="center" minW="100px">
              {renderCabResultBadge(item.cabResult, item.status)}
            </Flex>
          );
        },
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "status",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Status CAB",
              sourceListData: [
                { label: "COMPLETED", value: "COMPLETED" },
              ],
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "cabNotes",
        id: "cabNotes",
        header: "CATATAN",
        cell: (info) => (
          <Box minW="160px" maxW="220px">
            <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"} noOfLines={2} title={(info.getValue() as string) || "-"}>
              {(info.getValue() as string) || "-"}
            </Text>
          </Box>
        ),
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "cabNotes",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Catatan",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        id: "actions",
        header: "AKSI",
        cell: (info) => {
          const item = info.row.original;
          const isRejected =
            (item.cabResult || item.status || "").toUpperCase().includes("REJECT") ||
            (item.cabResult || item.status || "").toUpperCase().includes("DITOLAK");
          const hasBukti = Boolean(item.buktiImplementasi && item.buktiImplementasi.length > 0);

          return (
            <Flex justify="center" align="center" minW="60px">
              <Menu isLazy placement="bottom-end">
                <MenuButton
                  as={Button}
                  rightIcon={<FiMoreVertical />}
                  size="xs"
                  variant="outline"
                  colorScheme="blue"
                  bg="transparent"
                  borderColor={isDark ? "blue.400" : "blue.500"}
                  color={isDark ? "blue.300" : "blue.600"}
                  rounded="md"
                  fontSize="xs"
                  fontWeight="medium"
                  px={2.5}
                  h="24px"
                  _hover={{
                    bg: isDark ? "rgba(66, 153, 225, 0.15)" : "blue.50",
                    borderColor: isDark ? "blue.300" : "blue.600",
                  }}
                  _active={{
                    bg: isDark ? "rgba(66, 153, 225, 0.25)" : "blue.100",
                  }}
                >
                  Action
                </MenuButton>
                <MenuList
                  zIndex={20}
                  shadow="lg"
                  py={1}
                  minW="190px"
                  bg={isDark ? "gray.800" : "white"}
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  rounded="lg"
                >
                  <MenuItem
                    icon={<FiEye />}
                    fontSize="xs"
                    onClick={() => router.push(`/cab/cab-request/detail?id=${item.id}`)}
                  >
                    Lihat Detail
                  </MenuItem>

                  {hasBukti && (
                    <MenuItem
                      icon={<FiImage />}
                      fontSize="xs"
                      onClick={() =>
                        setPreviewModalData({
                          isOpen: true,
                          url: item.buktiImplementasi![0].url,
                          name: item.buktiImplementasi![0].name,
                          size: item.buktiImplementasi![0].size,
                        })
                      }
                    >
                      Lihat Foto Bukti
                    </MenuItem>
                  )}

                  <MenuDivider />

                  <MenuItem
                    icon={<FiFileText />}
                    fontSize="xs"
                    onClick={() => handleExportSingleChecklistPdf(item)}
                  >
                    Ekspor Checklist (PDF)
                  </MenuItem>

                  <MenuItem
                    icon={<FiFileText />}
                    fontSize="xs"
                    onClick={async () => {
                      try {
                        await exportCabComplianceChecklistExcel(item);
                        showToastSuccess({ description: "Formulir Compliance Checklist Excel (.xlsx) berhasil diunduh." });
                      } catch (err) {
                        showToastError({ description: "Terjadi kesalahan saat mengekspor file Excel." });
                      }
                    }}
                  >
                    Ekspor Checklist (Excel)
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          );
        },
        meta: { isFilterable: false } as ColumnMetaCustom,
      },
    ],
    [router, pagination, isExporting]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { pagination },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* ─── Period Filter Tabs ─── */}
      <Card
        rounded={radiusStyle}
        shadow="sm"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
      >
        <CardBody p={3}>
          <Tabs
            variant="unstyled"
            size="sm"
            index={periodMode === "DAY" ? 0 : periodMode === "WEEK" ? 1 : periodMode === "MONTH" ? 2 : 3}
            onChange={(idx) => {
              const modes: TabPeriodMode[] = ["DAY", "WEEK", "MONTH", "QUARTER"];
              setPeriodMode(modes[idx]);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <AppTabList variant="segmented">
              <AppTabItem icon={FiCalendar} label="Per Hari" />
              <AppTabItem icon={FiClock} label="Per Minggu" />
              <AppTabItem icon={FiGrid} label="Per Bulan" />
              <AppTabItem icon={FiLayers} label="Per Kuartal (Q)" />
            </AppTabList>
          </Tabs>
        </CardBody>
      </Card>

      {/* ─── Active Period Selector & Search Control Bar ─── */}
      <Card
        rounded={radiusStyle}
        shadow="sm"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
      >
        <CardBody p={4}>
          <VStack spacing={3.5} align="stretch">
            {/* Top Row: Period Navigator and Quick Reset */}
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: "column", md: "row" }}
              gap={3}
              wrap="wrap"
            >
              {/* Period Navigator Controls */}
              <HStack spacing={2} wrap="wrap">
                {periodMode === "DAY" && (
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<FiChevronLeft />}
                      aria-label="Hari Sebelumnya"
                      variant="outline"
                      onClick={() => handleNavDay(-1)}
                    />
                    <Input
                      type="date"
                      size="sm"
                      rounded="lg"
                      w="160px"
                      value={selectedDay}
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      }}
                    />
                    <IconButton
                      size="sm"
                      icon={<FiChevronRight />}
                      aria-label="Hari Berikutnya"
                      variant="outline"
                      onClick={() => handleNavDay(1)}
                    />
                  </HStack>
                )}

                {periodMode === "WEEK" && (
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<FiChevronLeft />}
                      aria-label="Minggu Sebelumnya"
                      variant="outline"
                      onClick={() => handleNavWeek(-1)}
                    />
                    <Input
                      type="date"
                      size="sm"
                      rounded="lg"
                      w="160px"
                      value={selectedWeekDate}
                      onChange={(e) => {
                        setSelectedWeekDate(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      }}
                    />
                    <IconButton
                      size="sm"
                      icon={<FiChevronRight />}
                      aria-label="Minggu Berikutnya"
                      variant="outline"
                      onClick={() => handleNavWeek(1)}
                    />
                  </HStack>
                )}

                {periodMode === "MONTH" && (
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<FiChevronLeft />}
                      aria-label="Bulan Sebelumnya"
                      variant="outline"
                      onClick={() => handleNavMonth(-1)}
                    />
                    <Select
                      size="sm"
                      rounded="lg"
                      w="170px"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {formatMonthIndo(m)}
                        </option>
                      ))}
                    </Select>
                    <IconButton
                      size="sm"
                      icon={<FiChevronRight />}
                      aria-label="Bulan Berikutnya"
                      variant="outline"
                      onClick={() => handleNavMonth(1)}
                    />
                  </HStack>
                )}

                {periodMode === "QUARTER" && (
                  <HStack spacing={2}>
                    <Select
                      size="sm"
                      rounded="lg"
                      w="180px"
                      value={selectedQuarter}
                      onChange={(e) => {
                        setSelectedQuarter(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      }}
                    >
                      {availableQuarters.map((q) => (
                        <option key={q.key} value={q.key}>
                          {q.label}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FiRotateCcw />}
                  onClick={handleResetToCurrent}
                  fontSize="xs"
                >
                  Reset ke Saat Ini
                </Button>
              </HStack>

              {/* Action Buttons: Bulk Export PDF */}
              <HStack spacing={2} w={{ base: "full", md: "auto" }} justify={{ base: "start", md: "end" }}>
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<FiDownload />}
                    rightIcon={<FiChevronDown />}
                    isDisabled={tableData.length === 0}
                    isLoading={isExporting}
                  >
                    Export Laporan
                  </MenuButton>
                  <MenuList zIndex={20} shadow="lg" py={1.5}>
                    {/* <MenuItem
                      icon={<FiDownload />}
                      fontSize="xs"
                      onClick={handleExportCurrentPeriodPdf}
                    >
                      Export Berita Acara Periode (PDF)
                    </MenuItem> */}
                    <MenuItem
                      icon={<FiFileText />}
                      fontSize="xs"
                      onClick={handleExportCurrentPeriodChecklistPdf}
                    >
                      Export Checklist Periode (PDF)
                    </MenuItem>
                    <MenuItem
                      icon={<FiFileText />}
                      fontSize="xs"
                      onClick={handleExportCurrentPeriodExcel}
                    >
                      Export Compliance Checklist (Excel)
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>

            <Divider />

            {/* Bottom Row: Search Keyword & Dropdown Filters */}
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <InputGroup size="sm" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Cari no. request, project, pemohon, notulen"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  rounded="lg"
                />
              </InputGroup>

              <HStack spacing={2} w={{ base: "full", md: "auto" }}>
                <Popover
                  isOpen={isFilterPopoverOpen}
                  onOpen={onFilterPopoverOpen}
                  onClose={onFilterPopoverClose}
                  closeOnBlur={true}
                  placement="bottom"
                >
                  <PopoverTrigger>
                    <Button size="sm" leftIcon={<FiFilter />}>
                      Filter{" "}
                      {ParamFilter.length > 0 && (
                        <Flex
                          as="span"
                          pl={1}
                          color="secondary.500"
                          fontWeight={600}
                        >
                          ({ParamFilter.length})
                        </Flex>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent width="auto" minW="xs">
                    <PopoverBody>
                      <Flex as={Stack} w="full">
                        <Text fontWeight={600}>Filter Kolom Aktif</Text>
                        <Divider />
                        {ParamFilter.length === 0 ? (
                          <Text fontSize="xs" color="gray.500">
                            Belum ada filter kolom aktif. Klik ikon filter pada header tabel untuk menyaring.
                          </Text>
                        ) : (
                          <Stack spacing={2}>
                            {ParamFilter.map((dt, idx) => (
                              <Flex
                                key={idx}
                                w="full"
                                alignItems="center"
                                as={HStack}
                                spacing={2}
                              >
                                <Text fontSize="xs">
                                  {dt.filterLabel || dt.field} :{" "}
                                  <Text as="span" fontWeight={600}>
                                    {dt.value}
                                  </Text>
                                </Text>
                                <IconButton
                                  aria-label="Remove filter"
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  icon={<FiX />}
                                  onClick={() => removeFilterData(dt)}
                                />
                              </Flex>
                            ))}
                            <Divider />
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => {
                                clearAllFilters();
                                onFilterPopoverClose();
                              }}
                              w="full"
                            >
                              Clear All
                            </Button>
                          </Stack>
                        )}
                      </Flex>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>

                <Select
                  size="sm"
                  w={{ base: "full", sm: "160px" }}
                  rounded="lg"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                >
                  <option value="ALL">Semua Kategori (Tipe)</option>
                  <option value="SOFTWARE">SOFTWARE</option>
                  <option value="HARDWARE">HARDWARE</option>
                </Select>
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* ─── Main Single DataTable Styled like /requirements/brd-rfc ─── */}
      <Card
        rounded={radiusStyle}
        shadow="lg"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
        overflow="hidden"
      >
        <Box px={5} py={3.5} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold">
                {activePeriodLabel}
              </Text>
              <Text fontSize="3xs" color="gray.500">
                Daftar agenda sidang CAB yang telah selesai disidangkan & siap laporan ({tableData.length} agenda)
              </Text>
            </VStack>
          </HStack>
        </Box>

        <CardBody p={4}>
          <Box overflowX="auto" w="full">
            <Box minW="1200px">
              <TableComponentWithFilterCTX
                table={table}
                handleFilterChange={handleFilterChange}
              />
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* ─── Modal 1: Quick Upload Bukti Implementasi ─── */}
      <Modal
        isOpen={Boolean(activeUploadItem)}
        onClose={() => setActiveUploadItem(null)}
        size="2xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
        <ModalContent
          rounded="xl"
          bg={isDark ? "gray.850" : "white"}
          border="1px"
          borderColor={isDark ? "gray.700" : "gray.200"}
        >
          <ModalHeader pb={1}>
            <HStack spacing={2}>
              <Icon as={FiUploadCloud} color="orange.400" />
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="bold">
                  Unggah Bukti Implementasi
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  {activeUploadItem?.requestNo} • {activeUploadItem?.requestTitle}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <Box
                p={3}
                rounded="lg"
                bg={isDark ? "orange.900" : "orange.50"}
                border="1px"
                borderColor={isDark ? "orange.700" : "orange.200"}
              >
                <HStack align="start" spacing={2.5}>
                  <Icon as={FiAlertTriangle} color="orange.400" mt={0.5} />
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="xs" fontWeight="bold" color={isDark ? "orange.200" : "orange.800"}>
                      Bukti Implementasi Wajib Dilampirkan
                    </Text>
                    <Text fontSize="3xs" color={isDark ? "orange.300" : "orange.700"}>
                      Unggah screenshot deployment, log verifikasi, atau hasil uji coba live untuk melengkapi Berita Acara CAB dan membuka fitur export PDF.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Drag and Drop Zone */}
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "blue.400" : isDark ? "gray.600" : "gray.300"}
                bg={isDragActive ? (isDark ? "blue.900" : "blue.50") : (isDark ? "gray.800" : "gray.50")}
                rounded="xl"
                p={6}
                textAlign="center"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.400",
                  bg: isDark ? "gray.750" : "blue.50",
                }}
              >
                <input {...getInputProps()} />
                <VStack spacing={2}>
                  <Box p={3} bg={isDark ? "gray.700" : "blue.100" } rounded="full" color="blue.500">
                    <Icon as={FiUploadCloud} boxSize={6} />
                  </Box>
                  <Text fontSize="sm" fontWeight="semibold">
                    {isDragActive ? "Lepaskan berkas di sini..." : "Seret & lepas gambar bukti implementasi di sini"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    atau klik untuk memilih dari komputer Anda (Format: PNG, JPG, JPEG, WEBP • Maks. 10MB per berkas)
                  </Text>
                </VStack>
              </Box>

              {/* Uploaded Thumbnails Preview */}
              {uploadModalFiles.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="bold">
                      Berkas Terlampir ({uploadModalFiles.length})
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FiTrash2 />}
                      onClick={() => setUploadModalFiles([])}
                    >
                      Hapus Semua
                    </Button>
                  </HStack>

                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                    {uploadModalFiles.map((file) => (
                      <Box
                        key={file.id}
                        position="relative"
                        rounded="lg"
                        border="1px"
                        borderColor={isDark ? "gray.700" : "gray.200"}
                        overflow="hidden"
                        bg={isDark ? "gray.800" : "white"}
                        shadow="xs"
                      >
                        <Image
                          src={file.url}
                          alt={file.name}
                          h="100px"
                          w="full"
                          objectFit="cover"
                          cursor="pointer"
                          onClick={() =>
                            setPreviewModalData({
                              isOpen: true,
                              url: file.url,
                              name: file.name,
                              size: file.size,
                            })
                          }
                        />
                        <Box p={2}>
                          <Text fontSize="3xs" fontWeight="semibold" noOfLines={1} title={file.name}>
                            {file.name}
                          </Text>
                          <Text fontSize="4xs" color="gray.500">
                            {formatFileSize(file.size)}
                          </Text>
                        </Box>

                        {/* Actions Overlay */}
                        <HStack
                          position="absolute"
                          top={1.5}
                          right={1.5}
                          spacing={1}
                        >
                          <IconButton
                            size="xs"
                            icon={<FiZoomIn />}
                            aria-label="Lihat"
                            colorScheme="blackAlpha"
                            rounded="full"
                            onClick={() =>
                              setPreviewModalData({
                                isOpen: true,
                                url: file.url,
                                name: file.name,
                                size: file.size,
                              })
                            }
                          />
                          <IconButton
                            size="xs"
                            icon={<FiX />}
                            aria-label="Hapus"
                            colorScheme="red"
                            rounded="full"
                            onClick={() => handleRemoveModalFile(file.id)}
                          />
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
            <Button
              variant="ghost"
              size="sm"
              mr={3}
              onClick={() => setActiveUploadItem(null)}
              isDisabled={isSavingBukti}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<FiCheck />}
              onClick={handleSaveModalBukti}
              isLoading={isSavingBukti}
              isDisabled={uploadModalFiles.length === 0}
            >
              Simpan Bukti Implementasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── Modal 2: Lightbox Fullscreen Image Preview ─── */}
      <Modal
        isOpen={previewModalData.isOpen}
        onClose={() => setPreviewModalData((prev) => ({ ...prev, isOpen: false }))}
        size="3xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.750" backdropFilter="blur(5px)" />
        <ModalContent bg={isDark ? "gray.850" : "white"} rounded="xl" overflow="hidden">
          <ModalHeader py={3} px={4} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack justify="space-between" pr={6}>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold">
                  {previewModalData.name}
                </Text>
                {previewModalData.size && (
                  <Text fontSize="3xs" color="gray.500">
                    Ukuran: {formatFileSize(previewModalData.size)}
                  </Text>
                )}
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={0} bg={isDark ? "black" : "gray.900"} display="flex" justifyContent="center" alignItems="center">
            {previewModalData.url && (
              <Image
                src={previewModalData.url}
                alt={previewModalData.name}
                maxH="70vh"
                maxW="full"
                objectFit="contain"
              />
            )}
          </ModalBody>

          <ModalFooter py={2.5} px={4} borderTop="1px" borderColor={isDark ? "gray.700" : "gray.200"}>
            <HStack justify="space-between" w="full">
              <Text fontSize="3xs" color="gray.500">
                Bukti Implementasi Resmi CAB
              </Text>
              <HStack spacing={2}>
                {previewModalData.url && (
                  <Button
                    as="a"
                    size="xs"
                    colorScheme="blue"
                    leftIcon={<FiDownload />}
                    href={previewModalData.url}
                    download={previewModalData.name || "bukti-implementasi.png"}
                  >
                    Unduh Gambar
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPreviewModalData((prev) => ({ ...prev, isOpen: false }))}
                >
                  Tutup
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── Modal 3: Confirmation Warning Dialog when Bulk Exporting with Missing Evidence ─── */}
      <AlertDialog
        isOpen={isWarningExportOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsWarningExportOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent rounded="xl" bg={isDark ? "gray.850" : "white"}>
            <AlertDialogHeader fontSize="md" fontWeight="bold" pb={1}>
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} color="orange.400" />
                <Text>Peringatan Bukti Implementasi</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>
                Terdapat <b>{missingEvidenceCount}</b> dari <b>{tableData.length}</b> agenda CAB pada periode ini yang belum memiliki bukti implementasi digital.
              </Text>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Apakah Anda tetap ingin mengunduh laporan rekapitulasi, atau mengunggah bukti terlebih dahulu?
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} size="sm" variant="ghost" onClick={() => setIsWarningExportOpen(false)}>
                Batal
              </Button>
              {/* <Button size="sm" colorScheme="blue" onClick={executeGroupExport} ml={3}>
                Tetap Unduh Laporan
              </Button> */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default CabReportsTab;
