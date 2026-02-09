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
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectSdlcStageResponse, ProjectSdlcStageReportResponse } from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
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
  const { UpdateProjectSdlcStageDates, ListProjectSdlcStageReports, DeleteProjectSdlcStageReport } = useProjects();

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

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (isOpen && stage) {
      setStartDate(stage.startDate ? stage.startDate.split("T")[0] : "");
      setEndDate(stage.endDate ? stage.endDate.split("T")[0] : "");
      setPage(1);
      loadReports(1);
    }
  }, [isOpen, stage]);

  // Auto-clear end date if start date is changed to be after end date
  useEffect(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setEndDate("");
    }
  }, [startDate, endDate]);

  const loadReports = async (pageNum: number = page) => {
    if (!tokenData || !stage) return;

    setIsLoadingReports(true);
    const response = await ListProjectSdlcStageReports(stage.id, pageNum, pageSize, tokenData);
    if (response && response.statusCode === RES_CODE_OK && response.data) {
      if (pageNum === 1) {
        setReports(response.data);
      } else {
        setReports([...reports, ...response.data]);
      }
    }
    setIsLoadingReports(false);
  };

  const handleSetCurrentDate = (field: "start" | "end") => {
    const today = new Date().toISOString().split("T")[0];
    if (field === "start") {
      setStartDate(today);
    } else {
      setEndDate(today);
    }
  };

  const handleClear = (field: "start" | "end") => {
    if (field === "start") {
      setStartDate("");
    } else {
      setEndDate("");
    }
  };

  const handleSave = async () => {
    // Validation: End date requires start date
    if (endDate && !startDate) {
      showToast({
        description: "Start date is required when setting end date",
        statusToast: "warning",
      });
      return;
    }

    // Validation: End date cannot be before start date
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      showToast({
        description: "End date cannot be earlier than start date",
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
          description: "Stage dates updated successfully",
          statusToast: "success",
        });
        onSuccess();
      } else {
        showToast({
          description: response?.message || "Failed to update dates",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while updating dates",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    const response = await DeleteProjectSdlcStageReport(reportId, tokenData);
    if (response && response.statusCode === RES_CODE_OK) {
      showToast({
        description: "Report deleted successfully",
        statusToast: "success",
      });
      setPage(1);
      loadReports(1);
    } else {
      showToast({
        description: response?.message || "Failed to delete report",
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("progress") || statusLower.includes("ongoing")) return "blue";
    if (statusLower.includes("complete") || statusLower.includes("done")) return "green";
    if (statusLower.includes("block") || statusLower.includes("issue")) return "red";
    if (statusLower.includes("review")) return "purple";
    return "gray";
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader>Manage Stage - {stage.stageName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Date Management Section */}
              <Box>
                <Heading size="sm" mb={4}>Stage Dates</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Start Date</FormLabel>
                    <VStack spacing={2} align="stretch">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <HStack>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetCurrentDate("start")}
                        >
                          Set Current Date
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleClear("start")}
                        >
                          Clear
                        </Button>
                      </HStack>
                    </VStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <VStack spacing={2} align="stretch">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                        isDisabled={!startDate}
                      />
                      <HStack>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetCurrentDate("end")}
                          isDisabled={!startDate}
                        >
                          Set Current Date
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleClear("end")}
                          isDisabled={!startDate}
                        >
                          Clear
                        </Button>
                      </HStack>
                      {!startDate && (
                        <Text fontSize="xs" color="orange.500">
                          Start date must be set first
                        </Text>
                      )}
                    </VStack>
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    isLoading={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </Box>

              <Divider />

              {/* Reports Section */}
              <Box>
                <HStack justify="space-between" mb={4}>
                  <HStack>
                    <Icon as={FiFileText} boxSize={5} />
                    <Heading size="sm">Stage Reports</Heading>
                  </HStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    size="sm"
                    onClick={openAddReportModal}
                  >
                    Add Report
                  </Button>
                </HStack>

                {isLoadingReports && page === 1 ? (
                  <HStack justify="center" py={8}>
                    <Spinner size="sm" />
                    <Text fontSize="sm">Loading reports...</Text>
                  </HStack>
                ) : reports.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Icon as={FiFileText} boxSize={10} color="gray.400" mb={3} />
                    <Text color="gray.500" fontSize="sm">No reports yet</Text>
                    <Button
                      mt={3}
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={openAddReportModal}
                    >
                      Add First Report
                    </Button>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {reports.map((report) => (
                      <Card key={report.id} variant="outline" size="sm">
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between" align="start">
                              <Badge colorScheme={getStatusColor(report.statusLabel)} fontSize="xs">
                                {report.statusLabel}
                              </Badge>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Edit"
                                  icon={<FiEdit2 />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => openEditReportModal(report.id)}
                                />
                                <IconButton
                                  aria-label="Delete"
                                  icon={<FiTrash2 />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteReport(report.id)}
                                />
                              </HStack>
                            </HStack>

                            <Text fontSize="sm" whiteSpace="pre-wrap" noOfLines={3}>
                              {report.reportNote}
                            </Text>

                            {report.tagsReport && (
                              <HStack spacing={1} flexWrap="wrap">
                                {report.tagsReport.split(",").map((tag, i) => (
                                  <Badge key={i} variant="subtle" colorScheme="gray" fontSize="xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </HStack>
                            )}

                            <HStack justify="space-between" fontSize="xs" color="gray.500">
                              <Text>By: {report.createdByName}</Text>
                              <Text>{formatDate(report.createdAt)}</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}

                    {reports.length >= pageSize && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        isLoading={isLoadingReports}
                      >
                        Load More
                      </Button>
                    )}
                  </VStack>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
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
