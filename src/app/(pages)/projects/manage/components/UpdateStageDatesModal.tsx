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
import { formatDateWithLabels } from "@/app/helper/MasterHelper";
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiCheckCircle, FiAlertTriangle, FiInfo, FiX, FiCheck } from "react-icons/fi";
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
  const [openConfirmEndStage, setOpenConfirmEndStage] = useState(false);
  const [openConfirmClearEndDate, setOpenConfirmClearEndDate] = useState(false);
  const [isEndDateUnlocked, setIsEndDateUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(5);

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
      setIsEndDateUnlocked(!!stage.endDate);
      setPage(1);
      loadReports(1);
    }
  }, [isOpen, stage]);

  // Auto-clear end date if start date is changed to be after end date
  useEffect(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setEndDate("");
      setIsEndDateUnlocked(false);
    }
  }, [startDate, endDate]);

  // Countdown timer for confirmation modals
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (openConfirmEndStage || openConfirmClearEndDate) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [openConfirmEndStage, openConfirmClearEndDate]);

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
      setEndDate("");
      setIsEndDateUnlocked(false);
    } else {
      handleOpenClearEndDateConfirm();
    }
  };

  const handleOpenEndStageConfirm = () => {
    if (!startDate) {
      showToast({
        description: "Start date must be set first",
        statusToast: "warning",
      });
      return;
    }
    setOpenConfirmEndStage(true);
  };

  const handleConfirmEndStage = () => {
    setIsEndDateUnlocked(true);
    const today = new Date().toISOString().split("T")[0];
    setEndDate(today);
    showToast({
      description: "You can now set the end date for this stage",
      statusToast: "info",
    });
  };

  const handleOpenClearEndDateConfirm = () => {
    setOpenConfirmClearEndDate(true);
  };

  const handleConfirmClearEndDate = () => {
    setEndDate("");
    setIsEndDateUnlocked(false);
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
                    <VStack spacing={3} align="stretch">
                      {/* End Stage Button */}
                      {startDate && !isEndDateUnlocked && (
                        <Card
                          bg={colorMode === "light" ? "green.50" : "green.900"}
                          borderColor={colorMode === "light" ? "green.200" : "green.700"}
                          borderWidth="1px"
                        >
                          <CardBody>
                            <VStack spacing={2} align="stretch">
                              <Button
                                leftIcon={<Icon as={FiCheckCircle} />}
                                colorScheme="green"
                                size="md"
                                onClick={handleOpenEndStageConfirm}
                              >
                                End Stage - {stage.stageName}
                              </Button>
                              <Text fontSize="xs" color={colorMode === "light" ? "green.700" : "green.300"}>
                                Click to mark this stage as complete and set end date
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      )}

                      {/* Date Input */}
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                        isDisabled={!startDate || !isEndDateUnlocked}
                      />

                      {/* Action Buttons */}
                      {isEndDateUnlocked && (
                        <HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetCurrentDate("end")}
                          >
                            Set Current Date
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleClear("end")}
                          >
                            Clear
                          </Button>
                        </HStack>
                      )}

                      {/* Helper Text */}
                      {!startDate && (
                        <Text fontSize="xs" color="orange.500">
                          Start date must be set first
                        </Text>
                      )}
                      {startDate && !isEndDateUnlocked && (
                        <Text fontSize="xs" color="blue.500">
                          Click "End Stage" button to mark this stage as complete
                        </Text>
                      )}
                      {isEndDateUnlocked && (
                        <Text fontSize="xs" color="green.500">
                          ✓ Setting end date marks this stage as COMPLETE
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

                            {(report.reportStartDate || report.reportEndDate) && (
                              <Box
                                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                                p={2}
                                rounded="md"
                                borderWidth="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                              >
                                <VStack spacing={1} align="stretch" fontSize="xs">
                                  {report.reportStartDate && (
                                    <HStack spacing={2} flexWrap="wrap">
                                      <Text fontWeight="medium" minW="40px">Start:</Text>
                                      <Text>{new Date(report.reportStartDate).toLocaleDateString()}</Text>
                                      <Badge colorScheme="blue" fontSize="2xs">
                                        W{formatDateWithLabels(report.reportStartDate).week}
                                      </Badge>
                                      <Badge colorScheme="purple" fontSize="2xs">
                                        Q{formatDateWithLabels(report.reportStartDate).quarter}
                                      </Badge>
                                      <Badge colorScheme="gray" fontSize="2xs">
                                        {formatDateWithLabels(report.reportStartDate).year}
                                      </Badge>
                                    </HStack>
                                  )}
                                  {report.reportEndDate && (
                                    <HStack spacing={2} flexWrap="wrap">
                                      <Text fontWeight="medium" minW="40px">End:</Text>
                                      <Text>{new Date(report.reportEndDate).toLocaleDateString()}</Text>
                                      <Badge colorScheme="blue" fontSize="2xs">
                                        W{formatDateWithLabels(report.reportEndDate).week}
                                      </Badge>
                                      <Badge colorScheme="purple" fontSize="2xs">
                                        Q{formatDateWithLabels(report.reportEndDate).quarter}
                                      </Badge>
                                      <Badge colorScheme="gray" fontSize="2xs">
                                        {formatDateWithLabels(report.reportEndDate).year}
                                      </Badge>
                                    </HStack>
                                  )}
                                </VStack>
                              </Box>
                            )}

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

      {/* End Stage Confirmation Modal */}
      <Modal isOpen={openConfirmEndStage} onClose={() => setOpenConfirmEndStage(false)} isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader bg="orange.500" color="white" roundedTop={radiusStyle}>
            <HStack>
              <Icon as={FiAlertTriangle} boxSize={5} />
              <Text>End Stage - {stage.stageName}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2} align="flex-start">
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} mt={0.5} />
                <Box>
                  <Text fontWeight="bold" color="orange.500">WARNING: End Stage Action</Text>
                  <Text mt={2}>Are you sure you want to end this stage?</Text>
                </Box>
              </HStack>

              <Card bg={colorMode === "light" ? "orange.50" : "orange.900"} borderColor="orange.200" borderWidth="1px">
                <CardBody>
                  <HStack spacing={2} align="flex-start">
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">IMPORTANT:</Text>
                      <Text fontSize="sm" mt={1}>
                        Setting the end date will mark this stage as COMPLETE and will affect the SDLC progression tracking.
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <Box>
                <HStack spacing={2} mb={2}>
                  <Icon as={FiInfo} color="blue.500" />
                  <Text fontWeight="bold" fontSize="sm">Stage Information:</Text>
                </HStack>
                <VStack align="stretch" spacing={1} pl={6}>
                  <Text fontSize="sm">• Current Stage: {stage.stageName}</Text>
                  <Text fontSize="sm">• Start Date: {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}</Text>
                  <Text fontSize="sm">• End Date: Will be set to current date</Text>
                </VStack>
              </Box>

              <HStack spacing={2} align="flex-start">
                <Icon as={FiCheckCircle} color="green.500" boxSize={4} mt={0.5} />
                <Text fontSize="sm">
                  This action indicates that all work for this stage is finished and the stage is ready to be marked as complete.
                </Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button leftIcon={<FiX />} onClick={() => setOpenConfirmEndStage(false)}>
                Close
              </Button>
              <Button
                leftIcon={<FiCheck />}
                colorScheme="orange"
                onClick={() => {
                  setOpenConfirmEndStage(false);
                  handleConfirmEndStage();
                }}
                isDisabled={countdown > 0}
              >
                {countdown > 0 ? `Wait ${countdown}s` : `Yes, End Stage`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Clear End Date Confirmation Modal */}
      <Modal isOpen={openConfirmClearEndDate} onClose={() => setOpenConfirmClearEndDate(false)} isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader bg="orange.500" color="white" roundedTop={radiusStyle}>
            <HStack>
              <Icon as={FiAlertTriangle} boxSize={5} />
              <Text>Clear End Date - {stage.stageName}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2} align="flex-start">
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} mt={0.5} />
                <Box>
                  <Text fontWeight="bold" color="orange.500">WARNING: Clear End Date Action</Text>
                  <Text mt={2}>Are you sure you want to clear the end date?</Text>
                </Box>
              </HStack>

              <Card bg={colorMode === "light" ? "orange.50" : "orange.900"} borderColor="orange.200" borderWidth="1px">
                <CardBody>
                  <HStack spacing={2} align="flex-start">
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">IMPORTANT:</Text>
                      <Text fontSize="sm" mt={1}>
                        Clearing the end date will mark this stage as INCOMPLETE and will update the SDLC progression tracking.
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <Box>
                <HStack spacing={2} mb={2}>
                  <Icon as={FiInfo} color="blue.500" />
                  <Text fontWeight="bold" fontSize="sm">Stage Information:</Text>
                </HStack>
                <VStack align="stretch" spacing={1} pl={6}>
                  <Text fontSize="sm">• Current Stage: {stage.stageName}</Text>
                  <Text fontSize="sm">• Current End Date: {endDate ? new Date(endDate).toLocaleDateString() : 'Not set'}</Text>
                </VStack>
              </Box>

              <HStack spacing={2} align="flex-start">
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                <Text fontSize="sm">
                  This action indicates that work for this stage is not yet finished and will revert the completion status.
                </Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button leftIcon={<FiX />} onClick={() => setOpenConfirmClearEndDate(false)}>
                Close
              </Button>
              <Button
                leftIcon={<FiCheck />}
                colorScheme="orange"
                onClick={() => {
                  setOpenConfirmClearEndDate(false);
                  handleConfirmClearEndDate();
                }}
                isDisabled={countdown > 0}
              >
                {countdown > 0 ? `Wait ${countdown}s` : `Yes, Clear End Date`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateStageDatesModal;
