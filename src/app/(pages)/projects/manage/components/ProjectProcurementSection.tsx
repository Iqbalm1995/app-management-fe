"use client";

import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Box,
  useColorMode,
  Flex,
  Progress,
  StackDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FiRefreshCcw, FiSettings, FiPlus, FiMinus, FiAlertTriangle, FiInfo, FiX, FiCheck } from "react-icons/fi";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaCircle } from "react-icons/fa";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectWorkflowResponse,
} from "@/app/services/useProjects";
import useWorkflow, {
  WorkflowGroupResponse,
} from "@/app/services/useWorkflow";
import useWorkflowPreset, {
  WorkflowPresetResponse,
} from "@/app/services/useWorkflowPreset";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
  MAX_SIZE_TABLE,
  WorkStageProcurementId,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { DynamicWorkflowBox } from "./WorkflowComponents";
import { colorProgression } from "@/app/helper/MasterHelper";

interface ProjectProcurementSectionProps {
  DataProject: ProjectDataResponse | null;
  onAssignSuccess?: () => void;
  hideHeader?: boolean;
}

const ProjectProcurementSection = ({
  DataProject,
  onAssignSuccess,
  hideHeader = false,
}: ProjectProcurementSectionProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListProjectWorkflowBacklog, AssignProcurementStagesToProject } = useProjects();
  const { ListWorkflowGroups } = useWorkflow();
  const { ListWorkflowPreset, GetWorkflowPresetById } = useWorkflowPreset();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [DataWorkflow, setDataWorkflow] = useState<
    ProjectWorkflowResponse[] | null
  >(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Overall Progression State
  const [OverallProgress, setOverallProgress] = useState<number>(0);
  const [TotalLeafNodes, setTotalLeafNodes] = useState<number>(0);
  const [CompletedLeafNodes, setCompletedLeafNodes] = useState<number>(0);

  // Workflow assignment modal state
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowGroups, setWorkflowGroups] = useState<WorkflowGroupResponse[]>([]);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());
  const [existingWorkflowIds, setExistingWorkflowIds] = useState<Set<string>>(new Set());
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [workflowPresets, setWorkflowPresets] = useState<WorkflowPresetResponse[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<WorkflowPresetResponse | null>(null);
  const [isConfirmWorkflowOpen, setIsConfirmWorkflowOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const cancelWorkflowRef = React.useRef<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);


  // Countdown timer for confirmation modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConfirmWorkflowOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => prev <= 1 ? 0 : prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConfirmWorkflowOpen]);
  const RefreshAction = () => {
    setRefreshData((prev) => prev + 1);
  };

  const extractExistingIds = (workflows: ProjectWorkflowResponse[]): Set<string> => {
    const ids = new Set<string>();
    workflows.forEach((workflow) => {
      ids.add(workflow.wfgId);
      if (workflow.workflowChild?.length > 0) {
        const childIds = extractExistingIds(workflow.workflowChild);
        childIds.forEach(id => ids.add(id));
      }
    });
    return ids;
  };

  const getNewWorkflowIds = (): Set<string> => {
    const newIds = new Set<string>();
    selectedWorkflowIds.forEach(id => {
      if (!existingWorkflowIds.has(id)) {
        newIds.add(id);
      }
    });
    return newIds;
  };

  // Load workflow groups and presets
  const loadWorkflowData = async () => {
    if (!DataProject) return;

    setIsLoadingWorkflows(true);
    try {
      // Load existing workflows (PROCUREMENT + BACKLOGS)
      const procurementResponse = await ListProjectWorkflowBacklog(DataProject!.id, tokenData);
      const backlogResponse = await ListProjectWorkflowBacklog(DataProject!.id, tokenData);
      
      const allExisting = [
        ...(procurementResponse?.data || []),
        ...(backlogResponse?.data || [])
      ];
      
      const existingIds = extractExistingIds(allExisting);
      setExistingWorkflowIds(existingIds);
      setSelectedWorkflowIds(existingIds);

      // Load workflow groups
      const workflowPayload: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          { field: "parentId", operator: "=", value: "" },
          { field: "wfgLevel", operator: "=", value: "1" },
          { field: "wfgCategoryId", operator: "=", value: WorkStageProcurementId },
        ],
        fieldOrder: ["wfgOrder"],
        orderDir: "asc",
      };
      const workflowResponse = await ListWorkflowGroups(workflowPayload, tokenData);
      if (workflowResponse?.statusCode === RES_CODE_OK && workflowResponse.data) {
        setWorkflowGroups(workflowResponse.data);
      }

      // Load presets with same category
      const presetPayload: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          { field: "wfCategoryId", operator: "=", value: WorkStageProcurementId },
        ],
        fieldOrder: ["wfPresetName"],
        orderDir: "asc",
      };
      const presetResponse = await ListWorkflowPreset(presetPayload, tokenData);
      if (presetResponse?.statusCode === RES_CODE_OK && presetResponse.data) {
        setWorkflowPresets(presetResponse.data);
      }
    } catch (error) {
      showToast({ description: "Failed to load workflow data", statusToast: "error" });
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const handlePresetChange = async (presetId: string) => {
    if (!presetId || selectedPreset?.id === presetId) {
      setSelectedPreset(null);
      setSelectedWorkflowIds(new Set());
      return;
    }

    try {
      const requestData = await GetWorkflowPresetById(presetId, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setSelectedPreset(requestData.data);

        const allWorkflowIds = new Set<string>();
        const extractIds = (workflows: WorkflowGroupResponse[]) => {
          workflows.forEach((workflow) => {
            allWorkflowIds.add(workflow.id);
            if (workflow.workflowChild?.length > 0) {
              extractIds(workflow.workflowChild);
            }
          });
        };
        extractIds(requestData.data.workflowData);
        setSelectedWorkflowIds(allWorkflowIds);
      }
    } catch (error) {
      showToast({ description: "Failed to load preset detail", statusToast: "error" });
    }
  };

  const getAllChildIds = (wf: WorkflowGroupResponse): string[] => {
    let ids = [wf.id];
    if (wf.workflowChild?.length > 0) {
      wf.workflowChild.forEach((child) => {
        ids = ids.concat(getAllChildIds(child));
      });
    }
    return ids;
  };

  const findParent = (
    targetId: string,
    workflows: WorkflowGroupResponse[]
  ): WorkflowGroupResponse | null => {
    for (const wf of workflows) {
      if (wf.workflowChild?.some((child) => child.id === targetId)) {
        return wf;
      }
      if (wf.workflowChild?.length > 0) {
        const found = findParent(targetId, wf.workflowChild);
        if (found) return found;
      }
    }
    return null;
  };

  const updateParentState = (
    childId: string,
    newSelected: Set<string>,
    allWorkflows: WorkflowGroupResponse[]
  ) => {
    const parent = findParent(childId, allWorkflows);
    if (parent) {
      const hasAnyChildSelected = parent.workflowChild?.some((child) =>
        newSelected.has(child.id)
      );
      if (hasAnyChildSelected) {
        newSelected.add(parent.id);
      } else {
        newSelected.delete(parent.id);
      }
      updateParentState(parent.id, newSelected, allWorkflows);
    }
  };

  const toggleWorkflow = (workflowId: string, workflow: WorkflowGroupResponse) => {
    if (existingWorkflowIds.has(workflowId)) return;
    
    const newSelected = new Set(selectedWorkflowIds);
    const isCurrentlyChecked = newSelected.has(workflowId);

    if (isCurrentlyChecked) {
      const allIds = getAllChildIds(workflow);
      allIds.forEach((id) => newSelected.delete(id));
      updateParentState(workflowId, newSelected, workflowGroups);
    } else {
      const allIds = getAllChildIds(workflow);
      allIds.forEach((id) => newSelected.add(id));
      updateParentState(workflowId, newSelected, workflowGroups);
    }

    setSelectedWorkflowIds(newSelected);
  };

  const handleAssignWorkflows = () => {
    const newWorkflowIds = getNewWorkflowIds();
    if (newWorkflowIds.size === 0) {
      showToast({ description: "Please select at least one new workflow", statusToast: "warning" });
      return;
    }
    setIsConfirmWorkflowOpen(true);
  };

  const confirmAssignWorkflows = async () => {
    setIsConfirmWorkflowOpen(false);
    setIsAssigning(true);
    try {
      const newWorkflowIds = getNewWorkflowIds();
      const response = await AssignProcurementStagesToProject(
        { projectId: DataProject!.id, workflowIds: Array.from(newWorkflowIds) },
        tokenData
      );

      if (response?.statusCode === RES_CODE_OK) {
        showToast({ description: response.message || "Procurement stages assigned successfully", statusToast: "success" });
        setIsWorkflowModalOpen(false);
        setSelectedWorkflowIds(new Set());
        setSelectedPreset(null);
        RefreshAction();
        if (onAssignSuccess) onAssignSuccess();
      } else {
        showToast({ description: response?.message || "Failed to assign procurement stages", statusToast: "error" });
      }
    } catch (error) {
      showToast({ description: "Error assigning procurement stages", statusToast: "error" });
    } finally {
      setIsAssigning(false);
    }
  };

  const renderWorkflowLevel = (workflows: WorkflowGroupResponse[], level: number = 0) => {
    if (level >= 3) return [];
    return workflows.map(workflow => (
      <Box key={workflow.id} w="full" ml={level * 4}>
        <Checkbox
          isChecked={selectedWorkflowIds.has(workflow.id)}
          colorScheme="blue"
          size="lg"
          onChange={() => toggleWorkflow(workflow.id, workflow)}
          isDisabled={existingWorkflowIds.has(workflow.id)}
        >
          <Text fontWeight={level === 0 ? "bold" : "normal"}>{workflow.wfgName}</Text>
        </Checkbox>
        {workflow.workflowChild && workflow.workflowChild.length > 0 && (
          <VStack align="stretch" spacing={2} mt={2}>
            {renderWorkflowLevel(workflow.workflowChild, level + 1)}
          </VStack>
        )}
      </Box>
    ));
  };

  // Count all leaf nodes (nodes without children) recursively
  const countLeafNodes = (
    workflows: ProjectWorkflowResponse[]
  ): { total: number; completed: number } => {
    let totalLeaf = 0;
    let completedLeaf = 0;

    workflows.forEach((workflow) => {
      const hasChildren =
        workflow.workflowChild && workflow.workflowChild.length > 0;

      if (!hasChildren) {
        // This is a leaf node - count it
        totalLeaf++;
        if (workflow.workflowValues && workflow.workflowValues.length > 0) {
          completedLeaf++;
        }
      } else {
        // Recursively count children
        const childCounts = countLeafNodes(workflow.workflowChild!);
        totalLeaf += childCounts.total;
        completedLeaf += childCounts.completed;
      }
    });

    return { total: totalLeaf, completed: completedLeaf };
  };

  useEffect(() => {
    if (DataAuth && DataProject) {
      setIsLoadingProcess(true);
      const GetWorkflowData = async () => {
        const requestData = await ListProjectWorkflowBacklog(
          DataProject.id,
          tokenData
        );
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          if (requestData.data == null) {
            showToast({
              description: "Workflow data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const workflowData: ProjectWorkflowResponse[] =
            requestData.data as ProjectWorkflowResponse[];

          // Calculate overall progression using dynamic leaf nodes
          const leafCounts = countLeafNodes(workflowData);
          const progressPercentage =
            leafCounts.total > 0
              ? Math.round((leafCounts.completed / leafCounts.total) * 100)
              : 0;

          setTotalLeafNodes(leafCounts.total);
          setCompletedLeafNodes(leafCounts.completed);
          setOverallProgress(progressPercentage);
          setDataWorkflow(workflowData);
          setIsLoadingProcess(false);
        }
      };
      GetWorkflowData();
    }
  }, [DataAuth, RefreshData, DataProject, tokenData]);

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      {!hideHeader && (
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Project Procurement Stages
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project procurement stages as workflow
          </Text>
        </VStack>
        <HStack spacing={3}>
          {DataProject?.projectType === PROJECT_TYPE_PROCUREMENT && (
            <Button
              size="sm"
              leftIcon={<FiSettings />}
              colorScheme="blue"
              rounded="full"
              onClick={() => {
                setIsWorkflowModalOpen(true);
                loadWorkflowData();
              }}
              isLoading={IsLoadingProcess}
            >
              Set Procurement Stages
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
            onClick={RefreshAction}
            isLoading={IsLoadingProcess}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>
      )}

      {/* Overall Progression */}
      {DataWorkflow && DataWorkflow.length > 0 && (
        <VStack
          w="full"
          p={4}
          bg={colorMode === "light" ? "blue.50" : "blue.900"}
          rounded="lg"
          border="1px"
          borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
          spacing={3}
        >
          <HStack divider={<StackDivider borderColor="gray.200" />} w="full">
            <Text fontSize="sm" fontWeight={600}>
              Overall Progression - {OverallProgress}%
            </Text>
            <Text fontSize="sm" fontWeight={500}>
              {CompletedLeafNodes}
              <Text as="span" fontWeight={600} ml={1}>
                / {TotalLeafNodes} Documents Completed
              </Text>
            </Text>
          </HStack>
          <Progress
            colorScheme={colorProgression(OverallProgress)}
            hasStripe
            value={OverallProgress}
            w="full"
            rounded={radiusStyle}
          />
        </VStack>
      )}

      {/* Workflow Content */}
      {IsLoadingProcess ? (
        <Box textAlign="center" py={12}>
          <LoadingMiniSignature />
          <Text mt={4} color="gray.500">
            Loading workflow documentation...
          </Text>
        </Box>
      ) : DataWorkflow && DataWorkflow.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {DataWorkflow.map((workflow: ProjectWorkflowResponse) => (
            <DynamicWorkflowBox
              key={workflow.id}
              workflow={workflow}
              onRefresh={RefreshAction}
              level={1}
            />
          ))}
        </VStack>
      ) : (
        <Box
          p={8}
          textAlign="center"
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
          rounded="lg"
          border="2px dashed"
          borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
        >
          <Text color="gray.500" fontSize="sm">
            No workflow documentation available
          </Text>
        </Box>
      )}

      {/* Workflow Assignment Modal */}
      <Modal isOpen={isWorkflowModalOpen} onClose={() => setIsWorkflowModalOpen(false)} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Set Work Stages for Documentation</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {isLoadingWorkflows ? (
              <Flex justify="center" align="center" minH="200px">
                <LoadingMiniSignature />
              </Flex>
            ) : (
              <Flex as={Stack} w="full" spacing={4}>
                {existingWorkflowIds.size > 0 && (
                  <Alert
                    status="info"
                    variant="subtle"
                    rounded={radiusStyle}
                    bg={colorMode === "light" ? "blue.50" : "blue.900"}
                    borderColor={colorMode === "light" ? "blue.300" : "blue.600"}
                    borderWidth="1px"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Work Stages Already Assigned</AlertTitle>
                      <AlertDescription fontSize="xs" mt={1}>
                        This project already has work stages assigned. Preset selection is disabled. You can only add new work stages to existing ones.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
                <Grid templateColumns="repeat(12, 1fr)" gap={4} w="full">
                {/* Left: Workflow Selection */}
                <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w="full">
                  <Flex
                    as={Stack}
                    p={6}
                    w="full"
                    spacing={4}
                    rounded={radiusStyle}
                    borderWidth={1}
                    boxShadow="md"
                    borderColor={colorMode === "light" ? "gray.100" : "gray.900"}
                  >
                    <Flex as={Stack} w="full">
                      <Heading size="md">Choose Work Stages for Procurement</Heading>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                      >
                        Select workflow stages for procurement
                      </Text>
                    </Flex>
                    {workflowGroups.length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={4}>
                        No workflow stages available
                      </Text>
                    ) : (
                      renderWorkflowLevel(workflowGroups)
                    )}
                  </Flex>
                </GridItem>

                {/* Right: Preset Templates */}
                <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w="full">
                  <Card
                    rounded={radiusStyle}
                    bgColor={colorMode === "light" ? "gray.100" : "gray.900"}
                  >
                    <CardBody>
                      <Flex w="full" as={Stack} minH="500px" spacing={6}>
                        <HStack spacing={4} align="center" opacity={existingWorkflowIds.size > 0 ? 0.5 : 1}>
                          <Box
                            w={12}
                            h={12}
                            bgColor={
                              colorMode === "light"
                                ? "secondary.500"
                                : "gray.800"
                            }
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon
                              as={BsLightningChargeFill}
                              color={
                                colorMode === "light"
                                  ? "white"
                                  : "secondary.500"
                              }
                            />
                          </Box>
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack spacing={3}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="secondary.500"
                              >
                                Procurement Stages
                              </Text>
                              {existingWorkflowIds.size > 0 && (
                                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                  (Disabled - existing work stages assigned)
                                </Text>
                              )}
                            </HStack>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "light"
                                  ? "gray.500"
                                  : "gray.400"
                              }
                              lineHeight={1.2}
                            >
                              Select procurement stages preset
                            </Text>
                          </VStack>
                        </HStack>
                        <Flex as={Stack} w="full">
                          {workflowPresets.length > 0 ? (
                            <VStack align="start" spacing={1}>
                              {workflowPresets.map((preset) => (
                                <Flex
                                  key={preset.id}
                                  as={HStack}
                                  w="full"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  bgColor={
                                    selectedPreset?.id === preset.id
                                      ? "secondary.100"
                                      : "transparent"
                                  }
                                  rounded={radiusStyle}
                                  px={4}
                                  py={3}
                                >
                                  <VStack align="start" spacing={1} flex={1}>
                                    <HStack spacing={2}>
                                      <Icon
                                        as={FaCircle}
                                        color="secondary.500"
                                        boxSize={2}
                                      />
                                      <Text
                                        fontWeight={
                                          selectedPreset?.id === preset.id
                                            ? 600
                                            : 500
                                        }
                                        color={
                                          selectedPreset?.id === preset.id
                                            ? "gray.900"
                                            : colorMode === "light"
                                              ? "gray.900"
                                              : "white"
                                        }
                                      >
                                        {preset.wfPresetName}
                                      </Text>
                                    </HStack>
                                    {preset.wfPresetDesc && (
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        pl={4}
                                      >
                                        {preset.wfPresetDesc}
                                      </Text>
                                    )}
                                  </VStack>
                                  <Flex
                                    justifyContent="end"
                                    alignItems="center"
                                  >
                                    <Button
                                      variant="solid"
                                      colorScheme={
                                        selectedPreset?.id === preset.id
                                          ? "red"
                                          : "secondary"
                                      }
                                      size="xs"
                                      w="full"
                                      textAlign="left"
                                      justifyContent="flex-start"
                                      onClick={() =>
                                        handlePresetChange(preset.id)
                                      }
                                      isDisabled={existingWorkflowIds.size > 0}
                                    >
                                      {selectedPreset?.id === preset.id ? (
                                        <FiMinus />
                                      ) : (
                                        <FiPlus />
                                      )}
                                    </Button>
                                  </Flex>
                                </Flex>
                              ))}
                            </VStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              No presets available
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsWorkflowModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAssignWorkflows}
              isLoading={isAssigning}
              isDisabled={getNewWorkflowIds().size === 0 || isLoadingWorkflows}
            >
              Assign ({getNewWorkflowIds().size})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal with Countdown */}
      <Modal isOpen={isConfirmWorkflowOpen} onClose={() => setIsConfirmWorkflowOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader bg="orange.500" color="white" roundedTop={radiusStyle}>
            <HStack>
              <Icon as={FiAlertTriangle} boxSize={5} />
              <Text>Assign Work Stages</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2} align="flex-start">
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} mt={0.5} />
                <Box>
                  <Text fontWeight="bold" color="orange.500">WARNING: Assign Work Stages</Text>
                  <Text mt={2}>Are you sure you want to assign {getNewWorkflowIds().size} new work stage(s)?</Text>
                  {existingWorkflowIds.size > 0 && (
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      ({existingWorkflowIds.size} existing work stage(s) will remain)
                    </Text>
                  )}
                </Box>
              </HStack>

              <Card bg={colorMode === "light" ? "orange.50" : "orange.900"} borderColor="orange.200" borderWidth="1px">
                <CardBody>
                  <HStack spacing={2} align="flex-start">
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">IMPORTANT:</Text>
                      <Text fontSize="sm" mt={1}>
                        This will set up the documentation workflow structure and cannot be easily undone.
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <Box>
                <HStack spacing={2} mb={2}>
                  <Icon as={FiInfo} color="blue.500" />
                  <Text fontWeight="bold" fontSize="sm">Assignment Details:</Text>
                </HStack>
                <VStack align="stretch" spacing={1} pl={6}>
                  <Text fontSize="sm">• Project: {DataProject?.projectName}</Text>
                  <Text fontSize="sm">• Work Stages: {selectedWorkflowIds.size} selected</Text>
                  <Text fontSize="sm">• Type: Documentation Workflow</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button leftIcon={<FiX />} onClick={() => setIsConfirmWorkflowOpen(false)}>
                Cancel
              </Button>
              <Button
                leftIcon={<FiCheck />}
                colorScheme="orange"
                onClick={() => {
                  setIsConfirmWorkflowOpen(false);
                  confirmAssignWorkflows();
                }}
                isDisabled={countdown > 0}
              >
                {countdown > 0 ? `Wait ${countdown}s` : `Yes, Assign Work Stages`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack >
  );
};

export default ProjectProcurementSection;
