"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
  FiTrash2,
  FiRefreshCcw,
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiLayers,
  FiHardDrive,
  FiFilter,
  FiInfo,
} from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useDownloadManager, {
  DownloadManagerItemResponse,
} from "@/app/services/useDownloadManager";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Download Manager & Export Center",
  breadCrumb: ["Home", "Reports", "Download Manager"],
};

function DownloadManagerPage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.700");

  const [tokenData, setTokenData] = useState<string>("");
  const [dataReport, setDataReport] = useState<DownloadManagerItemResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [formatFilter, setFormatFilter] = useState<string>("ALL");

  // Pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Action states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedFilterJob, setSelectedFilterJob] = useState<DownloadManagerItemResponse | null>(null);
  const {
    isOpen: isFilterModalOpen,
    onOpen: onOpenFilterModal,
    onClose: onCloseFilterModal,
  } = useDisclosure();

  // Delete Alert
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onOpenDeleteAlert,
    onClose: onCloseDeleteAlert,
  } = useDisclosure();
  const cancelDeleteRef = React.useRef<any>(null);

  const {
    ListDownloadJobs,
    DeleteDownloadJob,
    DownloadExportFile,
    isLoading: isActionLoading,
  } = useDownloadManager();

  // Load token on mount
  useEffect(() => {
    const token = localStorage.getItem("tokenData");
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    if (!tokenData) return;
    setIsLoadingData(true);

    const res = await ListDownloadJobs(
      {
        search: globalFilter,
        limit: 100, // Fetch up to 100 records for client-side filtering & paging
        page: 0,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      },
      tokenData
    );

    if (res?.statusCode === RES_CODE_OK && res.data) {
      setDataReport(res.data);
      setTotalCount(res.data.length);
    }
    setIsLoadingData(false);
  }, [tokenData, globalFilter, ListDownloadJobs]);

  // Initial load
  useEffect(() => {
    if (tokenData) {
      fetchJobs();
    }
  }, [tokenData, fetchJobs]);

  // Auto-polling when active jobs exist
  useEffect(() => {
    if (!tokenData) return;

    const hasActiveJobs = dataReport.some(
      (j) => j.status === "QUEUED" || j.status === "PROCESSING"
    );

    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 3000);

    return () => clearInterval(interval);
  }, [tokenData, dataReport, fetchJobs]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataReport.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (moduleFilter !== "ALL" && item.moduleName !== moduleFilter) return false;
      if (formatFilter !== "ALL" && item.exportType !== formatFilter) return false;
      return true;
    });
  }, [dataReport, statusFilter, moduleFilter, formatFilter]);

  // Metric computations
  const metrics = useMemo(() => {
    const total = dataReport.length;
    const completed = dataReport.filter((j) => j.status === "COMPLETED").length;
    const active = dataReport.filter(
      (j) => j.status === "QUEUED" || j.status === "PROCESSING"
    ).length;
    const totalKb = dataReport.reduce(
      (acc, curr) => acc + (curr.fileSizeKb || 0),
      0
    );
    const formattedStorage =
      totalKb > 1024
        ? `${(totalKb / 1024).toFixed(1)} MB`
        : `${totalKb.toFixed(0)} KB`;

    return { total, completed, active, formattedStorage };
  }, [dataReport]);

  // Handle Download
  const handleDownload = async (job: DownloadManagerItemResponse) => {
    if (!tokenData) return;
    setDownloadingId(job.id);
    const fileName =
      job.fileName ||
      `${job.reportTitle.replace(/\s+/g, "_")}_${job.id}.${job.exportType.toLowerCase()}`;
    const success = await DownloadExportFile(job.id, fileName, tokenData);
    if (success) {
      showToast({
        description: `File ${fileName} berhasil diunduh dari MinIO.`,
        statusToast: "success",
      });
    } else {
      showToast({
        description: "Gagal mengunduh file dari storage.",
        statusToast: "error",
      });
    }
    setDownloadingId(null);
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTargetId || !tokenData) return;
    setIsDeleting(true);
    const res = await DeleteDownloadJob(deleteTargetId, tokenData);
    if (res?.statusCode === RES_CODE_OK) {
      setDataReport((prev) => prev.filter((j) => j.id !== deleteTargetId));
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
    setIsDeleting(false);
    onCloseDeleteAlert();
    setDeleteTargetId(null);
  };

  // Table Columns Definition
  const columns = useMemo<ColumnDef<DownloadManagerItemResponse>[]>(
    () => [
      {
        id: "no",
        header: () => <Text textAlign="center">No</Text>,
        cell: (info) => (
          <Text fontSize="sm" textAlign="center" fontWeight="500">
            {pageIndex * pageSize + info.row.index + 1}
          </Text>
        ),
        size: 50,
      },
      {
        accessorKey: "reportTitle",
        header: "Informasi Laporan",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                {item.reportTitle}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="purple" fontSize="3xs" rounded="md" px={1.5}>
                  {item.moduleName}
                </Badge>
                {item.userName && (
                  <Text fontSize="3xs" color="gray.500">
                    Oleh: {item.userName}
                  </Text>
                )}
              </HStack>
            </VStack>
          );
        },
      },
      {
        accessorKey: "exportType",
        header: "Format",
        cell: (info) => {
          const isXlsx = info.row.original.exportType === "XLSX";
          return (
            <Badge
              colorScheme={isXlsx ? "green" : "red"}
              fontSize="2xs"
              px={2}
              py={1}
              rounded="md"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
            >
              <Icon as={isXlsx ? FaFileExcel : FaFilePdf} boxSize={3} />
              {info.row.original.exportType}
            </Badge>
          );
        },
      },
      {
        id: "metadata",
        header: "Ukuran & Record",
        cell: (info) => {
          const item = info.row.original;
          return (
            <VStack align="start" spacing={0.5}>
              <Text fontSize="xs" fontWeight="600">
                {item.totalRecords != null ? `${item.totalRecords} Records` : "-"}
              </Text>
              <Text fontSize="3xs" color="gray.500">
                {item.fileSizeKb != null
                  ? item.fileSizeKb > 1024
                    ? `${(item.fileSizeKb / 1024).toFixed(1)} MB`
                    : `${item.fileSizeKb.toFixed(0)} KB`
                  : "-"}
              </Text>
            </VStack>
          );
        },
      },
      {
        id: "filterSnapshot",
        header: "Parameter Filter",
        cell: (info) => {
          const item = info.row.original;
          const hasFilters = Boolean(item.filterParamsJson && item.filterParamsJson !== "{}");
          return (
            <Button
              size="xs"
              variant="outline"
              colorScheme="blue"
              leftIcon={<FiFilter />}
              isDisabled={!hasFilters}
              onClick={() => {
                setSelectedFilterJob(item);
                onOpenFilterModal();
              }}
            >
              Lihat Filter
            </Button>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status & Progress",
        cell: (info) => {
          const item = info.row.original;
          if (item.status === "COMPLETED") {
            return (
              <Badge
                colorScheme="green"
                fontSize="2xs"
                px={2}
                py={1}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiCheckCircle} />
                Siap Diunduh
              </Badge>
            );
          }
          if (item.status === "PROCESSING") {
            return (
              <Box minW="130px">
                <HStack justify="space-between" fontSize="3xs" mb={1} color="blue.500">
                  <HStack spacing={1}>
                    <Spinner size="xs" />
                    <Text fontWeight="600">Memproses...</Text>
                  </HStack>
                  <Text fontWeight="bold">{item.progressPercentage}%</Text>
                </HStack>
                <Progress
                  value={item.progressPercentage || 20}
                  size="xs"
                  colorScheme="blue"
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
                colorScheme="orange"
                fontSize="2xs"
                px={2}
                py={1}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FiClock} />
                Dalam Antrean
              </Badge>
            );
          }
          return (
            <Tooltip label={item.errorMessage || "Gagal menghasilkan dokumen"}>
              <Badge
                colorScheme="red"
                fontSize="2xs"
                px={2}
                py={1}
                rounded="full"
                display="inline-flex"
                alignItems="center"
                gap={1}
                cursor="pointer"
              >
                <Icon as={FiAlertCircle} />
                Gagal
              </Badge>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Waktu Permintaan",
        cell: (info) => {
          const date = new Date(info.row.original.createdAt);
          return (
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="500">
                {date.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text fontSize="3xs" color="gray.500">
                {date.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </VStack>
          );
        },
      },
      {
        id: "actions",
        header: () => <Text textAlign="center">Aksi</Text>,
        cell: (info) => {
          const item = info.row.original;
          const isCompleted = item.status === "COMPLETED";
          return (
            <HStack spacing={1.5} justify="center">
              <Tooltip label="Unduh file dari MinIO">
                <Button
                  size="xs"
                  colorScheme="blue"
                  bg="secondary.500"
                  _hover={{ bg: "secondary.600" }}
                  leftIcon={<FiDownload />}
                  isDisabled={!isCompleted}
                  isLoading={downloadingId === item.id}
                  onClick={() => handleDownload(item)}
                >
                  Unduh
                </Button>
              </Tooltip>
              <Tooltip label="Hapus riwayat">
                <IconButton
                  aria-label="Hapus"
                  icon={<FiTrash2 />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setDeleteTargetId(item.id);
                    onOpenDeleteAlert();
                  }}
                />
              </Tooltip>
            </HStack>
          );
        },
      },
    ],
    [pageIndex, pageSize, downloadingId]
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
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      {/* Top Metric Cards */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <Card bg={statBg} rounded={radiusStyle} shadow="xs" border="1px" borderColor={borderColor}>
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="600">
                  Total Riwayat Ekspor
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold">
                  {metrics.total}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.400" mb={0}>
                  Seluruh file yang diminta
                </StatHelpText>
              </Stat>
              <Box p={3} bg="blue.50" rounded="xl" color="blue.500">
                <Icon as={FiLayers} boxSize={6} />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={statBg} rounded={radiusStyle} shadow="xs" border="1px" borderColor={borderColor}>
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="600">
                  File Siap Diunduh
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                  {metrics.completed}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.400" mb={0}>
                  Tersimpan di MinIO Storage
                </StatHelpText>
              </Stat>
              <Box p={3} bg="green.50" rounded="xl" color="green.500">
                <Icon as={FiCheckCircle} boxSize={6} />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={statBg} rounded={radiusStyle} shadow="xs" border="1px" borderColor={borderColor}>
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="600">
                  Sedang Diproses
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">
                  {metrics.active}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.400" mb={0}>
                  Worker background queue
                </StatHelpText>
              </Stat>
              <Box p={3} bg="orange.50" rounded="xl" color="orange.500">
                <Icon as={FiClock} boxSize={6} />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={statBg} rounded={radiusStyle} shadow="xs" border="1px" borderColor={borderColor}>
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel fontSize="xs" color="gray.500" fontWeight="600">
                  Total Ruang Storage
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">
                  {metrics.formattedStorage}
                </StatNumber>
                <StatHelpText fontSize="3xs" color="gray.400" mb={0}>
                  Media Object Allocation
                </StatHelpText>
              </Stat>
              <Box p={3} bg="purple.50" rounded="xl" color="purple.500">
                <Icon as={FiHardDrive} boxSize={6} />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Filter & Table Container */}
      <Card bg={cardBg} rounded={radiusStyle} shadow="xs" border="1px" borderColor={borderColor} mb={5}>
        <CardHeader borderBottomWidth="1px" borderColor={borderColor} py={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Heading as="h5" size="md">
                Daftar File Unduhan
              </Heading>
              <Badge colorScheme="blue" rounded="full" px={2.5} py={0.5}>
                {filteredData.length} File
              </Badge>
            </HStack>

            <Button
              size="sm"
              leftIcon={<FiRefreshCcw />}
              isLoading={isLoadingData}
              onClick={fetchJobs}
            >
              Segarkan
            </Button>
          </Flex>
        </CardHeader>

        <CardBody p={4}>
          {/* Filters Row */}
          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(12, 1fr)" }} gap={3} mb={4}>
            <GridItem colSpan={{ base: 1, sm: 2, lg: 4 }}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Cari judul laporan atau file..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  rounded="lg"
                />
              </InputGroup>
            </GridItem>

            <GridItem colSpan={{ base: 1, sm: 1, lg: 3 }}>
              <Select
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                rounded="lg"
              >
                <option value="ALL">Semua Status</option>
                <option value="COMPLETED">Siap Diunduh (Completed)</option>
                <option value="PROCESSING">Sedang Diproses (Processing)</option>
                <option value="QUEUED">Dalam Antrean (Queued)</option>
                <option value="FAILED">Gagal (Failed)</option>
              </Select>
            </GridItem>

            <GridItem colSpan={{ base: 1, sm: 1, lg: 2 }}>
              <Select
                size="sm"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                rounded="lg"
              >
                <option value="ALL">Semua Format</option>
                <option value="XLSX">Excel (.xlsx)</option>
                <option value="PDF">PDF (.pdf)</option>
              </Select>
            </GridItem>

            <GridItem colSpan={{ base: 1, sm: 1, lg: 3 }}>
              <Select
                size="sm"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                rounded="lg"
              >
                <option value="ALL">Semua Modul</option>
                <option value="PROJECT_PORTFOLIO">PROJECT_PORTFOLIO</option>
              </Select>
            </GridItem>
          </Grid>

          {/* Table */}
          {isLoadingData ? (
            <LoadingMiniSignature />
          ) : filteredData.length === 0 ? (
            <Box py={12} textAlign="center" color="gray.400">
              <Icon as={FiFileText} boxSize={10} mb={2} />
              <Text fontSize="sm" fontWeight="500">
                Tidak ada riwayat unduhan yang cocok dengan filter.
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto" border="1px" borderColor={tableBorderColor} rounded="lg">
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
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Th>
                      ))}
                    </Tr>
                  ))}
                </Thead>
                <Tbody>
                  {table.getRowModel().rows.map((row) => (
                    <Tr
                      key={row.id}
                      _hover={{
                        bg: colorMode === "light" ? "gray.50" : "gray.750",
                      }}
                      transition="background 0.15s"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} py={3}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                  {table.getPageCount() || 1}
                </Text>
                <Select
                  size="xs"
                  w="75px"
                  rounded="md"
                  value={pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 20, 50].map((size) => (
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
                  Sebelumnya
                </Button>
                <Button
                  size="xs"
                  onClick={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  Selanjutnya
                </Button>
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Filter Parameters Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={onCloseFilterModal} size="lg">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(3px)" />
        <ModalContent rounded="xl" bg={cardBg}>
          <ModalHeader borderBottomWidth="1px" py={3}>
            <HStack spacing={2}>
              <Icon as={FiFilter} color="blue.500" />
              <Text fontSize="md" fontWeight="bold">
                Parameter Filter Ekspor
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={4}>
            {selectedFilterJob && (
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg={colorMode === "light" ? "blue.50" : "blue.950/40"} rounded="lg">
                  <Text fontSize="xs" fontWeight="700" color="blue.600">
                    {selectedFilterJob.reportTitle}
                  </Text>
                  <Text fontSize="3xs" color="gray.500">
                    Modul: {selectedFilterJob.moduleName} • Format: {selectedFilterJob.exportType}
                  </Text>
                </Box>

                <Text fontSize="xs" fontWeight="600">
                  Parameter Raw JSON:
                </Text>
                <Box
                  as="pre"
                  p={3}
                  bg={colorMode === "light" ? "gray.50" : "gray.900"}
                  border="1px"
                  borderColor={borderColor}
                  rounded="lg"
                  fontSize="2xs"
                  maxH="240px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                >
                  {selectedFilterJob.filterParamsJson
                    ? JSON.stringify(
                        JSON.parse(selectedFilterJob.filterParamsJson),
                        null,
                        2
                      )
                    : "Tidak ada parameter."}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" py={2}>
            <Button size="sm" onClick={onCloseFilterModal}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onCloseDeleteAlert}
      >
        <AlertDialogOverlay bg="blackAlpha.500" backdropFilter="blur(3px)">
          <AlertDialogContent rounded="xl" bg={cardBg}>
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              Hapus Riwayat Unduhan
            </AlertDialogHeader>
            <AlertDialogBody fontSize="sm">
              Apakah Anda yakin ingin menghapus file ini dari riwayat unduhan?
              File terkait di storage MinIO juga akan dibersihkan.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} size="sm" onClick={onCloseDeleteAlert}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                onClick={confirmDelete}
                ml={3}
                isLoading={isDeleting}
              >
                Hapus File
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </LayoutAdmin>
  );
}

export default DownloadManagerPage;
