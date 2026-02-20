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
  Select,
  Text,
  Box,
  Badge,
  Card,
  CardBody,
  useColorMode,
  Alert,
  AlertIcon,
  Divider,
  Spinner,
  Icon,
  Checkbox,
  Tooltip,
} from "@chakra-ui/react";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import useSdlcFlow, { SdlcFlowResponse } from "@/app/services/useSdlcFlow";
import useSdlcFlowStage, { SdlcFlowStageResponse } from "@/app/services/useSdlcFlowStage";
import useProjects from "@/app/services/useProjects";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { FiCheckCircle, FiLayers } from "react-icons/fi";

interface SetupSdlcModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectType: string;
  onSuccess: () => void;
}

const SetupSdlcModal = ({
  isOpen,
  onClose,
  projectId,
  projectType,
  onSuccess,
}: SetupSdlcModalProps) => {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { ListSdlcFlow } = useSdlcFlow();
  const { ListByFlowId } = useSdlcFlowStage();
  const { SetupProjectSdlc } = useProjects();

  const [tokenData, setTokenData] = useState<string>("");
  const [sdlcFlows, setSdlcFlows] = useState<SdlcFlowResponse[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("");
  const [selectedFlow, setSelectedFlow] = useState<SdlcFlowResponse | null>(null);
  const [flowStages, setFlowStages] = useState<SdlcFlowStageResponse[]>([]);
  const [selectedStageIds, setSelectedStageIds] = useState<Set<string>>(new Set());
  const [isLoadingFlows, setIsLoadingFlows] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmSetup, setOpenConfirmSetup] = useState(false);

  // Get token
  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

  // Load SDLC Flows filtered by project type
  useEffect(() => {
    if (isOpen && tokenData && projectType) {
      loadSdlcFlows();
    }
  }, [isOpen, tokenData, projectType]);

  // Load stages when flow is selected
  useEffect(() => {
    if (selectedFlowId && tokenData) {
      loadFlowStages(selectedFlowId);
    } else {
      setFlowStages([]);
      setSelectedFlow(null);
      setSelectedStageIds(new Set());
    }
  }, [selectedFlowId, tokenData]);

  const loadSdlcFlows = async () => {
    setIsLoadingFlows(true);
    try {
      const response = await ListSdlcFlow(
        {
          page: 0,
          limit: 100,
          search: "",
          fieldOrder: [],
          orderDir: "asc",
          filterWhere: [
            {
              field: "ProjectType",
              operator: "=",
              value: projectType,
            },
            {
              field: "IsActive",
              operator: "=",
              value: "Y",
            },
          ],
        },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setSdlcFlows(response.data);
      } else {
        showToast({
          description: response?.message || "Failed to load SDLC Flows",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error loading SDLC Flows:", error);
      showToast({
        description: "Failed to load SDLC Flows",
        statusToast: "error",
      });
    } finally {
      setIsLoadingFlows(false);
    }
  };

  const loadFlowStages = async (flowId: string) => {
    setIsLoadingStages(true);
    try {
      const response = await ListByFlowId(flowId, tokenData);

      if (response?.statusCode === RES_CODE_OK && response.data) {
        setFlowStages(response.data);
        
        // Set selected flow details
        const flow = sdlcFlows.find((f) => f.id === flowId);
        setSelectedFlow(flow || null);

        // Auto-select all required stages
        const requiredStageIds = response.data
          .filter((stage) => stage.isRequired === "Y")
          .map((stage) => stage.id);
        setSelectedStageIds(new Set(requiredStageIds));
      } else {
        showToast({
          description: response?.message || "Failed to load stages",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error loading stages:", error);
      showToast({
        description: "Failed to load stages",
        statusToast: "error",
      });
    } finally {
      setIsLoadingStages(false);
    }
  };

  const handleStageToggle = (stageId: string, isRequired: string) => {
    // Cannot uncheck required stages
    if (isRequired === "Y") return;

    setSelectedStageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allStageIds = flowStages.map((stage) => stage.id);
    setSelectedStageIds(new Set(allStageIds));
  };

  const handleUnselectAll = () => {
    // Keep only required stages
    const requiredStageIds = flowStages
      .filter((stage) => stage.isRequired === "Y")
      .map((stage) => stage.id);
    setSelectedStageIds(new Set(requiredStageIds));
  };

  const handleOpenConfirmation = () => {
    if (!selectedFlowId) {
      showToast({
        description: "Please select an SDLC Flow",
        statusToast: "warning",
      });
      return;
    }

    if (selectedStageIds.size === 0) {
      showToast({
        description: "Please select at least one stage",
        statusToast: "warning",
      });
      return;
    }

    setOpenConfirmSetup(true);
  };

  const handleConfirmTrigger = (value: boolean) => {
    setOpenConfirmSetup(value);
  };

  const handleConfirmSetup = async () => {
    setIsSubmitting(true);

    try {
      const response = await SetupProjectSdlc(
        projectId,
        selectedFlowId,
        Array.from(selectedStageIds),
        tokenData
      );

      if (response && response.statusCode === RES_CODE_OK) {
        showToast({
          description: "SDLC setup successfully",
          statusToast: "success",
        });
        onSuccess();
        onClose();
      } else {
        showToast({
          description: response?.message || "Failed to setup SDLC",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while setting up SDLC",
        statusToast: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFlowId("");
    setSelectedFlow(null);
    setFlowStages([]);
    setSelectedStageIds(new Set());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        rounded={radiusStyle}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>
          <HStack>
            <Icon as={FiLayers} boxSize={6} color="secondary.500" />
            <Text>Setup SDLC Methodology</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <Divider />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Type Info */}
            <Alert status="info" rounded="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="bold">
                  Project Type: {projectType}
                </Text>
                <Text fontSize="xs">
                  Only SDLC Flows matching this project type will be shown.
                </Text>
              </Box>
            </Alert>

            {/* SDLC Flow Selection */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">
                Select SDLC Flow
              </FormLabel>
              <Select
                placeholder="Choose SDLC methodology..."
                value={selectedFlowId}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                isDisabled={isLoadingFlows}
                size="lg"
              >
                {sdlcFlows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.sdlcName} ({flow.sdlcCode})
                  </option>
                ))}
              </Select>
              {isLoadingFlows && (
                <HStack mt={2}>
                  <Spinner size="sm" />
                  <Text fontSize="xs" color="gray.500">
                    Loading SDLC Flows...
                  </Text>
                </HStack>
              )}
            </FormControl>

            {/* Selected Flow Info */}
            {selectedFlow && (
              <Card
                shadow="md"
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                bg={colorMode === "light" ? "blue.50" : "gray.700"}
              >
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="sm">
                        {selectedFlow.sdlcName}
                      </Text>
                      <Badge colorScheme="blue">{selectedFlow.sdlcCode}</Badge>
                    </HStack>
                    {selectedFlow.sdlcDesc && (
                      <Text fontSize="xs" color="gray.600">
                        {selectedFlow.sdlcDesc}
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Stages Preview */}
            {selectedFlowId && (
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="bold">
                    Select Stages ({selectedStageIds.size} of {flowStages.length} selected)
                  </Text>
                  {flowStages.length > 0 && (
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="secondary"
                        onClick={handleSelectAll}
                        isDisabled={isLoadingStages}
                      >
                        Select All
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="gray"
                        onClick={handleUnselectAll}
                        isDisabled={isLoadingStages}
                      >
                        Unselect All
                      </Button>
                    </HStack>
                  )}
                </HStack>

                {isLoadingStages ? (
                  <HStack justify="center" py={4}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">
                      Loading stages...
                    </Text>
                  </HStack>
                ) : flowStages.length > 0 ? (
                  <VStack
                    align="stretch"
                    spacing={2}
                    maxH="300px"
                    overflowY="auto"
                    p={3}
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    rounded="md"
                    border="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  >
                    {flowStages.map((stage, index) => {
                      const isRequired = stage.isRequired === "Y";
                      const isChecked = selectedStageIds.has(stage.id);
                      
                      return (
                        <HStack
                          key={stage.id}
                          p={3}
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          rounded="md"
                          border="1px"
                          borderColor={
                            isChecked
                              ? "secondary.500"
                              : colorMode === "light"
                              ? "gray.200"
                              : "gray.600"
                          }
                          _hover={{
                            shadow: "sm",
                            borderColor: isRequired ? "red.500" : "secondary.500",
                          }}
                          transition="all 0.2s"
                          cursor={isRequired ? "not-allowed" : "pointer"}
                          onClick={() => !isRequired && handleStageToggle(stage.id, stage.isRequired)}
                        >
                          <Tooltip
                            label={isRequired ? "Required stage - cannot be unchecked" : "Click to toggle"}
                            placement="top"
                          >
                            <Box>
                              <Checkbox
                                isChecked={isChecked}
                                isDisabled={isRequired}
                                onChange={() => handleStageToggle(stage.id, stage.isRequired)}
                                colorScheme="secondary"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Box>
                          </Tooltip>
                          <Badge colorScheme="secondary" fontSize="xs">
                            {index + 1}
                          </Badge>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="bold">
                              {stage.stageName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {stage.stageCode}
                            </Text>
                          </VStack>
                          {isRequired && (
                            <Badge colorScheme="red" fontSize="xs">
                              Required
                            </Badge>
                          )}
                          {index === 0 && (
                            <Badge colorScheme="green" fontSize="xs">
                              Start Here
                            </Badge>
                          )}
                        </HStack>
                      );
                    })}
                  </VStack>
                ) : (
                  <Alert status="warning" rounded="md">
                    <AlertIcon />
                    <Text fontSize="sm">No stages found for this SDLC Flow</Text>
                  </Alert>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <Divider />
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="secondary"
              onClick={handleOpenConfirmation}
              isLoading={isSubmitting}
              isDisabled={!selectedFlowId || selectedStageIds.size === 0}
              leftIcon={<FiCheckCircle />}
            >
              Setup SDLC ({selectedStageIds.size} stages)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>

      <ConfirmationDialog
        isOpenTrigger={openConfirmSetup}
        action={handleConfirmSetup}
        trigger={handleConfirmTrigger}
        questionMsg={`Are you sure you want to setup SDLC for this project?\n\nSelected Flow: ${selectedFlow?.sdlcName || 'N/A'}\nStages: ${selectedStageIds.size} stage(s)\n\nThis action will configure the project workflow and cannot be easily undone.`}
        captionMsg="Setup SDLC"
      />
    </Modal>
  );
};

export default SetupSdlcModal;
