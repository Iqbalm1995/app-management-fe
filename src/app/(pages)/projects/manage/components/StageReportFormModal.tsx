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
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import useProjects from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import InputTagsArea from "@/app/components/inputProps/InputMultiTagsArea";
import { formatDateWithLabels } from "@/app/helper/MasterHelper";

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
      
      // Convert ISO datetime to YYYY-MM-DD format for date input
      if (response.data.reportStartDate) {
        const startDate = new Date(response.data.reportStartDate);
        setReportStartDate(startDate.toISOString().split('T')[0]);
      }
      if (response.data.reportEndDate) {
        const endDate = new Date(response.data.reportEndDate);
        setReportEndDate(endDate.toISOString().split('T')[0]);
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
        description: "Report note is required",
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
          description: `Report ${isEditMode ? "updated" : "created"} successfully`,
          statusToast: "success",
        });
        onSuccess();
      } else {
        showToast({
          description: response?.message || `Failed to ${isEditMode ? "update" : "create"} report`,
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader>{isEditMode ? "Edit" : "Add"} Stage Report</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <HStack justify="center" py={8}>
              <Spinner />
            </HStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Report Note</FormLabel>
                <Textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Enter report details..."
                  rows={6}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Under Review">Under Review</option>
                  <option value="On Hold">On Hold</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Report Start Date</FormLabel>
                <VStack spacing={2} align="stretch">
                  <Input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                  {reportStartDate && (
                    <HStack spacing={2} fontSize="sm">
                      <Badge colorScheme="blue">
                        W{formatDateWithLabels(reportStartDate).week}
                      </Badge>
                      <Badge colorScheme="purple">
                        Q{formatDateWithLabels(reportStartDate).quarter}
                      </Badge>
                      <Badge colorScheme="gray">
                        {formatDateWithLabels(reportStartDate).year}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>Report End Date</FormLabel>
                <VStack spacing={2} align="stretch">
                  <Input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    min={reportStartDate || undefined}
                    isDisabled={!reportStartDate}
                  />
                  {reportEndDate && (
                    <HStack spacing={2} fontSize="sm">
                      <Badge colorScheme="blue">
                        W{formatDateWithLabels(reportEndDate).week}
                      </Badge>
                      <Badge colorScheme="purple">
                        Q{formatDateWithLabels(reportEndDate).quarter}
                      </Badge>
                      <Badge colorScheme="gray">
                        {formatDateWithLabels(reportEndDate).year}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <InputTagsArea
                  name="tagsReport"
                  value={tagsReport}
                  onChange={(val) => setTagsReport(val)}
                  placeholder="Type and press Enter or comma to add tags"
                  isDisabled={isLoading}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StageReportFormModal;
