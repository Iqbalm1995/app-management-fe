"use client";

import { useMemo, useState } from "react";
import {
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tab,
  TabList,
  Tabs,
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
import { useRouter } from "next/navigation";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiGrid,
  FiLayers,
  FiRotateCcw,
  FiSearch,
} from "react-icons/fi";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { AppTabList, AppTabItem } from "@/app/components/TabsCustom";
import { CabRequestItem } from "@/app/types/cabTypes";
import { exportCabReportsGroupPdf, exportSingleCabMeetingPdf } from "@/app/helper/CabReportPdfExport";

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

const getQuarterKeyFromDate = (dateStr: string): { key: string; year: number; q: number; label: string } => {
  const d = new Date(dateStr);
  const year = d.getFullYear() || 2026;
  const q = Math.ceil((d.getMonth() + 1) / 3);
  const monthsDesc = q === 1 ? "Jan - Mar" : q === 2 ? "Apr - Jun" : q === 3 ? "Jul - Sep" : "Okt - Des";
  return {
    key: `${year}-Q${q}`,
    year,
    q,
    label: `Kuartal ${q} (Q${q}) ${year} • ${monthsDesc}`,
  };
};

const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatMonthIndo = (yearMonthStr: string): string => {
  if (!yearMonthStr) return "-";
  const [year, month] = yearMonthStr.split("-");
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} ${year}`;
};

const getCabCategory = (item: CabRequestItem): "SOFTWARE" | "HARDWARE" => {
  if (item.category === "HARDWARE" || item.category === "SOFTWARE") return item.category;
  const typeUpper = String(item.requestType || "").toUpperCase();
  if (typeUpper === "INFRASTRUCTURE" || typeUpper === "HARDWARE" || typeUpper === "PROCUREMENT" || (item.projectName && item.projectName.toLowerCase().includes("hardware"))) {
    return "HARDWARE";
  }
  return "SOFTWARE";
};

const renderCabResultBadge = (result?: string, status?: string) => {
  const safe = (result || status || "APPROVED").toUpperCase();
  if (safe.includes("REJECT") || safe.includes("DITOLAK")) {
    return <Badge colorScheme="red" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs">Ditolak (Rejected)</Badge>;
  }
  if (safe.includes("NOTE") || safe.includes("CATATAN")) {
    return <Badge colorScheme="cyan" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs">Disetujui dg Catatan</Badge>;
  }
  if (safe.includes("RESCHEDULE") || safe.includes("PENDING")) {
    return <Badge colorScheme="orange" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs">Rescheduled</Badge>;
  }
  return <Badge colorScheme="green" variant="subtle" rounded="full" px={2.5} py={0.5} fontSize="2xs">Disetujui (Approved)</Badge>;
};

const CabReportsTab = ({ items }: CabReportsTabProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  // Active Tab Period Mode
  const [periodMode, setPeriodMode] = useState<TabPeriodMode>("DAY");

  // Selected Filter Values (Defaulting to Current Date / Week / Month / Quarter)
  const [selectedDay, setSelectedDay] = useState<string>(getTodayStr());
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(getTodayStr());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getQuarterKeyFromDate(getTodayStr()).key);

  // Search, Status, Type, and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Base Filter: ONLY items with isCabDone === "Y" or in IMPLEMENT, WAITING APPROVAL, COMPLETED, APPROVED
  const doneCabItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.isCabDone === "Y" ||
        ["IMPLEMENT", "WAITING APPROVAL", "WAITING APPROVE", "COMPLETED", "APPROVED"].includes(
          String(item.status).toUpperCase()
        )
    );
  }, [items]);

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

  // 3. Search & Filter by keyword, status, and type
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

      const res = (item.cabResult || item.status || "APPROVED").toUpperCase();
      let matchStatus = true;
      if (statusFilter === "APPROVED") matchStatus = res.includes("APPROVE") && !res.includes("NOTE");
      else if (statusFilter === "APPROVED_NOTE") matchStatus = res.includes("NOTE") || res.includes("CATATAN");
      else if (statusFilter === "REJECTED") matchStatus = res.includes("REJECT");

      const matchType = typeFilter === "ALL" || getCabCategory(item) === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [periodFilteredItems, searchQuery, statusFilter, typeFilter]);

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

  // Pagination calculation
  const totalPages = Math.ceil(tableData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, safePage, pageSize]);

  // Period Navigation handlers (Previous / Next / Reset to Current)
  const handleNavDay = (delta: number) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d.toISOString().slice(0, 10));
    setCurrentPage(1);
  };

  const handleNavWeek = (deltaWeeks: number) => {
    const d = new Date(selectedWeekDate);
    d.setDate(d.getDate() + deltaWeeks * 7);
    setSelectedWeekDate(d.toISOString().slice(0, 10));
    setCurrentPage(1);
  };

  const handleNavMonth = (deltaMonths: number) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + deltaMonths, 1);
    const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(nextMonth);
    setCurrentPage(1);
  };

  const handleResetToCurrent = () => {
    const today = getTodayStr();
    if (periodMode === "DAY") setSelectedDay(today);
    else if (periodMode === "WEEK") setSelectedWeekDate(today);
    else if (periodMode === "MONTH") setSelectedMonth(getCurrentMonthStr());
    else if (periodMode === "QUARTER") setSelectedQuarter(getQuarterKeyFromDate(today).key);
    setCurrentPage(1);
  };

  // PDF Export Handlers
  const handleExportCurrentPeriodPdf = async () => {
    setIsExporting(true);
    try {
      await exportCabReportsGroupPdf({
        title: "Laporan Sidang Change Advisory Board (CAB)",
        periodLabel: activePeriodLabel,
        groupType: periodMode,
        items: tableData,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingle = async (item: CabRequestItem) => {
    setIsExporting(true);
    try {
      await exportSingleCabMeetingPdf(item);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* ─── Period Filter Tabs (Per Hari, Per Minggu, Per Bulan, Per Kuartal) ─── */}
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
              setCurrentPage(1);
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
                        setCurrentPage(1);
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
                        setCurrentPage(1);
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
                      w="170px"
                      rounded="lg"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setCurrentPage(1);
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
                  <Select
                    size="sm"
                    w="240px"
                    rounded="lg"
                    value={selectedQuarter}
                    onChange={(e) => {
                      setSelectedQuarter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {availableQuarters.map((q) => (
                      <option key={q.key} value={q.key}>
                        {q.label}
                      </option>
                    ))}
                  </Select>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<FiRotateCcw />}
                  onClick={handleResetToCurrent}
                >
                  {periodMode === "DAY" ? "Hari Ini" : periodMode === "WEEK" ? "Minggu Ini" : periodMode === "MONTH" ? "Bulan Ini" : "Kuartal Ini"}
                </Button>
              </HStack>

              {/* Header Active Period & Count Badge */}
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle" rounded="full" px={3} py={1} fontSize="xs">
                  {tableData.length} Agenda Ditemukan
                </Badge>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FiDownload />}
                  onClick={handleExportCurrentPeriodPdf}
                  isDisabled={tableData.length === 0}
                  isLoading={isExporting}
                >
                  Export 
                </Button>
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
                  placeholder="Cari no. request, project, pemohon, notulen..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  rounded="lg"
                />
              </InputGroup>

              <HStack spacing={2} w={{ base: "full", md: "auto" }}>
                <Select
                  size="sm"
                  w={{ base: "full", sm: "150px" }}
                  rounded="lg"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Keputusan</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="APPROVED_NOTE">Disetujui Catatan</option>
                  <option value="REJECTED">Ditolak</option>
                </Select>

                <Select
                  size="sm"
                  w={{ base: "full", sm: "150px" }}
                  rounded="lg"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="SOFTWARE">SOFTWARE</option>
                  <option value="HARDWARE">HARDWARE</option>
                </Select>
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* ─── Main Single DataTable ─── */}
      <Card
        rounded={radiusStyle}
        shadow="sm"
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
                Daftar agenda sidang CAB yang telah selesai disidangkan
              </Text>
            </VStack>
          </HStack>
        </Box>

        {tableData.length === 0 ? (
          <VStack spacing={3} py={16} align="center">
            <Box p={4} rounded="full" bg={isDark ? "gray.700" : "gray.100"}>
              <Icon as={FiFileText} boxSize={8} color="gray.400" />
            </Box>
            <Text fontSize="md" fontWeight="bold" color="gray.500">
              Tidak Ada Agenda CAB pada Periode Ini
            </Text>
            <Text fontSize="xs" color="gray.400" maxW="450px" textAlign="center">
              Gunakan pemilih tanggal di atas untuk melihat tanggal/periode lain yang memiliki agenda sidang selesai.
            </Text>
            {availableDays.length > 0 && (
              <HStack spacing={2} pt={2}>
                <Text fontSize="xs" color="gray.500">
                  Tanggal tersedia:
                </Text>
                {availableDays.slice(0, 3).map((d) => (
                  <Button
                    key={d}
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => {
                      setSelectedDay(d);
                      setSelectedWeekDate(d);
                      setSelectedMonth(d.slice(0, 7));
                      setSelectedQuarter(getQuarterKeyFromDate(d).key);
                    }}
                  >
                    {d}
                  </Button>
                ))}
              </HStack>
            )}
          </VStack>
        ) : (
          <Box w="full">
            <Box overflowX="auto">
              <Table size="sm" variant="simple" minW="1000px">
                <Thead bg={isDark ? "gray.750" : "gray.50"}>
                  <Tr>
                    <Th w="40px" textAlign="center">No</Th>
                    <Th w="130px">No. Request</Th>
                    <Th minW="220px">Judul Perubahan & Project</Th>
                    <Th w="120px">Tipe</Th>
                    <Th w="140px">Waktu Meeting</Th>
                    <Th w="150px">Pemohon</Th>
                    <Th w="160px">Keputusan CAB</Th>
                    <Th minW="200px">Catatan Komite CAB</Th>
                    <Th w="100px" textAlign="center">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedRows.map((item, idx) => {
                    const rowNum = (safePage - 1) * pageSize + idx + 1;
                    const timeStr = item.scheduledDate
                      ? `${item.scheduledDate.slice(11, 16)} - ${item.scheduledEndDate ? item.scheduledEndDate.slice(11, 16) : ""} WIB`
                      : "-";
                    const dateStr = item.scheduledDate ? item.scheduledDate.slice(0, 10) : item.targetDate;

                    return (
                      <Tr
                        key={item.id}
                        _hover={{ bg: isDark ? "gray.750" : "blue.50" }}
                        transition="all 0.15s"
                      >
                        <Td textAlign="center" fontSize="xs" color="gray.500">
                          {rowNum}
                        </Td>
                        <Td>
                          <Text fontSize="xs" fontWeight="bold" color="blue.500">
                            {item.requestNo}
                          </Text>
                          <Text fontSize="3xs" color="gray.400">
                            {dateStr}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0.5}>
                            <Text fontSize="xs" fontWeight="semibold" noOfLines={2}>
                              {item.requestTitle}
                            </Text>
                            <Text fontSize="3xs" color="gray.500">
                              Project: {item.projectName}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getCabCategory(item) === "HARDWARE" ? "orange" : "blue"}
                            variant="subtle"
                            rounded="full"
                            px={2.5}
                            py={0.5}
                            fontSize="3xs"
                            fontWeight="bold"
                          >
                            {getCabCategory(item)}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="medium">
                              {timeStr}
                            </Text>
                            <Text fontSize="3xs" color="gray.500">
                              {item.cabLocation || "Online Meeting"}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="semibold">
                              {item.requesterName}
                            </Text>
                            <Text fontSize="3xs" color="gray.500">
                              Approver: {item.approverName}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          {renderCabResultBadge(item.cabResult, item.status)}
                        </Td>
                        <Td>
                          <Text fontSize="xs" color={isDark ? "gray.300" : "gray.700"} noOfLines={2}>
                            {item.cabNotes || "Disetujui tanpa catatan khusus oleh komite CAB."}
                          </Text>
                        </Td>
                        <Td textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Export Berita Acara (PDF)" hasArrow>
                              <IconButton
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                icon={<FiDownload />}
                                aria-label="Export PDF"
                                onClick={() => handleExportSingle(item)}
                              />
                            </Tooltip>
                            <Tooltip label="Lihat Detail Request" hasArrow>
                              <IconButton
                                size="xs"
                                colorScheme="teal"
                                variant="ghost"
                                icon={<FiEye />}
                                aria-label="Detail"
                                onClick={() => router.push(`/cab/cab-request/detail?id=${item.id}`)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* DataTable Pagination Footer */}
            <Flex
              px={4}
              py={3}
              borderTop="1px"
              borderColor={isDark ? "gray.700" : "gray.100"}
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={2}
              bg={isDark ? "gray.750" : "gray.50"}
            >
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  Menampilkan {Math.min((safePage - 1) * pageSize + 1, tableData.length)} - {Math.min(safePage * pageSize, tableData.length)} dari {tableData.length} agenda
                </Text>
                <Select
                  size="xs"
                  w="85px"
                  rounded="md"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={25}>25 / hal</option>
                  <option value={50}>50 / hal</option>
                </Select>
              </HStack>

              {totalPages > 1 && (
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    variant="outline"
                    isDisabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Text fontSize="xs" px={2} fontWeight="semibold">
                    {safePage} / {totalPages}
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    isDisabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </Flex>
          </Box>
        )}
      </Card>
    </VStack>
  );
};

export default CabReportsTab;
