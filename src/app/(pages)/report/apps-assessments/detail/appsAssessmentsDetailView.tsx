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
import { useDownloadManagerModal } from "@/app/context/DownloadManagerContext";
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
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
  Progress,
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
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiInfo,
  FiLayers,
  FiLock,
  FiPlusCircle,
  FiRefreshCw,
  FiShield,
  FiSkipForward,
  FiX,
  FiZap,
} from "react-icons/fi";
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
  const { requestExport, openDownloadManager, activeJobsCount } =
    useDownloadManagerModal();
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
  const [filterQuick, setFilterQuick] = useState<
    | "ALL"
    | "ACTIVE"
    | "SKIPPED"
    | "RTO_UNFILLED"
    | "RPO_UNFILLED"
    | "REVIEW_PENDING"
    | "REVIEW_DONE"
    | "APPROVED"
    | "IN_APPROVAL"
  >("ALL");

  // Computed batch quick statistics
  const stats = useMemo(() => {
    const all = batchData?.assessments || [];
    const scoped = filterGroup
      ? all.filter((a) => a.appManageByGroupId === filterGroup)
      : all;
    const total = scoped.length;

    const skipped = scoped.filter((a) => a.isSkipReview === "TRUE").length;
    const skippedPct = total > 0 ? Math.round((skipped / total) * 100) : 0;
    const active = total - skipped;

    // RTO Suggestion progression:
    const rtoFilled = scoped.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        a.appsRtoSuggestionMinutes !== null &&
        a.appsRtoSuggestionMinutes > 0,
    ).length;
    const rtoUnfilled = scoped.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        (!a.appsRtoSuggestionMinutes || a.appsRtoSuggestionMinutes <= 0),
    ).length;
    const rtoSatisfied = rtoFilled + skipped;
    const rtoProgressPct =
      total > 0 ? Math.round((rtoSatisfied / total) * 100) : 0;

    // RPO Target progression:
    const rpoFilled = scoped.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        a.appsRpoMinutes !== null &&
        a.appsRpoMinutes > 0,
    ).length;
    const rpoUnfilled = scoped.filter(
      (a) =>
        a.isSkipReview !== "TRUE" &&
        (!a.appsRpoMinutes || a.appsRpoMinutes <= 0),
    ).length;
    const rpoSatisfied = rpoFilled + skipped;
    const rpoProgressPct =
      total > 0 ? Math.round((rpoSatisfied / total) * 100) : 0;

    // Criteria Review progression:
    const fullyReviewed = scoped.filter(
      (a) => a.isSkipReview !== "TRUE" && a.isFullyReviewed,
    ).length;
    const reviewPending = scoped.filter(
      (a) => a.isSkipReview !== "TRUE" && !a.isFullyReviewed,
    ).length;
    const reviewSatisfied = fullyReviewed + skipped;
    const reviewProgressPct =
      total > 0 ? Math.round((reviewSatisfied / total) * 100) : 0;

    // Approval progression:
    const approved = scoped.filter((a) => a.statusReport === "APPROVED").length;
    const inApproval = scoped.filter(
      (a) =>
        a.statusReport === "WAITING APPROVAL 1" ||
        a.statusReport === "WAITING APPROVAL 2",
    ).length;
    const draftOrRevise = scoped.filter(
      (a) =>
        a.statusReport === "DRAFT" ||
        a.statusReport === "DECLINE" ||
        a.statusReport === "REVISE",
    ).length;
    const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      total,
      active,
      skipped,
      skippedPct,
      rtoFilled,
      rtoUnfilled,
      rtoSatisfied,
      rtoProgressPct,
      rpoFilled,
      rpoUnfilled,
      rpoSatisfied,
      rpoProgressPct,
      fullyReviewed,
      reviewPending,
      reviewSatisfied,
      reviewProgressPct,
      approved,
      inApproval,
      draftOrRevise,
      approvedPct,
    };
  }, [batchData, filterGroup]);

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

      // Quick filter
      if (filterQuick === "ACTIVE" && a.isSkipReview === "TRUE") return false;
      if (filterQuick === "SKIPPED" && a.isSkipReview !== "TRUE") return false;
      if (
        filterQuick === "RTO_UNFILLED" &&
        (a.isSkipReview === "TRUE" ||
          (a.appsRtoSuggestionMinutes !== null &&
            a.appsRtoSuggestionMinutes > 0))
      )
        return false;
      if (
        filterQuick === "RPO_UNFILLED" &&
        (a.isSkipReview === "TRUE" ||
          (a.appsRpoMinutes !== null && a.appsRpoMinutes > 0))
      )
        return false;
      if (
        filterQuick === "REVIEW_PENDING" &&
        (a.isSkipReview === "TRUE" || a.isFullyReviewed)
      )
        return false;
      if (filterQuick === "REVIEW_DONE" && !a.isFullyReviewed) return false;
      if (filterQuick === "APPROVED" && a.statusReport !== "APPROVED")
        return false;
      if (
        filterQuick === "IN_APPROVAL" &&
        !(
          a.statusReport === "WAITING APPROVAL 1" ||
          a.statusReport === "WAITING APPROVAL 2"
        )
      )
        return false;

      return true;
    });
  }, [batchData, search, filterGroup, filterStatus, filterReview, filterQuick]);

  const clearFilters = () => {
    setSearch("");
    // Only clear group filter if not locked
    if (!isGroupLocked) setFilterGroup("");
    setFilterStatus("");
    setFilterReview("");
    setFilterQuick("ALL");
  };

  const handleExport = async (exportType: "XLSX" | "PDF") => {
    if (!batchData) return;
    setExportLoading(true);
    try {
      await requestExport({
        moduleName: "APPS_ASSESSMENT_BATCH_DETAIL",
        exportType: exportType,
        reportTitle: `Apps Assessment Report - ${batchData.batchCode} (${batchData.quartalReport} ${batchData.yearReport})`,
        filterParams: {
          batchCode: batchData.batchCode,
          search,
          filterGroup,
          filterStatus,
          filterReview,
          filterQuick,
        },
      });
    } catch (e) {
      console.error(e);
      showToast({
        description: `Failed to initiate ${exportType} export`,
        statusToast: "error",
      });
    } finally {
      setExportLoading(false);
    }
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
                  {/* Download Manager button */}
                  <Button
                    size="sm"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    leftIcon={<FiDownload />}
                    onClick={openDownloadManager}
                  >
                    Download Manager
                    {activeJobsCount > 0 && (
                      <Badge colorScheme="blue" rounded="full" ml={2} px={1.5}>
                        {activeJobsCount}
                      </Badge>
                    )}
                  </Button>
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
                    isDisabled={!batchData}
                    onClick={() => handleExport("XLSX")}
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
                    isDisabled={!batchData}
                    onClick={() => handleExport("PDF")}
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
                      isDisabled={
                        batchData?.statusReport === "APPROVED" ||
                        isFetchingUnassigned
                      }
                      title={
                        batchData?.statusReport === "APPROVED"
                          ? "Batch has already been approved / completed — adding new apps is closed"
                          : undefined
                      }
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

          {/* Quick Stats Metric Cards */}
          {batchData && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing={3.5}>
              {/* Card 1: Total Applications */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "ACTIVE"
                    ? "blue.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Total Systems
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "blue.900" : "blue.50"}
                      color={isDark ? "blue.300" : "blue.500"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiLayers} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" gap={1.5}>
                    <Heading size="md" color={isDark ? "white" : "gray.800"}>
                      {stats.total}
                    </Heading>
                    <Text fontSize="2xs" color="gray.400">
                      applications
                    </Text>
                  </Flex>

                  <HStack spacing={1.5} wrap="wrap" pt={0.5}>
                    <Badge
                      colorScheme="green"
                      variant={filterQuick === "ACTIVE" ? "solid" : "subtle"}
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() =>
                        setFilterQuick(
                          filterQuick === "ACTIVE" ? "ALL" : "ACTIVE",
                        )
                      }
                      title="Filter active apps needing review"
                    >
                      {stats.active} Active
                    </Badge>
                  </HStack>
                </VStack>
              </Card>

              {/* Card 2: Dedicated Skipped Review */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "SKIPPED"
                    ? "purple.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Skipped Review
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "purple.900" : "purple.50"}
                      color={isDark ? "purple.300" : "purple.500"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiSkipForward} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" justify="space-between">
                    <Heading size="md" color={isDark ? "white" : "gray.800"}>
                      {stats.skipped}
                    </Heading>
                    <Badge
                      colorScheme="purple"
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                    >
                      {stats.skippedPct}%
                    </Badge>
                  </Flex>

                  <Progress
                    value={stats.skippedPct}
                    size="xs"
                    colorScheme="purple"
                    borderRadius="full"
                  />

                  <Flex justify="space-between" align="center" fontSize="2xs">
                    <Badge
                      colorScheme="purple"
                      variant={filterQuick === "SKIPPED" ? "solid" : "subtle"}
                      fontSize="2xs"
                      px={1.5}
                      py={0.2}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() =>
                        setFilterQuick(
                          filterQuick === "SKIPPED" ? "ALL" : "SKIPPED",
                        )
                      }
                      title="Filter skipped on-development apps"
                    >
                      Stage Dev / Bypassed
                    </Badge>
                  </Flex>
                </VStack>
              </Card>

              {/* Card 3: Criteria Assessment Review */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "REVIEW_DONE" ||
                  filterQuick === "REVIEW_PENDING"
                    ? "teal.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Criteria Review
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "teal.900" : "teal.50"}
                      color={isDark ? "teal.300" : "teal.500"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiCheckCircle} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" justify="space-between">
                    <HStack align="baseline" spacing={1}>
                      <Heading size="md" color={isDark ? "white" : "gray.800"}>
                        {stats.reviewSatisfied}
                      </Heading>
                      <Text fontSize="2xs" color="gray.400">
                        /{stats.total}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        stats.reviewProgressPct === 100 ? "green" : "teal"
                      }
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                    >
                      {stats.reviewProgressPct}%
                    </Badge>
                  </Flex>

                  <Progress
                    value={stats.reviewProgressPct}
                    size="xs"
                    colorScheme={
                      stats.reviewProgressPct === 100 ? "green" : "teal"
                    }
                    borderRadius="full"
                  />

                  <Flex
                    justify="space-between"
                    align="center"
                    fontSize="2xs"
                    wrap="wrap"
                    gap={1}
                  >
                    <Text
                      color={isDark ? "gray.400" : "gray.500"}
                      cursor="pointer"
                      _hover={{
                        color: "teal.400",
                        textDecoration: "underline",
                      }}
                      onClick={() =>
                        setFilterQuick(
                          filterQuick === "REVIEW_DONE" ? "ALL" : "REVIEW_DONE",
                        )
                      }
                    >
                      {stats.fullyReviewed} Done · {stats.skipped} Skip
                    </Text>
                    <Text
                      color={
                        stats.reviewPending > 0 ? "orange.400" : "gray.400"
                      }
                      cursor="pointer"
                      _hover={{
                        color: "orange.300",
                        textDecoration: "underline",
                      }}
                      onClick={() =>
                        setFilterQuick(
                          filterQuick === "REVIEW_PENDING"
                            ? "ALL"
                            : "REVIEW_PENDING",
                        )
                      }
                    >
                      {stats.reviewPending} Pending
                    </Text>
                  </Flex>
                </VStack>
              </Card>

              {/* Card 4: RTO Suggestion (IAG Benchmark) */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "RTO_UNFILLED"
                    ? "orange.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      RTO Suggestion (IAG)
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "orange.900" : "orange.50"}
                      color={isDark ? "orange.300" : "orange.500"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiZap} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" justify="space-between">
                    <HStack align="baseline" spacing={1}>
                      <Heading size="md" color={isDark ? "white" : "gray.800"}>
                        {stats.rtoSatisfied}
                      </Heading>
                      <Text fontSize="2xs" color="gray.400">
                        /{stats.total}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        stats.rtoProgressPct === 100 ? "green" : "orange"
                      }
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                    >
                      {stats.rtoProgressPct}%
                    </Badge>
                  </Flex>

                  <Progress
                    value={stats.rtoProgressPct}
                    size="xs"
                    colorScheme={
                      stats.rtoProgressPct === 100 ? "green" : "orange"
                    }
                    borderRadius="full"
                  />

                  <Flex
                    justify="space-between"
                    align="center"
                    fontSize="2xs"
                    wrap="wrap"
                    gap={1}
                  >
                    <Text color={isDark ? "gray.400" : "gray.500"}>
                      {stats.rtoFilled} Set · {stats.skipped} Skip
                    </Text>
                    {stats.rtoUnfilled > 0 ? (
                      <Badge
                        colorScheme="orange"
                        variant={
                          filterQuick === "RTO_UNFILLED" ? "solid" : "subtle"
                        }
                        fontSize="2xs"
                        px={1.5}
                        py={0.2}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() =>
                          setFilterQuick(
                            filterQuick === "RTO_UNFILLED"
                              ? "ALL"
                              : "RTO_UNFILLED",
                          )
                        }
                        title="Click to view apps missing IAG RTO review"
                      >
                        ⚠️ {stats.rtoUnfilled} Pending
                      </Badge>
                    ) : (
                      <Text color="green.500" fontWeight="semibold">
                        ✓ Done
                      </Text>
                    )}
                  </Flex>
                </VStack>
              </Card>

              {/* Card 5: RPO Target (BMT / Continuity) */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "RPO_UNFILLED"
                    ? "pink.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      RPO Target (BMT)
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "pink.900" : "pink.50"}
                      color={isDark ? "pink.300" : "pink.500"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiActivity} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" justify="space-between">
                    <HStack align="baseline" spacing={1}>
                      <Heading size="md" color={isDark ? "white" : "gray.800"}>
                        {stats.rpoSatisfied}
                      </Heading>
                      <Text fontSize="2xs" color="gray.400">
                        /{stats.total}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        stats.rpoProgressPct === 100 ? "green" : "pink"
                      }
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                    >
                      {stats.rpoProgressPct}%
                    </Badge>
                  </Flex>

                  <Progress
                    value={stats.rpoProgressPct}
                    size="xs"
                    colorScheme={
                      stats.rpoProgressPct === 100 ? "green" : "pink"
                    }
                    borderRadius="full"
                  />

                  <Flex
                    justify="space-between"
                    align="center"
                    fontSize="2xs"
                    wrap="wrap"
                    gap={1}
                  >
                    <Text color={isDark ? "gray.400" : "gray.500"}>
                      {stats.rpoFilled} Set · {stats.skipped} Skip
                    </Text>
                    {stats.rpoUnfilled > 0 ? (
                      <Badge
                        colorScheme="pink"
                        variant={
                          filterQuick === "RPO_UNFILLED" ? "solid" : "subtle"
                        }
                        fontSize="2xs"
                        px={1.5}
                        py={0.2}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() =>
                          setFilterQuick(
                            filterQuick === "RPO_UNFILLED"
                              ? "ALL"
                              : "RPO_UNFILLED",
                          )
                        }
                        title="Click to view apps with pending RPO target"
                      >
                        {stats.rpoUnfilled} Pending
                      </Badge>
                    ) : (
                      <Text color="green.500" fontWeight="semibold">
                        ✓ Done
                      </Text>
                    )}
                  </Flex>
                </VStack>
              </Card>

              {/* Card 6: Governance & Approval Stages */}
              <Card
                bg={isDark ? "gray.800" : "white"}
                border="1px solid"
                borderColor={
                  filterQuick === "APPROVED" || filterQuick === "IN_APPROVAL"
                    ? "cyan.500"
                    : isDark
                      ? "gray.700"
                      : "gray.200"
                }
                borderRadius={radiusStyle}
                p={3.5}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="2xs"
                      fontWeight="bold"
                      color={isDark ? "gray.400" : "gray.500"}
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Approval Stages
                    </Text>
                    <Flex
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      bg={isDark ? "cyan.900" : "cyan.50"}
                      color={isDark ? "cyan.300" : "cyan.600"}
                      align="center"
                      justify="center"
                    >
                      <Icon as={FiShield} fontSize="14px" />
                    </Flex>
                  </Flex>

                  <Flex align="baseline" justify="space-between">
                    <HStack align="baseline" spacing={1}>
                      <Heading size="md" color={isDark ? "white" : "gray.800"}>
                        {stats.approved}
                      </Heading>
                      <Text fontSize="2xs" color="gray.400">
                        Approved
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={stats.approvedPct === 100 ? "green" : "cyan"}
                      fontSize="2xs"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                    >
                      {stats.approvedPct}%
                    </Badge>
                  </Flex>

                  <Progress
                    value={stats.approvedPct}
                    size="xs"
                    colorScheme="cyan"
                    borderRadius="full"
                  />

                  <HStack
                    spacing={1}
                    wrap="wrap"
                    justify="space-between"
                    fontSize="2xs"
                  >
                    <Badge
                      colorScheme="purple"
                      variant={
                        filterQuick === "IN_APPROVAL" ? "solid" : "subtle"
                      }
                      fontSize="2xs"
                      px={1.5}
                      py={0.2}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() =>
                        setFilterQuick(
                          filterQuick === "IN_APPROVAL" ? "ALL" : "IN_APPROVAL",
                        )
                      }
                    >
                      {stats.inApproval} In Approval
                    </Badge>
                    <Badge
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="2xs"
                      px={1.5}
                      py={0.2}
                      borderRadius="md"
                    >
                      {stats.draftOrRevise} Draft/Revise
                    </Badge>
                  </HStack>
                </VStack>
              </Card>
            </SimpleGrid>
          )}

          {/* Pending IAG RTO Alert Banner */}
          {stats.rtoUnfilled > 0 && (
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
                  Perhatian: {stats.rtoUnfilled} Aplikasi Belum Dilakukan Review RTO Suggestion oleh IAG
                </AlertTitle>
                <AlertDescription
                  fontSize="2xs"
                  color={isDark ? "yellow.300" : "yellow.800"}
                >
                  Aplikasi dengan status RTO Suggestion belum terisi memerlukan pengisian benchmark SLA dari tim IAG sebelum dapat disubmit ke tahap approval final.
                </AlertDescription>
              </Box>
              <Button
                size="xs"
                colorScheme="orange"
                variant="solid"
                onClick={() =>
                  setFilterQuick(
                    filterQuick === "RTO_UNFILLED" ? "ALL" : "RTO_UNFILLED",
                  )
                }
              >
                {filterQuick === "RTO_UNFILLED"
                  ? "Show All"
                  : `Filter ${stats.rtoUnfilled} Apps`}
              </Button>
            </Alert>
          )}

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
              {/* Quick Filter Pill Badges */}
              <Flex gap={2} wrap="wrap" mb={4} align="center">
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color={isDark ? "gray.400" : "gray.500"}
                  mr={1}
                >
                  Quick Filter:
                </Text>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "ALL" ? "blue" : "gray"}
                  variant={filterQuick === "ALL" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("ALL")}
                >
                  All Apps ({stats.total})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "ACTIVE" ? "green" : "gray"}
                  variant={filterQuick === "ACTIVE" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("ACTIVE")}
                >
                  Active ({stats.active})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "SKIPPED" ? "purple" : "gray"}
                  variant={filterQuick === "SKIPPED" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("SKIPPED")}
                >
                  Skipped ({stats.skipped})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "RTO_UNFILLED" ? "orange" : "gray"}
                  variant={filterQuick === "RTO_UNFILLED" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("RTO_UNFILLED")}
                >
                  Pending IAG RTO ({stats.rtoUnfilled})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "RPO_UNFILLED" ? "pink" : "gray"}
                  variant={filterQuick === "RPO_UNFILLED" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("RPO_UNFILLED")}
                >
                  Pending RPO ({stats.rpoUnfilled})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={
                    filterQuick === "REVIEW_PENDING" ? "yellow" : "gray"
                  }
                  variant={
                    filterQuick === "REVIEW_PENDING" ? "solid" : "subtle"
                  }
                  fontSize="2xs"
                  onClick={() => setFilterQuick("REVIEW_PENDING")}
                >
                  Review Pending ({stats.reviewPending})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "REVIEW_DONE" ? "teal" : "gray"}
                  variant={filterQuick === "REVIEW_DONE" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("REVIEW_DONE")}
                >
                  Fully Reviewed ({stats.fullyReviewed})
                </Badge>
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  colorScheme={filterQuick === "APPROVED" ? "cyan" : "gray"}
                  variant={filterQuick === "APPROVED" ? "solid" : "subtle"}
                  fontSize="2xs"
                  onClick={() => setFilterQuick("APPROVED")}
                >
                  Approved ({stats.approved})
                </Badge>
              </Flex>

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
                {(search ||
                  filterGroup ||
                  filterStatus ||
                  filterReview ||
                  filterQuick !== "ALL") && (
                  <Button
                    variant="outline"
                    leftIcon={<FiX />}
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
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
