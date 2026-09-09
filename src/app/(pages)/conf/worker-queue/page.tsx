"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Spinner,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Code,
  Divider,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  FiDownload,
  FiRefreshCcw,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiLayers,
  FiHardDrive,
  FiFilter,
  FiXCircle,
  FiPlay,
  FiSlash,
  FiTrash2,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiMail,
  FiSend,
  FiKey,
  FiCheck,
  FiLock,
  FiUnlock,
  FiActivity,
  FiShield,
  FiArrowLeft,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import useWorkerQueue, { QueueMetricsResponse } from "@/app/services/useWorkerQueue";
import { DownloadManagerItemResponse, DownloadOtpLogItemResponse } from "@/app/services/useDownloadManager";
import { RES_CODE_OK, WORKER_QUEUE_PASSKEY } from "@/app/constants/applicationConstants";
import Link from "next/link";

function formatDuration(startedAt?: string | null, completedAt?: string | null, createdAt?: string): string {
  const start = startedAt ? new Date(startedAt).getTime() : (createdAt ? new Date(createdAt).getTime() : 0);
  if (!start) return "-";
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const remSec = diffSec % 60;
  return `${mins}m ${remSec}s`;
}

function isStuckJob(item: DownloadManagerItemResponse): boolean {
  if (item.status !== "PROCESSING" && item.status !== "QUEUED") return false;
  const startTime = item.startedAt ? new Date(item.startedAt).getTime() : new Date(item.createdAt).getTime();
  const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
  return elapsedMinutes > 5;
}

export default function WorkerQueuePage() {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  // Tech Security Passkey State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);

  const [tokenData, setTokenData] = useState<string>("");
  const [dataReport, setDataReport] = useState<DownloadManagerItemResponse[]>([]);
  const [metrics, setMetrics] = useState<QueueMetricsResponse>({
    TOTAL: 0,
    QUEUED: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    FAILED: 0,
    CANCELLED: 0,
    DISMISSED: 0,
    STUCK: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [pollInterval, setPollInterval] = useState<number>(3000); // ms
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");

  // Pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  // Action states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<DownloadManagerItemResponse | null>(null);
  const {
    isOpen: isDetailModalOpen,
    onOpen: onOpenDetailModal,
    onClose: onCloseDetailModal,
  } = useDisclosure();

  // OTP & Audit Modal States
  const [selectedOtpJob, setSelectedOtpJob] = useState<DownloadManagerItemResponse | null>(null);
  const [otpLogs, setOtpLogs] = useState<DownloadOtpLogItemResponse[]>([]);
  const [isLoadingOtpLogs, setIsLoadingOtpLogs] = useState<boolean>(false);
  const [showOtpState, setShowOtpState] = useState<Record<string, boolean>>({});
  const [copiedOtpState, setCopiedOtpState] = useState<Record<string, boolean>>({});
  const {
    isOpen: isOtpModalOpen,
    onOpen: onOpenOtpModal,
    onClose: onCloseOtpModal,
  } = useDisclosure();

  // Admin Resend OTP Modal States
  const [resendTargetJob, setResendTargetJob] = useState<DownloadManagerItemResponse | null>(null);
  const [customEmailInput, setCustomEmailInput] = useState<string>("");
  const [isResendingOtp, setIsResendingOtp] = useState<boolean>(false);
  const {
    isOpen: isResendModalOpen,
    onOpen: onOpenResendModal,
    onClose: onCloseResendModal,
  } = useDisclosure();

  // Action Confirmation Alerts
  const [activeAction, setActiveAction] = useState<"CANCEL" | "DISMISS" | "RETRY" | "PURGE" | null>(null);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const {
    isOpen: isAlertOpen,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const cancelAlertRef = useRef<any>(null);

  const {
    ListAdminJobs,
    GetQueueMetrics,
    CancelJob,
    DismissJob,
    RetryJob,
    PurgeStuckJobs,
    DownloadExportFile,
    ResendOtpAdmin,
    GetJobOtpLogs,
  } = useWorkerQueue();

  // Load token & check unlocked state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tokenData") || "";
      setTokenData(token);

      const savedUnlocked = sessionStorage.getItem("wq_ops_unlocked") === "true";
      if (savedUnlocked) {
        setIsUnlocked(true);
      }
    }
  }, []);

  // Fetch Jobs & Metrics (only runs when unlocked)
  const fetchData = useCallback(async () => {
    if (!isUnlocked) return;
    setIsLoadingData(true);
    const [jobsRes, metricsRes] = await Promise.all([
      ListAdminJobs(
        {
          search: globalFilter,
          limit: 200,
          page: 0,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        },
        statusFilter,
        tokenData
      ),
      GetQueueMetrics(tokenData),
    ]);

    if (jobsRes?.statusCode === RES_CODE_OK && jobsRes.data) {
      setDataReport(jobsRes.data);
    }
    if (metricsRes?.statusCode === RES_CODE_OK && metricsRes.data) {
      setMetrics(metricsRes.data);
    }
    setLastRefreshed(new Date());
    setIsLoadingData(false);
  }, [isUnlocked, globalFilter, statusFilter, tokenData, ListAdminJobs, GetQueueMetrics]);

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
    }
  }, [isUnlocked, fetchData]);

  // Polling Effect
  useEffect(() => {
    if (!isUnlocked || pollInterval <= 0) return;
    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);
    return () => clearInterval(interval);
  }, [isUnlocked, pollInterval, fetchData]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    return dataReport.filter((item) => {
      if (statusFilter === "ACTIVE") {
        if (item.status !== "QUEUED" && item.status !== "PROCESSING") return false;
      } else if (statusFilter === "STUCK") {
        if (!isStuckJob(item)) return false;
      } else if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      if (moduleFilter !== "ALL" && item.moduleName !== moduleFilter) return false;
      return true;
    });
  }, [dataReport, statusFilter, moduleFilter]);

  // Distinct Modules
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    dataReport.forEach((d) => {
      if (d.moduleName) set.add(d.moduleName);
    });
    return Array.from(set);
  }, [dataReport]);

  // Unlock Handler
  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifyingKey(true);
    setPasskeyError(null);

    setTimeout(() => {
      if (passkeyInput.trim() === WORKER_QUEUE_PASSKEY) {
        setIsUnlocked(true);
        sessionStorage.setItem("wq_ops_unlocked", "true");
        setPasskeyError(null);
        toast({
          title: "Akses Terbuka",
          description: "Selamat datang di Worker Queue Monitor Console.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setPasskeyError("Passkey tidak valid. Akses ditolak.");
        toast({
          title: "Akses Ditolak",
          description: "Kunci akses (Passkey) yang Anda masukkan salah.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setIsVerifyingKey(false);
    }, 200);
  };

  // Lock Console Handler
  const handleLockConsole = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem("wq_ops_unlocked");
    setPasskeyInput("");
    setPasskeyError(null);
    toast({
      title: "Console Terkunci",
      description: "Console Worker Queue telah dikunci kembali.",
      status: "info",
      duration: 2000,
    });
  };

  // Handle Download
  const handleDownload = async (job: DownloadManagerItemResponse) => {
    setDownloadingId(job.id);
    const fileName =
      job.fileName ||
      `${job.reportTitle.replace(/\s+/g, "_")}_${job.id}.${job.exportType.toLowerCase()}`;
    const success = await DownloadExportFile(job.id, fileName, tokenData);
    if (success) {
      toast({
        title: "Unduhan Berhasil",
        description: `File ${fileName} berhasil diunduh.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Unduhan Gagal",
        description: "Gagal mengunduh file dari storage.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
    setDownloadingId(null);
  };

  // Trigger Action Alert
  const triggerAction = (action: "CANCEL" | "DISMISS" | "RETRY" | "PURGE", jobId?: string) => {
    setActiveAction(action);
    setTargetJobId(jobId || null);
    onOpenAlert();
  };

  // Execute Action
  const executeAction = async () => {
    if (!activeAction) return;
    setActionLoading(true);

    try {
      if (activeAction === "CANCEL" && targetJobId) {
        const res = await CancelJob(targetJobId, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          toast({
            title: "Job Dibatalkan",
            description: res.message || "Proses ekspor berhasil dibatalkan.",
            status: "warning",
            duration: 3000,
          });
          fetchData();
        } else {
          toast({
            title: "Gagal Membatalkan",
            description: res?.message || "Terjadi kesalahan",
            status: "error",
            duration: 4000,
          });
        }
      } else if (activeAction === "DISMISS" && targetJobId) {
        const res = await DismissJob(targetJobId, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          toast({
            title: "Job Didismiss",
            description: "Antrean job berhasil diabaikan/dilepaskan.",
            status: "info",
            duration: 3000,
          });
          fetchData();
        } else {
          toast({
            title: "Gagal Mendismiss",
            description: res?.message || "Terjadi kesalahan",
            status: "error",
            duration: 4000,
          });
        }
      } else if (activeAction === "RETRY" && targetJobId) {
        const res = await RetryJob(targetJobId, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          toast({
            title: "Job Dijadwalkan Ulang",
            description: "Job berhasil dimasukkan kembali ke antrean worker.",
            status: "success",
            duration: 3000,
          });
          fetchData();
        } else {
          toast({
            title: "Gagal Menjadwalkan Ulang",
            description: res?.message || "Terjadi kesalahan",
            status: "error",
            duration: 4000,
          });
        }
      } else if (activeAction === "PURGE") {
        const res = await PurgeStuckJobs(5, tokenData);
        if (res?.statusCode === RES_CODE_OK) {
          toast({
            title: "Purge Selesai",
            description: res.message || "Stuck jobs berhasil dibersihkan.",
            status: "success",
            duration: 3000,
          });
          fetchData();
        } else {
          toast({
            title: "Gagal Purge",
            description: res?.message || "Terjadi kesalahan",
            status: "error",
            duration: 4000,
          });
        }
      }
    } finally {
      setActionLoading(false);
      onCloseAlert();
      setActiveAction(null);
      setTargetJobId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      status: "info",
      duration: 1500,
    });
  };

  const handleOpenOtpLogs = async (job: DownloadManagerItemResponse) => {
    setSelectedOtpJob(job);
    setIsLoadingOtpLogs(true);
    onOpenOtpModal();
    const res = await GetJobOtpLogs(job.id, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setOtpLogs(res.data);
    } else {
      setOtpLogs(job.sysDownloadOtpLogs || []);
    }
    setIsLoadingOtpLogs(false);
  };

  const toggleOtpVisibility = (logId: string) => {
    setShowOtpState((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const copyOtpToClipboard = (logId: string, text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedOtpState((prev) => ({ ...prev, [logId]: true }));
    toast({
      title: "OTP Disalin",
      description: "Kode OTP berhasil disalin ke clipboard.",
      status: "info",
      duration: 2000,
    });
    setTimeout(() => {
      setCopiedOtpState((prev) => ({ ...prev, [logId]: false }));
    }, 2000);
  };

  const handleOpenResendModal = (job: DownloadManagerItemResponse) => {
    setResendTargetJob(job);
    setCustomEmailInput(job.latestOtpRecipient || "");
    onOpenResendModal();
  };

  const handleExecuteAdminResend = async () => {
    if (!resendTargetJob) return;
    setIsResendingOtp(true);

    try {
      const res = await ResendOtpAdmin(
        resendTargetJob.id,
        customEmailInput.trim() || undefined,
        tokenData
      );

      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "OTP Berhasil Dikirim",
          description: res.message || "Email berisi password OTP telah dikirimkan ke penerima.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        onCloseResendModal();
        fetchData();
        if (isOtpModalOpen && selectedOtpJob?.id === resendTargetJob.id) {
          const logsRes = await GetJobOtpLogs(resendTargetJob.id, tokenData);
          if (logsRes?.data) setOtpLogs(logsRes.data);
        }
      } else {
        toast({
          title: "Gagal Mengirim OTP",
          description: res?.message || "Terjadi kesalahan saat pengiriman OTP.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Table Columns Definition
  const columns = useMemo<ColumnDef<DownloadManagerItemResponse>[]>(
    () => [
      {
        id: "no",
        header: () => <Text textAlign="center">No</Text>,
        cell: (info) => (
          <Text fontSize="xs" textAlign="center" fontWeight="600" color="gray.500">
            {pageIndex * pageSize + info.row.index + 1}
          </Text>
        ),
        size: 45,
      },
      {
        id: "jobIdAndModule",
        header: "Job & Modul",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={1}>
              <HStack spacing={1}>
                <Code fontSize="2xs" px={1.5} py={0.5} rounded="md" colorScheme="purple">
                  {item.id.length > 8 ? `${item.id.substring(0, 8)}...` : item.id}
                </Code>
                <IconButton
                  aria-label="Copy ID"
                  icon={<FiCopy />}
                  size="2xs"
                  variant="ghost"
                  onClick={() => copyToClipboard(item.id)}
                />
              </HStack>
              <Badge colorScheme="blue" fontSize="3xs" rounded="md" px={1.5} py={0.5}>
                {item.moduleName}
              </Badge>
            </VStack>
          );
        },
      },
      {
        accessorKey: "reportTitle",
        header: "Laporan & Format",
        cell: (info) => {
          const item = info.row.original;
          const isXlsx = item.exportType === "XLSX";
          return (
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="700" noOfLines={1} maxW="240px">
                {item.reportTitle}
              </Text>
              <Badge
                colorScheme={isXlsx ? "green" : "red"}
                fontSize="3xs"
                px={1.5}
                py={0.5}
                rounded="md"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={isXlsx ? FaFileExcel : FaFilePdf} boxSize={2.5} />
                {item.exportType}
              </Badge>
            </VStack>
          );
        },
      },
      {
        id: "requestor",
        header: "Pemohon",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="600">
                {item.userName || item.userId || "System"}
              </Text>
              <Text fontSize="3xs" color="gray.400">
                ID: {item.userId || "-"}
              </Text>
            </VStack>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status & Progress",
        cell: (info) => {
          const item = info.row.original;
          const stuck = isStuckJob(item);

          if (item.status === "PROCESSING") {
            return (
              <Box minW="130px">
                <HStack justify="space-between" fontSize="3xs" mb={1} color={stuck ? "red.500" : "blue.500"}>
                  <HStack spacing={1}>
                    <Spinner size="xs" />
                    <Text fontWeight="700">{stuck ? "STUCK (>5m)" : "Processing"}</Text>
                  </HStack>
                  <Text fontWeight="bold">{item.progressPercentage}%</Text>
                </HStack>
                <Progress
                  value={item.progressPercentage || 15}
                  size="xs"
                  colorScheme={stuck ? "red" : "blue"}
                  rounded="full"
                  isAnimated
                  hasStripe
                />
              </Box>
            );
          }
          if (item.status === "QUEUED") {
            return (
              <Badge
                colorScheme={stuck ? "red" : "orange"}
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiClock} />
                {stuck ? "QUEUED STUCK" : "QUEUED"}
              </Badge>
            );
          }
          if (item.status === "COMPLETED") {
            return (
              <Badge
                colorScheme="green"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiCheckCircle} />
                COMPLETED
              </Badge>
            );
          }
          if (item.status === "CANCELLED") {
            return (
              <Badge
                colorScheme="gray"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiSlash} />
                CANCELLED
              </Badge>
            );
          }
          if (item.status === "DISMISSED") {
            return (
              <Badge
                colorScheme="purple"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiXCircle} />
                DISMISSED
              </Badge>
            );
          }
          return (
            <Tooltip label={item.errorMessage || "Failed during execution"}>
              <Badge
                colorScheme="red"
                fontSize="2xs"
                px={2}
                py={0.5}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
                cursor="pointer"
              >
                <Icon as={FiAlertCircle} />
                FAILED
              </Badge>
            </Tooltip>
          );
        },
      },
      {
        id: "otpStatus",
        header: "Status OTP / Email",
        cell: (info) => {
          const item = info.row.original;
          const status = item.latestOtpStatus;
          const sentCount = item.totalOtpSentCount || 0;

          return (
            <VStack align="start" spacing={0.5}>
              <Tooltip label="Klik untuk melihat riwayat audit pengiriman OTP">
                <Box
                  cursor="pointer"
                  onClick={() => handleOpenOtpLogs(item)}
                  _hover={{ opacity: 0.8 }}
                >
                  {status === "SUCCESS" ? (
                    <Badge
                      colorScheme="green"
                      fontSize="3xs"
                      px={1.5}
                      py={0.5}
                      rounded="full"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FiCheckCircle} />
                      Terkirim ({sentCount})
                    </Badge>
                  ) : status === "FAILED" ? (
                    <Badge
                      colorScheme="red"
                      fontSize="3xs"
                      px={1.5}
                      py={0.5}
                      rounded="full"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FiAlertCircle} />
                      Gagal Kirim ({sentCount})
                    </Badge>
                  ) : status === "PENDING" ? (
                    <Badge
                      colorScheme="yellow"
                      fontSize="3xs"
                      px={1.5}
                      py={0.5}
                      rounded="full"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FiClock} />
                      Pending
                    </Badge>
                  ) : status === "SKIPPED" ? (
                    <Badge
                      colorScheme="purple"
                      fontSize="3xs"
                      px={1.5}
                      py={0.5}
                      rounded="full"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      Skipped
                    </Badge>
                  ) : (
                    <Badge
                      colorScheme="gray"
                      fontSize="3xs"
                      px={1.5}
                      py={0.5}
                      rounded="full"
                    >
                      Belum Ada Log
                    </Badge>
                  )}
                </Box>
              </Tooltip>
              {item.latestOtpRecipient && (
                <Text fontSize="3xs" color="gray.400" noOfLines={1} maxW="130px" title={item.latestOtpRecipient}>
                  {item.latestOtpRecipient}
                </Text>
              )}
            </VStack>
          );
        },
      },
      {
        id: "timing",
        header: "Waktu & Durasi",
        cell: (info) => {
          const item = info.row.original;
          const duration = formatDuration(item.startedAt, item.completedAt, item.createdAt);
          const date = new Date(item.createdAt);
          return (
            <VStack align="start" spacing={0}>
              <HStack spacing={1}>
                <Text fontSize="2xs" fontWeight="700" color="blue.400">
                  ⏱ {duration}
                </Text>
              </HStack>
              <Text fontSize="3xs" color="gray.400">
                {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </Text>
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: () => <Text textAlign="center">Aksi Override</Text>,
        cell: (info) => {
          const item = info.row.original;
          const isRunning = item.status === "PROCESSING" || item.status === "QUEUED";
          const isCompleted = item.status === "COMPLETED";
          const isFailedOrCancelled =
            item.status === "FAILED" || item.status === "CANCELLED" || item.status === "DISMISSED";

          return (
            <HStack spacing={1} justify="center">
              {/* Detail Modal */}
              <Tooltip label="Detail / Parameter / Log Worker">
                <IconButton
                  aria-label="Detail"
                  icon={<FiEye />}
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setSelectedJob(item);
                    onOpenDetailModal();
                  }}
                />
              </Tooltip>

              {/* OTP History / Audit Log */}
              <Tooltip label="Audit / Log Pengiriman OTP">
                <IconButton
                  aria-label="Audit OTP"
                  icon={<FiMail />}
                  size="xs"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={() => handleOpenOtpLogs(item)}
                />
              </Tooltip>

              {/* Kirim Ulang OTP */}
              <Tooltip label="Kirim Ulang OTP (Admin Override)">
                <IconButton
                  aria-label="Kirim Ulang OTP"
                  icon={<FiSend />}
                  size="xs"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => handleOpenResendModal(item)}
                />
              </Tooltip>

              {/* Cancel Job (in-flight abort) */}
              {isRunning && (
                <Tooltip label="Batalkan Job (Abort Worker In-Flight)">
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="solid"
                    leftIcon={<FiSlash />}
                    onClick={() => triggerAction("CANCEL", item.id)}
                  >
                    Cancel
                  </Button>
                </Tooltip>
              )}

              {/* Force Dismiss Job */}
              {isRunning && (
                <Tooltip label="Force Dismiss (Lepaskan dari worker)">
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    leftIcon={<FiXCircle />}
                    onClick={() => triggerAction("DISMISS", item.id)}
                  >
                    Dismiss
                  </Button>
                </Tooltip>
              )}

              {/* Retry Job */}
              {isFailedOrCancelled && (
                <Tooltip label="Jadwalkan Ulang (Re-queue ke worker)">
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant="outline"
                    leftIcon={<FiPlay />}
                    onClick={() => triggerAction("RETRY", item.id)}
                  >
                    Retry
                  </Button>
                </Tooltip>
              )}

              {/* Download File */}
              {isCompleted && (
                <Tooltip label="Unduh File">
                  <IconButton
                    aria-label="Unduh"
                    icon={<FiDownload />}
                    size="xs"
                    colorScheme="green"
                    isLoading={downloadingId === item.id}
                    onClick={() => handleDownload(item)}
                  />
                </Tooltip>
              )}
            </HStack>
          );
        },
      },
    ],
    [pageIndex, pageSize, downloadingId, showOtpState, copiedOtpState]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box position="relative" bg={pageBg} minH="100vh">
      {/* Security Passkey Lock Overlay */}
      {!isUnlocked && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          bg="blackAlpha.700"
          backdropFilter="blur(16px)"
          justify="center"
          align="center"
          p={4}
        >
          <Card
            maxW="420px"
            w="full"
            bg={useColorModeValue("white", "gray.850")}
            border="1px"
            borderColor={useColorModeValue("blue.300", "blue.500")}
            shadow="2xl"
            rounded="3xl"
            p={6}
            position="relative"
            overflow="hidden"
          >
            {/* Top Accent Line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, blue.400, purple.500, cyan.400)"
            />

            <VStack spacing={5} align="stretch">
              <VStack spacing={2} textAlign="center">
                <Flex
                  w={14}
                  h={14}
                  rounded="2xl"
                  bgGradient="linear(to-tr, blue.500, purple.600)"
                  color="white"
                  align="center"
                  justify="center"
                  shadow="lg"
                >
                  <Icon as={FiLock} boxSize={7} />
                </Flex>
                <Heading as="h4" size="md" letterSpacing="tight">
                  Worker Queue Console
                </Heading>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  fontSize="2xs"
                  px={2.5}
                  py={0.5}
                  rounded="full"
                >
                  ADVANCED TECH OPS • PASSKEY REQUIRED
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  Halaman supervisor antrean worker ini diproteksi khusus pengguna teknis. Masukkan Passkey untuk membuka console.
                </Text>
              </VStack>

              <form onSubmit={handleUnlockSubmit}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="2xs" fontWeight="bold" color="gray.500" mb={1.5} textTransform="uppercase">
                      Security Passkey
                    </Text>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiKey} color="blue.400" />
                      </InputLeftElement>
                      <Input
                        type={showPasskey ? "text" : "password"}
                        placeholder="Masukkan Passkey (6 digit)"
                        value={passkeyInput}
                        onChange={(e) => {
                          setPasskeyInput(e.target.value);
                          if (passkeyError) setPasskeyError(null);
                        }}
                        rounded="xl"
                        autoFocus
                        letterSpacing={showPasskey ? "normal" : "widest"}
                        borderColor={passkeyError ? "red.400" : undefined}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Toggle password view"
                          icon={showPasskey ? <FiEyeOff /> : <FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPasskey(!showPasskey)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {passkeyError && (
                      <Text fontSize="2xs" color="red.500" mt={1.5} fontWeight="600">
                        {passkeyError}
                      </Text>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="md"
                    rounded="xl"
                    leftIcon={<FiUnlock />}
                    isLoading={isVerifyingKey}
                    w="full"
                    shadow="md"
                  >
                    Buka Kunci Akses
                  </Button>
                </VStack>
              </form>

              <Divider />

              <Flex justify="center">
                <Link href="/">
                  <Button size="xs" variant="ghost" leftIcon={<FiArrowLeft />}>
                    Kembali ke Beranda
                  </Button>
                </Link>
              </Flex>
            </VStack>
          </Card>
        </Flex>
      )}

      {/* Main Content Area (Blurred when locked) */}
      <Box
        filter={!isUnlocked ? "blur(14px) brightness(0.65)" : "none"}
        pointerEvents={!isUnlocked ? "none" : "auto"}
        userSelect={!isUnlocked ? "none" : "auto"}
        transition="filter 0.3s ease, opacity 0.3s ease"
        py={6}
      >
        <Container maxW="container.xl">
          {/* Top Operations Header */}
          <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Link href="/">
                <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />}>
                  Kembali
                </Button>
              </Link>
              <Box>
                <HStack spacing={2}>
                  <Heading as="h3" size="lg" letterSpacing="tight">
                    Worker Queue Monitor
                  </Heading>
                  <Tag size="sm" colorScheme="red" variant="solid" rounded="full">
                    <TagLabel fontWeight="bold">OPS / ADMIN</TagLabel>
                  </Tag>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Real-time Background Worker & Export Queue Supervisor (Direct Abort & Retry Engine)
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3}>
              {/* Live Indicator */}
              <HStack spacing={1.5} px={3} py={1.5} bg={cardBg} rounded="full" border="1px" borderColor={borderColor}>
                <Box
                  w={2.5}
                  h={2.5}
                  rounded="full"
                  bg={pollInterval > 0 ? "green.400" : "gray.400"}
                  animation={pollInterval > 0 ? "pulse 1.5s infinite" : undefined}
                />
                <Text fontSize="2xs" fontWeight="700">
                  {pollInterval > 0 ? `LIVE (${pollInterval / 1000}s)` : "PAUSED"}
                </Text>
              </HStack>

              {/* Interval Selector */}
              <Select
                size="sm"
                w="120px"
                rounded="lg"
                value={pollInterval}
                onChange={(e) => setPollInterval(Number(e.target.value))}
              >
                <option value={2000}>Poll 2s</option>
                <option value={3000}>Poll 3s</option>
                <option value={5000}>Poll 5s</option>
                <option value={10000}>Poll 10s</option>
                <option value={0}>Off</option>
              </Select>

              {/* Manual Refresh */}
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCcw />}
                size="sm"
                isLoading={isLoadingData}
                onClick={fetchData}
              />

              {/* Purge Stuck Jobs */}
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<FiTrash2 />}
                onClick={() => triggerAction("PURGE")}
              >
                Purge Stuck (&gt;5m)
              </Button>

              {/* Lock Console Button */}
              <Tooltip label="Kunci kembali console monitor">
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FiLock />}
                  onClick={handleLockConsole}
                >
                  Lock
                </Button>
              </Tooltip>
            </HStack>
          </Flex>

          {/* Metrics Grid */}
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(7, 1fr)",
          }}
          gap={3}
          mb={6}
        >
          <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="gray.400" fontWeight="700">
                  TOTAL JOBS
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold">
                  {metrics.TOTAL}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={statBg}
            rounded="xl"
            shadow="xs"
            border="1px"
            borderColor={metrics.PROCESSING > 0 ? "blue.400" : borderColor}
          >
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="blue.400" fontWeight="700">
                  PROCESSING
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color="blue.500">
                  {metrics.PROCESSING}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="orange.400" fontWeight="700">
                  QUEUED
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color="orange.500">
                  {metrics.QUEUED}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="green.400" fontWeight="700">
                  COMPLETED
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color="green.500">
                  {metrics.COMPLETED}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="red.400" fontWeight="700">
                  FAILED
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color="red.500">
                  {metrics.FAILED}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={statBg} rounded="xl" shadow="xs" border="1px" borderColor={borderColor}>
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color="gray.400" fontWeight="700">
                  CANCEL / DISMISS
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color="gray.500">
                  {metrics.CANCELLED + metrics.DISMISSED}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={statBg}
            rounded="xl"
            shadow="xs"
            border="1px"
            borderColor={metrics.STUCK > 0 ? "red.400" : borderColor}
            bgGradient={metrics.STUCK > 0 ? "linear(to-r, red.50, red.100)" : undefined}
          >
            <CardBody p={3}>
              <Stat>
                <StatLabel fontSize="3xs" color={metrics.STUCK > 0 ? "red.600" : "gray.400"} fontWeight="700">
                  STUCK ALERT (&gt;5M)
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold" color={metrics.STUCK > 0 ? "red.600" : "gray.400"}>
                  {metrics.STUCK}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Table Card */}
        <Card bg={cardBg} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor}>
          <CardHeader borderBottomWidth="1px" borderColor={borderColor} py={4}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
              {/* Status Filter Tabs / Pills */}
              <HStack spacing={1.5} wrap="wrap">
                {[
                  { label: "All", value: "ALL" },
                  { label: "Active (Queued/Proc)", value: "ACTIVE" },
                  { label: "Processing", value: "PROCESSING" },
                  { label: "Queued", value: "QUEUED" },
                  { label: "Stuck (>5m)", value: "STUCK" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Failed", value: "FAILED" },
                  { label: "Cancelled", value: "CANCELLED" },
                  { label: "Dismissed", value: "DISMISSED" },
                ].map((pill) => (
                  <Button
                    key={pill.value}
                    size="xs"
                    rounded="full"
                    variant={statusFilter === pill.value ? "solid" : "outline"}
                    colorScheme={
                      pill.value === "STUCK"
                        ? "red"
                        : pill.value === "PROCESSING"
                        ? "blue"
                        : pill.value === "COMPLETED"
                        ? "green"
                        : "gray"
                    }
                    onClick={() => setStatusFilter(pill.value)}
                  >
                    {pill.label}
                  </Button>
                ))}
              </HStack>

              <Text fontSize="3xs" color="gray.400">
                Updated: {lastRefreshed.toLocaleTimeString()}
              </Text>
            </Flex>
          </CardHeader>

          <CardBody p={4}>
            {/* Search and Module Filter */}
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(12, 1fr)" }} gap={3} mb={4}>
              <GridItem colSpan={{ base: 1, md: 8 }}>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari ID Job, Judul Laporan, Nama Modul, atau User ID pemohon..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    rounded="lg"
                  />
                </InputGroup>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 4 }}>
                <Select
                  size="sm"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  rounded="lg"
                >
                  <option value="ALL">Semua Modul Terdaftar</option>
                  {availableModules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </Select>
              </GridItem>
            </Grid>

            {/* Table */}
            {isLoadingData && dataReport.length === 0 ? (
              <Flex justify="center" align="center" py={12}>
                <Spinner size="md" color="blue.500" mr={3} />
                <Text fontSize="sm" fontWeight="600">
                  Memuat antrean worker...
                </Text>
              </Flex>
            ) : filteredData.length === 0 ? (
              <Box py={12} textAlign="center" color="gray.400">
                <Icon as={FiLayers} boxSize={10} mb={2} />
                <Text fontSize="sm" fontWeight="500">
                  Tidak ada data job dalam antrean yang sesuai kriteria filter.
                </Text>
              </Box>
            ) : (
              <Box overflowX="auto" border="1px" borderColor={tableBorderColor} rounded="xl">
                <Table variant="simple" size="sm">
                  <Thead bg={colorMode === "light" ? "gray.50" : "gray.900"}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Th
                            key={header.id}
                            py={3}
                            fontSize="2xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </Th>
                        ))}
                      </Tr>
                    ))}
                  </Thead>
                  <Tbody>
                    {table.getRowModel().rows.map((row) => {
                      const isStuck = isStuckJob(row.original);
                      return (
                        <Tr
                          key={row.id}
                          bg={isStuck ? (colorMode === "light" ? "red.50" : "red.900") : undefined}
                          _hover={{
                            bg: colorMode === "light" ? "gray.50" : "gray.750",
                          }}
                          transition="background 0.15s"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <Td key={cell.id} py={2.5}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Td>
                          ))}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="gray.500">
                    Menampilkan {filteredData.length} job (Hal {table.getState().pagination.pageIndex + 1} dari{" "}
                    {table.getPageCount() || 1})
                  </Text>
                  <Select
                    size="xs"
                    w="75px"
                    rounded="md"
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                  >
                    {[10, 15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Select>
                </HStack>

                <HStack spacing={1.5}>
                  <Button
                    size="xs"
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                  >
                    Prev
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => table.nextPage()}
                    isDisabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            )}
          </CardBody>
        </Card>
      </Container>
    </Box>

      {/* Detail / Log Inspector Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={onCloseDetailModal} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="2xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            Inspector Detail Worker Job
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedJob && (
              <VStack align="stretch" spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="xs">
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Job ID
                    </Text>
                    <Code fontSize="2xs" p={1} rounded="md" w="full">
                      {selectedJob.id}
                    </Code>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Status
                    </Text>
                    <Badge colorScheme="purple">{selectedJob.status}</Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Modul
                    </Text>
                    <Text fontWeight="600">{selectedJob.moduleName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Format
                    </Text>
                    <Text fontWeight="600">{selectedJob.exportType}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Dibuat Pada
                    </Text>
                    <Text>{new Date(selectedJob.createdAt).toLocaleString("id-ID")}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Selesai Pada
                    </Text>
                    <Text>
                      {selectedJob.completedAt
                        ? new Date(selectedJob.completedAt).toLocaleString("id-ID")
                        : "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Total Record
                    </Text>
                    <Text>{selectedJob.totalRecords ?? "-"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.500">
                      Ukuran File
                    </Text>
                    <Text>{selectedJob.fileSizeKb ? `${selectedJob.fileSizeKb} KB` : "-"}</Text>
                  </Box>
                </Grid>

                <Divider />

                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                    Snapshot Filter Params (JSON)
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={3}
                    rounded="lg"
                    fontSize="2xs"
                    maxH="150px"
                    overflowY="auto"
                  >
                    {selectedJob.filterParamsJson
                      ? JSON.stringify(JSON.parse(selectedJob.filterParamsJson), null, 2)
                      : "{}"}
                  </Code>
                </Box>

                {selectedJob.errorMessage && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="red.500" mb={1}>
                      Stack Trace / Error Message
                    </Text>
                    <Code
                      display="block"
                      whiteSpace="pre-wrap"
                      p={3}
                      rounded="lg"
                      fontSize="2xs"
                      colorScheme="red"
                      maxH="150px"
                      overflowY="auto"
                    >
                      {selectedJob.errorMessage}
                    </Code>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={onCloseDetailModal}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OTP Dispatch / Audit Log Modal */}
      <Modal isOpen={isOtpModalOpen} onClose={onCloseOtpModal} size="2xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="2xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            <Flex justify="space-between" align="center" pr={6} wrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Icon as={FiMail} color="blue.500" />
                <Text>Audit Log Pengiriman Password OTP</Text>
              </HStack>
              {selectedOtpJob && (
                <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                  {selectedOtpJob.moduleName}
                </Badge>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOtpJob && (
              <VStack align="stretch" spacing={4}>
                {/* Summary Info Banner */}
                <Box
                  p={3}
                  bg={useColorModeValue("gray.50", "gray.800")}
                  rounded="xl"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={2} fontSize="xs">
                    <Box>
                      <Text fontWeight="bold" color="gray.400" fontSize="3xs">
                        JOB ID
                      </Text>
                      <Code fontSize="2xs" px={1.5} py={0.5} rounded="md">
                        {selectedOtpJob.id}
                      </Code>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.400" fontSize="3xs">
                        JUDUL LAPORAN
                      </Text>
                      <Text fontWeight="600" noOfLines={1}>
                        {selectedOtpJob.reportTitle}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.400" fontSize="3xs">
                        PEMOHON ASLI
                      </Text>
                      <Text fontWeight="600">
                        {selectedOtpJob.userName || selectedOtpJob.userId} ({selectedOtpJob.userId})
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.400" fontSize="3xs">
                        EMAIL TERAKHIR / STATUS
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="2xs">{selectedOtpJob.latestOtpRecipient || "-"}</Text>
                        <Badge
                          size="sm"
                          colorScheme={
                            selectedOtpJob.latestOtpStatus === "SUCCESS"
                              ? "green"
                              : selectedOtpJob.latestOtpStatus === "FAILED"
                              ? "red"
                              : "gray"
                          }
                          fontSize="3xs"
                        >
                          {selectedOtpJob.latestOtpStatus || "N/A"}
                        </Badge>
                      </HStack>
                    </Box>
                  </Grid>
                </Box>

                <Divider />

                {/* Log Entries List */}
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500">
                      Riwayat Percobaan Dispatch ({otpLogs.length} Entri)
                    </Text>
                    <IconButton
                      aria-label="Refresh Logs"
                      icon={<FiRefreshCcw />}
                      size="2xs"
                      variant="ghost"
                      isLoading={isLoadingOtpLogs}
                      onClick={() => handleOpenOtpLogs(selectedOtpJob)}
                    />
                  </Flex>

                  {isLoadingOtpLogs ? (
                    <Flex justify="center" align="center" py={8}>
                      <Spinner size="sm" color="blue.500" mr={2} />
                      <Text fontSize="xs">Memuat riwayat pengiriman OTP...</Text>
                    </Flex>
                  ) : otpLogs.length === 0 ? (
                    <Box
                      py={8}
                      textAlign="center"
                      bg={useColorModeValue("gray.50", "gray.850")}
                      rounded="xl"
                      border="1px dashed"
                      borderColor={borderColor}
                    >
                      <Icon as={FiMail} boxSize={8} color="gray.400" mb={2} />
                      <Text fontSize="xs" color="gray.500" fontWeight="600">
                        Belum ada riwayat pengiriman OTP tercatat untuk job ini.
                      </Text>
                      <Text fontSize="3xs" color="gray.400" mt={1}>
                        File mungkin diunduh sebelum fitur logging aktif, atau Anda dapat memicu pengiriman ulang sekarang.
                      </Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" spacing={3} maxH="380px" overflowY="auto" pr={1}>
                      {otpLogs.map((log, index) => {
                        const isSuccess = log.dispatchStatus === "SUCCESS";
                        const isVisible = showOtpState[log.id];
                        const isCopied = copiedOtpState[log.id];

                        return (
                          <Box
                            key={log.id}
                            p={3.5}
                            rounded="xl"
                            border="1px"
                            borderColor={isSuccess ? (colorMode === "light" ? "green.200" : "green.800") : (colorMode === "light" ? "red.200" : "red.800")}
                            bg={useColorModeValue(isSuccess ? "green.50" : "red.50", isSuccess ? "gray.800" : "gray.800")}
                            shadow="xs"
                          >
                            <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                              <HStack spacing={2}>
                                <Badge
                                  colorScheme={isSuccess ? "green" : "red"}
                                  fontSize="2xs"
                                  px={2}
                                  py={0.5}
                                  rounded="full"
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <Icon as={isSuccess ? FiCheckCircle : FiAlertCircle} />
                                  {log.dispatchStatus}
                                </Badge>
                                <Badge colorScheme="blue" fontSize="3xs" variant="outline" rounded="md">
                                  {log.triggeredBy}
                                </Badge>
                                {log.smtpDurationMs != null && (
                                  <Text fontSize="3xs" color="gray.500" fontWeight="600">
                                    ⏱ {log.smtpDurationMs} ms
                                  </Text>
                                )}
                              </HStack>
                              <Text fontSize="3xs" color="gray.400" fontWeight="500">
                                #{otpLogs.length - index} • {new Date(log.createdAt).toLocaleString("id-ID")}
                              </Text>
                            </Flex>

                            <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={2} fontSize="xs" mb={2}>
                              <Box>
                                <Text fontSize="3xs" color="gray.400" fontWeight="bold">
                                  PENERIMA
                                </Text>
                                <Text fontWeight="600" fontSize="xs">
                                  {log.recipientEmail}
                                </Text>
                                {log.recipientUserId && (
                                  <Text fontSize="3xs" color="gray.400">
                                    User ID: {log.recipientUserId}
                                  </Text>
                                )}
                              </Box>

                              <Box>
                                <Text fontSize="3xs" color="gray.400" fontWeight="bold">
                                  DIPICU OLEH / IP
                                </Text>
                                <Text fontSize="2xs">
                                  {log.triggeredByUserId || "System"} ({log.triggeredFromIp || "Local/Loopback"})
                                </Text>
                                {log.expiredAt && (
                                  <Text fontSize="3xs" color="gray.400">
                                    Exp: {new Date(log.expiredAt).toLocaleTimeString("id-ID")}
                                  </Text>
                                )}
                              </Box>
                            </Grid>

                            {/* OTP Code Box with Eye Toggle & Copy */}
                            <Flex
                              p={2.5}
                              rounded="lg"
                              bg={colorMode === "light" ? "white" : "gray.900"}
                              border="1px"
                              borderColor={borderColor}
                              justify="space-between"
                              align="center"
                            >
                              <HStack spacing={2}>
                                <Icon as={FiKey} color="blue.500" />
                                <Text fontSize="2xs" fontWeight="bold" color="gray.500">
                                  KODE OTP:
                                </Text>
                                <Code
                                  fontSize="sm"
                                  fontWeight="bold"
                                  letterSpacing="widest"
                                  px={2.5}
                                  py={0.5}
                                  rounded="md"
                                  colorScheme={isVisible ? "green" : "gray"}
                                >
                                  {isVisible
                                    ? (log.otpCode || log.otpCodeMasked || "N/A")
                                    : (log.otpCodeMasked || "••••••")}
                                </Code>
                              </HStack>

                              <HStack spacing={1}>
                                <Tooltip label={isVisible ? "Sembunyikan OTP" : "Tampilkan OTP Plain"}>
                                  <IconButton
                                    aria-label="Toggle OTP Visibility"
                                    icon={isVisible ? <FiEyeOff /> : <FiEye />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme={isVisible ? "purple" : "gray"}
                                    onClick={() => toggleOtpVisibility(log.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Salin Kode OTP">
                                  <IconButton
                                    aria-label="Copy OTP"
                                    icon={isCopied ? <FiCheck /> : <FiCopy />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme={isCopied ? "green" : "gray"}
                                    onClick={() =>
                                      copyOtpToClipboard(
                                        log.id,
                                        isVisible ? log.otpCode : (log.otpCodeMasked || "")
                                      )
                                    }
                                  />
                                </Tooltip>
                              </HStack>
                            </Flex>

                            {/* Error display if failed */}
                            {log.errorMessage && (
                              <Box mt={2} p={2} bg={useColorModeValue("red.100", "red.950")} rounded="md">
                                <Text fontSize="3xs" color="red.600" fontWeight="bold">
                                  SMTP / Dispatch Error:
                                </Text>
                                <Text fontSize="3xs" color="red.500" fontFamily="mono">
                                  {log.errorMessage}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Flex justify="space-between" w="full" align="center">
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<FiSend />}
                onClick={() => {
                  if (selectedOtpJob) {
                    handleOpenResendModal(selectedOtpJob);
                  }
                }}
              >
                Kirim Ulang OTP
              </Button>
              <Button size="sm" onClick={onCloseOtpModal}>
                Tutup
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Admin Resend OTP Modal */}
      <Modal isOpen={isResendModalOpen} onClose={onCloseResendModal} size="md">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="2xl">
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing={2}>
              <Icon as={FiSend} color="blue.500" />
              <Text>Kirim Ulang Password OTP (Admin)</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {resendTargetJob && (
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg={useColorModeValue("gray.50", "gray.800")} rounded="lg" fontSize="xs">
                  <Text fontWeight="bold" color="gray.500">
                    Target Job Laporan:
                  </Text>
                  <Text fontWeight="700">{resendTargetJob.reportTitle}</Text>
                  <Text fontSize="2xs" color="gray.400">
                    ID: {resendTargetJob.id} • Modul: {resendTargetJob.moduleName}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={1}>
                    Email Penerima OTP
                  </Text>
                  <Input
                    size="sm"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="nama@bank... atau biarkan sesuai default pemohon"
                    rounded="lg"
                  />
                  <Text fontSize="3xs" color="gray.400" mt={1}>
                    Bila dikosongkan, email akan otomatis diambil dari profil user pemohon ({resendTargetJob.userId}).
                  </Text>
                </Box>

                <Box p={2.5} bg={useColorModeValue("blue.50", "blue.950")} rounded="lg" border="1px" borderColor="blue.200">
                  <Text fontSize="3xs" color="blue.700" fontWeight="600">
                    🛡️ Mode Override Admin:
                  </Text>
                  <Text fontSize="3xs" color="blue.600">
                    Pengiriman ini memotong batasan rate-limit standar (3x/5 menit) dan mencatat jejak audit `ADMIN_RESEND` ke database.
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} onClick={onCloseResendModal} isDisabled={isResendingOtp}>
              Batal
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FiSend />}
              isLoading={isResendingOtp}
              onClick={handleExecuteAdminResend}
            >
              Kirim OTP Sekarang
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelAlertRef}
        onClose={onCloseAlert}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent rounded="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              {activeAction === "CANCEL" && "Konfirmasi Batalkan Job (In-Flight Abort)"}
              {activeAction === "DISMISS" && "Konfirmasi Force Dismiss Job"}
              {activeAction === "RETRY" && "Konfirmasi Jadwalkan Ulang (Retry)"}
              {activeAction === "PURGE" && "Konfirmasi Purge Stuck Jobs (>5 Menit)"}
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm">
              {activeAction === "CANCEL" &&
                "Apakah Anda yakin ingin membatalkan eksekusi job ini secara paksa? Sinyal CancellationToken akan dikirim ke worker untuk menghentikan query database dan MinIO upload."}
              {activeAction === "DISMISS" &&
                "Apakah Anda yakin ingin melepaskan job ini dari antrean worker secara permanen? Status akan diubah menjadi DISMISSED."}
              {activeAction === "RETRY" &&
                "Job akan di-reset dan dimasukkan kembali ke antrean ExportBackgroundWorker untuk diproses ulang."}
              {activeAction === "PURGE" &&
                "Seluruh job dengan status QUEUED atau PROCESSING yang telah tertahan lebih dari 5 menit akan otomatis diubah menjadi FAILED/DISMISSED untuk mencegah deadlock antrean."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelAlertRef} onClick={onCloseAlert} size="sm" isDisabled={actionLoading}>
                Batal
              </Button>
              <Button
                colorScheme={
                  activeAction === "CANCEL"
                    ? "red"
                    : activeAction === "PURGE"
                    ? "orange"
                    : activeAction === "RETRY"
                    ? "teal"
                    : "purple"
                }
                onClick={executeAction}
                ml={3}
                size="sm"
                isLoading={actionLoading}
              >
                Lanjutkan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
