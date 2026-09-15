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
  FormControl,
  FormLabel,
  Textarea,
  Select,
  useColorMode,
  Spinner,
  HStack,
  Input,
  Badge,
  SimpleGrid,
  Box,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import useProjects from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import InputTagsArea from "@/app/components/inputProps/InputMultiTagsArea";
import { formatDateWithLabels } from "@/app/helper/MasterHelper";
import { FiCheck, FiFileText } from "react-icons/fi";

interface StageReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  projectId: string;
  reportId?: string;
  onSuccess: () => void;
}

const StageReportFormModal = ({
  isOpen,
  onClose,
  stageId,
  projectId,
  reportId,
  onSuccess,
}: StageReportFormModalProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const {
    GetProjectSdlcStageReportById,
    InsertProjectSdlcStageReport,
    UpdateProjectSdlcStageReport,
  } = useProjects();

  const [tokenData, setTokenData] = useState<string>("");
  const [reportNote, setReportNote] = useState("");
  const [tagsReport, setTagsReport] = useState("");
  const [statusLabel, setStatusLabel] = useState("In Progress");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!reportId;

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (isOpen && reportId && tokenData) {
      loadReport();
    } else if (isOpen && !reportId) {
      resetForm();
    }
  }, [isOpen, reportId, tokenData]);

  const loadReport = async () => {
    if (!reportId || !tokenData) return;

    setIsLoading(true);
    const response = await GetProjectSdlcStageReportById(reportId, tokenData);
    if (response && response.statusCode === RES_CODE_OK && response.data) {
      setReportNote(response.data.reportNote);
      setTagsReport(response.data.tagsReport || "");
      setStatusLabel(response.data.statusLabel);

      if (response.data.reportStartDate) {
        const startDate = new Date(response.data.reportStartDate);
        setReportStartDate(startDate.toISOString().split("T")[0]);
      }
      if (response.data.reportEndDate) {
        const endDate = new Date(response.data.reportEndDate);
        setReportEndDate(endDate.toISOString().split("T")[0]);
      }
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setReportNote("");
    setTagsReport("");
    setStatusLabel("In Progress");
    setReportStartDate("");
    setReportEndDate("");
  };

  const handleSubmit = async () => {
    if (!reportNote.trim()) {
      showToast({
        description: "Catatan report wajib diisi",
        statusToast: "warning",
      });
      return;
    }

    if (reportStartDate && reportEndDate && reportStartDate > reportEndDate) {
      showToast({
        description: "Tanggal selesai report tidak boleh lebih awal dari tanggal mulai",
        statusToast: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (isEditMode && reportId) {
        response = await UpdateProjectSdlcStageReport(
          {
            id: reportId,
            reportNote: reportNote.trim(),
            tagsReport: tagsReport.trim() || undefined,
            statusLabel,
            reportStartDate: reportStartDate || undefined,
            reportEndDate: reportEndDate || undefined,
          },
          tokenData
        );
      } else {
        response = await InsertProjectSdlcStageReport(
          {
            projectId,
            projectFlowStagesId: stageId,
            reportNote: reportNote.trim(),
            tagsReport: tagsReport.trim() || undefined,
            statusLabel,
            reportStartDate: reportStartDate || undefined,
            reportEndDate: reportEndDate || undefined,
          },
          tokenData
        );
      }

      if (response && response.statusCode === RES_CODE_OK) {
        showToast({
          description: `Catatan report berhasil ${isEditMode ? "diperbarui" : "dibuat"}`,
          statusToast: "success",
        });
        onSuccess();
      } else {
        showToast({
          description: response?.message || `Gagal ${isEditMode ? "memperbarui" : "membuat"} report`,
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Terjadi kesalahan saat menyimpan catatan report",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader borderBottomWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} py={4}>
          <HStack spacing={3}>
            <Box
              p={2}
              bg={colorMode === "light" ? "blue.50" : "blue.900"}
              color="blue.500"
              rounded={radiusStyle}
            >
              <Icon as={FiFileText} boxSize={5} />
            </Box>
            <Box>
              <Heading size="sm">{isEditMode ? "Edit" : "Tambah"} Catatan Stage Report</Heading>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={2} />

        <ModalBody py={5}>
          {isLoading ? (
            <HStack justify="center" py={8}>
              <Spinner color="blue.500" />
            </HStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">
                  Catatan Aktivitas / Kendala / Progress
                </FormLabel>
                <Textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Tuliskan catatan detail progres atau kendala pada tahapan ini..."
                  rows={4}
                  rounded={radiusStyle}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Status Aktivitas</FormLabel>
                <Select
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                  rounded={radiusStyle}
                >
                  <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="Completed">Completed (Selesai)</option>
                  <option value="Blocked">Blocked (Terkendala / Menunggu)</option>
                  <option value="Under Review">Under Review (Sedang Direview)</option>
                  <option value="On Hold">On Hold (Ditunda)</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Tanggal Mulai (Opsional)</FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      rounded={radiusStyle}
                    />
                    {reportStartDate && (
                      <HStack spacing={1} fontSize="xs">
                        <Badge colorScheme="blue" fontSize="2xs">
                          W{formatDateWithLabels(reportStartDate).week}
                        </Badge>
                        <Badge colorScheme="purple" fontSize="2xs">
                          Q{formatDateWithLabels(reportStartDate).quarter}
                        </Badge>
                        <Badge colorScheme="gray" fontSize="2xs">
                          {formatDateWithLabels(reportStartDate).year}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Tanggal Target / Selesai (Opsional)</FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      min={reportStartDate || undefined}
                      rounded={radiusStyle}
                    />
                    {reportEndDate && (
                      <HStack spacing={1} fontSize="xs">
                        <Badge colorScheme="blue" fontSize="2xs">
                          W{formatDateWithLabels(reportEndDate).week}
                        </Badge>
                        <Badge colorScheme="purple" fontSize="2xs">
                          Q{formatDateWithLabels(reportEndDate).quarter}
                        </Badge>
                        <Badge colorScheme="gray" fontSize="2xs">
                          {formatDateWithLabels(reportEndDate).year}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">Tags / Label</FormLabel>
                <InputTagsArea
                  name="tagsReport"
                  value={tagsReport}
                  onChange={(val) => setTagsReport(val)}
                  placeholder="Ketik lalu tekan Enter atau koma untuk menambahkan tag"
                  isDisabled={isLoading}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} py={3}>
          <HStack spacing={3} justify="flex-end" w="full">
            <Button variant="ghost" size="sm" onClick={onClose} rounded={radiusStyle}>
              Batal
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={isLoading}
              leftIcon={<FiCheck />}
              rounded={radiusStyle}
            >
              {isEditMode ? "Perbarui Catatan" : "Simpan Catatan"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StageReportFormModal;
