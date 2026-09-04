"use client";

import React, { useEffect, useState, useRef, useCallback, useTransition } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Progress,
  IconButton,
  Tooltip,
  useColorMode,
  Flex,
  Icon,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Spinner,
} from "@chakra-ui/react";
import {
  FiDownload,
  FiTrash2,
  FiRefreshCcw,
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiChevronDown,
  FiLock,
} from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import useDownloadManager, {
  DownloadManagerItemResponse,
} from "../services/useDownloadManager";
import { useToastHelper } from "../helper/ToastMessagesHelper";
import { RES_CODE_OK } from "../constants/applicationConstants";

interface DownloadManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData?: string;
  onActiveJobsChange?: (activeCount: number) => void;
}

export const DownloadManagerDrawer: React.FC<DownloadManagerDrawerProps> = ({
  isOpen,
  onClose,
  tokenData,
  onActiveJobsChange,
}) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const {
    ListDownloadJobs,
    DeleteDownloadJob,
    DownloadExportFile,
    isLoading,
  } = useDownloadManager();

  const [jobs, setJobs] = useState<DownloadManagerItemResponse[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "FAILED">("ALL");
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const onActiveJobsChangeRef = useRef(onActiveJobsChange);
  onActiveJobsChangeRef.current = onActiveJobsChange;

  const displayLimitRef = useRef(displayLimit);
  displayLimitRef.current = displayLimit;

  const fetchJobs = useCallback(
    async (limitToFetch: number = 10, isMore: boolean = false) => {
      const token =
        tokenData ||
        (typeof window !== "undefined"
          ? localStorage.getItem("tokenData") || ""
          : "");
      if (!token) return;

      if (isMore) {
        setIsLoadingMore(true);
      }

      const res = await ListDownloadJobs(
        {
          search: searchTerm,
          limit: limitToFetch,
          page: 0,
          filterWhere: [],
          fieldOrder: ["createdAt"],
          orderDir: "desc",
        },
        token
      );

      if (res?.statusCode === RES_CODE_OK && res.data) {
        const data = res.data;
        startTransition(() => {
          setJobs(data);
          const total = res.countTotal || data.length;
          setTotalRecordsCount(total);
        });

        const activeCount = data.filter(
          (j) => j.status === "QUEUED" || j.status === "PROCESSING"
        ).length;
        onActiveJobsChangeRef.current?.(activeCount);
      }
      setIsLoadingMore(false);
    },
    [tokenData, searchTerm, ListDownloadJobs]
  );

  // Initial load when drawer opens (delayed slightly by 50ms so slide-in animation starts smoothly at 60fps)
  useEffect(() => {
    if (isOpen) {
      setDisplayLimit(10);
      const timer = setTimeout(() => {
        fetchJobs(10);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchTerm, fetchJobs]);

  // Auto-polling only when drawer is open AND there is at least one active job
  const hasActiveJobs = jobs.some(
    (j) => j.status === "QUEUED" || j.status === "PROCESSING"
  );

  useEffect(() => {
    if (!isOpen || !hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchJobs(displayLimitRef.current);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, hasActiveJobs, fetchJobs]);

  const handleLoadMore = () => {
    const newLimit = displayLimit + 10;
    setDisplayLimit(newLimit);
    fetchJobs(newLimit, true);
  };

  const handleDownload = async (job: DownloadManagerItemResponse) => {
    const token =
      tokenData ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    if (!token) return;

    setIsDownloadingId(job.id);
    const fileName =
      job.fileName ||
      `${job.reportTitle.replace(/\s+/g, "_")}_${job.id}.${job.exportType.toLowerCase()}`;
    const success = await DownloadExportFile(job.id, fileName, token);
    if (success) {
      showToast({
        description: `File ${fileName} berhasil diunduh. Password pembuka ZIP (OTP) telah dikirimkan ke email Anda.`,
        statusToast: "success",
      });
    } else {
      showToast({
        description: "Gagal mengunduh file.",
        statusToast: "error",
      });
    }
    setIsDownloadingId(null);
  };

  const handleDelete = async (jobId: string) => {
    const token =
      tokenData ||
      (typeof window !== "undefined"
        ? localStorage.getItem("tokenData") || ""
        : "");
    if (!token) return;

    setIsDeletingId(jobId);
    const res = await DeleteDownloadJob(jobId, token);
    if (res?.statusCode === RES_CODE_OK) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setTotalRecordsCount((prev) => Math.max(prev - 1, 0));
      showToast({
        description: "Riwayat unduhan berhasil dihapus.",
        statusToast: "success",
      });
    } else {
      showToast({
        description: res?.message || "Gagal menghapus riwayat.",
        statusToast: "error",
      });
    }
    setIsDeletingId(null);
  };

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === "ACTIVE")
      return job.status === "QUEUED" || job.status === "PROCESSING";
    if (statusFilter === "COMPLETED") return job.status === "COMPLETED";
    if (statusFilter === "FAILED") return job.status === "FAILED";
    return true;
  });

  const activeCount = jobs.filter(
    (j) => j.status === "QUEUED" || j.status === "PROCESSING"
  ).length;

  const hasMoreData = totalRecordsCount > jobs.length;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="blackAlpha.600" />
      <DrawerContent bg={colorMode === "light" ? "white" : "gray.900"}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" py={3} px={4}>
          <HStack justify="space-between" pr={6}>
            <HStack spacing={2}>
              <Icon as={FiDownload} color="blue.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold">
                Download Manager
              </Text>
              {activeCount > 0 && (
                <Badge colorScheme="blue" rounded="full" px={1.5} fontSize="3xs">
                  {activeCount} Aktif
                </Badge>
              )}
            </HStack>
            <Tooltip label="Segarkan data">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCcw />}
                size="xs"
                variant="ghost"
                isLoading={isLoading}
                onClick={() => fetchJobs(displayLimit)}
              />
            </Tooltip>
          </HStack>
        </DrawerHeader>

        <DrawerBody p={3}>
          <VStack spacing={2.5} align="stretch">
            {/* Search Input */}
            <InputGroup size="xs">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari laporan..."
                rounded="md"
                fontSize="xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Filter Tabs (Compact Micro-Typography) */}
            <Tabs
              size="xs"
              variant="soft-rounded"
              colorScheme="blue"
              onChange={(index) => {
                const map: ("ALL" | "ACTIVE" | "COMPLETED" | "FAILED")[] = [
                  "ALL",
                  "ACTIVE",
                  "COMPLETED",
                  "FAILED",
                ];
                setStatusFilter(map[index]);
              }}
            >
              <TabList gap={1} flexWrap="wrap">
                <Tab fontSize="2xs" px={2} py={0.5} fontWeight="500">
                  Semua ({totalRecordsCount || jobs.length})
                </Tab>
                <Tab fontSize="2xs" px={2} py={0.5} fontWeight="500">
                  Proses ({activeCount})
                </Tab>
                <Tab fontSize="2xs" px={2} py={0.5} fontWeight="500">
                  Selesai ({jobs.filter((j) => j.status === "COMPLETED").length})
                </Tab>
                <Tab fontSize="2xs" px={2} py={0.5} fontWeight="500">
                  Gagal ({jobs.filter((j) => j.status === "FAILED").length})
                </Tab>
              </TabList>
            </Tabs>

            <Divider my={1} />

            {/* List of Jobs */}
            {filteredJobs.length === 0 ? (
              <Box
                py={10}
                textAlign="center"
                color="gray.400"
                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                rounded="lg"
              >
                <Icon as={FiFileText} boxSize={7} mb={1.5} />
                <Text fontSize="xs" fontWeight="500">
                  Tidak ada antrean atau riwayat unduhan.
                </Text>
              </Box>
            ) : (
              <VStack spacing={2} align="stretch">
                {filteredJobs.map((job) => {
                  const isXlsx = job.exportType === "XLSX";
                  const isQueued = job.status === "QUEUED";
                  const isProcessing = job.status === "PROCESSING";
                  const isCompleted = job.status === "COMPLETED";
                  const isFailed = job.status === "FAILED";

                  return (
                    <Box
                      key={job.id}
                      p={3}
                      rounded="lg"
                      border="1px"
                      borderColor={
                        isProcessing
                          ? "blue.300"
                          : colorMode === "light"
                          ? "gray.200"
                          : "gray.700"
                      }
                      bg={
                        isProcessing
                          ? colorMode === "light"
                            ? "blue.50/40"
                            : "blue.950/20"
                          : colorMode === "light"
                          ? "white"
                          : "gray.850"
                      }
                      shadow="none"
                      transition="all 0.15s ease"
                    >
                      <VStack align="stretch" spacing={2}>
                        {/* Header Badge, Module, Time */}
                        <Flex justify="space-between" align="center">
                          <HStack spacing={1.5}>
                            <Badge
                              colorScheme={isXlsx ? "green" : "red"}
                              fontSize="3xs"
                              px={1.5}
                              py={0.5}
                              rounded="sm"
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Icon as={isXlsx ? FaFileExcel : FaFilePdf} boxSize={2.5} />
                              {job.exportType}
                            </Badge>
                            <Badge
                              colorScheme="purple"
                              fontSize="3xs"
                              px={1.5}
                              py={0.5}
                              rounded="sm"
                            >
                              {job.moduleName}
                            </Badge>
                            {isCompleted && (
                              <Badge
                                colorScheme="cyan"
                                fontSize="3xs"
                                px={1.5}
                                py={0.5}
                                rounded="sm"
                                display="inline-flex"
                                alignItems="center"
                                gap={1}
                              >
                                <Icon as={FiLock} boxSize={2.5} />
                                OTP Protected
                              </Badge>
                            )}
                          </HStack>

                          <Text fontSize="3xs" color="gray.400">
                            {new Date(job.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • {new Date(job.createdAt).toLocaleDateString()}
                          </Text>
                        </Flex>

                        {/* Title */}
                        <Text
                          fontSize="xs"
                          fontWeight="600"
                          color={colorMode === "light" ? "gray.800" : "white"}
                          noOfLines={1}
                        >
                          {job.reportTitle}
                        </Text>

                        {/* Progress Bar if Processing */}
                        {isProcessing && (
                          <VStack align="stretch" spacing={0.5}>
                            <Flex justify="space-between" fontSize="3xs">
                              <HStack spacing={1} color="blue.500">
                                <Spinner size="xs" />
                                <Text fontWeight="500">
                                  Menyusun data & file...
                                </Text>
                              </HStack>
                              <Text fontWeight="bold" color="blue.600">
                                {job.progressPercentage}%
                              </Text>
                            </Flex>
                            <Progress
                              value={job.progressPercentage || 15}
                              size="xs"
                              colorScheme="blue"
                              rounded="full"
                              isAnimated
                              hasStripe
                            />
                          </VStack>
                        )}

                        {/* Queued indicator */}
                        {isQueued && (
                          <HStack
                            spacing={1}
                            fontSize="3xs"
                            color="orange.600"
                            bg="orange.50"
                            p={1}
                            rounded="sm"
                          >
                            <Icon as={FiClock} />
                            <Text fontWeight="500">
                              Dalam antrean worker...
                            </Text>
                          </HStack>
                        )}

                        {/* Error indicator */}
                        {isFailed && (
                          <HStack
                            spacing={1}
                            fontSize="3xs"
                            color="red.600"
                            bg="red.50"
                            p={1}
                            rounded="sm"
                          >
                            <Icon as={FiAlertCircle} />
                            <Text noOfLines={1}>
                              {job.errorMessage || "Gagal menghasilkan file."}
                            </Text>
                          </HStack>
                        )}

                        {/* Footer details + Action Buttons */}
                        <Flex justify="space-between" align="center" pt={0.5}>
                          <HStack spacing={1.5} fontSize="3xs" color="gray.500">
                            {job.totalRecords != null && (
                              <Text>{job.totalRecords} Records</Text>
                            )}
                            {job.fileSizeKb != null && (
                              <Text>
                                • {job.fileSizeKb > 1024
                                  ? `${(job.fileSizeKb / 1024).toFixed(1)} MB`
                                  : `${job.fileSizeKb.toFixed(0)} KB`}
                              </Text>
                            )}
                          </HStack>

                          <HStack spacing={1}>
                            {isCompleted && (
                              <Button
                                size="xs"
                                colorScheme="blue"
                                bg="secondary.500"
                                _hover={{ bg: "secondary.600" }}
                                leftIcon={<FiDownload />}
                                fontSize="2xs"
                                h="22px"
                                px={2}
                                fontWeight="600"
                                rounded="md"
                                isLoading={isDownloadingId === job.id}
                                onClick={() => handleDownload(job)}
                              >
                                Unduh
                              </Button>
                            )}

                            <Tooltip label="Hapus riwayat">
                              <IconButton
                                aria-label="Hapus"
                                icon={<FiTrash2 />}
                                size="xs"
                                h="22px"
                                minW="22px"
                                variant="ghost"
                                colorScheme="red"
                                isLoading={isDeletingId === job.id}
                                onClick={() => handleDelete(job.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>
                      </VStack>
                    </Box>
                  );
                })}

                {/* Load More Button */}
                {hasMoreData && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    fontSize="2xs"
                    h="24px"
                    rightIcon={<FiChevronDown />}
                    isLoading={isLoadingMore}
                    onClick={handleLoadMore}
                    mt={1}
                  >
                    Muat Lebih Banyak ({jobs.length} dari {totalRecordsCount})
                  </Button>
                )}
              </VStack>
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" py={2} px={4}>
          <Button variant="ghost" size="xs" onClick={onClose}>
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DownloadManagerDrawer;
