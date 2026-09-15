"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorMode,
  Divider,
  Card,
  CardBody,
  Badge,
  Icon,
  IconButton,
  Box,
  Spinner,
  Heading,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectSdlcStageResponse, ProjectSdlcStageReportResponse } from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import useSdlcFlowStage from "@/app/services/useSdlcFlowStage";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { formatDateWithLabels } from "@/app/helper/MasterHelper";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
  FiCheck,
  FiCalendar,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import StageReportFormModal from "./StageReportFormModal";

interface UpdateStageDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: ProjectSdlcStageResponse;
  onSuccess: () => void;
}

const UpdateStageDatesModal = ({
  isOpen,
  onClose,
  stage,
  onSuccess,
}: UpdateStageDatesModalProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const {
    UpdateProjectSdlcStageDates,
    UpdateStatusProject,
    ListProjectSdlcStageReports,
    DeleteProjectSdlcStageReport,
  } = useProjects();
  const { ListByFlowId: GetMasterStagesByFlowId } = useSdlcFlowStage();

  const [tokenData, setTokenData] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reports, setReports] = useState<ProjectSdlcStageReportResponse[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | undefined>();

  const [masterStageData, setMasterStageData] = useState<any>(null);
  const [isLoadingMasterStage, setIsLoadingMasterStage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (isOpen && stage && tokenData) {
      setStartDate(stage.startDate ? stage.startDate.split("T")[0] : "");
      setEndDate(stage.endDate ? stage.endDate.split("T")[0] : "");
      setPage(1);
      loadReports(1);
      loadMasterStageData();
    }
  }, [isOpen, stage, tokenData]);

  const loadMasterStageData = async () => {
    if (!tokenData || !stage.sdlcFlowId) return;

    setIsLoadingMasterStage(true);
    try {
      const response = await GetMasterStagesByFlowId(stage.sdlcFlowId, tokenData);
      if (response && response.statusCode === RES_CODE_OK && response.data) {
        const masterStage = response.data.find(
          (s: any) => s.stageName === stage.stageName || s.stageCode === stage.stageCode
        );
        setMasterStageData(masterStage);
      }
    } catch (error) {
      console.error("Error loading master stage data:", error);
    }
    setIsLoadingMasterStage(false);
  };

  const loadReports = async (pageNum: number = page) => {
    if (!tokenData || !stage) return;

    setIsLoadingReports(true);
    try {
      const response = await ListProjectSdlcStageReports(stage.id, pageNum, pageSize, tokenData);
      if (response && response.statusCode === RES_CODE_OK && Array.isArray(response.data)) {
        if (pageNum === 1) {
          setReports(response.data);
        } else {
          setReports((prev) => [...prev, ...(response.data || [])]);
        }
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    }
    setIsLoadingReports(false);
  };

  const handleSetToday = (field: "start" | "end") => {
    const today = new Date().toISOString().split("T")[0];
    if (field === "start") {
      setStartDate(today);
      if (endDate && endDate < today) {
        setEndDate("");
      }
    } else {
      if (!startDate) {
        setStartDate(today);
      }
      setEndDate(today);
    }
  };

  const handleClear = (field: "start" | "end") => {
    if (field === "start") {
      setStartDate("");
      setEndDate("");
    } else {
      setEndDate("");
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate && val && val > endDate) {
      setEndDate("");
    }
  };

  // Helper calculating stage metrics
  const calculateStageMetrics = () => {
    if (!startDate) {
      return {
        status: "NOT_STARTED",
        label: "Belum Dimulai",
        colorScheme: "gray",
        days: 0,
      };
    }

    if (startDate && !endDate) {
      const start = new Date(startDate);
      const today = new Date();
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return {
        status: "IN_PROGRESS",
        label: "Sedang Berjalan",
        colorScheme: "blue",
        days: diffDays,
      };
    }

    // Both start and end date exist
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
    return {
      status: "COMPLETED",
      label: "Selesai (Completed)",
      colorScheme: "green",
      days: diffDays,
    };
  };

  const stageMetrics = calculateStageMetrics();

  const handleSave = async () => {
    if (endDate && !startDate) {
      showToast({
        description: "Tanggal mulai wajib diisi terlebih dahulu jika tanggal selesai ditentukan",
        statusToast: "warning",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      showToast({
        description: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai",
        statusToast: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await UpdateProjectSdlcStageDates(
        stage.id,
        startDate || null,
        endDate || null,
        tokenData
      );

      if (response && response.statusCode === RES_CODE_OK) {
        showToast({
          description: "Periode tanggal stage berhasil disimpan",
          statusToast: "success",
        });

        // Trigger auto update project status if stage is completed and trigger is enabled
        if (
          endDate &&
          masterStageData?.stageTriggerStatus === "Y" &&
          masterStageData?.stageStatusAfterTriggerChange
        ) {
          try {
            const statusRes = await UpdateStatusProject(
              {
                projectId: stage.projectId,
                projectStatus: masterStageData.stageStatusAfterTriggerChange,
              },
              tokenData
            );
            if (statusRes && statusRes.statusCode === RES_CODE_OK) {
              showToast({
                description: `Status project otomatis diperbarui menjadi ${masterStageData.stageStatusAfterTriggerChange}`,
                statusToast: "info",
              });
            }
          } catch (statusErr) {
            console.error("Failed to auto-update project status:", statusErr);
          }
        }

        onSuccess();
        onClose();
      } else {
        showToast({
          description: response?.message || "Gagal memperbarui periode tanggal stage",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Terjadi kesalahan saat menyimpan tanggal stage",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan report ini?")) return;

    const response = await DeleteProjectSdlcStageReport(reportId, tokenData);
    if (response && response.statusCode === RES_CODE_OK) {
      showToast({
        description: "Report berhasil dihapus",
        statusToast: "success",
      });
      setPage(1);
      loadReports(1);
    } else {
      showToast({
        description: response?.message || "Gagal menghapus report",
        statusToast: "error",
      });
    }
  };

  const handleReportFormSuccess = () => {
    setIsReportFormOpen(false);
    setEditingReportId(undefined);
    setPage(1);
    loadReports(1);
  };

  const openAddReportModal = () => {
    setEditingReportId(undefined);
    setIsReportFormOpen(true);
  };

  const openEditReportModal = (reportId: string) => {
    setEditingReportId(reportId);
    setIsReportFormOpen(true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReports(nextPage);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("progress") || statusLower.includes("ongoing")) return "blue";
    if (statusLower.includes("complete") || statusLower.includes("done")) return "green";
    if (statusLower.includes("block") || statusLower.includes("issue")) return "red";
    if (statusLower.includes("review")) return "purple";
    return "gray";
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader borderBottomWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} py={4}>
            <HStack justify="space-between" pr={6}>
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg={colorMode === "light" ? "blue.50" : "blue.900"}
                  color="blue.500"
                  rounded={radiusStyle}
                >
                  <Icon as={FiCalendar} boxSize={5} />
                </Box>
                <Box>
                  <Heading size="sm">Manage Stage: {stage.stageName}</Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Urutan Posisi #{stage.stagePosOrder} {stage.stageCode ? `• Kode: ${stage.stageCode}` : ""}
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme={stageMetrics.colorScheme} px={3} py={1} rounded="full" fontSize="xs">
                {stageMetrics.label}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />

          <ModalBody py={5}>
            <VStack spacing={5} align="stretch">
              {/* Overview Status Card */}
              <Card
                variant="outline"
                rounded={radiusStyle}
                bg={colorMode === "light" ? "gray.50" : "gray.800"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              >
                <CardBody py={3} px={4}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="center">
                    <HStack spacing={3}>
                      <Icon as={FiClock} color="blue.500" boxSize={4} />
                      <Box>
                        <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                          Status Tahapan
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {stageMetrics.label}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiCalendar} color="green.500" boxSize={4} />
                      <Box>
                        <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                          Durasi Pengerjaan
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {stageMetrics.days > 0 ? `${stageMetrics.days} Hari` : "Belum Berjalan"}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="purple.500" boxSize={4} />
                      <Box>
                        <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                          Aktivitas Report
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {reports.length} Catatan
                        </Text>
                      </Box>
                    </HStack>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Date Inputs Section */}
              <Box
                bg={colorMode === "light" ? "white" : "gray.750"}
                p={4}
                rounded={radiusStyle}
                borderWidth="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              >
                <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} letterSpacing="wider">
                  Periode Jadwal Stage
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  {/* Start Date */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Tanggal Mulai (Start Date)
                    </FormLabel>
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          rounded={radiusStyle}
                        />
                        {startDate && (
                          <Tooltip label="Kosongkan tanggal mulai" hasArrow>
                            <IconButton
                              aria-label="Clear start date"
                              icon={<FiX />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClear("start")}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => handleSetToday("start")}
                          rounded={radiusStyle}
                        >
                          Set Hari Ini
                        </Button>
                        {startDate && (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="gray"
                            onClick={() => handleClear("start")}
                            rounded={radiusStyle}
                          >
                            Reset
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </FormControl>

                  {/* End Date */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Tanggal Selesai (End Date)
                    </FormLabel>
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || undefined}
                          isDisabled={!startDate}
                          placeholder="Pilih tanggal selesai..."
                          rounded={radiusStyle}
                        />
                        {endDate && (
                          <Tooltip label="Kosongkan tanggal selesai (Jadikan Ongoing)" hasArrow>
                            <IconButton
                              aria-label="Clear end date"
                              icon={<FiX />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleClear("end")}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="green"
                          isDisabled={!startDate}
                          onClick={() => handleSetToday("end")}
                          rounded={radiusStyle}
                        >
                          Selesai Hari Ini
                        </Button>
                        {endDate && (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => handleClear("end")}
                            rounded={radiusStyle}
                          >
                            Jadikan Ongoing
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </FormControl>
                </SimpleGrid>

                {/* Inline Helper / Warnings */}
                {!startDate && (
                  <HStack spacing={2} fontSize="xs" color="orange.500" mt={3} bg="orange.50" _dark={{ bg: "orange.950" }} p={2} rounded={radiusStyle}>
                    <Icon as={FiAlertTriangle} boxSize={3.5} />
                    <Text>Isi Tanggal Mulai terlebih dahulu untuk menjalankan tahapan ini.</Text>
                  </HStack>
                )}

                {startDate && !endDate && (
                  <HStack spacing={2} fontSize="xs" color="blue.500" mt={3} bg="blue.50" _dark={{ bg: "blue.950" }} p={2} rounded={radiusStyle}>
                    <Icon as={FiInfo} boxSize={3.5} />
                    <Text>Stage berstatus <b>Ongoing / Sedang Berjalan</b>. Isi Tanggal Selesai jika tahapan ini telah rampung.</Text>
                  </HStack>
                )}

                {startDate && endDate && (
                  <HStack spacing={2} fontSize="xs" color="green.600" mt={3} bg="green.50" _dark={{ bg: "green.950" }} p={2} rounded={radiusStyle}>
                    <Icon as={FiCheckCircle} boxSize={3.5} />
                    <Text>Stage ditandai <b>Selesai (Completed)</b> dengan durasi {stageMetrics.days} hari.</Text>
                  </HStack>
                )}
              </Box>

              {/* Trigger Automation Preview Card */}
              {masterStageData?.stageTriggerStatus === "Y" && (
                <Box
                  bg={colorMode === "light" ? "purple.50" : "purple.950"}
                  p={4}
                  rounded={radiusStyle}
                  borderWidth="1px"
                  borderColor={colorMode === "light" ? "purple.200" : "purple.800"}
                >
                  <HStack mb={2} justify="space-between">
                    <HStack>
                      <Icon as={FiCheckCircle} color="purple.500" boxSize={4} />
                      <Heading size="xs" color={colorMode === "light" ? "purple.800" : "purple.200"}>
                        Otomatisasi Status SDLC (Project Status Trigger)
                      </Heading>
                    </HStack>
                    <Badge colorScheme="purple" fontSize="2xs">
                      TRIGGER AKTIF
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={colorMode === "light" ? "purple.700" : "purple.300"} mb={2}>
                    Menyelesaikan tahapan ini (mengisi Tanggal Selesai) akan secara otomatis memicu pembaruan status project:
                  </Text>
                  <HStack spacing={2} bg={colorMode === "light" ? "white" : "purple.900"} p={2.5} rounded={radiusStyle} borderWidth="1px" borderColor={colorMode === "light" ? "purple.100" : "purple.700"}>
                    <Badge colorScheme="gray" fontSize="xs" px={2} py={0.5}>
                      {masterStageData?.stageStatusBeforeTiggerChange || "STATUS SAAT INI"}
                    </Badge>
                    <Icon as={FiArrowRight} color="purple.500" />
                    <Badge colorScheme="green" fontSize="xs" px={2} py={0.5}>
                      {masterStageData?.stageStatusAfterTriggerChange || "STATUS BARU"}
                    </Badge>
                  </HStack>
                </Box>
              )}

              <Divider />

              {/* Reports Section */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FiFileText} boxSize={4} color="blue.500" />
                    <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                      Stage Activity Reports & Notes
                    </Heading>
                    {reports.length > 0 && (
                      <Badge colorScheme="blue" fontSize="2xs" rounded="full">
                        {reports.length}
                      </Badge>
                    )}
                  </HStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    size="xs"
                    onClick={openAddReportModal}
                    rounded={radiusStyle}
                  >
                    Tambah Catatan
                  </Button>
                </HStack>

                {isLoadingReports && page === 1 ? (
                  <HStack justify="center" py={6}>
                    <Spinner size="sm" color="blue.500" />
                    <Text fontSize="xs" color="gray.500">Memuat catatan stage...</Text>
                  </HStack>
                ) : reports.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={6}
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                    rounded={radiusStyle}
                  >
                    <Icon as={FiFileText} boxSize={8} color="gray.400" mb={2} />
                    <Text color="gray.500" fontSize="xs" mb={2}>
                      Belum ada catatan aktivitas atau blocker untuk tahapan ini.
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      variant="outline"
                      size="xs"
                      onClick={openAddReportModal}
                      rounded={radiusStyle}
                    >
                      Buat Catatan Pertama
                    </Button>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {reports.map((report) => (
                      <Card
                        key={report.id}
                        variant="outline"
                        size="sm"
                        rounded={radiusStyle}
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      >
                        <CardBody py={3} px={4}>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between" align="start">
                              <HStack spacing={2}>
                                <Badge colorScheme={getStatusColor(report.statusLabel)} fontSize="xs" rounded="sm">
                                  {report.statusLabel}
                                </Badge>
                                {(report.reportStartDate || report.reportEndDate) && (
                                  <HStack spacing={1} fontSize="2xs" color="gray.500">
                                    <Icon as={FiCalendar} />
                                    <Text>
                                      {report.reportStartDate && report.reportEndDate
                                        ? `${formatDate(report.reportStartDate)} - ${formatDate(report.reportEndDate)}`
                                        : report.reportStartDate
                                        ? `Mulai: ${formatDate(report.reportStartDate)}`
                                        : `Target: ${formatDate(report.reportEndDate)}`}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                              <HStack spacing={1}>
                                <Tooltip label="Edit Catatan" hasArrow>
                                  <IconButton
                                    aria-label="Edit"
                                    icon={<FiEdit2 />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => openEditReportModal(report.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Hapus Catatan" hasArrow>
                                  <IconButton
                                    aria-label="Delete"
                                    icon={<FiTrash2 />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteReport(report.id)}
                                  />
                                </Tooltip>
                              </HStack>
                            </HStack>

                            <Text fontSize="xs" whiteSpace="pre-wrap" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                              {report.reportNote}
                            </Text>

                            {report.tagsReport && (
                              <HStack spacing={1} flexWrap="wrap">
                                {report.tagsReport.split(",").map((tag, i) => (
                                  <Badge key={i} variant="subtle" colorScheme="gray" fontSize="2xs" rounded="sm">
                                    #{tag.trim()}
                                  </Badge>
                                ))}
                              </HStack>
                            )}

                            <HStack justify="space-between" fontSize="2xs" color="gray.400" pt={1} borderTopWidth="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.750"}>
                              <Text>Oleh: {report.createdByName || "System"}</Text>
                              <Text>{formatDate(report.createdAt)}</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}

                    {reports.length >= pageSize && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleLoadMore}
                        isLoading={isLoadingReports}
                        rounded={radiusStyle}
                      >
                        Muat Lebih Banyak Catatan...
                      </Button>
                    )}
                  </VStack>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} py={3}>
            <HStack spacing={3} justify="flex-end" w="full">
              <Button variant="ghost" size="sm" onClick={onClose} rounded={radiusStyle}>
                Batal
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleSave}
                isLoading={isSubmitting}
                leftIcon={<FiCheck />}
                rounded={radiusStyle}
              >
                Simpan Perubahan Stage
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <StageReportFormModal
        isOpen={isReportFormOpen}
        onClose={() => {
          setIsReportFormOpen(false);
          setEditingReportId(undefined);
        }}
        stageId={stage.id}
        projectId={stage.projectId}
        reportId={editingReportId}
        onSuccess={handleReportFormSuccess}
      />
    </>
  );
};

export default UpdateStageDatesModal;
