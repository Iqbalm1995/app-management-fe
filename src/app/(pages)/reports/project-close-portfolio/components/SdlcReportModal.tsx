"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Badge,
  Box,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useColorMode,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiCheckCircle, FiCircle, FiClock, FiFileText } from "react-icons/fi";
import useProjects, { ProjectSdlcStageWithReportsResponse } from "@/app/services/useProjects";
import { formatDateToDDMMYYYY } from "@/app/helper/MasterHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";

interface SdlcReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

const SdlcReportModal = ({ isOpen, onClose, projectId, projectName }: SdlcReportModalProps) => {
  const { colorMode } = useColorMode();
  const { GetProjectSdlcStagesWithReports } = useProjects();
  
  const [stages, setStages] = useState<ProjectSdlcStageWithReportsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  useEffect(() => {
    if (isOpen && projectId && tokenData) {
      fetchSdlcStages();
    }
  }, [isOpen, projectId, tokenData]);

  const fetchSdlcStages = async () => {
    setIsLoading(true);
    try {
      const response = await GetProjectSdlcStagesWithReports(projectId, tokenData);
      if (response && response.statusCode === RES_CODE_OK) {
        setStages(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching SDLC stages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Icon as={FiCheckCircle} color="green.500" />;
      case 'in_progress':
        return <Icon as={FiClock} color="blue.500" />;
      default:
        return <Icon as={FiCircle} color="gray.400" />;
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="80vh" borderRadius={radiusStyle}>
        <ModalHeader>
          SDLC Report - {projectName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto">
          {isLoading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="lg" />
            </Flex>
          ) : stages.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No SDLC stages found for this project.
            </Alert>
          ) : (
            <VStack spacing={3} align="stretch">
              {stages.map((stage, index) => (
                <Card 
                  key={stage.id} 
                  borderRadius={radiusStyle} 
                  size="sm"
                  bg={stage.isActive ? (colorMode === 'dark' ? 'secondary.800' : 'secondary.100') : undefined}
                  borderColor={stage.isActive ? 'secondary.500' : undefined}
                  borderWidth={stage.isActive ? 2 : 1}
                >
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      {/* Stage Header */}
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          {getStageStatusIcon(stage.stageTriggerStatus)}
                          <Box>
                            <HStack spacing={2}>
                              <Text fontWeight="bold" fontSize="md">
                                {stage.stageName}
                              </Text>
                              {stage.isActive && (
                                <Badge colorScheme="secondary" size="sm">
                                  CURRENT
                                </Badge>
                              )}
                            </HStack>
                            {stage.stageCode && (
                              <Text fontSize="xs" color="gray.500">
                                {stage.stageCode}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                        <VStack spacing={1} align="end">
                          <Badge colorScheme={getStageStatusColor(stage.stageTriggerStatus)} size="sm">
                            {stage.stageTriggerStatus}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            #{stage.stagePosOrder}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Stage Dates */}
                      <HStack spacing={4} fontSize="xs" color="gray.600">
                        <Text>
                          <strong>Start:</strong> {stage.startDate && new Date(stage.startDate).getFullYear() > 1900 
                            ? formatDateToDDMMYYYY(new Date(stage.startDate)) 
                            : "Not Set Yet"}
                        </Text>
                        <Text>
                          <strong>End:</strong> {stage.endDate && new Date(stage.endDate).getFullYear() > 1900 
                            ? formatDateToDDMMYYYY(new Date(stage.endDate)) 
                            : "Not Set Yet"}
                        </Text>
                      </HStack>

                      {/* Stage Reports */}
                      {stage.reports.length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <Icon as={FiFileText} size="sm" />
                              <Text fontWeight="semibold" fontSize="sm">
                                Reports ({stage.reports.length})
                              </Text>
                            </HStack>
                            <VStack spacing={2} align="stretch">
                              {stage.reports.map((report) => (
                                <Card key={report.id} size="sm" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius={radiusStyle}>
                                  <CardBody p={4} gap={1}>
                                    <VStack spacing={2} align="stretch">
                                      <HStack justify="space-between">
                                        <Badge colorScheme="purple" size="sm">
                                          {report.statusLabel}
                                        </Badge>
                                        <Text fontSize="xs" color="gray.500">
                                          {formatDateToDDMMYYYY(new Date(report.createdAt))}
                                        </Text>
                                      </HStack>
                                      {report.reportNote && (
                                        <Text fontSize="sm">{report.reportNote}</Text>
                                      )}
                                      {report.tagsReport && (
                                        <Text fontSize="xs" color="blue.500">
                                          Tags: {report.tagsReport}
                                        </Text>
                                      )}
                                      <Text fontSize="xs" color="gray.500">
                                        By: {report.createdByName || report.createdBy}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          </Box>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SdlcReportModal;
