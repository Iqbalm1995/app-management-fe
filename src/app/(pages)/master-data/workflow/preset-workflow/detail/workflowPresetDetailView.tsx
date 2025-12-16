"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import InvalidLoadPageView from "@/app/components/InvalidLoadPageView";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useWorkflow, { WorkflowGroupResponse } from "@/app/services/useWorkflow";
import useWorkflowPreset, {
  WorkflowPresetResponse,
} from "@/app/services/useWorkflowPreset";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  VStack,
  Badge,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Configure Workflow Preset`,
  breadCrumb: ["Home", "Master Data", "Workflow", "Preset", "Configure"],
};

function WorkflowPresetDetailView() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  const { GetWorkflowPresetById, UpdateWorkflowPreset } = useWorkflowPreset();
  const { ListWorkflowGroups } = useWorkflow();

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [IsLoadingPage, setIsLoadingPage] = useState(true);
  const [PresetId, setPresetId] = useState<string | null>(null);
  const [DataPreset, setDataPreset] = useState<WorkflowPresetResponse | null>(
    null
  );
  const [DataWorkflowGroups, setDataWorkflowGroups] = useState<
    WorkflowGroupResponse[]
  >([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [originalSelectedItems, setOriginalSelectedItems] = useState<
    Set<string>
  >(new Set());
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    const id = searchParams.get("presetId");
    if (id) {
      setPresetId(id);
    }
  }, [searchParams]);

  // Get all descendant IDs (children and grandchildren)
  const getAllDescendantIds = (workflow: WorkflowGroupResponse): string[] => {
    const ids: string[] = [];
    if (workflow.workflowChild && workflow.workflowChild.length > 0) {
      workflow.workflowChild.forEach((child) => {
        ids.push(child.id);
        if (child.workflowChild && child.workflowChild.length > 0) {
          child.workflowChild.forEach((grandChild) => {
            ids.push(grandChild.id);
          });
        }
      });
    }
    return ids;
  };

  // Check if all children are selected
  const areAllChildrenSelected = (workflow: WorkflowGroupResponse, selectedSet: Set<string>): boolean => {
    if (!workflow.workflowChild || workflow.workflowChild.length === 0) return true;
    return workflow.workflowChild.every((child) => {
      const childSelected = selectedSet.has(child.id);
      const grandChildrenSelected = !child.workflowChild || child.workflowChild.length === 0 ||
        child.workflowChild.every((gc) => selectedSet.has(gc.id));
      return childSelected && grandChildrenSelected;
    });
  };


  // Check if any children are selected
  const hasAnyChildSelected = (workflow: WorkflowGroupResponse, selectedSet: Set<string>): boolean => {
    if (!workflow.workflowChild || workflow.workflowChild.length === 0) return false;
    return workflow.workflowChild.some((child) => {
      const childSelected = selectedSet.has(child.id);
      const hasGrandChildSelected = child.workflowChild && child.workflowChild.length > 0 &&
        child.workflowChild.some((gc) => selectedSet.has(gc.id));
      return childSelected || hasGrandChildSelected;
    });
  };
  // Checkbox handler with parent-child relationship
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);

      // Find the item in the workflow tree
      let targetItem: WorkflowGroupResponse | null = null;
      let parentItem: WorkflowGroupResponse | null = null;
      let grandParentItem: WorkflowGroupResponse | null = null;

      DataWorkflowGroups?.forEach((group) => {
        if (group.id === itemId) {
          targetItem = group;
        } else if (group.workflowChild) {
          group.workflowChild.forEach((child) => {
            if (child.id === itemId) {
              targetItem = child;
              parentItem = group;
            } else if (child.workflowChild) {
              child.workflowChild.forEach((grandChild) => {
                if (grandChild.id === itemId) {
                  targetItem = grandChild;
                  parentItem = child;
                  grandParentItem = group;
                }
              });
            }
          });
        }
      });

      if (!targetItem) return newSet;

      if (checked) {
        // Add the item
        newSet.add(itemId);

        // Add all descendants
        const descendantIds = getAllDescendantIds(targetItem);
        descendantIds.forEach((id) => newSet.add(id));

        // Always check parent when a child/grandchild is checked
        if (parentItem) {
          newSet.add(parentItem.id);

          // Always check grandparent when a grandchild is checked
          if (grandParentItem) {
            newSet.add(grandParentItem.id);
          }
        }
      } else {
        // Remove the item
        newSet.delete(itemId);

        // Remove all descendants
        const descendantIds = getAllDescendantIds(targetItem);
        descendantIds.forEach((id) => newSet.delete(id));

        // Check if parent should be unchecked (only if NO children remain selected)
        if (parentItem && !hasAnyChildSelected(parentItem, newSet)) {
          newSet.delete(parentItem.id);

          // Check if grandparent should be unchecked (only if NO children remain selected)
          if (grandParentItem && !hasAnyChildSelected(grandParentItem, newSet)) {
            newSet.delete(grandParentItem.id);
          }
        }
      }

      return newSet;
    });
  };
  // Get all workflow IDs from tree (recursive)
  const getAllWorkflowIds = (workflows: WorkflowGroupResponse[]): string[] => {
    const ids: string[] = [];
    workflows.forEach((workflow) => {
      ids.push(workflow.id);
      if (workflow.workflowChild && workflow.workflowChild.length > 0) {
        ids.push(...getAllWorkflowIds(workflow.workflowChild));
      }
    });
    return ids;
  };

  // Load preset details
  const GetDetailPreset = async (id: string) => {
    setIsLoadingProcess(true);
    const requestData = await GetWorkflowPresetById(id, tokenData);

    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      const preset = requestData.data;
      setDataPreset(preset);

      // Set selected items from preset workflow data
      const presetWorkflowIds = getAllWorkflowIds(preset.workflowData || []);
      const selectedSet = new Set(presetWorkflowIds);
      setSelectedItems(selectedSet);
      setOriginalSelectedItems(selectedSet);
    } else {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }
    setIsLoadingProcess(false);
    setIsLoadingPage(false);
  };

  // Load all available workflows for the category
  const GetDataWorkflowGroup = async (categoryId: string) => {
    setIsLoadingProcess(true);
    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: "",
      filterWhere: [
        { field: "parentId", operator: "=", value: "" },
        { field: "wfgLevel", operator: "=", value: "1" },
        { field: "wfgCategoryId", operator: "=", value: categoryId },
      ],
      fieldOrder: ["wfgOrder"],
      orderDir: "asc",
    };

    const requestData = await ListWorkflowGroups(PayloadList, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setDataWorkflowGroups(requestData.data);
    } else {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }
    setIsLoadingProcess(false);
  };

  // Save preset configuration
  const savePresetConfiguration = async () => {
    if (!DataPreset) return;

    setIsLoadingProcess(true);

    // Calculate changes
    const currentIds = Array.from(selectedItems);
    const originalIds = Array.from(originalSelectedItems);

    const toAdd = currentIds.filter((id) => !originalIds.includes(id));
    const toRemove = originalIds.filter((id) => !currentIds.includes(id));

    const payload = {
      id: DataPreset.id,
      wfPresetName: DataPreset.wfPresetName,
      wfPresetDesc: DataPreset.wfPresetDesc,
      workflowGroupDataInsert: toAdd,
      workflowGroupDataRemove: toRemove,
    };

    const result = await UpdateWorkflowPreset(payload, tokenData);

    if (result?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Preset configuration saved successfully",
        statusToast: "success",
      });
      setOriginalSelectedItems(new Set(currentIds));
    } else {
      showToast({
        description: result?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    }

    setIsLoadingProcess(false);
  };

  // Check if there are unsaved changes
  const hasChanges = () => {
    const currentIds = Array.from(selectedItems).sort();
    const originalIds = Array.from(originalSelectedItems).sort();
    return JSON.stringify(currentIds) !== JSON.stringify(originalIds);
  };

  // Load data on mount
  useEffect(() => {
    if (PresetId && tokenData) {
      GetDetailPreset(PresetId);
    }
  }, [PresetId, tokenData]);

  useEffect(() => {
    if (DataPreset && tokenData) {
      GetDataWorkflowGroup(DataPreset.wfCategoryId);
    }
  }, [DataPreset, tokenData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w="full">
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w="full">
          <Link
            href={`/master-data/workflow/preset-workflow?categoryId=${DataPreset?.wfCategoryId}`}
          >
            <Button leftIcon={<FiArrowLeft />} size="lg">
              Back to Presets
            </Button>
          </Link>
        </GridItem>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w="full">
          <Flex justify="end">
            <Button
              size="lg"
              leftIcon={<FiSave />}
              colorScheme="blue"
              onClick={savePresetConfiguration}
              isLoading={IsLoadingProcess}
              isDisabled={!hasChanges()}
            >
              Save Configuration
            </Button>
          </Flex>
        </GridItem>
      </Grid>

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full" pt={4}>
        <GridItem colSpan={12} w="full">
          <Card
            w="full"
            rounded={radiusStyle}
            bg={colorMode === "light" ? "white" : "gray.800"}
            minH="500px"
          >
            <CardHeader>
              <VStack align="start" spacing={2}>
                <Heading as="h5" size="md">
                  {DataPreset?.wfPresetName} Configuration
                </Heading>
                <HStack spacing={4}>
                  {/* <Badge colorScheme="blue">{DataPreset?.wfCategoryCode}</Badge> */}
                  <Text fontSize="sm" color="gray.500">
                    {DataPreset?.wfPresetDesc}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.400">
                  Select workflows to include in this preset
                </Text>
              </VStack>
            </CardHeader>
            <CardBody>
              <Flex w="full" as={Stack} spacing={4}>
                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : !DataPreset ? (
                  <InvalidLoadPageView />
                ) : (
                  <VStack spacing={4} align="stretch" w="full">
                    {DataWorkflowGroups.map((group) => (
                      <Box key={group.id} w="full">
                        {/* Level 1 - Main Group */}
                        <Box
                          p={3}
                          bg={colorMode === "light" ? "blue.50" : "blue.900"}
                          border="1px solid"
                          borderColor={
                            colorMode === "light" ? "blue.200" : "blue.700"
                          }
                          rounded="md"
                        >
                          <HStack spacing={3} align="center">
                            <Checkbox
                              isChecked={selectedItems.has(group.id)}
                              onChange={(e) =>
                                handleCheckboxChange(group.id, e.target.checked)
                              }
                              colorScheme="blue"
                            />
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="blue.600"
                              minW="6"
                            >
                              {group.wfgOrder}
                            </Text>
                            <Text fontSize="md" fontWeight="semibold" flex={1}>
                              {group.wfgName}
                            </Text>
                          </HStack>
                          {group.wfgDesc && (
                            <Text fontSize="sm" color="gray.600" mt={1} ml={8}>
                              {group.wfgDesc}
                            </Text>
                          )}
                        </Box>

                        {/* Level 2 - Children */}
                        {group.workflowChild &&
                          group.workflowChild.length > 0 && (
                            <VStack spacing={2} align="stretch" pl={6} mt={2}>
                              {group.workflowChild.map((child) => (
                                <Box key={child.id}>
                                  <Box
                                    p={2}
                                    bg={
                                      colorMode === "light"
                                        ? "green.50"
                                        : "green.900"
                                    }
                                    border="1px solid"
                                    borderColor={
                                      colorMode === "light"
                                        ? "green.200"
                                        : "green.700"
                                    }
                                    rounded="sm"
                                  >
                                    <HStack spacing={3} align="center">
                                      <Checkbox
                                        isChecked={selectedItems.has(child.id)}
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            child.id,
                                            e.target.checked
                                          )
                                        }
                                        colorScheme="green"
                                      />
                                      <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="green.600"
                                        minW="6"
                                      >
                                        {child.wfgOrder}
                                      </Text>
                                      <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        flex={1}
                                      >
                                        {child.wfgName}
                                      </Text>
                                    </HStack>
                                    {child.wfgDesc && (
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        mt={1}
                                        ml={8}
                                      >
                                        {child.wfgDesc}
                                      </Text>
                                    )}
                                  </Box>

                                  {/* Level 3 - Grandchildren */}
                                  {child.workflowChild &&
                                    child.workflowChild.length > 0 && (
                                      <VStack
                                        spacing={1}
                                        align="stretch"
                                        pl={6}
                                        mt={1}
                                      >
                                        {child.workflowChild.map(
                                          (grandChild) => (
                                            <Box
                                              key={grandChild.id}
                                              p={2}
                                              bg={
                                                colorMode === "light"
                                                  ? "gray.50"
                                                  : "gray.700"
                                              }
                                              border="1px solid"
                                              borderColor={
                                                colorMode === "light"
                                                  ? "gray.200"
                                                  : "gray.600"
                                              }
                                              rounded="sm"
                                            >
                                              <HStack
                                                spacing={3}
                                                align="center"
                                              >
                                                <Checkbox
                                                  isChecked={selectedItems.has(
                                                    grandChild.id
                                                  )}
                                                  onChange={(e) =>
                                                    handleCheckboxChange(
                                                      grandChild.id,
                                                      e.target.checked
                                                    )
                                                  }
                                                  colorScheme="gray"
                                                />
                                                <Text
                                                  fontSize="xs"
                                                  fontWeight="bold"
                                                  color="gray.600"
                                                  minW="6"
                                                >
                                                  {grandChild.wfgOrder}
                                                </Text>
                                                <Text
                                                  fontSize="sm"
                                                  color="gray.700"
                                                  flex={1}
                                                >
                                                  {grandChild.wfgName}
                                                </Text>
                                              </HStack>
                                              {grandChild.wfgDesc && (
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                  mt={1}
                                                  ml={8}
                                                >
                                                  {grandChild.wfgDesc}
                                                </Text>
                                              )}
                                            </Box>
                                          )
                                        )}
                                      </VStack>
                                    )}
                                </Box>
                              ))}
                            </VStack>
                          )}
                      </Box>
                    ))}

                    {DataWorkflowGroups.length === 0 && !IsLoadingProcess && (
                      <Box textAlign="center" py={10}>
                        <Text color="gray.500" fontSize="lg">
                          No workflows available for this category
                        </Text>
                      </Box>
                    )}
                  </VStack>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default WorkflowPresetDetailView;
