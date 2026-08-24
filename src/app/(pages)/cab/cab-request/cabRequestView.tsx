"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiEye,
  FiFileText,
  FiFilter,
  FiFolder,
  FiLayers,
  FiList,
  FiMonitor,
  FiPlusSquare,
  FiRefreshCcw,
  FiRotateCcw,
  FiShield,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import { StatusBadge } from "@/app/components/StatusBadge";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AppTabList, AppTabItem } from "@/app/components/TabsCustom";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useCabRequest from "@/app/services/useCabRequest";
import { BulkScheduleCabItemPayload, CabRequestItem } from "@/app/types/cabTypes";
import CabReportsTab from "./components/CabReportsTab";
import BulkScheduleModal from "./components/BulkScheduleModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────
interface CalendarStatusStyle {
  bg: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

const getStatusCalendarStyle = (status?: string | null, isDark?: boolean): CalendarStatusStyle => {
  const safeStatus = String(status || "").toUpperCase();
  switch (safeStatus) {
    case "REQUEST":
    case "IN_REVIEW":
      return {
        bg: isDark ? "#1E3A8A" : "#DBEAFE",
        borderColor: isDark ? "#3B82F6" : "#93C5FD",
        textColor: isDark ? "#EFF6FF" : "#1D4ED8",
        dotColor: "#3B82F6",
      };
    case "SCHEDULED":
    case "SUBMITTED":
      return {
        bg: isDark ? "#581C87" : "#F3E8FF",
        borderColor: isDark ? "#A855F7" : "#D8B4FE",
        textColor: isDark ? "#FAF5FF" : "#6B21A8",
        dotColor: "#9333EA",
      };
    case "CONFIRM":
      return {
        bg: isDark ? "#115E59" : "#CCFBF1",
        borderColor: isDark ? "#14B8A6" : "#5EEAD4",
        textColor: isDark ? "#F0FDFA" : "#0F766E",
        dotColor: "#14B8A6",
      };
    case "IMPLEMENT":
      return {
        bg: isDark ? "#7C2D12" : "#FFEDD5",
        borderColor: isDark ? "#F97316" : "#FDBA74",
        textColor: isDark ? "#FFF7ED" : "#C2410C",
        dotColor: "#EA580C",
      };
    case "WAITING APPROVE":
    case "WAITING APPROVAL":
      return {
        bg: isDark ? "#713F12" : "#FEF9C3",
        borderColor: isDark ? "#EAB308" : "#FDE047",
        textColor: isDark ? "#FEFCE8" : "#A16207",
        dotColor: "#CA8A04",
      };
    case "COMPLETED":
    case "APPROVED":
      return {
        bg: isDark ? "#14532D" : "#DCFCE7",
        borderColor: isDark ? "#22C55E" : "#86EFAC",
        textColor: isDark ? "#F0FDF4" : "#166534",
        dotColor: "#16A34A",
      };
    case "REJECTED":
      return {
        bg: isDark ? "#7F1D1D" : "#FEE2E2",
        borderColor: isDark ? "#EF4444" : "#FCA5A5",
        textColor: isDark ? "#FEF2F2" : "#991B1B",
        dotColor: "#DC2626",
      };
    case "DRAFT":
    default:
      return {
        bg: isDark ? "#374151" : "#F3F4F6",
        borderColor: isDark ? "#6B7280" : "#D1D5DB",
        textColor: isDark ? "#F9FAFB" : "#1F2937",
        dotColor: "#6B7280",
      };
  }
};

type MockRole = "maker" | "scheduler" | "approver";

// ─── Upcoming Summary Panel (Right Column 30%) ────────────────────────────────
const UpcomingSummaryPanel = ({
  upcomingData,
  isDark,
  onNavigate,
}: {
  upcomingData: {
    today: CabRequestItem[];
    thisWeek: CabRequestItem[];
    next14Days: CabRequestItem[];
    totalCount: number;
  };
  isDark: boolean;
  onNavigate: (id: string) => void;
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleExpand = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderEventList = (items: CabRequestItem[], groupKey: string) => {
    const isExpanded = expandedGroups[groupKey];
    const visibleItems = isExpanded ? items : items.slice(0, 5);
    const hasMore = items.length > 5;

    return (
      <VStack spacing={2.5} align="stretch" w="full">
        {visibleItems.map((item) => {
          const style = getStatusCalendarStyle(item.status, isDark);
          const timeStr = item.scheduledDate
            ? new Date(item.scheduledDate).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          const isHardware =
            item.requestType?.toUpperCase().includes("HARDWARE") ||
            item.requestType?.toUpperCase().includes("INFRASTRUCTURE") ||
            item.requestType?.toUpperCase().includes("SERVER") ||
            item.requestType?.toUpperCase().includes("MAINTENANCE");
          const categoryLabel = isHardware ? "HARDWARE" : "SOFTWARE";

          return (
            <Box
              key={item.id}
              onClick={() => onNavigate(item.id)}
              position="relative"
              p={3}
              pl={3.5}
              bg={isDark ? "gray.800" : "white"}
              border="1px solid"
              borderColor={isDark ? "gray.700" : "gray.200"}
              borderLeft="4px solid"
              borderLeftColor={style.dotColor}
              rounded="md"
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{
                bg: isDark ? "gray.750" : "gray.50",
                transform: "translateX(2px)",
                borderColor: isDark ? "gray.600" : "gray.300",
                borderLeftColor: style.dotColor,
              }}
            >
              {/* Line 1: Time + Category */}
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.200" : "gray.800"}>
                  {timeStr}
                </Text>
                <Text
                  fontSize="2xs"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                  color={isDark ? "gray.400" : "gray.500"}
                  textTransform="uppercase"
                >
                  {categoryLabel}
                </Text>
              </Flex>

              {/* Line 2: Monospace CAB number */}
              <Text
                fontFamily="mono"
                fontSize="xs"
                fontWeight="semibold"
                color="secondary.500"
                mb={1}
              >
                {item.requestNo}
              </Text>

              {/* Line 3: Title */}
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={isDark ? "white" : "gray.900"}
                noOfLines={1}
                mb={2.5}
                lineHeight="short"
              >
                {item.requestTitle}
              </Text>

              {/* Line 4: Status Badge + Action Buttons (SCHEDULE for REQUEST, DETAIL for WAITING APPROVE/APPROVED) */}
              <Flex justify="space-between" align="center" pt={1.5} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.100"}>
                <StatusBadge status={item.status} fontSize="2xs" px={2} py={0.5} rounded="full" />

                {item.status === "REQUEST" ? (
                  <Button
                    size="xs"
                    colorScheme="purple"
                    rounded="md"
                    px={2.5}
                    h="24px"
                    fontSize="2xs"
                    fontWeight="bold"
                    leftIcon={<FiCalendar />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(item.id);
                    }}
                  >
                    SCHEDULE
                  </Button>
                ) : item.status === "SUBMITTED" || item.status === "SCHEDULED" ? (
                  <Button
                    size="xs"
                    colorScheme="cyan"
                    variant="solid"
                    rounded="md"
                    px={2.5}
                    h="24px"
                    fontSize="2xs"
                    fontWeight="bold"
                    leftIcon={<FiEye />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(item.id);
                    }}
                  >
                    DETAIL
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    rounded="md"
                    px={2.5}
                    h="24px"
                    fontSize="2xs"
                    fontWeight="bold"
                    leftIcon={<FiEye />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(item.id);
                    }}
                  >
                    DETAIL
                  </Button>
                )}
              </Flex>
            </Box>
          );
        })}

        {hasMore && (
          <Button
            size="xs"
            variant="ghost"
            colorScheme="blue"
            alignSelf="flex-start"
            fontSize="xs"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(groupKey);
            }}
          >
            {isExpanded ? "Show less" : `Show more (+${items.length - 5})`}
          </Button>
        )}
      </VStack>
    );
  };

  return (
    <Card
      rounded="lg"
      shadow="none"
      border="1px solid"
      borderColor={isDark ? "gray.700" : "gray.200"}
      bg={isDark ? "gray.800" : "white"}
      h="full"
      display="flex"
      flexDirection="column"
    >
      <CardHeader
        py={3.5}
        px={4}
        borderBottom="1px solid"
        borderColor={isDark ? "gray.700" : "gray.100"}
      >
        <VStack align="start" spacing={0.5}>
          <Heading size="sm" fontWeight="700" color={isDark ? "white" : "gray.800"}>
            Upcoming Schedule
          </Heading>
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
            {upcomingData.totalCount} event{upcomingData.totalCount !== 1 ? "s" : ""} in the next 14 days
          </Text>
        </VStack>
      </CardHeader>

      <CardBody
        p={3.5}
        maxH={{ base: "450px", lg: "560px" }}
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { bg: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bg: isDark ? "gray.700" : "gray.300",
            borderRadius: "4px",
          },
        }}
      >
        {upcomingData.totalCount === 0 ? (
          <Flex h="180px" justify="center" align="center" textAlign="center">
            <Text fontSize="sm" color={isDark ? "gray.500" : "gray.400"}>
              No scheduled CAB events in the next 14 days
            </Text>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Group 1: Today */}
            {upcomingData.today.length > 0 && (
              <VStack align="start" spacing={2} w="full">
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  color={isDark ? "blue.400" : "blue.600"}
                >
                  TODAY
                </Text>
                {renderEventList(upcomingData.today, "today")}
              </VStack>
            )}

            {/* Group 2: This Week */}
            {upcomingData.thisWeek.length > 0 && (
              <VStack align="start" spacing={2} w="full">
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  color={isDark ? "gray.400" : "gray.500"}
                >
                  THIS WEEK
                </Text>
                {renderEventList(upcomingData.thisWeek, "thisWeek")}
              </VStack>
            )}

            {/* Group 3: Next 14 Days */}
            {upcomingData.next14Days.length > 0 && (
              <VStack align="start" spacing={2} w="full">
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  color={isDark ? "gray.400" : "gray.500"}
                >
                  NEXT 14 DAYS
                </Text>
                {renderEventList(upcomingData.next14Days, "next14Days")}
              </VStack>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────
const CabRequestView = () => {
  useDocumentTitle("CAB Request");
  const { colorMode } = useColorMode();
  const router = useRouter();
  const toast = useToast();
  const { ListCabRequests, GetCabCalendar, BulkScheduleCabRequests, loading } = useCabRequest();

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Role switcher
  const [mockRole, setMockRole] = useState<MockRole>("scheduler");
  const canMake = mockRole === "maker";
  const canSchedule = mockRole === "scheduler";
  const canApprove = mockRole === "approver";

  // Data
  const [DataList, setDataList] = useState<CabRequestItem[]>([]);
  const [DataCalendar, setDataCalendar] = useState<CabRequestItem[]>([]);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [RefreshData, setRefreshData] = useState<number>(0);

  // Event modal (calendar click)
  const [SelectedEvent, setSelectedEvent] = useState<CabRequestItem | null>(null);
  const eventModal = useDisclosure();
  const categoryModal = useDisclosure();

  // Bulk Schedule state & modal
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const bulkScheduleModal = useDisclosure();
  const [bulkModalTargetRequests, setBulkModalTargetRequests] = useState<CabRequestItem[]>([]);
  const [bulkModalInitialDate, setBulkModalInitialDate] = useState<string>("");
  const [incomingRequestCount, setIncomingRequestCount] = useState<number | null>(null);

  // Table pagination (CAB List - excludes REQUEST)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // CAB List only (Exclude REQUEST items from CAB List tab)
  const cabListOnly = useMemo(
    () => DataList.filter((item) => String(item.status).toUpperCase() !== "REQUEST"),
    [DataList]
  );

  // Pending Table pagination & filter (CAB Request Tab - Status REQUEST only - Scheduler only)
  const [{ pageIndex: pendingPageIndex, pageSize: pendingPageSize }, setPendingPagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pendingPagination = useMemo(
    () => ({ pageIndex: pendingPageIndex, pageSize: pendingPageSize }),
    [pendingPageIndex, pendingPageSize]
  );
  const [pendingGlobalFilter, setPendingGlobalFilter] = useState<string>("");

  const pendingRequestsList = useMemo(
    () => DataList.filter((item) => String(item.status).toUpperCase() === "REQUEST"),
    [DataList]
  );

  // Selected requests for bulk actions
  const selectedRequestsList = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
    return DataList.filter((item) => selectedIds.includes(item.id));
  }, [rowSelection, DataList]);

  // Bulk Schedule Handlers
  const handleConfirmBulkSchedule = async (items: BulkScheduleCabItemPayload[]) => {
    const success = await BulkScheduleCabRequests(tokenData, items);
    if (success) {
      toast({
        title: "Jadwal CAB Berhasil Disimpan",
        description: `${items.length} permohonan berhasil dijadwalkan (Status ➔ SCHEDULED).`,
        status: "success",
        duration: 3500,
        isClosable: true,
        position: "top",
      });
      setRowSelection({});
      bulkScheduleModal.onClose();
      loadData();
    } else {
      toast({
        title: "Gagal Menyimpan Jadwal",
        description: "Terjadi kesalahan saat menyimpan jadwal massal.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleOpenBulkForUnscheduled = () => {
    const unscheduled = DataList.filter(
      (r) => r.status === "REQUEST" || r.status === "IN_REVIEW" || !r.scheduledDate
    );
    if (unscheduled.length === 0) {
      toast({
        title: "Semua Permohonan Terjadwal",
        description: "Tidak ada permohonan CAB berstatus Request yang perlu dijadwalkan.",
        status: "info",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setBulkModalTargetRequests(unscheduled);
    setBulkModalInitialDate("");
    bulkScheduleModal.onOpen();
  };

  const handleCalendarDateClick = (dateStr: string) => {
    if (!canSchedule) return;
    const eligible = DataList.filter(
      (r) => r.status === "REQUEST" || r.status === "IN_REVIEW" || !r.scheduledDate
    );
    if (eligible.length === 0) {
      toast({
        title: "Semua Permohonan Terjadwal",
        description: "Tidak ada permohonan CAB berstatus Request yang perlu dijadwalkan.",
        status: "info",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }
    const targetList = selectedRequestsList.length > 0 ? selectedRequestsList : eligible;
    setBulkModalTargetRequests(targetList);
    setBulkModalInitialDate(dateStr);
    bulkScheduleModal.onOpen();
  };

  // Calendar ref & filter states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarRef = useRef<any>(null);
  const [calendarDateFrom, setCalendarDateFrom] = useState<string>("");
  const [calendarDateTo, setCalendarDateTo] = useState<string>("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("This Month");
  const [calendarViewMode, setCalendarViewMode] = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");

  const unscheduledCount = useMemo(
    () => DataList.filter((r) => r.status === "REQUEST" || r.scheduledDate === null).length,
    [DataList]
  );

  const handleViewChange = (view: "dayGridMonth" | "timeGridWeek") => {
    setCalendarViewMode(view);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
    }
  };

  const handleQuickFilter = (preset: "Today" | "This Week" | "This Month") => {
    setActiveQuickFilter(preset);
    setCalendarDateFrom("");
    setCalendarDateTo("");
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const now = new Date();
    switch (preset) {
      case "Today":
        setCalendarViewMode("timeGridWeek");
        api.changeView("timeGridDay", now);
        break;
      case "This Week":
        setCalendarViewMode("timeGridWeek");
        api.changeView("timeGridWeek", now);
        break;
      case "This Month":
        setCalendarViewMode("dayGridMonth");
        api.changeView("dayGridMonth", now);
        break;
    }
  };

  const handleApplyDateRange = () => {
    if (!calendarDateFrom) return;
    setActiveQuickFilter("");
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(calendarDateFrom);
  };

  const handleResetDateRange = () => {
    setCalendarDateFrom("");
    setCalendarDateTo("");
    handleQuickFilter("This Month");
  };

  // Auth setup
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    if (token) setTokenData(token);
  }, []);

  // Load data
  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    loadData();
  }, [DataAuth, tokenData, RefreshData]);

  const loadData = async () => {
    setIsLoadingProcess(true);
    const [listRes, calRes] = await Promise.all([
      ListCabRequests(tokenData),
      GetCabCalendar(tokenData),
    ]);
    if (listRes) {
      setDataList(listRes.data);
      // Prepared for backend incoming request counter from response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const incomingFromBackend =
        (listRes as any).incomingRequestCount ??
        (listRes as any).totalIncomingRequest ??
        (listRes as any).meta?.incomingRequests ??
        listRes.data.filter((item) => String(item.status).toUpperCase() === "REQUEST").length;
      setIncomingRequestCount(incomingFromBackend);
    }
    if (calRes) setDataCalendar(calRes.data);
    setIsLoadingProcess(false);
  };

  const RefreshAction = useCallback(() => {
    setDataList([]);
    setDataCalendar([]);
    setIncomingRequestCount(null);
    setRefreshData((p) => p + 1);
  }, []);

  const isDark = colorMode === "dark";

  // Calendar events with date range filter
  const calendarEvents = useMemo(() => {
    let filtered = DataCalendar;
    if (calendarDateFrom && calendarDateTo) {
      filtered = filtered.filter((item) => {
        if (!item.scheduledDate) return false;
        const itemDate = item.scheduledDate.slice(0, 10);
        return itemDate >= calendarDateFrom && itemDate <= calendarDateTo;
      });
    } else if (calendarDateFrom) {
      filtered = filtered.filter((item) => {
        if (!item.scheduledDate) return false;
        return item.scheduledDate.slice(0, 10) >= calendarDateFrom;
      });
    }
    return filtered.map((item) => {
      const style = getStatusCalendarStyle(item.status, isDark);
      return {
        id: item.id,
        title: `${item.requestNo} — ${item.requestTitle}`,
        start: item.scheduledDate!,
        end: item.scheduledEndDate || item.scheduledDate!,
        backgroundColor: style.bg,
        borderColor: style.borderColor,
        textColor: style.textColor,
        extendedProps: { ...item },
      };
    });
  }, [DataCalendar, isDark, calendarDateFrom, calendarDateTo]);

  // Group upcoming scheduled events for the 30% summary panel
  const upcomingEventsData = useMemo(() => {
    if (!DataCalendar || DataCalendar.length === 0) {
      return { today: [], thisWeek: [], next14Days: [], totalCount: 0 };
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // End of this week (Sunday)
    const currentDayOfWeek = now.getDay();
    const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    const endOfWeekStr = endOfWeek.toISOString().slice(0, 10);

    // 14 days from now
    const fourteenDaysLater = new Date(now);
    fourteenDaysLater.setDate(now.getDate() + 14);
    const fourteenDaysStr = fourteenDaysLater.toISOString().slice(0, 10);

    // Filter events occurring within the next 14 days
    const validScheduled = DataCalendar.filter((item) => {
      if (!item.scheduledDate) return false;
      const itemDate = item.scheduledDate.slice(0, 10);
      return itemDate >= todayStr && itemDate <= fourteenDaysStr;
    }).sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""));

    const today: CabRequestItem[] = [];
    const thisWeek: CabRequestItem[] = [];
    const next14Days: CabRequestItem[] = [];

    validScheduled.forEach((item) => {
      const itemDate = item.scheduledDate!.slice(0, 10);
      if (itemDate === todayStr) {
        today.push(item);
      } else if (itemDate <= endOfWeekStr) {
        thisWeek.push(item);
      } else {
        next14Days.push(item);
      }
    });

    return {
      today,
      thisWeek,
      next14Days,
      totalCount: validScheduled.length,
    };
  }, [DataCalendar]);

  // Calendar event custom render with tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderEventContent = (eventInfo: any) => {
    const item = eventInfo.event.extendedProps as CabRequestItem;
    if (!item) return null;

    const style = getStatusCalendarStyle(item.status, isDark);

    const startTimeStr = item.scheduledDate
      ? new Date(item.scheduledDate).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const endTimeStr = item.scheduledEndDate
      ? new Date(item.scheduledEndDate).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const timeDisplay =
      startTimeStr && endTimeStr
        ? `${startTimeStr} - ${endTimeStr}`
        : startTimeStr || eventInfo.timeText || "TBD";

    // Category label: SOFTWARE / HARDWARE based on requestType / projectName
    const isHardware =
      item.requestType?.toUpperCase().includes("HARDWARE") ||
      item.requestType?.toUpperCase().includes("INFRASTRUCTURE") ||
      item.requestType?.toUpperCase().includes("SERVER") ||
      item.requestType?.toUpperCase().includes("MAINTENANCE");
    const categoryLabel = isHardware ? "HARDWARE" : "SOFTWARE";

    return (
      <Tooltip
        hasArrow
        placement="top"
        rounded="md"
        p={3}
        bg={isDark ? "gray.800" : "white"}
        color={isDark ? "white" : "gray.800"}
        border="1px solid"
        borderColor={isDark ? "gray.700" : "gray.200"}
        shadow="md"
        openDelay={150}
        label={
          <VStack align="start" spacing={1.5} maxW="280px">
            <HStack justify="space-between" w="full">
              <Text fontSize="xs" fontWeight="bold" color="secondary.500">
                {item.requestNo}
              </Text>
              <StatusBadge status={item.status} fontSize="3xs" px={2} py={0.5} rounded="full" />
            </HStack>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              noOfLines={2}
              color={isDark ? "white" : "gray.800"}
            >
              {item.requestTitle}
            </Text>
            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />
            <HStack justify="space-between" w="full">
              <Text fontSize="2xs" color="gray.500">
                Waktu:
              </Text>
              <Text
                fontSize="2xs"
                fontWeight="medium"
                color={isDark ? "gray.300" : "gray.700"}
              >
                {timeDisplay}
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="2xs" color="gray.500">
                Type:
              </Text>
              <Badge
                colorScheme="purple"
                variant="subtle"
                fontSize="2xs"
                rounded="full"
                px={1.5}
              >
                {item.requestType}
              </Badge>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="2xs" color="gray.500">
                Status:
              </Text>
              <StatusBadge
                status={item.status}
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
              />
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="2xs" color="gray.500">
                Project:
              </Text>
              <Text
                fontSize="2xs"
                color={isDark ? "gray.300" : "gray.700"}
                noOfLines={1}
              >
                {item.projectName}
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="2xs" color="gray.500">
                Requester:
              </Text>
              <Text
                fontSize="2xs"
                color={isDark ? "gray.300" : "gray.700"}
              >
                {item.requesterName}
              </Text>
            </HStack>
          </VStack>
        }
      >
        <Box
          w="full"
          py="3px"
          px="6px"
          bg={style.bg}
          borderLeft="3.5px solid"
          borderLeftColor={style.dotColor}
          borderTop="1px solid"
          borderTopColor={style.borderColor}
          borderRight="1px solid"
          borderRightColor={style.borderColor}
          borderBottom="1px solid"
          borderBottomColor={style.borderColor}
          borderRadius="5px"
          cursor="pointer"
          transition="all 0.15s ease"
          _hover={{
            filter: "brightness(0.96)",
            transform: "translateY(-1px)",
          }}
        >
          {/* Line 1: Time, Request No, and Minimal Category Label */}
          <Flex justify="space-between" align="center" w="full" mb="1px">
            <HStack spacing={1.5} overflow="hidden">
              {startTimeStr && (
                <Text fontSize="2xs" fontWeight="bold" color={style.textColor} opacity={0.95}>
                  {startTimeStr}
                </Text>
              )}
              <Text fontSize="2xs" fontWeight="medium" color={style.textColor} opacity={0.8} noOfLines={1}>
                {item.requestNo}
              </Text>
            </HStack>
            <Text
              fontSize="3xs"
              fontWeight="bold"
              letterSpacing="0.05em"
              color={style.textColor}
              opacity={0.65}
              textTransform="uppercase"
              ml={1}
              flexShrink={0}
            >
              {categoryLabel}
            </Text>
          </Flex>

          {/* Line 2: Title */}
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={style.textColor}
            noOfLines={1}
            lineHeight="1.2"
          >
            {item.requestTitle}
          </Text>
        </Box>
      </Tooltip>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps as CabRequestItem;
    setSelectedEvent(props);
    eventModal.onOpen();
  };

  // Table columns (CAB List tab - no checkbox)
  const columns = useMemo<ColumnDef<CabRequestItem>[]>(
    () => [
      {
        id: "rowNumber",
        header: "NO.",
        cell: (info) => (
          <Text fontSize="sm" textAlign="center">
            {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}.
          </Text>
        ),
      },
      {
        accessorKey: "requestNo",
        header: "REQUEST NO",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="semibold" color="secondary.600">
            {info.getValue() as string}
          </Text>
        ),
      },
      {
        accessorKey: "requestTitle",
        header: "TITLE",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
              {info.getValue() as string}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.projectName}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "requestType",
        header: "TYPE",
        cell: (info) => (
          <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">
            {info.getValue() as string}
          </Badge>
        ),
      },
      {
        accessorKey: "requesterName",
        header: "REQUESTER",
        cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: "requestDate",
        header: "REQ DATE",
        cell: (info) => {
          const val = info.getValue() as string | null | undefined;
          if (!val) return <Text fontSize="sm" color="gray.400">-</Text>;
          const d = new Date(val);
          return (
            <Text fontSize="sm">
              {isNaN(d.getTime()) ? val : d.toLocaleDateString("id-ID")}
            </Text>
          );
        },
      },
      {
        accessorKey: "scheduledDate",
        header: "CAB DATE",
        cell: (info) => {
          const val = info.getValue() as string | null | undefined;
          if (!val) {
            return <Text fontSize="sm" color="gray.400" textAlign="center">-</Text>;
          }
          const d = new Date(val);
          if (isNaN(d.getTime())) {
            return <Text fontSize="sm" color="gray.400" textAlign="center">-</Text>;
          }
          const dateStr = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const timeStr = val.includes("T") ? ` ${val.slice(11, 16)} WIB` : "";
          return (
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="medium" color="blue.600">
                {dateStr}
              </Text>
              {timeStr && (
                <Text fontSize="2xs" color="gray.500">
                  {timeStr}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: (info) => <StatusBadge status={info.getValue() as string} rounded="full" px={3} py={1} fontSize="xs" />,
      },
      {
        id: "actions",
        header: "ACTION",
        cell: (info) => (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => router.push(`/cab/cab-request/detail?id=${info.row.original.id}`)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [router, pagination]
  );

  const table = useReactTable({
    data: cabListOnly,
    columns,
    state: { globalFilter, pagination },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeFilter = String(filterValue || "").toLowerCase();
      if (!safeFilter) return true;
      const original = row.original;
      return (
        String(original.requestNo || "").toLowerCase().includes(safeFilter) ||
        String(original.requestTitle || "").toLowerCase().includes(safeFilter) ||
        String(original.projectName || "").toLowerCase().includes(safeFilter) ||
        String(original.requesterName || "").toLowerCase().includes(safeFilter) ||
        String(original.status || "").toLowerCase().includes(safeFilter) ||
        String(original.requestType || "").toLowerCase().includes(safeFilter)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  // Pending Table columns (Status REQUEST only)
  const pendingColumns = useMemo<ColumnDef<CabRequestItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }: { table: any }) => {
          const selectableRows = table.getRowModel().rows;
          const isAllSelected =
            selectableRows.length > 0 &&
            selectableRows.every((r: any) => r.getIsSelected());
          const isSomeSelected =
            selectableRows.some((r: any) => r.getIsSelected()) && !isAllSelected;

          return (
            <Flex justify="center" align="center" px={1}>
              <Tooltip
                label={isAllSelected ? "Batal pilih semua" : "Pilih semua permohonan"}
                placement="top"
              >
                <Checkbox
                  colorScheme="blue"
                  isChecked={isAllSelected}
                  isIndeterminate={isSomeSelected}
                  isDisabled={selectableRows.length === 0}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newSelection = { ...rowSelection };
                    selectableRows.forEach((r: any) => {
                      if (checked) {
                        newSelection[r.id] = true;
                      } else {
                        delete newSelection[r.id];
                      }
                    });
                    setRowSelection(newSelection);
                  }}
                />
              </Tooltip>
            </Flex>
          );
        },
        cell: ({ row }: { row: any }) => (
          <Flex justify="center" align="center" px={1}>
            <Checkbox
              colorScheme="blue"
              isChecked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </Flex>
        ),
      },
      {
        id: "rowNumber",
        header: "NO.",
        cell: (info) => (
          <Text fontSize="sm" textAlign="center">
            {info.row.index + 1 + pendingPagination.pageIndex * pendingPagination.pageSize}.
          </Text>
        ),
      },
      {
        accessorKey: "requestNo",
        header: "REQUEST NO",
        cell: (info) => (
          <Text fontSize="sm" fontWeight="semibold" color="secondary.600">
            {info.getValue() as string}
          </Text>
        ),
      },
      {
        accessorKey: "requestTitle",
        header: "TITLE",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
              {info.getValue() as string}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {info.row.original.projectName}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "requestType",
        header: "TYPE",
        cell: (info) => (
          <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">
            {info.getValue() as string}
          </Badge>
        ),
      },
      {
        accessorKey: "requesterName",
        header: "REQUESTER",
        cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: "requestDate",
        header: "REQ DATE",
        cell: (info) => {
          const val = info.getValue() as string | null | undefined;
          if (!val) return <Text fontSize="sm" color="gray.400">-</Text>;
          const d = new Date(val);
          return (
            <Text fontSize="sm">
              {isNaN(d.getTime()) ? val : d.toLocaleDateString("id-ID")}
            </Text>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: (info) => <StatusBadge status={info.getValue() as string} rounded="full" px={3} py={1} fontSize="xs" />,
      },
      {
        id: "actions",
        header: "ACTION",
        cell: (info) => (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => router.push(`/cab/cab-request/detail?id=${info.row.original.id}`)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [router, pendingPagination, rowSelection]
  );

  const pendingTable = useReactTable({
    data: pendingRequestsList,
    columns: pendingColumns,
    state: { globalFilter: pendingGlobalFilter, pagination: pendingPagination, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    onPaginationChange: setPendingPagination,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeFilter = String(filterValue || "").toLowerCase();
      if (!safeFilter) return true;
      const original = row.original;
      return (
        String(original.requestNo || "").toLowerCase().includes(safeFilter) ||
        String(original.requestTitle || "").toLowerCase().includes(safeFilter) ||
        String(original.projectName || "").toLowerCase().includes(safeFilter) ||
        String(original.requesterName || "").toLowerCase().includes(safeFilter) ||
        String(original.status || "").toLowerCase().includes(safeFilter) ||
        String(original.requestType || "").toLowerCase().includes(safeFilter)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setPendingGlobalFilter,
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Change Advisory Board Request" breadCrumb={["CAB", "CAB Request"]} />

      {/* ─── Role Switcher ─── */}
      <Box mx={{ base: 4, sm: 5, md: 6 }} mt={3} mb={2}>
        <Card rounded="lg" shadow="sm" border="1px" borderColor="purple.200" bg={colorMode === "light" ? "purple.50" : "gray.800"} p={3}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Icon as={FiShield} color="purple.500" />
              <Text fontSize="xs" fontWeight="bold" color="purple.700">MOCK ROLE SWITCHER</Text>
            </HStack>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button leftIcon={<FiUser />} colorScheme={mockRole === "maker" ? "blue" : "gray"} variant={mockRole === "maker" ? "solid" : "outline"} onClick={() => setMockRole("maker")}>Maker</Button>
              <Button leftIcon={<FiUsers />} colorScheme={mockRole === "scheduler" ? "green" : "gray"} variant={mockRole === "scheduler" ? "solid" : "outline"} onClick={() => setMockRole("scheduler")}>Scheduler</Button>
              <Button leftIcon={<FiCheckCircle />} colorScheme={mockRole === "approver" ? "orange" : "gray"} variant={mockRole === "approver" ? "solid" : "outline"} onClick={() => setMockRole("approver")}>Approver</Button>
            </ButtonGroup>
          </Flex>
        </Card>
      </Box>

      {/* ─── Main Content ─── */}
      <Box px={{ base: 4, sm: 5, md: 6 }} w="full">
        <Card
          rounded={radiusStyle}
          shadow="lg"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
          w="full"
          minH="400px"
        >
          <CardBody p={{ base: 4, sm: 5, md: 6 }}>
            <VStack spacing={5} w="full">

              {/* Header Row */}
              <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="secondary.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <Icon as={FiFileText} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>List Request</Heading>
                    <Text fontSize="sm" color="gray.500">{DataList.length} total requests • {DataCalendar.length} scheduled</Text>
                  </VStack>
                </HStack>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiRefreshCcw />} onClick={RefreshAction} isLoading={IsLoadingProcess}>Refresh</Button>
                  {canMake && (
                    <Button size="sm" colorScheme="secondary" leftIcon={<FiPlusSquare />} onClick={categoryModal.onOpen}>
                      Request
                    </Button>
                  )}
                </HStack>
              </Flex>

              <Divider />

              {/* Tabs: Table + Pending Requests + Calendar + Reports */}
              <Tabs variant="unstyled" w="full" size="sm" isLazy>
                <AppTabList mb={2}>
                  <AppTabItem icon={FiList} label="CAB List" />
                  {canSchedule && (
                    <AppTabItem
                      icon={FiClock}
                      label="CAB Request"
                      badge={incomingRequestCount ?? pendingRequestsList.length}
                      badgeColorScheme="red"
                    />
                  )}
                  <AppTabItem icon={FiCalendar} label="Schedule Calendar" />
                  {(canSchedule || canApprove) && (
                    <AppTabItem
                      icon={FiFileText}
                      label="CAB Reports"
                      badge={
                        DataList.filter(
                          (i) =>
                            i.isCabDone === "Y" ||
                            ["IMPLEMENT", "WAITING APPROVAL", "COMPLETED"].includes(
                              String(i.status).toUpperCase()
                            )
                        ).length || undefined
                      }
                      badgeColorScheme="green"
                    />
                  )}
                </AppTabList>

                <TabPanels>
                  {/* ─── Tab 1: All CAB List (Excludes REQUEST) ─── */}
                  <TabPanel px={0} pt={4}>
                    {IsLoadingProcess ? (
                      <VStack spacing={4} py={16}>
                        <LoadingMiniSignature />
                        <Text color="gray.500" fontWeight="medium">Loading requests...</Text>
                      </VStack>
                    ) : cabListOnly.length === 0 ? (
                      <VStack spacing={6} py={20}>
                        <Box w={20} h={20} bg={colorMode === "light" ? "gray.100" : "gray.700"} rounded="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={FiFolder} boxSize={10} color="gray.400" />
                        </Box>
                        <VStack spacing={2}>
                          <Heading size="md" color="gray.500">No CAB List Found</Heading>
                          <Text color="gray.400" fontSize="sm" textAlign="center" maxW="400px">
                            Belum ada permohonan CAB yang telah dijadwalkan atau diproses.
                          </Text>
                        </VStack>
                      </VStack>
                    ) : (
                      <Box w="full">
                        <Box w="full" overflowX="auto">
                          <Box minW="1100px">
                            <TableComponentFull table={table} />
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </TabPanel>

                  {/* ─── Tab 2: Pending Requests (Status REQUEST Only - Scheduler Only) ─── */}
                  {canSchedule && (
                    <TabPanel px={0} pt={4}>
                      {IsLoadingProcess ? (
                        <VStack spacing={4} py={16}>
                          <LoadingMiniSignature />
                          <Text color="gray.500" fontWeight="medium">Loading pending requests...</Text>
                        </VStack>
                      ) : pendingRequestsList.length === 0 ? (
                        <VStack spacing={6} py={20}>
                          <Box w={20} h={20} bg={colorMode === "light" ? "blue.50" : "gray.700"} rounded="full" display="flex" alignItems="center" justifyContent="center">
                            <Icon as={FiCheckCircle} boxSize={10} color="blue.500" />
                          </Box>
                          <VStack spacing={2}>
                            <Heading size="md" color="gray.500">Semua Permohonan Terjadwal</Heading>
                            <Text color="gray.400" fontSize="sm" textAlign="center" maxW="420px">
                              Saat ini tidak ada permohonan berstatus <b>REQUEST</b> yang menunggu penjadwalan sidang CAB.
                            </Text>
                          </VStack>
                        </VStack>
                      ) : (
                        <Box w="full" position="relative">
                          <Box w="full" overflowX="auto">
                            <Box minW="1100px">
                              <TableComponentFull table={pendingTable} />
                            </Box>
                          </Box>

                          {/* Floating Bulk Action Bar */}
                          {selectedRequestsList.length > 0 && (
                            <Box
                              position="sticky"
                              bottom={4}
                              zIndex={20}
                              mt={4}
                              mx="auto"
                              maxW="680px"
                              w="full"
                              boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                              rounded="xl"
                              overflow="hidden"
                            >
                              <Box
                                p={3}
                                bg={isDark ? "gray.850" : "white"}
                                border="1.5px solid"
                                borderColor={isDark ? "blue.600" : "blue.400"}
                                rounded="xl"
                                backdropFilter="blur(8px)"
                              >
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  wrap="wrap"
                                  gap={3}
                                >
                                  <HStack spacing={3}>
                                    <Box
                                      w={9}
                                      h={9}
                                      rounded="lg"
                                      bg="blue.500"
                                      color="white"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      flexShrink={0}
                                    >
                                      <Icon as={FiLayers} boxSize={4} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <HStack spacing={1.5}>
                                        <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                                          {selectedRequestsList.length} Permohonan Terpilih
                                        </Text>
                                        <Badge colorScheme="blue" variant="solid" fontSize="3xs" rounded="full" px={2}>
                                          Siap Dijadwalkan
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="2xs" color="gray.500">
                                        Pilih tanggal & waktu sidang CAB serentak atau berurutan.
                                      </Text>
                                    </VStack>
                                  </HStack>

                                  <HStack spacing={2}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      fontSize="xs"
                                      onClick={() => setRowSelection({})}
                                    >
                                      Batal Pilihan
                                    </Button>
                                    <Button
                                      size="sm"
                                      colorScheme="blue"
                                      leftIcon={<FiCalendar />}
                                      fontWeight="bold"
                                      fontSize="xs"
                                      px={4}
                                      onClick={() => {
                                        setBulkModalTargetRequests(selectedRequestsList);
                                        setBulkModalInitialDate("");
                                        bulkScheduleModal.onOpen();
                                      }}
                                    >
                                      Schedule Chosen({selectedRequestsList.length}) ➔
                                    </Button>
                                  </HStack>
                                </Flex>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </TabPanel>
                  )}

                  {/* ─── Tab 3: Calendar ─── */}
                  <TabPanel px={0} pt={4}>
                    {IsLoadingProcess ? (
                      <Flex justify="center" py={16}><LoadingMiniSignature /></Flex>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {/* Unscheduled inline notice + Quick Action */}
                        {unscheduledCount > 0 && (
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack
                              spacing={2}
                              px={3}
                              py={1.5}
                              bg={isDark ? "orange.950" : "orange.50"}
                              border="1px solid"
                              borderColor={isDark ? "orange.800" : "orange.200"}
                              rounded="full"
                            >
                              <Box w="6px" h="6px" rounded="full" bg="orange.500" flexShrink={0} />
                              <Text fontSize="xs" color={isDark ? "orange.300" : "orange.800"} fontWeight="medium">
                                {unscheduledCount} permohonan belum dijadwalkan
                              </Text>
                            </HStack>

                            {canSchedule && (
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="solid"
                                leftIcon={<FiCalendar />}
                                onClick={handleOpenBulkForUnscheduled}
                              >
                                Jadwalkan {unscheduledCount} Permohonan Tertunda
                              </Button>
                            )}
                          </Flex>
                        )}

                        {/* Date Range & View Control Filter Bar */}
                        <Flex
                          justify="space-between"
                          align="center"
                          wrap="wrap"
                          gap={3}
                          p={2.5}
                          bg={isDark ? "gray.750" : "gray.50"}
                          border="1px solid"
                          borderColor={isDark ? "gray.700" : "gray.200"}
                          rounded="lg"
                        >
                          {/* Left: View Switcher (Month/Week) + Quick presets */}
                          <HStack spacing={3} wrap="wrap">
                            <ButtonGroup size="xs" isAttached variant="outline">
                              <Button
                                variant={calendarViewMode === "dayGridMonth" ? "solid" : "outline"}
                                colorScheme={calendarViewMode === "dayGridMonth" ? "blue" : "gray"}
                                onClick={() => handleViewChange("dayGridMonth")}
                              >
                                Month
                              </Button>
                              <Button
                                variant={calendarViewMode === "timeGridWeek" ? "solid" : "outline"}
                                colorScheme={calendarViewMode === "timeGridWeek" ? "blue" : "gray"}
                                onClick={() => handleViewChange("timeGridWeek")}
                              >
                                Week
                              </Button>
                            </ButtonGroup>

                            <HStack spacing={1.5} wrap="wrap">
                              {(["Today", "This Week", "This Month"] as const).map((preset) => (
                                <Button
                                  key={preset}
                                  size="xs"
                                  rounded="full"
                                  variant={activeQuickFilter === preset ? "solid" : "ghost"}
                                  colorScheme={activeQuickFilter === preset ? "blue" : "gray"}
                                  onClick={() => handleQuickFilter(preset)}
                                >
                                  {preset}
                                </Button>
                              ))}
                            </HStack>
                          </HStack>

                          {/* Right: Date Range Inputs + Apply / Reset */}
                          <HStack spacing={2} wrap="wrap">
                            <Input
                              type="date"
                              size="xs"
                              rounded="md"
                              w="135px"
                              value={calendarDateFrom}
                              onChange={(e) => setCalendarDateFrom(e.target.value)}
                              bg={isDark ? "gray.800" : "white"}
                              borderColor={isDark ? "gray.600" : "gray.300"}
                            />
                            <Text fontSize="xs" color="gray.500">
                              s/d
                            </Text>
                            <Input
                              type="date"
                              size="xs"
                              rounded="md"
                              w="135px"
                              value={calendarDateTo}
                              onChange={(e) => setCalendarDateTo(e.target.value)}
                              bg={isDark ? "gray.800" : "white"}
                              borderColor={isDark ? "gray.600" : "gray.300"}
                            />
                            <Button
                              size="xs"
                              colorScheme="blue"
                              rounded="md"
                              leftIcon={<FiCalendar />}
                              onClick={handleApplyDateRange}
                              isDisabled={!calendarDateFrom}
                            >
                              Terapkan
                            </Button>
                            {(calendarDateFrom || calendarDateTo || activeQuickFilter !== "This Month") && (
                              <Button
                                size="xs"
                                variant="ghost"
                                rounded="md"
                                leftIcon={<FiRotateCcw />}
                                onClick={handleResetDateRange}
                              >
                                Reset
                              </Button>
                            )}
                          </HStack>
                        </Flex>

                        {/* Split 75% Calendar + 25% Upcoming Summary Panel */}
                        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={4} alignItems="start">
                          {/* Left Column (75% width) — Calendar */}
                          <GridItem colSpan={{ base: 12, lg: 9 }}>
                            <Box
                              sx={{
                                ".fc": { fontFamily: "inherit", fontSize: "sm" },
                                // Clean Linear/Notion-like Header Toolbar
                                ".fc-header-toolbar": {
                                  marginBottom: "14px !important",
                                  padding: "0 2px !important",
                                  alignItems: "center !important",
                                },
                                ".fc-toolbar-title": {
                                  fontSize: "1.125rem !important",
                                  fontWeight: "700 !important",
                                  color: isDark ? "#F8FAFC !important" : "#0F172A !important",
                                  letterSpacing: "-0.01em !important",
                                },
                                ".fc-button": {
                                  fontSize: "0.75rem !important",
                                  fontWeight: "600 !important",
                                  textTransform: "capitalize !important",
                                  padding: "5px 12px !important",
                                  borderRadius: "6px !important",
                                  backgroundColor: isDark ? "#1E293B !important" : "#FFFFFF !important",
                                  borderColor: isDark ? "#334155 !important" : "#CBD5E1 !important",
                                  color: isDark ? "#E2E8F0 !important" : "#334155 !important",
                                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05) !important",
                                  transition: "all 0.15s ease !important",
                                },
                                ".fc-button:hover": {
                                  backgroundColor: isDark ? "#334155 !important" : "#F8FAFC !important",
                                  borderColor: isDark ? "#475569 !important" : "#94A3B8 !important",
                                  color: isDark ? "#FFFFFF !important" : "#0F172A !important",
                                },
                                ".fc-button-active, .fc-button:active": {
                                  backgroundColor: "#2563EB !important",
                                  borderColor: "#2563EB !important",
                                  color: "#FFFFFF !important",
                                  boxShadow: "none !important",
                                },
                                ".fc-button:disabled": {
                                  opacity: "0.4 !important",
                                },
                                // Day Column Headers (Clear separation)
                                ".fc-col-header-cell": {
                                  backgroundColor: isDark ? "#1E293B !important" : "#F1F5F9 !important",
                                  borderColor: isDark ? "#334155 !important" : "#E2E8F0 !important",
                                  padding: "8px 0 !important",
                                },
                                ".fc-col-header-cell-cushion": {
                                  fontSize: "11px !important",
                                  fontWeight: "700 !important",
                                  textTransform: "uppercase !important",
                                  letterSpacing: "0.06em !important",
                                  color: isDark ? "#94A3B8 !important" : "#475569 !important",
                                  textDecoration: "none !important",
                                  padding: "0 !important",
                                },
                                // Weekend Headers (Always Red)
                                ".fc-col-header-cell.fc-day-sat, .fc-col-header-cell.fc-day-sun": {
                                  backgroundColor: isDark ? "#3B1818 !important" : "#FEE2E2 !important",
                                  borderColor: isDark ? "#7F1D1D !important" : "#FECACA !important",
                                },
                                ".fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion, .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion": {
                                  color: isDark ? "#F87171 !important" : "#DC2626 !important",
                                  fontWeight: "800 !important",
                                },
                                // Weekday Day Cells & Hover Affordance
                                ".fc-daygrid-day": {
                                  backgroundColor: isDark ? "#1A202C" : "#FFFFFF",
                                  transition: "background-color 0.15s ease",
                                },
                                ".fc-daygrid-day:hover": {
                                  backgroundColor: isDark ? "#222C3A !important" : "#F8FAFC !important",
                                  cursor: "pointer",
                                },
                                ".fc-daygrid-day-number": {
                                  color: isDark ? "#E2E8F0" : "#334155",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  padding: "4px 8px !important",
                                  textDecoration: "none !important",
                                },
                                // Weekend Column Differentiation
                                ".fc-day-sat, .fc-day-sun": {
                                  backgroundColor: isDark ? "#141A23 !important" : "#FFF5F5 !important",
                                },
                                ".fc-day-sat:hover, .fc-day-sun:hover": {
                                  backgroundColor: isDark ? "#1F1818 !important" : "#FEE2E2 !important",
                                },
                                ".fc-day-sat .fc-daygrid-day-number, .fc-day-sun .fc-daygrid-day-number": {
                                  color: isDark ? "#F87171 !important" : "#E53E3E !important",
                                  fontWeight: "600",
                                },
                                // Today's Date Highlight (Top border + pill badge)
                                ".fc-day-today": {
                                  backgroundColor: isDark ? "#1E293B !important" : "#EFF6FF !important",
                                  borderTop: "3px solid #2563EB !important",
                                },
                                ".fc-day-today:hover": {
                                  backgroundColor: isDark ? "#243248 !important" : "#E0F2FE !important",
                                },
                                ".fc-day-today .fc-daygrid-day-number": {
                                  backgroundColor: "#2563EB !important",
                                  color: "#FFFFFF !important",
                                  borderRadius: "9999px !important",
                                  minWidth: "24px !important",
                                  height: "24px !important",
                                  display: "inline-flex !important",
                                  alignItems: "center !important",
                                  justifyContent: "center !important",
                                  fontWeight: "700 !important",
                                  margin: "3px !important",
                                  padding: "0 6px !important",
                                },
                                ".fc-col-header-cell.fc-day-today": {
                                  backgroundColor: isDark ? "#1E3A8A !important" : "#BFDBFE !important",
                                },
                                ".fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion": {
                                  color: isDark ? "#EFF6FF !important" : "#1E40AF !important",
                                  fontWeight: "800 !important",
                                },
                                // Grid Borders
                                ".fc-scrollgrid": { borderColor: isDark ? "#334155 !important" : "#E2E8F0 !important" },
                                ".fc-scrollgrid td, .fc-scrollgrid th": { borderColor: isDark ? "#334155 !important" : "#E2E8F0 !important" },
                                ".fc-timegrid-slot": { backgroundColor: isDark ? "#1A202C" : "white" },
                                ".fc-timegrid-slot-label": { color: isDark ? "#A0AEC0" : "#475569", fontWeight: "500" },
                                // Events Container
                                ".fc-event": {
                                  cursor: "pointer",
                                  background: "transparent !important",
                                  border: "none !important",
                                  padding: "1px 2px !important",
                                  margin: "1px 0 !important",
                                },
                                ".fc-daygrid-event": { whiteSpace: "normal" },
                                // "+N more" Overflow Pill Button
                                ".fc-more-link": {
                                  display: "inline-flex !important",
                                  alignItems: "center !important",
                                  justifyContent: "center !important",
                                  padding: "2px 8px !important",
                                  borderRadius: "9999px !important",
                                  fontSize: "11px !important",
                                  fontWeight: "600 !important",
                                  backgroundColor: isDark ? "#2D3748 !important" : "#F1F5F9 !important",
                                  color: isDark ? "#90CDF4 !important" : "#2563EB !important",
                                  border: isDark ? "1px solid #4A5568 !important" : "1px solid #CBD5E1 !important",
                                  transition: "all 0.15s ease !important",
                                  margin: "2px 4px !important",
                                  textDecoration: "none !important",
                                },
                                ".fc-more-link:hover": {
                                  backgroundColor: "#2563EB !important",
                                  color: "#FFFFFF !important",
                                  borderColor: "#2563EB !important",
                                  textDecoration: "none !important",
                                },
                                // Overflow Popover
                                ".fc-popover": {
                                  backgroundColor: isDark ? "#1E293B !important" : "#FFFFFF !important",
                                  borderColor: isDark ? "#334155 !important" : "#E2E8F0 !important",
                                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important",
                                  borderRadius: "8px !important",
                                  overflow: "hidden",
                                },
                                ".fc-popover-header": {
                                  backgroundColor: isDark ? "#2D3748 !important" : "#F8FAFC !important",
                                  color: isDark ? "#F8FAFC !important" : "#0F172A !important",
                                  padding: "8px 12px !important",
                                  fontWeight: "700",
                                  fontSize: "12px",
                                  borderBottom: isDark ? "1px solid #334155 !important" : "1px solid #E2E8F0 !important",
                                },
                              }}
                            >
                              <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                  left: "prev,next today",
                                  center: "title",
                                  right: "",
                                }}
                                eventTimeFormat={{
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                  meridiem: false,
                                }}
                                slotLabelFormat={{
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }}
                                events={calendarEvents}
                                eventClick={handleEventClick}
                                dateClick={(info) => handleCalendarDateClick(info.dateStr)}
                                eventContent={renderEventContent}
                                height="auto"
                                contentHeight={560}
                                dayMaxEvents={3}
                              />
                            </Box>
                          </GridItem>

                          {/* Right Column (25% width) — Upcoming Summary Panel */}
                          <GridItem colSpan={{ base: 12, lg: 3 }}>
                            <UpcomingSummaryPanel
                              upcomingData={upcomingEventsData}
                              isDark={isDark}
                              onNavigate={(id) => router.push(`/cab/cab-request/detail?id=${id}`)}
                            />
                          </GridItem>
                        </Grid>
                      </VStack>
                    )}
                  </TabPanel>

                  {/* ─── Tab 3: CAB Reports (Scheduler & Approver only) ─── */}
                  {(canSchedule || canApprove) && (
                    <TabPanel px={0} pt={4}>
                      <CabReportsTab items={DataList} onRefresh={RefreshAction} />
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>

            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* ─── Event Detail Modal ─── */}
      <Modal isOpen={eventModal.isOpen} onClose={eventModal.onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader fontSize="md" pb={2}>
            <HStack spacing={2}><Icon as={FiFileText} color="secondary.500" /><Text>CAB Request</Text></HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={5}>
            {SelectedEvent && (
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" color="secondary.600">{SelectedEvent.requestNo}</Text>
                  <StatusBadge status={SelectedEvent.status} rounded="full" px={2} fontSize="xs" />
                </HStack>
                <Text fontSize="sm" fontWeight="medium">{SelectedEvent.requestTitle}</Text>
                <Divider />
                <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Project</Text><Text fontSize="xs" fontWeight="medium">{SelectedEvent.projectName}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Type</Text><Badge colorScheme="purple" variant="subtle" fontSize="2xs" rounded="full" px={2}>{SelectedEvent.requestType}</Badge></HStack>
                <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Requester</Text><Text fontSize="xs">{SelectedEvent.requesterName}</Text></HStack>
                <Divider />
                <Button colorScheme="blue" size="sm" leftIcon={<FiEye />} onClick={() => { eventModal.onClose(); router.push(`/cab/cab-request/detail?id=${SelectedEvent.id}`); }}>
                  Open Detail
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ─── Category Selection Modal (BRD/RFC style) ─── */}
      <Modal isOpen={categoryModal.isOpen} onClose={categoryModal.onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent rounded={radiusStyle} bgColor={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader pb={4}>
            <Heading as="h4" size="md">Pilih Kategori CAB Request</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6} px={6}>
            <HStack spacing={0} w="full">
              {/* SOFTWARE Button */}
              <Button
                onClick={() => { categoryModal.onClose(); router.push("/cab/cab-request/create?category=SOFTWARE"); }}
                flex={1}
                h="140px"
                bg={colorMode === "light" ? "white" : "gray.700"}
                border="2px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                borderRightWidth="1px"
                roundedLeft={radiusStyle}
                roundedRight="none"
                flexDirection="column"
                gap={3}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  bg: "secondary.500",
                  borderColor: "secondary.500",
                  transform: "translateY(-4px)",
                  boxShadow: "0 0 20px 8px rgba(0, 119, 254, 0.4), 0 0 40px 12px rgba(0, 119, 254, 0.2), 0 0 60px 16px rgba(0, 119, 254, 0.1)",
                  "& > *": { color: "white" },
                }}
                _active={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 15px 6px rgba(0, 119, 254, 0.3), 0 0 30px 10px rgba(0, 119, 254, 0.15)",
                }}
              >
                <Icon as={FiMonitor} boxSize={8} color={colorMode === "light" ? "gray.600" : "white"} />
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "white"}>
                  Software
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
                  Deployment, Config, Migrasi DB
                </Text>
              </Button>

              {/* HARDWARE Button */}
              <Button
                onClick={() => { categoryModal.onClose(); router.push("/cab/cab-request/create?category=HARDWARE"); }}
                flex={1}
                h="140px"
                bg={colorMode === "light" ? "white" : "gray.700"}
                border="2px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                borderLeftWidth="1px"
                roundedRight={radiusStyle}
                roundedLeft="none"
                flexDirection="column"
                gap={3}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  bg: "purple.500",
                  borderColor: "purple.500",
                  transform: "translateY(-4px)",
                  boxShadow: "0 0 20px 8px rgba(128, 90, 213, 0.4), 0 0 40px 12px rgba(128, 90, 213, 0.2), 0 0 60px 16px rgba(128, 90, 213, 0.1)",
                  "& > *": { color: "white" },
                }}
                _active={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 15px 6px rgba(128, 90, 213, 0.3), 0 0 30px 10px rgba(128, 90, 213, 0.15)",
                }}
              >
                <Icon as={FiCpu} boxSize={8} color={colorMode === "light" ? "gray.600" : "white"} />
                <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "white"}>
                  Hardware
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
                  Upgrade, Server, Infrastruktur
                </Text>
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ─── Bulk Schedule Modal ─── */}
      <BulkScheduleModal
        isOpen={bulkScheduleModal.isOpen}
        onClose={bulkScheduleModal.onClose}
        selectedRequests={bulkModalTargetRequests}
        initialDate={bulkModalInitialDate}
        onConfirmSchedule={handleConfirmBulkSchedule}
        isLoading={loading}
      />
    </LayoutAdmin>
  );
};

export default CabRequestView;
