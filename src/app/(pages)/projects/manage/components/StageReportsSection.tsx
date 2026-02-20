"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Icon,
  IconButton,
  useColorMode,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProjectSdlcStageReportResponse } from "@/app/services/useProjects";
import useProjects from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import StageReportFormModal from "./StageReportFormModal";
import { formatDateWithLabels } from "@/app/helper/MasterHelper";

interface StageReportsSectionProps {
  stageId: string;
  projectId: string;
  stageName: string;
  canMake: boolean;
}

const StageReportsSection = ({
  stageId,
  projectId,
  stageName,
  canMake,
}: StageReportsSectionProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { ListProjectSdlcStageReports, DeleteProjectSdlcStageReport } = useProjects();

  const [tokenData, setTokenData] = useState<string>("");
  const [reports, setReports] = useState<ProjectSdlcStageReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | undefined>();

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (tokenData && stageId) {
      loadReports();
    }
  }, [tokenData, stageId, page]);

  useEffect(() => {
    console.log("Reports state updated:", reports);
    reports.forEach((report, index) => {
      console.log(`Report ${index}:`, {
        id: report.id,
        note: report.reportNote,
        startDate: report.reportStartDate,
        endDate: report.reportEndDate,
        startDateType: typeof report.reportStartDate,
        endDateType: typeof report.reportEndDate,
      });
    });
  }, [reports]);

  const loadReports = async () => {
    setIsLoading(true);
    const response = await ListProjectSdlcStageReports(stageId, page, pageSize, tokenData);
    if (response && response.statusCode === RES_CODE_OK && response.data) {
      console.log("Reports data from API:", response.data);
      setReports(response.data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    const response = await DeleteProjectSdlcStageReport(reportId, tokenData);
    if (response && response.statusCode === RES_CODE_OK) {
      showToast({
        description: "Report deleted successfully",
        statusToast: "success",
      });
      loadReports();
    } else {
      showToast({
        description: response?.message || "Failed to delete report",
        statusToast: "error",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingReportId(undefined);
    loadReports();
  };

  const openAddModal = () => {
    setEditingReportId(undefined);
    setIsFormModalOpen(true);
  };

  const openEditModal = (reportId: string) => {
    setEditingReportId(reportId);
    setIsFormModalOpen(true);
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
    <Card shadow="md" rounded={radiusStyle}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiFileText} boxSize={5} />
            <Heading size="md">Stage Reports - {stageName}</Heading>
          </HStack>
          {canMake && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={openAddModal}
            >
              Add Report
            </Button>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <HStack justify="center" py={8}>
            <Spinner />
            <Text>Loading reports...</Text>
          </HStack>
        ) : reports.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Icon as={FiFileText} boxSize={12} color="gray.400" mb={4} />
            <Text color="gray.500">No reports yet</Text>
            {canMake && (
              <Button
                mt={4}
                leftIcon={<FiPlus />}
                colorScheme="blue"
                variant="outline"
                onClick={openAddModal}
              >
                Add First Report
              </Button>
            )}
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {reports.map((report, index) => (
              <Box key={report.id}>
                <Card variant="outline">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="start">
                        <Badge colorScheme={getStatusColor(report.statusLabel)}>
                          {report.statusLabel}
                        </Badge>
                        {canMake && (
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit"
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(report.id)}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(report.id)}
                            />
                          </HStack>
                        )}
                      </HStack>

                      <Text whiteSpace="pre-wrap">{report.reportNote}</Text>

                      {(report.reportStartDate || report.reportEndDate) ? (
                        <Box
                          bg={colorMode === "light" ? "gray.50" : "gray.700"}
                          p={3}
                          rounded="md"
                          borderWidth="1px"
                          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        >
                          <VStack spacing={2} align="stretch" fontSize="sm">
                            {report.reportStartDate && (
                              <HStack spacing={2} flexWrap="wrap">
                                <Text fontWeight="medium" minW="50px">Start:</Text>
                                <Text>{new Date(report.reportStartDate).toLocaleDateString()}</Text>
                                {(() => {
                                  try {
                                    const labels = formatDateWithLabels(report.reportStartDate);
                                    return (
                                      <>
                                        <Badge colorScheme="blue" fontSize="xs">W{labels.week}</Badge>
                                        <Badge colorScheme="purple" fontSize="xs">Q{labels.quarter}</Badge>
                                        <Badge colorScheme="gray" fontSize="xs">{labels.year}</Badge>
                                      </>
                                    );
                                  } catch (e) {
                                    console.error("Error formatting start date:", e);
                                    return null;
                                  }
                                })()}
                              </HStack>
                            )}
                            {report.reportEndDate && (
                              <HStack spacing={2} flexWrap="wrap">
                                <Text fontWeight="medium" minW="50px">End:</Text>
                                <Text>{new Date(report.reportEndDate).toLocaleDateString()}</Text>
                                {(() => {
                                  try {
                                    const labels = formatDateWithLabels(report.reportEndDate);
                                    return (
                                      <>
                                        <Badge colorScheme="blue" fontSize="xs">W{labels.week}</Badge>
                                        <Badge colorScheme="purple" fontSize="xs">Q{labels.quarter}</Badge>
                                        <Badge colorScheme="gray" fontSize="xs">{labels.year}</Badge>
                                      </>
                                    );
                                  } catch (e) {
                                    console.error("Error formatting end date:", e);
                                    return null;
                                  }
                                })()}
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      ) : null}

                      {report.tagsReport && (
                        <HStack spacing={2} flexWrap="wrap">
                          {report.tagsReport.split(",").map((tag, i) => (
                            <Badge key={i} variant="subtle" colorScheme="gray">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </HStack>
                      )}

                      <HStack justify="space-between" fontSize="sm" color="gray.500">
                        <Text>By: {report.createdByName}</Text>
                        <Text>{formatDate(report.createdAt)}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
                {index < reports.length - 1 && <Divider />}
              </Box>
            ))}

            {reports.length >= pageSize && (
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                isLoading={isLoading}
              >
                Load More
              </Button>
            )}
          </VStack>
        )}
      </CardBody>

      <StageReportFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingReportId(undefined);
        }}
        stageId={stageId}
        projectId={projectId}
        reportId={editingReportId}
        onSuccess={handleFormSuccess}
      />
    </Card>
  );
};

export default StageReportsSection;
