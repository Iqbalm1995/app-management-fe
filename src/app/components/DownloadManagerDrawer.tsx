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
  Alert,
  AlertIcon,
  AlertDescription,
  Heading,
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
  FiShield,
  FiHardDrive,
  FiInbox,
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

  // Initial load when drawer opens (smooth transition)
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
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <DrawerContent
        bg={colorMode === "light" ? "white" : "gray.900"}
        shadow="2xl"
        maxW={{ base: "100%", md: "480px" }}
      >
        <DrawerCloseButton top={3} right={3} />
        
        {/* Drawer Header with Banking Design Pattern */}
        <DrawerHeader borderBottomWidth="1px" py={4} px={5}>
          <Flex justify="space-between" align="center" pr={8}>
            <HStack spacing={3}>
              <Flex
                p={2.5}
                rounded="xl"
                bg={colorMode === "light" ? "blue.50" : "blue.950"}
                color="blue.500"
                border="1px"
                borderColor={colorMode === "light" ? "blue.100" : "blue.800"}
              >
                <Icon as={FiDownload} boxSize={5} />
              </Flex>
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Heading size="sm" fontWeight="bold">
                    Pusat Unduhan
                  </Heading>
                  {activeCount > 0 && (
                    <Badge
                      colorScheme="blue"
                      rounded="full"
                      px={2}
                      py={0.5}
                      fontSize="2xs"
                      fontWeight="bold"
                    >
                      {activeCount} Aktif
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Antrean & riwayat ekspor dokumen
                </Text>
              </VStack>
            </HStack>

            <Tooltip label="Segarkan data">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCcw />}
                size="sm"
                variant="ghost"
                rounded="lg"
                isLoading={isLoading}
                onClick={() => fetchJobs(displayLimit)}
              />
            </Tooltip>
          </Flex>
        </DrawerHeader>

        <DrawerBody p={4}>
          <VStack spacing={3.5} align="stretch">
            {/* Security Notice Callout Banner (Matching Contract Detail Pattern) */}
            <Alert
              status="info"
              variant="left-accent"
              rounded="xl"
              bg={colorMode === "light" ? "blue.50/80" : "blue.950/40"}
              borderColor="blue.500"
              py={2.5}
              px={3.5}
            >
              <AlertIcon as={FiShield} color="blue.500" boxSize={4} />
              <AlertDescription
                fontSize="xs"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
                lineHeight="tall"
              >
                <strong>Proteksi Dokumen:</strong> Berkas ZIP hasil unduhan dilindungi kata sandi OTP yang dikirimkan langsung ke email resmi Bank bjb Anda.
              </AlertDescription>
            </Alert>

            {/* Search Input */}
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" boxSize={4} />
              </InputLeftElement>
              <Input
                placeholder="Cari judul laporan atau modul..."
                rounded="lg"
                fontSize="xs"
                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                _focus={{
                  borderColor: "blue.500",
                  bg: colorMode === "light" ? "white" : "gray.800",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Filter Tabs */}
            <Tabs
              size="sm"
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
              <TabList gap={1.5} flexWrap="wrap">
                <Tab fontSize="xs" px={3} py={1} fontWeight="500">
                  Semua ({totalRecordsCount || jobs.length})
                </Tab>
                <Tab fontSize="xs" px={3} py={1} fontWeight="500">
                  Proses ({activeCount})
                </Tab>
                <Tab fontSize="xs" px={3} py={1} fontWeight="500">
                  Selesai ({jobs.filter((j) => j.status === "COMPLETED").length})
                </Tab>
                <Tab fontSize="xs" px={3} py={1} fontWeight="500">
                  Gagal ({jobs.filter((j) => j.status === "FAILED").length})
                </Tab>
              </TabList>
            </Tabs>

            <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

            {/* List of Jobs */}
            {filteredJobs.length === 0 ? (
              <Box
                py={12}
                px={4}
                textAlign="center"
                color="gray.400"
                bg={colorMode === "light" ? "gray.50" : "gray.800/60"}
                rounded="xl"
                border="1px dashed"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              >
                <Flex
                  p={3}
                  rounded="full"
                  bg={colorMode === "light" ? "blue.50" : "gray.700"}
                  color="blue.500"
                  w="fit-content"
                  mx="auto"
                  mb={3}
                >
                  <Icon as={FiInbox} boxSize={6} />
                </Flex>
                <Heading size="xs" color={colorMode === "light" ? "gray.700" : "gray.300"} mb={1}>
                  Tidak Ada Berkas Unduhan
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Permintaan ekspor laporan atau dokumen Anda akan ditampilkan di sini.
                </Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {filteredJobs.map((job) => {
                  const isXlsx = job.exportType === "XLSX";
                  const isQueued = job.status === "QUEUED";
                  const isProcessing = job.status === "PROCESSING";
                  const isCompleted = job.status === "COMPLETED";
                  const isFailed = job.status === "FAILED";

                  return (
                    <Box
                      key={job.id}
                      p={4}
                      rounded="xl"
                      border="1px"
                      borderColor={
                        isProcessing
                          ? "blue.400"
                          : colorMode === "light"
                          ? "gray.200"
                          : "gray.700"
                      }
                      bg={
                        isProcessing
                          ? colorMode === "light"
                            ? "blue.50/50"
                            : "blue.950/30"
                          : colorMode === "light"
                          ? "white"
                          : "gray.800"
                      }
                      shadow="sm"
                      transition="all 0.2s ease"
                      _hover={{
                        borderColor: isProcessing
                          ? "blue.500"
                          : "blue.300",
                        shadow: "md",
                      }}
                    >
                      <VStack align="stretch" spacing={2.5}>
                        {/* Header Badges & Timestamp */}
                        <Flex justify="space-between" align="center" wrap="wrap" gap={1.5}>
                          <HStack spacing={1.5} flexWrap="wrap">
                            <Badge
                              colorScheme={isXlsx ? "green" : "red"}
                              fontSize="2xs"
                              px={2}
                              py={0.5}
                              rounded="md"
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              fontWeight="bold"
                            >
                              <Icon as={isXlsx ? FaFileExcel : FaFilePdf} boxSize={3} />
                              {job.exportType}
                            </Badge>
                            <Badge
                              colorScheme="purple"
                              fontSize="2xs"
                              px={2}
                              py={0.5}
                              rounded="md"
                              fontWeight="bold"
                            >
                              {job.moduleName}
                            </Badge>
                            {isCompleted && (
                              <Badge
                                colorScheme="teal"
                                fontSize="2xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                                display="inline-flex"
                                alignItems="center"
                                gap={1}
                                fontWeight="bold"
                              >
                                <Icon as={FiLock} boxSize={3} />
                                OTP Protected
                              </Badge>
                            )}
                          </HStack>

                          <Text fontSize="xs" color="gray.400" fontWeight="500">
                            {new Date(job.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • {new Date(job.createdAt).toLocaleDateString()}
                          </Text>
                        </Flex>

                        {/* Title */}
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color={colorMode === "light" ? "gray.800" : "white"}
                          lineHeight="short"
                        >
                          {job.reportTitle}
                        </Text>

                        {/* Progress Bar if Processing */}
                        {isProcessing && (
                          <VStack align="stretch" spacing={1.5} pt={1}>
                            <Flex justify="space-between" fontSize="xs">
                              <HStack spacing={1.5} color="blue.500">
                                <Spinner size="xs" />
                                <Text fontWeight="500">
                                  Menyusun data & dokumen...
                                </Text>
                              </HStack>
                              <Text fontWeight="bold" color="blue.600">
                                {job.progressPercentage || 15}%
                              </Text>
                            </Flex>
                            <Progress
                              value={job.progressPercentage || 15}
                              size="sm"
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
                            spacing={2}
                            fontSize="xs"
                            color="orange.700"
                            bg={colorMode === "light" ? "orange.50" : "orange.950/50"}
                            p={2}
                            rounded="md"
                            border="1px"
                            borderColor="orange.200"
                          >
                            <Icon as={FiClock} />
                            <Text fontWeight="500">
                              Dalam antrean pemrosesan worker...
                            </Text>
                          </HStack>
                        )}

                        {/* Error indicator */}
                        {isFailed && (
                          <HStack
                            spacing={2}
                            fontSize="xs"
                            color="red.700"
                            bg={colorMode === "light" ? "red.50" : "red.950/50"}
                            p={2}
                            rounded="md"
                            border="1px"
                            borderColor="red.200"
                          >
                            <Icon as={FiAlertCircle} />
                            <Text noOfLines={2} fontWeight="500">
                              {job.errorMessage || "Gagal memproses berkas ekspor."}
                            </Text>
                          </HStack>
                        )}

                        {/* Footer details + Action Buttons */}
                        <Flex justify="space-between" align="center" pt={1}>
                          <HStack spacing={2} fontSize="xs" color="gray.500">
                            {job.totalRecords != null && (
                              <HStack spacing={1}>
                                <Icon as={FiFileText} boxSize={3.5} />
                                <Text>{job.totalRecords.toLocaleString()} Records</Text>
                              </HStack>
                            )}
                            {job.fileSizeKb != null && (
                              <HStack spacing={1}>
                                <Icon as={FiHardDrive} boxSize={3.5} />
                                <Text>
                                  {job.fileSizeKb > 1024
                                    ? `${(job.fileSizeKb / 1024).toFixed(1)} MB`
                                    : `${job.fileSizeKb.toFixed(0)} KB`}
                                </Text>
                              </HStack>
                            )}
                          </HStack>

                          <HStack spacing={1.5}>
                            {isCompleted && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FiDownload />}
                                fontSize="xs"
                                h="32px"
                                px={3.5}
                                fontWeight="600"
                                rounded="lg"
                                shadow="sm"
                                isLoading={isDownloadingId === job.id}
                                loadingText="Mengunduh..."
                                onClick={() => handleDownload(job)}
                              >
                                Unduh
                              </Button>
                            )}

                            <Tooltip label="Hapus dari riwayat">
                              <IconButton
                                aria-label="Hapus"
                                icon={<FiTrash2 />}
                                size="sm"
                                h="32px"
                                minW="32px"
                                variant="ghost"
                                colorScheme="red"
                                rounded="lg"
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
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    fontSize="xs"
                    h="34px"
                    rounded="lg"
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

        <DrawerFooter
          borderTopWidth="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          py={3}
          px={5}
        >
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="xs" color="gray.500">
              Menampilkan {filteredJobs.length} dari {totalRecordsCount} berkas
            </Text>
            <Button variant="outline" size="sm" rounded="lg" onClick={onClose}>
              Tutup
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DownloadManagerDrawer;
